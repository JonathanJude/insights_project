import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ResponsiveContainer } from 'recharts';
import { useIsMobile, useIsTouchDevice } from '../../hooks/useMediaQuery';
import TouchFriendlyChart from './TouchFriendlyChart';

interface MobileChartWrapperProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  data?: any[];
  height?: number;
  mobileHeight?: number;
  className?: string;
  enableZoom?: boolean;
  enablePan?: boolean;
  enableTooltipOnTouch?: boolean;
  showFullscreenButton?: boolean;
  onDataPointTouch?: (data: any, index: number) => void;
  customControls?: React.ReactNode;
}

const MobileChartWrapper: React.FC<MobileChartWrapperProps> = ({
  children,
  title,
  subtitle,
  data,
  height = 400,
  mobileHeight = 300,
  className = '',
  enableZoom = true,
  enablePan = true,
  enableTooltipOnTouch = true,
  showFullscreenButton = true,
  onDataPointTouch,
  customControls
}) => {
  const isMobile = useIsMobile();
  const isTouch = useIsTouchDevice();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const chartHeight = isMobile ? mobileHeight : height;

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle orientation change on mobile
  useEffect(() => {
    const handleOrientationChange = () => {
      // Force re-render after orientation change
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    };

    window.addEventListener('orientationchange', handleOrientationChange);
    return () => window.removeEventListener('orientationchange', handleOrientationChange);
  }, []);

  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="bg-gray-200 rounded" style={{ height: chartHeight }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-gray-400">Loading chart...</div>
        </div>
      </div>
    </div>
  );

  const ChartContent = () => {
    if (data && (enableZoom || enablePan || enableTooltipOnTouch)) {
      return (
        <TouchFriendlyChart
          data={data}
          height={isFullscreen ? window.innerHeight - 100 : chartHeight}
          enableZoom={enableZoom}
          enablePan={enablePan}
          enableTooltipOnTouch={enableTooltipOnTouch}
          onDataPointTouch={onDataPointTouch}
        >
          {children}
        </TouchFriendlyChart>
      );
    }

    return (
      <ResponsiveContainer 
        width="100%" 
        height={isFullscreen ? window.innerHeight - 100 : chartHeight}
      >
        {children}
      </ResponsiveContainer>
    );
  };

  return (
    <div 
      ref={wrapperRef}
      className={`bg-white rounded-lg border border-gray-200 shadow-sm ${
        isFullscreen ? 'fixed inset-0 z-50 p-4' : ''
      } ${className}`}
    >
      {/* Header */}
      {(title || subtitle || showFullscreenButton || customControls) && (
        <div className="flex items-start justify-between p-4 pb-2">
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className={`font-semibold text-gray-900 ${
                isMobile ? 'text-base' : 'text-lg'
              } ${isFullscreen ? 'text-xl' : ''}`}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className={`text-gray-600 mt-1 ${
                isMobile ? 'text-xs' : 'text-sm'
              } ${isFullscreen ? 'text-base' : ''}`}>
                {subtitle}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            {/* Custom controls */}
            {customControls}
            
            {/* Fullscreen button */}
            {showFullscreenButton && (
              <button
                onClick={toggleFullscreen}
                className={`p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100 ${
                  isTouch ? 'touch-manipulation' : ''
                }`}
                title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              >
                {isFullscreen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Chart content */}
      <div className={`${title || subtitle ? 'px-4 pb-4' : 'p-4'}`}>
        {isLoading ? <LoadingSkeleton /> : <ChartContent />}
      </div>

      {/* Mobile-specific footer */}
      {isMobile && !isFullscreen && (enableZoom || enablePan) && (
        <div className="px-4 pb-3 text-xs text-gray-500 text-center border-t border-gray-100 pt-2">
          {enablePan && enableZoom && "Touch and drag to explore • Pinch to zoom"}
          {enablePan && !enableZoom && "Touch and drag to explore"}
          {!enablePan && enableZoom && "Pinch to zoom"}
        </div>
      )}

      {/* Fullscreen overlay controls */}
      {isFullscreen && (
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          <div className="bg-black bg-opacity-50 text-white text-sm px-3 py-1 rounded-full">
            Fullscreen Mode
          </div>
          <button
            onClick={toggleFullscreen}
            className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors touch-manipulation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

// Specialized wrapper for different chart types
export const MobileSentimentChart: React.FC<{
  children: React.ReactNode;
  data?: any[];
  className?: string;
}> = ({ children, data, className = '' }) => {
  const isMobile = useIsMobile();
  
  return (
    <MobileChartWrapper
      title="Sentiment Analysis"
      subtitle="Real-time sentiment tracking across platforms"
      data={data}
      height={350}
      mobileHeight={250}
      className={className}
      enableZoom={true}
      enablePan={true}
      enableTooltipOnTouch={true}
    >
      {children}
    </MobileChartWrapper>
  );
};

export const MobileGeographicChart: React.FC<{
  children: React.ReactNode;
  data?: any[];
  className?: string;
}> = ({ children, data, className = '' }) => {
  return (
    <MobileChartWrapper
      title="Geographic Distribution"
      subtitle="Sentiment analysis by location"
      data={data}
      height={400}
      mobileHeight={300}
      className={className}
      enableZoom={true}
      enablePan={true}
      enableTooltipOnTouch={true}
      showFullscreenButton={true}
    >
      {children}
    </MobileChartWrapper>
  );
};

export const MobileDemographicChart: React.FC<{
  children: React.ReactNode;
  data?: any[];
  className?: string;
}> = ({ children, data, className = '' }) => {
  return (
    <MobileChartWrapper
      title="Demographic Breakdown"
      subtitle="Sentiment across age groups and demographics"
      data={data}
      height={300}
      mobileHeight={250}
      className={className}
      enableZoom={false}
      enablePan={false}
      enableTooltipOnTouch={true}
    >
      {children}
    </MobileChartWrapper>
  );
};

// Hook for managing mobile chart interactions
export const useMobileChart = (data: any[]) => {
  const isMobile = useIsMobile();
  const isTouch = useIsTouchDevice();
  const [selectedDataPoint, setSelectedDataPoint] = useState<any>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handleDataPointTouch = useCallback((dataPoint: any, index: number) => {
    setSelectedDataPoint({ ...dataPoint, index });
    setIsInteracting(true);
    
    // Auto-hide selection after 3 seconds
    setTimeout(() => {
      setIsInteracting(false);
    }, 3000);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedDataPoint(null);
    setIsInteracting(false);
  }, []);

  const resetZoom = useCallback(() => {
    setZoomLevel(1);
  }, []);

  return {
    isMobile,
    isTouch,
    selectedDataPoint,
    isInteracting,
    zoomLevel,
    handleDataPointTouch,
    clearSelection,
    resetZoom,
    setZoomLevel
  };
};

export default MobileChartWrapper;