/**
 * Demographic Classification System for Multi-Dimensional Sentiment Analysis
 * 
 * This module provides comprehensive demographic data for Nigerian political analysis,
 * including education, occupation, age, and gender classifications with realistic
 * distributions and confidence scoring.
 */

// Demographic classification interfaces
export interface DemographicClassification {
  education: {
    level: 'Secondary' | 'Tertiary' | 'Postgraduate' | 'Primary' | 'Undefined';
    confidence: number;
    details?: string;
  };
  occupation: {
    sector: 'Public Sector' | 'Private Sector' | 'Student' | 'Unemployed' | 
            'Self-Employed' | 'Professional Services' | 'Technology' | 'Agriculture' | 'Undefined';
    confidence: number;
    details?: string;
  };
  ageGroup: {
    range: '18-25' | '26-35' | '36-45' | '46-55' | '56-65' | '65+' | 'Undefined';
    confidence: number;
  };
  gender: {
    classification: 'Male' | 'Female' | 'Non-Binary' | 'Undefined';
    confidence: number;
  };
}

export interface DemographicSentimentData {
  ageGroups: Record<string, number>;
  education: Record<string, number>;
  occupation: Record<string, number>;
  gender: Record<string, number>;
}

// Realistic Nigerian demographic distributions
export const demographicDistributions = {
  education: {
    'Secondary': 0.35,
    'Tertiary': 0.28,
    'Postgraduate': 0.12,
    'Primary': 0.15,
    'Undefined': 0.10
  },
  occupation: {
    'Public Sector': 0.18,
    'Private Sector': 0.22,
    'Student': 0.15,
    'Self-Employed': 0.20,
    'Professional Services': 0.08,
    'Technology': 0.05,
    'Agriculture': 0.08,
    'Unemployed': 0.04
  },
  ageGroups: {
    '18-25': 0.25,
    '26-35': 0.30,
    '36-45': 0.20,
    '46-55': 0.15,
    '56-65': 0.07,
    '65+': 0.03
  },
  gender: {
    'Male': 0.52,
    'Female': 0.46,
    'Non-Binary': 0.01,
    'Undefined': 0.01
  }
};

// Demographic sentiment patterns based on Nigerian political context
export const demographicSentimentPatterns = {
  education: {
    'Secondary': { baseScore: 0.45, variance: 0.15 },
    'Tertiary': { baseScore: 0.55, variance: 0.12 },
    'Postgraduate': { baseScore: 0.62, variance: 0.10 },
    'Primary': { baseScore: 0.38, variance: 0.18 },
    'Undefined': { baseScore: 0.50, variance: 0.20 }
  },
  occupation: {
    'Public Sector': { baseScore: 0.58, politicalAwareness: 0.85 },
    'Private Sector': { baseScore: 0.52, economicFocus: 0.78 },
    'Student': { baseScore: 0.48, socialMediaActivity: 0.90 },
    'Technology': { baseScore: 0.65, digitalEngagement: 0.95 },
    'Self-Employed': { baseScore: 0.42, economicConcerns: 0.82 },
    'Professional Services': { baseScore: 0.60, politicalEngagement: 0.75 },
    'Agriculture': { baseScore: 0.35, ruralConcerns: 0.88 },
    'Unemployed': { baseScore: 0.25, economicAnxiety: 0.95 },
    'Undefined': { baseScore: 0.50, uncertainty: 0.70 }
  },
  ageGroups: {
    '18-25': { 
      socialMediaUsage: 0.92, 
      politicalEngagement: 0.65,
      baseScore: 0.48,
      variance: 0.20
    },
    '26-35': { 
      economicConcerns: 0.85, 
      familyFocus: 0.70,
      baseScore: 0.52,
      variance: 0.15
    },
    '36-45': { 
      careerStability: 0.78, 
      communityInvolvement: 0.72,
      baseScore: 0.55,
      variance: 0.12
    },
    '46-55': { 
      establishedViews: 0.82, 
      politicalExperience: 0.80,
      baseScore: 0.58,
      variance: 0.10
    },
    '56-65': { 
      traditionalValues: 0.88, 
      stabilityPreference: 0.85,
      baseScore: 0.60,
      variance: 0.08
    },
    '65+': { 
      conservativeViews: 0.90, 
      experienceWeight: 0.92,
      baseScore: 0.62,
      variance: 0.06
    },
    'Undefined': {
      uncertainty: 0.80,
      baseScore: 0.50,
      variance: 0.25
    }
  },
  gender: {
    'Male': { baseScore: 0.51, variance: 0.15 },
    'Female': { baseScore: 0.49, variance: 0.15 },
    'Non-Binary': { baseScore: 0.45, variance: 0.20 },
    'Undefined': { baseScore: 0.50, variance: 0.25 }
  }
};

// Generate demographic classification for a politician
export const generateDemographicClassification = (politicianId: string): DemographicClassification => {
  const politicianIndex = parseInt(politicianId.split('_')[1] || '1');
  const hasFullData = Math.random() > 0.22; // 78% have demographic data
  
  if (!hasFullData) {
    return {
      education: { level: 'Undefined', confidence: 0.0 },
      occupation: { sector: 'Undefined', confidence: 0.0 },
      ageGroup: { range: 'Undefined', confidence: 0.0 },
      gender: { classification: 'Undefined', confidence: 0.0 }
    };
  }
  
  // Generate realistic demographic data based on distributions
  const educationRand = (politicianIndex * 0.123) % 1;
  const occupationRand = (politicianIndex * 0.456) % 1;
  const ageRand = (politicianIndex * 0.789) % 1;
  const genderRand = (politicianIndex * 0.321) % 1;
  
  // Determine education level
  let educationLevel: DemographicClassification['education']['level'] = 'Secondary';
  let cumulative = 0;
  for (const [level, probability] of Object.entries(demographicDistributions.education)) {
    cumulative += probability;
    if (educationRand <= cumulative) {
      educationLevel = level as DemographicClassification['education']['level'];
      break;
    }
  }
  
  // Determine occupation
  let occupationSector: DemographicClassification['occupation']['sector'] = 'Private Sector';
  cumulative = 0;
  for (const [sector, probability] of Object.entries(demographicDistributions.occupation)) {
    cumulative += probability;
    if (occupationRand <= cumulative) {
      occupationSector = sector as DemographicClassification['occupation']['sector'];
      break;
    }
  }
  
  // Determine age group
  let ageRange: DemographicClassification['ageGroup']['range'] = '26-35';
  cumulative = 0;
  for (const [range, probability] of Object.entries(demographicDistributions.ageGroups)) {
    cumulative += probability;
    if (ageRand <= cumulative) {
      ageRange = range as DemographicClassification['ageGroup']['range'];
      break;
    }
  }
  
  // Determine gender
  let genderClassification: DemographicClassification['gender']['classification'] = 'Male';
  cumulative = 0;
  for (const [gender, probability] of Object.entries(demographicDistributions.gender)) {
    cumulative += probability;
    if (genderRand <= cumulative) {
      genderClassification = gender as DemographicClassification['gender']['classification'];
      break;
    }
  }
  
  return {
    education: {
      level: educationLevel,
      confidence: 0.70 + Math.random() * 0.25,
      details: getEducationDetails(educationLevel)
    },
    occupation: {
      sector: occupationSector,
      confidence: 0.65 + Math.random() * 0.25,
      details: getOccupationDetails(occupationSector)
    },
    ageGroup: {
      range: ageRange,
      confidence: 0.75 + Math.random() * 0.20
    },
    gender: {
      classification: genderClassification,
      confidence: 0.80 + Math.random() * 0.15
    }
  };
};

// Helper functions for demographic details
const getEducationDetails = (level: string): string => {
  const details: Record<string, string[]> = {
    'Primary': ['Primary School Certificate', 'First School Leaving Certificate'],
    'Secondary': ['WAEC', 'NECO', 'Senior Secondary Certificate'],
    'Tertiary': ['Bachelor\'s Degree', 'HND', 'University Graduate'],
    'Postgraduate': ['Master\'s Degree', 'PhD', 'Professional Certification'],
    'Undefined': ['Unknown Education Level']
  };
  
  const options = details[level] || details['Undefined'];
  return options[Math.floor(Math.random() * options.length)];
};

const getOccupationDetails = (sector: string): string => {
  const details: Record<string, string[]> = {
    'Public Sector': ['Civil Servant', 'Government Employee', 'Public Service'],
    'Private Sector': ['Corporate Employee', 'Private Company', 'Business Employee'],
    'Student': ['University Student', 'Polytechnic Student', 'College Student'],
    'Technology': ['Software Developer', 'IT Professional', 'Tech Worker'],
    'Self-Employed': ['Business Owner', 'Entrepreneur', 'Freelancer'],
    'Professional Services': ['Lawyer', 'Doctor', 'Consultant', 'Accountant'],
    'Agriculture': ['Farmer', 'Agricultural Worker', 'Agribusiness'],
    'Unemployed': ['Job Seeker', 'Unemployed', 'Between Jobs'],
    'Undefined': ['Unknown Occupation']
  };
  
  const options = details[sector] || details['Undefined'];
  return options[Math.floor(Math.random() * options.length)];
};
// Generate demographic sentiment breakdown for a politician
export const generateDemographicBreakdown = (politicianId: string): DemographicSentimentData => {
  const classification = generateDemographicClassification(politicianId);
  
  // Generate sentiment scores for each demographic dimension
  const ageGroupSentiment = generateAgeGroupSentiment(politicianId, classification);
  const educationSentiment = generateEducationSentiment(politicianId, classification);
  const occupationSentiment = generateOccupationSentiment(politicianId, classification);
  const genderSentiment = generateGenderSentiment(politicianId, classification);
  
  return {
    ageGroups: ageGroupSentiment,
    education: educationSentiment,
    occupation: occupationSentiment,
    gender: genderSentiment
  };
};

// Generate age group sentiment distribution
const generateAgeGroupSentiment = (
  politicianId: string, 
  classification: DemographicClassification
): Record<string, number> => {
  const basePattern = demographicSentimentPatterns.ageGroups[classification.ageGroup.range];
  const baseScore = basePattern?.baseScore || 0.50;
  const variance = basePattern?.variance || 0.15;
  
  const sentiment: Record<string, number> = {};
  
  // Generate sentiment for each age group with realistic variations
  Object.keys(demographicSentimentPatterns.ageGroups).forEach(ageGroup => {
    if (ageGroup === 'Undefined') return;
    
    const pattern = demographicSentimentPatterns.ageGroups[ageGroup];
    let score = pattern.baseScore;
    
    // Adjust based on politician's actual age group
    if (ageGroup === classification.ageGroup.range) {
      score = baseScore + (Math.random() - 0.5) * variance;
    } else {
      // Cross-demographic appeal calculation
      const ageDifference = Math.abs(
        getAgeGroupIndex(ageGroup) - getAgeGroupIndex(classification.ageGroup.range)
      );
      const appealFactor = Math.max(0.3, 1 - (ageDifference * 0.15));
      score = baseScore * appealFactor + (Math.random() - 0.5) * 0.1;
    }
    
    sentiment[ageGroup] = Math.max(0, Math.min(1, score));
  });
  
  return sentiment;
};

// Generate education sentiment distribution
const generateEducationSentiment = (
  politicianId: string,
  classification: DemographicClassification
): Record<string, number> => {
  const basePattern = demographicSentimentPatterns.education[classification.education.level];
  const baseScore = basePattern?.baseScore || 0.50;
  const variance = basePattern?.variance || 0.15;
  
  const sentiment: Record<string, number> = {};
  
  Object.keys(demographicSentimentPatterns.education).forEach(educationLevel => {
    if (educationLevel === 'Undefined') return;
    
    const pattern = demographicSentimentPatterns.education[educationLevel];
    let score = pattern.baseScore;
    
    if (educationLevel === classification.education.level) {
      score = baseScore + (Math.random() - 0.5) * variance;
    } else {
      // Education level appeal calculation
      const levelDifference = Math.abs(
        getEducationLevelIndex(educationLevel) - getEducationLevelIndex(classification.education.level)
      );
      const appealFactor = Math.max(0.4, 1 - (levelDifference * 0.12));
      score = baseScore * appealFactor + (Math.random() - 0.5) * 0.08;
    }
    
    sentiment[educationLevel] = Math.max(0, Math.min(1, score));
  });
  
  return sentiment;
};

// Generate occupation sentiment distribution
const generateOccupationSentiment = (
  politicianId: string,
  classification: DemographicClassification
): Record<string, number> => {
  const basePattern = demographicSentimentPatterns.occupation[classification.occupation.sector];
  const baseScore = basePattern?.baseScore || 0.50;
  
  const sentiment: Record<string, number> = {};
  
  Object.keys(demographicSentimentPatterns.occupation).forEach(occupationSector => {
    if (occupationSector === 'Undefined') return;
    
    const pattern = demographicSentimentPatterns.occupation[occupationSector];
    let score = pattern.baseScore;
    
    if (occupationSector === classification.occupation.sector) {
      score = baseScore + (Math.random() - 0.5) * 0.12;
    } else {
      // Occupation sector appeal calculation
      const sectorAffinity = getOccupationAffinity(
        classification.occupation.sector, 
        occupationSector
      );
      score = baseScore * sectorAffinity + (Math.random() - 0.5) * 0.08;
    }
    
    sentiment[occupationSector] = Math.max(0, Math.min(1, score));
  });
  
  return sentiment;
};

// Generate gender sentiment distribution
const generateGenderSentiment = (
  politicianId: string,
  classification: DemographicClassification
): Record<string, number> => {
  const basePattern = demographicSentimentPatterns.gender[classification.gender.classification];
  const baseScore = basePattern?.baseScore || 0.50;
  const variance = basePattern?.variance || 0.15;
  
  const sentiment: Record<string, number> = {};
  
  Object.keys(demographicSentimentPatterns.gender).forEach(gender => {
    if (gender === 'Undefined') return;
    
    const pattern = demographicSentimentPatterns.gender[gender];
    let score = pattern.baseScore;
    
    if (gender === classification.gender.classification) {
      score = baseScore + (Math.random() - 0.5) * variance;
    } else {
      // Cross-gender appeal
      score = baseScore * 0.92 + (Math.random() - 0.5) * 0.1;
    }
    
    sentiment[gender] = Math.max(0, Math.min(1, score));
  });
  
  return sentiment;
};

// Helper functions
const getAgeGroupIndex = (ageGroup: string): number => {
  const ageGroups = ['18-25', '26-35', '36-45', '46-55', '56-65', '65+'];
  return ageGroups.indexOf(ageGroup);
};

const getEducationLevelIndex = (level: string): number => {
  const levels = ['Primary', 'Secondary', 'Tertiary', 'Postgraduate'];
  return levels.indexOf(level);
};

const getOccupationAffinity = (sector1: string, sector2: string): number => {
  // Define occupation sector affinities
  const affinities: Record<string, Record<string, number>> = {
    'Public Sector': {
      'Professional Services': 0.8,
      'Private Sector': 0.7,
      'Technology': 0.6,
      'Student': 0.5,
      'Self-Employed': 0.4,
      'Agriculture': 0.3,
      'Unemployed': 0.2
    },
    'Technology': {
      'Professional Services': 0.9,
      'Private Sector': 0.8,
      'Student': 0.7,
      'Public Sector': 0.6,
      'Self-Employed': 0.5,
      'Agriculture': 0.2,
      'Unemployed': 0.3
    },
    'Student': {
      'Technology': 0.8,
      'Professional Services': 0.7,
      'Private Sector': 0.6,
      'Public Sector': 0.5,
      'Self-Employed': 0.4,
      'Agriculture': 0.3,
      'Unemployed': 0.6
    }
    // Add more affinities as needed
  };
  
  return affinities[sector1]?.[sector2] || 0.5;
};

// Export utility functions
export const demographicDataUtils = {
  generateDemographicClassification,
  generateDemographicBreakdown,
  demographicDistributions,
  demographicSentimentPatterns
};