/**
 * Topic and Engagement Data Systems for Multi-Dimensional Analysis
 * 
 * This module provides comprehensive topic categorization and engagement analysis
 * with policy areas, campaign issues, event-driven topics, and engagement metrics
 * tailored for Nigerian political context.
 */

// Topic and engagement interfaces
export interface TopicClassification {
  policyAreas: {
    primary: PolicyArea;
    secondary: PolicyArea[];
    confidence: number;
  };
  campaignIssues: {
    issues: CampaignIssue[];
    relevance: Record<string, number>;
    confidence: number;
  };
  eventDriven: {
    events: EventType[];
    temporal: boolean;
    urgency: 'Low' | 'Medium' | 'High';
    confidence: number;
  };
}

export interface EngagementMetrics {
  level: 'High' | 'Medium' | 'Low';
  metrics: {
    shares: number;
    comments: number;
    reach: number;
    impressions: number;
  };
  virality: {
    score: number; // 0-1
    velocity: number; // shares per hour
    isViral: boolean;
  };
  quality: {
    authenticity: number; // 0-1
    relevance: number; // 0-1
    constructiveness: number; // 0-1
  };
  influencerAmplification: {
    hasInfluencers: boolean;
    influencerCount: number;
    totalFollowers: number;
  };
}

// Policy areas for Nigerian politics
export type PolicyArea = 
  | 'Economy'
  | 'Security'
  | 'Corruption'
  | 'Education'
  | 'Health'
  | 'Infrastructure'
  | 'Youth/Jobs'
  | 'Agriculture'
  | 'Energy'
  | 'Technology'
  | 'Environment'
  | 'Social Welfare';

// Campaign issues specific to Nigerian context
export type CampaignIssue = 
  | 'Cost of Living'
  | 'Fuel Subsidy'
  | 'Minimum Wage'
  | 'Election Credibility'
  | 'Insecurity'
  | 'Unemployment'
  | 'Power Supply'
  | 'Road Infrastructure'
  | 'Healthcare Access'
  | 'Educational Reform'
  | 'Anti-Corruption'
  | 'Youth Empowerment';

// Event types for Nigerian political context
export type EventType = 
  | 'Protests'
  | 'Rallies'
  | 'Government Actions'
  | 'Scandals'
  | 'Policy Announcements'
  | 'Electoral Events'
  | 'Security Incidents'
  | 'Economic Announcements'
  | 'International Relations'
  | 'Social Movements';

// Nigerian political topics with realistic distributions
export const nigerianPoliticalTopics = {
  policyAreas: {
    'Economy': {
      weight: 0.25,
      subTopics: ['GDP Growth', 'Inflation', 'Exchange Rate', 'Trade', 'Investment'],
      sentiment: { base: 0.35, variance: 0.20 }
    },
    'Security': {
      weight: 0.20,
      subTopics: ['Terrorism', 'Kidnapping', 'Banditry', 'Police Reform', 'Military Operations'],
      sentiment: { base: 0.25, variance: 0.15 }
    },
    'Corruption': {
      weight: 0.15,
      subTopics: ['EFCC Cases', 'Transparency', 'Public Procurement', 'Asset Recovery'],
      sentiment: { base: 0.20, variance: 0.25 }
    },
    'Infrastructure': {
      weight: 0.12,
      subTopics: ['Roads', 'Railways', 'Airports', 'Bridges', 'Urban Development'],
      sentiment: { base: 0.45, variance: 0.18 }
    },
    'Youth/Jobs': {
      weight: 0.10,
      subTopics: ['Youth Employment', 'Skills Development', 'Entrepreneurship', 'Tech Hubs'],
      sentiment: { base: 0.40, variance: 0.22 }
    },
    'Education': {
      weight: 0.08,
      subTopics: ['ASUU Strikes', 'School Infrastructure', 'Curriculum Reform', 'Funding'],
      sentiment: { base: 0.35, variance: 0.20 }
    },
    'Health': {
      weight: 0.06,
      subTopics: ['Healthcare Access', 'Medical Tourism', 'Disease Outbreaks', 'Health Insurance'],
      sentiment: { base: 0.30, variance: 0.18 }
    },
    'Agriculture': {
      weight: 0.04,
      subTopics: ['Food Security', 'Farmer-Herder Conflicts', 'Agricultural Loans', 'Technology'],
      sentiment: { base: 0.42, variance: 0.16 }
    }
  },
  campaignIssues: {
    'Cost of Living': {
      frequency: 0.22,
      urgency: 'High',
      sentiment: { base: 0.15, variance: 0.10 }
    },
    'Fuel Subsidy': {
      frequency: 0.18,
      urgency: 'High',
      sentiment: { base: 0.20, variance: 0.15 }
    },
    'Insecurity': {
      frequency: 0.16,
      urgency: 'High',
      sentiment: { base: 0.18, variance: 0.12 }
    },
    'Unemployment': {
      frequency: 0.14,
      urgency: 'High',
      sentiment: { base: 0.22, variance: 0.15 }
    },
    'Power Supply': {
      frequency: 0.12,
      urgency: 'Medium',
      sentiment: { base: 0.25, variance: 0.18 }
    },
    'Election Credibility': {
      frequency: 0.10,
      urgency: 'Medium',
      sentiment: { base: 0.35, variance: 0.25 }
    },
    'Minimum Wage': {
      frequency: 0.08,
      urgency: 'Medium',
      sentiment: { base: 0.40, variance: 0.20 }
    }
  },
  eventTypes: {
    'Government Actions': {
      frequency: 0.25,
      impact: 'High',
      duration: 'Medium'
    },
    'Policy Announcements': {
      frequency: 0.20,
      impact: 'Medium',
      duration: 'Long'
    },
    'Protests': {
      frequency: 0.15,
      impact: 'High',
      duration: 'Short'
    },
    'Security Incidents': {
      frequency: 0.12,
      impact: 'High',
      duration: 'Short'
    },
    'Electoral Events': {
      frequency: 0.10,
      impact: 'High',
      duration: 'Medium'
    },
    'Scandals': {
      frequency: 0.08,
      impact: 'High',
      duration: 'Long'
    },
    'Rallies': {
      frequency: 0.06,
      impact: 'Medium',
      duration: 'Short'
    },
    'Economic Announcements': {
      frequency: 0.04,
      impact: 'Medium',
      duration: 'Medium'
    }
  }
};

// Generate topic classification for content
export const generateTopicClassification = (
  politicianId: string,
  contentContext?: string
): TopicClassification => {
  const politicianIndex = parseInt(politicianId.split('_')[1] || '1');
  
  // Generate primary policy area
  const policyAreaRand = (politicianIndex * 0.123) % 1;
  let cumulative = 0;
  let primaryPolicyArea: PolicyArea = 'Economy';
  
  for (const [area, data] of Object.entries(nigerianPoliticalTopics.policyAreas)) {
    cumulative += data.weight;
    if (policyAreaRand <= cumulative) {
      primaryPolicyArea = area as PolicyArea;
      break;
    }
  }
  
  // Generate secondary policy areas
  const secondaryAreas: PolicyArea[] = [];
  const numSecondary = Math.floor(Math.random() * 3); // 0-2 secondary areas
  
  for (let i = 0; i < numSecondary; i++) {
    const areas = Object.keys(nigerianPoliticalTopics.policyAreas) as PolicyArea[];
    const randomArea = areas[Math.floor(Math.random() * areas.length)];
    if (randomArea !== primaryPolicyArea && !secondaryAreas.includes(randomArea)) {
      secondaryAreas.push(randomArea);
    }
  }
  
  // Generate campaign issues
  const relevantIssues: CampaignIssue[] = [];
  const issueRelevance: Record<string, number> = {};
  
  Object.entries(nigerianPoliticalTopics.campaignIssues).forEach(([issue, data]) => {
    const relevanceScore = Math.random();
    if (relevanceScore > 0.6) { // 40% chance of being relevant
      relevantIssues.push(issue as CampaignIssue);
      issueRelevance[issue] = relevanceScore;
    }
  });
  
  // Generate event-driven topics
  const relevantEvents: EventType[] = [];
  const eventRand = Math.random();
  
  if (eventRand > 0.7) { // 30% chance of being event-driven
    const numEvents = 1 + Math.floor(Math.random() * 2); // 1-2 events
    const events = Object.keys(nigerianPoliticalTopics.eventTypes) as EventType[];
    
    for (let i = 0; i < numEvents; i++) {
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      if (!relevantEvents.includes(randomEvent)) {
        relevantEvents.push(randomEvent);
      }
    }
  }
  
  return {
    policyAreas: {
      primary: primaryPolicyArea,
      secondary: secondaryAreas,
      confidence: 0.75 + Math.random() * 0.20
    },
    campaignIssues: {
      issues: relevantIssues,
      relevance: issueRelevance,
      confidence: 0.70 + Math.random() * 0.25
    },
    eventDriven: {
      events: relevantEvents,
      temporal: relevantEvents.length > 0,
      urgency: relevantEvents.length > 0 ? 
        (['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as 'Low' | 'Medium' | 'High') : 
        'Low',
      confidence: relevantEvents.length > 0 ? 0.80 + Math.random() * 0.15 : 0.50
    }
  };
};
// Generate engagement metrics for content
export const generateEngagementMetrics = (
  politicianId: string,
  topicClassification: TopicClassification,
  basePopularity: number = 0.5
): EngagementMetrics => {
  const politicianIndex = parseInt(politicianId.split('_')[1] || '1');
  
  // Calculate base engagement multiplier based on topic
  let topicMultiplier = 1.0;
  
  // Policy area impact on engagement
  const policyAreaData = nigerianPoliticalTopics.policyAreas[topicClassification.policyAreas.primary];
  if (policyAreaData) {
    topicMultiplier *= (1 + policyAreaData.weight);
  }
  
  // Campaign issue impact
  topicClassification.campaignIssues.issues.forEach(issue => {
    const issueData = nigerianPoliticalTopics.campaignIssues[issue];
    if (issueData) {
      topicMultiplier *= (1 + issueData.frequency * 0.5);
    }
  });
  
  // Event-driven content gets higher engagement
  if (topicClassification.eventDriven.temporal) {
    topicMultiplier *= 1.5;
    if (topicClassification.eventDriven.urgency === 'High') {
      topicMultiplier *= 1.3;
    }
  }
  
  // Generate base metrics
  const baseShares = Math.floor((500 + Math.random() * 9500) * basePopularity * topicMultiplier);
  const baseComments = Math.floor(baseShares * (0.1 + Math.random() * 0.15));
  const baseReach = Math.floor(baseShares * (8 + Math.random() * 12));
  const baseImpressions = Math.floor(baseReach * (2 + Math.random() * 3));
  
  // Determine engagement level
  let engagementLevel: 'High' | 'Medium' | 'Low';
  if (baseShares > 10000) {
    engagementLevel = 'High';
  } else if (baseShares > 1000) {
    engagementLevel = 'Medium';
  } else {
    engagementLevel = 'Low';
  }
  
  // Calculate virality metrics
  const viralityScore = Math.min(1, (baseShares / 50000) + (Math.random() * 0.3));
  const velocity = baseShares / (24 + Math.random() * 48); // shares per hour
  const isViral = baseShares > 10000 && velocity > 400;
  
  // Generate quality metrics
  const authenticity = 0.6 + Math.random() * 0.35;
  const relevance = 0.7 + Math.random() * 0.25;
  const constructiveness = 0.5 + Math.random() * 0.4;
  
  // Generate influencer amplification
  const hasInfluencers = Math.random() > 0.7; // 30% chance
  const influencerCount = hasInfluencers ? 1 + Math.floor(Math.random() * 5) : 0;
  const totalFollowers = hasInfluencers ? 
    influencerCount * (100000 + Math.random() * 900000) : 0;
  
  return {
    level: engagementLevel,
    metrics: {
      shares: baseShares,
      comments: baseComments,
      reach: baseReach,
      impressions: baseImpressions
    },
    virality: {
      score: viralityScore,
      velocity,
      isViral
    },
    quality: {
      authenticity,
      relevance,
      constructiveness
    },
    influencerAmplification: {
      hasInfluencers,
      influencerCount,
      totalFollowers
    }
  };
};

// Generate trending topics for a time period
export const generateTrendingTopics = (
  timeContext: {
    startDate: Date;
    endDate: Date;
    isElectionPeriod: boolean;
  }
): Array<{
  topic: string;
  category: 'PolicyArea' | 'CampaignIssue' | 'Event';
  trendingScore: number;
  sentiment: number;
  engagement: EngagementMetrics;
}> => {
  const trendingTopics = [];
  
  // Generate trending policy areas
  Object.entries(nigerianPoliticalTopics.policyAreas).forEach(([area, data]) => {
    const trendingScore = data.weight + Math.random() * 0.3;
    if (trendingScore > 0.4) {
      trendingTopics.push({
        topic: area,
        category: 'PolicyArea' as const,
        trendingScore,
        sentiment: data.sentiment.base + (Math.random() - 0.5) * data.sentiment.variance,
        engagement: generateEngagementMetrics('trending_' + area, {
          policyAreas: { primary: area as PolicyArea, secondary: [], confidence: 0.9 },
          campaignIssues: { issues: [], relevance: {}, confidence: 0.5 },
          eventDriven: { events: [], temporal: false, urgency: 'Low', confidence: 0.5 }
        }, trendingScore)
      });
    }
  });
  
  // Generate trending campaign issues
  Object.entries(nigerianPoliticalTopics.campaignIssues).forEach(([issue, data]) => {
    let trendingScore = data.frequency + Math.random() * 0.2;
    
    // Boost during election periods
    if (timeContext.isElectionPeriod) {
      trendingScore *= 1.5;
    }
    
    if (trendingScore > 0.3) {
      trendingTopics.push({
        topic: issue,
        category: 'CampaignIssue' as const,
        trendingScore,
        sentiment: data.sentiment.base + (Math.random() - 0.5) * data.sentiment.variance,
        engagement: generateEngagementMetrics('trending_' + issue, {
          policyAreas: { primary: 'Economy', secondary: [], confidence: 0.7 },
          campaignIssues: { issues: [issue as CampaignIssue], relevance: { [issue]: 0.9 }, confidence: 0.9 },
          eventDriven: { events: [], temporal: false, urgency: data.urgency, confidence: 0.7 }
        }, trendingScore)
      });
    }
  });
  
  // Generate trending events
  Object.entries(nigerianPoliticalTopics.eventTypes).forEach(([event, data]) => {
    const trendingScore = data.frequency + Math.random() * 0.4;
    
    if (trendingScore > 0.25) {
      trendingTopics.push({
        topic: event,
        category: 'Event' as const,
        trendingScore,
        sentiment: 0.3 + Math.random() * 0.4, // Events tend to be more neutral to negative
        engagement: generateEngagementMetrics('trending_' + event, {
          policyAreas: { primary: 'Security', secondary: [], confidence: 0.6 },
          campaignIssues: { issues: [], relevance: {}, confidence: 0.5 },
          eventDriven: { events: [event as EventType], temporal: true, urgency: 'High', confidence: 0.9 }
        }, trendingScore)
      });
    }
  });
  
  // Sort by trending score and return top topics
  return trendingTopics
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, 15); // Top 15 trending topics
};

// Generate topic engagement over time
export const generateTopicEngagementTimeline = (
  topic: string,
  category: 'PolicyArea' | 'CampaignIssue' | 'Event',
  days: number = 30
): Array<{
  date: Date;
  engagement: number;
  sentiment: number;
  mentions: number;
}> => {
  const timeline = [];
  const baseDate = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - i);
    
    // Generate realistic engagement patterns
    let baseEngagement = 0.5;
    
    // Weekend patterns (lower engagement)
    if (date.getDay() === 0 || date.getDay() === 6) {
      baseEngagement *= 0.8;
    }
    
    // Add some randomness and trends
    const trend = Math.sin((i / days) * Math.PI * 2) * 0.2; // Cyclical pattern
    const randomVariation = (Math.random() - 0.5) * 0.3;
    
    const engagement = Math.max(0, Math.min(1, baseEngagement + trend + randomVariation));
    const sentiment = 0.4 + Math.random() * 0.3; // Slightly negative to neutral
    const mentions = Math.floor(engagement * (1000 + Math.random() * 4000));
    
    timeline.push({
      date,
      engagement,
      sentiment,
      mentions
    });
  }
  
  return timeline;
};

// Export utility functions
export const topicEngagementUtils = {
  generateTopicClassification,
  generateEngagementMetrics,
  generateTrendingTopics,
  generateTopicEngagementTimeline,
  nigerianPoliticalTopics
};