import React, { useEffect, useRef, useState } from 'react';
import { useSearchSuggestions } from '../../hooks/useAdvancedSearch';

interface AdvancedSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  placeholder?: string;
  showSuggestions?: boolean;
  showConfidenceFilter?: boolean;
  confidenceThreshold?: number;
  onConfidenceChange?: (threshold: number) => void;
  className?: string;
}

const AdvancedSearchBar: React.FC<AdvancedSearchBarProps> = ({
  value,
  onChange,
  onSearch,
  placeholder = "Search politicians, topics, locations...",
  showSuggestions = true,
  showConfidenceFilter = false,
  confidenceThreshold = 0.5,
  onConfidenceChange,
  className = ""
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestionsPanel, setShowSuggestionsPanel] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Get search suggestions
  const { data: suggestions, isLoading: suggestionsLoading } = useSearchSuggestions(
    value,
    showSuggestions && value.length >= 2
  );

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestionsPanel(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    if (showSuggestions && newValue.length >= 2) {
      setShowSuggestionsPanel(true);
    } else {
      setShowSuggestionsPanel(false);
    }
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (showSuggestions && value.length >= 2) {
      setShowSuggestionsPanel(true);
    }
  };

  const handleInputBlur = () => {
    setIsFocused(false);
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestionsPanel(false), 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch(value);
      setShowSuggestionsPanel(false);
    } else if (e.key === 'Escape') {
      setShowSuggestionsPanel(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    onSearch(suggestion);
    setShowSuggestionsPanel(false);
    inputRef.current?.focus();
  };

  const handleSearchClick = () => {
    onSearch(value);
    setShowSuggestionsPanel(false);
  };

  const SuggestionCategory: React.FC<{
    title: string;
    items: string[];
    icon: string;
    color: string;
  }> = ({ title, items, icon, color }) => {
    if (!items || items.length === 0) return null;

    return (
      <div className="py-2">
        <div className="flex items-center space-x-2 px-3 py-1 text-xs font-medium text-gray-500 uppercase tracking-wide">
          <span className={color}>{icon}</span>
          <span>{title}</span>
        </div>
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(item)}
            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {item}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Search Input */}
      <div className={`relative flex items-center ${
        isFocused ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      } border border-gray-300 rounded-lg bg-white transition-all duration-200`}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="block w-full pl-10 pr-12 py-3 border-0 rounded-lg focus:outline-none focus:ring-0 text-sm"
        />
        
        {/* Search Button */}
        <button
          onClick={handleSearchClick}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
      </div>

      {/* Confidence Threshold Filter */}
      {showConfidenceFilter && (
        <div className="mt-2 flex items-center space-x-3 text-sm">
          <span className="text-gray-600">Confidence:</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={confidenceThreshold}
            onChange={(e) => onConfidenceChange?.(parseFloat(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-gray-700 font-medium min-w-[3rem]">
            {(confidenceThreshold * 100).toFixed(0)}%
          </span>
        </div>
      )}

      {/* Search Suggestions Panel */}
      {showSuggestionsPanel && suggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {suggestionsLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="inline-flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading suggestions...
              </div>
            </div>
          ) : (
            <div className="py-2">
              <SuggestionCategory
                title="Politicians"
                items={suggestions.politicians}
                icon="👤"
                color="text-blue-500"
              />
              
              <SuggestionCategory
                title="Topics"
                items={suggestions.topics}
                icon="📋"
                color="text-green-500"
              />
              
              <SuggestionCategory
                title="Locations"
                items={suggestions.locations}
                icon="📍"
                color="text-red-500"
              />
              
              <SuggestionCategory
                title="Demographics"
                items={suggestions.demographics}
                icon="👥"
                color="text-purple-500"
              />

              {/* No suggestions message */}
              {!suggestions.politicians.length && 
               !suggestions.topics.length && 
               !suggestions.locations.length && 
               !suggestions.demographics.length && (
                <div className="p-4 text-center text-gray-500">
                  <div className="text-sm">No suggestions found</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Try searching for politicians, topics, or locations
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearchBar;