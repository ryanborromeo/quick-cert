from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, SQLModel, create_engine
from typing import Optional, List
from contextlib import asynccontextmanager

from .models import (
    Patient, PatientCreate, PatientRead, PatientReadWithVisits,
    Visit, VisitCreate, VisitRead, VisitReadWithCertificates,
    Certificate, CertificateCreate, CertificateRead, CertificateReadFull
)
from . import crud

DATABASE_URL = "sqlite:///./quickcert.db"
engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})


def get_session():
    with Session(engine) as session:
        yield session


@asynccontextmanager
async def lifespan(app: FastAPI):
    SQLModel.metadata.create_all(engine)
    yield


app = FastAPI(
    title="Clinic QuickCert API",
    description="API for generating medical certificates and visit summaries",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Patient endpoints
@app.get("/patients", response_model=List[PatientRead])
def list_patients(
    query: Optional[str] = Query(None, description="Search by name or phone"),
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session)
):
    return crud.get_patients(session, query=query, skip=skip, limit=limit)


@app.get("/patients/{patient_id}", response_model=PatientReadWithVisits)
def get_patient(patient_id: int, session: Session = Depends(get_session)):
    patient = crud.get_patient(session, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    visits = crud.get_visits_by_patient(session, patient_id)
    visit_reads: List[VisitReadWithCertificates] = []
    for v in visits:
        certs = crud.get_certificates_by_visit(session, v.id)
        visit_reads.append(
            VisitReadWithCertificates(
                id=v.id,
                patient_id=v.patient_id,
                date=v.date,
                doctor=v.doctor,
                reason=v.reason,
                diagnosis=v.diagnosis,
                created_at=v.created_at,
                certificates=[
                    CertificateRead(
                        id=c.id,
                        visit_id=c.visit_id,
                        cert_type=c.cert_type,
                        cert_data=c.cert_data,
                        created_at=c.created_at,
                    )
                    for c in certs
                ],
            )
        )

    return PatientReadWithVisits(
        id=patient.id,
        first_name=patient.first_name,
        last_name=patient.last_name,
        dob=patient.dob,
        phone=patient.phone,
        notes=patient.notes,
        created_at=patient.created_at,
        visits=visit_reads,
    )


@app.post("/patients", response_model=PatientRead, status_code=201)
def create_patient(patient: PatientCreate, session: Session = Depends(get_session)):
    return crud.create_patient(session, patient)


@app.put("/patients/{patient_id}", response_model=PatientRead)
def update_patient(patient_id: int, patient: PatientCreate, session: Session = Depends(get_session)):
    db_patient = crud.update_patient(session, patient_id, patient)
    if not db_patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return db_patient


@app.delete("/patients/{patient_id}", status_code=204)
def delete_patient(patient_id: int, session: Session = Depends(get_session)):
    if not crud.delete_patient(session, patient_id):
        raise HTTPException(status_code=404, detail="Patient not found")


# Visit endpoints
@app.get("/patients/{patient_id}/visits", response_model=List[VisitRead])
def list_visits(patient_id: int, session: Session = Depends(get_session)):
    patient = crud.get_patient(session, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return crud.get_visits_by_patient(session, patient_id)


@app.post("/patients/{patient_id}/visits", response_model=VisitRead, status_code=201)
def create_visit(patient_id: int, visit: VisitCreate, session: Session = Depends(get_session)):
    patient = crud.get_patient(session, patient_id)
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return crud.create_visit(session, patient_id, visit)


@app.get("/visits/{visit_id}", response_model=VisitReadWithCertificates)
def get_visit(visit_id: int, session: Session = Depends(get_session)):
    visit = crud.get_visit(session, visit_id)
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")

    certs = crud.get_certificates_by_visit(session, visit_id)
    return VisitReadWithCertificates(
        id=visit.id,
        patient_id=visit.patient_id,
        date=visit.date,
        doctor=visit.doctor,
        reason=visit.reason,
        diagnosis=visit.diagnosis,
        created_at=visit.created_at,
        certificates=[
            CertificateRead(
                id=c.id,
                visit_id=c.visit_id,
                cert_type=c.cert_type,
                cert_data=c.cert_data,
                created_at=c.created_at,
            )
            for c in certs
        ],
    )


# Certificate endpoints
@app.post("/visits/{visit_id}/certificates", response_model=CertificateRead, status_code=201)
def create_certificate(visit_id: int, certificate: CertificateCreate, session: Session = Depends(get_session)):
    visit = crud.get_visit(session, visit_id)
    if not visit:
        raise HTTPException(status_code=404, detail="Visit not found")
    return crud.create_certificate(session, visit_id, certificate)


@app.get("/certificates/{certificate_id}", response_model=CertificateReadFull)
def get_certificate(certificate_id: int, session: Session = Depends(get_session)):
    certificate = crud.get_certificate(session, certificate_id)
    if not certificate:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    visit = crud.get_visit(session, certificate.visit_id)
    patient = crud.get_patient(session, visit.patient_id) if visit else None
    
    return CertificateReadFull(
        id=certificate.id,
        visit_id=certificate.visit_id,
        cert_type=certificate.cert_type,
        cert_data=certificate.cert_data,
        created_at=certificate.created_at,
        visit=visit,
        patient=patient
    )


@app.get("/certificates", response_model=List[CertificateRead])
def list_recent_certificates(limit: int = 10, session: Session = Depends(get_session)):
    return crud.get_recent_certificates(session, limit=limit)


@app.get("/health")
def health_check():
    return {"status": "healthy"}
