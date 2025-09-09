import React from 'react';
import SkeletonBase from './SkeletonBase';

interface SkeletonChartProps {
  type?: 'line' | 'bar' | 'pie' | 'area';
  height?: number;
  showFilters?: boolean;
  showLegend?: boolean;
  className?: string;
}

const SkeletonChart: React.FC<SkeletonChartProps> = ({
  type = 'line',
  height = 300,
  showFilters = true,
  showLegend = true,
  className = ''
}) => {
  const renderChartContent = () => {
    switch (type) {
      case 'pie':
        return (
          <div className="flex items-center justify-center h-full">
            <SkeletonBase
              className="w-48 h-48"
              rounded="full"
            />
          </div>
        );
      
      case 'bar':
        return (
          <div className="flex items-end justify-between h-full px-4 pb-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonBase
                key={index}
                className="w-8"
                height={Math.random() * 200 + 50}
              />
            ))}
          </div>
        );
      
      case 'area':
      case 'line':
      default:
        return (
          <div className="relative h-full p-4">
            {/* Y-axis */}
            <div className="absolute left-0 top-4 bottom-8 w-8 flex flex-col justify-between">
              {Array.from({ length: 6 }).map((_, index) => (
                <SkeletonBase key={index} className="h-3 w-6" />
              ))}
            </div>
            
            {/* Chart area */}
            <div className="ml-12 mr-4 h-full relative">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between">
                {Array.from({ length: 6 }).map((_, index) => (
                  <SkeletonBase key={index} className="h-px w-full" />
                ))}
              </div>
              
              {/* Chart line/area */}
              <div className="absolute inset-0 flex items-center">
                <svg className="w-full h-full" viewBox="0 0 400 200">
                  <defs>
                    <linearGradient id="skeleton-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" className="stop-color-gray-200" />
                      <stop offset="50%" className="stop-color-gray-300" />
                      <stop offset="100%" className="stop-color-gray-200" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0,150 Q100,100 200,120 T400,80"
                    stroke="url(#skeleton-gradient)"
                    strokeWidth="3"
                    fill="none"
                    className="animate-pulse"
                  />
                  {type === 'area' && (
                    <path
                      d="M0,150 Q100,100 200,120 T400,80 L400,200 L0,200 Z"
                      fill="url(#skeleton-gradient)"
                      opacity="0.3"
                      className="animate-pulse"
                    />
                  )}
                </svg>
              </div>
            </div>
            
            {/* X-axis */}
            <div className="absolute bottom-0 left-12 right-4 h-8 flex justify-between items-center">
              {Array.from({ length: 7 }).map((_, index) => (
                <SkeletonBase key={index} className="h-3 w-12" />
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 ${className}`}>
      {showFilters && (
        <div className="flex justify-between items-center mb-6">
          <SkeletonBase className="h-6 w-32" />
          <SkeletonBase className="h-8 w-32" />
        </div>
      )}
      
      <div style={{ height }}>
        {renderChartContent()}
      </div>
      
      {showLegend && (
        <div className="flex justify-center space-x-6 mt-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-2">
              <SkeletonBase className="w-3 h-3" rounded="full" />
              <SkeletonBase className="h-3 w-16" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkeletonChart;