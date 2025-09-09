import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useUIStore } from '../../stores/uiStore';
import { useEnhancedSearch } from '../useEnhancedSearch';

// Mock the UI store
vi.mock('../../stores/uiStore', () => ({
  useUIStore: vi.fn()
}));

// Mock the search engine
vi.mock('../../lib/searchEngine', () => ({
  getSearchEngine: vi.fn(() => ({
    search: vi.fn(() => [
      {
        item: {
          id: 'pol_001',
          name: 'Peter Obi',
          party: 'LP',
          state: 'Anambra'
        },
        score: 0.1
      }
    ]),
    getSuggestions: vi.fn(() => [
      {
        item: {
          id: 'pol_001',
          name: 'Peter Obi',
          party: 'LP',
          state: 'Anambra'
        },
        score: 0.1
      }
    ]),
    searchByField: vi.fn(() => []),
    getExactMatches: vi.fn(() => []),
    highlightMatches: vi.fn((text) => text)
  }))
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
      {children}
    </QueryClientProvider>
  );
};

describe('useEnhancedSearch', () => {
  const mockUIStore = {
    addToSearchHistory: vi.fn(),
    getSearchSuggestions: vi.fn(() => ['previous search']),
    searchHistory: ['previous search']
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useUIStore as any).mockReturnValue(mockUIStore);
  });

  describe('Performance Requirements', () => {
    it('should complete search operations within 300ms', async () => {
      const { result } = renderHook(() => useEnhancedSearch(), {
        wrapper: createWrapper()
      });

      const startTime = performance.now();
      
      result.current.setQuery('Peter');
      
      await waitFor(() => {
        expect(result.current.suggestions.length).toBeGreaterThan(0);
      }, { timeout: 300 });

      const endTime = performance.now();
      const searchTime = endTime - startTime;
      
      expect(searchTime).toBeLessThan(300);
    });

    it('should report performance metrics', async () => {
      const { result } = renderHook(() => useEnhancedSearch(), {
        wrapper: createWrapper()
      });

      result.current.setQuery('Peter');

      await waitFor(() => {
        expect(result.current.performanceMetrics.averageSearchTime).toBeGreaterThan(0);
        expect(result.current.performanceMetrics.isPerformant).toBe(true);
      });
    });
  });

  describe('Search Functionality', () => {
    it('should initialize with empty state', () => {
      const { result } = renderHook(() => useEnhancedSearch(), {
        wrapper: createWrapper()
      });

      expect(result.current.query).toBe('');
      expect(result.current.results).toEqual([]);
      expect(result.current.suggestions).toEqual([]);
      expect(result.current.isSearching).toBe(false);
    });

    it('should update query and trigger search', async () => {
      const { result } = renderHook(() => useEnhancedSearch(), {
        wrapper: createWrapper()
      });

      result.current.setQuery('Peter');

      expect(result.current.query).toBe('Peter');
      
      await waitFor(() => {
        expect(result.current.suggestions.length).toBeGreaterThan(0);
      });
    });

    it('should execute search and add to history', () => {
      const { result } = renderHook(() => useEnhancedSearch(), {
        wrapper: createWrapper()
      });

      result.current.executeSearch('Peter Obi');

      expect(mockUIStore.addToSearchHistory).toHaveBeenCalledWith('Peter Obi');
      expect(result.current.query).toBe('Peter Obi');
    });

    it('should clear search state', () => {
      const { result } = renderHook(() => useEnhancedSearch(), {
        wrapper: createWrapper()
      });

      result.current.setQuery('Peter');
      result.current.clearSearch();

      expect(result.current.query).toBe('');
      expect(result.current.results).toEqual([]);
      expect(result.current.suggestions).toEqual([]);
    });
  });

  describe('Search Options', () => {
    it('should respect minimum query length', async () => {
      const { result } = renderHook(() => useEnhancedSearch({ minQueryLength: 3 }), {
        wrapper: createWrapper()
      });

      result.current.setQuery('Pe'); // Less than minimum

      // Should not trigger search
      expect(result.current.suggestions).toEqual([]);
    });

    it('should limit suggestions count', async () => {
      const { result } = renderHook(() => useEnhancedSearch({ maxSuggestions: 5 }), {
        wrapper: createWrapper()
      });

      result.current.setQuery('Peter');

      await waitFor(() => {
        expect(result.current.suggestions.length).toBeLessThanOrEqual(5);
      });
    });

    it('should handle disabled history', () => {
      const { result } = renderHook(() => useEnhancedSearch({ enableHistory: false }), {
        wrapper: createWrapper()
      });

      result.current.executeSearch('Peter Obi');

      expect(mockUIStore.addToSearchHistory).not.toHaveBeenCalled();
    });
  });

  describe('History Suggestions', () => {
    it('should provide history suggestions', async () => {
      const { result } = renderHook(() => useEnhancedSearch(), {
        wrapper: createWrapper()
      });

      result.current.setQuery('prev');

      await waitFor(() => {
        expect(result.current.historySuggestions).toContain('previous search');
      });
    });

    it('should filter history suggestions by query', () => {
      mockUIStore.getSearchSuggestions.mockReturnValue(['filtered result']);
      
      const { result } = renderHook(() => useEnhancedSearch(), {
        wrapper: createWrapper()
      });

      result.current.setQuery('filter');

      expect(mockUIStore.getSearchSuggestions).toHaveBeenCalledWith('filter');
    });
  });

  describe('Utility Functions', () => {
    it('should provide search by field functionality', () => {
      const { result } = renderHook(() => useEnhancedSearch(), {
        wrapper: createWrapper()
      });

      const fieldResults = result.current.searchByField('Peter', 'firstName');
      
      expect(Array.isArray(fieldResults)).toBe(true);
    });

    it('should provide exact matches functionality', () => {
      const { result } = renderHook(() => useEnhancedSearch(), {
        wrapper: createWrapper()
      });

      const exactMatches = result.current.getExactMatches('Peter Obi');
      
      expect(Array.isArray(exactMatches)).toBe(true);
    });

    it('should provide highlight matches functionality', () => {
      const { result } = renderHook(() => useEnhancedSearch(), {
        wrapper: createWrapper()
      });

      const highlighted = result.current.highlightMatches('Peter Obi', []);
      
      expect(typeof highlighted).toBe('string');
    });
  });

  describe('State Helpers', () => {
    it('should provide correct state helpers', async () => {
      const { result } = renderHook(() => useEnhancedSearch(), {
        wrapper: createWrapper()
      });

      result.current.setQuery('Peter');

      await waitFor(() => {
        expect(result.current.hasSuggestions).toBe(true);
        expect(result.current.hasHistorySuggestions).toBe(true);
      });
    });
  });
});