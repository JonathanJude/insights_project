/**
 * Dynamic Data Propagation System Example
 * 
 * This example demonstrates the complete dynamic data propagation system
 * including automatic filter generation, dropdown population, and data
 * relationship maintenance.
 */

import React, { useState } from 'react';
import DynamicFiltersPanel from '../components/filters/DynamicFiltersPanel';
import { LoadingStates } from '../constants/enums';
import { useDataRelationships, useDynamicDropdowns, useDynamicFilters } from '../hooks/useDynamicFilters';

const DynamicDataPropagationExample: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'filters' | 'dropdowns' | 'relationships'>('filters');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Dynamic Filters Hook
  const {
    categories,
    loadingState,
    statistics,
    validationResults,
    consistencyReport,
    loadCategories,
    refreshCategory,
    validateSelection,
    getFilterOptions,
    isLoading: filtersLoading,
    hasError: filtersError
  } = useDynamicFilters({
    enableRealTimeUpdates: true,
    enableValidation: true,
    enableRelationshipChecking: true
  });

  // Dynamic Dropdowns Hook
  const {
    dropdowns,
    loadingStates,
    errors,
    loadDropdown,
    searchDropdown,
    selectOption,
    deselectOption,
    getDropdownOptions,
    isDropdownLoading
  } = useDynamicDropdowns([
    'political-parties',
    'nigerian-states',
    'politicians',
    'social-platforms',
    'policy-topics'
  ]);

  // Data Relationships Hook
  const {
    consistencyReport: relationshipReport,
    isValidating,
    statistics: relationshipStats,
    generateReport,
    validateRelationship,
    getRelatedRecord
  } = useDataRelationships();

  const [demoData, setDemoData] = useState({
    selectedParty: '',
    selectedState: '',
    selectedPolitician: '',
    searchQuery: '',
    validationErrors: [] as string[]
  });

  // Demo: Show how data propagates when selections change
  const handlePartySelection = (partyId: string) => {
    setDemoData(prev => ({ ...prev, selectedParty: partyId }));
    
    // Validate selection
    const validation = validateSelection('party', [partyId]);
    if (validation && !validation.isValid) {
      setDemoData(prev => ({ 
        ...prev, 
        validationErrors: validation.errors 
      }));
    } else {
      setDemoData(prev => ({ ...prev, validationErrors: [] }));
    }

    // Get related records
    const relatedState = getRelatedRecord('politician-party', partyId);
    console.log('Related state for party:', relatedState);
  };

  // Demo: Show dropdown search functionality
  const handleSearch = (dropdownId: string, query: string) => {
    setDemoData(prev => ({ ...prev, searchQuery: query }));
    const results = searchDropdown(dropdownId, query);
    console.log(`Search results for "${query}":`, results);
  };

  // Demo: Show relationship validation
  const handleValidateRelationships = async () => {
    await generateReport();
    console.log('Relationship validation completed');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Dynamic Data Propagation System Demo
        </h1>
        <p className="text-gray-600 mb-6">
          This example demonstrates automatic filter generation, dropdown population, 
          and data relationship maintenance in real-time.
        </p>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6">
          {[
            { id: 'filters', label: 'Dynamic Filters', icon: '🔍' },
            { id: 'dropdowns', label: 'Smart Dropdowns', icon: '📋' },
            { id: 'relationships', label: 'Data Relationships', icon: '🔗' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTab === tab.id
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Advanced Options Toggle */}
        <div className="mb-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showAdvanced}
              onChange={(e) => setShowAdvanced(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700">Show advanced features</span>
          </label>
        </div>

        {/* Tab Content */}
        {selectedTab === 'filters' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dynamic Filters Panel */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Dynamic Filters Panel</h3>
                <DynamicFiltersPanel
                  variant="panel"
                  enableRealTimeUpdates={true}
                  enableValidation={true}
                  enableRelationshipChecking={showAdvanced}
                  className="max-h-96"
                />
              </div>

              {/* Filter Statistics */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Filter Statistics</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Categories:</span>
                    <span className="font-medium">{statistics.totalCategories}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Options:</span>
                    <span className="font-medium">{statistics.totalOptions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cache Size:</span>
                    <span className="font-medium">{statistics.cacheSize} items</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Loading State:</span>
                    <span className={`font-medium ${
                      filtersLoading ? 'text-blue-600' : 
                      filtersError ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {filtersLoading ? 'Loading...' : 
                       filtersError ? 'Error' : 'Ready'}
                    </span>
                  </div>
                </div>

                {/* Validation Results */}
                {showAdvanced && validationResults.size > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Validation Results</h4>
                    <div className="space-y-2">
                      {Array.from(validationResults.entries()).map(([categoryId, result]) => (
                        <div key={categoryId} className="text-sm">
                          <span className="font-medium">{categoryId}:</span>
                          <span className={`ml-2 ${result.isValid ? 'text-green-600' : 'text-red-600'}`}>
                            {result.isValid ? '✓ Valid' : `✗ ${result.errors.length} errors`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Demo Controls */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium mb-3">Interactive Demo</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Party
                  </label>
                  <select
                    value={demoData.selectedParty}
                    onChange={(e) => handlePartySelection(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Choose a party...</option>
                    {getFilterOptions('party').map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select State
                  </label>
                  <select
                    value={demoData.selectedState}
                    onChange={(e) => setDemoData(prev => ({ ...prev, selectedState: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="">Choose a state...</option>
                    {getFilterOptions('state').map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Actions
                  </label>
                  <button
                    onClick={loadCategories}
                    disabled={filtersLoading}
                    className="w-full px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                  >
                    {filtersLoading ? 'Loading...' : 'Refresh Filters'}
                  </button>
                </div>
              </div>

              {/* Validation Errors */}
              {demoData.validationErrors.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <h5 className="font-medium text-red-800 mb-1">Validation Errors:</h5>
                  <ul className="text-sm text-red-700 list-disc list-inside">
                    {demoData.validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {selectedTab === 'dropdowns' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dropdown Examples */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Smart Dropdowns</h3>
                <div className="space-y-4">
                  {['political-parties', 'nigerian-states', 'politicians'].map((dropdownId) => (
                    <div key={dropdownId}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {dropdownId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={`Search ${dropdownId.replace('-', ' ')}...`}
                          onChange={(e) => handleSearch(dropdownId, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm pr-10"
                        />
                        {isDropdownLoading(dropdownId) && (
                          <div className="absolute right-3 top-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                      </div>
                      
                      {/* Dropdown Options Preview */}
                      <div className="mt-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md">
                        {getDropdownOptions(dropdownId).slice(0, 5).map((option) => (
                          <div
                            key={option.value}
                            className="px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                            onClick={() => selectOption(dropdownId, option.value)}
                          >
                            <div className="flex items-center space-x-2">
                              {option.color && (
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: option.color }}
                                />
                              )}
                              <span>{option.label}</span>
                              {option.badge && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">
                                  {option.badge}
                                </span>
                              )}
                            </div>
                            {option.description && (
                              <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dropdown Statistics */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Dropdown Statistics</h3>
                <div className="space-y-4">
                  {Array.from(dropdowns.entries()).map(([dropdownId, state]) => (
                    <div key={dropdownId} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium mb-2">{dropdownId}</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Options:</span>
                          <span>{state.options.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Filtered Options:</span>
                          <span>{state.filteredOptions.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Selected:</span>
                          <span>{state.selectedValues.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Groups:</span>
                          <span>{state.groups.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Status:</span>
                          <span className={`${
                            state.loadingState === LoadingStates.LOADING ? 'text-blue-600' :
                            state.loadingState === LoadingStates.ERROR ? 'text-red-600' :
                            'text-green-600'
                          }`}>
                            {state.loadingState === LoadingStates.LOADING ? 'Loading' :
                             state.loadingState === LoadingStates.ERROR ? 'Error' :
                             'Ready'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'relationships' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Relationship Status */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Data Relationships</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Relationships:</span>
                    <span className="font-medium">{relationshipStats.totalRelationships}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cached Relationships:</span>
                    <span className="font-medium">{relationshipStats.cachedRelationships}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Validated:</span>
                    <span className="font-medium">{relationshipStats.validatedRelationships}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Entities Loaded:</span>
                    <span className="font-medium">{relationshipStats.entitiesLoaded}</span>
                  </div>
                </div>

                <button
                  onClick={handleValidateRelationships}
                  disabled={isValidating}
                  className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isValidating ? 'Validating...' : 'Validate Relationships'}
                </button>
              </div>

              {/* Consistency Report */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Consistency Report</h3>
                {relationshipReport ? (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Valid Relationships:</span>
                      <span className="font-medium text-green-600">
                        {relationshipReport.validRelationships}/{relationshipReport.totalRelationships}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Broken Relationships:</span>
                      <span className={`font-medium ${relationshipReport.brokenRelationships > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {relationshipReport.brokenRelationships}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Orphaned Records:</span>
                      <span className={`font-medium ${relationshipReport.orphanedRecords > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                        {relationshipReport.orphanedRecords}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Duplicate Keys:</span>
                      <span className={`font-medium ${relationshipReport.duplicateKeys > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {relationshipReport.duplicateKeys}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Last checked: {relationshipReport.lastChecked.toLocaleString()}
                    </div>

                    {/* Recommendations */}
                    {relationshipReport.recommendations.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-medium text-sm mb-2">Recommendations:</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          {relationshipReport.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start space-x-2">
                              <span className="text-orange-500 mt-0.5">⚠</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                    No consistency report available. Click "Validate Relationships" to generate one.
                  </div>
                )}
              </div>
            </div>

            {/* Relationship Demo */}
            {showAdvanced && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium mb-3">Relationship Demo</h4>
                <p className="text-sm text-gray-600 mb-4">
                  This demonstrates how data relationships are automatically maintained and validated.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Test Relationship
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option value="">Select relationship to test...</option>
                      <option value="politician-party">Politician → Party</option>
                      <option value="politician-state">Politician → State</option>
                      <option value="lga-state">LGA → State</option>
                      <option value="ward-lga">Ward → LGA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Action
                    </label>
                    <button
                      onClick={() => validateRelationship('politician-party')}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                    >
                      Validate Selected
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="font-medium text-green-800">Dynamic Filters</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              {statistics.totalCategories} categories loaded with {statistics.totalOptions} options
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="font-medium text-blue-800">Smart Dropdowns</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              {dropdowns.size} dropdowns active with real-time updates
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="font-medium text-purple-800">Data Relationships</span>
            </div>
            <p className="text-sm text-purple-700 mt-1">
              {relationshipStats.totalRelationships} relationships monitored
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicDataPropagationExample;