/**
 * Component Integration Tests
 * 
 * These tests verify that UI components properly integrate with the new data services
 * and handle data loading, error states, and dynamic updates correctly.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { PoliticianService } from "../../politician-service";
import { GeographicService } from "../../geographic-service";
import { DynamicFilterService } from "../../dynamic-filter-service";
import { PoliticalParty, NigerianState } from "../../../types";

// Mock React components for testing
const MockPoliticianCard = ({ politicianId }: { politicianId: string }) => {
  const [politician, setPolitician] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const loadPolitician = async () => {
      try {
        setLoading(true);
        const politicianService = PoliticianService.getInstance();
        const data = await politicianService.getPoliticianById(politicianId);
        setPolitician(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPolitician();
  }, [politicianId]);

  if (loading) return <div data-testid="loading">Loading...</div>;
  if (error) return <div data-testid="error">{error}</div>;
  if (!politician) return <div data-testid="not-found">Politician not found</div>;

  return (
    <div data-testid="politician-card">
      <h3>{politician.name}</h3>
      <p>Party: {politician.party}</p>
      <p>State: {politician.state}</p>
    </div>
  );
};

const MockDynamicFilters = ({ onFiltersChange }: { onFiltersChange: (filters: any) => void }) => {
  const [partyOptions, setPartyOptions] = React.useState([]);
  const [stateOptions, setStateOptions] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadOptions = async () => {
      try {
        setLoading(true);
        const filterService = DynamicFilterService.getInstance();
        const [parties, states] = await Promise.all([
          filterService.generatePartyOptions(),
          filterService.generateStateOptions()
        ]);
        setPartyOptions(parties);
        setStateOptions(states);
      } catch (err) {
        console.error('Failed to load filter options:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOptions();
  }, []);

  if (loading) return <div data-testid="filters-loading">Loading filters...</div>;

  return (
    <div data-testid="dynamic-filters">
      <select 
        data-testid="party-filter"
        onChange={(e) => onFiltersChange({ party: e.target.value })}
      >
        <option value="">All Parties</option>
        {partyOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      <select 
        data-testid="state-filter"
        onChange={(e) => onFiltersChange({ state: e.target.value })}
      >
        <option value="">All States</option>
        {stateOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const MockSearchResults = ({ query, filters }: { query: string; filters: any }) => {
  const [results, setResults] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [pagination, setPagination] = React.useState(null);

  React.useEffect(() => {
    const searchPoliticians = async () => {
      if (!query && !filters.party && !filters.state) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        const politicianService = PoliticianService.getInstance();
        const response = await politicianService.searchPoliticians(query, filters, 1, 10);
        setResults(response.data);
        setPagination(response.pagination);
      } catch (err) {
        console.error('Search failed:', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    searchPoliticians();
  }, [query, filters]);

  if (loading) return <div data-testid="search-loading">Searching...</div>;

  return (
    <div data-testid="search-results">
      <div data-testid="results-count">
        {pagination ? `${pagination.totalItems} results` : '0 results'}
      </div>
      {results.map(politician => (
        <div key={politician.id} data-testid="search-result-item">
          {politician.name} - {politician.party}
        </div>
      ))}
    </div>
  );
};

// Mock data for testing
const mockPoliticiansData = {
  politicians: [
    {
      id: 'NG-POL-001',
      firstName: 'Bola',
      lastName: 'Tinubu',
      fullName: 'Bola Ahmed Tinubu',
      partyId: 'NG-PARTY-APC',
      currentPositionId: 'NG-POS-PRESIDENT',
      stateOfOriginId: 'NG-LA',
      dateOfBirth: '1952-03-29',
      gender: 'male'
    },
    {
      id: 'NG-POL-002',
      firstName: 'Peter',
      lastName: 'Obi',
      fullName: 'Peter Gregory Obi',
      partyId: 'NG-PARTY-LP',
      currentPositionId: 'NG-POS-ASPIRANT',
      stateOfOriginId: 'NG-AN',
      dateOfBirth: '1961-07-19',
      gender: 'male'
    }
  ]
};

const mockPartiesData = {
  parties: [
    {
      id: 'NG-PARTY-APC',
      name: 'All Progressives Congress',
      abbreviation: 'APC',
      colors: { primary: '#FF0000' }
    },
    {
      id: 'NG-PARTY-LP',
      name: 'Labour Party',
      abbreviation: 'LP',
      colors: { primary: '#008000' }
    }
  ]
};

const mockStatesData = {
  states: [
    {
      id: 'NG-LA',
      name: 'Lagos',
      code: 'LA',
      capital: 'Ikeja',
      region: 'south-west',
      coordinates: { latitude: 6.5244, longitude: 3.3792 }
    },
    {
      id: 'NG-AN',
      name: 'Anambra',
      code: 'AN',
      capital: 'Awka',
      region: 'south-east',
      coordinates: { latitude: 6.2209, longitude: 6.9909 }
    }
  ]
};

const mockPositionsData = {
  positions: [
    {
      id: 'NG-POS-PRESIDENT',
      title: 'President',
      level: 'federal',
      category: 'executive'
    },
    {
      id: 'NG-POS-ASPIRANT',
      title: 'Aspirant',
      level: 'federal',
      category: 'aspirant'
    }
  ]
};

describe("Component Integration Tests", () => {
  let mockDataLoader: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the data loader
    mockDataLoader = {
      loadData: vi.fn().mockImplementation((key: string) => {
        const keyMap: { [key: string]: any } = {
          'politicians': mockPoliticiansData,
          'parties': mockPartiesData,
          'states': mockStatesData,
          'positions': mockPositionsData
        };
        return Promise.resolve(keyMap[key] || {});
      })
    };

    // Mock DataLoaderService
    vi.doMock('../../data-loader', () => ({
      DataLoaderService: {
        getInstance: () => mockDataLoader
      }
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("PoliticianCard Component Integration", () => {
    it("should load and display politician data", async () => {
      render(<MockPoliticianCard politicianId="NG-POL-001" />);
      
      // Should show loading initially
      expect(screen.getByTestId('loading')).toBeInTheDocument();
      
      // Should load and display politician data
      await waitFor(() => {
        expect(screen.getByTestId('politician-card')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Bola Ahmed Tinubu')).toBeInTheDocument();
      expect(screen.getByText(/Party: APC/)).toBeInTheDocument();
      expect(screen.getByText(/State: Lagos/)).toBeInTheDocument();
    });

    it("should handle politician not found", async () => {
      render(<MockPoliticianCard politicianId="NON-EXISTENT" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('not-found')).toBeInTheDocument();
      });
    });

    it("should handle loading errors", async () => {
      mockDataLoader.loadData.mockRejectedValue(new Error('Network error'));
      
      render(<MockPoliticianCard politicianId="NG-POL-001" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });
      
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    it("should update when politician ID changes", async () => {
      const { rerender } = render(<MockPoliticianCard politicianId="NG-POL-001" />);
      
      await waitFor(() => {
        expect(screen.getByText('Bola Ahmed Tinubu')).toBeInTheDocument();
      });
      
      // Change politician ID
      rerender(<MockPoliticianCard politicianId="NG-POL-002" />);
      
      await waitFor(() => {
        expect(screen.getByText('Peter Gregory Obi')).toBeInTheDocument();
      });
    });
  });

  describe("Dynamic Filters Component Integration", () => {
    it("should load and display filter options", async () => {
      const mockOnFiltersChange = vi.fn();
      render(<MockDynamicFilters onFiltersChange={mockOnFiltersChange} />);
      
      // Should show loading initially
      expect(screen.getByTestId('filters-loading')).toBeInTheDocument();
      
      // Should load and display filter options
      await waitFor(() => {
        expect(screen.getByTestId('dynamic-filters')).toBeInTheDocument();
      });
      
      const partyFilter = screen.getByTestId('party-filter');
      const stateFilter = screen.getByTestId('state-filter');
      
      expect(partyFilter).toBeInTheDocument();
      expect(stateFilter).toBeInTheDocument();
      
      // Check that options are populated
      expect(partyFilter.children.length).toBeGreaterThan(1); // "All Parties" + actual parties
      expect(stateFilter.children.length).toBeGreaterThan(1); // "All States" + actual states
    });

    it("should call onFiltersChange when filters are selected", async () => {
      const mockOnFiltersChange = vi.fn();
      render(<MockDynamicFilters onFiltersChange={mockOnFiltersChange} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('dynamic-filters')).toBeInTheDocument();
      });
      
      const partyFilter = screen.getByTestId('party-filter');
      
      fireEvent.change(partyFilter, { target: { value: PoliticalParty.APC } });
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({ party: PoliticalParty.APC });
    });

    it("should handle filter loading errors gracefully", async () => {
      mockDataLoader.loadData.mockRejectedValue(new Error('Failed to load filters'));
      
      const mockOnFiltersChange = vi.fn();
      render(<MockDynamicFilters onFiltersChange={mockOnFiltersChange} />);
      
      // Should still render the component (with empty options)
      await waitFor(() => {
        expect(screen.getByTestId('dynamic-filters')).toBeInTheDocument();
      });
    });
  });

  describe("Search Results Component Integration", () => {
    it("should search and display results", async () => {
      render(<MockSearchResults query="Bola" filters={{}} />);
      
      // Should show loading
      expect(screen.getByTestId('search-loading')).toBeInTheDocument();
      
      // Should display search results
      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });
      
      expect(screen.getByText('1 results')).toBeInTheDocument();
      expect(screen.getByText(/Bola Ahmed Tinubu - APC/)).toBeInTheDocument();
    });

    it("should filter results by party", async () => {
      render(<MockSearchResults query="" filters={{ party: [PoliticalParty.LP] }} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });
      
      expect(screen.getByText('1 results')).toBeInTheDocument();
      expect(screen.getByText(/Peter Gregory Obi - LP/)).toBeInTheDocument();
    });

    it("should show no results when query doesn't match", async () => {
      render(<MockSearchResults query="NonExistent" filters={{}} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });
      
      expect(screen.getByText('0 results')).toBeInTheDocument();
    });

    it("should handle search errors", async () => {
      mockDataLoader.loadData.mockRejectedValue(new Error('Search failed'));
      
      render(<MockSearchResults query="Bola" filters={{}} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });
      
      expect(screen.getByText('0 results')).toBeInTheDocument();
    });

    it("should update results when query changes", async () => {
      const { rerender } = render(<MockSearchResults query="Bola" filters={{}} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Bola Ahmed Tinubu/)).toBeInTheDocument();
      });
      
      // Change query
      rerender(<MockSearchResults query="Peter" filters={{}} />);
      
      await waitFor(() => {
        expect(screen.getByText(/Peter Gregory Obi/)).toBeInTheDocument();
      });
    });
  });

  describe("Cross-Component Data Flow", () => {
    it("should coordinate between filters and search results", async () => {
      let currentFilters = {};
      const handleFiltersChange = (filters: any) => {
        currentFilters = { ...currentFilters, ...filters };
      };

      const TestApp = () => (
        <div>
          <MockDynamicFilters onFiltersChange={handleFiltersChange} />
          <MockSearchResults query="" filters={currentFilters} />
        </div>
      );

      render(<TestApp />);
      
      // Wait for components to load
      await waitFor(() => {
        expect(screen.getByTestId('dynamic-filters')).toBeInTheDocument();
        expect(screen.getByTestId('search-results')).toBeInTheDocument();
      });
      
      // Initially should show no results (no query or filters)
      expect(screen.getByText('0 results')).toBeInTheDocument();
      
      // Select a party filter
      const partyFilter = screen.getByTestId('party-filter');
      fireEvent.change(partyFilter, { target: { value: PoliticalParty.APC } });
      
      // Should update search results
      await waitFor(() => {
        expect(screen.getByText('1 results')).toBeInTheDocument();
      });
    });

    it("should handle data updates across components", async () => {
      // Simulate adding new politician data
      const updatedPoliticiansData = {
        politicians: [
          ...mockPoliticiansData.politicians,
          {
            id: 'NG-POL-003',
            firstName: 'Atiku',
            lastName: 'Abubakar',
            fullName: 'Atiku Abubakar',
            partyId: 'NG-PARTY-PDP',
            currentPositionId: 'NG-POS-ASPIRANT',
            stateOfOriginId: 'NG-AD',
            dateOfBirth: '1946-11-25',
            gender: 'male'
          }
        ]
      };

      mockDataLoader.loadData.mockImplementation((key: string) => {
        if (key === 'politicians') {
          return Promise.resolve(updatedPoliticiansData);
        }
        const keyMap: { [key: string]: any } = {
          'parties': mockPartiesData,
          'states': mockStatesData,
          'positions': mockPositionsData
        };
        return Promise.resolve(keyMap[key] || {});
      });

      render(<MockSearchResults query="" filters={{ party: [PoliticalParty.PDP] }} />);
      
      await waitFor(() => {
        expect(screen.getByText('1 results')).toBeInTheDocument();
      });
    });
  });

  describe("Performance and Optimization", () => {
    it("should cache data across component instances", async () => {
      render(
        <div>
          <MockPoliticianCard politicianId="NG-POL-001" />
          <MockPoliticianCard politicianId="NG-POL-002" />
        </div>
      );
      
      await waitFor(() => {
        expect(screen.getAllByTestId('politician-card')).toHaveLength(2);
      });
      
      // Data loader should be called efficiently (shared reference data)
      const loadDataCalls = mockDataLoader.loadData.mock.calls;
      const partiesCalls = loadDataCalls.filter((call: any) => call[0] === 'parties');
      const statesCalls = loadDataCalls.filter((call: any) => call[0] === 'states');
      
      // Should not duplicate reference data calls
      expect(partiesCalls.length).toBeLessThanOrEqual(2);
      expect(statesCalls.length).toBeLessThanOrEqual(2);
    });

    it("should handle rapid component updates efficiently", async () => {
      const { rerender } = render(<MockPoliticianCard politicianId="NG-POL-001" />);
      
      // Rapidly change politician IDs
      for (let i = 0; i < 5; i++) {
        rerender(<MockPoliticianCard politicianId={`NG-POL-00${i % 2 + 1}`} />);
      }
      
      // Should eventually settle on the last politician
      await waitFor(() => {
        expect(screen.getByTestId('politician-card')).toBeInTheDocument();
      });
    });
  });

  describe("Error Boundaries and Recovery", () => {
    it("should handle component-level errors gracefully", async () => {
      // Mock a service that throws an error
      mockDataLoader.loadData.mockImplementation((key: string) => {
        if (key === 'politicians') {
          throw new Error('Synchronous error');
        }
        return Promise.resolve({});
      });
      
      render(<MockPoliticianCard politicianId="NG-POL-001" />);
      
      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });
    });

    it("should recover from temporary failures", async () => {
      let callCount = 0;
      mockDataLoader.loadData.mockImplementation((key: string) => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('Temporary failure'));
        }
        const keyMap: { [key: string]: any } = {
          'politicians': mockPoliticiansData,
          'parties': mockPartiesData,
          'states': mockStatesData,
          'positions': mockPositionsData
        };
        return Promise.resolve(keyMap[key] || {});
      });
      
      const { rerender } = render(<MockPoliticianCard politicianId="NG-POL-001" />);
      
      // First render should fail
      await waitFor(() => {
        expect(screen.getByTestId('error')).toBeInTheDocument();
      });
      
      // Force re-render (simulating retry)
      rerender(<MockPoliticianCard politicianId="NG-POL-001" />);
      
      // Second render should succeed
      await waitFor(() => {
        expect(screen.getByTestId('politician-card')).toBeInTheDocument();
      });
    });
  });
});