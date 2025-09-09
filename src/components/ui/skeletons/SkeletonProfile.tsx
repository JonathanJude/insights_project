import React from 'react';
import SkeletonBase from './SkeletonBase';
import SkeletonStatsCard from './SkeletonStatsCard';
import SkeletonText from './SkeletonText';

interface SkeletonProfileProps {
  className?: string;
}

const SkeletonProfile: React.FC<SkeletonProfileProps> = ({
  className = ''
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Breadcrumb Skeleton */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          <li><SkeletonBase className="h-4 w-16" /></li>
          <li><SkeletonBase className="h-4 w-4" /></li>
          <li><SkeletonBase className="h-4 w-12" /></li>
        </ol>
      </nav>

      {/* Profile Header Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Cover Image Skeleton */}
        <SkeletonBase className="h-32 w-full" rounded="none" />
        
        {/* Profile Info Skeleton */}
        <div className="px-6 pb-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-12">
            {/* Avatar Skeleton */}
            <div className="relative">
              <SkeletonBase className="w-32 h-32 border-4 border-white dark:border-gray-800" rounded="full" />
              <SkeletonBase className="absolute bottom-2 right-2 w-8 h-8" rounded="full" />
            </div>
            
            {/* User Info Skeleton */}
            <div className="flex-1 mt-6 sm:mt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="space-y-2 mb-4 sm:mb-0">
                  <SkeletonBase className="h-8 w-48" />
                  <SkeletonBase className="h-5 w-32" />
                  <SkeletonBase className="h-4 w-40" />
                </div>
                <SkeletonBase className="h-10 w-32" />
              </div>
              
              {/* Meta Info Skeleton */}
              <div className="flex flex-wrap items-center space-x-6 mt-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center space-x-1">
                    <SkeletonBase className="w-4 h-4" />
                    <SkeletonBase className="h-4 w-20" />
                  </div>
                ))}
              </div>
              
              {/* Bio Skeleton */}
              <div className="mt-4 space-y-2">
                <SkeletonText lines={3} width={['100%', '85%', '60%']} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonStatsCard key={index} />
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 mb-6">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBase key={index} className="h-10 w-24" />
        ))}
      </div>

      {/* Tab Content Skeleton */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <SkeletonBase className="h-6 w-32" />
              <SkeletonBase className="h-4 w-16" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="space-y-1">
                    <SkeletonBase className="h-4 w-32" />
                    <SkeletonBase className="h-3 w-24" />
                  </div>
                  <SkeletonBase className="w-5 h-5" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <SkeletonBase className="h-6 w-24 mb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <SkeletonBase className="w-5 h-5" />
                  <div className="space-y-1">
                    <SkeletonBase className="h-4 w-32" />
                    <SkeletonBase className="h-3 w-40" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Content Sections */}
        <div className="space-y-6">
          {/* Notification Preferences Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <SkeletonBase className="h-6 w-40 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <SkeletonBase className="h-4 w-32" />
                    <SkeletonBase className="h-3 w-48" />
                  </div>
                  <SkeletonBase className="w-11 h-6" rounded="full" />
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Preferences Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <SkeletonBase className="h-6 w-36 mb-4" />
            <div className="space-y-4">
              <div>
                <SkeletonBase className="h-4 w-32 mb-2" />
                <SkeletonBase className="h-10 w-full" />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <SkeletonBase className="h-4 w-24" />
                  <SkeletonBase className="h-3 w-40" />
                </div>
                <SkeletonBase className="w-11 h-6" rounded="full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonProfile;