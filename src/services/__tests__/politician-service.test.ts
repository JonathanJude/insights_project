/**
 * Tests for Politician Service
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorTypes } from "../../constants/enums/system-enums";
import { ERROR_MESSAGES } from "../../constants/messages/error-messages";
import { AgeGroup, Gender, NigerianState, PoliticalParty } from "../../types";
import type { PoliticalParty as JSONPoliticalParty, Politician as JSONPolitician, Position as JSONPosition, State as JSONState } from "../../types/data-models";
import { DataLoaderService } from "../data-loader";
import { DataValidatorService } from "../data-validation-framework";
import { IntelligentCacheService } from "../intelligent-cache";
import { NullSafeValidationService } from "../null-safe-validation";
import { PoliticianService } from "../politician-service";

// Mock data
const mockPoliticiansData = {
  politicians: [
    {
      id: 'NG-POL-001',
      firstName: 'Peter',
      lastName: 'Obi',
      fullName: 'Peter Gregory Obi',
      partyId: 'NG-PARTY-LP',
      currentPositionId: 'NG-POS-ASPIRANT',
      stateOfOriginId: 'NG-AN',
      dateOfBirth: '1961-07-19',
      gender: 'male',
      socialMedia: {
        twitter: '@PeterObi',
        facebook: 'PeterObiOfficial'
      },
      metadata: {
        isActive: true,
        verificationStatus: 'verified',
        lastUpdated: '2024-01-15T09:00:00Z'
      }
    },
    {
      id: 'NG-POL-002',
      firstName: 'Bola',
      lastName: 'Tinubu',
      fullName: 'Bola Ahmed Tinubu',
      partyId: 'NG-PARTY-APC',
      currentPositionId: 'NG-POS-PRESIDENT',
      stateOfOriginId: 'NG-LA',
      dateOfBirth: '1952-03-29',
      gender: 'male',
      socialMedia: {
        twitter: '@officialABAT'
      },
      metadata: {
        isActive: true,
        verificationStatus: 'verified',
        lastUpdated: '2024-01-15T09:00:00Z'
      }
    }
  ] as JSONPolitician[]
};

const mockPartiesData = {
  parties: [
    {
      id: 'NG-PARTY-LP',
      name: 'Labour Party',
      abbreviation: 'LP',
      colors: { primary: '#008000' }
    },
    {
      id: 'NG-PARTY-APC',
      name: 'All Progressives Congress',
      abbreviation: 'APC',
      colors: { primary: '#FF0000' }
    }
  ] as JSONPoliticalParty[]
};

const mockStatesData = {
  states: [
    {
      id: 'NG-AN',
      name: 'Anambra',
      code: 'AN',
      capital: 'Awka',
      region: 'south-east',
      coordinates: { latitude: 6.2209, longitude: 6.9909 }
    },
    {
      id: 'NG-LA',
      name: 'Lagos',
      code: 'LA',
      capital: 'Ikeja',
      region: 'south-west',
      coordinates: { latitude: 6.5244, longitude: 3.3792 }
    }
  ] as JSONState[]
};

const mockPositionsData = {
  positions: [
    {
      id: 'NG-POS-PRESIDENT',
      title: 'President',
      level: 'federal',
      category: 'executive'
    },
    {
      id: 'NG-POS-ASPIRANT',
      title: 'Aspirant',
      level: 'federal',
      category: 'aspirant'
    }
  ] as JSONPosition[]
};

describe("PoliticianService", () => {
  let politicianService: PoliticianService;
  let mockDataLoader: any;
  let mockCache: any;
  let mockValidator: any;
  let mockNullSafeValidator: any;

  beforeEach(() => {
    // Reset all singletons
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
      validatePoliticiansData: vi.fn(() => ({ isValid: true, errors: [] }))
    };
    vi.spyOn(DataValidatorService, 'getInstance').mockReturnValue(mockValidator);

    // Mock NullSafeValidationService
    mockNullSafeValidator = {
      validatePolitician: vi.fn(() => ({ isValid: true, warnings: [] }))
    };
    vi.spyOn(NullSafeValidationService, 'getInstance').mockReturnValue(mockNullSafeValidator);

    // Create fresh service instance
    politicianService = PoliticianService.getInstance();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getAllPoliticians", () => {
    it("should load and transform politicians successfully", async () => {
      // Setup mocks
      mockDataLoader.loadData
        .mockResolvedValueOnce(mockPoliticiansData)
        .mockResolvedValueOnce(mockPartiesData)
        .mockResolvedValueOnce(mockStatesData)
        .mockResolvedValueOnce(mockPositionsData);

      const result = await politicianService.getAllPoliticians();

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'NG-POL-001',
        name: 'Peter Gregory Obi',
        firstName: 'Peter',
        lastName: 'Obi',
        party: PoliticalParty.LP,
        state: NigerianState.ANAMBRA,
        gender: Gender.MALE,
        ageGroup: AgeGroup.SENIOR
      });
    });

    it("should handle data loading errors", async () => {
      mockDataLoader.loadData.mockRejectedValue(new Error('Network error'));

      await expect(politicianService.getAllPoliticians()).rejects.toThrow(
        ERROR_MESSAGES[ErrorTypes.DATA_LOADING_ERROR]
      );
    });

    it("should validate data and log warnings", async () => {
      mockValidator.validatePoliticiansData.mockReturnValue({
        isValid: false,
        errors: ['Missing required field']
      });

      mockDataLoader.loadData
        .mockResolvedValueOnce(mockPoliticiansData)
        .mockResolvedValueOnce(mockPartiesData)
        .mockResolvedValueOnce(mockStatesData)
        .mockResolvedValueOnce(mockPositionsData);

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await politicianService.getAllPoliticians();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Politicians data validation issues:',
        ['Missing required field']
      );

      consoleSpy.mockRestore();
    });

    it("should handle politician transformation errors gracefully", async () => {
      const invalidPolitician = { ...mockPoliticiansData.politicians[0], id: null };
      const invalidData = {
        politicians: [invalidPolitician, mockPoliticiansData.politicians[1]]
      };

      mockDataLoader.loadData
        .mockResolvedValueOnce(invalidData)
        .mockResolvedValueOnce(mockPartiesData)
        .mockResolvedValueOnce(mockStatesData)
        .mockResolvedValueOnce(mockPositionsData);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = await politicianService.getAllPoliticians();

      expect(result).toHaveLength(1); // Only valid politician returned
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("getPoliticianById", () => {
    it("should return politician by ID from cache", async () => {
      const mockPolitician = {
        id: 'NG-POL-001',
        name: 'Peter Gregory Obi',
        party: PoliticalParty.LP
      };

      mockCache.get.mockReturnValue(mockPolitician);

      const result = await politicianService.getPoliticianById('NG-POL-001');

      expect(result).toEqual(mockPolitician);
      expect(mockCache.get).toHaveBeenCalledWith('politician:NG-POL-001');
    });

    it("should load politician by ID if not cached", async () => {
      mockCache.get.mockReturnValue(null);
      mockDataLoader.loadData
        .mockResolvedValueOnce(mockPoliticiansData)
        .mockResolvedValueOnce(mockPartiesData)
        .mockResolvedValueOnce(mockStatesData)
        .mockResolvedValueOnce(mockPositionsData);

      const result = await politicianService.getPoliticianById('NG-POL-001');

      expect(result).toBeTruthy();
      expect(result?.id).toBe('NG-POL-001');
      expect(mockCache.set).toHaveBeenCalled();
    });

    it("should return null for non-existent politician", async () => {
      mockCache.get.mockReturnValue(null);
      mockDataLoader.loadData
        .mockResolvedValueOnce(mockPoliticiansData)
        .mockResolvedValueOnce(mockPartiesData)
        .mockResolvedValueOnce(mockStatesData)
        .mockResolvedValueOnce(mockPositionsData);

      const result = await politicianService.getPoliticianById('NON-EXISTENT');

      expect(result).toBeNull();
    });

    it("should throw error for invalid ID", async () => {
      await expect(politicianService.getPoliticianById('')).rejects.toThrow(
        ERROR_MESSAGES[ErrorTypes.VALIDATION_ERROR]
      );
    });
  });

  describe("getPoliticiansByParty", () => {
    it("should return politicians filtered by party from cache", async () => {
      const mockPoliticians = [
        { id: 'NG-POL-001', party: PoliticalParty.LP },
        { id: 'NG-POL-002', party: PoliticalParty.LP }
      ];

      mockCache.get.mockReturnValue(mockPoliticians);

      const result = await politicianService.getPoliticiansByParty(PoliticalParty.LP);

      expect(result).toEqual(mockPoliticians);
      expect(mockCache.get).toHaveBeenCalledWith('politicians:party:LP');
    });

    it("should load and filter politicians by party if not cached", async () => {
      mockCache.get.mockReturnValue(null);
      mockDataLoader.loadData
        .mockResolvedValueOnce(mockPoliticiansData)
        .mockResolvedValueOnce(mockPartiesData)
        .mockResolvedValueOnce(mockStatesData)
        .mockResolvedValueOnce(mockPositionsData);

      const result = await politicianService.getPoliticiansByParty(PoliticalParty.LP);

      expect(result).toHaveLength(1);
      expect(result[0].party).toBe(PoliticalParty.LP);
      expect(mockCache.set).toHaveBeenCalled();
    });
  });

  describe("getPoliticiansByState", () => {
    it("should return politicians filtered by state", async () => {
      mockCache.get.mockReturnValue(null);
      mockDataLoader.loadData
        .mockResolvedValueOnce(mockPoliticiansData)
        .mockResolvedValueOnce(mockPartiesData)
        .mockResolvedValueOnce(mockStatesData)
        .mockResolvedValueOnce(mockPositionsData);

      const result = await politicianService.getPoliticiansByState(NigerianState.LAGOS);

      expect(result).toHaveLength(1);
      expect(result[0].state).toBe(NigerianState.LAGOS);
    });
  });

  describe("searchPoliticians", () => {
    beforeEach(() => {
      mockCache.get.mockReturnValue(null);
      mockDataLoader.loadData
        .mockResolvedValueOnce(mockPoliticiansData)
        .mockResolvedValueOnce(mockPartiesData)
        .mockResolvedValueOnce(mockStatesData)
        .mockResolvedValueOnce(mockPositionsData);
    });

    it("should search politicians by name", async () => {
      const result = await politicianService.searchPoliticians('Peter');

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].firstName).toBe('Peter');
    });

    it("should filter politicians by party", async () => {
      const result = await politicianService.searchPoliticians('', {
        party: [PoliticalParty.APC]
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].party).toBe(PoliticalParty.APC);
    });

    it("should filter politicians by state", async () => {
      const result = await politicianService.searchPoliticians('', {
        state: [NigerianState.ANAMBRA]
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].state).toBe(NigerianState.ANAMBRA);
    });

    it("should filter politicians by gender", async () => {
      const result = await politicianService.searchPoliticians('', {
        gender: [Gender.MALE]
      });

      expect(result.data).toHaveLength(2);
      expect(result.data.every(p => p.gender === Gender.MALE)).toBe(true);
    });

    it("should sort politicians by name", async () => {
      const result = await politicianService.searchPoliticians('', {
        sortBy: 'name',
        sortOrder: 'asc'
      });

      expect(result.data[0].firstName).toBe('Bola');
      expect(result.data[1].firstName).toBe('Peter');
    });

    it("should paginate results correctly", async () => {
      const result = await politicianService.searchPoliticians('', {}, 1, 1);

      expect(result.data).toHaveLength(1);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.totalPages).toBe(2);
      expect(result.pagination.totalItems).toBe(2);
      expect(result.pagination.hasNext).toBe(true);
      expect(result.pagination.hasPrevious).toBe(false);
    });

    it("should return cached search results", async () => {
      const mockResult = {
        success: true,
        data: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: 20,
          hasNext: false,
          hasPrevious: false
        }
      };

      mockCache.get.mockReturnValue(mockResult);

      const result = await politicianService.searchPoliticians('test');

      expect(result).toEqual(mockResult);
      expect(mockDataLoader.loadData).not.toHaveBeenCalled();
    });
  });

  describe("getTrendingPoliticians", () => {
    it("should return trending politicians", async () => {
      mockDataLoader.loadData
        .mockResolvedValueOnce(mockPoliticiansData)
        .mockResolvedValueOnce(mockPartiesData)
        .mockResolvedValueOnce(mockStatesData)
        .mockResolvedValueOnce(mockPositionsData);

      const result = await politicianService.getTrendingPoliticians(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
    });

    it("should limit trending politicians count", async () => {
      mockDataLoader.loadData
        .mockResolvedValueOnce(mockPoliticiansData)
        .mockResolvedValueOnce(mockPartiesData)
        .mockResolvedValueOnce(mockStatesData)
        .mockResolvedValueOnce(mockPositionsData);

      const result = await politicianService.getTrendingPoliticians(10);

      expect(result.length).toBeLessThanOrEqual(10);
    });
  });

  describe("data transformation", () => {
    it("should map party ID to enum correctly", async () => {
      mockDataLoader.loadData
        .mockResolvedValueOnce(mockPoliticiansData)
        .mockResolvedValueOnce(mockPartiesData)
        .mockResolvedValueOnce(mockStatesData)
        .mockResolvedValueOnce(mockPositionsData);

      const result = await politicianService.getAllPoliticians();

      expect(result[0].party).toBe(PoliticalParty.LP);
      expect(result[1].party).toBe(PoliticalParty.APC);
    });

    it("should map state ID to enum correctly", async () => {
      mockDataLoader.loadData
        .mockResolvedValueOnce(mockPoliticiansData)
        .mockResolvedValueOnce(mockPartiesData)
        .mockResolvedValueOnce(mockStatesData)
        .mockResolvedValueOnce(mockPositionsData);

      const result = await politicianService.getAllPoliticians();

      expect(result[0].state).toBe(NigerianState.ANAMBRA);
      expect(result[1].state).toBe(NigerianState.LAGOS);
    });

    it("should calculate age group correctly", async () => {
      mockDataLoader.loadData
        .mockResolvedValueOnce(mockPoliticiansData)
        .mockResolvedValueOnce(mockPartiesData)
        .mockResolvedValueOnce(mockStatesData)
        .mockResolvedValueOnce(mockPositionsData);

      const result = await politicianService.getAllPoliticians();

      // Peter Obi born 1961 (62+ years old) = SENIOR
      expect(result[0].ageGroup).toBe(AgeGroup.SENIOR);
      // Bola Tinubu born 1952 (71+ years old) = SENIOR
      expect(result[1].ageGroup).toBe(AgeGroup.SENIOR);
    });

    it("should handle missing optional data gracefully", async () => {
      const incompleteData = {
        politicians: [{
          id: 'NG-POL-003',
          firstName: 'Test',
          lastName: 'Politician',
          fullName: 'Test Politician'
          // Missing optional fields
        }]
      };

      mockDataLoader.loadData
        .mockResolvedValueOnce(incompleteData)
        .mockResolvedValueOnce(mockPartiesData)
        .mockResolvedValueOnce(mockStatesData)
        .mockResolvedValueOnce(mockPositionsData);

      const result = await politicianService.getAllPoliticians();

      expect(result).toHaveLength(1);
      expect(result[0].party).toBe(PoliticalParty.OTHER);
      expect(result[0].state).toBe(NigerianState.FCT); // Default fallback
      expect(result[0].ageGroup).toBe(AgeGroup.ADULT); // Default fallback
    });
  });

  describe("cache management", () => {
    it("should clear cache", () => {
      politicianService.clearCache();
      expect(mockCache.clear).toHaveBeenCalled();
    });

    it("should return service metrics", () => {
      const metrics = politicianService.getMetrics();
      
      expect(metrics).toHaveProperty('cache');
      expect(metrics).toHaveProperty('dataLoader');
      expect(mockCache.getMetrics).toHaveBeenCalled();
      expect(mockDataLoader.getMetrics).toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should handle data loading errors gracefully", async () => {
      mockDataLoader.loadData.mockRejectedValue(new Error('Network timeout'));

      await expect(politicianService.getAllPoliticians()).rejects.toThrow(
        ERROR_MESSAGES[ErrorTypes.DATA_LOADING_ERROR]
      );
    });

    it("should handle search errors gracefully", async () => {
      mockCache.get.mockReturnValue(null);
      mockDataLoader.loadData.mockRejectedValue(new Error('Search failed'));

      await expect(politicianService.searchPoliticians('test')).rejects.toThrow(
        ERROR_MESSAGES[ErrorTypes.SEARCH_ERROR]
      );
    });
  });

  describe("null-safe validation", () => {
    it("should validate politicians with null-safe validator", async () => {
      mockNullSafeValidator.validatePolitician.mockReturnValue({
        isValid: false,
        warnings: ['Missing recommended field: dateOfBirth']
      });

      mockDataLoader.loadData
        .mockResolvedValueOnce(mockPoliticiansData)
        .mockResolvedValueOnce(mockPartiesData)
        .mockResolvedValueOnce(mockStatesData)
        .mockResolvedValueOnce(mockPositionsData);

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await politicianService.getAllPoliticians();

      expect(mockNullSafeValidator.validatePolitician).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});