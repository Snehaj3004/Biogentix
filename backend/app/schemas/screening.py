from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime

class ScreeningCreate(BaseModel):
    patient_id: int
    disease_code: str        # TB, HIV, MALARIA, STI, MATERNAL, MALNUTRITION, DENGUE, ENTERIC
    district_id: Optional[int] = None
    symptoms: Optional[Dict[str, Any]] = {}
    vitals: Optional[Dict[str, Any]] = {}
    kit_test_result: Optional[str] = "not_done"
    kit_test_type: Optional[str] = None
    notes: Optional[str] = None

class ScreeningResponse(BaseModel):
    id: int
    screening_uid: str
    patient_id: int
    disease_id: int
    screened_by: int
    screening_date: datetime
    symptoms: Optional[Dict]
    vitals: Optional[Dict]
    kit_test_result: str
    ai_risk_score: Optional[float]
    ai_risk_level: Optional[str]
    ai_prediction: Optional[str]
    ai_confidence: Optional[float]
    ai_engine_used: Optional[str]
    referral_needed: bool
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class ScreeningUpdate(BaseModel):
    kit_test_result: Optional[str] = None
    kit_test_type: Optional[str] = None
    final_diagnosis: Optional[str] = None
    referral_needed: Optional[bool] = None
    referral_facility: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None