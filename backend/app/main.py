from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, SQLModel, create_engine, select
from typing import Optional, List
from contextlib import asynccontextmanager
from datetime import date
import os
import json

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
    auto_seed = os.getenv("AUTO_SEED", "").strip().lower() in {"1", "true", "yes", "on"}
    if auto_seed:
        with Session(engine) as session:
            existing = session.exec(select(Patient).limit(1)).first()
            if not existing:
                patients = [
                    Patient(
                        first_name="Maria",
                        last_name="Santos",
                        dob=date(1985, 3, 15),
                        phone="+63 917 123 4567",
                        notes="Regular checkup patient",
                    ),
                    Patient(
                        first_name="Juan",
                        last_name="Dela Cruz",
                        dob=date(1990, 7, 22),
                        phone="+63 918 234 5678",
                        notes="Allergic to penicillin",
                    ),
                    Patient(
                        first_name="Ana",
                        last_name="Reyes",
                        dob=date(1978, 11, 8),
                        phone="+63 919 345 6789",
                        notes="Diabetic - Type 2",
                    ),
                    Patient(
                        first_name="Carlos",
                        last_name="Garcia",
                        dob=date(2000, 1, 30),
                        phone="+63 920 456 7890",
                        notes="",
                    ),
                    Patient(
                        first_name="Elena",
                        last_name="Mendoza",
                        dob=date(1995, 5, 12),
                        phone="+63 921 567 8901",
                        notes="Pregnant - 2nd trimester",
                    ),
                ]

                for p in patients:
                    session.add(p)
                session.commit()

                for p in patients:
                    session.refresh(p)

                visits = [
                    Visit(
                        patient_id=patients[0].id,
                        date=date(2024, 1, 15),
                        doctor="Dr. Rodriguez",
                        reason="Annual physical examination",
                        diagnosis="Healthy, no issues found",
                    ),
                    Visit(
                        patient_id=patients[0].id,
                        date=date(2024, 1, 20),
                        doctor="Dr. Rodriguez",
                        reason="Follow-up for blood work",
                        diagnosis="All lab results normal",
                    ),
                    Visit(
                        patient_id=patients[1].id,
                        date=date(2024, 1, 18),
                        doctor="Dr. Lim",
                        reason="Fever and cough",
                        diagnosis="Upper respiratory tract infection",
                    ),
                    Visit(
                        patient_id=patients[2].id,
                        date=date(2024, 1, 19),
                        doctor="Dr. Santos",
                        reason="Diabetes management",
                        diagnosis="Blood sugar levels stable, continue medication",
                    ),
                    Visit(
                        patient_id=patients[4].id,
                        date=date(2024, 1, 21),
                        doctor="Dr. Cruz",
                        reason="Prenatal checkup",
                        diagnosis="Normal pregnancy progression",
                    ),
                ]

                for v in visits:
                    session.add(v)
                session.commit()

                for v in visits:
                    session.refresh(v)

                certificates = [
                    Certificate(
                        visit_id=visits[0].id,
                        cert_type="medical_leave",
                        cert_data=json.dumps(
                            {
                                "start_date": "2024-01-15",
                                "end_date": "2024-01-15",
                                "days": 1,
                                "remarks": "Rest advised after examination",
                            }
                        ),
                    ),
                    Certificate(
                        visit_id=visits[2].id,
                        cert_type="medical_leave",
                        cert_data=json.dumps(
                            {
                                "start_date": "2024-01-18",
                                "end_date": "2024-01-20",
                                "days": 3,
                                "remarks": "Complete bed rest recommended",
                            }
                        ),
                    ),
                    Certificate(
                        visit_id=visits[1].id,
                        cert_type="lab_request",
                        cert_data=json.dumps(
                            {
                                "tests": [
                                    "Complete Blood Count",
                                    "Lipid Panel",
                                    "Fasting Blood Sugar",
                                ],
                                "fasting_required": True,
                                "remarks": "Annual screening tests",
                            }
                        ),
                    ),
                    Certificate(
                        visit_id=visits[3].id,
                        cert_type="result_summary",
                        cert_data=json.dumps(
                            {
                                "results": [
                                    {"test": "HbA1c", "value": "6.8%", "reference": "< 7.0%"},
                                    {
                                        "test": "Fasting Blood Sugar",
                                        "value": "110 mg/dL",
                                        "reference": "70-100 mg/dL",
                                    },
                                ],
                                "remarks": "Diabetes well controlled",
                            }
                        ),
                    ),
                ]

                for c in certificates:
                    session.add(c)
                session.commit()
    yield


app = FastAPI(
    title="Clinic QuickCert API",
    description="API for generating medical certificates and visit summaries",
    version="1.0.0",
    lifespan=lifespan
)

cors_allow_origin_regex = os.getenv("CORS_ALLOW_ORIGIN_REGEX")
cors_allow_origins = [
    o.strip() for o in os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:3000").split(",") if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[] if cors_allow_origin_regex else cors_allow_origins,
    allow_origin_regex=cors_allow_origin_regex,
    allow_credentials=True,
    allow_methods=["*"] ,
    allow_headers=["*"] ,
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
