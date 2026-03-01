import { getScoreColor, getScoreBgColor } from '../utils/helpers';

export function ScoreCard({ label, score, icon = '📊' }) {
  return (
    <div className={`card ${getScoreBgColor(score)}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{label}</p>
          <p className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</p>
        </div>
        <span className="text-4xl">{icon}</span>
      </div>
    </div>
  );
}
