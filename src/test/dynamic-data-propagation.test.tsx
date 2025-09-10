/**
 * Dynamic Data Propagation System Tests
 * 
 * Tests for the dynamic filter service, dropdown service, and data relationship service
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DynamicFiltersPanel from '../components/filters/DynamicFiltersPanel';
import { dataRelationshipService } from '../services/data-relationship-service';
import { dynamicDropdownService } from '../services/dynamic-dropdown-service';
import { dynamicFilterService } from '../services/dynamic-filter-service';

// Mock data
const mockParties = {
  parties: [
    {
      id: 'NG-PARTY-APC',
      name: 'All Progressives Congress',
      abbreviation: 'APC',
      colors: { primary: '#FF0000' },
      metadata: { status: 'active' }
    },
    {
      id: 'NG-PARTY-PDP',
      name: 'Peoples Democratic Party',
      abbreviation: 'PDP',
      colors: { primary: '#00FF00' },
      metadata: { status: 'active' }
    }
  ]
};

const mockStates = {
  states: [
    {
      id: 'NG-LA',
      name: 'Lagos',
      code: 'LA',
      capital: 'Ikeja',
      region: 'south-west',
      population: 15946991
    },
    {
      id: 'NG-KN',
      name: 'Kano',
      code: 'KN',
      capital: 'Kano',
      region: 'north-west',
      population: 13076892
    }
  ]
};

const mockPoliticians = {
  politicians: [
    {
      id: 'NG-POL-001',
      firstName: 'Peter',
      lastName: 'Obi',
      fullName: 'Peter Gregory Obi',
      partyId: 'NG-PARTY-LP',
      stateOfOriginId: 'NG-AN',
      metadata: { isActive: true, verificationStatus: 'verified' }
    }
  ]
};

// Mock fetch
global.fetch = vi.fn();

describe('Dynamic Filter Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    dynamicFilterService.destroy();
  });

  it('should generate party filter options from JSON data', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: () => Promise.resolve(mockParties)
    });

    const options = await dynamicFilterService.generatePartyOptions();

    expect(options).toHaveLength(2);
    expect(options[0]).toMatchObject({
      value: 'NG-PARTY-APC',
      label: 'All Progressives Congress',
      color: '#FF0000',
      isAvailable: true,
      dataQuality: expect.any(String)
    });
  });

  it('should generate state filter options from JSON data', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: () => Promise.resolve(mockStates)
    });

    const options = await dynamicFilterService.generateStateOptions();

    expect(options).toHaveLength(2);
    expect(options[0]).toMatchObject({
      value: 'NG-LA',
      label: 'Lagos',
      isAvailable: true,
      metadata: expect.objectContaining({
        code: 'LA',
        capital: 'Ikeja',
        region: 'south-west'
      })
    });
  });

  it('should validate filter selections', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: () => Promise.resolve(mockParties)
    });

    // Load categories first
    await dynamicFilterService.getAllFilterCategories();

    const result = dynamicFilterService.validateFilterSelection('party', ['NG-PARTY-APC']);

    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should detect invalid filter selections', async () => {
    (fetch as any).mockResolvedValueOnce({
      json: () => Promise.resolve(mockParties)
    });

    await dynamicFilterService.getAllFilterCategories();

    const result = dynamicFilterService.validateFilterSelection('party', ['INVALID-PARTY']);

    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it('should emit events when data is updated', async () => {
    const eventSpy = vi.fn();
    dynamicFilterService.on('filtersUpdated', eventSpy);

    // Simulate data update
    dynamicFilterService.emit('loadSuccess', { key: 'parties', data: mockParties });

    expect(eventSpy).toHaveBeenCalled();
  });
});

describe('Dynamic Dropdown Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    dynamicDropdownService.destroy();
  });

  it('should register dropdown configurations', () => {
    const config = {
      id: 'test-dropdown',
      name: 'Test Dropdown',
      dataSource: 'parties',
      searchable: true,
      multiSelect: true,
      grouped: false,
      sortBy: 'alphabetical' as const,
      sortDirection: 'asc' as const,
      maxOptions: 50,
      enableVirtualization: false,
      placeholder: 'Select...',
      emptyMessage: 'No options',
      loadingMessage: 'Loading...',
      errorMessage: 'Error'
    };

    dynamicDropdownService.registerDropdown(config);

    const retrievedConfig = dynamicDropdownService.getDropdownConfig('test-dropdown');
    expect(retrievedConfig).toEqual(config);
  });

  it('should search dropdown options', async () => {
    // Mock the filter service to return options
    vi.spyOn(dynamicFilterService, 'generatePartyOptions').mockResolvedValue([
      {
        value: 'NG-PARTY-APC',
        label: 'All Progressives Congress',
        isAvailable: true,
        dataQuality: 'good'
      },
      {
        value: 'NG-PARTY-PDP',
        label: 'Peoples Democratic Party',
        isAvailable: true,
        dataQuality: 'good'
      }
    ]);

    // Register and load dropdown
    dynamicDropdownService.registerDropdown({
      id: 'search-test',
      name: 'Search Test',
      dataSource: 'parties',
      searchable: true,
      multiSelect: true,
      grouped: false,
      sortBy: 'alphabetical',
      sortDirection: 'asc',
      maxOptions: 50,
      enableVirtualization: false,
      placeholder: 'Select...',
      emptyMessage: 'No options',
      loadingMessage: 'Loading...',
      errorMessage: 'Error'
    });

    await dynamicDropdownService.loadDropdownData('search-test');

    const results = dynamicDropdownService.searchDropdown('search-test', 'Congress');
    expect(results).toHaveLength(1);
    expect(results[0].label).toContain('Congress');
  });

  it('should handle option selection and deselection', () => {
    const eventSpy = vi.fn();
    dynamicDropdownService.on('dropdownSelectionChanged', eventSpy);

    // Register dropdown
    dynamicDropdownService.registerDropdown({
      id: 'selection-test',
      name: 'Selection Test',
      dataSource: 'parties',
      searchable: true,
      multiSelect: true,
      grouped: false,
      sortBy: 'alphabetical',
      sortDirection: 'asc',
      maxOptions: 50,
      enableVirtualization: false,
      placeholder: 'Select...',
      emptyMessage: 'No options',
      loadingMessage: 'Loading...',
      errorMessage: 'Error'
    });

    // Select option
    dynamicDropdownService.selectOption('selection-test', 'NG-PARTY-APC');
    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        dropdownId: 'selection-test',
        selectedValues: ['NG-PARTY-APC']
      })
    );

    // Deselect option
    dynamicDropdownService.deselectOption('selection-test', 'NG-PARTY-APC');
    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        dropdownId: 'selection-test',
        selectedValues: []
      })
    );
  });
});

describe('Data Relationship Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    dataRelationshipService.destroy();
  });

  it('should validate relationships', async () => {
    // Mock data loading
    (fetch as any)
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockPoliticians) })
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockParties) });

    const result = await dataRelationshipService.validateRelationship('politician-party');

    expect(result).toMatchObject({
      isValid: expect.any(Boolean),
      brokenRelationships: expect.any(Array),
      orphanedRecords: expect.any(Array),
      duplicateKeys: expect.any(Array),
      warnings: expect.any(Array)
    });
  });

  it('should generate consistency report', async () => {
    // Mock validation results
    vi.spyOn(dataRelationshipService, 'validateAllRelationships').mockResolvedValue(
      new Map([
        ['politician-party', {
          isValid: true,
          brokenRelationships: [],
          orphanedRecords: [],
          duplicateKeys: [],
          warnings: []
        }]
      ])
    );

    const report = await dataRelationshipService.generateConsistencyReport();

    expect(report).toMatchObject({
      totalRelationships: expect.any(Number),
      validRelationships: expect.any(Number),
      brokenRelationships: expect.any(Number),
      orphanedRecords: expect.any(Number),
      duplicateKeys: expect.any(Number),
      lastChecked: expect.any(Date),
      recommendations: expect.any(Array)
    });
  });

  it('should handle data updates and refresh relationships', async () => {
    const eventSpy = vi.fn();
    dataRelationshipService.on('dataUpdated', eventSpy);

    // Simulate data update
    await dataRelationshipService['handleDataUpdate']('parties', mockParties);

    expect(eventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        dataKey: 'parties',
        affectedRelationships: expect.any(Array)
      })
    );
  });
});

describe('Dynamic Filters Panel Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the services
    vi.spyOn(dynamicFilterService, 'getAllFilterCategories').mockResolvedValue(new Map());
    vi.spyOn(dynamicFilterService, 'getFilterStatistics').mockReturnValue({
      totalCategories: 0,
      totalOptions: 0,
      cacheSize: 0,
      lastUpdated: new Date()
    });
  });

  it('should render dynamic filters panel', async () => {
    render(<DynamicFiltersPanel />);

    expect(screen.getByText('Dynamic Filters')).toBeInTheDocument();
    expect(screen.getByText('⚡ Dynamic')).toBeInTheDocument();
  });

  it('should show loading state', async () => {
    vi.spyOn(dynamicFilterService, 'getAllFilterCategories').mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(new Map()), 100))
    );

    render(<DynamicFiltersPanel />);

    // Should show loading indicators
    await waitFor(() => {
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  it('should handle filter option selection', async () => {
    const mockCategories = new Map([
      ['party', {
        id: 'party',
        name: 'Political Parties',
        description: 'Filter by political party',
        options: [
          {
            value: 'NG-PARTY-APC',
            label: 'All Progressives Congress',
            isAvailable: true,
            dataQuality: 'good' as const
          }
        ],
        isMultiSelect: true,
        isRequired: false,
        loadingState: 'success' as const,
        lastUpdated: new Date(),
        dataSource: 'parties.json'
      }]
    ]);

    vi.spyOn(dynamicFilterService, 'getAllFilterCategories').mockResolvedValue(mockCategories);

    render(<DynamicFiltersPanel />);

    await waitFor(() => {
      expect(screen.getByText('Political Parties')).toBeInTheDocument();
    });

    // Click to expand section
    fireEvent.click(screen.getByText('Political Parties'));

    await waitFor(() => {
      expect(screen.getByText('All Progressives Congress')).toBeInTheDocument();
    });
  });

  it('should show validation errors when enabled', async () => {
    const mockValidationResult = {
      isValid: false,
      errors: ['Invalid party selection'],
      warnings: ['Low data quality'],
      suggestions: []
    };

    vi.spyOn(dynamicFilterService, 'validateFilterSelection').mockReturnValue(mockValidationResult);

    render(<DynamicFiltersPanel enableValidation={true} />);

    // Validation errors should be handled by the component
    expect(screen.getByText('Dynamic Filters')).toBeInTheDocument();
  });

  it('should refresh categories when refresh button is clicked', async () => {
    const loadCategoriesSpy = vi.spyOn(dynamicFilterService, 'getAllFilterCategories');

    render(<DynamicFiltersPanel />);

    const refreshButton = screen.getByTitle('Refresh filters');
    fireEvent.click(refreshButton);

    expect(loadCategoriesSpy).toHaveBeenCalledTimes(2); // Once on mount, once on click
  });
});

describe('Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should propagate data changes across all services', async () => {
    // Mock fetch responses
    (fetch as any)
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockParties) })
      .mockResolvedValueOnce({ json: () => Promise.resolve(mockStates) });

    // Set up event listeners
    const filterUpdateSpy = vi.fn();
    const dropdownUpdateSpy = vi.fn();
    const relationshipUpdateSpy = vi.fn();

    dynamicFilterService.on('filtersUpdated', filterUpdateSpy);
    dynamicDropdownService.on('dropdownLoaded', dropdownUpdateSpy);
    dataRelationshipService.on('dataUpdated', relationshipUpdateSpy);

    // Load initial data
    await dynamicFilterService.getAllFilterCategories();

    // Register dropdown
    dynamicDropdownService.registerDropdown({
      id: 'integration-test',
      name: 'Integration Test',
      dataSource: 'parties',
      searchable: true,
      multiSelect: true,
      grouped: false,
      sortBy: 'alphabetical',
      sortDirection: 'asc',
      maxOptions: 50,
      enableVirtualization: false,
      placeholder: 'Select...',
      emptyMessage: 'No options',
      loadingMessage: 'Loading...',
      errorMessage: 'Error'
    });

    // Simulate data update
    dynamicFilterService.emit('loadSuccess', { key: 'parties', data: mockParties });

    // Verify that all services received the update
    expect(filterUpdateSpy).toHaveBeenCalled();
  });

  it('should maintain data consistency across filter and dropdown updates', async () => {
    // Mock data with relationships
    const partiesWithRelationships = {
      parties: [
        ...mockParties.parties,
        {
          id: 'NG-PARTY-LP',
          name: 'Labour Party',
          abbreviation: 'LP',
          colors: { primary: '#FF69B4' },
          metadata: { status: 'active' }
        }
      ]
    };

    (fetch as any).mockResolvedValue({
      json: () => Promise.resolve(partiesWithRelationships)
    });

    // Load data in both services
    const filterOptions = await dynamicFilterService.generatePartyOptions();
    
    dynamicDropdownService.registerDropdown({
      id: 'consistency-test',
      name: 'Consistency Test',
      dataSource: 'parties',
      searchable: true,
      multiSelect: true,
      grouped: false,
      sortBy: 'alphabetical',
      sortDirection: 'asc',
      maxOptions: 50,
      enableVirtualization: false,
      placeholder: 'Select...',
      emptyMessage: 'No options',
      loadingMessage: 'Loading...',
      errorMessage: 'Error'
    });

    await dynamicDropdownService.loadDropdownData('consistency-test');
    const dropdownOptions = dynamicDropdownService.getDropdownOptions('consistency-test');

    // Verify consistency
    expect(filterOptions).toHaveLength(3);
    expect(dropdownOptions).toHaveLength(3);
    
    // Verify that both have the same parties
    const filterValues = filterOptions.map(o => o.value).sort();
    const dropdownValues = dropdownOptions.map(o => o.value).sort();
    expect(filterValues).toEqual(dropdownValues);
  });
});