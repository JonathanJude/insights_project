import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface SuccessFeedbackProps {
  title: string;
  message: string;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }>;
}

const SuccessFeedback: React.FC<SuccessFeedbackProps> = ({
  title,
  message,
  isVisible,
  onClose,
  duration = 5000,
  actions = []
}) => {
  React.useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-green-200 dark:border-green-800 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
              {title}
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {message}
            </p>
            
            {actions.length > 0 && (
              <div className="mt-3 flex space-x-2">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={`text-sm font-medium ${
                      action.variant === 'primary'
                        ? 'text-green-600 dark:text-green-400 hover:text-green-500'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-500'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="inline-flex text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Hook for managing success feedback
export const useSuccessFeedback = () => {
  const [feedback, setFeedback] = React.useState<{
    title: string;
    message: string;
    isVisible: boolean;
    actions?: Array<{
      label: string;
      onClick: () => void;
      variant?: 'primary' | 'secondary';
    }>;
  }>({
    title: '',
    message: '',
    isVisible: false
  });

  const showSuccess = (
    title: string, 
    message: string, 
    actions?: Array<{
      label: string;
      onClick: () => void;
      variant?: 'primary' | 'secondary';
    }>
  ) => {
    setFeedback({
      title,
      message,
      isVisible: true,
      actions
    });
  };

  const hideSuccess = () => {
    setFeedback(prev => ({ ...prev, isVisible: false }));
  };

  const SuccessFeedbackComponent = () => (
    <SuccessFeedback
      title={feedback.title}
      message={feedback.message}
      isVisible={feedback.isVisible}
      onClose={hideSuccess}
      actions={feedback.actions}
    />
  );

  return {
    showSuccess,
    hideSuccess,
    SuccessFeedbackComponent
  };
};

// Common success messages for different actions
export const SuccessMessages = {
  DATA_REFRESHED: {
    title: 'Data Refreshed',
    message: 'Dashboard data has been updated successfully.'
  },
  FILTER_APPLIED: {
    title: 'Filter Applied',
    message: 'Your filter preferences have been saved.'
  },
  SETTINGS_SAVED: {
    title: 'Settings Saved',
    message: 'Your preferences have been updated.'
  },
  EXPORT_COMPLETED: {
    title: 'Export Complete',
    message: 'Your data has been exported successfully.'
  },
  SEARCH_SAVED: {
    title: 'Search Saved',
    message: 'This search has been added to your history.'
  },
  THEME_CHANGED: {
    title: 'Theme Updated',
    message: 'Your theme preference has been saved.'
  }
};

export default SuccessFeedback;