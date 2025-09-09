import React, { useCallback, useEffect, useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { POLITICAL_PARTIES } from '../../constants';
import { simulateDataLoading } from '../../lib/chartDataUtils';
import { useChartFilterStore } from '../../stores/chartFilterStore';
import { PoliticalParty, type ChartFilter } from '../../types';

interface PartyDistributionChartProps {
  data?: Record<PoliticalParty, number>;
  isLoading?: boolean;
  height?: number;
  filter?: ChartFilter;
  onFilterChange?: (filter: ChartFilter) => void;
  showFilters?: boolean;
}

const COLORS: Record<PoliticalParty, string> = {
  [PoliticalParty.APC]: '#FF6B6B',
  [PoliticalParty.PDP]: '#4ECDC4', 
  [PoliticalParty.LP]: '#45B7D1',
  [PoliticalParty.NNPP]: '#96CEB4',
  [PoliticalParty.APGA]: '#FFEAA7',
  [PoliticalParty.ADC]: '#FF9F43',
  [PoliticalParty.SDP]: '#A55EEA',
  [PoliticalParty.YPP]: '#26DE81',
  [PoliticalParty.OTHER]: '#DDA0DD'
};

const PartyDistributionChart: React.FC<PartyDistributionChartProps> = ({ 
  data, 
  isLoading = false, 
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
        const formattedData = Object.entries(data).map(([party, percentage]) => {
          const partyInfo = POLITICAL_PARTIES.find(p => p.value === party);
          return {
            name: partyInfo?.label || party,
            value: percentage,
            party: party as PoliticalParty
          };
        });
        setChartData(formattedData);
        return;
      }
      
      setInternalLoading(true);
      await simulateDataLoading(200);
      
      // Generate mock data based on filter
      const mockData: Record<PoliticalParty, number> = {
        [PoliticalParty.APC]: 35.2 * (activeFilter.timeRange === '7d' ? 1.1 : 1),
        [PoliticalParty.PDP]: 28.5 * (activeFilter.timeRange === '7d' ? 0.9 : 1),
        [PoliticalParty.LP]: 15.3 * (activeFilter.timeRange === '3m' ? 1.2 : 1),
        [PoliticalParty.NNPP]: 8.7,
        [PoliticalParty.APGA]: 4.2,
        [PoliticalParty.ADC]: 3.1,
        [PoliticalParty.SDP]: 2.8,
        [PoliticalParty.YPP]: 1.5,
        [PoliticalParty.OTHER]: 0.7
      };
      
      const formattedData = Object.entries(mockData).map(([party, percentage]) => {
        const partyInfo = POLITICAL_PARTIES.find(p => p.value === party);
        return {
          name: partyInfo?.label || party,
          value: percentage,
          party: party as PoliticalParty
        };
      });
      
      setChartData(formattedData);
      setInternalLoading(false);
    };
    
    generateData();
  }, [activeFilter, data]);

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

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: {
    cx?: number;
    cy?: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    percent?: number;
  }) => {
    if (!cx || !cy || !midAngle || !innerRadius || !outerRadius || !percent) return null;
    if (percent < 0.05) return null; // Don't show labels for slices < 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomTooltip = ({ active, payload }: {
    active?: boolean;
    payload?: Array<{
      payload: {
        name: string;
        value: number;
        party: PoliticalParty;
      };
    }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`bg-white p-3 border border-gray-200 rounded-lg shadow-lg ${
          isMobile ? 'max-w-xs' : ''
        }`}>
          <p className={`font-medium text-gray-900 ${isMobile ? 'text-sm' : ''}`}>
            {data.name}
          </p>
          <p className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {data.value.toFixed(1)}% of mentions
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      style={{ height: height + (showFilters ? (isMobile ? 80 : 60) : 0) }}
      onTouchStart={isMobile ? handleTouchStart : undefined}
      onTouchMove={isMobile ? handleTouchMove : undefined}
      onTouchEnd={isMobile ? handleTouchEnd : undefined}
      className={isMobile ? 'touch-pan-y' : ''}
    >
      {showFilters && (
        <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'justify-between items-center'} mb-4`}>
          <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-900 dark:text-gray-100`}>
            Party Distribution
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
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={isMobile ? false : renderCustomizedLabel}
            outerRadius={isMobile ? 60 : 80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.party as PoliticalParty] || COLORS[PoliticalParty.OTHER]} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            verticalAlign="bottom" 
            height={isMobile ? 50 : 36}
            wrapperStyle={{
              fontSize: isMobile ? '12px' : '14px',
              paddingTop: isMobile ? '10px' : '0px'
            }}
            formatter={(value, entry: { color?: string }) => (
              <span style={{ color: entry.color || '#000' }}>
                {isMobile && value.length > 8 ? value.substring(0, 8) + '...' : value}
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PartyDistributionChart;