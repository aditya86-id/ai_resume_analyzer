import { useState, useEffect } from 'react';
import { jobsAPI, resumeAPI } from '../api';
import { LoadingSpinner } from '../components/Loading';
import { Alert } from '../components/Alert';
import { JobDescriptionForm } from '../components/JobDescriptionForm';
import { JobMatchingResults } from '../components/JobMatchingResults';

export function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedResume, setSelectedResume] = useState(null);

  useEffect(() => {
    loadJobs();
    loadResumes();
  }, [page, searchTerm]);

  const loadJobs = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page,
        search: searchTerm,
      });
      const data = await jobsAPI.list(params);
      setJobs(data.results || data);
      if (data.count) {
        setTotalPages(Math.ceil(data.count / 20));
      }
      setError('');
    } catch (err) {
      setError('Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const loadResumes = async () => {
    try {
      const data = await resumeAPI.list();
      setResumes(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Failed to load resumes:', err);
    }
  };

  const handleAddJobSuccess = (newJob) => {
    setShowAddForm(false);
    setPage(1);
    loadJobs();
  };

  const openMatchModal = (job) => {
    setSelectedJob(job);
    if (resumes.length === 1) {
      setSelectedResume(resumes[0]);
    }
  };

  const closeMatchModal = () => {
    setSelectedJob(null);
    setSelectedResume(null);
    setSelectedMatch(null);
  };

  if (isLoading && jobs.length === 0) return <LoadingSpinner />;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Job Descriptions</h1>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary"
        >
          {showAddForm ? 'Cancel' : '+ Add Job Description'}
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Add Job Form */}
      {showAddForm && (
        <div className="mb-8">
          <JobDescriptionForm
            onSuccess={handleAddJobSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Search */}
      <div className="card mb-8">
        <input
          type="text"
          placeholder="Search jobs by title or company..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="input-base"
        />
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">No jobs found</p>
          <p className="text-gray-400 mt-2">Add your first job description to get started</p>
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {jobs.map((job) => (
            <div key={job.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-1">{job.title}</h2>
                  <p className="text-gray-600 mb-2">{job.company}</p>
                  {job.location && (
                    <p className="text-sm text-gray-500 mb-2">📍 {job.location}</p>
                  )}
                </div>
                {job.experience_level && (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ml-4">
                    {job.experience_level.charAt(0).toUpperCase() + job.experience_level.slice(1)}
                  </span>
                )}
              </div>

              <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>

              {/* Skills Badge */}
              {job.extracted_skills && job.extracted_skills.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-600 mb-2">Required Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {job.extracted_skills.slice(0, 5).map((skill, idx) => (
                      <span
                        key={idx}
                        className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs"
                      >
                        {skill.name}
                      </span>
                    ))}
                    {job.extracted_skills.length > 5 && (
                      <span className="text-gray-600 text-xs px-2 py-1">
                        +{job.extracted_skills.length - 5} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <button className="btn-outline text-sm flex-1">View Details</button>
                {resumes.length > 0 ? (
                  <div className="flex-1">
                    {resumes.length === 1 ? (
                      <button
                        onClick={() => openMatchModal(job)}
                        className="btn-primary text-sm w-full"
                      >
                        Match with Resume
                      </button>
                    ) : (
                      <select
                        onChange={(e) => {
                          const resumeId = parseInt(e.target.value);
                          const resume = resumes.find(r => r.id === resumeId);
                          setSelectedJob(job);
                          setSelectedResume(resume);
                          e.target.value = '';
                        }}
                        className="input-base text-sm w-full"
                      >
                        <option value="">Select Resume to Match...</option>
                        {resumes.map((resume) => (
                          <option key={resume.id} value={resume.id}>
                            {resume.filename}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ) : (
                  <button
                    disabled
                    className="btn-outline text-sm flex-1 opacity-50 cursor-not-allowed"
                  >
                    No Resumes
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-8">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="btn-outline disabled:opacity-50"
          >
            Previous
          </button>
          <span className="py-2 px-4">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="btn-outline disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Matching Results Modal */}
      {selectedJob && selectedResume && (
        <JobMatchingResults
          job={selectedJob}
          resume={selectedResume}
          onClose={closeMatchModal}
        />
      )}
    </div>
  );
}
