from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

class StatCard(BaseModel):
    total_screenings: int
    high_risk_cases: int
    districts_covered: int
    diseases_monitored: int
    ai_engines_active: int
    new_today: int
    high_risk_today: int
    referrals_pending: int

class DiseaseScreeningCount(BaseModel):
    disease_code: str
    disease_name: str
    count: int
    color_hex: str

class RiskDistribution(BaseModel):
    minimal: int
    low: int
    medium: int
    high: int
    critical: int
    minimal_pct: float
    low_pct: float
    medium_pct: float
    high_pct: float
    critical_pct: float

class DistrictStats(BaseModel):
    district_id: int
    district_name: str
    total_screenings: int
    high_risk: int
    latitude: Optional[float]
    longitude: Optional[float]

class DailyTrend(BaseModel):
    date: str
    screenings: int
    high_risk: int

class DashboardResponse(BaseModel):
    stats: StatCard
    screenings_by_disease: List[DiseaseScreeningCount]
    risk_distribution: RiskDistribution
    district_stats: List[DistrictStats]
    daily_trend: List[DailyTrend]
    recent_high_risk: List[dict]

class OutbreakAlertResponse(BaseModel):
    id: int
    disease_name: str
    district_name: str
    alert_level: str
    case_count: int
    description: Optional[str]
    detected_at: datetime

    class Config:
        from_attributes = True