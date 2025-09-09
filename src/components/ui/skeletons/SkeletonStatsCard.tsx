import React from 'react';
import SkeletonBase from './SkeletonBase';

interface SkeletonStatsCardProps {
  className?: string;
  showTrend?: boolean;
  showIcon?: boolean;
}

const SkeletonStatsCard: React.FC<SkeletonStatsCardProps> = ({
  className = '',
  showTrend = true,
  showIcon = true
}) => {
  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* Title */}
          <SkeletonBase className="h-4 w-24 mb-3" />
          
          {/* Value */}
          <SkeletonBase className="h-8 w-20 mb-4" />
          
          {/* Trend */}
          {showTrend && (
            <div className="flex items-center space-x-2 mb-2">
              <SkeletonBase className="h-4 w-16 rounded-full" />
            </div>
          )}
          
          {/* Description */}
          <SkeletonBase className="h-3 w-full" />
        </div>
        
        {/* Icon */}
        {showIcon && (
          <div className="flex-shrink-0 ml-6">
            <SkeletonBase className="w-16 h-16" rounded="xl" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SkeletonStatsCard;