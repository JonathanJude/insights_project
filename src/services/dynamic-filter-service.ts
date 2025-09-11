/**
 * Dynamic Filter Service
 * 
 * This service automatically generates filter options from loaded data,
 * implements real-time filter updates when data changes, and provides
 * automatic validation of filter selections.
 * 
 * Features:
 * - Dynamic filter option generation from JSON data
 * - Real-time updates when data changes
 * - Automatic validation of filter selections
 * - Data relationship maintenance
 * - Performance optimization with caching
 */

// Simple browser-compatible event emitter
class EventEmitter {
  private events: { [key: string]: Function[] } = {};
  
  on(event: string, callback: Function) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  
  emit(event: string, ...args: any[]) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(...args));
    }
  }
  
  off(event: string, callback: Function) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
  
  removeAllListeners() {
    this.events = {};
  }
}
import { LoadingStates } from '../constants/enums';
import { ERROR_MESSAGES } from '../constants/messages';
import { constantService } from './constant-service';
import { dataLoader } from './data-loader';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
  color?: string;
  description?: string;
  metadata?: Record<string, any>;
  isAvailable: boolean;
  dataQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface FilterCategory {
  id: string;
  name: string;
  description: string;
  options: FilterOption[];
  isMultiSelect: boolean;
  isRequired: boolean;
  dependencies?: string[];
  loadingState: LoadingStates;
  lastUpdated: Date;
  dataSource: string;
}

export interface FilterValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: FilterOption[];
}

export interface DynamicFilterConfig {
  enableRealTimeUpdates: boolean;
  enableValidation: boolean;
  enableCaching: boolean;
  cacheTimeout: number;
  maxOptions: number;
  minDataQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

/**
 * Dynamic Filter Service for automatic filter option generation
 */
export class DynamicFilterService extends EventEmitter {
  private static instance: DynamicFilterService;
  
  private filterCategories = new Map<string, FilterCategory>();
  private filterCache = new Map<string, { data: FilterOption[]; timestamp: number }>();
  private dataSubscriptions = new Map<string, () => void>();
  private config: DynamicFilterConfig;
  
  private constructor(config: Partial<DynamicFilterConfig> = {}) {
    super();
    
    this.config = {
      enableRealTimeUpdates: true,
      enableValidation: true,
      enableCaching: true,
      cacheTimeout: 5 * 60 * 1000, // 5 minutes
      maxOptions: 1000,
      minDataQuality: 'fair',
      ...config
    };
    
    this.initializeDataSubscriptions();
  }
  
  static getInstance(config?: Partial<DynamicFilterConfig>): DynamicFilterService {
    if (!DynamicFilterService.instance) {
      DynamicFilterService.instance = new DynamicFilterService(config);
    }
    return DynamicFilterService.instance;
  }
  
  /**
   * Initialize data subscriptions for real-time updates
   */
  private initializeDataSubscriptions(): void {
    if (!this.config.enableRealTimeUpdates) return;
    
    // Subscribe to data loader events
    dataLoader.on('loadSuccess', (event) => {
      this.handleDataUpdate(event.key, event.data);
    });
    
    dataLoader.on('cacheCleared', () => {
      this.clearFilterCache();
    });
  }
  
  /**
   * Handle data updates and refresh affected filters
   */
  private handleDataUpdate(dataKey: string, data: any): void {
    const affectedCategories = this.getAffectedCategories(dataKey);
    
    affectedCategories.forEach(categoryId => {
      this.refreshFilterCategory(categoryId);
    });
    
    this.emit('filtersUpdated', { dataKey, affectedCategories });
  }
  
  /**
   * Get filter categories affected by data changes
   */
  private getAffectedCategories(dataKey: string): string[] {
    const categoryMappings: Record<string, string[]> = {
      'parties': ['party', 'political-party'],
      'states': ['state', 'geographic-location'],
      'politicians': ['politician', 'party', 'state'],
      'sentiment-data': ['sentiment', 'platform'],
      'engagement-metrics': ['platform', 'engagement-level'],
      'topic-trends': ['topic', 'policy-area']
    };
    
    return categoryMappings[dataKey] || [];
  }
  
  /**
   * Generate filter options for political parties
   */
  async generatePartyOptions(): Promise<FilterOption[]> {
    const cacheKey = 'party-options';
    
    // Check cache first
    if (this.config.enableCaching) {
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
    }
    
    try {
      const parties = await dataLoader.loadData(
        'parties',
        () => fetch('/data/core/parties.json').then(r => r.json())
      );
      
      const options: FilterOption[] = parties.parties.map((party: any) => ({
        value: party.id,
        label: party.name,
        count: 0, // Will be populated by usage statistics
        color: party.colors?.primary || '#6B7280',
        description: `${party.abbreviation} - ${party.name}`,
        metadata: {
          abbreviation: party.abbreviation,
          founded: party.founded,
          ideology: party.ideology,
          status: party.metadata?.status
        },
        isAvailable: party.metadata?.status === 'active',
        dataQuality: this.assessDataQuality(party)
      }));
      
      // Filter by data quality
      const filteredOptions = options.filter(option => 
        this.isQualityAcceptable(option.dataQuality)
      );
      
      // Cache the results
      if (this.config.enableCaching) {
        this.setCache(cacheKey, filteredOptions);
      }
      
      return filteredOptions;
      
    } catch (error) {
      console.error('Error generating party options:', error);
      throw new Error(ERROR_MESSAGES.FILTER_LOAD_OPTIONS_ERROR);
    }
  }
  
  /**
   * Generate filter options for states
   */
  async generateStateOptions(): Promise<FilterOption[]> {
    const cacheKey = 'state-options';
    
    if (this.config.enableCaching) {
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
    }
    
    try {
      const states = await dataLoader.loadData(
        'states',
        () => fetch('/data/core/states.json').then(r => r.json())
      );
      
      const options: FilterOption[] = states.states.map((state: any) => ({
        value: state.id,
        label: state.name,
        count: 0,
        description: `${state.capital} - ${state.metadata?.slogan || ''}`,
        metadata: {
          code: state.code,
          capital: state.capital,
          region: state.region,
          population: state.population,
          coordinates: state.coordinates
        },
        isAvailable: true,
        dataQuality: this.assessDataQuality(state)
      }));
      
      const filteredOptions = options.filter(option => 
        this.isQualityAcceptable(option.dataQuality)
      );
      
      if (this.config.enableCaching) {
        this.setCache(cacheKey, filteredOptions);
      }
      
      return filteredOptions;
      
    } catch (error) {
      console.error('Error generating state options:', error);
      throw new Error(ERROR_MESSAGES.FILTER_LOAD_OPTIONS_ERROR);
    }
  }
  
  /**
   * Generate filter options for politicians
   */
  async generatePoliticianOptions(): Promise<FilterOption[]> {
    const cacheKey = 'politician-options';
    
    if (this.config.enableCaching) {
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
    }
    
    try {
      const politicians = await dataLoader.loadData(
        'politicians',
        () => fetch('/data/politicians/politicians.json').then(r => r.json())
      );
      
      const options: FilterOption[] = politicians.politicians.map((politician: any) => ({
        value: politician.id,
        label: politician.fullName,
        count: 0,
        description: `${politician.currentPositionId || 'Politician'} - ${politician.partyId || 'Independent'}`,
        metadata: {
          firstName: politician.firstName,
          lastName: politician.lastName,
          party: politician.partyId,
          state: politician.stateOfOriginId,
          position: politician.currentPositionId,
          gender: politician.gender,
          isActive: politician.metadata?.isActive,
          verificationStatus: politician.metadata?.verificationStatus
        },
        isAvailable: politician.metadata?.isActive !== false,
        dataQuality: this.assessDataQuality(politician)
      }));
      
      const filteredOptions = options.filter(option => 
        this.isQualityAcceptable(option.dataQuality)
      );
      
      if (this.config.enableCaching) {
        this.setCache(cacheKey, filteredOptions);
      }
      
      return filteredOptions;
      
    } catch (error) {
      console.error('Error generating politician options:', error);
      throw new Error(ERROR_MESSAGES.FILTER_LOAD_OPTIONS_ERROR);
    }
  }
  
  /**
   * Generate filter options for platforms (basic social media platforms)
   */
  async generatePlatformOptions(): Promise<FilterOption[]> {
    const cacheKey = 'platform-options';
    
    if (this.config.enableCaching) {
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
    }
    
    // Basic platform definitions (since no dedicated platforms file exists)
    const platforms = [
      { id: 'twitter', displayName: 'Twitter/X', category: 'microblogging', color: '#1DA1F2' },
      { id: 'facebook', displayName: 'Facebook', category: 'social networking', color: '#4267B2' },
      { id: 'instagram', displayName: 'Instagram', category: 'visual media', color: '#E4405F' },
      { id: 'threads', displayName: 'Threads', category: 'microblogging', color: '#000000' },
      { id: 'youtube', displayName: 'YouTube', category: 'video sharing', color: '#FF0000' },
      { id: 'tiktok', displayName: 'TikTok', category: 'video sharing', color: '#000000' },
      { id: 'news', displayName: 'News Media', category: 'traditional media', color: '#2C3E50' }
    ];
    
    const options: FilterOption[] = platforms.map(platform => ({
      value: platform.id,
      label: platform.displayName,
      count: 0,
      color: platform.color,
      description: `${platform.category} platform`,
      metadata: {
        category: platform.category
      },
      isAvailable: true,
      dataQuality: 'good' as const
    }));
    
    if (this.config.enableCaching) {
      this.setCache(cacheKey, options);
    }
    
    return options;
  }
  
  /**
   * Generate filter options for sentiment labels
   */
  async generateSentimentOptions(): Promise<FilterOption[]> {
    const cacheKey = 'sentiment-options';
    
    if (this.config.enableCaching) {
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
    }
    
    try {
      // Get sentiment options from constant service
      const sentimentLabels = constantService.getSentimentLabels();
      
      const options: FilterOption[] = sentimentLabels.map(sentiment => ({
        value: sentiment.value,
        label: sentiment.label,
        count: 0,
        color: sentiment.color,
        description: `Sentiment: ${sentiment.label}`,
        metadata: {
          type: 'sentiment',
          score: constantService.getSentimentScore(sentiment.value)
        },
        isAvailable: true,
        dataQuality: 'excellent' as const
      }));
      
      if (this.config.enableCaching) {
        this.setCache(cacheKey, options);
      }
      
      return options;
      
    } catch (error) {
      console.error('Error generating sentiment options:', error);
      throw new Error(ERROR_MESSAGES.FILTER_LOAD_OPTIONS_ERROR);
    }
  }
  
  /**
   * Generate filter options for topics from topic trends data
   */
  async generateTopicOptions(): Promise<FilterOption[]> {
    const cacheKey = 'topic-options';
    
    if (this.config.enableCaching) {
      const cached = this.getFromCache(cacheKey);
      if (cached) return cached;
    }
    
    try {
      const topicData = await dataLoader.loadData(
        'topic-trends',
        () => import('../data/analytics/topic-trends.json'),
        { cacheTTL: 30 * 60 * 1000 } // 30 minutes
      );
      
      const options: FilterOption[] = topicData.topicTrends?.map((topic: any) => ({
        value: topic.id,
        label: topic.topicName,
        count: topic.mentions || 0,
        description: `${topic.category} - ${topic.trendDirection} trend`,
        metadata: {
          category: topic.category,
          keywords: topic.keywords,
          trendDirection: topic.trendDirection,
          urgency: topic.urgencyLevel,
          sentiment: topic.sentimentAssociation,
          trendingScore: topic.trendingScore
        },
        isAvailable: topic.isActive !== false,
        dataQuality: this.assessDataQuality(topic)
      })) || [];
      
      const filteredOptions = options.filter(option => 
        this.isQualityAcceptable(option.dataQuality)
      );
      
      if (this.config.enableCaching) {
        this.setCache(cacheKey, filteredOptions);
      }
      
      return filteredOptions;
      
    } catch (error) {
      console.error('Error generating topic options:', error);
      throw new Error(ERROR_MESSAGES.FILTER_LOAD_OPTIONS_ERROR);
    }
  }
  
  /**
   * Get all available filter categories
   */
  async getAllFilterCategories(): Promise<Map<string, FilterCategory>> {
    const categories = new Map<string, FilterCategory>();
    
    try {
      // Political Parties
      categories.set('party', {
        id: 'party',
        name: 'Political Parties',
        description: 'Filter by political party affiliation',
        options: await this.generatePartyOptions(),
        isMultiSelect: true,
        isRequired: false,
        loadingState: LoadingStates.SUCCESS,
        lastUpdated: new Date(),
        dataSource: 'parties.json'
      });
      
      // States
      categories.set('state', {
        id: 'state',
        name: 'States',
        description: 'Filter by Nigerian states',
        options: await this.generateStateOptions(),
        isMultiSelect: true,
        isRequired: false,
        loadingState: LoadingStates.SUCCESS,
        lastUpdated: new Date(),
        dataSource: 'states.json'
      });
      
      // Politicians
      categories.set('politician', {
        id: 'politician',
        name: 'Politicians',
        description: 'Filter by specific politicians',
        options: await this.generatePoliticianOptions(),
        isMultiSelect: true,
        isRequired: false,
        dependencies: ['party', 'state'],
        loadingState: LoadingStates.SUCCESS,
        lastUpdated: new Date(),
        dataSource: 'politicians.json'
      });
      
      // Platforms
      categories.set('platform', {
        id: 'platform',
        name: 'Social Platforms',
        description: 'Filter by social media platforms',
        options: await this.generatePlatformOptions(),
        isMultiSelect: true,
        isRequired: false,
        loadingState: LoadingStates.SUCCESS,
        lastUpdated: new Date(),
        dataSource: 'sentiment-data.json'
      });
      
      // Sentiment
      categories.set('sentiment', {
        id: 'sentiment',
        name: 'Sentiment',
        description: 'Filter by sentiment polarity',
        options: await this.generateSentimentOptions(),
        isMultiSelect: true,
        isRequired: false,
        loadingState: LoadingStates.SUCCESS,
        lastUpdated: new Date(),
        dataSource: 'constants'
      });
      
      // Topics
      categories.set('topic', {
        id: 'topic',
        name: 'Topics',
        description: 'Filter by policy areas and topics',
        options: await this.generateTopicOptions(),
        isMultiSelect: true,
        isRequired: false,
        loadingState: LoadingStates.SUCCESS,
        lastUpdated: new Date(),
        dataSource: 'topic-trends.json'
      });
      
    } catch (error) {
      console.error('Error loading filter categories:', error);
      // Set error state for failed categories
      categories.forEach(category => {
        category.loadingState = LoadingStates.ERROR;
      });
    }
    
    this.filterCategories = categories;
    return categories;
  }
  
  /**
   * Validate filter selections
   */
  validateFilterSelection(
    categoryId: string, 
    selectedValues: string[]
  ): FilterValidationResult {
    const category = this.filterCategories.get(categoryId);
    
    if (!category) {
      return {
        isValid: false,
        errors: [`Unknown filter category: ${categoryId}`],
        warnings: [],
        suggestions: []
      };
    }
    
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: FilterOption[] = [];
    
    // Check if values exist in options
    const availableValues = new Set(
      category.options
        .filter(option => option.isAvailable)
        .map(option => option.value)
    );
    
    selectedValues.forEach(value => {
      if (!availableValues.has(value)) {
        errors.push(`Invalid ${categoryId} selection: ${value}`);
        
        // Find similar options for suggestions
        const similarOptions = category.options.filter(option =>
          option.label.toLowerCase().includes(value.toLowerCase()) ||
          option.value.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 3);
        
        suggestions.push(...similarOptions);
      }
    });
    
    // Check data quality warnings
    selectedValues.forEach(value => {
      const option = category.options.find(opt => opt.value === value);
      if (option && option.dataQuality === 'poor') {
        warnings.push(`Low data quality for ${categoryId}: ${option.label}`);
      }
    });
    
    // Check dependencies
    if (category.dependencies) {
      category.dependencies.forEach(depId => {
        const depCategory = this.filterCategories.get(depId);
        if (depCategory && depCategory.options.length === 0) {
          warnings.push(`Dependent filter ${depId} has no available options`);
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions: [...new Set(suggestions)] // Remove duplicates
    };
  }
  
  /**
   * Refresh a specific filter category
   */
  async refreshFilterCategory(categoryId: string): Promise<void> {
    const category = this.filterCategories.get(categoryId);
    if (!category) return;
    
    category.loadingState = LoadingStates.LOADING;
    this.emit('categoryUpdating', { categoryId });
    
    try {
      let newOptions: FilterOption[] = [];
      
      switch (categoryId) {
        case 'party':
          newOptions = await this.generatePartyOptions();
          break;
        case 'state':
          newOptions = await this.generateStateOptions();
          break;
        case 'politician':
          newOptions = await this.generatePoliticianOptions();
          break;
        case 'platform':
          newOptions = await this.generatePlatformOptions();
          break;
        case 'sentiment':
          newOptions = await this.generateSentimentOptions();
          break;
        case 'topic':
          newOptions = await this.generateTopicOptions();
          break;
      }
      
      category.options = newOptions;
      category.loadingState = LoadingStates.SUCCESS;
      category.lastUpdated = new Date();
      
      this.emit('categoryUpdated', { categoryId, options: newOptions });
      
    } catch (error) {
      category.loadingState = LoadingStates.ERROR;
      this.emit('categoryError', { categoryId, error });
    }
  }
  
  /**
   * Get default platform options as fallback
   */
  private getDefaultPlatformOptions(): FilterOption[] {
    const defaultPlatforms = [
      { name: 'Twitter', color: '#1DA1F2' },
      { name: 'Facebook', color: '#4267B2' },
      { name: 'Instagram', color: '#E4405F' },
      { name: 'TikTok', color: '#000000' },
      { name: 'YouTube', color: '#FF0000' }
    ];
    
    return defaultPlatforms.map(platform => ({
      value: platform.name,
      label: platform.name,
      count: 0,
      color: platform.color,
      description: `Social media platform: ${platform.name}`,
      metadata: { type: 'social-media', isDefault: true },
      isAvailable: true,
      dataQuality: 'good' as const
    }));
  }
  
  /**
   * Assess data quality of an object
   */
  private assessDataQuality(data: any): 'excellent' | 'good' | 'fair' | 'poor' {
    if (!data) return 'poor';
    
    const requiredFields = ['id', 'name'];
    const optionalFields = ['description', 'metadata'];
    
    const hasRequired = requiredFields.every(field => 
      data[field] !== undefined && data[field] !== null && data[field] !== ''
    );
    
    if (!hasRequired) return 'poor';
    
    const hasOptional = optionalFields.filter(field => 
      data[field] !== undefined && data[field] !== null
    ).length;
    
    const completeness = hasOptional / optionalFields.length;
    
    if (completeness >= 0.8) return 'excellent';
    if (completeness >= 0.6) return 'good';
    if (completeness >= 0.4) return 'fair';
    return 'poor';
  }
  
  /**
   * Check if data quality is acceptable
   */
  private isQualityAcceptable(quality: 'excellent' | 'good' | 'fair' | 'poor'): boolean {
    const qualityLevels = { excellent: 4, good: 3, fair: 2, poor: 1 };
    return qualityLevels[quality] >= qualityLevels[this.config.minDataQuality];
  }
  
  /**
   * Cache management
   */
  private getFromCache(key: string): FilterOption[] | null {
    if (!this.config.enableCaching) return null;
    
    const cached = this.filterCache.get(key);
    if (!cached) return null;
    
    const isExpired = Date.now() - cached.timestamp > this.config.cacheTimeout;
    if (isExpired) {
      this.filterCache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  private setCache(key: string, data: FilterOption[]): void {
    if (!this.config.enableCaching) return;
    
    this.filterCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  private clearFilterCache(): void {
    this.filterCache.clear();
    this.emit('cacheCleared');
  }
  
  /**
   * Get filter statistics
   */
  getFilterStatistics(): {
    totalCategories: number;
    totalOptions: number;
    cacheSize: number;
    lastUpdated: Date | null;
  } {
    const totalOptions = Array.from(this.filterCategories.values())
      .reduce((sum, category) => sum + category.options.length, 0);
    
    const lastUpdated = Array.from(this.filterCategories.values())
      .reduce((latest, category) => 
        !latest || category.lastUpdated > latest ? category.lastUpdated : latest,
        null as Date | null
      );
    
    return {
      totalCategories: this.filterCategories.size,
      totalOptions,
      cacheSize: this.filterCache.size,
      lastUpdated
    };
  }
  
  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<DynamicFilterConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (!newConfig.enableCaching && this.config.enableCaching === false) {
      this.clearFilterCache();
    }
  }
  
  /**
   * Cleanup resources
   */
  destroy(): void {
    this.clearFilterCache();
    this.filterCategories.clear();
    this.dataSubscriptions.clear();
    this.removeAllListeners();
  }
}

// Export singleton instance
export const dynamicFilterService = DynamicFilterService.getInstance();
export default DynamicFilterService;