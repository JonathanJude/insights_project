/**
 * Optimized Multi-Dimensional Filters Component
 * 
 * This component provides performance-optimized filtering for multi-dimensional data
 * with intelligent rendering, memoization, and efficient state management.
 */

import { ChevronDownIcon, ChevronUpIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { useOptimizedFilterState, usePerformanceOptimization } from '../../hooks/useOptimizedMultiDimensionalData';
import type { OptimizedFilterState } from '../../lib/optimizedEnhancedMockDataService';
import { usePerformanceMonitor } from '../../lib/performanceOptimization';

interface OptimizedMultiDimensionalFiltersProps {
  onFiltersChange?: (filters: OptimizedFilterState) => void;
  initialFilters?: Partial<OptimizedFilterState>;
  className?: string;
  showPerformanceMetrics?: boolean;
}

// Memoized filter section component
const FilterSection = memo<{
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
}>(({ title, isExpanded, onToggle, children, badge }) => (
  <div className="border-b border-gray-200 last:border-b-0">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      aria-expanded={isExpanded}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-900">{title}</span>
        {badge && (
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
            {badge}
          </span>
        )}
      </div>
      {isExpanded ? (
        <ChevronUpIcon className="h-5 w-5 text-gray-500" />
      ) : (
        <ChevronDownIcon className="h-5 w-5 text-gray-500" />
      )}
    </button>
    {isExpanded && (
      <div className="px-4 pb-4">
        {children}
      </div>
    )}
  </div>
));

FilterSection.displayName = 'FilterSection';

// Memoized multi-select component
const OptimizedMultiSelect = memo<{
  options: { value: string; label: string; count?: number }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  maxHeight?: string;
}>(({ options, selected, onChange, placeholder = "Select options...", maxHeight = "max-h-48" }) => {
  const handleToggle = useCallback((value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter(item => item !== value)
      : [...selected, value];
    onChange(newSelected);
  }, [selected, onChange]);

  const handleClear = useCallback(() => {
    onChange([]);
  }, [onChange]);

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {selected.length} selected
          </span>
          <button
            onClick={handleClear}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Clear all
          </button>
        </div>
      )}
      <div className={`${maxHeight} overflow-y-auto border border-gray-200 rounded-md`}>
        {options.map(option => (
          <label
            key={option.value}
            className="flex items-center p-2 hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selected.includes(option.value)}
              onChange={() => handleToggle(option.value)}
              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="flex-1 text-sm text-gray-900">
              {option.label}
            </span>
            {option.count !== undefined && (
              <span className="text-xs text-gray-500 ml-2">
                ({option.count})
              </span>
            )}
          </label>
        ))}
      </div>
    </div>
  );
});

OptimizedMultiSelect.displayName = 'OptimizedMultiSelect';

// Memoized range slider component
const OptimizedRangeSlider = memo<{
  min: number;
  max: number;
  value: { min: number; max: number };
  onChange: (value: { min: number; max: number }) => void;
  step?: number;
  label?: string;
}>(({ min, max, value, onChange, step = 0.1, label }) => {
  const handleMinChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = parseFloat(e.target.value);
    onChange({ ...value, min: Math.min(newMin, value.max) });
  }, [value, onChange]);

  const handleMaxChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = parseFloat(e.target.value);
    onChange({ ...value, max: Math.max(newMax, value.min) });
  }, [value, onChange]);

  return (
    <div className="space-y-3">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value.min}
            onChange={handleMinChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-xs text-gray-500 mt-1">Min: {value.min.toFixed(2)}</div>
        </div>
        <div className="flex-1">
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value.max}
            onChange={handleMaxChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-xs text-gray-500 mt-1">Max: {value.max.toFixed(2)}</div>
        </div>
      </div>
    </div>
  );
});

OptimizedRangeSlider.displayName = 'OptimizedRangeSlider';

