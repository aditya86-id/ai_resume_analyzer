export function SkillsChart({ topSkills = [] }) {
  if (!topSkills || topSkills.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No skills data available</p>
      </div>
    );
  }

  // Find max count for scaling
  const maxCount = Math.max(...topSkills.map(s => s.count), 1);

  // Color palette for skills
  const colors = [
    'from-purple-400 to-purple-600',
    'from-blue-400 to-blue-600',
    'from-cyan-400 to-cyan-600',
    'from-teal-400 to-teal-600',
    'from-green-400 to-green-600',
    'from-yellow-400 to-yellow-600',
    'from-orange-400 to-orange-600',
    'from-red-400 to-red-600',
  ];

  return (
    <div className="space-y-4">
      {topSkills.map((skill, idx) => {
        const percentage = (skill.count / maxCount) * 100;
        const color = colors[idx % colors.length];

        return (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-900">{skill.name}</span>
              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {skill.count} {skill.count === 1 ? 'mention' : 'mentions'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${color} transition-all duration-300`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
