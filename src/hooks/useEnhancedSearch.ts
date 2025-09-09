import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSearchEngine, SearchResult } from '../lib/searchEngine';
import { mockPoliticians } from '../mock/politicians';
import { useUIStore } from '../stores/uiStore';
import type { Politician } from '../types';

interface UseEnhancedSearchOptions {
  minQueryLength?: number;
  maxSuggestions?: number;
  debounceMs?: number;
  enableHistory?: boolean;
}

interface SearchState {
  query: string;
  isSearching: boolean;
  results: SearchResult[];
  suggestions: SearchResult[];
  historySuggestions: string[];
  error: string | null;
  stats: {
    totalResults: number;
    searchTime: number;
  };
}

export const useEnhancedSearch = (options: UseEnhancedSearchOptions = {}) => {
  const {
    minQueryLength = 2,
    maxSuggestions = 10,
    debounceMs = 150,
    enableHistory = true
  } = options;

  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    isSearching: false,
    results: [],
    suggestions: [],
    historySuggestions: [],
    error: null,
    stats: {
      totalResults: 0,
      searchTime: 0
    }
  });

  const { 
    addToSearchHistory, 
    getSearchSuggestions,
    searchHistory 
  } = useUIStore();

  // Initialize search engine
  const searchEngine = useMemo(() => {
    try {
      return getSearchEngine(mockPoliticians);
    } catch {
      return getSearchEngine(mockPoliticians);
    }
  }, []);

  // Debounced search query
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchState.query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [searchState.query, debounceMs]);

  // Search suggestions query
  const { data: searchResults, isLoading: isSearching } = useQuery({
    queryKey: ['enhanced-search', debouncedQuery],
    queryFn: async (): Promise<{
      results: SearchResult[];
      suggestions: SearchResult[];
      stats: { totalResults: number; searchTime: number };
    }> => {
      const startTime = performance.now();
      
      if (!debouncedQuery || debouncedQuery.length < minQueryLength) {
        return {
          results: [],
          suggestions: [],
          stats: { totalResults: 0, searchTime: 0 }
        };
      }

      // Simulate API delay for realistic performance
      await new Promise(resolve => setTimeout(resolve, 50));

      const results = searchEngine.search(debouncedQuery, {
        maxResults: 50,
        threshold: 0.4
      });

      const suggestions = searchEngine.getSuggestions(debouncedQuery, maxSuggestions);
      
      const endTime = performance.now();
      const searchTime = endTime - startTime;

      return {
        results,
        suggestions,
        stats: {
          totalResults: results.length,
          searchTime
        }
      };
    },
    enabled: debouncedQuery.length >= minQueryLength,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 1
  });

  // Update search state when results change
  useEffect(() => {
    if (searchResults) {
      setSearchState(prev => ({
        ...prev,
        results: searchResults.results,
        suggestions: searchResults.suggestions,
        stats: searchResults.stats,
        isSearching: false,
        error: null
      }));
    }
  }, [searchResults]);

  // Update loading state
  useEffect(() => {
    setSearchState(prev => ({
      ...prev,
      isSearching
    }));
  }, [isSearching]);

  // Get history suggestions
  useEffect(() => {
    if (enableHistory) {
      const historySuggestions = getSearchSuggestions(searchState.query);
      setSearchState(prev => ({
        ...prev,
        historySuggestions
      }));
    }
  }, [searchState.query, searchHistory, enableHistory, getSearchSuggestions]);

  // Search actions
  const setQuery = useCallback((query: string) => {
    setSearchState(prev => ({
      ...prev,
      query,
      error: null
    }));
  }, []);

  const clearSearch = useCallback(() => {
    setSearchState(prev => ({
      ...prev,
      query: '',
      results: [],
      suggestions: [],
      historySuggestions: [],
      error: null,
      stats: { totalResults: 0, searchTime: 0 }
    }));
  }, []);

  const executeSearch = useCallback((query: string) => {
    if (query.trim() && enableHistory) {
      addToSearchHistory(query.trim());
    }
    setQuery(query);
  }, [setQuery, addToSearchHistory, enableHistory]);

  const searchByField = useCallback((query: string, field: keyof Politician) => {
    if (!query || query.length < minQueryLength) return [];
    
    return searchEngine.searchByField(query, field, maxSuggestions);
  }, [searchEngine, minQueryLength, maxSuggestions]);

  const getExactMatches = useCallback((query: string) => {
    if (!query || query.length < minQueryLength) return [];
    
    return searchEngine.getExactMatches(query);
  }, [searchEngine, minQueryLength]);

  const highlightMatches = useCallback((text: string, matches?: any[]) => {
    return searchEngine.highlightMatches(text, matches);
  }, [searchEngine]);

  // Performance metrics
  const performanceMetrics = useMemo(() => ({
    averageSearchTime: searchState.stats.searchTime,
    isPerformant: searchState.stats.searchTime < 300, // Under 300ms requirement
    resultsCount: searchState.stats.totalResults
  }), [searchState.stats]);

  return {
    // State
    query: searchState.query,
    results: searchState.results,
    suggestions: searchState.suggestions,
    historySuggestions: searchState.historySuggestions,
    isSearching: searchState.isSearching,
    error: searchState.error,
    stats: searchState.stats,
    
    // Actions
    setQuery,
    clearSearch,
    executeSearch,
    searchByField,
    getExactMatches,
    highlightMatches,
    
    // Utilities
    hasResults: searchState.results.length > 0,
    hasSuggestions: searchState.suggestions.length > 0,
    hasHistorySuggestions: searchState.historySuggestions.length > 0,
    performanceMetrics,
    
    // Search engine instance for advanced usage
    searchEngine
  };
};