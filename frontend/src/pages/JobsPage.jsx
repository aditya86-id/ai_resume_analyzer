import { useState, useEffect } from 'react';
import { jobsAPI } from '../api';
import { LoadingSpinner } from '../components/Loading';
import { Alert } from '../components/Alert';

export function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadJobs();
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

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Job Descriptions</h1>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Search */}
      <div className="card mb-8">
        <input
          type="text"
          placeholder="Search jobs..."
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
        </div>
      ) : (
        <div className="space-y-4 mb-8">
          {jobs.map((job) => (
            <div key={job.id} className="card">
              <h2 className="text-xl font-bold mb-2">{job.title}</h2>
              <p className="text-gray-600 mb-4">{job.company}</p>
              <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>
              <div className="flex gap-3">
                <button className="btn-outline text-sm">View Details</button>
                <button className="btn-primary text-sm">Match with Resume</button>
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
    </div>
  );
}
