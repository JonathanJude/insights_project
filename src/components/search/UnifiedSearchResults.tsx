import {
    BuildingOfficeIcon,
    FireIcon,
    GlobeAltIcon,
    HashtagIcon,
    MapPinIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { UnifiedSearchResult } from '../../lib/unifiedSearchEngine';
import type { Politician } from '../../types';
import type { TrendingTopic } from '../../types/quickActions';

interface UnifiedSearchResultsProps {
  results: UnifiedSearchResult[];
  isLoading?: boolean;
  query: string;
  onResultClick?: (result: UnifiedSearchResult) => void;
}

const UnifiedSearchResults: React.FC<UnifiedSearchResultsProps> = ({
  results,
  isLoading = false,
  query,
  onResultClick
}) => {
  const navigate = useNavigate();

  const handleResultClick = (result: UnifiedSearchResult) => {
    onResultClick?.(result);
    
    // Navigate based on result type
    switch (result.type) {
      case 'politician':
        navigate(`/politician/${result.item.id}`);
        break;
      case 'party':
        navigate(`/party?party=${result.item.name}`);
        break;
      case 'topic':
        navigate(`/trending?topic=${encodeURIComponent(result.item.keyword)}`);
        break;
      case 'state':
        navigate(`/search?state=${result.item.name}`);
        break;
      case 'position':
        navigate(`/search?position=${result.item.name}`);
        break;
      case 'platform':
        navigate(`/search?platform=${result.item.name}`);
        break;
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'politician':
        return UserIcon;
      case 'party':
        return BuildingOfficeIcon;
      case 'topic':
        return HashtagIcon;
      case 'state':
        return MapPinIcon;
      case 'position':
        return BuildingOfficeIcon;
      case 'platform':
        return GlobeAltIcon;
      default:
        return FireIcon;
    }
  };

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case 'politician':
        return 'Politician';
      case 'party':
        return 'Political Party';
      case 'topic':
        return 'Trending Topic';
      case 'state':
        return 'State';
      case 'position':
        return 'Political Position';
      case 'platform':
        return 'Platform';
      default:
        return 'Result';
    }
  };

  const getResultTypeColor = (type: string) => {
    switch (type) {
      case 'politician':
        return 'bg-blue-100 text-blue-800';
      case 'party':
        return 'bg-purple-100 text-purple-800';
      case 'topic':
        return 'bg-orange-100 text-orange-800';
      case 'state':
        return 'bg-green-100 text-green-800';
      case 'position':
        return 'bg-indigo-100 text-indigo-800';
      case 'platform':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderPoliticianResult = (politician: Politician) => (
    <div className="flex items-center space-x-3">
      {politician.imageUrl ? (
        <img
          src={politician.imageUrl}
          alt={politician.name}
          className="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <UserIcon className="w-5 h-5 text-gray-500" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {politician.name}
        </p>
        <p className="text-sm text-gray-500 truncate">
          {politician.position} • {politician.party} • {politician.state}
        </p>
        {politician.recentSentiment && (
          <div className="flex items-center space-x-2 mt-1">
            <span className={`text-xs px-2 py-1 rounded-full ${
              politician.recentSentiment.label === 'positive' ? 'bg-green-100 text-green-800' :
              politician.recentSentiment.label === 'negative' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {politician.recentSentiment.label}
            </span>
            <span className="text-xs text-gray-500">
              {politician.recentSentiment.mentionCount} mentions
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const renderTopicResult = (topic: TrendingTopic) => (
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
        <HashtagIcon className="w-5 h-5 text-orange-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate capitalize">
          {topic.keyword}
        </p>
        <p className="text-sm text-gray-500 truncate">
          {topic.mentionCount.toLocaleString()} mentions • {topic.trend} trend
        </p>
        <div className="flex items-center space-x-2 mt-1">
          <span className={`text-xs px-2 py-1 rounded-full ${
            topic.sentimentLabel === 'positive' ? 'bg-green-100 text-green-800' :
            topic.sentimentLabel === 'negative' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {topic.sentimentLabel}
          </span>
          {topic.relatedPoliticians.length > 0 && (
            <span className="text-xs text-gray-500">
              {topic.relatedPoliticians.length} related politicians
            </span>
          )}
        </div>
      </div>
    </div>
  );

  const renderPartyResult = (party: any) => (
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
        <BuildingOfficeIcon className="w-5 h-5 text-purple-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {party.name}
        </p>
        <p className="text-sm text-gray-500 truncate">
          {party.fullName}
        </p>
      </div>
    </div>
  );

  const renderStateResult = (state: any) => (
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
        <MapPinIcon className="w-5 h-5 text-green-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {state.name}
        </p>
        <p className="text-sm text-gray-500 truncate">
          Nigerian State
        </p>
      </div>
    </div>
  );

  const renderPositionResult = (position: any) => (
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
        <BuildingOfficeIcon className="w-5 h-5 text-indigo-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {position.displayName}
        </p>
        <p className="text-sm text-gray-500 truncate">
          {position.level} level position
        </p>
      </div>
    </div>
  );

  const renderPlatformResult = (platform: any) => (
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
        <GlobeAltIcon className="w-5 h-5 text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {platform.displayName}
        </p>
        <p className="text-sm text-gray-500 truncate">
          Social Media Platform
        </p>
      </div>
    </div>
  );

  const renderResultContent = (result: UnifiedSearchResult) => {
    switch (result.type) {
      case 'politician':
        return renderPoliticianResult(result.item);
      case 'topic':
        return renderTopicResult(result.item);
      case 'party':
        return renderPartyResult(result.item);
      case 'state':
        return renderStateResult(result.item);
      case 'position':
        return renderPositionResult(result.item);
      case 'platform':
        return renderPlatformResult(result.item);
      default:
        return (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <FireIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {result.item.name || result.item.keyword || 'Unknown'}
              </p>
            </div>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <FireIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
        <p className="text-gray-500 mb-4">
          No results found for "{query}". Try searching for politicians, parties, topics, states, positions, or platforms.
        </p>
        <div className="text-sm text-gray-400">
          <p>Try searching for:</p>
          <ul className="mt-2 space-y-1">
            <li>• Politicians: "Tinubu", "Peter Obi", "Atiku"</li>
            <li>• Parties: "APC", "PDP", "Labour Party"</li>
            <li>• Topics: "economy", "security", "education"</li>
            <li>• States: "Lagos", "Kano", "Rivers"</li>
            <li>• Positions: "Governor", "Senator", "President"</li>
          </ul>
        </div>
      </div>
    );
  }

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, UnifiedSearchResult[]>);

  return (
    <div className="space-y-6">
      {Object.entries(groupedResults).map(([type, typeResults]) => (
        <div key={type}>
          <div className="flex items-center space-x-2 mb-3">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getResultTypeColor(type)}`}>
              {getResultTypeLabel(type)}
            </span>
            <span className="text-sm text-gray-500">
              {typeResults.length} result{typeResults.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          <div className="space-y-2">
            {typeResults.map((result, index) => (
              <button
                key={`${result.type}-${index}`}
                onClick={() => handleResultClick(result)}
                className="w-full bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all duration-200 text-left"
              >
                {renderResultContent(result)}
                {result.score && (
                  <div className="mt-2 text-xs text-gray-400">
                    Relevance: {((1 - result.score) * 100).toFixed(0)}%
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UnifiedSearchResults;