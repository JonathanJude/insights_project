import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PAGINATION_CONFIG } from '../constants';
import {
  generateSentimentInsights,
  getTrendingPoliticians,
  mockApiDelay,
  mockPaginate,
  mockPoliticians,
  searchPoliticians as searchPoliticiansSimple
} from '../mock';
import { useFilterStore } from '../stores/filterStore';
import { useUIStore } from '../stores/uiStore';
import type { AgeGroup, Gender, NigerianState, PaginatedResponse, PoliticalLevel, PoliticalParty, Politician, SearchFilters } from '../types';

// Interface for insight filters
interface InsightFilters {
  platform?: string[];
  startDate?: string;
  endDate?: string;
  timeframe?: string;
  ageGroup?: string[];
  gender?: string[];
  state?: string[];
}

// Query keys for React Query cache management
export const politiciansKeys = {
  all: ['politicians'] as const,
  lists: () => [...politiciansKeys.all, 'list'] as const,
  list: (filters: SearchFilters) => [...politiciansKeys.lists(), filters] as const,
  details: () => [...politiciansKeys.all, 'detail'] as const,
  detail: (id: string) => [...politiciansKeys.details(), id] as const,
  insights: () => [...politiciansKeys.all, 'insights'] as const,
  insight: (id: string, filters: InsightFilters | undefined) => [...politiciansKeys.insights(), id, filters] as const,
  trending: () => [...politiciansKeys.all, 'trending'] as const,
};

