import { EducationLevels, OccupationSectors } from '../enums/core-enums';
import { SocialPlatforms } from '../enums/political-enums';
import { SentimentLabels } from '../enums/sentiment-enums';
import { FilterCategories, SortDirections } from '../enums/ui-enums';
// Import party and state constants from JSON data
// These values match the data in src/data/core/parties.json and src/data/core/states.json

export interface SearchConfiguration {
  id: string;
  name: string;
  description: string;
  minQueryLength: number;
  maxSuggestions: number;
  debounceMs: number;
  fuzzyThreshold: number;
  enableHistory: boolean;
  enableSuggestions: boolean;
  enableHighlighting: boolean;
  caseSensitive: boolean;
  searchFields: SearchField[];
  rankingWeights: RankingWeights;
  metadata: {
    version: string;
    lastUpdated: string;
    author: string;
    tags: string[];
  };
}

export interface SearchField {
  field: string;
  weight: number;
  boost: number;
  fuzzy: boolean;
  exact: boolean;
  prefix: boolean;
}

export interface RankingWeights {
  exactMatch: number;
  prefixMatch: number;
  fuzzyMatch: number;
  popularity: number;
  recency: number;
  relevance: number;
}

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: FilterCategories;
  filters: FilterConfiguration;
  isDefault: boolean;
  isPopular: boolean;
  usageCount: number;
  metadata: {
    version: string;
    lastUpdated: string;
    author: string;
    tags: string[];
  };
}

export interface FilterConfiguration {
  parties?: string[];
  states?: string[];
  platforms?: string[];
  sentiments?: string[];
  genders?: string[];
  ageGroups?: string[];
  educationLevels?: string[];
  occupations?: string[];
  locationTypes?: string[];
  dateRange?: {
    start?: string;
    end?: string;
    preset?: string;
  };
  customFilters?: Record<string, any>;
}

export interface SortConfiguration {
  id: string;
  name: string;
  description: string;
  field: string;
  direction: SortDirections;
  isDefault: boolean;
  isNumeric: boolean;
  nullsLast: boolean;
  caseSensitive: boolean;
  metadata: {
    version: string;
    lastUpdated: string;
    author: string;
    tags: string[];
  };
}

// Search Configurations
export const POLITICIAN_SEARCH_CONFIG: SearchConfiguration = {
  id: 'politician-search',
  name: 'Politician Search Configuration',
  description: 'Search configuration for politician profiles and data',
  minQueryLength: 2,
  maxSuggestions: 8,
  debounceMs: 150,
  fuzzyThreshold: 0.6,
  enableHistory: true,
  enableSuggestions: true,
  enableHighlighting: true,
  caseSensitive: false,
  searchFields: [
    { field: 'name', weight: 1.0, boost: 2.0, fuzzy: true, exact: true, prefix: true },
    { field: 'fullName', weight: 0.9, boost: 1.8, fuzzy: true, exact: true, prefix: true },
    { field: 'party', weight: 0.8, boost: 1.5, fuzzy: false, exact: true, prefix: true },
    { field: 'position', weight: 0.7, boost: 1.3, fuzzy: true, exact: false, prefix: true },
    { field: 'state', weight: 0.6, boost: 1.2, fuzzy: false, exact: true, prefix: true },
    { field: 'biography', weight: 0.4, boost: 1.0, fuzzy: true, exact: false, prefix: false },
    { field: 'achievements', weight: 0.3, boost: 0.8, fuzzy: true, exact: false, prefix: false }
  ],
  rankingWeights: {
    exactMatch: 1.0,
    prefixMatch: 0.8,
    fuzzyMatch: 0.6,
    popularity: 0.4,
    recency: 0.3,
    relevance: 0.5
  },
  metadata: {
    version: '1.0.0',
    lastUpdated: '2024-01-15',
    author: 'System',
    tags: ['politician', 'search', 'configuration']
  }
};

export const PARTY_SEARCH_CONFIG: SearchConfiguration = {
  id: 'party-search',
  name: 'Party Search Configuration',
  description: 'Search configuration for political parties and analysis',
  minQueryLength: 1,
  maxSuggestions: 6,
  debounceMs: 100,
  fuzzyThreshold: 0.7,
  enableHistory: true,
  enableSuggestions: true,
  enableHighlighting: true,
  caseSensitive: false,
  searchFields: [
    { field: 'name', weight: 1.0, boost: 2.0, fuzzy: false, exact: true, prefix: true },
    { field: 'abbreviation', weight: 1.0, boost: 2.0, fuzzy: false, exact: true, prefix: true },
    { field: 'fullName', weight: 0.9, boost: 1.8, fuzzy: true, exact: true, prefix: true },
    { field: 'ideology', weight: 0.6, boost: 1.2, fuzzy: true, exact: false, prefix: false },
    { field: 'leadership', weight: 0.5, boost: 1.0, fuzzy: true, exact: false, prefix: false }
  ],
  rankingWeights: {
    exactMatch: 1.0,
    prefixMatch: 0.9,
    fuzzyMatch: 0.7,
    popularity: 0.6,
    recency: 0.2,
    relevance: 0.4
  },
  metadata: {
    version: '1.0.0',
    lastUpdated: '2024-01-15',
    author: 'System',
    tags: ['party', 'search', 'configuration']
  }
};

export const TOPIC_SEARCH_CONFIG: SearchConfiguration = {
  id: 'topic-search',
  name: 'Topic Search Configuration',
  description: 'Search configuration for topics, issues, and trends',
  minQueryLength: 3,
  maxSuggestions: 10,
  debounceMs: 200,
  fuzzyThreshold: 0.5,
  enableHistory: true,
  enableSuggestions: true,
  enableHighlighting: true,
  caseSensitive: false,
  searchFields: [
    { field: 'topic', weight: 1.0, boost: 2.0, fuzzy: true, exact: true, prefix: true },
    { field: 'keywords', weight: 0.8, boost: 1.6, fuzzy: true, exact: false, prefix: true },
    { field: 'description', weight: 0.6, boost: 1.2, fuzzy: true, exact: false, prefix: false },
    { field: 'category', weight: 0.7, boost: 1.4, fuzzy: false, exact: true, prefix: true },
    { field: 'relatedTopics', weight: 0.4, boost: 0.8, fuzzy: true, exact: false, prefix: false }
  ],
  rankingWeights: {
    exactMatch: 1.0,
    prefixMatch: 0.7,
    fuzzyMatch: 0.5,
    popularity: 0.8,
    recency: 0.9,
    relevance: 0.6
  },
  metadata: {
    version: '1.0.0',
    lastUpdated: '2024-01-15',
    author: 'System',
    tags: ['topic', 'search', 'configuration']
  }
};

export const GLOBAL_SEARCH_CONFIG: SearchConfiguration = {
  id: 'global-search',
  name: 'Global Search Configuration',
  description: 'Universal search configuration across all content types',
  minQueryLength: 2,
  maxSuggestions: 12,
  debounceMs: 200,
  fuzzyThreshold: 0.6,
  enableHistory: true,
  enableSuggestions: true,
  enableHighlighting: true,
  caseSensitive: false,
  searchFields: [
    { field: 'title', weight: 1.0, boost: 2.0, fuzzy: true, exact: true, prefix: true },
    { field: 'content', weight: 0.8, boost: 1.6, fuzzy: true, exact: false, prefix: false },
    { field: 'tags', weight: 0.7, boost: 1.4, fuzzy: false, exact: true, prefix: true },
    { field: 'category', weight: 0.6, boost: 1.2, fuzzy: false, exact: true, prefix: true },
    { field: 'metadata', weight: 0.4, boost: 0.8, fuzzy: true, exact: false, prefix: false }
  ],
  rankingWeights: {
    exactMatch: 1.0,
    prefixMatch: 0.8,
    fuzzyMatch: 0.6,
    popularity: 0.5,
    recency: 0.7,
    relevance: 0.9
  },
  metadata: {
    version: '1.0.0',
    lastUpdated: '2024-01-15',
    author: 'System',
    tags: ['global', 'search', 'configuration']
  }
};

// Filter Presets
export const POPULAR_POLITICIANS_PRESET: FilterPreset = {
  id: 'popular-politicians',
  name: 'Popular Politicians',
  description: 'Most mentioned and discussed politicians',
  icon: 'fire',
  category: FilterCategories.SENTIMENT,
  filters: {
    sentiments: [SentimentLabels.POSITIVE, SentimentLabels.VERY_POSITIVE],
    platforms: [SocialPlatforms.TWITTER, SocialPlatforms.FACEBOOK, SocialPlatforms.INSTAGRAM]
  },
  isDefault: true,
  isPopular: true,
  usageCount: 1250,
  metadata: {
    version: '1.0.0',
    lastUpdated: '2024-01-15',
    author: 'System',
    tags: ['popular', 'politicians', 'preset']
  }
};

export const TRENDING_TOPICS_PRESET: FilterPreset = {
  id: 'trending-topics',
  name: 'Trending Topics',
  description: 'Currently trending political topics and issues',
  icon: 'trending-up',
  category: FilterCategories.DATE_RANGE,
  filters: {
    dateRange: {
      preset: '7d'
    },
    platforms: [SocialPlatforms.TWITTER, SocialPlatforms.THREADS]
  },
  isDefault: false,
  isPopular: true,
  usageCount: 890,
  metadata: {
    version: '1.0.0',
    lastUpdated: '2024-01-15',
    author: 'System',
    tags: ['trending', 'topics', 'preset']
  }
};

export const MAJOR_PARTIES_PRESET: FilterPreset = {
  id: 'major-parties',
  name: 'Major Political Parties',
  description: 'Focus on the three major political parties',
  icon: 'building-office',
  category: FilterCategories.PARTY,
  filters: {
    parties: ['APC', 'PDP', 'LP'] // Values from src/data/core/parties.json
  },
  isDefault: false,
  isPopular: true,
  usageCount: 2100,
  metadata: {
    version: '1.0.0',
    lastUpdated: '2024-01-15',
    author: 'System',
    tags: ['major', 'parties', 'preset']
  }
};

export const YOUTH_DEMOGRAPHICS_PRESET: FilterPreset = {
  id: 'youth-demographics',
  name: 'Youth Demographics',
  description: 'Focus on younger age groups and their political engagement',
  icon: 'user-group',
  category: FilterCategories.AGE_GROUP,
  filters: {
    ageGroups: ['18-25', '26-35'],
    educationLevels: [EducationLevels.TERTIARY, EducationLevels.SECONDARY],
    occupations: [OccupationSectors.STUDENT, OccupationSectors.TECHNOLOGY]
  },
  isDefault: false,
  isPopular: false,
  usageCount: 450,
  metadata: {
    version: '1.0.0',
    lastUpdated: '2024-01-15',
    author: 'System',
    tags: ['youth', 'demographics', 'preset']
  }
};

export const NEGATIVE_SENTIMENT_PRESET: FilterPreset = {
  id: 'negative-sentiment',
  name: 'Negative Sentiment Analysis',
  description: 'Focus on negative sentiment and criticism',
  icon: 'face-frown',
  category: FilterCategories.SENTIMENT,
  filters: {
    sentiments: [SentimentLabels.NEGATIVE, SentimentLabels.VERY_NEGATIVE]
  },
  isDefault: false,
  isPopular: false,
  usageCount: 320,
  metadata: {
    version: '1.0.0',
    lastUpdated: '2024-01-15',
    author: 'System',
    tags: ['negative', 'sentiment', 'preset']
  }
};

export const REGIONAL_ANALYSIS_PRESET: FilterPreset = {
  id: 'regional-analysis',
  name: 'Regional Analysis',
  description: 'Compare sentiment across different regions',
  icon: 'map',
  category: FilterCategories.STATE,
  filters: {
    states: [
      'Lagos',
      'Kano',
      'Rivers',
      'Kaduna',
      'Ogun',
      'Anambra'
    ] // Values from src/data/core/states.json
  },
  isDefault: false,
  isPopular: true,
  usageCount: 680,
  metadata: {
    version: '1.0.0',
    lastUpdated: '2024-01-15',
    author: 'System',
    tags: ['regional', 'analysis', 'preset']
  }
};

export const SOCIAL_MEDIA_FOCUS_PRESET: FilterPreset = {
  id: 'social-media-focus',
  name: 'Social Media Focus',
  description: 'Analyze social media platforms only',
  icon: 'device-phone-mobile',
  category: FilterCategories.PLATFORM,
  filters: {
    platforms: [
      SocialPlatforms.TWITTER,
      SocialPlatforms.FACEBOOK,
      SocialPlatforms.INSTAGRAM,
      SocialPlatforms.THREADS,
      SocialPlatforms.TIKTOK
    ]
  },
  isDefault: false,
  isPopular: true,
  usageCount: 1100,
  metadata: {
    version: '1.0.0',
    lastUpdated: '2024-01-15',
    author: 'System',
    tags: ['social', 'media', 'preset']
  }
};

// Sort Configurations
export const RELEVANCE_SORT: SortConfiguration = {
  id: 'relevance-sort',
  name: 'Relevance',
  description: 'Sort by search relevance and match quality',
  field: 'relevanceScore',
  direction: SortDirections.DESC,
  isDefault: true,
  isNumeric: true,
  nullsLast: true,
  caseSensitive: false,
  metadata: {
    version: '1.0.0',
    lastUpdated: '2024-01-15',
    author: 'System',
    tags: ['relevance', 'sort', 'default']
  }
};

export const NAME_SORT_ASC: SortConfiguration = {
  id: 'name-asc-sort',
  name: 'Name (A-Z)',
  description: 'Sort alphabetically by name (ascending)',
  field: 'name',
  direction: SortDirections.ASC,
  isDefault: false,
  isNumeric: false,
  nullsLast: true,
  caseSensitive: false,
  metadata: {
    version: '1.0.0',
    lastUpdated: '2024-01-15',
    author: 'System',
    tags: ['name', 'alphabetical', 'sort']
  }
};

export const NAME_SORT_DESC: SortConfiguration = {
  id: 'name-desc-sort',
  name: 'Name (Z-A)',
  description: 'Sort alphabetically by name (descending)',
  field: 'name',
  direction: SortDirections.DESC,
  isDefault: false,
  isNumeric: false,
  nullsLast: true,
  caseSensitive: false,
  metadata: {
    version: '1.0.0',
    lastUpdated: '2024-01-15',
    author: 'System',
    tags: ['name', 'alphabetical', 'sort']
  }
};

export const SENTIMENT_SORT_DESC: SortConfiguration = {
  id: 'sentiment-desc-sort',
  name: 'Sentiment (High to Low)',
  description: 'Sort by sentiment score (highest first)',
  field: 'sentimentScore',
  direction: SortDirections.DESC,
  isDefault: false,
  isNumeric: true,
  nullsLast: true,
  caseSensitive: false,
  metadata: {
    version: '1.0.0',
    lastUpdated: '2024-01-15',
    author: 'System',
    tags: ['sentiment', 'score', 'sort']
  }
};

export const SENTIMENT_SORT_ASC: SortConfiguration = {
  id: 'sentiment-asc-sort',
  name: 'Sentiment (Low to High)',
  description: 'Sort by sentiment score (lowest first)',
  field: 'sentimentScore',
  direction: SortDirections.ASC,
  isDefault: false,
  isNumeric: true,
  nullsLast: true,
  caseSensitive: false,
  metadata: {
    version: '1.0.0',
    lastUpdated: '2024-01-15',
    author: 'System',
    tags: ['sentiment', 'score', 'sort']
  }
};

export const MENTIONS_SORT_DESC: SortConfiguration = {
  id: 'mentions-desc-sort',
  name: 'Mentions (High to Low)',
  description: 'Sort by mention count (highest first)',
  field: 'mentionCount',
  direction: SortDirections.DESC,
  isDefault: false,
  isNumeric: true,
  nullsLast: true,
  caseSensitive: false,
  metadata: {
    version: '1.0.0',
    lastUpdated: '2024-01-15',
    author: 'System',
    tags: ['mentions', 'count', 'sort']
  }
};

export const DATE_SORT_DESC: SortConfiguration = {
  id: 'date-desc-sort',
  name: 'Date (Newest First)',
  description: 'Sort by date (most recent first)',
  field: 'lastUpdated',
  direction: SortDirections.DESC,
  isDefault: false,
  isNumeric: false,
  nullsLast: true,
  caseSensitive: false,
  metadata: {
    version: '1.0.0',
    lastUpdated: '2024-01-15',
    author: 'System',
    tags: ['date', 'recent', 'sort']
  }
};

export const DATE_SORT_ASC: SortConfiguration = {
  id: 'date-asc-sort',
  name: 'Date (Oldest First)',
  description: 'Sort by date (oldest first)',
  field: 'lastUpdated',
  direction: SortDirections.ASC,
  isDefault: false,
  isNumeric: false,
  nullsLast: true,
  caseSensitive: false,
  metadata: {
    version: '1.0.0',
    lastUpdated: '2024-01-15',
    author: 'System',
    tags: ['date', 'oldest', 'sort']
  }
};

export const POPULARITY_SORT_DESC: SortConfiguration = {
  id: 'popularity-desc-sort',
  name: 'Popularity (High to Low)',
  description: 'Sort by popularity score (highest first)',
  field: 'popularityScore',
  direction: SortDirections.DESC,
  isDefault: false,
  isNumeric: true,
  nullsLast: true,
  caseSensitive: false,
  metadata: {
    version: '1.0.0',
    lastUpdated: '2024-01-15',
    author: 'System',
    tags: ['popularity', 'score', 'sort']
  }
};

// Combined Collections
export const ALL_SEARCH_CONFIGS: SearchConfiguration[] = [
  POLITICIAN_SEARCH_CONFIG,
  PARTY_SEARCH_CONFIG,
  TOPIC_SEARCH_CONFIG,
  GLOBAL_SEARCH_CONFIG
];

