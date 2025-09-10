/**
 * Data Model Types for JSON Data Structure
 *
 * These interfaces define the structure of data as stored in JSON files,
 * separate from the application's internal types.
 */

// Geographic Data Models
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface State {
  id: string;
  name: string;
  code: string;
  capital: string;
  region: string;
  population: number;
  coordinates: Coordinates;
  metadata: {
    established: string;
    area_km2: number;
    timezone: string;
  };
}

export interface LGA {
  id: string;
  name: string;
  code: string;
  stateId: string;
  coordinates: Coordinates;
  metadata: {
    area_km2: number;
    population: number;
    established: string;
  };
}

export interface Ward {
  id: string;
  number: number;
  name: string;
  lgaId: string;
  stateId: string;
  coordinates: Coordinates;
  metadata: {
    area_km2: number;
    population: number;
    registeredVoters: number;
  };
}

export interface PollingUnit {
  id: string;
  code: string;
  name: string;
  wardId: string;
  lgaId: string;
  stateId: string;
  address: string;
  coordinates: Coordinates;
  capacity: {
    maxVoters: number;
    registeredVoters: number;
  };
  facilities: {
    accessible: boolean;
    hasElectricity: boolean;
    hasWater: boolean;
    securityLevel: "low" | "medium" | "high";
  };
  metadata: {
    established: string;
    lastUpdated: string;
    status: "active" | "inactive" | "suspended";
  };
}

// Political Data Models
export interface PoliticalParty {
  id: string;
  name: string;
  abbreviation: string;
  founded: string;
  ideology: string[];
  colors: {
    primary: string;
    secondary: string;
  };
  logo: string;
  headquarters: {
    address: string;
    stateId: string;
  };
  leadership: {
    nationalChairman: string;
    nationalSecretary: string;
  };
  metadata: {
    registrationNumber: string;
    status: "active" | "inactive" | "suspended";
    website?: string;
  };
}

export interface Position {
  id: string;
  title: string;
  level: "federal" | "state" | "local";
  category: "executive" | "legislative" | "judicial" | "party" | "aspirant";
  hierarchy: number;
  term: {
    duration: number;
    maxTerms: number;
    unit: "years" | "months";
  };
  responsibilities: string[];
  requirements: {
    minAge: number;
    citizenship: string;
    education: string;
  };
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  year: number;
}

export interface PoliticalHistory {
  positionId: string;
  stateId: string | null;
  startDate: string;
  endDate: string | null;
  partyId: string;
}

export interface SocialMedia {
  twitter?: string;
  facebook?: string;
  instagram?: string;
}

export interface PoliticianMetadata {
  isActive: boolean;
  verificationStatus: "verified" | "unverified" | "pending" | "rejected";
  lastUpdated: string;
}

export interface Politician {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  partyId: string | null;
  currentPositionId: string;
  stateOfOriginId: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  education: Education[];
  politicalHistory: PoliticalHistory[];
  socialMedia: SocialMedia;
  metadata: PoliticianMetadata;
}

// Analytics Data Models
export interface SentimentDataPoint {
  id: string;
  politicianId: string;
  platform: string;
  date: string;
  timeframe: "hour" | "day" | "week" | "month";
  sentiment: {
    score: number;
    label: "positive" | "negative" | "neutral";
    confidence: number;
  };
  mentions: {
    total: number;
    positive: number;
    negative: number;
    neutral: number;
  };
  engagement: {
    likes: number;
    shares: number;
    comments: number;
    reactions: number;
  };
  demographics: {
    ageGroup: string;
    gender: string;
    location: string;
  };
  metadata: {
    keywords: string[];
    topics: string[];
    influencerMentions: number;
  };
}

export interface EngagementMetric {
  id: string;
  politicianId: string;
  platform: string;
  date: string;
  metrics: {
    mentions: number;
    reach: number;
    impressions: number;
    engagement: number;
    shares: number;
    comments: number;
    likes: number;
  };
  viralityScore: number;
  influencerAmplification: {
    count: number;
    totalFollowers: number;
    averageEngagement: number;
  };
  metadata: {
    topPosts: string[];
    peakHours: number[];
    contentTypes: string[];
  };
}

export interface TopicTrend {
  id: string;
  topic: string;
  category: string;
  date: string;
  trendScore: number;
  direction: "rising" | "falling" | "stable";
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  keywords: string[];
  relatedPoliticians: string[];
  metadata: {
    urgency: "low" | "medium" | "high";
    impact: "local" | "state" | "national";
    sources: string[];
  };
}

// Temporal Data Models
export interface ElectionSchedule {
  id: string;
  type: "presidential" | "gubernatorial" | "legislative" | "local";
  level: "federal" | "state" | "local";
  date: string;
  stateId?: string;
  phases: {
    voterRegistration: {
      start: string;
      end: string;
    };
    campaignPeriod: {
      start: string;
      end: string;
    };
    electionDay: string;
    resultAnnouncement: string;
  };
  metadata: {
    status: "scheduled" | "ongoing" | "completed" | "postponed";
    expectedTurnout: number;
    registeredVoters: number;
  };
}

export interface ElectoralEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  location: {
    stateId: string;
    lgaId?: string;
    venue?: string;
  };
  participants: string[];
  impact: {
    level: "low" | "medium" | "high";
    scope: "local" | "state" | "national";
    sentimentChange: number;
  };
  outcomes: {
    winner?: string;
    results?: Record<string, any>;
    consequences: string[];
  };
  metadata: {
    verified: boolean;
    sources: string[];
    mediaAttention: "low" | "medium" | "high";
  };
}

// Validation and Quality Models
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

export interface DataQualityMetrics {
  completeness: number;
  accuracy: number;
  consistency: number;
  timeliness: number;
  overall: number;
}

export interface ReferenceIntegrity {
  field: string;
  referenceTable: string;
  referenceField: string;
  isValid: boolean;
  missingReferences: string[];
}

// Export all types for easy importing
export type {
  // Geographic
  Coordinates,
  DataQualityMetrics,
  Education,
  // Temporal
  ElectionSchedule,
  ElectoralEvent,
  EngagementMetric,
  LGA,
  PoliticalHistory,
  // Political
  PoliticalParty,
  Politician,
  PoliticianMetadata,
  PollingUnit,
  Position,
  ReferenceIntegrity,
  // Analytics
  SentimentDataPoint,
  SocialMedia,
  State,
  TopicTrend,
  // Validation
  ValidationResult,
  Ward
};

