/**
 * Optimized Integration Hook
 * 
 * This hook provides a unified interface for all performance optimizations,
 * integrating caching, state management, and filtering optimizations into
 * a single, easy-to-use hook for components.
 */

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';
import {
    optimizedDataStructures,
    useCacheManager
} from '../lib/enhancedCaching';
import type { OptimizedFilterState } from '../lib/optimizedEnhancedMockDataService';
import { usePerformanceMonitor } from '../lib/performanceOptimization';
import {
    useOptimizedFilterActions,
    useOptimizedFilters,
    useOptimizedMultiDimensionalStore,
    useOptimizedPerformanceMetrics
} from '../stores/optimizedMultiDimensionalStore';
import {
    useOptimizedMultiDimensionalData,
    useOptimizedSearch,
    usePerformanceOptimization
} from './useOptimizedMultiDimensionalData';

interface OptimizedIntegrationOptions {
  // Data fetching options
  maxResults?: number;
  enableSearch?: boolean;
  enablePrefetching?: boolean;
  
  // Performance options
  performanceMode?: 'auto' | 'performance' | 'quality';
  enableBatching?: boolean;
  debounceMs?: number;
  
  // Caching options
  enableIntelligentCaching?: boolean;
  cacheOptimizationInterval?: number;
  maxCacheSize?: number;
  
  // Monitoring options
  enablePerformanceMonitoring?: boolean;
  logPerformanceMetrics?: boolean;
  componentName?: string;
}

interface OptimizedIntegrationResult {
  // Data
  data: any[];
  totalCount: number;
  insights: any;
  
  // Search
  searchResults: any[];
  searchSuggestions: string[];
  
  // State
  filters: OptimizedFilterState;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  isFrequentCombination: boolean;
  
  // Loading states
  isLoading: boolean;
  isSearching: boolean;
  isFetching: boolean;
  isError: boolean;
  error: any;
  
  // Actions
  updateFilters: (updates: Partial<OptimizedFilterState>) => void;
  updateGeographicFilters: (updates: Partial<OptimizedFilterState['geographic']>) => void;
  updateDemographicFilters: (updates: Partial<OptimizedFilterState['demographic']>) => void;
  updateSentimentFilters: (updates: Partial<OptimizedFilterState['sentiment']>) => void;
  updateTopicFilters: (updates: Partial<OptimizedFilterState['topics']>) => void;
  updateEngagementFilters: (updates: Partial<OptimizedFilterState['engagement']>) => void;
  updateTemporalFilters: (updates: Partial<OptimizedFilterState['temporal']>) => void;
  clearAllFilters: () => void;
  search: (query: string) => void;
  refetch: () => void;
  
  // Performance
  performanceMetrics: {
    component: any;
    data: any;
    cache: any;
    state: any;
    overall: {
      isOptimal: boolean;
      totalTime: number;
      suggestions: string[];
    };
  };
  
  // Cache management
  optimizeCache: () => void;
  clearCache: () => void;
  prefetchFrequentCombinations: () => Promise<void>;
  
  // Utilities
  saveCurrentFilters: (name: string) => void;
  getRecentCombinations: () => Array<Partial<OptimizedFilterState>>;
  exportPerformanceReport: () => any;
}

/**
 * Main optimized integration hook
 */
