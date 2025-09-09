import React, { useState } from 'react';
import { useFilterStore } from '../../stores/filterStore';
import FilterIndicator from './FilterIndicator';
import FilterModal from './FilterModal';

interface FilterBarProps {
  className?: string;
  showFilterButton?: boolean;
  showSortOptions?: boolean;
  compact?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({ 
  className = "",
  showFilterButton = true,
  showSortOptions = true,
  compact = false
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

  const sortOptions = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'name', label: 'Name' },
    { value: 'sentiment', label: 'Sentiment' },
    { value: 'mentions', label: 'Mentions' }
  ];

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
                <option key={option.value} value={option.value}>
                  {option.label}
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