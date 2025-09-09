import { beforeEach, describe, expect, it } from 'vitest';
import { mockPoliticians } from '../../mock/politicians';
import type { Politician } from '../../types';
import { SearchEngine } from '../searchEngine';

describe('SearchEngine', () => {
  let searchEngine: SearchEngine;
  
  beforeEach(() => {
    searchEngine = new SearchEngine(mockPoliticians);
  });

  describe('Performance Requirements', () => {
    it('should return search results within 300ms', async () => {
      const startTime = performance.now();
      
      const results = searchEngine.search('Peter Obi');
      
      const endTime = performance.now();
      const searchTime = endTime - startTime;
      
      expect(searchTime).toBeLessThan(300);
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return suggestions within 300ms', async () => {
      const startTime = performance.now();
      
      const suggestions = searchEngine.getSuggestions('Tinubu');
      
      const endTime = performance.now();
      const searchTime = endTime - startTime;
      
      expect(searchTime).toBeLessThan(300);
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Fuzzy Search Functionality', () => {
    it('should find politicians with exact name matches', () => {
      const results = searchEngine.search('Peter Obi');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.name).toBe('Peter Obi');
      expect(results[0].score).toBeDefined();
    });

    it('should find politicians with partial name matches', () => {
      const results = searchEngine.search('Peter');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.item.name.includes('Peter'))).toBe(true);
    });

    it('should find politicians by party', () => {
      const results = searchEngine.search('APC');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.item.party === 'APC')).toBe(true);
    });

    it('should find politicians by state', () => {
      const results = searchEngine.search('Lagos');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.item.state === 'Lagos')).toBe(true);
    });

    it('should handle typos and fuzzy matching', () => {
      const results = searchEngine.search('Petter'); // Intentional typo but closer
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.item.name.includes('Peter'))).toBe(true);
    });

    it('should return empty results for very short queries', () => {
      const results = searchEngine.search('P');
      
      expect(results.length).toBe(0);
    });

    it('should return empty results for empty queries', () => {
      const results = searchEngine.search('');
      
      expect(results.length).toBe(0);
    });
  });

  describe('Search Suggestions', () => {
    it('should return limited number of suggestions', () => {
      const suggestions = searchEngine.getSuggestions('A', 5);
      
      expect(suggestions.length).toBeLessThanOrEqual(5);
    });

    it('should prioritize better matches in suggestions', () => {
      const suggestions = searchEngine.getSuggestions('Obi');
      
      expect(suggestions.length).toBeGreaterThan(0);
      // First result should have better score
      if (suggestions.length > 1) {
        expect(suggestions[0].score).toBeLessThanOrEqual(suggestions[1].score || 1);
      }
    });

    it('should include popular politicians in suggestions', () => {
      const suggestions = searchEngine.getSuggestions('President');
      
      expect(suggestions.length).toBeGreaterThan(0);
      // Should include politicians with high mention counts
      expect(suggestions.some(s => (s.item.recentSentiment?.mentionCount || 0) > 1000)).toBe(true);
    });
  });

  describe('Field-specific Search', () => {
    it('should search by specific field', () => {
      const results = searchEngine.searchByField('Peter', 'firstName');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.firstName).toBe('Peter');
    });

    it('should search by party field', () => {
      const results = searchEngine.searchByField('APC', 'party');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(r => r.item.party === 'APC')).toBe(true);
    });
  });

  describe('Exact Matches', () => {
    it('should find exact name matches', () => {
      const results = searchEngine.getExactMatches('Peter Obi');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].name).toBe('Peter Obi');
    });

    it('should find exact party matches', () => {
      const results = searchEngine.getExactMatches('APC');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.every(p => p.party === 'APC')).toBe(true);
    });
  });

  describe('Data Updates', () => {
    it('should update search data correctly', () => {
      const newPolitician: Politician = {
        id: 'test_001',
        name: 'Test Politician',
        firstName: 'Test',
        lastName: 'Politician',
        party: 'APC' as any,
        position: 'GOVERNOR' as any,
        state: 'Lagos' as any,
        politicalLevel: 'STATE' as any,
        gender: 'MALE' as any,
        ageGroup: 'MIDDLE' as any,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      };

      const updatedData = [...mockPoliticians, newPolitician];
      searchEngine.updateData(updatedData);

      const results = searchEngine.search('Test Politician');
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].item.name).toBe('Test Politician');
    });
  });

  describe('Search Statistics', () => {
    it('should provide search statistics', () => {
      const stats = searchEngine.getSearchStats('Peter');
      
      expect(stats.totalResults).toBeGreaterThan(0);
      expect(stats.exactMatches).toBeGreaterThanOrEqual(0);
      expect(stats.fuzzyMatches).toBeGreaterThanOrEqual(0);
      expect(stats.averageScore).toBeGreaterThanOrEqual(0);
      expect(stats.averageScore).toBeLessThanOrEqual(1);
    });
  });

  describe('Highlight Matches', () => {
    it('should highlight matching text', () => {
      const results = searchEngine.search('Peter');
      const highlighted = searchEngine.highlightMatches('Peter Obi', results[0]?.matches);
      
      expect(highlighted).toContain('mark');
      // Check that the original text is preserved in some form
      expect(highlighted).toMatch(/Peter|Obi/);
    });

    it('should handle text without matches', () => {
      const highlighted = searchEngine.highlightMatches('No matches here', []);
      
      expect(highlighted).toBe('No matches here');
    });
  });
});