export function useOptimizedIntegration(
  initialFilters: Partial<OptimizedFilterState> = {},
  options: OptimizedIntegrationOptions = {}
): OptimizedIntegrationResult {
  const {
    maxResults = 100,
    enableSearch = true,
    enablePrefetching = true,
    performanceMode = 'auto',
    enableBatching = true,
    debounceMs = 150,
    enableIntelligentCaching = true,
    cacheOptimizationInterval = 5 * 60 * 1000, // 5 minutes
    maxCacheSize = 100,
    enablePerformanceMonitoring = true,
    logPerformanceMetrics = false,
    componentName = 'OptimizedIntegration'
  } = options;

  // Performance monitoring
  const { getMetrics: getComponentMetrics } = usePerformanceMonitor(componentName);
  
  // Query client for cache management
  const queryClient = useQueryClient();
  const cacheManager = useCacheManager(queryClient);
  
  // State management
  const store = useOptimizedMultiDimensionalStore();
  const filters = useOptimizedFilters();
  const filterActions = useOptimizedFilterActions();
  const { performance: statePerformance, getPerformanceReport } = useOptimizedPerformanceMetrics();
  
  // Initialize filters
  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      filterActions.updateFilters(initialFilters);
    }
  }, []); // Only run once on mount
  
  // Set performance mode
  useEffect(() => {
    store.setPerformanceMode(performanceMode);
  }, [performanceMode, store]);
  
  // Data fetching with optimizations
  const dataQuery = useOptimizedMultiDimensionalData(filters, {
    enabled: true,
    maxResults,
    staleTime: enableIntelligentCaching ? 2 * 60 * 1000 : 30 * 1000,
    gcTime: enableIntelligentCaching ? 5 * 60 * 1000 : 2 * 60 * 1000,
    refetchOnWindowFocus: false
  });
  
  // Search functionality
  const searchQuery = useOptimizedSearch(
    filters.query,
    filters,
    {
      debounceMs,
      maxResults: Math.min(maxResults, 50),
      enabled: enableSearch && filters.query.length > 0
    }
  );
  
  // Performance optimization utilities
  const performanceUtils = usePerformanceOptimization();
  
  // Automatic cache optimization
  useEffect(() => {
    if (!enableIntelligentCaching) return;
    
    const interval = setInterval(() => {
      cacheManager.optimizeCache();
      store.optimizeState();
    }, cacheOptimizationInterval);
    
    return () => clearInterval(interval);
  }, [enableIntelligentCaching, cacheOptimizationInterval, cacheManager, store]);
  
  // Prefetch frequent combinations
  const prefetchFrequentCombinations = useCallback(async () => {
    if (!enablePrefetching) return;
    
    const frequentCombinations = optimizedDataStructures.getFrequentCombinations();
    await cacheManager.prefetchFrequentCombinations(frequentCombinations);
  }, [enablePrefetching, cacheManager]);
  
  // Run prefetching on mount and periodically
  useEffect(() => {
    if (enablePrefetching) {
      prefetchFrequentCombinations();
      
      const interval = setInterval(prefetchFrequentCombinations, 10 * 60 * 1000); // Every 10 minutes
      return () => clearInterval(interval);
    }
  }, [enablePrefetching, prefetchFrequentCombinations]);
  
  // Performance metrics aggregation
  const performanceMetrics = useMemo(() => {
    const componentMetrics = getComponentMetrics();
    const dataMetrics = dataQuery.metrics;
    const cacheMetrics = cacheManager.getCacheStats();
    const stateMetrics = getPerformanceReport();
    
    const totalTime = 
      componentMetrics.averageRenderTime +
      (dataMetrics.queryMetrics?.filterTime || 0) +
      stateMetrics.averageUpdateTime;
    
    const isOptimal = 
      componentMetrics.isPerformant &&
      (dataMetrics.queryMetrics?.filterTime || 0) < 500 &&
      stateMetrics.averageUpdateTime < 100 &&
      cacheMetrics.hitRate > 0.6;
    
    const suggestions: string[] = [
      ...stateMetrics.suggestions,
      ...(dataMetrics.isOptimal ? [] : ['Consider reducing filter complexity for better performance']),
      ...(cacheMetrics.hitRate < 0.5 ? ['Cache hit rate is low - try using more consistent filter patterns'] : []),
      ...(componentMetrics.averageRenderTime > 16.67 ? ['Component render time is high - consider memoization'] : [])
    ];
    
    return {
      component: componentMetrics,
      data: dataMetrics,
      cache: cacheMetrics,
      state: stateMetrics,
      overall: {
        isOptimal,
        totalTime,
        suggestions: [...new Set(suggestions)] // Remove duplicates
      }
    };
  }, [getComponentMetrics, dataQuery.metrics, cacheManager, getPerformanceReport]);
  
  // Log performance metrics if enabled
  useEffect(() => {
    if (logPerformanceMetrics && enablePerformanceMonitoring) {
      console.group(`Performance Metrics - ${componentName}`);
      console.log('Overall Performance:', performanceMetrics.overall);
      console.log('Component Metrics:', performanceMetrics.component);
      console.log('Data Metrics:', performanceMetrics.data);
      console.log('Cache Metrics:', performanceMetrics.cache);
      console.log('State Metrics:', performanceMetrics.state);
      console.groupEnd();
    }
  }, [performanceMetrics, logPerformanceMetrics, enablePerformanceMonitoring, componentName]);
  
  // Optimized filter update functions
  const updateFilters = useCallback((updates: Partial<OptimizedFilterState>) => {
    if (enableBatching && typeof updates === 'object' && Object.keys(updates).length > 1) {
      // Use batch update for multiple changes
      const batchUpdates = Object.entries(updates).map(([section, data]) => ({
        section: section as keyof OptimizedFilterState,
        data
      }));
      filterActions.batchUpdateFilters(batchUpdates);
    } else {
      filterActions.updateFilters(updates);
    }
  }, [enableBatching, filterActions]);
  
  // Search function
  const search = useCallback((query: string) => {
    updateFilters({ query });
  }, [updateFilters]);
  
  // Cache management functions
  const optimizeCache = useCallback(() => {
    cacheManager.optimizeCache();
    store.optimizeState();
  }, [cacheManager, store]);
  
  const clearCache = useCallback(() => {
    cacheManager.clearCacheByPattern('optimized');
    performanceUtils.clearAllCaches();
  }, [cacheManager, performanceUtils]);
  
  // Utility functions
  const saveCurrentFilters = useCallback((name: string) => {
    store.saveFilterCombination(name);
  }, [store]);
  
  const getRecentCombinations = useCallback(() => {
    return store.getRecentCombinations();
  }, [store]);
  
  const exportPerformanceReport = useCallback(() => {
    return {
      timestamp: new Date().toISOString(),
      component: componentName,
      metrics: performanceMetrics,
      filterState: filters,
      dataStructureStats: optimizedDataStructures.getUsageStats(),
      recommendations: performanceMetrics.overall.suggestions
    };
  }, [componentName, performanceMetrics, filters]);
  
  // Computed values
  const hasActiveFilters = store.hasActiveFilters;
  const activeFilterCount = store.activeFilterCount;
  const isFrequentCombination = store.isFrequentCombination;
  
  return {
    // Data
    data: dataQuery.data,
    totalCount: dataQuery.totalCount,
    insights: dataQuery.insights,
    
    // Search
    searchResults: searchQuery.results,
    searchSuggestions: searchQuery.suggestions,
    
    // State
    filters,
    hasActiveFilters,
    activeFilterCount,
    isFrequentCombination,
    
    // Loading states
    isLoading: dataQuery.isLoading,
    isSearching: searchQuery.isSearching,
    isFetching: dataQuery.isFetching,
    isError: dataQuery.isError || searchQuery.isError,
    error: dataQuery.error || searchQuery.error,
    
    // Actions
    updateFilters,
    updateGeographicFilters: filterActions.updateGeographicFilters,
    updateDemographicFilters: filterActions.updateDemographicFilters,
    updateSentimentFilters: filterActions.updateSentimentFilters,
    updateTopicFilters: filterActions.updateTopicFilters,
    updateEngagementFilters: filterActions.updateEngagementFilters,
    updateTemporalFilters: filterActions.updateTemporalFilters,
    clearAllFilters: filterActions.clearAllFilters,
    search,
    refetch: dataQuery.refetch,
    
    // Performance
    performanceMetrics,
    
    // Cache management
    optimizeCache,
    clearCache,
    prefetchFrequentCombinations,
    
    // Utilities
    saveCurrentFilters,
    getRecentCombinations,
    exportPerformanceReport
  };
}

/**
 * Lightweight hook for components that only need basic filtering
 */
export function useOptimizedFiltering(
  initialFilters: Partial<OptimizedFilterState> = {}
) {
  const integration = useOptimizedIntegration(initialFilters, {
    enableSearch: false,
    enablePrefetching: false,
    enablePerformanceMonitoring: false,
    performanceMode: 'performance'
  });
  
  return {
    data: integration.data,
    filters: integration.filters,
    updateFilters: integration.updateFilters,
    clearAllFilters: integration.clearAllFilters,
    isLoading: integration.isLoading,
    hasActiveFilters: integration.hasActiveFilters
  };
}

/**
 * Hook for search-focused components
 */
export function useOptimizedSearching(
  initialQuery: string = '',
  initialFilters: Partial<OptimizedFilterState> = {}
) {
  const integration = useOptimizedIntegration(
    { ...initialFilters, query: initialQuery },
    {
      enableSearch: true,
      maxResults: 50,
      debounceMs: 200,
      performanceMode: 'quality'
    }
  );
  
  return {
    results: integration.searchResults,
    suggestions: integration.searchSuggestions,
    query: integration.filters.query,
    search: integration.search,
    isSearching: integration.isSearching,
    hasResults: integration.searchResults.length > 0,
    filters: integration.filters,
    updateFilters: integration.updateFilters
  };
}

export default useOptimizedIntegration;