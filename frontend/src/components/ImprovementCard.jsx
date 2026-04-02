export function ImprovementCard({ opportunity }) {
  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high':
        return 'from-red-100 to-orange-100 border-red-300';
      case 'medium':
        return 'from-yellow-100 to-amber-100 border-yellow-300';
      case 'low':
        return 'from-blue-100 to-cyan-100 border-blue-300';
      default:
        return 'from-gray-100 to-gray-200 border-gray-300';
    }
  };

  const getImpactBadge = (impact) => {
    switch (impact) {
      case 'high':
        return 'bg-red-200 text-red-800';
      case 'medium':
        return 'bg-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-blue-200 text-blue-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  const getIcon = (title) => {
    if (title.includes('Format')) return '🎨';
    if (title.includes('Keyword')) return '🔑';
    if (title.includes('Achieve') || title.includes('Quantif')) return '📊';
    if (title.includes('Technical') || title.includes('Skill')) return '⚙️';
    if (title.includes('Summary')) return '📋';
    return '✨';
  };

  return (
    <div className={`bg-gradient-to-br ${getImpactColor(opportunity.impact)} border rounded-lg p-4 hover:shadow-md transition-shadow`}>
      <div className="flex items-start gap-3">
        <span className="text-2xl">{getIcon(opportunity.title)}</span>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-bold text-gray-900">{opportunity.title}</h4>
            <span className={`text-xs font-medium px-2 py-1 rounded ${getImpactBadge(opportunity.impact)} capitalize`}>
              {opportunity.impact} Impact
            </span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">
            {opportunity.description}
          </p>
          <div className="mt-3 text-xs">
            <button className="text-blue-600 hover:text-blue-700 font-medium">
              Learn More →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
