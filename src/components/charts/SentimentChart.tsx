import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Use provided filter or store filter
  const activeFilter = filter || chartFilter;

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Touch handlers for swipe gestures
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe || isRightSwipe) {
      const timeRanges: ChartFilter['timeRange'][] = ['7d', '30d', '3m', '1y'];
      const currentIndex = timeRanges.indexOf(activeFilter.timeRange);
      
      let newIndex = currentIndex;
      if (isLeftSwipe && currentIndex < timeRanges.length - 1) {
        newIndex = currentIndex + 1;
      } else if (isRightSwipe && currentIndex > 0) {
        newIndex = currentIndex - 1;
      }
      
      if (newIndex !== currentIndex) {
        handleFilterChange({ timeRange: timeRanges[newIndex] });
      }
    }
  }, [touchStart, touchEnd, activeFilter.timeRange]);
  
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
        <div className={`bg-white p-3 border border-gray-200 rounded-lg shadow-lg ${
          isMobile ? 'text-sm max-w-xs' : 'p-4'
        }`}>
          <p className={`font-medium text-gray-900 mb-2 ${isMobile ? 'text-sm' : ''}`}>
            {label}
          </p>
          {payload.map((entry, index: number) => (
            <div key={index} className={`flex items-center space-x-2 ${
              isMobile ? 'text-xs' : 'text-sm'
            }`}>
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-gray-600 truncate">{entry.name}:</span>
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
    <div 
      ref={chartRef}
      style={{ height: height + (showFilters ? (isMobile ? 80 : 60) : 0) }}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchMove={isMobile ? handleTouchMove : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
      className={isMobile ? 'touch-pan-y' : ''}
    >
      {showFilters && (
        <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'justify-between items-center'} mb-4`}>
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 dark:text-gray-100`}>
            Sentiment Trends
          </h3>
          <div className="flex items-center space-x-2">
            {isMobile ? (
              // Mobile: Horizontal scrollable buttons
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {[
                  { value: '7d', label: '7d' },
                  { value: '30d', label: '30d' },
                  { value: '3m', label: '3m' },
                  { value: '1y', label: '1y' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleFilterChange({ 
                      timeRange: option.value as ChartFilter['timeRange'] 
                    })}
                    className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                      activeFilter.timeRange === option.value
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : (
              // Desktop: Select dropdown
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
            )}
          </div>
          {isMobile && (
            <div className="text-xs text-gray-500 text-center">
              Swipe left/right to change time period
            </div>
          )}
        </div>
      )}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: isMobile ? 10 : 30,
              left: isMobile ? 10 : 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={isMobile ? 10 : 12}
              tickLine={false}
              axisLine={false}
              interval={isMobile ? 'preserveStartEnd' : 'preserveStart'}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={isMobile ? 10 : 12}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              width={isMobile ? 35 : 50}
            />
            <Tooltip 
              content={<CustomTooltip />}
              position={isMobile ? { x: 0, y: 0 } : undefined}
            />
            <Legend 
              wrapperStyle={{ 
                paddingTop: '20px',
                fontSize: isMobile ? '12px' : '14px'
              }}
              iconType="circle"
              layout={isMobile ? 'horizontal' : 'horizontal'}
            />
            
            {/* Sentiment line */}
            <Line
              type="monotone"
              dataKey="sentiment"
              stroke={SENTIMENT_COLORS.neutral}
              strokeWidth={isMobile ? 2 : 3}
              dot={{ fill: SENTIMENT_COLORS.neutral, strokeWidth: 2, r: isMobile ? 3 : 4 }}
              activeDot={{ r: isMobile ? 5 : 6, stroke: SENTIMENT_COLORS.neutral, strokeWidth: 2 }}
              name="Overall Sentiment"
            />
            
            {/* Positive sentiment line */}
            <Line
              type="monotone"
              dataKey="positive"
              stroke={SENTIMENT_COLORS.positive}
              strokeWidth={isMobile ? 1.5 : 2}
              dot={false}
              strokeDasharray="5 5"
              name="Positive %"
            />
            
            {/* Negative sentiment line */}
            <Line
              type="monotone"
              dataKey="negative"
              stroke={SENTIMENT_COLORS.negative}
              strokeWidth={isMobile ? 1.5 : 2}
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