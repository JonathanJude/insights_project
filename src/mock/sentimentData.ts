import type {
    DashboardStats,
    PartyInsight,
    PlatformSentiment,
    SentimentInsight,
    TrendingPolitician,
    TrendPoint
} from '../types';
import {
    AgeGroup,
    Gender,
    NigerianState,
    PoliticalLevel,
    PoliticalParty,
    PoliticalPosition,
    SentimentLabel,
    SocialPlatform,
    TimeFrame
} from '../types';
import { mockPoliticians } from './politicians';

// Generate mock sentiment insights for a politician
export const generateSentimentInsights = (politicianId: string, days: number = 30): SentimentInsight[] => {
  const insights: SentimentInsight[] = [];
  const platforms = Object.values(SocialPlatform);
  const sentiments = Object.values(SentimentLabel);
  const genders = Object.values(Gender);
  const ageGroups = Object.values(AgeGroup);
  const states = Object.values(NigerianState).slice(0, 10); // Use first 10 states

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    platforms.forEach(platform => {
      const insight: SentimentInsight = {
        id: `insight_${politicianId}_${platform}_${i}`,
        politicianId,
        platform,
        sentimentScore: Math.random() * 2 - 1, // -1 to 1
        sentimentLabel: sentiments[Math.floor(Math.random() * sentiments.length)],
        confidence: Math.random() * 0.4 + 0.6, // 0.6 to 1.0
        mentionCount: Math.floor(Math.random() * 500) + 10,
        engagementCount: Math.floor(Math.random() * 1000) + 50,
        date: date.toISOString(),
        timeframe: TimeFrame.DAY,
        demographics: {
          gender: genders[Math.floor(Math.random() * genders.length)],
          ageGroup: ageGroups[Math.floor(Math.random() * ageGroups.length)],
          state: states[Math.floor(Math.random() * states.length)]
        },
        metadata: {
          topKeywords: ['leadership', 'economy', 'development', 'governance', 'youth'],
          influencerMentions: Math.floor(Math.random() * 50) + 5
        }
      };
      insights.push(insight);
    });
  }

  return insights;
};

// Generate trend points for charts
export const generateTrendPoints = (days: number = 30): TrendPoint[] => {
  const points: TrendPoint[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    points.push({
      date: date.toISOString().split('T')[0],
      value: Math.random() * 2 - 1, // -1 to 1 sentiment score
      metadata: {
        mentionCount: Math.floor(Math.random() * 1000) + 100,
        engagementCount: Math.floor(Math.random() * 100) + 10
      }
    });
  }
  
  return points;
};

// Mock party insights
export const mockPartyInsights: PartyInsight[] = [
  {
    id: 'party_apc',
    party: PoliticalParty.APC,
    totalMentions: 15420,
    overallSentiment: {
      positive: 35.2,
      neutral: 42.8,
      negative: 22.0
    },

    totalEngagement: 45620,
    topPoliticians: [
      { politicianId: 'pol_001', name: 'Bola Tinubu', sentimentScore: 0.13, mentionCount: 2500 },
      { politicianId: 'pol_002', name: 'Kashim Shettima', sentimentScore: 0.18, mentionCount: 1800 }
    ],
    trendData: generateTrendPoints(30),
    date: '2024-01-15',
    timeframe: TimeFrame.DAY,
    platformBreakdown: [
      { platform: SocialPlatform.TWITTER, totalMentions: 6200, sentimentBreakdown: { positive: 8.0, neutral: 50.0, negative: 42.0 }, averageEngagement: 0.008, topPoliticians: ['pol_001', 'pol_002'] },
      { platform: SocialPlatform.FACEBOOK, totalMentions: 4800, sentimentBreakdown: { positive: 15.0, neutral: 45.0, negative: 40.0 }, averageEngagement: 0.015, topPoliticians: ['pol_003', 'pol_004'] },
      { platform: SocialPlatform.INSTAGRAM, totalMentions: 2900, sentimentBreakdown: { positive: 22.0, neutral: 40.0, negative: 38.0 }, averageEngagement: 0.022, topPoliticians: ['pol_005', 'pol_006'] },
      { platform: SocialPlatform.THREADS, totalMentions: 1520, sentimentBreakdown: { positive: 18.0, neutral: 42.0, negative: 40.0 }, averageEngagement: 0.018, topPoliticians: ['pol_007', 'pol_008'] }
    ],

  },
  {
    id: 'party_pdp',
    party: PoliticalParty.PDP,
    totalMentions: 12890,
    overallSentiment: {
      positive: 42.1,
      neutral: 38.5,
      negative: 19.4
    },

    totalEngagement: 38670,
    topPoliticians: [
      { politicianId: 'pol_003', name: 'Atiku Abubakar', sentimentScore: 0.23, mentionCount: 2200 },
      { politicianId: 'pol_004', name: 'Ifeanyi Okowa', sentimentScore: 0.21, mentionCount: 1600 }
    ],
    trendData: generateTrendPoints(30),
    date: '2024-01-15',
    timeframe: TimeFrame.DAY,
    platformBreakdown: [
      { platform: SocialPlatform.TWITTER, totalMentions: 5200, sentimentBreakdown: { positive: 28.0, neutral: 45.0, negative: 27.0 }, averageEngagement: 0.028, topPoliticians: ['pol_001', 'pol_002'] },
      { platform: SocialPlatform.FACEBOOK, totalMentions: 4100, sentimentBreakdown: { positive: 21.0, neutral: 48.0, negative: 31.0 }, averageEngagement: 0.021, topPoliticians: ['pol_003', 'pol_004'] },
      { platform: SocialPlatform.INSTAGRAM, totalMentions: 2390, sentimentBreakdown: { positive: 19.0, neutral: 50.0, negative: 31.0 }, averageEngagement: 0.019, topPoliticians: ['pol_005', 'pol_006'] },
      { platform: SocialPlatform.THREADS, totalMentions: 1200, sentimentBreakdown: { positive: 24.0, neutral: 46.0, negative: 30.0 }, averageEngagement: 0.024, topPoliticians: ['pol_007', 'pol_008'] }
    ]
  },
  {
    id: 'party_lp',
    party: PoliticalParty.LP,
    totalMentions: 18750,
    overallSentiment: {
      positive: 58.3,
      neutral: 28.7,
      negative: 13.0
    },

    totalEngagement: 56250,
    topPoliticians: [
      { politicianId: 'pol_005', name: 'Peter Obi', sentimentScore: 0.45, mentionCount: 3200 },
      { politicianId: 'pol_006', name: 'Yusuf Datti Baba-Ahmed', sentimentScore: 0.42, mentionCount: 2100 }
    ],
    trendData: generateTrendPoints(30),
    date: '2024-01-15',
    timeframe: TimeFrame.DAY,
    platformBreakdown: [
      { platform: SocialPlatform.TWITTER, totalMentions: 8900, sentimentBreakdown: { positive: 52.0, neutral: 30.0, negative: 18.0 }, averageEngagement: 0.052, topPoliticians: ['pol_001', 'pol_002'] },
      { platform: SocialPlatform.FACEBOOK, totalMentions: 5200, sentimentBreakdown: { positive: 41.0, neutral: 35.0, negative: 24.0 }, averageEngagement: 0.041, topPoliticians: ['pol_003', 'pol_004'] },
      { platform: SocialPlatform.INSTAGRAM, totalMentions: 3150, sentimentBreakdown: { positive: 48.0, neutral: 32.0, negative: 20.0 }, averageEngagement: 0.048, topPoliticians: ['pol_005', 'pol_006'] },
      { platform: SocialPlatform.THREADS, totalMentions: 1500, sentimentBreakdown: { positive: 39.0, neutral: 38.0, negative: 23.0 }, averageEngagement: 0.039, topPoliticians: ['pol_007', 'pol_008'] }
    ]
  },
  {
    id: 'party_nnpp',
    party: PoliticalParty.NNPP,
    totalMentions: 8420,
    overallSentiment: {
      positive: 48.6,
      neutral: 35.2,
      negative: 16.2
    },

    totalEngagement: 25260,
    topPoliticians: [
      { politicianId: 'pol_007', name: 'Rabiu Kwankwaso', sentimentScore: 0.32, mentionCount: 1800 },
      { politicianId: 'pol_008', name: 'Isaac Idahosa', sentimentScore: 0.28, mentionCount: 1200 }
    ],
    trendData: generateTrendPoints(30),
    date: '2024-01-15',
    timeframe: TimeFrame.DAY,
    platformBreakdown: [
      { platform: SocialPlatform.TWITTER, totalMentions: 3800, sentimentBreakdown: { positive: 35.0, neutral: 40.0, negative: 25.0 }, averageEngagement: 0.035, topPoliticians: ['pol_009', 'pol_010'] },
      { platform: SocialPlatform.FACEBOOK, totalMentions: 2900, sentimentBreakdown: { positive: 31.0, neutral: 42.0, negative: 27.0 }, averageEngagement: 0.031, topPoliticians: ['pol_011', 'pol_012'] },
      { platform: SocialPlatform.INSTAGRAM, totalMentions: 1200, sentimentBreakdown: { positive: 28.0, neutral: 45.0, negative: 27.0 }, averageEngagement: 0.028, topPoliticians: ['pol_013', 'pol_014'] },
      { platform: SocialPlatform.THREADS, totalMentions: 520, sentimentBreakdown: { positive: 33.0, neutral: 40.0, negative: 27.0 }, averageEngagement: 0.033, topPoliticians: ['pol_015', 'pol_016'] }
    ]
  }
];


// Mock platform sentiment data
export const mockPlatformSentiment: PlatformSentiment[] = [
  {
    platform: SocialPlatform.TWITTER,
    totalMentions: 66365,
    sentimentBreakdown: {
      positive: 38.2,
      neutral: 41.8,
      negative: 20.0
    },
    averageEngagement: 0.045,
    topPoliticians: ['pol_001', 'pol_002', 'pol_003']
  },
  {
    platform: SocialPlatform.FACEBOOK,
    totalMentions: 49734,
    sentimentBreakdown: {
      positive: 48.7,
      neutral: 35.1,
      negative: 16.2
    },
    averageEngagement: 0.067,
    topPoliticians: ['pol_001', 'pol_004', 'pol_005']
  },
  {
    platform: SocialPlatform.INSTAGRAM,
    totalMentions: 29651,
    sentimentBreakdown: {
      positive: 52.3,
      neutral: 31.4,
      negative: 16.3
    },
    averageEngagement: 0.089,
    topPoliticians: ['pol_006', 'pol_007', 'pol_008']
  },
  {
    platform: SocialPlatform.THREADS,
    totalMentions: 11140,
    sentimentBreakdown: {
      positive: 44.1,
      neutral: 39.8,
      negative: 16.1
    },
    averageEngagement: 0.052,
    topPoliticians: ['pol_009', 'pol_010', 'pol_001']
  }
];

// Mock dashboard stats
export const mockDashboardStats: DashboardStats = {
  totalPoliticians: mockPoliticians.length,
  totalMentions: 156890,
  overallSentiment: {
    positive: 45.2,
    neutral: 35.8,
    negative: 19.0
  },
  platformStats: mockPlatformSentiment,
  trendingPoliticians: [],
  sentimentTrend: generateTrendPoints(30),
  lastUpdated: '2024-01-15T09:00:00Z'
};

// Mock trending politicians
export const mockTrendingPoliticians: TrendingPolitician[] = [
  {
    politician: {
      id: 'pol_006',
      name: 'Aisha Yesufu',
      firstName: 'Aisha',
      lastName: 'Yesufu',
      imageUrl: undefined,
      party: PoliticalParty.OTHER,
      position: PoliticalPosition.OTHER,
       state: NigerianState.LAGOS,
       politicalLevel: PoliticalLevel.FEDERAL,
       gender: Gender.FEMALE,
       ageGroup: AgeGroup.MATURE,
       isActive: true,
       createdAt: '2024-01-01T00:00:00Z',
       updatedAt: '2024-01-01T00:00:00Z'
     },
    mentionCount: 1420,
    sentimentScore: 0.78,
    sentimentChange: 18.6,
    engagementRate: 0.045,
    topPlatform: SocialPlatform.TWITTER
  },
  {
    politician: {
      id: 'pol_001',
      name: 'Peter Obi',
      firstName: 'Peter',
      lastName: 'Obi',
      imageUrl: undefined,
      party: PoliticalParty.LP,
      position: PoliticalPosition.PRESIDENT,
       state: NigerianState.ANAMBRA,
       politicalLevel: PoliticalLevel.FEDERAL,
       gender: Gender.MALE,
       ageGroup: AgeGroup.MATURE,
       isActive: true,
       createdAt: '2024-01-01T00:00:00Z',
       updatedAt: '2024-01-01T00:00:00Z'
     },
    mentionCount: 2450,
    sentimentScore: 0.72,
    sentimentChange: 15.3,
    engagementRate: 0.067,
    topPlatform: SocialPlatform.TWITTER
  },
  {
    politician: {
      id: 'pol_010',
      name: 'Seyi Makinde',
      firstName: 'Seyi',
      lastName: 'Makinde',
      imageUrl: undefined,
      party: PoliticalParty.PDP,
      position: PoliticalPosition.GOVERNOR,
       state: NigerianState.OYO,
       politicalLevel: PoliticalLevel.STATE,
       gender: Gender.MALE,
       ageGroup: AgeGroup.MATURE,
       isActive: true,
       createdAt: '2024-01-01T00:00:00Z',
       updatedAt: '2024-01-01T00:00:00Z'
     },
    mentionCount: 890,
    sentimentScore: 0.74,
    sentimentChange: 13.7,
    engagementRate: 0.052,
    topPlatform: SocialPlatform.FACEBOOK
  },
  {
    politician: {
      id: 'pol_009',
      name: 'Funmilayo Ransome-Kuti',
      firstName: 'Funmilayo',
      lastName: 'Ransome-Kuti',
      imageUrl: undefined,
      party: PoliticalParty.LP,
      position: PoliticalPosition.OTHER,
       state: NigerianState.OGUN,
       politicalLevel: PoliticalLevel.FEDERAL,
       gender: Gender.FEMALE,
       ageGroup: AgeGroup.SENIOR,
       isActive: true,
       createdAt: '2024-01-01T00:00:00Z',
       updatedAt: '2024-01-01T00:00:00Z'
     },
    mentionCount: 680,
    sentimentScore: 0.69,
    sentimentChange: 11.4,
    engagementRate: 0.038,
    topPlatform: SocialPlatform.INSTAGRAM
  },
  {
    politician: {
      id: 'pol_005',
      name: 'Babajide Sanwo-Olu',
      firstName: 'Babajide',
      lastName: 'Sanwo-Olu',
      imageUrl: undefined,
      party: PoliticalParty.APC,
      position: PoliticalPosition.GOVERNOR,
       state: NigerianState.LAGOS,
       politicalLevel: PoliticalLevel.STATE,
       gender: Gender.MALE,
       ageGroup: AgeGroup.MATURE,
       isActive: true,
       createdAt: '2024-01-01T00:00:00Z',
       updatedAt: '2024-01-01T00:00:00Z'
     },
    mentionCount: 980,
    sentimentScore: 0.68,
    sentimentChange: 9.2,
    engagementRate: 0.041,
    topPlatform: SocialPlatform.TWITTER
  }
];

// Enhanced mock data generators for politician profiles

// Generate trending topics for a politician
export const generateTrendingTopics = (politicianId: string, count: number = 10): Array<{
  id: string;
  keyword: string;
  mentionCount: number;
  sentiment: number;
  trend: 'rising' | 'falling' | 'stable';
  changePercentage: number;
  relatedPoliticians: string[];
}> => {
  const topicKeywords = [
    'economic policy', 'infrastructure development', 'education reform', 'healthcare system',
    'security challenges', 'corruption fight', 'youth empowerment', 'agriculture support',
    'technology advancement', 'governance transparency', 'job creation', 'poverty reduction',
    'climate change', 'energy sector', 'transportation', 'housing policy', 'tax reform',
    'foreign relations', 'trade agreements', 'social welfare', 'women empowerment',
    'digital transformation', 'electoral reforms', 'judicial independence', 'press freedom'
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const keyword = topicKeywords[Math.floor(Math.random() * topicKeywords.length)];
    const mentionCount = Math.floor(Math.random() * 500) + 50;
    const sentiment = Math.random() * 2 - 1; // -1 to 1
    const trends = ['rising', 'falling', 'stable'] as const;
    const trend = trends[Math.floor(Math.random() * trends.length)];
    
    return {
      id: `topic_${politicianId}_${i}`,
      keyword,
      mentionCount,
      sentiment,
      trend,
      changePercentage: (Math.random() - 0.5) * 40, // -20% to +20%
      relatedPoliticians: [politicianId]
    };
  });
};

// Generate enhanced sentiment history for a politician
export const generateEnhancedSentimentHistory = (politicianId: string, days: number = 30): Array<{
  date: string;
  sentimentScore: number;
  mentionCount: number;
  engagementCount: number;
  positive: number;
  neutral: number;
  negative: number;
}> => {
  const history = [];
  const baseDate = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    
    // Generate realistic sentiment patterns
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    // Weekend typically has lower activity
    const activityMultiplier = isWeekend ? 0.6 : 1.0;
    
    const mentionCount = Math.floor((Math.random() * 200 + 50) * activityMultiplier);
    const engagementCount = Math.floor(mentionCount * (Math.random() * 0.15 + 0.05)); // 5-20% engagement
    
    // Generate sentiment breakdown that adds up to 100%
    const positive = Math.random() * 60 + 20; // 20-80%
    const negative = Math.random() * 30 + 5;  // 5-35%
    const neutral = 100 - positive - negative;
    
    const sentimentScore = (positive - negative) / 100; // -1 to 1 scale
    
    // Ensure values add up to exactly 100% by rounding and adjusting
    const roundedPositive = Math.round(positive * 10) / 10;
    const roundedNegative = Math.round(negative * 10) / 10;
    const roundedNeutral = Math.round((100 - roundedPositive - roundedNegative) * 10) / 10;
    
    history.push({
      date: date.toISOString().split('T')[0],
      sentimentScore,
      mentionCount,
      engagementCount,
      positive: roundedPositive,
      neutral: roundedNeutral,
      negative: roundedNegative
    });
  }
  
  return history;
};

// Generate demographic breakdown for a politician
export const generateDemographicBreakdown = (politicianId: string): {
  byGender: Array<{
    gender: string;
    sentimentScore: number;
    mentionCount: number;
    percentage: number;
  }>;
  byAgeGroup: Array<{
    ageGroup: string;
    sentimentScore: number;
    mentionCount: number;
    percentage: number;
  }>;
  byState: Array<{
    state: string;
    sentimentScore: number;
    mentionCount: number;
    percentage: number;
  }>;
} => {
  const genders = ['Male', 'Female', 'Other'];
  const ageGroups = ['18-25', '26-35', '36-45', '46-55', '55+'];
  const states = ['Lagos', 'Abuja', 'Kano', 'Rivers', 'Oyo', 'Kaduna', 'Anambra', 'Delta'];
  
  const generateCategoryData = (categories: string[], totalMentions: number = 1000) => {
    const data = categories.map(category => {
      const percentage = Math.random() * 30 + 10; // 10-40%
      const mentionCount = Math.floor((percentage / 100) * totalMentions);
      const sentimentScore = Math.random() * 2 - 1; // -1 to 1
      
      return {
        [category.includes('-') ? 'ageGroup' : category.length <= 10 ? 'gender' : 'state']: category,
        sentimentScore,
        mentionCount,
        percentage
      };
    });
    
    // Normalize percentages to sum to 100%
    const totalPercentage = data.reduce((sum, item) => sum + item.percentage, 0);
    return data.map(item => ({
      ...item,
      percentage: Math.round((item.percentage / totalPercentage) * 100 * 10) / 10
    }));
  };
  
  return {
    byGender: generateCategoryData(genders).map(item => ({
      gender: item.gender || '',
      sentimentScore: item.sentimentScore,
      mentionCount: item.mentionCount,
      percentage: item.percentage
    })),
    byAgeGroup: generateCategoryData(ageGroups).map(item => ({
      ageGroup: item.ageGroup || '',
      sentimentScore: item.sentimentScore,
      mentionCount: item.mentionCount,
      percentage: item.percentage
    })),
    byState: generateCategoryData(states).map(item => ({
      state: item.state || '',
      sentimentScore: item.sentimentScore,
      mentionCount: item.mentionCount,
      percentage: item.percentage
    }))
  };
};

// Generate platform breakdown for a politician
export const generatePlatformBreakdown = (politicianId: string): Array<{
  platform: string;
  sentimentScore: number;
  mentionCount: number;
  engagementCount: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
}> => {
  const platforms = Object.values(SocialPlatform);
  
  return platforms.map(platform => {
    const mentionCount = Math.floor(Math.random() * 800) + 100;
    const engagementCount = Math.floor(mentionCount * (Math.random() * 0.2 + 0.05)); // 5-25% engagement
    
    // Generate sentiment breakdown
    const positive = Math.random() * 60 + 15; // 15-75%
    const negative = Math.random() * 25 + 5;  // 5-30%
    const neutral = 100 - positive - negative;
    
    const sentimentScore = (positive - negative) / 100; // -1 to 1 scale
    
    // Ensure values add up to exactly 100% by rounding and adjusting
    const roundedPositive = Math.round(positive * 10) / 10;
    const roundedNegative = Math.round(negative * 10) / 10;
    const roundedNeutral = Math.round((100 - roundedPositive - roundedNegative) * 10) / 10;
    
    return {
      platform,
      sentimentScore,
      mentionCount,
      engagementCount,
      sentimentBreakdown: {
        positive: roundedPositive,
        neutral: roundedNeutral,
        negative: roundedNegative
      }
    };
  });
};

// Enhanced comprehensive politician insights with better error handling and edge cases
export const generatePoliticianInsights = (politicianId: string, filters?: {
  startDate?: string;
  endDate?: string;
  platforms?: string[];
}) => {
  // Validate input
  if (!politicianId || typeof politicianId !== 'string') {
    throw new Error('Invalid politician ID provided');
  }
  
  // Determine date range
  let days = 30;
  if (filters?.startDate && filters?.endDate) {
    const start = new Date(filters.startDate);
    const end = new Date(filters.endDate);
    if (start > end) {
      throw new Error('Start date cannot be after end date');
    }
    days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    days = Math.max(1, Math.min(days, 365)); // Clamp between 1 and 365 days
  }
  
  const sentimentHistory = generateEnhancedSentimentHistory(politicianId, days);
  const trendingTopics = generateTrendingTopics(politicianId, 8);
  const demographicBreakdown = generateDemographicBreakdown(politicianId);
  const platformBreakdown = generatePlatformBreakdown(politicianId);
  
  // Handle edge case: no data
  if (sentimentHistory.length === 0) {
    return {
      overallSentiment: { score: 0, breakdown: { positive: 0, neutral: 100, negative: 0 } },
      totalMentions: 0,
      totalEngagement: 0,
      engagementRate: 0,
      mentionsTrend: { value: 0, isPositive: false },
      engagementTrend: { value: 0, isPositive: false },
      platformBreakdown: [],
      demographicBreakdown,
      trendData: [],
      sentimentTrend: [],
      topTopics: [],
      topKeywords: [],
      reachTrend: 0,
      totalReach: 0,
      lastUpdated: new Date().toISOString(),
      dataQuality: { score: 0, issues: ['No data available'] }
    };
  }
  
  // Calculate overall metrics with null safety
  const totalMentions = sentimentHistory.reduce((sum, day) => sum + (day.mentionCount || 0), 0);
  const totalEngagement = sentimentHistory.reduce((sum, day) => sum + (day.engagementCount || 0), 0);
  const avgSentiment = sentimentHistory.length > 0 
    ? sentimentHistory.reduce((sum, day) => sum + (day.sentimentScore || 0), 0) / sentimentHistory.length 
    : 0;
  
  // Calculate sentiment breakdown with validation
  const sentimentBreakdown = {
    positive: sentimentHistory.length > 0 
      ? sentimentHistory.reduce((sum, day) => sum + (day.positive || 0), 0) / sentimentHistory.length 
      : 0,
    neutral: sentimentHistory.length > 0 
      ? sentimentHistory.reduce((sum, day) => sum + (day.neutral || 0), 0) / sentimentHistory.length 
      : 100,
    negative: sentimentHistory.length > 0 
      ? sentimentHistory.reduce((sum, day) => sum + (day.negative || 0), 0) / sentimentHistory.length 
      : 0
  };
  
  // Ensure sentiment breakdown adds up to 100%
  const total = sentimentBreakdown.positive + sentimentBreakdown.neutral + sentimentBreakdown.negative;
  if (total > 0 && Math.abs(total - 100) > 0.1) {
    const factor = 100 / total;
    sentimentBreakdown.positive *= factor;
    sentimentBreakdown.neutral *= factor;
    sentimentBreakdown.negative *= factor;
  }
  
  const overallSentiment = {
    score: avgSentiment,
    breakdown: sentimentBreakdown
  };
  
  const engagementRate = totalMentions > 0 ? totalEngagement / totalMentions : 0;
  
  // Calculate trends with better error handling
  let mentionsTrend = { value: 0, isPositive: false };
  let engagementTrend = { value: 0, isPositive: false };
  
  if (sentimentHistory.length >= 14) {
    const recentData = sentimentHistory.slice(-7);
    const previousData = sentimentHistory.slice(-14, -7);
    
    const recentMentions = recentData.reduce((sum, day) => sum + (day.mentionCount || 0), 0);
    const previousMentions = previousData.reduce((sum, day) => sum + (day.mentionCount || 0), 0);
    
    if (previousMentions > 0) {
      mentionsTrend = {
        value: ((recentMentions - previousMentions) / previousMentions) * 100,
        isPositive: recentMentions >= previousMentions
      };
    }
    
    const recentEngagement = recentData.reduce((sum, day) => sum + (day.engagementCount || 0), 0);
    const previousEngagement = previousData.reduce((sum, day) => sum + (day.engagementCount || 0), 0);
    
    if (previousEngagement > 0) {
      engagementTrend = {
        value: ((recentEngagement - previousEngagement) / previousEngagement) * 100,
        isPositive: recentEngagement >= previousEngagement
      };
    }
  }
  
  // Filter platform breakdown if platforms filter is provided
  let filteredPlatformBreakdown = platformBreakdown;
  if (filters?.platforms && filters.platforms.length > 0) {
    filteredPlatformBreakdown = platformBreakdown.filter(p => 
      filters.platforms!.includes(p.platform)
    );
  }
  
  // Data quality assessment
  const dataQuality = assessDataQuality(sentimentHistory, trendingTopics, filteredPlatformBreakdown);
  
  return {
    overallSentiment,
    totalMentions,
    totalEngagement,
    engagementRate,
    mentionsTrend,
    engagementTrend,
    platformBreakdown: filteredPlatformBreakdown,
    demographicBreakdown,
    trendData: sentimentHistory,
    sentimentTrend: sentimentHistory,
    topTopics: trendingTopics.map(topic => ({
      topic: topic.keyword,
      count: topic.mentionCount,
      sentiment: topic.sentiment
    })),
    topKeywords: trendingTopics.slice(0, 5).map(topic => topic.keyword),
    reachTrend: Math.random() * 20 - 10, // -10% to +10%
    totalReach: Math.floor(totalMentions * (Math.random() * 5 + 2)), // 2-7x mentions
    lastUpdated: new Date().toISOString(),
    dataQuality,
    filters: filters || null
  };
};

// Data quality assessment function
const assessDataQuality = (
  sentimentHistory: any[],
  trendingTopics: any[],
  platformBreakdown: any[]
): { score: number; issues: string[]; recommendations: string[] } => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;
  
  // Check data completeness
  if (sentimentHistory.length === 0) {
    issues.push('No sentiment history data');
    score -= 50;
  } else if (sentimentHistory.length < 7) {
    issues.push('Limited sentiment history (less than 7 days)');
    score -= 20;
    recommendations.push('Collect more historical data for better insights');
  }
  
  if (trendingTopics.length === 0) {
    issues.push('No trending topics data');
    score -= 15;
  }
  
  if (platformBreakdown.length === 0) {
    issues.push('No platform breakdown data');
    score -= 15;
  }
  
  // Check data consistency
  const hasInconsistentSentiment = sentimentHistory.some(day => {
    const total = (day.positive || 0) + (day.neutral || 0) + (day.negative || 0);
    return Math.abs(total - 100) > 1; // Allow 1% tolerance
  });
  
  if (hasInconsistentSentiment) {
    issues.push('Inconsistent sentiment percentages detected');
    score -= 10;
    recommendations.push('Review sentiment calculation methodology');
  }
  
  // Check for data anomalies
  const mentionCounts = sentimentHistory.map(day => day.mentionCount || 0);
  const avgMentions = mentionCounts.reduce((sum, count) => sum + count, 0) / mentionCounts.length;
  const hasAnomalies = mentionCounts.some(count => count > avgMentions * 10 || count < avgMentions * 0.1);
  
  if (hasAnomalies) {
    issues.push('Unusual mention count patterns detected');
    score -= 5;
    recommendations.push('Investigate potential data collection issues');
  }
  
  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, score));
  
  return { score, issues, recommendations };
};

// Helper function to get sentiment insights by politician
export const getSentimentInsightsByPolitician = (politicianId: string): SentimentInsight[] => {
  return generateSentimentInsights(politicianId, 30);
};

// Helper function to get party insights by party
export const getPartyInsights = (party?: PoliticalParty): PartyInsight[] => {
  if (party) {
    return mockPartyInsights.filter(insight => insight.party === party);
  }
  return mockPartyInsights;
};

// Helper function to get platform sentiment by platform
export const getPlatformSentiment = (platform?: SocialPlatform): PlatformSentiment[] => {
  if (platform) {
    return mockPlatformSentiment.filter(sentiment => sentiment.platform === platform);
  }
  return mockPlatformSentiment;
};
// Generate mock demographics data for party analytics
export const generatePartyDemographicsData = () => {
  return {
    gender: [
      { category: 'Male', positive: 42.5, neutral: 35.2, negative: 22.3, total: 18500 },
      { category: 'Female', positive: 48.1, neutral: 31.8, negative: 20.1, total: 16200 },
      { category: 'Other', positive: 45.3, neutral: 33.5, negative: 21.2, total: 1200 }
    ],
    ageGroup: [
      { category: '18-25', positive: 52.8, neutral: 28.5, negative: 18.7, total: 12500 },
      { category: '26-35', positive: 46.2, neutral: 33.1, negative: 20.7, total: 14800 },
      { category: '36-45', positive: 41.5, neutral: 36.8, negative: 21.7, total: 8900 },
      { category: '46-55', positive: 38.9, neutral: 38.2, negative: 22.9, total: 5200 },
      { category: '55+', positive: 35.6, neutral: 40.1, negative: 24.3, total: 3500 }
    ],
    state: [
      { category: 'Lagos', positive: 48.5, neutral: 32.1, negative: 19.4, total: 8900 },
      { category: 'Abuja', positive: 51.2, neutral: 29.8, negative: 19.0, total: 6200 },
      { category: 'Kano', positive: 39.8, neutral: 38.5, negative: 21.7, total: 5800 },
      { category: 'Rivers', positive: 44.2, neutral: 34.9, negative: 20.9, total: 4100 },
      { category: 'Oyo', positive: 42.1, neutral: 36.2, negative: 21.7, total: 3800 },
      { category: 'Kaduna', positive: 40.5, neutral: 37.8, negative: 21.7, total: 3200 }
    ]
  };
};

// Generate filtered demographics data based on selected parties
export const generateFilteredDemographicsData = (selectedParties: string[] = []) => {
  const baseData = generatePartyDemographicsData();
  
  // If no parties selected, return base data
  if (selectedParties.length === 0) {
    return baseData;
  }
  
  // Simulate filtering effect by adjusting values based on selected parties
  const partyMultipliers: Record<string, number> = {
    'APC': 0.85,
    'PDP': 0.92,
    'LP': 1.15,
    'NNPP': 1.05
  };
  
  const avgMultiplier = selectedParties.reduce((sum, party) => {
    return sum + (partyMultipliers[party] || 1);
  }, 0) / selectedParties.length;
  
  return {
    gender: baseData.gender.map(item => ({
      ...item,
      total: Math.floor(item.total * avgMultiplier),
      positive: Math.min(100, item.positive * (avgMultiplier > 1 ? 1.1 : 0.95)),
      negative: Math.max(0, item.negative * (avgMultiplier > 1 ? 0.9 : 1.05))
    })),
    ageGroup: baseData.ageGroup.map(item => ({
      ...item,
      total: Math.floor(item.total * avgMultiplier),
      positive: Math.min(100, item.positive * (avgMultiplier > 1 ? 1.1 : 0.95)),
      negative: Math.max(0, item.negative * (avgMultiplier > 1 ? 0.9 : 1.05))
    })),
    state: baseData.state.map(item => ({
      ...item,
      total: Math.floor(item.total * avgMultiplier),
      positive: Math.min(100, item.positive * (avgMultiplier > 1 ? 1.1 : 0.95)),
      negative: Math.max(0, item.negative * (avgMultiplier > 1 ? 0.9 : 1.05))
    }))
  };
};