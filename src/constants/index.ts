import { AgeGroup, Gender, NigerianState, PoliticalLevel, PoliticalParty, SentimentLabel, SocialPlatform } from '../types';

// Export all new configuration constants
export * from './configurations';
export * from './enums';
export * from './messages';

// Nigerian States
export const NIGERIAN_STATES = [
  { value: NigerianState.ABIA, label: 'Abia' },
  { value: NigerianState.ADAMAWA, label: 'Adamawa' },
  { value: NigerianState.AKWA_IBOM, label: 'Akwa Ibom' },
  { value: NigerianState.ANAMBRA, label: 'Anambra' },
  { value: NigerianState.BAUCHI, label: 'Bauchi' },
  { value: NigerianState.BAYELSA, label: 'Bayelsa' },
  { value: NigerianState.BENUE, label: 'Benue' },
  { value: NigerianState.BORNO, label: 'Borno' },
  { value: NigerianState.CROSS_RIVER, label: 'Cross River' },
  { value: NigerianState.DELTA, label: 'Delta' },
  { value: NigerianState.EBONYI, label: 'Ebonyi' },
  { value: NigerianState.EDO, label: 'Edo' },
  { value: NigerianState.EKITI, label: 'Ekiti' },
  { value: NigerianState.ENUGU, label: 'Enugu' },
  { value: NigerianState.FCT, label: 'FCT Abuja' },
  { value: NigerianState.GOMBE, label: 'Gombe' },
  { value: NigerianState.IMO, label: 'Imo' },
  { value: NigerianState.JIGAWA, label: 'Jigawa' },
  { value: NigerianState.KADUNA, label: 'Kaduna' },
  { value: NigerianState.KANO, label: 'Kano' },
  { value: NigerianState.KATSINA, label: 'Katsina' },
  { value: NigerianState.KEBBI, label: 'Kebbi' },
  { value: NigerianState.KOGI, label: 'Kogi' },
  { value: NigerianState.KWARA, label: 'Kwara' },
  { value: NigerianState.LAGOS, label: 'Lagos' },
  { value: NigerianState.NASARAWA, label: 'Nasarawa' },
  { value: NigerianState.NIGER, label: 'Niger' },
  { value: NigerianState.OGUN, label: 'Ogun' },
  { value: NigerianState.ONDO, label: 'Ondo' },
  { value: NigerianState.OSUN, label: 'Osun' },
  { value: NigerianState.OYO, label: 'Oyo' },
  { value: NigerianState.PLATEAU, label: 'Plateau' },
  { value: NigerianState.RIVERS, label: 'Rivers' },
  { value: NigerianState.SOKOTO, label: 'Sokoto' },
  { value: NigerianState.TARABA, label: 'Taraba' },
  { value: NigerianState.YOBE, label: 'Yobe' },
  { value: NigerianState.ZAMFARA, label: 'Zamfara' }
];

// Political Parties
export const POLITICAL_PARTIES = [
  { value: PoliticalParty.APC, label: 'APC', fullName: 'All Progressives Congress', color: '#FF6B6B' },
  { value: PoliticalParty.PDP, label: 'PDP', fullName: 'Peoples Democratic Party', color: '#4ECDC4' },
  { value: PoliticalParty.LP, label: 'LP', fullName: 'Labour Party', color: '#45B7D1' },
  { value: PoliticalParty.NNPP, label: 'NNPP', fullName: 'New Nigeria Peoples Party', color: '#96CEB4' },
  { value: PoliticalParty.APGA, label: 'APGA', fullName: 'All Progressives Grand Alliance', color: '#FFEAA7' },
  { value: PoliticalParty.ADC, label: 'ADC', fullName: 'African Democratic Congress', color: '#DDA0DD' },
  { value: PoliticalParty.SDP, label: 'SDP', fullName: 'Social Democratic Party', color: '#98D8C8' },
  { value: PoliticalParty.YPP, label: 'YPP', fullName: 'Young Progressives Party', color: '#F7DC6F' },
  { value: PoliticalParty.OTHER, label: 'Other', fullName: 'Other Parties', color: '#BDC3C7' }
];

// Social Media Platforms
export const SOCIAL_PLATFORMS = [
  { value: SocialPlatform.TWITTER, label: 'Twitter/X', icon: '𝕏', color: '#1DA1F2' },
  { value: SocialPlatform.FACEBOOK, label: 'Facebook', icon: '📘', color: '#4267B2' },
  { value: SocialPlatform.INSTAGRAM, label: 'Instagram', icon: '📷', color: '#E4405F' },
  { value: SocialPlatform.THREADS, label: 'Threads', icon: '🧵', color: '#000000' },
  { value: SocialPlatform.TIKTOK, label: 'TikTok', icon: '🎵', color: '#FF0050' }
];

// Gender Options
export const GENDER_OPTIONS = [
  { value: Gender.MALE, label: 'Male' },
  { value: Gender.FEMALE, label: 'Female' },
  { value: Gender.OTHER, label: 'Other' }
];

// Age Groups
export const AGE_GROUPS = [
  { value: AgeGroup.YOUNG, label: '18-25 years' },
  { value: AgeGroup.ADULT, label: '26-35 years' },
  { value: AgeGroup.MIDDLE, label: '36-45 years' },
  { value: AgeGroup.MATURE, label: '46-55 years' },
  { value: AgeGroup.SENIOR, label: '56+ years' }
];

// Political Levels
export const POLITICAL_LEVELS = [
  { value: PoliticalLevel.FEDERAL, label: 'Federal' },
  { value: PoliticalLevel.STATE, label: 'State' },
  { value: PoliticalLevel.LOCAL, label: 'Local Government' }
];

// Sentiment Colors
export const SENTIMENT_COLORS = {
  [SentimentLabel.POSITIVE]: '#10B981', // Green
  [SentimentLabel.NEUTRAL]: '#6B7280',  // Gray
  [SentimentLabel.NEGATIVE]: '#EF4444'  // Red
};

// Chart Colors
export const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#06B6D4',
  gradient: [
    '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
  ]
};

// Date Range Presets
export const DATE_RANGE_PRESETS = [
  { label: 'Last 7 days', value: 7 },
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 3 months', value: 90 },
  { label: 'Last 6 months', value: 180 },
  { label: 'Last year', value: 365 }
];

// Sort Options
export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'name', label: 'Name' },
  { value: 'sentiment', label: 'Sentiment Score' },
  { value: 'mentions', label: 'Mention Count' }
];

// API Configuration
export const API_CONFIG = {
  BASE_URL: '', // No API calls - using mock data only
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
};

// Pagination
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100]
};

// Chart Configuration
export const CHART_CONFIG = {
  ANIMATION_DURATION: 300,
  TOOLTIP_DELAY: 100,
  DEFAULT_HEIGHT: 300,
  RESPONSIVE_BREAKPOINTS: {
    mobile: 480,
    tablet: 768,
    desktop: 1024
  }
};

// Search Configuration
export const SEARCH_CONFIG = {
  DEBOUNCE_DELAY: 300,
  MIN_SEARCH_LENGTH: 2,
  MAX_SUGGESTIONS: 10,
  FUZZY_THRESHOLD: 0.6
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  NOT_FOUND: 'The requested resource was not found.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  GENERIC_ERROR: 'Something went wrong. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  DATA_LOADED: 'Data loaded successfully',
  SEARCH_COMPLETED: 'Search completed',
  FILTER_APPLIED: 'Filters applied successfully'
};

// Loading States
export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_REAL_TIME: false,
  ENABLE_EXPORT: true,
  ENABLE_DARK_MODE: true,
  ENABLE_NOTIFICATIONS: false,
  ENABLE_ADVANCED_FILTERS: true
};

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'insight-dashboard-theme',
  SEARCH_HISTORY: 'insight-dashboard-search-history',
  RECENTLY_VIEWED: 'insight-dashboard-recently-viewed',
  FILTER_PREFERENCES: 'insight-dashboard-filter-preferences'
} as const;