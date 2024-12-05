import React from 'react';

const AnalyticsSection = ({ files }) => {
  const calculateAverages = () => {
    if (!files.length) return { overall: 0, ambitiousness: 0, implementation: 0, delivery: 0 };

    const totals = files.reduce((acc, file) => {
      if (file.results) {
        acc.overall += file.results.overall_score || 0;
        acc.ambitiousness += file.results.ambitiousness_evaluation?.total_ambitiousness_score || 0;
        acc.implementation += file.results.implementation_evaluation?.total_implementation_score || 0;
        acc.delivery += file.results.delivery_evaluation?.total_delivery_score || 0;
      }
      return acc;
    }, { overall: 0, ambitiousness: 0, implementation: 0, delivery: 0 });

    return {
      overall: (totals.overall / files.length).toFixed(1),
      ambitiousness: (totals.ambitiousness / files.length).toFixed(1),
      implementation: (totals.implementation / files.length).toFixed(1),
      delivery: (totals.delivery / files.length).toFixed(1)
    };
  };

  const getHighestCategory = (averages) => {
    const categories = [
      { name: 'Ambitiousness', value: parseFloat(averages.ambitiousness) },
      { name: 'Implementation', value: parseFloat(averages.implementation) },
      { name: 'Delivery', value: parseFloat(averages.delivery) }
    ];
    return categories.reduce((max, cat) => cat.value > max.value ? cat : max).name;
  };

  const averages = calculateAverages();

  const timeSeriesData = files.map(file => ({
    name: file.file.name,
    overall: file.results?.overall_score || 0,
    ambitiousness: file.results?.ambitiousness_evaluation?.total_ambitiousness_score || 0,
    implementation: file.results?.implementation_evaluation?.total_implementation_score || 0,
    delivery: file.results?.delivery_evaluation?.total_delivery_score || 0,
  }));

  return (
    <div className="mt-8 bg-white rounded-lg shadow">
      <div className="grid grid-cols-4 gap-4 p-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{files.length}</div>
          <div className="text-sm text-gray-600">Pitches Analyzed</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{averages.overall}</div>
          <div className="text-sm text-gray-600">Average Overall Score</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{getHighestCategory(averages)}</div>
          <div className="text-sm text-gray-600">Highest Category</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">{averages.delivery}</div>
          <div className="text-sm text-gray-600">Average Delivery</div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;