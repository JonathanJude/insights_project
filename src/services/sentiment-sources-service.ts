import { schemaValidator } from './schema-validator';

export interface SentimentSource {
  id: string;
  name: string;
  type: 'social_media' | 'news' | 'blog' | 'forum' | 'video' | 'podcast' | 'other';
  isActive: boolean;
  apiEndpoint?: string;
  rateLimit?: {
    requestsPerMinute?: number;
    requestsPerHour?: number;
    requestsPerDay?: number;
  };
  dataFields?: string[];
  metadata?: {
    description?: string;
    website?: string;
    icon?: string;
    color?: string;
    dataRetentionDays?: number;
    lastUpdated?: string;
    tags?: string[];
  };
}

export interface SentimentSourcesData {
  sources: SentimentSource[];
}

export interface SentimentSourceOption {
  value: string;
  label: string;
  type: string;
  isActive: boolean;
  color?: string;
  icon?: string;
}

export class SentimentSourcesService {
  private static instance: SentimentSourcesService;
  private sources: Map<string, SentimentSource> = new Map();
  private lastFetchTime: Date | null = null;
  private cacheExpiryMs = 5 * 60 * 1000; // 5 minutes

  private constructor() {
    this.initializeDefaultSources();
  }

  public static getInstance(): SentimentSourcesService {
    if (!SentimentSourcesService.instance) {
      SentimentSourcesService.instance = new SentimentSourcesService();
    }
    return SentimentSourcesService.instance;
  }

  private initializeDefaultSources(): void {
    // Initialize with some default sources for development
    const defaultSources: SentimentSource[] = [
      {
        id: 'twitter',
        name: 'Twitter',
        type: 'social_media',
        isActive: true,
        rateLimit: {
          requestsPerMinute: 300,
          requestsPerHour: 15000
        },
        dataFields: ['text', 'author', 'timestamp', 'likes', 'retweets'],
        metadata: {
          description: 'Twitter social media platform',
          website: 'https://twitter.com',
          icon: '/icons/twitter.svg',
          color: '#1DA1F2',
          tags: ['social', 'microblogging']
        }
      },
      {
        id: 'facebook',
        name: 'Facebook',
        type: 'social_media',
        isActive: true,
        rateLimit: {
          requestsPerMinute: 200,
          requestsPerHour: 10000
        },
        dataFields: ['text', 'author', 'timestamp', 'likes', 'shares'],
        metadata: {
          description: 'Facebook social media platform',
          website: 'https://facebook.com',
          icon: '/icons/facebook.svg',
          color: '#4267B2',
          tags: ['social', 'networking']
        }
      },
      {
        id: 'instagram',
        name: 'Instagram',
        type: 'social_media',
        isActive: true,
        rateLimit: {
          requestsPerMinute: 200,
          requestsPerHour: 5000
        },
        dataFields: ['text', 'author', 'timestamp', 'likes', 'comments'],
        metadata: {
          description: 'Instagram photo and video sharing platform',
          website: 'https://instagram.com',
          icon: '/icons/instagram.svg',
          color: '#E4405F',
          tags: ['social', 'visual', 'photos']
        }
      },
      {
        id: 'youtube',
        name: 'YouTube',
        type: 'video',
        isActive: true,
        rateLimit: {
          requestsPerMinute: 100,
          requestsPerHour: 10000
        },
        dataFields: ['title', 'description', 'comments', 'likes', 'views'],
        metadata: {
          description: 'YouTube video sharing platform',
          website: 'https://youtube.com',
          icon: '/icons/youtube.svg',
          color: '#FF0000',
          tags: ['video', 'entertainment', 'education']
        }
      },
      {
        id: 'news_sites',
        name: 'News Websites',
        type: 'news',
        isActive: true,
        rateLimit: {
          requestsPerMinute: 60,
          requestsPerHour: 1000
        },
        dataFields: ['headline', 'content', 'author', 'timestamp', 'category'],
        metadata: {
          description: 'Various news websites and publications',
          icon: '/icons/news.svg',
          color: '#2563EB',
          tags: ['news', 'journalism', 'current-events']
        }
      },
      {
        id: 'blogs',
        name: 'Blogs',
        type: 'blog',
        isActive: true,
        rateLimit: {
          requestsPerMinute: 30,
          requestsPerHour: 500
        },
        dataFields: ['title', 'content', 'author', 'timestamp', 'tags'],
        metadata: {
          description: 'Personal and professional blogs',
          icon: '/icons/blog.svg',
          color: '#059669',
          tags: ['blog', 'opinion', 'analysis']
        }
      }
    ];

    defaultSources.forEach(source => {
      this.sources.set(source.id, source);
    });
  }

  public async loadSources(data?: SentimentSourcesData): Promise<void> {
    if (data) {
      // Validate the data against schema
      const validation = schemaValidator.validateData('sentiment-sources', data);
      if (!validation.isValid) {
        throw new Error(`Invalid sentiment sources data: ${validation.errors.map(e => e.message).join(', ')}`);
      }

      // Clear existing sources and load new ones
      this.sources.clear();
      data.sources.forEach(source => {
        this.sources.set(source.id, source);
      });

      this.lastFetchTime = new Date();
    } else {
      // In a real implementation, this would fetch from backend
      // For now, we'll simulate an API call
      await this.simulateApiCall();
    }
  }

  private async simulateApiCall(): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));
    this.lastFetchTime = new Date();
  }

  public getAllSources(): SentimentSource[] {
    return Array.from(this.sources.values());
  }

  public getActiveSources(): SentimentSource[] {
    return Array.from(this.sources.values()).filter(source => source.isActive);
  }

  public getSourceById(id: string): SentimentSource | null {
    return this.sources.get(id) || null;
  }

  public getSourcesByType(type: SentimentSource['type']): SentimentSource[] {
    return Array.from(this.sources.values()).filter(source => source.type === type);
  }

  public getSourceOptions(): SentimentSourceOption[] {
    return Array.from(this.sources.values()).map(source => ({
      value: source.id,
      label: source.name,
      type: source.type,
      isActive: source.isActive,
      color: source.metadata?.color,
      icon: source.metadata?.icon
    }));
  }

  public getActiveSourceOptions(): SentimentSourceOption[] {
    return this.getSourceOptions().filter(option => option.isActive);
  }

  public isValidSourceId(sourceId: string): boolean {
    return this.sources.has(sourceId);
  }

  public validateSourceIds(sourceIds: string[]): {
    valid: string[];
    invalid: string[];
  } {
    const valid: string[] = [];
    const invalid: string[] = [];

    sourceIds.forEach(id => {
      if (this.isValidSourceId(id)) {
        valid.push(id);
      } else {
        invalid.push(id);
      }
    });

    return { valid, invalid };
  }

  public addSource(source: SentimentSource): void {
    // Validate the source data
    const validation = schemaValidator.validateData('sentiment-sources', { sources: [source] });
    if (!validation.isValid) {
      throw new Error(`Invalid source data: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    this.sources.set(source.id, source);
  }

  public updateSource(id: string, updates: Partial<SentimentSource>): boolean {
    const existingSource = this.sources.get(id);
    if (!existingSource) {
      return false;
    }

    const updatedSource = { ...existingSource, ...updates };
    
    // Validate the updated source
    const validation = schemaValidator.validateData('sentiment-sources', { sources: [updatedSource] });
    if (!validation.isValid) {
      throw new Error(`Invalid updated source data: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    this.sources.set(id, updatedSource);
    return true;
  }

  public removeSource(id: string): boolean {
    return this.sources.delete(id);
  }

  public getSourceTypes(): Array<{ value: string; label: string; count: number }> {
    const typeCounts = new Map<string, number>();
    
    Array.from(this.sources.values()).forEach(source => {
      typeCounts.set(source.type, (typeCounts.get(source.type) || 0) + 1);
    });

    return Array.from(typeCounts.entries()).map(([type, count]) => ({
      value: type,
      label: type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      count
    }));
  }

  public getSourceStats(): {
    total: number;
    active: number;
    inactive: number;
    byType: Record<string, number>;
  } {
    const sources = Array.from(this.sources.values());
    const byType: Record<string, number> = {};

    sources.forEach(source => {
      byType[source.type] = (byType[source.type] || 0) + 1;
    });

    return {
      total: sources.length,
      active: sources.filter(s => s.isActive).length,
      inactive: sources.filter(s => !s.isActive).length,
      byType
    };
  }

  public isCacheExpired(): boolean {
    if (!this.lastFetchTime) return true;
    return Date.now() - this.lastFetchTime.getTime() > this.cacheExpiryMs;
  }

  public async refreshIfNeeded(): Promise<void> {
    if (this.isCacheExpired()) {
      await this.loadSources();
    }
  }

  public setCacheExpiry(ms: number): void {
    this.cacheExpiryMs = ms;
  }

  public exportSources(): SentimentSourcesData {
    return {
      sources: Array.from(this.sources.values())
    };
  }

  public importSources(data: SentimentSourcesData): void {
    // Validate the data first
    const validation = schemaValidator.validateData('sentiment-sources', data);
    if (!validation.isValid) {
      throw new Error(`Invalid import data: ${validation.errors.map(e => e.message).join(', ')}`);
    }

    // Clear existing and import new sources
    this.sources.clear();
    data.sources.forEach(source => {
      this.sources.set(source.id, source);
    });

    this.lastFetchTime = new Date();
  }
}

// Export singleton instance
export const sentimentSourcesService = SentimentSourcesService.getInstance();

// React hook for using sentiment sources
export function useSentimentSources() {
  const [sources, setSources] = React.useState<SentimentSource[]>(() => 
    sentimentSourcesService.getAllSources()
  );
  const [loading, setLoading] = React.useState(false);

  const refreshSources = React.useCallback(async () => {
    setLoading(true);
    try {
      await sentimentSourcesService.refreshIfNeeded();
      setSources(sentimentSourcesService.getAllSources());
    } catch (error) {
      console.error('Failed to refresh sentiment sources:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refreshSources();
  }, [refreshSources]);

  return {
    sources,
    loading,
    refreshSources,
    getActiveSources: () => sentimentSourcesService.getActiveSources(),
    getSourceOptions: () => sentimentSourcesService.getSourceOptions(),
    getActiveSourceOptions: () => sentimentSourcesService.getActiveSourceOptions(),
    isValidSourceId: (id: string) => sentimentSourcesService.isValidSourceId(id),
    getSourceById: (id: string) => sentimentSourcesService.getSourceById(id)
  };
}

import React from 'react';
