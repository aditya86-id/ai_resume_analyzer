import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { resumeAPI, analysisAPI, jobsAPI } from '../api';
import { useAuthStore } from '../store/authStore';
import { LoadingSpinner, LoadingBar } from '../components/Loading';
import { Alert } from '../components/Alert';
import { formatBytes, formatDate } from '../utils/helpers';

export function ResumesPage() {
  const [resumes, setResumes] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [activeTab, setActiveTab] = useState('resumes');
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    location: '',
    salary_min: '',
    salary_max: '',
    description: ''
  });
  const { token } = useAuthStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [resumesData, jobsData] = await Promise.all([
        resumeAPI.list(),
        jobsAPI.list()
      ]);
      setResumes(resumesData.results || resumesData);
      setJobs(jobsData.results || jobsData);
      setError('');
    } catch (err) {
      setError('Failed to load data');
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
      await loadData();
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

  const handleSubmitJob = async (e) => {
    e.preventDefault();
    if (!jobForm.description || !jobForm.title) {
      setError('Job title and description are required');
      return;
    }

    setIsSubmittingJob(true);
    try {
      const jobData = {
        title: jobForm.title,
        company: jobForm.company || 'Not specified',
        location: jobForm.location || 'Not specified',
        salary_min: jobForm.salary_min ? parseInt(jobForm.salary_min) : null,
        salary_max: jobForm.salary_max ? parseInt(jobForm.salary_max) : null,
        description: jobForm.description
      };

      const response = await jobsAPI.create(jobData);
      setJobs([response, ...jobs]);
      setJobForm({
        title: '',
        company: '',
        location: '',
        salary_min: '',
        salary_max: '',
        description: ''
      });
      setShowJobForm(false);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to add job description');
    } finally {
      setIsSubmittingJob(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Resumes & Jobs</h1>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            🔄 Refresh
          </button>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('resumes')}
            className={`px-4 py-3 font-semibold border-b-2 transition ${
              activeTab === 'resumes'
                ? 'text-primary-600 border-primary-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            📄 My Resumes ({resumes.length})
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-3 font-semibold border-b-2 transition ${
              activeTab === 'jobs'
                ? 'text-primary-600 border-primary-600'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            💼 Job Descriptions ({jobs.length})
          </button>
        </div>
      </div>

      {/* Resumes Tab */}
      {activeTab === 'resumes' && (
        <>
          {/* Upload Form */}
          <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-dashed border-primary-300 mb-8">
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

          {/* Resumes List */}
          {resumes.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500 text-lg">No resumes yet. Upload one to get started!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {resumes.map((resume) => (
                <div key={resume.id} className="card hover:shadow-lg transition">
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
                    <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded text-sm border border-green-200">
                      <span className="font-medium">Overall Score: </span>
                      <span className="text-green-600 font-bold text-lg">{resume.analysis.overall_score}%</span>
                      <div className="mt-2 flex gap-4 flex-wrap">
                        <div><span className="text-gray-600 text-xs">Format:</span> <span className="font-bold text-sm">{resume.analysis.format_score}%</span></div>
                        <div><span className="text-gray-600 text-xs">Keywords:</span> <span className="font-bold text-sm">{resume.analysis.keywords_score}%</span></div>
                        <div><span className="text-gray-600 text-xs">Experience:</span> <span className="font-bold text-sm">{resume.analysis.experience_score}%</span></div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <>
          {/* Add Job Description Form */}
          <div className="mb-8">
            {!showJobForm ? (
              <button
                onClick={() => setShowJobForm(true)}
                className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2"
              >
                ➕ Add Job Description
              </button>
            ) : (
              <div className="card bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Add Job Description</h2>
                  <button
                    onClick={() => setShowJobForm(false)}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSubmitJob} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Title *
                      </label>
                      <input
                        type="text"
                        value={jobForm.title}
                        onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                        placeholder="e.g., Senior React Developer"
                        className="input-base"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company
                      </label>
                      <input
                        type="text"
                        value={jobForm.company}
                        onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                        placeholder="e.g., Tech Company Inc"
                        className="input-base"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={jobForm.location}
                        onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                        placeholder="e.g., San Francisco, CA"
                        className="input-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Min Salary
                      </label>
                      <input
                        type="number"
                        value={jobForm.salary_min}
                        onChange={(e) => setJobForm({ ...jobForm, salary_min: e.target.value })}
                        placeholder="e.g., 80000"
                        className="input-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Salary
                      </label>
                      <input
                        type="number"
                        value={jobForm.salary_max}
                        onChange={(e) => setJobForm({ ...jobForm, salary_max: e.target.value })}
                        placeholder="e.g., 120000"
                        className="input-base"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Description *
                    </label>
                    <textarea
                      value={jobForm.description}
                      onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                      placeholder="Paste the full job description here. NLP will automatically extract skills, requirements, and other details..."
                      className="input-base h-48"
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={isSubmittingJob}
                      className="flex-1 btn-primary disabled:opacity-50"
                    >
                      {isSubmittingJob ? 'Processing...' : 'Add & Analyze Job'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowJobForm(false)}
                      className="flex-1 btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {jobs.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500 text-lg">No job descriptions available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <div key={job.id} className="card hover:shadow-lg transition border-l-4 border-primary-500">
                  <div className="mb-3">
                    <h3 className="text-lg font-bold text-gray-900">{job.title}</h3>
                    <p className="text-sm text-primary-600 font-semibold">{job.company || 'Not specified'}</p>
                  </div>

                  <div className="space-y-3 text-sm">
                    {job.location && (
                      <div className="flex items-start gap-2">
                        <span className="text-lg">📍</span>
                        <div>
                          <p className="text-gray-600 text-xs font-medium">Location</p>
                          <p className="text-gray-900">{job.location}</p>
                        </div>
                      </div>
                    )}

                    {(job.salary_min || job.salary_max) && (
                      <div className="flex items-start gap-2">
                        <span className="text-lg">💰</span>
                        <div>
                          <p className="text-gray-600 text-xs font-medium">Salary</p>
                          <p className="text-gray-900">
                            {job.salary_min && job.salary_max
                              ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                              : job.salary_min
                              ? `$${job.salary_min.toLocaleString()}+`
                              : `$${job.salary_max.toLocaleString()}`}
                          </p>
                        </div>
                      </div>
                    )}

                    {job.experience_level && (
                      <div className="flex items-start gap-2">
                        <span className="text-lg">💼</span>
                        <div>
                          <p className="text-gray-600 text-xs font-medium">Experience Level</p>
                          <p className="text-gray-900 capitalize">{job.experience_level}</p>
                        </div>
                      </div>
                    )}

                    {job.description && (
                      <div className="flex items-start gap-2">
                        <span className="text-lg">📝</span>
                        <div>
                          <p className="text-gray-600 text-xs font-medium">Description</p>
                          <p className="text-gray-900 line-clamp-3">{job.description.substring(0, 150)}...</p>
                        </div>
                      </div>
                    )}

                    {job.required_skills && Array.isArray(job.required_skills) && job.required_skills.length > 0 && (
                      <div>
                        <p className="text-gray-600 text-xs font-medium mb-2">Required Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {job.required_skills.slice(0, 5).map((skill, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-xs font-medium"
                            >
                              {typeof skill === 'string' ? skill : skill.name}
                            </span>
                          ))}
                          {job.required_skills.length > 5 && (
                            <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium">
                              +{job.required_skills.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link
                      to={`/jobs/${job.id}`}
                      className="btn-primary text-sm w-full text-center"
                    >
                      View Full Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
