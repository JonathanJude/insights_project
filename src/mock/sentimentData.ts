import type {
  SentimentInsight,
  PartyInsight,
  DashboardStats,
  TrendingPolitician,
  PlatformSentiment,
  TrendPoint
} from '../types';
import {
  PoliticalParty,
  PoliticalPosition,
  PoliticalLevel,
  SocialPlatform,
  SentimentLabel,
  Gender,
  AgeGroup,
  NigerianState,
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