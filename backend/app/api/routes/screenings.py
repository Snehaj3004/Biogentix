from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.screening import ScreeningCreate, ScreeningResponse, ScreeningUpdate
from app.services.screening_service import (
    create_screening, get_screening_by_id,
    get_screenings_by_patient, get_all_screenings, update_screening
)

router = APIRouter(prefix="/api/screenings", tags=["Screenings"])

@router.post("/", response_model=ScreeningResponse, status_code=201)
def submit_screening(
    data: ScreeningCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return create_screening(db, data, current_user.id)

@router.get("/", response_model=list[ScreeningResponse])
def list_screenings(
    skip: int = 0,
    limit: int = 100,
    disease_code: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    district_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_all_screenings(db, skip, limit, disease_code, risk_level, district_id)

@router.get("/patient/{patient_id}", response_model=list[ScreeningResponse])
def get_patient_screenings(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_screenings_by_patient(db, patient_id)

@router.get("/{screening_id}", response_model=ScreeningResponse)
def get_screening(
    screening_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_screening_by_id(db, screening_id)

@router.put("/{screening_id}", response_model=ScreeningResponse)
def update_screening_route(
    screening_id: int,
    data: ScreeningUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return update_screening(db, screening_id, data)