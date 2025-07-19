import React from 'react';
import { Link } from 'react-router-dom';
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { PoliticalParty } from '../../types';

// Mock data imports
import {
  mockDashboardStats,
  mockTrendingPoliticians,
  mockPlatformSentiment,
  mockApiDelay
} from '../../mock';

// Component imports (we'll create these next)
import StatsCard from '../../components/ui/StatsCard';
import {
  SentimentChart,
  PlatformBreakdown,
  PartyDistributionChart,
  DemographicsChart
} from '../../components/charts';
import TrendingPoliticians from '../../components/ui/TrendingPoliticians';

const Dashboard: React.FC = () => {
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
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gradient mb-2">Dashboard</h1>
          <p className="text-gray-600 text-lg font-medium">
            Political sentiment insights across Nigerian social media
          </p>
          <div className="flex items-center space-x-4 mt-3">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500 font-medium">Live Data</span>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            to="/search"
            className="btn-secondary inline-flex items-center"
          >
            <EyeIcon className="h-5 w-5 mr-2" />
            Explore Politicians
          </Link>
          <Link
            to="/party"
            className="btn-primary inline-flex items-center"
          >
            Party Analytics
            <ArrowRightIcon className="h-5 w-5 ml-2" />
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sentiment Over Time */}
          <div className="chart-container">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Sentiment Trends</h2>
                <p className="text-sm text-gray-500">Real-time sentiment analysis across platforms</p>
              </div>
              <select className="text-sm border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm hover:shadow-md transition-all duration-200">
                <option>Last 30 days</option>
                <option>Last 7 days</option>
                <option>Last 3 months</option>
              </select>
            </div>
            <SentimentChart isLoading={platformLoading} />
          </div>

          {/* Platform Breakdown */}
          <div className="chart-container">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Platform Analysis</h2>
              <p className="text-sm text-gray-500">Engagement metrics across social media platforms</p>
            </div>
            <PlatformBreakdown data={platformSentiment} isLoading={platformLoading} />
          </div>

          {/* Demographics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="chart-container">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Gender Distribution</h2>
                <p className="text-sm text-gray-500">Audience demographics by gender</p>
              </div>
              <DemographicsChart 
                data={undefined} 
                isLoading={statsLoading} 
              />
            </div>
            
            <div className="chart-container">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Age Groups</h2>
                <p className="text-sm text-gray-500">Audience demographics by age</p>
              </div>
              <DemographicsChart 
                data={undefined} 
                isLoading={statsLoading} 
              />
            </div>
          </div>
        </div>

        {/* Right Column - Trending & Party Distribution */}
        <div className="space-y-6">
          {/* Trending Politicians */}
          <div className="chart-container">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Trending Politicians</h2>
                <p className="text-sm text-gray-500">Most discussed political figures</p>
              </div>
              <Link 
                to="/search" 
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200 hover:underline"
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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Party Distribution</h2>
                <p className="text-sm text-gray-500">Political party representation</p>
              </div>
              <Link 
                to="/party" 
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200 hover:underline"
              >
                Detailed view
              </Link>
            </div>
            <PartyDistributionChart 
              data={{
                [PoliticalParty.APC]: 0,
                [PoliticalParty.PDP]: 0,
                [PoliticalParty.LP]: 0,
                [PoliticalParty.NNPP]: 0,
                [PoliticalParty.APGA]: 0,
                [PoliticalParty.ADC]: 0,
                [PoliticalParty.SDP]: 0,
                [PoliticalParty.YPP]: 0,
                [PoliticalParty.OTHER]: 0
              }} 
              isLoading={statsLoading} 
            />
          </div>

          {/* Quick Actions */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6 border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
            <div className="relative">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-2 h-2 primary-gradient rounded-full"></div>
                <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
              </div>
              <div className="space-y-3">
                <Link
                  to="/search?trending=true"
                  className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 group border border-white/50"
                >
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">View Trending Topics</span>
                  <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
                </Link>
                <Link
                  to="/party"
                  className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 group border border-white/50"
                >
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">Compare Parties</span>
                  <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
                </Link>
                <Link
                  to="/search?filter=positive"
                  className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white hover:shadow-md transition-all duration-200 group border border-white/50"
                >
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">Most Positive Politicians</span>
                  <ArrowRightIcon className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors duration-200" />
                </Link>
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