// Main component
export const OptimizedMultiDimensionalFilters: React.FC<OptimizedMultiDimensionalFiltersProps> = memo(({
  onFiltersChange,
  initialFilters = {},
  className = '',
  showPerformanceMetrics = false
}) => {
  const { getMetrics } = usePerformanceMonitor('OptimizedMultiDimensionalFilters');
  const { filters, updateFilters, clearFilters, hasActiveFilters } = useOptimizedFilterState(initialFilters);
  const { getPerformanceReport, optimizationSuggestions } = usePerformanceOptimization();

  // Expanded sections state
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['geographic', 'demographic']) // Default expanded sections
  );

  // Toggle section expansion
  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  }, []);

  // Filter options (memoized for performance)
  const filterOptions = useMemo(() => ({
    states: [
      { value: 'Lagos', label: 'Lagos', count: 45 },
      { value: 'Kano', label: 'Kano', count: 32 },
      { value: 'Rivers', label: 'Rivers', count: 28 },
      { value: 'Kaduna', label: 'Kaduna', count: 25 },
      { value: 'Oyo', label: 'Oyo', count: 22 },
      { value: 'FCT', label: 'FCT (Abuja)', count: 20 }
    ],
    education: [
      { value: 'Secondary', label: 'Secondary Education', count: 156 },
      { value: 'Tertiary', label: 'Tertiary Education', count: 134 },
      { value: 'Postgraduate', label: 'Postgraduate', count: 89 },
      { value: 'Primary', label: 'Primary Education', count: 67 }
    ],
    occupation: [
      { value: 'Public Sector', label: 'Public Sector', count: 98 },
      { value: 'Private Sector', label: 'Private Sector', count: 87 },
      { value: 'Self-Employed', label: 'Self-Employed', count: 76 },
      { value: 'Professional Services', label: 'Professional Services', count: 54 }
    ],
    sentimentPolarity: [
      { value: 'Positive', label: 'Positive', count: 234 },
      { value: 'Neutral', label: 'Neutral', count: 156 },
      { value: 'Negative', label: 'Negative', count: 98 }
    ],
    emotions: [
      { value: 'Joy', label: 'Joy', count: 145 },
      { value: 'Anger', label: 'Anger', count: 89 },
      { value: 'Fear', label: 'Fear', count: 67 },
      { value: 'Sadness', label: 'Sadness', count: 45 }
    ],
    policyAreas: [
      { value: 'Economy', label: 'Economy', count: 198 },
      { value: 'Security', label: 'Security', count: 167 },
      { value: 'Education', label: 'Education', count: 134 },
      { value: 'Health', label: 'Health', count: 123 }
    ],
    engagementLevels: [
      { value: 'High', label: 'High Engagement', count: 89 },
      { value: 'Medium', label: 'Medium Engagement', count: 234 },
      { value: 'Low', label: 'Low Engagement', count: 156 }
    ]
  }), []);

  // Handle filter updates with performance optimization
  const handleFilterUpdate = useCallback((section: keyof OptimizedFilterState, updates: any) => {
    updateFilters(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
    
    if (onFiltersChange) {
      onFiltersChange({ ...filters, [section]: { ...filters[section], ...updates } });
    }
  }, [filters, updateFilters, onFiltersChange]);

  // Performance metrics
  const performanceMetrics = useMemo(() => {
    if (!showPerformanceMetrics) return null;
    
    const componentMetrics = getMetrics();
    const serviceMetrics = getPerformanceReport();
    
    return {
      component: componentMetrics,
      service: serviceMetrics,
      suggestions: optimizationSuggestions
    };
  }, [showPerformanceMetrics, getMetrics, getPerformanceReport, optimizationSuggestions]);

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            Advanced Filters
          </h3>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
            >
              <XMarkIcon className="h-4 w-4" />
              Clear All
            </button>
          )}
        </div>
        {hasActiveFilters && (
          <div className="mt-2 text-sm text-gray-600">
            Active filters applied
          </div>
        )}
      </div>

      {/* Filter Sections */}
      <div className="divide-y divide-gray-200">
        {/* Geographic Filters */}
        <FilterSection
          title="Geographic"
          isExpanded={expandedSections.has('geographic')}
          onToggle={() => toggleSection('geographic')}
          badge={filters.geographic.states.length > 0 ? `${filters.geographic.states.length}` : undefined}
        >
          <div className="space-y-4">
            <OptimizedMultiSelect
              options={filterOptions.states}
              selected={filters.geographic.states}
              onChange={(states) => handleFilterUpdate('geographic', { states })}
              placeholder="Select states..."
            />
            <OptimizedRangeSlider
              min={0}
              max={1}
              value={{ min: filters.geographic.confidenceThreshold, max: 1 }}
              onChange={(range) => handleFilterUpdate('geographic', { confidenceThreshold: range.min })}
              label="Confidence Threshold"
            />
          </div>
        </FilterSection>

        {/* Demographic Filters */}
        <FilterSection
          title="Demographics"
          isExpanded={expandedSections.has('demographic')}
          onToggle={() => toggleSection('demographic')}
          badge={
            (filters.demographic.education.length + filters.demographic.occupation.length) > 0 
              ? `${filters.demographic.education.length + filters.demographic.occupation.length}` 
              : undefined
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Education Level</label>
              <OptimizedMultiSelect
                options={filterOptions.education}
                selected={filters.demographic.education}
                onChange={(education) => handleFilterUpdate('demographic', { education })}
                placeholder="Select education levels..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
              <OptimizedMultiSelect
                options={filterOptions.occupation}
                selected={filters.demographic.occupation}
                onChange={(occupation) => handleFilterUpdate('demographic', { occupation })}
                placeholder="Select occupations..."
              />
            </div>
          </div>
        </FilterSection>

        {/* Sentiment Filters */}
        <FilterSection
          title="Sentiment Analysis"
          isExpanded={expandedSections.has('sentiment')}
          onToggle={() => toggleSection('sentiment')}
          badge={
            (filters.sentiment.polarity.length + filters.sentiment.emotions.length) > 0 
              ? `${filters.sentiment.polarity.length + filters.sentiment.emotions.length}` 
              : undefined
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Polarity</label>
              <OptimizedMultiSelect
                options={filterOptions.sentimentPolarity}
                selected={filters.sentiment.polarity}
                onChange={(polarity) => handleFilterUpdate('sentiment', { polarity })}
                placeholder="Select sentiment polarity..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Emotions</label>
              <OptimizedMultiSelect
                options={filterOptions.emotions}
                selected={filters.sentiment.emotions}
                onChange={(emotions) => handleFilterUpdate('sentiment', { emotions })}
                placeholder="Select emotions..."
              />
            </div>
            <OptimizedRangeSlider
              min={0}
              max={1}
              value={filters.sentiment.intensityRange}
              onChange={(intensityRange) => handleFilterUpdate('sentiment', { intensityRange })}
              label="Intensity Range"
            />
          </div>
        </FilterSection>

        {/* Topic Filters */}
        <FilterSection
          title="Topics & Issues"
          isExpanded={expandedSections.has('topics')}
          onToggle={() => toggleSection('topics')}
          badge={filters.topics.policyAreas.length > 0 ? `${filters.topics.policyAreas.length}` : undefined}
        >
          <div className="space-y-4">
            <OptimizedMultiSelect
              options={filterOptions.policyAreas}
              selected={filters.topics.policyAreas}
              onChange={(policyAreas) => handleFilterUpdate('topics', { policyAreas })}
              placeholder="Select policy areas..."
            />
          </div>
        </FilterSection>

        {/* Engagement Filters */}
        <FilterSection
          title="Engagement Patterns"
          isExpanded={expandedSections.has('engagement')}
          onToggle={() => toggleSection('engagement')}
          badge={filters.engagement.levels.length > 0 ? `${filters.engagement.levels.length}` : undefined}
        >
          <div className="space-y-4">
            <OptimizedMultiSelect
              options={filterOptions.engagementLevels}
              selected={filters.engagement.levels}
              onChange={(levels) => handleFilterUpdate('engagement', { levels })}
              placeholder="Select engagement levels..."
            />
            <OptimizedRangeSlider
              min={0}
              max={1}
              value={filters.engagement.qualityScoreRange}
              onChange={(qualityScoreRange) => handleFilterUpdate('engagement', { qualityScoreRange })}
              label="Quality Score Range"
            />
          </div>
        </FilterSection>
      </div>

      {/* Performance Metrics (Development Only) */}
      {showPerformanceMetrics && performanceMetrics && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Performance Metrics</h4>
          <div className="text-xs text-gray-600 space-y-1">
            <div>Render Time: {performanceMetrics.component.averageRenderTime.toFixed(2)}ms</div>
            <div>Filter Time: {performanceMetrics.service.filterTime.toFixed(2)}ms</div>
            <div>Cache Hit Rate: {(performanceMetrics.service.cacheHitRate * 100).toFixed(1)}%</div>
            {performanceMetrics.suggestions.length > 0 && (
              <div className="mt-2">
                <div className="font-medium">Optimization Suggestions:</div>
                <ul className="list-disc list-inside">
                  {performanceMetrics.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

OptimizedMultiDimensionalFilters.displayName = 'OptimizedMultiDimensionalFilters';

export default OptimizedMultiDimensionalFilters;