# AI Resume Analyzer - React Frontend

A modern, responsive React web application for analyzing resumes using AI. Built with Vite, React Router, Tailwind CSS, and Zustand.

## Features

✨ **User Authentication**
- Register and login functionality
- Token-based authentication
- Secure session management

📄 **Resume Management**
- Upload resumes (PDF and DOCX)
- View resume list with metadata
- Delete resumes
- Track upload history

🤖 **AI Analysis**
- Automated resume analysis using Gemini AI
- ATS (Applicant Tracking System) compatibility scoring
- Detailed feedback and improvement suggestions
- Multiple scoring categories:
  - Overall Score
  - Format Score
  - Keywords Score
  - Experience Score
  - Education Score
  - Impact Score

🎯 **Skill Extraction**
- Automatically extract skills from resumes
- Proficiency level classification
- Identify in-demand skills

💼 **Job Matching**
- Match resumes against job descriptions
- View matching jobs by compatibility score
- Discover job opportunities aligned with your profile

📊 **Dashboard & Analytics**
- View comprehensive statistics
- Track average ATS scores
- See in-demand skills
- Monitor job matches
- View activity audit logs

## Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **HTTP Client**: Fetch API
- **Date Utilities**: date-fns

## Project Structure

```
frontend/
├── src/
│   ├── main.jsx                 # Application entry point
│   ├── App.jsx                  # Main app component with routing
│   ├── styles/
│   │   └── index.css            # Global styles with Tailwind
│   ├── components/              # Reusable UI components
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── Alert.jsx
│   │   ├── Loading.jsx
│   │   ├── ScoreCard.jsx
│   │   └── SkillBadge.jsx
│   ├── pages/                   # Page components
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ResumesPage.jsx
│   │   ├── ResumeDetailPage.jsx
│   │   ├── DashboardPage.jsx
│   │   └── JobsPage.jsx
│   ├── api/                     # API integration
│   │   ├── client.js            # Fetch wrapper with token management
│   │   └── index.js             # API endpoints
│   ├── store/                   # Zustand state management
│   │   └── authStore.js         # Authentication store
│   └── utils/                   # Utility functions
│       ├── helpers.js           # Helper functions
│       └── routes.jsx           # Route protection components
├── index.html                   # HTML entry point
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── postcss.config.js            # PostCSS configuration
├── package.json                 # Dependencies and scripts
└── .env.example                 # Environment variables template
```

## Installation

### Prerequisites

- Node.js 16+ and npm
- Running Django backend on `http://localhost:8000`

### Setup Steps

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```

4. **Update `.env` if needed** (defaults work with local backend)
   ```env
   VITE_API_URL=http://localhost:8000/api
   VITE_APP_NAME=AI Resume Analyzer
   VITE_API_TIMEOUT=30000
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

   The application will open at `http://localhost:3000`

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Run linter
npm run lint

# Format code
npm run format
```

## API Integration

The frontend communicates with the Django backend API at `/api/`. All requests include:
- Authorization token in headers
- Proper error handling with user feedback
- Automatic logout on 401 responses

### Key API Endpoints Used

- `POST /auth/register/` - User registration
- `POST /auth/login/` - User login
- `POST /resumes/upload/` - Upload resume
- `GET /resumes/` - List user resumes
- `POST /analyze/` - Analyze resume
- `GET /resumes/{id}/analysis/` - Get analysis results
- `GET /resumes/{id}/skills/` - Get extracted skills
- `GET /resumes/{id}/matching/` - Get job matches
- `GET /jobs/` - List job descriptions
- `GET /dashboard/stats/` - Get dashboard statistics
- `GET /audit-logs/` - Get activity logs

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Component Architecture

### Layout Components
- **Header**: Navigation with auth state
- **Footer**: Footer with copyright info

### Page Components
- **HomePage**: Landing page with feature overview
- **LoginPage**: User authentication
- **RegisterPage**: New user registration
- **ResumesPage**: List and upload resumes
- **ResumeDetailPage**: Detailed analysis view
- **DashboardPage**: Analytics and statistics
- **JobsPage**: Browse job descriptions

### UI Components
- **Alert**: Display notifications (success, error, warning, info)
- **Loading**: Spinner and bar animations
- **ScoreCard**: Display metrics with color coding
- **SkillBadge**: Display skill with proficiency level

## State Management

### AuthStore (Zustand)
Manages:
- Current user data
- Authentication token
- Loading states
- Error messages
- Login, register, logout functions
- Persistent storage via localStorage

## Styling

Uses Tailwind CSS with custom configuration:
- Primary color: Sky blue theme
- Custom utilities: `.btn`, `.card`, `.input-base`
- Responsive design with mobile-first approach
- Focus states and accessibility features

## Error Handling

- API errors display user-friendly messages
- Automatic token refresh on 401
- Form validation with feedback
- Loading states during async operations

## Development Tips

### Adding a New Page

1. Create component in `src/pages/YourPage.jsx`
2. Add route in `src/App.jsx`
3. Wrap with `ProtectedRoute` if authentication required
4. Use API client for data fetching

### Adding a New API Endpoint

1. Add function in `src/api/index.js`
2. Use `apiClient.get()`, `.post()`, `.put()`, or `.delete()`
3. Import and use in components

### Styling New Components

1. Use Tailwind classes directly
2. Reference custom utilities in `src/styles/index.css`
3. Maintain responsive design with `sm:`, `md:`, `lg:` breakpoints

## Production Build

```bash
npm run build
```

This creates an optimized build in the `dist/` directory ready for deployment.

## Deployment

The built frontend can be deployed to any static hosting:
- Vercel
- Netlify
- GitHub Pages
- AWS S3
- Any web server

Ensure the `VITE_API_URL` environment variable points to your production API.

## Troubleshooting

### CORS Errors
Ensure the Django backend has CORS enabled for your frontend URL in settings.

### API Connection Issues
Check that the backend is running on the correct port and `VITE_API_URL` is set correctly.

### 404 on Refresh
Configure your hosting to serve `index.html` for all routes (SPA behavior).

## License

MIT
