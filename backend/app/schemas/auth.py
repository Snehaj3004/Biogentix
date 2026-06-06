from pydantic import BaseModel, EmailStr
from typing import Optional
from enum import Enum

class UserRole(str, Enum):
    admin = "admin"
    doctor = "doctor"
    field_worker = "field_worker"
    lab_tech = "lab_tech"

class UserCreate(BaseModel):
    full_name: str
    email: str          # changed from EmailStr to str to avoid email-validator issues
    phone: Optional[str] = None
    password: str
    role: UserRole = UserRole.field_worker
    district: Optional[str] = None
    facility_name: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    full_name: str
    email: str
    phone: Optional[str] = None
    role: str
    district: Optional[str] = None
    facility_name: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None
    role: Optional[str] = None