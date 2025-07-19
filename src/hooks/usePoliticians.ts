import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, buildUrl } from '../lib/apiClient';
import type { Politician, SearchFilters, PaginatedResponse } from '../types';
import { useFilterStore } from '../stores/filterStore';
import { useUIStore } from '../stores/uiStore';
import { PAGINATION_CONFIG } from '../constants';

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
      const url = buildUrl('/politicians', searchParams as unknown as Record<string, unknown>);
      const response = await api.getPaginated<Politician>(url);
      return response;
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
      const response = await api.get<Politician>(`/politicians/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2
  });
};

// Hook for fetching politician sentiment insights
interface InsightFilters {
  platform?: string[];
  startDate?: string;
  endDate?: string;
  timeframe?: string;
  ageGroup?: string[];
  gender?: string[];
  state?: string[];
}

export const usePoliticianInsights = (id: string, filters?: InsightFilters) => {
  
  return useQuery({
    queryKey: politiciansKeys.insight(id, filters),
    queryFn: async () => {
      const url = buildUrl(`/politicians/${id}/insights`, filters as unknown as Record<string, unknown>);
      const response = await api.get(url);
      return response.data;
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
      const response = await api.get(`/politicians/trending?limit=${limit}`);
      return response.data;
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
      
      const response = await api.get<Politician[]>(`/politicians/suggestions?q=${encodeURIComponent(query)}&limit=10`);
      return response.data;
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
      const response = await api.post(`/politicians/${politicianId}/favorite`, { action });
      return response.data;
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
        const response = await api.get<Politician>(`/politicians/${politicianId}`);
        return response.data;
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