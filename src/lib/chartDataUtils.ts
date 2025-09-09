import { format } from 'date-fns';
import { generateTrendPoints } from '../mock';
import type { ChartFilter, TrendPoint } from '../types';

// Enhanced filtered chart data generation with better edge case handling
export const generateFilteredChartData = (filter: ChartFilter): TrendPoint[] => {
  // Validate input filter
  if (!filter || typeof filter !== 'object') {
    console.warn('Invalid filter provided, using default values');
    filter = { timeRange: '30d' };
  }
  
  const { timeRange } = filter;
  
  // Determine the number of days based on time range with validation
  let days: number;
  
  switch (timeRange) {
    case '7d':
      days = 7;
      break;
    case '30d':
      days = 30;
      break;
    case '3m':
      days = 90;
      break;
    case '1y':
      days = 365;
      break;
    default:
      console.warn(`Unknown time range: ${timeRange}, defaulting to 30 days`);
      days = 30;
  }
  
  // Generate base trend points with error handling
  let trendPoints: TrendPoint[];
  try {
    trendPoints = generateTrendPoints(days);
  } catch (error) {
    console.error('Error generating trend points:', error);
    // Fallback to minimal data
    trendPoints = [{
      date: new Date().toISOString().split('T')[0],
      value: 0,
      metadata: { mentionCount: 0, engagementCount: 0 }
    }];
  }
  
  // Validate generated trend points
  if (!Array.isArray(trendPoints) || trendPoints.length === 0) {
    console.warn('No trend points generated, returning empty array');
    return [];
  }
  
  // Apply platform filtering with validation
  if (filter.platforms && Array.isArray(filter.platforms) && filter.platforms.length > 0) {
    const validPlatforms = filter.platforms.filter(p => typeof p === 'string' && p.length > 0);
    
    if (validPlatforms.length > 0) {
      const platformMultiplier = Math.min(1, validPlatforms.length / 4); // Normalize to max 4 platforms
      
      trendPoints = trendPoints.map(point => {
        const baseValue = point.value || 0;
        const variation = 0.8 + Math.random() * 0.4; // 0.8 to 1.2 multiplier
        const adjustedValue = baseValue * variation * platformMultiplier;
        
        return {
          ...point,
          value: Math.max(-1, Math.min(1, adjustedValue)), // Clamp between -1 and 1
          metadata: {
            ...point.metadata,
            mentionCount: Math.max(0, Math.floor((point.metadata?.mentionCount || 0) * platformMultiplier)),
            platforms: validPlatforms
          }
        };
      });
    }
  }
  
  // Apply party filtering with validation
  if (filter.parties && Array.isArray(filter.parties) && filter.parties.length > 0) {
    const validParties = filter.parties.filter(p => typeof p === 'string' && p.length > 0);
    
    if (validParties.length > 0) {
      const partyMultiplier = Math.min(1, validParties.length / 5); // Normalize to max 5 parties
      
      trendPoints = trendPoints.map(point => {
        const baseValue = point.value || 0;
        const variation = 0.7 + Math.random() * 0.6; // 0.7 to 1.3 multiplier
        const adjustedValue = baseValue * variation * partyMultiplier;
        
        return {
          ...point,
          value: Math.max(-1, Math.min(1, adjustedValue)), // Clamp between -1 and 1
          metadata: {
            ...point.metadata,
            mentionCount: Math.max(0, Math.floor((point.metadata?.mentionCount || 0) * partyMultiplier)),
            parties: validParties
          }
        };
      });
    }
  }
  
  // Apply state filtering with validation
  if (filter.states && Array.isArray(filter.states) && filter.states.length > 0) {
    const validStates = filter.states.filter(s => typeof s === 'string' && s.length > 0);
    
    if (validStates.length > 0) {
      const stateMultiplier = Math.min(1, validStates.length / 10); // Normalize to max 10 states
      
      trendPoints = trendPoints.map(point => {
        const baseValue = point.value || 0;
        const variation = 0.9 + Math.random() * 0.2; // 0.9 to 1.1 multiplier
        const adjustedValue = baseValue * variation * stateMultiplier;
        
        return {
          ...point,
          value: Math.max(-1, Math.min(1, adjustedValue)), // Clamp between -1 and 1
          metadata: {
            ...point.metadata,
            mentionCount: Math.max(0, Math.floor((point.metadata?.mentionCount || 0) * stateMultiplier)),
            states: validStates
          }
        };
      });
    }
  }
  
  // Final validation and cleanup
  return trendPoints.filter(point => {
    // Remove invalid points
    return point && 
           typeof point.value === 'number' && 
           !isNaN(point.value) && 
           point.date && 
           typeof point.date === 'string';
  });
};

