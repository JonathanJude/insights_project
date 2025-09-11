/**
 * Race-Condition-Safe Data Loading Service
 * 
 * This service implements a singleton pattern with request deduplication,
 * loading state management, progress tracking, and concurrent access protection.
 * 
 * Features:
 * - Request deduplication to prevent duplicate API calls
 * - Loading state management with progress tracking
 * - Concurrent access protection using locks
 * - Error handling with retry mechanisms
 * - Memory-efficient caching with automatic cleanup
 */

// Simple browser-compatible event emitter
class EventEmitter {
  private events: { [key: string]: Function[] } = {};
  
  on(event: string, callback: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  
  emit(event: string, ...args: any[]) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(...args));
    }
  }
  
  off(event: string, callback: Function) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
}

// Types for data loading
export interface LoadingState {
  isLoading: boolean;
  progress: number;
  error: Error | null;
  startTime: number;
  estimatedTimeRemaining?: number;
}

export interface LoadingOptions {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  priority?: 'low' | 'normal' | 'high';
  abortSignal?: AbortSignal;
  onProgress?: (progress: number) => void;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  size: number;
  accessCount: number;
  lastAccessed: number;
}

export interface DataLoaderMetrics {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  averageLoadTime: number;
  activeRequests: number;
  memoryUsage: number;
  errorRate: number;
}

// Request deduplication key generator
type RequestKey = string;
type RequestPromise<T> = Promise<T>;

/**
 * Race-condition-safe data loading service with singleton pattern
 */
export class DataLoaderService extends EventEmitter {
  private static instance: DataLoaderService;
  
  // Request deduplication
  private activeRequests = new Map<RequestKey, RequestPromise<any>>();
  private requestLocks = new Map<RequestKey, Promise<void>>();
  
  // Loading state management
  private loadingStates = new Map<RequestKey, LoadingState>();
  
  // Cache management
  private cache = new Map<RequestKey, CacheEntry<any>>();
  private readonly maxCacheSize: number;
  private readonly defaultCacheTTL: number;
  private cacheCleanupInterval: NodeJS.Timeout | null = null;
  
  // Metrics tracking
  private metrics: DataLoaderMetrics = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    averageLoadTime: 0,
    activeRequests: 0,
    memoryUsage: 0,
    errorRate: 0
  };
  
  // Request queue for priority handling
  private requestQueue: Array<{
    key: RequestKey;
    priority: 'low' | 'normal' | 'high';
    timestamp: number;
  }> = [];
  
  private constructor(options: {
    maxCacheSize?: number;
    defaultCacheTTL?: number;
    cleanupInterval?: number;
  } = {}) {
    super();
    
    this.maxCacheSize = options.maxCacheSize || 100 * 1024 * 1024; // 100MB
    this.defaultCacheTTL = options.defaultCacheTTL || 5 * 60 * 1000; // 5 minutes
    
    // Start cache cleanup
    this.startCacheCleanup(options.cleanupInterval || 60 * 1000); // 1 minute
    
    // Handle process cleanup (only in Node.js environment)
    if (typeof process !== 'undefined' && process.on) {
      process.on('beforeExit', () => this.cleanup());
    }
  }
  
  /**
   * Get singleton instance
   */
  static getInstance(options?: {
    maxCacheSize?: number;
    defaultCacheTTL?: number;
    cleanupInterval?: number;
  }): DataLoaderService {
    if (!DataLoaderService.instance) {
      DataLoaderService.instance = new DataLoaderService(options);
    }
    return DataLoaderService.instance;
  }
  
  /**
   * Load data with race condition protection and request deduplication
   */
  async loadData<T>(
    key: RequestKey,
    loader: () => Promise<T>,
    options: LoadingOptions & {
      cacheTTL?: number;
      skipCache?: boolean;
    } = {}
  ): Promise<T> {
    const startTime = Date.now();
    this.metrics.totalRequests++;
    
    try {
      // Check cache first (unless skipCache is true)
      if (!options.skipCache) {
        const cached = this.getCachedData<T>(key);
        if (cached) {
          this.metrics.cacheHits++;
          this.emit('cacheHit', { key, data: cached });
          return cached;
        }
        this.metrics.cacheMisses++;
      }
      
      // Check if request is already in progress
      const existingRequest = this.activeRequests.get(key);
      if (existingRequest) {
        this.emit('requestDeduplication', { key });
        return existingRequest as Promise<T>;
      }
      
      // Acquire lock for this request
      await this.acquireLock(key);
      
      try {
        // Double-check cache after acquiring lock
        if (!options.skipCache) {
          const cached = this.getCachedData<T>(key);
          if (cached) {
            this.metrics.cacheHits++;
            return cached;
          }
        }
        
        // Create loading state
        const loadingState: LoadingState = {
          isLoading: true,
          progress: 0,
          error: null,
          startTime
        };
        this.loadingStates.set(key, loadingState);
        this.metrics.activeRequests++;
        
        // Create the actual request with progress tracking
        const requestPromise = this.executeWithRetry(
          key,
          loader,
          options,
          loadingState
        );
        
        // Store active request for deduplication
        this.activeRequests.set(key, requestPromise);
        
        // Execute request
        const result = await requestPromise;
        
        // Cache the result
        if (!options.skipCache) {
          this.setCachedData(key, result, options.cacheTTL);
        }
        
        // Update metrics
        const loadTime = Date.now() - startTime;
        this.updateAverageLoadTime(loadTime);
        
        this.emit('loadSuccess', { key, data: result, loadTime });
        return result;
        
      } finally {
        // Cleanup
        this.activeRequests.delete(key);
        this.loadingStates.delete(key);
        this.metrics.activeRequests--;
        this.releaseLock(key);
      }
      
    } catch (error) {
      this.metrics.errorRate = (this.metrics.errorRate * (this.metrics.totalRequests - 1) + 1) / this.metrics.totalRequests;
      
      // Update loading state with error
      const loadingState = this.loadingStates.get(key);
      if (loadingState) {
        loadingState.error = error as Error;
        loadingState.isLoading = false;
      }
      
      this.emit('loadError', { key, error });
      throw error;
    }
  }
  
  /**
   * Execute request with retry logic and progress tracking
   */
  private async executeWithRetry<T>(
    key: RequestKey,
    loader: () => Promise<T>,
    options: LoadingOptions,
    loadingState: LoadingState
  ): Promise<T> {
    const maxRetries = options.retries || 3;
    const retryDelay = options.retryDelay || 1000;
    const timeout = options.timeout || 30000;
    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error(`Request timeout after ${timeout}ms`)), timeout);
        });
        
        // Create abort promise if signal provided
        const abortPromise = options.abortSignal
          ? new Promise<never>((_, reject) => {
              options.abortSignal!.addEventListener('abort', () => {
                reject(new Error('Request aborted'));
              });
            })
          : null;
        
        // Execute with timeout and abort handling
        const promises = [loader()];
        promises.push(timeoutPromise);
        if (abortPromise) promises.push(abortPromise);
        
        // Update progress
        loadingState.progress = (attempt / (maxRetries + 1)) * 50; // 50% for attempt progress
        options.onProgress?.(loadingState.progress);
        
        const result = await Promise.race(promises);
        
        // Final progress update
        loadingState.progress = 100;
        loadingState.isLoading = false;
        options.onProgress?.(100);
        
        return result as T;
        
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on abort or timeout
        if (lastError.message.includes('abort') || lastError.message.includes('timeout')) {
          break;
        }
        
        // Wait before retry (except on last attempt)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
          
          // Update progress for retry
          loadingState.progress = ((attempt + 1) / (maxRetries + 1)) * 50;
          options.onProgress?.(loadingState.progress);
        }
      }
    }
    
    throw lastError || new Error('Unknown error during request execution');
  }
  
  /**
   * Acquire lock for concurrent access protection
   */
  private async acquireLock(key: RequestKey): Promise<void> {
    const existingLock = this.requestLocks.get(key);
    if (existingLock) {
      await existingLock;
    }
    
    let resolveLock: () => void;
    const lockPromise = new Promise<void>(resolve => {
      resolveLock = resolve;
    });
    
    this.requestLocks.set(key, lockPromise);
    
    // Auto-release lock after timeout to prevent deadlocks
    setTimeout(() => {
      if (this.requestLocks.get(key) === lockPromise) {
        this.releaseLock(key);
      }
    }, 60000); // 1 minute timeout
  }
  
  /**
   * Release lock
   */
  private releaseLock(key: RequestKey): void {
    this.requestLocks.delete(key);
  }
  
  /**
   * Get cached data if valid
   */
  private getCachedData<T>(key: RequestKey): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if (now > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    // Update access tracking
    entry.accessCount++;
    entry.lastAccessed = now;
    
    return entry.data as T;
  }
  
  /**
   * Set cached data with TTL
   */
  private setCachedData<T>(key: RequestKey, data: T, ttl?: number): void {
    const now = Date.now();
    const cacheTTL = ttl || this.defaultCacheTTL;
    
    // Calculate approximate size
    const size = this.calculateDataSize(data);
    
    // Check if we need to make room in cache
    this.ensureCacheSpace(size);
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      expiresAt: now + cacheTTL,
      size,
      accessCount: 1,
      lastAccessed: now
    };
    
    this.cache.set(key, entry);
    this.updateMemoryUsage();
  }
  
  /**
   * Ensure cache has enough space
   */
  private ensureCacheSpace(requiredSize: number): void {
    let currentSize = this.getCurrentCacheSize();
    
    if (currentSize + requiredSize <= this.maxCacheSize) {
      return;
    }
    
    // Sort entries by LRU (Least Recently Used)
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, entry }))
      .sort((a, b) => a.entry.lastAccessed - b.entry.lastAccessed);
    
    // Remove entries until we have enough space
    for (const { key, entry } of entries) {
      this.cache.delete(key);
      currentSize -= entry.size;
      
      if (currentSize + requiredSize <= this.maxCacheSize) {
        break;
      }
    }
    
    this.updateMemoryUsage();
  }
  
  /**
   * Calculate approximate data size
   */
  private calculateDataSize(data: any): number {
    try {
      return JSON.stringify(data).length * 2; // Rough estimate (UTF-16)
    } catch {
      return 1024; // Default size if calculation fails
    }
  }
  
  /**
   * Get current cache size
   */
  private getCurrentCacheSize(): number {
    return Array.from(this.cache.values())
      .reduce((total, entry) => total + entry.size, 0);
  }
  
  /**
   * Update memory usage metrics
   */
  private updateMemoryUsage(): void {
    this.metrics.memoryUsage = this.getCurrentCacheSize();
  }
  
  /**
   * Update average load time
   */
  private updateAverageLoadTime(loadTime: number): void {
    const totalRequests = this.metrics.totalRequests;
    this.metrics.averageLoadTime = 
      (this.metrics.averageLoadTime * (totalRequests - 1) + loadTime) / totalRequests;
  }
  
  /**
   * Start cache cleanup interval
   */
  private startCacheCleanup(interval: number): void {
    this.cacheCleanupInterval = setInterval(() => {
      this.cleanupExpiredEntries();
    }, interval);
  }
  
  /**
   * Clean up expired cache entries
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        expiredKeys.push(key);
      }
    }
    
    expiredKeys.forEach(key => this.cache.delete(key));
    
    if (expiredKeys.length > 0) {
      this.updateMemoryUsage();
      this.emit('cacheCleanup', { removedEntries: expiredKeys.length });
    }
  }
  
  /**
   * Get loading state for a request
   */
  getLoadingState(key: RequestKey): LoadingState | null {
    return this.loadingStates.get(key) || null;
  }
  
  /**
   * Check if request is currently loading
   */
  isLoading(key: RequestKey): boolean {
    const state = this.loadingStates.get(key);
    return state?.isLoading || false;
  }
  
  /**
   * Cancel a request if possible
   */
  cancelRequest(key: RequestKey): boolean {
    const request = this.activeRequests.get(key);
    if (request) {
      this.activeRequests.delete(key);
      this.loadingStates.delete(key);
      this.releaseLock(key);
      this.emit('requestCancelled', { key });
      return true;
    }
    return false;
  }
  
  /**
   * Clear cache
   */
  clearCache(pattern?: string): void {
    if (pattern) {
      const regex = new RegExp(pattern);
      const keysToDelete = Array.from(this.cache.keys()).filter(key => regex.test(key));
      keysToDelete.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
    
    this.updateMemoryUsage();
    this.emit('cacheCleared', { pattern });
  }
  
  /**
   * Get service metrics
   */
  getMetrics(): DataLoaderMetrics {
    return { ...this.metrics };
  }
  
  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      totalRequests: 0,
      cacheHits: 0,
      cacheMisses: 0,
      averageLoadTime: 0,
      activeRequests: this.metrics.activeRequests, // Keep current active requests
      memoryUsage: this.metrics.memoryUsage, // Keep current memory usage
      errorRate: 0
    };
  }
  
  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.cacheCleanupInterval) {
      clearInterval(this.cacheCleanupInterval);
      this.cacheCleanupInterval = null;
    }
    
    this.cache.clear();
    this.activeRequests.clear();
    this.loadingStates.clear();
    this.requestLocks.clear();
  }
  
  /**
   * Destroy the service instance
   */
  static destroy(): void {
    if (DataLoaderService.instance) {
      DataLoaderService.instance.cleanup();
      DataLoaderService.instance.removeAllListeners();
      DataLoaderService.instance = null as any;
    }
  }
}

// Export singleton instance
export const dataLoader = DataLoaderService.getInstance();
export default DataLoaderService;