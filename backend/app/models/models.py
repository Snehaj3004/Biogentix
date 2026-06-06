from sqlalchemy import (Column, Integer, String, Boolean, Text,
                         Enum, DECIMAL, JSON, ForeignKey, TIMESTAMP, Date)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum

class UserRole(str, enum.Enum):
    admin = "admin"
    doctor = "doctor"
    field_worker = "field_worker"
    lab_tech = "lab_tech"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    phone = Column(String(20))
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum('admin','doctor','field_worker','lab_tech'), default='field_worker')
    district = Column(String(100))
    facility_name = Column(String(150))
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    screenings = relationship("Screening", back_populates="screener",
                               foreign_keys="Screening.screened_by")
    patients = relationship("Patient", back_populates="registrar",
                             foreign_keys="Patient.registered_by")

class District(Base):
    __tablename__ = "districts"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    state = Column(String(100))
    country = Column(String(100), default='India')
    latitude = Column(DECIMAL(10, 7))
    longitude = Column(DECIMAL(10, 7))
    population = Column(Integer)
    created_at = Column(TIMESTAMP, server_default=func.now())
    patients = relationship("Patient", back_populates="district_rel")
    screenings = relationship("Screening", back_populates="district_rel")

class Disease(Base):
    __tablename__ = "diseases"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(20), unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    category = Column(Enum('infectious','maternal','nutrition','enteric','ntd'))
    description = Column(Text)
    icon = Column(String(50))
    color_hex = Column(String(10))
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    screenings = relationship("Screening", back_populates="disease")

class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    patient_uid = Column(String(20), unique=True, nullable=False, index=True)
    full_name = Column(String(150), nullable=False)
    age = Column(Integer)
    gender = Column(Enum('male','female','other'), nullable=False)
    phone = Column(String(20))
    address = Column(Text)
    district_id = Column(Integer, ForeignKey("districts.id"))
    village = Column(String(100))
    is_pregnant = Column(Boolean, default=False)
    weight_kg = Column(DECIMAL(5, 2))
    height_cm = Column(DECIMAL(5, 2))
    blood_group = Column(String(5))
    registered_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    district_rel = relationship("District", back_populates="patients")
    registrar = relationship("User", back_populates="patients",
                              foreign_keys=[registered_by])
    screenings = relationship("Screening", back_populates="patient")

class Screening(Base):
    __tablename__ = "screenings"
    id = Column(Integer, primary_key=True, index=True)
    screening_uid = Column(String(30), unique=True, nullable=False, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    disease_id = Column(Integer, ForeignKey("diseases.id"), nullable=False)
    screened_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    district_id = Column(Integer, ForeignKey("districts.id"))
    screening_date = Column(TIMESTAMP, server_default=func.now())
    symptoms = Column(JSON)
    vitals = Column(JSON)
    kit_test_result = Column(Enum('positive','negative','inconclusive','not_done'),
                              default='not_done')
    kit_test_type = Column(String(100))
    ai_risk_score = Column(DECIMAL(5, 4))
    ai_risk_level = Column(Enum('minimal','low','medium','high','critical'),
                            default='low')
    ai_prediction = Column(Text)
    ai_confidence = Column(DECIMAL(5, 4))
    ai_engine_used = Column(String(50), default='rule_engine')
    final_diagnosis = Column(Text)
    referral_needed = Column(Boolean, default=False)
    referral_facility = Column(String(200))
    notes = Column(Text)
    status = Column(Enum('pending','completed','referred','follow_up'),
                    default='pending')
    synced = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    patient = relationship("Patient", back_populates="screenings")
    disease = relationship("Disease", back_populates="screenings")
    screener = relationship("User", back_populates="screenings",
                             foreign_keys=[screened_by])
    district_rel = relationship("District", back_populates="screenings")
    lab_results = relationship("LabResult", back_populates="screening",
                                cascade="all, delete-orphan")
    symptom_responses = relationship("SymptomResponse", back_populates="screening",
                                      cascade="all, delete-orphan")

class SymptomResponse(Base):
    __tablename__ = "symptom_responses"
    id = Column(Integer, primary_key=True, index=True)
    screening_id = Column(Integer, ForeignKey("screenings.id", ondelete="CASCADE"))
    symptom_key = Column(String(100), nullable=False)
    symptom_label = Column(String(200))
    response_value = Column(String(50))
    severity_score = Column(Integer, default=0)
    screening = relationship("Screening", back_populates="symptom_responses")

class LabResult(Base):
    __tablename__ = "lab_results"
    id = Column(Integer, primary_key=True, index=True)
    screening_id = Column(Integer, ForeignKey("screenings.id", ondelete="CASCADE"))
    test_name = Column(String(150), nullable=False)
    test_type = Column(Enum('rapid_kit','blood_test','urine','stool',
                             'imaging','pcr','other'))
    result_value = Column(String(200))
    result_unit = Column(String(50))
    normal_range = Column(String(100))
    is_abnormal = Column(Boolean, default=False)
    image_path = Column(String(500))
    performed_at = Column(TIMESTAMP, server_default=func.now())
    screening = relationship("Screening", back_populates="lab_results")

class OutbreakAlert(Base):
    __tablename__ = "outbreak_alerts"
    id = Column(Integer, primary_key=True, index=True)
    disease_id = Column(Integer, ForeignKey("diseases.id"))
    district_id = Column(Integer, ForeignKey("districts.id"))
    alert_level = Column(Enum('watch','warning','critical'))
    case_count = Column(Integer, default=0)
    threshold_exceeded = Column(Integer)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    detected_at = Column(TIMESTAMP, server_default=func.now())
    resolved_at = Column(TIMESTAMP, nullable=True)

class PlatformStat(Base):
    __tablename__ = "platform_stats"
    id = Column(Integer, primary_key=True, index=True)
    stat_date = Column(Date, unique=True, nullable=False)
    total_screenings = Column(Integer, default=0)
    high_risk_cases = Column(Integer, default=0)
    districts_covered = Column(Integer, default=0)
    new_patients = Column(Integer, default=0)
    referrals_made = Column(Integer, default=0)
    positive_cases = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, server_default=func.now())