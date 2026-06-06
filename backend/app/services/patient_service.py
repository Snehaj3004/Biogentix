from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.models import Patient, District
from app.schemas.patient import PatientCreate, PatientUpdate
import random, string
from datetime import datetime

def generate_patient_uid() -> str:
    """Generate unique patient ID like BQ-2024-AB12"""
    year = datetime.now().year
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"BQ-{year}-{suffix}"

def create_patient(db: Session, patient_data: PatientCreate, user_id: int):
    # Generate unique UID
    uid = generate_patient_uid()
    while db.query(Patient).filter(Patient.patient_uid == uid).first():
        uid = generate_patient_uid()

    patient = Patient(
        patient_uid=uid,
        full_name=patient_data.full_name,
        age=patient_data.age,
        gender=patient_data.gender,
        phone=patient_data.phone,
        address=patient_data.address,
        district_id=patient_data.district_id,
        village=patient_data.village,
        is_pregnant=patient_data.is_pregnant or False,
        weight_kg=patient_data.weight_kg,
        height_cm=patient_data.height_cm,
        blood_group=patient_data.blood_group,
        registered_by=user_id
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient

def get_patient_by_id(db: Session, patient_id: int):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

def get_patient_by_uid(db: Session, uid: str):
    patient = db.query(Patient).filter(Patient.patient_uid == uid).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

def get_all_patients(db: Session, skip: int = 0, limit: int = 100,
                      district_id: int = None, search: str = None):
    query = db.query(Patient)
    if district_id:
        query = query.filter(Patient.district_id == district_id)
    if search:
        query = query.filter(
            Patient.full_name.ilike(f"%{search}%") |
            Patient.patient_uid.ilike(f"%{search}%") |
            Patient.phone.ilike(f"%{search}%")
        )
    return query.order_by(Patient.created_at.desc()).offset(skip).limit(limit).all()

def update_patient(db: Session, patient_id: int, update_data: PatientUpdate):
    patient = get_patient_by_id(db, patient_id)
    update_dict = update_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(patient, key, value)
    db.commit()
    db.refresh(patient)
    return patient

def delete_patient(db: Session, patient_id: int):
    patient = get_patient_by_id(db, patient_id)
    db.delete(patient)
    db.commit()
    return {"message": f"Patient {patient.patient_uid} deleted"}