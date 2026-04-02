import { useState } from 'react';

export function JobMatchCard({ match }) {
  const [expanded, setExpanded] = useState(false);

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-blue-500 to-cyan-600';
    if (score >= 40) return 'from-yellow-500 to-amber-600';
    return 'from-red-500 to-orange-600';
  };

  const getQualityBadge = (quality) => {
    const badges = {
      excellent: 'bg-green-100 text-green-800 border-green-300',
      good: 'bg-blue-100 text-blue-800 border-blue-300',
      fair: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      poor: 'bg-red-100 text-red-800 border-red-300',
    };
    return badges[quality] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900">{match.job_title}</h3>
            <p className="text-sm text-gray-600">{match.company}</p>
            <p className="text-xs text-gray-500 mt-1">From: {match.resume_name}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {/* Score Circle */}
            <div className={`bg-gradient-to-br ${getScoreColor(match.match_score)} rounded-full w-16 h-16 flex items-center justify-center`}>
              <div className="text-center">
                <div className="text-xl font-bold text-white">{match.match_score}%</div>
                <div className="text-xs text-white opacity-90">Match</div>
              </div>
            </div>
            {/* Quality Badge */}
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getQualityBadge(match.match_quality)} capitalize`}>
              {match.match_quality}
            </span>
          </div>
        </div>
      </div>

      {/* Skills Summary */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{match.matched_skills_count}</p>
            <p className="text-xs text-gray-600">Matched</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">{match.missing_skills_count}</p>
            <p className="text-xs text-gray-600">Missing</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {Math.round((match.matched_skills_count / (match.matched_skills_count + match.missing_skills_count)) * 100) || 0}%
            </p>
            <p className="text-xs text-gray-600">Coverage</p>
          </div>
        </div>
      </div>

      {/* Expandable Details */}
      {match.missing_skills && match.missing_skills.length > 0 && (
        <div className="px-4 py-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 w-full"
          >
            <span>{expanded ? '▼' : '▶'}</span>
            <span>Skills to Develop ({match.missing_skills_count} total)</span>
          </button>
          
          {expanded && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {match.missing_skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-block bg-red-50 text-red-700 text-xs px-2 py-1 rounded border border-red-200"
                  >
                    {skill}
                  </span>
                ))}
                {match.missing_skills_count > 3 && (
                  <span className="inline-block text-xs text-gray-600 px-2 py-1">
                    +{match.missing_skills_count - 3} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
