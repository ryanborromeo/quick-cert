from datetime import datetime, date
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
import json


class PatientBase(SQLModel):
    first_name: str = Field(index=True)
    last_name: str = Field(index=True)
    dob: date
    phone: Optional[str] = None
    notes: Optional[str] = None


class Patient(PatientBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    visits: List["Visit"] = Relationship(back_populates="patient")


class PatientCreate(PatientBase):
    pass


class PatientRead(PatientBase):
    id: int
    created_at: datetime


class PatientReadWithVisits(PatientRead):
    visits: List["VisitRead"] = []


class VisitBase(SQLModel):
    date: date
    doctor: str
    reason: str
    diagnosis: Optional[str] = None


class Visit(VisitBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    patient_id: int = Field(foreign_key="patient.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    patient: Optional[Patient] = Relationship(back_populates="visits")
    certificates: List["Certificate"] = Relationship(back_populates="visit")


class VisitCreate(VisitBase):
    pass


class VisitRead(VisitBase):
    id: int
    patient_id: int
    created_at: datetime


class VisitReadWithCertificates(VisitRead):
    certificates: List["CertificateRead"] = []


class CertificateBase(SQLModel):
    cert_type: str  # "medical_leave", "lab_request", "result_summary"
    cert_data: str  # JSON string


class Certificate(CertificateBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    visit_id: int = Field(foreign_key="visit.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    visit: Optional[Visit] = Relationship(back_populates="certificates")


class CertificateCreate(CertificateBase):
    pass


class CertificateRead(CertificateBase):
    id: int
    visit_id: int
    created_at: datetime


class CertificateReadFull(CertificateRead):
    visit: Optional[VisitRead] = None
    patient: Optional[PatientRead] = None


# Update forward references
PatientReadWithVisits.model_rebuild()
VisitReadWithCertificates.model_rebuild()
