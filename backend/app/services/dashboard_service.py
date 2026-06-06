from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from datetime import datetime, timedelta
from app.models.models import (
    Screening, Patient, Disease, District,
    User, OutbreakAlert
)

def get_dashboard_stats(db: Session) -> dict:
    today = datetime.utcnow().date()
    today_start = datetime.combine(today, datetime.min.time())

    # Total counts
    total_screenings = db.query(Screening).count()
    total_patients = db.query(Patient).count()
    high_risk = db.query(Screening).filter(
        Screening.ai_risk_level.in_(["high", "critical"])
    ).count()

    # Districts covered
    districts_covered = db.query(
        func.count(func.distinct(Screening.district_id))
    ).scalar() or 0

    # Today stats
    new_today = db.query(Screening).filter(
        Screening.created_at >= today_start
    ).count()

    high_risk_today = db.query(Screening).filter(
        and_(
            Screening.created_at >= today_start,
            Screening.ai_risk_level.in_(["high", "critical"])
        )
    ).count()

    # Pending referrals
    referrals_pending = db.query(Screening).filter(
        and_(
            Screening.referral_needed == True,
            Screening.status != "referred"
        )
    ).count()

    # Active diseases
    diseases_monitored = db.query(Disease).filter(
        Disease.is_active == True
    ).count()

    return {
        "total_screenings": total_screenings,
        "high_risk_cases": high_risk,
        "districts_covered": districts_covered,
        "diseases_monitored": diseases_monitored,
        "ai_engines_active": 5,
        "new_today": new_today,
        "high_risk_today": high_risk_today,
        "referrals_pending": referrals_pending
    }

def get_screenings_by_disease(db: Session) -> list:
    results = db.query(
        Disease.code,
        Disease.name,
        Disease.color_hex,
        func.count(Screening.id).label("count")
    ).outerjoin(
        Screening, Screening.disease_id == Disease.id
    ).group_by(
        Disease.id, Disease.code, Disease.name, Disease.color_hex
    ).order_by(func.count(Screening.id).desc()).all()

    return [
        {
            "disease_code": r.code,
            "disease_name": r.name,
            "count": r.count,
            "color_hex": r.color_hex
        }
        for r in results
    ]

def get_risk_distribution(db: Session) -> dict:
    total = db.query(Screening).count()
    if total == 0:
        return {
            "minimal": 0, "low": 0, "medium": 0,
            "high": 0, "critical": 0,
            "minimal_pct": 0, "low_pct": 0, "medium_pct": 0,
            "high_pct": 0, "critical_pct": 0
        }

    counts = {}
    for level in ["minimal", "low", "medium", "high", "critical"]:
        counts[level] = db.query(Screening).filter(
            Screening.ai_risk_level == level
        ).count()

    return {
        **counts,
        "minimal_pct": round(counts["minimal"] / total * 100, 1),
        "low_pct":     round(counts["low"]     / total * 100, 1),
        "medium_pct":  round(counts["medium"]  / total * 100, 1),
        "high_pct":    round(counts["high"]    / total * 100, 1),
        "critical_pct":round(counts["critical"]/ total * 100, 1)
    }

def get_district_stats(db: Session) -> list:
    results = db.query(
        District.id,
        District.name,
        District.latitude,
        District.longitude,
        func.count(Screening.id).label("total"),
        func.sum(
            func.IF(
                Screening.ai_risk_level.in_(["high", "critical"]), 1, 0
            )
        ).label("high_risk")
    ).outerjoin(
        Screening, Screening.district_id == District.id
    ).group_by(
        District.id, District.name,
        District.latitude, District.longitude
    ).all()

    return [
        {
            "district_id": r.id,
            "district_name": r.name,
            "total_screenings": r.total or 0,
            "high_risk": int(r.high_risk or 0),
            "latitude": float(r.latitude) if r.latitude else None,
            "longitude": float(r.longitude) if r.longitude else None
        }
        for r in results
    ]

def get_daily_trend(db: Session, days: int = 7) -> list:
    trend = []
    for i in range(days - 1, -1, -1):
        date = datetime.utcnow().date() - timedelta(days=i)
        day_start = datetime.combine(date, datetime.min.time())
        day_end   = datetime.combine(date, datetime.max.time())

        screenings = db.query(Screening).filter(
            and_(
                Screening.created_at >= day_start,
                Screening.created_at <= day_end
            )
        ).count()

        high_risk = db.query(Screening).filter(
            and_(
                Screening.created_at >= day_start,
                Screening.created_at <= day_end,
                Screening.ai_risk_level.in_(["high", "critical"])
            )
        ).count()

        trend.append({
            "date": date.strftime("%Y-%m-%d"),
            "screenings": screenings,
            "high_risk": high_risk
        })
    return trend

def get_recent_high_risk(db: Session, limit: int = 5) -> list:
    results = db.query(
        Screening, Patient, Disease
    ).join(
        Patient, Screening.patient_id == Patient.id
    ).join(
        Disease, Screening.disease_id == Disease.id
    ).filter(
        Screening.ai_risk_level.in_(["high", "critical"])
    ).order_by(
        Screening.created_at.desc()
    ).limit(limit).all()

    return [
        {
            "screening_uid": s.screening_uid,
            "patient_name": p.full_name,
            "patient_uid": p.patient_uid,
            "disease": d.name,
            "risk_level": s.ai_risk_level,
            "risk_score": float(s.ai_risk_score or 0),
            "prediction": s.ai_prediction,
            "referral_needed": s.referral_needed,
            "date": s.created_at.strftime("%Y-%m-%d %H:%M")
        }
        for s, p, d in results
    ]

def get_full_dashboard(db: Session) -> dict:
    return {
        "stats": get_dashboard_stats(db),
        "screenings_by_disease": get_screenings_by_disease(db),
        "risk_distribution": get_risk_distribution(db),
        "district_stats": get_district_stats(db),
        "daily_trend": get_daily_trend(db),
        "recent_high_risk": get_recent_high_risk(db)
    }