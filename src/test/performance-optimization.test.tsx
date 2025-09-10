/**
 * Performance Optimization Tests
 * 
 * Tests for the multi-dimensional data performance optimization system
 * including filtering algorithms, caching strategies, and state management.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { useOptimizedIntegration } from '../hooks/useOptimizedIntegration';
import { CacheManager, createEnhancedQueryClient, MultiDimensionalCacheKeyGenerator } from '../lib/enhancedCaching';
import { OptimizedFilterEngine, useMemoizedComputation, useOptimizedFilter } from '../lib/performanceOptimization';

// Mock data for testing
const mockPoliticians = Array.from({ length: 1000 }, (_, i) => ({
  id: `politician_${i}`,
  name: `Politician ${i}`,
  party: ['APC', 'PDP', 'LP'][i % 3],
  state: ['Lagos', 'Kano', 'Rivers', 'Kaduna'][i % 4],
  sentiment: Math.random() * 2 - 1,
  demographic: {
    education: { level: ['Secondary', 'Tertiary', 'Postgraduate'][i % 3] },
    occupation: { sector: ['Public Sector', 'Private Sector', 'Self-Employed'][i % 3] },
    ageGroup: { range: ['18-25', '26-35', '36-45'][i % 3] },
    gender: { classification: ['Male', 'Female'][i % 2] }
  },
  geographic: {
    state: { name: ['Lagos', 'Kano', 'Rivers', 'Kaduna'][i % 4] }
  },
  enhancedSentiment: {
    polarity: { classification: ['Positive', 'Negative', 'Neutral'][i % 3] },
    emotions: { primary: ['Joy', 'Anger', 'Fear'][i % 3] }
  }
}));

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = createEnhancedQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Performance Optimization System', () => {
  let filterEngine: OptimizedFilterEngine;
  let queryClient: QueryClient;
  let cacheManager: CacheManager;

  beforeEach(() => {
    filterEngine = OptimizedFilterEngine.getInstance();
    queryClient = createEnhancedQueryClient();
    cacheManager = new CacheManager(queryClient);
    
    // Clear any existing state
    filterEngine.clearCaches();
  });

  afterEach(() => {
    filterEngine.clearCaches();
    queryClient.clear();
  });

  describe('OptimizedFilterEngine', () => {
    it('should create indexes for fast filtering', () => {
      const startTime = performance.now();
      
      filterEngine.createIndexes(mockPoliticians, ['party', 'state', 'demographic.education.level']);
      
      const indexTime = performance.now() - startTime;
      expect(indexTime).toBeLessThan(100); // Should be fast
    });

    it('should filter data efficiently with indexes', () => {
      filterEngine.createIndexes(mockPoliticians, ['party', 'state']);
      
      const startTime = performance.now();
      const result = filterEngine.filterMultiDimensional(
        mockPoliticians,
        { party: 'APC', state: 'Lagos' },
        { useIndexes: true, maxResults: 100 }
      );
      const filterTime = performance.now() - startTime;

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data.every(p => p.party === 'APC' && p.state === 'Lagos')).toBe(true);
      expect(filterTime).toBeLessThan(50); // Should be very fast with indexes
    });

    it('should handle early termination for large datasets', () => {
      const result = filterEngine.filterMultiDimensional(
        mockPoliticians,
        { party: 'APC' },
        { maxResults: 10, earlyTermination: true }
      );

      expect(result.data.length).toBeLessThanOrEqual(10);
      expect(result.data.every(p => p.party === 'APC')).toBe(true);
    });

    it('should provide performance metrics', () => {
      filterEngine.filterMultiDimensional(mockPoliticians, { party: 'APC' });
      
      const metrics = filterEngine.getMetrics();
      expect(metrics).toHaveProperty('filterTime');
      expect(metrics).toHaveProperty('totalOperations');
      expect(metrics.totalOperations).toBeGreaterThan(0);
    });
  });

  describe('MultiDimensionalCacheKeyGenerator', () => {
    it('should generate stable cache keys for identical filters', () => {
      const filters1 = {
        geographic: { states: ['Lagos', 'Kano'] },
        demographic: { education: ['Tertiary'] }
      };
      
      const filters2 = {
        geographic: { states: ['Lagos', 'Kano'] },
        demographic: { education: ['Tertiary'] }
      };

      const key1 = MultiDimensionalCacheKeyGenerator.generateFilterCacheKey('test', filters1);
      const key2 = MultiDimensionalCacheKeyGenerator.generateFilterCacheKey('test', filters2);

      expect(JSON.stringify(key1)).toBe(JSON.stringify(key2));
    });

    it('should generate different keys for different filters', () => {
      const filters1 = { geographic: { states: ['Lagos'] } };
      const filters2 = { geographic: { states: ['Kano'] } };

      const key1 = MultiDimensionalCacheKeyGenerator.generateFilterCacheKey('test', filters1);
      const key2 = MultiDimensionalCacheKeyGenerator.generateFilterCacheKey('test', filters2);

      expect(JSON.stringify(key1)).not.toBe(JSON.stringify(key2));
    });

    it('should handle empty filters gracefully', () => {
      const key = MultiDimensionalCacheKeyGenerator.generateFilterCacheKey('test', {});
      expect(key).toEqual(['test']);
    });
  });

  describe('CacheManager', () => {
    it('should track cache statistics', () => {
      const stats = cacheManager.getCacheStats();
      
      expect(stats).toHaveProperty('totalQueries');
      expect(stats).toHaveProperty('hitRate');
      expect(typeof stats.totalQueries).toBe('number');
      expect(typeof stats.hitRate).toBe('number');
    });

    it('should invalidate cache by pattern', () => {
      // Add some mock queries to cache
      queryClient.setQueryData(['test-pattern-1'], { data: 'test1' });
      queryClient.setQueryData(['test-pattern-2'], { data: 'test2' });
      queryClient.setQueryData(['other-data'], { data: 'other' });

      cacheManager.clearCacheByPattern('test-pattern');

      expect(queryClient.getQueryData(['test-pattern-1'])).toBeUndefined();
      expect(queryClient.getQueryData(['test-pattern-2'])).toBeUndefined();
      expect(queryClient.getQueryData(['other-data'])).toBeDefined();
    });
  });

  describe('useOptimizedFilter hook', () => {
    it('should filter data efficiently', () => {
      const { result } = renderHook(
        () => useOptimizedFilter(
          mockPoliticians,
          { party: 'APC' },
          { indexFields: ['party'], maxResults: 50 }
        ),
        { wrapper: TestWrapper }
      );

      expect(result.current.data.length).toBeGreaterThan(0);
      expect(result.current.data.length).toBeLessThanOrEqual(50);
      expect(result.current.data.every((p: any) => p.party === 'APC')).toBe(true);
      expect(result.current.metrics.filterTime).toBeLessThan(100);
    });

    it('should provide performance metrics', () => {
      const { result } = renderHook(
        () => useOptimizedFilter(mockPoliticians, { party: 'APC' }),
        { wrapper: TestWrapper }
      );

      expect(result.current.metrics).toHaveProperty('filterTime');
      expect(result.current.metrics).toHaveProperty('cacheHitRate');
      expect(typeof result.current.metrics.filterTime).toBe('number');
    });
  });

  describe('useMemoizedComputation hook', () => {
    it('should memoize expensive computations', () => {
      let computationCount = 0;
      const expensiveComputation = (data: any[]) => {
        computationCount++;
        return data.filter(item => item.party === 'APC').length;
      };

      const { result, rerender } = renderHook(
        ({ data }) => useMemoizedComputation(expensiveComputation, [data]),
        {
          initialProps: { data: mockPoliticians },
          wrapper: TestWrapper
        }
      );

      const firstResult = result.current;
      
      // Rerender with same data
      rerender({ data: mockPoliticians });
      const secondResult = result.current;

      expect(firstResult).toBe(secondResult);
      expect(computationCount).toBe(1); // Should only compute once
    });

    it('should recompute when dependencies change', () => {
      let computationCount = 0;
      const expensiveComputation = (multiplier: number) => {
        computationCount++;
        return mockPoliticians.length * multiplier;
      };

      const { result, rerender } = renderHook(
        ({ multiplier }) => useMemoizedComputation(expensiveComputation, [multiplier]),
        {
          initialProps: { multiplier: 1 },
          wrapper: TestWrapper
        }
      );

      const firstResult = result.current;
      
      // Rerender with different multiplier
      rerender({ multiplier: 2 });
      const secondResult = result.current;

      expect(firstResult).not.toBe(secondResult);
      expect(computationCount).toBe(2); // Should compute twice
    });
  });

  describe('useOptimizedIntegration hook', () => {
    it('should provide comprehensive optimization features', async () => {
      const { result } = renderHook(
        () => useOptimizedIntegration(
          { geographic: { states: ['Lagos'] } },
          { 
            maxResults: 50,
            enablePerformanceMonitoring: true,
            performanceMode: 'performance'
          }
        ),
        { wrapper: TestWrapper }
      );

      await waitFor(() => {
        expect(result.current.filters).toBeDefined();
        expect(result.current.performanceMetrics).toBeDefined();
        expect(result.current.updateFilters).toBeDefined();
        expect(result.current.optimizeCache).toBeDefined();
      });

      expect(result.current.performanceMetrics.overall).toHaveProperty('isOptimal');
      expect(result.current.performanceMetrics.overall).toHaveProperty('suggestions');
    });

    it('should handle filter updates efficiently', async () => {
      const { result } = renderHook(
        () => useOptimizedIntegration({}, { enableBatching: true }),
        { wrapper: TestWrapper }
      );

      await waitFor(() => {
        expect(result.current.updateFilters).toBeDefined();
      });

      act(() => {
        result.current.updateFilters({
          geographic: { states: ['Lagos'] },
          demographic: { education: ['Tertiary'] }
        });
      });

      await waitFor(() => {
        expect(result.current.filters.geographic.states).toContain('Lagos');
        expect(result.current.filters.demographic.education).toContain('Tertiary');
      });
    });
  });

  describe('Performance Benchmarks', () => {
    it('should filter 1000 items in under 100ms', () => {
      filterEngine.createIndexes(mockPoliticians, ['party', 'state']);
      
      const startTime = performance.now();
      const result = filterEngine.filterMultiDimensional(
        mockPoliticians,
        { party: 'APC', state: 'Lagos' },
        { useIndexes: true }
      );
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(100);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should handle complex multi-dimensional filters efficiently', () => {
      filterEngine.createIndexes(mockPoliticians, [
        'party', 'state', 'demographic.education.level', 'demographic.occupation.sector'
      ]);
      
      const startTime = performance.now();
      const result = filterEngine.filterMultiDimensional(
        mockPoliticians,
        {
          party: ['APC', 'PDP'],
          state: ['Lagos', 'Kano'],
          'demographic.education.level': ['Tertiary'],
          'demographic.occupation.sector': ['Public Sector', 'Private Sector']
        },
        { useIndexes: true, maxResults: 100 }
      );
      const endTime = performance.now();

      expect(endTime - startTime).toBeLessThan(150);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should maintain good cache hit rates', async () => {
      const filters = { geographic: { states: ['Lagos'] } };
      
      // First query - cache miss
      const { result: result1 } = renderHook(
        () => useOptimizedIntegration(filters),
        { wrapper: TestWrapper }
      );

      await waitFor(() => {
        expect(result1.current.data).toBeDefined();
      });

      // Second query with same filters - should hit cache
      const { result: result2 } = renderHook(
        () => useOptimizedIntegration(filters),
        { wrapper: TestWrapper }
      );

      await waitFor(() => {
        expect(result2.current.performanceMetrics.cache.hitRate).toBeGreaterThan(0);
      });
    });
  });

  describe('Memory Management', () => {
    it('should clean up caches when memory usage is high', () => {
      // Fill cache with many entries
      for (let i = 0; i < 150; i++) {
        queryClient.setQueryData([`test-${i}`], { data: `test-data-${i}` });
      }

      const initialCount = queryClient.getQueryCache().getAll().length;
      
      cacheManager.optimizeCache();
      
      const finalCount = queryClient.getQueryCache().getAll().length;
      expect(finalCount).toBeLessThan(initialCount);
    });

    it('should provide memory usage estimates', () => {
      const metrics = filterEngine.getMetrics();
      expect(metrics).toHaveProperty('memoryUsage');
      expect(typeof metrics.memoryUsage).toBe('number');
      expect(metrics.memoryUsage).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('Integration Performance Tests', () => {
  it('should handle rapid filter changes without performance degradation', async () => {
    const { result } = renderHook(
      () => useOptimizedIntegration({}, { 
        enableBatching: true,
        debounceMs: 50,
        performanceMode: 'performance'
      }),
      { wrapper: TestWrapper }
    );

    const startTime = performance.now();
    
    // Simulate rapid filter changes
    for (let i = 0; i < 10; i++) {
      act(() => {
        result.current.updateFilters({
          geographic: { states: [`State${i}`] }
        });
      });
    }

    await waitFor(() => {
      expect(result.current.filters.geographic.states).toContain('State9');
    });

    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(500); // Should handle rapid changes efficiently
  });

  it('should maintain performance with large datasets', async () => {
    // Create larger mock dataset
    const largeDataset = Array.from({ length: 5000 }, (_, i) => ({
      id: `politician_${i}`,
      name: `Politician ${i}`,
      party: ['APC', 'PDP', 'LP', 'NNPP'][i % 4],
      state: ['Lagos', 'Kano', 'Rivers', 'Kaduna', 'Oyo', 'Delta'][i % 6]
    }));

    const filterEngine = OptimizedFilterEngine.getInstance();
    filterEngine.createIndexes(largeDataset, ['party', 'state']);

    const startTime = performance.now();
    const result = filterEngine.filterMultiDimensional(
      largeDataset,
      { party: 'APC' },
      { useIndexes: true, maxResults: 100 }
    );
    const endTime = performance.now();

    expect(endTime - startTime).toBeLessThan(200); // Should handle large datasets efficiently
    expect(result.data.length).toBeLessThanOrEqual(100);
  });
});