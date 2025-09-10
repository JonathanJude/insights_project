import React, { useState } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis } from 'recharts';
import AnalysisFilters from '../../components/analysis/AnalysisFilters';
import { useAnalysisFilters } from '../../hooks/useAnalysisFilters';
import { useEnhancedPoliticians } from '../../hooks/useEnhancedPoliticians';

const SentimentDeepDive: React.FC = () => {
  const { data: enhancedData, isLoading } = useEnhancedPoliticians([]);
  const {
    filters,
    availablePoliticians,
    filteredPoliticians,
    hasActiveFilters,
    updateFilter,
    getContextualData
  } = useAnalysisFilters();
  
  const [selectedEmotion, setSelectedEmotion] = useState<'joy' | 'anger' | 'fear' | 'sadness' | 'disgust'>('joy');
  const contextualData = getContextualData();

  // Generate emotion wheel data
  const generateEmotionWheelData = () => {
    return [
      { emotion: 'Joy', value: 0.65, color: '#10B981' },
      { emotion: 'Trust', value: 0.45, color: '#3B82F6' },
      { emotion: 'Fear', value: 0.35, color: '#F59E0B' },
      { emotion: 'Surprise', value: 0.25, color: '#8B5CF6' },
      { emotion: 'Sadness', value: 0.55, color: '#6B7280' },
      { emotion: 'Disgust', value: 0.40, color: '#EF4444' },
      { emotion: 'Anger', value: 0.70, color: '#DC2626' },
      { emotion: 'Anticipation', value: 0.50, color: '#059669' }
    ];
  };

  // Generate sentiment river flow data
  const generateSentimentRiverData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      month,
      positive: Math.random() * 40 + 20,
      neutral: Math.random() * 30 + 15,
      negative: Math.random() * 35 + 10,
      joy: Math.random() * 25 + 10,
      anger: Math.random() * 30 + 5,
      fear: Math.random() * 20 + 5,
      sadness: Math.random() * 15 + 5,
      disgust: Math.random() * 10 + 2
    }));
  };

  // Generate polarity intensity scatter data
  const generatePolarityIntensityData = () => {
    const data = [];
    for (let i = 0; i < 200; i++) {
      const polarity = Math.random() * 2 - 1; // -1 to 1
      const intensity = Math.random(); // 0 to 1
      const confidence = Math.random(); // 0 to 1
      
      data.push({
        polarity,
        intensity,
        confidence,
        size: confidence * 100 + 20,
        category: polarity > 0.3 ? 'Positive' : polarity < -0.3 ? 'Negative' : 'Neutral'
      });
    }
    return data;
  };

  // Generate sentiment complexity matrix
  const generateComplexityMatrix = () => {
    const complexityTypes = ['Simple', 'Mixed', 'Sarcastic', 'Conditional'];
    const sentimentTypes = ['Positive', 'Negative', 'Neutral'];
    
    const matrix = [];
    complexityTypes.forEach(complexity => {
      sentimentTypes.forEach(sentiment => {
        matrix.push({
          complexity,
          sentiment,
          count: Math.floor(Math.random() * 500) + 50,
          percentage: Math.random() * 30 + 5
        });
      });
    });
    
    return matrix;
  };

  // Generate model agreement data
  const generateModelAgreementData = () => {
    return [
      { model: 'BERT', agreement: 0.85, accuracy: 0.82, confidence: 0.78 },
      { model: 'RoBERTa', agreement: 0.88, accuracy: 0.84, confidence: 0.81 },
      { model: 'DistilBERT', agreement: 0.82, accuracy: 0.79, confidence: 0.75 },
      { model: 'VADER', agreement: 0.75, accuracy: 0.72, confidence: 0.68 },
      { model: 'TextBlob', agreement: 0.70, accuracy: 0.68, confidence: 0.65 },
      { model: 'Ensemble', agreement: 0.92, accuracy: 0.89, confidence: 0.86 }
    ];
  };

  const emotionWheelData = generateEmotionWheelData();
  const sentimentRiverData = generateSentimentRiverData();
  const polarityIntensityData = generatePolarityIntensityData();
  const complexityMatrix = generateComplexityMatrix();
  const modelAgreementData = generateModelAgreementData();

  // Custom emotion wheel component
  const EmotionWheel = ({ data }: { data: any[] }) => {
    const centerX = 150;
    const centerY = 150;
    const radius = 100;
    
    return (
      <svg width="300" height="300" className="mx-auto">
        {/* Background circles */}
        <circle cx={centerX} cy={centerY} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="1" />
        <circle cx={centerX} cy={centerY} r={radius * 0.7} fill="none" stroke="#e5e7eb" strokeWidth="1" />
        <circle cx={centerX} cy={centerY} r={radius * 0.4} fill="none" stroke="#e5e7eb" strokeWidth="1" />
        
        {data.map((item, index) => {
          const angle = (index * 2 * Math.PI) / data.length - Math.PI / 2;
          const x = centerX + Math.cos(angle) * radius * item.value;
          const y = centerY + Math.sin(angle) * radius * item.value;
          const labelX = centerX + Math.cos(angle) * (radius + 20);
          const labelY = centerY + Math.sin(angle) * (radius + 20);
          
          return (
            <g key={item.emotion}>
              <line
                x1={centerX}
                y1={centerY}
                x2={x}
                y2={y}
                stroke={item.color}
                strokeWidth="3"
              />
              <circle
                cx={x}
                cy={y}
                r="6"
                fill={item.color}
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                className="text-xs font-medium fill-gray-700"
              >
                {item.emotion}
              </text>
              <text
                x={labelX}
                y={labelY + 12}
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                {(item.value * 100).toFixed(0)}%
              </text>
            </g>
          );
        })}
        
        {/* Center point */}
        <circle cx={centerX} cy={centerY} r="4" fill="#374151" />
      </svg>
    );
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Sentiment Deep Dive
        </h1>
        <p className="text-gray-600 mt-1">
          Advanced sentiment analysis with emotion detection, intensity mapping, and model agreement
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

      {/* Emotion Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex space-x-4 mb-6">
          {(['joy', 'anger', 'fear', 'sadness', 'disgust'] as const).map((emotion) => (
            <button
              key={emotion}
              onClick={() => setSelectedEmotion(emotion)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedEmotion === emotion
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emotion Wheel Visualization */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Emotion Wheel Analysis
          </h2>
          <EmotionWheel data={emotionWheelData} />
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Emotional intensity distribution across political discourse
            </p>
          </div>
        </div>

        {/* Sentiment River Flow Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Sentiment River Flow
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={sentimentRiverData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="positive"
                stackId="1"
                stroke="#10B981"
                fill="#10B981"
                fillOpacity={0.7}
              />
              <Area
                type="monotone"
                dataKey="neutral"
                stackId="1"
                stroke="#6B7280"
                fill="#6B7280"
                fillOpacity={0.7}
              />
              <Area
                type="monotone"
                dataKey="negative"
                stackId="1"
                stroke="#EF4444"
                fill="#EF4444"
                fillOpacity={0.7}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Polarity Intensity Scatter Plot */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Polarity vs Intensity Analysis
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart data={polarityIntensityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="polarity" 
                name="Polarity" 
                domain={[-1, 1]}
                tickFormatter={(value) => value.toFixed(1)}
              />
              <YAxis 
                dataKey="intensity" 
                name="Intensity" 
                domain={[0, 1]}
                tickFormatter={(value) => value.toFixed(1)}
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(value: any, name: string) => [
                  typeof value === 'number' ? value.toFixed(2) : value,
                  name
                ]}
              />
              <Scatter name="Sentiment Points" dataKey="intensity">
                {polarityIntensityData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.category === 'Positive' ? '#10B981' :
                      entry.category === 'Negative' ? '#EF4444' : '#6B7280'
                    }
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Model Agreement Analysis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Model Agreement Analysis
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={modelAgreementData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="model" />
              <YAxis domain={[0, 1]} />
              <Tooltip formatter={(value: any) => [(value * 100).toFixed(1) + '%', 'Score']} />
              <Legend />
              <Bar dataKey="agreement" fill="#3B82F6" name="Agreement" />
              <Bar dataKey="accuracy" fill="#10B981" name="Accuracy" />
              <Bar dataKey="confidence" fill="#F59E0B" name="Confidence" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sentiment Complexity Matrix */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Sentiment Complexity Matrix
        </h2>
        <div className="grid grid-cols-4 gap-2 text-sm">
          <div className="font-medium text-gray-700">Complexity / Sentiment</div>
          {['Positive', 'Negative', 'Neutral'].map(sentiment => (
            <div key={sentiment} className="font-medium text-gray-700 text-center">{sentiment}</div>
          ))}
          
          {['Simple', 'Mixed', 'Sarcastic', 'Conditional'].map(complexity => (
            <React.Fragment key={complexity}>
              <div className="font-medium text-gray-700">{complexity}</div>
              {['Positive', 'Negative', 'Neutral'].map(sentiment => {
                const cellData = complexityMatrix.find(d => d.complexity === complexity && d.sentiment === sentiment);
                const percentage = cellData?.percentage || 0;
                const intensity = percentage / 30; // Normalize to 0-1
                const color = sentiment === 'Positive' ? 'bg-green-' : sentiment === 'Negative' ? 'bg-red-' : 'bg-gray-';
                const shade = intensity > 0.7 ? '500' : intensity > 0.4 ? '300' : '100';
                
                return (
                  <div
                    key={`${complexity}-${sentiment}`}
                    className={`${color}${shade} p-3 rounded text-center text-white font-medium`}
                    title={`${complexity} ${sentiment}: ${percentage.toFixed(1)}%`}
                  >
                    {percentage.toFixed(1)}%
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Advanced Sentiment Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900">Model Consensus</h3>
            <p className="text-2xl font-bold text-blue-700">92%</p>
            <p className="text-sm text-blue-600">Ensemble model agreement rate</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900">Emotion Clarity</h3>
            <p className="text-2xl font-bold text-green-700">78%</p>
            <p className="text-sm text-green-600">Clear emotional signals detected</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-medium text-yellow-900">Complexity Rate</h3>
            <p className="text-2xl font-bold text-yellow-700">25%</p>
            <p className="text-sm text-yellow-600">Mixed or complex sentiments</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-900">Intensity Score</h3>
            <p className="text-2xl font-bold text-purple-700">0.68</p>
            <p className="text-sm text-purple-600">Average sentiment intensity</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentDeepDive;