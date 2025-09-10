import { useQuery } from '@tanstack/react-query';
import { EnhancedMockDataService } from '../lib/enhancedMockDataService';

/**
 * Hook to fetch enhanced politician data with multi-dimensional information
 */
export const useEnhancedPoliticianData = (politicianId: string) => {
  return useQuery({
    queryKey: ['politician-enhanced', politicianId],
    queryFn: () => EnhancedMockDataService.getEnhancedPoliticianData(politicianId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!politicianId
  });
};

/**
 * Hook to fetch multiple enhanced politicians
 */
export const useEnhancedPoliticians = (politicianIds?: string[]) => {
  return useQuery({
    queryKey: ['politicians-enhanced', politicianIds || 'all'],
    queryFn: async () => {
      if (!politicianIds || politicianIds.length === 0) {
        // Return mock data for analysis pages
        return EnhancedMockDataService.getAllEnhancedData();
      }
      const promises = politicianIds.map(id => 
        EnhancedMockDataService.getEnhancedPoliticianData(id)
      );
      return Promise.all(promises);
    },
    staleTime: 5 * 60 * 1000,
    enabled: true
  });
};

/**
 * Hook for enhanced search with multi-dimensional filtering
 */
export const useEnhancedPoliticianSearch = (
  query: string,
  filters: any = {},
  options: {
    limit?: number;
    offset?: number;
    sortBy?: 'relevance' | 'sentiment' | 'engagement';
    sortOrder?: 'asc' | 'desc';
  } = {}
) => {
  return useQuery({
    queryKey: ['politicians-search-enhanced', query, filters, options],
    queryFn: () => EnhancedMockDataService.searchPoliticiansEnhanced(query, filters, options),
    staleTime: 2 * 60 * 1000,
    enabled: query.length > 0
  });
};

/**
 * Hook to get multi-dimensional insights
 */
export const useMultiDimensionalInsights = (filters: any = {}) => {
  return useQuery({
    queryKey: ['multi-dimensional-insights', filters],
    queryFn: () => EnhancedMockDataService.getMultiDimensionalInsights(filters),
    staleTime: 10 * 60 * 1000 // 10 minutes
  });
};