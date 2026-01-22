# Clinic QuickCert

A lightweight MicroSaaS for small clinics to rapidly generate medical certificates and visit summaries.

## Features

- **Patient Registration**: Register patients with their personal information
- **Visit Recording**: Record clinic visits with doctor, reason, and diagnosis
- **Certificate Generation**: Create printable certificates:
  - Medical Leave Certificates
  - Laboratory Request Forms
  - Result Summaries
- **PDF Export**: Download certificates as PDF using html2canvas + jsPDF
- **Search**: Find patients by name or phone number

## Tech Stack

### Backend
- **FastAPI** (Python 3.11+)
- **SQLite** with SQLModel ORM
- RESTful API design

### Frontend
- **Next.js** (Pages Router)
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **html2canvas + jsPDF** for PDF generation

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database with seed data
python init_db.py

# Start the server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/patients` | List/search patients |
| GET | `/patients/{id}` | Get patient with visits |
| POST | `/patients` | Create patient |
| PUT | `/patients/{id}` | Update patient |
| DELETE | `/patients/{id}` | Delete patient |
| GET | `/patients/{id}/visits` | List patient visits |
| POST | `/patients/{id}/visits` | Create visit |
| GET | `/visits/{id}` | Get visit with certificates |
| POST | `/visits/{id}/certificates` | Create certificate |
| GET | `/certificates/{id}` | Get certificate details |
| GET | `/certificates` | List recent certificates |

## Project Structure

```
/backend
  /app
    main.py          # FastAPI app and routes
    models.py        # Database models
    crud.py          # Database operations
  requirements.txt
  init_db.py         # Database initialization

/frontend
  /pages
    index.js                    # Dashboard
    /patients
      index.js                  # Patient list
      [id].js                   # Patient detail
    /certificates
      index.js                  # Certificate list
      [id].js                   # Certificate detail
  /components
    Layout.js                   # App layout
    PatientForm.js              # Patient registration form
    VisitForm.js                # Visit recording form
    CertificateForm.js          # Certificate creation form
    CertificatePreview.js       # Certificate preview & PDF
  /lib
    api.js                      # API client
```

## Demo Data

The `init_db.py` script seeds the database with:
- 5 sample patients
- 5 sample visits
- 4 sample certificates

## Environment Variables

### Frontend
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: `http://localhost:8000`)

## Deployment

### Backend (Railway/Render/Fly.io)
1. Set up a Python environment
2. Install dependencies from `requirements.txt`
3. Run `python init_db.py` for initial setup
4. Start with `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel)
1. Connect your GitHub repository
2. Set `NEXT_PUBLIC_API_URL` environment variable
3. Deploy

## License

MIT
