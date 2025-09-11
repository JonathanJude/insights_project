import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PAGINATION_CONFIG } from "../constants";
import {
  getTrendingPoliticians,
  mockApiDelay,
  mockPaginate,
  searchPoliticians as searchPoliticiansSimple,
  simulateRealisticErrors,
} from "../mock";
import { politicianService } from "../services/politician-service";
import { useFilterStore } from "../stores/filterStore";
import { useUIStore } from "../stores/uiStore";
import type {
  AgeGroup,
  Gender,
  NigerianState,
  PaginatedResponse,
  PoliticalLevel,
  PoliticalParty,
  Politician,
  SearchFilters,
} from "../types";

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
  all: ["politicians"] as const,
  lists: () => [...politiciansKeys.all, "list"] as const,
  list: (filters: SearchFilters) =>
    [...politiciansKeys.lists(), filters] as const,
  details: () => [...politiciansKeys.all, "detail"] as const,
  detail: (id: string) => [...politiciansKeys.details(), id] as const,
  insights: () => [...politiciansKeys.all, "insights"] as const,
  insight: (id: string, filters: InsightFilters | undefined) =>
    [...politiciansKeys.insights(), id, filters] as const,
  trending: () => [...politiciansKeys.all, "trending"] as const,
};

// Hook for searching politicians with filters
export const usePoliticians = (
  page: number = 1,
  limit: number = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE
) => {
  const filters = useFilterStore();

  const searchParams: SearchFilters & { page: number; limit: number } = {
    q: filters.searchQuery || undefined,
    party:
      filters.selectedParties.length > 0 ? filters.selectedParties : undefined,
    state:
      filters.selectedStates.length > 0 ? filters.selectedStates : undefined,
    level:
      filters.selectedLevels.length > 0 ? filters.selectedLevels : undefined,
    gender:
      filters.selectedGenders.length > 0 ? filters.selectedGenders : undefined,
    ageGroup:
      filters.selectedAgeGroups.length > 0
        ? filters.selectedAgeGroups
        : undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    page,
    limit,
  };

  return useQuery<PaginatedResponse<Politician>, Error>({
    queryKey: politiciansKeys.list(searchParams),
    queryFn: async (): Promise<PaginatedResponse<Politician>> => {
      // Enhanced error simulation and loading patterns
      await simulateRealisticErrors("politicians/search", 0.02); // 2% error rate
      await mockApiDelay(300, 0.4); // 300ms ± 40% variance

      // Enhanced search function that handles filters
      const searchPoliticiansWithFilters = async (filters: {
        query?: string;
        party?: PoliticalParty[];
        state?: NigerianState[];
        level?: PoliticalLevel[];
        gender?: Gender[];
        ageGroup?: AgeGroup[];
        sortBy?: string;
        sortOrder?: "asc" | "desc";
      }) => {
        let results: Politician[];

        // Get politicians from service
        const politiciansData = await politicianService.getAllPoliticians();

        // Use enhanced search if query is provided
        if (filters.query) {
          try {
            const { getSearchEngine } = require("../lib/searchEngine");
            const searchEngine = getSearchEngine(politiciansData);
            const searchResults = searchEngine.search(filters.query, {
              maxResults: 100,
            });
            results = searchResults.map((result) => result.item);
          } catch {
            // Fallback to simple search
            results = searchPoliticiansSimple(filters.query);
          }
        } else {
          results = politiciansData;
        }

        // Apply filters
        if (filters.party?.length) {
          results = results.filter((p) => filters.party!.includes(p.party));
        }
        if (filters.state?.length) {
          results = results.filter((p) => filters.state!.includes(p.state));
        }
        if (filters.level?.length) {
          results = results.filter((p) =>
            filters.level!.includes(p.politicalLevel)
          );
        }
        if (filters.gender?.length) {
          results = results.filter((p) => filters.gender!.includes(p.gender));
        }
        if (filters.ageGroup?.length) {
          results = results.filter((p) =>
            filters.ageGroup!.includes(p.ageGroup)
          );
        }

        // Apply sorting
        if (filters.sortBy) {
          results.sort((a, b) => {
            let aVal: any, bVal: any;

            switch (filters.sortBy) {
              case "sentiment":
                aVal = a.recentSentiment?.score || 0;
                bVal = b.recentSentiment?.score || 0;
                break;
              case "mentions":
                aVal = a.recentSentiment?.mentionCount || 0;
                bVal = b.recentSentiment?.mentionCount || 0;
                break;
              case "name":
                aVal = a.name.toLowerCase();
                bVal = b.name.toLowerCase();
                break;
              case "relevance":
              default:
                // For relevance, use a combination of sentiment and mentions
                aVal =
                  (a.recentSentiment?.score || 0) *
                  (a.recentSentiment?.mentionCount || 1);
                bVal =
                  (b.recentSentiment?.score || 0) *
                  (b.recentSentiment?.mentionCount || 1);
                break;
            }

            const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            return filters.sortOrder === "desc" ? -comparison : comparison;
          });
        }

        return results;
      };

      const filteredPoliticians = await searchPoliticiansWithFilters({
        query: searchParams.q,
        party: searchParams.party,
        state: searchParams.state,
        level: searchParams.level,
        gender: searchParams.gender,
        ageGroup: searchParams.ageGroup,
        sortBy: searchParams.sortBy,
        sortOrder: searchParams.sortOrder,
      });

      const paginatedResult = mockPaginate(
        filteredPoliticians,
        searchParams.page,
        searchParams.limit
      );

      return {
        success: true,
        data: paginatedResult.data,
        pagination: {
          currentPage: paginatedResult.pagination.page,
          totalPages: paginatedResult.pagination.totalPages,
          totalItems: paginatedResult.pagination.total,
          itemsPerPage: paginatedResult.pagination.limit,
          hasNext: paginatedResult.pagination.hasNext,
          hasPrevious: paginatedResult.pagination.hasPrev,
        },
        message: "Politicians retrieved successfully",
        timestamp: new Date().toISOString(),
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Hook for fetching a single politician's details
export const usePolitician = (id: string) => {
  return useQuery({
    queryKey: politiciansKeys.detail(id),
    queryFn: async (): Promise<Politician> => {
      await mockApiDelay(200);

      const politicians = await politicianService.getAllPoliticians();
      const politician = politicians.find((p) => p.id === id);
      if (!politician) {
        throw new Error(`Politician with id ${id} not found`);
      }

      return politician;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
};

// Hook for fetching politician sentiment insights with enhanced error handling
export const usePoliticianInsights = (id: string, filters?: InsightFilters) => {
  return useQuery({
    queryKey: politiciansKeys.insight(id, filters),
    queryFn: async () => {
      // Enhanced error simulation for insights endpoint
      await simulateRealisticErrors("politicians/insights", 0.03); // 3% error rate
      await mockApiDelay(400, 0.5); // 400ms ± 50% variance

      // Import the enhanced data generator
      const { generatePoliticianInsights } = await import(
        "../mock/sentimentData"
      );

      try {
        // Generate comprehensive insights for the politician
        const insights = generatePoliticianInsights(id, {
          startDate: filters?.startDate,
          endDate: filters?.endDate,
          platforms: filters?.platform,
        });

        return insights;
      } catch (error) {
        console.error("Error generating politician insights:", error);
        throw new Error(
          `Failed to generate insights for politician ${id}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes (insights change more frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Custom retry logic based on error type
      if (
        error instanceof Error &&
        error.message.includes("Invalid politician ID")
      ) {
        return false; // Don't retry for validation errors
      }
      return failureCount < 2; // Retry up to 2 times for other errors
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff with max 5s
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
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes for trending data
  });
};

// Hook for politician search suggestions (autocomplete) - Enhanced with Fuse.js
export const usePoliticianSuggestions = (
  query: string,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ["politicians", "suggestions", query],
    queryFn: async (): Promise<Politician[]> => {
      if (!query || query.length < 2) return [];

      await mockApiDelay(150);

      // Use enhanced search for better results
      try {
        const { getSearchEngine } = await import("../lib/searchEngine");
        const politicians = await politicianService.getAllPoliticians();
        const searchEngine = getSearchEngine(politicians);
        const suggestions = searchEngine.getSuggestions(query, 10);
        return suggestions.map((result) => result.item);
      } catch {
        // Fallback to simple search
        const suggestions = searchPoliticiansSimple(query).slice(0, 10);
        return suggestions;
      }
    },
    enabled: enabled && query.length >= 2,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
    retry: 1,
  });
};

// Mutation for favoriting/unfavoriting politicians (if auth is implemented)
export const useFavoritePolitician = () => {
  const queryClient = useQueryClient();
  const addNotification = useUIStore((state) => state.addNotification);

  return useMutation({
    mutationFn: async ({
      politicianId,
      action,
    }: {
      politicianId: string;
      action: "add" | "remove";
    }) => {
      await mockApiDelay(200);

      // Mock favorite action - in real app this would update user preferences
      return {
        success: true,
        message: `Politician ${
          action === "add" ? "added to" : "removed from"
        } favorites`,
        data: { politicianId, action },
      };
    },
    onSuccess: (_data, variables) => {
      // Invalidate and refetch politician details
      queryClient.invalidateQueries({
        queryKey: politiciansKeys.detail(variables.politicianId),
      });

      addNotification({
        type: "success",
        title:
          variables.action === "add"
            ? "Added to Favorites"
            : "Removed from Favorites",
        message: `Politician ${
          variables.action === "add" ? "added to" : "removed from"
        } your favorites.`,
      });
    },
    onError: (error: Error) => {
      addNotification({
        type: "error",
        title: "Action Failed",
        message: error.message,
      });
    },
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

        const politicians = await politicianService.getAllPoliticians();
        const politician = politicians.find((p) => p.id === politicianId);
        if (!politician) {
          throw new Error(`Politician with id ${politicianId} not found`);
        }

        return politician;
      },
      staleTime: 10 * 60 * 1000,
    });
  };
};

// Utility hook for invalidating politician queries
export const useInvalidatePoliticians = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: politiciansKeys.all }),
    invalidateLists: () =>
      queryClient.invalidateQueries({ queryKey: politiciansKeys.lists() }),
    invalidateDetail: (id: string) =>
      queryClient.invalidateQueries({ queryKey: politiciansKeys.detail(id) }),
    invalidateInsights: (id: string) =>
      queryClient.invalidateQueries({
        queryKey: [...politiciansKeys.insights(), id],
      }),
    invalidateTrending: () =>
      queryClient.invalidateQueries({ queryKey: politiciansKeys.trending() }),
  };
};

// Custom hook for managing politician search state
export const usePoliticianSearch = () => {
  const {
    searchQuery,
    setSearchQuery,
    clearSearchQuery,
    hasActiveFilters,
    clearAllFilters,
  } = useFilterStore();

  const addToSearchHistory = useUIStore((state) => state.addToSearchHistory);
  const searchHistory = useUIStore((state) => state.searchHistory);

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
    clearAllFilters,
  };
};
