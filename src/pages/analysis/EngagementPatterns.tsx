import React, { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AnalysisFilters from '../../components/analysis/AnalysisFilters';
import { useAnalysisFilters } from '../../hooks/useAnalysisFilters';
import { useEnhancedPoliticians } from '../../hooks/useEnhancedPoliticians';

const EngagementPatterns: React.FC = () => {
  const { data: enhancedData, isLoading } = useEnhancedPoliticians([]);
  const {
    filters,
    availablePoliticians,
    filteredPoliticians,
    hasActiveFilters,
    updateFilter,
    getContextualData
  } = useAnalysisFilters();
  
  const [selectedMetric, setSelectedMetric] = useState<'velocity' | 'virality' | 'quality' | 'influence'>('velocity');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');
  const contextualData = getContextualData();

  // Generate engagement velocity data
  const generateVelocityData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map(hour => ({
      hour: `${hour}:00`,
      shares: Math.random() * 1000 + 100,
      comments: Math.random() * 500 + 50,
      likes: Math.random() * 2000 + 200,
      velocity: Math.random() * 100 + 10
    }));
  };

  // Generate virality heatmap data
  const generateViralityHeatmapData = () => {
    const platforms = ['Twitter', 'Facebook', 'Instagram', 'TikTok', 'WhatsApp', 'LinkedIn'];
    const contentTypes = ['Text', 'Image', 'Video', 'Link', 'Poll'];
    
    const data = [];
    platforms.forEach(platform => {
      contentTypes.forEach(contentType => {
        data.push({
          platform,
          contentType,
          viralityScore: Math.random() * 100,
          reach: Math.random() * 1000000,
          shareRate: Math.random() * 50
        });
      });
    });
    
    return data;
  };

  // Generate influencer network data
  const generateInfluencerNetworkData = () => {
    return [
      { id: 'central', name: 'Central Figure', followers: 2500000, engagement: 85, influence: 95, x: 50, y: 50, size: 100 },
      { id: 'inf1', name: 'Political Analyst', followers: 850000, engagement: 78, influence: 82, x: 30, y: 30, size: 80 },
      { id: 'inf2', name: 'Journalist', followers: 650000, engagement: 72, influence: 75, x: 70, y: 35, size: 70 },
      { id: 'inf3', name: 'Activist', followers: 420000, engagement: 88, influence: 68, x: 25, y: 70, size: 60 },
      { id: 'inf4', name: 'Celebrity', followers: 1200000, engagement: 65, influence: 70, x: 75, y: 65, size: 85 },
      { id: 'inf5', name: 'Academic', followers: 180000, engagement: 82, influence: 78, x: 45, y: 25, size: 50 },
      { id: 'inf6', name: 'Youth Leader', followers: 320000, engagement: 92, influence: 65, x: 60, y: 80, size: 55 }
    ];
  };

  // Generate quality score radar data
  const generateQualityRadarData = () => {
    return [
      { metric: 'Authenticity', score: 0.78, benchmark: 0.70 },
      { metric: 'Relevance', score: 0.85, benchmark: 0.75 },
      { metric: 'Accuracy', score: 0.72, benchmark: 0.80 },
      { metric: 'Timeliness', score: 0.88, benchmark: 0.65 },
      { metric: 'Engagement', score: 0.82, benchmark: 0.70 },
      { metric: 'Reach', score: 0.75, benchmark: 0.60 }
    ];
  };

  // Generate engagement trend analysis
  const generateEngagementTrendData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => ({
      day,
      organic: Math.random() * 80 + 20,
      amplified: Math.random() * 60 + 10,
      viral: Math.random() * 40 + 5,
      quality: Math.random() * 90 + 10
    }));
  };

  // Generate platform performance data
  const generatePlatformPerformanceData = () => {
    return [
      { platform: 'Twitter', engagement: 85, reach: 2500000, quality: 78, virality: 65 },
      { platform: 'Facebook', engagement: 72, reach: 1800000, quality: 82, virality: 45 },
      { platform: 'Instagram', engagement: 88, reach: 1200000, quality: 75, virality: 70 },
      { platform: 'TikTok', engagement: 92, reach: 3200000, quality: 68, virality: 85 },
      { platform: 'WhatsApp', engagement: 78, reach: 800000, quality: 85, virality: 35 },
      { platform: 'LinkedIn', engagement: 65, reach: 450000, quality: 88, virality: 25 }
    ];
  };

  const velocityData = generateVelocityData();
  const viralityHeatmapData = generateViralityHeatmapData();
  const influencerNetworkData = generateInfluencerNetworkData();
  const qualityRadarData = generateQualityRadarData();
  const engagementTrendData = generateEngagementTrendData();
  const platformPerformanceData = generatePlatformPerformanceData();

  // Custom Virality Heatmap Component
  const ViralityHeatmap = ({ data }: { data: any[] }) => {
    const platforms = [...new Set(data.map(d => d.platform))];
    const contentTypes = [...new Set(data.map(d => d.contentType))];
    const maxScore = Math.max(...data.map(d => d.viralityScore));
    
    return (
      <div className="overflow-x-auto">
        <div className="grid gap-1 text-sm" style={{ gridTemplateColumns: `100px repeat(${contentTypes.length}, 1fr)` }}>
          <div></div>
          {contentTypes.map(type => (
            <div key={type} className="font-medium text-gray-700 text-center p-2">{type}</div>
          ))}
          
          {platforms.map(platform => (
            <React.Fragment key={platform}>
              <div className="font-medium text-gray-700 p-2 text-right">{platform}</div>
              {contentTypes.map(contentType => {
                const cellData = data.find(d => d.platform === platform && d.contentType === contentType);
                const score = cellData?.viralityScore || 0;
                const intensity = score / maxScore;
                
                const color = intensity > 0.7 ? 'bg-red-500' : 
                             intensity > 0.4 ? 'bg-yellow-500' : 'bg-green-500';
                
                return (
                  <div
                    key={`${platform}-${contentType}`}
                    className={`${color} p-3 rounded text-center text-white font-medium`}
                    style={{ opacity: Math.max(intensity, 0.3) }}
                    title={`${platform} - ${contentType}: ${score.toFixed(0)} virality score`}
                  >
                    {score.toFixed(0)}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  // Custom Influencer Network Component
  const InfluencerNetwork = ({ data }: { data: any[] }) => {
    return (
      <div className="relative bg-gray-50 rounded-lg" style={{ height: '300px' }}>
        <svg width="100%" height="100%" className="absolute inset-0">
          {/* Draw connections */}
          {data.slice(1).map((node, index) => (
            <line
              key={`connection-${index}`}
              x1={`${data[0].x}%`}
              y1={`${data[0].y}%`}
              x2={`${node.x}%`}
              y2={`${node.y}%`}
              stroke="#e5e7eb"
              strokeWidth="2"
              opacity="0.6"
            />
          ))}
          
          {/* Draw nodes */}
          {data.map((node, index) => (
            <g key={node.id}>
              <circle
                cx={`${node.x}%`}
                cy={`${node.y}%`}
                r={node.size / 10}
                fill={index === 0 ? '#3B82F6' : '#10B981'}
                opacity="0.8"
                className="cursor-pointer hover:opacity-100"
              />
              <text
                x={`${node.x}%`}
                y={`${node.y + 8}%`}
                textAnchor="middle"
                className="text-xs font-medium fill-gray-700"
              >
                {node.name}
              </text>
              <text
                x={`${node.x}%`}
                y={`${node.y + 12}%`}
                textAnchor="middle"
                className="text-xs fill-gray-500"
              >
                {(node.followers / 1000000).toFixed(1)}M
              </text>
            </g>
          ))}
        </svg>
      </div>
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

  // Error boundary for data generation
  try {

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Engagement Patterns Analysis
        </h1>
        <p className="text-gray-600 mt-1">
          Analyze content engagement velocity, virality patterns, and influencer networks
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

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex space-x-2">
            <span className="text-sm font-medium text-gray-700">Metric:</span>
            {(['velocity', 'virality', 'quality', 'influence'] as const).map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  selectedMetric === metric
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <span className="text-sm font-medium text-gray-700">Time Range:</span>
            {(['24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engagement Velocity Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Engagement Velocity (24h)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={velocityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="shares" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="comments" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="likes" stroke="#F59E0B" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quality Score Radar */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Content Quality Analysis
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={qualityRadarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={90} domain={[0, 1]} />
              <Radar
                name="Current Score"
                dataKey="score"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
              />
              <Radar
                name="Benchmark"
                dataKey="benchmark"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.3}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Platform Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Platform Performance Comparison
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={platformPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="platform" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="engagement" fill="#3B82F6" name="Engagement %" />
              <Bar dataKey="quality" fill="#10B981" name="Quality Score" />
              <Bar dataKey="virality" fill="#F59E0B" name="Virality Index" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Engagement Trends */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Weekly Engagement Trends
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={engagementTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="organic" stroke="#10B981" strokeWidth={2} />
              <Line type="monotone" dataKey="amplified" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="viral" stroke="#EF4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Virality Heatmap */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Virality Heatmap by Platform & Content Type
        </h2>
        <ViralityHeatmap data={viralityHeatmapData} />
        <div className="mt-4 text-center text-sm text-gray-600">
          Virality scores across different platforms and content types
        </div>
      </div>

      {/* Influencer Network */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Influencer Network Graph
        </h2>
        <InfluencerNetwork data={influencerNetworkData} />
        <div className="mt-4 text-center text-sm text-gray-600">
          Key influencers and their network connections (node size = follower count)
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Engagement Insights Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900">Peak Engagement</h3>
            <p className="text-2xl font-bold text-blue-700">8-10 PM</p>
            <p className="text-sm text-blue-600">Highest velocity window</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900">Top Platform</h3>
            <p className="text-2xl font-bold text-green-700">TikTok</p>
            <p className="text-sm text-green-600">92% engagement rate</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-medium text-yellow-900">Viral Content</h3>
            <p className="text-2xl font-bold text-yellow-700">Video</p>
            <p className="text-sm text-yellow-600">Highest virality score</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-medium text-purple-900">Quality Score</h3>
            <p className="text-2xl font-bold text-purple-700">78%</p>
            <p className="text-sm text-purple-600">Above benchmark average</p>
          </div>
        </div>
      </div>
    </div>
  );
  } catch (error) {
    console.error('Error in EngagementPatterns:', error);
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Engagement Patterns Analysis
          </h1>
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">
              There was an error loading the engagement analysis. Please try refreshing the page.
            </p>
          </div>
        </div>
      </div>
    );
  }
};

export default EngagementPatterns;