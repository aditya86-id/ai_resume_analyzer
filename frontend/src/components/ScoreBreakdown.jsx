export function ScoreBreakdown({ scores = {} }) {
  const categories = [
    { name: 'Format', key: 'format', icon: '🎨', color: 'from-purple-400 to-purple-600' },
    { name: 'Keywords', key: 'keywords', icon: '🔑', color: 'from-blue-400 to-blue-600' },
    { name: 'Experience', key: 'experience', icon: '💼', color: 'from-green-400 to-green-600' },
    { name: 'Education', key: 'education', icon: '🎓', color: 'from-yellow-400 to-yellow-600' },
    { name: 'Impact', key: 'impact', icon: '⭐', color: 'from-red-400 to-red-600' },
  ];

  const getScoreStatus = (score) => {
    if (score >= 80) return { status: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 70) return { status: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (score >= 60) return { status: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { status: 'Needs Work', color: 'text-red-600', bg: 'bg-red-50' };
  };

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const score = scores[category.key] || 0;
        const status = getScoreStatus(score);

        return (
          <div key={category.key} className={`${status.bg} border border-gray-200 rounded-lg p-4`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{category.icon}</span>
                <span className="font-medium text-gray-900">{category.name}</span>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${status.color}`}>{score}%</div>
                <div className="text-xs text-gray-600">{status.status}</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-300 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${category.color} transition-all duration-300`}
                style={{ width: `${score}%` }}
              />
            </div>

            {/* Improvement Tips */}
            {score < 70 && (
              <div className="mt-2 text-xs text-gray-700">
                💡 Tip: Focus on improving your {category.name.toLowerCase()} score
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
