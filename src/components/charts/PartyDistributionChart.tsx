import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { PoliticalParty } from '../../types';
import { POLITICAL_PARTIES } from '../../constants';

interface PartyDistributionChartProps {
  data: Record<PoliticalParty, number>;
  isLoading?: boolean;
  height?: number;
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
  height = 300 
}) => {
  if (isLoading) {
    return (
      <div className="animate-pulse" style={{ height }}>
        <div className="h-full bg-gray-200 rounded"></div>
      </div>
    );
  }

  const chartData = Object.entries(data).map(([party, percentage]) => {
    const partyInfo = POLITICAL_PARTIES.find(p => p.value === party);
    return {
      name: partyInfo?.label || party,
      value: percentage,
      party: party as PoliticalParty
    };
  });

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
                fill={COLORS[entry.party] || COLORS[PoliticalParty.OTHER]} 
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
  );
};

export default PartyDistributionChart;