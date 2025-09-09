import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { DemographicsChart, PartyCompareChart } from '../../components/charts';
import FilterBar from '../../components/filters/FilterBar';
import FilterIndicator from '../../components/filters/FilterIndicator';
import StatsCard from '../../components/ui/StatsCard';
import { POLITICAL_PARTIES, SENTIMENT_COLORS } from '../../constants';
import { generateFilteredDemographicsData, getPartyInsights, mockDashboardStats } from '../../mock';
import { useFilterStore } from '../../stores/filterStore';
import type { PartyInsight } from '../../types';

const PartyAnalytics: React.FC = () => {
  const { 
    selectedParties, 
    selectedStates, 
    selectedPlatforms, 
    dateRange,
    hasActiveFilters 
  } = useFilterStore();
  
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'sentiment' | 'mentions' | 'engagement'>('sentiment');
  const [chartType, setChartType] = useState<'bar' | 'radar' | 'line' | 'comparison'>('comparison');

  // Fetch party insights
  const { data: partyInsights, isLoading: insightsLoading } = useQuery({
    queryKey: ['partyInsights', selectedParties, selectedStates, selectedPlatforms, dateRange],
    queryFn: () => Promise.resolve(getPartyInsights())
  });

  // Fetch overall stats
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboardStats', selectedParties, selectedStates, selectedPlatforms, dateRange],
    queryFn: () => Promise.resolve(mockDashboardStats)
  });

  // Fetch demographics data
  const { data: demographicsData, isLoading: demographicsLoading } = useQuery({
    queryKey: ['demographicsData', selectedParties, selectedStates, selectedPlatforms, dateRange],
    queryFn: () => Promise.resolve(generateFilteredDemographicsData(selectedParties.map(p => p.toString())))
  });

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 0.6) return SENTIMENT_COLORS.positive;
    if (sentiment <= 0.4) return SENTIMENT_COLORS.negative;
    return SENTIMENT_COLORS.neutral;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getTopParty = (insights: PartyInsight[], metric: 'sentiment' | 'mentions' | 'engagement') => {
    if (!insights || insights.length === 0) return null;
    
    return insights.reduce((top, current) => {
      switch (metric) {
        case 'sentiment':
          return (current.overallSentiment.positive || 0) > (top.overallSentiment.positive || 0) ? current : top;
        case 'mentions':
          return current.totalMentions > top.totalMentions ? current : top;
        case 'engagement':
          return current.totalEngagement > top.totalEngagement ? current : top;
        default:
          return top;
      }
    });
  };

  const MetricButton: React.FC<{
    metric: typeof selectedMetric;
    label: string;
    isActive: boolean;
    onClick: () => void;
  }> = ({ label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );

  const ChartTypeButton: React.FC<{
    type: typeof chartType;
    label: string;
    icon: string;
    isActive: boolean;
    onClick: () => void;
  }> = ({ label, icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );

  const topParty = getTopParty(partyInsights || [], selectedMetric);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Party Analytics</h1>
          <p className="text-gray-600">
            Compare sentiment and engagement across political parties
          </p>
        </div>
      </div>

      {/* Enhanced Filter Bar */}
      <div className="mb-6">
        <FilterBar 
          showFilterButton={true}
          showSortOptions={false}
          className="mb-4"
        />
        
        {/* Active Filters Indicator */}
        {hasActiveFilters() && (
          <FilterIndicator className="mb-4" />
        )}
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Parties"
          value={(partyInsights?.length || 0).toString()}
          icon={() => <span className="text-2xl">🏛️</span>}
          description="Parties analyzed"
          isLoading={insightsLoading}
        />
        <StatsCard
          title="Total Mentions"
          value={formatNumber(dashboardStats?.totalMentions || 0)}
          icon={() => <span className="text-2xl">📊</span>}
          description="Across all parties"
          isLoading={statsLoading}
        />
        <StatsCard
          title="Average Sentiment"
          value={`${(((dashboardStats?.overallSentiment.positive || 0) - (dashboardStats?.overallSentiment.negative || 0))).toFixed(1)}%`}
          icon={() => <span className="text-2xl">💭</span>}
          description="Overall sentiment"
          isLoading={statsLoading}
        />
        <StatsCard
          title="Top Party"
          value={topParty ? POLITICAL_PARTIES.find(p => p.value === topParty.party)?.label || topParty.party : 'N/A'}
          icon={() => <span className="text-2xl">🏆</span>}
          description={`Highest ${selectedMetric}`}
          isLoading={insightsLoading}
        />
      </div>

      {/* Party Comparison Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-24">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 lg:mb-0">
            Party Comparison
          </h2>
          
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Metric Selection */}
            <div className="flex space-x-2">
              <MetricButton
                metric="sentiment"
                label="Sentiment"
                isActive={selectedMetric === 'sentiment'}
                onClick={() => setSelectedMetric('sentiment')}
              />
              <MetricButton
                metric="mentions"
                label="Mentions"
                isActive={selectedMetric === 'mentions'}
                onClick={() => setSelectedMetric('mentions')}
              />
              <MetricButton
                metric="engagement"
                label="Engagement"
                isActive={selectedMetric === 'engagement'}
                onClick={() => setSelectedMetric('engagement')}
              />
            </div>
            
            {/* Chart Type Selection */}
            <div className="flex space-x-2">
              <ChartTypeButton
                type="comparison"
                label="Side-by-Side"
                icon="⚖️"
                isActive={chartType === 'comparison'}
                onClick={() => setChartType('comparison')}
              />
              <ChartTypeButton
                type="bar"
                label="Bar"
                icon="📊"
                isActive={chartType === 'bar'}
                onClick={() => setChartType('bar')}
              />
              <ChartTypeButton
                type="radar"
                label="Radar"
                icon="🎯"
                isActive={chartType === 'radar'}
                onClick={() => setChartType('radar')}
              />
              <ChartTypeButton
                type="line"
                label="Trend"
                icon="📈"
                isActive={chartType === 'line'}
                onClick={() => setChartType('line')}
              />
            </div>
          </div>
        </div>
        
        <PartyCompareChart
          data={partyInsights || []}
          isLoading={insightsLoading}
          height={400}
          selectedParties={selectedParties}
          enableDrillDown={true}
          showExportButtons={true}
          chartType={chartType}
          metric={selectedMetric}
          onPartyClick={(party) => {
            console.log('Party clicked for drill-down:', party);
          }}
          onExport={(format) => {
            console.log('Exporting data as:', format);
          }}
        />
      </div>

      {/* Party Details Grid - Only show when not in comparison view */}
      {chartType !== 'comparison' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
        {insightsLoading ? (
          [...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          ))
        ) : (
          (partyInsights || []).map((party) => {
            const partyInfo = POLITICAL_PARTIES.find(p => p.value === party.party);
            const sentimentColor = getSentimentColor((party.overallSentiment.positive - party.overallSentiment.negative) / 100);
            
            return (
              <div key={party.party} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div 
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: partyInfo?.color }}
                  />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {partyInfo?.label || party.party}
                  </h3>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sentiment</span>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: sentimentColor }}
                      />
                      <span 
                        className="text-sm font-medium"
                        style={{ color: sentimentColor }}
                      >
                        {((party.overallSentiment.positive - party.overallSentiment.negative)).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Mentions</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatNumber(party.totalMentions)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Engagement</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatNumber(party.totalEngagement)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Politicians</span>
                    <span className="text-sm font-medium text-gray-900">
                      {party.topPoliticians?.length || 0}
                    </span>
                  </div>
                  
                  {/* Sentiment Breakdown */}
                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>Sentiment Distribution</span>
                    </div>
                    <div className="flex space-x-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="bg-green-500"
                        style={{ width: `${party.overallSentiment.positive}%` }}
                      />
                      <div 
                        className="bg-yellow-500"
                        style={{ width: `${party.overallSentiment.neutral}%` }}
                      />
                      <div 
                        className="bg-red-500"
                        style={{ width: `${party.overallSentiment.negative}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                      <span>{party.overallSentiment.positive.toFixed(0)}% Positive</span>
                      <span>{party.overallSentiment.neutral.toFixed(0)}% Neutral</span>
                      <span>{party.overallSentiment.negative.toFixed(0)}% Negative</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      )}

      {/* Demographics Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sentiment by Gender
          </h3>
          <DemographicsChart
            data={demographicsData}
            isLoading={demographicsLoading}
            height={300}
            showFilters={false}
          />
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Sentiment by Age Group
          </h3>
          <DemographicsChart
            data={demographicsData}
            isLoading={demographicsLoading}
            height={300}
            showFilters={false}
          />
        </div>
      </div>
    </div>
  );
};

export default PartyAnalytics;