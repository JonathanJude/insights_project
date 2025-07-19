import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { SENTIMENT_COLORS } from '../../constants';

interface DemographicData {
  category: string;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
}

interface DemographicsChartProps {
  data?: {
    gender: DemographicData[];
    ageGroup: DemographicData[];
    state: DemographicData[];
  };
  isLoading?: boolean;
  height?: number;
}

type ViewType = 'gender' | 'ageGroup' | 'state';

const DemographicsChart: React.FC<DemographicsChartProps> = ({ 
  data, 
  isLoading = false,
  height = 400 
}) => {
  const [activeView, setActiveView] = useState<ViewType>('gender');
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

  // Mock data if none provided
  const mockData = {
    gender: [
      { category: 'Male', positive: 45, neutral: 35, negative: 20, total: 12500 },
      { category: 'Female', positive: 52, neutral: 28, negative: 20, total: 11800 },
      { category: 'Other', positive: 48, neutral: 32, negative: 20, total: 700 }
    ],
    ageGroup: [
      { category: '18-25', positive: 38, neutral: 42, negative: 20, total: 8500 },
      { category: '26-35', positive: 48, neutral: 32, negative: 20, total: 9200 },
      { category: '36-45', positive: 52, neutral: 28, negative: 20, total: 6800 },
      { category: '46-55', positive: 46, neutral: 34, negative: 20, total: 4200 },
      { category: '55+', positive: 44, neutral: 36, negative: 20, total: 3300 }
    ],
    state: [
      { category: 'Lagos', positive: 48, neutral: 32, negative: 20, total: 5500 },
      { category: 'Abuja', positive: 52, neutral: 28, negative: 20, total: 4200 },
      { category: 'Kano', positive: 42, neutral: 38, negative: 20, total: 3800 },
      { category: 'Rivers', positive: 46, neutral: 34, negative: 20, total: 2900 },
      { category: 'Oyo', positive: 44, neutral: 36, negative: 20, total: 2600 }
    ]
  };

  const chartData = data || mockData;
  const currentData = chartData[activeView];

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
      value: number;
      dataKey: string;
      color: string;
      payload: DemographicData;
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum: number, entry) => sum + entry.value, 0);
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            {payload.map((entry, index: number) => (
              <div key={index} className="flex items-center justify-between space-x-4">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-gray-600 capitalize">{entry.dataKey}:</span>
                </div>
                <span className="font-medium text-gray-900">
                  {entry.value}% ({Math.round(entry.value * total / 100).toLocaleString()})
                </span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total:</span>
                <span className="font-medium">{total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: {
    active?: boolean;
    payload?: Array<{
      payload: {
        category: string;
        positive: number;
        neutral: number;
        negative: number;
        total: number;
      };
    }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{data.category}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between space-x-4">
              <span className="text-gray-600">Positive:</span>
              <span className="font-medium text-green-600">{data.positive}%</span>
            </div>
            <div className="flex justify-between space-x-4">
              <span className="text-gray-600">Neutral:</span>
              <span className="font-medium text-gray-600">{data.neutral}%</span>
            </div>
            <div className="flex justify-between space-x-4">
              <span className="text-gray-600">Negative:</span>
              <span className="font-medium text-red-600">{data.negative}%</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Mentions:</span>
                <span className="font-medium">{data.total.toLocaleString()}</span>
              </div>
            </div>
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

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex space-x-2">
          {Object.keys(chartData).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view as ViewType)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeView === view
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {view === 'ageGroup' ? 'Age Group' : view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 rounded text-sm ${
              chartType === 'bar'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Bar Chart
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 py-1 rounded text-sm ${
              chartType === 'pie'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Pie Chart
          </button>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart
              data={currentData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="category" 
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
              
              <Bar 
                dataKey="positive" 
                stackId="sentiment"
                fill={SENTIMENT_COLORS.positive}
                radius={[0, 0, 0, 0]}
                name="Positive"
              />
              <Bar 
                dataKey="neutral" 
                stackId="sentiment"
                fill={SENTIMENT_COLORS.neutral}
                radius={[0, 0, 0, 0]}
                name="Neutral"
              />
              <Bar 
                dataKey="negative" 
                stackId="sentiment"
                fill={SENTIMENT_COLORS.negative}
                radius={[4, 4, 0, 0]}
                name="Negative"
              />
            </BarChart>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
              {currentData.slice(0, 6).map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">{item.category}</h4>
                  <div className="w-32 h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Positive', value: item.positive, fill: SENTIMENT_COLORS.positive },
                            { name: 'Neutral', value: item.neutral, fill: SENTIMENT_COLORS.neutral },
                            { name: 'Negative', value: item.negative, fill: SENTIMENT_COLORS.negative }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={20}
                          outerRadius={60}
                          dataKey="value"
                        >
                          {[SENTIMENT_COLORS.positive, SENTIMENT_COLORS.neutral, SENTIMENT_COLORS.negative].map((color, idx) => (
                            <Cell key={`cell-${idx}`} fill={color} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {item.total.toLocaleString()} mentions
                  </div>
                </div>
              ))}
            </div>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-green-800 font-medium">Avg Positive</div>
          <div className="text-green-600 text-lg font-bold">
            {(currentData.reduce((sum, item) => sum + item.positive, 0) / currentData.length).toFixed(1)}%
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-gray-800 font-medium">Avg Neutral</div>
          <div className="text-gray-600 text-lg font-bold">
            {(currentData.reduce((sum, item) => sum + item.neutral, 0) / currentData.length).toFixed(1)}%
          </div>
        </div>
        <div className="bg-red-50 rounded-lg p-3">
          <div className="text-red-800 font-medium">Avg Negative</div>
          <div className="text-red-600 text-lg font-bold">
            {(currentData.reduce((sum, item) => sum + item.negative, 0) / currentData.length).toFixed(1)}%
          </div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-blue-800 font-medium">Total Mentions</div>
          <div className="text-blue-600 text-lg font-bold">
            {currentData.reduce((sum, item) => sum + item.total, 0).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemographicsChart;