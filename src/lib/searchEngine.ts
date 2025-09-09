import Fuse from 'fuse.js';
import type { Politician } from '../types';

export interface SearchResult<T = Politician> {
  item: T;
  score?: number;
  matches?: Fuse.FuseResultMatch[];
}

export interface SearchOptions {
  threshold?: number;
  includeScore?: boolean;
  includeMatches?: boolean;
  maxResults?: number;
}

export class SearchEngine {
  private fuse: Fuse<Politician>;
  private politicians: Politician[];
  
  constructor(politicians: Politician[]) {
    this.politicians = politicians;
    
    // Configure Fuse.js for optimal politician search
    const fuseOptions: Fuse.IFuseOptions<Politician> = {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'firstName', weight: 0.2 },
        { name: 'lastName', weight: 0.2 },
        { name: 'party', weight: 0.3 },
        { name: 'position', weight: 0.2 },
        { name: 'state', weight: 0.1 },
        { name: 'socialMediaHandles.twitter', weight: 0.1 },
        { name: 'socialMediaHandles.facebook', weight: 0.1 }
      ],
      threshold: 0.6, // Higher threshold for better fuzzy matching
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      ignoreLocation: true,
      findAllMatches: true,
      useExtendedSearch: false,
      distance: 100 // Allow more character distance for fuzzy matching
    };
    
    this.fuse = new Fuse(politicians, fuseOptions);
  }
  
  /**
   * Search for politicians with fuzzy matching
   */
  search(query: string, options: SearchOptions = {}): SearchResult[] {
    if (!query || query.trim().length < 2) {
      return [];
    }
    
    const {
      threshold = 0.3,
      includeScore = true,
      includeMatches = true,
      maxResults = 50
    } = options;
    
    // Update Fuse options if needed
    this.fuse.setCollection(this.politicians);
    
    const results = this.fuse.search(query, { limit: maxResults });
    
    return results
      .filter(result => (result.score || 0) <= threshold)
      .map(result => ({
        item: result.item,
        score: includeScore ? result.score : undefined,
        matches: includeMatches ? result.matches : undefined
      }))
      .sort((a, b) => (a.score || 0) - (b.score || 0));
  }
  
  /**
   * Get search suggestions for autocomplete
   */
  getSuggestions(query: string, maxSuggestions: number = 10): SearchResult[] {
    if (!query || query.trim().length < 2) {
      return [];
    }
    
    const results = this.search(query, {
      threshold: 0.4, // More lenient for suggestions
      maxResults: maxSuggestions * 2 // Get more results to filter
    });
    
    // Prioritize exact name matches and popular politicians
    return results
      .slice(0, maxSuggestions)
      .sort((a, b) => {
        // Prioritize by score first
        const scoreA = a.score || 0;
        const scoreB = b.score || 0;
        if (scoreA !== scoreB) {
          return scoreA - scoreB;
        }
        
        // Then by mention count (popularity)
        const mentionsA = a.item.recentSentiment?.mentionCount || 0;
        const mentionsB = b.item.recentSentiment?.mentionCount || 0;
        return mentionsB - mentionsA;
      });
  }
  
  /**
   * Search by specific field
   */
  searchByField(query: string, field: keyof Politician, maxResults: number = 20): SearchResult[] {
    if (!query || query.trim().length < 2) {
      return [];
    }
    
    const fieldOptions: Fuse.IFuseOptions<Politician> = {
      keys: [field as string],
      threshold: 0.2,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2
    };
    
    const fieldFuse = new Fuse(this.politicians, fieldOptions);
    const results = fieldFuse.search(query, { limit: maxResults });
    
    return results.map(result => ({
      item: result.item,
      score: result.score,
      matches: result.matches
    }));
  }
  
  /**
   * Get exact matches for a query
   */
  getExactMatches(query: string): Politician[] {
    const normalizedQuery = query.toLowerCase().trim();
    
    return this.politicians.filter(politician => {
      const name = politician.name.toLowerCase();
      const firstName = politician.firstName.toLowerCase();
      const lastName = politician.lastName.toLowerCase();
      const party = politician.party.toLowerCase();
      const position = politician.position.toLowerCase();
      
      return (
        name === normalizedQuery ||
        firstName === normalizedQuery ||
        lastName === normalizedQuery ||
        party === normalizedQuery ||
        position === normalizedQuery ||
        name.includes(normalizedQuery)
      );
    });
  }
  
  /**
   * Update the politician dataset
   */
  updateData(politicians: Politician[]): void {
    this.politicians = politicians;
    this.fuse.setCollection(politicians);
  }
  
  /**
   * Get search statistics
   */
  getSearchStats(query: string): {
    totalResults: number;
    exactMatches: number;
    fuzzyMatches: number;
    averageScore: number;
  } {
    const fuzzyResults = this.search(query);
    const exactMatches = this.getExactMatches(query);
    
    const scores = fuzzyResults
      .map(r => r.score)
      .filter((score): score is number => score !== undefined);
    
    const averageScore = scores.length > 0 
      ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
      : 0;
    
    return {
      totalResults: fuzzyResults.length,
      exactMatches: exactMatches.length,
      fuzzyMatches: fuzzyResults.length - exactMatches.length,
      averageScore
    };
  }
  
  /**
   * Highlight matching text in search results
   */
  highlightMatches(text: string, matches: Fuse.FuseResultMatch[] = []): string {
    if (!matches.length) return text;
    
    // Find the best match for the text field
    const textMatch = matches.find(match => 
      match.key === 'name' || match.key === 'firstName' || match.key === 'lastName'
    );
    
    if (!textMatch || !textMatch.indices) return text;
    
    let highlightedText = text;
    const sortedIndices = textMatch.indices
      .sort((a, b) => b[0] - a[0]); // Sort in reverse order to avoid index shifting
    
    sortedIndices.forEach(([start, end]) => {
      if (start >= 0 && end >= start && end < highlightedText.length) {
        const before = highlightedText.slice(0, start);
        const match = highlightedText.slice(start, end + 1);
        const after = highlightedText.slice(end + 1);
        highlightedText = `${before}<mark class="bg-yellow-200 font-medium">${match}</mark>${after}`;
      }
    });
    
    return highlightedText;
  }
}

// Singleton instance for global use
let searchEngineInstance: SearchEngine | null = null;

export const getSearchEngine = (politicians?: Politician[]): SearchEngine => {
  if (!searchEngineInstance && politicians) {
    searchEngineInstance = new SearchEngine(politicians);
  } else if (searchEngineInstance && politicians) {
    searchEngineInstance.updateData(politicians);
  }
  
  if (!searchEngineInstance) {
    throw new Error('SearchEngine not initialized. Provide politicians data first.');
  }
  
  return searchEngineInstance;
};

export const initializeSearchEngine = (politicians: Politician[]): SearchEngine => {
  searchEngineInstance = new SearchEngine(politicians);
  return searchEngineInstance;
};