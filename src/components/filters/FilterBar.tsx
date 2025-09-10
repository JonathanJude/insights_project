import React, { useMemo, useState } from 'react';
import { LoadingStates } from '../../constants/enums';
import { ERROR_MESSAGES, INFO_MESSAGES } from '../../constants/messages';
import { ALL_SORT_CONFIGS } from '../../constants/templates/search-filter-configs';
import { useFilterStore } from '../../stores/filterStore';
import FilterIndicator from './FilterIndicator';
import FilterModal from './FilterModal';

interface FilterBarProps {
  className?: string;
  showFilterButton?: boolean;
  showSortOptions?: boolean;
  compact?: boolean;
  loadingState?: LoadingStates;
  errorMessage?: string;
  availableOptions?: {
    parties?: string[];
    states?: string[];
    platforms?: string[];
  };
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  className = "",
  showFilterButton = true,
  showSortOptions = true,
  compact = false,
  loadingState = LoadingStates.IDLE,
  errorMessage,
  availableOptions
}) => {
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  const {
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    hasActiveFilters,
    getActiveFilterCount
  } = useFilterStore();

  // Generate sort options dynamically from configurations
  const sortOptions = useMemo(() => {
    return ALL_SORT_CONFIGS.map(config => ({
      value: config.field,
      label: config.name,
      description: config.description,
      isDefault: config.isDefault
    }));
  }, []);

  // Check if filter options are available
  const hasAvailableOptions = useMemo(() => {
    if (!availableOptions) return true; // Assume available if not specified
    
    return (
      (availableOptions.parties && availableOptions.parties.length > 0) ||
      (availableOptions.states && availableOptions.states.length > 0) ||
      (availableOptions.platforms && availableOptions.platforms.length > 0)
    );
  }, [availableOptions]);

  // Handle loading state
  if (loadingState === LoadingStates.LOADING) {
    return (
      <div className={`flex flex-wrap items-center gap-3 ${className}`}>
        <div className="animate-pulse flex items-center gap-2">
          <div className="h-8 w-20 bg-gray-200 rounded"></div>
          <div className="h-8 w-24 bg-gray-200 rounded"></div>
          <div className="h-8 w-16 bg-gray-200 rounded"></div>
        </div>
        <span className="text-sm text-gray-500">{INFO_MESSAGES.LOADING_DATA}</span>
      </div>
    );
  }

  // Handle error state
  if (loadingState === LoadingStates.ERROR || errorMessage) {
    return (
      <div className={`flex flex-wrap items-center gap-3 ${className}`}>
        <div className="flex items-center gap-2 text-red-600">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-sm">{errorMessage || ERROR_MESSAGES.FILTER_LOAD_OPTIONS_ERROR}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`flex flex-wrap items-center gap-3 ${className}`}>
        {/* Filter Button */}
        {showFilterButton && (
          <button
            onClick={() => setShowFilterModal(true)}
            className={`inline-flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium transition-colors ${
              hasActiveFilters()
                ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Filters
            {hasActiveFilters() && (
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-blue-600 rounded-full">
                {getActiveFilterCount()}
              </span>
            )}
            {/* Data availability indicator */}
            {!hasAvailableOptions && (
              <svg className="w-3 h-3 text-orange-500" fill="currentColor" viewBox="0 0 20 20" title="Limited filter options available">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        )}

        {/* Sort Options */}
        {showSortOptions && (
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value} title={option.description}>
                  {option.label} {option.isDefault ? '(Default)' : ''}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
            >
              {sortOrder === 'asc' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
              )}
            </button>
          </div>
        )}

        {/* Active Filters Indicator */}
        <div className="flex-1 min-w-0">
          <FilterIndicator 
            compact={compact}
            showClearAll={false}
          />
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        title="Filter Options"
      />
    </>
  );
};

export default FilterBar;