import React, { useState } from 'react';
import { useFilterStore } from '../../stores/filterStore';
import { 
  PoliticalParty, 
  NigerianState, 
  SocialPlatform, 
  Gender, 
  AgeGroup, 
  PoliticalLevel
} from '../../types';
import { 
  NIGERIAN_STATES, 
  POLITICAL_PARTIES, 
  SOCIAL_PLATFORMS, 
  GENDER_OPTIONS, 
  AGE_GROUPS, 
  POLITICAL_LEVELS,
  DATE_RANGE_PRESETS 
} from '../../constants';

interface FiltersPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

const FiltersPanel: React.FC<FiltersPanelProps> = ({ 
  isOpen = true, 
  onClose,
  className = ""
}) => {
  const {
    selectedParties,
    selectedStates,
    selectedPlatforms,
    selectedGenders,
    selectedAgeGroups,
    selectedLevels,
    dateRange,
    toggleParty,
    toggleState,
    togglePlatform,
    toggleGender,
    toggleAgeGroup,
    toggleLevel,
    setDateRange,
    clearAllFilters,
    hasActiveFilters,
    getActiveFilterCount
  } = useFilterStore();

  const [expandedSections, setExpandedSections] = useState({
    parties: true,
    states: false,
    platforms: true,
    demographics: false,
    levels: false,
    dateRange: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const FilterSection: React.FC<{
    title: string;
    count?: number;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
  }> = ({ title, count, isExpanded, onToggle, children }) => (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-900">{title}</span>
          {count !== undefined && count > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {count}
            </span>
          )}
        </div>
        <svg 
          className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isExpanded && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );

  const CheckboxItem: React.FC<{
    id: string;
    label: string;
    checked: boolean;
    onChange: () => void;
    color?: string;
    description?: string;
  }> = ({ id, label, checked, onChange, color, description }) => (
    <label 
      htmlFor={id}
      className="flex items-center space-x-3 py-2 cursor-pointer hover:bg-gray-50 rounded px-2 -mx-2 transition-colors"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      {color && (
        <div 
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
      )}
      <div className="flex-1 min-w-0">
        <span className="text-sm text-gray-900">{label}</span>
        {description && (
          <div className="text-xs text-gray-500">{description}</div>
        )}
      </div>
    </label>
  );

  if (!isOpen) return null;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          {hasActiveFilters() && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {getActiveFilterCount()}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters() && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Clear all
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Filter Sections */}
      <div className="max-h-96 overflow-y-auto">
        {/* Political Parties */}
        <FilterSection
          title="Political Parties"
          count={selectedParties.length}
          isExpanded={expandedSections.parties}
          onToggle={() => toggleSection('parties')}
        >
          <div className="space-y-1">
            {POLITICAL_PARTIES.map((party) => (
              <CheckboxItem
                key={party.value}
                id={`party-${party.value}`}
                label={party.label}
                checked={selectedParties.includes(party.value as PoliticalParty)}
                onChange={() => toggleParty(party.value as PoliticalParty)}
                color={party.color}
                description={party.fullName}
              />
            ))}
          </div>
        </FilterSection>

        {/* Social Platforms */}
        <FilterSection
          title="Social Platforms"
          count={selectedPlatforms.length}
          isExpanded={expandedSections.platforms}
          onToggle={() => toggleSection('platforms')}
        >
          <div className="space-y-1">
            {SOCIAL_PLATFORMS.map((platform) => (
              <CheckboxItem
                key={platform.value}
                id={`platform-${platform.value}`}
                label={platform.label}
                checked={selectedPlatforms.includes(platform.value as SocialPlatform)}
                onChange={() => togglePlatform(platform.value as SocialPlatform)}
                color={platform.color}
              />
            ))}
          </div>
        </FilterSection>

        {/* Date Range */}
        <FilterSection
          title="Date Range"
          isExpanded={expandedSections.dateRange}
          onToggle={() => toggleSection('dateRange')}
        >
          <div className="space-y-3">
            {/* Preset Options */}
            <div className="grid grid-cols-2 gap-2">
              {DATE_RANGE_PRESETS.map((preset) => {
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(endDate.getDate() - preset.value);
                const isSelected = dateRange.start === startDate.toISOString().split('T')[0] &&
                                 dateRange.end === endDate.toISOString().split('T')[0];
                
                return (
                  <button
                    key={preset.value}
                    onClick={() => setDateRange(
                      startDate.toISOString().split('T')[0],
                      endDate.toISOString().split('T')[0]
                    )}
                    className={`px-3 py-2 text-sm rounded border transition-colors ${
                      isSelected
                        ? 'bg-blue-50 border-blue-200 text-blue-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
            
            {/* Custom Date Inputs */}
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.start || ''}
                  onChange={(e) => {
                    setDateRange(e.target.value, dateRange.end);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.end || ''}
                  onChange={(e) => {
                    setDateRange(dateRange.start, e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Demographics */}
        <FilterSection
          title="Demographics"
          count={selectedGenders.length + selectedAgeGroups.length}
          isExpanded={expandedSections.demographics}
          onToggle={() => toggleSection('demographics')}
        >
          <div className="space-y-4">
            {/* Gender */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Gender</h4>
              <div className="space-y-1">
                {GENDER_OPTIONS.map((gender) => (
                  <CheckboxItem
                    key={gender.value}
                    id={`gender-${gender.value}`}
                    label={gender.label}
                    checked={selectedGenders.includes(gender.value as Gender)}
                    onChange={() => toggleGender(gender.value as Gender)}
                  />
                ))}
              </div>
            </div>
            
            {/* Age Groups */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Age Groups</h4>
              <div className="space-y-1">
                {AGE_GROUPS.map((ageGroup) => (
                  <CheckboxItem
                    key={ageGroup.value}
                    id={`age-${ageGroup.value}`}
                    label={ageGroup.label}
                    checked={selectedAgeGroups.includes(ageGroup.value as AgeGroup)}
                    onChange={() => toggleAgeGroup(ageGroup.value as AgeGroup)}
                  />
                ))}
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Political Levels */}
        <FilterSection
          title="Political Levels"
          count={selectedLevels.length}
          isExpanded={expandedSections.levels}
          onToggle={() => toggleSection('levels')}
        >
          <div className="space-y-1">
            {POLITICAL_LEVELS.map((level) => (
              <CheckboxItem
                key={level.value}
                id={`level-${level.value}`}
                label={level.label}
                checked={selectedLevels.includes(level.value as PoliticalLevel)}
                onChange={() => toggleLevel(level.value as PoliticalLevel)}
              />
            ))}
          </div>
        </FilterSection>

        {/* States */}
        <FilterSection
          title="States"
          count={selectedStates.length}
          isExpanded={expandedSections.states}
          onToggle={() => toggleSection('states')}
        >
          <div className="max-h-48 overflow-y-auto">
            <div className="space-y-1">
              {NIGERIAN_STATES.map((state) => (
                <CheckboxItem
                  key={state.value}
                  id={`state-${state.value}`}
                  label={state.label}
                  checked={selectedStates.includes(state.value as NigerianState)}
                  onChange={() => toggleState(state.value as NigerianState)}
                />
              ))}
            </div>
          </div>
        </FilterSection>
      </div>

      {/* Footer */}
      {hasActiveFilters() && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} applied
            </span>
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Clear all filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FiltersPanel;