/**
 * Tests for Intelligent Cache Service
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IntelligentCacheService } from "../intelligent-cache";

describe("IntelligentCacheService", () => {
  let cache: IntelligentCacheService;

  beforeEach(() => {
    // Reset singleton for each test
    IntelligentCacheService.destroy();
    cache = IntelligentCacheService.getInstance();
  });

  afterEach(() => {
    IntelligentCacheService.destroy();
    vi.restoreAllMocks();
  });

  describe("singleton pattern", () => {
    it("should return the same instance", () => {
      const instance1 = IntelligentCacheService.getInstance();
      const instance2 = IntelligentCacheService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("basic cache operations", () => {
    it("should set and get values", () => {
      const testData = { id: 1, name: 'test' };
      
      cache.set('test-key', testData);
      const result = cache.get('test-key');
      
      expect(result).toEqual(testData);
    });

    it("should return null for non-existent keys", () => {
      const result = cache.get('non-existent');
      expect(result).toBeNull();
    });

    it("should check if key exists", () => {
      cache.set('test-key', 'test-value');
      
      expect(cache.has('test-key')).toBe(true);
      expect(cache.has('non-existent')).toBe(false);
    });

    it("should delete keys", () => {
      cache.set('test-key', 'test-value');
      expect(cache.has('test-key')).toBe(true);
      
      const deleted = cache.delete('test-key');
      expect(deleted).toBe(true);
      expect(cache.has('test-key')).toBe(false);
    });

    it("should return false when deleting non-existent key", () => {
      const deleted = cache.delete('non-existent');
      expect(deleted).toBe(false);
    });

    it("should clear all entries", () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      expect(cache.size()).toBe(2);
      
      cache.clear();
      expect(cache.size()).toBe(0);
    });
  });

  describe("TTL (Time To Live)", () => {
    it("should respect TTL and expire entries", async () => {
      cache.set('test-key', 'test-value', 100); // 100ms TTL
      
      expect(cache.get('test-key')).toBe('test-value');
      
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(cache.get('test-key')).toBeNull();
    });

    it("should not expire entries without TTL", async () => {
      cache.set('test-key', 'test-value'); // No TTL
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(cache.get('test-key')).toBe('test-value');
    });

    it("should update access time on get", () => {
      cache.set('test-key', 'test-value');
      
      const initialAccess = cache.getLastAccessed('test-key');
      
      // Small delay to ensure different timestamp
      setTimeout(() => {
        cache.get('test-key');
        const updatedAccess = cache.getLastAccessed('test-key');
        
        expect(updatedAccess).toBeGreaterThan(initialAccess!);
      }, 10);
    });
  });

  describe("size management", () => {
    it("should track cache size", () => {
      expect(cache.size()).toBe(0);
      
      cache.set('key1', 'value1');
      expect(cache.size()).toBe(1);
      
      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);
      
      cache.delete('key1');
      expect(cache.size()).toBe(1);
    });

    it("should enforce max size with LRU eviction", () => {
      // Create cache with small max size
      IntelligentCacheService.destroy();
      cache = IntelligentCacheService.getInstance({ maxSize: 2 });
      
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);
      
      // This should evict key1 (least recently used)
      cache.set('key3', 'value3');
      expect(cache.size()).toBe(2);
      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(true);
      expect(cache.has('key3')).toBe(true);
    });

    it("should update LRU order on access", () => {
      IntelligentCacheService.destroy();
      cache = IntelligentCacheService.getInstance({ maxSize: 2 });
      
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      
      // Access key1 to make it more recently used
      cache.get('key1');
      
      // This should evict key2 (now least recently used)
      cache.set('key3', 'value3');
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(false);
      expect(cache.has('key3')).toBe(true);
    });
  });

  describe("memory management", () => {
    it("should calculate memory usage", () => {
      const initialMemory = cache.getMemoryUsage();
      
      cache.set('test-key', { data: 'test'.repeat(100) });
      
      const afterMemory = cache.getMemoryUsage();
      expect(afterMemory).toBeGreaterThan(initialMemory);
    });

    it("should enforce memory limits", () => {
      IntelligentCacheService.destroy();
      cache = IntelligentCacheService.getInstance({ 
        maxMemoryMB: 0.001 // Very small limit (1KB)
      });
      
      // Try to add data that exceeds memory limit
      const largeData = 'x'.repeat(2000); // 2KB
      cache.set('large-key', largeData);
      
      // Should either reject or evict to stay under limit
      const memoryUsage = cache.getMemoryUsage();
      expect(memoryUsage).toBeLessThan(0.002); // Less than 2KB
    });
  });

  describe("statistics and metrics", () => {
    it("should track hit and miss statistics", () => {
      cache.set('test-key', 'test-value');
      
      // Hit
      cache.get('test-key');
      
      // Miss
      cache.get('non-existent');
      
      const stats = cache.getStats();
      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(0.5);
    });

    it("should track access count per key", () => {
      cache.set('test-key', 'test-value');
      
      cache.get('test-key');
      cache.get('test-key');
      cache.get('test-key');
      
      const accessCount = cache.getAccessCount('test-key');
      expect(accessCount).toBe(3);
    });

    it("should provide comprehensive metrics", () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.get('key1');
      cache.get('non-existent');
      
      const metrics = cache.getMetrics();
      
      expect(metrics).toHaveProperty('size');
      expect(metrics).toHaveProperty('hitRate');
      expect(metrics).toHaveProperty('memoryUsage');
      expect(metrics).toHaveProperty('totalHits');
      expect(metrics).toHaveProperty('totalMisses');
      expect(metrics.size).toBe(2);
      expect(metrics.totalHits).toBe(1);
      expect(metrics.totalMisses).toBe(1);
    });
  });

  describe("pattern-based operations", () => {
    it("should delete keys by pattern", () => {
      cache.set('user:1', 'user1');
      cache.set('user:2', 'user2');
      cache.set('post:1', 'post1');
      cache.set('post:2', 'post2');
      
      const deleted = cache.deleteByPattern('user:*');
      
      expect(deleted).toBe(2);
      expect(cache.has('user:1')).toBe(false);
      expect(cache.has('user:2')).toBe(false);
      expect(cache.has('post:1')).toBe(true);
      expect(cache.has('post:2')).toBe(true);
    });

    it("should get keys by pattern", () => {
      cache.set('user:1', 'user1');
      cache.set('user:2', 'user2');
      cache.set('post:1', 'post1');
      
      const userKeys = cache.getKeysByPattern('user:*');
      
      expect(userKeys).toHaveLength(2);
      expect(userKeys).toContain('user:1');
      expect(userKeys).toContain('user:2');
    });

    it("should handle complex patterns", () => {
      cache.set('api:v1:users', 'data1');
      cache.set('api:v1:posts', 'data2');
      cache.set('api:v2:users', 'data3');
      
      const v1Keys = cache.getKeysByPattern('api:v1:*');
      
      expect(v1Keys).toHaveLength(2);
      expect(v1Keys).toContain('api:v1:users');
      expect(v1Keys).toContain('api:v1:posts');
    });
  });

  describe("automatic cleanup", () => {
    it("should automatically clean up expired entries", async () => {
      IntelligentCacheService.destroy();
      cache = IntelligentCacheService.getInstance({ 
        cleanupInterval: 50 // 50ms cleanup interval
      });
      
      cache.set('key1', 'value1', 100); // 100ms TTL
      cache.set('key2', 'value2', 200); // 200ms TTL
      
      expect(cache.size()).toBe(2);
      
      // Wait for first key to expire and cleanup to run
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(cache.size()).toBe(1);
      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(true);
    });

    it("should stop cleanup on destroy", () => {
      IntelligentCacheService.destroy();
      cache = IntelligentCacheService.getInstance({ 
        cleanupInterval: 50
      });
      
      const cleanupSpy = vi.spyOn(cache as any, 'cleanup');
      
      IntelligentCacheService.destroy();
      
      // Cleanup should not be called after destroy
      setTimeout(() => {
        expect(cleanupSpy).not.toHaveBeenCalled();
      }, 100);
    });
  });

  describe("cache invalidation strategies", () => {
    it("should support tag-based invalidation", () => {
      cache.set('user:1', 'user1', undefined, ['users', 'profile']);
      cache.set('user:2', 'user2', undefined, ['users', 'profile']);
      cache.set('post:1', 'post1', undefined, ['posts']);
      
      const invalidated = cache.invalidateByTag('users');
      
      expect(invalidated).toBe(2);
      expect(cache.has('user:1')).toBe(false);
      expect(cache.has('user:2')).toBe(false);
      expect(cache.has('post:1')).toBe(true);
    });

    it("should support dependency-based invalidation", () => {
      cache.set('derived:1', 'derived1', undefined, [], ['base:1']);
      cache.set('derived:2', 'derived2', undefined, [], ['base:1', 'base:2']);
      cache.set('independent', 'independent');
      
      const invalidated = cache.invalidateByDependency('base:1');
      
      expect(invalidated).toBe(2);
      expect(cache.has('derived:1')).toBe(false);
      expect(cache.has('derived:2')).toBe(false);
      expect(cache.has('independent')).toBe(true);
    });
  });

  describe("performance optimization", () => {
    it("should handle large numbers of entries efficiently", () => {
      const startTime = Date.now();
      
      // Add many entries
      for (let i = 0; i < 1000; i++) {
        cache.set(`key:${i}`, `value:${i}`);
      }
      
      const addTime = Date.now() - startTime;
      expect(addTime).toBeLessThan(1000); // Should complete in less than 1 second
      
      // Access entries
      const accessStart = Date.now();
      for (let i = 0; i < 100; i++) {
        cache.get(`key:${i}`);
      }
      
      const accessTime = Date.now() - accessStart;
      expect(accessTime).toBeLessThan(100); // Should be very fast
    });

    it("should maintain performance with frequent access", () => {
      cache.set('hot-key', 'hot-value');
      
      const startTime = Date.now();
      
      // Access the same key many times
      for (let i = 0; i < 10000; i++) {
        cache.get('hot-key');
      }
      
      const accessTime = Date.now() - startTime;
      expect(accessTime).toBeLessThan(100); // Should handle frequent access efficiently
    });
  });

  describe("error handling", () => {
    it("should handle invalid TTL values gracefully", () => {
      expect(() => {
        cache.set('test-key', 'test-value', -1);
      }).not.toThrow();
      
      // Should treat negative TTL as no expiration
      expect(cache.get('test-key')).toBe('test-value');
    });

    it("should handle null/undefined values", () => {
      cache.set('null-key', null);
      cache.set('undefined-key', undefined);
      
      expect(cache.get('null-key')).toBeNull();
      expect(cache.get('undefined-key')).toBeUndefined();
    });

    it("should handle circular references in data", () => {
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;
      
      expect(() => {
        cache.set('circular-key', circularObj);
      }).not.toThrow();
      
      const retrieved = cache.get('circular-key');
      expect(retrieved).toBeDefined();
    });
  });

  describe("configuration options", () => {
    it("should respect custom configuration", () => {
      IntelligentCacheService.destroy();
      cache = IntelligentCacheService.getInstance({
        maxSize: 5,
        maxMemoryMB: 1,
        defaultTTL: 1000,
        cleanupInterval: 100
      });
      
      // Test max size
      for (let i = 0; i < 10; i++) {
        cache.set(`key:${i}`, `value:${i}`);
      }
      expect(cache.size()).toBeLessThanOrEqual(5);
      
      // Test default TTL
      cache.set('ttl-test', 'value'); // Should use default TTL
      expect(cache.get('ttl-test')).toBe('value');
    });

    it("should use default configuration when none provided", () => {
      IntelligentCacheService.destroy();
      cache = IntelligentCacheService.getInstance();
      
      // Should work with default settings
      cache.set('test', 'value');
      expect(cache.get('test')).toBe('value');
    });
  });
});