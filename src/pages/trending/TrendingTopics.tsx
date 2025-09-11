import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
  FireIcon,
  HashtagIcon,
  MinusIcon
} from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RefreshButton from '../../components/ui/RefreshButton';
import { usePageTitle } from '../../hooks/usePageTitle';
import { mockApiDelay } from '../../mock';
import { politicianService } from '../../services/politician-service';
import type { TrendingTopic, TrendingTopicsData } from '../../types/quickActions';

// Mock data generator for trending topics
const generateTrendingTopicsData = async (): Promise<TrendingTopicsData> => {
  const topicKeywords = [
    'economic policy', 'infrastructure development', 'education reform', 'healthcare system',
    'security challenges', 'corruption fight', 'youth empowerment', 'agriculture support',
    'technology advancement', 'governance transparency', 'job creation', 'poverty reduction',
    'climate change', 'energy sector', 'transportation', 'housing policy', 'tax reform',
    'foreign relations', 'trade agreements', 'social welfare', 'women empowerment',
    'digital transformation', 'electoral reforms', 'judicial independence', 'press freedom'
  ];

  const platforms = ['twitter', 'facebook', 'instagram', 'threads', 'news'];
  const trends = ['rising', 'falling', 'stable'] as const;

  const topics: TrendingTopic[] = topicKeywords.slice(0, 20).map((keyword, index) => {
    const mentionCount = Math.floor(Math.random() * 2000) + 100;
    const sentiment = Math.random() * 2 - 1; // -1 to 1
    const trend = trends[Math.floor(Math.random() * trends.length)];
    
    const getSentimentLabel = (score: number): 'positive' | 'neutral' | 'negative' => {
      if (score > 0.2) return 'positive';
      if (score < -0.2) return 'negative';
      return 'neutral';
    };

    return {
      id: `topic_${index}`,
      keyword,
      mentionCount,
      sentiment,
      sentimentLabel: getSentimentLabel(sentiment),
      trend,
      changePercentage: (Math.random() - 0.5) * 60, // -30% to +30%
      relatedPoliticians: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, () => {
        const politicians = politicianService.getCachedPoliticians() || [];
        if (politicians.length === 0) return { id: 'unknown', name: 'Unknown Politician', party: 'Unknown' };
        const randomPolitician = politicians[Math.floor(Math.random() * politicians.length)];
        return {
          id: randomPolitician.id,
          name: randomPolitician.name,
          party: randomPolitician.party
        };
      }),
      platforms: platforms.slice(0, Math.floor(Math.random() * 3) + 2).map(platform => ({
        platform,
        mentionCount: Math.floor(Math.random() * mentionCount * 0.4),
        sentiment: Math.random() * 2 - 1
      })),
      lastUpdated: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
    };
  });

  // Sort by mention count descending
  topics.sort((a, b) => b.mentionCount - a.mentionCount);

  return {
    topics,
    totalTopics: topics.length,
    lastUpdated: new Date().toISOString(),
    timeframe: '24h'
  };
};

