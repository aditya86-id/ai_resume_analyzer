import { useState } from 'react';
import { jobsAPI } from '../api';
import { Alert } from './Alert';

export function JobMatchingResults({ job, resume, onClose }) {
  const [matching, setMatching] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch matching results on component mount
  useState(() => {
    loadMatching();
  }, []);

  const loadMatching = async () => {
    try {
      setIsLoading(true);
      setError('');

      // Call the match endpoint
      const result = await jobsAPI.matchResume(job.id, { resume_id: resume.id });
      setMatching(result);
    } catch (err) {
      setError(err.message || 'Failed to calculate matching');
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-blue-600 bg-blue-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getQualityBadge = (quality) => {
    const badges = {
      excellent: 'bg-green-100 text-green-800',
      good: 'bg-blue-100 text-blue-800',
      fair: 'bg-yellow-100 text-yellow-800',
      poor: 'bg-red-100 text-red-800',
    };
    return badges[quality] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <p className="text-center">Calculating match...</p>
        </div>
      </div>
    );
  }

  if (!matching) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 my-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Resume-Job Match Analysis</h2>
            <p className="text-gray-600">{job.title} at {job.company}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Overall Match Score */}
        <div className="mb-8">
          <div className={`rounded-lg p-6 ${getScoreColor(matching.match_score)}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-75">Overall Match Score</p>
                <p className="text-4xl font-bold">{Math.round(matching.match_score)}%</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold capitalize">{matching.match_quality} Match</p>
                <p className="text-sm opacity-75">Based on skills analysis</p>
              </div>
            </div>
          </div>
        </div>

        {/* Match Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium mb-2">Matched Skills</p>
            <p className="text-3xl font-bold text-green-600">{matching.matched_skills.length}</p>
            {matching.matched_skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {matching.matched_skills.slice(0, 3).map((skill, idx) => (
                  <span key={idx} className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                    {skill.skill || skill}
                  </span>
                ))}
                {matching.matched_skills.length > 3 && (
                  <span className="text-green-600 text-xs px-2 py-1">
                    +{matching.matched_skills.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 font-medium mb-2">Partial Matches</p>
            <p className="text-3xl font-bold text-yellow-600">
              {matching.partial_matches ? matching.partial_matches.length : 0}
            </p>
            {matching.partial_matches && matching.partial_matches.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {matching.partial_matches.slice(0, 3).map((skill, idx) => (
                  <span key={idx} className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded">
                    {skill.skill || skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium mb-2">Missing Skills</p>
            <p className="text-3xl font-bold text-red-600">{matching.missing_skills.length}</p>
            {matching.missing_skills.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {matching.missing_skills.slice(0, 3).map((skill, idx) => (
                  <span key={idx} className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
                    {skill}
                  </span>
                ))}
                {matching.missing_skills.length > 3 && (
                  <span className="text-red-600 text-xs px-2 py-1">
                    +{matching.missing_skills.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Job Requirements Summary */}
        {matching.job_analysis && matching.job_analysis.requirements_summary && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-900 mb-2">Key Requirements</h3>
            <p className="text-sm text-blue-800">{matching.job_analysis.requirements_summary}</p>
          </div>
        )}

        {/* Recommendations */}
        {matching.recommendations && matching.recommendations.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3">Recommendations</h3>
            <ul className="space-y-2">
              {matching.recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* All Missing Skills */}
        {matching.missing_skills.length > 0 && (
          <div className="mb-6">
            <h3 className="font-bold text-lg mb-3">Skills to Consider Learning</h3>
            <div className="flex flex-wrap gap-2">
              {matching.missing_skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            onClick={onClose}
            className="btn-outline flex-1"
          >
            Close
          </button>
          <button
            onClick={() => window.open(`/jobs/${job.id}`, '_blank')}
            className="btn-primary flex-1"
          >
            View Full Job Details
          </button>
        </div>
      </div>
    </div>
  );
}
