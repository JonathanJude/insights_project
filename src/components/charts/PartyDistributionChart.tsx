import React, { useEffect, useState } from 'react';
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
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            {data.value.toFixed(1)}% of mentions
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ height: height + (showFilters ? 60 : 0) }}>
      {showFilters && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Party Distribution
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
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
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
            height={36}
            formatter={(value, entry: { color?: string }) => (
              <span style={{ color: entry.color || '#000' }}>
                {value}
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