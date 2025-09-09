import {
    ArrowPathIcon,
    ExclamationTriangleIcon,
    HomeIcon,
    ServerIcon,
    ShieldExclamationIcon,
    WifiIcon
} from '@heroicons/react/24/outline';
import React from 'react';
import { APIError, ErrorType } from '../../lib/errorHandling';

interface ErrorDisplayProps {
  error: APIError;
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  onGoHome,
  className = '',
  size = 'md',
  showDetails = false
}) => {
  const getErrorIcon = (errorType: ErrorType) => {
    switch (errorType) {
      case ErrorType.NETWORK_ERROR:
        return WifiIcon;
      case ErrorType.SERVER_ERROR:
        return ServerIcon;
      case ErrorType.AUTHENTICATION_ERROR:
      case ErrorType.AUTHORIZATION_ERROR:
        return ShieldExclamationIcon;
      default:
        return ExclamationTriangleIcon;
    }
  };

  const getErrorColor = (errorType: ErrorType) => {
    switch (errorType) {
      case ErrorType.NETWORK_ERROR:
        return 'text-orange-600 dark:text-orange-400';
      case ErrorType.SERVER_ERROR:
        return 'text-red-600 dark:text-red-400';
      case ErrorType.AUTHENTICATION_ERROR:
      case ErrorType.AUTHORIZATION_ERROR:
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-red-600 dark:text-red-400';
    }
  };

  const getErrorBgColor = (errorType: ErrorType) => {
    switch (errorType) {
      case ErrorType.NETWORK_ERROR:
        return 'bg-orange-100 dark:bg-orange-900/20';
      case ErrorType.SERVER_ERROR:
        return 'bg-red-100 dark:bg-red-900/20';
      case ErrorType.AUTHENTICATION_ERROR:
      case ErrorType.AUTHORIZATION_ERROR:
        return 'bg-yellow-100 dark:bg-yellow-900/20';
      default:
        return 'bg-red-100 dark:bg-red-900/20';
    }
  };

  const getSizeClasses = (size: string) => {
    switch (size) {
      case 'sm':
        return {
          container: 'p-3',
          icon: 'h-5 w-5',
          title: 'text-sm font-medium',
          message: 'text-xs',
          button: 'px-2 py-1 text-xs'
        };
      case 'lg':
        return {
          container: 'p-6',
          icon: 'h-8 w-8',
          title: 'text-xl font-semibold',
          message: 'text-base',
          button: 'px-4 py-2 text-sm'
        };
      default:
        return {
          container: 'p-4',
          icon: 'h-6 w-6',
          title: 'text-lg font-medium',
          message: 'text-sm',
          button: 'px-3 py-2 text-sm'
        };
    }
  };

  const getActionGuidance = (errorType: ErrorType): string => {
    switch (errorType) {
      case ErrorType.NETWORK_ERROR:
        return 'Check your internet connection and try again.';
      case ErrorType.SERVER_ERROR:
        return 'The server is temporarily unavailable. Please try again in a few minutes.';
      case ErrorType.AUTHENTICATION_ERROR:
        return 'Please log in again to continue.';
      case ErrorType.AUTHORIZATION_ERROR:
        return 'You don\'t have permission to access this resource.';
      case ErrorType.NOT_FOUND_ERROR:
        return 'The requested resource could not be found.';
      case ErrorType.CLIENT_ERROR:
        return 'There was a problem with your request. Please try again.';
      default:
        return 'An unexpected error occurred. Please try again or contact support.';
    }
  };

  const IconComponent = getErrorIcon(error.type);
  const sizeClasses = getSizeClasses(size);
  const errorColor = getErrorColor(error.type);
  const errorBgColor = getErrorBgColor(error.type);

  return (
    <div className={`rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${sizeClasses.container} ${className}`}>
      <div className="flex items-start">
        <div className={`flex-shrink-0 rounded-full p-2 ${errorBgColor}`}>
          <IconComponent className={`${sizeClasses.icon} ${errorColor}`} />
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className={`${sizeClasses.title} text-gray-900 dark:text-white`}>
            {error.message}
          </h3>
          
          <p className={`mt-1 ${sizeClasses.message} text-gray-600 dark:text-gray-300`}>
            {getActionGuidance(error.type)}
          </p>
          
          {showDetails && error.details && (
            <details className="mt-2">
              <summary className={`${sizeClasses.message} text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-300`}>
                Technical Details
              </summary>
              <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto">
                <div className="mb-1">
                  <strong>Error Code:</strong> {error.code}
                </div>
                <div className="mb-1">
                  <strong>Type:</strong> {error.type}
                </div>
                {error.statusCode && (
                  <div className="mb-1">
                    <strong>Status:</strong> {error.statusCode}
                  </div>
                )}
                <div>
                  <strong>Timestamp:</strong> {new Date(error.timestamp).toLocaleString()}
                </div>
                {typeof error.details === 'string' && (
                  <div className="mt-2">
                    <strong>Details:</strong>
                    <pre className="mt-1 whitespace-pre-wrap">{error.details}</pre>
                  </div>
                )}
              </div>
            </details>
          )}
          
          <div className="mt-3 flex flex-wrap gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className={`inline-flex items-center ${sizeClasses.button} font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md transition-colors`}
              >
                <ArrowPathIcon className="h-4 w-4 mr-1" />
                Try Again
              </button>
            )}
            
            {onGoHome && (
              <button
                onClick={onGoHome}
                className={`inline-flex items-center ${sizeClasses.button} font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md transition-colors`}
              >
                <HomeIcon className="h-4 w-4 mr-1" />
                Go Home
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Specialized error components for common scenarios
export const NetworkErrorDisplay: React.FC<{
  onRetry?: () => void;
  className?: string;
}> = ({ onRetry, className }) => (
  <ErrorDisplay
    error={{
      type: ErrorType.NETWORK_ERROR,
      code: 'NETWORK_ERROR',
      message: 'Connection Failed',
      timestamp: new Date().toISOString()
    }}
    onRetry={onRetry}
    className={className}
  />
);

export const ServerErrorDisplay: React.FC<{
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
}> = ({ onRetry, onGoHome, className }) => (
  <ErrorDisplay
    error={{
      type: ErrorType.SERVER_ERROR,
      code: 'SERVER_ERROR',
      message: 'Server Unavailable',
      timestamp: new Date().toISOString()
    }}
    onRetry={onRetry}
    onGoHome={onGoHome}
    className={className}
  />
);

export const NotFoundErrorDisplay: React.FC<{
  onGoHome?: () => void;
  className?: string;
}> = ({ onGoHome, className }) => (
  <ErrorDisplay
    error={{
      type: ErrorType.NOT_FOUND_ERROR,
      code: 'NOT_FOUND',
      message: 'Page Not Found',
      timestamp: new Date().toISOString()
    }}
    onGoHome={onGoHome}
    className={className}
  />
);

export default ErrorDisplay;