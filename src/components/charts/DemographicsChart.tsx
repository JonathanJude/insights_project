import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { SENTIMENT_COLORS } from '../../constants';
import { ChartConfigUtils } from '../../constants/configurations/chart-configs';
import { ChartTypes, LoadingStates } from '../../constants/enums';
import { ERROR_MESSAGES, INFO_MESSAGES } from '../../constants/messages';
import { simulateDataLoading } from '../../lib/chartDataUtils';
import { useChartFilterStore } from '../../stores/chartFilterStore';
import type { ChartFilter } from '../../types';
import ExportButton from '../ui/ExportButton';

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
  } | null;
  isLoading?: boolean;
  loadingState?: LoadingStates;
  height?: number;
  filter?: ChartFilter;
  onFilterChange?: (filter: ChartFilter) => void;
  showFilters?: boolean;
  showExport?: boolean;
  errorMessage?: string;
  dataQualityThreshold?: number;
}

type ViewType = 'gender' | 'ageGroup' | 'state';

const DemographicsChart: React.FC<DemographicsChartProps> = ({ 
  data, 
  isLoading = false,
  loadingState = LoadingStates.IDLE,
  height,
  filter,
  onFilterChange,
  showFilters = true,
  showExport = true,
  errorMessage,
  dataQualityThreshold = 0.7
}) => {
  const { chartFilter, setTimeRange } = useChartFilterStore();
  const [activeView, setActiveView] = useState<ViewType>('gender');
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [internalLoading, setInternalLoading] = useState(false);
  const [chartData, setChartData] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [dataQuality, setDataQuality] = useState<{ score: number; completeness: number } | null>(null);
  
  // Get chart configuration
  const chartConfig = ChartConfigUtils.getConfiguration(chartType === 'bar' ? ChartTypes.BAR : ChartTypes.PIE);
  const responsiveConfig = ChartConfigUtils.getResponsiveConfig(window.innerWidth);
  const actualHeight = height || chartConfig.defaultHeight;
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

  // Touch handlers for swipe gestures between views
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
      const views: ViewType[] = ['gender', 'ageGroup', 'state'];
      const currentIndex = views.indexOf(activeView);
      
      let newIndex = currentIndex;
      if (isLeftSwipe && currentIndex < views.length - 1) {
        newIndex = currentIndex + 1;
      } else if (isRightSwipe && currentIndex > 0) {
        newIndex = currentIndex - 1;
      }
      
      if (newIndex !== currentIndex) {
        setActiveView(views[newIndex]);
      }
    }
  }, [touchStart, touchEnd, activeView]);
  
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
      
      // Generate mock data based on filter - adjust values based on time range
      const timeMultiplier = activeFilter.timeRange === '7d' ? 0.3 : 
                           activeFilter.timeRange === '3m' ? 1.5 : 
                           activeFilter.timeRange === '1y' ? 4 : 1;
      
      const mockData = {
        gender: [
          { category: 'Male', positive: 45, neutral: 35, negative: 20, total: Math.floor(12500 * timeMultiplier) },
          { category: 'Female', positive: 52, neutral: 28, negative: 20, total: Math.floor(11800 * timeMultiplier) },
          { category: 'Other', positive: 48, neutral: 32, negative: 20, total: Math.floor(700 * timeMultiplier) }
        ],
        ageGroup: [
          { category: '18-25', positive: 38, neutral: 42, negative: 20, total: Math.floor(8500 * timeMultiplier) },
          { category: '26-35', positive: 48, neutral: 32, negative: 20, total: Math.floor(9200 * timeMultiplier) },
          { category: '36-45', positive: 52, neutral: 28, negative: 20, total: Math.floor(6800 * timeMultiplier) },
          { category: '46-55', positive: 46, neutral: 34, negative: 20, total: Math.floor(4200 * timeMultiplier) },
          { category: '55+', positive: 44, neutral: 36, negative: 20, total: Math.floor(3300 * timeMultiplier) }
        ],
        state: [
          { category: 'Lagos', positive: 48, neutral: 32, negative: 20, total: Math.floor(5500 * timeMultiplier) },
          { category: 'Abuja', positive: 52, neutral: 28, negative: 20, total: Math.floor(4200 * timeMultiplier) },
          { category: 'Kano', positive: 42, neutral: 38, negative: 20, total: Math.floor(3800 * timeMultiplier) },
          { category: 'Rivers', positive: 46, neutral: 34, negative: 20, total: Math.floor(2900 * timeMultiplier) },
          { category: 'Oyo', positive: 44, neutral: 36, negative: 20, total: Math.floor(2600 * timeMultiplier) }
        ]
      };
      
      setChartData(mockData);
      setInternalLoading(false);
    };
    
    generateData();
  }, [activeFilter, data]);

  const currentData = chartData ? chartData[activeView] : [];

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
        <div className={`bg-white p-3 border border-gray-200 rounded-lg shadow-lg ${
          isMobile ? 'max-w-xs text-sm' : 'p-4'
        }`}>
          <p className={`font-medium text-gray-900 mb-2 ${isMobile ? 'text-sm' : ''}`}>
            {label}
          </p>
          <div className={`space-y-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {payload.map((entry, index: number) => (
              <div key={index} className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-gray-600 capitalize truncate">{entry.dataKey}:</span>
                </div>
                <span className="font-medium text-gray-900">
                  {entry.value}%{!isMobile && ` (${Math.round(entry.value * total / 100).toLocaleString()})`}
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

  // Handle no data state - check chartData (internal state) after loading is complete
  if (!internalLoading && !chartData) {
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


  return (
    <div 
      ref={chartRef}
      className="space-y-4"
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchMove={isMobile ? handleTouchMove : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
    >
      {showFilters && (
        <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'justify-between items-center'} mb-4`}>
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 dark:text-gray-100`}>
            Demographics Analysis
          </h3>
          <div className="flex items-center space-x-2">
            {showExport && (
              <ExportButton
                chartElement={chartRef.current}
                chartType="demographics-analysis"
                data={currentData}
                filters={{ ...activeFilter, view: activeView, chartType }}
                view="dashboard"
                size={isMobile ? 'sm' : 'md'}
                className="mr-2"
              />
            )}
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
        </div>
      )}
      
      {/* Controls */}
      <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0'}`}>
        <div className={`flex ${isMobile ? 'overflow-x-auto pb-2' : 'space-x-2'} ${isMobile ? 'space-x-2' : ''}`}>
          {Object.keys(chartData || {}).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view as ViewType)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isMobile ? 'whitespace-nowrap' : ''} ${
                activeView === view
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {view === 'ageGroup' ? 'Age Group' : view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              chartType === 'bar'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Bar Chart
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              chartType === 'pie'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Pie Chart
          </button>
        </div>
      </div>

      {isMobile && (
        <div className="text-xs text-gray-500 text-center">
          Swipe left/right to change demographic view
        </div>
      )}

      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart
              data={currentData}
              margin={{
                top: 20,
                right: isMobile ? 10 : 30,
                left: isMobile ? 10 : 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="category" 
                stroke="#6b7280"
                fontSize={isMobile ? 10 : 12}
                tickLine={false}
                axisLine={false}
                interval={isMobile ? 0 : 'preserveStart'}
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? 'end' : 'middle'}
                height={isMobile ? 60 : 30}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={isMobile ? 10 : 12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
                width={isMobile ? 35 : 50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{
                  fontSize: isMobile ? '12px' : '14px'
                }}
              />
              
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
            <div className={`grid ${
              isMobile ? 'grid-cols-1 gap-6' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
            } h-full`}>
              {currentData.slice(0, isMobile ? 3 : 6).map((item: DemographicData, index: number) => (
                <div key={index} className="flex flex-col items-center">
                  <h4 className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium text-gray-900 dark:text-gray-100 mb-2`}>
                    {item.category}
                  </h4>
                  <div className={`${isMobile ? 'w-40 h-40' : 'w-32 h-32'}`}>
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
                          innerRadius={isMobile ? 25 : 20}
                          outerRadius={isMobile ? 75 : 60}
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
                  <div className={`${isMobile ? 'text-sm' : 'text-xs'} text-gray-600 dark:text-gray-400 mt-1`}>
                    {item.total.toLocaleString()} mentions
                  </div>
                </div>
              ))}
            </div>
          )}
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className={`grid ${isMobile ? 'grid-cols-2 gap-3' : 'grid-cols-2 md:grid-cols-4 gap-4'} ${isMobile ? 'text-xs' : 'text-sm'}`}>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <div className="text-green-800 dark:text-green-400 font-medium">Avg Positive</div>
          <div className={`text-green-600 dark:text-green-400 ${isMobile ? 'text-base' : 'text-lg'} font-bold`}>
            {(currentData.reduce((sum: number, item: DemographicData) => sum + item.positive, 0) / currentData.length).toFixed(1)}%
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
          <div className="text-gray-800 dark:text-gray-300 font-medium">Avg Neutral</div>
          <div className={`text-gray-600 dark:text-gray-400 ${isMobile ? 'text-base' : 'text-lg'} font-bold`}>
            {(currentData.reduce((sum: number, item: DemographicData) => sum + item.neutral, 0) / currentData.length).toFixed(1)}%
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
          <div className="text-red-800 dark:text-red-400 font-medium">Avg Negative</div>
          <div className={`text-red-600 dark:text-red-400 ${isMobile ? 'text-base' : 'text-lg'} font-bold`}>
            {(currentData.reduce((sum: number, item: DemographicData) => sum + item.negative, 0) / currentData.length).toFixed(1)}%
          </div>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div className="text-blue-800 dark:text-blue-400 font-medium">Total Mentions</div>
          <div className={`text-blue-600 dark:text-blue-400 ${isMobile ? 'text-base' : 'text-lg'} font-bold`}>
            {currentData.reduce((sum: number, item: DemographicData) => sum + item.total, 0).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemographicsChart;