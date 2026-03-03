import { useState, useEffect } from 'react';
import { resumeAPI } from '../api';
import { LoadingSpinner } from '../components/Loading';
import { Alert } from '../components/Alert';
import { ScoreCard } from '../components/ScoreCard';
import { formatDate } from '../utils/helpers';

export function SuggestionsPage() {
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      setIsLoading(true);
      const data = await resumeAPI.list();
      setResumes(data.results || data);
    } catch (err) {
      setError('Failed to load resumes');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetSuggestions = async (resumeId) => {
    try {
      setIsAnalyzing(true);
      setError('');
      
      // Trigger analysis
      await resumeAPI.analyze({ resume_id: resumeId });
      
      // Fetch the analysis
      const analysisData = await resumeAPI.getAnalysis(resumeId);
      setAnalysis(analysisData);
      setSelectedResume(resumes.find(r => r.id === resumeId));
    } catch (err) {
      setError(err.message || 'Failed to analyze resume');
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">✨ AI-Powered Resume Suggestions</h1>

      {error && <Alert type="error" message={error} />}

      {!analysis ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Select a Resume</h2>
            {resumes.length === 0 ? (
              <div className="card bg-blue-50 text-center py-12">
                <p className="text-gray-600 mb-4">No resumes uploaded yet.</p>
                <a href="/resumes" className="btn-primary">
                  Upload a Resume
                </a>
              </div>
            ) : (
              <div className="space-y-3">
                {resumes.map((resume) => (
                  <button
                    key={resume.id}
                    onClick={() => handleGetSuggestions(resume.id)}
                    disabled={isAnalyzing}
                    className={`w-full text-left p-4 rounded border-2 transition-all ${
                      isAnalyzing
                        ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                        : 'bg-white border-gray-200 hover:border-primary-500 hover:bg-primary-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{resume.filename}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(resume.uploaded_at)}
                        </p>
                        {resume.analysis && (
                          <p className="text-sm text-primary-600 mt-1">
                            📊 Score: {resume.analysis.overall_score}/100
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGetSuggestions(resume.id);
                        }}
                        disabled={isAnalyzing}
                        className="btn-primary text-sm px-3 py-1"
                      >
                        {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="card bg-blue-50 h-full flex items-center justify-center text-center">
              <div>
                <p className="text-5xl mb-4">✨</p>
                <p className="text-xl font-semibold text-gray-700 mb-2">
                  Get AI Suggestions
                </p>
                <p className="text-gray-600">
                  Select a resume to receive personalized AI-powered suggestions for improvement.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{selectedResume.filename}</h2>
              <p className="text-gray-500">{formatDate(selectedResume.uploaded_at)}</p>
            </div>
            <button
              onClick={() => setAnalysis(null)}
              className="btn-outline"
            >
              ← Back to Resumes
            </button>
          </div>

          {/* Score Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <ScoreCard label="Overall Score" score={analysis.overall_score} />
            <ScoreCard label="Format" score={analysis.format_score} />
            <ScoreCard label="Keywords" score={analysis.keywords_score} />
            <ScoreCard label="Experience" score={analysis.experience_score} />
            <ScoreCard label="Education" score={analysis.education_score} />
            <ScoreCard label="Impact" score={analysis.impact_score} />
          </div>

          {/* Resume Quality Summary */}
          {analysis.resume_quality_summary && (
            <div className="card bg-blue-50 border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Resume Quality Summary</h3>
              <p className="text-blue-800">{analysis.resume_quality_summary}</p>
            </div>
          )}

          {/* Career Stage & Industry Match */}
          {(analysis.career_stage || analysis.industry_match) && (
            <div className="grid grid-cols-2 gap-4">
              {analysis.career_stage && (
                <div className="card">
                  <p className="text-sm text-gray-600">Career Stage</p>
                  <p className="text-lg font-semibold text-primary-600">
                    {analysis.career_stage.charAt(0).toUpperCase() + analysis.career_stage.slice(1).replace('-', ' ')}
                  </p>
                </div>
              )}
              {analysis.industry_match && (
                <div className="card">
                  <p className="text-sm text-gray-600">Industry Match</p>
                  <p className="text-lg font-semibold text-primary-600">{analysis.industry_match}</p>
                </div>
              )}
            </div>
          )}

          {/* AI Suggestions - MAIN FEATURE */}
          {analysis.ai_suggestions && analysis.ai_suggestions.length > 0 && (
            <div className="card border-l-4 border-orange-500 bg-orange-50">
              <h2 className="text-2xl font-bold mb-4 text-orange-900">✨ AI Suggestions for Improvement</h2>
              <div className="space-y-4">
                {analysis.ai_suggestions.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded border-l-4 ${
                      suggestion.priority === 'High'
                        ? 'bg-red-50 border-red-500'
                        : suggestion.priority === 'Medium'
                        ? 'bg-yellow-50 border-yellow-500'
                        : 'bg-blue-50 border-blue-500'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex gap-2 items-center">
                        <span className={`px-3 py-1 rounded text-sm font-semibold text-white ${
                          suggestion.priority === 'High'
                            ? 'bg-red-600'
                            : suggestion.priority === 'Medium'
                            ? 'bg-yellow-600'
                            : 'bg-blue-600'
                        }`}>
                          {suggestion.priority} Priority
                        </span>
                        <span className="text-sm font-semibold text-gray-700">
                          {suggestion.category || suggestion.area}
                        </span>
                      </div>
                    </div>
                    <p className="font-semibold text-gray-800 mb-2">{suggestion.suggestion}</p>
                    {suggestion.action && (
                      <p className="text-sm text-gray-600 italic">
                        💡 <strong>Action:</strong> {suggestion.action}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths */}
          {analysis.strengths && analysis.strengths.length > 0 && (
            <div className="card bg-green-50">
              <h2 className="text-xl font-bold mb-4 text-green-900">Your Strengths</h2>
              <ul className="space-y-2">
                {analysis.strengths.map((strength, idx) => (
                  <li key={idx} className="flex gap-3">
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ATS Analysis */}
          {analysis.ats_analysis && (
            <div className="card border-l-4 border-purple-500">
              <h2 className="text-xl font-bold mb-4 text-purple-900">ATS Compatibility</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-4 bg-purple-50 rounded">
                  <p className="text-sm text-gray-600">ATS Friendliness Score</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {analysis.ats_analysis.ats_friendliness_score || 0}/100
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded">
                  <p className="text-sm text-gray-600">Parsing Risk</p>
                  <p className={`text-lg font-bold ${
                    analysis.ats_analysis.parsing_risk === 'low'
                      ? 'text-green-600'
                      : analysis.ats_analysis.parsing_risk === 'medium'
                      ? 'text-yellow-600'
                      : 'text-red-600'
                  }`}>
                    {(analysis.ats_analysis.parsing_risk || 'unknown').charAt(0).toUpperCase() + 
                     (analysis.ats_analysis.parsing_risk || 'unknown').slice(1)}
                  </p>
                </div>
              </div>
              {analysis.ats_recommendations && analysis.ats_recommendations.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-700 mb-2">Recommendations:</p>
                  <ul className="space-y-1">
                    {analysis.ats_recommendations.map((rec, idx) => (
                      <li key={idx} className="text-sm text-gray-600">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Standard Feedback */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Feedback</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{analysis.feedback}</p>
          </div>
        </div>
      )}
    </div>
  );
}
