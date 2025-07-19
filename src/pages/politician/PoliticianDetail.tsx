import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChatBubbleLeftRightIcon, EyeIcon, ChartBarIcon, UsersIcon } from '@heroicons/react/24/outline';
import { usePolitician, usePoliticianInsights } from '../../hooks/usePoliticians';
import { useUIStore } from '../../stores/uiStore';
import { useFilterStore } from '../../stores/filterStore';
import { POLITICAL_PARTIES, SENTIMENT_COLORS, SOCIAL_PLATFORMS } from '../../constants';
import { SentimentChart } from '../../components/charts';
import StatsCard from '../../components/ui/StatsCard';

// Utility functions
const getSentimentColor = (sentiment: number) => {
  if (sentiment >= 0.6) return SENTIMENT_COLORS[SentimentLabel.POSITIVE];
  if (sentiment <= 0.4) return SENTIMENT_COLORS[SentimentLabel.NEGATIVE];
  return SENTIMENT_COLORS[SentimentLabel.NEUTRAL];
};

const getSentimentLabel = (sentiment: number) => {
  if (sentiment >= 0.6) return 'Positive';
  if (sentiment <= 0.4) return 'Negative';
  return 'Neutral';
};
import { SentimentLabel } from '../../types';

// Add utility functions and interfaces at the top
interface PoliticianInsightsResponse {
  overallSentiment: {
    score: number;
    breakdown: {
      positive: number;
      neutral: number;
      negative: number;
    };
  };
  totalMentions: number;
  totalEngagement: number;
  engagementRate: number;
  mentionsTrend: {
    value: number;
    isPositive: boolean;
  };
  engagementTrend: {
    value: number;
    isPositive: boolean;
  };
  platformBreakdown: Array<{
    platform: string;
    sentimentScore: number;
    mentionCount: number;
    engagementCount: number;
    sentimentBreakdown: {
      positive: number;
      neutral: number;
      negative: number;
    };
  }>;
  demographicBreakdown: {
    byGender: Array<{
      gender: string;
      sentimentScore: number;
      mentionCount: number;
      percentage: number;
    }>;
    byAgeGroup: Array<{
      ageGroup: string;
      sentimentScore: number;
      mentionCount: number;
      percentage: number;
    }>;
  };
  trendData: Array<{
    date: string;
    sentimentScore: number;
    mentionCount: number;
    engagementCount: number;
  }>;
  sentimentTrend: Array<{
    date: string;
    sentimentScore: number;
    mentionCount: number;
    engagementCount: number;
  }>;
  topTopics: Array<{
    topic: string;
    count: number;
    sentiment: number;
  }>;
  topKeywords: string[];
  reachTrend: number;
  totalReach: number;
  lastUpdated: string;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};



const PoliticianDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToRecentlyViewed } = useUIStore();
  const { dateRange } = useFilterStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'sentiment' | 'platforms' | 'demographics'>('overview');

  const { data: politician, isLoading: politicianLoading, error: politicianError } = usePolitician(id!);
  const { data: insights, isLoading: insightsLoading } = usePoliticianInsights(id!, {
    startDate: dateRange.start,
    endDate: dateRange.end
  }) as {
    data: PoliticianInsightsResponse | undefined;
    isLoading: boolean;
  };

  React.useEffect(() => {
    if (politician) {
      addToRecentlyViewed({
      id: politician.id
    });
    }
  }, [politician, addToRecentlyViewed]);



  const TabButton: React.FC<{ 
    tab: typeof activeTab; 
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

  if (politicianLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          {/* Header Skeleton */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-start space-x-6">
              <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
          
          {/* Stats Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (politicianError || !politician) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Politician Not Found</h3>
          <p className="text-gray-500 mb-4">The politician you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const party = POLITICAL_PARTIES.find(p => p.value === politician.party);
  const sentimentColor = getSentimentColor(politician.recentSentiment?.score || 0);
  const sentimentLabel = getSentimentLabel(politician.recentSentiment?.score || 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          <li>
            <Link to="/" className="text-gray-400 hover:text-gray-500 transition-colors">
              Dashboard
            </Link>
          </li>
          <li>
            <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </li>
          <li>
            <span className="text-gray-500 font-medium">{politician.name}</span>
          </li>
        </ol>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
          {/* Profile Image */}
          <div className="flex-shrink-0 mb-4 lg:mb-0">
            <img
              src={politician.imageUrl}
              alt={politician.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(politician.name)}&background=random&size=96`;
              }}
            />
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{politician.name}</h1>
                <p className="text-lg text-gray-600 mb-2">{politician.position}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: party?.color }}
                    />
                    <span>{party?.fullName}</span>
                  </div>
                  <span>•</span>
                  <span>{politician.state} State</span>
                  <span>•</span>
                  <span>{politician.gender}</span>
                  <span>•</span>
                  <span>Age Group {politician.ageGroup}</span>
                </div>
              </div>

              {/* Current Sentiment */}
              <div className="text-right">
                <div className="flex items-center justify-end space-x-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: sentimentColor }}
                  />
                  <span className="text-sm font-medium" style={{ color: sentimentColor }}>
                    {sentimentLabel.charAt(0).toUpperCase() + sentimentLabel.slice(1)} Sentiment
                  </span>
                </div>
                <div className="text-2xl font-bold" style={{ color: sentimentColor }}>
                  {((politician.recentSentiment?.score || 0) * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            {(politician.socialMediaHandles?.twitter || politician.socialMediaHandles?.instagram || politician.socialMediaHandles?.facebook) && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Social Media</h3>
                <div className="flex items-center space-x-4">
                  {politician.socialMediaHandles?.twitter && (
                    <a
                      href={`https://twitter.com/${politician.socialMediaHandles.twitter}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                      <span>@{politician.socialMediaHandles.twitter}</span>
                    </a>
                  )}
                  {politician.socialMediaHandles?.instagram && (
                    <a
                      href={`https://instagram.com/${politician.socialMediaHandles.instagram}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-sm text-pink-600 hover:text-pink-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.875 2.026-1.297 3.323-1.297s2.448.422 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.781c-.49 0-.928-.422-.928-.928 0-.49.438-.928.928-.928.49 0 .928.438.928.928 0 .506-.438.928-.928.928zm-4.262 1.364c-1.297 0-2.346 1.049-2.346 2.346s1.049 2.346 2.346 2.346 2.346-1.049 2.346-2.346-1.049-2.346-2.346-2.346z"/>
                      </svg>
                      <span>@{politician.socialMediaHandles.instagram}</span>
                    </a>
                  )}
                  {politician.socialMediaHandles?.facebook && (
                    <a
                      href={`https://facebook.com/${politician.socialMediaHandles.facebook}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-sm text-blue-800 hover:text-blue-900 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span>{politician.socialMediaHandles.facebook}</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Mentions"
          value={formatNumber(insights?.totalMentions || 0)}
          icon={ChartBarIcon}
          trend={insights?.mentionsTrend}
          description="Across all platforms"
          isLoading={insightsLoading}
        />
        <StatsCard
          title="Engagement Rate"
          value={`${((insights?.engagementRate || 0) * 100).toFixed(1)}%`}
          icon={UsersIcon}
          trend={insights?.engagementTrend}
          description="Average engagement"
          isLoading={insightsLoading}
        />
        <StatsCard
          title="Sentiment Score"
          value={`${((insights?.overallSentiment?.score || 0) * 100).toFixed(1)}%`}
          icon={ChatBubbleLeftRightIcon}
          trend={undefined}
          description="Overall sentiment"
          isLoading={insightsLoading}
        />
        <StatsCard
          title="Reach"
          value={formatNumber(insights?.totalReach || 0)}
          icon={EyeIcon}
          trend={insights?.reachTrend ? { value: insights.reachTrend, isPositive: insights.reachTrend > 0 } : undefined}
          description="Estimated reach"
          isLoading={insightsLoading}
        />
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <TabButton
            tab="overview"
            label="Overview"
            isActive={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
          />
          <TabButton
            tab="sentiment"
            label="Sentiment Analysis"
            isActive={activeTab === 'sentiment'}
            onClick={() => setActiveTab('sentiment')}
          />
          <TabButton
            tab="platforms"
            label="Platform Breakdown"
            isActive={activeTab === 'platforms'}
            onClick={() => setActiveTab('platforms')}
          />
          <TabButton
            tab="demographics"
            label="Demographics"
            isActive={activeTab === 'demographics'}
            onClick={() => setActiveTab('demographics')}
          />
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sentiment Trend */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sentiment Trend</h3>
              <SentimentChart 
                data={insights?.trendData?.map(item => ({
                  date: item.date,
                  positive: 60, // Mock data - would come from API
                  neutral: 25,
                  negative: 15
                })) || []}
                isLoading={insightsLoading}
                height={300}
              />
            </div>

            {/* Top Topics */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Trending Topics</h3>
              {insightsLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {(insights?.topTopics || []).map((topic: { topic: string; count: number; sentiment: number }, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">#{topic.topic}</span>
                      <span className="text-sm text-gray-500">{topic.count} mentions</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'sentiment' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Detailed Sentiment Analysis</h3>
            <SentimentChart 
                data={insights?.trendData?.map(item => ({
                  date: item.date,
                  positive: 60, // Mock data - would come from API
                  neutral: 25,
                  negative: 15
                })) || []}
                isLoading={insightsLoading}
                height={300}
              />
          </div>
        )}

        {activeTab === 'platforms' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Platform Performance</h3>
            {insightsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(insights?.platformBreakdown || []).map((platform) => {
                  const platformInfo = SOCIAL_PLATFORMS.find(p => p.value === platform.platform);
                  return (
                    <div key={platform.platform} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: platformInfo?.color }}
                        />
                        <h4 className="font-medium text-gray-900">{platformInfo?.label}</h4>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Mentions:</span>
                          <span className="font-medium">{formatNumber(platform.mentionCount)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sentiment:</span>
                          <span 
                            className="font-medium"
                            style={{ color: getSentimentColor(platform.sentimentScore) }}
                          >
                            {(platform.sentimentScore * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Engagement:</span>
                          <span className="font-medium">{formatNumber(platform.engagementCount)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'demographics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Gender Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sentiment by Gender</h3>
              {insightsLoading ? (
                <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <div className="space-y-4">
                  {(insights?.demographicBreakdown?.byGender || []).map((item) => (
                    <div key={item.gender} className="flex items-center justify-between">
                      <span className="text-sm text-gray-900 capitalize">{item.gender}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full"
                            style={{ 
                              width: `${item.sentimentScore * 100}%`,
                              backgroundColor: getSentimentColor(item.sentimentScore)
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {(item.sentimentScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Age Group Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sentiment by Age Group</h3>
              {insightsLoading ? (
                <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <div className="space-y-4">
                  {(insights?.demographicBreakdown?.byAgeGroup || []).map((item) => (
                    <div key={item.ageGroup} className="flex items-center justify-between">
                      <span className="text-sm text-gray-900">{item.ageGroup}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full"
                            style={{ 
                              width: `${item.sentimentScore * 100}%`,
                              backgroundColor: getSentimentColor(item.sentimentScore)
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-12 text-right">
                          {(item.sentimentScore * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PoliticianDetail;