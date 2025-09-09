import React from 'react';
import SkeletonBase from './SkeletonBase';
import SkeletonChart from './SkeletonChart';
import SkeletonStatsCard from './SkeletonStatsCard';
import SkeletonText from './SkeletonText';

interface SkeletonPoliticianDetailProps {
  className?: string;
}

const SkeletonPoliticianDetail: React.FC<SkeletonPoliticianDetailProps> = ({
  className = ''
}) => {
  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}>
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          <li><SkeletonBase className="h-4 w-16" /></li>
          <li><SkeletonBase className="h-4 w-4" /></li>
          <li><SkeletonBase className="h-4 w-24" /></li>
        </ol>
      </nav>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
          {/* Profile Image */}
          <div className="flex-shrink-0 mb-4 lg:mb-0">
            <SkeletonBase className="w-24 h-24" rounded="full" />
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <SkeletonBase className="h-8 w-64 mb-2" />
                <SkeletonBase className="h-5 w-48 mb-2" />
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <SkeletonBase className="w-3 h-3" rounded="full" />
                    <SkeletonBase className="h-4 w-32" />
                  </div>
                  <SkeletonBase className="h-4 w-16" />
                  <SkeletonBase className="h-4 w-12" />
                  <SkeletonBase className="h-4 w-20" />
                </div>
              </div>

              {/* Current Sentiment */}
              <div className="text-right">
                <div className="flex items-center justify-end space-x-2 mb-2">
                  <SkeletonBase className="w-3 h-3" rounded="full" />
                  <SkeletonBase className="h-4 w-32" />
                </div>
                <SkeletonBase className="h-8 w-16" />
              </div>
            </div>

            {/* Social Media Links */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <SkeletonBase className="h-4 w-24 mb-2" />
              <div className="flex items-center space-x-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <SkeletonBase className="w-4 h-4" />
                    <SkeletonBase className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonStatsCard key={index} />
        ))}
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex space-x-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <SkeletonBase key={index} className="h-10 w-24" />
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sentiment Trend */}
          <SkeletonChart type="line" height={300} showFilters={false} />

          {/* Top Topics */}
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <SkeletonBase className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <SkeletonBase className="w-2 h-2" rounded="full" />
                    <SkeletonBase className="h-4 w-24" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <SkeletonBase className="h-3 w-16" />
                    <SkeletonBase className="h-5 w-12" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sentiment Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['Positive', 'Neutral', 'Negative'].map((sentiment, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <SkeletonBase className="w-4 h-4" rounded="full" />
                <SkeletonBase className="h-5 w-32" />
              </div>
              <SkeletonBase className="h-8 w-16 mb-2" />
              <SkeletonText lines={1} width={['80%']} />
            </div>
          ))}
        </div>

        {/* Platform Performance */}
        <SkeletonChart type="bar" height={300} />

        {/* Platform Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-4">
                <SkeletonBase className="w-5 h-5" />
                <SkeletonBase className="h-5 w-20" />
              </div>
              
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, statIndex) => (
                  <div key={statIndex} className="flex justify-between items-center">
                    <SkeletonBase className="h-4 w-24" />
                    <SkeletonBase className="h-4 w-16" />
                  </div>
                ))}
                
                {/* Sentiment Breakdown Bar */}
                <div className="mt-3">
                  <SkeletonBase className="h-3 w-32 mb-1" />
                  <SkeletonBase className="h-2 w-full" />
                  <div className="flex justify-between mt-1">
                    {Array.from({ length: 3 }).map((_, barIndex) => (
                      <SkeletonBase key={barIndex} className="h-3 w-8" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SkeletonPoliticianDetail;