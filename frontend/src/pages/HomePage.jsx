import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function HomePage() {
  const { token } = useAuthStore();

  if (token) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50">
      <div className="container flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900">
          📄 AI Resume Analyzer
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl">
          Optimize your resume with AI-powered analysis. Get ATS scores, skill extraction, and job matching.
        </p>
        <div className="flex gap-4">
          <a href="/register" className="btn-primary text-lg px-8 py-3">
            Get Started
          </a>
          <a href="/login" className="btn-outline text-lg px-8 py-3">
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
