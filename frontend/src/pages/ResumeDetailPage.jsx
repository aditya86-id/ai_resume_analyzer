import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { resumeAPI } from '../api';
import { LoadingSpinner } from '../components/Loading';
import { Alert } from '../components/Alert';
import { ScoreCard } from '../components/ScoreCard';
import { SkillBadge } from '../components/SkillBadge';
import { formatDate } from '../utils/helpers';

export function ResumeDetailPage() {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [skills, setSkills] = useState([]);
  const [matching, setMatching] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('analysis');

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const resumeData = await resumeAPI.getById(id);
      setResume(resumeData);

      try {
        const analysisData = await resumeAPI.getAnalysis(id);
        setAnalysis(analysisData);
      } catch {
        // Analysis might not exist yet
      }

      try {
        const skillsData = await resumeAPI.getSkills(id);
        setSkills(skillsData.results || skillsData);
      } catch {
        // Skills might not exist yet
      }

      try {
        const matchingData = await resumeAPI.getMatching(id);
        setMatching(matchingData);
      } catch {
        // Matching might not exist yet
      }

      setError('');
    } catch (err) {
      setError('Failed to load resume details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!resume) return <Alert type="error" message="Resume not found" />;

  return (
    <div className="container py-8">
      <Link to="/resumes" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
        ← Back to Resumes
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{resume.filename}</h1>
        <p className="text-gray-600">
          Uploaded: {formatDate(resume.uploaded_at)}
        </p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Tabs */}
      <div className="mb-8 flex gap-4 border-b border-gray-200">
        {['analysis', 'skills', 'matching'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Analysis Tab */}
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          {analysis ? (
            <>
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
                  <h2 className="text-lg font-semibold text-blue-900 mb-2">Resume Quality Summary</h2>
                  <p className="text-blue-800">{analysis.resume_quality_summary}</p>
                </div>
              )}

              {/* Career Stage & Industry Match */}
              {(analysis.career_stage || analysis.industry_match) && (
                <div className="grid grid-cols-2 gap-4">
                  {analysis.career_stage && (
                    <div className="card">
                      <p className="text-sm text-gray-600">Career Stage</p>
                      <p className="text-lg font-semibold text-primary-600">{analysis.career_stage.charAt(0).toUpperCase() + analysis.career_stage.slice(1).replace('-', ' ')}</p>
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

              {/* AI Suggestions (NEW) */}
              {analysis.ai_suggestions && analysis.ai_suggestions.length > 0 && (
                <div className="card border-l-4 border-orange-500">
                  <h2 className="text-xl font-bold mb-4 text-orange-900">AI-Powered Suggestions</h2>
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
                            <span className="text-sm font-semibold text-gray-700">{suggestion.category || suggestion.area}</span>
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

              {/* Standard Feedback */}
              <div className="card">
                <h2 className="text-xl font-bold mb-4">Feedback</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{analysis.feedback}</p>
              </div>

              {/* Basic Suggestions */}
              {analysis.suggestions && analysis.suggestions.length > 0 && (
                <div className="card">
                  <h2 className="text-xl font-bold mb-4">Additional Tips</h2>
                  <ul className="space-y-2">
                    {analysis.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="text-primary-600">💡</span>
                        <span className="text-gray-700">{suggestion}</span>
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
                      <p className="text-3xl font-bold text-purple-600">{analysis.ats_analysis.ats_friendliness_score || 0}/100</p>
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
                        {(analysis.ats_analysis.parsing_risk || 'unknown').charAt(0).toUpperCase() + (analysis.ats_analysis.parsing_risk || 'unknown').slice(1)}
                      </p>
                    </div>
                  </div>
                  {analysis.ats_analysis.issues && analysis.ats_analysis.issues.length > 0 && (
                    <div className="mb-3">
                      <p className="font-semibold text-gray-700 mb-2">Issues Found:</p>
                      <ul className="space-y-1">
                        {analysis.ats_analysis.issues.map((issue, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex gap-2">
                            <span className="text-red-500">⚠️</span> {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
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

              {/* Pattern Issues */}
              {analysis.pattern_issues && Object.keys(analysis.pattern_issues).length > 0 && (
                <div className="card">
                  <h2 className="text-xl font-bold mb-4">Pattern Analysis</h2>
                  {analysis.pattern_issues.formatting_issues && analysis.pattern_issues.formatting_issues.length > 0 && (
                    <div className="mb-4">
                      <p className="font-semibold text-gray-700 mb-2">Formatting Issues:</p>
                      <ul className="space-y-1">
                        {analysis.pattern_issues.formatting_issues.map((issue, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex gap-2">
                            <span>•</span>{issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.pattern_issues.content_issues && analysis.pattern_issues.content_issues.length > 0 && (
                    <div className="mb-4">
                      <p className="font-semibold text-gray-700 mb-2">Content Issues:</p>
                      <ul className="space-y-1">
                        {analysis.pattern_issues.content_issues.map((issue, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex gap-2">
                            <span>•</span>{issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.pattern_issues.keyword_issues && analysis.pattern_issues.keyword_issues.length > 0 && (
                    <div className="mb-4">
                      <p className="font-semibold text-gray-700 mb-2">Keyword Issues:</p>
                      <ul className="space-y-1">
                        {analysis.pattern_issues.keyword_issues.map((issue, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex gap-2">
                            <span>•</span>{issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {analysis.pattern_issues.structure_issues && analysis.pattern_issues.structure_issues.length > 0 && (
                    <div>
                      <p className="font-semibold text-gray-700 mb-2">Structure Issues:</p>
                      <ul className="space-y-1">
                        {analysis.pattern_issues.structure_issues.map((issue, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex gap-2">
                            <span>•</span>{issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="card text-center py-12">
              <p className="text-gray-500">No analysis yet. Upload the resume to analyze it.</p>
            </div>
          )}
        </div>
      )}

      {/* Skills Tab */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          {skills.length > 0 ? (
            <div className="card">
              <h2 className="text-xl font-bold mb-4">Extracted Skills</h2>
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, idx) => (
                  <SkillBadge
                    key={idx}
                    name={skill.name}
                    level={skill.level}
                    isInDemand={skill.is_in_demand}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-gray-500">No skills extracted yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Matching Tab */}
      {activeTab === 'matching' && (
        <div className="space-y-6">
          {matching && matching.results && matching.results.length > 0 ? (
            <div className="space-y-4">
              {matching.results.map((match) => (
                <div key={match.id} className="card">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold">{match.job_title}</h3>
                      <p className="text-gray-600">{match.company}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-600">{match.match_score}%</p>
                      <p className="text-sm text-gray-600">Match Score</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <p className="text-gray-500">No matching jobs found.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
