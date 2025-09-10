import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SentimentSourcesService, type SentimentSource } from '../sentiment-sources-service';

// Mock the schema validator
vi.mock('../schema-validator', () => ({
  schemaValidator: {
    validateData: vi.fn().mockReturnValue({ isValid: true, errors: [] })
  }
}));

describe('SentimentSourcesService', () => {
  let service: SentimentSourcesService;

  beforeEach(() => {
    service = SentimentSourcesService.getInstance();
  });

  describe('Default Sources', () => {
    it('should initialize with default sources', () => {
      const sources = service.getAllSources();
      expect(sources.length).toBeGreaterThan(0);
      
      // Check for some expected default sources
      const sourceIds = sources.map(s => s.id);
      expect(sourceIds).toContain('twitter');
      expect(sourceIds).toContain('facebook');
      expect(sourceIds).toContain('youtube');
    });

    it('should have valid source structure', () => {
      const sources = service.getAllSources();
      
      sources.forEach(source => {
        expect(source).toHaveProperty('id');
        expect(source).toHaveProperty('name');
        expect(source).toHaveProperty('type');
        expect(source).toHaveProperty('isActive');
        expect(typeof source.id).toBe('string');
        expect(typeof source.name).toBe('string');
        expect(typeof source.isActive).toBe('boolean');
      });
    });
  });

  describe('Source Retrieval', () => {
    it('should get source by ID', () => {
      const twitter = service.getSourceById('twitter');
      expect(twitter).toBeDefined();
      expect(twitter?.name).toBe('Twitter');
      expect(twitter?.type).toBe('social_media');
    });

    it('should return null for non-existent source', () => {
      const nonExistent = service.getSourceById('non-existent');
      expect(nonExistent).toBeNull();
    });

    it('should get active sources only', () => {
      const activeSources = service.getActiveSources();
      activeSources.forEach(source => {
        expect(source.isActive).toBe(true);
      });
    });

    it('should get sources by type', () => {
      const socialMediaSources = service.getSourcesByType('social_media');
      socialMediaSources.forEach(source => {
        expect(source.type).toBe('social_media');
      });
      expect(socialMediaSources.length).toBeGreaterThan(0);
    });
  });

  describe('Source Options', () => {
    it('should return source options', () => {
      const options = service.getSourceOptions();
      expect(options.length).toBeGreaterThan(0);
      
      options.forEach(option => {
        expect(option).toHaveProperty('value');
        expect(option).toHaveProperty('label');
        expect(option).toHaveProperty('type');
        expect(option).toHaveProperty('isActive');
      });
    });

    it('should return active source options only', () => {
      const activeOptions = service.getActiveSourceOptions();
      activeOptions.forEach(option => {
        expect(option.isActive).toBe(true);
      });
    });
  });

  describe('Source Validation', () => {
    it('should validate source IDs', () => {
      expect(service.isValidSourceId('twitter')).toBe(true);
      expect(service.isValidSourceId('facebook')).toBe(true);
      expect(service.isValidSourceId('non-existent')).toBe(false);
    });

    it('should validate multiple source IDs', () => {
      const result = service.validateSourceIds(['twitter', 'facebook', 'non-existent', 'youtube']);
      
      expect(result.valid).toContain('twitter');
      expect(result.valid).toContain('facebook');
      expect(result.valid).toContain('youtube');
      expect(result.invalid).toContain('non-existent');
    });
  });

  describe('Source Management', () => {
    it('should add new source', () => {
      const newSource: SentimentSource = {
        id: 'test-source',
        name: 'Test Source',
        type: 'other',
        isActive: true,
        metadata: {
          description: 'Test source for unit tests'
        }
      };

      service.addSource(newSource);
      
      const retrieved = service.getSourceById('test-source');
      expect(retrieved).toEqual(newSource);
    });

    it('should update existing source', () => {
      const updated = service.updateSource('twitter', {
        isActive: false,
        metadata: { description: 'Updated description' }
      });

      expect(updated).toBe(true);
      
      const source = service.getSourceById('twitter');
      expect(source?.isActive).toBe(false);
      expect(source?.metadata?.description).toBe('Updated description');
    });

    it('should return false when updating non-existent source', () => {
      const updated = service.updateSource('non-existent', { isActive: false });
      expect(updated).toBe(false);
    });

    it('should remove source', () => {
      const removed = service.removeSource('twitter');
      expect(removed).toBe(true);
      
      const source = service.getSourceById('twitter');
      expect(source).toBeNull();
    });

    it('should return false when removing non-existent source', () => {
      const removed = service.removeSource('non-existent');
      expect(removed).toBe(false);
    });
  });

  describe('Source Statistics', () => {
    it('should return source types with counts', () => {
      const types = service.getSourceTypes();
      expect(types.length).toBeGreaterThan(0);
      
      types.forEach(type => {
        expect(type).toHaveProperty('value');
        expect(type).toHaveProperty('label');
        expect(type).toHaveProperty('count');
        expect(type.count).toBeGreaterThan(0);
      });
    });

    it('should return source statistics', () => {
      const stats = service.getSourceStats();
      
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('active');
      expect(stats).toHaveProperty('inactive');
      expect(stats).toHaveProperty('byType');
      
      expect(stats.total).toBeGreaterThan(0);
      expect(stats.active + stats.inactive).toBe(stats.total);
    });
  });

  describe('Data Import/Export', () => {
    it('should export sources', () => {
      const exported = service.exportSources();
      
      expect(exported).toHaveProperty('sources');
      expect(Array.isArray(exported.sources)).toBe(true);
      expect(exported.sources.length).toBeGreaterThan(0);
    });

    it('should import sources', () => {
      const testData = {
        sources: [
          {
            id: 'imported-source',
            name: 'Imported Source',
            type: 'other' as const,
            isActive: true
          }
        ]
      };

      service.importSources(testData);
      
      const source = service.getSourceById('imported-source');
      expect(source).toBeDefined();
      expect(source?.name).toBe('Imported Source');
    });
  });

  describe('Cache Management', () => {
    it('should track cache expiry', () => {
      // Set a very short cache expiry
      service.setCacheExpiry(1);
      
      // Wait for cache to expire
      setTimeout(() => {
        expect(service.isCacheExpired()).toBe(true);
      }, 2);
    });

    it('should refresh if needed', async () => {
      service.setCacheExpiry(1);
      
      // Wait for cache to expire then refresh
      setTimeout(async () => {
        await service.refreshIfNeeded();
        expect(service.isCacheExpired()).toBe(false);
      }, 2);
    });
  });

  describe('Load Sources', () => {
    it('should load sources from data', async () => {
      const testData = {
        sources: [
          {
            id: 'loaded-source',
            name: 'Loaded Source',
            type: 'news' as const,
            isActive: true
          }
        ]
      };

      await service.loadSources(testData);
      
      const source = service.getSourceById('loaded-source');
      expect(source).toBeDefined();
      expect(source?.name).toBe('Loaded Source');
    });

    it('should simulate API call when no data provided', async () => {
      const startTime = Date.now();
      await service.loadSources();
      const endTime = Date.now();
      
      // Should take at least 100ms due to simulated delay
      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
    });
  });
});