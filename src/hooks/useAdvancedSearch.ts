import { useQuery } from '@tanstack/react-query';
import { EnhancedMockDataService } from '../lib/enhancedMockDataService';

/**
 * Enhanced search hook with multi-dimensional filtering capabilities
 */
export interface AdvancedSearchFilters {
  // Basic filters
  query: string;
  parties: string[];
  states: string[];
  platforms: string[];
  
  // Enhanced multi-dimensional filters
  geographic: {
    countries: string[];
    states: string[];
    lgas: string[];
    confidenceThreshold: number;
  };
  demographic: {
    education: string[];
    occupation: string[];
    ageRanges: [number, number];
    gender: string[];
    confidenceThreshold: number;
  };
  sentiment: {
    polarity: string[];
    emotions: string[];
    intensityRange: [number, number];
    complexity: string[];
    modelAgreement: number;
  };
  topics: {
    policyAreas: string[];
    campaignIssues: string[];
    events: string[];
    trendingThreshold: number;
  };
  engagement: {
    levels: string[];
    viralityThreshold: number;
    qualityScore: number;
    influencerAmplification: boolean;
  };
  temporal: {
    timeBlocks: string[];
    daysOfWeek: string[];
    electionPhases: string[];
  };
}

export interface AdvancedSearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'sentiment' | 'engagement' | 'confidence';
  sortOrder?: 'asc' | 'desc';
  includeConfidenceScores?: boolean;
  includeDataQuality?: boolean;
}

export const useAdvancedSearch = (
  filters: Partial<AdvancedSearchFilters>,
  options: AdvancedSearchOptions = {},
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['advanced-search', filters, options],
    queryFn: async () => {
      if (!filters.query || filters.query.length < 2) {
        return {
          results: [],
          total: 0,
          facets: {},
          searchMetadata: {
            processingTime: 0,
            totalDimensions: 0,
            confidenceDistribution: {},
            dataQualityScore: 0
          }
        };
      }

      const startTime = Date.now();
      
      // Convert filters to enhanced format
      const enhancedFilters = {
        geographic: filters.geographic || {},
        demographic: filters.demographic || {},
        sentiment: filters.sentiment || {},
        topics: filters.topics || {},
        engagement: filters.engagement || {},
        temporal: filters.temporal || {}
      };

      // Perform enhanced search
      const searchResults = await EnhancedMockDataService.searchPoliticiansEnhanced(
        filters.query || '',
        enhancedFilters,
        {
          limit: options.limit || 20,
          offset: options.offset || 0,
          sortBy: options.sortBy || 'relevance',
          sortOrder: options.sortOrder || 'desc'
        }
      );

      const processingTime = Date.now() - startTime;

      // Calculate search metadata
      const searchMetadata = {
        processingTime,
        totalDimensions: Object.keys(enhancedFilters).filter(key => 
          Object.keys(enhancedFilters[key as keyof typeof enhancedFilters]).length > 0
        ).length,
        confidenceDistribution: calculateConfidenceDistribution(searchResults.results),
        dataQualityScore: calculateDataQualityScore(searchResults.results)
      };

      return {
        ...searchResults,
        searchMetadata
      };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: enabled && !!filters.query && filters.query.length >= 2
  });
};

/**
 * Hook for search suggestions based on multi-dimensional data
 */
export const useSearchSuggestions = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['search-suggestions', query],
    queryFn: async () => {
      if (!query || query.length < 2) {
        return {
          politicians: [],
          topics: [],
          locations: [],
          demographics: []
        };
      }

      // Simulate search suggestions from multi-dimensional data
      await new Promise(resolve => setTimeout(resolve, 100));

      const suggestions = {
        politicians: [
          'Bola Tinubu',
          'Atiku Abubakar',
          'Peter Obi',
          'Rabiu Kwankwaso'
        ].filter(name => 
          name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5),
        
        topics: [
          'Economy',
          'Security',
          'Education',
          'Infrastructure',
          'Healthcare',
          'Corruption',
          'Youth Employment'
        ].filter(topic => 
          topic.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5),
        
        locations: [
          'Lagos',
          'Abuja',
          'Kano',
          'Rivers',
          'Ogun',
          'Kaduna',
          'Oyo'
        ].filter(location => 
          location.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5),
        
        demographics: [
          'Youth (18-35)',
          'Technology Sector',
          'Tertiary Education',
          'Public Sector',
          'Private Sector'
        ].filter(demo => 
          demo.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 3)
      };

      return suggestions;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: enabled && !!query && query.length >= 2
  });
};

/**
 * Hook for real-time search analytics
 */
export const useSearchAnalytics = (searchResults: any[]) => {
  return useQuery({
    queryKey: ['search-analytics', searchResults.length],
    queryFn: async () => {
      if (!searchResults || searchResults.length === 0) {
        return {
          totalResults: 0,
          averageRelevance: 0,
          dimensionCoverage: {},
          confidenceMetrics: {},
          qualityScore: 0
        };
      }

      // Calculate search analytics
      const totalResults = searchResults.length;
      const averageRelevance = searchResults.reduce((sum, result) => 
        sum + (result.relevanceScore || 0), 0
      ) / totalResults;

      const dimensionCoverage = {
        geographic: searchResults.filter(r => 
          r.politician?.geographic && !r.politician.geographic.state.isUndefined
        ).length / totalResults,
        demographic: searchResults.filter(r => 
          r.politician?.demographic && 
          r.politician.demographic.education.level !== 'Undefined'
        ).length / totalResults,
        sentiment: searchResults.filter(r => 
          r.politician?.enhancedSentiment?.polarity?.confidence > 0.7
        ).length / totalResults,
        topics: searchResults.filter(r => 
          r.politician?.topics?.policyAreas?.primary
        ).length / totalResults,
        engagement: searchResults.filter(r => 
          r.politician?.engagement?.level === 'High'
        ).length / totalResults
      };

      const confidenceMetrics = {
        high: searchResults.filter(r => 
          r.politician?.dataQuality?.confidence > 0.8
        ).length / totalResults,
        medium: searchResults.filter(r => 
          r.politician?.dataQuality?.confidence > 0.5 && 
          r.politician?.dataQuality?.confidence <= 0.8
        ).length / totalResults,
        low: searchResults.filter(r => 
          r.politician?.dataQuality?.confidence <= 0.5
        ).length / totalResults
      };

      const qualityScore = (
        averageRelevance * 0.4 +
        Object.values(dimensionCoverage).reduce((sum, coverage) => sum + coverage, 0) / 5 * 0.3 +
        confidenceMetrics.high * 0.3
      );

      return {
        totalResults,
        averageRelevance,
        dimensionCoverage,
        confidenceMetrics,
        qualityScore
      };
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: searchResults && searchResults.length > 0
  });
};

// Helper functions
function calculateConfidenceDistribution(results: any[]) {
  if (!results || results.length === 0) return {};

  const distribution = {
    'High (>0.8)': 0,
    'Medium (0.5-0.8)': 0,
    'Low (<0.5)': 0
  };

  results.forEach(result => {
    const confidence = result.politician?.dataQuality?.confidence || 0;
    if (confidence > 0.8) {
      distribution['High (>0.8)']++;
    } else if (confidence > 0.5) {
      distribution['Medium (0.5-0.8)']++;
    } else {
      distribution['Low (<0.5)']++;
    }
  });

  // Convert to percentages
  Object.keys(distribution).forEach(key => {
    distribution[key as keyof typeof distribution] = 
      (distribution[key as keyof typeof distribution] / results.length) * 100;
  });

  return distribution;
}

function calculateDataQualityScore(results: any[]) {
  if (!results || results.length === 0) return 0;

  const totalQuality = results.reduce((sum, result) => {
    return sum + (result.politician?.dataQuality?.completeness || 0);
  }, 0);

  return totalQuality / results.length;
}