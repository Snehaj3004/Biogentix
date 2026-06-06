from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.schemas.patient import PatientCreate, PatientResponse, PatientUpdate
from app.services.patient_service import (
    create_patient, get_patient_by_id, get_patient_by_uid,
    get_all_patients, update_patient, delete_patient
)

router = APIRouter(prefix="/api/patients", tags=["Patients"])

@router.post("/", response_model=PatientResponse, status_code=201)
def register_patient(
    data: PatientCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return create_patient(db, data, current_user.id)

@router.get("/", response_model=list[PatientResponse])
def list_patients(
    skip: int = 0,
    limit: int = 100,
    district_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_all_patients(db, skip, limit, district_id, search)

@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_patient_by_id(db, patient_id)

@router.get("/uid/{uid}", response_model=PatientResponse)
def get_patient_by_uid_route(
    uid: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return get_patient_by_uid(db, uid)

@router.put("/{patient_id}", response_model=PatientResponse)
def update_patient_route(
    patient_id: int,
    data: PatientUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return update_patient(db, patient_id, data)

@router.delete("/{patient_id}")
def delete_patient_route(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    return delete_patient(db, patient_id)