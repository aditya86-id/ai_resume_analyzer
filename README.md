# AI Resume Analyzer - SaaS Platform

Complete AI-powered resume analysis and optimization platform with intelligent resume parsing and ATS scoring.

## Features

### Backend
- **Token Authentication**: Secure signup/login with token-based authentication
- **Resume Parsing**: PDF and DOCX file extraction and text processing
- **AI Analysis**: Google Gemini API integration for intelligent resume analysis
- **ATS Scoring**: Comprehensive scoring across multiple dimensions (format, keywords, experience, education, impact)
- **Skill Extraction**: Automatic extraction and categorization of skills with proficiency levels
- **Job Matching**: Match resume against job descriptions and identify skill gaps
- **Audit Logging**: Complete activity tracking for security and analytics

### Frontend
- **Modern UI**: React with Vite and Tailwind CSS
- **Auth System**: Secure login/signup with token-based authentication
- **File Upload**: Resume file upload with validation (PDF/DOCX only)
- **Dashboard**: Real-time analytics and resume management
- **Analysis Results**: Detailed breakdown of scores, feedback, and improvement suggestions
- **Responsive Design**: Beautiful UI that works on all devices

## Tech Stack

### Backend
- Django 4.2
- Django REST Framework
- SQLite (development) / PostgreSQL (production)
- Google Generative AI (Gemini) API
- Python-Docx, PyPDF2 for file parsing

### Frontend
- React 18 with Vite
- Tailwind CSS  
- Zustand (state management)
- JavaScript (ES6+)

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 16+ and npm
- Python 3.9+
- pip (Python package manager)

### Quick Start - Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Apply database migrations
python manage.py migrate

# Start development server
python manage.py runserver
# Backend API: http://localhost:8000
# API Documentation: http://localhost:8000/api/docs/
```

### Quick Start - Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Ensure VITE_API_URL=http://localhost:8000/api

# Start development server
npm run dev
# Frontend: http://localhost:5173
```

## 🔐 Current Status

✅ **Completed & Tested**
- Full Django REST API with Token Authentication
- User registration and login
- Resume upload with file validation (PDF/DOCX only)
- Resume file text extraction (PDF/DOCX)
- AI-powered resume analysis using Google Gemini API
- Mock analysis fallback when API unavailable (for testing)
- Skill extraction and categorization
- ATS scoring across 6 dimensions (format, keywords, experience, education, impact, overall)
- Real-time feedback and improvement suggestions
- Comprehensive error handling and validation
- Frontend authentication with Zustand
- Dashboard with resume management
- Responsive Tailwind CSS UI
- Audit logging for user actions
- CORS enabled for frontend-backend communication

✨ **Features Ready for Use**
- Register a new account or login with username/email
- Upload PDF or DOCX resumes
- Get instant AI analysis with detailed scores
- View extracted skills and proficiency levels
- See actionable improvement suggestions
- Track analysis history

⏳ **Future Enhancements**
- Job description upload and matching
- Skill gap analysis between resume and job requirements
- Multiple resume comparison
- Email notifications for analysis completion
- Advanced analytics dashboard
- Resume template suggestions

## 📊 API Endpoints

### Authentication ✅
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login (accepts username or email)
- `POST /api/auth/logout/` - Logout
- `GET /api/auth/user/` - Get current user info

### Resumes ✅
- `POST /api/resumes/upload/` - Upload resume (PDF/DOCX)
- `GET /api/resumes/` - List user's resumes
- `GET /api/resumes/{id}/` - Get resume details
- `DELETE /api/resumes/{id}/` - Delete resume

### Analysis ✅
- `POST /api/analyze/` - Analyze resume and get AI scores
- `GET /api/resumes/{resume_id}/analysis/` - Get analysis details
- `GET /api/resumes/{resume_id}/skills/` - Get extracted skills

### Job Matching 🚧
- `GET /api/jobs/` - List job descriptions
- `POST /api/jobs/` - Create job description
- `GET /api/resumes/{resume_id}/matching/` - Match resume with jobs

### Dashboard ✅
- `GET /api/dashboard/stats/` - Get dashboard statistics
- `GET /api/audit-logs/` - Get activity logs (admin)

### Templates ✅
- `GET /api/templates/` - Get analysis templates

## 📁 Project Structure

