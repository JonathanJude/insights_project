import React from 'react';
import SkeletonBase from './SkeletonBase';
import SkeletonCard from './SkeletonCard';

interface SkeletonSearchResultsProps {
  count?: number;
  layout?: 'grid' | 'list';
  showFilters?: boolean;
  className?: string;
}

const SkeletonSearchResults: React.FC<SkeletonSearchResultsProps> = ({
  count = 9,
  layout = 'grid',
  showFilters = true,
  className = ''
}) => {
  const gridClasses = layout === 'grid' 
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    : 'space-y-4';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <SkeletonBase className="h-8 w-48 mb-2" />
          <SkeletonBase className="h-4 w-32" />
        </div>
        <div className="flex space-x-4">
          <SkeletonBase className="h-10 w-32" />
          <SkeletonBase className="h-10 w-24" />
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex flex-wrap gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonBase key={index} className="h-8 w-24" />
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      <div className={gridClasses}>
        {Array.from({ length: count }).map((_, index) => (
          <SkeletonCard
            key={index}
            showAvatar={true}
            showStats={true}
            statsCount={3}
            className="h-auto"
          />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center space-x-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonBase key={index} className="h-10 w-10" />
        ))}
      </div>
    </div>
  );
};

export default SkeletonSearchResults;