// Enhanced chart data conversion with better error handling and validation
export const convertToChartData = (trendPoints: TrendPoint[], timeRange: ChartFilter['timeRange']) => {
  // Validate inputs
  if (!Array.isArray(trendPoints)) {
    console.error('Invalid trendPoints provided to convertToChartData');
    return [];
  }
  
  if (trendPoints.length === 0) {
    return [];
  }
  
  return trendPoints
    .filter(point => {
      // Filter out invalid points
      if (!point || typeof point !== 'object') return false;
      if (typeof point.value !== 'number' || isNaN(point.value)) return false;
      if (!point.date || typeof point.date !== 'string') return false;
      
      // Validate date
      const date = new Date(point.date);
      if (isNaN(date.getTime())) return false;
      
      return true;
    })
    .map(point => {
      let dateFormat: string;
      
      // Adjust date format based on time range
      switch (timeRange) {
        case '7d':
          dateFormat = 'MMM dd';
          break;
        case '30d':
          dateFormat = 'MMM dd';
          break;
        case '3m':
          dateFormat = 'MMM yyyy';
          break;
        case '1y':
          dateFormat = 'MMM yyyy';
          break;
        default:
          dateFormat = 'MMM dd';
      }
      
      // Safe date formatting with fallback
      let formattedDate: string;
      try {
        formattedDate = format(new Date(point.date), dateFormat);
      } catch (error) {
        console.warn(`Error formatting date ${point.date}:`, error);
        formattedDate = point.date.split('T')[0]; // Fallback to ISO date
      }
      
      // Ensure value is within expected range
      const clampedValue = Math.max(-1, Math.min(1, point.value));
      
      // Calculate sentiment metrics with validation
      const sentiment = (clampedValue + 1) * 50; // Convert -1 to 1 range to 0-100
      const mentions = Math.max(0, point.metadata?.mentionCount || 0);
      const engagement = Math.max(0, (point.metadata?.engagementCount || 0) * 100);
      
      // Calculate positive/negative/neutral percentages
      const positive = Math.max(0, clampedValue) * 100;
      const negative = Math.abs(Math.min(0, clampedValue)) * 100;
      const neutral = Math.max(0, 100 - positive - negative);
      
      // Ensure percentages add up to 100 (handle floating point precision)
      const total = positive + negative + neutral;
      const normalizedPositive = total > 0 ? (positive / total) * 100 : 0;
      const normalizedNegative = total > 0 ? (negative / total) * 100 : 0;
      const normalizedNeutral = total > 0 ? (neutral / total) * 100 : 100;
      
      return {
        date: formattedDate,
        sentiment: Math.round(sentiment * 10) / 10, // Round to 1 decimal place
        mentions,
        engagement: Math.round(engagement * 10) / 10,
        positive: Math.round(normalizedPositive * 10) / 10,
        negative: Math.round(normalizedNegative * 10) / 10,
        neutral: Math.round(normalizedNeutral * 10) / 10,
        rawValue: clampedValue // Keep original value for debugging
      };
    })
    .sort((a, b) => {
      // Sort by date to ensure chronological order
      try {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      } catch {
        return 0; // Keep original order if date parsing fails
      }
    });
};

// Get time range label for display
export const getTimeRangeLabel = (timeRange: ChartFilter['timeRange']): string => {
  switch (timeRange) {
    case '7d':
      return 'Last 7 days';
    case '30d':
      return 'Last 30 days';
    case '3m':
      return 'Last 3 months';
    case '1y':
      return 'Last year';
    default:
      return 'Last 30 days';
  }
};

// Enhanced data loading simulation with realistic patterns and error scenarios
export const simulateDataLoading = (
  ms: number = 300, 
  options: {
    variance?: number;
    errorRate?: number;
    errorType?: 'network' | 'timeout' | 'server';
  } = {}
): Promise<void> => {
  const { variance = 0.3, errorRate = 0, errorType = 'network' } = options;
  
  return new Promise((resolve, reject) => {
    // Simulate random errors
    if (errorRate > 0 && Math.random() < errorRate) {
      const errorMessages = {
        network: 'Network connection failed',
        timeout: 'Request timed out',
        server: 'Server error occurred'
      };
      
      setTimeout(() => {
        reject(new Error(errorMessages[errorType]));
      }, ms * 0.1); // Fail quickly for errors
      return;
    }
    
    // Add realistic variance to loading time
    const actualDelay = ms + (Math.random() - 0.5) * 2 * variance * ms;
    const clampedDelay = Math.max(50, Math.min(actualDelay, ms * 3));
    
    setTimeout(resolve, clampedDelay);
  });
};

// Data transformation utilities with error handling
export const safeDataTransform = <T, R>(
  data: T[],
  transformer: (item: T) => R,
  fallbackValue: R
): R[] => {
  if (!Array.isArray(data)) {
    console.warn('safeDataTransform: data is not an array');
    return [];
  }
  
  return data.map((item, index) => {
    try {
      return transformer(item);
    } catch (error) {
      console.warn(`safeDataTransform: Error transforming item at index ${index}:`, error);
      return fallbackValue;
    }
  });
};

// Validate chart data structure
export const validateChartData = (data: unknown[]): boolean => {
  if (!Array.isArray(data)) return false;
  if (data.length === 0) return true; // Empty array is valid
  
  // Check if all items have required properties
  return data.every(item => {
    if (!item || typeof item !== 'object') return false;
    
    const chartItem = item as Record<string, unknown>;
    
    // Required fields for chart data
    const requiredFields = ['date', 'sentiment'];
    return requiredFields.every(field => 
      field in chartItem && chartItem[field] !== undefined && chartItem[field] !== null
    );
  });
};

// Data aggregation utilities
export const aggregateChartData = (
  data: Array<{ date: string; value: number; [key: string]: unknown }>,
  groupBy: 'day' | 'week' | 'month'
): Array<{ date: string; value: number; count: number }> => {
  if (!Array.isArray(data) || data.length === 0) return [];
  
  const groups = new Map<string, { values: number[]; dates: string[] }>();
  
  data.forEach(item => {
    if (!item.date || typeof item.value !== 'number') return;
    
    let groupKey: string;
    try {
      const date = new Date(item.date);
      
      switch (groupBy) {
        case 'week':
          // Group by week (Monday as start of week)
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay() + 1);
          groupKey = format(weekStart, 'yyyy-MM-dd');
          break;
        case 'month':
          groupKey = format(date, 'yyyy-MM');
          break;
        case 'day':
        default:
          groupKey = format(date, 'yyyy-MM-dd');
          break;
      }
    } catch (error) {
      console.warn(`Error parsing date ${item.date}:`, error);
      return;
    }
    
    if (!groups.has(groupKey)) {
      groups.set(groupKey, { values: [], dates: [] });
    }
    
    const group = groups.get(groupKey)!;
    group.values.push(item.value);
    group.dates.push(item.date);
  });
  
  return Array.from(groups.entries())
    .map(([date, group]) => ({
      date,
      value: group.values.reduce((sum, val) => sum + val, 0) / group.values.length,
      count: group.values.length
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
};