// Hook for searching politicians with filters
export const usePoliticians = (page: number = 1, limit: number = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE) => {
  const filters = useFilterStore();
  
  const searchParams: SearchFilters & { page: number; limit: number } = {
    q: filters.searchQuery || undefined,
    party: filters.selectedParties.length > 0 ? filters.selectedParties : undefined,
    state: filters.selectedStates.length > 0 ? filters.selectedStates : undefined,
    level: filters.selectedLevels.length > 0 ? filters.selectedLevels : undefined,
    gender: filters.selectedGenders.length > 0 ? filters.selectedGenders : undefined,
    ageGroup: filters.selectedAgeGroups.length > 0 ? filters.selectedAgeGroups : undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    page,
    limit
  };
  
  return useQuery<PaginatedResponse<Politician>, Error>({
    queryKey: politiciansKeys.list(searchParams),
    queryFn: async (): Promise<PaginatedResponse<Politician>> => {
      await mockApiDelay(300); // Simulate API delay
      
      // Enhanced search function that handles filters
      const searchPoliticiansWithFilters = (filters: {
        query?: string;
        party?: PoliticalParty[];
        state?: NigerianState[];
        level?: PoliticalLevel[];
        gender?: Gender[];
        ageGroup?: AgeGroup[];
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
      }) => {
        let results = filters.query ? searchPoliticiansSimple(filters.query) : mockPoliticians;
        
        // Apply filters
        if (filters.party?.length) {
          results = results.filter(p => filters.party!.includes(p.party));
        }
        if (filters.state?.length) {
          results = results.filter(p => filters.state!.includes(p.state));
        }
        if (filters.level?.length) {
          results = results.filter(p => filters.level!.includes(p.politicalLevel));
        }
        if (filters.gender?.length) {
          results = results.filter(p => filters.gender!.includes(p.gender));
        }
        if (filters.ageGroup?.length) {
          results = results.filter(p => filters.ageGroup!.includes(p.ageGroup));
        }
        
        // Apply sorting
        if (filters.sortBy) {
          results.sort((a, b) => {
            const aVal = (a as any)[filters.sortBy!];
            const bVal = (b as any)[filters.sortBy!];
            const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            return filters.sortOrder === 'desc' ? -comparison : comparison;
          });
        }
        
        return results;
      };
      
      const filteredPoliticians = searchPoliticiansWithFilters({
        query: searchParams.q,
        party: searchParams.party,
        state: searchParams.state,
        level: searchParams.level,
        gender: searchParams.gender,
        ageGroup: searchParams.ageGroup,
        sortBy: searchParams.sortBy,
        sortOrder: searchParams.sortOrder
      });
      
      const paginatedResult = mockPaginate(filteredPoliticians, searchParams.page, searchParams.limit);
      
      return {
        success: true,
        data: paginatedResult.data,
        pagination: {
          currentPage: paginatedResult.pagination.page,
          totalPages: paginatedResult.pagination.totalPages,
          totalItems: paginatedResult.pagination.total,
          itemsPerPage: paginatedResult.pagination.limit,
          hasNext: paginatedResult.pagination.hasNext,
          hasPrevious: paginatedResult.pagination.hasPrev
        },
        message: 'Politicians retrieved successfully',
        timestamp: new Date().toISOString()
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
};

// Hook for fetching a single politician's details
export const usePolitician = (id: string) => {
  
  return useQuery({
    queryKey: politiciansKeys.detail(id),
    queryFn: async (): Promise<Politician> => {
      await mockApiDelay(200);
      
      const politician = mockPoliticians.find(p => p.id === id);
      if (!politician) {
        throw new Error(`Politician with id ${id} not found`);
      }
      
      return politician;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2
  });
};

// Hook for fetching politician sentiment insights
export const usePoliticianInsights = (id: string, filters?: InsightFilters) => {
  
  return useQuery({
    queryKey: politiciansKeys.insight(id, filters),
    queryFn: async () => {
      await mockApiDelay(400);
      
      // Generate mock insights for the politician
      const insights = generateSentimentInsights(id, 30);
      
      // Apply filters if provided
      let filteredInsights = insights;
      if (filters?.platform && filters.platform.length > 0) {
        filteredInsights = insights.filter(insight => 
          filters.platform!.includes(insight.platform)
        );
      }
      
      return {
        insights: filteredInsights,
        summary: {
          totalMentions: filteredInsights.reduce((sum, insight) => sum + insight.mentionCount, 0),
          averageSentiment: filteredInsights.reduce((sum, insight) => sum + insight.sentimentScore, 0) / filteredInsights.length,
          totalEngagement: filteredInsights.reduce((sum, insight) => sum + insight.engagementCount, 0)
        }
      };
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes (insights change more frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 2
  });
};

// Hook for fetching trending politicians
export const useTrendingPoliticians = (limit: number = 10) => {
  
  return useQuery({
    queryKey: [...politiciansKeys.trending(), limit],
    queryFn: async () => {
      await mockApiDelay(250);
      
      const trendingPoliticians = getTrendingPoliticians(limit);
      return trendingPoliticians;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchInterval: 5 * 60 * 1000 // Refetch every 5 minutes for trending data
  });
};

// Hook for politician search suggestions (autocomplete)
export const usePoliticianSuggestions = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['politicians', 'suggestions', query],
    queryFn: async (): Promise<Politician[]> => {
      if (!query || query.length < 2) return [];
      
      await mockApiDelay(150);
      
      const suggestions = searchPoliticiansSimple(query).slice(0, 10);
      return suggestions;
    },
    enabled: enabled && query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 1
  });
};

// Mutation for favoriting/unfavoriting politicians (if auth is implemented)
export const useFavoritePolitician = () => {
  const queryClient = useQueryClient();
  const addNotification = useUIStore(state => state.addNotification);
  
  return useMutation({
    mutationFn: async ({ politicianId, action }: { politicianId: string; action: 'add' | 'remove' }) => {
      await mockApiDelay(200);
      
      // Mock favorite action - in real app this would update user preferences
      return {
        success: true,
        message: `Politician ${action === 'add' ? 'added to' : 'removed from'} favorites`,
        data: { politicianId, action }
      };
    },
    onSuccess: (_data, variables) => {
      // Invalidate and refetch politician details
      queryClient.invalidateQueries({ queryKey: politiciansKeys.detail(variables.politicianId) });
      
      addNotification({
        type: 'success',
        title: variables.action === 'add' ? 'Added to Favorites' : 'Removed from Favorites',
        message: `Politician ${variables.action === 'add' ? 'added to' : 'removed from'} your favorites.`
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: 'error',
        title: 'Action Failed',
        message: error.message
      });
    }
  });
};

// Hook for prefetching politician data (for performance optimization)
export const usePrefetchPolitician = () => {
  const queryClient = useQueryClient();
  
  return (politicianId: string) => {
    queryClient.prefetchQuery({
      queryKey: politiciansKeys.detail(politicianId),
      queryFn: async (): Promise<Politician> => {
        await mockApiDelay(100);
        
        const politician = mockPoliticians.find(p => p.id === politicianId);
        if (!politician) {
          throw new Error(`Politician with id ${politicianId} not found`);
        }
        
        return politician;
      },
      staleTime: 10 * 60 * 1000
    });
  };
};

// Utility hook for invalidating politician queries
export const useInvalidatePoliticians = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateAll: () => queryClient.invalidateQueries({ queryKey: politiciansKeys.all }),
    invalidateLists: () => queryClient.invalidateQueries({ queryKey: politiciansKeys.lists() }),
    invalidateDetail: (id: string) => queryClient.invalidateQueries({ queryKey: politiciansKeys.detail(id) }),
    invalidateInsights: (id: string) => queryClient.invalidateQueries({ queryKey: [...politiciansKeys.insights(), id] }),
    invalidateTrending: () => queryClient.invalidateQueries({ queryKey: politiciansKeys.trending() })
  };
};

// Custom hook for managing politician search state
export const usePoliticianSearch = () => {
  const {
    searchQuery,
    setSearchQuery,
    clearSearchQuery,
    hasActiveFilters,
    clearAllFilters
  } = useFilterStore();
  
  const addToSearchHistory = useUIStore(state => state.addToSearchHistory);
  const searchHistory = useUIStore(state => state.searchHistory);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      addToSearchHistory(query.trim());
    }
  };
  
  return {
    searchQuery,
    searchHistory,
    hasActiveFilters: hasActiveFilters(),
    handleSearch,
    clearSearch: clearSearchQuery,
    clearAllFilters
  };
};