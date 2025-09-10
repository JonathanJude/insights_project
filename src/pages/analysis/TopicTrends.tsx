import React, { useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AnalysisFilters from '../../components/analysis/AnalysisFilters';
import { useAnalysisFilters } from '../../hooks/useAnalysisFilters';
import { useEnhancedPoliticians } from '../../hooks/useEnhancedPoliticians';

const TopicTrends: React.FC = () => {
  const { data: enhancedData, isLoading } = useEnhancedPoliticians([]);
  const {
    filters,
    availablePoliticians,
    filteredPoliticians,
    hasActiveFilters,
    updateFilter,
    getContextualData
  } = useAnalysisFilters();
  
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('month');
  const [selectedTopic, setSelectedTopic] = useState<'economy' | 'security' | 'corruption' | 'education'>('economy');
  const contextualData = getContextualData();

  // Generate policy area radar data
  const generatePolicyRadarData = () => {
    return [
      { policy: 'Economy', sentiment: 0.3, volume: 0.8, engagement: 0.7, trending: 0.9 },
      { policy: 'Security', sentiment: -0.2, volume: 0.9, engagement: 0.8, trending: 0.7 },
      { policy: 'Corruption', sentiment: -0.6, volume: 0.6, engagement: 0.9, trending: 0.8 },
      { policy: 'Education', sentiment: 0.1, volume: 0.5, engagement: 0.6, trending: 0.4 },
      { policy: 'Health', sentiment: 0.2, volume: 0.4, engagement: 0.5, trending: 0.3 },
      { policy: 'Infrastructure', sentiment: -0.1, volume: 0.7, engagement: 0.6, trending: 0.6 },
      { policy: 'Youth/Jobs', sentiment: -0.3, volume: 0.8, engagement: 0.9, trending: 0.8 }
    ];
  };

  // Generate campaign issue heatmap data
  const generateCampaignHeatmapData = () => {
    const issues = ['Cost of Living', 'Fuel Subsidy', 'Minimum Wage', 'Election Credibility', 'Insecurity', 'Unemployment'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    
    const data = [];
    issues.forEach(issue => {
      months.forEach(month => {
        data.push({
          issue,
          month,
          intensity: Math.random() * 100,
          sentiment: Math.random() * 2 - 1
        });
      });
    });
    
    return data;
  };

  // Generate event timeline data
  const generateEventTimelineData = () => {
    return [
      { date: '2024-01', event: 'Budget Announcement', type: 'Government Action', sentiment: 0.3, impact: 85 },
      { date: '2024-02', event: 'Fuel Price Increase', type: 'Policy Change', sentiment: -0.7, impact: 95 },
      { date: '2024-03', event: 'Youth Employment Rally', type: 'Protest', sentiment: -0.4, impact: 70 },
      { date: '2024-04', event: 'Infrastructure Launch', type: 'Government Action', sentiment: 0.5, impact: 60 },
      { date: '2024-05', event: 'Corruption Scandal', type: 'Scandal', sentiment: -0.8, impact: 90 },
      { date: '2024-06', event: 'Education Reform', type: 'Policy Change', sentiment: 0.2, impact: 55 }
    ];
  };

  // Generate trending topics word cloud data
  const generateTrendingTopicsData = () => {
    return [
      { text: 'Fuel Subsidy', value: 95, sentiment: -0.6, category: 'Economy' },
      { text: 'Insecurity', value: 88, sentiment: -0.8, category: 'Security' },
      { text: 'Minimum Wage', value: 82, sentiment: -0.3, category: 'Economy' },
      { text: 'Corruption', value: 78, sentiment: -0.9, category: 'Governance' },
      { text: 'Youth Employment', value: 75, sentiment: -0.5, category: 'Economy' },
      { text: 'Election', value: 70, sentiment: -0.2, category: 'Politics' },
      { text: 'Infrastructure', value: 65, sentiment: 0.1, category: 'Development' },
      { text: 'Education', value: 60, sentiment: 0.2, category: 'Social' },
      { text: 'Healthcare', value: 55, sentiment: 0.1, category: 'Social' },
      { text: 'Agriculture', value: 50, sentiment: 0.3, category: 'Economy' },
      { text: 'Technology', value: 45, sentiment: 0.6, category: 'Development' },
      { text: 'Climate', value: 40, sentiment: 0.2, category: 'Environment' }
    ];
  };

  // Generate topic sentiment trends
  const generateTopicSentimentTrends = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      Economy: Math.random() * 1.4 - 0.7,
      Security: Math.random() * 1.6 - 0.8,
      Corruption: Math.random() * 1.2 - 0.9,
      Education: Math.random() * 1.0 - 0.2,
      Health: Math.random() * 0.8 - 0.1,
      Infrastructure: Math.random() * 1.0 - 0.3
    }));
  };

  const policyRadarData = generatePolicyRadarData();
  const campaignHeatmapData = generateCampaignHeatmapData();
  const eventTimelineData = generateEventTimelineData();
  const trendingTopicsData = generateTrendingTopicsData();
  const topicSentimentTrends = generateTopicSentimentTrends();

  // Custom Word Cloud Component
  const WordCloud = ({ data }: { data: any[] }) => {
    const maxValue = Math.max(...data.map(d => d.value));
    
    return (
      <div className="flex flex-wrap justify-center items-center gap-2 p-4" style={{ minHeight: '300px' }}>
        {data.map((word, index) => {
          const size = (word.value / maxValue) * 40 + 12;
          const color = word.sentiment > 0.3 ? '#10B981' : 
                       word.sentiment < -0.3 ? '#EF4444' : '#6B7280';
          
          return (
            <span
              key={word.text}
              className="font-semibold cursor-pointer hover:opacity-80 transition-opacity"
              style={{
                fontSize: `${size}px`,
                color: color,
                lineHeight: 1.2
              }}
              title={`${word.text}: ${word.value}% trending, sentiment: ${word.sentiment.toFixed(2)}`}
            >
              {word.text}
            </span>
          );
        })}
      </div>
    );
  };

  // Custom Heatmap Component
  const CampaignHeatmap = ({ data }: { data: any[] }) => {
    const issues = [...new Set(data.map(d => d.issue))];
    const months = [...new Set(data.map(d => d.month))];
    
    return (
      <div className="overflow-x-auto">
        <div className="grid gap-1 text-sm" style={{ gridTemplateColumns: `120px repeat(${months.length}, 1fr)` }}>
          <div></div>
          {months.map(month => (
            <div key={month} className="font-medium text-gray-700 text-center p-2">{month}</div>
          ))}
          
          {issues.map(issue => (
            <React.Fragment key={issue}>
              <div className="font-medium text-gray-700 p-2 text-right">{issue}</div>
              {months.map(month => {
                const cellData = data.find(d => d.issue === issue && d.month === month);
                const intensity = cellData?.intensity || 0;
                const sentiment = cellData?.sentiment || 0;
                
                const opacity = intensity / 100;
                const color = sentiment > 0 ? 'bg-green-500' : sentiment < 0 ? 'bg-red-500' : 'bg-gray-500';
                
                return (
                  <div
                    key={`${issue}-${month}`}
                    className={`${color} p-3 rounded text-center text-white font-medium`}
                    style={{ opacity: Math.max(opacity, 0.1) }}
                    title={`${issue} - ${month}: ${intensity.toFixed(0)}% intensity, ${sentiment.toFixed(2)} sentiment`}
                  >
                    {intensity.toFixed(0)}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
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
          Topic Trends Analysis
        </h1>
        <p className="text-gray-600 mt-1">
          Track trending political topics, policy areas, and campaign issues with sentiment analysis
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
            <span className="text-sm font-medium text-gray-700">Timeframe:</span>
            {(['week', 'month', 'quarter'] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  selectedTimeframe === timeframe
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
              </button>
            ))}
          </div>
          
          <div className="flex space-x-2">
            <span className="text-sm font-medium text-gray-700">Focus Topic:</span>
            {(['economy', 'security', 'corruption', 'education'] as const).map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  selectedTopic === topic
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {topic.charAt(0).toUpperCase() + topic.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Policy Area Radar Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Policy Area Analysis
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={policyRadarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="policy" />
              <PolarRadiusAxis angle={90} domain={[-1, 1]} />
              <Radar
                name="Sentiment"
                dataKey="sentiment"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
              />
              <Radar
                name="Volume"
                dataKey="volume"
                stroke="#82ca9d"
                fill="#82ca9d"
                fillOpacity={0.3}
              />
              <Radar
                name="Trending"
                dataKey="trending"
                stroke="#ffc658"
                fill="#ffc658"
                fillOpacity={0.3}
              />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Topic Sentiment Trends */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Topic Sentiment Trends
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={topicSentimentTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis domain={[-1, 1]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Economy" stroke="#3B82F6" strokeWidth={2} />
              <Line type="monotone" dataKey="Security" stroke="#EF4444" strokeWidth={2} />
              <Line type="monotone" dataKey="Corruption" stroke="#DC2626" strokeWidth={2} />
              <Line type="monotone" dataKey="Education" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Event Timeline Chart */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Political Events Timeline
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={eventTimelineData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="event" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="impact" name="Impact %">
                {eventTimelineData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.sentiment > 0 ? '#10B981' : '#EF4444'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Trending Topics Word Cloud */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Trending Topics Word Cloud
          </h2>
          <WordCloud data={trendingTopicsData} />
          <div className="mt-4 flex justify-center space-x-6 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
              <span>Positive Sentiment</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-500 rounded mr-2"></div>
              <span>Neutral Sentiment</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
              <span>Negative Sentiment</span>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Issue Heatmap */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Campaign Issues Heatmap
        </h2>
        <CampaignHeatmap data={campaignHeatmapData} />
        <div className="mt-4 text-center text-sm text-gray-600">
          Intensity of discussion around key campaign issues over time
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Topic Analysis Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-medium text-red-900">Most Discussed</h3>
            <p className="text-2xl font-bold text-red-700">Fuel Subsidy</p>
            <p className="text-sm text-red-600">95% trending score</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-medium text-yellow-900">Most Negative</h3>
            <p className="text-2xl font-bold text-yellow-700">Corruption</p>
            <p className="text-sm text-yellow-600">-0.9 sentiment score</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-medium text-green-900">Most Positive</h3>
            <p className="text-2xl font-bold text-green-700">Technology</p>
            <p className="text-sm text-green-600">+0.6 sentiment score</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900">Rising Topic</h3>
            <p className="text-2xl font-bold text-blue-700">Youth Jobs</p>
            <p className="text-sm text-blue-600">+25% growth this month</p>
          </div>
        </div>
      </div>
    </div>
  );
  } catch (error) {
    console.error('Error in TopicTrends:', error);
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Topic Trends Analysis
          </h1>
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">
              There was an error loading the topic trends analysis. Please try refreshing the page.
            </p>
          </div>
        </div>
      </div>
    );
  }
};

export default TopicTrends;