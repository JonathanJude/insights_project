import React from 'react';
import SkeletonBase from './SkeletonBase';
import SkeletonText from './SkeletonText';

interface SkeletonListProps {
  items?: number;
  showAvatar?: boolean;
  showRank?: boolean;
  showStats?: boolean;
  className?: string;
  itemClassName?: string;
}

const SkeletonList: React.FC<SkeletonListProps> = ({
  items = 5,
  showAvatar = true,
  showRank = false,
  showStats = true,
  className = '',
  itemClassName = ''
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div
          key={index}
          className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${itemClassName}`}
        >
          <div className="flex items-start space-x-3">
            {/* Rank */}
            {showRank && (
              <SkeletonBase className="w-8 h-8 flex-shrink-0" rounded="full" />
            )}
            
            {/* Avatar */}
            {showAvatar && (
              <SkeletonBase className="w-12 h-12 flex-shrink-0" rounded="full" />
            )}
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <SkeletonText lines={2} width={['70%', '50%']} spacing="sm" />
                  <div className="flex items-center space-x-2 mt-2">
                    <SkeletonBase className="w-2 h-2" rounded="full" />
                    <SkeletonBase className="h-3 w-20" />
                  </div>
                </div>
                
                {/* Trend indicator */}
                <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
                  <SkeletonBase className="w-4 h-4" />
                  <SkeletonBase className="h-3 w-8" />
                </div>
              </div>
              
              {/* Stats */}
              {showStats && (
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <SkeletonBase className="w-3 h-3" />
                      <SkeletonBase className="h-3 w-8" />
                    </div>
                    <div className="flex items-center space-x-1">
                      <SkeletonBase className="w-3 h-3" />
                      <SkeletonBase className="h-3 w-8" />
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <SkeletonBase className="w-2 h-2" rounded="full" />
                    <SkeletonBase className="h-3 w-12" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonList;