import React from 'react';
import SkeletonBase from './SkeletonBase';
import SkeletonChart from './SkeletonChart';
import SkeletonList from './SkeletonList';
import SkeletonStatsCard from './SkeletonStatsCard';
import SkeletonText from './SkeletonText';

interface SkeletonPageProps {
  type?: 'dashboard' | 'politician-detail' | 'search-results' | 'party-analytics';
  className?: string;
}

const SkeletonPage: React.FC<SkeletonPageProps> = ({
  type = 'dashboard',
  className = ''
}) => {
  const renderDashboardSkeleton = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
        <div className="flex-1">
          <SkeletonBase className="h-8 w-48 mb-2" />
          <SkeletonText lines={2} width={['60%', '40%']} />
        </div>
        <div className="flex space-x-4">
          <SkeletonBase className="h-10 w-32" />
          <SkeletonBase className="h-10 w-32" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonStatsCard key={index} />
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <SkeletonChart type="line" height={300} />
          <SkeletonChart type="bar" height={300} />
        </div>
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <SkeletonBase className="h-6 w-32" />
              <SkeletonBase className="h-4 w-16" />
            </div>
            <SkeletonList items={5} showRank={true} />
          </div>
          <SkeletonChart type="pie" height={300} />
        </div>
      </div>
    </div>
  );

  const renderPoliticianDetailSkeleton = () => (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2">
        <SkeletonBase className="h-4 w-16" />
        <SkeletonBase className="h-4 w-4" />
        <SkeletonBase className="h-4 w-24" />
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-start space-x-6">
          <SkeletonBase className="w-24 h-24 flex-shrink-0" rounded="full" />
          <div className="flex-1">
            <SkeletonBase className="h-8 w-64 mb-2" />
            <SkeletonBase className="h-5 w-48 mb-4" />
            <SkeletonText lines={2} width={['80%', '60%']} />
          </div>
          <div className="text-right">
            <SkeletonBase className="h-4 w-32 mb-2" />
            <SkeletonBase className="h-8 w-16" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonStatsCard key={index} />
        ))}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBase key={index} className="h-10 w-24" />
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SkeletonChart type="line" height={300} />
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <SkeletonBase className="h-6 w-32 mb-4" />
          <SkeletonList items={8} showAvatar={false} showStats={false} />
        </div>
      </div>
    </div>
  );

  const renderSearchResultsSkeleton = () => (
    <div className="space-y-6">
      {/* Header */}
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
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex flex-wrap gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonBase key={index} className="h-8 w-24" />
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-start space-x-3 mb-4">
              <SkeletonBase className="w-12 h-12" rounded="full" />
              <div className="flex-1">
                <SkeletonText lines={2} width={['80%', '60%']} />
                <SkeletonBase className="h-4 w-20 mt-2" />
              </div>
              <SkeletonBase className="h-6 w-16" rounded="full" />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              {Array.from({ length: 3 }).map((_, statIndex) => (
                <div key={statIndex} className="text-center">
                  <SkeletonBase className="h-5 w-12 mx-auto mb-1" />
                  <SkeletonBase className="h-3 w-16 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPartyAnalyticsSkeleton = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 space-y-4 lg:space-y-0">
        <div>
          <SkeletonBase className="h-8 w-48 mb-2" />
          <SkeletonText lines={1} width={['60%']} />
        </div>
        <div className="flex space-x-4">
          <SkeletonBase className="h-10 w-32" />
          <SkeletonBase className="h-10 w-24" />
        </div>
      </div>

      {/* Party Selector */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <SkeletonBase className="h-6 w-32 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
              <SkeletonBase className="w-4 h-4" rounded="full" />
              <SkeletonBase className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart type="bar" height={400} />
        <SkeletonChart type="line" height={400} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart type="pie" height={400} />
        <SkeletonChart type="area" height={400} />
      </div>
    </div>
  );

  const renderContent = () => {
    switch (type) {
      case 'politician-detail':
        return renderPoliticianDetailSkeleton();
      case 'search-results':
        return renderSearchResultsSkeleton();
      case 'party-analytics':
        return renderPartyAnalyticsSkeleton();
      case 'dashboard':
      default:
        return renderDashboardSkeleton();
    }
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {renderContent()}
    </div>
  );
};

export default SkeletonPage;