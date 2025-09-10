/**
 * Tests for Politician Service
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PoliticianService } from '../politician-service';

// Mock the data loader
vi.mock('../data-loader', () => ({
  dataLoader: {
    loadData: vi.fn()
  }
}));

// Mock the validation services
vi.mock('../data-validation-framework', () => ({
  DataValidatorService: {
    getInstance: () => ({
      validatePoliticiansData: () => ({ isValid: true, errors: [], warnings: [] })
    })
  }
}));

vi.mock('../null-safe-validation', () => ({
  NullSafeValidationService: {
    getInstance: () => ({
      validatePolitician: () => ({ isValid: true, errors: [], warnings: [] })
    })
  }
}));

vi.mock('../intelligent-cache', () => ({
  IntelligentCacheService: {
    getInstance: () => ({
      get: vi.fn(),
      set: vi.fn(),
      clear: vi.fn(),
      getMetrics: () => ({ hits: 0, misses: 0 })
    })
  }
}));

describe('PoliticianService', () => {
  let service: PoliticianService;

  beforeEach(() => {
    service = PoliticianService.getInstance();
    vi.clearAllMocks();
  });

  describe('getInstance', () => {
    it('should return singleton instance', () => {
      const instance1 = PoliticianService.getInstance();
      const instance2 = PoliticianService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('data transformation', () => {
    it('should handle empty politician data gracefully', async () => {
      const { dataLoader } = await import('../data-loader');
      
      // Mock empty data
      vi.mocked(dataLoader.loadData).mockResolvedValue({
        politicians: []
      });

      const politicians = await service.getAllPoliticians();
      expect(politicians).toEqual([]);
    });

    it('should handle missing reference data gracefully', async () => {
      const { dataLoader } = await import('../data-loader');
      
      // Mock politician data without reference data
      vi.mocked(dataLoader.loadData)
        .mockResolvedValueOnce({
          politicians: [{
            id: 'test-1',
            firstName: 'Test',
            lastName: 'Politician',
            fullName: 'Test Politician',
            partyId: 'unknown-party',
            currentPositionId: 'unknown-position',
            stateOfOriginId: 'unknown-state',
            dateOfBirth: '1980-01-01',
            gender: 'male',
            education: [],
            politicalHistory: [],
            socialMedia: {},
            metadata: { isActive: true, verificationStatus: 'verified', lastUpdated: '2024-01-01' }
          }]
        })
        .mockResolvedValueOnce({ parties: [] })
        .mockResolvedValueOnce({ states: [] })
        .mockResolvedValueOnce({ positions: [] });

      const politicians = await service.getAllPoliticians();
      expect(politicians).toHaveLength(1);
      expect(politicians[0].name).toBe('Test Politician');
    });
  });

  describe('error handling', () => {
    it('should handle data loading errors', async () => {
      const { dataLoader } = await import('../data-loader');
      
      vi.mocked(dataLoader.loadData).mockRejectedValue(new Error('Data loading failed'));

      await expect(service.getAllPoliticians()).rejects.toThrow('Data loading failed');
    });

    it('should handle invalid politician ID', async () => {
      await expect(service.getPoliticianById('')).rejects.toThrow();
    });
  });

  describe('caching', () => {
    it('should use cache when available', async () => {
      const { IntelligentCacheService } = await import('../intelligent-cache');
      const mockCache = IntelligentCacheService.getInstance();
      
      // Mock cache hit
      vi.mocked(mockCache.get).mockReturnValue([]);

      const politicians = await service.getAllPoliticians();
      expect(politicians).toEqual([]);
      expect(mockCache.get).toHaveBeenCalled();
    });
  });

  describe('search functionality', () => {
    it('should handle empty search query', async () => {
      const { dataLoader } = await import('../data-loader');
      
      vi.mocked(dataLoader.loadData).mockResolvedValue({
        politicians: []
      });

      const result = await service.searchPoliticians('');
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should handle pagination correctly', async () => {
      const { dataLoader } = await import('../data-loader');
      
      vi.mocked(dataLoader.loadData).mockResolvedValue({
        politicians: []
      });

      const result = await service.searchPoliticians('', {}, 1, 10);
      expect(result.pagination.currentPage).toBe(1);
      expect(result.pagination.itemsPerPage).toBe(10);
    });
  });
});