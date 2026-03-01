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
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <ScoreCard label="Overall Score" score={analysis.overall_score} />
                <ScoreCard label="Format" score={analysis.format_score} />
                <ScoreCard label="Keywords" score={analysis.keywords_score} />
                <ScoreCard label="Experience" score={analysis.experience_score} />
                <ScoreCard label="Education" score={analysis.education_score} />
                <ScoreCard label="Impact" score={analysis.impact_score} />
              </div>

              <div className="card">
                <h2 className="text-xl font-bold mb-4">Feedback</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{analysis.feedback}</p>
              </div>

              {analysis.suggestions && analysis.suggestions.length > 0 && (
                <div className="card">
                  <h2 className="text-xl font-bold mb-4">Suggestions</h2>
                  <ul className="space-y-2">
                    {analysis.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="text-primary-600">✓</span>
                        <span className="text-gray-700">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
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
