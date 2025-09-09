/**
 * Enhanced Mock Data Service for Multi-Dimensional Sentiment Analysis
 * 
 * This service integrates all dimensional data (geographic, demographic, sentiment,
 * topic, engagement, temporal) and provides enhanced search and filtering functions
 * with comprehensive error handling and undefined data fallback strategies.
 */

import { 
  GeographicHierarchy, 
  geographicDataUtils,
  GeographicSentimentDistribution 
} from '../mock/geographicData';
import { 
  DemographicClassification, 
  DemographicSentimentData,
  demographicDataUtils 
} from '../mock/demographicData';
import { 
  EnhancedSentimentAnalysis,
  enhancedSentimentUtils 
} from '../mock/enhancedSentimentData';
import { 
  TopicClassification, 
  EngagementMetrics,
  topicEngagementUtils 
} from '../mock/topicEngagementData';
import { 
  TemporalPatterns, 
  TemporalSentimentData,
  temporalDataUtils 
} from '../mock/temporalData';

// Enhanced politician data interface
export interface EnhancedPoliticianData {
  id: string;
  name: string;
  party: string;
  position: string;
  state: string;
  sentiment: number;
  
  // Multi-dimensional enhancements
  geographic: GeographicHierarchy;
  demographic: DemographicClassification;
  enhancedSentiment: EnhancedSentimentAnalysis;
  topics: TopicClassification;
  engagement: EngagementMetrics;
  temporal: TemporalPatterns;
  
  // Aggregated insights
  insights: {
    primaryStrengths: string[];
    keyWeaknesses: string[];
    demographicAppeal: Record<string, number>;
    geographicStronghold: string[];
    trendingTopics: string[];
  };
  
  // Data quality metrics
  dataQuality: {
    completeness: number;
    confidence: number;
    lastUpdated: Date;
    sources: string[];
  };
}

// Enhanced search and filter interfaces
export interface EnhancedFilterState {
  geographic: {
    countries: string[];
    states: string[];
    lgas: string[];
    wards: string[];
    pollingUnits: string[];
    confidenceThreshold: number;
  };
  demographic: {
    education: string[];
    occupation: string[];
    ageRanges: [number, number];
    gender: string[];
    confidenceThreshold: number;
  };
  sentiment: {
    polarity: string[];
    emotions: string[];
    intensityRange: [number, number];
    complexity: string[];
    modelAgreement: number;
  };
  topics: {
    policyAreas: string[];
    campaignIssues: string[];
    events: string[];
    trendingThreshold: number;
  };
  engagement: {
    levels: string[];
    viralityThreshold: number;
    qualityScore: number;
    influencerAmplification: boolean;
  };
  temporal: {
    timeBlocks: string[];
    daysOfWeek: string[];
    electionPhases: string[];
  };
}

export interface EnhancedSearchResult {
  politician: EnhancedPoliticianData;
  relevanceScore: number;
  matchedDimensions: string[];
  highlights: Record<string, string[]>;
}

// Enhanced Mock Data Service Class
export class EnhancedMockDataService {
  private static cache = new Map<string, EnhancedPoliticianData>();
  private static cacheExpiry = new Map<string, number>();
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get enhanced politician data with all dimensional information
   */
  static async getEnhancedPoliticianData(
    politicianId: string
  ): Promise<EnhancedPoliticianData> {
    try {
      // Check cache first
      const cached = this.getCachedData(politicianId);
      if (cached) return cached;

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));

      // Get base politician data (assuming it exists from existing mock)
      const baseData = await this.getBasePoliticianData(politicianId);
      
      // Generate all dimensional data
      const enhancedData = await this.generateAllDimensionalData(politicianId, baseData);
      
      // Cache the result
      this.setCachedData(politicianId, enhancedData);
      
      return enhancedData;
    } catch (error) {
      console.error(`Error getting enhanced data for politician ${politicianId}:`, error);
      return this.getFallbackPoliticianData(politicianId);
    }
  }

  /**
   * Enhanced search with multi-dimensional filtering
   */
  static async searchPoliticiansEnhanced(
    query: string,
    filters: Partial<EnhancedFilterState> = {},
    options: {
      limit?: number;
      offset?: number;
      sortBy?: 'relevance' | 'sentiment' | 'engagement';
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): Promise<{
    results: EnhancedSearchResult[];
    total: number;
    facets: Record<string, Record<string, number>>;
  }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 200));

      // Get all politicians (in real app, this would be from database)
      const allPoliticians = await this.getAllEnhancedPoliticians();
      
      // Apply text search
      let filteredResults = this.applyTextSearch(allPoliticians, query);
      
      // Apply multi-dimensional filters
      filteredResults = this.applyMultiDimensionalFilters(filteredResults, filters);
      
      // Calculate relevance scores
      const scoredResults = this.calculateRelevanceScores(filteredResults, query, filters);
      
      // Sort results
      const sortedResults = this.sortResults(scoredResults, options.sortBy, options.sortOrder);
      
      // Apply pagination
      const { limit = 20, offset = 0 } = options;
      const paginatedResults = sortedResults.slice(offset, offset + limit);
      
      // Generate facets for filtering UI
      const facets = this.generateSearchFacets(filteredResults);
      
      return {
        results: paginatedResults,
        total: sortedResults.length,
        facets
      };
    } catch (error) {
      console.error('Error in enhanced search:', error);
      return {
        results: [],
        total: 0,
        facets: {}
      };
    }
  }

  /**
   * Get aggregated multi-dimensional insights
   */
  static async getMultiDimensionalInsights(
    filters: Partial<EnhancedFilterState> = {}
  ): Promise<{
    geographic: Record<string, number>;
    demographic: Record<string, number>;
    sentiment: Record<string, number>;
    topics: Record<string, number>;
    engagement: Record<string, number>;
    temporal: Record<string, number>;
  }> {
    try {
      await new Promise(resolve => setTimeout(resolve, 100));

      const allPoliticians = await this.getAllEnhancedPoliticians();
      const filteredPoliticians = this.applyMultiDimensionalFilters(allPoliticians, filters);
      
      return {
        geographic: this.aggregateGeographicInsights(filteredPoliticians),
        demographic: this.aggregateDemographicInsights(filteredPoliticians),
        sentiment: this.aggregateSentimentInsights(filteredPoliticians),
        topics: this.aggregateTopicInsights(filteredPoliticians),
        engagement: this.aggregateEngagementInsights(filteredPoliticians),
        temporal: this.aggregateTemporalInsights(filteredPoliticians)
      };
    } catch (error) {
      console.error('Error getting multi-dimensional insights:', error);
      return this.getFallbackInsights();
    }
  }

  // Private helper methods

  private static getCachedData(politicianId: string): EnhancedPoliticianData | null {
    const cached = this.cache.get(politicianId);
    const expiry = this.cacheExpiry.get(politicianId);
    
    if (cached && expiry && Date.now() < expiry) {
      return cached;
    }
    
    // Clean up expired cache
    this.cache.delete(politicianId);
    this.cacheExpiry.delete(politicianId);
    return null;
  }

  private static setCachedData(politicianId: string, data: EnhancedPoliticianData): void {
    this.cache.set(politicianId, data);
    this.cacheExpiry.set(politicianId, Date.now() + this.CACHE_DURATION);
  }

  private static async getBasePoliticianData(politicianId: string) {
    // This would integrate with existing politician mock data
    // For now, generate basic data
    const politicianIndex = parseInt(politicianId.split('_')[1] || '1');
    const names = ['Bola Tinubu', 'Atiku Abubakar', 'Peter Obi', 'Rabiu Kwankwaso', 'Yemi Osinbajo'];
    const parties = ['APC', 'PDP', 'LP', 'NNPP', 'APC'];
    const states = ['Lagos', 'Adamawa', 'Anambra', 'Kano', 'Ogun'];
    
    const index = politicianIndex % names.length;
    
    return {
      id: politicianId,
      name: names[index],
      party: parties[index],
      position: 'Presidential Candidate',
      state: states[index],
      sentiment: 0.4 + Math.random() * 0.4 // 0.4 to 0.8
    };
  }

  private static async generateAllDimensionalData(
    politicianId: string, 
    baseData: any
  ): Promise<EnhancedPoliticianData> {
    try {
      // Generate all dimensional data in parallel
      const [
        geographic,
        demographic,
        enhancedSentiment,
        topics,
        temporal
      ] = await Promise.all([
        Promise.resolve(geographicDataUtils.generateGeographicContext(politicianId)),
        Promise.resolve(demographicDataUtils.generateDemographicClassification(politicianId)),
        Promise.resolve(enhancedSentimentUtils.generateEnhancedSentiment(politicianId, baseData.sentiment)),
        Promise.resolve(topicEngagementUtils.generateTopicClassification(politicianId)),
        Promise.resolve(temporalDataUtils.generateTemporalPatterns(politicianId))
      ]);

      // Generate engagement metrics based on topics and sentiment
      const engagement = topicEngagementUtils.generateEngagementMetrics(
        politicianId, 
        topics, 
        baseData.sentiment
      );

      // Generate insights
      const insights = this.generateInsights(
        politicianId, 
        { geographic, demographic, enhancedSentiment, topics, engagement, temporal }
      );

      // Calculate data quality
      const dataQuality = this.calculateDataQuality(
        { geographic, demographic, enhancedSentiment, topics, engagement, temporal }
      );

      return {
        ...baseData,
        geographic,
        demographic,
        enhancedSentiment,
        topics,
        engagement,
        temporal,
        insights,
        dataQuality
      };
    } catch (error) {
      console.error(`Error generating dimensional data for ${politicianId}:`, error);
      throw error;
    }
  }  p
rivate static getFallbackPoliticianData(politicianId: string): EnhancedPoliticianData {
    return {
      id: politicianId,
      name: 'Unknown Politician',
      party: 'Unknown',
      position: 'Unknown',
      state: 'Unknown',
      sentiment: 0.5,
      geographic: {
        country: { code: 'NG', name: 'Nigeria', confidence: 0.95 },
        state: { code: 'UND', name: 'Undefined', confidence: 0.0, isUndefined: true },
        lga: { code: 'UND', name: 'Undefined', confidence: 0.0, isUndefined: true },
        ward: { number: 0, name: 'Undefined', confidence: 0.0, isUndefined: true },
        pollingUnit: { code: 'UND', name: 'Undefined', confidence: 0.0, isUndefined: true }
      },
      demographic: {
        education: { level: 'Undefined', confidence: 0.0 },
        occupation: { sector: 'Undefined', confidence: 0.0 },
        ageGroup: { range: 'Undefined', confidence: 0.0 },
        gender: { classification: 'Undefined', confidence: 0.0 }
      },
      enhancedSentiment: enhancedSentimentUtils.generateEnhancedSentiment(politicianId, 0.5),
      topics: {
        policyAreas: { primary: 'Economy', secondary: [], confidence: 0.5 },
        campaignIssues: { issues: [], relevance: {}, confidence: 0.5 },
        eventDriven: { events: [], temporal: false, urgency: 'Low', confidence: 0.5 }
      },
      engagement: {
        level: 'Low',
        metrics: { shares: 0, comments: 0, reach: 0, impressions: 0 },
        virality: { score: 0, velocity: 0, isViral: false },
        quality: { authenticity: 0.5, relevance: 0.5, constructiveness: 0.5 },
        influencerAmplification: { hasInfluencers: false, influencerCount: 0, totalFollowers: 0 }
      },
      temporal: temporalDataUtils.generateTemporalPatterns(politicianId),
      insights: {
        primaryStrengths: ['Data unavailable'],
        keyWeaknesses: ['Insufficient data'],
        demographicAppeal: {},
        geographicStronghold: [],
        trendingTopics: []
      },
      dataQuality: {
        completeness: 0.1,
        confidence: 0.1,
        lastUpdated: new Date(),
        sources: ['fallback']
      }
    };
  }

  private static async getAllEnhancedPoliticians(): Promise<EnhancedPoliticianData[]> {
    // Generate sample politicians for testing
    const politicians = [];
    for (let i = 1; i <= 50; i++) {
      try {
        const politician = await this.getEnhancedPoliticianData(`politician_${i}`);
        politicians.push(politician);
      } catch (error) {
        console.warn(`Failed to generate politician_${i}:`, error);
      }
    }
    return politicians;
  }

  private static applyTextSearch(
    politicians: EnhancedPoliticianData[], 
    query: string
  ): EnhancedPoliticianData[] {
    if (!query.trim()) return politicians;
    
    const searchTerms = query.toLowerCase().split(' ');
    
    return politicians.filter(politician => {
      const searchableText = [
        politician.name,
        politician.party,
        politician.position,
        politician.state,
        politician.geographic.state.name,
        politician.topics.policyAreas.primary,
        ...politician.topics.policyAreas.secondary,
        ...politician.topics.campaignIssues.issues,
        ...politician.insights.trendingTopics
      ].join(' ').toLowerCase();
      
      return searchTerms.some(term => searchableText.includes(term));
    });
  }

  private static applyMultiDimensionalFilters(
    politicians: EnhancedPoliticianData[],
    filters: Partial<EnhancedFilterState>
  ): EnhancedPoliticianData[] {
    return politicians.filter(politician => {
      // Geographic filters
      if (filters.geographic) {
        const geo = filters.geographic;
        if (geo.states?.length && !geo.states.includes(politician.geographic.state.code)) return false;
        if (geo.confidenceThreshold && politician.geographic.state.confidence < geo.confidenceThreshold) return false;
      }

      // Demographic filters
      if (filters.demographic) {
        const demo = filters.demographic;
        if (demo.education?.length && !demo.education.includes(politician.demographic.education.level)) return false;
        if (demo.occupation?.length && !demo.occupation.includes(politician.demographic.occupation.sector)) return false;
        if (demo.gender?.length && !demo.gender.includes(politician.demographic.gender.classification)) return false;
      }

      // Sentiment filters
      if (filters.sentiment) {
        const sent = filters.sentiment;
        if (sent.polarity?.length && !sent.polarity.includes(politician.enhancedSentiment.polarity.classification)) return false;
        if (sent.emotions?.length && !sent.emotions.includes(politician.enhancedSentiment.emotions.primary)) return false;
        if (sent.modelAgreement && politician.enhancedSentiment.modelAgreement.score < sent.modelAgreement) return false;
      }

      // Topic filters
      if (filters.topics) {
        const topics = filters.topics;
        if (topics.policyAreas?.length && !topics.policyAreas.includes(politician.topics.policyAreas.primary)) return false;
        if (topics.campaignIssues?.length) {
          const hasMatchingIssue = topics.campaignIssues.some(issue => 
            politician.topics.campaignIssues.issues.includes(issue as any)
          );
          if (!hasMatchingIssue) return false;
        }
      }

      // Engagement filters
      if (filters.engagement) {
        const eng = filters.engagement;
        if (eng.levels?.length && !eng.levels.includes(politician.engagement.level)) return false;
        if (eng.viralityThreshold && politician.engagement.virality.score < eng.viralityThreshold) return false;
      }

      return true;
    });
  }

  private static calculateRelevanceScores(
    politicians: EnhancedPoliticianData[],
    query: string,
    filters: Partial<EnhancedFilterState>
  ): EnhancedSearchResult[] {
    return politicians.map(politician => {
      let relevanceScore = 0.5; // Base score
      const matchedDimensions: string[] = [];
      const highlights: Record<string, string[]> = {};

      // Text relevance
      if (query.trim()) {
        const queryLower = query.toLowerCase();
        if (politician.name.toLowerCase().includes(queryLower)) {
          relevanceScore += 0.3;
          matchedDimensions.push('name');
          highlights.name = [politician.name];
        }
        if (politician.party.toLowerCase().includes(queryLower)) {
          relevanceScore += 0.2;
          matchedDimensions.push('party');
        }
      }

      // Data quality boost
      relevanceScore += politician.dataQuality.completeness * 0.2;
      relevanceScore += politician.dataQuality.confidence * 0.1;

      // Engagement boost
      if (politician.engagement.level === 'High') relevanceScore += 0.15;
      if (politician.engagement.virality.isViral) relevanceScore += 0.1;

      return {
        politician,
        relevanceScore: Math.min(1, relevanceScore),
        matchedDimensions,
        highlights
      };
    });
  }

  private static sortResults(
    results: EnhancedSearchResult[],
    sortBy: string = 'relevance',
    sortOrder: string = 'desc'
  ): EnhancedSearchResult[] {
    const multiplier = sortOrder === 'desc' ? -1 : 1;
    
    return results.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'sentiment':
          comparison = a.politician.sentiment - b.politician.sentiment;
          break;
        case 'engagement':
          comparison = a.politician.engagement.metrics.shares - b.politician.engagement.metrics.shares;
          break;
        default: // relevance
          comparison = a.relevanceScore - b.relevanceScore;
      }
      
      return comparison * multiplier;
    });
  }

  private static generateSearchFacets(politicians: EnhancedPoliticianData[]): Record<string, Record<string, number>> {
    const facets: Record<string, Record<string, number>> = {
      states: {},
      parties: {},
      sentimentPolarity: {},
      engagementLevels: {},
      policyAreas: {}
    };

    politicians.forEach(politician => {
      // State facets
      const state = politician.geographic.state.name;
      facets.states[state] = (facets.states[state] || 0) + 1;

      // Party facets
      facets.parties[politician.party] = (facets.parties[politician.party] || 0) + 1;

      // Sentiment facets
      const polarity = politician.enhancedSentiment.polarity.classification;
      facets.sentimentPolarity[polarity] = (facets.sentimentPolarity[polarity] || 0) + 1;

      // Engagement facets
      facets.engagementLevels[politician.engagement.level] = (facets.engagementLevels[politician.engagement.level] || 0) + 1;

      // Policy area facets
      const policyArea = politician.topics.policyAreas.primary;
      facets.policyAreas[policyArea] = (facets.policyAreas[policyArea] || 0) + 1;
    });

    return facets;
  }

  private static generateInsights(
    politicianId: string,
    dimensionalData: any
  ) {
    const { geographic, demographic, enhancedSentiment, topics, engagement } = dimensionalData;
    
    const primaryStrengths = [];
    const keyWeaknesses = [];
    const demographicAppeal: Record<string, number> = {};
    const geographicStronghold = [];
    const trendingTopics = [];

    // Analyze strengths
    if (enhancedSentiment.polarity.classification === 'Positive') {
      primaryStrengths.push('Positive public sentiment');
    }
    if (engagement.level === 'High') {
      primaryStrengths.push('High social media engagement');
    }
    if (engagement.virality.isViral) {
      primaryStrengths.push('Viral content creation');
    }

    // Analyze weaknesses
    if (enhancedSentiment.polarity.classification === 'Negative') {
      keyWeaknesses.push('Negative public sentiment');
    }
    if (engagement.level === 'Low') {
      keyWeaknesses.push('Low engagement levels');
    }
    if (geographic.state.isUndefined) {
      keyWeaknesses.push('Unclear geographic base');
    }

    // Geographic stronghold
    if (!geographic.state.isUndefined) {
      geographicStronghold.push(geographic.state.name);
    }

    // Trending topics
    trendingTopics.push(topics.policyAreas.primary);
    trendingTopics.push(...topics.campaignIssues.issues.slice(0, 2));

    return {
      primaryStrengths,
      keyWeaknesses,
      demographicAppeal,
      geographicStronghold,
      trendingTopics
    };
  }

  private static calculateDataQuality(dimensionalData: any) {
    let completeness = 0;
    let confidence = 0;
    let dataPoints = 0;

    // Check geographic data
    if (!dimensionalData.geographic.state.isUndefined) {
      completeness += 0.2;
      confidence += dimensionalData.geographic.state.confidence * 0.2;
    }
    dataPoints++;

    // Check demographic data
    if (dimensionalData.demographic.education.level !== 'Undefined') {
      completeness += 0.2;
      confidence += dimensionalData.demographic.education.confidence * 0.2;
    }
    dataPoints++;

    // Check sentiment data
    completeness += 0.2;
    confidence += dimensionalData.enhancedSentiment.polarity.confidence * 0.2;
    dataPoints++;

    // Check topic data
    completeness += 0.2;
    confidence += dimensionalData.topics.policyAreas.confidence * 0.2;
    dataPoints++;

    // Check engagement data
    completeness += 0.2;
    confidence += 0.2; // Engagement always has data
    dataPoints++;

    return {
      completeness,
      confidence,
      lastUpdated: new Date(),
      sources: ['mock-generator', 'enhanced-service']
    };
  }

  private static aggregateGeographicInsights(politicians: EnhancedPoliticianData[]): Record<string, number> {
    const insights: Record<string, number> = {};
    
    politicians.forEach(politician => {
      const state = politician.geographic.state.name;
      if (state !== 'Undefined') {
        insights[state] = (insights[state] || 0) + politician.sentiment;
      }
    });

    // Average the sentiments
    Object.keys(insights).forEach(state => {
      const count = politicians.filter(p => p.geographic.state.name === state).length;
      insights[state] = insights[state] / count;
    });

    return insights;
  }

  private static aggregateDemographicInsights(politicians: EnhancedPoliticianData[]): Record<string, number> {
    const insights: Record<string, number> = {};
    
    politicians.forEach(politician => {
      const education = politician.demographic.education.level;
      const occupation = politician.demographic.occupation.sector;
      const ageGroup = politician.demographic.ageGroup.range;
      
      if (education !== 'Undefined') {
        insights[`education_${education}`] = (insights[`education_${education}`] || 0) + politician.sentiment;
      }
      if (occupation !== 'Undefined') {
        insights[`occupation_${occupation}`] = (insights[`occupation_${occupation}`] || 0) + politician.sentiment;
      }
      if (ageGroup !== 'Undefined') {
        insights[`age_${ageGroup}`] = (insights[`age_${ageGroup}`] || 0) + politician.sentiment;
      }
    });

    return insights;
  }

  private static aggregateSentimentInsights(politicians: EnhancedPoliticianData[]): Record<string, number> {
    const insights: Record<string, number> = {
      'Positive': 0,
      'Negative': 0,
      'Neutral': 0,
      'High_Intensity': 0,
      'Viral_Content': 0
    };
    
    politicians.forEach(politician => {
      const polarity = politician.enhancedSentiment.polarity.classification;
      insights[polarity]++;
      
      if (politician.enhancedSentiment.intensity.level === 'Strong') {
        insights['High_Intensity']++;
      }
      
      if (politician.engagement.virality.isViral) {
        insights['Viral_Content']++;
      }
    });

    return insights;
  }

  private static aggregateTopicInsights(politicians: EnhancedPoliticianData[]): Record<string, number> {
    const insights: Record<string, number> = {};
    
    politicians.forEach(politician => {
      const primaryTopic = politician.topics.policyAreas.primary;
      insights[primaryTopic] = (insights[primaryTopic] || 0) + 1;
      
      politician.topics.campaignIssues.issues.forEach(issue => {
        insights[issue] = (insights[issue] || 0) + 1;
      });
    });

    return insights;
  }

  private static aggregateEngagementInsights(politicians: EnhancedPoliticianData[]): Record<string, number> {
    const insights: Record<string, number> = {
      'High_Engagement': 0,
      'Medium_Engagement': 0,
      'Low_Engagement': 0,
      'Viral_Politicians': 0,
      'Influencer_Amplified': 0
    };
    
    politicians.forEach(politician => {
      insights[`${politician.engagement.level}_Engagement`]++;
      
      if (politician.engagement.virality.isViral) {
        insights['Viral_Politicians']++;
      }
      
      if (politician.engagement.influencerAmplification.hasInfluencers) {
        insights['Influencer_Amplified']++;
      }
    });

    return insights;
  }

  private static aggregateTemporalInsights(politicians: EnhancedPoliticianData[]): Record<string, number> {
    const insights: Record<string, number> = {};
    
    politicians.forEach(politician => {
      const phase = politician.temporal.electoral.phase;
      insights[phase] = (insights[phase] || 0) + 1;
      
      const season = politician.temporal.seasonal.season;
      insights[`${season}_Season`] = (insights[`${season}_Season`] || 0) + 1;
    });

    return insights;
  }

  private static getFallbackInsights() {
    return {
      geographic: { 'No_Data': 1 },
      demographic: { 'No_Data': 1 },
      sentiment: { 'No_Data': 1 },
      topics: { 'No_Data': 1 },
      engagement: { 'No_Data': 1 },
      temporal: { 'No_Data': 1 }
    };
  }
}

// Export utility functions and types
export const enhancedMockDataUtils = {
  getEnhancedPoliticianData: EnhancedMockDataService.getEnhancedPoliticianData.bind(EnhancedMockDataService),
  searchPoliticiansEnhanced: EnhancedMockDataService.searchPoliticiansEnhanced.bind(EnhancedMockDataService),
  getMultiDimensionalInsights: EnhancedMockDataService.getMultiDimensionalInsights.bind(EnhancedMockDataService)
};

export default EnhancedMockDataService;