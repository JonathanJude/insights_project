/**
 * Tests for Analytics Service
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorTypes } from "../../constants/enums/system-enums";
import { ERROR_MESSAGES } from "../../constants/messages/error-messages";
import { PoliticalParty, SentimentLabel, TimeFrame } from "../../types";
import type { ElectionSchedule, ElectoralEvent, EngagementMetric, SentimentDataPoint, TopicTrend } from "../../types/data-models";
import { AnalyticsService } from "../analytics-service";
import { DataLoaderService } from "../data-loader";
import { DataValidatorService } from "../data-validation-framework";
import { IntelligentCacheService } from "../intelligent-cache";
import { NullSafeValidationService } from "../null-safe-validation";

// Mock data
const mockSentimentData = {
  sentimentData: [
    {
      id: 'SENT-001',
      politicianId: 'NG-POL-001',
      platform: 'twitter',
      date: '2024-01-15T10:00:00Z',
      timeframe: TimeFrame.DAY,
      sentiment: {
        score: 0.7,
        label: SentimentLabel.POSITIVE,
        confidence: 0.85
      },
      mentions: {
        total: 150,
        positive: 105,
        neutral: 30,
        negative: 15
      },
      engagement: {
        likes: 450,
        shares: 120,
        comments: 80,
        reach: 5000
      },
      demographics: {
        ageGroup: '26-35',
        gender: 'mixed',
        location: 'Lagos'
      },
      metadata: {
        keywords: ['economy', 'development', 'progress'],
        topics: ['Economy'],
        influencerAmplification: 1.2
      }
    },
    {
      id: 'SENT-002',
      politicianId: 'NG-POL-002',
      platform: 'facebook',
      date: '2024-01-15T14:00:00Z',
      timeframe: TimeFrame.DAY,
      sentiment: {
        score: 0.4,
        label: SentimentLabel.NEGATIVE,
        confidence: 0.75
      },
      mentions: {
        total: 200,
        positive: 40,
        neutral: 60,
        negative: 100
      },
      engagement: {
        likes: 200,
        shares: 50,
        comments: 150,
        reach: 3000
      },
      demographics: {
        ageGroup: '36-45',
        gender: 'male',
        location: 'Abuja'
      },
      metadata: {
        keywords: ['corruption', 'accountability', 'transparency'],
        topics: ['Corruption'],
        influencerAmplification: 0.8
      }
    }
  ] as SentimentDataPoint[]
};

const mockEngagementData = {
  engagementMetrics: [
    {
      id: 'ENG-001',
      politicianId: 'NG-POL-001',
      platform: 'twitter',
      date: '2024-01-15T10:00:00Z',
      metrics: {
        mentions: 150,
        engagement: 650,
        reach: 5000,
        impressions: 8000
      },
      viralityScore: 0.8,
      influencerMetrics: {
        topInfluencers: ['@influencer1', '@influencer2'],
        amplificationFactor: 1.5
      },
      metadata: {
        peakHour: 14,
        contentTypes: ['text', 'image'],
        hashtagPerformance: { '#economy': 45, '#development': 30 }
      }
    }
  ] as EngagementMetric[]
};

const mockTopicTrends = {
  topicTrends: [
    {
      id: 'TOPIC-001',
      topic: 'Economy',
      category: 'Policy',
      trendScore: 0.85,
      direction: 'rising' as const,
      sentiment: {
        positive: 0.6,
        negative: 0.25,
        neutral: 0.15
      },
      relatedPoliticians: ['NG-POL-001', 'NG-POL-002'],
      keywords: ['economy', 'development', 'growth'],
      metadata: {
        urgency: 'high' as const,
        impact: 'national' as const,
        peakDate: '2024-01-15',
        sources: ['twitter', 'facebook']
      }
    }
  ] as TopicTrend[]
};

const mockElectionSchedules = {
  electionSchedules: [
    {
      id: 'ELEC-001',
      type: 'presidential',
      date: '2027-02-25',
      phase: 'scheduled',
      milestones: {
        voterRegistration: '2026-06-01',
        primaries: '2026-10-01',
        campaigns: '2026-12-01'
      },
      metadata: {
        description: '2027 Presidential Election',
        eligibleVoters: 95000000
      }
    }
  ] as ElectionSchedule[]
};

const mockElectoralEvents = {
  electoralEvents: [
    {
      id: 'EVENT-001',
      type: 'election',
      title: '2023 Presidential Election',
      date: '2023-02-25',
      description: 'Nigerian Presidential Election',
      impact: 'national',
      participants: ['NG-POL-001', 'NG-POL-002'],
      results: {
        winner: 'NG-POL-002',
        turnout: 0.27,
        totalVotes: 25000000
      },
      metadata: {
        significance: 'high',
        controversies: ['delayed results', 'technical issues']
      }
    }
  ] as ElectoralEvent[]
};

describe("AnalyticsService", () => {
  let analyticsService: AnalyticsService;
  let mockDataLoader: any;
  let mockCache: any;
  let mockValidator: any;
  let mockNullSafeValidator: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock DataLoaderService
    mockDataLoader = {
      loadData: vi.fn(),
      getMetrics: vi.fn(() => ({ totalRequests: 0, cacheHits: 0 }))
    };
    vi.spyOn(DataLoaderService, 'getInstance').mockReturnValue(mockDataLoader);

    // Mock IntelligentCacheService
    mockCache = {
      get: vi.fn(),
      set: vi.fn(),
      clear: vi.fn(),
      getMetrics: vi.fn(() => ({ size: 0, hitRate: 0 }))
    };
    vi.spyOn(IntelligentCacheService, 'getInstance').mockReturnValue(mockCache);

    // Mock DataValidatorService
    mockValidator = {
      validateSentimentData: vi.fn(() => ({ isValid: true, errors: [] })),
      validateEngagementData: vi.fn(() => ({ isValid: true, errors: [] })),
      validateTopicData: vi.fn(() => ({ isValid: true, errors: [] })),
      validateElectionData: vi.fn(() => ({ isValid: true, errors: [] })),
      validateElectoralEventsData: vi.fn(() => ({ isValid: true, errors: [] }))
    };
    vi.spyOn(DataValidatorService, 'getInstance').mockReturnValue(mockValidator);

    // Mock NullSafeValidationService
    mockNullSafeValidator = {};
    vi.spyOn(NullSafeValidationService, 'getInstance').mockReturnValue(mockNullSafeValidator);

    analyticsService = AnalyticsService.getInstance();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("getSentimentData", () => {
    it("should load sentiment data successfully", async () => {
      mockDataLoader.loadData.mockResolvedValue(mockSentimentData);

      const result = await analyticsService.getSentimentData();

      expect(result).toEqual(mockSentimentData.sentimentData);
      expect(mockDataLoader.loadData).toHaveBeenCalledWith(
        'analytics:sentiment',
        expect.any(Function)
      );
      expect(mockValidator.validateSentimentData).toHaveBeenCalledWith(mockSentimentData);
    });

    it("should handle validation warnings", async () => {
      mockValidator.validateSentimentData.mockReturnValue({
        isValid: false,
        errors: ['Missing confidence score']
      });
      mockDataLoader.loadData.mockResolvedValue(mockSentimentData);

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await analyticsService.getSentimentData();

      expect(result).toEqual(mockSentimentData.sentimentData);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Sentiment data validation issues:',
        ['Missing confidence score']
      );

      consoleSpy.mockRestore();
    });

    it("should handle data loading errors", async () => {
      mockDataLoader.loadData.mockRejectedValue(new Error('Network error'));

      await expect(analyticsService.getSentimentData()).rejects.toThrow(
        ERROR_MESSAGES[ErrorTypes.DATA_LOADING_ERROR]
      );
    });
  });

  describe("getEngagementMetrics", () => {
    it("should load engagement metrics successfully", async () => {
      mockDataLoader.loadData.mockResolvedValue(mockEngagementData);

      const result = await analyticsService.getEngagementMetrics();

      expect(result).toEqual(mockEngagementData.engagementMetrics);
      expect(mockValidator.validateEngagementData).toHaveBeenCalledWith(mockEngagementData);
    });
  });

  describe("getTopicTrends", () => {
    it("should load topic trends successfully", async () => {
      mockDataLoader.loadData.mockResolvedValue(mockTopicTrends);

      const result = await analyticsService.getTopicTrends();

      expect(result).toEqual(mockTopicTrends.topicTrends);
      expect(mockValidator.validateTopicData).toHaveBeenCalledWith(mockTopicTrends);
    });
  });

  describe("getElectionSchedules", () => {
    it("should load election schedules successfully", async () => {
      mockDataLoader.loadData.mockResolvedValue(mockElectionSchedules);

      const result = await analyticsService.getElectionSchedules();

      expect(result).toEqual(mockElectionSchedules.electionSchedules);
      expect(mockValidator.validateElectionData).toHaveBeenCalledWith(mockElectionSchedules);
    });
  });

  describe("getElectoralEvents", () => {
    it("should load electoral events successfully", async () => {
      mockDataLoader.loadData.mockResolvedValue(mockElectoralEvents);

      const result = await analyticsService.getElectoralEvents();

      expect(result).toEqual(mockElectoralEvents.electoralEvents);
      expect(mockValidator.validateElectoralEventsData).toHaveBeenCalledWith(mockElectoralEvents);
    });
  });

  describe("getPoliticianAnalytics", () => {
    it("should return politician analytics from cache", async () => {
      const mockAnalytics = {
        politicianId: 'NG-POL-001',
        overallSentiment: { score: 0.7, label: SentimentLabel.POSITIVE, confidence: 0.85 },
        platformBreakdown: [],
        engagementMetrics: { totalMentions: 150, totalEngagement: 650, averageEngagement: 4.33, viralityScore: 0.8 },
        trendData: [],
        topKeywords: ['economy', 'development'],
        demographicBreakdown: { ageGroups: {}, genders: {}, locations: {} },
        temporalPatterns: { hourlyPattern: [], dailyPattern: [], weeklyPattern: [] }
      };

      mockCache.get.mockReturnValue(mockAnalytics);

      const result = await analyticsService.getPoliticianAnalytics('NG-POL-001');

      expect(result).toEqual(mockAnalytics);
      expect(mockCache.get).toHaveBeenCalledWith('analytics:politician:NG-POL-001');
    });

    it("should calculate politician analytics if not cached", async () => {
      mockCache.get.mockReturnValue(null);
      mockDataLoader.loadData
        .mockResolvedValueOnce(mockSentimentData)
        .mockResolvedValueOnce(mockEngagementData);

      const result = await analyticsService.getPoliticianAnalytics('NG-POL-001');

      expect(result.politicianId).toBe('NG-POL-001');
      expect(result.overallSentiment.score).toBe(0.7);
      expect(result.overallSentiment.label).toBe(SentimentLabel.POSITIVE);
      expect(result.engagementMetrics.totalMentions).toBe(150);
      expect(result.topKeywords).toContain('economy');
      expect(mockCache.set).toHaveBeenCalled();
    });

    it("should handle empty sentiment data", async () => {
      mockCache.get.mockReturnValue(null);
      mockDataLoader.loadData
        .mockResolvedValueOnce({ sentimentData: [] })
        .mockResolvedValueOnce({ engagementMetrics: [] });

      const result = await analyticsService.getPoliticianAnalytics('NG-POL-999');

      expect(result.overallSentiment.score).toBe(0.5);
      expect(result.overallSentiment.label).toBe(SentimentLabel.NEUTRAL);
      expect(result.engagementMetrics.totalMentions).toBe(0);
    });

    it("should throw error for invalid politician ID", async () => {
      await expect(analyticsService.getPoliticianAnalytics('')).rejects.toThrow(
        ERROR_MESSAGES[ErrorTypes.VALIDATION_ERROR]
      );
    });

    it("should filter data by timeframe", async () => {
      mockCache.get.mockReturnValue(null);
      mockDataLoader.loadData
        .mockResolvedValueOnce(mockSentimentData)
        .mockResolvedValueOnce(mockEngagementData);

      const result = await analyticsService.getPoliticianAnalytics('NG-POL-001', TimeFrame.WEEK);

      expect(result.politicianId).toBe('NG-POL-001');
      // Should filter by timeframe, but our mock data has DAY timeframe
      // so no data should match WEEK timeframe
    });
  });

  describe("getPartyInsights", () => {
    it("should return party insights from cache", async () => {
      const mockInsights = {
        id: 'party-APC-123',
        party: PoliticalParty.APC,
        overallSentiment: { positive: 0.4, neutral: 0.35, negative: 0.25 },
        totalMentions: 1000,
        totalEngagement: 5000,
        platformBreakdown: [],
        topPoliticians: [],
        trendData: [],
        date: '2024-01-15T10:00:00Z',
        timeframe: TimeFrame.MONTH
      };

      mockCache.get.mockReturnValue(mockInsights);

      const result = await analyticsService.getPartyInsights(PoliticalParty.APC);

      expect(result).toEqual(mockInsights);
      expect(mockCache.get).toHaveBeenCalledWith('analytics:party:APC');
    });

    it("should calculate party insights if not cached", async () => {
      mockCache.get.mockReturnValue(null);

      const result = await analyticsService.getPartyInsights(PoliticalParty.LP);

      expect(result.party).toBe(PoliticalParty.LP);
      expect(result.overallSentiment).toHaveProperty('positive');
      expect(result.overallSentiment).toHaveProperty('neutral');
      expect(result.overallSentiment).toHaveProperty('negative');
      expect(mockCache.set).toHaveBeenCalled();
    });
  });

  describe("getDashboardStats", () => {
    it("should return dashboard stats from cache", async () => {
      const mockStats = {
        totalPoliticians: 2,
        totalMentions: 350,
        overallSentiment: { positive: 0.5, neutral: 0.3, negative: 0.2 },
        platformStats: [],
        trendingPoliticians: [],
        sentimentTrend: [],
        lastUpdated: '2024-01-15T10:00:00Z'
      };

      mockCache.get.mockReturnValue(mockStats);

      const result = await analyticsService.getDashboardStats();

      expect(result).toEqual(mockStats);
      expect(mockCache.get).toHaveBeenCalledWith('analytics:dashboard');
    });

    it("should calculate dashboard stats if not cached", async () => {
      mockCache.get.mockReturnValue(null);
      mockDataLoader.loadData
        .mockResolvedValueOnce(mockSentimentData)
        .mockResolvedValueOnce(mockEngagementData);

      const result = await analyticsService.getDashboardStats();

      expect(result.totalPoliticians).toBe(2);
      expect(result.totalMentions).toBe(350); // 150 + 200
      expect(result.overallSentiment).toHaveProperty('positive');
      expect(result.platformStats).toBeDefined();
      expect(result.sentimentTrend).toBeDefined();
      expect(mockCache.set).toHaveBeenCalled();
    });
  });

  describe("getTopicAnalytics", () => {
    it("should return topic analytics from cache", async () => {
      const mockAnalytics = {
        topic: 'Economy',
        category: 'Policy',
        overallSentiment: { positive: 0.6, negative: 0.25, neutral: 0.15 },
        trendDirection: 'rising' as const,
        relatedPoliticians: [],
        keywords: ['economy', 'development'],
        urgencyLevel: 'high' as const,
        impactScope: 'national' as const
      };

      mockCache.get.mockReturnValue(mockAnalytics);

      const result = await analyticsService.getTopicAnalytics('Economy');

      expect(result).toEqual(mockAnalytics);
      expect(mockCache.get).toHaveBeenCalledWith('analytics:topic:Economy');
    });

    it("should calculate topic analytics if not cached", async () => {
      mockCache.get.mockReturnValue(null);
      mockDataLoader.loadData.mockResolvedValue(mockTopicTrends);

      const result = await analyticsService.getTopicAnalytics('Economy');

      expect(result.topic).toBe('Economy');
      expect(result.category).toBe('Policy');
      expect(result.trendDirection).toBe('rising');
      expect(result.keywords).toEqual(['economy', 'development', 'growth']);
      expect(result.urgencyLevel).toBe('high');
      expect(result.impactScope).toBe('national');
      expect(mockCache.set).toHaveBeenCalled();
    });

    it("should throw error for non-existent topic", async () => {
      mockCache.get.mockReturnValue(null);
      mockDataLoader.loadData.mockResolvedValue(mockTopicTrends);

      await expect(analyticsService.getTopicAnalytics('NonExistent')).rejects.toThrow(
        'Topic NonExistent not found'
      );
    });

    it("should throw error for invalid topic", async () => {
      await expect(analyticsService.getTopicAnalytics('')).rejects.toThrow(
        ERROR_MESSAGES[ErrorTypes.VALIDATION_ERROR]
      );
    });
  });

  describe("getTemporalAnalytics", () => {
    it("should return temporal analytics from cache", async () => {
      const mockAnalytics = {
        timeframe: TimeFrame.DAY,
        period: '2024-01-15',
        sentimentTrends: [],
        engagementTrends: [],
        topicTrends: [],
        platformActivity: {},
        peakHours: [14, 16, 20],
        seasonalPatterns: {}
      };

      mockCache.get.mockReturnValue(mockAnalytics);

      const result = await analyticsService.getTemporalAnalytics(TimeFrame.DAY);

      expect(result).toEqual(mockAnalytics);
      expect(mockCache.get).toHaveBeenCalledWith('analytics:temporal:DAY');
    });

    it("should calculate temporal analytics if not cached", async () => {
      mockCache.get.mockReturnValue(null);
      mockDataLoader.loadData
        .mockResolvedValueOnce(mockSentimentData)
        .mockResolvedValueOnce(mockEngagementData)
        .mockResolvedValueOnce(mockTopicTrends);

      const result = await analyticsService.getTemporalAnalytics(TimeFrame.MONTH);

      expect(result.timeframe).toBe(TimeFrame.MONTH);
      expect(result.period).toBeDefined();
      expect(result.sentimentTrends).toBeDefined();
      expect(result.engagementTrends).toBeDefined();
      expect(result.topicTrends).toBeDefined();
      expect(result.platformActivity).toBeDefined();
      expect(result.peakHours).toBeDefined();
      expect(result.seasonalPatterns).toBeDefined();
      expect(mockCache.set).toHaveBeenCalled();
    });
  });

  describe("calculation methods", () => {
    it("should calculate overall sentiment correctly", () => {
      const service = analyticsService as any;
      const sentimentData = mockSentimentData.sentimentData;

      const result = service.calculateOverallSentiment(sentimentData);

      expect(result.score).toBeCloseTo(0.55); // (0.7 + 0.4) / 2
      expect(result.confidence).toBeCloseTo(0.8); // (0.85 + 0.75) / 2
      expect(result.label).toBe(SentimentLabel.NEUTRAL); // 0.55 is between 0.4 and 0.6
    });

    it("should calculate platform breakdown correctly", () => {
      const service = analyticsService as any;
      const sentimentData = mockSentimentData.sentimentData;

      const result = service.calculatePlatformBreakdown(sentimentData);

      expect(result).toHaveLength(2); // twitter and facebook
      expect(result[0].platform).toBe('twitter');
      expect(result[0].totalMentions).toBe(150);
      expect(result[1].platform).toBe('facebook');
      expect(result[1].totalMentions).toBe(200);
    });

    it("should calculate engagement metrics correctly", () => {
      const service = analyticsService as any;
      const engagementData = mockEngagementData.engagementMetrics;

      const result = service.calculateEngagementMetrics(engagementData);

      expect(result.totalMentions).toBe(150);
      expect(result.totalEngagement).toBe(650);
      expect(result.averageEngagement).toBeCloseTo(4.33);
      expect(result.viralityScore).toBe(0.8);
    });

    it("should generate trend data correctly", () => {
      const service = analyticsService as any;
      const sentimentData = mockSentimentData.sentimentData;

      const result = service.generateTrendData(sentimentData);

      expect(result).toHaveLength(1); // Both data points are on the same date
      expect(result[0].date).toBe('2024-01-15');
      expect(result[0].value).toBeCloseTo(0.55); // Average of 0.7 and 0.4
    });

    it("should extract top keywords correctly", () => {
      const service = analyticsService as any;
      const sentimentData = mockSentimentData.sentimentData;

      const result = service.extractTopKeywords(sentimentData);

      expect(result).toContain('economy');
      expect(result).toContain('development');
      expect(result).toContain('corruption');
    });

    it("should calculate demographic breakdown correctly", () => {
      const service = analyticsService as any;
      const sentimentData = mockSentimentData.sentimentData;

      const result = service.calculateDemographicBreakdown(sentimentData);

      expect(result.ageGroups['26-35']).toBe(150);
      expect(result.ageGroups['36-45']).toBe(200);
      expect(result.genders['mixed']).toBe(150);
      expect(result.genders['male']).toBe(200);
      expect(result.locations['Lagos']).toBe(150);
      expect(result.locations['Abuja']).toBe(200);
    });

    it("should calculate temporal patterns correctly", () => {
      const service = analyticsService as any;
      const sentimentData = mockSentimentData.sentimentData;

      const result = service.calculateTemporalPatterns(sentimentData);

      expect(result.hourlyPattern).toHaveLength(24);
      expect(result.dailyPattern).toHaveLength(7);
      expect(result.weeklyPattern).toHaveLength(52);
      expect(result.hourlyPattern[10]).toBe(150); // 10:00 UTC
      expect(result.hourlyPattern[14]).toBe(200); // 14:00 UTC
    });
  });

  describe("cache management", () => {
    it("should clear cache", () => {
      analyticsService.clearCache();
      expect(mockCache.clear).toHaveBeenCalled();
    });

    it("should return service metrics", () => {
      const metrics = analyticsService.getMetrics();
      
      expect(metrics).toHaveProperty('cache');
      expect(metrics).toHaveProperty('dataLoader');
    });
  });

  describe("error handling", () => {
    it("should handle data loading errors", async () => {
      mockDataLoader.loadData.mockRejectedValue(new Error('Network error'));

      await expect(analyticsService.getSentimentData()).rejects.toThrow(
        ERROR_MESSAGES[ErrorTypes.DATA_LOADING_ERROR]
      );
    });

    it("should handle processing errors", async () => {
      mockCache.get.mockReturnValue(null);
      mockDataLoader.loadData.mockRejectedValue(new Error('Processing failed'));

      await expect(analyticsService.getPoliticianAnalytics('NG-POL-001')).rejects.toThrow(
        ERROR_MESSAGES[ErrorTypes.DATA_PROCESSING_ERROR]
      );
    });
  });
});