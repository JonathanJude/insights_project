/**
 * Temporal Pattern Data for Multi-Dimensional Sentiment Analysis
 * 
 * This module provides comprehensive temporal analysis including daily patterns,
 * weekly cycles, and election milestone tracking with realistic Nigerian
 * political context and circadian engagement patterns.
 */

// Temporal pattern interfaces
export interface TemporalPatterns {
  daily: {
    circadianPattern: Record<number, number>; // Hour -> engagement level
    peakHours: number[];
    lowHours: number[];
  };
  weekly: {
    weeklyPattern: Record<number, number>; // Day of week -> engagement level
    peakDays: number[];
    lowDays: number[];
  };
  electoral: {
    phase: ElectoralPhase;
    daysToElection: number;
    milestones: ElectoralMilestone[];
    intensity: number; // 0-1
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

// Nigerian political temporal patterns
export const nigerianTemporalPatterns = {
  // Circadian patterns - Nigerian social media and political engagement
  circadianEngagement: {
    0: 0.15,  // 12 AM - Very low
    1: 0.10,  // 1 AM - Lowest
    2: 0.08,  // 2 AM - Lowest
    3: 0.06,  // 3 AM - Lowest
    4: 0.08,  // 4 AM - Very low
    5: 0.12,  // 5 AM - Low
    6: 0.35,  // 6 AM - Morning news
    7: 0.55,  // 7 AM - Commute time
    8: 0.65,  // 8 AM - Work start
    9: 0.45,  // 9 AM - Work hours
    10: 0.40, // 10 AM - Work hours
    11: 0.42, // 11 AM - Pre-lunch
    12: 0.60, // 12 PM - Lunch break
    13: 0.55, // 1 PM - Lunch break
    14: 0.35, // 2 PM - Post-lunch low
    15: 0.40, // 3 PM - Afternoon
    16: 0.50, // 4 PM - Late afternoon
    17: 0.65, // 5 PM - End of work
    18: 0.80, // 6 PM - Evening peak
    19: 0.90, // 7 PM - Prime time
    20: 0.95, // 8 PM - Peak engagement
    21: 0.85, // 9 PM - Evening
    22: 0.70, // 10 PM - Late evening
    23: 0.45  // 11 PM - Night
  },
  
  // Weekly patterns - Nigerian political engagement
  weeklyEngagement: {
    0: 0.75, // Sunday - High (weekend discussions)
    1: 0.65, // Monday - Medium-high (week start)
    2: 0.55, // Tuesday - Medium
    3: 0.60, // Wednesday - Medium
    4: 0.70, // Thursday - Medium-high
    5: 0.80, // Friday - High (weekend prep)
    6: 0.85  // Saturday - Highest (weekend peak)
  },
  
  // Seasonal patterns
  seasonalFactors: {
    // Dry season (November - March) - Higher political activity
    'Dry': {
      months: [11, 12, 1, 2, 3],
      engagementMultiplier: 1.15,
      sentimentAdjustment: 0.05
    },
    // Rainy season (April - October) - Lower political activity
    'Rainy': {
      months: [4, 5, 6, 7, 8, 9, 10],
      engagementMultiplier: 0.90,
      sentimentAdjustment: -0.02
    }
  }
};

// Nigerian election milestones (based on typical election cycle)
export const nigerianElectionMilestones: ElectoralMilestone[] = [
  {
    name: 'Voter Registration Opens',
    date: new Date('2024-06-01'),
    type: 'Registration',
    impact: 'Medium',
    description: 'INEC opens continuous voter registration'
  },
  {
    name: 'Party Primaries Begin',
    date: new Date('2024-08-15'),
    type: 'Campaign',
    impact: 'High',
    description: 'Political parties conduct primary elections'
  },
  {
    name: 'Campaign Period Begins',
    date: new Date('2024-09-28'),
    type: 'Campaign',
    impact: 'High',
    description: 'Official campaign period starts (150 days before election)'
  },
  {
    name: 'Presidential Debate',
    date: new Date('2025-01-15'),
    type: 'Debate',
    impact: 'High',
    description: 'Presidential candidates debate'
  },
  {
    name: 'Campaign Ends',
    date: new Date('2025-02-23'),
    type: 'Campaign',
    impact: 'Medium',
    description: 'Campaign activities must end 24 hours before election'
  },
  {
    name: 'Presidential Election',
    date: new Date('2025-02-25'),
    type: 'Election',
    impact: 'High',
    description: 'Presidential and National Assembly elections'
  },
  {
    name: 'Governorship Election',
    date: new Date('2025-03-11'),
    type: 'Election',
    impact: 'High',
    description: 'Governorship and State Assembly elections'
  },
  {
    name: 'Results Declaration',
    date: new Date('2025-03-15'),
    type: 'Result',
    impact: 'High',
    description: 'Final election results declared'
  }
];

// Generate temporal patterns for a politician
export const generateTemporalPatterns = (
  politicianId: string,
  currentDate: Date = new Date()
): TemporalPatterns => {
  const politicianIndex = parseInt(politicianId.split('_')[1] || '1');
  
  // Adjust circadian pattern based on politician's characteristics
  const adjustedCircadian: Record<number, number> = {};
  Object.entries(nigerianTemporalPatterns.circadianEngagement).forEach(([hour, base]) => {
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
  Object.entries(nigerianTemporalPatterns.weeklyEngagement).forEach(([day, base]) => {
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
  const { phase, daysToElection, intensity } = determineElectoralPhase(currentDate);
  
  // Get relevant milestones
  const relevantMilestones = nigerianElectionMilestones.filter(milestone => {
    const daysDiff = Math.abs((milestone.date.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    return daysDiff <= 30; // Within 30 days
  });
  
  // Determine seasonal factors
  const month = currentDate.getMonth() + 1; // 1-12
  const season = nigerianTemporalPatterns.seasonalFactors.Dry.months.includes(month) ? 'Dry' : 'Rainy';
  const seasonalFactor = nigerianTemporalPatterns.seasonalFactors[season].engagementMultiplier;
  
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
};

// Determine current electoral phase
const determineElectoralPhase = (currentDate: Date): {
  phase: ElectoralPhase;
  daysToElection: number;
  intensity: number;
} => {
  // Find the next election date
  const nextElection = nigerianElectionMilestones.find(m => m.type === 'Election' && m.date > currentDate);
  
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
    intensity = 0.7 + (150 - daysToElection) / 150 * 0.25; // Increases as election approaches
  } else if (daysToElection <= 365) {
    phase = 'Pre-Election';
    intensity = 0.5 + (365 - daysToElection) / 365 * 0.2;
  } else {
    phase = 'Inter-Election';
    intensity = 0.3;
  }
  
  return { phase, daysToElection, intensity };
};
// Generate temporal sentiment data for a politician
export const generateTemporalSentimentData = (
  politicianId: string,
  baseSentiment: number,
  timeRange: { start: Date; end: Date }
): TemporalSentimentData => {
  const patterns = generateTemporalPatterns(politicianId, timeRange.start);
  
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
  const weeklyTrends = generateWeeklyTrends(politicianId, baseSentiment, timeRange, patterns);
  
  // Generate election cycle data
  const electionCycleData = {
    phase: patterns.electoral.phase,
    sentiment: calculateElectoralSentiment(baseSentiment, patterns.electoral.phase, patterns.electoral.intensity),
    polarization: calculatePolarization(patterns.electoral.phase, patterns.electoral.intensity),
    engagement: patterns.electoral.intensity
  };
  
  return {
    hourlyPatterns,
    dailyPatterns,
    weeklyTrends,
    electionCycleData
  };
};

// Generate weekly trends over time range
const generateWeeklyTrends = (
  politicianId: string,
  baseSentiment: number,
  timeRange: { start: Date; end: Date },
  patterns: TemporalPatterns
): Array<{
  week: number;
  sentiment: number;
  engagement: number;
  events: string[];
}> => {
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
    const electoralAdjustment = getElectoralSentimentAdjustment(patterns.electoral.phase);
    weekSentiment += electoralAdjustment;
    
    // Random weekly variation
    weekSentiment += (Math.random() - 0.5) * 0.1;
    
    // Ensure bounds
    weekSentiment = Math.max(0, Math.min(1, weekSentiment));
    
    // Calculate engagement
    const baseEngagement = patterns.seasonal.seasonalFactor * patterns.electoral.intensity;
    const weekEngagement = Math.max(0, Math.min(1, baseEngagement + (Math.random() - 0.5) * 0.2));
    
    // Generate events for this week
    const events = generateWeeklyEvents(currentDate, patterns.electoral.phase);
    
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
};

// Calculate electoral sentiment adjustment
const calculateElectoralSentiment = (
  baseSentiment: number,
  phase: ElectoralPhase,
  intensity: number
): number => {
  const phaseAdjustments: Record<ElectoralPhase, number> = {
    'Inter-Election': 0,
    'Pre-Election': -0.05,
    'Campaign Period': -0.10,
    'Election Week': -0.15,
    'Election Day': -0.20,
    'Post-Election': -0.08
  };
  
  const adjustment = phaseAdjustments[phase] * intensity;
  return Math.max(0, Math.min(1, baseSentiment + adjustment));
};

// Calculate polarization based on electoral phase
const calculatePolarization = (phase: ElectoralPhase, intensity: number): number => {
  const basePolarization: Record<ElectoralPhase, number> = {
    'Inter-Election': 0.3,
    'Pre-Election': 0.4,
    'Campaign Period': 0.7,
    'Election Week': 0.9,
    'Election Day': 1.0,
    'Post-Election': 0.6
  };
  
  return basePolarization[phase] * intensity;
};

// Get electoral sentiment adjustment
const getElectoralSentimentAdjustment = (phase: ElectoralPhase): number => {
  const adjustments: Record<ElectoralPhase, number> = {
    'Inter-Election': 0.02,
    'Pre-Election': -0.02,
    'Campaign Period': -0.08,
    'Election Week': -0.12,
    'Election Day': -0.15,
    'Post-Election': -0.05
  };
  
  return adjustments[phase];
};

// Generate events for a specific week
const generateWeeklyEvents = (weekDate: Date, electoralPhase: ElectoralPhase): string[] => {
  const events: string[] = [];
  const eventProbability = getEventProbability(electoralPhase);
  
  const possibleEvents = [
    'Policy announcement',
    'Campaign rally',
    'Media interview',
    'Social media controversy',
    'Public appearance',
    'Party meeting',
    'Debate participation',
    'Community visit',
    'Economic statement',
    'Security briefing'
  ];
  
  // Generate 0-3 events per week based on electoral phase
  const numEvents = Math.floor(Math.random() * 4 * eventProbability);
  
  for (let i = 0; i < numEvents; i++) {
    const randomEvent = possibleEvents[Math.floor(Math.random() * possibleEvents.length)];
    if (!events.includes(randomEvent)) {
      events.push(randomEvent);
    }
  }
  
  return events;
};

// Get event probability based on electoral phase
const getEventProbability = (phase: ElectoralPhase): number => {
  const probabilities: Record<ElectoralPhase, number> = {
    'Inter-Election': 0.3,
    'Pre-Election': 0.5,
    'Campaign Period': 0.8,
    'Election Week': 1.0,
    'Election Day': 0.6,
    'Post-Election': 0.4
  };
  
  return probabilities[phase];
};

// Generate circadian sentiment pattern for a specific day
export const generateDailyCircadianPattern = (
  politicianId: string,
  date: Date,
  baseSentiment: number
): Record<number, { sentiment: number; engagement: number; confidence: number }> => {
  const patterns = generateTemporalPatterns(politicianId, date);
  const dayOfWeek = date.getDay();
  const weeklyMultiplier = patterns.weekly.weeklyPattern[dayOfWeek];
  
  const circadianData: Record<number, { sentiment: number; engagement: number; confidence: number }> = {};
  
  Object.entries(patterns.daily.circadianPattern).forEach(([hour, baseEngagement]) => {
    const hourNum = parseInt(hour);
    
    // Adjust engagement with weekly pattern
    const adjustedEngagement = baseEngagement * weeklyMultiplier;
    
    // Sentiment tends to correlate with engagement but with some variation
    const sentimentVariation = (adjustedEngagement - 0.5) * 0.15;
    const hourlySentiment = Math.max(0, Math.min(1, 
      baseSentiment + sentimentVariation + (Math.random() - 0.5) * 0.1
    ));
    
    // Confidence is higher during peak hours
    const confidence = 0.6 + adjustedEngagement * 0.3;
    
    circadianData[hourNum] = {
      sentiment: hourlySentiment,
      engagement: adjustedEngagement,
      confidence
    };
  });
  
  return circadianData;
};

// Export utility functions
export const temporalDataUtils = {
  generateTemporalPatterns,
  generateTemporalSentimentData,
  generateDailyCircadianPattern,
  nigerianTemporalPatterns,
  nigerianElectionMilestones
};