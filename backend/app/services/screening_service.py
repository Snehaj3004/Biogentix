from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.models import Screening, Disease, Patient
from app.schemas.screening import ScreeningCreate, ScreeningUpdate
from app.ml_models.predictor import predict_disease_risk
import random, string
from datetime import datetime


def generate_screening_uid() -> str:
    date_str = datetime.now().strftime("%Y%m%d")
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"SCR-{date_str}-{suffix}"


def run_rule_engine(disease_code: str, symptoms: dict,
                    vitals: dict, kit_result: str) -> dict:
    score = 0.0
    prediction = ""

    if disease_code == "TB":
        if symptoms.get("cough_weeks", 0) >= 2:  score += 0.30
        if symptoms.get("night_sweats"):          score += 0.20
        if symptoms.get("weight_loss"):           score += 0.20
        if symptoms.get("blood_in_sputum"):       score += 0.25
        if symptoms.get("fever"):                 score += 0.15
        if kit_result == "positive":              score += 0.40
        prediction = "Active TB likely" if score > 0.5 else "TB unlikely"

    elif disease_code == "HIV":
        if symptoms.get("rapid_weight_loss"):     score += 0.25
        if symptoms.get("recurrent_infections"):  score += 0.20
        if symptoms.get("oral_thrush"):           score += 0.25
        if symptoms.get("high_risk_behavior"):    score += 0.30
        if kit_result == "positive":              score += 0.50
        prediction = "HIV risk HIGH" if score > 0.5 else "HIV risk LOW"

    elif disease_code == "MALARIA":
        if symptoms.get("high_fever"):            score += 0.30
        if symptoms.get("chills"):                score += 0.20
        if symptoms.get("headache"):              score += 0.15
        if symptoms.get("travel_endemic_area"):   score += 0.20
        if kit_result == "positive":              score += 0.45
        prediction = "Malaria positive" if score > 0.5 else "Malaria unlikely"

    elif disease_code == "MATERNAL":
        bp_sys = vitals.get("bp_systolic", 120)
        hb     = vitals.get("hemoglobin", 11)
        age    = vitals.get("age", 25)
        if age < 18 or age > 35:   score += 0.20
        if bp_sys > 140:           score += 0.35
        if hb < 8:                 score += 0.30
        if symptoms.get("severe_headache"):       score += 0.20
        if symptoms.get("blurred_vision"):        score += 0.25
        if symptoms.get("excessive_bleeding"):    score += 0.40
        prediction = "High maternal risk" if score > 0.5 else "Normal pregnancy"

    elif disease_code == "MALNUTRITION":
        muac = vitals.get("muac_cm", 15)
        if muac < 11.5:            score += 0.50
        elif muac < 12.5:          score += 0.30
        if symptoms.get("visible_wasting"):       score += 0.30
        if symptoms.get("edema"):                 score += 0.25
        prediction = "Malnutrition detected" if score > 0.5 else "Nutrition normal"

    elif disease_code == "DENGUE":
        if symptoms.get("high_fever"):            score += 0.25
        if symptoms.get("severe_headache"):       score += 0.20
        if symptoms.get("rash"):                  score += 0.20
        if symptoms.get("bleeding_gums"):         score += 0.30
        if kit_result == "positive":              score += 0.45
        prediction = "Dengue likely" if score > 0.5 else "Dengue unlikely"

    elif disease_code == "STI":
        if symptoms.get("discharge"):             score += 0.30
        if symptoms.get("ulcers"):                score += 0.30
        if symptoms.get("high_risk_behavior"):    score += 0.25
        if kit_result == "positive":              score += 0.45
        prediction = "STI likely" if score > 0.5 else "STI unlikely"

    elif disease_code == "ENTERIC":
        if symptoms.get("diarrhea_days", 0) >= 3: score += 0.30
        if symptoms.get("blood_in_stool"):         score += 0.35
        if symptoms.get("dehydration"):            score += 0.25
        if kit_result == "positive":               score += 0.40
        prediction = "Enteric infection likely" if score > 0.5 else "Mild GI issue"

    score = min(score, 1.0)

    if score >= 0.75:    risk_level = "critical"
    elif score >= 0.55:  risk_level = "high"
    elif score >= 0.35:  risk_level = "medium"
    elif score >= 0.15:  risk_level = "low"
    else:                risk_level = "minimal"

    return {
        "risk_score":  round(score, 4),
        "risk_level":  risk_level,
        "prediction":  prediction,
        "confidence":  round(min(score + 0.1, 1.0), 4),
        "engine":      "rule_engine"
    }


def create_screening(db: Session, data: ScreeningCreate, user_id: int):
    patient = db.query(Patient).filter(Patient.id == data.patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    disease = db.query(Disease).filter(Disease.code == data.disease_code).first()
    if not disease:
        raise HTTPException(status_code=404,
                            detail=f"Disease code '{data.disease_code}' not found")

    # Try ML model first, fallback to rule engine
    ai_result = predict_disease_risk(
        data.disease_code,
        data.symptoms or {},
        data.vitals or {}
    )

    if ai_result is None:
        ai_result = run_rule_engine(
            data.disease_code,
            data.symptoms or {},
            data.vitals or {},
            data.kit_test_result or "not_done"
        )

    # Kit test boost
    if data.kit_test_result == "positive":
        boosted = min(ai_result['risk_score'] + 0.25, 1.0)
        ai_result['risk_score'] = round(boosted, 4)
        if boosted >= 0.80:   ai_result['risk_level'] = 'critical'
        elif boosted >= 0.60: ai_result['risk_level'] = 'high'

    uid = generate_screening_uid()
    while db.query(Screening).filter(Screening.screening_uid == uid).first():
        uid = generate_screening_uid()

    screening = Screening(
        screening_uid   = uid,
        patient_id      = data.patient_id,
        disease_id      = disease.id,
        screened_by     = user_id,
        district_id     = data.district_id or patient.district_id,
        symptoms        = data.symptoms,
        vitals          = data.vitals,
        kit_test_result = data.kit_test_result,
        kit_test_type   = data.kit_test_type,
        ai_risk_score   = ai_result['risk_score'],
        ai_risk_level   = ai_result['risk_level'],
        ai_prediction   = ai_result['prediction'],
        ai_confidence   = ai_result['confidence'],
        ai_engine_used  = ai_result['engine'],
        referral_needed = ai_result['risk_level'] in ['high', 'critical'],
        notes           = data.notes,
        status          = 'completed'
    )
    db.add(screening)
    db.commit()
    db.refresh(screening)
    return screening


def get_screening_by_id(db: Session, screening_id: int):
    s = db.query(Screening).filter(Screening.id == screening_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Screening not found")
    return s


def get_screenings_by_patient(db: Session, patient_id: int):
    return db.query(Screening).filter(
        Screening.patient_id == patient_id
    ).order_by(Screening.created_at.desc()).all()


def get_all_screenings(db: Session, skip: int = 0, limit: int = 100,
                        disease_code: str = None, risk_level: str = None,
                        district_id: int = None):
    query = db.query(Screening)
    if disease_code:
        disease = db.query(Disease).filter(
            Disease.code == disease_code).first()
        if disease:
            query = query.filter(Screening.disease_id == disease.id)
    if risk_level:
        query = query.filter(Screening.ai_risk_level == risk_level)
    if district_id:
        query = query.filter(Screening.district_id == district_id)
    return query.order_by(
        Screening.created_at.desc()
    ).offset(skip).limit(limit).all()


def update_screening(db: Session, screening_id: int,
                      update_data: ScreeningUpdate):
    screening = get_screening_by_id(db, screening_id)
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(screening, key, value)
    db.commit()
    db.refresh(screening)
    return screening