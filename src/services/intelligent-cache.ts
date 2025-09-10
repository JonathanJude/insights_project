/**
 * Intelligent Caching Service with Invalidation
 * 
 * This service provides advanced caching capabilities with:
 * - Cache invalidation strategies based on data freshness
 * - Memory-efficient caching with size limits
 * - Cache synchronization across browser tabs/windows
 * - Intelligent cache warming and prefetching
 * - Cache analytics and optimization
 */

import { EventEmitter } from 'events';

// Cache invalidation strategies
export enum InvalidationStrategy {
  TTL = 'ttl',                    // Time-to-live based
  DEPENDENCY = 'dependency',       // Dependency-based invalidation
  TAG = 'tag',                    // Tag-based invalidation
  VERSION = 'version',            // Version-based invalidation
  MANUAL = 'manual'               // Manual invalidation
}

// Cache storage types
export enum CacheStorageType {
  MEMORY = 'memory',
  LOCAL_STORAGE = 'localStorage',
  SESSION_STORAGE = 'sessionStorage',
  INDEXED_DB = 'indexedDB'
}

// Cache entry metadata
export interface CacheMetadata {
  key: string;
  size: number;
  createdAt: number;
  lastAccessed: number;
  accessCount: number;
  ttl: number;
  expiresAt: number;
  tags: Set<string>;
  dependencies: Set<string>;
  version: string;
  priority: number;
  compressionRatio?: number;
  source?: string;
}

// Cache entry with data and metadata
export interface CacheEntry<T = any> {
  data: T;
  metadata: CacheMetadata;
  compressed?: boolean;
}

// Cache invalidation event
export interface InvalidationEvent {
  strategy: InvalidationStrategy;
  keys: string[];
  tags?: string[];
  reason: string;
  timestamp: number;
}

// Cache statistics
export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  missRate: number;
  evictionRate: number;
  averageAccessTime: number;
  memoryUsage: number;
  compressionRatio: number;
  oldestEntry: number;
  newestEntry: number;
}

// Cache configuration
export interface CacheConfig {
  maxSize: number;
  maxEntries: number;
  defaultTTL: number;
  compressionThreshold: number;
  enableCompression: boolean;
  enableCrossBrowserSync: boolean;
  storageType: CacheStorageType;
  evictionPolicy: 'lru' | 'lfu' | 'fifo' | 'random';
  cleanupInterval: number;
  prefetchEnabled: boolean;
  analyticsEnabled: boolean;
}

/**
 * Intelligent Cache Service with advanced invalidation and synchronization
 */
export class IntelligentCacheService extends EventEmitter {
  private static instance: IntelligentCacheService;
  
  // Cache storage
  private cache = new Map<string, CacheEntry>();
  private tagIndex = new Map<string, Set<string>>(); // tag -> keys
  private dependencyIndex = new Map<string, Set<string>>(); // dependency -> keys
  private versionIndex = new Map<string, string>(); // key -> version
  
  // Configuration
  private config: CacheConfig;
  
  // Statistics
  private stats: CacheStats = {
    totalEntries: 0,
    totalSize: 0,
    hitRate: 0,
    missRate: 0,
    evictionRate: 0,
    averageAccessTime: 0,
    memoryUsage: 0,
    compressionRatio: 0,
    oldestEntry: Date.now(),
    newestEntry: Date.now()
  };
  
  // Cross-browser synchronization
  private broadcastChannel?: BroadcastChannel;
  private storageEventListener?: (event: StorageEvent) => void;
  
  // Cleanup and maintenance
  private cleanupInterval?: NodeJS.Timeout;
  private prefetchQueue = new Set<string>();
  
  // Performance tracking
  private accessTimes: number[] = [];
  private readonly maxAccessTimeHistory = 1000;
  
  private constructor(config: Partial<CacheConfig> = {}) {
    super();
    
    this.config = {
      maxSize: 50 * 1024 * 1024, // 50MB
      maxEntries: 10000,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      compressionThreshold: 1024, // 1KB
      enableCompression: true,
      enableCrossBrowserSync: true,
      storageType: CacheStorageType.MEMORY,
      evictionPolicy: 'lru',
      cleanupInterval: 60 * 1000, // 1 minute
      prefetchEnabled: true,
      analyticsEnabled: true,
      ...config
    };
    
    this.initializeCrossBrowserSync();
    this.startCleanupInterval();
    
    // Handle page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.cleanup());
    }
  }
  
  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<CacheConfig>): IntelligentCacheService {
    if (!IntelligentCacheService.instance) {
      IntelligentCacheService.instance = new IntelligentCacheService(config);
    }
    return IntelligentCacheService.instance;
  }
  
  /**
   * Set cache entry with intelligent invalidation options
   */
  async set<T>(
    key: string,
    data: T,
    options: {
      ttl?: number;
      tags?: string[];
      dependencies?: string[];
      version?: string;
      priority?: number;
      compress?: boolean;
      source?: string;
    } = {}
  ): Promise<void> {
    const now = Date.now();
    const ttl = options.ttl || this.config.defaultTTL;
    const shouldCompress = options.compress !== false && 
                          this.config.enableCompression && 
                          this.calculateDataSize(data) > this.config.compressionThreshold;
    
    // Compress data if needed
    let processedData = data;
    let compressionRatio = 1;
    
    if (shouldCompress) {
      const compressed = await this.compressData(data);
      processedData = compressed.data;
      compressionRatio = compressed.ratio;
    }
    
    // Create cache entry
    const metadata: CacheMetadata = {
      key,
      size: this.calculateDataSize(processedData),
      createdAt: now,
      lastAccessed: now,
      accessCount: 0,
      ttl,
      expiresAt: now + ttl,
      tags: new Set(options.tags || []),
      dependencies: new Set(options.dependencies || []),
      version: options.version || '1.0.0',
      priority: options.priority || 1,
      compressionRatio,
      source: options.source
    };
    
    const entry: CacheEntry<T> = {
      data: processedData,
      metadata,
      compressed: shouldCompress
    };
    
    // Ensure cache space
    await this.ensureCacheSpace(metadata.size);
    
    // Store entry
    this.cache.set(key, entry);
    
    // Update indexes
    this.updateIndexes(key, metadata);
    
    // Update statistics
    this.updateStats();
    
    // Broadcast to other tabs/windows
    if (this.config.enableCrossBrowserSync) {
      this.broadcastCacheUpdate(key, 'set');
    }
    
    this.emit('cacheSet', { key, size: metadata.size, compressed: shouldCompress });
  }
  
  /**
   * Get cache entry with access tracking
   */
  async get<T>(key: string): Promise<T | null> {
    const startTime = performance.now();
    
    try {
      const entry = this.cache.get(key);
      if (!entry) {
        this.updateHitMissStats(false);
        return null;
      }
      
      // Check expiration
      const now = Date.now();
      if (now > entry.metadata.expiresAt) {
        await this.invalidate([key], InvalidationStrategy.TTL, 'Expired');
        this.updateHitMissStats(false);
        return null;
      }
      
      // Update access tracking
      entry.metadata.lastAccessed = now;
      entry.metadata.accessCount++;
      
      // Decompress if needed
      let data = entry.data;
      if (entry.compressed) {
        data = await this.decompressData(entry.data);
      }
      
      this.updateHitMissStats(true);
      this.trackAccessTime(performance.now() - startTime);
      
      this.emit('cacheHit', { key, accessCount: entry.metadata.accessCount });
      
      return data as T;
      
    } catch (error) {
      this.emit('cacheError', { key, error, operation: 'get' });
      return null;
    }
  }
  
  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    const now = Date.now();
    if (now > entry.metadata.expiresAt) {
      // Async cleanup of expired entry
      this.invalidate([key], InvalidationStrategy.TTL, 'Expired').catch(console.error);
      return false;
    }
    
    return true;
  }
  
  /**
   * Invalidate cache entries using various strategies
   */
  async invalidate(
    keys: string[],
    strategy: InvalidationStrategy,
    reason: string = 'Manual invalidation'
  ): Promise<void> {
    const invalidatedKeys: string[] = [];
    
    for (const key of keys) {
      if (this.cache.has(key)) {
        const entry = this.cache.get(key)!;
        
        // Remove from indexes
        this.removeFromIndexes(key, entry.metadata);
        
        // Remove from cache
        this.cache.delete(key);
        invalidatedKeys.push(key);
      }
    }
    
    if (invalidatedKeys.length > 0) {
      this.updateStats();
      
      // Broadcast invalidation
      if (this.config.enableCrossBrowserSync) {
        this.broadcastCacheInvalidation(invalidatedKeys, strategy, reason);
      }
      
      const event: InvalidationEvent = {
        strategy,
        keys: invalidatedKeys,
        reason,
        timestamp: Date.now()
      };
      
      this.emit('cacheInvalidated', event);
    }
  }
  
  /**
   * Invalidate by tags
   */
  async invalidateByTags(tags: string[], reason: string = 'Tag invalidation'): Promise<void> {
    const keysToInvalidate = new Set<string>();
    
    for (const tag of tags) {
      const taggedKeys = this.tagIndex.get(tag);
      if (taggedKeys) {
        taggedKeys.forEach(key => keysToInvalidate.add(key));
      }
    }
    
    if (keysToInvalidate.size > 0) {
      await this.invalidate(Array.from(keysToInvalidate), InvalidationStrategy.TAG, reason);
    }
  }
  
  /**
   * Invalidate by dependencies
   */
  async invalidateByDependencies(dependencies: string[], reason: string = 'Dependency invalidation'): Promise<void> {
    const keysToInvalidate = new Set<string>();
    
    for (const dependency of dependencies) {
      const dependentKeys = this.dependencyIndex.get(dependency);
      if (dependentKeys) {
        dependentKeys.forEach(key => keysToInvalidate.add(key));
      }
    }
    
    if (keysToInvalidate.size > 0) {
      await this.invalidate(Array.from(keysToInvalidate), InvalidationStrategy.DEPENDENCY, reason);
    }
  }
  
  /**
   * Invalidate by version
   */
  async invalidateByVersion(version: string, reason: string = 'Version invalidation'): Promise<void> {
    const keysToInvalidate: string[] = [];
    
    for (const [key, keyVersion] of this.versionIndex.entries()) {
      if (keyVersion !== version) {
        keysToInvalidate.push(key);
      }
    }
    
    if (keysToInvalidate.length > 0) {
      await this.invalidate(keysToInvalidate, InvalidationStrategy.VERSION, reason);
    }
  }
  
  /**
   * Warm cache with prefetched data
   */
  async warmCache(
    keys: string[],
    dataLoader: (key: string) => Promise<any>,
    options: {
      priority?: number;
      ttl?: number;
      tags?: string[];
    } = {}
  ): Promise<void> {
    const promises = keys.map(async (key) => {
      try {
        if (!this.has(key)) {
          const data = await dataLoader(key);
          await this.set(key, data, {
            priority: options.priority || 0.5,
            ttl: options.ttl,
            tags: options.tags
          });
        }
      } catch (error) {
        this.emit('cacheWarmError', { key, error });
      }
    });
    
    await Promise.allSettled(promises);
    this.emit('cacheWarmed', { keys: keys.length });
  }
  
  /**
   * Ensure cache has enough space
   */
  private async ensureCacheSpace(requiredSize: number): Promise<void> {
    let currentSize = this.getCurrentCacheSize();
    
    // Check size limits
    if (currentSize + requiredSize > this.config.maxSize || 
        this.cache.size >= this.config.maxEntries) {
      
      await this.evictEntries(requiredSize);
    }
  }
  
  /**
   * Evict entries based on configured policy
   */
  private async evictEntries(requiredSize: number): Promise<void> {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, entry }));
    
    let sortedEntries: typeof entries;
    
    switch (this.config.evictionPolicy) {
      case 'lru':
        sortedEntries = entries.sort((a, b) => 
          a.entry.metadata.lastAccessed - b.entry.metadata.lastAccessed
        );
        break;
      case 'lfu':
        sortedEntries = entries.sort((a, b) => 
          a.entry.metadata.accessCount - b.entry.metadata.accessCount
        );
        break;
      case 'fifo':
        sortedEntries = entries.sort((a, b) => 
          a.entry.metadata.createdAt - b.entry.metadata.createdAt
        );
        break;
      case 'random':
        sortedEntries = entries.sort(() => Math.random() - 0.5);
        break;
      default:
        sortedEntries = entries;
    }
    
    // Evict entries until we have enough space
    let freedSize = 0;
    const keysToEvict: string[] = [];
    
    for (const { key, entry } of sortedEntries) {
      // Don't evict high-priority entries unless absolutely necessary
      if (entry.metadata.priority > 5 && freedSize < requiredSize * 0.5) {
        continue;
      }
      
      keysToEvict.push(key);
      freedSize += entry.metadata.size;
      
      if (freedSize >= requiredSize && 
          this.cache.size - keysToEvict.length < this.config.maxEntries) {
        break;
      }
    }
    
    if (keysToEvict.length > 0) {
      await this.invalidate(keysToEvict, InvalidationStrategy.MANUAL, 'Cache eviction');
      this.stats.evictionRate = (this.stats.evictionRate * 0.9) + (keysToEvict.length * 0.1);
    }
  }
  
  /**
   * Initialize cross-browser synchronization
   */
  private initializeCrossBrowserSync(): void {
    if (!this.config.enableCrossBrowserSync || typeof window === 'undefined') {
      return;
    }
    
    try {
      // Use BroadcastChannel for modern browsers
      this.broadcastChannel = new BroadcastChannel('intelligent-cache-sync');
      this.broadcastChannel.addEventListener('message', (event) => {
        this.handleCrossBrowserMessage(event.data);
      });
    } catch {
      // Fallback to localStorage events for older browsers
      this.storageEventListener = (event) => {
        if (event.key?.startsWith('cache-sync-')) {
          try {
            const data = JSON.parse(event.newValue || '{}');
            this.handleCrossBrowserMessage(data);
          } catch (error) {
            console.warn('Failed to parse cross-browser cache message:', error);
          }
        }
      };
      
      window.addEventListener('storage', this.storageEventListener);
    }
  }
  
  /**
   * Handle cross-browser cache messages
   */
  private handleCrossBrowserMessage(message: any): void {
    switch (message.type) {
      case 'cache-invalidate':
        this.invalidate(message.keys, message.strategy, message.reason)
          .catch(console.error);
        break;
      case 'cache-clear':
        this.clear();
        break;
    }
  }
  
  /**
   * Broadcast cache update to other tabs/windows
   */
  private broadcastCacheUpdate(key: string, operation: string): void {
    const message = {
      type: 'cache-update',
      key,
      operation,
      timestamp: Date.now()
    };
    
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(message);
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        `cache-sync-${Date.now()}`,
        JSON.stringify(message)
      );
      // Clean up after a short delay
      setTimeout(() => {
        localStorage.removeItem(`cache-sync-${Date.now()}`);
      }, 1000);
    }
  }
  
  /**
   * Broadcast cache invalidation to other tabs/windows
   */
  private broadcastCacheInvalidation(
    keys: string[],
    strategy: InvalidationStrategy,
    reason: string
  ): void {
    const message = {
      type: 'cache-invalidate',
      keys,
      strategy,
      reason,
      timestamp: Date.now()
    };
    
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(message);
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem(
        `cache-sync-${Date.now()}`,
        JSON.stringify(message)
      );
    }
  }
  
  /**
   * Update cache indexes
   */
  private updateIndexes(key: string, metadata: CacheMetadata): void {
    // Update tag index
    for (const tag of metadata.tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    }
    
    // Update dependency index
    for (const dependency of metadata.dependencies) {
      if (!this.dependencyIndex.has(dependency)) {
        this.dependencyIndex.set(dependency, new Set());
      }
      this.dependencyIndex.get(dependency)!.add(key);
    }
    
    // Update version index
    this.versionIndex.set(key, metadata.version);
  }
  
  /**
   * Remove from indexes
   */
  private removeFromIndexes(key: string, metadata: CacheMetadata): void {
    // Remove from tag index
    for (const tag of metadata.tags) {
      const taggedKeys = this.tagIndex.get(tag);
      if (taggedKeys) {
        taggedKeys.delete(key);
        if (taggedKeys.size === 0) {
          this.tagIndex.delete(tag);
        }
      }
    }
    
    // Remove from dependency index
    for (const dependency of metadata.dependencies) {
      const dependentKeys = this.dependencyIndex.get(dependency);
      if (dependentKeys) {
        dependentKeys.delete(key);
        if (dependentKeys.size === 0) {
          this.dependencyIndex.delete(dependency);
        }
      }
    }
    
    // Remove from version index
    this.versionIndex.delete(key);
  }
  
  /**
   * Compress data using built-in compression
   */
  private async compressData(data: any): Promise<{ data: any; ratio: number }> {
    try {
      const jsonString = JSON.stringify(data);
      const originalSize = jsonString.length;
      
      // Simple compression using gzip-like approach (placeholder)
      // In a real implementation, you might use CompressionStream API
      const compressed = jsonString; // Placeholder - implement actual compression
      const compressedSize = compressed.length;
      
      return {
        data: compressed,
        ratio: originalSize / compressedSize
      };
    } catch (error) {
      return { data, ratio: 1 };
    }
  }
  
  /**
   * Decompress data
   */
  private async decompressData(compressedData: any): Promise<any> {
    try {
      // Placeholder - implement actual decompression
      return JSON.parse(compressedData);
    } catch (error) {
      return compressedData;
    }
  }
  
  /**
   * Calculate data size
   */
  private calculateDataSize(data: any): number {
    try {
      return JSON.stringify(data).length * 2; // UTF-16 approximation
    } catch {
      return 1024; // Default size
    }
  }
  
  /**
   * Get current cache size
   */
  private getCurrentCacheSize(): number {
    return Array.from(this.cache.values())
      .reduce((total, entry) => total + entry.metadata.size, 0);
  }
  
  /**
   * Update statistics
   */
  private updateStats(): void {
    this.stats.totalEntries = this.cache.size;
    this.stats.totalSize = this.getCurrentCacheSize();
    this.stats.memoryUsage = this.stats.totalSize;
    
    // Calculate compression ratio
    let totalOriginalSize = 0;
    let totalCompressedSize = 0;
    
    for (const entry of this.cache.values()) {
      const size = entry.metadata.size;
      totalCompressedSize += size;
      totalOriginalSize += size * (entry.metadata.compressionRatio || 1);
    }
    
    this.stats.compressionRatio = totalOriginalSize > 0 ? 
      totalOriginalSize / totalCompressedSize : 1;
    
    // Update oldest/newest entry times
    const entries = Array.from(this.cache.values());
    if (entries.length > 0) {
      this.stats.oldestEntry = Math.min(...entries.map(e => e.metadata.createdAt));
      this.stats.newestEntry = Math.max(...entries.map(e => e.metadata.createdAt));
    }
  }
  
  /**
   * Update hit/miss statistics
   */
  private updateHitMissStats(hit: boolean): void {
    const total = this.stats.hitRate + this.stats.missRate;
    if (hit) {
      this.stats.hitRate = (this.stats.hitRate * total + 1) / (total + 1);
      this.stats.missRate = (this.stats.missRate * total) / (total + 1);
    } else {
      this.stats.hitRate = (this.stats.hitRate * total) / (total + 1);
      this.stats.missRate = (this.stats.missRate * total + 1) / (total + 1);
    }
  }
  
  /**
   * Track access time for performance monitoring
   */
  private trackAccessTime(time: number): void {
    this.accessTimes.push(time);
    if (this.accessTimes.length > this.maxAccessTimeHistory) {
      this.accessTimes.shift();
    }
    
    this.stats.averageAccessTime = 
      this.accessTimes.reduce((sum, t) => sum + t, 0) / this.accessTimes.length;
  }
  
  /**
   * Start cleanup interval
   */
  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.performMaintenance();
    }, this.config.cleanupInterval);
  }
  
  /**
   * Perform cache maintenance
   */
  private performMaintenance(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    // Find expired entries
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.metadata.expiresAt) {
        expiredKeys.push(key);
      }
    }
    
    // Remove expired entries
    if (expiredKeys.length > 0) {
      this.invalidate(expiredKeys, InvalidationStrategy.TTL, 'Maintenance cleanup')
        .catch(console.error);
    }
    
    this.emit('maintenanceCompleted', { 
      expiredEntries: expiredKeys.length,
      totalEntries: this.cache.size 
    });
  }
  
  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    this.updateStats();
    return { ...this.stats };
  }
  
  /**
   * Get cache keys by pattern
   */
  getKeys(pattern?: RegExp): string[] {
    const keys = Array.from(this.cache.keys());
    return pattern ? keys.filter(key => pattern.test(key)) : keys;
  }
  
  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.tagIndex.clear();
    this.dependencyIndex.clear();
    this.versionIndex.clear();
    this.updateStats();
    
    if (this.config.enableCrossBrowserSync) {
      this.broadcastCacheUpdate('*', 'clear');
    }
    
    this.emit('cacheCleared');
  }
  
  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
    }
    
    if (this.storageEventListener && typeof window !== 'undefined') {
      window.removeEventListener('storage', this.storageEventListener);
    }
  }
  
  /**
   * Destroy service instance
   */
  static destroy(): void {
    if (IntelligentCacheService.instance) {
      IntelligentCacheService.instance.cleanup();
      IntelligentCacheService.instance.removeAllListeners();
      IntelligentCacheService.instance = null as any;
    }
  }
}

// Export singleton instance
export const intelligentCache = IntelligentCacheService.getInstance();
export default IntelligentCacheService;