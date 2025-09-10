import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { DemographicsChart, PartyCompareChart } from '../../components/charts';
import FilterBar from '../../components/filters/FilterBar';
import FilterIndicator from '../../components/filters/FilterIndicator';
import StatsCard from '../../components/ui/StatsCard';
import { POLITICAL_PARTIES, SENTIMENT_COLORS } from '../../constants';
import { useMultiDimensionalInsights } from '../../hooks/useEnhancedPoliticians';
import { usePageTitle } from '../../hooks/usePageTitle';
import { generateFilteredDemographicsData, getPartyInsights, mockDashboardStats } from '../../mock';
import { useFilterStore } from '../../stores/filterStore';
import type { PartyInsight } from '../../types';

const PartyAnalytics: React.FC = () => {
  usePageTitle('Party Analytics');
  const {
    selectedParties,
    selectedStates,
    selectedPlatforms,
    dateRange,
    hasActiveFilters
  } = useFilterStore();

  const [showFilters, setShowFilters] = useState(false);
  const [showEnhancedAnalysis, setShowEnhancedAnalysis] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'sentiment' | 'mentions' | 'engagement'>('sentiment');
  const [chartType, setChartType] = useState<'bar' | 'radar' | 'line' | 'comparison'>('comparison');
  const [selectedDimension, setSelectedDimension] = useState<'geographic' | 'demographic' | 'topics' | 'engagement'>('geographic');

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

  // Fetch multi-dimensional insights when enhanced analysis is enabled
  const { data: multiDimensionalInsights, isLoading: insightsEnhancedLoading } = useMultiDimensionalInsights(
    showEnhancedAnalysis ? {
      geographic: { states: selectedStates },
      demographic: {},
      sentiment: {},
      topics: {},
      engagement: {},
      temporal: {}
    } : {}
  );

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
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
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
      className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isActive
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Party Analytics
            {showEnhancedAnalysis && <span className="ml-2 text-purple-600">✨</span>}
          </h1>
          <p className="text-gray-600">
            {showEnhancedAnalysis
              ? 'Multi-dimensional analysis of political parties across geographic, demographic, and engagement metrics'
              : 'Compare sentiment and engagement across political parties'
            }
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowEnhancedAnalysis(!showEnhancedAnalysis)}
            className={`inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium transition-colors ${showEnhancedAnalysis
              ? 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
              }`}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {showEnhancedAnalysis ? 'Enhanced Analysis' : 'Enable Enhanced'}
            {showEnhancedAnalysis && <span className="ml-1">✨</span>}
          </button>
        </div>
      </div>

      {/* Enhanced Filter Bar */}
      <div className="mb-6">
        {showEnhancedAnalysis ? (
          <div className="space-y-4">
            {/* Compact Enhanced Filters */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-purple-600">✨</span>
                  <h3 className="text-sm font-semibold text-gray-900">Enhanced Filters</h3>
                </div>
                <button
                  onClick={() => setShowEnhancedAnalysis(false)}
                  className="text-xs text-purple-600 hover:text-purple-800 transition-colors"
                >
                  Collapse
                </button>
              </div>

              {/* Enhanced Multi-Dimensional Filter Grid */}
              <div className="space-y-4">
                {/* Geographic Hierarchy Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 flex items-center">
                      <span className="mr-1">🗺️</span> State
                    </label>
                    <select className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option>All States</option>
                      <option>Lagos</option>
                      <option>Abuja (FCT)</option>
                      <option>Kano</option>
                      <option>Rivers</option>
                      <option>Ogun</option>
                      <option>Kaduna</option>
                      <option>Oyo</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 flex items-center">
                      <span className="mr-1">🏘️</span> LGA
                    </label>
                    <select className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option>All LGAs</option>
                      <option>Ikeja</option>
                      <option>Lagos Island</option>
                      <option>Surulere</option>
                      <option>Alimosho</option>
                      <option>Eti-Osa</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 flex items-center">
                      <span className="mr-1">🏠</span> Ward
                    </label>
                    <select className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option>All Wards</option>
                      <option>Ward 1</option>
                      <option>Ward 2</option>
                      <option>Ward 3</option>
                      <option>Ward 4</option>
                      <option>Ward 5</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 flex items-center">
                      <span className="mr-1">🗳️</span> Polling Unit
                    </label>
                    <select className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option>All Units</option>
                      <option>PU 001</option>
                      <option>PU 002</option>
                      <option>PU 003</option>
                      <option>PU 004</option>
                    </select>
                  </div>
                </div>

                {/* Demographics and Sentiment Row */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 flex items-center">
                      <span className="mr-1">👥</span> Age Group
                    </label>
                    <select className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option>All Ages</option>
                      <option>18-25</option>
                      <option>26-35</option>
                      <option>36-45</option>
                      <option>46-55</option>
                      <option>56-65</option>
                      <option>65+</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 flex items-center">
                      <span className="mr-1">🎓</span> Education
                    </label>
                    <select className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option>All Education</option>
                      <option>Primary</option>
                      <option>Secondary</option>
                      <option>Tertiary</option>
                      <option>Postgraduate</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 flex items-center">
                      <span className="mr-1">💼</span> Occupation
                    </label>
                    <select className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option>All Sectors</option>
                      <option>Public Sector</option>
                      <option>Private Sector</option>
                      <option>Technology</option>
                      <option>Agriculture</option>
                      <option>Self-Employed</option>
                      <option>Student</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 flex items-center">
                      <span className="mr-1">😊</span> Sentiment
                    </label>
                    <select className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option>All Sentiment</option>
                      <option>Positive</option>
                      <option>Neutral</option>
                      <option>Negative</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 flex items-center">
                      <span className="mr-1">🎭</span> Emotion
                    </label>
                    <select className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option>All Emotions</option>
                      <option>Joy 😊</option>
                      <option>Anger 😠</option>
                      <option>Fear 😰</option>
                      <option>Sadness 😢</option>
                      <option>Mixed 🤔</option>
                    </select>
                  </div>
                </div>

                {/* Topics and Engagement Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 flex items-center">
                      <span className="mr-1">📋</span> Policy Area
                    </label>
                    <select className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option>All Topics</option>
                      <option>Economy</option>
                      <option>Security</option>
                      <option>Education</option>
                      <option>Healthcare</option>
                      <option>Infrastructure</option>
                      <option>Corruption</option>
                      <option>Youth/Jobs</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 flex items-center">
                      <span className="mr-1">📊</span> Engagement
                    </label>
                    <select className="w-full text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option>All Levels</option>
                      <option>High 🔥</option>
                      <option>Medium</option>
                      <option>Low</option>
                      <option>Viral Only</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700 flex items-center">
                      <span className="mr-1">📈</span> Confidence
                    </label>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        defaultValue="70"
                        className="flex-1 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <span className="text-xs text-gray-600 w-8">70%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-700">Actions</label>
                    <div className="flex space-x-1">
                      <button className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                        Apply Filters
                      </button>
                      <button className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors">
                        Reset All
                      </button>
                    </div>
                  </div>
                </div>
              </div>


            </div>

            {/* Regular Filter Bar */}
            <FilterBar
              showFilterButton={true}
              showSortOptions={false}
              className="mb-4"
            />
            {hasActiveFilters() && (
              <FilterIndicator className="mb-4" />
            )}
          </div>
        ) : (
          <>
            <FilterBar
              showFilterButton={true}
              showSortOptions={false}
              className="mb-4"
            />
            {hasActiveFilters() && (
              <FilterIndicator className="mb-4" />
            )}
          </>
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
                <Link 
                  key={party.party} 
                  to={`/party/${party.party}`}
                  className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: partyInfo?.color }}
                    />
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
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
                </Link>
              );
            })
          )}
        </div>
      )}

      {/* Enhanced Multi-Dimensional Analysis */}
      {showEnhancedAnalysis && (
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 lg:mb-0">
                Multi-Dimensional Party Analysis
              </h2>

              {/* Dimension Selection */}
              <div className="flex flex-wrap gap-2">
                {[
                  { key: 'geographic', label: 'Geographic', icon: '🗺️' },
                  { key: 'demographic', label: 'Demographic', icon: '👥' },
                  { key: 'topics', label: 'Topics', icon: '📋' },
                  { key: 'engagement', label: 'Engagement', icon: '📊' }
                ].map(({ key, label, icon }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedDimension(key as any)}
                    className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${selectedDimension === key
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <span>{icon}</span>
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Enhanced Analysis Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {selectedDimension === 'geographic' && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Geographic Performance</h3>
                    {insightsEnhancedLoading ? (
                      <div className="animate-pulse space-y-3">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(multiDimensionalInsights?.geographic || {}).slice(0, 5).map(([state, sentiment]) => (
                          <div key={state} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <span className="font-medium text-gray-900">{state}</span>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: sentiment > 0.6 ? SENTIMENT_COLORS.positive :
                                    sentiment < 0.4 ? SENTIMENT_COLORS.negative :
                                      SENTIMENT_COLORS.neutral
                                }}
                              />
                              <span className="text-sm font-medium">
                                {((sentiment as number) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Regional Breakdown</h3>
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-2">Top Performing Regions</div>
                      <div className="space-y-2">
                        {Object.entries(multiDimensionalInsights?.geographic || {})
                          .sort(([, a], [, b]) => (b as number) - (a as number))
                          .slice(0, 3)
                          .map(([state, sentiment], index) => (
                            <div key={state} className="flex items-center space-x-3">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                index === 1 ? 'bg-gray-300 text-gray-700' :
                                  'bg-orange-300 text-orange-900'
                                }`}>
                                {index + 1}
                              </div>
                              <span className="font-medium">{state}</span>
                              <span className="text-sm text-gray-600">
                                {((sentiment as number) * 100).toFixed(1)}%
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {selectedDimension === 'demographic' && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Demographic Appeal</h3>
                    {insightsEnhancedLoading ? (
                      <div className="animate-pulse space-y-3">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(multiDimensionalInsights?.demographic || {}).slice(0, 6).map(([demo, sentiment]) => (
                          <div key={demo} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <span className="font-medium text-gray-900">
                              {demo.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  backgroundColor: sentiment > 0.6 ? SENTIMENT_COLORS.positive :
                                    sentiment < 0.4 ? SENTIMENT_COLORS.negative :
                                      SENTIMENT_COLORS.neutral
                                }}
                              />
                              <span className="text-sm font-medium">
                                {((sentiment as number) * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Age Group Analysis</h3>
                    <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-3">Sentiment by Age Group</div>
                      <div className="space-y-3">
                        {['age_18-25', 'age_26-35', 'age_36-45', 'age_46-55', 'age_56-65', 'age_65+']
                          .map(ageGroup => {
                            const sentiment = multiDimensionalInsights?.demographic?.[ageGroup] as number || 0.5;
                            return (
                              <div key={ageGroup} className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                  {ageGroup.replace('age_', '').replace('+', '+')}
                                </span>
                                <div className="flex items-center space-x-2">
                                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400"
                                      style={{ width: `${sentiment * 100}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-600 w-10">
                                    {(sentiment * 100).toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {selectedDimension === 'topics' && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Policy Area Performance</h3>
                    {insightsEnhancedLoading ? (
                      <div className="animate-pulse space-y-3">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(multiDimensionalInsights?.topics || {}).slice(0, 7).map(([topic, count]) => (
                          <div key={topic} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">
                                {topic === 'Economy' ? '💰' :
                                  topic === 'Security' ? '🛡️' :
                                    topic === 'Education' ? '📚' :
                                      topic === 'Health' ? '🏥' :
                                        topic === 'Infrastructure' ? '🏗️' :
                                          topic === 'Corruption' ? '⚖️' :
                                            '📋'}
                              </span>
                              <span className="font-medium text-gray-900">{topic}</span>
                            </div>
                            <span className="text-sm font-medium text-blue-600">
                              {count} mentions
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Trending Issues</h3>
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-3">Most Discussed Topics</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(multiDimensionalInsights?.topics || {})
                          .sort(([, a], [, b]) => (b as number) - (a as number))
                          .slice(0, 6)
                          .map(([topic, count]) => (
                            <span
                              key={topic}
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-gray-700 border"
                            >
                              {topic}
                              <span className="ml-1 text-orange-600 font-bold">{count}</span>
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {selectedDimension === 'engagement' && (
                <>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Engagement Metrics</h3>
                    {insightsEnhancedLoading ? (
                      <div className="animate-pulse space-y-3">
                        {[...Array(4)].map((_, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {Object.entries(multiDimensionalInsights?.engagement || {}).map(([metric, value]) => (
                          <div key={metric} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">
                                {metric.includes('High') ? '🔥' :
                                  metric.includes('Medium') ? '📊' :
                                    metric.includes('Viral') ? '🚀' :
                                      metric.includes('Influencer') ? '⭐' :
                                        '📈'}
                              </span>
                              <span className="font-medium text-gray-900">
                                {metric.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </span>
                            </div>
                            <span className="text-sm font-medium text-purple-600">
                              {value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Viral Content Analysis</h3>
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 mb-3">Engagement Distribution</div>
                      <div className="space-y-3">
                        {['High_Engagement', 'Medium_Engagement', 'Low_Engagement'].map(level => {
                          const count = multiDimensionalInsights?.engagement?.[level] as number || 0;
                          const total = Object.values(multiDimensionalInsights?.engagement || {})
                            .filter(v => typeof v === 'number')
                            .reduce((sum, v) => sum + (v as number), 0);
                          const percentage = total > 0 ? (count / total) * 100 : 0;

                          return (
                            <div key={level} className="flex items-center justify-between">
                              <span className="text-sm font-medium">
                                {level.replace('_', ' ')}
                              </span>
                              <div className="flex items-center space-x-2">
                                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full ${level === 'High_Engagement' ? 'bg-green-400' :
                                      level === 'Medium_Engagement' ? 'bg-yellow-400' :
                                        'bg-gray-400'
                                      }`}
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-600 w-10">
                                  {percentage.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
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