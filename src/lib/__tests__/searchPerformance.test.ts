import { beforeEach, describe, expect, it } from 'vitest';
import { mockPoliticians } from '../../mock/politicians';
import { SearchEngine } from '../searchEngine';

describe('Search Performance Tests', () => {
  let searchEngine: SearchEngine;
  
  beforeEach(() => {
    searchEngine = new SearchEngine(mockPoliticians);
  });

  describe('300ms Performance Requirement', () => {
    it('should complete search within 300ms for single query', async () => {
      const queries = ['Peter', 'Tinubu', 'APC', 'Lagos', 'Governor'];
      
      for (const query of queries) {
        const startTime = performance.now();
        const results = searchEngine.search(query);
        const endTime = performance.now();
        
        const searchTime = endTime - startTime;
        
        expect(searchTime).toBeLessThan(300);
        expect(results).toBeDefined();
      }
    });

    it('should complete suggestions within 300ms', async () => {
      const queries = ['Pet', 'Tin', 'AP', 'Lag', 'Gov'];
      
      for (const query of queries) {
        const startTime = performance.now();
        const suggestions = searchEngine.getSuggestions(query, 10);
        const endTime = performance.now();
        
        const searchTime = endTime - startTime;
        
        expect(searchTime).toBeLessThan(300);
        expect(suggestions).toBeDefined();
      }
    });

    it('should handle multiple concurrent searches within 300ms each', async () => {
      const queries = ['Peter', 'Tinubu', 'Obi', 'APC', 'PDP'];
      const promises = queries.map(async (query) => {
        const startTime = performance.now();
        const results = searchEngine.search(query);
        const endTime = performance.now();
        
        return {
          query,
          results,
          searchTime: endTime - startTime
        };
      });

      const results = await Promise.all(promises);
      
      results.forEach(({ query, searchTime }) => {
        expect(searchTime).toBeLessThan(300);
      });
    });

    it('should maintain performance with large result sets', () => {
      // Search for common terms that might return many results
      const commonQueries = ['A', 'Governor', 'APC'];
      
      commonQueries.forEach(query => {
        const startTime = performance.now();
        const results = searchEngine.search(query, { maxResults: 100 });
        const endTime = performance.now();
        
        const searchTime = endTime - startTime;
        
        expect(searchTime).toBeLessThan(300);
        expect(results).toBeDefined();
      });
    });
  });

  describe('Real-time Autocomplete Performance', () => {
    it('should provide autocomplete suggestions within 150ms', () => {
      const partialQueries = ['P', 'Pe', 'Pet', 'Pete', 'Peter'];
      
      partialQueries.forEach(query => {
        if (query.length >= 2) { // Only test queries that meet minimum length
          const startTime = performance.now();
          const suggestions = searchEngine.getSuggestions(query, 8);
          const endTime = performance.now();
          
          const searchTime = endTime - startTime;
          
          expect(searchTime).toBeLessThan(150); // Stricter requirement for autocomplete
          expect(suggestions).toBeDefined();
        }
      });
    });
  });

  describe('Search Quality vs Performance', () => {
    it('should return relevant results quickly', () => {
      const testCases = [
        { query: 'Peter Obi', expectedInResults: 'Peter Obi' },
        { query: 'Tinubu', expectedInResults: 'Tinubu' },
        { query: 'APC', expectedParty: 'APC' },
        { query: 'Lagos', expectedState: 'Lagos' }
      ];

      testCases.forEach(({ query, expectedInResults, expectedParty, expectedState }) => {
        const startTime = performance.now();
        const results = searchEngine.search(query);
        const endTime = performance.now();
        
        const searchTime = endTime - startTime;
        
        // Performance check
        expect(searchTime).toBeLessThan(300);
        
        // Quality check
        expect(results.length).toBeGreaterThan(0);
        
        if (expectedInResults) {
          expect(results.some(r => r.item.name.includes(expectedInResults))).toBe(true);
        }
        
        if (expectedParty) {
          expect(results.some(r => r.item.party === expectedParty)).toBe(true);
        }
        
        if (expectedState) {
          expect(results.some(r => r.item.state === expectedState)).toBe(true);
        }
      });
    });
  });
});