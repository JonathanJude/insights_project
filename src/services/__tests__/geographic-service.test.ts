/**
 * Tests for Geographic Service
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorTypes } from "../../constants/enums/system-enums";
import { ERROR_MESSAGES } from "../../constants/messages/error-messages";
import type { LGA as JSONLga, PollingUnit as JSONPollingUnit, State as JSONState, Ward as JSONWard } from "../../types/data-models";
import { DataLoaderService } from "../data-loader";
import { DataValidatorService } from "../data-validation-framework";
import { GeographicService } from "../geographic-service";
import { IntelligentCacheService } from "../intelligent-cache";
import { NullSafeValidationService } from "../null-safe-validation";

// Mock data
const mockStatesData = {
  states: [
    {
      id: 'NG-LA',
      name: 'Lagos',
      code: 'LA',
      capital: 'Ikeja',
      region: 'south-west',
      population: 15946991,
      coordinates: { latitude: 6.5244, longitude: 3.3792 },
      metadata: { established: '1967-05-27', area_km2: 3345, timezone: 'WAT' }
    },
    {
      id: 'NG-KN',
      name: 'Kano',
      code: 'KN',
      capital: 'Kano',
      region: 'north-west',
      population: 13076892,
      coordinates: { latitude: 12.0022, longitude: 8.5920 },
      metadata: { established: '1967-05-27', area_km2: 20131, timezone: 'WAT' }
    }
  ] as JSONState[]
};

const mockLgasData = {
  lgas: [
    {
      id: 'NG-LA-SUR',
      name: 'Surulere',
      code: 'SUR',
      stateId: 'NG-LA',
      coordinates: { latitude: 6.5056, longitude: 3.3619 },
      metadata: { area_km2: 23.0, population: 503975 }
    },
    {
      id: 'NG-LA-IKJ',
      name: 'Ikeja',
      code: 'IKJ',
      stateId: 'NG-LA',
      coordinates: { latitude: 6.5954, longitude: 3.3364 },
      metadata: { area_km2: 49.92, population: 313196 }
    },
    {
      id: 'NG-KN-KNM',
      name: 'Kano Municipal',
      code: 'KNM',
      stateId: 'NG-KN',
      coordinates: { latitude: 12.0022, longitude: 8.5920 },
      metadata: { area_km2: 137, population: 365525 }
    }
  ] as JSONLga[]
};

const mockWardsData = {
  wards: [
    {
      id: 'NG-LA-SUR-W01',
      number: 1,
      name: 'Aguda/Surulere',
      lgaId: 'NG-LA-SUR',
      stateId: 'NG-LA',
      coordinates: { latitude: 6.5089, longitude: 3.3654 },
      metadata: { area_km2: 2.1, population: 45230, registeredVoters: 28450 }
    },
    {
      id: 'NG-LA-SUR-W02',
      number: 2,
      name: 'Coker/Aguda',
      lgaId: 'NG-LA-SUR',
      stateId: 'NG-LA',
      coordinates: { latitude: 6.5123, longitude: 3.3687 },
      metadata: { area_km2: 1.8, population: 38920, registeredVoters: 24680 }
    }
  ] as JSONWard[]
};

const mockPollingUnitsData = {
  pollingUnits: [
    {
      id: 'NG-LA-SUR-W01-PU001',
      code: 'SUR/001/001',
      name: 'Aguda Primary School I',
      wardId: 'NG-LA-SUR-W01',
      lgaId: 'NG-LA-SUR',
      stateId: 'NG-LA',
      address: 'No. 15 Aguda Street, Surulere, Lagos',
      coordinates: { latitude: 6.5092, longitude: 3.3658 },
      capacity: { maxVoters: 500, registeredVoters: 487 },
      facilities: { accessible: true, hasElectricity: true, hasWater: false, securityLevel: 'medium' },
      metadata: { established: '1999', lastUpdated: '2023-12-15', status: 'active' }
    },
    {
      id: 'NG-LA-SUR-W01-PU002',
      code: 'SUR/001/002',
      name: 'Aguda Primary School II',
      wardId: 'NG-LA-SUR-W01',
      lgaId: 'NG-LA-SUR',
      stateId: 'NG-LA',
      address: 'No. 15 Aguda Street, Surulere, Lagos',
      coordinates: { latitude: 6.5094, longitude: 3.3660 },
      capacity: { maxVoters: 500, registeredVoters: 456 },
      facilities: { accessible: true, hasElectricity: true, hasWater: true, securityLevel: 'medium' },
      metadata: { established: '1999', lastUpdated: '2023-12-15', status: 'active' }
    }
  ] as JSONPollingUnit[]
};

describe("GeographicService", () => {
  let geographicService: GeographicService;
  let mockDataLoader: any;
  let mockCache: any;
  let mockValidator: any;
  let mockNullSafeValidator: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock DataLoaderService
    mockDataLoader = {
      loadData: vi.fn(),
      getMetrics: vi.fn(() => ({ totalRequests: 0, cacheHits: 0 }))
    };
    vi.spyOn(DataLoaderService, 'getInstance').mockReturnValue(mockDataLoader);

    // Mock IntelligentCacheService
    mockCache = {
      get: vi.fn(),
      set: vi.fn(),
      clear: vi.fn(),
      getMetrics: vi.fn(() => ({ size: 0, hitRate: 0 }))
    };
    vi.spyOn(IntelligentCacheService, 'getInstance').mockReturnValue(mockCache);

    // Mock DataValidatorService
    mockValidator = {
      validateStatesData: vi.fn(() => ({ isValid: true, errors: [] })),
      validateLGAsData: vi.fn(() => ({ isValid: true, errors: [] })),
      validateWardsData: vi.fn(() => ({ isValid: true, errors: [] })),
      validatePollingUnitsData: vi.fn(() => ({ isValid: true, errors: [] }))
    };
    vi.spyOn(DataValidatorService, 'getInstance').mockReturnValue(mockValidator);

    // Mock NullSafeValidationService
    mockNullSafeValidator = {};
    vi.spyOn(NullSafeValidationService, 'getInstance').mockReturnValue(mockNullSafeValidator);

    geographicService = GeographicService.getInstance();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getAllStates", () => {
    it("should load all states successfully", async () => {
      mockDataLoader.loadData.mockResolvedValue(mockStatesData);

      const result = await geographicService.getAllStates();

      expect(result).toEqual(mockStatesData.states);
      expect(mockDataLoader.loadData).toHaveBeenCalledWith(
        'geographic:states',
        expect.any(Function)
      );
      expect(mockValidator.validateStatesData).toHaveBeenCalledWith(mockStatesData);
    });

    it("should handle validation warnings", async () => {
      mockValidator.validateStatesData.mockReturnValue({
        isValid: false,
        errors: ['Missing population data']
      });
      mockDataLoader.loadData.mockResolvedValue(mockStatesData);

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await geographicService.getAllStates();

      expect(result).toEqual(mockStatesData.states);
      expect(consoleSpy).toHaveBeenCalledWith(
        'States data validation issues:',
        ['Missing population data']
      );

      consoleSpy.mockRestore();
    });

    it("should handle data loading errors", async () => {
      mockDataLoader.loadData.mockRejectedValue(new Error('Network error'));

      await expect(geographicService.getAllStates()).rejects.toThrow(
        ERROR_MESSAGES[ErrorTypes.DATA_LOADING_ERROR]
      );
    });
  });

  describe("getStateById", () => {
    it("should return state from cache", async () => {
      const mockState = mockStatesData.states[0];
      mockCache.get.mockReturnValue(mockState);

      const result = await geographicService.getStateById('NG-LA');

      expect(result).toEqual(mockState);
      expect(mockCache.get).toHaveBeenCalledWith('geographic:state:NG-LA');
    });

    it("should load state if not cached", async () => {
      mockCache.get.mockReturnValue(null);
      mockDataLoader.loadData.mockResolvedValue(mockStatesData);

      const result = await geographicService.getStateById('NG-LA');

      expect(result).toEqual(mockStatesData.states[0]);
      expect(mockCache.set).toHaveBeenCalledWith(
        'geographic:state:NG-LA',
        mockStatesData.states[0],
        30 * 60 * 1000
      );
    });

    it("should return null for non-existent state", async () => {
      mockCache.get.mockReturnValue(null);
      mockDataLoader.loadData.mockResolvedValue(mockStatesData);

      const result = await geographicService.getStateById('NON-EXISTENT');

      expect(result).toBeNull();
    });

    it("should throw error for invalid state ID", async () => {
      await expect(geographicService.getStateById('')).rejects.toThrow(
        ERROR_MESSAGES[ErrorTypes.VALIDATION_ERROR]
      );
    });
  });

  describe("getAllLGAs", () => {
    it("should load all LGAs successfully", async () => {
      mockDataLoader.loadData.mockResolvedValue(mockLgasData);

      const result = await geographicService.getAllLGAs();

      expect(result).toEqual(mockLgasData.lgas);
      expect(mockValidator.validateLGAsData).toHaveBeenCalledWith(mockLgasData);
    });
  });

  describe("getLGAsByState", () => {
    it("should return LGAs filtered by state", async () => {
      mockCache.get.mockReturnValue(null);
      mockDataLoader.loadData
        .mockResolvedValueOnce(mockStatesData) // for state validation
        .mockResolvedValueOnce(mockLgasData);

      const result = await geographicService.getLGAsByState('NG-LA');

      expect(result).toHaveLength(2);
      expect(result.every(lga => lga.stateId === 'NG-LA')).toBe(true);
      expect(mockCache.set).toHaveBeenCalled();
    });

    it("should throw error for non-existent state", async () => {
      mockCache.get.mockReturnValue(null);
      mockDataLoader.loadData.mockResolvedValue(mockStatesData);

      await expect(geographicService.getLGAsByState('NON-EXISTENT')).rejects.toThrow(
        'State with ID NON-EXISTENT not found'
      );
    });

    it("should validate geographic relationships", async () => {
      mockCache.get.mockReturnValue(null);
      mockDataLoader.loadData
        .mockResolvedValueOnce(mockStatesData)
        .mockResolvedValueOnce(mockLgasData);

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await geographicService.getLGAsByState('NG-LA');

      // Should not log warnings for valid data
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("getAllWards", () => {
    it("should load all wards successfully", async () => {
      mockDataLoader.loadData.mockResolvedValue(mockWardsData);

      const result = await geographicService.getAllWards();

      expect(result).toEqual(mockWardsData.wards);
      expect(mockValidator.validateWardsData).toHaveBeenCalledWith(mockWardsData);
    });
  });

  describe("getWardsByLGA", () => {
    it("should return wards filtered by LGA", async () => {
      mockCache.get.mockReturnValue(null);
      mockDataLoader.loadData.mockResolvedValue(mockWardsData);

      const result = await geographicService.getWardsByLGA('NG-LA-SUR');

      expect(result).toHaveLength(2);
      expect(result.every(ward => ward.lgaId === 'NG-LA-SUR')).toBe(true);
    });
  });

  describe("getWardsByState", () => {
    it("should return wards filtered by state", async () => {
      mockCache.get.mockReturnValue(null);
      mockDataLoader.loadData.mockResolvedValue(mockWardsData);

      const result = await geographicService.getWardsByState('NG-LA');

      expect(result).toHaveLength(2);
      expect(result.every(ward => ward.stateId === 'NG-LA')).toBe(true);
    });
  });

  describe("getAllPollingUnits", () => {
    it("should load all polling units successfully", async () => {
      mockDataLoader.loadData.mockResolvedValue(mockPollingUnitsData);

      const result = await geographicService.getAllPollingUnits();

      expect(result).toEqual(mockPollingUnitsData.pollingUnits);
      expect(mockValidator.validatePollingUnitsData).toHaveBeenCalledWith(mockPollingUnitsData);
    });
  });

  describe("getPollingUnitsByWard", () => {
    it("should return polling units filtered by ward", async () => {
      mockCache.get.mockReturnValue(null);
      mockDataLoader.loadData.mockResolvedValue(mockPollingUnitsData);

      const result = await geographicService.getPollingUnitsByWard('NG-LA-SUR-W01');

      expect(result).toHaveLength(2);
      expect(result.every(pu => pu.wardId === 'NG-LA-SUR-W01')).toBe(true);
    });
  });

  describe("getPollingUnitsByLGA", () => {
    it("should return polling units filtered by LGA", async () => {
      mockCache.get.mockReturnValue(null);
      mockDataLoader.loadData.mockResolvedValue(mockPollingUnitsData);

      const result = await geographicService.getPollingUnitsByLGA('NG-LA-SUR');

      expect(result).toHaveLength(2);
      expect(result.every(pu => pu.lgaId === 'NG-LA-SUR')).toBe(true);
    });
  });

  describe("getPollingUnitsByState", () => {
    it("should return polling units filtered by state", async () => {
      mockCache.get.mockReturnValue(null);
      mockDataLoader.loadData.mockResolvedValue(mockPollingUnitsData);

      const result = await geographicService.getPollingUnitsByState('NG-LA');

      expect(result).toHaveLength(2);
      expect(result.every(pu => pu.stateId === 'NG-LA')).toBe(true);
    });
  });

  describe("getGeographicHierarchy", () => {
    it("should return complete geographic hierarchy", async () => {
      mockCache.get.mockReturnValue(null);
      mockDataLoader.loadData
        .mockResolvedValueOnce(mockStatesData)
        .mockResolvedValueOnce(mockLgasData)
        .mockResolvedValueOnce(mockWardsData)
        .mockResolvedValueOnce(mockPollingUnitsData);

      const result = await geographicService.getGeographicHierarchy('NG-LA');

      expect(result.state).toEqual(mockStatesData.states[0]);
      expect(result.lgas).toHaveLength(2);
      expect(result.wards).toHaveLength(2);
      expect(result.pollingUnits).toHaveLength(2);
      expect(mockCache.set).toHaveBeenCalled();
    });

    it("should throw error for non-existent state", async () => {
      mockCache.get.mockReturnValue(null);
      mockDataLoader.loadData.mockResolvedValue(mockStatesData);

      await expect(geographicService.getGeographicHierarchy('NON-EXISTENT')).rejects.toThrow(
        'State with ID NON-EXISTENT not found'
      );
    });

    it("should validate complete hierarchy", async () => {
      mockCache.get.mockReturnValue(null);
      mockDataLoader.loadData
        .mockResolvedValueOnce(mockStatesData)
        .mockResolvedValueOnce(mockLgasData)
        .mockResolvedValueOnce(mockWardsData)
        .mockResolvedValueOnce(mockPollingUnitsData);

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await geographicService.getGeographicHierarchy('NG-LA');

      // Should not log warnings for valid hierarchy
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe("getGeographicBounds", () => {
    it("should calculate bounds for state", async () => {
      mockDataLoader.loadData.mockResolvedValue(mockLgasData);

      const result = await geographicService.getGeographicBounds('state', 'NG-LA');

      expect(result).toHaveProperty('north');
      expect(result).toHaveProperty('south');
      expect(result).toHaveProperty('east');
      expect(result).toHaveProperty('west');
      expect(result).toHaveProperty('center');
      expect(result.center).toHaveProperty('latitude');
      expect(result.center).toHaveProperty('longitude');
    });

    it("should calculate bounds for LGA", async () => {
      mockDataLoader.loadData.mockResolvedValue(mockWardsData);

      const result = await geographicService.getGeographicBounds('lga', 'NG-LA-SUR');

      expect(result).toHaveProperty('center');
    });

    it("should calculate bounds for ward", async () => {
      mockDataLoader.loadData.mockResolvedValue(mockPollingUnitsData);

      const result = await geographicService.getGeographicBounds('ward', 'NG-LA-SUR-W01');

      expect(result).toHaveProperty('center');
    });

    it("should throw error for empty coordinates", async () => {
      mockDataLoader.loadData.mockResolvedValue({ lgas: [] });

      await expect(geographicService.getGeographicBounds('state', 'EMPTY')).rejects.toThrow(
        ERROR_MESSAGES[ErrorTypes.DATA_PROCESSING_ERROR]
      );
    });
  });

  describe("searchGeographic", () => {
    beforeEach(() => {
      mockDataLoader.loadData
        .mockResolvedValueOnce(mockStatesData)
        .mockResolvedValueOnce(mockLgasData)
        .mockResolvedValueOnce(mockWardsData)
        .mockResolvedValueOnce(mockPollingUnitsData);
    });

    it("should search states by name", async () => {
      const result = await geographicService.searchGeographic('Lagos');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('state');
      expect(result[0].name).toBe('Lagos');
    });

    it("should search LGAs by name", async () => {
      const result = await geographicService.searchGeographic('Surulere');

      expect(result.some(r => r.type === 'lga' && r.name === 'Surulere')).toBe(true);
    });

    it("should search wards by name", async () => {
      const result = await geographicService.searchGeographic('Aguda');

      expect(result.some(r => r.type === 'ward' && r.name.includes('Aguda'))).toBe(true);
    });

    it("should search polling units by name", async () => {
      const result = await geographicService.searchGeographic('Primary School');

      expect(result.some(r => r.type === 'polling-unit' && r.name.includes('Primary School'))).toBe(true);
    });

    it("should return empty array for short query", async () => {
      const result = await geographicService.searchGeographic('L');

      expect(result).toEqual([]);
    });

    it("should limit search results", async () => {
      const result = await geographicService.searchGeographic('a', 1);

      expect(result.length).toBeLessThanOrEqual(1);
    });

    it("should sort results by relevance", async () => {
      const result = await geographicService.searchGeographic('Lagos');

      // Exact match should come first
      expect(result[0].name).toBe('Lagos');
    });
  });

  describe("getGeographicSummary", () => {
    it("should return geographic summary statistics", async () => {
      mockDataLoader.loadData
        .mockResolvedValueOnce(mockStatesData)
        .mockResolvedValueOnce(mockLgasData)
        .mockResolvedValueOnce(mockWardsData)
        .mockResolvedValueOnce(mockPollingUnitsData);

      const result = await geographicService.getGeographicSummary();

      expect(result).toMatchObject({
        totalStates: 2,
        totalLgas: 3,
        totalWards: 2,
        totalPollingUnits: 2,
        totalRegisteredVoters: 943, // 487 + 456
        averagePollingUnitsPerWard: 1,
        averageWardsPerLga: 2/3,
        averageLgasPerState: 1.5
      });
    });
  });

  describe("validation", () => {
    it("should validate geographic relationships with errors", () => {
      const invalidEntities = [
        { id: '', name: 'Test', coordinates: { latitude: 200, longitude: 200 } }
      ];

      // Access private method through any cast for testing
      const service = geographicService as any;
      const result = service.validateGeographicRelationships(invalidEntities, 'test', 'parent');

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should validate complete hierarchy with relationship errors", () => {
      const invalidHierarchy = {
        state: mockStatesData.states[0],
        lgas: [{ ...mockLgasData.lgas[0], stateId: 'WRONG-STATE' }],
        wards: mockWardsData.wards,
        pollingUnits: mockPollingUnitsData.pollingUnits
      };

      // Access private method through any cast for testing
      const service = geographicService as any;
      const result = service.validateCompleteHierarchy(invalidHierarchy);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('incorrect state reference'))).toBe(true);
    });
  });

  describe("cache management", () => {
    it("should clear cache", () => {
      geographicService.clearCache();
      expect(mockCache.clear).toHaveBeenCalled();
    });

    it("should return service metrics", () => {
      const metrics = geographicService.getMetrics();
      
      expect(metrics).toHaveProperty('cache');
      expect(metrics).toHaveProperty('dataLoader');
    });
  });

  describe("error handling", () => {
    it("should handle data loading errors", async () => {
      mockDataLoader.loadData.mockRejectedValue(new Error('Network error'));

      await expect(geographicService.getAllStates()).rejects.toThrow(
        ERROR_MESSAGES[ErrorTypes.DATA_LOADING_ERROR]
      );
    });

    it("should handle search errors", async () => {
      mockDataLoader.loadData.mockRejectedValue(new Error('Search failed'));

      await expect(geographicService.searchGeographic('test')).rejects.toThrow(
        ERROR_MESSAGES[ErrorTypes.SEARCH_ERROR]
      );
    });

    it("should handle processing errors", async () => {
      mockDataLoader.loadData.mockRejectedValue(new Error('Processing failed'));

      await expect(geographicService.getGeographicSummary()).rejects.toThrow(
        ERROR_MESSAGES[ErrorTypes.DATA_PROCESSING_ERROR]
      );
    });
  });
});