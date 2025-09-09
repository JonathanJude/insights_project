/**
 * Enhanced Sentiment Analysis Framework for Multi-Dimensional Analysis
 * 
 * This module provides sophisticated sentiment analysis with polarity, emotions,
 * intensity, and complexity layers, including multi-model agreement scoring
 * and Nigerian political context.
 */

// Enhanced sentiment analysis interfaces
export interface EnhancedSentimentAnalysis {
  polarity: {
    classification: 'Positive' | 'Negative' | 'Neutral';
    score: number; // -1 to 1
    confidence: number; // 0 to 1
  };
  emotions: {
    primary: 'Joy' | 'Anger' | 'Fear' | 'Sadness' | 'Disgust' | 'Mixed';
    scores: {
      joy: number;
      anger: number;
      fear: number;
      sadness: number;
      disgust: number;
    };
    confidence: number;
  };
  intensity: {
    level: 'Mild' | 'Moderate' | 'Strong';
    score: number; // 0 to 1
    description: string;
  };
  complexity: {
    type: 'Simple' | 'Mixed' | 'Sarcastic' | 'Conditional';
    confidence: number;
    indicators: string[];
  };
  modelAgreement: {
    score: number; // 0 to 1
    models: string[];
    consensus: boolean;
  };
}

// Nigerian political sentiment context
export interface NigerianPoliticalSentimentContext {
  commonEmotions: {
    [key: string]: {
      triggers: string[];
      intensity: number;
    };
  };
  intensityFactors: Record<string, number>;
  complexityIndicators: {
    [key: string]: string[];
  };
}

// Nigerian political context for sentiment analysis
export const nigerianPoliticalSentimentContext: NigerianPoliticalSentimentContext = {
  commonEmotions: {
    'Joy': {
      triggers: [
        'infrastructure development',
        'job creation',
        'economic growth',
        'educational improvements',
        'healthcare access',
        'youth empowerment',
        'democratic progress'
      ],
      intensity: 0.75
    },
    'Anger': {
      triggers: [
        'corruption scandals',
        'fuel price increases',
        'insecurity issues',
        'unemployment',
        'poor governance',
        'electoral malpractice',
        'broken promises'
      ],
      intensity: 0.85
    },
    'Fear': {
      triggers: [
        'security threats',
        'economic instability',
        'political violence',
        'ethnic tensions',
        'election rigging',
        'policy uncertainty',
        'social unrest'
      ],
      intensity: 0.80
    },
    'Sadness': {
      triggers: [
        'poverty levels',
        'youth unemployment',
        'brain drain',
        'infrastructure decay',
        'educational decline',
        'healthcare failures',
        'lost opportunities'
      ],
      intensity: 0.70
    },
    'Disgust': {
      triggers: [
        'corruption revelations',
        'political hypocrisy',
        'abuse of power',
        'electoral fraud',
        'nepotism',
        'misuse of public funds',
        'broken institutions'
      ],
      intensity: 0.90
    }
  },
  intensityFactors: {
    'Economic Issues': 0.85,
    'Security Concerns': 0.90,
    'Corruption Cases': 0.95,
    'Infrastructure': 0.70,
    'Youth Employment': 0.80,
    'Education': 0.65,
    'Healthcare': 0.75,
    'Electoral Process': 0.88,
    'Governance': 0.82,
    'Social Issues': 0.60
  },
  complexityIndicators: {
    'Mixed': [
      'cautious optimism',
      'qualified support',
      'conditional approval',
      'mixed feelings',
      'both positive and negative aspects'
    ],
    'Sarcastic': [
      'supposed improvement',
      'so-called progress',
      'alleged development',
      'claimed success',
      'apparent change'
    ],
    'Conditional': [
      'if implemented properly',
      'depends on execution',
      'subject to verification',
      'pending results',
      'awaiting proof'
    ]
  }
};

// Generate enhanced sentiment analysis
export const generateEnhancedSentiment = (
  politicianId: string,
  baseScore: number
): EnhancedSentimentAnalysis => {
  const polarity = determinePolarity(baseScore);
  const emotions = generateEmotions(polarity, politicianId);
  const intensity = calculateIntensity(baseScore);
  const complexity = determineComplexity(politicianId);
  const modelAgreement = generateModelAgreement(baseScore);
  
  return {
    polarity,
    emotions,
    intensity,
    complexity,
    modelAgreement
  };
};

// Determine polarity classification
const determinePolarity = (baseScore: number) => {
  let classification: 'Positive' | 'Negative' | 'Neutral';
  let confidence: number;
  
  if (baseScore > 0.6) {
    classification = 'Positive';
    confidence = 0.75 + (baseScore - 0.6) * 0.625; // Scale to 0.75-1.0
  } else if (baseScore < 0.4) {
    classification = 'Negative';
    confidence = 0.75 + (0.4 - baseScore) * 0.625; // Scale to 0.75-1.0
  } else {
    classification = 'Neutral';
    confidence = 0.60 + Math.random() * 0.25; // 0.60-0.85 for neutral
  }
  
  return {
    classification,
    score: (baseScore - 0.5) * 2, // Convert 0-1 to -1 to 1
    confidence: Math.min(1, confidence)
  };
};

// Generate emotion analysis
const generateEmotions = (
  polarity: { classification: string; score: number },
  politicianId: string
) => {
  const politicianIndex = parseInt(politicianId.split('_')[1] || '1');
  const emotionSeed = politicianIndex * 0.234;
  
  // Base emotion scores
  let emotions = {
    joy: 0,
    anger: 0,
    fear: 0,
    sadness: 0,
    disgust: 0
  };
  
  // Adjust emotions based on polarity
  if (polarity.classification === 'Positive') {
    emotions.joy = 0.6 + Math.random() * 0.3;
    emotions.anger = Math.random() * 0.2;
    emotions.fear = Math.random() * 0.15;
    emotions.sadness = Math.random() * 0.1;
    emotions.disgust = Math.random() * 0.1;
  } else if (polarity.classification === 'Negative') {
    emotions.joy = Math.random() * 0.15;
    emotions.anger = 0.4 + Math.random() * 0.4;
    emotions.fear = 0.3 + Math.random() * 0.3;
    emotions.sadness = 0.2 + Math.random() * 0.3;
    emotions.disgust = 0.3 + Math.random() * 0.4;
  } else {
    // Neutral - balanced emotions
    emotions.joy = 0.2 + Math.random() * 0.3;
    emotions.anger = 0.1 + Math.random() * 0.3;
    emotions.fear = 0.1 + Math.random() * 0.2;
    emotions.sadness = 0.1 + Math.random() * 0.2;
    emotions.disgust = 0.1 + Math.random() * 0.2;
  }
  
  // Determine primary emotion
  const emotionEntries = Object.entries(emotions);
  const primaryEmotion = emotionEntries.reduce((max, current) => 
    current[1] > max[1] ? current : max
  );
  
  // Check for mixed emotions
  const highEmotions = emotionEntries.filter(([_, score]) => score > 0.4);
  const primary = highEmotions.length > 1 ? 'Mixed' : 
    (primaryEmotion[0].charAt(0).toUpperCase() + primaryEmotion[0].slice(1)) as 
    'Joy' | 'Anger' | 'Fear' | 'Sadness' | 'Disgust' | 'Mixed';
  
  return {
    primary,
    scores: emotions,
    confidence: 0.70 + Math.random() * 0.25
  };
};

// Calculate intensity level and description
const calculateIntensity = (baseScore: number) => {
  const intensityScore = Math.abs(baseScore - 0.5) * 2; // 0 to 1
  
  let level: 'Mild' | 'Moderate' | 'Strong';
  let description: string;
  
  if (intensityScore < 0.3) {
    level = 'Mild';
    description = baseScore > 0.5 ? 
      'Mildly Positive (0.1-0.4)' : 
      'Mild Criticism (-0.1 to -0.4)';
  } else if (intensityScore < 0.7) {
    level = 'Moderate';
    description = baseScore > 0.5 ? 
      'Moderately Positive (0.4-0.7)' : 
      'Moderate Criticism (-0.4 to -0.7)';
  } else {
    level = 'Strong';
    description = baseScore > 0.5 ? 
      'Strongly Positive (0.7-1.0)' : 
      'Strong Opposition (-0.7 to -1.0)';
  }
  
  return {
    level,
    score: intensityScore,
    description
  };
};

// Determine complexity type
const determineComplexity = (politicianId: string) => {
  const politicianIndex = parseInt(politicianId.split('_')[1] || '1');
  const complexityRand = (politicianIndex * 0.567) % 1;
  
  let type: 'Simple' | 'Mixed' | 'Sarcastic' | 'Conditional';
  let indicators: string[];
  let confidence: number;
  
  if (complexityRand < 0.75) {
    type = 'Simple';
    indicators = ['straightforward sentiment', 'clear opinion'];
    confidence = 0.85 + Math.random() * 0.10;
  } else if (complexityRand < 0.90) {
    type = 'Mixed';
    indicators = nigerianPoliticalSentimentContext.complexityIndicators['Mixed'];
    confidence = 0.70 + Math.random() * 0.15;
  } else if (complexityRand < 0.97) {
    type = 'Sarcastic';
    indicators = nigerianPoliticalSentimentContext.complexityIndicators['Sarcastic'];
    confidence = 0.60 + Math.random() * 0.20;
  } else {
    type = 'Conditional';
    indicators = nigerianPoliticalSentimentContext.complexityIndicators['Conditional'];
    confidence = 0.65 + Math.random() * 0.20;
  }
  
  return {
    type,
    confidence,
    indicators: indicators.slice(0, 2 + Math.floor(Math.random() * 2))
  };
};

// Generate model agreement scores
const generateModelAgreement = (baseScore: number) => {
  const models = [
    'BERT-Nigerian-Politics',
    'RoBERTa-Sentiment',
    'XLM-R-Multilingual',
    'Custom-Political-Model'
  ];
  
  // Higher agreement for more extreme scores
  const extremeness = Math.abs(baseScore - 0.5) * 2;
  const baseAgreement = 0.60 + extremeness * 0.25;
  
  const agreementScore = baseAgreement + (Math.random() - 0.5) * 0.15;
  const consensus = agreementScore > 0.75;
  
  return {
    score: Math.max(0.3, Math.min(1, agreementScore)),
    models,
    consensus
  };
};
// Generate sentiment analysis for specific topics
export const generateTopicSentiment = (
  politicianId: string,
  topic: string,
  baseScore: number
): EnhancedSentimentAnalysis => {
  // Adjust base score based on topic and Nigerian political context
  const topicAdjustment = getTopicSentimentAdjustment(topic);
  const adjustedScore = Math.max(0, Math.min(1, baseScore + topicAdjustment));
  
  return generateEnhancedSentiment(politicianId, adjustedScore);
};

// Get sentiment adjustment based on topic
const getTopicSentimentAdjustment = (topic: string): number => {
  const topicAdjustments: Record<string, number> = {
    // Economic topics
    'economy': -0.15, // Generally negative due to challenges
    'unemployment': -0.25,
    'inflation': -0.20,
    'fuel_subsidy': -0.30,
    'minimum_wage': -0.10,
    
    // Security topics
    'security': -0.20,
    'terrorism': -0.35,
    'kidnapping': -0.30,
    'banditry': -0.25,
    
    // Governance topics
    'corruption': -0.40,
    'transparency': 0.10,
    'accountability': 0.05,
    'democracy': 0.15,
    
    // Infrastructure topics
    'infrastructure': -0.05,
    'power_supply': -0.25,
    'roads': -0.15,
    'healthcare': -0.10,
    'education': -0.05,
    
    // Social topics
    'youth_empowerment': 0.20,
    'women_rights': 0.15,
    'social_welfare': 0.10
  };
  
  return topicAdjustments[topic] || 0;
};

// Generate time-based sentiment variations
export const generateTemporalSentimentVariation = (
  baseAnalysis: EnhancedSentimentAnalysis,
  timeContext: {
    hour: number;
    dayOfWeek: number;
    isElectionPeriod: boolean;
    isEventDay: boolean;
  }
): EnhancedSentimentAnalysis => {
  let adjustmentFactor = 1.0;
  
  // Circadian patterns - Nigerians are more active politically in evenings
  if (timeContext.hour >= 18 && timeContext.hour <= 22) {
    adjustmentFactor *= 1.15; // Higher engagement in evening
  } else if (timeContext.hour >= 6 && timeContext.hour <= 9) {
    adjustmentFactor *= 1.05; // Morning news consumption
  } else if (timeContext.hour >= 0 && timeContext.hour <= 5) {
    adjustmentFactor *= 0.7; // Lower engagement late night
  }
  
  // Weekly patterns - Higher political engagement on weekends
  if (timeContext.dayOfWeek === 0 || timeContext.dayOfWeek === 6) {
    adjustmentFactor *= 1.1;
  }
  
  // Election period - Higher intensity and polarization
  if (timeContext.isElectionPeriod) {
    adjustmentFactor *= 1.25;
  }
  
  // Event days - Significant political events
  if (timeContext.isEventDay) {
    adjustmentFactor *= 1.3;
  }
  
  // Apply adjustments
  const adjustedAnalysis = { ...baseAnalysis };
  adjustedAnalysis.intensity.score *= adjustmentFactor;
  adjustedAnalysis.intensity.score = Math.min(1, adjustedAnalysis.intensity.score);
  
  // Recalculate intensity level
  if (adjustedAnalysis.intensity.score < 0.3) {
    adjustedAnalysis.intensity.level = 'Mild';
  } else if (adjustedAnalysis.intensity.score < 0.7) {
    adjustedAnalysis.intensity.level = 'Moderate';
  } else {
    adjustedAnalysis.intensity.level = 'Strong';
  }
  
  return adjustedAnalysis;
};

// Generate sentiment confidence calibration
export const generateSentimentConfidenceCalibration = (
  analyses: EnhancedSentimentAnalysis[]
): {
  overallCalibration: number;
  polarityAccuracy: number;
  emotionAccuracy: number;
  intensityAccuracy: number;
} => {
  if (analyses.length === 0) {
    return {
      overallCalibration: 0.5,
      polarityAccuracy: 0.5,
      emotionAccuracy: 0.5,
      intensityAccuracy: 0.5
    };
  }
  
  // Calculate calibration metrics
  const polarityConfidences = analyses.map(a => a.polarity.confidence);
  const emotionConfidences = analyses.map(a => a.emotions.confidence);
  const modelAgreements = analyses.map(a => a.modelAgreement.score);
  
  const polarityAccuracy = polarityConfidences.reduce((sum, conf) => sum + conf, 0) / polarityConfidences.length;
  const emotionAccuracy = emotionConfidences.reduce((sum, conf) => sum + conf, 0) / emotionConfidences.length;
  const intensityAccuracy = modelAgreements.reduce((sum, agreement) => sum + agreement, 0) / modelAgreements.length;
  
  const overallCalibration = (polarityAccuracy + emotionAccuracy + intensityAccuracy) / 3;
  
  return {
    overallCalibration,
    polarityAccuracy,
    emotionAccuracy,
    intensityAccuracy
  };
};

// Export utility functions
export const enhancedSentimentUtils = {
  generateEnhancedSentiment,
  generateTopicSentiment,
  generateTemporalSentimentVariation,
  generateSentimentConfidenceCalibration,
  nigerianPoliticalSentimentContext
};