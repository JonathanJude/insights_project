# Data Model Specification

## 🏛️ Core Entity Models

### Politician
```typescript
interface Politician {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
  party: PoliticalParty;
  position: string; // e.g., "Governor", "Senator", "House Rep"
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
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}
```

### SentimentInsight
```typescript
interface SentimentInsight {
  id: string;
  politicianId: string;
  platform: SocialPlatform;
  sentimentScore: number; // -1 to 1 (negative to positive)
  sentimentLabel: SentimentLabel;
  confidence: number; // 0 to 1
  mentionCount: number;
  engagementCount: number;
  date: string; // ISO date
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
```

### PartyInsight
```typescript
interface PartyInsight {
  id: string;
  party: PoliticalParty;
  overallSentiment: {
    positive: number; // percentage
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
```

### SocialPost
```typescript
interface SocialPost {
  id: string;
  politicianId: string;
  platform: SocialPlatform;
  content: string;
  authorHandle: string;
  authorFollowers?: number;
  sentimentScore: number;
  sentimentLabel: SentimentLabel;
  engagementMetrics: {
    likes: number;
    shares: number;
    comments: number;
    views?: number;
  };
  publishedAt: string;
  extractedAt: string;
  isVerified: boolean;
  language: string;
  location?: {
    state: NigerianState;
    city?: string;
  };
}
```

## 📊 Aggregated Data Models

### DashboardStats
```typescript
interface DashboardStats {
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
```

### TrendingPolitician
```typescript
interface TrendingPolitician {
  politician: Politician;
  mentionCount: number;
  sentimentScore: number;
  sentimentChange: number; // percentage change from previous period
  engagementRate: number;
  topPlatform: SocialPlatform;
}
```

### PlatformSentiment
```typescript
interface PlatformSentiment {
  platform: SocialPlatform;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  totalMentions: number;
  averageEngagement: number;
  topPoliticians: string[]; // politician IDs
}
```

### TrendPoint
```typescript
interface TrendPoint {
  date: string;
  value: number;
  label?: string;
  metadata?: {
    mentionCount?: number;
    engagementCount?: number;
  };
}
```

## 🏷️ Enum Types

### PoliticalParty
```typescript
enum PoliticalParty {
  APC = 'APC', // All Progressives Congress
  PDP = 'PDP', // Peoples Democratic Party
  LP = 'LP',   // Labour Party
  NNPP = 'NNPP', // New Nigeria Peoples Party
  APGA = 'APGA', // All Progressives Grand Alliance
  ADC = 'ADC',   // African Democratic Congress
  SDP = 'SDP',   // Social Democratic Party
  YPP = 'YPP',   // Young Progressives Party
  OTHER = 'OTHER'
}
```

### NigerianState
```typescript
enum NigerianState {
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
  FCT = 'FCT', // Federal Capital Territory
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
```

### SocialPlatform
```typescript
enum SocialPlatform {
  TWITTER = 'Twitter',
  FACEBOOK = 'Facebook',
  INSTAGRAM = 'Instagram',
  THREADS = 'Threads',
  TIKTOK = 'TikTok',
  YOUTUBE = 'YouTube',
  LINKEDIN = 'LinkedIn'
}
```

### SentimentLabel
```typescript
enum SentimentLabel {
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative'
}
```

### PoliticalLevel
```typescript
enum PoliticalLevel {
  FEDERAL = 'federal',
  STATE = 'state',
  LOCAL = 'local'
}
```

### Gender
```typescript
enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other'
}
```

### AgeGroup
```typescript
enum AgeGroup {
  YOUTH = '18-35',      // Youth
  MIDDLE_AGE = '36-55', // Middle-aged
  SENIOR = '56+',       // Senior
  UNKNOWN = 'unknown'
}
```

### TimeFrame
```typescript
enum TimeFrame {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year'
}
```

## 🔍 Filter Models

### SearchFilters
```typescript
interface SearchFilters {
  query?: string;
  parties?: PoliticalParty[];
  states?: NigerianState[];
  politicalLevels?: PoliticalLevel[];
  genders?: Gender[];
  ageGroups?: AgeGroup[];
  platforms?: SocialPlatform[];
  sentimentRange?: {
    min: number;
    max: number;
  };
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  sortBy?: SortOption;
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}
```

### SortOption
```typescript
enum SortOption {
  RELEVANCE = 'relevance',
  NAME = 'name',
  SENTIMENT = 'sentiment',
  MENTIONS = 'mentions',
  ENGAGEMENT = 'engagement',
  DATE = 'date'
}
```

## 📈 Chart Data Models

### ChartDataPoint
```typescript
interface ChartDataPoint {
  x: string | number;
  y: number;
  label?: string;
  color?: string;
  metadata?: Record<string, any>;
}
```

### TimeSeriesData
```typescript
interface TimeSeriesData {
  series: {
    name: string;
    data: ChartDataPoint[];
    color?: string;
  }[];
  xAxisLabel: string;
  yAxisLabel: string;
  title?: string;
}
```

### PieChartData
```typescript
interface PieChartData {
  segments: {
    label: string;
    value: number;
    color: string;
    percentage: number;
  }[];
  title?: string;
  total: number;
}
```

### BarChartData
```typescript
interface BarChartData {
  categories: string[];
  series: {
    name: string;
    data: number[];
    color?: string;
  }[];
  xAxisLabel: string;
  yAxisLabel: string;
  title?: string;
}
```

## 🌐 API Response Models

### APIResponse
```typescript
interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
  metadata?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}
```

### ErrorResponse
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
}
```

### PaginatedResponse
```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  success: boolean;
  timestamp: string;
}
```

## 🔄 Real-time Data Models

### WebSocketMessage
```typescript
interface WebSocketMessage {
  type: 'sentiment_update' | 'new_mention' | 'trending_change';
  payload: any;
  timestamp: string;
  politicianId?: string;
}
```

### SentimentUpdate
```typescript
interface SentimentUpdate {
  politicianId: string;
  newSentimentScore: number;
  previousSentimentScore: number;
  platform: SocialPlatform;
  changePercentage: number;
  timestamp: string;
}
```

## 📊 Analytics Models

### EmotionBreakdown
```typescript
interface EmotionBreakdown {
  joy: number;
  anger: number;
  fear: number;
  sadness: number;
  surprise: number;
  disgust: number;
  trust: number;
  anticipation: number;
}
```

### EngagementMetrics
```typescript
interface EngagementMetrics {
  totalEngagements: number;
  engagementRate: number;
  averageEngagementsPerPost: number;
  topEngagingPlatform: SocialPlatform;
  engagementTrend: TrendPoint[];
}
```

### GeographicData
```typescript
interface GeographicData {
  state: NigerianState;
  mentionCount: number;
  sentimentScore: number;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}
```

## 🎯 Validation Schemas

### Data Validation Rules
- **Sentiment Score**: Must be between -1 and 1
- **Confidence**: Must be between 0 and 1
- **Percentages**: Must sum to 100 for sentiment breakdowns
- **Dates**: Must be valid ISO 8601 format
- **IDs**: Must be non-empty strings
- **Mention Count**: Must be non-negative integers
- **Engagement Count**: Must be non-negative integers

### Required Fields
- All entities must have `id`, `createdAt`, `updatedAt`
- Politicians must have `name`, `party`, `state`, `politicalLevel`
- SentimentInsights must have `politicianId`, `platform`, `sentimentScore`, `date`
- API responses must have `success`, `timestamp`

## 🔗 Relationships

### Entity Relationships
- **Politician** → **SentimentInsight** (One-to-Many)
- **Politician** → **SocialPost** (One-to-Many)
- **PoliticalParty** → **Politician** (One-to-Many)
- **NigerianState** → **Politician** (One-to-Many)
- **SocialPlatform** → **SentimentInsight** (One-to-Many)
- **SocialPlatform** → **SocialPost** (One-to-Many)

### Data Aggregation
- **PartyInsight** aggregates from multiple **SentimentInsight** records
- **DashboardStats** aggregates from all entities
- **TrendingPolitician** derives from **SentimentInsight** and **SocialPost**
- **PlatformSentiment** aggregates by platform across all politicians