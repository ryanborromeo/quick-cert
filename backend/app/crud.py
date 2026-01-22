from sqlmodel import Session, select
from typing import Optional, List
from .models import (
    Patient, PatientCreate,
    Visit, VisitCreate,
    Certificate, CertificateCreate
)


# Patient CRUD
def get_patients(session: Session, query: Optional[str] = None, skip: int = 0, limit: int = 100) -> List[Patient]:
    statement = select(Patient)
    if query:
        statement = statement.where(
            (Patient.first_name.ilike(f"%{query}%")) |
            (Patient.last_name.ilike(f"%{query}%")) |
            (Patient.phone.ilike(f"%{query}%"))
        )
    statement = statement.offset(skip).limit(limit).order_by(Patient.created_at.desc())
    return session.exec(statement).all()


def get_patient(session: Session, patient_id: int) -> Optional[Patient]:
    return session.get(Patient, patient_id)


def create_patient(session: Session, patient: PatientCreate) -> Patient:
    db_patient = Patient(**patient.model_dump())
    session.add(db_patient)
    session.commit()
    session.refresh(db_patient)
    return db_patient


def update_patient(session: Session, patient_id: int, patient_data: PatientCreate) -> Optional[Patient]:
    db_patient = session.get(Patient, patient_id)
    if not db_patient:
        return None
    patient_dict = patient_data.model_dump(exclude_unset=True)
    for key, value in patient_dict.items():
        setattr(db_patient, key, value)
    session.add(db_patient)
    session.commit()
    session.refresh(db_patient)
    return db_patient


def delete_patient(session: Session, patient_id: int) -> bool:
    db_patient = session.get(Patient, patient_id)
    if not db_patient:
        return False
    session.delete(db_patient)
    session.commit()
    return True


# Visit CRUD
def get_visits_by_patient(session: Session, patient_id: int) -> List[Visit]:
    statement = select(Visit).where(Visit.patient_id == patient_id).order_by(Visit.date.desc())
    return session.exec(statement).all()


def get_visit(session: Session, visit_id: int) -> Optional[Visit]:
    return session.get(Visit, visit_id)


def create_visit(session: Session, patient_id: int, visit: VisitCreate) -> Visit:
    data = visit.model_dump()
    data["patient_id"] = patient_id
    db_visit = Visit(**data)
    session.add(db_visit)
    session.commit()
    session.refresh(db_visit)
    return db_visit


# Certificate CRUD
def get_certificates_by_visit(session: Session, visit_id: int) -> List[Certificate]:
    statement = select(Certificate).where(Certificate.visit_id == visit_id).order_by(Certificate.created_at.desc())
    return session.exec(statement).all()


def get_certificate(session: Session, certificate_id: int) -> Optional[Certificate]:
    return session.get(Certificate, certificate_id)


def create_certificate(session: Session, visit_id: int, certificate: CertificateCreate) -> Certificate:
    data = certificate.model_dump()
    data["visit_id"] = visit_id
    db_certificate = Certificate(**data)
    session.add(db_certificate)
    session.commit()
    session.refresh(db_certificate)
    return db_certificate


def get_recent_certificates(session: Session, limit: int = 10) -> List[Certificate]:
    statement = select(Certificate).order_by(Certificate.created_at.desc()).limit(limit)
    return session.exec(statement).all()
