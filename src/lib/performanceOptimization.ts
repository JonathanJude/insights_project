/**
 * Performance Optimization Utilities for Multi-Dimensional Data
 * 
 * This module provides efficient client-side filtering algorithms, memoization strategies,
 * and optimization techniques for handling complex multi-dimensional filter combinations
 * with large mock datasets.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Types for performance optimization
export interface FilterCacheKey {
  geographic: string;
  demographic: string;
  sentiment: string;
  topic: string;
  engagement: string;
  temporal: string;
  query: string;
}

export interface PerformanceMetrics {
  filterTime: number;
  renderTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  totalOperations: number;
}

export interface OptimizedFilterResult<T> {
  data: T[];
  metrics: PerformanceMetrics;
  cacheKey: string;
  fromCache: boolean;
}

// LRU Cache implementation for filter results
class LRUCache<T> {
  private cache = new Map<string, { value: T; timestamp: number; accessCount: number }>();
  private maxSize: number;
  private maxAge: number;

  constructor(maxSize = 100, maxAge = 5 * 60 * 1000) { // 5 minutes default
    this.maxSize = maxSize;
    this.maxAge = maxAge;
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() - item.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    // Update access count and timestamp for LRU
    item.accessCount++;
    item.timestamp = Date.now();
    
    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, item);
    
    return item.value;
  }

  set(key: string, value: T): void {
    // Remove oldest items if at capacity
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      accessCount: 1
    });
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate()
    };
  }

  private calculateHitRate(): number {
    const items = Array.from(this.cache.values());
    const totalAccesses = items.reduce((sum, item) => sum + item.accessCount, 0);
    const uniqueItems = items.length;
    return uniqueItems > 0 ? (totalAccesses - uniqueItems) / totalAccesses : 0;
  }
}

// Global filter cache instance
const filterCache = new LRUCache<any>(200, 10 * 60 * 1000); // 10 minutes, 200 items

// Optimized filtering algorithms
export class OptimizedFilterEngine {
  private static instance: OptimizedFilterEngine;
  private indexedData = new Map<string, Map<string, any[]>>();
  private performanceMetrics: PerformanceMetrics = {
    filterTime: 0,
    renderTime: 0,
    cacheHitRate: 0,
    memoryUsage: 0,
    totalOperations: 0
  };

  static getInstance(): OptimizedFilterEngine {
    if (!OptimizedFilterEngine.instance) {
      OptimizedFilterEngine.instance = new OptimizedFilterEngine();
    }
    return OptimizedFilterEngine.instance;
  }

  /**
   * Create optimized indexes for fast filtering
   */
  createIndexes<T extends Record<string, any>>(data: T[], indexFields: (keyof T)[]): void {
    const startTime = performance.now();

    indexFields.forEach(field => {
      const fieldIndex = new Map<string, T[]>();
      
      data.forEach(item => {
        const value = String(item[field] || 'undefined');
        if (!fieldIndex.has(value)) {
          fieldIndex.set(value, []);
        }
        fieldIndex.get(value)!.push(item);
      });

      this.indexedData.set(String(field), fieldIndex);
    });

    this.performanceMetrics.filterTime += performance.now() - startTime;
  }

  /**
   * Optimized multi-dimensional filtering with early termination
   */
  filterMultiDimensional<T extends Record<string, any>>(
    data: T[],
    filters: Record<string, any>,
    options: {
      useIndexes?: boolean;
      maxResults?: number;
      earlyTermination?: boolean;
    } = {}
  ): OptimizedFilterResult<T> {
    const startTime = performance.now();
    const cacheKey = this.generateCacheKey(filters);
    
    // Check cache first
    const cached = filterCache.get(cacheKey);
    if (cached) {
      return {
        data: cached,
        metrics: this.performanceMetrics,
        cacheKey,
        fromCache: true
      };
    }

    const { useIndexes = true, maxResults = 1000, earlyTermination = true } = options;
    let results: T[] = [];

    if (useIndexes && this.indexedData.size > 0) {
      results = this.filterWithIndexes(data, filters, maxResults, earlyTermination);
    } else {
      results = this.filterWithoutIndexes(data, filters, maxResults, earlyTermination);
    }

    const filterTime = performance.now() - startTime;
    this.performanceMetrics.filterTime = filterTime;
    this.performanceMetrics.totalOperations++;

    // Cache results
    filterCache.set(cacheKey, results);

    return {
      data: results,
      metrics: {
        ...this.performanceMetrics,
        cacheHitRate: filterCache.getStats().hitRate
      },
      cacheKey,
      fromCache: false
    };
  }

  /**
   * Filter using pre-built indexes for O(1) lookups
   */
  private filterWithIndexes<T>(
    data: T[],
    filters: Record<string, any>,
    maxResults: number,
    earlyTermination: boolean
  ): T[] {
    const filterEntries = Object.entries(filters).filter(([_, value]) => 
      value !== undefined && value !== null && value !== ''
    );

    if (filterEntries.length === 0) return data.slice(0, maxResults);

    // Start with the most selective filter (smallest result set)
    let candidates: T[] = data;
    let smallestResultSet = Infinity;
    let bestFilterField = '';

    // Find the most selective filter
    for (const [field, value] of filterEntries) {
      const index = this.indexedData.get(field);
      if (index) {
        const fieldResults = this.getIndexResults(index, value);
        if (fieldResults.length < smallestResultSet) {
          smallestResultSet = fieldResults.length;
          bestFilterField = field;
          candidates = fieldResults;
        }
      }
    }

    // Apply remaining filters to the candidate set
    const remainingFilters = filterEntries.filter(([field]) => field !== bestFilterField);
    
    const results: T[] = [];
    for (const item of candidates) {
      if (earlyTermination && results.length >= maxResults) break;

      if (this.matchesAllFilters(item, remainingFilters)) {
        results.push(item);
      }
    }

    return results;
  }

  /**
   * Fallback filtering without indexes
   */
  private filterWithoutIndexes<T>(
    data: T[],
    filters: Record<string, any>,
    maxResults: number,
    earlyTermination: boolean
  ): T[] {
    const filterEntries = Object.entries(filters).filter(([_, value]) => 
      value !== undefined && value !== null && value !== ''
    );

    if (filterEntries.length === 0) return data.slice(0, maxResults);

    const results: T[] = [];
    for (const item of data) {
      if (earlyTermination && results.length >= maxResults) break;

      if (this.matchesAllFilters(item, filterEntries)) {
        results.push(item);
      }
    }

    return results;
  }

  /**
   * Get results from index for a given value
   */
  private getIndexResults<T>(index: Map<string, T[]>, value: any): T[] {
    if (Array.isArray(value)) {
      // Handle array filters (OR logic)
      const results: T[] = [];
      for (const v of value) {
        const indexResults = index.get(String(v)) || [];
        results.push(...indexResults);
      }
      return results;
    } else {
      return index.get(String(value)) || [];
    }
  }

  /**
   * Check if item matches all provided filters
   */
  private matchesAllFilters<T>(item: T, filters: [string, any][]): boolean {
    return filters.every(([field, value]) => {
      const itemValue = (item as any)[field];
      
      if (Array.isArray(value)) {
        return value.includes(itemValue);
      }
      
      if (typeof value === 'object' && value.min !== undefined && value.max !== undefined) {
        const numValue = Number(itemValue);
        return numValue >= value.min && numValue <= value.max;
      }
      
      if (typeof value === 'string' && value.includes('*')) {
        const regex = new RegExp(value.replace(/\*/g, '.*'), 'i');
        return regex.test(String(itemValue));
      }
      
      return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
    });
  }

  /**
   * Generate cache key from filters
   */
  private generateCacheKey(filters: Record<string, any>): string {
    const sortedEntries = Object.entries(filters)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .sort(([a], [b]) => a.localeCompare(b));
    
    return JSON.stringify(sortedEntries);
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics {
    return {
      ...this.performanceMetrics,
      cacheHitRate: filterCache.getStats().hitRate,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Clear all caches and indexes
   */
  clearCaches(): void {
    filterCache.clear();
    this.indexedData.clear();
    this.performanceMetrics = {
      filterTime: 0,
      renderTime: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
      totalOperations: 0
    };
  }

  private estimateMemoryUsage(): number {
    // Rough estimation of memory usage in MB
    const indexSize = Array.from(this.indexedData.values())
      .reduce((sum, index) => sum + index.size, 0);
    const cacheSize = filterCache.getStats().size;
    return (indexSize + cacheSize) * 0.001; // Convert to MB estimate
  }
}

// React hooks for optimized filtering
export function useOptimizedFilter<T extends Record<string, any>>(
  data: T[],
  filters: Record<string, any>,
  options: {
    indexFields?: (keyof T)[];
    maxResults?: number;
    debounceMs?: number;
  } = {}
) {
  const { indexFields = [], maxResults = 1000, debounceMs = 150 } = options;
  const filterEngine = useRef(OptimizedFilterEngine.getInstance());
  const lastIndexTime = useRef(0);

  // Create indexes when data changes
  useMemo(() => {
    if (data.length > 0 && indexFields.length > 0) {
      const now = Date.now();
      // Only re-index if data has changed significantly or it's been a while
      if (now - lastIndexTime.current > 60000) { // 1 minute
        filterEngine.current.createIndexes(data, indexFields);
        lastIndexTime.current = now;
      }
    }
  }, [data, indexFields]);

  // Memoized filtering with debouncing
  const filteredData = useMemo(() => {
    if (!data.length) return { data: [], metrics: filterEngine.current.getMetrics() };

    return filterEngine.current.filterMultiDimensional(data, filters, {
      useIndexes: indexFields.length > 0,
      maxResults,
      earlyTermination: true
    });
  }, [data, filters, indexFields, maxResults]);

  const clearCache = useCallback(() => {
    filterEngine.current.clearCaches();
  }, []);

  const getMetrics = useCallback(() => {
    return filterEngine.current.getMetrics();
  }, []);

  return {
    data: filteredData.data,
    metrics: filteredData.metrics,
    fromCache: filteredData.fromCache,
    clearCache,
    getMetrics
  };
}

// Memoization utilities for expensive computations
export function useMemoizedComputation<T, Args extends any[]>(
  computeFn: (...args: Args) => T,
  deps: Args,
  options: { maxAge?: number; maxSize?: number } = {}
): T {
  const { maxAge = 5 * 60 * 1000, maxSize = 50 } = options;
  const cache = useRef(new LRUCache<T>(maxSize, maxAge));
  
  return useMemo(() => {
    const key = JSON.stringify(deps);
    const cached = cache.current.get(key);
    
    if (cached !== null) {
      return cached;
    }
    
    const result = computeFn(...deps);
    cache.current.set(key, result);
    return result;
  }, deps);
}

// Debounced filtering hook
export function useDebouncedFilter<T>(
  filterFn: () => T,
  deps: any[],
  delay: number = 150
): T | undefined {
  const [debouncedResult, setDebouncedResult] = useState<T | undefined>(undefined);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedResult(filterFn());
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, deps);

  return debouncedResult;
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const renderTimes = useRef<number[]>([]);
  const startTime = useRef<number>(0);

  useEffect(() => {
    startTime.current = performance.now();
    renderCount.current++;
  });

  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    renderTimes.current.push(renderTime);
    
    // Keep only last 10 render times
    if (renderTimes.current.length > 10) {
      renderTimes.current.shift();
    }

    // Log performance warnings
    if (renderTime > 16.67) { // 60fps threshold
      console.warn(`${componentName} render took ${renderTime.toFixed(2)}ms (>16.67ms)`);
    }
  });

  const getMetrics = useCallback(() => {
    const times = renderTimes.current;
    const avgRenderTime = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
    
    return {
      renderCount: renderCount.current,
      averageRenderTime: avgRenderTime,
      lastRenderTime: times[times.length - 1] || 0,
      isPerformant: avgRenderTime <= 16.67
    };
  }, []);

  return { getMetrics };
}

export default OptimizedFilterEngine;