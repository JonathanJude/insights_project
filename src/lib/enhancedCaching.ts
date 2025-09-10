/**
 * Enhanced Caching System for Multi-Dimensional Data
 * 
 * This module provides intelligent caching strategies for TanStack Query
 * with multi-dimensional cache keys, optimized data structures, and
 * smart cache invalidation for frequently accessed data combinations.
 */

import { QueryClient, QueryKey } from '@tanstack/react-query';
import { OptimizedFilterState } from './optimizedEnhancedMockDataService';

// Cache configuration constants
export const CACHE_CONFIG = {
  // Stale times for different data types
  STALE_TIME: {
    POLITICIAN_DATA: 5 * 60 * 1000,      // 5 minutes
    SEARCH_RESULTS: 2 * 60 * 1000,       // 2 minutes
    FILTER_OPTIONS: 10 * 60 * 1000,      // 10 minutes
    AGGREGATED_DATA: 3 * 60 * 1000,      // 3 minutes
    GEOGRAPHIC_DATA: 15 * 60 * 1000,     // 15 minutes
    DEMOGRAPHIC_DATA: 10 * 60 * 1000,    // 10 minutes
    SENTIMENT_DATA: 5 * 60 * 1000,       // 5 minutes
    TOPIC_DATA: 8 * 60 * 1000,           // 8 minutes
    ENGAGEMENT_DATA: 3 * 60 * 1000,      // 3 minutes
    TEMPORAL_DATA: 12 * 60 * 1000        // 12 minutes
  },
  
  // Garbage collection times
  GC_TIME: {
    DEFAULT: 10 * 60 * 1000,             // 10 minutes
    LONG_TERM: 30 * 60 * 1000,           // 30 minutes
    SHORT_TERM: 5 * 60 * 1000            // 5 minutes
  },
  
  // Cache sizes
  MAX_CACHE_SIZE: 100,
  MAX_QUERY_RETRIES: 3,
  RETRY_DELAY: 1000
};

// Multi-dimensional cache key generator
export class MultiDimensionalCacheKeyGenerator {
  /**
   * Generate a stable, hierarchical cache key for multi-dimensional filters
   */
  static generateFilterCacheKey(
    baseKey: string,
    filters: Partial<OptimizedFilterState>,
    options: {
      includeQuery?: boolean;
      includeSorting?: boolean;
      includeLimit?: boolean;
    } = {}
  ): QueryKey {
    const { includeQuery = true, includeSorting = true, includeLimit = false } = options;
    
    const keyParts: any[] = [baseKey];
    
    // Geographic dimension
    if (filters.geographic && this.hasActiveFilters(filters.geographic)) {
      keyParts.push({
        geo: {
          states: this.sortArray(filters.geographic.states || []),
          lgas: this.sortArray(filters.geographic.lgas || []),
          confidence: filters.geographic.confidenceThreshold
        }
      });
    }
    
    // Demographic dimension
    if (filters.demographic && this.hasActiveFilters(filters.demographic)) {
      keyParts.push({
        demo: {
          education: this.sortArray(filters.demographic.education || []),
          occupation: this.sortArray(filters.demographic.occupation || []),
          gender: this.sortArray(filters.demographic.gender || []),
          ageRanges: filters.demographic.ageRanges || [],
          confidence: filters.demographic.confidenceThreshold
        }
      });
    }
    
    // Sentiment dimension
    if (filters.sentiment && this.hasActiveFilters(filters.sentiment)) {
      keyParts.push({
        sentiment: {
          polarity: this.sortArray(filters.sentiment.polarity || []),
          emotions: this.sortArray(filters.sentiment.emotions || []),
          intensity: filters.sentiment.intensityRange,
          complexity: this.sortArray(filters.sentiment.complexity || []),
          modelAgreement: filters.sentiment.modelAgreementThreshold
        }
      });
    }
    
    // Topic dimension
    if (filters.topics && this.hasActiveFilters(filters.topics)) {
      keyParts.push({
        topics: {
          policyAreas: this.sortArray(filters.topics.policyAreas || []),
          campaignIssues: this.sortArray(filters.topics.campaignIssues || []),
          events: this.sortArray(filters.topics.events || []),
          trending: filters.topics.trendingThreshold
        }
      });
    }
    
    // Engagement dimension
    if (filters.engagement && this.hasActiveFilters(filters.engagement)) {
      keyParts.push({
        engagement: {
          levels: this.sortArray(filters.engagement.levels || []),
          virality: filters.engagement.viralityThreshold,
          quality: filters.engagement.qualityScoreRange,
          influencer: filters.engagement.influencerAmplification
        }
      });
    }
    
    // Temporal dimension
    if (filters.temporal && this.hasActiveFilters(filters.temporal)) {
      keyParts.push({
        temporal: {
          timeBlocks: this.sortArray(filters.temporal.timeBlocks || []),
          daysOfWeek: this.sortArray(filters.temporal.daysOfWeek || []),
          electionPhases: this.sortArray(filters.temporal.electionPhases || []),
          dateRange: filters.temporal.dateRange
        }
      });
    }
    
    // Query and sorting
    if (includeQuery && filters.query) {
      keyParts.push({ query: filters.query });
    }
    
    if (includeSorting && filters.sortBy) {
      keyParts.push({ 
        sort: { 
          by: filters.sortBy, 
          order: filters.sortOrder 
        } 
      });
    }
    
    if (includeLimit && filters.limit) {
      keyParts.push({ limit: filters.limit });
    }
    
    return keyParts;
  }
  
  /**
   * Generate cache key for search queries
   */
  static generateSearchCacheKey(
    query: string,
    filters: Partial<OptimizedFilterState>,
    options: { maxResults?: number; fuzzyMatch?: boolean } = {}
  ): QueryKey {
    return [
      'optimized-search',
      {
        query: query.toLowerCase().trim(),
        filters: this.generateFilterCacheKey('search-filters', filters, {
          includeQuery: false,
          includeSorting: false,
          includeLimit: false
        }),
        options
      }
    ];
  }
  
  /**
   * Generate cache key for aggregated data
   */
  static generateAggregatedDataCacheKey(
    aggregationType: string,
    filters: Partial<OptimizedFilterState>,
    timeRange?: string
  ): QueryKey {
    return [
      'aggregated-data',
      aggregationType,
      {
        filters: this.generateFilterCacheKey('agg-filters', filters),
        timeRange
      }
    ];
  }
  
  private static hasActiveFilters(filterSection: any): boolean {
    if (!filterSection) return false;
    
    return Object.values(filterSection).some(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => v !== undefined && v !== null && v !== '');
      }
      return value !== undefined && value !== null && value !== '';
    });
  }
  
  private static sortArray(arr: any[]): any[] {
    return [...arr].sort();
  }
}

// Enhanced Query Client with optimized defaults
export function createEnhancedQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: CACHE_CONFIG.STALE_TIME.POLITICIAN_DATA,
        gcTime: CACHE_CONFIG.GC_TIME.DEFAULT,
        retry: CACHE_CONFIG.MAX_QUERY_RETRIES,
        retryDelay: attemptIndex => Math.min(
          CACHE_CONFIG.RETRY_DELAY * 2 ** attemptIndex,
          30000
        ),
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        refetchOnMount: true
      },
      mutations: {
        retry: 2,
        retryDelay: 1000
      }
    }
  });
}

// Cache management utilities
export class CacheManager {
  private queryClient: QueryClient;
  private cacheStats = {
    hits: 0,
    misses: 0,
    invalidations: 0,
    totalQueries: 0
  };
  
  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }
  
  /**
   * Intelligent cache invalidation for multi-dimensional data
   */
  invalidateMultiDimensionalData(
    changedDimensions: Array<'geographic' | 'demographic' | 'sentiment' | 'topics' | 'engagement' | 'temporal'>,
    options: { exact?: boolean; cascade?: boolean } = {}
  ): void {
    const { exact = false, cascade = true } = options;
    
    changedDimensions.forEach(dimension => {
      // Invalidate exact matches
      this.queryClient.invalidateQueries({
        predicate: (query) => {
          const key = JSON.stringify(query.queryKey);
          return key.includes(dimension);
        }
      });
      
      // Cascade invalidation to related data
      if (cascade) {
        this.cascadeInvalidation(dimension);
      }
    });
    
    this.cacheStats.invalidations++;
  }
  
  /**
   * Prefetch frequently accessed data combinations
   */
  async prefetchFrequentCombinations(
    frequentFilters: Array<Partial<OptimizedFilterState>>
  ): Promise<void> {
    const prefetchPromises = frequentFilters.map(async (filters) => {
      const cacheKey = MultiDimensionalCacheKeyGenerator.generateFilterCacheKey(
        'optimized-multi-dimensional-data',
        filters
      );
      
      // Only prefetch if not already cached
      const existingData = this.queryClient.getQueryData(cacheKey);
      if (!existingData) {
        return this.queryClient.prefetchQuery({
          queryKey: cacheKey,
          queryFn: () => this.fetchDataForFilters(filters),
          staleTime: CACHE_CONFIG.STALE_TIME.POLITICIAN_DATA
        });
      }
    });
    
    await Promise.allSettled(prefetchPromises);
  }
  
  /**
   * Optimize cache by removing least recently used entries
   */
  optimizeCache(): void {
    const cache = this.queryClient.getQueryCache();
    const queries = cache.getAll();
    
    // Sort by last access time
    const sortedQueries = queries
      .filter(query => query.state.dataUpdatedAt > 0)
      .sort((a, b) => (a.state.dataUpdatedAt || 0) - (b.state.dataUpdatedAt || 0));
    
    // Remove oldest entries if cache is too large
    if (sortedQueries.length > CACHE_CONFIG.MAX_CACHE_SIZE) {
      const toRemove = sortedQueries.slice(0, sortedQueries.length - CACHE_CONFIG.MAX_CACHE_SIZE);
      toRemove.forEach(query => {
        cache.remove(query);
      });
    }
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats() {
    const cache = this.queryClient.getQueryCache();
    const queries = cache.getAll();
    
    const stats = {
      totalQueries: queries.length,
      activeQueries: queries.filter(q => q.getObserversCount() > 0).length,
      staleQueries: queries.filter(q => q.isStale()).length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      loadingQueries: queries.filter(q => q.state.status === 'pending').length,
      hitRate: this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) || 0,
      ...this.cacheStats
    };
    
    return stats;
  }
  
  /**
   * Clear cache selectively based on patterns
   */
  clearCacheByPattern(pattern: string): void {
    this.queryClient.removeQueries({
      predicate: (query) => {
        const key = JSON.stringify(query.queryKey);
        return key.includes(pattern);
      }
    });
  }
  
  /**
   * Set up automatic cache optimization
   */
  setupAutomaticOptimization(intervalMs: number = 5 * 60 * 1000): () => void {
    const interval = setInterval(() => {
      this.optimizeCache();
    }, intervalMs);
    
    return () => clearInterval(interval);
  }
  
  private cascadeInvalidation(dimension: string): void {
    // Define cascade relationships
    const cascadeMap: Record<string, string[]> = {
      geographic: ['aggregated-data', 'search'],
      demographic: ['aggregated-data', 'search'],
      sentiment: ['aggregated-data', 'search', 'topic-analysis'],
      topics: ['aggregated-data', 'search', 'sentiment-analysis'],
      engagement: ['aggregated-data', 'search'],
      temporal: ['aggregated-data', 'search', 'trend-analysis']
    };
    
    const relatedPatterns = cascadeMap[dimension] || [];
    relatedPatterns.forEach(pattern => {
      this.clearCacheByPattern(pattern);
    });
  }
  
  private async fetchDataForFilters(filters: Partial<OptimizedFilterState>): Promise<any> {
    // This would be replaced with actual data fetching logic
    // For now, return a placeholder
    return { data: [], totalCount: 0 };
  }
}

// React hook for cache management
export function useCacheManager(queryClient: QueryClient) {
  const cacheManager = new CacheManager(queryClient);
  
  return {
    invalidateMultiDimensionalData: cacheManager.invalidateMultiDimensionalData.bind(cacheManager),
    prefetchFrequentCombinations: cacheManager.prefetchFrequentCombinations.bind(cacheManager),
    optimizeCache: cacheManager.optimizeCache.bind(cacheManager),
    getCacheStats: cacheManager.getCacheStats.bind(cacheManager),
    clearCacheByPattern: cacheManager.clearCacheByPattern.bind(cacheManager),
    setupAutomaticOptimization: cacheManager.setupAutomaticOptimization.bind(cacheManager)
  };
}

// Optimized data structures for frequently accessed combinations
export class OptimizedDataStructures {
  private frequentCombinations = new Map<string, {
    filters: Partial<OptimizedFilterState>;
    accessCount: number;
    lastAccessed: number;
    data?: any;
  }>();
  
  private readonly MAX_COMBINATIONS = 50;
  private readonly ACCESS_THRESHOLD = 3;
  
  /**
   * Track filter combination usage
   */
  trackFilterUsage(filters: Partial<OptimizedFilterState>): void {
    const key = this.generateCombinationKey(filters);
    const existing = this.frequentCombinations.get(key);
    
    if (existing) {
      existing.accessCount++;
      existing.lastAccessed = Date.now();
    } else {
      this.frequentCombinations.set(key, {
        filters,
        accessCount: 1,
        lastAccessed: Date.now()
      });
    }
    
    // Clean up old combinations
    this.cleanupOldCombinations();
  }
  
  /**
   * Get frequently accessed filter combinations
   */
  getFrequentCombinations(): Array<Partial<OptimizedFilterState>> {
    return Array.from(this.frequentCombinations.values())
      .filter(combo => combo.accessCount >= this.ACCESS_THRESHOLD)
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, 20)
      .map(combo => combo.filters);
  }
  
  /**
   * Check if a filter combination is frequently used
   */
  isFrequentCombination(filters: Partial<OptimizedFilterState>): boolean {
    const key = this.generateCombinationKey(filters);
    const combo = this.frequentCombinations.get(key);
    return combo ? combo.accessCount >= this.ACCESS_THRESHOLD : false;
  }
  
  /**
   * Get usage statistics
   */
  getUsageStats() {
    const combinations = Array.from(this.frequentCombinations.values());
    const totalAccess = combinations.reduce((sum, combo) => sum + combo.accessCount, 0);
    
    return {
      totalCombinations: combinations.length,
      frequentCombinations: combinations.filter(c => c.accessCount >= this.ACCESS_THRESHOLD).length,
      totalAccess,
      averageAccess: totalAccess / combinations.length || 0,
      topCombinations: combinations
        .sort((a, b) => b.accessCount - a.accessCount)
        .slice(0, 5)
        .map(combo => ({
          accessCount: combo.accessCount,
          lastAccessed: new Date(combo.lastAccessed).toISOString(),
          hasGeographic: !!combo.filters.geographic,
          hasDemographic: !!combo.filters.demographic,
          hasSentiment: !!combo.filters.sentiment
        }))
    };
  }
  
  private generateCombinationKey(filters: Partial<OptimizedFilterState>): string {
    // Create a stable key that represents the filter combination
    const keyParts: string[] = [];
    
    if (filters.geographic?.states?.length) {
      keyParts.push(`geo:${filters.geographic.states.sort().join(',')}`);
    }
    if (filters.demographic?.education?.length) {
      keyParts.push(`edu:${filters.demographic.education.sort().join(',')}`);
    }
    if (filters.sentiment?.polarity?.length) {
      keyParts.push(`sent:${filters.sentiment.polarity.sort().join(',')}`);
    }
    if (filters.topics?.policyAreas?.length) {
      keyParts.push(`topic:${filters.topics.policyAreas.sort().join(',')}`);
    }
    
    return keyParts.join('|') || 'empty';
  }
  
  private cleanupOldCombinations(): void {
    if (this.frequentCombinations.size <= this.MAX_COMBINATIONS) return;
    
    const combinations = Array.from(this.frequentCombinations.entries());
    const sortedByAccess = combinations.sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
    
    // Remove oldest combinations
    const toRemove = sortedByAccess.slice(0, combinations.length - this.MAX_COMBINATIONS);
    toRemove.forEach(([key]) => {
      this.frequentCombinations.delete(key);
    });
  }
}

// Global instances
export const multiDimensionalCacheKeyGenerator = MultiDimensionalCacheKeyGenerator;
export const optimizedDataStructures = new OptimizedDataStructures();

export default {
  MultiDimensionalCacheKeyGenerator,
  createEnhancedQueryClient,
  CacheManager,
  useCacheManager,
  OptimizedDataStructures,
  CACHE_CONFIG
};