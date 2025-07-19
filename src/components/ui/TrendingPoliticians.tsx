import React from 'react';
import { Link } from 'react-router-dom';
import type { TrendingPolitician } from '../../types';
import { POLITICAL_PARTIES, SENTIMENT_COLORS } from '../../constants';
import { useUIStore } from '../../stores/uiStore';
import { getFallbackAvatarUrl } from '../../utils/avatarUtils';

interface TrendingPoliticiansProps {
  politicians: TrendingPolitician[];
  loading?: boolean;
  className?: string;
}

const TrendingPoliticians: React.FC<TrendingPoliticiansProps> = ({
  politicians,
  loading = false,
  className = ""
}) => {
  const { addToRecentlyViewed } = useUIStore();

  const handlePoliticianClick = (politician: TrendingPolitician) => {
    addToRecentlyViewed({
      id: politician.politician.id
    });
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment >= 0.6) return SENTIMENT_COLORS.positive;
    if (sentiment <= 0.4) return SENTIMENT_COLORS.negative;
    return SENTIMENT_COLORS.neutral;
  };

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment >= 0.6) return 'Positive';
    if (sentiment <= 0.4) return 'Negative';
    return 'Neutral';
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

  const TrendingCard: React.FC<{ politician: TrendingPolitician; rank: number }> = ({ 
    politician, 
    rank 
  }) => {
    const party = POLITICAL_PARTIES.find(p => p.value === politician.politician.party);
    const sentimentColor = getSentimentColor(politician.sentimentScore);
    const sentimentLabel = getSentimentLabel(politician.sentimentScore);

    return (
      <Link
        to={`/politician/${politician.politician.id}`}
        onClick={() => handlePoliticianClick(politician)}
        className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 hover:border-gray-300"
      >
        <div className="flex items-start space-x-3">
          {/* Rank */}
          <div className="flex-shrink-0">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              rank === 1 ? 'bg-yellow-100 text-yellow-800' :
              rank === 2 ? 'bg-gray-100 text-gray-800' :
              rank === 3 ? 'bg-orange-100 text-orange-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {rank}
            </div>
          </div>

          {/* Profile Image */}
          <div className="flex-shrink-0">
            <img
              src={politician.politician.imageUrl}
              alt={politician.politician.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getFallbackAvatarUrl(politician.politician.name, 48);
              }}
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {politician.politician.name}
                </h4>
                <p className="text-xs text-gray-500 truncate">
                  {politician.politician.position}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <div 
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: party?.color }}
                  />
                  <span className="text-xs text-gray-600 truncate">
                    {party?.label} • {politician.politician.state}
                  </span>
                </div>
              </div>

              {/* Trend Indicator */}
              <div className="flex items-center space-x-1 ml-2">
                {politician.sentimentChange > 0 ? (
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                ) : politician.sentimentChange < 0 ? (
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                <span className={`text-xs font-medium ${
                  politician.sentimentChange > 0 ? 'text-green-600' :
                  politician.sentimentChange < 0 ? 'text-red-600' :
                  'text-gray-500'
                }`}>
                  {politician.sentimentChange > 0 ? '+' : ''}{politician.sentimentChange.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center space-x-4">
                {/* Mentions */}
                <div className="flex items-center space-x-1">
                  <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-gray-600">
                    {formatNumber(politician.mentionCount)}
                  </span>
                </div>

                {/* Engagement */}
                <div className="flex items-center space-x-1">
                  <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  <span className="text-xs text-gray-600">
                    {formatNumber(Math.round(politician.engagementRate * 100))}%
                  </span>
                </div>
              </div>

              {/* Sentiment */}
              <div className="flex items-center space-x-1">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: sentimentColor }}
                />
                <span className="text-xs font-medium" style={{ color: sentimentColor }}>
                  {sentimentLabel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (politicians.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Trending Politicians</h3>
        <p className="text-gray-500">No trending data available for the selected filters.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {politicians.map((politician, index) => (
        <TrendingCard 
          key={politician.politician.id} 
          politician={politician} 
          rank={index + 1}
        />
      ))}
    </div>
  );
};

export default TrendingPoliticians;