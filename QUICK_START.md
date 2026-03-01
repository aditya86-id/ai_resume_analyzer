# AI Resume Analyzer - Quick Start Guide

Get the AI Resume Analyzer running in 5 minutes!

## Prerequisites

- Python 3.9+
- Node.js 16+
- Google Gemini API Key ([Get one here](https://makersuite.google.com/app/apikey))

## Automatic Setup (Linux/Mac)

Run the automatic setup script:

```bash
chmod +x setup.sh
./setup.sh
```

This will:
1. Create Python virtual environment
2. Install backend dependencies
3. Setup database
4. Install frontend dependencies
5. Create configuration files

## Manual Setup

### Backend Setup

1. **Open Terminal 1**

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt
```

2. **Configure Environment**

```bash
cp .env.example .env
```

Edit `.env` and add your Gemini API key:
```
GEMINI_API_KEY=your-api-key-here
```

3. **Setup Database**

```bash
python manage.py setup_db
```

4. **Start Server**

```bash
python manage.py runserver
```

Backend is ready at: http://localhost:8000

### Frontend Setup

1. **Open Terminal 2**

```bash
cd frontend

# Install dependencies
npm install
```

2. **Start Development Server**

```bash
npm run dev
```

Frontend is ready at: http://localhost:3000

## Test the Application

1. Open http://localhost:3000
2. Click "Sign Up"
3. Create a new account
4. Upload a resume (PDF or DOCX)
5. Click "Analyze" to see AI insights
6. Explore Dashboard and Job Matches

## Default Admin Account

- Username: `admin`
- Password: `admin123`
- Access at: http://localhost:8000/admin/

## API Documentation

Interactive API docs available at:
- **Swagger**: http://localhost:8000/api/schema/swagger-ui/
- **ReDoc**: http://localhost:8000/api/schema/redoc/

## Useful Commands

### Backend
```bash
cd backend
source venv/bin/activate

# Run server
python manage.py runserver

# Run tests
python manage.py test

# Create superuser
python manage.py createsuperuser

# Database shell
python manage.py shell
```

### Frontend
```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Format code
npm run format
```

## Environment Variables

### Backend (`.env`)
```env
DEBUG=True
SECRET_KEY=your-secret-key
GEMINI_API_KEY=your-gemini-key
CORS_ALLOWED_ORIGINS=http://localhost:3000
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=AI Resume Analyzer
VITE_API_TIMEOUT=30000
```

## Troubleshooting

### Backend won't start
- Ensure Python version is 3.9+: `python --version`
- Try: `pip install --upgrade pip`
- Delete `venv` folder and recreate it

### Frontend won't start
- Ensure Node.js version is 16+: `node --version`
- Delete `node_modules` and `package-lock.json`, run `npm install`
- Clear npm cache: `npm cache clean --force`

### Can't connect frontend to backend
- Ensure backend server is running on port 8000
- Check `VITE_API_URL` in frontend `.env`
- Check CORS settings in backend (should include `http://localhost:3000`)

### Resume analysis fails
- Verify Gemini API key is set in `.env`
- Check API key has quota remaining
- Ensure resume file is PDF or DOCX format

## Next Steps

1. **Read Documentation**
   - Backend: [README.md](backend/README.md)
   - Frontend: [frontend/README.md](frontend/README.md)
   - Features: [FRONTEND_FEATURES.md](FRONTEND_FEATURES.md)
   - Setup: [FULL_SETUP.md](FULL_SETUP.md)

2. **Explore API**
   - Visit Swagger UI: http://localhost:8000/api/schema/swagger-ui/
   - Try API endpoints manually
   - Read request/response examples

3. **Customize Application**
   - Update colors in `frontend/tailwind.config.js`
   - Modify API endpoints in `frontend/src/api/index.js`
   - Add new pages in `frontend/src/pages/`

4. **Deploy**
   - Backend: Deploy to Heroku, AWS, DigitalOcean
   - Frontend: Deploy to Vercel, Netlify, AWS S3

## Support Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://react.dev/)
- [Google Gemini API](https://ai.google.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite Documentation](https://vitejs.dev/)

## Common Commands Reference

```bash
# Backend
cd backend
source venv/bin/activate
python manage.py runserver       # Start server
python manage.py setup_db        # Setup database
python manage.py test            # Run tests
python manage.py createsuperuser # Create admin user

# Frontend
cd frontend
npm run dev                       # Development server
npm run build                     # Production build
npm run preview                   # Preview build
npm run lint                      # Check code quality
npm run format                    # Format code
```

## Performance Tips

1. **Backend**
   - Use PostgreSQL for production
   - Enable Redis caching
   - Use Gunicorn + Nginx
   - Set `DEBUG=False` in production

2. **Frontend**
   - Run `npm run build` for production
   - Use CDN for static files
   - Enable gzip compression
   - Optimize images

---

**Happy analyzing! 🚀**

For more details, refer to [FULL_SETUP.md](FULL_SETUP.md)
