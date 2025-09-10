/**
 * Dynamic Filters Hook
 * 
 * React hook for using dynamic filter services in components.
 * Provides automatic filter option generation, real-time updates,
 * and validation.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { LoadingStates } from '../constants/enums';
import { ConsistencyReport, dataRelationshipService } from '../services/data-relationship-service';
import { DropdownOption, DropdownState, dynamicDropdownService } from '../services/dynamic-dropdown-service';
import { dynamicFilterService, FilterCategory, FilterOption, FilterValidationResult } from '../services/dynamic-filter-service';

export interface UseDynamicFiltersOptions {
  enableRealTimeUpdates?: boolean;
  enableValidation?: boolean;
  enableRelationshipChecking?: boolean;
  autoLoadCategories?: boolean;
}

export interface DynamicFiltersState {
  categories: Map<string, FilterCategory>;
  loadingState: LoadingStates;
  error: string | null;
  lastUpdated: Date | null;
  statistics: {
    totalCategories: number;
    totalOptions: number;
    cacheSize: number;
  };
}

export interface DynamicDropdownsState {
  dropdowns: Map<string, DropdownState>;
  loadingStates: Map<string, LoadingStates>;
  errors: Map<string, string>;
}

/**
 * Hook for dynamic filter management
 */
export function useDynamicFilters(options: UseDynamicFiltersOptions = {}) {
  const {
    enableRealTimeUpdates = true,
    enableValidation = true,
    enableRelationshipChecking = false,
    autoLoadCategories = true
  } = options;

  const [filtersState, setFiltersState] = useState<DynamicFiltersState>({
    categories: new Map(),
    loadingState: LoadingStates.IDLE,
    error: null,
    lastUpdated: null,
    statistics: {
      totalCategories: 0,
      totalOptions: 0,
      cacheSize: 0
    }
  });

  const [validationResults, setValidationResults] = useState<Map<string, FilterValidationResult>>(new Map());
  const [consistencyReport, setConsistencyReport] = useState<ConsistencyReport | null>(null);

  // Load filter categories
  const loadCategories = useCallback(async () => {
    setFiltersState(prev => ({ ...prev, loadingState: LoadingStates.LOADING, error: null }));

    try {
      const categories = await dynamicFilterService.getAllFilterCategories();
      const statistics = dynamicFilterService.getFilterStatistics();

      setFiltersState(prev => ({
        ...prev,
        categories,
        loadingState: LoadingStates.SUCCESS,
        lastUpdated: new Date(),
        statistics
      }));
    } catch (error) {
      setFiltersState(prev => ({
        ...prev,
        loadingState: LoadingStates.ERROR,
        error: error instanceof Error ? error.message : 'Failed to load filter categories'
      }));
    }
  }, []);

  // Validate filter selection
  const validateSelection = useCallback((categoryId: string, selectedValues: string[]) => {
    if (!enableValidation) return null;

    const result = dynamicFilterService.validateFilterSelection(categoryId, selectedValues);
    setValidationResults(prev => new Map(prev).set(categoryId, result));
    return result;
  }, [enableValidation]);

  // Refresh specific category
  const refreshCategory = useCallback(async (categoryId: string) => {
    try {
      await dynamicFilterService.refreshFilterCategory(categoryId);
      // Update state will be handled by event listener
    } catch (error) {
      console.error(`Failed to refresh category ${categoryId}:`, error);
    }
  }, []);

  // Get filter options for a category
  const getFilterOptions = useCallback((categoryId: string): FilterOption[] => {
    const category = filtersState.categories.get(categoryId);
    return category?.options || [];
  }, [filtersState.categories]);

  // Check if category is loading
  const isCategoryLoading = useCallback((categoryId: string): boolean => {
    const category = filtersState.categories.get(categoryId);
    return category?.loadingState === LoadingStates.LOADING;
  }, [filtersState.categories]);

  // Get category error
  const getCategoryError = useCallback((categoryId: string): string | null => {
    const category = filtersState.categories.get(categoryId);
    return category?.loadingState === LoadingStates.ERROR ? 'Failed to load options' : null;
  }, [filtersState.categories]);

  // Load consistency report
  const loadConsistencyReport = useCallback(async () => {
    if (!enableRelationshipChecking) return;

    try {
      const report = await dataRelationshipService.generateConsistencyReport();
      setConsistencyReport(report);
    } catch (error) {
      console.error('Failed to load consistency report:', error);
    }
  }, [enableRelationshipChecking]);

  // Event listeners for real-time updates
  useEffect(() => {
    if (!enableRealTimeUpdates) return;

    const handleCategoryUpdated = (event: any) => {
      setFiltersState(prev => {
        const newCategories = new Map(prev.categories);
        const category = newCategories.get(event.categoryId);
        if (category) {
          category.options = event.options;
          category.loadingState = LoadingStates.SUCCESS;
          category.lastUpdated = new Date();
        }
        return { ...prev, categories: newCategories };
      });
    };

    const handleCategoryError = (event: any) => {
      setFiltersState(prev => {
        const newCategories = new Map(prev.categories);
        const category = newCategories.get(event.categoryId);
        if (category) {
          category.loadingState = LoadingStates.ERROR;
        }
        return { ...prev, categories: newCategories };
      });
    };

    const handleFiltersUpdated = () => {
      const statistics = dynamicFilterService.getFilterStatistics();
      setFiltersState(prev => ({ ...prev, statistics }));
    };

    dynamicFilterService.on('categoryUpdated', handleCategoryUpdated);
    dynamicFilterService.on('categoryError', handleCategoryError);
    dynamicFilterService.on('filtersUpdated', handleFiltersUpdated);

    return () => {
      dynamicFilterService.off('categoryUpdated', handleCategoryUpdated);
      dynamicFilterService.off('categoryError', handleCategoryError);
      dynamicFilterService.off('filtersUpdated', handleFiltersUpdated);
    };
  }, [enableRealTimeUpdates]);

  // Auto-load categories on mount
  useEffect(() => {
    if (autoLoadCategories) {
      loadCategories();
    }
  }, [autoLoadCategories, loadCategories]);

  // Load consistency report on mount if enabled
  useEffect(() => {
    if (enableRelationshipChecking) {
      loadConsistencyReport();
    }
  }, [enableRelationshipChecking, loadConsistencyReport]);

  return {
    // State
    ...filtersState,
    validationResults,
    consistencyReport,

    // Actions
    loadCategories,
    refreshCategory,
    validateSelection,
    loadConsistencyReport,

    // Getters
    getFilterOptions,
    isCategoryLoading,
    getCategoryError,

    // Computed
    isLoading: filtersState.loadingState === LoadingStates.LOADING,
    hasError: filtersState.loadingState === LoadingStates.ERROR,
    isReady: filtersState.loadingState === LoadingStates.SUCCESS
  };
}

