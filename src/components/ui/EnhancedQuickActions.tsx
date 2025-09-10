import { SparklesIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { getEnabledQuickActions, getEnhancedQuickActions } from '../../config/quickActions';
import type { QuickAction } from '../../types/quickActions';
import QuickActionCard from './QuickActionCard';

interface EnhancedQuickActionsProps {
  className?: string;
  showTitle?: boolean;
  maxActions?: number;
  variant?: 'default' | 'enhanced' | 'compact';
  onActionClick?: (action: QuickAction) => void;
}

const EnhancedQuickActions: React.FC<EnhancedQuickActionsProps> = ({
  className = '',
  showTitle = true,
  maxActions,
  variant = 'enhanced',
  onActionClick
}) => {
  const [showAllActions, setShowAllActions] = useState(false);
  
  const regularActions = getEnabledQuickActions();
  const enhancedActions = getEnhancedQuickActions();
  
  // Combine and limit actions if needed
  const allActions = [...regularActions, ...enhancedActions];
  const displayActions = maxActions && !showAllActions 
    ? allActions.slice(0, maxActions)
    : allActions;
  
  const hasMoreActions = maxActions && allActions.length > maxActions;

  return (
    <div className={`
      relative overflow-hidden rounded-xl 
      ${variant === 'enhanced' 
        ? 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 border border-blue-200/50 dark:border-gray-600 shadow-lg hover:shadow-xl transition-all duration-300'
        : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm'
      }
      p-4 lg:p-6 ${className}
    `}>
      {/* Background Effects for Enhanced Variant */}
      {variant === 'enhanced' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-2xl transform translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-pink-400/10 to-blue-400/10 rounded-full blur-xl transform -translate-x-12 translate-y-12"></div>
        </>
      )}

      <div className="relative">
        {/* Header */}
        {showTitle && (
          <div className="flex items-center space-x-2 mb-4">
            {variant === 'enhanced' && (
              <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            )}
            <SparklesIcon className={`
              h-5 w-5 transition-colors duration-200
              ${variant === 'enhanced' 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-500'
              }
            `} />
            <h3 className={`
              text-lg lg:text-xl font-bold transition-colors duration-200
              ${variant === 'enhanced'
                ? 'text-gray-900 dark:text-white'
                : 'text-gray-800 dark:text-gray-200'
              }
            `}>
              Quick Actions
            </h3>
            {variant === 'enhanced' && (
              <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full font-medium shadow-sm">
                Enhanced
              </span>
            )}
          </div>
        )}

        {/* Actions Grid */}
        <div className="space-y-3">
          {displayActions.map((action) => (
            <QuickActionCard
              key={action.id}
              action={action}
              variant={variant}
              onClick={onActionClick}
              className={
                action.category === 'analysis' && variant === 'enhanced'
                  ? 'ring-1 ring-purple-200/50 dark:ring-purple-800/50'
                  : ''
              }
            />
          ))}
        </div>

        {/* Show More/Less Button */}
        {hasMoreActions && (
          <button
            onClick={() => setShowAllActions(!showAllActions)}
            className={`
              w-full mt-4 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200
              ${variant === 'enhanced'
                ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50'
                : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
              }
            `}
          >
            {showAllActions 
              ? `Show Less (${maxActions} of ${allActions.length})`
              : `Show All Actions (${allActions.length - maxActions!} more)`
            }
          </button>
        )}

        {/* Analysis Actions Highlight */}
        {variant === 'enhanced' && enhancedActions.length > 0 && (
          <div className="mt-4 p-3 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-200/30 dark:border-purple-800/30">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm">✨</span>
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                New Multi-Dimensional Analysis
              </span>
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              Explore advanced sentiment categorization across geographic, demographic, and temporal dimensions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedQuickActions;