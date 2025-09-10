/**
 * Optimized Multi-Dimensional Data Hooks
 * 
 * These hooks provide performance-optimized access to multi-dimensional data
 * with intelligent caching, memoization, and efficient filtering algorithms.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useRef } from 'react';
import {
    optimizedEnhancedMockDataService,
    type OptimizedFilterState
} from '../lib/optimizedEnhancedMockDataService';
import {
    useDebouncedFilter,
    useMemoizedComputation,
    usePerformanceMonitor
} from '../lib/performanceOptimization';

// Default filter state
const defaultFilterState: OptimizedFilterState = {
  geographic: {
    countries: [],
    states: [],
    lgas: [],
    wards: [],
    pollingUnits: [],
    confidenceThreshold: 0.5
  },
  demographic: {
    education: [],
    occupation: [],
    ageRanges: [],
    gender: [],
    confidenceThreshold: 0.5
  },
  sentiment: {
    polarity: [],
    emotions: [],
    intensityRange: { min: 0, max: 1 },
    complexity: [],
    modelAgreementThreshold: 0.5
  },
  topics: {
    policyAreas: [],
    campaignIssues: [],
    events: [],
    trendingThreshold: 0.5
  },
  engagement: {
    levels: [],
    viralityThreshold: 1000,
    qualityScoreRange: { min: 0, max: 1 },
    influencerAmplification: false
  },
  temporal: {
    timeBlocks: [],
    daysOfWeek: [],
    electionPhases: [],
    dateRange: { start: '', end: '' }
  },
  query: '',
  sortBy: 'relevance',
  sortOrder: 'desc',
  limit: 100
};

/**
 * Hook for optimized multi-dimensional politician data with intelligent caching
 */
export function useOptimizedMultiDimensionalData(
  filters: Partial<OptimizedFilterState> = {},
  options: {
    enabled?: boolean;
    maxResults?: number;
    staleTime?: number;
    gcTime?: number;
    refetchOnWindowFocus?: boolean;
  } = {}
) {
  const {
    enabled = true,
    maxResults = 100,
    staleTime = 2 * 60 * 1000, // 2 minutes
    gcTime = 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus = false
  } = options;

  // Merge with default filters
  const mergedFilters = useMemo(() => ({
    ...defaultFilterState,
    ...filters,
    limit: maxResults
  }), [filters, maxResults]);

  // Generate stable cache key
  const cacheKey = useMemo(() => [
    'optimized-multi-dimensional-data',
    JSON.stringify(mergedFilters)
  ], [mergedFilters]);

  // Performance monitoring
  const { getMetrics } = usePerformanceMonitor('useOptimizedMultiDimensionalData');

  // Main data query with optimizations
  const query = useQuery({
    queryKey: cacheKey,
    queryFn: async () => {
      const result = await optimizedEnhancedMockDataService.getOptimizedEnhancedData(
        mergedFilters,
        {
          useCache: true,
          maxResults,
          includeMetrics: true
        }
      );
      return result;
    },
    enabled,
    staleTime,
    gcTime,
    refetchOnWindowFocus,
    retry: 2,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  // Memoized derived data
  const derivedData = useMemoizedComputation(
    (data) => {
      if (!data?.data) return null;

      return {
        politicians: data.data,
        totalCount: data.totalCount,
        hasMore: data.data.length < data.totalCount,
        isEmpty: data.data.length === 0,
        
        // Aggregated insights
        insights: {
          topStates: getTopStates(data.data),
          topParties: getTopParties(data.data),
          sentimentDistribution: getSentimentDistribution(data.data),
          demographicBreakdown: getDemographicBreakdown(data.data)
        }
      };
    },
    [query.data],
    { maxAge: 5 * 60 * 1000, maxSize: 20 }
  );

  // Performance metrics
  const performanceMetrics = useMemo(() => ({
    ...getMetrics(),
    queryMetrics: query.data?.metrics || { filterTime: 0, cacheHitRate: 0, fromCache: false },
    isOptimal: (query.data?.metrics.filterTime || 0) < 500 // Under 500ms
  }), [query.data?.metrics, getMetrics]);

  return {
    // Data
    data: derivedData?.politicians || [],
    totalCount: derivedData?.totalCount || 0,
    insights: derivedData?.insights,
    
    // Query state
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    isFetching: query.isFetching,
    isSuccess: query.isSuccess,
    
    // Derived state
    hasMore: derivedData?.hasMore || false,
    isEmpty: derivedData?.isEmpty || false,
    
    // Actions
    refetch: query.refetch,
    
    // Performance
    metrics: performanceMetrics
  };
}

/**
 * Hook for optimized search with debouncing and caching
 */
export function useOptimizedSearch(
  query: string,
  filters: Partial<OptimizedFilterState> = {},
  options: {
    debounceMs?: number;
    maxResults?: number;
    minQueryLength?: number;
    enabled?: boolean;
  } = {}
) {
  const {
    debounceMs = 300,
    maxResults = 50,
    minQueryLength = 2,
    enabled = true
  } = options;

  const mergedFilters = useMemo(() => ({
    ...defaultFilterState,
    ...filters,
    query,
    limit: maxResults
  }), [filters, query, maxResults]);

  // Debounced search execution
  const debouncedSearch = useDebouncedFilter(
    () => {
      if (!query || query.length < minQueryLength) return null;
      return optimizedEnhancedMockDataService.searchOptimized(query, mergedFilters, {
        maxResults,
        fuzzyMatch: true
      });
    },
    [query, mergedFilters, maxResults],
    debounceMs
  );

  // Query for search results
  const searchQuery = useQuery({
    queryKey: ['optimized-search', query, JSON.stringify(filters)],
    queryFn: async () => {
      if (!query || query.length < minQueryLength) {
        return { results: [], suggestions: [], metrics: { searchTime: 0, totalResults: 0 } };
      }
      return optimizedEnhancedMockDataService.searchOptimized(query, mergedFilters, {
        maxResults,
        fuzzyMatch: true
      });
    },
    enabled: enabled && query.length >= minQueryLength,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 1
  });

  return {
    // Search results
    results: searchQuery.data?.results || [],
    suggestions: searchQuery.data?.suggestions || [],
    
    // Query state
    isSearching: searchQuery.isFetching,
    isError: searchQuery.isError,
    error: searchQuery.error,
    
    // Derived state
    hasResults: (searchQuery.data?.results.length || 0) > 0,
    hasSuggestions: (searchQuery.data?.suggestions.length || 0) > 0,
    isEmpty: query.length >= minQueryLength && (searchQuery.data?.results.length || 0) === 0,
    
    // Metrics
    metrics: searchQuery.data?.metrics || { searchTime: 0, totalResults: 0 },
    
    // Actions
    refetch: searchQuery.refetch
  };
}

/**
 * Hook for managing filter state with performance optimizations
 */
export function useOptimizedFilterState(initialFilters: Partial<OptimizedFilterState> = {}) {
  const queryClient = useQueryClient();
  const filtersRef = useRef({ ...defaultFilterState, ...initialFilters });

  const updateFilters = useCallback((
    updates: Partial<OptimizedFilterState> | ((prev: OptimizedFilterState) => OptimizedFilterState)
  ) => {
    if (typeof updates === 'function') {
      filtersRef.current = updates(filtersRef.current);
    } else {
      filtersRef.current = { ...filtersRef.current, ...updates };
    }

    // Invalidate related queries
    queryClient.invalidateQueries({ 
      queryKey: ['optimized-multi-dimensional-data'] 
    });
    queryClient.invalidateQueries({ 
      queryKey: ['optimized-search'] 
    });
  }, [queryClient]);

  const clearFilters = useCallback(() => {
    filtersRef.current = { ...defaultFilterState };
    queryClient.invalidateQueries({ 
      queryKey: ['optimized-multi-dimensional-data'] 
    });
    queryClient.invalidateQueries({ 
      queryKey: ['optimized-search'] 
    });
  }, [queryClient]);

  const hasActiveFilters = useMemo(() => {
    const filters = filtersRef.current;
    return (
      filters.query.length > 0 ||
      filters.geographic.states.length > 0 ||
      filters.demographic.education.length > 0 ||
      filters.sentiment.polarity.length > 0 ||
      filters.topics.policyAreas.length > 0 ||
      filters.engagement.levels.length > 0 ||
      filters.temporal.timeBlocks.length > 0
    );
  }, [filtersRef.current]);

  return {
    filters: filtersRef.current,
    updateFilters,
    clearFilters,
    hasActiveFilters
  };
}

/**
 * Hook for performance monitoring and optimization suggestions
 */
export function usePerformanceOptimization() {
  const queryClient = useQueryClient();

  const getPerformanceReport = useCallback(() => {
    return optimizedEnhancedMockDataService.getPerformanceMetrics();
  }, []);

  const clearAllCaches = useCallback(() => {
    optimizedEnhancedMockDataService.clearPerformanceCaches();
    queryClient.clear();
  }, [queryClient]);

  const optimizationSuggestions = useMemo(() => {
    const metrics = optimizedEnhancedMockDataService.getPerformanceMetrics();
    const suggestions: string[] = [];

    if (metrics.cacheHitRate < 0.5) {
      suggestions.push('Consider using more consistent filter combinations to improve cache hit rate');
    }

    if (metrics.filterTime > 1000) {
      suggestions.push('Filter operations are slow. Consider reducing filter complexity or data size');
    }

    if (metrics.memoryUsage > 50) {
      suggestions.push('High memory usage detected. Consider clearing caches periodically');
    }

    return suggestions;
  }, []);

  return {
    getPerformanceReport,
    clearAllCaches,
    optimizationSuggestions
  };
}

// Helper functions for derived data
function getTopStates(data: any[]) {
  const stateCounts = data.reduce((acc, politician) => {
    const state = politician.state || 'Unknown';
    acc[state] = (acc[state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(stateCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([state, count]) => ({ state, count }));
}

function getTopParties(data: any[]) {
  const partyCounts = data.reduce((acc, politician) => {
    const party = politician.party || 'Unknown';
    acc[party] = (acc[party] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(partyCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([party, count]) => ({ party, count }));
}

function getSentimentDistribution(data: any[]) {
  const total = data.length;
  if (total === 0) return { positive: 0, neutral: 0, negative: 0 };

  const distribution = data.reduce((acc, politician) => {
    const sentiment = politician.sentiment || 0;
    if (sentiment > 0.1) acc.positive++;
    else if (sentiment < -0.1) acc.negative++;
    else acc.neutral++;
    return acc;
  }, { positive: 0, neutral: 0, negative: 0 });

  return {
    positive: distribution.positive / total,
    neutral: distribution.neutral / total,
    negative: distribution.negative / total
  };
}

function getDemographicBreakdown(data: any[]) {
  const total = data.length;
  if (total === 0) return {};

  const breakdown = data.reduce((acc, politician) => {
    const demo = politician.demographic || {};
    
    // Age groups
    const ageGroup = demo.ageGroup?.range || 'Unknown';
    acc.ageGroups = acc.ageGroups || {};
    acc.ageGroups[ageGroup] = (acc.ageGroups[ageGroup] || 0) + 1;

    // Education
    const education = demo.education?.level || 'Unknown';
    acc.education = acc.education || {};
    acc.education[education] = (acc.education[education] || 0) + 1;

    return acc;
  }, {} as any);

  // Convert to percentages
  Object.keys(breakdown).forEach(category => {
    Object.keys(breakdown[category]).forEach(key => {
      breakdown[category][key] = breakdown[category][key] / total;
    });
  });

  return breakdown;
}

export default {
  useOptimizedMultiDimensionalData,
  useOptimizedSearch,
  useOptimizedFilterState,
  usePerformanceOptimization
};