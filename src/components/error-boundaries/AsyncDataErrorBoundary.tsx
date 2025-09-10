import React, { Component, ReactNode } from 'react';
import { DataErrorBoundary, DataErrorBoundaryProps } from './DataErrorBoundary';

export interface AsyncDataErrorBoundaryState {
  hasAsyncError: boolean;
  asyncError: Error | null;
  isLoading: boolean;
  loadingMessage: string;
}

export interface AsyncDataErrorBoundaryProps extends Omit<DataErrorBoundaryProps, 'children'> {
  children: ReactNode;
  loadingFallback?: ReactNode;
  onAsyncError?: (error: Error) => void;
  loadingMessage?: string;
}

/**
 * Enhanced error boundary that handles both synchronous and asynchronous errors
 * Specifically designed for data loading operations that might fail asynchronously
 */
export class AsyncDataErrorBoundary extends Component<AsyncDataErrorBoundaryProps, AsyncDataErrorBoundaryState> {
  constructor(props: AsyncDataErrorBoundaryProps) {
    super(props);
    this.state = {
      hasAsyncError: false,
      asyncError: null,
      isLoading: false,
      loadingMessage: props.loadingMessage || 'Loading data...'
    };
  }

  componentDidMount() {
    // Listen for unhandled promise rejections that might be data-related
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    // Only handle data-related promise rejections
    const error = event.reason;
    if (this.isDataRelatedError(error)) {
      event.preventDefault(); // Prevent default browser handling
      this.handleAsyncError(error);
    }
  };

  private isDataRelatedError = (error: any): boolean => {
    if (!error) return false;
    
    const errorMessage = error.message || error.toString();
    const dataRelatedKeywords = [
      'fetch',
      'network',
      'json',
      'parse',
      'schema',
      'validation',
      'data',
      'load',
      'api',
      'response'
    ];

    return dataRelatedKeywords.some(keyword => 
      errorMessage.toLowerCase().includes(keyword)
    );
  };

  private handleAsyncError = (error: Error) => {
    this.setState({
      hasAsyncError: true,
      asyncError: error,
      isLoading: false
    });

    if (this.props.onAsyncError) {
      this.props.onAsyncError(error);
    }
  };

  public setLoading = (isLoading: boolean, message?: string) => {
    this.setState({
      isLoading,
      loadingMessage: message || this.props.loadingMessage || 'Loading data...',
      hasAsyncError: false,
      asyncError: null
    });
  };

  public clearAsyncError = () => {
    this.setState({
      hasAsyncError: false,
      asyncError: null
    });
  };

  render() {
    if (this.state.isLoading) {
      if (this.props.loadingFallback) {
        return this.props.loadingFallback;
      }

      return (
        <div className="flex items-center justify-center p-8 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-blue-800 mb-2">Loading</h3>
            <p className="text-blue-600">{this.state.loadingMessage}</p>
          </div>
        </div>
      );
    }

    if (this.state.hasAsyncError) {
      return (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 m-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-orange-800">
                Async Data Error
              </h3>
              <div className="mt-2 text-sm text-orange-700">
                <p>An error occurred while loading data asynchronously.</p>
                {process.env.NODE_ENV === 'development' && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-medium">Error Details</summary>
                    <div className="mt-2 p-2 bg-orange-100 rounded text-xs font-mono">
                      <p><strong>Error:</strong> {this.state.asyncError?.message}</p>
                      <p><strong>Stack:</strong> {this.state.asyncError?.stack}</p>
                    </div>
                  </details>
                )}
              </div>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={this.clearAsyncError}
                  className="bg-orange-100 hover:bg-orange-200 text-orange-800 px-3 py-1 rounded text-sm font-medium transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm font-medium transition-colors"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <DataErrorBoundary {...this.props}>
        {this.props.children}
      </DataErrorBoundary>
    );
  }
}

// Hook for using async error boundary in functional components
export const useAsyncErrorBoundary = () => {
  const [, setError] = React.useState();
  
  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
};