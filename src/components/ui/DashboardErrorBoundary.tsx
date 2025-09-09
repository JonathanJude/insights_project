import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { useNotification } from '../../stores/uiStore';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  errorInfo?: React.ErrorInfo;
}

// Default error fallback component
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetError 
}) => {
  const notification = useNotification();

  const handleRetry = () => {
    resetError();
    notification.success('Retrying', 'The application has been reset');
  };

  const handleReload = () => {
    window.location.reload();
  };

  const getErrorMessage = (error: Error): string => {
    // Provide user-friendly messages for common errors
    if (error.message.includes('ChunkLoadError')) {
      return 'The application needs to be updated. Please refresh the page.';
    }
    
    if (error.message.includes('Network Error')) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    
    if (error.message.includes('Failed to fetch')) {
      return 'Data loading failed. This might be a temporary issue.';
    }
    
    if (error.name === 'TypeError') {
      return 'A technical error occurred while processing your request.';
    }
    
    return 'An unexpected error occurred. Our team has been notified.';
  };

  const getErrorGuidance = (error: Error): string => {
    if (error.message.includes('ChunkLoadError')) {
      return 'Try refreshing the page to get the latest version of the application.';
    }
    
    if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
      return 'Check your internet connection and try again. If the problem persists, the server might be temporarily unavailable.';
    }
    
    return 'Try refreshing the page or contact support if the problem continues.';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {getErrorMessage(error)}
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-700 rounded-md p-3 mb-6">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>What you can do:</strong>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {getErrorGuidance(error)}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Try Again
            </button>
            
            <button
              onClick={handleReload}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Refresh Page
            </button>
          </div>
          
          {import.meta.env.DEV && (
            <details className="mt-6 text-left">
              <summary className="text-sm text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
                Technical Details
              </summary>
              <div className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto">
                <div className="mb-2">
                  <strong>Error:</strong> {error.name}
                </div>
                <div className="mb-2">
                  <strong>Message:</strong> {error.message}
                </div>
                {error.stack && (
                  <div>
                    <strong>Stack:</strong>
                    <pre className="mt-1 whitespace-pre-wrap">{error.stack}</pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

class DashboardErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { 
      hasError: true, 
      error 
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details
    console.error('Dashboard Error Boundary caught an error:', error, errorInfo);
    
    // Store error info in state
    this.setState({ errorInfo });
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // In a real application, you would send this to an error reporting service
    // Example: Sentry, LogRocket, Bugsnag, etc.
    if (import.meta.env.PROD) {
      // logErrorToService(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
          errorInfo={this.state.errorInfo}
        />
      );
    }

    return this.props.children;
  }
}

export default DashboardErrorBoundary;
export type { ErrorFallbackProps };
