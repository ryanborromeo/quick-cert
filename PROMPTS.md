# Prompts Used to Build Clinic QuickCert

This document contains the prompts and instructions used to build this application.

## Initial Prompt

```
Study thoroughly this document @[Clinic_QuickCert_Overview.pdf]. Then build it flawlessly.
```

## Overview Document Summary

The Clinic QuickCert Overview PDF specified:

### Product Requirements
1. Register patients (first_name, last_name, dob, phone, notes)
2. Record visits (doctor, reason, date, diagnosis)
3. Generate printable/shareable certificates (PDF)
4. Search patients and view recent certificates

### Technical Stack
- **Backend**: FastAPI (Python 3.11+) with SQLite using SQLModel
- **Frontend**: Next.js (Pages Router)
- **PDF Generation**: Client-side using html2canvas + jsPDF
- **Deployment**: Next.js on Vercel, FastAPI on Railway/Render/Fly.io

### Database Schema
- **Patients**: id, first_name, last_name, dob, phone, notes, created_at
- **Visits**: id, patient_id (FK), date, doctor, reason, diagnosis, created_at
- **Certificates**: id, visit_id (FK), cert_type, cert_data (JSON/Text), created_at

### API Surface
- GET /patients?query= – list or search patients
- GET /patients/{id} – patient with visits
- POST /patients – create patient
- POST /patients/{id}/visits – create visit
- POST /visits/{id}/certificates – create certificate
- GET /certificates/{id} – retrieve certificate

## Implementation Notes

### Backend Implementation
- Used SQLModel for ORM with SQLite database
- Implemented full CRUD operations for patients
- Added relationship loading for visits and certificates
- CORS enabled for frontend communication

### Frontend Implementation
- Used Next.js Pages Router for simplicity
- Tailwind CSS for modern, responsive styling
- Lucide React for consistent iconography
- date-fns for date formatting
- html2canvas + jsPDF for client-side PDF generation

### Certificate Types
1. **Medical Leave Certificate**: Start/end dates, duration, remarks
2. **Laboratory Request**: List of tests, fasting requirement, instructions
3. **Result Summary**: Test results table with values and references

### UI/UX Decisions
- Dashboard with quick stats and recent activity
- Expandable visit cards showing certificates
- Modal forms for data entry
- Print-friendly certificate preview
- One-click PDF download
