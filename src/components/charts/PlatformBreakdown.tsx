import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { SENTIMENT_COLORS, SOCIAL_PLATFORMS } from '../../constants';
import type { PlatformSentiment } from '../../types';

interface PlatformBreakdownProps {
  data?: PlatformSentiment[];
  isLoading?: boolean;
  height?: number;
}

const PlatformBreakdown: React.FC<PlatformBreakdownProps> = ({ 
  data, 
  isLoading = false,
  height = 300 
}) => {
  if (isLoading) {
    return (
      <div className="animate-pulse" style={{ height }}>
        <div className="h-full bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-gray-500">No platform data available</p>
      </div>
    );
  }

  // Transform data for the chart
  const chartData = data.map(platform => {
    const platformInfo = SOCIAL_PLATFORMS.find(p => p.value === platform.platform);
    // Calculate overall sentiment score from breakdown
    const totalSentiment = platform.sentimentBreakdown.positive + platform.sentimentBreakdown.neutral + platform.sentimentBreakdown.negative;
    const sentimentScore = totalSentiment > 0 
      ? (platform.sentimentBreakdown.positive - platform.sentimentBreakdown.negative) / totalSentiment * 50 + 50
      : 50;
    
    return {
      platform: platformInfo?.label || platform.platform,
      mentions: platform.totalMentions,
      sentiment: sentimentScore,
      positive: platform.sentimentBreakdown.positive,
      neutral: platform.sentimentBreakdown.neutral,
      negative: platform.sentimentBreakdown.negative,
      engagement: platform.averageEngagement,
      color: platformInfo?.color || '#6b7280',
      icon: platformInfo?.icon
    };
  });

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
      value: number;
      dataKey: string;
      color: string;
      payload: {
        platform: string;
        mentions: number;
        sentiment: number;
        positive: number;
        neutral: number;
        negative: number;
        engagement: number;
      };
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg min-w-48">
          <div className="flex items-center space-x-2 mb-3">
            <div 
              className="w-4 h-4 rounded" 
              style={{ backgroundColor: payload[0].color }}
            />
            <p className="font-medium text-gray-900">{label}</p>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Mentions:</span>
              <span className="font-medium">{data.mentions.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Avg Sentiment:</span>
              <span className="font-medium">{typeof data.sentiment === 'number' ? data.sentiment.toFixed(1) : data.sentiment}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Engagement:</span>
              <span className="font-medium">{typeof data.engagement === 'number' ? data.engagement.toFixed(2) : data.engagement}%</span>
            </div>
            
            <div className="border-t pt-2 mt-2">
              <div className="text-xs text-gray-500 mb-1">Sentiment Breakdown:</div>
              <div className="flex justify-between text-xs">
                <span style={{ color: SENTIMENT_COLORS.positive }}>Positive: {typeof data.positive === 'number' ? data.positive.toFixed(1) : data.positive}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: SENTIMENT_COLORS.neutral }}>Neutral: {typeof data.neutral === 'number' ? data.neutral.toFixed(1) : data.neutral}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: SENTIMENT_COLORS.negative }}>Negative: {typeof data.negative === 'number' ? data.negative.toFixed(1) : data.negative}%</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Platform Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {chartData.map((platform, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div 
                className="w-3 h-3 rounded" 
                style={{ backgroundColor: platform.color }}
              />
              <span className="text-sm font-medium text-gray-900">
                {platform.platform}
              </span>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <div>{typeof platform.mentions === 'number' ? platform.mentions.toLocaleString() : platform.mentions} mentions</div>
              <div>{typeof platform.sentiment === 'number' ? platform.sentiment.toFixed(1) : platform.sentiment}% sentiment</div>
              <div>{typeof platform.engagement === 'number' ? platform.engagement.toFixed(2) : platform.engagement}% engagement</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="platform" 
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
            
            <Bar 
              dataKey="sentiment" 
              radius={[4, 4, 0, 0]}
              name="Average Sentiment"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Platform Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="font-medium text-green-800">Most Positive</span>
          </div>
          <div className="text-green-700">
            {chartData.reduce((prev, current) => 
              prev.sentiment > current.sentiment ? prev : current
            ).platform}
          </div>
        </div>
        
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="font-medium text-blue-800">Most Active</span>
          </div>
          <div className="text-blue-700">
            {chartData.reduce((prev, current) => 
              prev.mentions > current.mentions ? prev : current
            ).platform}
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-purple-500"></div>
            <span className="font-medium text-purple-800">Highest Engagement</span>
          </div>
          <div className="text-purple-700">
            {chartData.reduce((prev, current) => 
              prev.engagement > current.engagement ? prev : current
            ).platform}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlatformBreakdown;