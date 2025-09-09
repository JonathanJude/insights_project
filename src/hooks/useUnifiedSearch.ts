import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { getUnifiedSearchEngine, type UnifiedSearchOptions, type UnifiedSearchResult } from '../lib/unifiedSearchEngine';
import { mockApiDelay } from '../mock';
import { mockPoliticians } from '../mock/politicians';
import { useUIStore } from '../stores/uiStore';
import type { TrendingTopic } from '../types/quickActions';

// Generate mock trending topics for search
const generateMockTopics = (): TrendingTopic[] => {
  const topicKeywords = [
    'economic policy', 'infrastructure development', 'education reform', 'healthcare system',
    'security challenges', 'corruption fight', 'youth empowerment', 'agriculture support',
    'technology advancement', 'governance transparency', 'job creation', 'poverty reduction',
    'climate change', 'energy sector', 'transportation', 'housing policy', 'tax reform',
    'foreign relations', 'trade agreements', 'social welfare', 'women empowerment',
    'digital transformation', 'electoral reforms', 'judicial independence', 'press freedom',
    'fuel subsidy', 'naira devaluation', 'insecurity', 'banditry', 'terrorism',
    'unemployment', 'inflation', 'minimum wage', 'strike action', 'protests'
  ];

  return topicKeywords.map((keyword, index) => ({
    id: `topic_${index}`,
    keyword,
    mentionCount: Math.floor(Math.random() * 2000) + 100,
    sentiment: Math.random() * 2 - 1,
    sentimentLabel: (['positive', 'negative', 'neutral'] as const)[Math.floor(Math.random() * 3)],
    trend: (['rising', 'falling', 'stable'] as const)[Math.floor(Math.random() * 3)],
    changePercentage: (Math.random() - 0.5) * 60,
    relatedPoliticians: mockPoliticians.slice(0, Math.floor(Math.random() * 5) + 1).map(p => ({
      id: p.id,
      name: p.name,
      party: p.party
    })),
    platforms: [
      { platform: 'twitter', mentionCount: Math.floor(Math.random() * 500), sentiment: Math.random() * 2 - 1 },
      { platform: 'facebook', mentionCount: Math.floor(Math.random() * 300), sentiment: Math.random() * 2 - 1 }
    ],
    lastUpdated: new Date().toISOString()
  }));
};

// Query keys for React Query cache management
export const unifiedSearchKeys = {
  all: ['unified-search'] as const,
  searches: () => [...unifiedSearchKeys.all, 'search'] as const,
  search: (query: string, options?: UnifiedSearchOptions) => 
    [...unifiedSearchKeys.searches(), query, options] as const,
  suggestions: () => [...unifiedSearchKeys.all, 'suggestions'] as const,
  suggestion: (query: string) => [...unifiedSearchKeys.suggestions(), query] as const,
};

/**
 * Hook for unified search across all entities
 */
export const useUnifiedSearch = (
  query: string, 
  options: UnifiedSearchOptions = {},
  enabled: boolean = true
) => {
  const addToSearchHistory = useUIStore((state) => state.addToSearchHistory);

  // Initialize search engine with data
  useEffect(() => {
    const searchEngine = getUnifiedSearchEngine();
    searchEngine.updatePoliticians(mockPoliticians);
    searchEngine.updateTopics(generateMockTopics());
  }, []);

  return useQuery<UnifiedSearchResult[], Error>({
    queryKey: unifiedSearchKeys.search(query, options),
    queryFn: async (): Promise<UnifiedSearchResult[]> => {
      if (!query || query.trim().length < 2) {
        return [];
      }

      // Simulate API delay
      await mockApiDelay(200, 0.3);

      const searchEngine = getUnifiedSearchEngine();
      const results = searchEngine.search(query.trim(), {
        maxResults: 50,
        threshold: 0.5,
        ...options
      });

      // Add to search history if we have results
      if (results.length > 0 && query.trim()) {
        addToSearchHistory(query.trim());
      }

      return results;
    },
    enabled: enabled && query.trim().length >= 2,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
};

/**
 * Hook for search suggestions (autocomplete)
 */
export const useSearchSuggestions = (
  query: string,
  maxSuggestions: number = 10,
  enabled: boolean = true
) => {
  // Initialize search engine with data
  useEffect(() => {
    const searchEngine = getUnifiedSearchEngine();
    searchEngine.updatePoliticians(mockPoliticians);
    searchEngine.updateTopics(generateMockTopics());
  }, []);

  return useQuery<UnifiedSearchResult[], Error>({
    queryKey: unifiedSearchKeys.suggestion(query),
    queryFn: async (): Promise<UnifiedSearchResult[]> => {
      if (!query || query.trim().length < 2) {
        return [];
      }

      // Simulate API delay
      await mockApiDelay(150, 0.2);

      const searchEngine = getUnifiedSearchEngine();
      const suggestions = searchEngine.getSuggestions(query.trim(), maxSuggestions);

      return suggestions;
    },
    enabled: enabled && query.trim().length >= 2,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
};

/**
 * Hook for searching by specific entity type
 */
export const useSearchByType = (
  query: string,
  type: 'politician' | 'party' | 'topic' | 'state' | 'position' | 'platform',
  maxResults: number = 20,
  enabled: boolean = true
) => {
  // Initialize search engine with data
  useEffect(() => {
    const searchEngine = getUnifiedSearchEngine();
    searchEngine.updatePoliticians(mockPoliticians);
    searchEngine.updateTopics(generateMockTopics());
  }, []);

  return useQuery<UnifiedSearchResult[], Error>({
    queryKey: [...unifiedSearchKeys.searches(), query, type, maxResults],
    queryFn: async (): Promise<UnifiedSearchResult[]> => {
      if (!query || query.trim().length < 2) {
        return [];
      }

      // Simulate API delay
      await mockApiDelay(200, 0.3);

      const searchEngine = getUnifiedSearchEngine();
      const results = searchEngine.searchByType(query.trim(), type, maxResults);

      return results;
    },
    enabled: enabled && query.trim().length >= 2,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
};

/**
 * Hook for getting search statistics
 */
export const useSearchStats = (query: string, enabled: boolean = true) => {
  // Initialize search engine with data
  useEffect(() => {
    const searchEngine = getUnifiedSearchEngine();
    searchEngine.updatePoliticians(mockPoliticians);
    searchEngine.updateTopics(generateMockTopics());
  }, []);

  return useQuery({
    queryKey: [...unifiedSearchKeys.all, 'stats', query],
    queryFn: async () => {
      if (!query || query.trim().length < 2) {
        return { totalResults: 0, resultsByType: {} };
      }

      // Simulate API delay
      await mockApiDelay(100);

      const searchEngine = getUnifiedSearchEngine();
      return searchEngine.getSearchStats(query.trim());
    },
    enabled: enabled && query.trim().length >= 2,
    staleTime: 30 * 1000,
    gcTime: 2 * 60 * 1000,
    retry: 1,
  });
};

/**
 * Utility hook for managing unified search state
 */
export const useUnifiedSearchState = () => {
  const addToSearchHistory = useUIStore((state) => state.addToSearchHistory);
  const searchHistory = useUIStore((state) => state.searchHistory);

  const handleSearch = (query: string) => {
    if (query.trim()) {
      addToSearchHistory(query.trim());
    }
  };

  return {
    searchHistory,
    handleSearch,
  };
};