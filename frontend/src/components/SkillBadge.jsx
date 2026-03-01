export function SkillBadge({ name, level, isInDemand = false }) {
  const levelColors = {
    beginner: 'bg-blue-100 text-blue-800',
    intermediate: 'bg-green-100 text-green-800',
    advanced: 'bg-orange-100 text-orange-800',
    expert: 'bg-purple-100 text-purple-800',
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${levelColors[level] || levelColors.intermediate}`}>
      {name}
      {isInDemand && ' ⭐'}
    </span>
  );
}
