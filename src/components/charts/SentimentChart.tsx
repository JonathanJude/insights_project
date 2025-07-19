import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { generateTrendPoints } from '../../mock';
import { SENTIMENT_COLORS } from '../../constants';

interface SentimentChartProps {
  isLoading?: boolean;
  data?: Array<{
    date: string;
    positive: number;
    neutral: number;
    negative: number;
  }>;
  height?: number;
}

const SentimentChart: React.FC<SentimentChartProps> = ({ 
  isLoading = false, 
  data,
  height = 300 
}) => {
  // Generate mock data if none provided
  const chartData = data || generateTrendPoints(30).map(point => ({
    date: new Date(point.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    sentiment: (point.value + 1) * 50, // Convert -1 to 1 range to 0-100
    mentions: point.metadata?.mentionCount || 0,
    engagement: (point.metadata?.engagementCount || 0) * 100,
    positive: Math.max(0, point.value) * 100,
    negative: Math.abs(Math.min(0, point.value)) * 100
  }));

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
      value: number;
      dataKey: string;
      color: string;
      name: string;
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index: number) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600">{entry.name}:</span>
              <span className="font-medium text-gray-900">
                {entry.name === 'Mentions' 
                  ? entry.value.toLocaleString()
                  : `${entry.value.toFixed(1)}${entry.name.includes('%') ? '' : '%'}`
                }
              </span>
            </div>
          ))}
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

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
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
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          
          {/* Sentiment line */}
          <Line
            type="monotone"
            dataKey="sentiment"
            stroke={SENTIMENT_COLORS.neutral}
            strokeWidth={3}
            dot={{ fill: SENTIMENT_COLORS.neutral, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: SENTIMENT_COLORS.neutral, strokeWidth: 2 }}
            name="Overall Sentiment"
          />
          
          {/* Positive sentiment line */}
          <Line
            type="monotone"
            dataKey="positive"
            stroke={SENTIMENT_COLORS.positive}
            strokeWidth={2}
            dot={false}
            strokeDasharray="5 5"
            name="Positive %"
          />
          
          {/* Negative sentiment line */}
          <Line
            type="monotone"
            dataKey="negative"
            stroke={SENTIMENT_COLORS.negative}
            strokeWidth={2}
            dot={false}
            strokeDasharray="5 5"
            name="Negative %"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SentimentChart;