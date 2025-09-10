// System and Configuration Enums
export enum ErrorTypes {
  DATA_NOT_FOUND = 'Data not found',
  VALIDATION_ERROR = 'Validation error',
  NETWORK_ERROR = 'Network error',
  PARSING_ERROR = 'Parsing error',
  REFERENCE_ERROR = 'Reference error',
  TIMEOUT_ERROR = 'Timeout error',
  PERMISSION_ERROR = 'Permission error',
  RATE_LIMIT_ERROR = 'Rate limit error'
}

export enum DataQualityLevels {
  EXCELLENT = 'Excellent',
  GOOD = 'Good',
  FAIR = 'Fair',
  POOR = 'Poor',
  UNKNOWN = 'Unknown'
}

export enum StorageKeys {
  THEME = 'insight-dashboard-theme',
  SEARCH_HISTORY = 'insight-dashboard-search-history',
  RECENTLY_VIEWED = 'insight-dashboard-recently-viewed',
  FILTER_PREFERENCES = 'insight-dashboard-filter-preferences',
  USER_SETTINGS = 'insight-dashboard-user-settings',
  CACHE_DATA = 'insight-dashboard-cache-data',
  FEATURE_FLAGS = 'insight-dashboard-feature-flags',
  ERROR_LOG = 'insight-dashboard-error-log'
}

export enum CacheStrategies {
  MEMORY = 'memory',
  LOCAL_STORAGE = 'localStorage',
  SESSION_STORAGE = 'sessionStorage',
  INDEXED_DB = 'indexedDB'
}

export enum UpdateFrequencies {
  REAL_TIME = 'realTime',
  EVERY_MINUTE = 'everyMinute',
  EVERY_5_MINUTES = 'every5Minutes',
  EVERY_15_MINUTES = 'every15Minutes',
  HOURLY = 'hourly',
  DAILY = 'daily'
}

export enum LogLevels {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

export enum EnvironmentTypes {
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  STAGING = 'staging',
  PRODUCTION = 'production'
}

export enum ApiEndpoints {
  POLITICIANS = '/api/politicians',
  PARTIES = '/api/parties',
  STATES = '/api/states',
  SENTIMENT = '/api/sentiment',
  ANALYTICS = '/api/analytics',
  SEARCH = '/api/search',
  EXPORT = '/api/export'
}

export enum HttpMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE'
}

export enum HttpStatusCodes {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504
}

// Validation functions for system enums
export const SystemEnumValidators = {
  isValidErrorType: (value: string): value is ErrorTypes => {
    return Object.values(ErrorTypes).includes(value as ErrorTypes);
  },

  isValidDataQualityLevel: (value: string): value is DataQualityLevels => {
    return Object.values(DataQualityLevels).includes(value as DataQualityLevels);
  },

  isValidStorageKey: (value: string): value is StorageKeys => {
    return Object.values(StorageKeys).includes(value as StorageKeys);
  },

  isValidCacheStrategy: (value: string): value is CacheStrategies => {
    return Object.values(CacheStrategies).includes(value as CacheStrategies);
  },

  isValidUpdateFrequency: (value: string): value is UpdateFrequencies => {
    return Object.values(UpdateFrequencies).includes(value as UpdateFrequencies);
  },

  isValidLogLevel: (value: string): value is LogLevels => {
    return Object.values(LogLevels).includes(value as LogLevels);
  },

  isValidEnvironmentType: (value: string): value is EnvironmentTypes => {
    return Object.values(EnvironmentTypes).includes(value as EnvironmentTypes);
  },

  isValidApiEndpoint: (value: string): value is ApiEndpoints => {
    return Object.values(ApiEndpoints).includes(value as ApiEndpoints);
  },

  isValidHttpMethod: (value: string): value is HttpMethods => {
    return Object.values(HttpMethods).includes(value as HttpMethods);
  },

  isValidHttpStatusCode: (value: number): value is HttpStatusCodes => {
    return Object.values(HttpStatusCodes).includes(value as HttpStatusCodes);
  }
};

// Helper functions for getting system enum options
export const SystemEnumHelpers = {
  getErrorTypeOptions: () => Object.values(ErrorTypes).map(error => ({ 
    value: error, 
    label: error
  })),
  
  getDataQualityLevelOptions: () => Object.values(DataQualityLevels).map(level => ({ 
    value: level, 
    label: level
  })),
  
  getStorageKeyOptions: () => Object.values(StorageKeys).map(key => ({ 
    value: key, 
    label: key.replace('insight-dashboard-', '').replace(/-/g, ' ')
  })),
  
  getCacheStrategyOptions: () => Object.values(CacheStrategies).map(strategy => ({ 
    value: strategy, 
    label: strategy.charAt(0).toUpperCase() + strategy.slice(1)
  })),
  
  getUpdateFrequencyOptions: () => Object.values(UpdateFrequencies).map(freq => ({ 
    value: freq, 
    label: freq.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
  })),
  
  getLogLevelOptions: () => Object.values(LogLevels).map(level => ({ 
    value: level, 
    label: level.toUpperCase()
  })),
  
  getEnvironmentTypeOptions: () => Object.values(EnvironmentTypes).map(env => ({ 
    value: env, 
    label: env.charAt(0).toUpperCase() + env.slice(1)
  })),
  
  getApiEndpointOptions: () => Object.values(ApiEndpoints).map(endpoint => ({ 
    value: endpoint, 
    label: endpoint.replace('/api/', '').charAt(0).toUpperCase() + endpoint.replace('/api/', '').slice(1)
  })),
  
  getHttpMethodOptions: () => Object.values(HttpMethods).map(method => ({ 
    value: method, 
    label: method
  }))
};

// Utility functions for system operations
export const SystemUtils = {
  getDataQualityScore: (level: DataQualityLevels): number => {
    const scores = {
      [DataQualityLevels.EXCELLENT]: 5,
      [DataQualityLevels.GOOD]: 4,
      [DataQualityLevels.FAIR]: 3,
      [DataQualityLevels.POOR]: 2,
      [DataQualityLevels.UNKNOWN]: 1
    };
    return scores[level];
  },

  getLogLevelPriority: (level: LogLevels): number => {
    const priorities = {
      [LogLevels.DEBUG]: 1,
      [LogLevels.INFO]: 2,
      [LogLevels.WARN]: 3,
      [LogLevels.ERROR]: 4,
      [LogLevels.FATAL]: 5
    };
    return priorities[level];
  },

  isSuccessStatusCode: (code: number): boolean => {
    return code >= 200 && code < 300;
  },

  isClientErrorStatusCode: (code: number): boolean => {
    return code >= 400 && code < 500;
  },

  isServerErrorStatusCode: (code: number): boolean => {
    return code >= 500 && code < 600;
  },

  getUpdateFrequencyMs: (frequency: UpdateFrequencies): number => {
    const intervals = {
      [UpdateFrequencies.REAL_TIME]: 0,
      [UpdateFrequencies.EVERY_MINUTE]: 60 * 1000,
      [UpdateFrequencies.EVERY_5_MINUTES]: 5 * 60 * 1000,
      [UpdateFrequencies.EVERY_15_MINUTES]: 15 * 60 * 1000,
      [UpdateFrequencies.HOURLY]: 60 * 60 * 1000,
      [UpdateFrequencies.DAILY]: 24 * 60 * 60 * 1000
    };
    return intervals[frequency];
  }
};