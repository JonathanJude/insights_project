// Sentiment Analysis Enums
// Note: Sentiment sources (platforms like Twitter, Facebook, etc.) are now managed
// as dynamic data through the SentimentSourcesService rather than static enums.
// This allows for flexible addition/removal of platforms without code changes.
export enum SentimentLabels {
  VERY_POSITIVE = "Very Positive",
  POSITIVE = "Positive",
  NEUTRAL = "Neutral",
  NEGATIVE = "Negative",
  VERY_NEGATIVE = "Very Negative",
}

export enum EmotionTypes {
  JOY = "Joy",
  ANGER = "Anger",
  FEAR = "Fear",
  SADNESS = "Sadness",
  DISGUST = "Disgust",
  SURPRISE = "Surprise",
  MIXED = "Mixed",
}

export enum IntensityLevels {
  MILD = "Mild",
  MODERATE = "Moderate",
  STRONG = "Strong",
}

export enum ComplexityTypes {
  SIMPLE = "Simple",
  MIXED = "Mixed",
  SARCASTIC = "Sarcastic",
  CONDITIONAL = "Conditional",
}

export enum ConfidenceLevels {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  VERY_HIGH = "Very High",
}

// Note: Sentiment sources are now managed as dynamic data from backend/database
// This allows for flexible addition of new platforms without code changes

// Sentiment color mappings
export const SentimentColors = {
  [SentimentLabels.VERY_POSITIVE]: "#22c55e",
  [SentimentLabels.POSITIVE]: "#84cc16",
  [SentimentLabels.NEUTRAL]: "#6b7280",
  [SentimentLabels.NEGATIVE]: "#f97316",
  [SentimentLabels.VERY_NEGATIVE]: "#ef4444",
} as const;

// Emotion color mappings
export const EmotionColors = {
  [EmotionTypes.JOY]: "#fbbf24",
  [EmotionTypes.ANGER]: "#ef4444",
  [EmotionTypes.FEAR]: "#8b5cf6",
  [EmotionTypes.SADNESS]: "#3b82f6",
  [EmotionTypes.DISGUST]: "#10b981",
  [EmotionTypes.SURPRISE]: "#f59e0b",
  [EmotionTypes.MIXED]: "#6b7280",
} as const;

// Validation functions for sentiment enums
export const SentimentEnumValidators = {
  isValidSentimentLabel: (value: string): value is SentimentLabels => {
    return Object.values(SentimentLabels).includes(value as SentimentLabels);
  },

  isValidEmotionType: (value: string): value is EmotionTypes => {
    return Object.values(EmotionTypes).includes(value as EmotionTypes);
  },

  isValidIntensityLevel: (value: string): value is IntensityLevels => {
    return Object.values(IntensityLevels).includes(value as IntensityLevels);
  },

  isValidComplexityType: (value: string): value is ComplexityTypes => {
    return Object.values(ComplexityTypes).includes(value as ComplexityTypes);
  },

  isValidConfidenceLevel: (value: string): value is ConfidenceLevels => {
    return Object.values(ConfidenceLevels).includes(value as ConfidenceLevels);
  },

  // Note: Sentiment source validation is now handled by dynamic data validation
};

// Helper functions for getting sentiment enum options
export const SentimentEnumHelpers = {
  getSentimentLabelOptions: () =>
    Object.values(SentimentLabels).map((label) => ({
      value: label,
      label,
      color: SentimentColors[label],
    })),

  getEmotionTypeOptions: () =>
    Object.values(EmotionTypes).map((emotion) => ({
      value: emotion,
      label: emotion,
      color: EmotionColors[emotion],
    })),

  getIntensityLevelOptions: () =>
    Object.values(IntensityLevels).map((level) => ({
      value: level,
      label: level,
    })),

  getComplexityTypeOptions: () =>
    Object.values(ComplexityTypes).map((type) => ({
      value: type,
      label: type,
    })),

  getConfidenceLevelOptions: () =>
    Object.values(ConfidenceLevels).map((level) => ({
      value: level,
      label: level,
    })),

  // Note: Sentiment source options are now fetched from backend/database
};

// Utility functions for sentiment analysis
export const SentimentUtils = {
  getSentimentScore: (label: SentimentLabels): number => {
    const scores = {
      [SentimentLabels.VERY_NEGATIVE]: -2,
      [SentimentLabels.NEGATIVE]: -1,
      [SentimentLabels.NEUTRAL]: 0,
      [SentimentLabels.POSITIVE]: 1,
      [SentimentLabels.VERY_POSITIVE]: 2,
    };
    return scores[label];
  },

  getSentimentFromScore: (score: number): SentimentLabels => {
    if (score >= 1.5) return SentimentLabels.VERY_POSITIVE;
    if (score >= 0.5) return SentimentLabels.POSITIVE;
    if (score <= -1.5) return SentimentLabels.VERY_NEGATIVE;
    if (score <= -0.5) return SentimentLabels.NEGATIVE;
    return SentimentLabels.NEUTRAL;
  },

  getIntensityWeight: (intensity: IntensityLevels): number => {
    const weights = {
      [IntensityLevels.MILD]: 0.5,
      [IntensityLevels.MODERATE]: 1.0,
      [IntensityLevels.STRONG]: 1.5,
    };
    return weights[intensity];
  },

  getConfidenceWeight: (confidence: ConfidenceLevels): number => {
    const weights = {
      [ConfidenceLevels.LOW]: 0.3,
      [ConfidenceLevels.MEDIUM]: 0.6,
      [ConfidenceLevels.HIGH]: 0.9,
      [ConfidenceLevels.VERY_HIGH]: 1.0,
    };
    return weights[confidence];
  },
};
