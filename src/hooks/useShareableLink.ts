import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { parseShareableLink } from '../lib/exportUtils';
import { useFilterStore } from '../stores/filterStore';
import type { FilterState } from '../types';

export const useShareableLink = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoadingSharedState, setIsLoadingSharedState] = useState(false);
  const filterStore = useFilterStore();

  // Load shared state from URL on mount
  useEffect(() => {
    const shareParam = searchParams.get('share');
    if (shareParam) {
      setIsLoadingSharedState(true);
      
      try {
        const sharedState = parseShareableLink(shareParam);
        if (sharedState && sharedState.filters) {
          // Apply shared filters to the store
          const filters = sharedState.filters;
          
          if (filters.searchQuery !== undefined) {
            filterStore.setSearchQuery(filters.searchQuery);
          }
          if (filters.selectedParties) {
            filterStore.setSelectedParties(filters.selectedParties);
          }
          if (filters.selectedStates) {
            filterStore.setSelectedStates(filters.selectedStates);
          }
          if (filters.selectedPlatforms) {
            filterStore.setSelectedPlatforms(filters.selectedPlatforms);
          }
          if (filters.selectedGenders) {
            filterStore.setSelectedGenders(filters.selectedGenders);
          }
          if (filters.selectedAgeGroups) {
            filterStore.setSelectedAgeGroups(filters.selectedAgeGroups);
          }
          if (filters.selectedLevels) {
            filterStore.setSelectedLevels(filters.selectedLevels);
          }
          if (filters.dateRange) {
            filterStore.setDateRange(filters.dateRange.start, filters.dateRange.end);
          }
          if (filters.sortBy) {
            filterStore.setSortBy(filters.sortBy);
          }
          if (filters.sortOrder) {
            filterStore.setSortOrder(filters.sortOrder);
          }
        }
        
        // Remove the share parameter from URL after loading
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('share');
        setSearchParams(newSearchParams, { replace: true });
        
      } catch (error) {
        console.error('Failed to load shared state:', error);
      } finally {
        setIsLoadingSharedState(false);
      }
    }
  }, [searchParams, setSearchParams, filterStore]);

  const getCurrentFilters = (): Partial<FilterState> => {
    return {
      searchQuery: filterStore.searchQuery,
      selectedParties: filterStore.selectedParties,
      selectedStates: filterStore.selectedStates,
      selectedPlatforms: filterStore.selectedPlatforms,
      selectedGenders: filterStore.selectedGenders,
      selectedAgeGroups: filterStore.selectedAgeGroups,
      selectedLevels: filterStore.selectedLevels,
      dateRange: filterStore.dateRange,
      sortBy: filterStore.sortBy,
      sortOrder: filterStore.sortOrder
    };
  };

  const hasActiveFilters = (): boolean => {
    return filterStore.hasActiveFilters();
  };

  return {
    isLoadingSharedState,
    getCurrentFilters,
    hasActiveFilters
  };
};

export default useShareableLink;