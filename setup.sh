#!/bin/bash

# AI Resume Analyzer - Quick Start Script
# This script automates the setup of both backend and frontend

set -e

echo "🚀 AI Resume Analyzer - Setup Script"
echo "===================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}Checking prerequisites...${NC}"

if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed."
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required but not installed."
    exit 1
fi

echo -e "${GREEN}✓ Python 3 and Node.js found${NC}"

# Setup Backend
echo -e "\n${BLUE}Setting up Backend...${NC}"

cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -q -r requirements.txt

# Create .env if doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo -e "${YELLOW}⚠️  IMPORTANT: Edit backend/.env and add your GEMINI_API_KEY${NC}"
    read -p "Press Enter once you've added the Gemini API key..."
fi

# Setup database
echo "Setting up database..."
python manage.py setup_db > /dev/null 2>&1

echo -e "${GREEN}✓ Backend setup complete${NC}"

# Setup Frontend
echo -e "\n${BLUE}Setting up Frontend...${NC}"

cd ../frontend

# Install dependencies
echo "Installing Node.js dependencies..."
npm install -q

# Create .env if doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
fi

echo -e "${GREEN}✓ Frontend setup complete${NC}"

# Print summary
echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"

echo -e "\n${BLUE}To start the application:${NC}"

echo -e "\n${YELLOW}Terminal 1 - Backend:${NC}"
echo "cd backend"
echo "source venv/bin/activate"
echo "python manage.py runserver"

echo -e "\n${YELLOW}Terminal 2 - Frontend:${NC}"
echo "cd frontend"
echo "npm run dev"

echo -e "\n${BLUE}Then open:${NC} http://localhost:3000"

echo -e "\n${BLUE}Documentation:${NC}"
echo "- Backend API Docs: http://localhost:8000/api/schema/swagger-ui/"
echo "- Setup Guide: Read FULL_SETUP.md"
echo "- Features Guide: Read FRONTEND_FEATURES.md"

echo -e "\n${YELLOW}Default Admin Credentials:${NC}"
echo "Username: admin"
echo "Password: admin123"

echo -e "\n"
