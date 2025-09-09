import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFilterStore } from '../../stores/filterStore';
import { useUIStore } from '../../stores/uiStore';
import type { Politician } from '../../types';
import PoliticianImage from './PoliticianImage';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  showFilters?: boolean;
  onSearch?: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = "Search politicians by name, party, or state...",
  className = "",
  onSearch
}) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { setSearchQuery } = useFilterStore();
  const { removeFromSearchHistory } = useUIStore();
  
  // Enhanced search functionality
  const {
    query,
    suggestions,
    historySuggestions,
    isSearching,
    setQuery,
    executeSearch,
    clearSearch,
    highlightMatches,
    performanceMetrics
  } = useEnhancedSearch({
    minQueryLength: 2,
    maxSuggestions: 8,
    debounceMs: 150
  });

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);
    setIsOpen(value.length >= 2);
  };

  // Handle search submission
  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (finalQuery.trim()) {
      setSearchQuery(finalQuery);
      executeSearch(finalQuery);
      
      if (onSearch) {
        onSearch(finalQuery);
      } else {
        // Always navigate to update URL, even if already on search page
        navigate(`/search?q=${encodeURIComponent(finalQuery)}`);
      }
      
      setIsOpen(false);
      clearSearch();
      inputRef.current?.blur();
    }
  };

  // Handle politician selection
  const handlePoliticianSelect = (politician: Politician) => {
    executeSearch(`${politician.name} (${politician.party})`);
    navigate(`/politician/${politician.id}`);
    setIsOpen(false);
    clearSearch();
  };

  // Handle history suggestion selection
  const handleHistorySelect = (historyQuery: string) => {
    setQuery(historyQuery);
    handleSearch(historyQuery);
  };

  // Handle history item removal
  const handleRemoveHistory = (historyQuery: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeFromSearchHistory(historyQuery);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    const totalItems = suggestions.length + historySuggestions.length + 1; // +1 for "Search for" option

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < totalItems - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          if (selectedIndex < historySuggestions.length) {
            // History suggestion selected
            handleHistorySelect(historySuggestions[selectedIndex]);
          } else if (selectedIndex < historySuggestions.length + suggestions.length) {
            // Politician suggestion selected
            const politicianIndex = selectedIndex - historySuggestions.length;
            handlePoliticianSelect(suggestions[politicianIndex].item);
          } else {
            // "Search for" option selected
            handleSearch();
          }
        } else {
          handleSearch();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Highlight matching text using enhanced search
  const renderHighlightedText = (text: string, matches?: any[]) => {
    if (!matches || matches.length === 0) {
      // Fallback to simple highlighting
      if (!query) return text;
      const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      const parts = text.split(regex);
      
      return parts.map((part, index) => 
        regex.test(part) ? (
          <span key={index} className="bg-yellow-200 font-medium">{part}</span>
        ) : (
          part
        )
      );
    }
    
    // Use enhanced highlighting from search engine
    return <span dangerouslySetInnerHTML={{ __html: highlightMatches(text, matches) }} />;
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {/* Search Icon */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            className="h-5 w-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />

        {/* Search Button */}
        <div className="absolute inset-y-0 right-0 flex items-center">
          <button
            onClick={() => handleSearch()}
            className="h-full px-4 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
            disabled={!query.trim()}
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path 
                fillRule="evenodd" 
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
                clipRule="evenodd" 
              />
            </svg>
          </button>
        </div>

        {/* Loading Indicator */}
        {isSearching && (
          <div className="absolute inset-y-0 right-12 flex items-center pr-3">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {/* Performance Indicator (dev mode) */}
        {process.env.NODE_ENV === 'development' && performanceMetrics.averageSearchTime > 0 && (
          <div className="absolute inset-y-0 right-20 flex items-center pr-3">
            <span className={`text-xs ${performanceMetrics.isPerformant ? 'text-green-500' : 'text-red-500'}`}>
              {Math.round(performanceMetrics.averageSearchTime)}ms
            </span>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (query.length >= 2) && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
          {isSearching ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span>Searching...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Search History */}
              {historySuggestions.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b">
                    Recent Searches
                  </div>
                  {historySuggestions.map((historyQuery, index) => (
                    <button
                      key={`history-${index}`}
                      onClick={() => handleHistorySelect(historyQuery)}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors group ${
                        selectedIndex === index ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="text-sm text-gray-700">
                            {renderHighlightedText(historyQuery)}
                          </div>
                        </div>
                        <button
                          onClick={(e) => handleRemoveHistory(historyQuery, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 transition-all"
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Politicians */}
              {suggestions.length > 0 && (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b">
                    Politicians
                  </div>
                  {suggestions.map((result, index) => {
                    const adjustedIndex = historySuggestions.length + index;
                    return (
                      <button
                        key={result.item.id}
                        onClick={() => handlePoliticianSelect(result.item)}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors ${
                          selectedIndex === adjustedIndex ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <PoliticianImage
                            politician={result.item}
                            size="sm"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900">
                              {renderHighlightedText(result.item.name, result.matches)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {result.item.party} • {result.item.position} • {result.item.state}
                            </div>
                            {result.score && process.env.NODE_ENV === 'development' && (
                              <div className="text-xs text-gray-400">
                                Score: {(result.score * 100).toFixed(1)}%
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
              
              {/* Search All Results */}
              <div className={`${(historySuggestions.length > 0 || suggestions.length > 0) ? 'border-t' : ''}`}>
                <button
                  onClick={() => handleSearch()}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors ${
                    selectedIndex === historySuggestions.length + suggestions.length ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        Search for "{query}"
                      </div>
                      <div className="text-xs text-gray-500">
                        View all results {performanceMetrics.resultsCount > 0 && `(${performanceMetrics.resultsCount} found)`}
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* No Results */}
              {suggestions.length === 0 && historySuggestions.length === 0 && (
                <div className="px-4 py-6 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No suggestions found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try searching with a different term
                  </p>
                  <button
                    onClick={() => handleSearch()}
                    className="mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Search anyway
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;