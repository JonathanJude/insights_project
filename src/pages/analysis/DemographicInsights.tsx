import React, { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';
import AnalysisFilters from '../../components/analysis/AnalysisFilters';
import { useAnalysisFilters } from '../../hooks/useAnalysisFilters';
import { useEnhancedPoliticians } from '../../hooks/useEnhancedPoliticians';

const DemographicInsights: React.FC = () => {
  const { data: enhancedData, isLoading } = useEnhancedPoliticians([]);
  const {
    filters,
    availablePoliticians,
    filteredPoliticians,
    hasActiveFilters,
    updateFilter,
    getContextualData
  } = useAnalysisFilters();
  
  const [selectedDemographic, setSelectedDemographic] = useState<'education' | 'occupation' | 'age' | 'gender'>('education');
  const contextualData = getContextualData();

  // Generate demographic sentiment matrix data
  const generateDemographicMatrix = () => {
    if (!enhancedData) return [];
    
    const matrix = [];
    const demographics = ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'];
    const educationLevels = ['Primary', 'Secondary', 'Tertiary', 'Postgraduate'];
    
    demographics.forEach(age => {
      educationLevels.forEach(education => {
        const sentiment = Math.random() * 2 - 1; // -1 to 1
        matrix.push({
          age,
          education,
          sentiment: sentiment,
          count: Math.floor(Math.random() * 1000) + 100
        });
      });
    });
    
    return matrix;
  };

  // Generate generational comparison data
  const generateGenerationalData = () => {
    return [
      { generation: '18-25', positive: 45, negative: 35, neutral: 20, engagement: 85 },
      { generation: '26-35', positive: 52, negative: 28, neutral: 20, engagement: 78 },
      { generation: '36-45', positive: 48, negative: 32, neutral: 20, engagement: 65 },
      { generation: '46-55', positive: 41, negative: 39, neutral: 20, engagement: 52 },
      { generation: '56-65', positive: 38, negative: 42, neutral: 20, engagement: 38 },
      { generation: '65+', positive: 35, negative: 45, neutral: 20, engagement: 25 }
    ];
  };

  // Generate occupational radar data
  const generateOccupationalData = () => {
    return [
      { occupation: 'Public Sector', sentiment: 0.3, engagement: 0.7, trust: 0.6, influence: 0.8 },
      { occupation: 'Private Sector', sentiment: 0.5, engagement: 0.6, trust: 0.7, influence: 0.6 },
      { occupation: 'Student', sentiment: 0.2, engagement: 0.9, trust: 0.4, influence: 0.5 },
      { occupation: 'Self-Employed', sentiment: 0.4, engagement: 0.5, trust: 0.6, influence: 0.4 },
      { occupation: 'Technology', sentiment: 0.6, engagement: 0.8, trust: 0.8, influence: 0.7 },
      { occupation: 'Agriculture', sentiment: 0.1, engagement: 0.3, trust: 0.5, influence: 0.3 }
    ];
  };

  // Generate education sentiment trends
  const generateEducationTrends = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      Primary: Math.random() * 0.6 - 0.3,
      Secondary: Math.random() * 0.8 - 0.4,
      Tertiary: Math.random() * 1.0 - 0.2,
      Postgraduate: Math.random() * 1.2 + 0.1
    }));
  };

  // Generate correlation analysis data
  const generateCorrelationData = () => {
    const data = [];
    for (let i = 0; i < 100; i++) {
      data.push({
        education: Math.random() * 4, // 0-4 education level
        sentiment: Math.random() * 2 - 1, // -1 to 1 sentiment
        age: Math.random() * 60 + 18, // 18-78 age
        engagement: Math.random() * 100
      });
    }
    return data;
  };

  const matrixData = generateDemographicMatrix();
  const generationalData = generateGenerationalData();
  const occupationalData = generateOccupationalData();
  const educationTrends = generateEducationTrends();
  const correlationData = generateCorrelationData();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error boundary for data generation
  try {

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Demographic Insights
        </h1>
        <p className="text-gray-600 mt-1">
          Analyze political sentiment across demographic groups and understand generational patterns
          {hasActiveFilters && (
            <span className="ml-2 text-blue-600 font-medium">
              (Filtered: {filteredPoliticians.length} politicians)
            </span>
          )}
        </p>
      </div>

      {/* Analysis Filters */}
      <AnalysisFilters
        selectedParty={filters.party}
        selectedPosition={filters.position}
        selectedState={filters.state}
        selectedPolitician={filters.politician}
        onPartyChange={(party) => updateFilter('party', party)}
        onPositionChange={(position) => updateFilter('position', position)}
        onStateChange={(state) => updateFilter('state', state)}
        onPoliticianChange={(politician) => updateFilter('politician', politician)}
        availablePoliticians={availablePoliticians}
      />

      {/* Demographic Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex space-x-4 mb-6">
          {(['education', 'occupation', 'age', 'gender'] as const).map((demo) => (
            <button
              key={demo}
              onClick={() => setSelectedDemographic(demo)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedDemographic === demo
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {demo.charAt(0).toUpperCase() + demo.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Demographic Sentiment Matrix */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Demographic Sentiment Matrix
        </h2>
        <div className="grid grid-cols-6 gap-2 text-sm">
          <div className="font-medium text-gray-700">Age / Education</div>
          {['Primary', 'Secondary', 'Tertiary', 'Postgraduate', 'Undefined'].map(edu => (
            <div key={edu} className="font-medium text-gray-700 text-center">{edu}</div>
          ))}
          
          {['18-25', '26-35', '36-45', '46-55', '56-65', '65+'].map(age => (
            <React.Fragment key={age}>
              <div className="font-medium text-gray-700">{age}</div>
              {['Primary', 'Secondary', 'Tertiary', 'Postgraduate', 'Undefined'].map(edu => {
                const cellData = matrixData.find(d => d.age === age && d.education === edu);
                const sentiment = cellData?.sentiment || 0;
                const intensity = Math.abs(sentiment);
                let cellClass = 'p-2 rounded text-center text-white font-medium ';
                if (sentiment > 0) {
                  cellClass += intensity > 0.7 ? 'bg-green-500' : intensity > 0.4 ? 'bg-green-300' : 'bg-green-100 text-gray-800';
                } else if (sentiment < 0) {
                  cellClass += intensity > 0.7 ? 'bg-red-500' : intensity > 0.4 ? 'bg-red-300' : 'bg-red-100 text-gray-800';
                } else {
                  cellClass += 'bg-gray-100 text-gray-800';
                }
                
                return (
                  <div
                    key={`${age}-${edu}`}
                    className={cellClass}
                    title={`${age} - ${edu}: ${sentiment.toFixed(2)}`}
                  >
                    {sentiment.toFixed(1)}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generational Comparison Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Generational Sentiment Comparison
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={generationalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="generation" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="positive" fill="#10B981" name="Positive %" />
              <Bar dataKey="negative" fill="#EF4444" name="Negative %" />
              <Bar dataKey="neutral" fill="#6B7280" name="Neutral %" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Occupational Radar Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Occupational Analysis Radar
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={occupationalData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="occupation" />
              <PolarRadiusAxis angle={90} domain={[0, 1]} />
              <Radar
                name="Sentiment"
                dataKey="sentiment"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
              />
              <Radar
                name="Engagement"
                dataKey="engagement"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.3}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Education Sentiment Trends */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Education Sentiment Trends
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={educationTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[-0.5, 1.5]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Primary" stroke="#EF4444" />
              <Line type="monotone" dataKey="Secondary" stroke="#F59E0B" />
              <Line type="monotone" dataKey="Tertiary" stroke="#10B981" />
              <Line type="monotone" dataKey="Postgraduate" stroke="#3B82F6" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Demographic Correlation Analysis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Education vs Sentiment Correlation
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={correlationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="education" name="Education Level" />
              <YAxis dataKey="sentiment" name="Sentiment" domain={[-1, 1]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Data Points" dataKey="sentiment" fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Key Demographic Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900">Youth Engagement</h3>
            <p className="text-2xl font-bold text-blue-700">85%</p>
            <p className="text-sm text-blue-600">18-25 age group shows highest political engagement</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900">Education Impact</h3>
            <p className="text-2xl font-bold text-green-700">+0.4</p>
            <p className="text-sm text-green-600">Higher education correlates with positive sentiment</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-900">Tech Sector</h3>
            <p className="text-2xl font-bold text-purple-700">78%</p>
            <p className="text-sm text-purple-600">Technology workers show highest trust levels</p>
          </div>
        </div>
      </div>
    </div>
  );
  } catch (error) {
    console.error('Error in DemographicInsights:', error);
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Demographic Insights
          </h1>
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">
              There was an error loading the demographic analysis. Please try refreshing the page.
            </p>
          </div>
        </div>
      </div>
    );
  }
};

export default DemographicInsights;