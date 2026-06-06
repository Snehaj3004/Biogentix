from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.services.dashboard_service import (
    get_full_dashboard, get_dashboard_stats,
    get_screenings_by_disease, get_risk_distribution,
    get_district_stats, get_daily_trend, get_recent_high_risk
)
from app.models.models import Disease, District, OutbreakAlert

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/")
def full_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_full_dashboard(db)

@router.get("/stats")
def dashboard_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_dashboard_stats(db)

@router.get("/screenings-by-disease")
def screenings_by_disease(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_screenings_by_disease(db)

@router.get("/risk-distribution")
def risk_distribution(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_risk_distribution(db)

@router.get("/district-stats")
def district_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_district_stats(db)

@router.get("/daily-trend")
def daily_trend(
    days: int = Query(default=7, ge=1, le=30),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_daily_trend(db, days)

@router.get("/recent-high-risk")
def recent_high_risk(
    limit: int = Query(default=5, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_recent_high_risk(db, limit)

@router.get("/diseases")
def all_diseases(
    db: Session = Depends(get_db)
):
    diseases = db.query(Disease).filter(Disease.is_active == True).all()
    return [
        {
            "id": d.id,
            "code": d.code,
            "name": d.name,
            "category": d.category,
            "description": d.description,
            "icon": d.icon,
            "color_hex": d.color_hex
        }
        for d in diseases
    ]

@router.get("/districts")
def all_districts(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    districts = db.query(District).all()
    return [
        {
            "id": d.id,
            "name": d.name,
            "state": d.state,
            "latitude": float(d.latitude) if d.latitude else None,
            "longitude": float(d.longitude) if d.longitude else None,
            "population": d.population
        }
        for d in districts
    ]

@router.get("/alerts")
def outbreak_alerts(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    alerts = db.query(OutbreakAlert).filter(
        OutbreakAlert.is_active == True
    ).all()
    return alerts

@router.get("/platform-overview")
def platform_overview(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    from app.models.models import User, Patient, Screening
    return {
        "total_users": db.query(User).count(),
        "total_patients": db.query(Patient).count(),
        "total_screenings": db.query(Screening).count(),
        "active_diseases": db.query(Disease).filter(
            Disease.is_active == True).count(),
        "active_districts": db.query(District).count(),
        "ai_engines": [
            {"name": "Disease-Specific AI",   "status": "active",
             "description": "TB, HIV, Malaria, STI models"},
            {"name": "Syndromic Engine",       "status": "active",
             "description": "Fever, diarrhea, respiratory clusters"},
            {"name": "Maternal & Nutrition AI","status": "active",
             "description": "Risk scoring for anemia, pregnancy"},
            {"name": "Epidemiology AI",        "status": "active",
             "description": "Geo-mapping hotspots + trend prediction"},
            {"name": "Regulatory AI",          "status": "active",
             "description": "WHO reporting automation + ICD coding"}
        ]
    }

@router.get("/ml-status")
def ml_models_status():
    from app.ml_models.predictor import get_models_status
    return get_models_status()