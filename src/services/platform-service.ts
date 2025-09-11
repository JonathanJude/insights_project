/**
 * Social Media Platform Service
 * 
 * This service manages social media platform data using the existing sentiment-sources.json
 * and provides utilities for platform-based operations.
 */

import { dataLoader } from './data-loader';

// Platform data interface
export interface PlatformData {
  id: string;
  name: string;
  type: 'social_media' | 'video' | 'news' | 'blog' | 'forum' | 'podcast';
  isActive: boolean;
  apiEndpoint?: string;
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  dataFields: string[];
  metadata: {
    description: string;
    website?: string;
    icon: string;
    color: string;
    dataRetentionDays: number;
    lastUpdated: string;
    tags: string[];
  };
}

// Platform service response interface
export interface PlatformServiceResponse {
  platforms: PlatformData[];
  totalCount: number;
  activeCount: number;
  lastUpdated: string;
}

/**
 * Social Media Platform Service with data loading and caching
 */
export class PlatformService {
  private static instance: PlatformService;
  private platforms: PlatformData[] = [];

  private constructor() {}

  static getInstance(): PlatformService {
    if (!PlatformService.instance) {
      PlatformService.instance = new PlatformService();
    }
    return PlatformService.instance;
  }

  /**
   * Load all platforms from sentiment sources JSON data
   */
  async loadPlatforms(): Promise<PlatformData[]> {
    try {
      const response = await dataLoader.loadData(
        'sentiment-sources',
        async () => {
          const data = await import('../data/sentiment-sources.json');
          return data;
        },
        { cacheTTL: 60 * 60 * 1000 } // 1 hour cache
      );

      this.platforms = response.sources;
      return this.platforms;
    } catch (error) {
      console.error('Error loading platforms:', error);
      return [];
    }
  }

  /**
   * Get all platforms
   */
  async getAllPlatforms(): Promise<PlatformData[]> {
    if (this.platforms.length === 0) {
      await this.loadPlatforms();
    }
    return this.platforms;
  }

  /**
   * Get platform by ID
   */
  async getPlatformById(id: string): Promise<PlatformData | null> {
    const platforms = await this.getAllPlatforms();
    return platforms.find(p => p.id === id) || null;
  }

  /**
   * Get platform by name
   */
  async getPlatformByName(name: string): Promise<PlatformData | null> {
    const platforms = await this.getAllPlatforms();
    return platforms.find(p => p.name.toLowerCase() === name.toLowerCase()) || null;
  }

  /**
   * Get active platforms only
   */
  async getActivePlatforms(): Promise<PlatformData[]> {
    const platforms = await this.getAllPlatforms();
    return platforms.filter(p => p.isActive);
  }

  /**
   * Get platforms by type
   */
  async getPlatformsByType(type: PlatformData['type']): Promise<PlatformData[]> {
    const platforms = await this.getAllPlatforms();
    return platforms.filter(p => p.type === type);
  }

  /**
   * Get social media platforms only
   */
  async getSocialMediaPlatforms(): Promise<PlatformData[]> {
    return await this.getPlatformsByType('social_media');
  }

  /**
   * Get platform color by ID
   */
  async getPlatformColor(id: string): Promise<string> {
    const platform = await this.getPlatformById(id);
    return platform?.metadata.color || '#000000';
  }

  /**
   * Get platform icon by ID
   */
  async getPlatformIcon(id: string): Promise<string> {
    const platform = await this.getPlatformById(id);
    return platform?.metadata.icon || '/icons/default.svg';
  }

  /**
   * Search platforms by name or tags
   */
  async searchPlatforms(query: string): Promise<PlatformData[]> {
    if (!query.trim()) return await this.getAllPlatforms();
    
    const platforms = await this.getAllPlatforms();
    const searchTerm = query.toLowerCase();
    
    return platforms.filter(platform => 
      platform.name.toLowerCase().includes(searchTerm) ||
      platform.id.toLowerCase().includes(searchTerm) ||
      platform.metadata.description.toLowerCase().includes(searchTerm) ||
      platform.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Get platform statistics
   */
  async getPlatformStats(): Promise<{
    total: number;
    active: number;
    byType: Record<string, number>;
    mostActive: PlatformData | null;
    leastActive: PlatformData | null;
  }> {
    const platforms = await this.getAllPlatforms();
    
    const stats = {
      total: platforms.length,
      active: platforms.filter(p => p.isActive).length,
      byType: {} as Record<string, number>,
      mostActive: null as PlatformData | null,
      leastActive: null as PlatformData | null
    };

    // Calculate statistics by type
    platforms.forEach(p => {
      stats.byType[p.type] = (stats.byType[p.type] || 0) + 1;
    });

    // Find most and least active platforms
    const activePlatforms = platforms.filter(p => p.isActive);
    if (activePlatforms.length > 0) {
      // Sort by rate limit (requests per minute) as a proxy for activity
      const sortedByActivity = activePlatforms.sort((a, b) => {
        const aRate = a.rateLimit?.requestsPerMinute || 0;
        const bRate = b.rateLimit?.requestsPerMinute || 0;
        return bRate - aRate;
      });
      
      stats.mostActive = sortedByActivity[0];
      stats.leastActive = sortedByActivity[sortedByActivity.length - 1];
    }

    return stats;
  }

  /**
   * Get platforms suitable for sentiment analysis
   */
  async getSentimentAnalysisPlatforms(): Promise<PlatformData[]> {
    const platforms = await this.getAllPlatforms();
    return platforms.filter(p => 
      p.isActive && 
      p.dataFields.includes('text') || 
      p.dataFields.includes('caption') ||
      p.dataFields.includes('comments') ||
      p.dataFields.includes('description')
    );
  }

  /**
   * Convert platform data to legacy enum format for backward compatibility
   */
  async getLegacyPlatformMapping(): Promise<Record<string, string>> {
    const platforms = await this.getAllPlatforms();
    const mapping: Record<string, string> = {};
    
    platforms.forEach(platform => {
      mapping[platform.id.toUpperCase()] = platform.name;
    });
    
    return mapping;
  }

  /**
   * Get platform IDs for filter options
   */
  async getPlatformFilterOptions(): Promise<Array<{
    id: string;
    name: string;
    color: string;
    icon: string;
  }>> {
    const platforms = await this.getActivePlatforms();
    
    return platforms.map(platform => ({
      id: platform.id,
      name: platform.name,
      color: platform.metadata.color,
      icon: platform.metadata.icon
    }));
  }

  /**
   * Check if platform supports specific data field
   */
  async platformSupportsField(platformId: string, field: string): Promise<boolean> {
    const platform = await this.getPlatformById(platformId);
    return platform?.dataFields.includes(field) || false;
  }

  /**
   * Get platform data retention policy
   */
  async getPlatformDataRetention(platformId: string): Promise<number> {
    const platform = await this.getPlatformById(platformId);
    return platform?.metadata.dataRetentionDays || 30;
  }
}

// Export singleton instance
export const platformService = PlatformService.getInstance();
export default PlatformService;