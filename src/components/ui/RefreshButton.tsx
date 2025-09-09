import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { useDataRefresh } from '../../hooks/useActionFeedback';

interface RefreshState {
  isRefreshing: boolean;
  lastRefresh: Date;
  error?: string;
}

interface RefreshButtonProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'subtle' | 'outlined' | 'filled';
  onRefreshStart?: () => void;
  onRefreshComplete?: () => void;
  onRefreshError?: (error: string) => void;
}

const RefreshButton: React.FC<RefreshButtonProps> = ({
  className = '',
  size = 'md',
  variant = 'subtle',
  onRefreshStart,
  onRefreshComplete,
  onRefreshError
}) => {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const queryClient = useQueryClient();
  const { refreshData, isLoading: isRefreshing, error } = useDataRefresh();
  
  const handleRefresh = async () => {
    onRefreshStart?.();
    
    const result = await refreshData(async () => {
      await queryClient.invalidateQueries();
      setLastRefresh(new Date());
    });
    
    if (result !== null) {
      onRefreshComplete?.();
    } else if (error) {
      onRefreshError?.(error);
    }
  };
  
  // Size configurations
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3'
  };
  
  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };
  
  // Variant configurations
  const variantClasses = {
    subtle: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800',
    outlined: 'text-gray-600 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700',
    filled: 'text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
  };
  
  const baseClasses = `
    inline-flex items-center justify-center rounded-lg
    transition-all duration-200 ease-in-out
    disabled:opacity-50 disabled:cursor-not-allowed
    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `.trim();
  
  const formatLastRefresh = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };
  
  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className={baseClasses}
      title={
        error 
          ? `Refresh failed: ${error}` 
          : `Refresh data (last updated: ${formatLastRefresh(lastRefresh)})`
      }
      aria-label="Refresh dashboard data"
    >
      <ArrowPathIcon 
        className={`
          ${iconSizes[size]} 
          ${isRefreshing ? 'animate-spin' : ''} 
          transition-transform duration-200
        `} 
      />
      {error && (
        <span className="ml-1 text-xs text-red-500">!</span>
      )}
    </button>
  );
};

export default RefreshButton;