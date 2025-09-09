import React from 'react';
import { useGlobalLoading } from '../../hooks/useGlobalLoading';

interface GlobalLoadingIndicatorProps {
  position?: 'top' | 'bottom';
  height?: number;
  className?: string;
}

const GlobalLoadingIndicator: React.FC<GlobalLoadingIndicatorProps> = ({
  position = 'top',
  height = 3,
  className = ''
}) => {
  const { isLoading, progress } = useGlobalLoading({
    minLoadingTime: 200,
    debounceTime: 50
  });

  if (!isLoading) return null;

  const positionClasses = {
    top: 'top-0',
    bottom: 'bottom-0'
  };

  return (
    <div
      className={`fixed left-0 right-0 z-50 ${positionClasses[position]} ${className}`}
      style={{ height: `${height}px` }}
    >
      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out"
          style={{
            width: `${progress}%`,
            boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
          }}
        />
      </div>
      
      {/* Animated shimmer effect */}
      <div
        className="absolute top-0 h-full w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"
        style={{
          left: `${Math.max(0, progress - 20)}%`,
          animationDuration: '1.5s'
        }}
      />
    </div>
  );
};

export default GlobalLoadingIndicator;