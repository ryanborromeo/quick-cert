"""Database initialization and seeding script."""
import json
from datetime import date, datetime
from sqlmodel import Session, SQLModel, create_engine
from app.models import Patient, Visit, Certificate

DATABASE_URL = "sqlite:///./quickcert.db"
engine = create_engine(DATABASE_URL, echo=True)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def seed_data():
    with Session(engine) as session:
        # Check if data already exists
        existing = session.query(Patient).first()
        if existing:
            print("Database already seeded. Skipping...")
            return

        # Create sample patients
        patients = [
            Patient(
                first_name="Maria",
                last_name="Santos",
                dob=date(1985, 3, 15),
                phone="+63 917 123 4567",
                notes="Regular checkup patient"
            ),
            Patient(
                first_name="Juan",
                last_name="Dela Cruz",
                dob=date(1990, 7, 22),
                phone="+63 918 234 5678",
                notes="Allergic to penicillin"
            ),
            Patient(
                first_name="Ana",
                last_name="Reyes",
                dob=date(1978, 11, 8),
                phone="+63 919 345 6789",
                notes="Diabetic - Type 2"
            ),
            Patient(
                first_name="Carlos",
                last_name="Garcia",
                dob=date(2000, 1, 30),
                phone="+63 920 456 7890",
                notes=""
            ),
            Patient(
                first_name="Elena",
                last_name="Mendoza",
                dob=date(1995, 5, 12),
                phone="+63 921 567 8901",
                notes="Pregnant - 2nd trimester"
            ),
        ]

        for patient in patients:
            session.add(patient)
        session.commit()

        # Refresh to get IDs
        for patient in patients:
            session.refresh(patient)

        # Create sample visits
        visits = [
            Visit(
                patient_id=patients[0].id,
                date=date(2024, 1, 15),
                doctor="Dr. Rodriguez",
                reason="Annual physical examination",
                diagnosis="Healthy, no issues found"
            ),
            Visit(
                patient_id=patients[0].id,
                date=date(2024, 1, 20),
                doctor="Dr. Rodriguez",
                reason="Follow-up for blood work",
                diagnosis="All lab results normal"
            ),
            Visit(
                patient_id=patients[1].id,
                date=date(2024, 1, 18),
                doctor="Dr. Lim",
                reason="Fever and cough",
                diagnosis="Upper respiratory tract infection"
            ),
            Visit(
                patient_id=patients[2].id,
                date=date(2024, 1, 19),
                doctor="Dr. Santos",
                reason="Diabetes management",
                diagnosis="Blood sugar levels stable, continue medication"
            ),
            Visit(
                patient_id=patients[4].id,
                date=date(2024, 1, 21),
                doctor="Dr. Cruz",
                reason="Prenatal checkup",
                diagnosis="Normal pregnancy progression"
            ),
        ]

        for visit in visits:
            session.add(visit)
        session.commit()

        for visit in visits:
            session.refresh(visit)

        # Create sample certificates
        certificates = [
            Certificate(
                visit_id=visits[0].id,
                cert_type="medical_leave",
                cert_data=json.dumps({
                    "start_date": "2024-01-15",
                    "end_date": "2024-01-15",
                    "days": 1,
                    "remarks": "Rest advised after examination"
                })
            ),
            Certificate(
                visit_id=visits[2].id,
                cert_type="medical_leave",
                cert_data=json.dumps({
                    "start_date": "2024-01-18",
                    "end_date": "2024-01-20",
                    "days": 3,
                    "remarks": "Complete bed rest recommended"
                })
            ),
            Certificate(
                visit_id=visits[1].id,
                cert_type="lab_request",
                cert_data=json.dumps({
                    "tests": ["Complete Blood Count", "Lipid Panel", "Fasting Blood Sugar"],
                    "fasting_required": True,
                    "remarks": "Annual screening tests"
                })
            ),
            Certificate(
                visit_id=visits[3].id,
                cert_type="result_summary",
                cert_data=json.dumps({
                    "results": [
                        {"test": "HbA1c", "value": "6.8%", "reference": "< 7.0%"},
                        {"test": "Fasting Blood Sugar", "value": "110 mg/dL", "reference": "70-100 mg/dL"}
                    ],
                    "remarks": "Diabetes well controlled"
                })
            ),
        ]

        for cert in certificates:
            session.add(cert)
        session.commit()

        print("Database seeded successfully!")


if __name__ == "__main__":
    create_db_and_tables()
    seed_data()
