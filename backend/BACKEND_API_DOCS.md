# AI Resume Analyzer - Backend API

A comprehensive Django REST API for analyzing resumes using Google's Gemini AI, featuring ATS compatibility scoring, skill extraction, and job matching.

## Features

- **User Authentication** - Token-based authentication with registration and login
- **Resume Analysis** - AI-powered analysis using Google Gemini API
- **ATS Scoring** - Get detailed ATS compatibility scores
- **Skill Extraction** - Automatically extract skills from resumes with proficiency levels
- **Job Matching** - Match resumes against job descriptions
- **Dashboard Stats** - Get comprehensive analytics of your resume analyses
- **Audit Logging** - Complete audit trail of all user actions
- **API Documentation** - Interactive Swagger documentation

## Setup Instructions

### Prerequisites

- Python 3.9+
- PostgreSQL
- Google Gemini API Key (get it from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Installation

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   DEBUG=True
   SECRET_KEY=your-secret-key-here
   
   # Database
   DB_NAME=ai_resume_analyzer
   DB_USER=postgres
   DB_PASSWORD=your-password
   DB_HOST=localhost
   DB_PORT=5432
   
   # Gemini API
   GEMINI_API_KEY=your-gemini-api-key
   
   # CORS
   CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
   ```

3. **Setup the database**
   ```bash
   # Run migrations and seed sample data
   python manage.py setup_db
   ```
   
   This will:
   - Run all migrations
   - Create a default admin user (username: `admin`, password: `admin123`)
   - Seed sample job descriptions and templates

4. **Create a superuser (optional)**
   ```bash
   python manage.py createsuperuser
   ```

5. **Start the development server**
   ```bash
   python manage.py runserver
   ```

   The API will be available at `http://localhost:8000`

## API Endpoints

### Authentication

- `POST /api/auth/register/` - Register a new user
- `POST /api/auth/login/` - Login and get token
- `POST /api/auth/logout/` - Logout
- `GET /api/auth/user/` - Get current user details

### Resumes

- `POST /api/resumes/upload/` - Upload a resume file
- `GET /api/resumes/` - List all user resumes
- `GET /api/resumes/{id}/` - Get resume details
- `DELETE /api/resumes/{id}/` - Delete a resume

### Resume Analysis

- `POST /api/analyze/` - Analyze a resume
  - Request body: `{"resume_id": 1}`
- `GET /api/resumes/{resume_id}/analysis/` - Get analysis results
- `GET /api/resumes/{resume_id}/skills/` - Get extracted skills

### Job Matching

- `GET /api/resumes/{resume_id}/matching/` - Get job matches for a resume

### Jobs

- `GET /api/jobs/` - List all job descriptions
- `GET /api/jobs/{id}/` - Get job details
- `POST /api/jobs/` - Create a new job
- `PUT /api/jobs/{id}/` - Update a job
- `DELETE /api/jobs/{id}/` - Delete a job

### Templates

- `GET /api/templates/` - List analysis templates
- `GET /api/templates/?category=feedback` - Filter by category

### Dashboard

- `GET /api/dashboard/stats/` - Get dashboard statistics
  - Returns: total uploads, average ATS score, job matches, in-demand skills

### Audit Logs

- `GET /api/audit-logs/` - Get user's audit logs

### API Documentation

- `GET /api/schema/swagger-ui/` - Interactive Swagger UI
- `GET /api/schema/redoc/` - ReDoc documentation
- `GET /api/schema/` - OpenAPI schema

## Request/Response Examples

### Register User
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

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

Response:
```json
{
  "user": {
    "id": 1,
    "username": "john",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "date_joined": "2024-01-01T12:00:00Z"
  },
  "token": "abc123def456...",
  "message": "Login successful"
}
```

### Upload Resume
```bash
curl -X POST http://localhost:8000/api/resumes/upload/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -F "file=@resume.pdf"
```

### Analyze Resume
```bash
curl -X POST http://localhost:8000/api/analyze/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"resume_id": 1}'
```

Response includes:
```json
{
  "overall_score": 87,
  "format_score": 92,
  "keywords_score": 78,
  "experience_score": 88,
  "education_score": 95,
  "impact_score": 90,
  "feedback": "Your resume...",
  "suggestions": ["...", "..."],
  "skills": [
    {
      "id": 1,
      "name": "React",
      "level": "expert",
      "is_in_demand": true,
      "match_score": 95.0
    }
  ]
}
```

### Get Dashboard Stats
```bash
curl http://localhost:8000/api/dashboard/stats/ \
  -H "Authorization: Token YOUR_TOKEN"
```

Response:
```json
{
  "total_uploads": 5,
  "avg_ats_score": 82.4,
  "jobs_matched": 23,
  "in_demand_skills": 8
}
```

## Database Models

### Resume
- `user` - Foreign key to User
- `file` - File upload field
- `filename` - Original filename
- `file_size` - File size in bytes
- `uploaded_at` - Upload timestamp
- `updated_at` - Last update timestamp

### ResumeAnalysis
- `resume` - One-to-one to Resume
- `overall_score` - 0-100 ATS score
- `format_score` - Formatting quality
- `keywords_score` - Keyword relevance
- `experience_score` - Experience section quality
- `education_score` - Education section quality
- `impact_score` - Achievement impact
- `feedback` - AI-generated feedback
- `suggestions` - Array of improvement suggestions
- `status` - Analysis status (pending/analyzing/completed/failed)

### Skill
- `analysis` - Foreign key to ResumeAnalysis
- `name` - Skill name
- `level` - Proficiency level
- `is_in_demand` - Boolean flag
- `match_score` - Match percentage

### JobDescription
- `title` - Job title
- `company` - Company name
- `location` - Job location
- `salary_min`, `salary_max` - Salary range
- `description` - Job description
- `required_skills` - JSON array of required skills

### JobMatch
- `analysis` - Foreign key to ResumeAnalysis
- `job` - Foreign key to JobDescription
- `match_score` - Match percentage
- `matched_skills` - Array of matching skills
- `missing_skills` - Array of missing skills

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DEBUG` | Set to `True` for development |
| `SECRET_KEY` | Django secret key |
| `DB_NAME` | PostgreSQL database name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `DB_HOST` | Database host |
| `DB_PORT` | Database port |
| `GEMINI_API_KEY` | Google Gemini API key |
| `CORS_ALLOWED_ORIGINS` | Comma-separated CORS origins |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts |

## Production Deployment

1. **Set secure settings**
   ```python
   DEBUG=False
   SECRET_KEY=generate-a-secure-key
   ALLOWED_HOSTS=your-domain.com,www.your-domain.com
   ```

2. **Run migrations**
   ```bash
   python manage.py migrate
   ```

3. **Collect static files**
   ```bash
   python manage.py collectstatic --noinput
   ```

4. **Use gunicorn for serving**
   ```bash
   gunicorn resume_analyzer.wsgi:application --bind 0.0.0.0:8000
   ```

## Docker Setup

Build and run with Docker:
```bash
docker-compose up -d
```

## Testing

Run the test suite:
```bash
python manage.py test
```

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Verify credentials in `.env`
- Check DB_HOST and DB_PORT

### Gemini API Error
- Verify API key is correct
- Check your API quota
- Ensure the API is enabled in Google Cloud Console

### File Upload Issues
- Ensure `/media` directory exists and is writable
- Check file size limits
- Verify file format (PDF or DOCX)

## API Rate Limiting

The API uses token-based authentication. Consider implementing rate limiting for production:

```python
# In settings.py
REST_FRAMEWORK = {
    ...
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle"
    ],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "100/hour",
        "user": "1000/hour"
    }
}
```

## Support & Documentation

- **API Schema**: Available at `/api/schema/`
- **Swagger UI**: Available at `/api/schema/swagger-ui/`
- **Admin Panel**: Available at `/admin/` (requires superuser)

## License

MIT License - See LICENSE file for details
