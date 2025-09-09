// Export all mock data and helper functions
export * from './politicians';
export * from './sentimentData';

// Re-export specific items for convenience
export {
    getPoliticiansByGender, getPoliticiansByParty,
    getPoliticiansByState, getTrendingPoliticians, mockPoliticians, searchPoliticians
} from './politicians';

export {
    generateFilteredDemographicsData,
    generatePartyDemographicsData, generateSentimentInsights, generateTrendPoints, getPartyInsights,
    getPlatformSentiment, getSentimentInsightsByPolitician, mockDashboardStats, mockPartyInsights, mockPlatformSentiment, mockTrendingPoliticians
} from './sentimentData';

// Enhanced mock API delay function with realistic patterns
export const mockApiDelay = (ms: number = 500, variance: number = 0.3): Promise<void> => {
  // Add realistic variance to simulate network conditions
  const actualDelay = ms + (Math.random() - 0.5) * 2 * variance * ms;
  const clampedDelay = Math.max(50, Math.min(actualDelay, ms * 3)); // Clamp between 50ms and 3x base delay
  
  return new Promise(resolve => setTimeout(resolve, clampedDelay));
};

// Enhanced mock error responses with realistic error scenarios
export const mockApiError = (
  message: string = 'API Error', 
  status: number = 500,
  errorType: 'network' | 'server' | 'timeout' | 'validation' | 'auth' = 'server'
) => {
  const errorMessages = {
    network: 'Network connection failed. Please check your internet connection.',
    server: 'Internal server error. Our team has been notified.',
    timeout: 'Request timed out. The server is taking too long to respond.',
    validation: 'Invalid request data. Please check your input and try again.',
    auth: 'Authentication failed. Please log in again.'
  };
  
  const statusCodes = {
    network: 0,
    server: 500,
    timeout: 408,
    validation: 400,
    auth: 401
  };
  
  const finalMessage = message === 'API Error' ? errorMessages[errorType] : message;
  const finalStatus = status === 500 ? statusCodes[errorType] : status;
  
  const error = new Error(finalMessage) as Error & { 
    status: number; 
    response: { 
      status: number; 
      data: { 
        message: string; 
        error: boolean; 
        errorType: string;
        timestamp: string;
        requestId: string;
      } 
    } 
  };
  
  error.status = finalStatus;
  error.response = {
    status: finalStatus,
    data: { 
      message: finalMessage, 
      error: true,
      errorType,
      timestamp: new Date().toISOString(),
      requestId: `req_${Math.random().toString(36).substr(2, 9)}`
    }
  };
  
  return Promise.reject(error);
};

// Simulate realistic error scenarios based on conditions
export const simulateRealisticErrors = (
  endpoint: string,
  errorRate: number = 0.05 // 5% error rate by default
): Promise<void> => {
  if (Math.random() < errorRate) {
    const errorTypes: Array<'network' | 'server' | 'timeout'> = ['network', 'server', 'timeout'];
    const randomErrorType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
    
    // Different endpoints have different error patterns
    if (endpoint.includes('search') && Math.random() < 0.3) {
      return mockApiError('Search service temporarily unavailable', 503, 'server');
    }
    
    if (endpoint.includes('insights') && Math.random() < 0.2) {
      return mockApiError('Analytics service overloaded', 429, 'server');
    }
    
    return mockApiError(undefined, undefined, randomErrorType);
  }
  
  return Promise.resolve();
};

// Mock pagination helper
export const mockPaginate = <T>(data: T[], page: number = 1, limit: number = 10): {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
} => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const items = data.slice(startIndex, endIndex);
  
  return {
    data: items,
    pagination: {
      page,
      limit,
      total: data.length,
      totalPages: Math.ceil(data.length / limit),
      hasNext: endIndex < data.length,
      hasPrev: page > 1
    }
  };
};

// Enhanced mock search with filters and edge case handling
export const mockSearchWithFilters = <T extends Record<string, unknown>>(
  data: T[],
  filters: Record<string, string | number | boolean | string[] | undefined | null>,
  searchFields: (keyof T)[]
): T[] => {
  // Handle edge cases
  if (!data || data.length === 0) return [];
  if (!filters || Object.keys(filters).length === 0) return data;
  
  let filteredData = [...data];

  // Apply search query with enhanced matching
  if (filters.query && typeof filters.query === 'string' && searchFields.length > 0) {
    const query = filters.query.toLowerCase().trim();
    
    if (query.length === 0) {
      // Empty query after trim - return all data
      return filteredData;
    }
    
    filteredData = filteredData.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        if (!value) return false;
        
        const stringValue = String(value).toLowerCase();
        
        // Enhanced matching: exact match, starts with, contains, and fuzzy matching
        if (stringValue === query) return true; // Exact match (highest priority)
        if (stringValue.startsWith(query)) return true; // Starts with (high priority)
        if (stringValue.includes(query)) return true; // Contains (medium priority)
        
        // Simple fuzzy matching for typos (basic Levenshtein-like)
        if (query.length > 3) {
          const words = stringValue.split(' ');
          return words.some(word => {
            if (word.length < 3) return false;
            let matches = 0;
            const minLength = Math.min(word.length, query.length);
            for (let i = 0; i < minLength; i++) {
              if (word[i] === query[i]) matches++;
            }
            return matches / minLength > 0.7; // 70% character match
          });
        }
        
        return false;
      })
    );
  }

  // Apply other filters with enhanced validation
  Object.entries(filters).forEach(([key, value]) => {
    if (key === 'query') return; // Already handled above
    
    if (value === undefined || value === null || value === '') return;
    
    if (Array.isArray(value)) {
      if (value.length === 0) return; // Empty array means no filter
      
      filteredData = filteredData.filter(item => {
        const itemValue = item[key];
        if (itemValue === undefined || itemValue === null) return false;
        
        // Handle both single values and arrays in the item
        if (Array.isArray(itemValue)) {
          return itemValue.some(iv => value.includes(iv));
        } else {
          return value.includes(itemValue as string);
        }
      });
    } else {
      filteredData = filteredData.filter(item => {
        const itemValue = item[key];
        if (itemValue === undefined || itemValue === null) return false;
        
        // Handle different value types
        if (typeof value === 'boolean') {
          return Boolean(itemValue) === value;
        } else if (typeof value === 'number') {
          return Number(itemValue) === value;
        } else {
          return String(itemValue) === String(value);
        }
      });
    }
  });

  return filteredData;
};

// Enhanced data validation utilities
export const validateMockData = <T extends Record<string, unknown>>(
  data: T[],
  requiredFields: (keyof T)[]
): { valid: T[]; invalid: T[]; errors: string[] } => {
  const valid: T[] = [];
  const invalid: T[] = [];
  const errors: string[] = [];
  
  data.forEach((item, index) => {
    const missingFields = requiredFields.filter(field => 
      item[field] === undefined || item[field] === null || item[field] === ''
    );
    
    if (missingFields.length === 0) {
      valid.push(item);
    } else {
      invalid.push(item);
      errors.push(`Item at index ${index} missing fields: ${missingFields.join(', ')}`);
    }
  });
  
  return { valid, invalid, errors };
};

// Data consistency checker
export const checkDataConsistency = <T extends Record<string, unknown>>(
  data: T[],
  consistencyRules: Array<{
    name: string;
    check: (item: T) => boolean;
    message: string;
  }>
): { passed: T[]; failed: Array<{ item: T; failedRules: string[] }> } => {
  const passed: T[] = [];
  const failed: Array<{ item: T; failedRules: string[] }> = [];
  
  data.forEach(item => {
    const failedRules = consistencyRules
      .filter(rule => !rule.check(item))
      .map(rule => `${rule.name}: ${rule.message}`);
    
    if (failedRules.length === 0) {
      passed.push(item);
    } else {
      failed.push({ item, failedRules });
    }
  });
  
  return { passed, failed };
};