import React from 'react';
import { Link } from 'react-router-dom';
import { POLITICAL_PARTIES, SENTIMENT_COLORS } from '../../constants';
import { useUIStore } from '../../stores/uiStore';
import type { Politician } from '../../types';
import PoliticianImage from './PoliticianImage';

interface PoliticianCardProps {
  politician: Politician;
  showSentiment?: boolean;
  showStats?: boolean;
  className?: string;
  onClick?: () => void;
}

const PoliticianCard: React.FC<PoliticianCardProps> = ({ 
  politician, 
  showSentiment = true,
  showStats = true,
  className = "",
  onClick
}) => {
  const { addToRecentlyViewed } = useUIStore();
  const partyInfo = POLITICAL_PARTIES.find(party => party.value === politician.party);
  
  const handleClick = () => {
    addToRecentlyViewed(politician);
    if (onClick) {
      onClick();
    }
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.1) return SENTIMENT_COLORS.positive;
    if (sentiment < -0.1) return SENTIMENT_COLORS.negative;
    return SENTIMENT_COLORS.neutral;
  };

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment > 0.1) return 'Positive';
    if (sentiment < -0.1) return 'Negative';
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

  return (
    <div className={`bg-card rounded-lg border border-default hover:border-default transition-all duration-200 hover:shadow-md ${className}`}>
      <Link 
        to={`/politician/${politician.id}`} 
        onClick={handleClick}
        className="block p-6"
      >
        {/* Header */}
        <div className="flex items-start space-x-4 mb-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <PoliticianImage 
              politician={politician}
              size="md"
              className="border-2 border-gray-100"
            />
          </div>
          
          {/* Basic Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-primary truncate">
              {politician.name}
            </h3>
            <p className="text-sm text-secondary mb-1">
              {politician.position}
            </p>
            <div className="flex items-center space-x-2">
              <span 
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `${partyInfo?.color || '#6b7280'}20`,
                  color: partyInfo?.color || '#6b7280'
                }}
              >
                {partyInfo?.label || politician.party}
              </span>
              <span className="text-xs text-secondary">•</span>
              <span className="text-xs text-secondary">{politician.state}</span>
            </div>
          </div>
          
          {/* Sentiment Badge */}
          {showSentiment && politician.recentSentiment && (
            <div className="flex-shrink-0">
              <div 
                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: `${getSentimentColor(politician.recentSentiment.score)}20`,
                  color: getSentimentColor(politician.recentSentiment.score)
                }}
              >
                {getSentimentLabel(politician.recentSentiment.score)}
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        {showStats && politician.recentSentiment && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-default">
            <div className="text-center">
              <div className="text-lg font-semibold text-primary">
                {formatNumber(politician.recentSentiment.mentionCount)}
              </div>
              <div className="text-xs text-secondary">Mentions</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-primary">
                {politician.recentSentiment.changePercentage.toFixed(1)}%
              </div>
              <div className="text-xs text-secondary">Change</div>
            </div>
            <div className="text-center">
              <div 
                className="text-lg font-semibold"
                style={{ color: getSentimentColor(politician.recentSentiment.score) }}
              >
                {((politician.recentSentiment.score + 1) * 50).toFixed(0)}%
              </div>
              <div className="text-xs text-secondary">Sentiment</div>
            </div>
          </div>
        )}

        {/* Social Media Handles */}
        {politician.socialMediaHandles && Object.keys(politician.socialMediaHandles).length > 0 && (
          <div className="mt-4 pt-4 border-t border-default">
            <div className="flex items-center space-x-3">
              <span className="text-xs text-secondary">Social:</span>
              <div className="flex space-x-2">
                {politician.socialMediaHandles?.twitter && (
                  <a 
                    href={`https://twitter.com/${politician.socialMediaHandles.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                )}
                {politician.socialMediaHandles?.instagram && (
                  <a 
                    href={`https://instagram.com/${politician.socialMediaHandles.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-pink-500 hover:text-pink-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.875 2.026-1.297 3.323-1.297s2.448.422 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.781c-.49 0-.928-.422-.928-.928 0-.49.438-.928.928-.928.49 0 .928.438.928.928 0 .506-.438.928-.928.928zm-4.232 1.297c-1.297 0-2.346 1.049-2.346 2.346s1.049 2.346 2.346 2.346 2.346-1.049 2.346-2.346-1.049-2.346-2.346-2.346z"/>
                    </svg>
                  </a>
                )}
                {politician.socialMediaHandles?.facebook && (
                  <a 
                    href={`https://facebook.com/${politician.socialMediaHandles.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Trend Indicator */}
        {politician.recentSentiment && (
          <div className="mt-4 pt-4 border-t border-default">
            <div className="flex items-center justify-between">
              <span className="text-xs text-secondary">Trend:</span>
              <div className="flex items-center space-x-1">
                {politician.recentSentiment.trend === 'up' ? (
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                ) : politician.recentSentiment.trend === 'down' ? (
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                )}
                <span className={`text-xs font-medium ${
                  politician.recentSentiment.trend === 'up' ? 'text-green-600' :
                  politician.recentSentiment.trend === 'down' ? 'text-red-600' :
                  'text-gray-500'
                }`}>
                  {politician.recentSentiment.changePercentage > 0 ? '+' : ''}{politician.recentSentiment.changePercentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </Link>
    </div>
  );
};

export default PoliticianCard;