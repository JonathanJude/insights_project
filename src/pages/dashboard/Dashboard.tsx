import {
  ArrowRightIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ChatBubbleLeftRightIcon,
  EyeIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Mock data imports
import {
  mockApiDelay,
  mockDashboardStats,
  mockPlatformSentiment,
  mockTrendingPoliticians
} from '../../mock';

// Component imports (we'll create these next)
import {
  DemographicsChart,
  PartyDistributionChart,
  PlatformBreakdown,
  SentimentChart
} from '../../components/charts';
import RefreshButton from '../../components/ui/RefreshButton';
import StatsCard from '../../components/ui/StatsCard';
import TrendingPoliticians from '../../components/ui/TrendingPoliticians';

// Quick Actions
import { getEnabledQuickActions } from '../../config/quickActions';
import type { QuickAction } from '../../types/quickActions';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const quickActions = getEnabledQuickActions();

  // Handle quick action clicks
  const handleQuickActionClick = (action: QuickAction) => {
    if (action.params) {
      const searchParams = new URLSearchParams(action.params);
      navigate(`${action.route}?${searchParams.toString()}`);
    } else {
      navigate(action.route);
    }
  };

  // Fetch dashboard data
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      await mockApiDelay(800);
      return mockDashboardStats;
    }
  });

  const { data: trendingPoliticians, isLoading: trendingLoading } = useQuery({
    queryKey: ['trending-politicians'],
    queryFn: async () => {
      await mockApiDelay(600);
      return mockTrendingPoliticians;
    }
  });

  const { data: platformSentiment, isLoading: platformLoading } = useQuery({
    queryKey: ['platform-sentiment'],
    queryFn: async () => {
      await mockApiDelay(700);
      return mockPlatformSentiment;
    }
  });

  if (statsLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-8 space-y-4 lg:space-y-0">
          <div className="flex-1">
            <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-64 mb-3 animate-pulse"></div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full animate-pulse"></div>
                <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-16 animate-pulse"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-32 animate-pulse"></div>
                <div className="w-5 h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-32 animate-pulse"></div>
            <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-32 animate-pulse"></div>
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-24 mb-3 animate-pulse"></div>
                  <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-20 mb-4 animate-pulse"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-16 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-full animate-pulse"></div>
                </div>
                <div className="w-16 h-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-2xl animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
          <div className="xl:col-span-2 space-y-4 lg:space-y-6">
            {/* Chart Skeletons */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-32 animate-pulse"></div>
                <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-32 animate-pulse"></div>
              </div>
              <div className="h-64 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="h-64 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="h-80 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="space-y-4 lg:space-y-6">
            {/* Trending Politicians Skeleton */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-32 mb-1 animate-pulse"></div>
                  <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-40 animate-pulse"></div>
                </div>
                <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-16 animate-pulse"></div>
              </div>
              <div className="space-y-3">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full animate-pulse"></div>
                    <div className="w-12 h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-full animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-3/4 animate-pulse"></div>
                      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-1/2 animate-pulse"></div>
                      <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-2/3 animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Party Distribution Skeleton */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="h-64 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-pulse"></div>
            </div>
            {/* Quick Actions Skeleton */}
            <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-xl p-6 border border-blue-200/50 dark:border-gray-600">
              <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-24 mb-4 animate-pulse"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="bg-white/80 dark:bg-gray-800/80 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-pulse"></div>
                        <div>
                          <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-32 mb-1 animate-pulse"></div>
                          <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded w-40 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="w-4 h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = dashboardStats!;
  const avgSentiment = (stats.overallSentiment.positive - stats.overallSentiment.negative) / 100;
  const sentimentColor = avgSentiment > 0.1 ? 'text-green-600' : 
                        avgSentiment > -0.1 ? 'text-yellow-600' : 'text-red-600';
  const sentimentIcon = avgSentiment > 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 lg:mb-8 space-y-4 lg:space-y-0">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient mb-2">Dashboard</h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg font-medium">
            Political sentiment insights across Nigerian social media
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-3 space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500 font-medium">Live Data</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
              {/* <DashboardExportButton
                stats={stats}
                timeRange="Last 30 days"
                size="sm"
                className="opacity-70 hover:opacity-100"
              /> */}
              <RefreshButton 
                size="sm" 
                variant="subtle"
                className="opacity-70 hover:opacity-100"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <Link
            to="/search"
            className="btn-secondary inline-flex items-center justify-center text-center"
          >
            <EyeIcon className="h-5 w-5 mr-2" />
            <span className="hidden sm:inline">Explore Politicians</span>
            <span className="sm:hidden">Explore</span>
          </Link>
          <Link
            to="/party"
            className="btn-primary inline-flex items-center justify-center text-center"
          >
            <span className="hidden sm:inline">Party Analytics</span>
            <span className="sm:hidden">Analytics</span>
            <ArrowRightIcon className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatsCard
          title="Total Politicians"
          value={stats.totalPoliticians.toLocaleString()}
          icon={UserGroupIcon}
          trend={{ value: 12, isPositive: true }}
          description="Active political figures"
        />
        
        <StatsCard
          title="Total Mentions"
          value={stats.totalMentions.toLocaleString()}
          icon={ChatBubbleLeftRightIcon}
          trend={{ value: 8.5, isPositive: true }}
          description="Across all platforms"
        />
        
        <StatsCard
          title="Average Sentiment"
          value={`${(avgSentiment * 100).toFixed(1)}%`}
          icon={sentimentIcon}
          iconColor={sentimentColor}
          trend={{ 
            value: Math.abs(avgSentiment * 10), 
            isPositive: avgSentiment > 0 
          }}
          description="Overall public sentiment"
        />
        
        <StatsCard
          title="Positive Sentiment"
          value={`${stats.overallSentiment.positive.toFixed(1)}%`}
          icon={ArrowTrendingUpIcon}
          iconColor="text-green-600"
          trend={{ value: 5.2, isPositive: true }}
          description="Positive mentions"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        {/* Left Column - Charts */}
        <div className="xl:col-span-2 space-y-4 lg:space-y-6">
          {/* Sentiment Over Time */}
          <div className="chart-container">
            <SentimentChart 
              isLoading={platformLoading} 
              showFilters={true}
              height={window.innerWidth < 768 ? 250 : 300}
            />
          </div>

          {/* Platform Breakdown */}
          <div className="chart-container">
            <PlatformBreakdown 
              data={platformSentiment} 
              isLoading={platformLoading} 
              showFilters={true}
              height={window.innerWidth < 768 ? 250 : 300}
            />
          </div>

          {/* Demographics */}
          <div className="chart-container">
            <DemographicsChart 
              isLoading={statsLoading} 
              showFilters={true}
              height={window.innerWidth < 768 ? 300 : 400}
            />
          </div>
        </div>

        {/* Right Column - Trending & Party Distribution */}
        <div className="space-y-4 lg:space-y-6">
          {/* Trending Politicians */}
          <div className="chart-container">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 lg:mb-6 space-y-2 sm:space-y-0">
              <div>
                <h2 className="text-lg lg:text-xl font-bold text-gray-900 mb-1">Trending Politicians</h2>
                <p className="text-xs lg:text-sm text-gray-500">Most discussed political figures</p>
              </div>
              <Link 
                to="/search" 
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200 hover:underline self-start sm:self-auto"
              >
                View all
              </Link>
            </div>
            <TrendingPoliticians 
              politicians={trendingPoliticians || []} 
              loading={trendingLoading} 
            />
          </div>

          {/* Party Distribution */}
          <div className="chart-container">
            <div className="flex items-center justify-between mb-4">
              <Link 
                to="/party" 
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200 hover:underline"
              >
                Detailed view
              </Link>
            </div>
            <PartyDistributionChart 
              isLoading={statsLoading} 
              showFilters={true}
              height={window.innerWidth < 768 ? 250 : 300}
            />
          </div>

          {/* Quick Actions */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 lg:p-6 border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
            <div className="relative">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 primary-gradient rounded-full"></div>
                <h3 className="text-lg lg:text-xl font-bold text-gray-900">Quick Actions</h3>
              </div>
              <div className="space-y-3">
                {quickActions.map((action) => {
                  const IconComponent = action.icon;
                  return (
                    <button
                      key={action.id}
                      onClick={() => handleQuickActionClick(action)}
                      className="w-full flex items-center justify-between p-3 lg:p-4 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 group border border-white/50 touch-manipulation"
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent className="h-4 w-4 lg:h-5 lg:w-5 text-gray-500 group-hover:text-blue-600 transition-colors duration-200 flex-shrink-0" />
                        <div className="text-left min-w-0 flex-1">
                          <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 block truncate">
                            {action.label}
                          </span>
                          <span className="text-xs text-gray-500 group-hover:text-gray-600 block truncate">
                            {action.description}
                          </span>
                        </div>
                      </div>
                      <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-200 flex-shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Last updated: {new Date(stats.lastUpdated).toLocaleString()}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Data refreshed every 15 minutes
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;