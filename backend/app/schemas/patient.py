from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PatientCreate(BaseModel):
    full_name: str
    age: int
    gender: str  # male / female / other
    phone: Optional[str] = None
    address: Optional[str] = None
    district_id: Optional[int] = None
    village: Optional[str] = None
    is_pregnant: Optional[bool] = False
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    blood_group: Optional[str] = None

class PatientResponse(BaseModel):
    id: int
    patient_uid: str
    full_name: str
    age: int
    gender: str
    phone: Optional[str]
    address: Optional[str]
    district_id: Optional[int]
    village: Optional[str]
    is_pregnant: bool
    weight_kg: Optional[float]
    height_cm: Optional[float]
    blood_group: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class PatientUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    village: Optional[str] = None
    is_pregnant: Optional[bool] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    blood_group: Optional[str] = None