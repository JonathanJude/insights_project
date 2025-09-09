import { useNotification } from '../stores/uiStore';

// Error types for better error categorization
export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  CLIENT_ERROR = 'CLIENT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface APIError {
  type: ErrorType;
  code: string;
  message: string;
  details?: unknown;
  statusCode?: number;
  timestamp: string;
}

export interface ErrorHandlerOptions {
  showNotification?: boolean;
  logError?: boolean;
  retryable?: boolean;
  fallbackMessage?: string;
}

// Error classification utility
export const classifyError = (error: unknown): APIError => {
  const timestamp = new Date().toISOString();
  
  // Handle fetch/network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: ErrorType.NETWORK_ERROR,
      code: 'NETWORK_FETCH_FAILED',
      message: 'Unable to connect to the server. Please check your internet connection.',
      timestamp
    };
  }
  
  // Handle Response errors (from fetch API)
  if (error instanceof Response) {
    const statusCode = error.status;
    
    if (statusCode >= 400 && statusCode < 500) {
      return {
        type: statusCode === 401 ? ErrorType.AUTHENTICATION_ERROR :
              statusCode === 403 ? ErrorType.AUTHORIZATION_ERROR :
              statusCode === 404 ? ErrorType.NOT_FOUND_ERROR :
              ErrorType.CLIENT_ERROR,
        code: `HTTP_${statusCode}`,
        message: getHTTPErrorMessage(statusCode),
        statusCode,
        timestamp
      };
    }
    
    if (statusCode >= 500) {
      return {
        type: ErrorType.SERVER_ERROR,
        code: `HTTP_${statusCode}`,
        message: 'Server error occurred. Please try again later.',
        statusCode,
        timestamp
      };
    }
  }
  
  // Handle JavaScript errors
  if (error instanceof Error) {
    // Chunk loading errors (common in SPAs)
    if (error.message.includes('ChunkLoadError') || error.message.includes('Loading chunk')) {
      return {
        type: ErrorType.CLIENT_ERROR,
        code: 'CHUNK_LOAD_ERROR',
        message: 'Application update required. Please refresh the page.',
        timestamp
      };
    }
    
    // Network errors
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      return {
        type: ErrorType.NETWORK_ERROR,
        code: 'NETWORK_ERROR',
        message: 'Network connection failed. Please check your internet connection.',
        timestamp
      };
    }
    
    return {
      type: ErrorType.UNKNOWN_ERROR,
      code: error.name || 'UNKNOWN_ERROR',
      message: error.message || 'An unexpected error occurred',
      details: error.stack,
      timestamp
    };
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return {
      type: ErrorType.UNKNOWN_ERROR,
      code: 'STRING_ERROR',
      message: error,
      timestamp
    };
  }
  
  // Handle unknown error types
  return {
    type: ErrorType.UNKNOWN_ERROR,
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    details: error,
    timestamp
  };
};

// HTTP status code to user-friendly message mapping
const getHTTPErrorMessage = (statusCode: number): string => {
  switch (statusCode) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'Authentication required. Please log in and try again.';
    case 403:
      return 'Access denied. You don\'t have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 408:
      return 'Request timeout. Please try again.';
    case 409:
      return 'Conflict occurred. The resource may have been modified.';
    case 422:
      return 'Invalid data provided. Please check your input.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Internal server error. Please try again later.';
    case 502:
      return 'Service temporarily unavailable. Please try again later.';
    case 503:
      return 'Service unavailable. Please try again later.';
    case 504:
      return 'Request timeout. The server took too long to respond.';
    default:
      return `Server error (${statusCode}). Please try again later.`;
  }
};

// Error handler class for consistent error handling
export class ErrorHandler {
  private static instance: ErrorHandler;
  
  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }
  
  handle(error: unknown, options: ErrorHandlerOptions = {}): APIError {
    const {
      showNotification = true,
      logError = true,
      fallbackMessage
    } = options;
    
    const apiError = classifyError(error);
    
    // Override message if fallback is provided
    if (fallbackMessage) {
      apiError.message = fallbackMessage;
    }
    
    // Log error if enabled
    if (logError) {
      console.error('Error handled:', apiError, error);
      
      // In production, send to error reporting service
      if (import.meta.env.PROD) {
        this.reportError(apiError, error);
      }
    }
    
    // Show notification if enabled
    if (showNotification) {
      this.showErrorNotification(apiError);
    }
    
    return apiError;
  }
  
  private showErrorNotification(apiError: APIError): void {
    // We can't use hooks in a class, so we'll provide a static method
    // that components can call with the notification function
  }
  
  private reportError(apiError: APIError, originalError: unknown): void {
    // In a real application, send to error reporting service
    // Example: Sentry, LogRocket, Bugsnag, etc.
    console.log('Would report error to service:', apiError, originalError);
  }
  
  // Utility method to check if error is retryable
  isRetryable(error: APIError): boolean {
    const retryableTypes = [
      ErrorType.NETWORK_ERROR,
      ErrorType.SERVER_ERROR
    ];
    
    const retryableStatusCodes = [408, 429, 500, 502, 503, 504];
    
    return retryableTypes.includes(error.type) || 
           (error.statusCode && retryableStatusCodes.includes(error.statusCode));
  }
  
  // Get retry delay based on error type
  getRetryDelay(error: APIError, attempt: number): number {
    if (error.statusCode === 429) {
      // Rate limiting - exponential backoff
      return Math.min(1000 * Math.pow(2, attempt), 30000);
    }
    
    if (error.type === ErrorType.NETWORK_ERROR) {
      // Network errors - shorter delay
      return Math.min(500 * attempt, 5000);
    }
    
    // Default exponential backoff
    return Math.min(1000 * Math.pow(2, attempt), 10000);
  }
}

// Hook for using error handler in components
export const useErrorHandler = () => {
  const notification = useNotification();
  const errorHandler = ErrorHandler.getInstance();
  
  const handleError = (error: unknown, options: ErrorHandlerOptions = {}) => {
    const apiError = errorHandler.handle(error, { ...options, showNotification: false });
    
    // Show notification using the hook
    if (options.showNotification !== false) {
      const title = getErrorTitle(apiError.type);
      notification.error(title, apiError.message);
    }
    
    return apiError;
  };
  
  const handleSuccess = (message: string, title: string = 'Success') => {
    notification.success(title, message);
  };
  
  const isRetryable = (error: APIError) => errorHandler.isRetryable(error);
  const getRetryDelay = (error: APIError, attempt: number) => errorHandler.getRetryDelay(error, attempt);
  
  return {
    handleError,
    handleSuccess,
    isRetryable,
    getRetryDelay,
    classifyError
  };
};

// Helper function to get appropriate error title
const getErrorTitle = (errorType: ErrorType): string => {
  switch (errorType) {
    case ErrorType.NETWORK_ERROR:
      return 'Connection Error';
    case ErrorType.API_ERROR:
      return 'API Error';
    case ErrorType.VALIDATION_ERROR:
      return 'Validation Error';
    case ErrorType.AUTHENTICATION_ERROR:
      return 'Authentication Required';
    case ErrorType.AUTHORIZATION_ERROR:
      return 'Access Denied';
    case ErrorType.NOT_FOUND_ERROR:
      return 'Not Found';
    case ErrorType.SERVER_ERROR:
      return 'Server Error';
    case ErrorType.CLIENT_ERROR:
      return 'Application Error';
    default:
      return 'Error';
  }
};

// Utility function for retry logic
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  getDelay: (attempt: number) => number = (attempt) => 1000 * attempt
): Promise<T> => {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      const apiError = classifyError(error);
      const errorHandler = ErrorHandler.getInstance();
      
      // Don't retry if error is not retryable
      if (!errorHandler.isRetryable(apiError)) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxAttempts) {
        throw error;
      }
      
      // Wait before retrying
      const delay = getDelay(attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};