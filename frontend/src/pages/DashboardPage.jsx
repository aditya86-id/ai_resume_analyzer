import { useState, useEffect } from 'react';
import { dashboardAPI, auditAPI } from '../api';
import { LoadingSpinner } from '../components/Loading';
import { Alert } from '../components/Alert';
import { ScoreCard } from '../components/ScoreCard';
import { formatDate } from '../utils/helpers';

export function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
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

      const logsData = await auditAPI.list();
      setAuditLogs(logsData.results || logsData);

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
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <ScoreCard
            label="Total Resumes"
            score={stats.total_resumes || 0}
            icon="📄"
          />
          <ScoreCard
            label="Avg ATS Score"
            score={Math.round(stats.average_ats_score || 0)}
            icon="⭐"
          />
          <ScoreCard
            label="Job Matches"
            score={stats.job_matches || 0}
            icon="🔗"
          />
          <ScoreCard
            label="Top Skills"
            score={stats.top_skills?.length || 0}
            icon="🎯"
          />
        </div>
      )}

      {/* In-Demand Skills */}
      {stats?.in_demand_skills && stats.in_demand_skills.length > 0 && (
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4">In-Demand Skills</h2>
          <div className="flex flex-wrap gap-3">
            {stats.in_demand_skills.map((skill, idx) => (
              <span
                key={idx}
                className="px-4 py-2 bg-gradient-to-r from-primary-100 to-blue-100 text-primary-800 rounded-full font-medium"
              >
                {skill} ⭐
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Audit Logs */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        {auditLogs.length > 0 ? (
          <div className="space-y-3">
            {auditLogs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="p-3 border border-gray-200 rounded-lg text-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{log.action}</p>
                    <p className="text-gray-600">{log.description}</p>
                  </div>
                  <span className="text-gray-500 text-xs">
                    {formatDate(log.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No activity yet</p>
        )}
      </div>
    </div>
  );
}
