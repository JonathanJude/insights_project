import React, { useEffect, useState } from 'react';
import {
    CartesianGrid,
    Legend,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { SENTIMENT_COLORS } from '../../constants';
import { convertToChartData, generateFilteredChartData, simulateDataLoading } from '../../lib/chartDataUtils';
import { useChartFilterStore } from '../../stores/chartFilterStore';
import type { ChartFilter } from '../../types';

interface SentimentChartProps {
  isLoading?: boolean;
  data?: Array<{
    date: string;
    positive: number;
    neutral: number;
    negative: number;
  }>;
  height?: number;
  filter?: ChartFilter;
  onFilterChange?: (filter: ChartFilter) => void;
  showFilters?: boolean;
}

const SentimentChart: React.FC<SentimentChartProps> = ({ 
  isLoading = false, 
  data,
  height = 300,
  filter,
  onFilterChange,
  showFilters = true
}) => {
  const { chartFilter, setTimeRange } = useChartFilterStore();
  const [internalLoading, setInternalLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Use provided filter or store filter
  const activeFilter = filter || chartFilter;
  
  // Handle filter changes
  const handleFilterChange = async (newFilter: Partial<ChartFilter>) => {
    const updatedFilter = { ...activeFilter, ...newFilter };
    
    if (onFilterChange) {
      onFilterChange(updatedFilter);
    } else {
      // Update store if no external handler
      if (newFilter.timeRange) {
        setTimeRange(newFilter.timeRange);
      }
    }
    
    // Simulate loading for better UX
    setInternalLoading(true);
    await simulateDataLoading(300);
    setInternalLoading(false);
  };
  
  // Generate chart data based on filter
  useEffect(() => {
    const generateData = async () => {
      if (data) {
        setChartData(data);
        return;
      }
      
      setInternalLoading(true);
      await simulateDataLoading(200);
      
      const trendPoints = generateFilteredChartData(activeFilter);
      const formattedData = convertToChartData(trendPoints, activeFilter.timeRange);
      setChartData(formattedData);
      
      setInternalLoading(false);
    };
    
    generateData();
  }, [activeFilter, data]);

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

  if (isLoading || internalLoading) {
    return (
      <div className="animate-pulse" style={{ height: height + (showFilters ? 60 : 0) }}>
        {showFilters && (
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
        )}
        <div className="h-full bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div style={{ height: height + (showFilters ? 60 : 0) }}>
      {showFilters && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Sentiment Trends
          </h3>
          <div className="flex items-center space-x-2">
            <select 
              value={activeFilter.timeRange}
              onChange={(e) => handleFilterChange({ 
                timeRange: e.target.value as ChartFilter['timeRange'] 
              })}
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="3m">Last 3 months</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>
      )}
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
    </div>
  );
};

export default SentimentChart;