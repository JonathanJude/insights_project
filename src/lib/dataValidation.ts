import type { Politician, SentimentInsight, TrendPoint } from '../types';

// Data validation utilities for mock data system
export interface ValidationResult<T> {
  isValid: boolean;
  data: T[];
  errors: ValidationError[];
  warnings: ValidationWarning[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
    errorRate: number;
  };
}

export interface ValidationError {
  type: 'missing_field' | 'invalid_type' | 'invalid_value' | 'constraint_violation';
  field: string;
  message: string;
  itemIndex: number;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  type: 'data_quality' | 'consistency' | 'performance';
  message: string;
  affectedItems: number[];
  recommendation: string;
}

// Politician data validation
export const validatePoliticianData = (politicians: Politician[]): ValidationResult<Politician> => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const validPoliticians: Politician[] = [];
  
  politicians.forEach((politician, index) => {
    let isValidItem = true;
    
    // Required field validation
    const requiredFields: (keyof Politician)[] = [
      'id', 'name', 'firstName', 'lastName', 'party', 'position', 
      'state', 'politicalLevel', 'gender', 'ageGroup', 'isActive'
    ];
    
    requiredFields.forEach(field => {
      if (politician[field] === undefined || politician[field] === null || politician[field] === '') {
        errors.push({
          type: 'missing_field',
          field: String(field),
          message: `Missing required field: ${String(field)}`,
          itemIndex: index,
          severity: 'error'
        });
        isValidItem = false;
      }
    });
    
    // Type validation
    if (politician.id && typeof politician.id !== 'string') {
      errors.push({
        type: 'invalid_type',
        field: 'id',
        message: 'ID must be a string',
        itemIndex: index,
        severity: 'error'
      });
      isValidItem = false;
    }
    
    if (politician.name && typeof politician.name !== 'string') {
      errors.push({
        type: 'invalid_type',
        field: 'name',
        message: 'Name must be a string',
        itemIndex: index,
        severity: 'error'
      });
      isValidItem = false;
    }
    
    // Value validation
    if (politician.recentSentiment) {
      const sentiment = politician.recentSentiment;
      
      if (sentiment.score < -1 || sentiment.score > 1) {
        errors.push({
          type: 'invalid_value',
          field: 'recentSentiment.score',
          message: 'Sentiment score must be between -1 and 1',
          itemIndex: index,
          severity: 'error'
        });
        isValidItem = false;
      }
      
      if (sentiment.mentionCount < 0) {
        errors.push({
          type: 'invalid_value',
          field: 'recentSentiment.mentionCount',
          message: 'Mention count cannot be negative',
          itemIndex: index,
          severity: 'error'
        });
        isValidItem = false;
      }
    }
    
    // Social media handles validation
    if (politician.socialMediaHandles) {
      const handles = politician.socialMediaHandles;
      
      if (handles.twitter && !handles.twitter.startsWith('@')) {
        errors.push({
          type: 'invalid_value',
          field: 'socialMediaHandles.twitter',
          message: 'Twitter handle should start with @',
          itemIndex: index,
          severity: 'warning'
        });
      }
    }
    
    if (isValidItem) {
      validPoliticians.push(politician);
    }
  });
  
  // Data quality warnings
  const duplicateIds = findDuplicates(politicians.map(p => p.id));
  if (duplicateIds.length > 0) {
    warnings.push({
      type: 'data_quality',
      message: `Found duplicate politician IDs: ${duplicateIds.join(', ')}`,
      affectedItems: [],
      recommendation: 'Ensure all politician IDs are unique'
    });
  }
  
  // Consistency checks
  const partyDistribution = getPartyDistribution(validPoliticians);
  const minPartyCount = Math.min(...Object.values(partyDistribution));
  const maxPartyCount = Math.max(...Object.values(partyDistribution));
  
  if (maxPartyCount > minPartyCount * 5) {
    warnings.push({
      type: 'consistency',
      message: 'Uneven party distribution detected',
      affectedItems: [],
      recommendation: 'Consider balancing politician representation across parties'
    });
  }
  
  return {
    isValid: errors.filter(e => e.severity === 'error').length === 0,
    data: validPoliticians,
    errors,
    warnings,
    summary: {
      total: politicians.length,
      valid: validPoliticians.length,
      invalid: politicians.length - validPoliticians.length,
      errorRate: (politicians.length - validPoliticians.length) / politicians.length
    }
  };
};

// Sentiment data validation
export const validateSentimentData = (sentimentData: SentimentInsight[]): ValidationResult<SentimentInsight> => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const validData: SentimentInsight[] = [];
  
  sentimentData.forEach((insight, index) => {
    let isValidItem = true;
    
    // Required fields
    const requiredFields: (keyof SentimentInsight)[] = [
      'id', 'politicianId', 'platform', 'sentimentScore', 'sentimentLabel', 
      'confidence', 'mentionCount', 'date', 'timeframe'
    ];
    
    requiredFields.forEach(field => {
      if (insight[field] === undefined || insight[field] === null) {
        errors.push({
          type: 'missing_field',
          field: String(field),
          message: `Missing required field: ${String(field)}`,
          itemIndex: index,
          severity: 'error'
        });
        isValidItem = false;
      }
    });
    
    // Value range validation
    if (insight.sentimentScore < -1 || insight.sentimentScore > 1) {
      errors.push({
        type: 'invalid_value',
        field: 'sentimentScore',
        message: 'Sentiment score must be between -1 and 1',
        itemIndex: index,
        severity: 'error'
      });
      isValidItem = false;
    }
    
    if (insight.confidence < 0 || insight.confidence > 1) {
      errors.push({
        type: 'invalid_value',
        field: 'confidence',
        message: 'Confidence must be between 0 and 1',
        itemIndex: index,
        severity: 'error'
      });
      isValidItem = false;
    }
    
    if (insight.mentionCount < 0) {
      errors.push({
        type: 'invalid_value',
        field: 'mentionCount',
        message: 'Mention count cannot be negative',
        itemIndex: index,
        severity: 'error'
      });
      isValidItem = false;
    }
    
    // Date validation
    if (insight.date && isNaN(new Date(insight.date).getTime())) {
      errors.push({
        type: 'invalid_value',
        field: 'date',
        message: 'Invalid date format',
        itemIndex: index,
        severity: 'error'
      });
      isValidItem = false;
    }
    
    if (isValidItem) {
      validData.push(insight);
    }
  });
  
  return {
    isValid: errors.filter(e => e.severity === 'error').length === 0,
    data: validData,
    errors,
    warnings,
    summary: {
      total: sentimentData.length,
      valid: validData.length,
      invalid: sentimentData.length - validData.length,
      errorRate: (sentimentData.length - validData.length) / sentimentData.length
    }
  };
};

// Trend data validation
export const validateTrendData = (trendData: TrendPoint[]): ValidationResult<TrendPoint> => {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const validData: TrendPoint[] = [];
  
  trendData.forEach((point, index) => {
    let isValidItem = true;
    
    // Required fields
    if (!point.date || !point.value === undefined) {
      errors.push({
        type: 'missing_field',
        field: 'date or value',
        message: 'Missing required date or value field',
        itemIndex: index,
        severity: 'error'
      });
      isValidItem = false;
    }
    
    // Value validation
    if (typeof point.value !== 'number' || isNaN(point.value)) {
      errors.push({
        type: 'invalid_type',
        field: 'value',
        message: 'Value must be a valid number',
        itemIndex: index,
        severity: 'error'
      });
      isValidItem = false;
    }
    
    // Date validation
    if (point.date && isNaN(new Date(point.date).getTime())) {
      errors.push({
        type: 'invalid_value',
        field: 'date',
        message: 'Invalid date format',
        itemIndex: index,
        severity: 'error'
      });
      isValidItem = false;
    }
    
    if (isValidItem) {
      validData.push(point);
    }
  });
  
  // Check for chronological order
  const sortedData = [...validData].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  
  const isChronological = validData.every((point, index) => 
    index === 0 || new Date(point.date).getTime() >= new Date(validData[index - 1].date).getTime()
  );
  
  if (!isChronological) {
    warnings.push({
      type: 'data_quality',
      message: 'Trend data is not in chronological order',
      affectedItems: [],
      recommendation: 'Sort trend data by date for better visualization'
    });
  }
  
  return {
    isValid: errors.filter(e => e.severity === 'error').length === 0,
    data: validData,
    errors,
    warnings,
    summary: {
      total: trendData.length,
      valid: validData.length,
      invalid: trendData.length - validData.length,
      errorRate: (trendData.length - validData.length) / trendData.length
    }
  };
};

// Utility functions
const findDuplicates = (array: string[]): string[] => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  
  array.forEach(item => {
    if (seen.has(item)) {
      duplicates.add(item);
    } else {
      seen.add(item);
    }
  });
  
  return Array.from(duplicates);
};

const getPartyDistribution = (politicians: Politician[]): Record<string, number> => {
  const distribution: Record<string, number> = {};
  
  politicians.forEach(politician => {
    const party = politician.party;
    distribution[party] = (distribution[party] || 0) + 1;
  });
  
  return distribution;
};

// Data consistency checker for cross-validation
export const checkDataConsistency = (
  politicians: Politician[],
  sentimentData: SentimentInsight[]
): {
  consistent: boolean;
  issues: string[];
  recommendations: string[];
} => {
  const issues: string[] = [];
  const recommendations: string[] = [];
  
  // Check if all politicians referenced in sentiment data exist
  const politicianIds = new Set(politicians.map(p => p.id));
  const referencedIds = new Set(sentimentData.map(s => s.politicianId));
  
  const missingPoliticians = Array.from(referencedIds).filter(id => !politicianIds.has(id));
  if (missingPoliticians.length > 0) {
    issues.push(`Sentiment data references non-existent politicians: ${missingPoliticians.join(', ')}`);
    recommendations.push('Ensure all politician IDs in sentiment data have corresponding politician records');
  }
  
  // Check for politicians without sentiment data
  const politiciansWithoutSentiment = Array.from(politicianIds).filter(id => !referencedIds.has(id));
  if (politiciansWithoutSentiment.length > 0) {
    issues.push(`${politiciansWithoutSentiment.length} politicians have no sentiment data`);
    recommendations.push('Generate sentiment data for all politicians to ensure complete coverage');
  }
  
  return {
    consistent: issues.length === 0,
    issues,
    recommendations
  };
};

// Performance monitoring for data operations
export const monitorDataPerformance = <T>(
  operation: () => T,
  operationName: string
): { result: T; duration: number; memoryUsage?: number } => {
  const startTime = performance.now();
  const startMemory = (performance as any).memory?.usedJSHeapSize;
  
  const result = operation();
  
  const endTime = performance.now();
  const endMemory = (performance as any).memory?.usedJSHeapSize;
  
  const duration = endTime - startTime;
  const memoryUsage = startMemory && endMemory ? endMemory - startMemory : undefined;
  
  if (duration > 100) { // Log slow operations
    console.warn(`Slow data operation detected: ${operationName} took ${duration.toFixed(2)}ms`);
  }
  
  return {
    result,
    duration,
    memoryUsage
  };
};