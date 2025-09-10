import React, { useState } from 'react';
import {
    AGE_GROUPS,
    DATE_RANGE_PRESETS,
    GENDER_OPTIONS,
    NIGERIAN_STATES,
    POLITICAL_PARTIES,
    SOCIAL_PLATFORMS
} from '../../constants';
import { useFilterStore } from '../../stores/filterStore';
import {
    AgeGroup,
    Gender,
    NigerianState,
    PoliticalParty,
    SocialPlatform
} from '../../types';
import FilterPresets from './FilterPresets';
import FilterSummary from './FilterSummary';

interface EnhancedFiltersPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
  showSummary?: boolean;
  variant?: 'panel' | 'sidebar' | 'modal';
  showEnhancedFilters?: boolean;
}

// Enhanced filter options
const EDUCATION_LEVELS = [
  { value: 'Primary', label: 'Primary Education' },
  { value: 'Secondary', label: 'Secondary Education' },
  { value: 'Tertiary', label: 'Tertiary Education' },
  { value: 'Postgraduate', label: 'Postgraduate' }
];

const OCCUPATION_SECTORS = [
  { value: 'Public Sector', label: 'Public Sector' },
  { value: 'Private Sector', label: 'Private Sector' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Professional Services', label: 'Professional Services' },
  { value: 'Self-Employed', label: 'Self-Employed' },
  { value: 'Student', label: 'Student' },
  { value: 'Agriculture', label: 'Agriculture' },
  { value: 'Unemployed', label: 'Unemployed' }
];

const SENTIMENT_POLARITIES = [
  { value: 'Positive', label: 'Positive', color: '#10B981' },
  { value: 'Negative', label: 'Negative', color: '#EF4444' },
  { value: 'Neutral', label: 'Neutral', color: '#6B7280' }
];

const EMOTION_TYPES = [
  { value: 'Joy', label: 'Joy', emoji: '😊' },
  { value: 'Anger', label: 'Anger', emoji: '😠' },
  { value: 'Fear', label: 'Fear', emoji: '😰' },
  { value: 'Sadness', label: 'Sadness', emoji: '😢' },
  { value: 'Disgust', label: 'Disgust', emoji: '🤢' },
  { value: 'Mixed', label: 'Mixed', emoji: '🤔' }
];

const POLICY_AREAS = [
  { value: 'Economy', label: 'Economy' },
  { value: 'Security', label: 'Security' },
  { value: 'Education', label: 'Education' },
  { value: 'Health', label: 'Healthcare' },
  { value: 'Infrastructure', label: 'Infrastructure' },
  { value: 'Corruption', label: 'Anti-Corruption' },
  { value: 'Youth/Jobs', label: 'Youth & Employment' }
];

const ENGAGEMENT_LEVELS = [
  { value: 'High', label: 'High Engagement', color: '#10B981' },
  { value: 'Medium', label: 'Medium Engagement', color: '#F59E0B' },
  { value: 'Low', label: 'Low Engagement', color: '#6B7280' }
];

const EnhancedFiltersPanel: React.FC<EnhancedFiltersPanelProps> = ({
  isOpen = true,
  onClose,
  className = "",
  showSummary = false,
  variant = 'panel',
  showEnhancedFilters = false
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

  // Enhanced filter states (would be added to filter store in real implementation)
  const [enhancedFilters, setEnhancedFilters] = useState({
    education: [] as string[],
    occupation: [] as string[],
    sentimentPolarity: [] as string[],
    emotions: [] as string[],
    policyAreas: [] as string[],
    engagementLevels: [] as string[],
    confidenceThreshold: 0.5,
    intensityRange: [0, 1] as [number, number]
  });

  const [expandedSections, setExpandedSections] = useState({
    parties: true,
    states: false,
    platforms: true,
    demographics: false,
    levels: false,
    dateRange: true,
    // Enhanced sections
    education: false,
    occupation: false,
    sentiment: false,
    topics: false,
    engagement: false
  });

  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleEnhancedFilter = (category: keyof typeof enhancedFilters, value: string) => {
    setEnhancedFilters(prev => {
      const currentValues = prev[category] as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      
      return {
        ...prev,
        [category]: newValues
      };
    });
  };

  const handleClearAllFilters = () => {
    const totalFilters = getActiveFilterCount() + 
      Object.values(enhancedFilters).flat().length;
    
    if (totalFilters > 3) {
      setShowConfirmClear(true);
    } else {
      clearAllFilters();
      setEnhancedFilters({
        education: [],
        occupation: [],
        sentimentPolarity: [],
        emotions: [],
        policyAreas: [],
        engagementLevels: [],
        confidenceThreshold: 0.5,
        intensityRange: [0, 1]
      });
    }
  };

  const confirmClearFilters = () => {
    clearAllFilters();
    setEnhancedFilters({
      education: [],
      occupation: [],
      sentimentPolarity: [],
      emotions: [],
      policyAreas: [],
      engagementLevels: [],
      confidenceThreshold: 0.5,
      intensityRange: [0, 1]
    });
    setShowConfirmClear(false);
  };

  const cancelClearFilters = () => {
    setShowConfirmClear(false);
  };

  const getEnhancedFilterCount = () => {
    return Object.values(enhancedFilters).flat().length;
  };

  const FilterSection: React.FC<{
    title: string;
    count?: number;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    badge?: string;
  }> = ({ title, count, isExpanded, onToggle, children, badge }) => (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-900">{title}</span>
          {badge && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
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
    emoji?: string;
  }> = ({ id, label, checked, onChange, color, description, emoji }) => (
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
      {emoji && (
        <span className="text-sm">{emoji}</span>
      )}
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

  const containerClasses = {
    panel: 'bg-white border border-gray-200 rounded-lg shadow-sm',
    sidebar: 'bg-white border-r border-gray-200 h-full',
    modal: 'bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden'
  };

  const totalActiveFilters = getActiveFilterCount() + getEnhancedFilterCount();

  return (
    <div className={`${containerClasses[variant]} ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium text-gray-900">
            {showEnhancedFilters ? 'Enhanced Filters' : 'Filters'}
          </h3>
          {totalActiveFilters > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {totalActiveFilters}
            </span>
          )}
          {showEnhancedFilters && (
            <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
              ✨ Enhanced
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {totalActiveFilters > 0 && (
            <div className="relative">
              <button
                onClick={handleClearAllFilters}
                className="text-sm text-red-600 hover:text-red-700 transition-colors font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear all
              </button>

              {/* Confirmation Modal */}
              {showConfirmClear && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
                  <div className="text-sm text-gray-900 mb-3">
                    Are you sure you want to clear all {totalActiveFilters} filters?
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={confirmClearFilters}
                      className="flex-1 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={cancelClearFilters}
                      className="flex-1 px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
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

      {/* Filter Presets */}
      {!hasActiveFilters() && !getEnhancedFilterCount() && (
        <div className="px-4 py-3 border-b border-gray-200">
          <FilterPresets />
        </div>
      )}

      {/* Filter Summary */}
      {showSummary && totalActiveFilters > 0 && (
        <div className="px-4 py-3 border-b border-gray-200">
          <FilterSummary showDetails={false} />
        </div>
      )}

      {/* Filter Sections */}
      <div className={`${variant === 'modal' ? 'max-h-[60vh]' : 'max-h-96'} overflow-y-auto`}>
        {/* Basic Filters */}
        
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

        {/* Enhanced Filters */}
        {showEnhancedFilters && (
          <>
            {/* Education Level */}
            <FilterSection
              title="Education Level"
              count={enhancedFilters.education.length}
              isExpanded={expandedSections.education}
              onToggle={() => toggleSection('education')}
              badge="Enhanced"
            >
              <div className="space-y-1">
                {EDUCATION_LEVELS.map((level) => (
                  <CheckboxItem
                    key={level.value}
                    id={`education-${level.value}`}
                    label={level.label}
                    checked={enhancedFilters.education.includes(level.value)}
                    onChange={() => toggleEnhancedFilter('education', level.value)}
                  />
                ))}
              </div>
            </FilterSection>

            {/* Occupation Sector */}
            <FilterSection
              title="Occupation Sector"
              count={enhancedFilters.occupation.length}
              isExpanded={expandedSections.occupation}
              onToggle={() => toggleSection('occupation')}
              badge="Enhanced"
            >
              <div className="space-y-1">
                {OCCUPATION_SECTORS.map((sector) => (
                  <CheckboxItem
                    key={sector.value}
                    id={`occupation-${sector.value}`}
                    label={sector.label}
                    checked={enhancedFilters.occupation.includes(sector.value)}
                    onChange={() => toggleEnhancedFilter('occupation', sector.value)}
                  />
                ))}
              </div>
            </FilterSection>

            {/* Sentiment Analysis */}
            <FilterSection
              title="Sentiment Analysis"
              count={enhancedFilters.sentimentPolarity.length + enhancedFilters.emotions.length}
              isExpanded={expandedSections.sentiment}
              onToggle={() => toggleSection('sentiment')}
              badge="Enhanced"
            >
              <div className="space-y-4">
                {/* Polarity */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Sentiment Polarity</h4>
                  <div className="space-y-1">
                    {SENTIMENT_POLARITIES.map((polarity) => (
                      <CheckboxItem
                        key={polarity.value}
                        id={`polarity-${polarity.value}`}
                        label={polarity.label}
                        checked={enhancedFilters.sentimentPolarity.includes(polarity.value)}
                        onChange={() => toggleEnhancedFilter('sentimentPolarity', polarity.value)}
                        color={polarity.color}
                      />
                    ))}
                  </div>
                </div>

                {/* Emotions */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Primary Emotions</h4>
                  <div className="space-y-1">
                    {EMOTION_TYPES.map((emotion) => (
                      <CheckboxItem
                        key={emotion.value}
                        id={`emotion-${emotion.value}`}
                        label={emotion.label}
                        checked={enhancedFilters.emotions.includes(emotion.value)}
                        onChange={() => toggleEnhancedFilter('emotions', emotion.value)}
                        emoji={emotion.emoji}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </FilterSection>

            {/* Policy Areas */}
            <FilterSection
              title="Policy Areas"
              count={enhancedFilters.policyAreas.length}
              isExpanded={expandedSections.topics}
              onToggle={() => toggleSection('topics')}
              badge="Enhanced"
            >
              <div className="space-y-1">
                {POLICY_AREAS.map((area) => (
                  <CheckboxItem
                    key={area.value}
                    id={`policy-${area.value}`}
                    label={area.label}
                    checked={enhancedFilters.policyAreas.includes(area.value)}
                    onChange={() => toggleEnhancedFilter('policyAreas', area.value)}
                  />
                ))}
              </div>
            </FilterSection>

            {/* Engagement Levels */}
            <FilterSection
              title="Engagement Levels"
              count={enhancedFilters.engagementLevels.length}
              isExpanded={expandedSections.engagement}
              onToggle={() => toggleSection('engagement')}
              badge="Enhanced"
            >
              <div className="space-y-1">
                {ENGAGEMENT_LEVELS.map((level) => (
                  <CheckboxItem
                    key={level.value}
                    id={`engagement-${level.value}`}
                    label={level.label}
                    checked={enhancedFilters.engagementLevels.includes(level.value)}
                    onChange={() => toggleEnhancedFilter('engagementLevels', level.value)}
                    color={level.color}
                  />
                ))}
              </div>
            </FilterSection>
          </>
        )}

        {/* Basic Demographics */}
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
                    className={`px-3 py-2 text-sm rounded border transition-colors ${isSelected
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
      </div>

      {/* Footer */}
      {totalActiveFilters > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {totalActiveFilters} filter{totalActiveFilters !== 1 ? 's' : ''} applied
              </span>
              <div className="flex items-center gap-1">
                {selectedParties.length > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    {selectedParties.length} parties
                  </span>
                )}
                {selectedStates.length > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    {selectedStates.length} states
                  </span>
                )}
                {getEnhancedFilterCount() > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                    ✨ {getEnhancedFilterCount()} enhanced
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleClearAllFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedFiltersPanel;