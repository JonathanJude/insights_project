import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { ErrorHandler, ErrorType, classifyError } from './errorHandling';

// Global error handler for React Query
export const createQueryErrorHandler = (showNotifications: boolean = true) => {
  const errorHandler = ErrorHandler.getInstance();
  
  return (error: unknown) => {
    const apiError = errorHandler.handle(error, {
      showNotification: showNotifications,
      logError: true
    });
    
    // Additional handling for specific error types
    if (apiError.type === ErrorType.AUTHENTICATION_ERROR) {
      // Handle authentication errors globally
      // In a real app, you might redirect to login
      console.log('Authentication error - would redirect to login');
    }
    
    if (apiError.type === ErrorType.NETWORK_ERROR) {
      // Handle network errors - maybe show offline indicator
      console.log('Network error - would show offline indicator');
    }
  };
};

// Enhanced Query Client with error handling
export const createEnhancedQueryClient = (): QueryClient => {
  const errorHandler = createQueryErrorHandler(false); // We'll handle notifications manually
  
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: (failureCount, error) => {
          const apiError = classifyError(error);
          const handler = ErrorHandler.getInstance();
          
          // Don't retry if error is not retryable
          if (!handler.isRetryable(apiError)) {
            return false;
          }
          
          // Limit retry attempts
          return failureCount < 3;
        },
        retryDelay: (attemptIndex, error) => {
          const apiError = classifyError(error);
          const handler = ErrorHandler.getInstance();
          return handler.getRetryDelay(apiError, attemptIndex);
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: (failureCount, error) => {
          const apiError = classifyError(error);
          const handler = ErrorHandler.getInstance();
          
          // Only retry network errors for mutations
          if (apiError.type === ErrorType.NETWORK_ERROR && failureCount < 2) {
            return true;
          }
          
          return false;
        },
        retryDelay: (attemptIndex, error) => {
          const apiError = classifyError(error);
          const handler = ErrorHandler.getInstance();
          return handler.getRetryDelay(apiError, attemptIndex);
        },
      },
    },
    queryCache: new QueryCache({
      onError: errorHandler,
    }),
    mutationCache: new MutationCache({
      onError: errorHandler,
    }),
  });
};

// Hook for handling query errors in components
export const useQueryErrorHandler = () => {
  const errorHandler = ErrorHandler.getInstance();
  
  const handleQueryError = (error: unknown, context?: string) => {
    const apiError = errorHandler.handle(error, {
      showNotification: true,
      logError: true,
      fallbackMessage: context ? `Failed to ${context}` : undefined
    });
    
    return apiError;
  };
  
  const handleMutationError = (error: unknown, action?: string) => {
    const apiError = errorHandler.handle(error, {
      showNotification: true,
      logError: true,
      fallbackMessage: action ? `Failed to ${action}` : undefined
    });
    
    return apiError;
  };
  
  return {
    handleQueryError,
    handleMutationError
  };
};