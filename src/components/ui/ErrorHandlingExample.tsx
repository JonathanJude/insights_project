import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { useActionFeedback, useDataRefresh } from '../../hooks/useActionFeedback';
import { useErrorHandler } from '../../lib/errorHandling';
import ErrorDisplay from './ErrorDisplay';

// Example component demonstrating comprehensive error handling
const ErrorHandlingExample: React.FC = () => {
  const { handleError } = useErrorHandler();
  const { refreshData, isLoading: isRefreshing, error: refreshError } = useDataRefresh();
  const { executeAction, isLoading: isActionLoading, error: actionError } = useActionFeedback();
  const queryClient = useQueryClient();

  // Example query with error handling
  const { 
    data, 
    isLoading, 
    error: queryError, 
    refetch 
  } = useQuery({
    queryKey: ['example-data'],
    queryFn: async () => {
      // Simulate different types of errors for demonstration
      const errorType = Math.random();
      
      if (errorType < 0.2) {
        throw new Error('Network connection failed');
      } else if (errorType < 0.4) {
        const response = new Response(null, { status: 500 });
        throw response;
      } else if (errorType < 0.6) {
        const response = new Response(null, { status: 404 });
        throw response;
      }
      
      // Simulate successful response
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { message: 'Data loaded successfully!', timestamp: new Date().toISOString() };
    },
    retry: (failureCount, error) => {
      // Custom retry logic using our error handler
      const apiError = handleError(error, { showNotification: false });
      return failureCount < 2 && apiError.type === 'NETWORK_ERROR';
    }
  });

  // Example mutation with error handling
  const mutation = useMutation({
    mutationFn: async (data: { action: string }) => {
      // Simulate different outcomes
      const outcome = Math.random();
      
      if (outcome < 0.3) {
        throw new Error('Action failed due to server error');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      return { success: true, action: data.action };
    },
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['example-data'] });
    },
    onError: (error) => {
      handleError(error, {
        showNotification: true,
        fallbackMessage: 'Failed to perform action'
      });
    }
  });

  // Handle refresh action
  const handleRefresh = async () => {
    await refreshData(async () => {
      await refetch();
    });
  };

  // Handle custom action
  const handleCustomAction = async () => {
    await executeAction(
      async () => {
        await mutation.mutateAsync({ action: 'custom-action' });
      },
      {
        successTitle: 'Action Complete',
        successMessage: 'Your custom action was executed successfully',
        errorTitle: 'Action Failed',
        errorMessage: 'The custom action could not be completed'
      }
    );
  };

  // Handle manual error trigger (for testing)
  const triggerError = () => {
    try {
      throw new Error('This is a manually triggered error for testing');
    } catch (error) {
      handleError(error, {
        showNotification: true,
        fallbackMessage: 'Manual error triggered'
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Error Handling Demo
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          This component demonstrates comprehensive error handling with user-friendly messages,
          retry mechanisms, and success feedback.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowPathIcon className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
          </button>

          <button
            onClick={handleCustomAction}
            disabled={isActionLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isActionLoading ? 'Processing...' : 'Custom Action'}
          </button>

          <button
            onClick={triggerError}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
            Trigger Error
          </button>
        </div>

        {/* Data Display */}
        <div className="space-y-4">
          {isLoading && (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          )}

          {queryError && (
            <ErrorDisplay
              error={handleError(queryError, { showNotification: false })}
              onRetry={() => refetch()}
              showDetails={import.meta.env.DEV}
            />
          )}

          {refreshError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <p className="text-red-800 dark:text-red-200">
                Refresh Error: {refreshError}
              </p>
            </div>
          )}

          {actionError && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md p-4">
              <p className="text-orange-800 dark:text-orange-200">
                Action Error: {actionError}
              </p>
            </div>
          )}

          {data && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
              <h3 className="text-lg font-medium text-green-800 dark:text-green-200 mb-2">
                Data Loaded Successfully
              </h3>
              <p className="text-green-700 dark:text-green-300">
                {data.message}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                Loaded at: {new Date(data.timestamp).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Error Handling Features */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Error Handling Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Automatic Error Classification
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Errors are automatically classified by type (network, server, client) 
                with appropriate user-friendly messages.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Smart Retry Logic
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Automatic retry for network errors with exponential backoff. 
                Non-retryable errors fail fast.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Success Feedback
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Clear success notifications with contextual messages 
                for completed actions.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                Error Recovery
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Helpful guidance and recovery options for different 
                error scenarios.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorHandlingExample;