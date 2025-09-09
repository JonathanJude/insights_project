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

interface FilterIndicatorProps {
  className?: string;
  showClearAll?: boolean;
  compact?: boolean;
}

const FilterIndicator: React.FC<FilterIndicatorProps> = ({ 
  className = "",
  showClearAll = true,
  compact = false
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
    clearAllFilters,
    clearSearchQuery,
    toggleParty,
    toggleState,
    togglePlatform,
    toggleGender,
    toggleAgeGroup,
    toggleLevel,
    hasActiveFilters,
    getActiveFilterCount
  } = useFilterStore();

  const getDisplayName = (type: string, value: string): string => {
    switch (type) {
      case 'party':
        return POLITICAL_PARTIES.find(p => p.value === value)?.label || value;
      case 'state':
        return NIGERIAN_STATES.find(s => s.value === value)?.label || value;
      case 'platform':
        return SOCIAL_PLATFORMS.find(p => p.value === value)?.label || value;
      case 'gender':
        return GENDER_OPTIONS.find(g => g.value === value)?.label || value;
      case 'ageGroup':
        return AGE_GROUPS.find(a => a.value === value)?.label || value;
      case 'level':
        return POLITICAL_LEVELS.find(l => l.value === value)?.label || value;
      default:
        return value;
    }
  };

  const getColor = (type: string, value: string): string => {
    switch (type) {
      case 'party':
        return POLITICAL_PARTIES.find(p => p.value === value)?.color || '#6b7280';
      case 'platform':
        return SOCIAL_PLATFORMS.find(p => p.value === value)?.color || '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const FilterChip: React.FC<{
    label: string;
    onRemove: () => void;
    color?: string;
    type?: string;
  }> = ({ label, onRemove, color, type }) => (
    <span 
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
        compact ? 'text-xs' : 'text-sm'
      } bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100`}
    >
      {color && type === 'party' && (
        <div 
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
      )}
      <span className="truncate max-w-24">{label}</span>
      <button
        onClick={onRemove}
        className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );

  if (!hasActiveFilters()) {
    return null;
  }

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {/* Search Query */}
      {searchQuery && (
        <FilterChip
          label={`Search: "${searchQuery}"`}
          onRemove={clearSearchQuery}
        />
      )}

      {/* Political Parties */}
      {selectedParties.map((party) => (
        <FilterChip
          key={`party-${party}`}
          label={getDisplayName('party', party)}
          onRemove={() => toggleParty(party)}
          color={getColor('party', party)}
          type="party"
        />
      ))}

      {/* States */}
      {selectedStates.map((state) => (
        <FilterChip
          key={`state-${state}`}
          label={getDisplayName('state', state)}
          onRemove={() => toggleState(state)}
        />
      ))}

      {/* Platforms */}
      {selectedPlatforms.map((platform) => (
        <FilterChip
          key={`platform-${platform}`}
          label={getDisplayName('platform', platform)}
          onRemove={() => togglePlatform(platform)}
          color={getColor('platform', platform)}
          type="platform"
        />
      ))}

      {/* Genders */}
      {selectedGenders.map((gender) => (
        <FilterChip
          key={`gender-${gender}`}
          label={getDisplayName('gender', gender)}
          onRemove={() => toggleGender(gender)}
        />
      ))}

      {/* Age Groups */}
      {selectedAgeGroups.map((ageGroup) => (
        <FilterChip
          key={`age-${ageGroup}`}
          label={getDisplayName('ageGroup', ageGroup)}
          onRemove={() => toggleAgeGroup(ageGroup)}
        />
      ))}

      {/* Political Levels */}
      {selectedLevels.map((level) => (
        <FilterChip
          key={`level-${level}`}
          label={getDisplayName('level', level)}
          onRemove={() => toggleLevel(level)}
        />
      ))}

      {/* Date Range Indicator */}
      {(dateRange.start || dateRange.end) && (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {dateRange.start && dateRange.end 
            ? `${dateRange.start} to ${dateRange.end}`
            : dateRange.start 
              ? `From ${dateRange.start}`
              : `Until ${dateRange.end}`
          }
        </span>
      )}

      {/* Clear All Button */}
      {showClearAll && (
        <button
          onClick={clearAllFilters}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear all ({getActiveFilterCount()})
        </button>
      )}
    </div>
  );
};

export default FilterIndicator;