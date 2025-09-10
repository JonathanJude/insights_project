/**
 * Performance and Stress Tests
 * 
 * These tests verify system performance under various load conditions,
 * memory usage optimization, and stress testing scenarios.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AnalyticsService } from "../../analytics-service";
import { DataLoaderService } from "../../data-loader";
import { DynamicFilterService } from "../../dynamic-filter-service";
import { GeographicService } from "../../geographic-service";
import { IntelligentCacheService } from "../../intelligent-cache";
import { PoliticianService } from "../../politician-service";

// Performance test utilities
const measurePerformance = async <T>(operation: () => Promise<T>): Promise<{
  result: T;
  duration: number;
  memoryBefore: number;
  memoryAfter: number;
}> => {
  const memoryBefore = process.memoryUsage().heapUsed;
  const startTime = performance.now();
  
  const result = await operation();
  
  const endTime = performance.now();
  const memoryAfter = process.memoryUsage().heapUsed;
  
  return {
    result,
    duration: endTime - startTime,
    memoryBefore,
    memoryAfter
  };
};

const generateMassiveDataset = (politicianCount: number, stateCount: number = 50) => {
  const states = Array.from({ length: stateCount }, (_, i) => ({
    id: `NG-ST-${String(i + 1).padStart(3, '0')}`,
    name: `State ${i + 1}`,
    code: `ST${i + 1}`,
    capital: `Capital ${i + 1}`,
    region: ['north-west', 'north-east', 'north-central', 'south-west', 'south-east', 'south-south'][i % 6],
    population: Math.floor(Math.random() * 20000000) + 1000000,
    coordinates: {
      latitude: Math.random() * 20 + 4,
      longitude: Math.random() * 20 + 3
    },
    metadata: {
      established: `${1960 + (i % 60)}-05-27`,
      area_km2: Math.floor(Math.random() * 50000) + 1000,
      timezone: 'WAT'
    }
  }));

  const parties = Array.from({ length: 50 }, (_, i) => ({
    id: `NG-PARTY-${String(i + 1).padStart(3, '0')}`,
    name: `Party ${i + 1}`,
    abbreviation: `P${i + 1}`,
    founded: `${1990 + (i % 30)}-01-01`,
    colors: { 
      primary: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      secondary: `#${Math.floor(Math.random() * 16777215).toString(16)}`
    },
    metadata: {
      status: i % 10 === 0 ? 'inactive' : 'active',
      website: `https://party${i + 1}.ng`
    }
  }));

  const positions = Array.from({ length: 20 }, (_, i) => ({
    id: `NG-POS-${String(i + 1).padStart(3, '0')}`,
    title: `Position ${i + 1}`,
    level: ['federal', 'state', 'local'][i % 3],
    category: ['executive', 'legislative', 'judicial', 'party'][i % 4],
    hierarchy: i + 1,
    term: {
      duration: [4, 6, 8][i % 3],
      maxTerms: [1, 2, 3][i % 3],
      unit: 'years'
    }
  }));

  const politicians = Array.from({ length: politicianCount }, (_, i) => ({
    id: `NG-POL-${String(i + 1).padStart(8, '0')}`,
    firstName: `FirstName${i + 1}`,
    lastName: `LastName${i + 1}`,
    fullName: `FirstName${i + 1} MiddleName${i + 1} LastName${i + 1}`,
    partyId: parties[i % parties.length].id,
    currentPositionId: positions[i % positions.length].id,
    stateOfOriginId: states[i % states.length].id,
    dateOfBirth: `${1940 + (i % 60)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    gender: ['male', 'female', 'other'][i % 3],
    education: Array.from({ length: (i % 3) + 1 }, (_, j) => ({
      institution: `University ${j + 1}`,
      degree: ['Bachelor', 'Master', 'PhD'][j % 3],
      field: `Field ${j + 1}`,
      year: 1980 + j * 5
    })),
    politicalHistory: Array.from({ length: (i % 5) + 1 }, (_, j) => ({
      positionId: positions[j % positions.length].id,
      stateId: states[j % states.length].id,
      startDate: `${2000 + j * 4}-01-01`,
      endDate: `${2004 + j * 4}-01-01`,
      partyId: parties[j % parties.length].id
    })),
    socialMedia: {
      twitter: `@politician${i + 1}`,
      facebook: `politician${i + 1}`,
      instagram: `politician${i + 1}`,
      threads: `politician${i + 1}`
    },
    metadata: {
      isActive: i % 10 !== 0,
      verificationStatus: ['verified', 'unverified', 'pending'][i % 3],
      lastUpdated: new Date(Date.now() - (i % 365) * 24 * 60 * 60 * 1000).toISOString()
    }
  }));

  const lgas = Array.from({ length: stateCount * 10 }, (_, i) => ({
    id: `NG-LGA-${String(i + 1).padStart(4, '0')}`,
    name: `LGA ${i + 1}`,
    code: `LGA${i + 1}`,
    stateId: states[Math.floor(i / 10)].id,
    coordinates: {
      latitude: Math.random() * 20 + 4,
      longitude: Math.random() * 20 + 3
    },
    metadata: {
      area_km2: Math.floor(Math.random() * 5000) + 100,
      population: Math.floor(Math.random() * 1000000) + 50000,
      established: `${1976 + (i % 40)}`
    }
  }));

  const wards = Array.from({ length: stateCount * 50 }, (_, i) => ({
    id: `NG-WARD-${String(i + 1).padStart(5, '0')}`,
    number: (i % 20) + 1,
    name: `Ward ${(i % 20) + 1}`,
    lgaId: lgas[Math.floor(i / 5)].id,
    stateId: states[Math.floor(i / 50)].id,
    coordinates: {
      latitude: Math.random() * 20 + 4,
      longitude: Math.random() * 20 + 3
    },
    metadata: {
      area_km2: Math.floor(Math.random() * 100) + 10,
      population: Math.floor(Math.random() * 50000) + 5000,
      registeredVoters: Math.floor(Math.random() * 30000) + 3000
    }
  }));

  return {
    states: { states },
    parties: { parties },
    positions: { positions },
    politicians: { politicians },
    lgas: { lgas },
    wards: { wards }
  };
};

describe("Performance and Stress Tests", () => {
  let politicianService: PoliticianService;
  let geographicService: GeographicService;
  let analyticsService: AnalyticsService;
  let dataLoader: DataLoaderService;
  let cache: IntelligentCacheService;
  let filterService: DynamicFilterService;

  beforeEach(() => {
    vi.clearAllMocks();
    
    politicianService = PoliticianService.getInstance();
    geographicService = GeographicService.getInstance();
    analyticsService = AnalyticsService.getInstance();
    dataLoader = DataLoaderService.getInstance();
    cache = IntelligentCacheService.getInstance();
    filterService = DynamicFilterService.getInstance();
  });

  afterEach(() => {
    // Clear all caches and reset services
    politicianService.clearCache();
    geographicService.clearCache();
    analyticsService.clearCache();
    cache.clear();
    vi.restoreAllMocks();
  });

  describe("Large Dataset Performance", () => {
    it("should handle 10,000 politicians efficiently", async () => {
      const massiveData = generateMassiveDataset(10000);
      
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        return Promise.resolve(massiveData[key as keyof typeof massiveData] || {});
      });

      const performance = await measurePerformance(async () => {
        return await politicianService.getAllPoliticians();
      });

      expect(performance.result).toHaveLength(10000);
      expect(performance.duration).toBeLessThan(10000); // Less than 10 seconds
      
      const memoryIncrease = performance.memoryAfter - performance.memoryBefore;
      expect(memoryIncrease).toBeLessThan(500 * 1024 * 1024); // Less than 500MB
    });

    it("should handle 50,000 politicians with pagination", async () => {
      const massiveData = generateMassiveDataset(50000);
      
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        return Promise.resolve(massiveData[key as keyof typeof massiveData] || {});
      });

      // Test paginated access
      const pageSize = 1000;
      const totalPages = 50;
      
      const startTime = performance.now();
      
      for (let page = 1; page <= 5; page++) { // Test first 5 pages
        const results = await politicianService.searchPoliticians('', {}, page, pageSize);
        expect(results.data).toHaveLength(pageSize);
        expect(results.pagination.totalItems).toBe(50000);
      }
      
      const totalTime = performance.now() - startTime;
      expect(totalTime).toBeLessThan(15000); // Less than 15 seconds for 5 pages
    });

    it("should maintain performance with complex geographic hierarchies", async () => {
      const massiveData = generateMassiveDataset(5000, 100); // 100 states
      
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        return Promise.resolve(massiveData[key as keyof typeof massiveData] || {});
      });

      const performance = await measurePerformance(async () => {
        const states = await geographicService.getAllStates();
        const lgas = await geographicService.getAllLGAs();
        const wards = await geographicService.getAllWards();
        
        // Test hierarchical queries
        const firstState = states[0];
        const stateLgas = await geographicService.getLGAsByState(firstState.id);
        const stateWards = await geographicService.getWardsByState(firstState.id);
        
        return { states, lgas, wards, stateLgas, stateWards };
      });

      expect(performance.result.states).toHaveLength(100);
      expect(performance.result.lgas).toHaveLength(1000); // 100 states * 10 LGAs
      expect(performance.result.wards).toHaveLength(5000); // 100 states * 50 wards
      expect(performance.duration).toBeLessThan(8000); // Less than 8 seconds
    });

    it("should optimize memory usage with intelligent caching", async () => {
      const massiveData = generateMassiveDataset(20000);
      
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        return Promise.resolve(massiveData[key as keyof typeof massiveData] || {});
      });

      const initialMemory = process.memoryUsage().heapUsed;
      
      // Load data multiple times to test caching
      await politicianService.getAllPoliticians();
      await politicianService.getAllPoliticians(); // Should use cache
      await geographicService.getAllStates();
      await geographicService.getAllStates(); // Should use cache
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable despite large dataset
      expect(memoryIncrease).toBeLessThan(200 * 1024 * 1024); // Less than 200MB
      
      // Verify cache is working
      const cacheMetrics = cache.getMetrics();
      expect(cacheMetrics.hitRate).toBeGreaterThan(0.3); // At least 30% hit rate
    });
  });

  describe("Concurrent Load Testing", () => {
    it("should handle 100 concurrent requests efficiently", async () => {
      const testData = generateMassiveDataset(1000);
      
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        // Simulate network delay
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(testData[key as keyof typeof testData] || {});
          }, Math.random() * 100); // 0-100ms delay
        });
      });

      const startTime = performance.now();
      
      // Create 100 concurrent requests
      const promises = Array.from({ length: 100 }, (_, i) => {
        const requestType = i % 4;
        switch (requestType) {
          case 0:
            return politicianService.getAllPoliticians();
          case 1:
            return geographicService.getAllStates();
          case 2:
            return politicianService.searchPoliticians(`FirstName${i % 10}`);
          case 3:
            return geographicService.getAllLGAs();
          default:
            return politicianService.getAllPoliticians();
        }
      });
      
      const results = await Promise.all(promises);
      const totalTime = performance.now() - startTime;
      
      // All requests should complete successfully
      expect(results).toHaveLength(100);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
      
      // Should complete in reasonable time due to caching and deduplication
      expect(totalTime).toBeLessThan(5000); // Less than 5 seconds
    });

    it("should handle rapid sequential requests without memory leaks", async () => {
      const testData = generateMassiveDataset(500);
      
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        return Promise.resolve(testData[key as keyof typeof testData] || {});
      });

      const initialMemory = process.memoryUsage().heapUsed;
      
      // Make 1000 rapid sequential requests
      for (let i = 0; i < 1000; i++) {
        await politicianService.getPoliticianById(`NG-POL-${String((i % 500) + 1).padStart(8, '0')}`);
        
        // Check memory every 100 requests
        if (i % 100 === 0) {
          const currentMemory = process.memoryUsage().heapUsed;
          const memoryIncrease = currentMemory - initialMemory;
          
          // Memory shouldn't grow excessively
          expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
        }
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const totalMemoryIncrease = finalMemory - initialMemory;
      
      // Final memory increase should be reasonable
      expect(totalMemoryIncrease).toBeLessThan(150 * 1024 * 1024); // Less than 150MB
    });

    it("should maintain performance under mixed read/write operations", async () => {
      const testData = generateMassiveDataset(2000);
      
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        return Promise.resolve(testData[key as keyof typeof testData] || {});
      });

      const operations = [];
      
      // Mix of read operations
      for (let i = 0; i < 50; i++) {
        operations.push(politicianService.getAllPoliticians());
        operations.push(geographicService.getAllStates());
        operations.push(politicianService.searchPoliticians(`FirstName${i % 10}`));
        operations.push(filterService.generatePartyOptions());
      }
      
      // Add cache operations
      for (let i = 0; i < 20; i++) {
        operations.push(
          politicianService.getAllPoliticians().then(() => {
            politicianService.clearCache(); // Simulate cache invalidation
          })
        );
      }
      
      const startTime = performance.now();
      await Promise.all(operations);
      const totalTime = performance.now() - startTime;
      
      expect(totalTime).toBeLessThan(10000); // Less than 10 seconds
    });
  });

  describe("Memory Stress Testing", () => {
    it("should handle memory pressure gracefully", async () => {
      const massiveData = generateMassiveDataset(30000);
      
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        return Promise.resolve(massiveData[key as keyof typeof massiveData] || {});
      });

      const initialMemory = process.memoryUsage().heapUsed;
      
      // Load large amounts of data
      const politicians = await politicianService.getAllPoliticians();
      const states = await geographicService.getAllStates();
      const lgas = await geographicService.getAllLGAs();
      const wards = await geographicService.getAllWards();
      
      expect(politicians).toHaveLength(30000);
      expect(states).toHaveLength(50);
      expect(lgas).toHaveLength(500);
      expect(wards).toHaveLength(2500);
      
      const peakMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = peakMemory - initialMemory;
      
      // Should handle large dataset without excessive memory usage
      expect(memoryIncrease).toBeLessThan(1024 * 1024 * 1024); // Less than 1GB
      
      // Clear caches and verify memory is released
      politicianService.clearCache();
      geographicService.clearCache();
      cache.clear();
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      // Memory should be significantly reduced after cleanup
      const afterCleanupMemory = process.memoryUsage().heapUsed;
      const memoryReduction = peakMemory - afterCleanupMemory;
      expect(memoryReduction).toBeGreaterThan(memoryIncrease * 0.5); // At least 50% reduction
    });

    it("should implement effective cache eviction policies", async () => {
      const testData = generateMassiveDataset(1000);
      
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        return Promise.resolve(testData[key as keyof typeof testData] || {});
      });

      // Fill cache with data
      for (let i = 0; i < 100; i++) {
        await politicianService.getPoliticianById(`NG-POL-${String(i + 1).padStart(8, '0')}`);
      }
      
      const cacheMetrics = cache.getMetrics();
      const initialCacheSize = cacheMetrics.size;
      
      // Continue adding more data to trigger eviction
      for (let i = 100; i < 500; i++) {
        await politicianService.getPoliticianById(`NG-POL-${String(i + 1).padStart(8, '0')}`);
      }
      
      const finalCacheMetrics = cache.getMetrics();
      
      // Cache should have grown but not excessively
      expect(finalCacheMetrics.size).toBeGreaterThan(initialCacheSize);
      expect(finalCacheMetrics.memoryUsage).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
    });
  });

  describe("Search Performance Under Load", () => {
    it("should maintain search performance with large datasets", async () => {
      const massiveData = generateMassiveDataset(25000);
      
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        return Promise.resolve(massiveData[key as keyof typeof massiveData] || {});
      });

      // Test various search scenarios
      const searchTests = [
        { query: 'FirstName1', expectedResults: 2500 }, // Should match FirstName1, FirstName10, FirstName100, etc.
        { query: 'FirstName12345', expectedResults: 1 }, // Exact match
        { query: 'NonExistent', expectedResults: 0 }, // No matches
        { query: '', filters: { party: ['OTHER'] }, expectedResults: 25000 } // Filter only
      ];
      
      for (const test of searchTests) {
        const startTime = performance.now();
        
        const results = await politicianService.searchPoliticians(
          test.query, 
          test.filters || {}, 
          1, 
          100
        );
        
        const searchTime = performance.now() - startTime;
        
        expect(results.success).toBe(true);
        expect(searchTime).toBeLessThan(2000); // Less than 2 seconds per search
        
        if (test.expectedResults > 0) {
          expect(results.pagination.totalItems).toBeGreaterThan(0);
        }
      }
    });

    it("should handle complex multi-filter searches efficiently", async () => {
      const massiveData = generateMassiveDataset(10000);
      
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        return Promise.resolve(massiveData[key as keyof typeof massiveData] || {});
      });

      const complexFilters = {
        party: ['OTHER'],
        state: ['FCT'],
        gender: ['male', 'female'],
        ageGroup: ['ADULT', 'MIDDLE', 'SENIOR']
      };
      
      const startTime = performance.now();
      
      const results = await politicianService.searchPoliticians(
        'FirstName',
        complexFilters,
        1,
        50
      );
      
      const searchTime = performance.now() - startTime;
      
      expect(results.success).toBe(true);
      expect(searchTime).toBeLessThan(3000); // Less than 3 seconds
      expect(results.data.length).toBeLessThanOrEqual(50);
    });
  });

  describe("Error Recovery Under Stress", () => {
    it("should recover from intermittent failures under load", async () => {
      const testData = generateMassiveDataset(1000);
      let failureRate = 0.3; // 30% failure rate initially
      let requestCount = 0;
      
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        requestCount++;
        
        // Gradually reduce failure rate
        if (requestCount > 50) failureRate = 0.1;
        if (requestCount > 100) failureRate = 0.05;
        
        if (Math.random() < failureRate) {
          return Promise.reject(new Error('Intermittent failure'));
        }
        
        return Promise.resolve(testData[key as keyof typeof testData] || {});
      });

      let successCount = 0;
      let failureCount = 0;
      
      // Make 200 requests with intermittent failures
      const promises = Array.from({ length: 200 }, async (_, i) => {
        try {
          await politicianService.getPoliticianById(`NG-POL-${String((i % 1000) + 1).padStart(8, '0')}`);
          successCount++;
        } catch (error) {
          failureCount++;
        }
      });
      
      await Promise.all(promises);
      
      // Should have some successes despite failures
      expect(successCount).toBeGreaterThan(100);
      expect(failureCount).toBeGreaterThan(0);
      expect(successCount + failureCount).toBe(200);
    });

    it("should maintain system stability during cascading failures", async () => {
      let systemHealth = 1.0; // Start with 100% health
      
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        // Simulate cascading failure - each failure reduces system health
        if (Math.random() > systemHealth) {
          systemHealth = Math.max(0.1, systemHealth - 0.1); // Degrade health
          return Promise.reject(new Error('System degradation'));
        }
        
        // Gradual recovery
        systemHealth = Math.min(1.0, systemHealth + 0.01);
        
        return Promise.resolve(generateMassiveDataset(100)[key as keyof ReturnType<typeof generateMassiveDataset>] || {});
      });

      let totalRequests = 0;
      let successfulRequests = 0;
      
      // Simulate sustained load during system degradation
      for (let batch = 0; batch < 10; batch++) {
        const batchPromises = Array.from({ length: 20 }, async () => {
          totalRequests++;
          try {
            await politicianService.getAllPoliticians();
            successfulRequests++;
          } catch (error) {
            // Expected failures during degradation
          }
        });
        
        await Promise.all(batchPromises);
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // System should maintain some level of functionality
      const successRate = successfulRequests / totalRequests;
      expect(successRate).toBeGreaterThan(0.3); // At least 30% success rate
      expect(totalRequests).toBe(200);
    });
  });

  describe("Resource Cleanup and Optimization", () => {
    it("should properly cleanup resources after heavy usage", async () => {
      const testData = generateMassiveDataset(5000);
      
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        return Promise.resolve(testData[key as keyof typeof testData] || {});
      });

      const initialMetrics = {
        memory: process.memoryUsage().heapUsed,
        cache: cache.getMetrics()
      };
      
      // Heavy usage simulation
      for (let i = 0; i < 100; i++) {
        await politicianService.getAllPoliticians();
        await geographicService.getAllStates();
        await politicianService.searchPoliticians(`FirstName${i % 10}`);
        
        if (i % 20 === 0) {
          // Periodic cleanup
          politicianService.clearCache();
          geographicService.clearCache();
        }
      }
      
      // Final cleanup
      politicianService.clearCache();
      geographicService.clearCache();
      analyticsService.clearCache();
      cache.clear();
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMetrics = {
        memory: process.memoryUsage().heapUsed,
        cache: cache.getMetrics()
      };
      
      // Memory should be cleaned up
      const memoryIncrease = finalMetrics.memory - initialMetrics.memory;
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB residual
      
      // Cache should be empty
      expect(finalMetrics.cache.size).toBe(0);
    });

    it("should optimize performance over time with usage patterns", async () => {
      const testData = generateMassiveDataset(2000);
      
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        return Promise.resolve(testData[key as keyof typeof testData] || {});
      });

      // Simulate realistic usage patterns
      const commonQueries = [
        'FirstName1', 'FirstName2', 'FirstName3', 'FirstName4', 'FirstName5'
      ];
      
      // First round - establish baseline
      const firstRoundTimes = [];
      for (const query of commonQueries) {
        const startTime = performance.now();
        await politicianService.searchPoliticians(query);
        firstRoundTimes.push(performance.now() - startTime);
      }
      
      // Second round - should be faster due to caching
      const secondRoundTimes = [];
      for (const query of commonQueries) {
        const startTime = performance.now();
        await politicianService.searchPoliticians(query);
        secondRoundTimes.push(performance.now() - startTime);
      }
      
      // Calculate average improvement
      const avgFirstRound = firstRoundTimes.reduce((a, b) => a + b, 0) / firstRoundTimes.length;
      const avgSecondRound = secondRoundTimes.reduce((a, b) => a + b, 0) / secondRoundTimes.length;
      
      // Second round should be significantly faster
      expect(avgSecondRound).toBeLessThan(avgFirstRound * 0.5); // At least 50% improvement
      
      // Cache hit rate should be high
      const cacheMetrics = cache.getMetrics();
      expect(cacheMetrics.hitRate).toBeGreaterThan(0.5); // At least 50% hit rate
    });
  });
});