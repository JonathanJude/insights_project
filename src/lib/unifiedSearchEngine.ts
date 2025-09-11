import Fuse from 'fuse.js';
import type {
    Politician
} from '../types';
import type { TrendingTopic } from '../types/quickActions';
import { dataLoader } from '../services/data-loader';

// Unified search result interface
export interface UnifiedSearchResult<T = any> {
  item: T;
  type: 'politician' | 'party' | 'topic' | 'state' | 'position' | 'platform';
  score?: number;
  matches?: Fuse.FuseResultMatch[];
  relevance: number;
}

// Search options
export interface UnifiedSearchOptions {
  threshold?: number;
  includeScore?: boolean;
  includeMatches?: boolean;
  maxResults?: number;
  types?: Array<'politician' | 'party' | 'topic' | 'state' | 'position' | 'platform'>;
}

// Searchable entity interfaces
interface SearchablePolitician extends Politician {
  searchableText: string;
}

interface SearchableParty {
  id: string;
  name: string;
  fullName: string;
  searchableText: string;
}

interface SearchableTopic extends TrendingTopic {
  searchableText: string;
}

interface SearchableState {
  id: string;
  name: string;
  searchableText: string;
}

interface SearchablePosition {
  id: string;
  name: string;
  displayName: string;
  level: string;
  category: string;
  hierarchy: number;
  searchableText: string;
}

interface SearchablePlatform {
  id: string;
  name: string;
  displayName: string;
  category: string;
  searchableText: string;
}

export class UnifiedSearchEngine {
  private politiciansFuse: Fuse<SearchablePolitician>;
  private partiesFuse: Fuse<SearchableParty>;
  private topicsFuse: Fuse<SearchableTopic>;
  private statesFuse: Fuse<SearchableState>;
  private positionsFuse: Fuse<SearchablePosition>;
  private platformsFuse: Fuse<SearchablePlatform>;
  
  private politicians: SearchablePolitician[] = [];
  private parties: SearchableParty[] = [];
  private topics: SearchableTopic[] = [];
  private states: SearchableState[] = [];
  private positions: SearchablePosition[] = [];
  private platforms: SearchablePlatform[] = [];

  constructor() {
    // Initialize with empty data - will be populated via update methods
    this.politiciansFuse = new Fuse([], this.getPoliticianFuseOptions());
    this.partiesFuse = new Fuse([], this.getPartyFuseOptions());
    this.topicsFuse = new Fuse([], this.getTopicFuseOptions());
    this.statesFuse = new Fuse([], this.getStateFuseOptions());
    this.positionsFuse = new Fuse([], this.getPositionFuseOptions());
    this.platformsFuse = new Fuse([], this.getPlatformFuseOptions());
    
    // Initialize static data asynchronously
    this.initializeStaticData();
  }

  private getPoliticianFuseOptions(): Fuse.IFuseOptions<SearchablePolitician> {
    return {
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'firstName', weight: 0.2 },
        { name: 'lastName', weight: 0.2 },
        { name: 'party', weight: 0.3 },
        { name: 'position', weight: 0.2 },
        { name: 'state', weight: 0.1 },
        { name: 'searchableText', weight: 0.1 }
      ],
      threshold: 0.4,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      ignoreLocation: true
    };
  }

  private getPartyFuseOptions(): Fuse.IFuseOptions<SearchableParty> {
    return {
      keys: [
        { name: 'name', weight: 0.6 },
        { name: 'fullName', weight: 0.4 },
        { name: 'searchableText', weight: 0.2 }
      ],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2
    };
  }

  private getTopicFuseOptions(): Fuse.IFuseOptions<SearchableTopic> {
    return {
      keys: [
        { name: 'keyword', weight: 0.8 },
        { name: 'searchableText', weight: 0.2 }
      ],
      threshold: 0.4,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2
    };
  }

  private getStateFuseOptions(): Fuse.IFuseOptions<SearchableState> {
    return {
      keys: [
        { name: 'name', weight: 0.8 },
        { name: 'searchableText', weight: 0.2 }
      ],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2
    };
  }

  private getPositionFuseOptions(): Fuse.IFuseOptions<SearchablePosition> {
    return {
      keys: [
        { name: 'displayName', weight: 0.6 },
        { name: 'name', weight: 0.4 },
        { name: 'level', weight: 0.2 },
        { name: 'searchableText', weight: 0.2 }
      ],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2
    };
  }

  private getPlatformFuseOptions(): Fuse.IFuseOptions<SearchablePlatform> {
    return {
      keys: [
        { name: 'displayName', weight: 0.6 },
        { name: 'name', weight: 0.4 },
        { name: 'searchableText', weight: 0.2 }
      ],
      threshold: 0.3,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2
    };
  }

  private async initializeStaticData(): Promise<void> {
    try {
      // Load positions data
      const positionsData = await dataLoader.loadData(
        'positions',
        () => import('../data/core/positions.json'),
        { cacheTTL: 30 * 60 * 1000 } // 30 minutes
      );
      
      // Initialize parties (this remains static as it's from the enum)
      this.parties = [
        { id: 'APC', name: 'APC', fullName: 'All Progressives Congress', searchableText: 'APC All Progressives Congress ruling party' },
        { id: 'PDP', name: 'PDP', fullName: 'Peoples Democratic Party', searchableText: 'PDP Peoples Democratic Party opposition' },
        { id: 'LP', name: 'LP', fullName: 'Labour Party', searchableText: 'LP Labour Party Peter Obi' },
        { id: 'NNPP', name: 'NNPP', fullName: 'New Nigeria Peoples Party', searchableText: 'NNPP New Nigeria Peoples Party Kwankwaso' },
        { id: 'APGA', name: 'APGA', fullName: 'All Progressives Grand Alliance', searchableText: 'APGA All Progressives Grand Alliance' },
        { id: 'ADC', name: 'ADC', fullName: 'African Democratic Congress', searchableText: 'ADC African Democratic Congress' },
        { id: 'SDP', name: 'SDP', fullName: 'Social Democratic Party', searchableText: 'SDP Social Democratic Party' },
        { id: 'YPP', name: 'YPP', fullName: 'Young Progressives Party', searchableText: 'YPP Young Progressives Party youth' }
      ];

      // Initialize states (this remains static as it's from the states data)
      const nigerianStates = [
        'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
        'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
        'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
        'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
        'Yobe', 'Zamfara'
      ];
      
      this.states = nigerianStates.map(state => ({
        id: state,
        name: state,
        searchableText: `${state} state nigeria`
      }));

      // Initialize positions from JSON data
      this.positions = positionsData.positions.map((position: any) => ({
        id: position.id,
        name: position.title.toLowerCase().replace(/\s+/g, '_'),
        displayName: position.title,
        level: position.level,
        category: position.category,
        hierarchy: position.hierarchy,
        searchableText: `${position.title} ${position.level} ${position.category} ${position.responsibilities.join(' ')}`
      }));

      // Initialize platforms with basic social media platforms (since no dedicated platforms file exists)
      this.platforms = [
        { id: 'twitter', name: 'twitter', displayName: 'Twitter/X', category: 'microblogging', searchableText: 'twitter x social media platform' },
        { id: 'facebook', name: 'facebook', displayName: 'Facebook', category: 'social networking', searchableText: 'facebook social media platform' },
        { id: 'instagram', name: 'instagram', displayName: 'Instagram', category: 'visual media', searchableText: 'instagram social media platform photos' },
        { id: 'threads', name: 'threads', displayName: 'Threads', category: 'microblogging', searchableText: 'threads social media platform meta' },
        { id: 'youtube', name: 'youtube', displayName: 'YouTube', category: 'video sharing', searchableText: 'youtube video platform google' },
        { id: 'tiktok', name: 'tiktok', displayName: 'TikTok', category: 'video sharing', searchableText: 'tiktok video platform short videos' },
        { id: 'news', name: 'news', displayName: 'News Media', category: 'traditional media', searchableText: 'news media traditional journalism' }
      ];

      // Update Fuse instances
      this.partiesFuse.setCollection(this.parties);
      this.statesFuse.setCollection(this.states);
      this.positionsFuse.setCollection(this.positions);
      this.platformsFuse.setCollection(this.platforms);
      
    } catch (error) {
      console.error('Error initializing static data in UnifiedSearchEngine:', error);
      
      // Fallback to minimal static data
      this.parties = [];
      this.states = [];
      this.positions = [];
      this.platforms = [];
    }
  }

  /**
   * Update politicians data
   */
  updatePoliticians(politicians: Politician[]): void {
    this.politicians = politicians.map(politician => ({
      ...politician,
      searchableText: `${politician.name} ${politician.firstName} ${politician.lastName} ${politician.party} ${politician.position} ${politician.state} ${politician.socialMediaHandles?.twitter || ''} ${politician.socialMediaHandles?.facebook || ''}`
    }));
    this.politiciansFuse.setCollection(this.politicians);
  }

  /**
   * Update topics data
   */
  updateTopics(topics: TrendingTopic[]): void {
    this.topics = topics.map(topic => ({
      ...topic,
      searchableText: `${topic.keyword} ${topic.relatedPoliticians.map(p => p.name).join(' ')} ${topic.platforms.map(p => p.platform).join(' ')}`
    }));
    this.topicsFuse.setCollection(this.topics);
  }

  /**
   * Unified search across all entities
   */
  search(query: string, options: UnifiedSearchOptions = {}): UnifiedSearchResult[] {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const {
      threshold = 0.4,
      maxResults = 50,
      types = ['politician', 'party', 'topic', 'state', 'position', 'platform']
    } = options;

    const allResults: UnifiedSearchResult[] = [];

    // Search politicians
    if (types.includes('politician') && this.politicians.length > 0) {
      const politicianResults = this.politiciansFuse.search(query, { limit: maxResults });
      politicianResults.forEach(result => {
        if ((result.score || 0) <= threshold) {
          allResults.push({
            item: result.item,
            type: 'politician',
            score: result.score,
            matches: result.matches,
            relevance: this.calculateRelevance(result.score || 0, 'politician', result.item)
          });
        }
      });
    }

    // Search parties
    if (types.includes('party')) {
      const partyResults = this.partiesFuse.search(query, { limit: maxResults });
      partyResults.forEach(result => {
        if ((result.score || 0) <= threshold) {
          allResults.push({
            item: result.item,
            type: 'party',
            score: result.score,
            matches: result.matches,
            relevance: this.calculateRelevance(result.score || 0, 'party', result.item)
          });
        }
      });
    }

    // Search topics
    if (types.includes('topic') && this.topics.length > 0) {
      const topicResults = this.topicsFuse.search(query, { limit: maxResults });
      topicResults.forEach(result => {
        if ((result.score || 0) <= threshold) {
          allResults.push({
            item: result.item,
            type: 'topic',
            score: result.score,
            matches: result.matches,
            relevance: this.calculateRelevance(result.score || 0, 'topic', result.item)
          });
        }
      });
    }

    // Search states
    if (types.includes('state')) {
      const stateResults = this.statesFuse.search(query, { limit: maxResults });
      stateResults.forEach(result => {
        if ((result.score || 0) <= threshold) {
          allResults.push({
            item: result.item,
            type: 'state',
            score: result.score,
            matches: result.matches,
            relevance: this.calculateRelevance(result.score || 0, 'state', result.item)
          });
        }
      });
    }

    // Search positions
    if (types.includes('position')) {
      const positionResults = this.positionsFuse.search(query, { limit: maxResults });
      positionResults.forEach(result => {
        if ((result.score || 0) <= threshold) {
          allResults.push({
            item: result.item,
            type: 'position',
            score: result.score,
            matches: result.matches,
            relevance: this.calculateRelevance(result.score || 0, 'position', result.item)
          });
        }
      });
    }

    // Search platforms
    if (types.includes('platform')) {
      const platformResults = this.platformsFuse.search(query, { limit: maxResults });
      platformResults.forEach(result => {
        if ((result.score || 0) <= threshold) {
          allResults.push({
            item: result.item,
            type: 'platform',
            score: result.score,
            matches: result.matches,
            relevance: this.calculateRelevance(result.score || 0, 'platform', result.item)
          });
        }
      });
    }

    // Sort by relevance and return top results
    return allResults
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxResults);
  }

  /**
   * Calculate relevance score based on entity type and properties
   */
  private calculateRelevance(score: number, type: string, item: any): number {
    let baseRelevance = 1 - score; // Lower Fuse score = higher relevance

    // Boost relevance based on entity type and properties
    switch (type) {
      case 'politician':
        // Boost popular politicians
        const mentionCount = item.recentSentiment?.mentionCount || 0;
        baseRelevance += Math.min(mentionCount / 1000, 0.5);
        break;
      
      case 'topic':
        // Boost trending topics
        const topicMentions = item.mentionCount || 0;
        baseRelevance += Math.min(topicMentions / 500, 0.3);
        if (item.trend === 'rising') baseRelevance += 0.2;
        break;
      
      case 'party':
        // Boost major parties
        if (['APC', 'PDP', 'LP'].includes(item.name)) {
          baseRelevance += 0.3;
        }
        break;
      
      case 'position':
        // Boost higher-level positions
        if (item.level === 'federal') baseRelevance += 0.2;
        else if (item.level === 'state') baseRelevance += 0.1;
        break;
    }

    return Math.min(baseRelevance, 2.0); // Cap at 2.0
  }

  /**
   * Get search suggestions for autocomplete
   */
  getSuggestions(query: string, maxSuggestions: number = 10): UnifiedSearchResult[] {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const results = this.search(query, {
      threshold: 0.5, // More lenient for suggestions
      maxResults: maxSuggestions * 2
    });

    return results.slice(0, maxSuggestions);
  }

  /**
   * Search by specific entity type
   */
  searchByType(query: string, type: 'politician' | 'party' | 'topic' | 'state' | 'position' | 'platform', maxResults: number = 20): UnifiedSearchResult[] {
    return this.search(query, {
      types: [type],
      maxResults
    });
  }

  /**
   * Get search statistics
   */
  getSearchStats(query: string): {
    totalResults: number;
    resultsByType: Record<string, number>;
  } {
    const results = this.search(query);
    const resultsByType: Record<string, number> = {};
    
    results.forEach(result => {
      resultsByType[result.type] = (resultsByType[result.type] || 0) + 1;
    });

    return {
      totalResults: results.length,
      resultsByType
    };
  }
}

// Singleton instance
let unifiedSearchEngineInstance: UnifiedSearchEngine | null = null;

export const getUnifiedSearchEngine = (): UnifiedSearchEngine => {
  if (!unifiedSearchEngineInstance) {
    unifiedSearchEngineInstance = new UnifiedSearchEngine();
  }
  return unifiedSearchEngineInstance;
};

export const initializeUnifiedSearchEngine = (): UnifiedSearchEngine => {
  unifiedSearchEngineInstance = new UnifiedSearchEngine();
  return unifiedSearchEngineInstance;
};