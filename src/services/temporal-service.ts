import { dataLoader } from './data-loader';

// Types for temporal data
export interface TemporalPatterns {
  daily: {
    circadianPattern: Record<number, number>;
    peakHours: number[];
    lowHours: number[];
  };
  weekly: {
    weeklyPattern: Record<number, number>;
    peakDays: number[];
    lowDays: number[];
  };
  electoral: {
    phase: ElectoralPhase;
    daysToElection: number;
    milestones: ElectoralMilestone[];
    intensity: number;
  };
  seasonal: {
    month: number;
    season: 'Dry' | 'Rainy';
    seasonalFactor: number;
  };
}

export interface ElectoralMilestone {
  name: string;
  date: Date;
  type: 'Registration' | 'Campaign' | 'Debate' | 'Election' | 'Result';
  impact: 'Low' | 'Medium' | 'High';
  description: string;
}

export type ElectoralPhase = 
  | 'Pre-Election' 
  | 'Campaign Period' 
  | 'Election Week' 
  | 'Election Day' 
  | 'Post-Election' 
  | 'Inter-Election';

export interface TemporalSentimentData {
  hourlyPatterns: Record<number, number>;
  dailyPatterns: Record<number, number>;
  weeklyTrends: Array<{
    week: number;
    sentiment: number;
    engagement: number;
    events: string[];
  }>;
  electionCycleData: {
    phase: ElectoralPhase;
    sentiment: number;
    polarization: number;
    engagement: number;
  };
}

interface TemporalPatternsData {
  temporalPatterns: {
    circadianEngagement: Record<string, number>;
    weeklyEngagement: Record<string, number>;
    seasonalFactors: {
      Dry: {
        months: number[];
        engagementMultiplier: number;
        sentimentAdjustment: number;
      };
      Rainy: {
        months: number[];
        engagementMultiplier: number;
        sentimentAdjustment: number;
      };
    };
  };
}

interface ElectoralMilestonesData {
  electoralMilestones: Array<{
    name: string;
    date: string;
    type: 'Registration' | 'Campaign' | 'Debate' | 'Election' | 'Result';
    impact: 'Low' | 'Medium' | 'High';
    description: string;
  }>;
}

interface TemporalSentimentFactors {
  temporalSentimentFactors: {
    electoralPhaseAdjustments: Record<ElectoralPhase, number>;
    polarizationBase: Record<ElectoralPhase, number>;
    weeklySentimentAdjustments: Record<ElectoralPhase, number>;
    eventProbabilities: Record<ElectoralPhase, number>;
    possibleEvents: string[];
  };
}

class TemporalService {
  private instance: TemporalService | null = null;
  private cache: Map<string, any> = new Map();

  static getInstance(): TemporalService {
    if (!TemporalService.prototype.instance) {
      TemporalService.prototype.instance = new TemporalService();
    }
    return TemporalService.prototype.instance;
  }

  async getTemporalPatterns(): Promise<TemporalPatternsData> {
    const cacheKey = 'temporal-patterns';
    
    return await dataLoader.loadData<TemporalPatternsData>(
      cacheKey,
      async () => {
        const response = await fetch('/data/core/temporal-patterns.json');
        if (!response.ok) {
          throw new Error('Failed to load temporal patterns');
        }
        return response.json();
      }
    );
  }

  async getElectoralMilestones(): Promise<ElectoralMilestonesData> {
    const cacheKey = 'electoral-milestones';
    
    return await dataLoader.loadData<ElectoralMilestonesData>(
      cacheKey,
      async () => {
        const response = await fetch('/data/core/electoral-milestones.json');
        if (!response.ok) {
          throw new Error('Failed to load electoral milestones');
        }
        return response.json();
      }
    );
  }

  async getTemporalSentimentFactors(): Promise<TemporalSentimentFactors> {
    const cacheKey = 'temporal-sentiment-factors';
    
    return await dataLoader.loadData<TemporalSentimentFactors>(
      cacheKey,
      async () => {
        const response = await fetch('/data/core/temporal-sentiment.json');
        if (!response.ok) {
          throw new Error('Failed to load temporal sentiment factors');
        }
        return response.json();
      }
    );
  }

  async generateTemporalPatterns(
    politicianId: string,
    currentDate: Date = new Date()
  ): Promise<TemporalPatterns> {
    const politicianIndex = parseInt(politicianId.split('_')[1] || '1');
    
    const [patternsData, milestonesData] = await Promise.all([
      this.getTemporalPatterns(),
      this.getElectoralMilestones()
    ]);

    // Adjust circadian pattern based on politician's characteristics
    const adjustedCircadian: Record<number, number> = {};
    Object.entries(patternsData.temporalPatterns.circadianEngagement).forEach(([hour, base]) => {
      const hourNum = parseInt(hour);
      const personalAdjustment = (Math.sin(politicianIndex * 0.1 + hourNum) * 0.1);
      adjustedCircadian[hourNum] = Math.max(0, Math.min(1, base + personalAdjustment));
    });
    
    // Determine peak and low hours
    const hourlyEntries = Object.entries(adjustedCircadian).map(([h, v]) => [parseInt(h), v]);
    const sortedHours = hourlyEntries.sort((a, b) => b[1] - a[1]);
    const peakHours = sortedHours.slice(0, 4).map(([h]) => h);
    const lowHours = sortedHours.slice(-4).map(([h]) => h);
    
    // Adjust weekly pattern
    const adjustedWeekly: Record<number, number> = {};
    Object.entries(patternsData.temporalPatterns.weeklyEngagement).forEach(([day, base]) => {
      const dayNum = parseInt(day);
      const personalAdjustment = (Math.sin(politicianIndex * 0.2 + dayNum) * 0.08);
      adjustedWeekly[dayNum] = Math.max(0, Math.min(1, base + personalAdjustment));
    });
    
    // Determine peak and low days
    const dailyEntries = Object.entries(adjustedWeekly).map(([d, v]) => [parseInt(d), v]);
    const sortedDays = dailyEntries.sort((a, b) => b[1] - a[1]);
    const peakDays = sortedDays.slice(0, 2).map(([d]) => d);
    const lowDays = sortedDays.slice(-2).map(([d]) => d);
    
    // Determine electoral phase and intensity
    const { phase, daysToElection, intensity } = await this.determineElectoralPhase(currentDate);
    
    // Get relevant milestones
    const relevantMilestones = milestonesData.electoralMilestones
      .map(m => ({
        ...m,
        date: new Date(m.date)
      }))
      .filter(milestone => {
        const daysDiff = Math.abs((milestone.date.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
        return daysDiff <= 30; // Within 30 days
      });
    
    // Determine seasonal factors
    const month = currentDate.getMonth() + 1; // 1-12
    const season = patternsData.temporalPatterns.seasonalFactors.Dry.months.includes(month) ? 'Dry' : 'Rainy';
    const seasonalFactor = patternsData.temporalPatterns.seasonalFactors[season].engagementMultiplier;
    
    return {
      daily: {
        circadianPattern: adjustedCircadian,
        peakHours,
        lowHours
      },
      weekly: {
        weeklyPattern: adjustedWeekly,
        peakDays,
        lowDays
      },
      electoral: {
        phase,
        daysToElection,
        milestones: relevantMilestones,
        intensity
      },
      seasonal: {
        month,
        season,
        seasonalFactor
      }
    };
  }

  private async determineElectoralPhase(currentDate: Date): Promise<{
    phase: ElectoralPhase;
    daysToElection: number;
    intensity: number;
  }> {
    const milestonesData = await this.getElectoralMilestones();
    
    // Find the next election date
    const nextElection = milestonesData.electoralMilestones
      .map(m => ({
        ...m,
        date: new Date(m.date)
      }))
      .find(m => m.type === 'Election' && m.date > currentDate);
    
    if (!nextElection) {
      return {
        phase: 'Inter-Election',
        daysToElection: 365,
        intensity: 0.3
      };
    }
    
    const daysToElection = Math.ceil((nextElection.date.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    let phase: ElectoralPhase;
    let intensity: number;
    
    if (daysToElection <= 1) {
      phase = 'Election Day';
      intensity = 1.0;
    } else if (daysToElection <= 7) {
      phase = 'Election Week';
      intensity = 0.95;
    } else if (daysToElection <= 150) {
      phase = 'Campaign Period';
      intensity = 0.7 + (150 - daysToElection) / 150 * 0.25;
    } else if (daysToElection <= 365) {
      phase = 'Pre-Election';
      intensity = 0.5 + (365 - daysToElection) / 365 * 0.2;
    } else {
      phase = 'Inter-Election';
      intensity = 0.3;
    }
    
    return { phase, daysToElection, intensity };
  }

  async generateTemporalSentimentData(
    politicianId: string,
    baseSentiment: number,
    timeRange: { start: Date; end: Date }
  ): Promise<TemporalSentimentData> {
    const [patterns, sentimentFactors] = await Promise.all([
      this.generateTemporalPatterns(politicianId, timeRange.start),
      this.getTemporalSentimentFactors()
    ]);

    // Generate hourly patterns (0-23)
    const hourlyPatterns: Record<number, number> = {};
    Object.entries(patterns.daily.circadianPattern).forEach(([hour, engagement]) => {
      const hourNum = parseInt(hour);
      // Sentiment tends to be more negative during low engagement hours
      const sentimentAdjustment = (engagement - 0.5) * 0.1;
      hourlyPatterns[hourNum] = Math.max(0, Math.min(1, baseSentiment + sentimentAdjustment));
    });
    
    // Generate daily patterns (0-6, Sunday-Saturday)
    const dailyPatterns: Record<number, number> = {};
    Object.entries(patterns.weekly.weeklyPattern).forEach(([day, engagement]) => {
      const dayNum = parseInt(day);
      const sentimentAdjustment = (engagement - 0.5) * 0.08;
      dailyPatterns[dayNum] = Math.max(0, Math.min(1, baseSentiment + sentimentAdjustment));
    });
    
    // Generate weekly trends
    const weeklyTrends = await this.generateWeeklyTrends(politicianId, baseSentiment, timeRange, patterns, sentimentFactors);
    
    // Generate election cycle data
    const electionCycleData = {
      phase: patterns.electoral.phase,
      sentiment: this.calculateElectoralSentiment(baseSentiment, patterns.electoral.phase, patterns.electoral.intensity, sentimentFactors),
      polarization: this.calculatePolarization(patterns.electoral.phase, patterns.electoral.intensity, sentimentFactors),
      engagement: patterns.electoral.intensity
    };
    
    return {
      hourlyPatterns,
      dailyPatterns,
      weeklyTrends,
      electionCycleData
    };
  }

  private async generateWeeklyTrends(
    politicianId: string,
    baseSentiment: number,
    timeRange: { start: Date; end: Date },
    patterns: TemporalPatterns,
    sentimentFactors: TemporalSentimentFactors
  ): Promise<Array<{
    week: number;
    sentiment: number;
    engagement: number;
    events: string[];
  }>> {
    const weeks = [];
    const startDate = new Date(timeRange.start);
    const endDate = new Date(timeRange.end);
    
    let currentWeek = 1;
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      // Calculate week sentiment with various factors
      let weekSentiment = baseSentiment;
      
      // Seasonal adjustment
      const seasonalAdjustment = patterns.seasonal.season === 'Dry' ? 0.02 : -0.01;
      weekSentiment += seasonalAdjustment;
      
      // Electoral phase adjustment
      const electoralAdjustment = sentimentFactors.temporalSentimentFactors.weeklySentimentAdjustments[patterns.electoral.phase];
      weekSentiment += electoralAdjustment;
      
      // Random weekly variation
      weekSentiment += (Math.random() - 0.5) * 0.1;
      
      // Ensure bounds
      weekSentiment = Math.max(0, Math.min(1, weekSentiment));
      
      // Calculate engagement
      const baseEngagement = patterns.seasonal.seasonalFactor * patterns.electoral.intensity;
      const weekEngagement = Math.max(0, Math.min(1, baseEngagement + (Math.random() - 0.5) * 0.2));
      
      // Generate events for this week
      const events = this.generateWeeklyEvents(currentDate, patterns.electoral.phase, sentimentFactors);
      
      weeks.push({
        week: currentWeek,
        sentiment: weekSentiment,
        engagement: weekEngagement,
        events
      });
      
      // Move to next week
      currentDate.setDate(currentDate.getDate() + 7);
      currentWeek++;
    }
    
    return weeks;
  }

  private calculateElectoralSentiment(
    baseSentiment: number,
    phase: ElectoralPhase,
    intensity: number,
    sentimentFactors: TemporalSentimentFactors
  ): number {
    const adjustment = sentimentFactors.temporalSentimentFactors.electoralPhaseAdjustments[phase] * intensity;
    return Math.max(0, Math.min(1, baseSentiment + adjustment));
  }

  private calculatePolarization(
    phase: ElectoralPhase,
    intensity: number,
    sentimentFactors: TemporalSentimentFactors
  ): number {
    const basePolarization = sentimentFactors.temporalSentimentFactors.polarizationBase[phase];
    return basePolarization * intensity;
  }

  private generateWeeklyEvents(
    weekDate: Date,
    electoralPhase: ElectoralPhase,
    sentimentFactors: TemporalSentimentFactors
  ): string[] {
    const events: string[] = [];
    const eventProbability = sentimentFactors.temporalSentimentFactors.eventProbabilities[electoralPhase];
    
    const possibleEvents = sentimentFactors.temporalSentimentFactors.possibleEvents;
    
    // Generate 0-3 events per week based on electoral phase
    const numEvents = Math.floor(Math.random() * 4 * eventProbability);
    
    for (let i = 0; i < numEvents; i++) {
      const randomEvent = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
      if (!events.includes(randomEvent)) {
        events.push(randomEvent);
      }
    }
    
    return events;
  }
}

export const temporalService = TemporalService.getInstance();