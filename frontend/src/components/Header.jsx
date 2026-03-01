import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function Header() {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <nav className="container flex items-center justify-between h-16">
        <Link to="/" className="text-xl font-bold text-primary-600">
          📄 Resume Analyzer
        </Link>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link
                to="/resumes"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                My Resumes
              </Link>
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{user.username}</span>
                <button
                  onClick={handleLogout}
                  className="btn-secondary text-sm"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="btn-outline text-sm">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
