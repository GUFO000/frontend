import React from 'react';

const ScoreDisplay = ({ score, color = "blue" }) => {
  // Convert score to percentage (0-100)
  // Since scores are on a 0-10 scale, multiply by 10
  const percentage = Math.min(Math.max((score || 0) * 10, 0), 100);
  
  return (
    <div className="flex items-center">
      <span className="font-medium mr-2">{score?.toFixed(1)}</span>
      <div className="w-16 bg-gray-200 rounded-full h-1.5">
        <div 
          className={`bg-${color}-600 h-1.5 rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ScoreDisplay;