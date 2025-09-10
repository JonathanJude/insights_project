import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
    AGE_GROUPS,
    DATE_RANGE_PRESETS,
    GENDER_OPTIONS,
    NIGERIAN_STATES,
    POLITICAL_PARTIES,
    SOCIAL_PLATFORMS
} from '../../constants';
import { useIsMobile, useIsTouchDevice } from '../../hooks/useMediaQuery';
import { useFilterStore } from '../../stores/filterStore';
import {
    AgeGroup,
    Gender,
    NigerianState,
    PoliticalParty,
    SocialPlatform
} from '../../types';

interface MobileFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
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

const MobileFilterModal: React.FC<MobileFilterModalProps> = ({
  isOpen,
  onClose,
  showEnhancedFilters = false
}) => {
  const isMobile = useIsMobile();
  const isTouch = useIsTouchDevice();
  const modalRef = useRef<HTMLDivElement>(null);
  const [currentCategory, setCurrentCategory] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const {
    selectedParties,
    selectedStates,
    selectedPlatforms,
    selectedGenders,
    selectedAgeGroups,
    dateRange,
    toggleParty,
    toggleState,
    togglePlatform,
    toggleGender,
    toggleAgeGroup,
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

  // Filter categories for swipe navigation
  const filterCategories = [
    { id: 'parties', label: 'Parties', icon: '🏛️' },
    { id: 'platforms', label: 'Platforms', icon: '📱' },
    { id: 'demographics', label: 'Demographics', icon: '👥' },
    { id: 'states', label: 'States', icon: '🗺️' },
    { id: 'dateRange', label: 'Date Range', icon: '📅' },
    ...(showEnhancedFilters ? [
      { id: 'education', label: 'Education', icon: '🎓' },
      { id: 'occupation', label: 'Occupation', icon: '💼' },
      { id: 'sentiment', label: 'Sentiment', icon: '😊' },
      { id: 'topics', label: 'Topics', icon: '📊' },
      { id: 'engagement', label: 'Engagement', icon: '🔥' }
    ] : [])
  ];

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

  // Touch/swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isTouch) return;
    setStartX(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isTouch || !isDragging) return;
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isTouch || !isDragging) return;
    
    const endX = e.changedTouches[0].clientX;
    const deltaX = startX - endX;
    const threshold = 50;

    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0 && currentCategory < filterCategories.length - 1) {
        // Swipe left - next category
        setCurrentCategory(currentCategory + 1);
      } else if (deltaX < 0 && currentCategory > 0) {
        // Swipe right - previous category
        setCurrentCategory(currentCategory - 1);
      }
    }

    setIsDragging(false);
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close modal on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getTotalActiveFilters = () => {
    return getActiveFilterCount() + Object.values(enhancedFilters).flat().length;
  };

  const handleClearAllFilters = () => {
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
  };

  const CheckboxItem: React.FC<{
    id: string;
    label: string;
    checked: boolean;
    onChange: () => void;
    color?: string;
    emoji?: string;
  }> = ({ id, label, checked, onChange, color, emoji }) => (
    <label
      htmlFor={id}
      className="flex items-center space-x-3 py-3 px-4 cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      {emoji && <span className="text-lg">{emoji}</span>}
      {color && (
        <div
          className="w-4 h-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
        />
      )}
      <span className="text-base text-gray-900 flex-1">{label}</span>
    </label>
  );

  const SliderComponent: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
  }> = ({ label, value, onChange, min = 0, max = 1, step = 0.1 }) => (
    <div className="px-4 py-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-base font-medium text-gray-900">{label}</span>
        <span className="text-sm text-gray-600">{value.toFixed(1)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
        style={{
          background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((value - min) / (max - min)) * 100}%, #E5E7EB ${((value - min) / (max - min)) * 100}%, #E5E7EB 100%)`
        }}
      />
    </div>
  );

  const renderCategoryContent = () => {
    const category = filterCategories[currentCategory];
    
    switch (category.id) {
      case 'parties':
        return (
          <div className="space-y-1">
            {POLITICAL_PARTIES.map((party) => (
              <CheckboxItem
                key={party.value}
                id={`party-${party.value}`}
                label={party.label}
                checked={selectedParties.includes(party.value as PoliticalParty)}
                onChange={() => toggleParty(party.value as PoliticalParty)}
                color={party.color}
              />
            ))}
          </div>
        );

      case 'platforms':
        return (
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
        );

      case 'demographics':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-medium text-gray-900 px-4 py-2 bg-gray-50">Gender</h4>
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
            <div>
              <h4 className="text-lg font-medium text-gray-900 px-4 py-2 bg-gray-50">Age Groups</h4>
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
        );

      case 'states':
        return (
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
        );

      case 'dateRange':
        return (
          <div className="space-y-4 px-4">
            <div className="grid grid-cols-2 gap-3">
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
                    className={`px-4 py-3 text-sm rounded-lg border transition-colors touch-manipulation ${isSelected
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.start || ''}
                  onChange={(e) => setDateRange(e.target.value, dateRange.end)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.end || ''}
                  onChange={(e) => setDateRange(dateRange.start, e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      // Enhanced filter categories
      case 'education':
        return (
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
        );

      case 'occupation':
        return (
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
        );

      case 'sentiment':
        return (
          <div className="space-y-4">
            <div>
              <h4 className="text-lg font-medium text-gray-900 px-4 py-2 bg-gray-50">Sentiment Polarity</h4>
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
            <div>
              <h4 className="text-lg font-medium text-gray-900 px-4 py-2 bg-gray-50">Primary Emotions</h4>
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
            <SliderComponent
              label="Confidence Threshold"
              value={enhancedFilters.confidenceThreshold}
              onChange={(value) => setEnhancedFilters(prev => ({ ...prev, confidenceThreshold: value }))}
            />
          </div>
        );

      case 'topics':
        return (
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
        );

      case 'engagement':
        return (
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
        );

      default:
        return <div className="p-4 text-center text-gray-500">No filters available</div>;
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-t-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-semibold text-gray-900">
              {showEnhancedFilters ? 'Enhanced Filters' : 'Filters'}
            </h2>
            {getTotalActiveFilters() > 0 && (
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2 py-1 rounded-full">
                {getTotalActiveFilters()}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 -m-2 touch-manipulation"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex overflow-x-auto bg-gray-50 border-b border-gray-200">
          {filterCategories.map((category, index) => (
            <button
              key={category.id}
              onClick={() => setCurrentCategory(index)}
              className={`flex-shrink-0 flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors touch-manipulation ${
                currentCategory === index
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>

        {/* Swipe indicator */}
        {isTouch && (
          <div className="flex justify-center py-2 bg-gray-50">
            <div className="flex space-x-1">
              {filterCategories.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    currentCategory === index ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {renderCategoryContent()}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            {getTotalActiveFilters() > 0 && (
              <button
                onClick={handleClearAllFilters}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors touch-manipulation"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors touch-manipulation"
            >
              Apply Filters
            </button>
          </div>
          
          {/* Swipe instruction */}
          {isTouch && (
            <div className="mt-2 text-center text-xs text-gray-500">
              Swipe left/right to navigate categories
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MobileFilterModal;