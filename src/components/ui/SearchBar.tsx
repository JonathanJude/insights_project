import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePoliticianSuggestions } from '../../hooks/usePoliticians';
import { useFilterStore } from '../../stores/filterStore';
import { useUIStore } from '../../stores/uiStore';
import type { Politician } from '../../types';
import { getFallbackAvatarUrl } from '../../utils/avatarUtils';

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
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { setSearchQuery } = useFilterStore();
  const { addToSearchHistory: addToUIHistory } = useUIStore();
  
  // Get search suggestions
  const { data: suggestions = [], isLoading } = usePoliticianSuggestions(query, query.length >= 2);

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
      addToUIHistory(finalQuery);
      
      if (onSearch) {
        onSearch(finalQuery);
      } else {
        navigate(`/search?q=${encodeURIComponent(finalQuery)}`);
      }
      
      setIsOpen(false);
      setQuery('');
      inputRef.current?.blur();
    }
  };

  // Handle politician selection
  const handlePoliticianSelect = (politician: Politician) => {
    addToUIHistory(`${politician.name} (${politician.party})`);
    navigate(`/politician/${politician.id}`);
    setIsOpen(false);
    setQuery('');
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handlePoliticianSelect(suggestions[selectedIndex]);
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

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-medium">{part}</span>
      ) : (
        part
      )
    );
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
        {isLoading && (
          <div className="absolute inset-y-0 right-12 flex items-center pr-3">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (query.length >= 2) && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto"
        >
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                <span>Searching...</span>
              </div>
            </div>
          ) : suggestions.length > 0 ? (
            <>
              {/* Politicians */}
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b">
                  Politicians
                </div>
                {suggestions.map((politician, index) => (
                  <button
                    key={politician.id}
                    onClick={() => handlePoliticianSelect(politician)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors ${
                      selectedIndex === index ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img 
                        src={politician.imageUrl || getFallbackAvatarUrl(politician.name)} 
                        alt={politician.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {highlightMatch(politician.name, query)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {politician.party} • {politician.position} • {politician.state}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Search All Results */}
              <div className="border-t">
                <button
                  onClick={() => handleSearch()}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
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
                        View all results
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </>
          ) : (
            <div className="px-4 py-6 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No politicians found</h3>
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
        </div>
      )}
    </div>
  );
};

export default SearchBar;