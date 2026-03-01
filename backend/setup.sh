#!/bin/bash
# Backend Setup & Run Script for AI Resume Analyzer

set -e

echo "================================"
echo "AI Resume Analyzer - Backend Setup"
echo "================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9 or higher."
    exit 1
fi

echo "✓ Python $(python3 --version) found"
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    echo "✓ Virtual environment created"
fi

echo ""
echo "🔄 Activating virtual environment..."
source venv/bin/activate

echo "📦 Installing dependencies..."
pip install -q -r requirements.txt
echo "✓ Dependencies installed"

echo ""
echo "⚙️  Setting up database..."
python manage.py setup_db

echo ""
echo "================================"
echo "✓ Setup Complete!"
echo "================================"
echo ""
echo "To start the development server, run:"
echo "  python manage.py runserver"
echo ""
echo "The API will be available at:"
echo "  http://localhost:8000/api/"
echo ""
echo "API Documentation:"
echo "  Swagger UI: http://localhost:8000/api/schema/swagger-ui/"
echo "  ReDoc: http://localhost:8000/api/schema/redoc/"
echo ""
echo "Admin Panel:"
echo "  URL: http://localhost:8000/admin/"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "Make sure to update the GEMINI_API_KEY in .env with your actual API key!"
echo ""
