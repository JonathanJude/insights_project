import { INFO_MESSAGES } from '../constants/messages';

/**
 * Utility functions for null-safe rendering in UI components
 */

/**
 * Safely renders a value with fallback for null/undefined
 */
export const safeRender = (
  value: any, 
  fallback: string = INFO_MESSAGES.DATA_NOT_AVAILABLE || 'N/A'
): string => {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  
  if (typeof value === 'number' && isNaN(value)) {
    return fallback;
  }
  
  return String(value);
};

/**
 * Safely renders a number with formatting
 */
export const safeRenderNumber = (
  value: number | null | undefined,
  formatter?: (num: number) => string,
  fallback: string = INFO_MESSAGES.DATA_NOT_AVAILABLE || 'N/A'
): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return fallback;
  }
  
  return formatter ? formatter(value) : String(value);
};

/**
 * Safely renders a percentage
 */
export const safeRenderPercentage = (
  value: number | null | undefined,
  decimals: number = 1,
  fallback: string = INFO_MESSAGES.DATA_NOT_AVAILABLE || 'N/A'
): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return fallback;
  }
  
  return `${value.toFixed(decimals)}%`;
};

/**
 * Checks if data is available (not null, undefined, or empty)
 */
export const isDataAvailable = (value: any): boolean => {
  if (value === null || value === undefined) {
    return false;
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return false;
  }
  
  if (typeof value === 'number' && isNaN(value)) {
    return false;
  }
  
  if (Array.isArray(value) && value.length === 0) {
    return false;
  }
  
  if (typeof value === 'object' && Object.keys(value).length === 0) {
    return false;
  }
  
  return true;
};

/**
 * Calculates data completeness score for an object
 */
export const calculateDataCompleteness = (
  data: Record<string, any>,
  requiredFields: string[] = [],
  optionalFields: string[] = []
): {
  score: number;
  completeness: number;
  missingRequired: string[];
  missingOptional: string[];
} => {
  const allFields = [...requiredFields, ...optionalFields];
  const totalFields = allFields.length;
  
  if (totalFields === 0) {
    return {
      score: 1,
      completeness: 100,
      missingRequired: [],
      missingOptional: []
    };
  }
  
  const missingRequired: string[] = [];
  const missingOptional: string[] = [];
  let availableFields = 0;
  
  allFields.forEach(field => {
    const isAvailable = isDataAvailable(data[field]);
    
    if (isAvailable) {
      availableFields++;
    } else {
      if (requiredFields.includes(field)) {
        missingRequired.push(field);
      } else {
        missingOptional.push(field);
      }
    }
  });
  
  const completeness = (availableFields / totalFields) * 100;
  
  // Score is weighted more heavily for required fields
  const requiredWeight = 0.8;
  const optionalWeight = 0.2;
  
  const requiredScore = requiredFields.length > 0 
    ? (requiredFields.length - missingRequired.length) / requiredFields.length 
    : 1;
    
  const optionalScore = optionalFields.length > 0 
    ? (optionalFields.length - missingOptional.length) / optionalFields.length 
    : 1;
  
  const score = (requiredScore * requiredWeight) + (optionalScore * optionalWeight);
  
  return {
    score: Math.max(0, Math.min(1, score)),
    completeness: Math.round(completeness),
    missingRequired,
    missingOptional
  };
};

/**
 * Formats a number for display (K, M, B suffixes)
 */
export const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined || isNaN(num)) {
    return INFO_MESSAGES.DATA_NOT_AVAILABLE || 'N/A';
  }
  
  if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(1)}B`;
  }
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`;
  }
  return num.toString();
};

/**
 * Safely gets nested object property
 */
export const safeGet = (obj: any, path: string, fallback: any = null): any => {
  try {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : fallback;
    }, obj);
  } catch {
    return fallback;
  }
};

/**
 * Creates a data quality indicator based on completeness
 */
export const getDataQualityIndicator = (completeness: number): {
  level: 'excellent' | 'good' | 'fair' | 'poor';
  color: string;
  message: string;
} => {
  if (completeness >= 90) {
    return {
      level: 'excellent',
      color: 'text-green-600',
      message: 'Excellent data quality'
    };
  } else if (completeness >= 70) {
    return {
      level: 'good',
      color: 'text-blue-600',
      message: 'Good data quality'
    };
  } else if (completeness >= 50) {
    return {
      level: 'fair',
      color: 'text-yellow-600',
      message: 'Fair data quality'
    };
  } else {
    return {
      level: 'poor',
      color: 'text-red-600',
      message: 'Poor data quality'
    };
  }
};