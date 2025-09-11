/**
 * Enhanced Mock Data Service for Multi-Dimensional Sentiment Analysis
 * 
 * This service integrates all dimensional data (geographic, demographic, sentiment,
 * topic, engagement, temporal) and provides enhanced search and filtering functions
 * with comprehensive error handling and undefined data fallback strategies.
 */

// Runtime imports (functions and objects)
import { demographicService } from '../services/demographic-service';
import { geographicService } from '../services/geographic-service';
import { temporalService } from '../services/temporal-service';
import { politicianService } from '../services/politician-service';

// Type-only imports (interfaces and types)
import type { DemographicClassification } from '../services/demographic-service';
import type { GeographicHierarchy, GeographicSentiment } from '../services/geographic-service';
import type { TemporalPatterns } from '../services/temporal-service';
import type { Politician } from '../services/politician-service';

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
   * Get geographic sentiment analysis data
   */
  static async getGeographicSentimentAnalysis(params: {
    state?: string;
    lga?: string;
    timeRange: string;
  }): Promise<{
    overallSentiment: number;
    coveragePercentage: number;
    availableLGAs: string[];
    regionalBreakdown: Array<{
      name: string;
      stateCount: number;
      sentiment: number;
      dataPoints: number;
      confidence: number;
    }>;
  }> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));

      const nigerianRegions = [
        { name: 'South West', states: ['Lagos', 'Ogun', 'Oyo', 'Osun', 'Ondo', 'Ekiti'], sentiment: 0.72 },
        { name: 'South East', states: ['Anambra', 'Enugu', 'Imo', 'Abia', 'Ebonyi'], sentiment: 0.68 },
        { name: 'South South', states: ['Rivers', 'Delta', 'Cross River', 'Akwa Ibom', 'Bayelsa', 'Edo'], sentiment: 0.65 },
        { name: 'North Central', states: ['FCT', 'Plateau', 'Benue', 'Nasarawa', 'Kogi', 'Niger', 'Kwara'], sentiment: 0.58 },
        { name: 'North West', states: ['Kano', 'Kaduna', 'Katsina', 'Sokoto', 'Kebbi', 'Zamfara', 'Jigawa'], sentiment: 0.52 },
        { name: 'North East', states: ['Borno', 'Adamawa', 'Taraba', 'Bauchi', 'Gombe', 'Yobe'], sentiment: 0.48 }
      ];

      const regionalBreakdown = nigerianRegions.map(region => ({
        name: region.name,
        stateCount: region.states.length,
        sentiment: region.sentiment + (Math.random() - 0.5) * 0.1,
        dataPoints: Math.floor(Math.random() * 50000) + 10000,
        confidence: 0.7 + Math.random() * 0.25
      }));

      const overallSentiment = regionalBreakdown.reduce((sum, region) => 
        sum + region.sentiment * region.stateCount, 0) / regionalBreakdown.reduce((sum, region) => 
        sum + region.stateCount, 0);

      const availableLGAs = params.state ? [
        `${params.state} Central`,
        `${params.state} North`,
        `${params.state} South`,
        `${params.state} East`,
        `${params.state} West`
      ] : [];

      return {
        overallSentiment,
        coveragePercentage: 85 + Math.random() * 10,
        availableLGAs,
        regionalBreakdown
      };
    } catch (error) {
      console.error('Error getting geographic sentiment analysis:', error);
      return {
        overallSentiment: 0.6,
        coveragePercentage: 80,
        availableLGAs: [],
        regionalBreakdown: []
      };
    }
  }

  /**
   * Get state comparison data
   */
  static async getStateComparisonData(timeRange: string): Promise<Array<{
    state: string;
    sentiment: number;
    dataPoints: number;
    confidence: number;
  }>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 100));

      const states = [
        'Lagos', 'Kano', 'Rivers', 'Kaduna', 'Oyo', 'Ogun', 'Imo', 'Borno', 'Osun', 'Delta',
        'Anambra', 'Taraba', 'Katsina', 'Cross River', 'Plateau', 'Bauchi', 'Jigawa', 'Kebbi',
        'Ondo', 'Enugu', 'Zamfara', 'Sokoto', 'Benue', 'Adamawa', 'Nasarawa', 'Akwa Ibom',
        'Ebonyi', 'Kwara', 'Gombe', 'Yobe', 'Abia', 'Ekiti', 'Bayelsa', 'Kogi', 'Niger', 'Edo', 'FCT'
      ];

      return states.map(state => ({
        state,
        sentiment: 0.3 + Math.random() * 0.5,
        dataPoints: Math.floor(Math.random() * 20000) + 5000,
        confidence: 0.6 + Math.random() * 0.3
      })).sort((a, b) => b.sentiment - a.sentiment);
    } catch (error) {
      console.error('Error getting state comparison data:', error);
      return [];
    }
  }

  /**
   * Get LGA hierarchy data for tree map
   */
  static async getLGAHierarchyData(state?: string): Promise<Array<{
    name: string;
    value: number;
    sentiment: number;
    children?: Array<{ name: string; value: number; sentiment: number }>;
  }>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 250 + Math.random() * 150));

      if (state) {
        // Return LGAs for specific state
        const lgaCount = Math.floor(Math.random() * 15) + 10;
        return Array.from({ length: lgaCount }, (_, i) => ({
          name: `${state} LGA ${i + 1}`,
          value: Math.floor(Math.random() * 5000) + 1000,
          sentiment: 0.2 + Math.random() * 0.6
        }));
      } else {
        // Return top-level state data
        const states = ['Lagos', 'Kano', 'Rivers', 'Kaduna', 'Oyo', 'Ogun', 'FCT'];
        return states.map(stateName => ({
          name: stateName,
          value: Math.floor(Math.random() * 20000) + 10000,
          sentiment: 0.3 + Math.random() * 0.4,
          children: Array.from({ length: 5 }, (_, i) => ({
            name: `${stateName} LGA ${i + 1}`,
            value: Math.floor(Math.random() * 3000) + 500,
            sentiment: 0.2 + Math.random() * 0.6
          }))
        }));
      }
    } catch (error) {
      console.error('Error getting LGA hierarchy data:', error);
      return [];
    }
  }

  /**
   * Get geographic timeline data
   */
  static async getGeographicTimelineData(params: {
    state?: string;
    timeRange: string;
  }): Promise<Array<{
    date: string;
    positive: number;
    neutral: number;
    negative: number;
  }>> {
    try {
      await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 100));

      const days = params.timeRange === '7d' ? 7 : 
                   params.timeRange === '30d' ? 30 : 
                   params.timeRange === '90d' ? 90 : 365;

      const timeline = [];
      const now = new Date();

      for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        // Generate realistic sentiment distribution
        const basePositive = 0.4 + Math.random() * 0.2;
        const baseNegative = 0.2 + Math.random() * 0.2;
        const neutral = 1 - basePositive - baseNegative;

        timeline.push({
          date: date.toISOString().split('T')[0],
          positive: Math.max(0, Math.min(1, basePositive + (Math.random() - 0.5) * 0.1)),
          neutral: Math.max(0, Math.min(1, neutral + (Math.random() - 0.5) * 0.1)),
          negative: Math.max(0, Math.min(1, baseNegative + (Math.random() - 0.5) * 0.1))
        });
      }

      return timeline;
    } catch (error) {
      console.error('Error getting geographic timeline data:', error);
      return [];
    }
  }

  // Helper methods (simplified for now)
  private static getCachedData(id: string): EnhancedPoliticianData | null {
    const cached = this.cache.get(id);
    const expiry = this.cacheExpiry.get(id);
    
    if (cached && expiry && Date.now() < expiry) {
      return cached;
    }
    
    return null;
  }

  private static setCachedData(id: string, data: EnhancedPoliticianData): void {
    this.cache.set(id, data);
    this.cacheExpiry.set(id, Date.now() + this.CACHE_DURATION);
  }

  private static async getBasePoliticianData(id: string): Promise<any> {
    // Simplified base data
    return {
      id,
      name: `Politician ${id}`,
      party: 'APC',
      position: 'Senator',
      state: 'Lagos',
      sentiment: 0.6
    };
  }

  private static async generateAllDimensionalData(id: string, baseData: any): Promise<EnhancedPoliticianData> {
    // Simplified enhanced data generation
    return {
      ...baseData,
      geographic: geographicDataUtils.generateGeographicContext(baseData.state || 'Lagos'),
      demographic: demographicDataUtils.generateDemographicBreakdown(id),
      enhancedSentiment: enhancedSentimentUtils.generateEnhancedSentiment(id, baseData.sentiment || 0.5),
      topics: topicEngagementUtils.generateTopicClassification(baseData.party || 'APC'),
      engagement: topicEngagementUtils.generateEngagementMetrics(id, 'medium'),
      temporal: temporalDataUtils.generateTemporalPatterns(id),
      insights: {
        primaryStrengths: ['Economic Policy', 'Youth Engagement'],
        keyWeaknesses: ['Infrastructure', 'Security'],
        demographicAppeal: { 'youth': 0.7, 'elderly': 0.5 },
        geographicStronghold: ['Lagos', 'Ogun'],
        trendingTopics: ['Economy', 'Education']
      },
      dataQuality: {
        completeness: 0.85,
        confidence: 0.78,
        lastUpdated: new Date(),
        sources: ['Twitter', 'News', 'Surveys']
      }
    };
  }

  /**
   * Get all enhanced data for analysis pages
   */
  static async getAllEnhancedData(): Promise<EnhancedPoliticianData[]> {
    try {
      // Generate sample data for analysis pages
      const sampleIds = ['1', '2', '3', '4', '5'];
      const promises = sampleIds.map(id => this.getEnhancedPoliticianData(id));
      return Promise.all(promises);
    } catch (error) {
      console.error('Error getting all enhanced data:', error);
      return [];
    }
  }

  /**
   * Search politicians with enhanced filtering
   */
  static async searchPoliticiansEnhanced(
    query: string,
    filters: any = {},
    options: any = {}
  ): Promise<EnhancedPoliticianData[]> {
    try {
      // Simplified search implementation
      const allData = await this.getAllEnhancedData();
      return allData.filter(politician => 
        politician.name.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching enhanced politicians:', error);
      return [];
    }
  }

  /**
   * Get multi-dimensional insights
   */
  static async getMultiDimensionalInsights(filters: any = {}): Promise<any> {
    try {
      // Return mock insights data
      return {
        overallSentiment: 0.65,
        totalDataPoints: 150000,
        coveragePercentage: 85,
        topTopics: ['Economy', 'Security', 'Education'],
        regionalBreakdown: [
          { region: 'South West', sentiment: 0.72 },
          { region: 'South East', sentiment: 0.68 },
          { region: 'North Central', sentiment: 0.58 }
        ]
      };
    } catch (error) {
      console.error('Error getting multi-dimensional insights:', error);
      return {};
    }
  }

  private static getFallbackPoliticianData(id: string): EnhancedPoliticianData {
    // Fallback data when errors occur
    return {
      id,
      name: `Politician ${id}`,
      party: 'Unknown',
      position: 'Unknown',
      state: 'Unknown',
      sentiment: 0.5,
      geographic: geographicDataUtils.generateGeographicContext('Lagos'),
      demographic: demographicDataUtils.generateDemographicBreakdown('default'),
      enhancedSentiment: enhancedSentimentUtils.generateEnhancedSentiment('default', 0.5),
      topics: topicEngagementUtils.generateTopicClassification('general'),
      engagement: topicEngagementUtils.generateEngagementMetrics('default', 'medium'),
      temporal: temporalDataUtils.generateTemporalPatterns('default'),
      insights: {
        primaryStrengths: [],
        keyWeaknesses: [],
        demographicAppeal: {},
        geographicStronghold: [],
        trendingTopics: []
      },
      dataQuality: {
        completeness: 0.3,
        confidence: 0.2,
        lastUpdated: new Date(),
        sources: []
      }
    };
  }
}

// Export instance for easier usage
export const enhancedMockDataService = EnhancedMockDataService;
export default EnhancedMockDataService;