const TrendingTopics: React.FC = () => {
  usePageTitle('Trending Topics');
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [sortBy, setSortBy] = useState<'mentions' | 'sentiment' | 'trend'>('mentions');

  const { data: trendingData, isLoading, refetch } = useQuery({
    queryKey: ['trending-topics', timeframe],
    queryFn: async () => {
      await mockApiDelay(800);
      return generateTrendingTopicsData();
    }
  });

  const handleRefresh = () => {
    refetch();
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.2) return 'text-green-600';
    if (sentiment < -0.2) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getSentimentBgColor = (sentiment: number) => {
    if (sentiment > 0.2) return 'bg-green-100';
    if (sentiment < -0.2) return 'bg-red-100';
    return 'bg-yellow-100';
  };

  const getTrendIcon = (trend: 'rising' | 'falling' | 'stable') => {
    switch (trend) {
      case 'rising':
        return <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />;
      case 'falling':
        return <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />;
      case 'stable':
        return <MinusIcon className="h-4 w-4 text-gray-600" />;
    }
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

  const sortedTopics = trendingData?.topics.slice().sort((a, b) => {
    switch (sortBy) {
      case 'mentions':
        return b.mentionCount - a.mentionCount;
      case 'sentiment':
        return b.sentiment - a.sentiment;
      case 'trend':
        if (a.trend === b.trend) return b.mentionCount - a.mentionCount;
        if (a.trend === 'rising') return -1;
        if (b.trend === 'rising') return 1;
        if (a.trend === 'stable') return -1;
        return 1;
      default:
        return 0;
    }
  }) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <FireIcon className="h-8 w-8 text-orange-500 mr-3" />
            Trending Topics
          </h1>
          <p className="text-gray-600">
            Most discussed political topics across Nigerian social media
          </p>
          {trendingData && (
            <div className="flex items-center space-x-4 mt-3">
              <div className="flex items-center space-x-2">
                <ClockIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">
                  Last updated: {new Date(trendingData.lastUpdated).toLocaleTimeString()}
                </span>
                <RefreshButton 
                  size="sm" 
                  variant="subtle"
                  className="opacity-70 hover:opacity-100"
                  onRefreshStart={handleRefresh}
                />
              </div>
              <div className="text-sm text-gray-500">
                {trendingData.totalTopics} topics tracked
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <Link
            to="/search"
            className="btn-secondary inline-flex items-center"
          >
            View Politicians
          </Link>
          <Link
            to="/party"
            className="btn-primary inline-flex items-center"
          >
            Party Analytics
          </Link>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Timeframe:</span>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as '24h' | '7d' | '30d')}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'mentions' | 'sentiment' | 'trend')}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="mentions">Mentions</option>
              <option value="sentiment">Sentiment</option>
              <option value="trend">Trend</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(12)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Topics Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedTopics.map((topic, index) => (
            <div key={topic.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              {/* Topic Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <HashtagIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                  <h3 className="text-lg font-semibold text-gray-900 capitalize">
                    {topic.keyword}
                  </h3>
                </div>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(topic.trend)}
                  <span className={`text-xs font-medium ${
                    topic.trend === 'rising' ? 'text-green-600' :
                    topic.trend === 'falling' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {topic.changePercentage > 0 ? '+' : ''}{topic.changePercentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center">
                    <ChatBubbleLeftRightIcon className="h-4 w-4 mr-1" />
                    Mentions
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatNumber(topic.mentionCount)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Sentiment</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${getSentimentColor(topic.sentiment)}`}>
                      {topic.sentimentLabel}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${getSentimentBgColor(topic.sentiment)}`}></div>
                  </div>
                </div>
              </div>

              {/* Related Politicians */}
              {topic.relatedPoliticians.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Related Politicians</h4>
                  <div className="flex flex-wrap gap-1">
                    {topic.relatedPoliticians.slice(0, 3).map((politician) => (
                      <Link
                        key={politician.id}
                        to={`/search?q=${encodeURIComponent(politician.name)}`}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                      >
                        {politician.name}
                      </Link>
                    ))}
                    {topic.relatedPoliticians.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        +{topic.relatedPoliticians.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Platform Breakdown */}
              <div className="border-t border-gray-100 pt-3">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Top Platforms</h4>
                <div className="space-y-1">
                  {topic.platforms.slice(0, 3).map((platform) => (
                    <div key={platform.platform} className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 capitalize">{platform.platform}</span>
                      <span className="font-medium text-gray-900">
                        {formatNumber(platform.mentionCount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ranking Badge */}
              {index < 3 && (
                <div className="absolute top-2 right-2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' :
                    index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                  }`}>
                    {index + 1}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Topics are updated every 15 minutes based on social media activity
        </p>
      </div>
    </div>
  );
};

export default TrendingTopics;