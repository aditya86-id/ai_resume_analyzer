# AI Resume Analyzer - Complete Setup Guide

This guide explains how to set up and run both the Django backend and React frontend for the AI Resume Analyzer application.

## Project Overview

The AI Resume Analyzer is a full-stack application that:
- Analyzes resumes using Google's Gemini AI
- Provides ATS compatibility scores
- Extracts skills with proficiency levels
- Matches resumes to job descriptions
- Displays analytics and insights

## System Requirements

- **Python 3.9+** (for backend)
- **Node.js 16+** (for frontend)
- **PostgreSQL** (optional, SQLite for development)
- **Google Gemini API Key** (from [Google AI Studio](https://makersuite.google.com/app/apikey))
- **Git**

## Quick Start (5 minutes)

### 1. Clone or Navigate to Project

```bash
cd /home/temporaryuser/Desktop/ai_resume_analyzer
```

### 2. Start Backend (Terminal 1)

```bash
cd backend

# Copy environment file
cp .env.example .env

# Update .env with your Gemini API key
# Edit .env and set: GEMINI_API_KEY=your_key_here

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Setup database
python manage.py setup_db

# Start server
python manage.py runserver
```

Backend will be available at: http://localhost:8000

### 3. Start Frontend (Terminal 2)

```bash
cd frontend

# Install dependencies
npm install

# Copy environment file (optional, defaults work)
cp .env.example .env

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:3000

## Detailed Backend Setup

### Step 1: Environment Configuration

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create `.env` file:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and configure:
   ```env
   # Security
   DEBUG=True
   SECRET_KEY=your-secret-key-change-this-in-production
   
   # Database (using SQLite for development)
   DB_ENGINE=django.db.backends.sqlite3
   DB_NAME=db.sqlite3
   
   # Or PostgreSQL (optional for production)
   # DB_ENGINE=django.db.backends.postgresql
   # DB_NAME=ai_resume_analyzer
   # DB_USER=postgres
   # DB_PASSWORD=your_password
   # DB_HOST=localhost
   # DB_PORT=5432
   
   # Google Gemini API
   GEMINI_API_KEY=your-api-key-from-google-ai-studio
   
   # CORS (for frontend development)
   CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
   ALLOWED_HOSTS=localhost,127.0.0.1
   ```

### Step 2: Install Dependencies

```bash
# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

# Install packages
pip install -r requirements.txt
```

### Step 3: Database Setup

```bash
# Run setup command (creates tables and seeds sample data)
python manage.py setup_db
```

This will:
- Run all migrations
- Create a default admin user (username: `admin`, password: `admin123`)
- Seed 8 sample job descriptions
- Seed 10 analysis templates

### Step 4: Run Backend Server

```bash
python manage.py runserver
```

The server will start at `http://localhost:8000`

### Verify Backend

- Health check: http://localhost:8000/api/health/
- API docs: http://localhost:8000/api/schema/swagger-ui/
- Admin panel: http://localhost:8000/admin/ (use admin/admin123)

## Detailed Frontend Setup

### Step 1: Install Node Dependencies

```bash
cd frontend
npm install
```

### Step 2: Environment Configuration

The default `.env.example` works with local backend. No changes needed unless:

```bash
cp .env.example .env
```

If backend is on different URL, edit `.env`:
```env
VITE_API_URL=http://your-backend-url/api
```

### Step 3: Start Development Server

```bash
npm run dev
```

Frontend will open at `http://localhost:3000`

### Step 4: Access the Application

1. Open http://localhost:3000
2. Click "Sign Up" to create an account
3. Upload a resume (PDF or DOCX)
4. Click "Analyze" to get AI-powered insights
5. Explore Dashboard and Job Matches

## API Documentation

Once backend is running, view interactive API docs:

- **Swagger UI**: http://localhost:8000/api/schema/swagger-ui/
- **ReDoc**: http://localhost:8000/api/schema/redoc/
- **OpenAPI Schema**: http://localhost:8000/api/schema/

### Example API Calls

#### Register User
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@example.com",
    "password": "securepass123",
    "password_confirm": "securepass123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

#### Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "password": "securepass123"
  }'
```

#### Upload Resume
```bash
curl -X POST http://localhost:8000/api/resumes/upload/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -F "file=@resume.pdf"
```

## Using Docker (Optional)

A complete Docker setup is available for production-like deployment.

### Start with Docker Compose

```bash
docker-compose up -d
```

This starts:
- PostgreSQL database on port 5432
- Django backend on port 8000
- (Frontend runs separately for hot-reload)

### Access Services

- Backend API: http://localhost:8000/api/
- Database: localhost:5432 (via psql or PgAdmin)

## Project File Structure

```
ai_resume_analyzer/
├── backend/                          # Django REST API
│   ├── api/
│   │   ├── models.py                # Database models
│   │   ├── serializers.py           # API serializers
│   │   ├── views.py                 # API views
│   │   ├── urls.py                  # API routes
│   │   ├── services.py              # Business logic
│   │   └── management/commands/     # Custom commands
│   ├── resume_analyzer/
│   │   ├── settings.py              # Django settings
│   │   ├── urls.py                  # URL config
│   │   └── wsgi.py                  # Production config
│   ├── requirements.txt             # Python dependencies
│   ├── .env.example                 # Environment template
│   ├── db.sqlite3                   # SQLite database
│   └── manage.py                    # Django CLI
│
├── frontend/                         # React application
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   ├── pages/                   # Page components
│   │   ├── api/                     # API client
│   │   ├── store/                   # State management
│   │   ├── utils/                   # Utilities
│   │   ├── styles/                  # CSS styles
│   │   ├── App.jsx                  # Main component
│   │   └── main.jsx                 # Entry point
│   ├── package.json                 # Dependencies
│   ├── vite.config.js               # Vite config
│   ├── tailwind.config.js           # Tailwind config
│   ├── .env.example                 # Environment template
│   └── README.md                    # Frontend docs
│
├── docker-compose.yml               # Docker orchestration
├── BACKEND_IMPLEMENTATION_SUMMARY.md
├── BACKEND_API_DOCS.md
└── README.md
```

## Common Issues & Solutions

### Issue: CORS Error

**Problem**: Frontend can't connect to backend

**Solution**:
1. Ensure backend is running
2. Check `CORS_ALLOWED_ORIGINS` in backend `.env`
3. Verify frontend URL matches CORS settings

```env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Issue: 401 Unauthorized

**Problem**: API returns 401 after login

**Solution**:
1. Check token is being sent in Authorization header
2. Verify token format: `Token YOUR_TOKEN_HERE`
3. Ensure token is stored in localStorage

### Issue: Resume Analysis Fails

**Problem**: Analysis returns error

**Solution**:
1. Check Gemini API key is set in `.env`
2. Verify API key has quota remaining
3. Check resume file format (PDF or DOCX)
4. Check file size (should be < 25MB)

### Issue: Database Errors

**Problem**: Migration or database errors

**Solution**:
```bash
# Reset database (development only)
python manage.py flush --no-input
python manage.py setup_db
```

### Issue: Frontend Build Errors

**Problem**: Build fails after changes

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## Development Workflow

### Backend Development

1. Activate virtual environment
2. Make code changes
3. Run tests: `python manage.py test`
4. Restart server (auto-reload is enabled)

### Frontend Development

1. Changes auto-reload in dev server
2. Check browser console for errors
3. Use React Developer Tools extension
4. Run linter: `npm run lint`
5. Format code: `npm run format`

## Testing

### Run Django Tests

```bash
cd backend
python manage.py test
```

### Test API Endpoints

Use the Swagger UI at http://localhost:8000/api/schema/swagger-ui/ to test all endpoints interactively.

## Production Deployment

### Backend Deployment

1. Set `DEBUG=False` in `.env`
2. Set a strong `SECRET_KEY`
3. Configure production database (PostgreSQL)
4. Use gunicorn instead of runserver
5. Deploy to AWS, Heroku, etc.

### Frontend Deployment

1. Build production bundle:
   ```bash
   npm run build
   ```

2. Deploy `dist/` folder to:
   - Vercel
   - Netlify
   - AWS S3 + CloudFront
   - Any static hosting

## Environment Variables Reference

### Backend

| Variable | Default | Required |
|----------|---------|----------|
| DEBUG | False | No |
| SECRET_KEY | - | Yes |
| GEMINI_API_KEY | - | Yes |
| DB_ENGINE | sqlite3 | No |
| DB_NAME | db.sqlite3 | No |
| DB_USER | - | Only for PostgreSQL |
| DB_PASSWORD | - | Only for PostgreSQL |
| CORS_ALLOWED_ORIGINS | - | Recommended |

### Frontend

| Variable | Default | Required |
|----------|---------|----------|
| VITE_API_URL | http://localhost:8000/api | Recommended |
| VITE_APP_NAME | AI Resume Analyzer | No |
| VITE_API_TIMEOUT | 30000 | No |

## Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite Documentation](https://vitejs.dev/)
- [Google Gemini API](https://ai.google.dev/)

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review API documentation
3. Check browser console for frontend errors
4. Check Django logs for backend errors
5. Ensure all environment variables are set correctly

## License

MIT License. See individual project README files for details.
