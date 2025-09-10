import {
    ArrowDownTrayIcon,
    CheckCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    TrashIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';

export interface DownloadItem {
  id: string;
  filename: string;
  format: string;
  size: string;
  status: 'pending' | 'downloading' | 'completed' | 'failed';
  progress: number;
  createdAt: Date;
  downloadUrl?: string;
  error?: string;
}

interface DownloadManagerProps {
  downloads: DownloadItem[];
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
  onClearAll: () => void;
  className?: string;
}

const DownloadManager: React.FC<DownloadManagerProps> = ({
  downloads,
  onRetry,
  onRemove,
  onClearAll,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const pendingDownloads = downloads.filter(d => d.status === 'pending' || d.status === 'downloading');
  const completedDownloads = downloads.filter(d => d.status === 'completed');
  const failedDownloads = downloads.filter(d => d.status === 'failed');

  const getStatusIcon = (status: DownloadItem['status']) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-600" />;
      case 'downloading':
        return <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircleIcon className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusText = (status: DownloadItem['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'downloading':
        return 'Downloading';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
    }
  };

  const formatFileSize = (size: string) => {
    return size;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  };

  const handleDownload = (item: DownloadItem) => {
    if (item.downloadUrl) {
      const link = document.createElement('a');
      link.href = item.downloadUrl;
      link.download = item.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (downloads.length === 0) {
    return null;
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <ArrowDownTrayIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Downloads ({downloads.length})
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {pendingDownloads.length} active, {completedDownloads.length} completed, {failedDownloads.length} failed
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {downloads.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear All
            </button>
          )}
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg
              className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Download List */}
      {isExpanded && (
        <div className="max-h-96 overflow-y-auto">
          {downloads.map((download) => (
            <div
              key={download.id}
              className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {getStatusIcon(download.status)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {download.filename}
                    </p>
                    <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                      {download.format}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {formatFileSize(download.size)}
                    </span>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {formatTimeAgo(download.createdAt)}
                    </span>
                    <span className={`text-xs font-medium ${
                      download.status === 'completed' ? 'text-green-600' :
                      download.status === 'failed' ? 'text-red-600' :
                      download.status === 'downloading' ? 'text-blue-600' :
                      'text-yellow-600'
                    }`}>
                      {getStatusText(download.status)}
                    </span>
                  </div>

                  {/* Progress Bar for Active Downloads */}
                  {download.status === 'downloading' && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                        <div 
                          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${download.progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {download.progress}% complete
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {download.status === 'failed' && download.error && (
                    <div className="mt-1 flex items-center space-x-1">
                      <ExclamationTriangleIcon className="h-3 w-3 text-red-500" />
                      <span className="text-xs text-red-600 dark:text-red-400">
                        {download.error}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                {download.status === 'completed' && (
                  <button
                    onClick={() => handleDownload(download)}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                    title="Download again"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                  </button>
                )}
                
                {download.status === 'failed' && (
                  <button
                    onClick={() => onRetry(download.id)}
                    className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200"
                    title="Retry download"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                )}
                
                <button
                  onClick={() => onRemove(download.id)}
                  className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  title="Remove from list"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Bar for Collapsed State */}
      {!isExpanded && (pendingDownloads.length > 0 || failedDownloads.length > 0) && (
        <div className="p-3 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {pendingDownloads.length > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {pendingDownloads.length} downloading
                  </span>
                </div>
              )}
              
              {failedDownloads.length > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="h-2 w-2 bg-red-600 rounded-full" />
                  <span className="text-xs text-red-600 dark:text-red-400">
                    {failedDownloads.length} failed
                  </span>
                </div>
              )}
            </div>
            
            {completedDownloads.length > 0 && (
              <span className="text-xs text-green-600 dark:text-green-400">
                {completedDownloads.length} completed
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadManager;