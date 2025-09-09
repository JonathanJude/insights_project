import React from 'react';
import SkeletonBase from './SkeletonBase';
import SkeletonText from './SkeletonText';

interface SkeletonCardProps {
  className?: string;
  showAvatar?: boolean;
  avatarSize?: 'sm' | 'md' | 'lg';
  showStats?: boolean;
  statsCount?: number;
  padding?: 'sm' | 'md' | 'lg';
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className = '',
  showAvatar = true,
  avatarSize = 'md',
  showStats = true,
  statsCount = 3,
  padding = 'md'
}) => {
  const avatarSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg ${paddingClasses[padding]} ${className}`}>
      <div className="flex items-start space-x-3 mb-4">
        {showAvatar && (
          <SkeletonBase
            className={`${avatarSizes[avatarSize]} flex-shrink-0`}
            rounded="full"
          />
        )}
        <div className="flex-1 min-w-0">
          <SkeletonText lines={2} width={['75%', '50%']} />
        </div>
        <SkeletonBase className="w-16 h-6" rounded="full" />
      </div>

      {showStats && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className={`grid grid-cols-${statsCount} gap-4`}>
            {Array.from({ length: statsCount }).map((_, index) => (
              <div key={index} className="text-center">
                <SkeletonBase className="h-6 w-12 mx-auto mb-1" />
                <SkeletonBase className="h-3 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkeletonCard;