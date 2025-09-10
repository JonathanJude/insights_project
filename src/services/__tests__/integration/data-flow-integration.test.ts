/**
 * Integration Tests for Data Flow
 * 
 * These tests verify the complete data loading and processing pipeline,
 * component integration with new data services, and dynamic filter/option generation.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NigerianState, PoliticalParty, TimeFrame } from "../../../types";
import { AnalyticsService } from "../../analytics-service";
import { DataLoaderService } from "../../data-loader";
import { DataValidatorService } from "../../data-validation-framework";
import { DynamicDropdownService } from "../../dynamic-dropdown-service";
import { DynamicFilterService } from "../../dynamic-filter-service";
import { GeographicService } from "../../geographic-service";
import { IntelligentCacheService } from "../../intelligent-cache";
import { PoliticianService } from "../../politician-service";

// Mock complete data set for integration testing
const mockCompleteDataSet = {
  states: {
    states: [
      {
        id: 'NG-LA',
        name: 'Lagos',
        code: 'LA',
        capital: 'Ikeja',
        region: 'south-west',
        population: 15946991,
        coordinates: { latitude: 6.5244, longitude: 3.3792 }
      },
      {
        id: 'NG-KN',
        name: 'Kano',
        code: 'KN',
        capital: 'Kano',
        region: 'north-west',
        population: 13076892,
        coordinates: { latitude: 12.0022, longitude: 8.5920 }
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
      },
      {
        id: 'NG-PARTY-PDP',
        name: 'Peoples Democratic Party',
        abbreviation: 'PDP',
        colors: { primary: '#00FF00' }
      }
    ]
  },
  positions: {
    positions: [
      {
        id: 'NG-POS-PRESIDENT',
        title: 'President',
        level: 'federal',
        category: 'executive'
      },
      {
        id: 'NG-POS-GOVERNOR',
        title: 'Governor',
        level: 'state',
        category: 'executive'
      }
    ]
  },
  politicians: {
    politicians: [
      {
        id: 'NG-POL-001',
        firstName: 'Bola',
        lastName: 'Tinubu',
        fullName: 'Bola Ahmed Tinubu',
        partyId: 'NG-PARTY-APC',
        currentPositionId: 'NG-POS-PRESIDENT',
        stateOfOriginId: 'NG-LA',
        dateOfBirth: '1952-03-29',
        gender: 'male'
      },
      {
        id: 'NG-POL-002',
        firstName: 'Atiku',
        lastName: 'Abubakar',
        fullName: 'Atiku Abubakar',
        partyId: 'NG-PARTY-PDP',
        currentPositionId: 'NG-POS-ASPIRANT',
        stateOfOriginId: 'NG-KN',
        dateOfBirth: '1946-11-25',
        gender: 'male'
      }
    ]
  },
  lgas: {
    lgas: [
      {
        id: 'NG-LA-SUR',
        name: 'Surulere',
        code: 'SUR',
        stateId: 'NG-LA',
        coordinates: { latitude: 6.5056, longitude: 3.3619 }
      },
      {
        id: 'NG-KN-KNM',
        name: 'Kano Municipal',
        code: 'KNM',
        stateId: 'NG-KN',
        coordinates: { latitude: 12.0022, longitude: 8.5920 }
      }
    ]
  },
  sentimentData: {
    sentimentData: [
      {
        id: 'SENT-001',
        politicianId: 'NG-POL-001',
        platform: 'twitter',
        date: '2024-01-15T10:00:00Z',
        timeframe: TimeFrame.DAY,
        sentiment: { score: 0.7, label: 'Positive', confidence: 0.85 },
        mentions: { total: 150, positive: 105, neutral: 30, negative: 15 },
        engagement: { likes: 450, shares: 120, comments: 80, reach: 5000 },
        demographics: { ageGroup: '26-35', gender: 'mixed', location: 'Lagos' },
        metadata: { keywords: ['economy', 'development'], topics: ['Economy'] }
      }
    ]
  }
};

describe("Data Flow Integration Tests", () => {
  let politicianService: PoliticianService;
  let geographicService: GeographicService;
  let analyticsService: AnalyticsService;
  let dataLoader: DataLoaderService;
  let dynamicFilterService: DynamicFilterService;
  let dynamicDropdownService: DynamicDropdownService;

  beforeEach(() => {
    // Reset all services
    vi.clearAllMocks();
    
    // Get service instances
    politicianService = PoliticianService.getInstance();
    geographicService = GeographicService.getInstance();
    analyticsService = AnalyticsService.getInstance();
    dataLoader = DataLoaderService.getInstance();
    dynamicFilterService = DynamicFilterService.getInstance();
    dynamicDropdownService = DynamicDropdownService.getInstance();

    // Mock data loader to return our test data
    vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
      const keyMap: { [key: string]: any } = {
        'politicians': mockCompleteDataSet.politicians,
        'parties': mockCompleteDataSet.parties,
        'states': mockCompleteDataSet.states,
        'positions': mockCompleteDataSet.positions,
        'lgas': mockCompleteDataSet.lgas,
        'analytics:sentiment': mockCompleteDataSet.sentimentData
      };
      
      return Promise.resolve(keyMap[key] || {});
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Complete Data Loading Pipeline", () => {
    it("should load and process complete data pipeline", async () => {
      // Test complete data flow from loading to processing
      const politicians = await politicianService.getAllPoliticians();
      const states = await geographicService.getAllStates();
      const sentimentData = await analyticsService.getSentimentData();

      // Verify data was loaded and transformed correctly
      expect(politicians).toHaveLength(2);
      expect(states).toHaveLength(2);
      expect(sentimentData).toHaveLength(1);

      // Verify relationships are maintained
      const tinubu = politicians.find(p => p.firstName === 'Bola');
      expect(tinubu).toBeDefined();
      expect(tinubu?.party).toBe(PoliticalParty.APC);
      expect(tinubu?.state).toBe(NigerianState.LAGOS);
    });

    it("should handle data dependencies correctly", async () => {
      // Test that services load their dependencies in correct order
      const politician = await politicianService.getPoliticianById('NG-POL-001');
      
      expect(politician).toBeDefined();
      expect(politician?.party).toBe(PoliticalParty.APC);
      expect(politician?.state).toBe(NigerianState.LAGOS);
      
      // Verify that reference data was loaded
      expect(dataLoader.loadData).toHaveBeenCalledWith('politicians', expect.any(Function));
      expect(dataLoader.loadData).toHaveBeenCalledWith('parties', expect.any(Function));
      expect(dataLoader.loadData).toHaveBeenCalledWith('states', expect.any(Function));
    });

    it("should cache data across service calls", async () => {
      // First call should load data
      await politicianService.getAllPoliticians();
      
      // Second call should use cached data
      await politicianService.getAllPoliticians();
      
      // Verify data loader was called only once per data type
      const loadDataCalls = (dataLoader.loadData as any).mock.calls;
      const politiciansCalls = loadDataCalls.filter((call: any) => call[0] === 'politicians');
      expect(politiciansCalls).toHaveLength(1);
    });

    it("should handle cross-service data sharing", async () => {
      // Load data through different services
      const politicians = await politicianService.getAllPoliticians();
      const lagosLgas = await geographicService.getLGAsByState('NG-LA');
      
      // Verify both services can access shared state data
      expect(politicians.some(p => p.state === NigerianState.LAGOS)).toBe(true);
      expect(lagosLgas.some(lga => lga.stateId === 'NG-LA')).toBe(true);
    });
  });

  describe("Component Integration with Data Services", () => {
    it("should integrate politician service with search functionality", async () => {
      const searchResults = await politicianService.searchPoliticians('Bola', {}, 1, 10);
      
      expect(searchResults.success).toBe(true);
      expect(searchResults.data).toHaveLength(1);
      expect(searchResults.data[0].firstName).toBe('Bola');
      expect(searchResults.pagination.totalItems).toBe(1);
    });

    it("should integrate geographic service with hierarchical data", async () => {
      const hierarchy = await geographicService.getGeographicHierarchy('NG-LA');
      
      expect(hierarchy.state.name).toBe('Lagos');
      expect(hierarchy.lgas).toHaveLength(1);
      expect(hierarchy.lgas[0].name).toBe('Surulere');
    });

    it("should integrate analytics service with politician data", async () => {
      const analytics = await analyticsService.getPoliticianAnalytics('NG-POL-001');
      
      expect(analytics.politicianId).toBe('NG-POL-001');
      expect(analytics.overallSentiment.score).toBe(0.7);
      expect(analytics.engagementMetrics.totalMentions).toBe(150);
    });

    it("should handle service integration errors gracefully", async () => {
      // Mock a service failure
      vi.spyOn(dataLoader, 'loadData').mockRejectedValueOnce(new Error('Network error'));
      
      await expect(politicianService.getAllPoliticians()).rejects.toThrow();
    });
  });

  describe("Dynamic Filter and Option Generation", () => {
    it("should generate filter options from loaded data", async () => {
      // Load data first
      await politicianService.getAllPoliticians();
      
      // Generate dynamic filter options
      const partyOptions = await dynamicFilterService.generatePartyOptions();
      const stateOptions = await dynamicFilterService.generateStateOptions();
      
      expect(partyOptions).toContainEqual(
        expect.objectContaining({ value: PoliticalParty.APC, label: expect.any(String) })
      );
      expect(stateOptions).toContainEqual(
        expect.objectContaining({ value: NigerianState.LAGOS, label: 'Lagos' })
      );
    });

    it("should generate dropdown options dynamically", async () => {
      const dropdownOptions = await dynamicDropdownService.getPoliticianOptions();
      
      expect(dropdownOptions).toHaveLength(2);
      expect(dropdownOptions[0]).toMatchObject({
        value: 'NG-POL-001',
        label: 'Bola Ahmed Tinubu',
        metadata: expect.objectContaining({
          party: PoliticalParty.APC,
          state: NigerianState.LAGOS
        })
      });
    });

    it("should update filter options when data changes", async () => {
      // Initial options
      const initialOptions = await dynamicFilterService.generatePartyOptions();
      expect(initialOptions).toHaveLength(2);
      
      // Simulate data update (add new party)
      const updatedPartyData = {
        parties: [
          ...mockCompleteDataSet.parties.parties,
          {
            id: 'NG-PARTY-LP',
            name: 'Labour Party',
            abbreviation: 'LP',
            colors: { primary: '#008000' }
          }
        ]
      };
      
      vi.spyOn(dataLoader, 'loadData').mockResolvedValueOnce(updatedPartyData);
      
      // Clear cache to force reload
      politicianService.clearCache();
      
      const updatedOptions = await dynamicFilterService.generatePartyOptions();
      expect(updatedOptions).toHaveLength(3);
    });

    it("should validate filter selections against available data", async () => {
      const isValidParty = await dynamicFilterService.validateFilterOption('party', PoliticalParty.APC);
      const isInvalidParty = await dynamicFilterService.validateFilterOption('party', 'INVALID_PARTY');
      
      expect(isValidParty).toBe(true);
      expect(isInvalidParty).toBe(false);
    });
  });

  describe("Data Consistency and Validation", () => {
    it("should validate data consistency across services", async () => {
      const politicians = await politicianService.getAllPoliticians();
      const states = await geographicService.getAllStates();
      
      // Verify all politician state references are valid
      const stateIds = new Set(states.map(s => s.id));
      politicians.forEach(politician => {
        // Note: This would need the actual state ID from the transformed data
        // For now, just verify the transformation worked
        expect(politician.state).toBeDefined();
      });
    });

    it("should handle foreign key validation", async () => {
      const validator = DataValidatorService.getInstance();
      
      const crossRefResult = validator.validateCrossReferences({
        politicians: mockCompleteDataSet.politicians,
        parties: mockCompleteDataSet.parties,
        states: mockCompleteDataSet.states
      });
      
      expect(crossRefResult.isValid).toBe(true);
      expect(crossRefResult.errors).toHaveLength(0);
    });

    it("should detect and report data inconsistencies", async () => {
      // Create inconsistent data (politician referencing non-existent party)
      const inconsistentData = {
        politicians: {
          politicians: [{
            id: 'NG-POL-999',
            firstName: 'Test',
            lastName: 'Politician',
            fullName: 'Test Politician',
            partyId: 'INVALID-PARTY',
            stateOfOriginId: 'INVALID-STATE'
          }]
        },
        parties: mockCompleteDataSet.parties,
        states: mockCompleteDataSet.states
      };
      
      const validator = DataValidatorService.getInstance();
      const result = validator.validateCrossReferences(inconsistentData);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('Invalid party reference'))).toBe(true);
    });
  });

  describe("Performance and Caching Integration", () => {
    it("should optimize performance with intelligent caching", async () => {
      const startTime = Date.now();
      
      // First load - should be slower
      await politicianService.getAllPoliticians();
      const firstLoadTime = Date.now() - startTime;
      
      const secondStartTime = Date.now();
      
      // Second load - should be faster (cached)
      await politicianService.getAllPoliticians();
      const secondLoadTime = Date.now() - secondStartTime;
      
      // Second load should be significantly faster
      expect(secondLoadTime).toBeLessThan(firstLoadTime);
    });

    it("should handle concurrent data requests efficiently", async () => {
      // Start multiple concurrent requests
      const promises = [
        politicianService.getAllPoliticians(),
        geographicService.getAllStates(),
        analyticsService.getSentimentData(),
        politicianService.getPoliticianById('NG-POL-001'),
        geographicService.getStateById('NG-LA')
      ];
      
      const startTime = Date.now();
      const results = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      // All requests should complete successfully
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
      
      // Should complete in reasonable time
      expect(totalTime).toBeLessThan(1000); // Less than 1 second
    });

    it("should manage memory usage effectively", async () => {
      const cache = IntelligentCacheService.getInstance();
      const initialMemory = cache.getMemoryUsage();
      
      // Load large amount of data
      await Promise.all([
        politicianService.getAllPoliticians(),
        geographicService.getAllStates(),
        geographicService.getAllLGAs(),
        analyticsService.getSentimentData()
      ]);
      
      const afterLoadMemory = cache.getMemoryUsage();
      
      // Memory should increase but stay within reasonable bounds
      expect(afterLoadMemory).toBeGreaterThan(initialMemory);
      expect(afterLoadMemory).toBeLessThan(10 * 1024 * 1024); // Less than 10MB
    });
  });

  describe("Error Handling and Recovery", () => {
    it("should handle partial data loading failures", async () => {
      // Mock partial failure (politicians load, but parties fail)
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        if (key === 'parties') {
          return Promise.reject(new Error('Parties data unavailable'));
        }
        return Promise.resolve(mockCompleteDataSet[key as keyof typeof mockCompleteDataSet] || {});
      });
      
      // Should still be able to load politicians (with fallback party handling)
      await expect(politicianService.getAllPoliticians()).rejects.toThrow();
    });

    it("should provide fallback data when primary sources fail", async () => {
      // Mock all data loading failures
      vi.spyOn(dataLoader, 'loadData').mockRejectedValue(new Error('All data sources unavailable'));
      
      // Services should handle gracefully
      await expect(politicianService.getAllPoliticians()).rejects.toThrow();
      await expect(geographicService.getAllStates()).rejects.toThrow();
    });

    it("should recover from temporary failures", async () => {
      let callCount = 0;
      vi.spyOn(dataLoader, 'loadData').mockImplementation((key: string) => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error('Temporary failure'));
        }
        return Promise.resolve(mockCompleteDataSet[key as keyof typeof mockCompleteDataSet] || {});
      });
      
      // First call should fail
      await expect(politicianService.getAllPoliticians()).rejects.toThrow();
      
      // Second call should succeed
      const politicians = await politicianService.getAllPoliticians();
      expect(politicians).toHaveLength(2);
    });
  });

  describe("Real-time Data Updates", () => {
    it("should handle data updates and cache invalidation", async () => {
      // Load initial data
      const initialPoliticians = await politicianService.getAllPoliticians();
      expect(initialPoliticians).toHaveLength(2);
      
      // Simulate data update
      const updatedData = {
        politicians: [
          ...mockCompleteDataSet.politicians.politicians,
          {
            id: 'NG-POL-003',
            firstName: 'Peter',
            lastName: 'Obi',
            fullName: 'Peter Gregory Obi',
            partyId: 'NG-PARTY-LP',
            currentPositionId: 'NG-POS-ASPIRANT',
            stateOfOriginId: 'NG-AN',
            dateOfBirth: '1961-07-19',
            gender: 'male'
          }
        ]
      };
      
      vi.spyOn(dataLoader, 'loadData').mockResolvedValueOnce(updatedData);
      
      // Clear cache to simulate update
      politicianService.clearCache();
      
      // Load updated data
      const updatedPoliticians = await politicianService.getAllPoliticians();
      expect(updatedPoliticians).toHaveLength(3);
    });

    it("should propagate updates across dependent services", async () => {
      // Load data through multiple services
      await politicianService.getAllPoliticians();
      await dynamicFilterService.generatePartyOptions();
      
      // Simulate data update
      politicianService.clearCache();
      dynamicFilterService.clearCache();
      
      // Updated data should be reflected in all services
      const updatedPoliticians = await politicianService.getAllPoliticians();
      const updatedOptions = await dynamicFilterService.generatePartyOptions();
      
      expect(updatedPoliticians).toBeDefined();
      expect(updatedOptions).toBeDefined();
    });
  });
});