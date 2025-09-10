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
import { ChartConfigUtils } from '../../constants/configurations/chart-configs';
import { ChartTypes, LoadingStates } from '../../constants/enums';
import { ERROR_MESSAGES, INFO_MESSAGES } from '../../constants/messages';
import { convertToChartData, generateFilteredChartData, simulateDataLoading } from '../../lib/chartDataUtils';
import { useChartFilterStore } from '../../stores/chartFilterStore';
import type { ChartFilter } from '../../types';
import { calculateDataCompleteness } from '../../utils/nullSafeRendering';

interface SentimentChartProps {
  isLoading?: boolean;
  loadingState?: LoadingStates;
  data?: Array<{
    date: string;
    positive: number;
    neutral: number;
    negative: number;
  }> | null;
  height?: number;
  filter?: ChartFilter;
  onFilterChange?: (filter: ChartFilter) => void;
  showFilters?: boolean;
  showExport?: boolean;
  errorMessage?: string;
  dataQualityThreshold?: number;
}

const SentimentChart: React.FC<SentimentChartProps> = ({ 
  isLoading = false,
  loadingState = LoadingStates.IDLE,
  data,
  height,
  filter,
  onFilterChange,
  showFilters = true,
  showExport = true,
  errorMessage,
  dataQualityThreshold = 0.7
}) => {
  const { chartFilter, setTimeRange } = useChartFilterStore();
  const [internalLoading, setInternalLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [dataQuality, setDataQuality] = useState<{ score: number; completeness: number } | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Use provided filter or store filter
  const activeFilter = filter || chartFilter;
  
  // Get chart configuration
  const chartConfig = ChartConfigUtils.getConfiguration(ChartTypes.LINE);
  const responsiveConfig = ChartConfigUtils.getResponsiveConfig(window.innerWidth);
  const actualHeight = height || chartConfig.defaultHeight;

  // Mobile detection and data quality assessment
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Assess data quality when data changes
  useEffect(() => {
    if (data && Array.isArray(data)) {
      const requiredFields = ['date', 'positive', 'neutral', 'negative'];
      const totalDataPoints = data.length;
      let validDataPoints = 0;
      
      data.forEach(item => {
        const quality = calculateDataCompleteness(item, requiredFields);
        if (quality.score >= dataQualityThreshold) {
          validDataPoints++;
        }
      });
      
      const completeness = totalDataPoints > 0 ? (validDataPoints / totalDataPoints) * 100 : 0;
      setDataQuality({
        score: totalDataPoints > 0 ? validDataPoints / totalDataPoints : 0,
        completeness
      });
    } else {
      setDataQuality(null);
    }
  }, [data, dataQualityThreshold]);

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

  // Handle loading states
  if (isLoading || internalLoading || loadingState === LoadingStates.LOADING) {
    return (
      <div className="animate-pulse" style={{ height: actualHeight + (showFilters ? 60 : 0) }}>
        <div className="bg-gray-200 rounded-lg h-full flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">{INFO_MESSAGES.LOADING_CHARTS}</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle error states
  if (loadingState === LoadingStates.ERROR || errorMessage) {
    return (
      <div className="border border-red-200 bg-red-50 rounded-lg p-6" style={{ height: actualHeight + (showFilters ? 60 : 0) }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-medium text-red-800 mb-2">Chart Error</h3>
            <p className="text-red-600">{errorMessage || ERROR_MESSAGES.CHART_RENDER_ERROR}</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle no data state - check chartData (internal state) instead of external data prop
  if (!internalLoading && (!chartData || !Array.isArray(chartData) || chartData.length === 0)) {
    return (
      <div className="border border-gray-200 bg-gray-50 rounded-lg p-6" style={{ height: actualHeight + (showFilters ? 60 : 0) }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Data Available</h3>
            <p className="text-gray-600">{INFO_MESSAGES.CHART_NO_DATA}</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle poor data quality
  if (dataQuality && dataQuality.score < dataQualityThreshold) {
    return (
      <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-6" style={{ height: actualHeight + (showFilters ? 60 : 0) }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <svg className="w-12 h-12 text-yellow-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <h3 className="text-lg font-medium text-yellow-800 mb-2">Poor Data Quality</h3>
            <p className="text-yellow-700">
              {INFO_MESSAGES.CHART_INSUFFICIENT_DATA} 
              <br />
              Data completeness: {dataQuality.completeness.toFixed(1)}%
            </p>
          </div>
        </div>
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
            {/* {showExport && (
              <ExportButton
                chartElement={chartRef.current}
                chartType="sentiment-trends"
                data={chartData}
                filters={activeFilter}
                view="dashboard"
                size={isMobile ? 'sm' : 'md'}
                className="mr-2"
              />
            )} */}
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
      {/* Data Quality Indicator */}
      {dataQuality && dataQuality.completeness < 100 && (
        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-yellow-800 text-sm">
              <strong>Note:</strong> {Math.round(100 - dataQuality.completeness)}% of data points are missing or incomplete. 
              Results may not represent the complete picture.
            </p>
          </div>
        </div>
      )}

      <div style={{ height: actualHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: responsiveConfig.padding / 2,
              right: isMobile ? responsiveConfig.padding / 2 : responsiveConfig.padding,
              left: isMobile ? responsiveConfig.padding / 2 : responsiveConfig.padding,
              bottom: responsiveConfig.padding / 2,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={responsiveConfig.fontSize}
              tickLine={false}
              axisLine={false}
              interval={isMobile ? 'preserveStartEnd' : 'preserveStart'}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={responsiveConfig.fontSize}
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
                paddingTop: `${responsiveConfig.padding}px`,
                fontSize: `${responsiveConfig.fontSize}px`
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