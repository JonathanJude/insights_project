// Export all mock data and helper functions
export * from './politicians';
export * from './sentimentData';

// Re-export specific items for convenience
export {
  mockPoliticians,
  getPoliticiansByParty,
  getPoliticiansByState,
  getPoliticiansByGender,
  getTrendingPoliticians,
  searchPoliticians
} from './politicians';

export {
  generateSentimentInsights,
  mockPartyInsights,
  mockDashboardStats,
  mockTrendingPoliticians,
  mockPlatformSentiment,
  generateTrendPoints,
  getSentimentInsightsByPolitician,
  getPartyInsights,
  getPlatformSentiment
} from './sentimentData';

// Mock API delay function for realistic testing
export const mockApiDelay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Mock error responses for testing error states
export const mockApiError = (message: string = 'API Error', status: number = 500) => {
  const error = new Error(message) as Error & { status: number; response: { status: number; data: { message: string; error: boolean } } };
  error.status = status;
  error.response = {
    status,
    data: { message, error: true }
  };
  return Promise.reject(error);
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

// Mock search with filters
export const mockSearchWithFilters = <T extends Record<string, unknown>>(
  data: T[],
  filters: Record<string, string | number | boolean | string[] | undefined | null>,
  searchFields: (keyof T)[]
): T[] => {
  let filteredData = [...data];

  // Apply search query if provided
  if (filters.query && typeof filters.query === 'string' && searchFields.length > 0) {
    const query = filters.query.toLowerCase();
    filteredData = filteredData.filter(item =>
      searchFields.some(field => {
        const value = item[field];
        return value && String(value).toLowerCase().includes(query);
      })
    );
  }

  // Apply other filters
  Object.entries(filters).forEach(([key, value]) => {
    if (key !== 'query' && value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value) && value.length > 0) {
        filteredData = filteredData.filter(item => value.includes(item[key] as string));
      } else if (!Array.isArray(value)) {
        filteredData = filteredData.filter(item => item[key] === value);
      }
    }
  });

  return filteredData;
};