import React, { Component, ErrorInfo, ReactNode } from 'react';

export interface DataErrorInfo {
  errorId: string;
  timestamp: Date;
  componentStack: string;
  errorBoundary: string;
  dataContext?: {
    dataType?: string;
    operation?: string;
    payload?: any;
  };
  userAgent: string;
  url: string;
}

export interface DataErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  retryCount: number;
  isRecovering: boolean;
}

export interface DataErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: DataErrorInfo) => void;
  maxRetries?: number;
  dataType?: string;
  operation?: string;
  enableRecovery?: boolean;
  recoveryDelay?: number;
}

export class DataErrorBoundary extends Component<DataErrorBoundaryProps, DataErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: DataErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      retryCount: 0,
      isRecovering: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<DataErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const dataErrorInfo: DataErrorInfo = {
      errorId: this.state.errorId,
      timestamp: new Date(),
      componentStack: errorInfo.componentStack,
      errorBoundary: 'DataErrorBoundary',
      dataContext: {
        dataType: this.props.dataType,
        operation: this.props.operation
      },
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.setState({ errorInfo });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Data Error Boundary - ${this.props.dataType || 'Unknown'}`);
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Data Context:', dataErrorInfo.dataContext);
      console.groupEnd();
    }

    // Report error to monitoring service
    this.reportError(error, dataErrorInfo);

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, dataErrorInfo);
    }

    // Don't automatically schedule recovery - let user trigger it manually
  }

  private reportError = (error: Error, errorInfo: DataErrorInfo) => {
    // In a real application, this would send to an error reporting service
    // For now, we'll store in localStorage for debugging
    try {
      const errorLog = {
        ...errorInfo,
        message: error.message,
        stack: error.stack
      };

      const existingErrors = JSON.parse(localStorage.getItem('data-error-log') || '[]');
      existingErrors.push(errorLog);
      
      // Keep only last 50 errors
      if (existingErrors.length > 50) {
        existingErrors.splice(0, existingErrors.length - 50);
      }

      localStorage.setItem('data-error-log', JSON.stringify(existingErrors));
    } catch (storageError) {
      console.warn('Failed to store error log:', storageError);
    }
  };

  private scheduleRecovery = () => {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    this.setState({ isRecovering: true });

    const delay = this.props.recoveryDelay || 2000;
    this.retryTimeoutId = setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
        isRecovering: false
      }));
    }, delay);
  };

  private handleManualRetry = () => {
    if (this.state.retryCount < (this.props.maxRetries || 3)) {
      this.scheduleRecovery();
    }
  };

  private handleReportIssue = () => {
    const errorDetails = {
      errorId: this.state.errorId,
      message: this.state.error?.message,
      dataType: this.props.dataType,
      operation: this.props.operation,
      timestamp: new Date().toISOString()
    };

    // In a real app, this would open a support ticket or feedback form
    console.log('Report issue:', errorDetails);
    
    // For now, copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2))
      .then(() => alert('Error details copied to clipboard'))
      .catch(() => console.log('Error details:', errorDetails));
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.state.isRecovering) {
        return (
          <div className="flex items-center justify-center p-8 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-yellow-800 mb-2">Recovering...</h3>
              <p className="text-yellow-600">
                Attempting to recover from the error. Please wait...
              </p>
            </div>
          </div>
        );
      }

      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 m-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                Data Loading Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  {this.props.dataType ? `Failed to load ${this.props.dataType} data` : 'A data loading error occurred'}.
                  {this.props.operation && ` Operation: ${this.props.operation}`}
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <details className="mt-2">
                    <summary className="cursor-pointer font-medium">Technical Details</summary>
                    <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono">
                      <p><strong>Error:</strong> {this.state.error?.message}</p>
                      <p><strong>Error ID:</strong> {this.state.errorId}</p>
                      <p><strong>Retry Count:</strong> {this.state.retryCount}</p>
                    </div>
                  </details>
                )}
              </div>
              <div className="mt-4 flex space-x-3">
                {this.state.retryCount < (this.props.maxRetries || 3) && (
                  <button
                    onClick={this.handleManualRetry}
                    className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-medium transition-colors"
                  >
                    Try Again ({(this.props.maxRetries || 3) - this.state.retryCount} attempts left)
                  </button>
                )}
                <button
                  onClick={this.handleReportIssue}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                >
                  Report Issue
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

    return this.props.children;
  }
}

// Higher-order component for wrapping components with data error boundary
export function withDataErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<DataErrorBoundaryProps, 'children'>
) {
  const WithDataErrorBoundaryComponent = (props: P) => (
    <DataErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </DataErrorBoundary>
  );

  WithDataErrorBoundaryComponent.displayName = `withDataErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return WithDataErrorBoundaryComponent;
}