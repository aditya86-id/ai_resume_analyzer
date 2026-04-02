import { useState, useEffect } from 'react';
import { dashboardAPI } from '../api';
import { LoadingSpinner } from '../components/Loading';
import { Alert } from '../components/Alert';
import { ScoreCard } from '../components/ScoreCard';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { JobMatchCard } from '../components/JobMatchCard';
import { SkillsChart } from '../components/SkillsChart';
import { ImprovementCard } from '../components/ImprovementCard';

export function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const statsData = await dashboardAPI.getStats();
      setStats(statsData);
      setError('');
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          🔄 Refresh
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Key Stats - Top Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <ScoreCard
            label="Total Resumes"
            score={stats.total_resumes || 0}
            icon="📄"
          />
          <ScoreCard
            label="Analyzed"
            score={stats.analyzed_resumes || 0}
            icon="✅"
          />
          <ScoreCard
            label="Job Matches"
            score={stats.top_matches?.length || 0}
            icon="🔗"
          />
          <ScoreCard
            label="Match Rate"
            score={Math.round(stats.match_success_rate || 0)}
            icon="📊"
            suffix="%"
          />
        </div>
      )}

      {/* Score Breakdown */}
      {stats?.score_breakdown && (
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-6">Resume Scores by Category</h2>
          <ScoreBreakdown scores={stats.score_breakdown} />
        </div>
      )}

      {/* Top Job Matches */}
      {stats?.top_matches && stats.top_matches.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-6">🎯 Top Job Matches</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.top_matches.map((match) => (
              <JobMatchCard key={match.id} match={match} />
            ))}
          </div>
          {stats.top_matches.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No job matches yet. Upload a resume to find matching opportunities!
            </p>
          )}
        </div>
      )}

      {/* Skills Distribution */}
      {stats?.top_skills && stats.top_skills.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-6">📊 Top Skills</h2>
          <SkillsChart skills={stats.top_skills} />
        </div>
      )}

      {/* Improvement Opportunities */}
      {stats?.improvement_opportunities && stats.improvement_opportunities.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-6">🚀 Improvement Opportunities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.improvement_opportunities.map((opportunity, idx) => (
              <ImprovementCard key={idx} opportunity={opportunity} />
            ))}
          </div>
        </div>
      )}

      {/* Career Insights */}
      {stats?.career_insights && (
        <div className="card mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200">
          <h2 className="text-2xl font-bold mb-4">🎓 Career Profile</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-lg border border-blue-100">
              <p className="text-gray-600 text-sm font-medium">Career Stage</p>
              <p className="text-xl font-bold text-blue-600 mt-1 capitalize">
                {stats.career_insights.career_stage || 'Not Determined'}
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-blue-100">
              <p className="text-gray-600 text-sm font-medium">Industry Match</p>
              <p className="text-xl font-bold text-green-600 mt-1">
                {stats.career_insights.industry_match ? '✓ Strong' : '○ Developing'}
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-blue-100">
              <p className="text-gray-600 text-sm font-medium">Key Strengths</p>
              <p className="text-lg font-bold text-purple-600 mt-1">
                {stats.career_insights.strengths?.length || 0}
              </p>
            </div>
            <div className="p-4 bg-white rounded-lg border border-blue-100">
              <p className="text-gray-600 text-sm font-medium">Skills Count</p>
              <p className="text-lg font-bold text-orange-600 mt-1">
                {stats.career_insights.skill_count || 0}
              </p>
            </div>
          </div>
          {stats.career_insights.strengths && stats.career_insights.strengths.length > 0 && (
            <div className="mt-4 p-4 bg-white rounded-lg border border-blue-100">
              <p className="text-sm font-medium text-gray-700 mb-2">Your Strengths:</p>
              <div className="flex flex-wrap gap-2">
                {stats.career_insights.strengths.map((strength, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                  >
                    ✓ {strength}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* In-Demand Skills */}
      {stats?.in_demand_skills && stats.in_demand_skills.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4">⭐ In-Demand Skills</h2>
          <div className="flex flex-wrap gap-3">
            {stats.in_demand_skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-gradient-to-r from-primary-100 to-blue-100 text-primary-800 rounded-full font-medium hover:shadow-md transition"
              >
                {skill.name || skill}
              </span>
            ))}
          </div>
        </div>
      )}


    </div>
  );
}
