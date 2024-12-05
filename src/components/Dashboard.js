import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, PieChart, Pie, Cell,
  ResponsiveContainer 
} from 'recharts';

const Dashboard = ({ files }) => {
  const metrics = useMemo(() => {
    if (!files?.length) return null;

    const completedFiles = files.filter(f => f.status === 'completed' && f.results);
    if (!completedFiles.length) return null;

    // Calculate averages
    const avgScores = {
      overall: completedFiles.reduce((acc, f) => acc + (f.results.overall_score || 0), 0) / completedFiles.length,
      ambitiousness: completedFiles.reduce((acc, f) => acc + (f.results.ambitiousness_evaluation?.total_ambitiousness_score || 0), 0) / completedFiles.length,
      implementation: completedFiles.reduce((acc, f) => acc + (f.results.implementation_evaluation?.total_implementation_score || 0), 0) / completedFiles.length,
      delivery: completedFiles.reduce((acc, f) => acc + (f.results.delivery_evaluation?.total_delivery_score || 0), 0) / completedFiles.length,
    };

    // Calculate score distribution
    const scoreDistribution = {
      high: completedFiles.filter(f => (f.results.overall_score || 0) >= 8).length,
      medium: completedFiles.filter(f => (f.results.overall_score || 0) >= 5 && (f.results.overall_score || 0) < 8).length,
      low: completedFiles.filter(f => (f.results.overall_score || 0) < 5).length,
    };

    // Prepare time series data
    const timeSeriesData = completedFiles.map((file, index) => ({
      name: file.file.name || `File ${index + 1}`,
      overall: file.results.overall_score || 0,
      ambitiousness: file.results.ambitiousness_evaluation?.total_ambitiousness_score || 0,
      implementation: file.results.implementation_evaluation?.total_implementation_score || 0,
      delivery: file.results.delivery_evaluation?.total_delivery_score || 0,
    }));

    return {
      avgScores,
      scoreDistribution,
      timeSeriesData,
      totalAnalyzed: completedFiles.length,
      totalPending: files.length - completedFiles.length,
    };
  }, [files]);

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">No data available for analysis</p>
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Pitches Analyzed</h3>
          <p className="text-3xl font-bold text-gray-900">{metrics.totalAnalyzed}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Average Overall Score</h3>
          <p className="text-3xl font-bold text-blue-600">{metrics.avgScores.overall.toFixed(1)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">High Scoring Pitches</h3>
          <p className="text-3xl font-bold text-green-600">{metrics.scoreDistribution.high}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Pending Analysis</h3>
          <p className="text-3xl font-bold text-yellow-600">{metrics.totalPending}</p>
        </div>
      </div>

      {/* Score Trends */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Score Trends</h2>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <LineChart data={metrics.timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="overall" stroke="#8884d8" />
              <Line type="monotone" dataKey="ambitiousness" stroke="#82ca9d" />
              <Line type="monotone" dataKey="implementation" stroke="#ffc658" />
              <Line type="monotone" dataKey="delivery" stroke="#ff7300" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Average Scores */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Average Scores by Category</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={[
                { name: 'Overall', value: metrics.avgScores.overall },
                { name: 'Ambitiousness', value: metrics.avgScores.ambitiousness },
                { name: 'Implementation', value: metrics.avgScores.implementation },
                { name: 'Delivery', value: metrics.avgScores.delivery },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Score Distribution</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={[
                    { name: 'High (8-10)', value: metrics.scoreDistribution.high },
                    { name: 'Medium (5-7.9)', value: metrics.scoreDistribution.medium },
                    { name: 'Low (0-4.9)', value: metrics.scoreDistribution.low },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;