/**
 * Hook for dynamic dropdown management
 */
export function useDynamicDropdowns(dropdownIds: string[] = []) {
  const [dropdownsState, setDropdownsState] = useState<DynamicDropdownsState>({
    dropdowns: new Map(),
    loadingStates: new Map(),
    errors: new Map()
  });

  // Load dropdown data
  const loadDropdown = useCallback(async (dropdownId: string) => {
    setDropdownsState(prev => ({
      ...prev,
      loadingStates: new Map(prev.loadingStates).set(dropdownId, LoadingStates.LOADING),
      errors: new Map(prev.errors).set(dropdownId, '')
    }));

    try {
      await dynamicDropdownService.loadDropdownData(dropdownId);
      // State will be updated by event listener
    } catch (error) {
      setDropdownsState(prev => ({
        ...prev,
        loadingStates: new Map(prev.loadingStates).set(dropdownId, LoadingStates.ERROR),
        errors: new Map(prev.errors).set(dropdownId, error instanceof Error ? error.message : 'Failed to load dropdown')
      }));
    }
  }, []);

  // Search dropdown
  const searchDropdown = useCallback((dropdownId: string, query: string): DropdownOption[] => {
    return dynamicDropdownService.searchDropdown(dropdownId, query);
  }, []);

  // Select option
  const selectOption = useCallback((dropdownId: string, value: string | string[]) => {
    dynamicDropdownService.selectOption(dropdownId, value);
  }, []);

  // Deselect option
  const deselectOption = useCallback((dropdownId: string, value: string | string[]) => {
    dynamicDropdownService.deselectOption(dropdownId, value);
  }, []);

  // Clear selection
  const clearSelection = useCallback((dropdownId: string) => {
    dynamicDropdownService.clearSelection(dropdownId);
  }, []);

  // Get dropdown state
  const getDropdownState = useCallback((dropdownId: string): DropdownState | null => {
    return dropdownsState.dropdowns.get(dropdownId) || null;
  }, [dropdownsState.dropdowns]);

  // Get dropdown options
  const getDropdownOptions = useCallback((dropdownId: string): DropdownOption[] => {
    const state = getDropdownState(dropdownId);
    return state?.filteredOptions || [];
  }, [getDropdownState]);

  // Check if dropdown is loading
  const isDropdownLoading = useCallback((dropdownId: string): boolean => {
    return dropdownsState.loadingStates.get(dropdownId) === LoadingStates.LOADING;
  }, [dropdownsState.loadingStates]);

  // Get dropdown error
  const getDropdownError = useCallback((dropdownId: string): string | null => {
    return dropdownsState.errors.get(dropdownId) || null;
  }, [dropdownsState.errors]);

  // Event listeners
  useEffect(() => {
    const handleDropdownLoaded = (event: any) => {
      const state = dynamicDropdownService.getDropdownState(event.dropdownId);
      if (state) {
        setDropdownsState(prev => ({
          ...prev,
          dropdowns: new Map(prev.dropdowns).set(event.dropdownId, state),
          loadingStates: new Map(prev.loadingStates).set(event.dropdownId, LoadingStates.SUCCESS),
          errors: new Map(prev.errors).set(event.dropdownId, '')
        }));
      }
    };

    const handleDropdownError = (event: any) => {
      setDropdownsState(prev => ({
        ...prev,
        loadingStates: new Map(prev.loadingStates).set(event.dropdownId, LoadingStates.ERROR),
        errors: new Map(prev.errors).set(event.dropdownId, event.error)
      }));
    };

    const handleSelectionChanged = (event: any) => {
      const state = dynamicDropdownService.getDropdownState(event.dropdownId);
      if (state) {
        setDropdownsState(prev => ({
          ...prev,
          dropdowns: new Map(prev.dropdowns).set(event.dropdownId, state)
        }));
      }
    };

    dynamicDropdownService.on('dropdownLoaded', handleDropdownLoaded);
    dynamicDropdownService.on('dropdownError', handleDropdownError);
    dynamicDropdownService.on('dropdownSelectionChanged', handleSelectionChanged);

    return () => {
      dynamicDropdownService.off('dropdownLoaded', handleDropdownLoaded);
      dynamicDropdownService.off('dropdownError', handleDropdownError);
      dynamicDropdownService.off('dropdownSelectionChanged', handleSelectionChanged);
    };
  }, []);

  // Load dropdowns on mount
  useEffect(() => {
    dropdownIds.forEach(dropdownId => {
      loadDropdown(dropdownId);
    });
  }, [dropdownIds, loadDropdown]);

  return {
    // State
    dropdowns: dropdownsState.dropdowns,
    loadingStates: dropdownsState.loadingStates,
    errors: dropdownsState.errors,

    // Actions
    loadDropdown,
    searchDropdown,
    selectOption,
    deselectOption,
    clearSelection,

    // Getters
    getDropdownState,
    getDropdownOptions,
    isDropdownLoading,
    getDropdownError
  };
}

/**
 * Hook for data relationship management
 */
export function useDataRelationships() {
  const [consistencyReport, setConsistencyReport] = useState<ConsistencyReport | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Generate consistency report
  const generateReport = useCallback(async () => {
    setIsValidating(true);
    try {
      const report = await dataRelationshipService.generateConsistencyReport();
      setConsistencyReport(report);
    } catch (error) {
      console.error('Failed to generate consistency report:', error);
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Validate specific relationship
  const validateRelationship = useCallback(async (relationshipId: string) => {
    try {
      return await dataRelationshipService.validateRelationship(relationshipId);
    } catch (error) {
      console.error(`Failed to validate relationship ${relationshipId}:`, error);
      return null;
    }
  }, []);

  // Get related record
  const getRelatedRecord = useCallback((relationshipId: string, sourceValue: string) => {
    return dataRelationshipService.getRelatedRecord(relationshipId, sourceValue);
  }, []);

  // Get statistics
  const statistics = useMemo(() => {
    return dataRelationshipService.getRelationshipStatistics();
  }, []);

  return {
    // State
    consistencyReport,
    isValidating,
    statistics,

    // Actions
    generateReport,
    validateRelationship,
    getRelatedRecord
  };
}

export default useDynamicFilters;