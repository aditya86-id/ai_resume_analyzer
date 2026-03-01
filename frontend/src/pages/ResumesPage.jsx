import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resumeAPI, analysisAPI } from '../api';
import { useAuthStore } from '../store/authStore';
import { LoadingSpinner, LoadingBar } from '../components/Loading';
import { Alert } from '../components/Alert';
import { formatBytes, formatDate } from '../utils/helpers';

export function ResumesPage() {
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState(null);
  const { token } = useAuthStore();

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      setIsLoading(true);
      const data = await resumeAPI.list();
      setResumes(data.results || data);
      setError('');
    } catch (err) {
      setError('Failed to load resumes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadFile);

      const response = await resumeAPI.upload(formData);
      setResumes([response, ...resumes]);
      setUploadFile(null);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to upload resume');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyze = async (resumeId) => {
    setAnalyzingId(resumeId);
    try {
      await analysisAPI.analyze(resumeId);
      await loadResumes();
      setError('');
    } catch (err) {
      setError('Failed to analyze resume');
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleDelete = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;

    try {
      await resumeAPI.delete(resumeId);
      setResumes(resumes.filter((r) => r.id !== resumeId));
      setError('');
    } catch (err) {
      setError('Failed to delete resume');
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">My Resumes</h1>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Upload Form */}
        <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-dashed border-primary-300">
          <form onSubmit={handleUpload} className="space-y-4">
            <h2 className="text-xl font-semibold">Upload Resume</h2>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Choose file (PDF or DOCX)
                </label>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="input-base"
                  disabled={isUploading}
                />
              </div>
              <button
                type="submit"
                disabled={!uploadFile || isUploading}
                className="btn-primary disabled:opacity-50"
              >
                {isUploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Resumes List */}
      {resumes.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">No resumes yet. Upload one to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {resumes.map((resume) => (
            <div key={resume.id} className="card">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{resume.filename}</h3>
                  <p className="text-sm text-gray-500">
                    Size: {formatBytes(resume.file_size)} • Uploaded: {formatDate(resume.uploaded_at)}
                  </p>
                </div>

                <div className="flex gap-3">
                  <Link
                    to={`/resume/${resume.id}`}
                    className="btn-outline text-sm"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleAnalyze(resume.id)}
                    disabled={analyzingId === resume.id}
                    className="btn-primary text-sm disabled:opacity-50"
                  >
                    {analyzingId === resume.id ? 'Analyzing...' : 'Analyze'}
                  </button>
                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="btn-secondary text-sm hover:bg-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {resume.analysis && (
                <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                  <span className="font-medium">Analysis Score: </span>
                  <span className="text-primary-600 font-bold">{resume.analysis.overall_score}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
