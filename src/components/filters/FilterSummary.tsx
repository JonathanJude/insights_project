import React from 'react';
import {
    AGE_GROUPS,
    GENDER_OPTIONS,
    NIGERIAN_STATES,
    POLITICAL_LEVELS,
    POLITICAL_PARTIES,
    SOCIAL_PLATFORMS
} from '../../constants';
import { useFilterStore } from '../../stores/filterStore';

interface FilterSummaryProps {
  className?: string;
  showDetails?: boolean;
}

const FilterSummary: React.FC<FilterSummaryProps> = ({ 
  className = "",
  showDetails = true
}) => {
  const {
    searchQuery,
    selectedParties,
    selectedStates,
    selectedPlatforms,
    selectedGenders,
    selectedAgeGroups,
    selectedLevels,
    dateRange,
    sortBy,
    sortOrder,
    hasActiveFilters,
    getActiveFilterCount,
    clearAllFilters
  } = useFilterStore();

  const getFilterSummary = () => {
    const summary: Array<{ category: string; items: string[]; count: number }> = [];

    if (searchQuery) {
      summary.push({
        category: 'Search',
        items: [`"${searchQuery}"`],
        count: 1
      });
    }

    if (selectedParties.length > 0) {
      const partyNames = selectedParties.map(party => 
        POLITICAL_PARTIES.find(p => p.value === party)?.label || party
      );
      summary.push({
        category: 'Parties',
        items: partyNames,
        count: selectedParties.length
      });
    }

    if (selectedStates.length > 0) {
      const stateNames = selectedStates.map(state => 
        NIGERIAN_STATES.find(s => s.value === state)?.label || state
      );
      summary.push({
        category: 'States',
        items: stateNames,
        count: selectedStates.length
      });
    }

    if (selectedPlatforms.length > 0) {
      const platformNames = selectedPlatforms.map(platform => 
        SOCIAL_PLATFORMS.find(p => p.value === platform)?.label || platform
      );
      summary.push({
        category: 'Platforms',
        items: platformNames,
        count: selectedPlatforms.length
      });
    }

    if (selectedGenders.length > 0) {
      const genderNames = selectedGenders.map(gender => 
        GENDER_OPTIONS.find(g => g.value === gender)?.label || gender
      );
      summary.push({
        category: 'Gender',
        items: genderNames,
        count: selectedGenders.length
      });
    }

    if (selectedAgeGroups.length > 0) {
      const ageGroupNames = selectedAgeGroups.map(ageGroup => 
        AGE_GROUPS.find(a => a.value === ageGroup)?.label || ageGroup
      );
      summary.push({
        category: 'Age Groups',
        items: ageGroupNames,
        count: selectedAgeGroups.length
      });
    }

    if (selectedLevels.length > 0) {
      const levelNames = selectedLevels.map(level => 
        POLITICAL_LEVELS.find(l => l.value === level)?.label || level
      );
      summary.push({
        category: 'Political Levels',
        items: levelNames,
        count: selectedLevels.length
      });
    }

    return summary;
  };

  const formatDateRange = () => {
    if (!dateRange.start && !dateRange.end) return null;
    
    if (dateRange.start && dateRange.end) {
      return `${dateRange.start} to ${dateRange.end}`;
    }
    
    if (dateRange.start) {
      return `From ${dateRange.start}`;
    }
    
    return `Until ${dateRange.end}`;
  };

  if (!hasActiveFilters()) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
        </svg>
        <p className="text-lg font-medium mb-2">No filters applied</p>
        <p className="text-sm">Use the filters panel to narrow down your search results</p>
      </div>
    );
  }

  const summary = getFilterSummary();
  const dateRangeText = formatDateRange();

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
          </svg>
          <h3 className="font-medium text-blue-900">
            Active Filters ({getActiveFilterCount()})
          </h3>
        </div>
        <button
          onClick={clearAllFilters}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear All
        </button>
      </div>

      {showDetails && (
        <div className="space-y-2">
          {summary.map((item, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-sm font-medium text-blue-800 min-w-0 flex-shrink-0">
                {item.category}:
              </span>
              <div className="flex-1 min-w-0">
                {item.count <= 3 ? (
                  <span className="text-sm text-blue-700">
                    {item.items.join(', ')}
                  </span>
                ) : (
                  <span className="text-sm text-blue-700">
                    {item.items.slice(0, 2).join(', ')} and {item.count - 2} more
                  </span>
                )}
              </div>
            </div>
          ))}

          {dateRangeText && (
            <div className="flex items-start gap-2">
              <span className="text-sm font-medium text-blue-800 min-w-0 flex-shrink-0">
                Date Range:
              </span>
              <span className="text-sm text-blue-700">{dateRangeText}</span>
            </div>
          )}

          <div className="flex items-start gap-2">
            <span className="text-sm font-medium text-blue-800 min-w-0 flex-shrink-0">
              Sort:
            </span>
            <span className="text-sm text-blue-700">
              {sortBy === 'relevance' ? 'Relevance' : 
               sortBy === 'name' ? 'Name' :
               sortBy === 'sentiment' ? 'Sentiment' : 'Mentions'} 
              ({sortOrder === 'asc' ? 'ascending' : 'descending'})
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSummary;