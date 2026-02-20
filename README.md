# AI Resume Analyzer - Production Ready SaaS

Complete AI-powered resume analysis and optimization platform.

## 🚀 Features

### Backend
- **JWT Authentication**: Secure signup/login with token refresh
- **Resume Parsing**: PDF and DOCX file extraction
- **AI Extraction**: spaCy-powered skill and entity detection
- **ATS Scoring**: Weighted algorithm for resume optimization
- **Job Matching**: Semantic similarity between resumes and job descriptions
- **Async Processing**: Celery tasks for heavy NLP operations

### Frontend
- **Modern UI**: Next.js 14 with Tailwind CSS
- **Auth System**: Secure login/signup with local storage
- **File Upload**: Drag-and-drop resume and job description uploads
- **Dashboard**: Real-time analytics and resume management
- **React Query**: Server state management with caching

## 📋 Tech Stack

### Backend
- FastAPI (async)
- PostgreSQL (or SQLite for dev)
- SQLAlchemy ORM
- Celery + Redis
- spaCy + sentence-transformers

### Frontend
- Next.js 14 (App Router)
- Tailwind CSS
- React Query
- Zustand (state management)
- TypeScript

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+
- Python 3.12+
- Docker & Docker Compose (optional)

### Quick Start with Docker

```bash
docker-compose up --build
# Backend: http://localhost:8000
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs
```

### Manual Setup - Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Manual Setup - Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Start development server
npm run dev
# Frontend: http://localhost:3000
```

## 🔐 Current Status

✅ **Completed**
- Project structure and folder organization
- FastAPI backend with SQLite database
- JWT authentication (signup/login/logout)
- Pydantic v2 models and validation
- Service layer architecture
- Zustand auth state management
- Next.js 14 with App Router
- Tailwind CSS styling
- Auth pages (signup, login, logout)
- Dashboard layout with navigation
- Resume upload and jobs pages

⏳ **Next Steps**
1. Resume upload endpoint and file handling
2. PDF/DOCX text extraction with Celery
3. spaCy entity extraction (skills, education, experience)
4. ATS scoring algorithm implementation
5. Job description upload and matching
6. Semantic similarity with sentence-transformers
7. LLM integration for suggestions
8. Frontend components for results display

## 📊 API Endpoints (In Progress)

**Auth** ✅
- `POST /api/v1/auth/signup` - Register user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/health` - Health check

**Resumes** ⏳
- `POST /api/v1/resumes/upload` - Upload resume
- `GET /api/v1/resumes` - List resumes
- `GET /api/v1/resumes/{id}` - Get resume details

**Jobs** ⏳
- `POST /api/v1/jobs/upload` - Upload JD
- `GET /api/v1/jobs` - List jobs

**Matching** ⏳
- `POST /api/v1/matching/match` - Match resume with JD

## 📁 Project Structure

```
ai-resume-analyzer/
├── backend/
│   ├── app/
│   │   ├── api/v1/              # API routes (auth, resumes, jobs, matching)
│   │   ├── models/              # SQLAlchemy ORM models
│   │   ├── schemas/             # Pydantic request/response
│   │   ├── services/            # Business logic
│   │   ├── tasks/               # Celery async tasks
│   │   ├── nlp/                 # NLP utilities
│   │   ├── core/                # Security, constants
│   │   ├── utils/               # Helpers (file handlers, validators)
│   │   ├── db/                  # Database config
│   │   ├── config.py
│   │   ├── dependencies.py
│   │   └── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/              # Auth pages
│   │   ├── (dashboard)/         # Dashboard pages
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/              # Reusable React components
│   ├── lib/
│   │   ├── api.ts               # Axios client
│   │   ├── auth-api.ts          # Auth API
│   │   ├── auth-store.ts        # Zustand store
│   │   └── providers.tsx        # React Query
│   ├── styles/
│   ├── package.json
│   ├── tailwind.config.ts
│   └── .env.example
│
├── docker-compose.yml
└── README.md
```

## 🔄 Data Flow

```
User Upload → Validation → File Storage → Celery Task
  ↓
Text Extraction → spaCy Processing → DB Storage
  ↓
Entity Extraction (Skills, Education) → ATS Score Calculation
  ↓
Frontend Dashboard Display
```

## 🚀 Running the Project

### Development Mode

**Terminal 1 - Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
# http://localhost:8000/docs
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

### Production with Docker

```bash
docker-compose up --build -d
```

## 📚 Authentication

- Tokens stored in localStorage
- JWT with 30-min access token expiry
- Auto logout on 401 response
- Password hashed with bcrypt

## 🧪 Testing

```bash
# Backend
cd backend && pytest

# Frontend
cd frontend && npm test
```

## 📝 Implementation Checklist

- [x] Backend project structure
- [x] FastAPI with CORS
- [x] SQLAlchemy models (User, Resume, Job, Analytics)
- [x] Pydantic v2 schemas
- [x] JWT authentication
- [x] Password hashing (bcrypt)
- [x] SQLite database
- [x] Service layer pattern
- [x] Zustand store setup
- [x] Next.js 14 App Router
- [x] Tailwind CSS
- [x] Auth pages (signup/login)
- [x] Dashboard layout
- [ ] Resume upload endpoint
- [ ] File extraction (PDF/DOCX)
- [ ] Celery task pipeline
- [ ] spaCy entity extraction
- [ ] ATS scoring algorithm
- [ ] Job matching engine
- [ ] LLM suggestions
- [ ] Error handling & validation
- [ ] Unit & integration tests
- [ ] API documentation
- [ ] Frontend components for results
- [ ] Analytics dashboard

## 🆘 Support & Issues

For bugs or questions, open an issue on GitHub.

┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                            │
│         (Auth Context, React Query, Tailwind UI)                │
│  Pages: Auth | Dashboard | Upload | Results | Job Matching     │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS
┌──────────────────────────────▼──────────────────────────────────┐
│              API GATEWAY (FastAPI)                               │
│  ├─ Auth Endpoints (signup/login/logout)                        │
│  ├─ Resume Upload & Progress                                    │
│  ├─ Job Description Upload                                      │
│  ├─ Matching & Analysis Results                                 │
│  └─ User Dashboard/Analytics                                    │
└─────────────────────────────────────────────────────────────────┘
        │                    │                    │
        ▼                    ▼                    ▼
    ┌─────────────┐    ┌──────────────┐    ┌──────────────┐
    │ PostgreSQL  │    │ Redis Cache  │    │ Celery Queue │
    │ (Main DB)   │    │ (Sessions)   │    │ (Background) │
    │             │    │ (Results)    │    │ (Parsing)    │
    └─────────────┘    └──────────────┘    └──────────────┘
                            │                    │
                            │                    ▼
                            │         ┌──────────────────────┐
                            │         │  Task Workers        │
                            │         │  ├─ PDF/DOCX Parse   │
                            │         │  ├─ spaCy Extraction │
                            │         │  ├─ ATS Scoring      │
                            │         │  └─ JD Matching      │
                            │         └──────────────────────┘
                            │
                     ┌──────────────────────────────┐
                     │  File Storage (S3/LocalFS)   │
                     │  Temp uploads & archives     │
                     └──────────────────────────────┘

    ┌─────────────────────────────────────────────────────────┐
    │  AI/NLP Services (Running in Celery Workers)            │
    │  ├─ spaCy (en_core_web_trf) - Entity & skill extraction │
    │  ├─ sentence-transformers - Semantic similarity         │
    │  └─ Optional: GPT/Claude - Resume improvements          │
    └─────────────────────────────────────────────────────────┘
