import { fireEvent, render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import FilterBar from '../components/filters/FilterBar';
import FilterIndicator from '../components/filters/FilterIndicator';
import FilterSummary from '../components/filters/FilterSummary';
import { useFilterStore } from '../stores/filterStore';
import { PoliticalParty, SocialPlatform } from '../types';

// Mock the filter store
vi.mock('../stores/filterStore');

const mockFilterStore = {
  searchQuery: '',
  selectedParties: [],
  selectedStates: [],
  selectedPlatforms: [],
  selectedGenders: [],
  selectedAgeGroups: [],
  selectedLevels: [],
  dateRange: { start: '', end: '' },
  sortBy: 'relevance' as const,
  sortOrder: 'desc' as const,
  setSearchQuery: vi.fn(),
  setSelectedParties: vi.fn(),
  setSelectedStates: vi.fn(),
  setSelectedPlatforms: vi.fn(),
  setSelectedGenders: vi.fn(),
  setSelectedAgeGroups: vi.fn(),
  setSelectedLevels: vi.fn(),
  setDateRange: vi.fn(),
  setSortBy: vi.fn(),
  setSortOrder: vi.fn(),
  clearAllFilters: vi.fn(),
  clearSearchQuery: vi.fn(),
  setPresetDateRange: vi.fn(),
  toggleParty: vi.fn(),
  toggleState: vi.fn(),
  togglePlatform: vi.fn(),
  toggleGender: vi.fn(),
  toggleAgeGroup: vi.fn(),
  toggleLevel: vi.fn(),
  hasActiveFilters: vi.fn(() => false),
  getActiveFilterCount: vi.fn(() => 0)
};

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('Enhanced Filter System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useFilterStore as any).mockReturnValue(mockFilterStore);
  });

  describe('FilterBar Component', () => {
    it('renders filter button and sort options', () => {
      renderWithRouter(<FilterBar />);
      
      expect(screen.getByText('Filters')).toBeInTheDocument();
      expect(screen.getByText('Sort by:')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Relevance')).toBeInTheDocument();
    });

    it('shows active filter count when filters are applied', () => {
      const storeWithFilters = {
        ...mockFilterStore,
        hasActiveFilters: vi.fn(() => true),
        getActiveFilterCount: vi.fn(() => 3),
        selectedParties: [PoliticalParty.APC, PoliticalParty.PDP]
      };
      (useFilterStore as any).mockReturnValue(storeWithFilters);

      renderWithRouter(<FilterBar />);
      
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('calls setSortBy when sort option changes', () => {
      renderWithRouter(<FilterBar />);
      
      const sortSelect = screen.getByDisplayValue('Relevance');
      fireEvent.change(sortSelect, { target: { value: 'sentiment' } });
      
      expect(mockFilterStore.setSortBy).toHaveBeenCalledWith('sentiment');
    });

    it('toggles sort order when sort direction button is clicked', () => {
      renderWithRouter(<FilterBar />);
      
      const sortButton = screen.getByTitle('Sort ascending');
      fireEvent.click(sortButton);
      
      expect(mockFilterStore.setSortOrder).toHaveBeenCalledWith('asc');
    });
  });

  describe('FilterIndicator Component', () => {
    it('renders nothing when no filters are active', () => {
      const { container } = renderWithRouter(<FilterIndicator />);
      expect(container.firstChild).toBeNull();
    });

    it('displays active filters as chips', () => {
      const storeWithFilters = {
        ...mockFilterStore,
        hasActiveFilters: vi.fn(() => true),
        getActiveFilterCount: vi.fn(() => 2),
        searchQuery: 'test query',
        selectedParties: [PoliticalParty.APC],
        selectedPlatforms: [SocialPlatform.TWITTER]
      };
      (useFilterStore as any).mockReturnValue(storeWithFilters);

      renderWithRouter(<FilterIndicator />);
      
      expect(screen.getByText('Search: "test query"')).toBeInTheDocument();
      expect(screen.getByText('APC')).toBeInTheDocument();
      expect(screen.getByText('Twitter/X')).toBeInTheDocument();
    });

    it('calls appropriate toggle functions when filter chips are removed', () => {
      const storeWithFilters = {
        ...mockFilterStore,
        hasActiveFilters: vi.fn(() => true),
        getActiveFilterCount: vi.fn(() => 1),
        selectedParties: [PoliticalParty.APC]
      };
      (useFilterStore as any).mockReturnValue(storeWithFilters);

      renderWithRouter(<FilterIndicator />);
      
      const removeButton = screen.getByLabelText('Remove APC filter');
      fireEvent.click(removeButton);
      
      expect(mockFilterStore.toggleParty).toHaveBeenCalledWith(PoliticalParty.APC);
    });

    it('shows clear all button and calls clearAllFilters when clicked', () => {
      const storeWithFilters = {
        ...mockFilterStore,
        hasActiveFilters: vi.fn(() => true),
        getActiveFilterCount: vi.fn(() => 3),
        selectedParties: [PoliticalParty.APC, PoliticalParty.PDP]
      };
      (useFilterStore as any).mockReturnValue(storeWithFilters);

      renderWithRouter(<FilterIndicator />);
      
      const clearAllButton = screen.getByText('Clear all (3)');
      fireEvent.click(clearAllButton);
      
      expect(mockFilterStore.clearAllFilters).toHaveBeenCalled();
    });
  });

  describe('FilterSummary Component', () => {
    it('shows empty state when no filters are active', () => {
      renderWithRouter(<FilterSummary />);
      
      expect(screen.getByText('No filters applied')).toBeInTheDocument();
      expect(screen.getByText('Use the filters panel to narrow down your search results')).toBeInTheDocument();
    });

    it('displays filter summary when filters are active', () => {
      const storeWithFilters = {
        ...mockFilterStore,
        hasActiveFilters: vi.fn(() => true),
        getActiveFilterCount: vi.fn(() => 3),
        searchQuery: 'test',
        selectedParties: [PoliticalParty.APC, PoliticalParty.PDP],
        selectedPlatforms: [SocialPlatform.TWITTER],
        sortBy: 'sentiment' as const,
        sortOrder: 'desc' as const
      };
      (useFilterStore as any).mockReturnValue(storeWithFilters);

      renderWithRouter(<FilterSummary />);
      
      expect(screen.getByText('Active Filters (3)')).toBeInTheDocument();
      expect(screen.getByText('Search:')).toBeInTheDocument();
      expect(screen.getByText('"test"')).toBeInTheDocument();
      expect(screen.getByText('Parties:')).toBeInTheDocument();
      expect(screen.getByText('APC, PDP')).toBeInTheDocument();
      expect(screen.getByText('Platforms:')).toBeInTheDocument();
      expect(screen.getByText('Twitter/X')).toBeInTheDocument();
      expect(screen.getByText('Sort:')).toBeInTheDocument();
    });

    it('truncates long filter lists', () => {
      const storeWithFilters = {
        ...mockFilterStore,
        hasActiveFilters: vi.fn(() => true),
        getActiveFilterCount: vi.fn(() => 1),
        selectedParties: [PoliticalParty.APC, PoliticalParty.PDP, PoliticalParty.LP, PoliticalParty.NNPP]
      };
      (useFilterStore as any).mockReturnValue(storeWithFilters);

      renderWithRouter(<FilterSummary />);
      
      expect(screen.getByText('APC, PDP and 2 more')).toBeInTheDocument();
    });

    it('calls clearAllFilters when Clear All button is clicked', () => {
      const storeWithFilters = {
        ...mockFilterStore,
        hasActiveFilters: vi.fn(() => true),
        getActiveFilterCount: vi.fn(() => 2),
        selectedParties: [PoliticalParty.APC]
      };
      (useFilterStore as any).mockReturnValue(storeWithFilters);

      renderWithRouter(<FilterSummary />);
      
      const clearAllButton = screen.getByText('Clear All');
      fireEvent.click(clearAllButton);
      
      expect(mockFilterStore.clearAllFilters).toHaveBeenCalled();
    });
  });

  describe('Filter Persistence', () => {
    it('maintains filter state across component re-renders', () => {
      const storeWithFilters = {
        ...mockFilterStore,
        hasActiveFilters: vi.fn(() => true),
        selectedParties: [PoliticalParty.APC]
      };
      (useFilterStore as any).mockReturnValue(storeWithFilters);

      const { rerender } = renderWithRouter(<FilterIndicator />);
      
      expect(screen.getByText('APC')).toBeInTheDocument();
      
      // Rerender component
      rerender(
        <BrowserRouter>
          <FilterIndicator />
        </BrowserRouter>
      );
      
      expect(screen.getByText('APC')).toBeInTheDocument();
    });
  });

  describe('Filter Combinations', () => {
    it('handles multiple filter types simultaneously', () => {
      const storeWithMultipleFilters = {
        ...mockFilterStore,
        hasActiveFilters: vi.fn(() => true),
        getActiveFilterCount: vi.fn(() => 4),
        searchQuery: 'politician',
        selectedParties: [PoliticalParty.APC],
        selectedPlatforms: [SocialPlatform.TWITTER, SocialPlatform.FACEBOOK],
        dateRange: { start: '2024-01-01', end: '2024-01-31' }
      };
      (useFilterStore as any).mockReturnValue(storeWithMultipleFilters);

      renderWithRouter(<FilterIndicator />);
      
      expect(screen.getByText('Search: "politician"')).toBeInTheDocument();
      expect(screen.getByText('APC')).toBeInTheDocument();
      expect(screen.getByText('Twitter/X')).toBeInTheDocument();
      expect(screen.getByText('Facebook')).toBeInTheDocument();
      expect(screen.getByText('2024-01-01 to 2024-01-31')).toBeInTheDocument();
    });
  });
});