import React, { useEffect, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Line,
    LineChart,
    PolarAngleAxis,
    PolarGrid,
    PolarRadiusAxis,
    Radar,
    RadarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import { POLITICAL_PARTIES, SENTIMENT_COLORS } from '../../constants';
import { simulateDataLoading } from '../../lib/chartDataUtils';
import type { PartyInsight } from '../../types';

interface PartyCompareChartProps {
  data: PartyInsight[];
  isLoading?: boolean;
  height?: number;
  selectedParties?: string[];
  enableDrillDown?: boolean;
  showExportButtons?: boolean;
  chartType?: 'bar' | 'radar' | 'line' | 'comparison';
  metric?: 'sentiment' | 'mentions' | 'engagement';
  onPartyClick?: (party: string) => void;
  onExport?: (format: string) => void;
}

const PartyCompareChart: React.FC<PartyCompareChartProps> = ({
  data,
  isLoading = false,
  height = 400,
  selectedParties = [],
  enableDrillDown = false,
  showExportButtons = false,
  chartType = 'comparison',
  metric = 'sentiment',
  onPartyClick,
  onExport
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      if (isLoading) return;
      
      setInternalLoading(true);
      await simulateDataLoading();
      
      // Process data based on metric and chart type
      const processedData = data.map((party) => {
        const partyInfo = POLITICAL_PARTIES.find(p => p.value === party.party);
        const sentimentScore = (party.overallSentiment.positive - party.overallSentiment.negative);
        
        return {
          party: partyInfo?.label || party.party,
          partyCode: party.party,
          color: partyInfo?.color || '#8884d8',
          sentiment: sentimentScore,
          mentions: party.totalMentions,
          engagement: party.totalEngagement,
          positive: party.overallSentiment.positive,
          neutral: party.overallSentiment.neutral,
          negative: party.overallSentiment.negative,
          // For radar chart
          sentimentNormalized: Math.max(0, (sentimentScore + 100) / 2), // Convert -100 to 100 range to 0-100
          mentionsNormalized: Math.min(100, (party.totalMentions / 1000) * 10), // Normalize mentions
          engagementNormalized: Math.min(100, (party.totalEngagement / 10000) * 10) // Normalize engagement
        };
      });

      setChartData(processedData);
      setInternalLoading(false);
    };

    loadData();
  }, [data, isLoading, metric]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getMetricValue = (item: any) => {
    switch (metric) {
      case 'sentiment':
        return item.sentiment;
      case 'mentions':
        return item.mentions;
      case 'engagement':
        return item.engagement;
      default:
        return item.sentiment;
    }
  };

  const getMetricLabel = () => {
    switch (metric) {
      case 'sentiment':
        return 'Sentiment Score';
      case 'mentions':
        return 'Total Mentions';
      case 'engagement':
        return 'Total Engagement';
      default:
        return 'Sentiment Score';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 mb-2">{data.party}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between space-x-4">
              <span className="text-gray-600">Sentiment:</span>
              <span className="font-medium" style={{ 
                color: data.sentiment >= 0 ? SENTIMENT_COLORS.positive : SENTIMENT_COLORS.negative 
              }}>
                {data.sentiment.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between space-x-4">
              <span className="text-gray-600">Mentions:</span>
              <span className="font-medium text-gray-900">{formatNumber(data.mentions)}</span>
            </div>
            <div className="flex justify-between space-x-4">
              <span className="text-gray-600">Engagement:</span>
              <span className="font-medium text-gray-900">{formatNumber(data.engagement)}</span>
            </div>
            <div className="border-t pt-2 mt-2">
              <div className="text-xs text-gray-500 mb-1">Sentiment Breakdown:</div>
              <div className="flex justify-between text-xs">
                <span style={{ color: SENTIMENT_COLORS.positive }}>
                  Positive: {data.positive.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: SENTIMENT_COLORS.neutral }}>
                  Neutral: {data.neutral.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: SENTIMENT_COLORS.negative }}>
                  Negative: {data.negative.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const handlePartyClick = (data: any) => {
    if (enableDrillDown && onPartyClick) {
      onPartyClick(data.partyCode);
    }
  };

  const handleExport = (format: string) => {
    if (showExportButtons && onExport) {
      onExport(format);
    }
  };

  if (isLoading || internalLoading) {
    return (
      <div style={{ height }} className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg font-medium">No data available</p>
          <p className="text-sm">Try adjusting your filters or date range</p>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="party" 
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
              tickFormatter={(value) => metric === 'sentiment' ? `${value}%` : formatNumber(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              dataKey={metric}
              radius={[4, 4, 0, 0]}
              name={getMetricLabel()}
              onClick={handlePartyClick}
              style={{ cursor: enableDrillDown ? 'pointer' : 'default' }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        );

      case 'radar':
        const radarData = chartData.map(item => ({
          party: item.party,
          sentiment: item.sentimentNormalized,
          mentions: item.mentionsNormalized,
          engagement: item.engagementNormalized
        }));

        return (
          <RadarChart data={radarData} margin={{ top: 20, right: 80, bottom: 20, left: 80 }}>
            <PolarGrid />
            <PolarAngleAxis dataKey="party" fontSize={12} />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              fontSize={10}
              tickFormatter={(value) => `${value}`}
            />
            <Radar
              name="Sentiment"
              dataKey="sentiment"
              stroke={SENTIMENT_COLORS.positive}
              fill={SENTIMENT_COLORS.positive}
              fillOpacity={0.1}
              strokeWidth={2}
            />
            <Radar
              name="Mentions"
              dataKey="mentions"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.1}
              strokeWidth={2}
            />
            <Radar
              name="Engagement"
              dataKey="engagement"
              stroke="#82ca9d"
              fill="#82ca9d"
              fillOpacity={0.1}
              strokeWidth={2}
            />
            <Tooltip />
            <Legend />
          </RadarChart>
        );

      case 'line':
        // For line chart, we'll show trend over time (simplified for now)
        return (
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="party" 
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
              tickFormatter={(value) => metric === 'sentiment' ? `${value}%` : formatNumber(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey={metric}
              stroke="#8884d8"
              strokeWidth={3}
              dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#8884d8', strokeWidth: 2 }}
              name={getMetricLabel()}
            />
          </LineChart>
        );

      case 'comparison':
      default:
        // Side-by-side comparison view
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6" style={{ minHeight: '500px', paddingBottom: '80px' }}>
            {chartData.map((party, index) => (
              <div 
                key={party.partyCode}
                className={`bg-gray-50 rounded-lg p-4 border-2 transition-all ${
                  enableDrillDown ? 'hover:shadow-md cursor-pointer hover:border-blue-300' : 'border-gray-200'
                }`}
                onClick={() => handlePartyClick(party)}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: party.color }}
                  />
                  <h4 className="text-lg font-semibold text-gray-900">{party.party}</h4>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sentiment</span>
                    <span 
                      className="text-lg font-bold"
                      style={{ 
                        color: party.sentiment >= 0 ? SENTIMENT_COLORS.positive : SENTIMENT_COLORS.negative 
                      }}
                    >
                      {party.sentiment.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Mentions</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatNumber(party.mentions)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Engagement</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatNumber(party.engagement)}
                    </span>
                  </div>
                  
                  {/* Sentiment breakdown bar */}
                  <div className="pt-2">
                    <div className="text-xs text-gray-500 mb-1">Sentiment Breakdown</div>
                    <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="bg-green-500"
                        style={{ width: `${party.positive}%` }}
                      />
                      <div 
                        className="bg-yellow-500"
                        style={{ width: `${party.neutral}%` }}
                      />
                      <div 
                        className="bg-red-500"
                        style={{ width: `${party.negative}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{party.positive.toFixed(0)}%</span>
                      <span>{party.neutral.toFixed(0)}%</span>
                      <span>{party.negative.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div>
      {showExportButtons && (
        <div className="flex justify-end space-x-2 mb-4">
          <button
            onClick={() => handleExport('csv')}
            className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
          >
            Export CSV
          </button>
          <button
            onClick={() => handleExport('png')}
            className="text-sm px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
          >
            Export PNG
          </button>
        </div>
      )}
      
      <div className="w-full">
        {chartType === 'comparison' ? (
          renderChart()
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            {renderChart()}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default PartyCompareChart;