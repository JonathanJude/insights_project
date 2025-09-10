/**
 * Dynamic Filters Panel Component
 * 
 * Enhanced filter panel that uses the dynamic filter service for
 * automatic option generation, real-time updates, and validation.
 */

import React, { useState } from 'react';
import { INFO_MESSAGES } from '../../constants/messages';
import { useDynamicDropdowns, useDynamicFilters } from '../../hooks/useDynamicFilters';
import { useFilterStore } from '../../stores/filterStore';

interface DynamicFiltersPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
  showSummary?: boolean;
  variant?: 'panel' | 'sidebar' | 'modal';
  enableRealTimeUpdates?: boolean;
  enableValidation?: boolean;
  enableRelationshipChecking?: boolean;
  maxOptionsPerCategory?: number;
}

const DynamicFiltersPanel: React.FC<DynamicFiltersPanelProps> = ({
  isOpen = true,
  onClose,
  className = "",
  showSummary = false,
  variant = 'panel',
  enableRealTimeUpdates = true,
  enableValidation = true,
  enableRelationshipChecking = false,
  maxOptionsPerCategory = 50
}) => {
  const {
    categories,
    loadingState,
    error,
    statistics,
    validationResults,
    consistencyReport,
    loadCategories,
    refreshCategory,
    validateSelection,
    getFilterOptions,
    isCategoryLoading,
    getCategoryError,
    isLoading,
    hasError,
    isReady
  } = useDynamicFilters({
    enableRealTimeUpdates,
    enableValidation,
    enableRelationshipChecking,
    autoLoadCategories: true
  });

  const {
    getDropdownOptions,
    searchDropdown,
    selectOption,
    deselectOption,
    isDropdownLoading,
    getDropdownError
  } = useDynamicDropdowns([
    'political-parties',
    'nigerian-states',
    'politicians',
    'social-platforms',
    'policy-topics'
  ]);

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
    setDateRange,
    clearAllFilters,
    hasActiveFilters,
    getActiveFilterCount
  } = useFilterStore();

  const [expandedSections, setExpandedSections] = useState({
    parties: true,
    states: false,
    platforms: true,
    politicians: false,
    topics: false,
    demographics: false,
    dateRange: true
  });

  const [searchQueries, setSearchQueries] = useState<Record<string, string>>({});
  const [showValidationErrors, setShowValidationErrors] = useState(true);
  const [showDataQualityInfo, setShowDataQualityInfo] = useState(false);

  // Handle search input changes
  const handleSearch = (categoryId: string, query: string) => {
    setSearchQueries(prev => ({ ...prev, [categoryId]: query }));
    
    // Search in dropdown if available
    const dropdownId = getCategoryDropdownId(categoryId);
    if (dropdownId) {
      searchDropdown(dropdownId, query);
    }
  };

  // Map category IDs to dropdown IDs
  const getCategoryDropdownId = (categoryId: string): string | null => {
    const mappings: Record<string, string> = {
      'party': 'political-parties',
      'state': 'nigerian-states',
      'politician': 'politicians',
      'platform': 'social-platforms',
      'topic': 'policy-topics'
    };
    return mappings[categoryId] || null;
  };

  // Get filtered options for a category
  const getFilteredOptions = (categoryId: string) => {
    const dropdownId = getCategoryDropdownId(categoryId);
    if (dropdownId) {
      return getDropdownOptions(dropdownId);
    }
    
    const options = getFilterOptions(categoryId);
    const query = searchQueries[categoryId];
    
    if (!query) return options.slice(0, maxOptionsPerCategory);
    
    const searchTerm = query.toLowerCase();
    return options
      .filter(option => 
        option.label.toLowerCase().includes(searchTerm) ||
        option.description?.toLowerCase().includes(searchTerm)
      )
      .slice(0, maxOptionsPerCategory);
  };

  // Handle option selection
  const handleOptionToggle = (categoryId: string, value: string) => {
    // Validate selection if enabled
    if (enableValidation) {
      const currentSelections = getCurrentSelections(categoryId);
      const newSelections = currentSelections.includes(value)
        ? currentSelections.filter(v => v !== value)
        : [...currentSelections, value];
      
      validateSelection(categoryId, newSelections);
    }

    // Update filter store based on category
    switch (categoryId) {
      case 'party':
        toggleParty(value as any);
        break;
      case 'state':
        toggleState(value as any);
        break;
      case 'platform':
        togglePlatform(value as any);
        break;
      default:
        console.warn(`Unknown category: ${categoryId}`);
    }
  };

  // Get current selections for a category
  const getCurrentSelections = (categoryId: string): string[] => {
    switch (categoryId) {
      case 'party':
        return selectedParties;
      case 'state':
        return selectedStates;
      case 'platform':
        return selectedPlatforms;
      default:
        return [];
    }
  };

  // Check if option is selected
  const isOptionSelected = (categoryId: string, value: string): boolean => {
    return getCurrentSelections(categoryId).includes(value);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const FilterSection: React.FC<{
    categoryId: string;
    title: string;
    isExpanded: boolean;
    onToggle: () => void;
    searchable?: boolean;
    children?: React.ReactNode;
  }> = ({ categoryId, title, isExpanded, onToggle, searchable = true, children }) => {
    const options = getFilteredOptions(categoryId);
    const selectedCount = getCurrentSelections(categoryId).length;
    const isLoading = isCategoryLoading(categoryId);
    const error = getCategoryError(categoryId);
    const validationResult = validationResults.get(categoryId);
    const dropdownId = getCategoryDropdownId(categoryId);
    const dropdownError = dropdownId ? getDropdownError(dropdownId) : null;

    return (
      <div className="border-b border-gray-200 last:border-b-0">
        <button
          onClick={onToggle}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900">{title}</span>
            {selectedCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {selectedCount}
              </span>
            )}
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            )}
            {(error || dropdownError) && (
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
            {validationResult && !validationResult.isValid && showValidationErrors && (
              <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">{options.length} options</span>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>
        
        {isExpanded && (
          <div className="px-4 pb-4">
            {/* Error Display */}
            {(error || dropdownError) && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {error || dropdownError}
                <button
                  onClick={() => refreshCategory(categoryId)}
                  className="ml-2 text-red-600 hover:text-red-800 underline"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Validation Errors */}
            {validationResult && !validationResult.isValid && showValidationErrors && (
              <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded text-sm">
                {validationResult.errors.length > 0 && (
                  <div className="text-orange-700 mb-1">
                    <strong>Errors:</strong>
                    <ul className="list-disc list-inside">
                      {validationResult.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {validationResult.warnings.length > 0 && (
                  <div className="text-orange-600">
                    <strong>Warnings:</strong>
                    <ul className="list-disc list-inside">
                      {validationResult.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Search Input */}
            {searchable && options.length > 10 && (
              <div className="mb-3">
                <input
                  type="text"
                  placeholder={`Search ${title.toLowerCase()}...`}
                  value={searchQueries[categoryId] || ''}
                  onChange={(e) => handleSearch(categoryId, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">{INFO_MESSAGES.LOADING_DATA}</p>
              </div>
            )}

            {/* Options List */}
            {!isLoading && options.length > 0 && (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {options.map((option) => (
                  <FilterOption
                    key={option.value}
                    option={option}
                    isSelected={isOptionSelected(categoryId, option.value)}
                    onToggle={() => handleOptionToggle(categoryId, option.value)}
                    showDataQuality={showDataQualityInfo}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && options.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No options available</p>
                {searchQueries[categoryId] && (
                  <button
                    onClick={() => handleSearch(categoryId, '')}
                    className="text-blue-600 hover:text-blue-800 text-sm underline mt-1"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}

            {children}
          </div>
        )}
      </div>
    );
  };

  const FilterOption: React.FC<{
    option: any;
    isSelected: boolean;
    onToggle: () => void;
    showDataQuality: boolean;
  }> = ({ option, isSelected, onToggle, showDataQuality }) => (
    <label
      className={`flex items-center space-x-3 py-2 cursor-pointer hover:bg-gray-50 rounded px-2 -mx-2 transition-colors ${
        !option.isAvailable ? 'opacity-50' : ''
      }`}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggle}
        disabled={!option.isAvailable}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      {option.color && (
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: option.color }}
        />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-900">{option.label}</span>
          {option.count !== undefined && option.count > 0 && (
            <span className="text-xs text-gray-500">({option.count})</span>
          )}
          {showDataQuality && (
            <span className={`text-xs px-1 rounded ${
              option.dataQuality === 'excellent' ? 'bg-green-100 text-green-800' :
              option.dataQuality === 'good' ? 'bg-blue-100 text-blue-800' :
              option.dataQuality === 'fair' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {option.dataQuality}
            </span>
          )}
        </div>
        {option.description && (
          <div className="text-xs text-gray-500">{option.description}</div>
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

  return (
    <div className={`${containerClasses[variant]} ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-medium text-gray-900">Dynamic Filters</h3>
          {hasActiveFilters() && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {getActiveFilterCount()}
            </span>
          )}
          <span className="bg-gradient-to-r from-green-100 to-blue-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
            ⚡ Dynamic
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {/* Settings */}
          <div className="relative group">
            <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="p-2 space-y-1">
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showValidationErrors}
                    onChange={(e) => setShowValidationErrors(e.target.checked)}
                    className="h-3 w-3"
                  />
                  <span>Show validation errors</span>
                </label>
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showDataQualityInfo}
                    onChange={(e) => setShowDataQualityInfo(e.target.checked)}
                    className="h-3 w-3"
                  />
                  <span>Show data quality</span>
                </label>
              </div>
            </div>
          </div>

          {/* Refresh */}
          <button
            onClick={loadCategories}
            disabled={isLoading}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
            title="Refresh filters"
          >
            <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Clear All */}
          {hasActiveFilters() && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-600 hover:text-red-700 transition-colors font-medium"
            >
              Clear all
            </button>
          )}

          {/* Close */}
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

      {/* Statistics */}
      {isReady && (
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>{statistics.totalCategories} categories, {statistics.totalOptions} options</span>
            <span>Cache: {statistics.cacheSize} items</span>
          </div>
        </div>
      )}

      {/* Global Error */}
      {hasError && (
        <div className="px-4 py-3 bg-red-50 border-b border-red-200">
          <div className="flex items-center space-x-2 text-red-700">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">{error}</span>
            <button
              onClick={loadCategories}
              className="text-red-600 hover:text-red-800 underline text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Consistency Report */}
      {enableRelationshipChecking && consistencyReport && (
        <div className="px-4 py-2 bg-blue-50 border-b border-blue-200">
          <div className="text-xs text-blue-700">
            Data consistency: {consistencyReport.validRelationships}/{consistencyReport.totalRelationships} relationships valid
            {consistencyReport.recommendations.length > 0 && (
              <span className="ml-2 text-blue-600">({consistencyReport.recommendations.length} issues)</span>
            )}
          </div>
        </div>
      )}

      {/* Filter Sections */}
      <div className={`${variant === 'modal' ? 'max-h-[60vh]' : 'max-h-96'} overflow-y-auto`}>
        <FilterSection
          categoryId="party"
          title="Political Parties"
          isExpanded={expandedSections.parties}
          onToggle={() => toggleSection('parties')}
        />

        <FilterSection
          categoryId="state"
          title="States"
          isExpanded={expandedSections.states}
          onToggle={() => toggleSection('states')}
        />

        <FilterSection
          categoryId="platform"
          title="Social Platforms"
          isExpanded={expandedSections.platforms}
          onToggle={() => toggleSection('platforms')}
        />

        <FilterSection
          categoryId="politician"
          title="Politicians"
          isExpanded={expandedSections.politicians}
          onToggle={() => toggleSection('politicians')}
        />

        <FilterSection
          categoryId="topic"
          title="Policy Topics"
          isExpanded={expandedSections.topics}
          onToggle={() => toggleSection('topics')}
        />

        {/* Date Range Section */}
        <div className="border-b border-gray-200 last:border-b-0">
          <button
            onClick={() => toggleSection('dateRange')}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">Date Range</span>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${expandedSections.dateRange ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandedSections.dateRange && (
            <div className="px-4 pb-4">
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.start || ''}
                    onChange={(e) => setDateRange(e.target.value, dateRange.end)}
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
                    onChange={(e) => setDateRange(dateRange.start, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      {hasActiveFilters() && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} applied
            </div>
            <button
              onClick={clearAllFilters}
              className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
            >
              Clear all
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicFiltersPanel;