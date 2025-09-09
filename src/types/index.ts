// Core Entity Types
export interface Politician {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
  party: PoliticalParty;
  position: PoliticalPosition;
  state: NigerianState;
  politicalLevel: PoliticalLevel;
  gender: Gender;
  ageGroup: AgeGroup;
  isActive: boolean;
  socialMediaHandles?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    threads?: string;
  };
  createdAt: string;
  updatedAt: string;
  recentSentiment?: {
    score: number;
    label: SentimentLabel;
    mentionCount: number;
    trend: 'up' | 'down' | 'stable';
    changePercentage: number;
  };
}

export interface SentimentInsight {
  id: string;
  politicianId: string;
  platform: SocialPlatform;
  sentimentScore: number;
  sentimentLabel: SentimentLabel;
  confidence: number;
  mentionCount: number;
  engagementCount: number;
  date: string;
  timeframe: TimeFrame;
  demographics: {
    ageGroup: AgeGroup;
    gender: Gender;
    state: NigerianState;
  };
  metadata: {
    topKeywords: string[];
    emotionBreakdown?: EmotionBreakdown;
    influencerMentions?: number;
  };
}

export interface PartyInsight {
  id: string;
  party: PoliticalParty;
  overallSentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  totalMentions: number;
  totalEngagement: number;
  platformBreakdown: PlatformSentiment[];
  topPoliticians: {
    politicianId: string;
    name: string;
    sentimentScore: number;
    mentionCount: number;
  }[];
  trendData: TrendPoint[];
  date: string;
  timeframe: TimeFrame;
}

export interface DashboardStats {
  totalPoliticians: number;
  totalMentions: number;
  overallSentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  platformStats: PlatformSentiment[];
  trendingPoliticians: TrendingPolitician[];
  sentimentTrend: TrendPoint[];
  lastUpdated: string;
}

export interface TrendingPolitician {
  politician: Politician;
  mentionCount: number;
  sentimentScore: number;
  sentimentChange: number;
  engagementRate: number;
  topPlatform: SocialPlatform;
}

export interface PlatformSentiment {
  platform: SocialPlatform;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  totalMentions: number;
  averageEngagement: number;
  topPoliticians: string[];
}

export interface TrendPoint {
  date: string;
  value: number;
  label?: string;
  metadata?: {
    mentionCount?: number;
    engagementCount?: number;
  };
}

// Enum Types
export enum PoliticalParty {
  APC = 'APC',   // All Progressives Congress
  PDP = 'PDP',   // Peoples Democratic Party
  LP = 'LP',     // Labour Party
  NNPP = 'NNPP', // New Nigeria Peoples Party
  APGA = 'APGA', // All Progressives Grand Alliance
  ADC = 'ADC',   // African Democratic Congress
  SDP = 'SDP',   // Social Democratic Party
  YPP = 'YPP',   // Young Progressives Party
  OTHER = 'OTHER'
}

export enum NigerianState {
  ABIA = 'Abia',
  ADAMAWA = 'Adamawa',
  AKWA_IBOM = 'Akwa Ibom',
  ANAMBRA = 'Anambra',
  BAUCHI = 'Bauchi',
  BAYELSA = 'Bayelsa',
  BENUE = 'Benue',
  BORNO = 'Borno',
  CROSS_RIVER = 'Cross River',
  DELTA = 'Delta',
  EBONYI = 'Ebonyi',
  EDO = 'Edo',
  EKITI = 'Ekiti',
  ENUGU = 'Enugu',
  FCT = 'FCT',
  GOMBE = 'Gombe',
  IMO = 'Imo',
  JIGAWA = 'Jigawa',
  KADUNA = 'Kaduna',
  KANO = 'Kano',
  KATSINA = 'Katsina',
  KEBBI = 'Kebbi',
  KOGI = 'Kogi',
  KWARA = 'Kwara',
  LAGOS = 'Lagos',
  NASARAWA = 'Nasarawa',
  NIGER = 'Niger',
  OGUN = 'Ogun',
  ONDO = 'Ondo',
  OSUN = 'Osun',
  OYO = 'Oyo',
  PLATEAU = 'Plateau',
  RIVERS = 'Rivers',
  SOKOTO = 'Sokoto',
  TARABA = 'Taraba',
  YOBE = 'Yobe',
  ZAMFARA = 'Zamfara'
}

export enum SocialPlatform {
  TWITTER = 'twitter',
  FACEBOOK = 'facebook',
  INSTAGRAM = 'instagram',
  THREADS = 'threads',
  YOUTUBE = 'youtube',
  TIKTOK = 'tiktok',
  REDDIT = 'reddit',
  NEWS = 'news'
}

export enum SentimentLabel {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  NEUTRAL = 'neutral'
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}

export enum AgeGroup {
  YOUNG = '18-25',
  ADULT = '26-35',
  MIDDLE = '36-45',
  MATURE = '46-55',
  SENIOR = '56+'
}

export enum PoliticalLevel {
  FEDERAL = 'federal',
  STATE = 'state',
  LOCAL = 'local'
}

export enum TimeFrame {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month'
}

export enum PoliticalPosition {
  PRESIDENT = 'president',
  VICE_PRESIDENT = 'vice_president',
  GOVERNOR = 'governor',
  DEPUTY_GOVERNOR = 'deputy_governor',
  SENATOR = 'senator',
  HOUSE_REP = 'house_rep',
  STATE_ASSEMBLY = 'state_assembly',
  LOCAL_CHAIRMAN = 'local_chairman',
  COUNCILLOR = 'councillor',
  MINISTER = 'minister',
  COMMISSIONER = 'commissioner',
  PARTY_LEADER = 'party_leader',
  ASPIRANT = 'aspirant',
  OTHER = 'other'
}

export interface EmotionBreakdown {
  joy: number;
  anger: number;
  fear: number;
  sadness: number;
  surprise: number;
  disgust: number;
}

// API Response Types
export interface APIResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Filter Types
export interface SearchFilters {
  q?: string;
  party?: PoliticalParty[];
  state?: NigerianState[];
  level?: PoliticalLevel[];
  gender?: Gender[];
  ageGroup?: AgeGroup[];
  platform?: SocialPlatform[];
  startDate?: string;
  endDate?: string;
  sortBy?: 'name' | 'sentiment' | 'mentions' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

// Chart Data Types
export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
  metadata?: Record<string, unknown>;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ChartFilter {
  timeRange: '7d' | '30d' | '3m' | '1y';
  platforms?: SocialPlatform[];
  parties?: PoliticalParty[];
  states?: NigerianState[];
}

// UI State Types
export interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark';
  loading: boolean;
  error: string | null;
  modals: {
    settingsModal: boolean;
    notificationsPanel: boolean;
  };
  isMobile: boolean;
  recentPoliticians: string[];
  searchHistory: string[];
}

export interface FilterState {
  searchQuery: string;
  selectedParties: PoliticalParty[];
  selectedStates: NigerianState[];
  selectedPlatforms: SocialPlatform[];
  selectedGenders: Gender[];
  selectedAgeGroups: AgeGroup[];
  selectedLevels: PoliticalLevel[];
  dateRange: {
    start: string;
    end: string;
  };
  sortBy: 'name' | 'sentiment' | 'mentions' | 'relevance';
  sortOrder: 'asc' | 'desc';
}