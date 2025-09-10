/**
 * Tests for Data Loader Service
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DataLoaderService } from "../data-loader";

describe("DataLoaderService", () => {
  let dataLoader: DataLoaderService;

  beforeEach(() => {
    // Create a fresh instance for each test
    DataLoaderService.destroy();
    dataLoader = DataLoaderService.getInstance();
  });

  afterEach(() => {
    DataLoaderService.destroy();
  });

  describe("singleton pattern", () => {
    it("should return the same instance", () => {
      const instance1 = DataLoaderService.getInstance();
      const instance2 = DataLoaderService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("data loading", () => {
    it("should load data successfully", async () => {
      const mockData = { test: "data" };
      const loader = vi.fn().mockResolvedValue(mockData);

      const result = await dataLoader.loadData("test-key", loader);

      expect(result).toEqual(mockData);
      expect(loader).toHaveBeenCalledTimes(1);
    });

    it("should deduplicate concurrent requests", async () => {
      const mockData = { test: "data" };
      const loader = vi.fn().mockResolvedValue(mockData);

      // Start multiple concurrent requests
      const promises = [
        dataLoader.loadData("test-key", loader),
        dataLoader.loadData("test-key", loader),
        dataLoader.loadData("test-key", loader),
      ];

      const results = await Promise.all(promises);

      // All should return the same data
      results.forEach((result) => {
        expect(result).toEqual(mockData);
      });

      // Loader should only be called once due to deduplication
      expect(loader).toHaveBeenCalledTimes(1);
    });

    it("should cache results", async () => {
      const mockData = { test: "data" };
      const loader = vi.fn().mockResolvedValue(mockData);

      // First call
      const result1 = await dataLoader.loadData("test-key", loader);
      expect(result1).toEqual(mockData);

      // Second call should use cache
      const result2 = await dataLoader.loadData("test-key", loader);
      expect(result2).toEqual(mockData);

      // Loader should only be called once
      expect(loader).toHaveBeenCalledTimes(1);
    });

    it("should handle errors gracefully", async () => {
      const error = new Error("Test error");
      const loader = vi.fn().mockRejectedValue(error);

      await expect(dataLoader.loadData("test-key", loader)).rejects.toThrow(
        "Test error"
      );
    });

    it("should retry on failure", async () => {
      const mockData = { test: "data" };
      const loader = vi
        .fn()
        .mockRejectedValueOnce(new Error("First failure"))
        .mockRejectedValueOnce(new Error("Second failure"))
        .mockResolvedValue(mockData);

      const result = await dataLoader.loadData("test-key", loader, {
        retries: 3,
        retryDelay: 10,
      });

      expect(result).toEqual(mockData);
      expect(loader).toHaveBeenCalledTimes(3);
    });
  });

  describe("loading state management", () => {
    it("should track loading state", async () => {
      const mockData = { test: "data" };
      const loader = vi.fn().mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(mockData), 100);
        });
      });

      const loadPromise = dataLoader.loadData("test-key", loader);

      // Check loading state
      const loadingState = dataLoader.getLoadingState("test-key");
      expect(loadingState?.isLoading).toBe(true);
      expect(loadingState?.progress).toBeGreaterThanOrEqual(0);

      await loadPromise;

      // Loading should be complete
      expect(dataLoader.isLoading("test-key")).toBe(false);
    });
  });

  describe("cache management", () => {
    it("should clear cache", async () => {
      const mockData = { test: "data" };
      const loader = vi.fn().mockResolvedValue(mockData);

      // Load data to cache it
      await dataLoader.loadData("test-key", loader);
      expect(loader).toHaveBeenCalledTimes(1);

      // Clear cache
      dataLoader.clearCache();

      // Load again should call loader
      await dataLoader.loadData("test-key", loader);
      expect(loader).toHaveBeenCalledTimes(2);
    });

    it("should clear cache by pattern", async () => {
      const mockData = { test: "data" };
      const loader = vi.fn().mockResolvedValue(mockData);

      // Load multiple items
      await dataLoader.loadData("test-key-1", loader);
      await dataLoader.loadData("test-key-2", loader);
      await dataLoader.loadData("other-key", loader);

      // Clear only test keys
      dataLoader.clearCache("test-.*");

      // Test keys should be cleared, other key should remain cached
      await dataLoader.loadData("test-key-1", loader); // Should call loader
      await dataLoader.loadData("other-key", loader); // Should use cache

      expect(loader).toHaveBeenCalledTimes(4); // 3 initial + 1 after partial clear
    });
  });

  describe("metrics", () => {
    it("should track metrics", async () => {
      const mockData = { test: "data" };
      const loader = vi.fn().mockResolvedValue(mockData);

      const initialMetrics = dataLoader.getMetrics();
      expect(initialMetrics.totalRequests).toBe(0);

      await dataLoader.loadData("test-key", loader);

      const updatedMetrics = dataLoader.getMetrics();
      expect(updatedMetrics.totalRequests).toBe(1);
      expect(updatedMetrics.cacheHits).toBe(0);
      expect(updatedMetrics.cacheMisses).toBe(1);

      // Load again to test cache hit
      await dataLoader.loadData("test-key", loader);

      const finalMetrics = dataLoader.getMetrics();
      expect(finalMetrics.totalRequests).toBe(2);
      expect(finalMetrics.cacheHits).toBe(1);
      expect(finalMetrics.cacheMisses).toBe(1);
    });
  });
});
