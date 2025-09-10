import React, { Suspense } from 'react';
import PageLayout from './PageLayout';

interface RouteSuspenseProps {
  children: React.ReactNode;
  fallbackTitle?: string;
  fallbackSubtitle?: string;
}

const RouteSuspense: React.FC<RouteSuspenseProps> = ({
  children,
  fallbackTitle = 'Loading',
  fallbackSubtitle = 'Please wait while we load the page...'
}) => {
  const LoadingFallback = () => (
    <PageLayout
      title={fallbackTitle}
      subtitle={fallbackSubtitle}
      showBreadcrumbs={false}
    >
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </PageLayout>
  );

  return (
    <Suspense fallback={<LoadingFallback />}>
      {children}
    </Suspense>
  );
};

export default RouteSuspense;