export const ALL_FILTER_PRESETS: FilterPreset[] = [
  POPULAR_POLITICIANS_PRESET,
  TRENDING_TOPICS_PRESET,
  MAJOR_PARTIES_PRESET,
  YOUTH_DEMOGRAPHICS_PRESET,
  NEGATIVE_SENTIMENT_PRESET,
  REGIONAL_ANALYSIS_PRESET,
  SOCIAL_MEDIA_FOCUS_PRESET
];

export const ALL_SORT_CONFIGS: SortConfiguration[] = [
  RELEVANCE_SORT,
  NAME_SORT_ASC,
  NAME_SORT_DESC,
  SENTIMENT_SORT_DESC,
  SENTIMENT_SORT_ASC,
  MENTIONS_SORT_DESC,
  DATE_SORT_DESC,
  DATE_SORT_ASC,
  POPULARITY_SORT_DESC
];

// Utility Functions
export const getSearchConfigById = (id: string): SearchConfiguration | undefined => {
  return ALL_SEARCH_CONFIGS.find(config => config.id === id);
};

export const getFilterPresetById = (id: string): FilterPreset | undefined => {
  return ALL_FILTER_PRESETS.find(preset => preset.id === id);
};

export const getSortConfigById = (id: string): SortConfiguration | undefined => {
  return ALL_SORT_CONFIGS.find(config => config.id === id);
};

export const getDefaultSearchConfig = (): SearchConfiguration => {
  return GLOBAL_SEARCH_CONFIG;
};

export const getDefaultSortConfig = (): SortConfiguration => {
  return RELEVANCE_SORT;
};

export const getPopularFilterPresets = (): FilterPreset[] => {
  return ALL_FILTER_PRESETS.filter(preset => preset.isPopular);
};

export const getDefaultFilterPresets = (): FilterPreset[] => {
  return ALL_FILTER_PRESETS.filter(preset => preset.isDefault);
};

export const getFilterPresetsByCategory = (category: FilterCategories): FilterPreset[] => {
  return ALL_FILTER_PRESETS.filter(preset => preset.category === category);
};

export const getSortConfigsByField = (field: string): SortConfiguration[] => {
  return ALL_SORT_CONFIGS.filter(config => config.field === field);
};

// Advanced Configuration Functions
export const createCustomSearchConfig = (
  baseConfigId: string,
  overrides: Partial<SearchConfiguration>
): SearchConfiguration | null => {
  const baseConfig = getSearchConfigById(baseConfigId);
  if (!baseConfig) return null;

  return {
    ...baseConfig,
    ...overrides,
    id: `${baseConfig.id}-custom-${Date.now()}`,
    metadata: {
      ...baseConfig.metadata,
      ...overrides.metadata,
      version: '1.0.0-custom',
      lastUpdated: new Date().toISOString().split('T')[0]
    }
  };
};

export const createCustomFilterPreset = (
  name: string,
  description: string,
  filters: FilterConfiguration,
  category: FilterCategories = FilterCategories.PARTY
): FilterPreset => {
  return {
    id: `custom-preset-${Date.now()}`,
    name,
    description,
    icon: 'cog',
    category,
    filters,
    isDefault: false,
    isPopular: false,
    usageCount: 0,
    metadata: {
      version: '1.0.0',
      lastUpdated: new Date().toISOString().split('T')[0],
      author: 'User',
      tags: ['custom', 'preset']
    }
  };
};

export const validateFilterConfiguration = (filters: FilterConfiguration): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate parties
  if (filters.parties && filters.parties.length > 10) {
    warnings.push('Too many parties selected, consider using presets');
  }

  // Validate states
  if (filters.states && filters.states.length > 15) {
    warnings.push('Too many states selected, performance may be affected');
  }

  // Validate date range
  if (filters.dateRange?.start && filters.dateRange?.end) {
    const start = new Date(filters.dateRange.start);
    const end = new Date(filters.dateRange.end);
    
    if (start > end) {
      errors.push('Start date must be before end date');
    }
    
    const daysDiff = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (daysDiff > 365) {
      warnings.push('Date range is very large, consider narrowing for better performance');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const optimizeSearchConfig = (config: SearchConfiguration): SearchConfiguration => {
  // Create optimized version of search config
  const optimized = { ...config };

  // Adjust debounce based on query complexity
  if (config.searchFields.length > 5) {
    optimized.debounceMs = Math.max(config.debounceMs, 200);
  }

  // Limit suggestions for performance
  if (config.maxSuggestions > 10) {
    optimized.maxSuggestions = 10;
  }

  // Adjust fuzzy threshold for better performance
  if (config.fuzzyThreshold < 0.5) {
    optimized.fuzzyThreshold = 0.5;
  }

  return optimized;
};