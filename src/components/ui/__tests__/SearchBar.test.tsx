import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SearchBar from '../SearchBar';

// Mock the enhanced search hook
vi.mock('../../../hooks/useEnhancedSearch', () => ({
  useEnhancedSearch: vi.fn(() => ({
    query: '',
    suggestions: [
      {
        item: {
          id: 'pol_001',
          name: 'Peter Obi',
          party: 'LP',
          position: 'ASPIRANT',
          state: 'Anambra'
        },
        score: 0.1,
        matches: []
      }
    ],
    historySuggestions: ['previous search'],
    isSearching: false,
    setQuery: vi.fn(),
    executeSearch: vi.fn(),
    clearSearch: vi.fn(),
    highlightMatches: vi.fn((text) => text),
    performanceMetrics: {
      averageSearchTime: 150,
      isPerformant: true,
      resultsCount: 1
    }
  }))
}));

// Mock the stores
vi.mock('../../../stores/filterStore', () => ({
  useFilterStore: vi.fn(() => ({
    setSearchQuery: vi.fn()
  }))
}));

vi.mock('../../../stores/uiStore', () => ({
  useUIStore: vi.fn(() => ({
    removeFromSearchHistory: vi.fn()
  }))
}));

// Mock PoliticianImage component
vi.mock('../PoliticianImage', () => ({
  default: ({ politician }: any) => <div data-testid="politician-image">{politician.name}</div>
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Performance Requirements', () => {
    it('should display performance indicator in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(<SearchBar />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText(/search politicians/i);
      fireEvent.change(input, { target: { value: 'Peter' } });

      // Performance indicator should be visible in dev mode
      expect(screen.getByText('150ms')).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    it('should show green performance indicator for fast searches', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(<SearchBar />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText(/search politicians/i);
      fireEvent.change(input, { target: { value: 'Peter' } });

      const performanceIndicator = screen.getByText('150ms');
      expect(performanceIndicator).toHaveClass('text-green-500');

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Search Functionality', () => {
    it('should render search input', () => {
      render(<SearchBar />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText(/search politicians/i);
      expect(input).toBeInTheDocument();
    });

    it('should show dropdown when typing', async () => {
      render(<SearchBar />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText(/search politicians/i);
      fireEvent.change(input, { target: { value: 'Peter' } });
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Politicians')).toBeInTheDocument();
        expect(screen.getByText('Peter Obi')).toBeInTheDocument();
      });
    });

    it('should show recent searches section', async () => {
      render(<SearchBar />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText(/search politicians/i);
      fireEvent.change(input, { target: { value: 'prev' } });
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Recent Searches')).toBeInTheDocument();
        expect(screen.getByText('previous search')).toBeInTheDocument();
      });
    });

    it('should show loading indicator when searching', () => {
      const { useEnhancedSearch } = require('../../../hooks/useEnhancedSearch');
      useEnhancedSearch.mockReturnValue({
        query: 'Peter',
        suggestions: [],
        historySuggestions: [],
        isSearching: true,
        setQuery: vi.fn(),
        executeSearch: vi.fn(),
        clearSearch: vi.fn(),
        highlightMatches: vi.fn(),
        performanceMetrics: { averageSearchTime: 0, isPerformant: true, resultsCount: 0 }
      });

      render(<SearchBar />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText(/search politicians/i);
      fireEvent.change(input, { target: { value: 'Peter' } });
      fireEvent.focus(input);

      expect(screen.getByText('Searching...')).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should handle arrow key navigation', async () => {
      render(<SearchBar />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText(/search politicians/i);
      fireEvent.change(input, { target: { value: 'Peter' } });
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Peter Obi')).toBeInTheDocument();
      });

      // Test arrow down navigation
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      
      // Should highlight first item (history suggestion)
      const historyItem = screen.getByText('previous search').closest('button');
      expect(historyItem).toHaveClass('bg-blue-50');
    });

    it('should handle Enter key for search execution', async () => {
      const mockExecuteSearch = vi.fn();
      const { useEnhancedSearch } = require('../../../hooks/useEnhancedSearch');
      useEnhancedSearch.mockReturnValue({
        query: 'Peter',
        suggestions: [],
        historySuggestions: [],
        isSearching: false,
        setQuery: vi.fn(),
        executeSearch: mockExecuteSearch,
        clearSearch: vi.fn(),
        highlightMatches: vi.fn(),
        performanceMetrics: { averageSearchTime: 150, isPerformant: true, resultsCount: 0 }
      });

      render(<SearchBar />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText(/search politicians/i);
      fireEvent.change(input, { target: { value: 'Peter' } });
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mockExecuteSearch).toHaveBeenCalledWith('Peter');
    });

    it('should handle Escape key to close dropdown', async () => {
      render(<SearchBar />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText(/search politicians/i);
      fireEvent.change(input, { target: { value: 'Peter' } });
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Peter Obi')).toBeInTheDocument();
      });

      fireEvent.keyDown(input, { key: 'Escape' });

      // Dropdown should be closed
      expect(screen.queryByText('Peter Obi')).not.toBeInTheDocument();
    });
  });

  describe('History Management', () => {
    it('should allow removing history items', async () => {
      const mockRemoveFromHistory = vi.fn();
      const { useUIStore } = require('../../../stores/uiStore');
      useUIStore.mockReturnValue({
        removeFromSearchHistory: mockRemoveFromHistory
      });

      render(<SearchBar />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText(/search politicians/i);
      fireEvent.change(input, { target: { value: 'prev' } });
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('previous search')).toBeInTheDocument();
      });

      // Find and click the remove button
      const removeButton = screen.getByRole('button', { name: /remove/i });
      fireEvent.click(removeButton);

      expect(mockRemoveFromHistory).toHaveBeenCalledWith('previous search');
    });
  });

  describe('Search Results Display', () => {
    it('should show result count in search option', async () => {
      render(<SearchBar />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText(/search politicians/i);
      fireEvent.change(input, { target: { value: 'Peter' } });
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText(/\(1 found\)/)).toBeInTheDocument();
      });
    });

    it('should show no suggestions message when no results', async () => {
      const { useEnhancedSearch } = require('../../../hooks/useEnhancedSearch');
      useEnhancedSearch.mockReturnValue({
        query: 'xyz',
        suggestions: [],
        historySuggestions: [],
        isSearching: false,
        setQuery: vi.fn(),
        executeSearch: vi.fn(),
        clearSearch: vi.fn(),
        highlightMatches: vi.fn(),
        performanceMetrics: { averageSearchTime: 150, isPerformant: true, resultsCount: 0 }
      });

      render(<SearchBar />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText(/search politicians/i);
      fireEvent.change(input, { target: { value: 'xyz' } });
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('No suggestions found')).toBeInTheDocument();
      });
    });
  });

  describe('Custom Props', () => {
    it('should use custom placeholder', () => {
      render(<SearchBar placeholder="Custom placeholder" />, { wrapper: createWrapper() });

      expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      render(<SearchBar className="custom-class" />, { wrapper: createWrapper() });

      const container = screen.getByPlaceholderText(/search politicians/i).closest('.custom-class');
      expect(container).toBeInTheDocument();
    });

    it('should call custom onSearch callback', () => {
      const mockOnSearch = vi.fn();
      render(<SearchBar onSearch={mockOnSearch} />, { wrapper: createWrapper() });

      const input = screen.getByPlaceholderText(/search politicians/i);
      fireEvent.change(input, { target: { value: 'Peter' } });
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      fireEvent.click(searchButton);

      expect(mockOnSearch).toHaveBeenCalledWith('Peter');
    });
  });
});