import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { POLITICAL_PARTIES, SENTIMENT_COLORS } from '../../constants';
import { useIsMobile, useIsTouchDevice } from '../../hooks/useMediaQuery';
import type { EnhancedPoliticianData } from '../../lib/enhancedMockDataService';
import { useUIStore } from '../../stores/uiStore';
import type { Politician } from '../../types';
import PoliticianImage from './PoliticianImage';

interface MobilePoliticianCardProps {
  politician: Politician;
  enhancedData?: EnhancedPoliticianData;
  showSentiment?: boolean;
  showStats?: boolean;
  showEnhanced?: boolean;
  className?: string;
  onClick?: () => void;
}

const MobilePoliticianCard: React.FC<MobilePoliticianCardProps> = ({ 
  politician, 
  enhancedData,
  showSentiment = true,
  showStats = true,
  showEnhanced = false,
  className = "",
  onClick
}) => {
  const { addToRecentlyViewed } = useUIStore();
  const isMobile = useIsMobile();
  const isTouch = useIsTouchDevice();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showEnhancedDetails, setShowEnhancedDetails] = useState(false);
  
  const partyInfo = POLITICAL_PARTIES.find(party => party.value === politician.party);
  
  const handleClick = () => {
    addToRecentlyViewed(politician);
    if (onClick) {
      onClick();
    }
  };

  const handleExpandToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleEnhancedToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowEnhancedDetails(!showEnhancedDetails);
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
    <div className={`bg-card rounded-lg border border-default hover:border-default transition-all duration-200 hover:shadow-md ${isTouch ? 'touch-manipulation' : ''} ${className}`}>
      <Link 
        to={`/politician/${politician.id}`} 
        onClick={handleClick}
        className="block"
      >
        {/* Mobile-optimized header */}
        <div className="p-4">
          <div className="flex items-start space-x-3 mb-3">
            {/* Avatar - smaller on mobile */}
            <div className="flex-shrink-0">
              <PoliticianImage 
                politician={politician}
                size={isMobile ? "sm" : "md"}
                className="border-2 border-gray-100"
              />
            </div>
            
            {/* Basic Info - optimized for mobile */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-primary truncate">
                {politician.name}
              </h3>
              <p className="text-xs sm:text-sm text-secondary mb-1 truncate">
                {politician.position}
              </p>
              
              {/* Mobile-optimized party and state info */}
              <div className="flex flex-col space-y-1">
                <span 
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium self-start"
                  style={{
                    backgroundColor: `${partyInfo?.color || '#6b7280'}20`,
                    color: partyInfo?.color || '#6b7280'
                  }}
                >
                  {isMobile ? (partyInfo?.value || politician.party) : (partyInfo?.label || politician.party)}
                </span>
                <span className="text-xs text-secondary">{politician.state}</span>
              </div>
            </div>
            
            {/* Sentiment Badge - mobile optimized */}
            {showSentiment && politician.recentSentiment && (
              <div className="flex-shrink-0">
                <div 
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${getSentimentColor(politician.recentSentiment.score)}20`,
                    color: getSentimentColor(politician.recentSentiment.score)
                  }}
                >
                  {isMobile ? getSentimentLabel(politician.recentSentiment.score).charAt(0) : getSentimentLabel(politician.recentSentiment.score)}
                </div>
              </div>
            )}
          </div>

          {/* Mobile-optimized stats - always visible on mobile */}
          {showStats && politician.recentSentiment && (
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-default">
              <div className="text-center">
                <div className="text-sm font-semibold text-primary">
                  {formatNumber(politician.recentSentiment.mentionCount)}
                </div>
                <div className="text-xs text-secondary">Mentions</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold text-primary">
                  {politician.recentSentiment.changePercentage.toFixed(1)}%
                </div>
                <div className="text-xs text-secondary">Change</div>
              </div>
              <div className="text-center">
                <div 
                  className="text-sm font-semibold"
                  style={{ color: getSentimentColor(politician.recentSentiment.score) }}
                >
                  {((politician.recentSentiment.score + 1) * 50).toFixed(0)}%
                </div>
                <div className="text-xs text-secondary">Sentiment</div>
              </div>
            </div>
          )}

          {/* Enhanced data toggle button for mobile */}
          {showEnhanced && enhancedData && isMobile && (
            <div className="pt-3 border-t border-default">
              <button
                onClick={handleEnhancedToggle}
                className="w-full flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <span className="flex items-center space-x-2">
                  <span>✨</span>
                  <span>Enhanced Details</span>
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${showEnhancedDetails ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}

          {/* Enhanced data - collapsible on mobile, always visible on desktop */}
          {showEnhanced && enhancedData && (
            <div className={`${isMobile ? (showEnhancedDetails ? 'block' : 'hidden') : 'block'} pt-3 border-t border-default space-y-3`}>
              
              {/* Geographic context - mobile optimized */}
              {!enhancedData.geographic.state.isUndefined && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs font-medium text-blue-700">Geographic Context</span>
                  </div>
                  <div className="text-xs text-blue-600">
                    {enhancedData.geographic.lga.name !== 'Undefined' ? enhancedData.geographic.lga.name : enhancedData.geographic.state.name}
                    {enhancedData.geographic.state.confidence > 0.7 && (
                      <span className="ml-2 inline-flex items-center">
                        <div className="w-2 h-2 bg-green-400 rounded-full" title="High confidence" />
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Demographic highlights - mobile grid */}
              <div className="bg-purple-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-xs font-medium text-purple-700">Demographics</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {enhancedData.demographic.ageGroup.range !== 'Undefined' && (
                    <div className="text-xs">
                      <span className="text-purple-600">Age:</span>
                      <span className="ml-1 font-medium">{enhancedData.demographic.ageGroup.range}</span>
                    </div>
                  )}
                  {enhancedData.demographic.education.level !== 'Undefined' && (
                    <div className="text-xs">
                      <span className="text-purple-600">Education:</span>
                      <span className="ml-1 font-medium">{enhancedData.demographic.education.level}</span>
                    </div>
                  )}
                  {enhancedData.demographic.occupation.sector !== 'Undefined' && (
                    <div className="text-xs col-span-2">
                      <span className="text-purple-600">Sector:</span>
                      <span className="ml-1 font-medium">{enhancedData.demographic.occupation.sector}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced sentiment - mobile optimized */}
              <div className="bg-green-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-green-700">Enhanced Sentiment</span>
                  <div className="flex items-center space-x-1">
                    {enhancedData.enhancedSentiment.emotions.primary === 'Joy' && <span className="text-sm">😊</span>}
                    {enhancedData.enhancedSentiment.emotions.primary === 'Anger' && <span className="text-sm">😠</span>}
                    {enhancedData.enhancedSentiment.emotions.primary === 'Fear' && <span className="text-sm">😰</span>}
                    {enhancedData.enhancedSentiment.emotions.primary === 'Sadness' && <span className="text-sm">😢</span>}
                    {enhancedData.enhancedSentiment.emotions.primary === 'Disgust' && <span className="text-sm">🤢</span>}
                    {enhancedData.enhancedSentiment.emotions.primary === 'Mixed' && <span className="text-sm">🤔</span>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-green-600">Emotion:</span>
                    <span className="ml-1 font-medium">{enhancedData.enhancedSentiment.emotions.primary}</span>
                  </div>
                  <div>
                    <span className="text-green-600">Intensity:</span>
                    <span className="ml-1 font-medium">{enhancedData.enhancedSentiment.intensity.level}</span>
                  </div>
                </div>
              </div>

              {/* Engagement and topics - mobile grid */}
              <div className="grid grid-cols-1 gap-3">
                {/* Engagement */}
                <div className="bg-orange-50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-orange-700">Engagement</span>
                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                      enhancedData.engagement.level === 'High' ? 'bg-green-100 text-green-800' :
                      enhancedData.engagement.level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {enhancedData.engagement.level}
                      {enhancedData.engagement.virality.isViral && ' 🔥'}
                    </div>
                  </div>
                </div>

                {/* Topics */}
                {enhancedData.topics.policyAreas.primary && (
                  <div className="bg-indigo-50 rounded-lg p-3">
                    <div className="text-xs font-medium text-indigo-700 mb-2">Primary Focus</div>
                    <div className="flex flex-wrap gap-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                        {enhancedData.topics.policyAreas.primary}
                      </span>
                      {enhancedData.topics.campaignIssues.issues.slice(0, 1).map((issue, index) => (
                        <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                          {issue}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Social Media - mobile optimized */}
          {politician.socialMediaHandles && Object.keys(politician.socialMediaHandles).length > 0 && (
            <div className="pt-3 border-t border-default">
              <div className="flex items-center justify-between">
                <span className="text-xs text-secondary">Social:</span>
                <div className="flex space-x-3">
                  {politician.socialMediaHandles?.twitter && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(`https://twitter.com/${politician.socialMediaHandles.twitter}`, '_blank', 'noopener,noreferrer');
                      }}
                      className="text-blue-500 hover:text-blue-600 transition-colors p-2 -m-2 touch-manipulation"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </button>
                  )}
                  {politician.socialMediaHandles?.instagram && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(`https://instagram.com/${politician.socialMediaHandles.instagram}`, '_blank', 'noopener,noreferrer');
                      }}
                      className="text-pink-500 hover:text-pink-600 transition-colors p-2 -m-2 touch-manipulation"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.418-3.323c.875-.875 2.026-1.297 3.323-1.297s2.448.422 3.323 1.297c.928.875 1.418 2.026 1.418 3.323s-.49 2.448-1.418 3.244c-.875.807-2.026 1.297-3.323 1.297zm7.83-9.781c-.49 0-.928-.422-.928-.928 0-.49.438-.928.928-.928.49 0 .928.438.928.928 0 .506-.438.928-.928.928zm-4.232 1.297c-1.297 0-2.346 1.049-2.346 2.346s1.049 2.346 2.346 2.346 2.346-1.049 2.346-2.346-1.049-2.346-2.346-2.346z"/>
                      </svg>
                    </button>
                  )}
                  {politician.socialMediaHandles?.facebook && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.open(`https://facebook.com/${politician.socialMediaHandles.facebook}`, '_blank', 'noopener,noreferrer');
                      }}
                      className="text-blue-600 hover:text-blue-700 transition-colors p-2 -m-2 touch-manipulation"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Trend Indicator - mobile optimized */}
          {politician.recentSentiment && (
            <div className="pt-3 border-t border-default">
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
        </div>
      </Link>
    </div>
  );
};

export default MobilePoliticianCard;