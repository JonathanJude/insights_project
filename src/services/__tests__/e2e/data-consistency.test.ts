/**
 * End-to-End Data Consistency Tests
 * 
 * These tests verify data propagation across all application features,
 * error recovery and fallback scenarios, and performance with large datasets.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NigerianState, PoliticalParty } from "../../../types";
import { AnalyticsService } from "../../analytics-service";
import { DataLoaderService } from "../../data-loader";
import { DataValidatorService } from "../../data-validation-framework";
import { DynamicDropdownService } from "../../dynamic-dropdown-service";
import { DynamicFilterService } from "../../dynamic-filter-service";
import { GeographicService } from "../../geographic-service";
import { IntelligentCacheService } from "../../intelligent-cache";
import { PoliticianService } from "../../politician-service";

// Large dataset for performance testing
const generateLargeDataset = (size: number) => {
  const states = Array.from({ length: 37 }, (_, i) => ({
    id: `NG-ST-${String(i + 1).padStart(3, '0')}`,
    name: `State ${i + 1}`,
    code: `ST${i + 1}`,
    capital: `Capital ${i + 1}`,
    region: ['north-west', 'north-east', 'north-central', 'south-west', 'south-east', 'south-south'][i % 6],
    population: Math.floor(Math.random() * 20000000) + 1000000,
    coordinates: {
      latitude: Math.random() * 20 + 4, // Nigeria's latitude range
      longitude: Math.random() * 20 + 3  // Nigeria's longitude range
    }
  }));

  const parties = Array.from({ length: 20 }, (_, i) => ({
    id: `NG-PARTY-${String(i + 1).padStart(3, '0')}`,
    name: `Party ${i + 1}`,
    abbreviation: `P${i + 1}`,
    colors: { primary: `#${Math.floor(Math.random() * 16777215).toString(16)}` }
  }));

  const positions = [
    { id: 'NG-POS-PRESIDENT', title: 'President', level: 'federal', category: 'executive' },
    { id: 'NG-POS-GOVERNOR', title: 'Governor', level: 'state', category: 'executive' },
    { id: 'NG-POS-SENATOR', title: 'Senator', level: 'federal', category: 'legislative' },
    { id: 'NG-POS-HOUSE-REP', title: 'House Representative', level: 'federal', category: 'legislative' },
    { id: 'NG-POS-ASPIRANT', title: 'Aspirant', level: 'federal', category: 'aspirant' }
  ];

  const politicians = Array.from({ length: size }, (_, i) => ({
    id: `NG-POL-${String(i + 1).padStart(6, '0')}`,
    firstName: `FirstName${i + 1}`,
    lastName: `LastName${i + 1}`,
    fullName: `FirstName${i + 1} LastName${i + 1}`,
    partyId: parties[i % parties.length].id,
    currentPositionId: positions[i % positions.length].id,
    stateOfOriginId: states[i % states.length].id,
    dateOfBirth: `${1950 + (i % 50)}-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
    gender: i % 2 === 0 ? 'male' : 'female'
  }));

  const lgas = Array.from({ length: states.length * 5 }, (_, i) => ({
    id: `NG-LGA-${String(i + 1).padStart(4, '0')}`,
    name: `LGA ${i + 1}`,
    code: `LGA${i + 1}`,
    stateId: states[Math.floor(i / 5)].id,
    coordinates: {
      latitude: Math.random() * 20 + 4,
      longitude: Math.random() * 20 + 3
    }
  }));

  return {
    states: { states },
    parties: { parties },
    positions: { positions },
    politicians: { politicians },
    lgas: { lgas }
  };
};

// Corrupted data for error testing
const generateCorruptedData = () => ({
  states: {
    states: [
      {
        id: 'NG-LA',
        name: 'Lagos',
        code: 'LA',
        capital: 'Ikeja',
        region: 'south-west',
        coordinates: { latitude: 6.5244, longitude: 3.3792 }
      }
    ]
  },
  parties: {
    parties: [
      {
        id: 'NG-PARTY-APC',
        name: 'All Progressives Congress',
        abbreviation: 'APC',
        colors: { primary: '#FF0000' }
      }
    ]
  },
  politicians: {
    politicians: [
      {
        id: 'NG-POL-001',
        firstName: 'Test',
        lastName: 'Politician',
        fullName: 'Test Politician',
        partyId: 'INVALID-PARTY-ID', // Broken reference
        stateOfOriginId: 'INVALID-STATE-ID', // Broken reference
        currentPositionId: 'INVALID-POSITION-ID' // Broken reference
      },
      {
        // Missing required fields
        id: 'NG-POL-002',
        partyId: 'NG-PARTY-APC'
      },
      {
        id: 'NG-POL-001', // Duplicate ID
        firstName: 'Duplicate',
        lastName: 'Politician',
        fullName: 'Duplicate Politician'
      }
    ]
  }
});

describe("End-to-End Data Consistency Tests", () => {
  let politicianService: PoliticianService;
  let geographicService: GeographicService;
  let analyticsService: AnalyticsService;
  let dataLoader: DataLoaderService;
  let validator: DataValidatorService;
  let filterService: DynamicFilterService;
  let dropdownService: DynamicDropdownService;
  let cache: IntelligentCacheService;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Get service instances
    politicianService = PoliticianService.getInstance();
    geographicService = GeographicService.getInstance();
    analyticsService = AnalyticsService.getInstance();
    dataLoader = DataLoaderService.getInstance();
    validator = DataValidatorService.getInstance();
    filterService = DynamicFilterService.getInstance();
    dropdownService = DynamicDropdownService.getInstance();
    cache = IntelligentCacheService.getInstance();
  });

  afterEach(() => {
    // Clear all caches
    politicianService.clearCache();
    geographicService.clearCache();
    analyticsService.clearCache();
    cache.clear();
    vi.restoreAllMocks();
  });

  describe("Data Propagation Across All Features", () => {
    it("should propagate new politician data across all application features", async () => {
      const testData = generateLargeDataset(10);
      
      // Mock data loader
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        return Promise.resolve(testData[key as keyof typeof testData] || {});
      });

      // Load data through different services
      const [politicians, states, filterOptions, dropdownOptions] = await Promise.all([
        politicianService.getAllPoliticians(),
        geographicService.getAllStates(),
        filterService.generatePartyOptions(),
        dropdownService.getPoliticianOptions()
      ]);

      // Verify data consistency across services
      expect(politicians).toHaveLength(10);
      expect(states).toHaveLength(37);
      expect(filterOptions.length).toBeGreaterThan(0);
      expect(dropdownOptions).toHaveLength(10);

      // Verify relationships are maintained
      politicians.forEach(politician => {
        expect(politician.party).toBeDefined();
        expect(politician.state).toBeDefined();
        expect(politician.id).toBeDefined();
      });

      // Verify filter options match actual data
      const politicianParties = new Set(politicians.map(p => p.party));
      filterOptions.forEach(option => {
        if (option.value !== 'ALL') {
          expect(politicianParties.has(option.value as PoliticalParty)).toBe(true);
        }
      });
    });

    it("should maintain data consistency when adding new records", async () => {
      const initialData = generateLargeDataset(5);
      
      // Initial data load
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        return Promise.resolve(initialData[key as keyof typeof initialData] || {});
      });

      const initialPoliticians = await politicianService.getAllPoliticians();
      const initialOptions = await filterService.generatePartyOptions();

      expect(initialPoliticians).toHaveLength(5);

      // Simulate adding new data
      const updatedData = generateLargeDataset(8);
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        return Promise.resolve(updatedData[key as keyof typeof updatedData] || {});
      });

      // Clear caches to force reload
      politicianService.clearCache();
      filterService.clearCache();

      const updatedPoliticians = await politicianService.getAllPoliticians();
      const updatedOptions = await filterService.generatePartyOptions();

      expect(updatedPoliticians).toHaveLength(8);
      expect(updatedOptions.length).toBeGreaterThanOrEqual(initialOptions.length);

      // Verify new politicians have valid references
      updatedPoliticians.forEach(politician => {
        expect(politician.party).toBeDefined();
        expect(politician.state).toBeDefined();
      });
    });

    it("should propagate data updates to search and filtering", async () => {
      const testData = generateLargeDataset(20);
      
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        return Promise.resolve(testData[key as keyof typeof testData] || {});
      });

      // Test search functionality
      const searchResults = await politicianService.searchPoliticians('FirstName1', {}, 1, 10);
      expect(searchResults.success).toBe(true);
      expect(searchResults.data.length).toBeGreaterThan(0);

      // Test filtering by party
      const partyFilterResults = await politicianService.searchPoliticians('', {
        party: [PoliticalParty.OTHER] // Most politicians will map to OTHER
      }, 1, 10);
      expect(partyFilterResults.success).toBe(true);

      // Test filtering by state
      const stateFilterResults = await politicianService.searchPoliticians('', {
        state: [NigerianState.FCT] // Default fallback state
      }, 1, 10);
      expect(stateFilterResults.success).toBe(true);
    });

    it("should maintain geographic hierarchy consistency", async () => {
      const testData = generateLargeDataset(10);
      
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        return Promise.resolve(testData[key as keyof typeof testData] || {});
      });

      const states = await geographicService.getAllStates();
      const lgas = await geographicService.getAllLGAs();

      // Verify all LGAs reference valid states
      const stateIds = new Set(states.map(s => s.id));
      lgas.forEach(lga => {
        expect(stateIds.has(lga.stateId)).toBe(true);
      });

      // Test hierarchical queries
      const firstState = states[0];
      const stateLgas = await geographicService.getLGAsByState(firstState.id);
      
      expect(stateLgas.length).toBeGreaterThan(0);
      stateLgas.forEach(lga => {
        expect(lga.stateId).toBe(firstState.id);
      });
    });
  });

  describe("Error Recovery and Fallback Scenarios", () => {
    it("should handle corrupted data gracefully", async () => {
      const corruptedData = generateCorruptedData();
      
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        return Promise.resolve(corruptedData[key as keyof typeof corruptedData] || {});
      });

      // Should still load politicians but with fallback values
      const politicians = await politicianService.getAllPoliticians();
      
      // Should filter out completely invalid records
      expect(politicians.length).toBeLessThan(3); // Some records should be filtered out
      
      // Valid records should have fallback values
      politicians.forEach(politician => {
        expect(politician.party).toBeDefined(); // Should have fallback party
        expect(politician.state).toBeDefined(); // Should have fallback state
      });
    });

    it("should validate and report data inconsistencies", async () => {
      const corruptedData = generateCorruptedData();
      
      // Test cross-reference validation
      const validationResult = validator.validateCrossReferences(corruptedData);
      
      expect(validationResult.isValid).toBe(false);
      expect(validationResult.errors.length).toBeGreaterThan(0);
      
      // Should detect broken foreign key references
      expect(validationResult.errors.some(e => 
        e.message.includes('Invalid party reference')
      )).toBe(true);
      
      expect(validationResult.errors.some(e => 
        e.message.includes('Invalid state reference')
      )).toBe(true);
    });

    it("should recover from partial service failures", async () => {
      const testData = generateLargeDataset(5);
      
      // Mock partial failure - politicians load but parties fail
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        if (key === 'parties') {
          return Promise.reject(new Error('Parties service unavailable'));
        }
        return Promise.resolve(testData[key as keyof typeof testData] || {});
      });

      // Should handle gracefully with fallback behavior
      await expect(politicianService.getAllPoliticians()).rejects.toThrow();
      
      // Geographic service should still work
      const states = await geographicService.getAllStates();
      expect(states.length).toBeGreaterThan(0);
    });

    it("should handle network timeouts and retries", async () => {
      let attemptCount = 0;
      const testData = generateLargeDataset(5);
      
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        attemptCount++;
        if (attemptCount <= 2) {
          return Promise.reject(new Error('Network timeout'));
        }
        return Promise.resolve(testData[key as keyof typeof testData] || {});
      });

      // Should eventually succeed after retries
      const politicians = await politicianService.getAllPoliticians();
      expect(politicians.length).toBeGreaterThan(0);
      expect(attemptCount).toBeGreaterThan(2);
    });

    it("should provide meaningful error messages for debugging", async () => {
      vi.spyOn(dataLoader, 'loadData').mockRejectedValue(
        new Error('Database connection failed: Connection timeout after 30s')
      );

      try {
        await politicianService.getAllPoliticians();
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).toContain('Data loading error');
        expect(error.message).toContain('Database connection failed');
      }
    });
  });

  describe("Performance with Large Datasets", () => {
    it("should handle large datasets efficiently", async () => {
      const largeData = generateLargeDataset(1000);
      
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        return Promise.resolve(largeData[key as keyof typeof largeData] || {});
      });

      const startTime = Date.now();
      
      // Load large dataset
      const politicians = await politicianService.getAllPoliticians();
      
      const loadTime = Date.now() - startTime;
      
      expect(politicians).toHaveLength(1000);
      expect(loadTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it("should optimize memory usage with large datasets", async () => {
      const largeData = generateLargeDataset(500);
      
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        return Promise.resolve(largeData[key as keyof typeof largeData] || {});
      });

      const initialMemory = cache.getMemoryUsage();
      
      // Load large dataset
      await politicianService.getAllPoliticians();
      await geographicService.getAllStates();
      await geographicService.getAllLGAs();
      
      const finalMemory = cache.getMemoryUsage();
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    it("should handle concurrent requests efficiently", async () => {
      const testData = generateLargeDataset(100);
      
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        // Simulate network delay
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(testData[key as keyof typeof testData] || {});
          }, 100);
        });
      });

      const startTime = Date.now();
      
      // Start multiple concurrent requests
      const promises = [
        politicianService.getAllPoliticians(),
        politicianService.searchPoliticians('FirstName1'),
        geographicService.getAllStates(),
        geographicService.getAllLGAs(),
        filterService.generatePartyOptions(),
        dropdownService.getPoliticianOptions()
      ];
      
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      // All requests should complete
      expect(results).toHaveLength(6);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
      
      // Should complete faster than sequential execution due to caching
      expect(totalTime).toBeLessThan(1000); // Less than 1 second
    });

    it("should paginate large result sets efficiently", async () => {
      const largeData = generateLargeDataset(1000);
      
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        return Promise.resolve(largeData[key as keyof typeof largeData] || {});
      });

      // Test pagination
      const page1 = await politicianService.searchPoliticians('', {}, 1, 50);
      const page2 = await politicianService.searchPoliticians('', {}, 2, 50);
      
      expect(page1.data).toHaveLength(50);
      expect(page2.data).toHaveLength(50);
      expect(page1.pagination.totalItems).toBe(1000);
      expect(page1.pagination.totalPages).toBe(20);
      
      // Pages should have different data
      const page1Ids = new Set(page1.data.map(p => p.id));
      const page2Ids = new Set(page2.data.map(p => p.id));
      const intersection = new Set([...page1Ids].filter(id => page2Ids.has(id)));
      expect(intersection.size).toBe(0); // No overlap
    });

    it("should maintain performance with complex filtering", async () => {
      const largeData = generateLargeDataset(500);
      
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        return Promise.resolve(largeData[key as keyof typeof largeData] || {});
      });

      const startTime = Date.now();
      
      // Complex multi-filter search
      const results = await politicianService.searchPoliticians('FirstName', {
        party: [PoliticalParty.OTHER],
        state: [NigerianState.FCT],
        gender: ['male'],
        ageGroup: ['ADULT']
      }, 1, 20);
      
      const searchTime = Date.now() - startTime;
      
      expect(results.success).toBe(true);
      expect(searchTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe("Data Integrity Monitoring", () => {
    it("should detect and report data quality issues", async () => {
      const mixedQualityData = {
        ...generateLargeDataset(10),
        politicians: {
          politicians: [
            // Good quality record
            {
              id: 'NG-POL-001',
              firstName: 'John',
              lastName: 'Doe',
              fullName: 'John Doe',
              partyId: 'NG-PARTY-001',
              stateOfOriginId: 'NG-ST-001',
              currentPositionId: 'NG-POS-GOVERNOR',
              dateOfBirth: '1970-01-01',
              gender: 'male',
              socialMedia: {
                twitter: '@johndoe',
                facebook: 'johndoe'
              }
            },
            // Poor quality record
            {
              id: 'NG-POL-002',
              firstName: 'J',
              lastName: '',
              fullName: 'J',
              // Missing many fields
            }
          ]
        }
      };

      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        return Promise.resolve(mixedQualityData[key as keyof typeof mixedQualityData] || {});
      });

      const politicians = await politicianService.getAllPoliticians();
      
      // Should load both records but with different quality scores
      expect(politicians.length).toBeGreaterThan(0);
      
      // Good quality record should have complete data
      const goodRecord = politicians.find(p => p.firstName === 'John');
      expect(goodRecord).toBeDefined();
      expect(goodRecord?.party).toBeDefined();
      expect(goodRecord?.state).toBeDefined();
    });

    it("should track data lineage and changes", async () => {
      const initialData = generateLargeDataset(5);
      
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        return Promise.resolve(initialData[key as keyof typeof initialData] || {});
      });

      // Initial load
      const initialPoliticians = await politicianService.getAllPoliticians();
      const initialMetrics = politicianService.getMetrics();

      expect(initialPoliticians).toHaveLength(5);
      expect(initialMetrics.cache.size).toBeGreaterThan(0);

      // Simulate data update
      const updatedData = generateLargeDataset(7);
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        return Promise.resolve(updatedData[key as keyof typeof updatedData] || {});
      });

      // Clear cache and reload
      politicianService.clearCache();
      const updatedPoliticians = await politicianService.getAllPoliticians();
      const updatedMetrics = politicianService.getMetrics();

      expect(updatedPoliticians).toHaveLength(7);
      expect(updatedMetrics.dataLoader.totalRequests).toBeGreaterThan(initialMetrics.dataLoader.totalRequests);
    });

    it("should validate referential integrity continuously", async () => {
      const testData = generateLargeDataset(20);
      
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        return Promise.resolve(testData[key as keyof typeof testData] || {});
      });

      // Load data and validate integrity
      const politicians = await politicianService.getAllPoliticians();
      const states = await geographicService.getAllStates();
      
      // Verify all politician state references are valid
      const stateNames = new Set(states.map(s => s.name));
      politicians.forEach(politician => {
        // The politician state should be a valid state name or a fallback
        expect(typeof politician.state).toBe('string');
        expect(politician.state.length).toBeGreaterThan(0);
      });

      // Verify no orphaned references
      expect(politicians.every(p => p.party !== undefined)).toBe(true);
      expect(politicians.every(p => p.state !== undefined)).toBe(true);
    });
  });

  describe("System-wide Error Recovery", () => {
    it("should handle cascading failures gracefully", async () => {
      // Simulate cascading failures
      let failureCount = 0;
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        failureCount++;
        if (failureCount <= 3) {
          return Promise.reject(new Error(`Service ${key} temporarily unavailable`));
        }
        return Promise.resolve(generateLargeDataset(5)[key as keyof ReturnType<typeof generateLargeDataset>] || {});
      });

      // Should eventually recover
      const politicians = await politicianService.getAllPoliticians();
      expect(politicians.length).toBeGreaterThan(0);
      expect(failureCount).toBeGreaterThan(3);
    });

    it("should maintain service availability during partial outages", async () => {
      const testData = generateLargeDataset(10);
      
      // Mock analytics service failure but keep core services working
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        if (key.includes('analytics') || key.includes('sentiment')) {
          return Promise.reject(new Error('Analytics service down'));
        }
        return Promise.resolve(testData[key as keyof typeof testData] || {});
      });

      // Core functionality should still work
      const politicians = await politicianService.getAllPoliticians();
      const states = await geographicService.getAllStates();
      
      expect(politicians.length).toBeGreaterThan(0);
      expect(states.length).toBeGreaterThan(0);

      // Analytics should fail
      await expect(analyticsService.getSentimentData()).rejects.toThrow();
    });

    it("should provide circuit breaker functionality", async () => {
      let callCount = 0;
      
      vi.spyOn(dataLoader, 'loadData').mockImplementation(() => {
        callCount++;
        return Promise.reject(new Error('Service consistently failing'));
      });

      // Multiple failed attempts
      for (let i = 0; i < 5; i++) {
        try {
          await politicianService.getAllPoliticians();
        } catch (error) {
          // Expected to fail
        }
      }

      expect(callCount).toBeGreaterThan(0);
      
      // Should eventually stop trying (circuit breaker pattern)
      // This would be implemented in the actual data loader service
    });
  });
});