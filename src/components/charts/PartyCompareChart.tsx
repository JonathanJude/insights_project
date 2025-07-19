import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line
} from 'recharts';
import type { PartyInsight } from '../../types';
import { PoliticalParty, TimeFrame } from '../../types';
import { POLITICAL_PARTIES, SENTIMENT_COLORS } from '../../constants';

interface PartyCompareChartProps {
  data?: PartyInsight[];
  isLoading?: boolean;
  height?: number;
  selectedParties?: PoliticalParty[];
}

type ChartType = 'bar' | 'radar' | 'line';

const PartyCompareChart: React.FC<PartyCompareChartProps> = ({ 
  data, 
  isLoading = false,
  height = 400,
  selectedParties = []
}) => {
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [metric, setMetric] = useState<'sentiment' | 'mentions' | 'engagement'>('sentiment');

  // Mock data if none provided
  const mockData: PartyInsight[] = [
    {
      party: PoliticalParty.APC,
      id: 'apc-insight',
      totalMentions: 15420,
      totalEngagement: 89340,
      overallSentiment: { positive: 42, neutral: 38, negative: 20 },
      date: '2024-01-15',
      timeframe: TimeFrame.DAY,
      trendData: [],
      platformBreakdown: [],
      topPoliticians: []
    },
    {
      party: PoliticalParty.PDP,
      id: 'pdp-insight',
      totalMentions: 12850,
      totalEngagement: 76230,
      overallSentiment: { positive: 38, neutral: 42, negative: 20 },
      date: '2024-01-15',
      timeframe: TimeFrame.DAY,
       trendData: [],
       platformBreakdown: [],
       topPoliticians: []
     },
     {
       party: PoliticalParty.LP,
       id: 'lp-insight',
       totalMentions: 8950,
       totalEngagement: 52340,
       overallSentiment: { positive: 52, neutral: 28, negative: 20 },
       date: '2024-01-15',
       timeframe: TimeFrame.DAY,
       trendData: [],
       platformBreakdown: [],
       topPoliticians: []
     },
     {
       party: PoliticalParty.NNPP,
       id: 'nnpp-insight',
       totalMentions: 4560,
       totalEngagement: 28940,
       overallSentiment: { positive: 45, neutral: 35, negative: 20 },
       date: '2024-01-15',
       timeframe: TimeFrame.DAY,
      trendData: [],
      platformBreakdown: [],
      topPoliticians: []
    }
  ];

  const chartData = data || mockData;
  
  // Filter data based on selected parties if any
  const filteredData = selectedParties.length > 0 
    ? chartData.filter(item => selectedParties.includes(item.party))
    : chartData;

  // Transform data for different chart types
  const transformedData = filteredData.map(item => {
    const partyInfo = POLITICAL_PARTIES.find(p => p.value === item.party);
    const engagementRate = item.totalMentions > 0 ? (item.totalEngagement / item.totalMentions) * 100 : 0;
    const averageSentiment = (item.overallSentiment.positive - item.overallSentiment.negative) / 100;
    return {
       party: partyInfo?.label || item.party,
      fullName: partyInfo?.fullName || item.party,
      color: partyInfo?.color || '#6b7280',
      mentions: item.totalMentions,
      sentiment: (averageSentiment + 1) * 50, // Convert -1 to 1 range to 0-100
      engagement: engagementRate,
      positive: item.overallSentiment.positive,
      neutral: item.overallSentiment.neutral,
      negative: item.overallSentiment.negative,
      trendingTopics: [],
      keyPoliticians: []
    };
  });

  const CustomTooltip = ({ active, payload }: {
    active?: boolean;
    payload?: Array<{
      value: number;
      dataKey: string;
      color: string;
      payload: {
        name: string;
        value: number;
        percentage: number;
        mentions: number;
        color?: string;
        fullName?: string;
        sentiment?: number;
        engagement?: number;
        positive?: number;
        neutral?: number;
        negative?: number;
        trendingTopics?: string[];
      };
    }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <div className="flex items-center space-x-2 mb-3">
            {data.color && (
              <div 
                className="w-4 h-4 rounded" 
                style={{ backgroundColor: data.color }}
              />
            )}
            <p className="font-medium text-gray-900">{data.fullName || data.name}</p>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Mentions:</span>
              <span className="font-medium">{data.mentions.toLocaleString()}</span>
            </div>
            {data.sentiment !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-600">Sentiment:</span>
                <span className="font-medium">{data.sentiment.toFixed(1)}%</span>
              </div>
            )}
            {data.engagement !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-600">Engagement:</span>
                <span className="font-medium">{data.engagement.toFixed(2)}%</span>
              </div>
            )}
            
            {(data.positive !== undefined || data.neutral !== undefined || data.negative !== undefined) && (
              <div className="border-t pt-2 mt-2">
                <div className="text-xs text-gray-500 mb-1">Sentiment Breakdown:</div>
                <div className="space-y-1 text-xs">
                  {data.positive !== undefined && (
                    <div className="flex justify-between">
                      <span style={{ color: SENTIMENT_COLORS.positive }}>Positive:</span>
                      <span>{data.positive}%</span>
                    </div>
                  )}
                  {data.neutral !== undefined && (
                    <div className="flex justify-between">
                      <span style={{ color: SENTIMENT_COLORS.neutral }}>Neutral:</span>
                      <span>{data.neutral}%</span>
                    </div>
                  )}
                  {data.negative !== undefined && (
                    <div className="flex justify-between">
                      <span style={{ color: SENTIMENT_COLORS.negative }}>Negative:</span>
                      <span>{data.negative}%</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {data.trendingTopics && data.trendingTopics.length > 0 && (
              <div className="border-t pt-2 mt-2">
                <div className="text-xs text-gray-500 mb-1">Trending Topics:</div>
                <div className="flex flex-wrap gap-1">
                  {data.trendingTopics.slice(0, 3).map((topic: string, index: number) => (
                    <span key={index} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse" style={{ height }}>
        <div className="h-full bg-gray-200 rounded"></div>
      </div>
    );
  }

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart
            data={transformedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="party" 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => 
                metric === 'mentions' ? `${(value / 1000).toFixed(0)}k` : `${value}%`
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {metric === 'sentiment' && (
              <>
                <Bar 
                  dataKey="positive" 
                  stackId="sentiment"
                  fill={SENTIMENT_COLORS.positive}
                  name="Positive"
                />
                <Bar 
                  dataKey="neutral" 
                  stackId="sentiment"
                  fill={SENTIMENT_COLORS.neutral}
                  name="Neutral"
                />
                <Bar 
                  dataKey="negative" 
                  stackId="sentiment"
                  fill={SENTIMENT_COLORS.negative}
                  name="Negative"
                />
              </>
            )}
            
            {metric === 'mentions' && (
              <Bar 
                dataKey="mentions" 
                fill="#3b82f6"
                name="Total Mentions"
              />
            )}
            
            {metric === 'engagement' && (
              <Bar 
                dataKey="engagement" 
                fill="#8b5cf6"
                name="Engagement Rate"
              />
            )}
          </BarChart>
        );
        
      case 'radar':
        return (
          <RadarChart data={transformedData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
            <PolarGrid />
            <PolarAngleAxis dataKey="party" />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              tick={false}
            />
            <Radar
              name="Sentiment Score"
              dataKey="sentiment"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Radar
              name="Engagement Rate"
              dataKey="engagement"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Legend />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        );
        
      case 'line':
        return (
          <LineChart
            data={transformedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="party" 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            <Line
              type="monotone"
              dataKey="sentiment"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
              name="Sentiment Score"
            />
            <Line
              type="monotone"
              dataKey="engagement"
              stroke="#8b5cf6"
              strokeWidth={3}
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 6 }}
              name="Engagement Rate"
            />
          </LineChart>
        );
        
      default:
        return (
          <BarChart
            data={transformedData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="party" 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => 
                metric === 'mentions' ? `${(value / 1000).toFixed(0)}k` : `${value}%`
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey="mentions" 
              fill="#3b82f6"
              name="Total Mentions"
            />
          </BarChart>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex space-x-2">
          {(['bar', 'radar', 'line'] as ChartType[]).map((type) => (
            <button
              key={type}
              onClick={() => setChartType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                chartType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type} Chart
            </button>
          ))}
        </div>
        
        {chartType === 'bar' && (
          <div className="flex space-x-2">
            {(['sentiment', 'mentions', 'engagement'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`px-3 py-1 rounded text-sm capitalize ${
                  metric === m
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Party Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {transformedData.map((party, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <div 
                className="w-4 h-4 rounded" 
                style={{ backgroundColor: party.color }}
              />
              <h3 className="font-medium text-gray-900">{party.party}</h3>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Mentions:</span>
                <span className="font-medium">{party.mentions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sentiment:</span>
                <span className="font-medium">{party.sentiment.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Engagement:</span>
                <span className="font-medium">{party.engagement.toFixed(2)}%</span>
              </div>
            </div>
            
            {party.keyPoliticians && party.keyPoliticians.length > 0 && (
              <div className="mt-3 pt-3 border-t">
                <div className="text-xs text-gray-500 mb-1">Key Politicians:</div>
                <div className="text-xs text-gray-700">
                  {party.keyPoliticians.slice(0, 2).join(', ')}
                  {party.keyPoliticians.length > 2 && '...'}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PartyCompareChart;