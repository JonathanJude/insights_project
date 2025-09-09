import React, { useEffect, useRef, useState } from 'react';
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
import { simulateDataLoading } from '../../lib/chartDataUtils';
import { useChartFilterStore } from '../../stores/chartFilterStore';
import type { ChartFilter, PlatformSentiment } from '../../types';
import { SocialPlatform } from '../../types';
import ExportButton from '../ui/ExportButton';

interface PlatformBreakdownProps {
  data?: PlatformSentiment[];
  isLoading?: boolean;
  height?: number;
  filter?: ChartFilter;
  onFilterChange?: (filter: ChartFilter) => void;
  showFilters?: boolean;
  showExport?: boolean;
}

const PlatformBreakdown: React.FC<PlatformBreakdownProps> = ({ 
  data, 
  isLoading = false,
  height = 300,
  filter,
  onFilterChange,
  showFilters = true,
  showExport = true
}) => {
  const { chartFilter, setTimeRange } = useChartFilterStore();
  const [internalLoading, setInternalLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const chartRef = useRef<HTMLDivElement>(null);
  
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
      if (data && data.length > 0) {
        const formattedData = data.map(platform => {
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
        setChartData(formattedData);
        return;
      }
      
      setInternalLoading(true);
      await simulateDataLoading(200);
      
      // Generate mock data based on filter
      const mockPlatforms: SocialPlatform[] = [SocialPlatform.TWITTER, SocialPlatform.FACEBOOK, SocialPlatform.INSTAGRAM, SocialPlatform.THREADS, SocialPlatform.YOUTUBE];
      const formattedData = mockPlatforms.map(platform => {
        const platformInfo = SOCIAL_PLATFORMS.find(p => p.value === platform);
        const baseMultiplier = activeFilter.timeRange === '7d' ? 0.3 : activeFilter.timeRange === '1y' ? 3.5 : 1;
        
        return {
          platform: platformInfo?.label || platform,
          mentions: Math.floor((Math.random() * 5000 + 1000) * baseMultiplier),
          sentiment: Math.random() * 40 + 30, // 30-70% sentiment
          positive: Math.random() * 30 + 20,
          neutral: Math.random() * 40 + 30,
          negative: Math.random() * 20 + 10,
          engagement: Math.random() * 15 + 5,
          color: platformInfo?.color || '#6b7280',
          icon: platformInfo?.icon
        };
      });
      
      setChartData(formattedData);
      setInternalLoading(false);
    };
    
    generateData();
  }, [activeFilter, data]);

  if (isLoading || internalLoading) {
    return (
      <div className="animate-pulse" style={{ height: height + (showFilters ? 60 : 0) + 200 }}>
        {showFilters && (
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="h-8 bg-gray-200 rounded w-32"></div>
          </div>
        )}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded"></div>
          ))}
        </div>
        <div className="h-full bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height: height + (showFilters ? 60 : 0) }}>
        <p className="text-gray-500">No platform data available</p>
      </div>
    );
  }

  // Transform data for the chart - this is now handled in useEffect
  // const chartData = data.map(platform => {


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
    <div className="space-y-4" ref={chartRef}>
      {showFilters && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Platform Breakdown
          </h3>
          <div className="flex items-center space-x-2">
            {showExport && (
              <ExportButton
                chartElement={chartRef.current}
                chartType="platform-breakdown"
                data={chartData}
                filters={activeFilter}
                view="dashboard"
                size="md"
                className="mr-2"
              />
            )}
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