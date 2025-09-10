/**
 * Analytics Service - Updated to use new JSON data structure
 * 
 * This service provides access to analytics data with:
 * - Sentiment and engagement data loading
 * - Topic trend data integration
 * - Temporal pattern data loading
 * - Advanced analytics calculations
 * - Caching and performance optimization
 */

import { ErrorTypes } from '../constants/enums/system-enums';
import { ERROR_MESSAGES } from '../constants/messages/error-messages';
import type {
    DashboardStats,
    PartyInsight,
    PlatformSentiment,
    PoliticalParty,
    SentimentLabel,
    SocialPlatform,
    TimeFrame,
    TrendPoint
} from '../types';
import type {
    ElectionSchedule,
    ElectoralEvent,
    EngagementMetric,
    SentimentDataPoint,
    TopicTrend
} from '../types/data-models';
import { dataLoader } from './data-loader';
import { DataValidatorService } from './data-validation-framework';
import { IntelligentCacheService } from './intelligent-cache';
import { NullSafeValidationService } from './null-safe-validation';

// Cache keys
const CACHE_KEYS = {
  SENTIMENT_DATA: 'analytics:sentiment',
  ENGAGEMENT_METRICS: 'analytics:engagement',
  TOPIC_TRENDS: 'analytics:topics',
  ELECTION_SCHEDULES: 'analytics:elections',
  ELECTORAL_EVENTS: 'analytics:events',
  POLITICIAN_SENTIMENT: (id: string) => `analytics:politician:${id}`,
  PARTY_INSIGHTS: (party: string) => `analytics:party:${party}`,
  PLATFORM_ANALYTICS: (platform: string) => `analytics:platform:${platform}`,
  DASHBOARD_STATS: 'analytics:dashboard',
  TRENDING_POLITICIANS: 'analytics:trending',
  TEMPORAL_PATTERNS: (timeframe: string) => `analytics:temporal:${timeframe}`,
  TOPIC_SENTIMENT: (topic: string) => `analytics:topic:${topic}`
} as const;

// Analytics interfaces
export interface PoliticianAnalytics {
  politicianId: string;
  overallSentiment: {
    score: number;
    label: SentimentLabel;
    confidence: number;
  };
  platformBreakdown: PlatformSentiment[];
  engagementMetrics: {
    totalMentions: number;
    totalEngagement: number;
    averageEngagement: number;
    viralityScore: number;
  };
  trendData: TrendPoint[];
  topKeywords: string[];
  demographicBreakdown: {
    ageGroups: Record<string, number>;
    genders: Record<string, number>;
    locations: Record<string, number>;
  };
  temporalPatterns: {
    hourlyPattern: number[];
    dailyPattern: number[];
    weeklyPattern: number[];
  };
}

export interface TopicAnalytics {
  topic: string;
  category: string;
  overallSentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  trendDirection: 'rising' | 'falling' | 'stable';
  relatedPoliticians: Array<{
    politicianId: string;
    relevanceScore: number;
    sentimentScore: number;
  }>;
  keywords: string[];
  urgencyLevel: 'low' | 'medium' | 'high';
  impactScope: 'local' | 'state' | 'national';
}

export interface TemporalAnalytics {
  timeframe: TimeFrame;
  period: string;
  sentimentTrends: TrendPoint[];
  engagementTrends: TrendPoint[];
  topicTrends: Array<{
    topic: string;
    score: number;
    change: number;
  }>;
  platformActivity: Record<string, number>;
  peakHours: number[];
  seasonalPatterns: Record<string, number>;
}

/**
 * Analytics Service with comprehensive data integration
 */
export class AnalyticsService {
  private static instance: AnalyticsService;
  private cache: IntelligentCacheService;
  private validator: DataValidatorService;
  private nullSafeValidator: NullSafeValidationService;

  private constructor() {
    this.cache = IntelligentCacheService.getInstance();
    this.validator = DataValidatorService.getInstance();
    this.nullSafeValidator = NullSafeValidationService.getInstance();
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Load sentiment data with validation and caching
   */
  async getSentimentData(): Promise<SentimentDataPoint[]> {
    try {
      const sentimentData = await dataLoader.loadData<{ sentimentData: SentimentDataPoint[] }>(
        CACHE_KEYS.SENTIMENT_DATA,
        () => import('../data/analytics/sentiment-data.json').then(m => m.default)
      );

      // Validate data structure
      const validation = this.validator.validateSentimentData(sentimentData);
      if (!validation.isValid) {
        console.warn('Sentiment data validation issues:', validation.errors);
      }

      return sentimentData.sentimentData;

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.DATA_LOADING_ERROR]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load engagement metrics with validation and caching
   */
  async getEngagementMetrics(): Promise<EngagementMetric[]> {
    try {
      const engagementData = await dataLoader.loadData<{ engagementMetrics: EngagementMetric[] }>(
        CACHE_KEYS.ENGAGEMENT_METRICS,
        () => import('../data/analytics/engagement-metrics.json').then(m => m.default)
      );

      // Validate data structure
      const validation = this.validator.validateEngagementData(engagementData);
      if (!validation.isValid) {
        console.warn('Engagement data validation issues:', validation.errors);
      }

      return engagementData.engagementMetrics;

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.DATA_LOADING_ERROR]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load topic trends with validation and caching
   */
  async getTopicTrends(): Promise<TopicTrend[]> {
    try {
      const topicData = await dataLoader.loadData<{ topicTrends: TopicTrend[] }>(
        CACHE_KEYS.TOPIC_TRENDS,
        () => import('../data/analytics/topic-trends.json').then(m => m.default)
      );

      // Validate data structure
      const validation = this.validator.validateTopicData(topicData);
      if (!validation.isValid) {
        console.warn('Topic trends data validation issues:', validation.errors);
      }

      return topicData.topicTrends;

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.DATA_LOADING_ERROR]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load election schedules with validation and caching
   */
  async getElectionSchedules(): Promise<ElectionSchedule[]> {
    try {
      const electionData = await dataLoader.loadData<{ electionSchedules: ElectionSchedule[] }>(
        CACHE_KEYS.ELECTION_SCHEDULES,
        () => import('../data/temporal/election-schedules.json').then(m => m.default)
      );

      // Validate data structure
      const validation = this.validator.validateElectionData(electionData);
      if (!validation.isValid) {
        console.warn('Election schedules data validation issues:', validation.errors);
      }

      return electionData.electionSchedules;

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.DATA_LOADING_ERROR]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load electoral events with validation and caching
   */
  async getElectoralEvents(): Promise<ElectoralEvent[]> {
    try {
      const eventsData = await dataLoader.loadData<{ electoralEvents: ElectoralEvent[] }>(
        CACHE_KEYS.ELECTORAL_EVENTS,
        () => import('../data/temporal/electoral-events.json').then(m => m.default)
      );

      // Validate data structure
      const validation = this.validator.validateElectoralEventsData(eventsData);
      if (!validation.isValid) {
        console.warn('Electoral events data validation issues:', validation.errors);
      }

      return eventsData.electoralEvents;

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.DATA_LOADING_ERROR]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get comprehensive analytics for a politician
   */
  async getPoliticianAnalytics(
    politicianId: string,
    timeframe: TimeFrame = TimeFrame.MONTH
  ): Promise<PoliticianAnalytics> {
    if (!politicianId) {
      throw new Error(ERROR_MESSAGES[ErrorTypes.VALIDATION_ERROR]);
    }

    const cacheKey = CACHE_KEYS.POLITICIAN_SENTIMENT(politicianId);
    const cached = this.cache.get<PoliticianAnalytics>(cacheKey);
    if (cached) return cached;

    try {
      const [sentimentData, engagementData] = await Promise.all([
        this.getSentimentData(),
        this.getEngagementMetrics()
      ]);

      // Filter data for the politician
      const politicianSentiment = sentimentData.filter(
        data => data.politicianId === politicianId && data.timeframe === timeframe
      );
      const politicianEngagement = engagementData.filter(
        data => data.politicianId === politicianId
      );

      // Calculate overall sentiment
      const overallSentiment = this.calculateOverallSentiment(politicianSentiment);

      // Calculate platform breakdown
      const platformBreakdown = this.calculatePlatformBreakdown(politicianSentiment);

      // Calculate engagement metrics
      const engagementMetrics = this.calculateEngagementMetrics(politicianEngagement);

      // Generate trend data
      const trendData = this.generateTrendData(politicianSentiment);

      // Extract top keywords
      const topKeywords = this.extractTopKeywords(politicianSentiment);

      // Calculate demographic breakdown
      const demographicBreakdown = this.calculateDemographicBreakdown(politicianSentiment);

      // Calculate temporal patterns
      const temporalPatterns = this.calculateTemporalPatterns(politicianSentiment);

      const analytics: PoliticianAnalytics = {
        politicianId,
        overallSentiment,
        platformBreakdown,
        engagementMetrics,
        trendData,
        topKeywords,
        demographicBreakdown,
        temporalPatterns
      };

      // Cache for 10 minutes
      this.cache.set(cacheKey, analytics, 10 * 60 * 1000);
      return analytics;

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.DATA_PROCESSING_ERROR]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get party insights with aggregated data
   */
  async getPartyInsights(party: PoliticalParty): Promise<PartyInsight> {
    const cacheKey = CACHE_KEYS.PARTY_INSIGHTS(party);
    const cached = this.cache.get<PartyInsight>(cacheKey);
    if (cached) return cached;

    try {
      // This would need politician service to get politicians by party
      // For now, return mock data structure
      const partyInsight: PartyInsight = {
        id: `party-${party}-${Date.now()}`,
        party,
        overallSentiment: {
          positive: 0.4,
          neutral: 0.35,
          negative: 0.25
        },
        totalMentions: 0,
        totalEngagement: 0,
        platformBreakdown: [],
        topPoliticians: [],
        trendData: [],
        date: new Date().toISOString(),
        timeframe: TimeFrame.MONTH
      };

      // Cache for 15 minutes
      this.cache.set(cacheKey, partyInsight, 15 * 60 * 1000);
      return partyInsight;

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.DATA_PROCESSING_ERROR]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const cacheKey = CACHE_KEYS.DASHBOARD_STATS;
    const cached = this.cache.get<DashboardStats>(cacheKey);
    if (cached) return cached;

    try {
      const [sentimentData, engagementData] = await Promise.all([
        this.getSentimentData(),
        this.getEngagementMetrics()
      ]);

      // Calculate overall statistics
      const totalMentions = sentimentData.reduce((sum, data) => sum + data.mentions.total, 0);
      const overallSentiment = this.calculateOverallSentimentFromData(sentimentData);
      const platformStats = this.calculatePlatformStats(sentimentData);

      const stats: DashboardStats = {
        totalPoliticians: new Set(sentimentData.map(d => d.politicianId)).size,
        totalMentions,
        overallSentiment,
        platformStats,
        trendingPoliticians: [], // Will be populated by trending service
        sentimentTrend: this.generateSentimentTrend(sentimentData),
        lastUpdated: new Date().toISOString()
      };

      // Cache for 5 minutes
      this.cache.set(cacheKey, stats, 5 * 60 * 1000);
      return stats;

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.DATA_PROCESSING_ERROR]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get topic analytics
   */
  async getTopicAnalytics(topic: string): Promise<TopicAnalytics> {
    if (!topic) {
      throw new Error(ERROR_MESSAGES[ErrorTypes.VALIDATION_ERROR]);
    }

    const cacheKey = CACHE_KEYS.TOPIC_SENTIMENT(topic);
    const cached = this.cache.get<TopicAnalytics>(cacheKey);
    if (cached) return cached;

    try {
      const topicTrends = await this.getTopicTrends();
      const topicData = topicTrends.find(t => t.topic === topic);

      if (!topicData) {
        throw new Error(`Topic ${topic} not found`);
      }

      const analytics: TopicAnalytics = {
        topic: topicData.topic,
        category: topicData.category,
        overallSentiment: topicData.sentiment,
        trendDirection: topicData.direction,
        relatedPoliticians: topicData.relatedPoliticians.map(id => ({
          politicianId: id,
          relevanceScore: Math.random(), // Mock for now
          sentimentScore: Math.random()
        })),
        keywords: topicData.keywords,
        urgencyLevel: topicData.metadata.urgency,
        impactScope: topicData.metadata.impact
      };

      // Cache for 15 minutes
      this.cache.set(cacheKey, analytics, 15 * 60 * 1000);
      return analytics;

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.DATA_PROCESSING_ERROR]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get temporal analytics for a specific timeframe
   */
  async getTemporalAnalytics(timeframe: TimeFrame): Promise<TemporalAnalytics> {
    const cacheKey = CACHE_KEYS.TEMPORAL_PATTERNS(timeframe);
    const cached = this.cache.get<TemporalAnalytics>(cacheKey);
    if (cached) return cached;

    try {
      const [sentimentData, engagementData, topicTrends] = await Promise.all([
        this.getSentimentData(),
        this.getEngagementMetrics(),
        this.getTopicTrends()
      ]);

      // Filter data by timeframe
      const timeframeData = sentimentData.filter(data => data.timeframe === timeframe);

      const analytics: TemporalAnalytics = {
        timeframe,
        period: this.getCurrentPeriod(timeframe),
        sentimentTrends: this.generateSentimentTrend(timeframeData),
        engagementTrends: this.generateEngagementTrend(engagementData),
        topicTrends: topicTrends.map(topic => ({
          topic: topic.topic,
          score: topic.trendScore,
          change: Math.random() * 20 - 10 // Mock change percentage
        })),
        platformActivity: this.calculatePlatformActivity(timeframeData),
        peakHours: this.calculatePeakHours(timeframeData),
        seasonalPatterns: this.calculateSeasonalPatterns(timeframeData)
      };

      // Cache for 20 minutes
      this.cache.set(cacheKey, analytics, 20 * 60 * 1000);
      return analytics;

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.DATA_PROCESSING_ERROR]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Private helper methods for calculations

  private calculateOverallSentiment(sentimentData: SentimentDataPoint[]) {
    if (sentimentData.length === 0) {
      return { score: 0.5, label: SentimentLabel.NEUTRAL, confidence: 0 };
    }

    const avgScore = sentimentData.reduce((sum, data) => sum + data.sentiment.score, 0) / sentimentData.length;
    const avgConfidence = sentimentData.reduce((sum, data) => sum + data.sentiment.confidence, 0) / sentimentData.length;

    let label: SentimentLabel;
    if (avgScore > 0.6) label = SentimentLabel.POSITIVE;
    else if (avgScore < 0.4) label = SentimentLabel.NEGATIVE;
    else label = SentimentLabel.NEUTRAL;

    return { score: avgScore, label, confidence: avgConfidence };
  }

  private calculatePlatformBreakdown(sentimentData: SentimentDataPoint[]): PlatformSentiment[] {
    const platformMap = new Map<string, { positive: number; neutral: number; negative: number; total: number; engagement: number }>();

    sentimentData.forEach(data => {
      const platform = data.platform;
      const existing = platformMap.get(platform) || { positive: 0, neutral: 0, negative: 0, total: 0, engagement: 0 };
      
      existing.positive += data.mentions.positive;
      existing.neutral += data.mentions.neutral;
      existing.negative += data.mentions.negative;
      existing.total += data.mentions.total;
      existing.engagement += data.engagement.likes + data.engagement.shares + data.engagement.comments;
      
      platformMap.set(platform, existing);
    });

    return Array.from(platformMap.entries()).map(([platform, data]) => ({
      platform: platform as SocialPlatform,
      sentimentBreakdown: {
        positive: data.positive / data.total,
        neutral: data.neutral / data.total,
        negative: data.negative / data.total
      },
      totalMentions: data.total,
      averageEngagement: data.engagement / data.total,
      topPoliticians: [] // Would need additional processing
    }));
  }

  private calculateEngagementMetrics(engagementData: EngagementMetric[]) {
    if (engagementData.length === 0) {
      return { totalMentions: 0, totalEngagement: 0, averageEngagement: 0, viralityScore: 0 };
    }

    const totalMentions = engagementData.reduce((sum, data) => sum + data.metrics.mentions, 0);
    const totalEngagement = engagementData.reduce((sum, data) => sum + data.metrics.engagement, 0);
    const avgViralityScore = engagementData.reduce((sum, data) => sum + data.viralityScore, 0) / engagementData.length;

    return {
      totalMentions,
      totalEngagement,
      averageEngagement: totalEngagement / totalMentions,
      viralityScore: avgViralityScore
    };
  }

  private generateTrendData(sentimentData: SentimentDataPoint[]): TrendPoint[] {
    // Group by date and calculate daily averages
    const dateMap = new Map<string, { score: number; mentions: number; count: number }>();

    sentimentData.forEach(data => {
      const date = data.date.split('T')[0]; // Get date part only
      const existing = dateMap.get(date) || { score: 0, mentions: 0, count: 0 };
      
      existing.score += data.sentiment.score;
      existing.mentions += data.mentions.total;
      existing.count += 1;
      
      dateMap.set(date, existing);
    });

    return Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        value: data.score / data.count,
        metadata: {
          mentionCount: data.mentions,
          engagementCount: data.mentions * 0.1 // Mock engagement
        }
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private extractTopKeywords(sentimentData: SentimentDataPoint[]): string[] {
    const keywordMap = new Map<string, number>();

    sentimentData.forEach(data => {
      data.metadata.keywords.forEach(keyword => {
        keywordMap.set(keyword, (keywordMap.get(keyword) || 0) + 1);
      });
    });

    return Array.from(keywordMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword]) => keyword);
  }

  private calculateDemographicBreakdown(sentimentData: SentimentDataPoint[]) {
    const ageGroups: Record<string, number> = {};
    const genders: Record<string, number> = {};
    const locations: Record<string, number> = {};

    sentimentData.forEach(data => {
      const { ageGroup, gender, location } = data.demographics;
      
      ageGroups[ageGroup] = (ageGroups[ageGroup] || 0) + data.mentions.total;
      genders[gender] = (genders[gender] || 0) + data.mentions.total;
      locations[location] = (locations[location] || 0) + data.mentions.total;
    });

    return { ageGroups, genders, locations };
  }

  private calculateTemporalPatterns(sentimentData: SentimentDataPoint[]) {
    const hourlyPattern = new Array(24).fill(0);
    const dailyPattern = new Array(7).fill(0);
    const weeklyPattern = new Array(52).fill(0);

    sentimentData.forEach(data => {
      const date = new Date(data.date);
      const hour = date.getHours();
      const day = date.getDay();
      const week = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));

      hourlyPattern[hour] += data.mentions.total;
      dailyPattern[day] += data.mentions.total;
      if (week < 52) weeklyPattern[week] += data.mentions.total;
    });

    return { hourlyPattern, dailyPattern, weeklyPattern };
  }

  private calculateOverallSentimentFromData(sentimentData: SentimentDataPoint[]) {
    const totalPositive = sentimentData.reduce((sum, data) => sum + data.mentions.positive, 0);
    const totalNeutral = sentimentData.reduce((sum, data) => sum + data.mentions.neutral, 0);
    const totalNegative = sentimentData.reduce((sum, data) => sum + data.mentions.negative, 0);
    const total = totalPositive + totalNeutral + totalNegative;

    return {
      positive: total > 0 ? totalPositive / total : 0,
      neutral: total > 0 ? totalNeutral / total : 0,
      negative: total > 0 ? totalNegative / total : 0
    };
  }

  private calculatePlatformStats(sentimentData: SentimentDataPoint[]): PlatformSentiment[] {
    return this.calculatePlatformBreakdown(sentimentData);
  }

  private generateSentimentTrend(sentimentData: SentimentDataPoint[]): TrendPoint[] {
    return this.generateTrendData(sentimentData);
  }

  private generateEngagementTrend(engagementData: EngagementMetric[]): TrendPoint[] {
    const dateMap = new Map<string, { engagement: number; count: number }>();

    engagementData.forEach(data => {
      const date = data.date.split('T')[0];
      const existing = dateMap.get(date) || { engagement: 0, count: 0 };
      
      existing.engagement += data.metrics.engagement;
      existing.count += 1;
      
      dateMap.set(date, existing);
    });

    return Array.from(dateMap.entries())
      .map(([date, data]) => ({
        date,
        value: data.engagement / data.count,
        metadata: { engagementCount: data.engagement }
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private calculatePlatformActivity(sentimentData: SentimentDataPoint[]): Record<string, number> {
    const activity: Record<string, number> = {};

    sentimentData.forEach(data => {
      activity[data.platform] = (activity[data.platform] || 0) + data.mentions.total;
    });

    return activity;
  }

  private calculatePeakHours(sentimentData: SentimentDataPoint[]): number[] {
    const hourlyActivity = new Array(24).fill(0);

    sentimentData.forEach(data => {
      const hour = new Date(data.date).getHours();
      hourlyActivity[hour] += data.mentions.total;
    });

    // Return top 3 peak hours
    return hourlyActivity
      .map((activity, hour) => ({ hour, activity }))
      .sort((a, b) => b.activity - a.activity)
      .slice(0, 3)
      .map(item => item.hour);
  }

  private calculateSeasonalPatterns(sentimentData: SentimentDataPoint[]): Record<string, number> {
    const seasons = { spring: 0, summer: 0, autumn: 0, winter: 0 };

    sentimentData.forEach(data => {
      const month = new Date(data.date).getMonth();
      if (month >= 2 && month <= 4) seasons.spring += data.mentions.total;
      else if (month >= 5 && month <= 7) seasons.summer += data.mentions.total;
      else if (month >= 8 && month <= 10) seasons.autumn += data.mentions.total;
      else seasons.winter += data.mentions.total;
    });

    return seasons;
  }

  private getCurrentPeriod(timeframe: TimeFrame): string {
    const now = new Date();
    switch (timeframe) {
      case TimeFrame.HOUR:
        return now.toISOString().slice(0, 13) + ':00:00Z';
      case TimeFrame.DAY:
        return now.toISOString().slice(0, 10);
      case TimeFrame.WEEK:
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        return weekStart.toISOString().slice(0, 10);
      case TimeFrame.MONTH:
        return now.toISOString().slice(0, 7);
      default:
        return now.toISOString().slice(0, 10);
    }
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get service metrics
   */
  getMetrics() {
    return {
      cache: this.cache.getMetrics(),
      dataLoader: dataLoader.getMetrics()
    };
  }
}

// Export singleton instance
export const analyticsService = AnalyticsService.getInstance();
export default AnalyticsService;