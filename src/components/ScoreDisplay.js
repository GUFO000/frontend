const ScoreDisplay = ({ score, color }) => {
  // Add console.log to debug the incoming props
  console.log('ScoreDisplay props:', { score, color });

  const getColorClass = (score, color) => {
    // Use the passed color prop or default to a score-based color
    switch (color) {
      case 'yellow':
        return 'bg-yellow-500';
      case 'blue':
        return 'bg-blue-500';
      case 'green':
        return 'bg-green-500';
      case 'purple':
        return 'bg-purple-500';
      default:
        // Fallback to score-based coloring
        if (score >= 9) return 'bg-green-500';
        if (score >= 7) return 'bg-blue-500';
        if (score >= 5) return 'bg-yellow-500';
        if (score >= 3) return 'bg-orange-500';
        return 'bg-red-500';
    }
  };

  const getScoreLabel = (score) => {
    if (score >= 9) return 'Perfect';
    if (score >= 7) return 'Really Good';
    if (score >= 5) return 'Good';
    if (score >= 3) return 'Not Great';
    return 'Really Poor';
  };

  // Add null check for score
  if (score === undefined || score === null) {
    return '-';
  }

  return (
    <div className="flex items-center group relative">
      <span className="mr-2">{Number(score).toFixed(1)}</span>
      <div className="w-24 h-2 bg-gray-200 rounded-full">
        <div
          className={`h-full rounded-full ${getColorClass(score, color)}`}
          style={{ width: `${(score / 10) * 100}%` }}
        />
      </div>
      {/* Tooltip */}
      <span className="invisible group-hover:visible absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded">
        {getScoreLabel(score)}
      </span>
    </div>
  );
};

export default ScoreDisplay; 