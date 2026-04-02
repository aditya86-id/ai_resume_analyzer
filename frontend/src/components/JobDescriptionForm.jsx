import { useState } from 'react';
import { jobsAPI } from '../api';
import { Alert } from './Alert';
import { LoadingSpinner } from './Loading';

export function JobDescriptionForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    salary_min: '',
    salary_max: '',
    description: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      setError('Title and description are required');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Call the analyze endpoint
      const result = await jobsAPI.analyze(formData);
      setAnalysisResult(result.analysis);
    } catch (err) {
      setError(err.message || 'Failed to analyze job description');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      setError('Title and description are required');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // Create the job description
      const job = await jobsAPI.create(formData);
      
      if (onSuccess) {
        onSuccess(job);
      }

      // Reset form
      setFormData({
        title: '',
        company: '',
        location: '',
        salary_min: '',
        salary_max: '',
        description: '',
      });
      setAnalysisResult(null);
    } catch (err) {
      setError(err.message || 'Failed to create job description');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !analysisResult) {
    return <LoadingSpinner />;
  }

  return (
    <div className="card max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Add Job Description</h2>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title and Company Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Job Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Senior Software Engineer"
              className="input-base"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Company</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g., Tech Corp"
              className="input-base"
            />
          </div>
        </div>

        {/* Location Row */}
        <div>
          <label className="block text-sm font-medium mb-2">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g., San Francisco, CA or Remote"
            className="input-base"
          />
        </div>

        {/* Salary Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Minimum Salary</label>
            <input
              type="number"
              name="salary_min"
              value={formData.salary_min}
              onChange={handleChange}
              placeholder="e.g., 100000"
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Maximum Salary</label>
            <input
              type="number"
              name="salary_max"
              value={formData.salary_max}
              onChange={handleChange}
              placeholder="e.g., 150000"
              className="input-base"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Job Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Paste the complete job description here..."
            rows="10"
            className="input-base font-mono text-sm"
            required
          />
        </div>

        {/* Analysis Result */}
        {analysisResult && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-bold text-blue-900 mb-3">NLP Analysis Results</h3>
            
            {/* Experience Level */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700">Experience Level:</p>
              <p className="text-lg font-bold text-blue-600 capitalize">
                {analysisResult.experience_level}
              </p>
            </div>

            {/* Extracted Skills */}
            {analysisResult.extracted_skills && analysisResult.extracted_skills.length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Extracted Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.extracted_skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                      title={`Confidence: ${skill.confidence}%`}
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Skill Categories */}
            {analysisResult.skill_categories && Object.keys(analysisResult.skill_categories).length > 0 && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Skill Categories:</p>
                <div className="space-y-2">
                  {Object.entries(analysisResult.skill_categories).map(([category, skills]) => (
                    <div key={category}>
                      <p className="text-xs font-semibold text-gray-600 uppercase">{category}:</p>
                      <p className="text-sm text-gray-700">{skills.join(', ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements Summary */}
            {analysisResult.requirements_summary && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Requirements Summary:</p>
                <p className="text-sm text-gray-700">{analysisResult.requirements_summary}</p>
              </div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isLoading}
            className="btn-outline flex-1 disabled:opacity-50"
          >
            {isLoading ? 'Analyzing...' : 'Analyze with NLP'}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Add Job Description'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn-outline flex-1"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
