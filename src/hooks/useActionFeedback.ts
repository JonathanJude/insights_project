import { useState } from 'react';
import { useErrorHandler } from '../lib/errorHandling';
import { useNotification } from '../stores/uiStore';

interface ActionState {
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}

interface ActionOptions {
  successMessage?: string;
  successTitle?: string;
  errorMessage?: string;
  errorTitle?: string;
  showSuccessNotification?: boolean;
  showErrorNotification?: boolean;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}

export const useActionFeedback = () => {
  const [actionState, setActionState] = useState<ActionState>({
    isLoading: false,
    error: null,
    isSuccess: false
  });

  const { handleError } = useErrorHandler();
  const notification = useNotification();

  const executeAction = async <T>(
    action: () => Promise<T>,
    options: ActionOptions = {}
  ): Promise<T | null> => {
    const {
      successMessage = 'Action completed successfully',
      successTitle = 'Success',
      errorMessage,
      errorTitle,
      showSuccessNotification = true,
      showErrorNotification = true,
      onSuccess,
      onError
    } = options;

    setActionState({
      isLoading: true,
      error: null,
      isSuccess: false
    });

    try {
      const result = await action();
      
      setActionState({
        isLoading: false,
        error: null,
        isSuccess: true
      });

      // Show success notification
      if (showSuccessNotification) {
        notification.success(successTitle, successMessage);
      }

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }

      // Reset success state after a delay
      setTimeout(() => {
        setActionState(prev => ({ ...prev, isSuccess: false }));
      }, 3000);

      return result;
    } catch (error) {
      const apiError = handleError(error, {
        showNotification: showErrorNotification,
        fallbackMessage: errorMessage
      });

      setActionState({
        isLoading: false,
        error: apiError.message,
        isSuccess: false
      });

      // Call error callback
      if (onError) {
        onError(error);
      }

      return null;
    }
  };

  const clearError = () => {
    setActionState(prev => ({ ...prev, error: null }));
  };

  const clearSuccess = () => {
    setActionState(prev => ({ ...prev, isSuccess: false }));
  };

  const reset = () => {
    setActionState({
      isLoading: false,
      error: null,
      isSuccess: false
    });
  };

  return {
    ...actionState,
    executeAction,
    clearError,
    clearSuccess,
    reset
  };
};

// Specialized hooks for common actions
export const useDataRefresh = () => {
  const actionFeedback = useActionFeedback();

  const refreshData = async (refreshFn: () => Promise<void>) => {
    return actionFeedback.executeAction(refreshFn, {
      successTitle: 'Data Refreshed',
      successMessage: 'Dashboard data has been updated successfully',
      errorTitle: 'Refresh Failed',
      errorMessage: 'Failed to refresh data. Please try again.'
    });
  };

  return {
    ...actionFeedback,
    refreshData
  };
};

export const useSettingsSave = () => {
  const actionFeedback = useActionFeedback();

  const saveSettings = async (saveFn: () => Promise<void>) => {
    return actionFeedback.executeAction(saveFn, {
      successTitle: 'Settings Saved',
      successMessage: 'Your preferences have been updated successfully',
      errorTitle: 'Save Failed',
      errorMessage: 'Failed to save settings. Please try again.'
    });
  };

  return {
    ...actionFeedback,
    saveSettings
  };
};

export const useDataExport = () => {
  const actionFeedback = useActionFeedback();

  const exportData = async (exportFn: () => Promise<void>, format: string = 'data') => {
    return actionFeedback.executeAction(exportFn, {
      successTitle: 'Export Complete',
      successMessage: `Your ${format} has been exported successfully`,
      errorTitle: 'Export Failed',
      errorMessage: `Failed to export ${format}. Please try again.`
    });
  };

  return {
    ...actionFeedback,
    exportData
  };
};

export const useSearchAction = () => {
  const actionFeedback = useActionFeedback();

  const performSearch = async (searchFn: () => Promise<void>) => {
    return actionFeedback.executeAction(searchFn, {
      successTitle: 'Search Complete',
      successMessage: 'Search results have been updated',
      errorTitle: 'Search Failed',
      errorMessage: 'Failed to perform search. Please try again.',
      showSuccessNotification: false // Don't show notification for search
    });
  };

  return {
    ...actionFeedback,
    performSearch
  };
};