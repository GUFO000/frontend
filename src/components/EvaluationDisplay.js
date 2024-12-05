import React from 'react';
import ScoreDisplay from './ScoreDisplay';

const EvaluationDisplay = ({ evaluation }) => {
  if (!evaluation) return null;

  const getScoreLabel = (score) => {
    if (score >= 9) return 'Perfect';
    if (score >= 7) return 'Really Good';
    if (score >= 5) return 'Good';
    if (score >= 3) return 'Not Great';
    return 'Really Poor';
  };

  const renderScoreSection = (title, data) => {
    if (!data) return null;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">{title}</h3>
        <div className="space-y-4">
          {Object.entries(data).map(([key, value]) => {
            // Skip the total score entry as it's displayed differently
            if (key.includes('total')) return null;

            return (
              <div key={key} className="border-b pb-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium capitalize">
                    {key.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center">
                    <ScoreDisplay score={value.score} color="blue" />
                    <span className="ml-2 text-sm text-gray-600">
                      {getScoreLabel(value.score)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{value.feedback}</p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">Overall Score</h3>
        <div className="flex items-center">
          <ScoreDisplay score={evaluation.overall_score} color="purple" />
          <span className="ml-2">
            {getScoreLabel(evaluation.overall_score)}
          </span>
        </div>
      </div>

      {/* Ambitiousness Section */}
      {renderScoreSection('Ambitiousness', evaluation.ambitiousness_evaluation)}

      {/* Implementation Section */}
      {renderScoreSection('Implementation', evaluation.implementation_evaluation)}

      {/* Delivery Section */}
      {renderScoreSection('Delivery', evaluation.delivery_evaluation)}

      {/* Transcript Section */}
      {evaluation.transcript && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Transcript</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm whitespace-pre-wrap">{evaluation.transcript}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationDisplay;