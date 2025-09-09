import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import DashboardErrorBoundary from '../components/ui/DashboardErrorBoundary';
import ErrorDisplay from '../components/ui/ErrorDisplay';
import { classifyError, ErrorHandler, ErrorType, withRetry } from '../lib/errorHandling';
import { createEnhancedQueryClient } from '../lib/queryErrorHandler';

// Mock console methods to avoid noise in tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

// Component that throws an error for testing
const ErrorThrowingComponent: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error for error boundary');
  }
  return <div>No error</div>;
};

describe('Error Handling System', () => {
  describe('Error Classification', () => {
    it('should classify network errors correctly', () => {
      const networkError = new TypeError('Failed to fetch');
      const classified = classifyError(networkError);
      
      expect(classified.type).toBe(ErrorType.NETWORK_ERROR);
      expect(classified.message).toContain('connection');
    });

    it('should classify HTTP errors correctly', () => {
      const serverError = new Response(null, { status: 500 });
      const classified = classifyError(serverError);
      
      expect(classified.type).toBe(ErrorType.SERVER_ERROR);
      expect(classified.statusCode).toBe(500);
    });

    it('should classify 404 errors correctly', () => {
      const notFoundError = new Response(null, { status: 404 });
      const classified = classifyError(notFoundError);
      
      expect(classified.type).toBe(ErrorType.NOT_FOUND_ERROR);
      expect(classified.statusCode).toBe(404);
    });

    it('should classify authentication errors correctly', () => {
      const authError = new Response(null, { status: 401 });
      const classified = classifyError(authError);
      
      expect(classified.type).toBe(ErrorType.AUTHENTICATION_ERROR);
      expect(classified.statusCode).toBe(401);
    });

    it('should classify chunk load errors correctly', () => {
      const chunkError = new Error('ChunkLoadError: Loading chunk 1 failed');
      const classified = classifyError(chunkError);
      
      expect(classified.type).toBe(ErrorType.CLIENT_ERROR);
      expect(classified.code).toBe('CHUNK_LOAD_ERROR');
    });
  });

  describe('Error Handler', () => {
    it('should determine retryable errors correctly', () => {
      const errorHandler = ErrorHandler.getInstance();
      
      const networkError = classifyError(new TypeError('Failed to fetch'));
      expect(errorHandler.isRetryable(networkError)).toBe(true);
      
      const serverError = classifyError(new Response(null, { status: 500 }));
      expect(errorHandler.isRetryable(serverError)).toBe(true);
      
      const clientError = classifyError(new Response(null, { status: 400 }));
      expect(errorHandler.isRetryable(clientError)).toBe(false);
    });

    it('should calculate retry delays correctly', () => {
      const errorHandler = ErrorHandler.getInstance();
      const networkError = classifyError(new TypeError('Failed to fetch'));
      
      const delay1 = errorHandler.getRetryDelay(networkError, 1);
      const delay2 = errorHandler.getRetryDelay(networkError, 2);
      
      expect(delay2).toBeGreaterThan(delay1);
      expect(delay1).toBe(500);
      expect(delay2).toBe(1000);
    });
  });

  describe('DashboardErrorBoundary', () => {
    it('should catch and display errors', () => {
      render(
        <TestWrapper>
          <DashboardErrorBoundary>
            <ErrorThrowingComponent />
          </DashboardErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      expect(screen.getByText(/unexpected error occurred/)).toBeInTheDocument();
    });

    it('should render children when no error occurs', () => {
      render(
        <TestWrapper>
          <DashboardErrorBoundary>
            <ErrorThrowingComponent shouldThrow={false} />
          </DashboardErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText('No error')).toBeInTheDocument();
    });

    it('should provide retry functionality', async () => {
      const { rerender } = render(
        <TestWrapper>
          <DashboardErrorBoundary>
            <ErrorThrowingComponent />
          </DashboardErrorBoundary>
        </TestWrapper>
      );

      expect(screen.getByText('Something went wrong')).toBeInTheDocument();
      
      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);

      // After retry, the error boundary should reset
      rerender(
        <TestWrapper>
          <DashboardErrorBoundary>
            <ErrorThrowingComponent shouldThrow={false} />
          </DashboardErrorBoundary>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('No error')).toBeInTheDocument();
      });
    });

    it('should call onError callback when error occurs', () => {
      const onErrorSpy = vi.fn();
      
      render(
        <TestWrapper>
          <DashboardErrorBoundary onError={onErrorSpy}>
            <ErrorThrowingComponent />
          </DashboardErrorBoundary>
        </TestWrapper>
      );

      expect(onErrorSpy).toHaveBeenCalledWith(
        expect.any(Error),
        expect.any(Object)
      );
    });
  });

  describe('ErrorDisplay Component', () => {
    it('should display network error correctly', () => {
      const networkError = classifyError(new TypeError('Failed to fetch'));
      
      render(
        <TestWrapper>
          <ErrorDisplay error={networkError} />
        </TestWrapper>
      );

      expect(screen.getByText(/Unable to connect to the server/)).toBeInTheDocument();
      expect(screen.getByText(/check your internet connection/)).toBeInTheDocument();
    });

    it('should display server error correctly', () => {
      const serverError = classifyError(new Response(null, { status: 500 }));
      
      render(
        <TestWrapper>
          <ErrorDisplay error={serverError} />
        </TestWrapper>
      );

      expect(screen.getByText('Server error occurred. Please try again later.')).toBeInTheDocument();
    });

    it('should show retry button when onRetry is provided', () => {
      const networkError = classifyError(new TypeError('Failed to fetch'));
      const onRetry = vi.fn();
      
      render(
        <TestWrapper>
          <ErrorDisplay error={networkError} onRetry={onRetry} />
        </TestWrapper>
      );

      const retryButton = screen.getByText('Try Again');
      expect(retryButton).toBeInTheDocument();
      
      fireEvent.click(retryButton);
      expect(onRetry).toHaveBeenCalled();
    });

    it('should show technical details in development mode', () => {
      const originalEnv = import.meta.env.DEV;
      // @ts-ignore
      import.meta.env.DEV = true;
      
      const error = classifyError(new Error('Test error with stack'));
      
      render(
        <TestWrapper>
          <ErrorDisplay error={error} showDetails={true} />
        </TestWrapper>
      );

      expect(screen.getByText('Technical Details')).toBeInTheDocument();
      
      // @ts-ignore
      import.meta.env.DEV = originalEnv;
    });
  });

  describe('Enhanced Query Client', () => {
    it('should create query client with error handling', () => {
      const queryClient = createEnhancedQueryClient();
      
      expect(queryClient).toBeDefined();
      expect(queryClient.getDefaultOptions().queries?.retry).toBeDefined();
      expect(queryClient.getDefaultOptions().queries?.retryDelay).toBeDefined();
    });
  });

  describe('Retry Utility', () => {
    it('should retry failed operations', async () => {
      let attempts = 0;
      const failingFunction = vi.fn(async () => {
        attempts++;
        if (attempts < 3) {
          throw new TypeError('Failed to fetch');
        }
        return 'success';
      });

      const result = await withRetry(failingFunction, 3, () => 0); // No delay for tests
      
      expect(result).toBe('success');
      expect(failingFunction).toHaveBeenCalledTimes(3);
    });

    it('should not retry non-retryable errors', async () => {
      const failingFunction = vi.fn(async () => {
        throw new Response(null, { status: 400 });
      });

      await expect(withRetry(failingFunction, 3, () => 0)).rejects.toThrow();
      expect(failingFunction).toHaveBeenCalledTimes(1);
    });

    it('should respect max attempts', async () => {
      const failingFunction = vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      });

      await expect(withRetry(failingFunction, 2, () => 0)).rejects.toThrow();
      expect(failingFunction).toHaveBeenCalledTimes(2);
    });
  });
});

describe('Error Handling Integration', () => {
  it('should handle errors in query components gracefully', async () => {
    const TestComponent: React.FC = () => {
      const { data, error } = useQuery({
        queryKey: ['test'],
        queryFn: async () => {
          throw new Error('Test query error');
        }
      });

      if (error) {
        const classified = classifyError(error);
        return <ErrorDisplay error={classified} />;
      }

      return <div>{data}</div>;
    };

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/unexpected error occurred/)).toBeInTheDocument();
    });
  });
});