```
ai_resume_analyzer/
├── backend/
│   ├── api/
│   │   ├── models.py            # Django models
│   │   ├── views.py             # API views and endpoints
│   │   ├── serializers.py       # DRF serializers
│   │   ├── services.py          # Business logic
│   │   ├── urls.py              # API routes
│   │   ├── admin.py             # Django admin
│   │   ├── management/          # Django management commands
│   │   │   └── commands/
│   │   │       ├── seed_jobs_and_templates.py
│   │   │       └── setup_db.py
│   │   └── migrations/          # Database migrations
│   │
│   ├── resume_analyzer/         # Django project settings
│   │   ├── settings.py          # Project configuration
│   │   ├── urls.py              # Main URL router
│   │   └── wsgi.py              # WSGI configuration
│   │
│   ├── requirements.txt         # Python dependencies
│   ├── manage.py                # Django CLI
│   ├── db.sqlite3               # SQLite database
│   └── .env                     # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   │   ├── Alert.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Loading.jsx
│   │   │   ├── ScoreCard.jsx
│   │   │   └── SkillBadge.jsx
│   │   ├── pages/               # Page components
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ResumesPage.jsx
│   │   │   ├── ResumeDetailPage.jsx
│   │   │   └── JobsPage.jsx
│   │   ├── api/                 # API client
│   │   │   ├── client.js        # Fetch client
│   │   │   └── index.js         # API endpoints
│   │   ├── store/               # Zustand state management
│   │   │   └── authStore.js
│   │   ├── styles/              # CSS files
│   │   │   └── index.css
│   │   ├── utils/               # Utility functions
│   │   │   ├── helpers.js
│   │   │   └── routes.jsx
│   │   ├── App.jsx              # Main app component
│   │   └── main.jsx             # React entry point
│   │
│   ├── package.json             # npm dependencies
│   ├── vite.config.js           # Vite configuration
│   ├── tailwind.config.js       # Tailwind CSS config
│   ├── postcss.config.js        # PostCSS config
│   ├── index.html               # HTML entry point
│   └── .env                     # Environment variables
│
├── docker-compose.yml           # Docker Compose config
├── README.md                    # This file
└── setup.sh                     # Setup script
```

## 🔄 Data Flow

```
User Registration/Login
       ↓
  Token Authentication
       ↓
  Resume Upload (PDF/DOCX)
       ↓
  File Validation & Storage
       ↓
  Text Extraction (PDFpy/python-docx)
       ↓
  Google Gemini AI Analysis
       ↓
  Score Calculation (6 dimensions)
       ↓
  Skill Extraction & Detection
       ↓
  Database Storage
       ↓
  Frontend Display (Charts, Feedback, Suggestions)
```

## 🚀 Running the Project

### Development Mode - Terminal Setup

**Terminal 1 - Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py runserver
# API available at http://localhost:8000
# View API docs: http://localhost:8000/api/schema/
```

**Terminal 2 - Frontend**
```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

Then open your browser to http://localhost:5173 and start using the app!

## � Authentication

- **Token-based Authentication**: Uses Django REST Framework Token authentication
- **Secure Login**: Username or email with password
- **Session Management**: Tokens stored in browser localStorage
- **Auto Logout**: User logged out on 401 Unauthorized responses
- **Password Security**: Passwords hashed using Django's built-in hashers
- **CORS**: Configured for frontend-backend communication

## 🧪 Testing

### Test the Backend API

```bash
# Using curl
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "securepass123"
  }'

# Get token and use it for authenticated requests
curl -X GET http://localhost:8000/api/auth/user/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

### Test Resume Upload

1. Login to http://localhost:5173
2. Go to "My Resumes"
3. Upload a PDF or DOCX file
4. Click "Analyze"
5. View results with scores and suggestions

## 📝 Implementation Checklist

- [x] Django REST Framework setup
- [x] SQLite database with models
- [x] Token authentication (register/login/logout)
- [x] Password hashing and validation
- [x] Resume model and upload endpoint
- [x] PDF/DOCX file parsing
- [x] Resume text extraction
- [x] Google Gemini AI integration
- [x] ATS scoring algorithm (6 dimensions)
- [x] Skill extraction and categorization
- [x] Feedback and suggestions generation
- [x] Error handling and validation
- [x] React frontend setup
- [x] Zustand state management
- [x] Authentication pages (login/register)
- [x] Dashboard layout
- [x] Resume management UI
- [x] Analysis results display
- [x] Tailwind CSS styling
- [x] Responsive design
- [x] CORS configuration
- [x] Audit logging
- [ ] Job description upload
- [ ] Resume-to-job matching
- [ ] Advanced analytics
- [ ] Email notifications
- [ ] Production deployment

## 🎯 Sample Resume

A sample resume (`sample_resume.docx`) is included in the backend folder for testing. Upload it through the frontend to see the analysis in action.

## 📊 Analysis Scoring

The system analyzes resumes across 6 dimensions:

1. **Format Score** (0-100): Structure, readability, and formatting consistency
2. **Keywords Score** (0-100): Industry keywords and technical terminology
3. **Experience Score** (0-100): Clarity and impact of work experience
4. **Education Score** (0-100): Education section quality and clarity
5. **Impact Score** (0-100): Quantifiable achievements and action verbs
6. **Overall Score** (0-100): Weighted average of all dimensions

## 🔑 Environment Variables

**Backend (.env)**
```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
GEMINI_API_KEY=your-gemini-api-key
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=AI Resume Analyzer
VITE_API_TIMEOUT=30000
```

## 🆘 Troubleshooting

**Port Already in Use**
```bash
# Backend (use different port)
python manage.py runserver 8001

# Frontend (use different port)  
npm run dev -- --port 5174
```

**Database Issues**
```bash
# Reset database
rm db.sqlite3
python manage.py migrate
```

**CORS Errors**
- Check CORS_ALLOWED_ORIGINS in backend .env
- Ensure frontend URL matches the CORS configuration

**Missing Dependencies**
```bash
# Backend
pip install -r requirements.txt

# Frontend
npm install
```

## 📬 Support & Feedback

For issues, questions, or suggestions, please open an issue on GitHub or contact the development team.
