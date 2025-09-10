import { CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import React from 'react';
import type { ExportProgress } from '../../lib/multiDimensionalExportUtils';

interface ExportProgressIndicatorProps {
  progress: ExportProgress;
  onCancel?: () => void;
  showCancel?: boolean;
  className?: string;
}

const ExportProgressIndicator: React.FC<ExportProgressIndicatorProps> = ({
  progress,
  onCancel,
  showCancel = true,
  className = ''
}) => {
  const getStageIcon = () => {
    switch (progress.stage) {
      case 'complete':
        return <CheckCircleIcon className="h-8 w-8 text-green-600" />;
      case 'error':
        return <XCircleIcon className="h-8 w-8 text-red-600" />;
      default:
        return (
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        );
    }
  };

  const getStageColor = () => {
    switch (progress.stage) {
      case 'complete':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      default:
        return 'bg-blue-600';
    }
  };

  const getStageText = () => {
    switch (progress.stage) {
      case 'preparing':
        return 'Preparing export...';
      case 'processing':
        return 'Processing data...';
      case 'generating':
        return 'Generating file...';
      case 'downloading':
        return 'Preparing download...';
      case 'complete':
        return 'Export completed successfully!';
      case 'error':
        return 'Export failed';
      default:
        return progress.message;
    }
  };

  const formatEstimatedTime = (seconds?: number) => {
    if (!seconds) return '';
    
    if (seconds < 60) {
      return `${Math.round(seconds)}s remaining`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.round(seconds % 60);
      return `${minutes}m ${remainingSeconds}s remaining`;
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getStageIcon()}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              {getStageText()}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {progress.message}
            </p>
          </div>
        </div>
        
        {showCancel && onCancel && progress.stage !== 'complete' && progress.stage !== 'error' && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {progress.stage !== 'complete' && progress.stage !== 'error' && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Progress
            </span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {progress.progress}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getStageColor()}`}
              style={{ width: `${Math.min(100, Math.max(0, progress.progress))}%` }}
            />
          </div>
          
          {progress.estimatedTimeRemaining && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
              {formatEstimatedTime(progress.estimatedTimeRemaining)}
            </div>
          )}
        </div>
      )}

      {/* Stage Indicators */}
      <div className="flex items-center justify-between">
        {['preparing', 'processing', 'generating', 'downloading'].map((stage, index) => {
          const isActive = progress.stage === stage;
          const isCompleted = ['preparing', 'processing', 'generating', 'downloading'].indexOf(progress.stage) > index;
          const isError = progress.stage === 'error';
          
          return (
            <div key={stage} className="flex items-center">
              <div className={`
                w-3 h-3 rounded-full transition-colors duration-200
                ${isError ? 'bg-red-600' : 
                  isCompleted ? 'bg-green-600' : 
                  isActive ? 'bg-blue-600' : 
                  'bg-gray-300 dark:bg-gray-600'}
              `} />
              
              <span className={`
                ml-2 text-xs font-medium capitalize
                ${isError ? 'text-red-600' : 
                  isCompleted ? 'text-green-600' : 
                  isActive ? 'text-blue-600' : 
                  'text-gray-500 dark:text-gray-400'}
              `}>
                {stage}
              </span>
              
              {index < 3 && (
                <div className={`
                  w-8 h-0.5 mx-2 transition-colors duration-200
                  ${isError ? 'bg-red-300' : 
                    isCompleted ? 'bg-green-300' : 
                    'bg-gray-300 dark:bg-gray-600'}
                `} />
              )}
            </div>
          );
        })}
      </div>

      {/* Success/Error Actions */}
      {progress.stage === 'complete' && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              Your export has been downloaded successfully
            </span>
          </div>
        </div>
      )}

      {progress.stage === 'error' && (
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-800 dark:text-red-200">
              Export failed. Please try again.
            </span>
          </div>
          
          {onCancel && (
            <button
              onClick={onCancel}
              className="mt-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 underline"
            >
              Dismiss
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ExportProgressIndicator;