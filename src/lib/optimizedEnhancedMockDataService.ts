/**
 * Optimized Enhanced Mock Data Service
 * 
 * This service extends the enhanced mock data service with performance optimizations
 * including intelligent caching, memoization, and efficient filtering algorithms
 * for multi-dimensional data queries.
 */

import { EnhancedMockDataService, type EnhancedPoliticianData } from './enhancedMockDataService';
import { OptimizedFilterEngine } from './performanceOptimization';

// Enhanced filter interface with performance optimizations
export interface OptimizedFilterState {
  // Geographic filters
  geographic: {
    countries: string[];
    states: string[];
    lgas: string[];
    wards: string[];
    pollingUnits: string[];
    confidenceThreshold: number;
  };
  
  // Demographic filters
  demographic: {
    education: string[];
    occupation: string[];
    ageRanges: { min: number; max: number }[];
    gender: string[];
    confidenceThreshold: number;
  };
  
  // Sentiment filters
  sentiment: {
    polarity: string[];
    emotions: string[];
    intensityRange: { min: number; max: number };
    complexity: string[];
    modelAgreementThreshold: number;
  };
  
  // Topic filters
  topics: {
    policyAreas: string[];
    campaignIssues: string[];
    events: string[];
    trendingThreshold: number;
  };
  
  // Engagement filters
  engagement: {
    levels: string[];
    viralityThreshold: number;
    qualityScoreRange: { min: number; max: number };
    influencerAmplification: boolean;
  };
  
  // Temporal filters
  temporal: {
    timeBlocks: string[];
    daysOfWeek: string[];
    electionPhases: string[];
    dateRange: { start: string; end: string };
  };
  
  // Query and sorting
  query: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  limit: number;
}

// Performance-optimized data structures
interface IndexedPoliticianData extends EnhancedPoliticianData {
  // Flattened fields for efficient indexing
  _indexed: {
    state: string;
    party: string;
    educationLevel: string;
    occupationSector: string;
    ageGroup: string;
    gender: string;
    sentimentPolarity: string;
    primaryEmotion: string;
    intensityLevel: string;
    complexityType: string;
    policyAreas: string[];
    engagementLevel: string;
    timeBlock: string;
    dayOfWeek: string;
    electionPhase: string;
  };
}

// Optimized service class
export class OptimizedEnhancedMockDataService extends EnhancedMockDataService {
  private static optimizedInstance: OptimizedEnhancedMockDataService;
  private filterEngine: OptimizedFilterEngine;
  private indexedDataCache = new Map<string, IndexedPoliticianData[]>();
  private lastIndexUpdate = 0;
  private readonly INDEX_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    super();
    this.filterEngine = OptimizedFilterEngine.getInstance();
  }

  static getInstance(): OptimizedEnhancedMockDataService {
    if (!OptimizedEnhancedMockDataService.optimizedInstance) {
      OptimizedEnhancedMockDataService.optimizedInstance = new OptimizedEnhancedMockDataService();
    }
    return OptimizedEnhancedMockDataService.optimizedInstance;
  }

  /**
   * Get optimized enhanced politician data with intelligent caching
   */
  async getOptimizedEnhancedData(
    filters: OptimizedFilterState,
    options: {
      useCache?: boolean;
      maxResults?: number;
      includeMetrics?: boolean;
    } = {}
  ): Promise<{
    data: IndexedPoliticianData[];
    totalCount: number;
    metrics: {
      filterTime: number;
      cacheHitRate: number;
      fromCache: boolean;
    };
  }> {
    const startTime = performance.now();
    const { useCache = true, maxResults = 1000, includeMetrics = true } = options;

    try {
      // Get or create indexed data
      const indexedData = await this.getIndexedData();
      
      // Apply optimized filtering
      const filterResult = this.filterEngine.filterMultiDimensional(
        indexedData,
        this.convertFiltersToIndexFormat(filters),
        {
          useIndexes: true,
          maxResults,
          earlyTermination: true
        }
      );

      // Apply sorting if needed
      const sortedData = this.applySorting(filterResult.data, filters.sortBy, filters.sortOrder);

      const metrics = {
        filterTime: performance.now() - startTime,
        cacheHitRate: filterResult.metrics.cacheHitRate,
        fromCache: filterResult.fromCache
      };

      return {
        data: sortedData.slice(0, filters.limit || maxResults),
        totalCount: filterResult.data.length,
        metrics: includeMetrics ? metrics : { filterTime: 0, cacheHitRate: 0, fromCache: false }
      };

    } catch (error) {
      console.error('Error in optimized enhanced data retrieval:', error);
      
      // Fallback to basic service
      const fallbackData = await this.getAllEnhancedData();
      return {
        data: fallbackData.slice(0, maxResults) as IndexedPoliticianData[],
        totalCount: fallbackData.length,
        metrics: { filterTime: performance.now() - startTime, cacheHitRate: 0, fromCache: false }
      };
    }
  }

  /**
   * Get or create indexed data with automatic refresh
   */
  private async getIndexedData(): Promise<IndexedPoliticianData[]> {
    const now = Date.now();
    const cacheKey = 'indexed-politician-data';

    // Check if we need to refresh the index
    if (
      !this.indexedDataCache.has(cacheKey) ||
      now - this.lastIndexUpdate > this.INDEX_UPDATE_INTERVAL
    ) {
      const rawData = await EnhancedMockDataService.getAllEnhancedData();
      const indexedData = this.createIndexedData(rawData);
      
      // Create optimized indexes
      this.filterEngine.createIndexes(indexedData, [
        '_indexed.state',
        '_indexed.party',
        '_indexed.educationLevel',
        '_indexed.occupationSector',
        '_indexed.ageGroup',
        '_indexed.gender',
        '_indexed.sentimentPolarity',
        '_indexed.primaryEmotion',
        '_indexed.intensityLevel',
        '_indexed.complexityType',
        '_indexed.engagementLevel',
        '_indexed.timeBlock',
        '_indexed.dayOfWeek',
        '_indexed.electionPhase'
      ]);

      this.indexedDataCache.set(cacheKey, indexedData);
      this.lastIndexUpdate = now;
    }

    return this.indexedDataCache.get(cacheKey)!;
  }

  /**
   * Create indexed data structure for efficient filtering
   */
  private createIndexedData(rawData: EnhancedPoliticianData[]): IndexedPoliticianData[] {
    return rawData.map(politician => ({
      ...politician,
      _indexed: {
        state: politician.geographic.state.name,
        party: politician.party,
        educationLevel: politician.demographic.education.level,
        occupationSector: politician.demographic.occupation.sector,
        ageGroup: politician.demographic.ageGroup.range,
        gender: politician.demographic.gender.classification,
        sentimentPolarity: politician.enhancedSentiment.polarity.classification,
        primaryEmotion: politician.enhancedSentiment.emotions.primary,
        intensityLevel: politician.enhancedSentiment.intensity.level,
        complexityType: politician.enhancedSentiment.complexity.type,
        policyAreas: politician.topics.policyAreas,
        engagementLevel: politician.engagement.level,
        timeBlock: this.getCurrentTimeBlock(),
        dayOfWeek: this.getCurrentDayOfWeek(),
        electionPhase: this.getCurrentElectionPhase()
      }
    }));
  }

  /**
   * Convert filter state to indexed format for efficient filtering
   */
  private convertFiltersToIndexFormat(filters: OptimizedFilterState): Record<string, any> {
    const indexedFilters: Record<string, any> = {};

    // Geographic filters
    if (filters.geographic.states.length > 0) {
      indexedFilters['_indexed.state'] = filters.geographic.states;
    }

    // Demographic filters
    if (filters.demographic.education.length > 0) {
      indexedFilters['_indexed.educationLevel'] = filters.demographic.education;
    }
    if (filters.demographic.occupation.length > 0) {
      indexedFilters['_indexed.occupationSector'] = filters.demographic.occupation;
    }
    if (filters.demographic.gender.length > 0) {
      indexedFilters['_indexed.gender'] = filters.demographic.gender;
    }

    // Sentiment filters
    if (filters.sentiment.polarity.length > 0) {
      indexedFilters['_indexed.sentimentPolarity'] = filters.sentiment.polarity;
    }
    if (filters.sentiment.emotions.length > 0) {
      indexedFilters['_indexed.primaryEmotion'] = filters.sentiment.emotions;
    }

    // Topic filters
    if (filters.topics.policyAreas.length > 0) {
      indexedFilters['_indexed.policyAreas'] = filters.topics.policyAreas;
    }

    // Engagement filters
    if (filters.engagement.levels.length > 0) {
      indexedFilters['_indexed.engagementLevel'] = filters.engagement.levels;
    }

    // Temporal filters
    if (filters.temporal.timeBlocks.length > 0) {
      indexedFilters['_indexed.timeBlock'] = filters.temporal.timeBlocks;
    }
    if (filters.temporal.daysOfWeek.length > 0) {
      indexedFilters['_indexed.dayOfWeek'] = filters.temporal.daysOfWeek;
    }

    // Party filter
    indexedFilters['party'] = filters.query ? `*${filters.query}*` : undefined;

    return indexedFilters;
  }

  /**
   * Apply sorting with performance optimization
   */
  private applySorting(
    data: IndexedPoliticianData[],
    sortBy: string,
    sortOrder: 'asc' | 'desc'
  ): IndexedPoliticianData[] {
    if (!sortBy || sortBy === 'relevance') return data;

    const sortMultiplier = sortOrder === 'desc' ? -1 : 1;

    return [...data].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'sentiment':
          aValue = a.sentiment;
          bValue = b.sentiment;
          break;
        case 'party':
          aValue = a.party;
          bValue = b.party;
          break;
        case 'state':
          aValue = a.state;
          bValue = b.state;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string') {
        return aValue.localeCompare(bValue) * sortMultiplier;
      } else {
        return (aValue - bValue) * sortMultiplier;
      }
    });
  }

  /**
   * Optimized search with pre-computed indexes
   */
  async searchOptimized(
    query: string,
    filters: OptimizedFilterState,
    options: { maxResults?: number; fuzzyMatch?: boolean } = {}
  ): Promise<{
    results: IndexedPoliticianData[];
    suggestions: string[];
    metrics: { searchTime: number; totalResults: number };
  }> {
    const startTime = performance.now();
    const { maxResults = 50, fuzzyMatch = true } = options;

    try {
      const indexedData = await this.getIndexedData();
      
      // Apply text search
      let searchResults = indexedData;
      if (query && query.length > 0) {
        const searchTerm = query.toLowerCase();
        searchResults = indexedData.filter(politician => 
          politician.name.toLowerCase().includes(searchTerm) ||
          politician.party.toLowerCase().includes(searchTerm) ||
          politician.state.toLowerCase().includes(searchTerm)
        );
      }

      // Apply additional filters
      const filterResult = this.filterEngine.filterMultiDimensional(
        searchResults,
        this.convertFiltersToIndexFormat(filters),
        { useIndexes: false, maxResults, earlyTermination: true }
      );

      // Generate suggestions
      const suggestions = this.generateSearchSuggestions(query, indexedData);

      return {
        results: filterResult.data,
        suggestions,
        metrics: {
          searchTime: performance.now() - startTime,
          totalResults: filterResult.data.length
        }
      };

    } catch (error) {
      console.error('Error in optimized search:', error);
      return {
        results: [],
        suggestions: [],
        metrics: { searchTime: performance.now() - startTime, totalResults: 0 }
      };
    }
  }

  /**
   * Generate intelligent search suggestions
   */
  private generateSearchSuggestions(query: string, data: IndexedPoliticianData[]): string[] {
    if (!query || query.length < 2) return [];

    const suggestions = new Set<string>();
    const searchTerm = query.toLowerCase();

    // Add name suggestions
    data.forEach(politician => {
      if (politician.name.toLowerCase().includes(searchTerm)) {
        suggestions.add(politician.name);
      }
      if (politician.party.toLowerCase().includes(searchTerm)) {
        suggestions.add(politician.party);
      }
      if (politician.state.toLowerCase().includes(searchTerm)) {
        suggestions.add(politician.state);
      }
    });

    return Array.from(suggestions).slice(0, 10);
  }

  /**
   * Get performance metrics for monitoring
   */
  getPerformanceMetrics() {
    return {
      ...this.filterEngine.getMetrics(),
      indexedDataSize: this.indexedDataCache.size,
      lastIndexUpdate: new Date(this.lastIndexUpdate).toISOString()
    };
  }

  /**
   * Clear all performance caches
   */
  clearPerformanceCaches(): void {
    this.filterEngine.clearCaches();
    this.indexedDataCache.clear();
    this.lastIndexUpdate = 0;
  }

  // Helper methods for temporal data
  private getCurrentTimeBlock(): string {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 18) return 'Afternoon';
    if (hour >= 18 && hour < 24) return 'Evening';
    return 'Late Night';
  }

  private getCurrentDayOfWeek(): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  }

  private getCurrentElectionPhase(): string {
    // Simplified election phase logic
    const now = new Date();
    const month = now.getMonth();
    
    // Nigerian election cycle approximation
    if (month >= 0 && month <= 2) return 'Pre-Election';
    if (month >= 3 && month <= 5) return 'Election Period';
    return 'Post-Election';
  }
}

// Export singleton instance
export const optimizedEnhancedMockDataService = OptimizedEnhancedMockDataService.getInstance();
export default OptimizedEnhancedMockDataService;