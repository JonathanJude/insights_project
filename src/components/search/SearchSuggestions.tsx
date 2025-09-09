import {
    BuildingOfficeIcon,
    FireIcon,
    GlobeAltIcon,
    HashtagIcon,
    MapPinIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import React from 'react';
import type { UnifiedSearchResult } from '../../lib/unifiedSearchEngine';

interface SearchSuggestionsProps {
  suggestions: UnifiedSearchResult[];
  isLoading?: boolean;
  onSuggestionClick: (suggestion: UnifiedSearchResult) => void;
  onSuggestionSelect: (suggestion: UnifiedSearchResult) => void;
  query: string;
}

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  isLoading = false,
  onSuggestionClick,
  onSuggestionSelect,
  query
}) => {
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

  const getResultTypeColor = (type: string) => {
    switch (type) {
      case 'politician':
        return 'text-blue-600';
      case 'party':
        return 'text-purple-600';
      case 'topic':
        return 'text-orange-600';
      case 'state':
        return 'text-green-600';
      case 'position':
        return 'text-indigo-600';
      case 'platform':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSuggestionText = (suggestion: UnifiedSearchResult): string => {
    switch (suggestion.type) {
      case 'politician':
        return suggestion.item.name;
      case 'party':
        return suggestion.item.name;
      case 'topic':
        return suggestion.item.keyword;
      case 'state':
        return suggestion.item.name;
      case 'position':
        return suggestion.item.displayName;
      case 'platform':
        return suggestion.item.displayName;
      default:
        return suggestion.item.name || suggestion.item.keyword || 'Unknown';
    }
  };

  const getSuggestionSubtext = (suggestion: UnifiedSearchResult): string => {
    switch (suggestion.type) {
      case 'politician':
        return `${suggestion.item.position} • ${suggestion.item.party}`;
      case 'party':
        return suggestion.item.fullName;
      case 'topic':
        return `${suggestion.item.mentionCount?.toLocaleString()} mentions`;
      case 'state':
        return 'Nigerian State';
      case 'position':
        return `${suggestion.item.level} level position`;
      case 'platform':
        return 'Social Media Platform';
      default:
        return '';
    }
  };

  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50">
        <div className="p-2">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center space-x-3 p-2 animate-pulse">
              <div className="w-5 h-5 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-50 max-h-96 overflow-y-auto">
      <div className="p-2">
        {suggestions.map((suggestion, index) => {
          const IconComponent = getResultIcon(suggestion.type);
          const suggestionText = getSuggestionText(suggestion);
          const suggestionSubtext = getSuggestionSubtext(suggestion);
          
          return (
            <button
              key={`${suggestion.type}-${index}`}
              onClick={() => onSuggestionClick(suggestion)}
              onMouseDown={(e) => {
                // Prevent input blur when clicking suggestion
                e.preventDefault();
                onSuggestionSelect(suggestion);
              }}
              className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
            >
              <IconComponent className={`w-5 h-5 flex-shrink-0 ${getResultTypeColor(suggestion.type)}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {suggestionText}
                </div>
                {suggestionSubtext && (
                  <div className="text-xs text-gray-500 truncate">
                    {suggestionSubtext}
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-400 capitalize">
                {suggestion.type}
              </div>
            </button>
          );
        })}
        
        {suggestions.length > 0 && (
          <div className="border-t border-gray-100 mt-2 pt-2">
            <div className="text-xs text-gray-500 px-2 py-1">
              Press Enter to search for "{query}" across all categories
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchSuggestions;