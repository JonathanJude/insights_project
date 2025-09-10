import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useIsMobile, useIsTouchDevice } from '../../hooks/useMediaQuery';

interface SwipeableChartContainerProps {
  charts: Array<{
    id: string;
    title: string;
    subtitle?: string;
    component: React.ReactNode;
    icon?: React.ReactNode;
  }>;
  initialChart?: number;
  onChartChange?: (chartIndex: number, chart: any) => void;
  className?: string;
  showIndicators?: boolean;
  showNavigation?: boolean;
  autoHeight?: boolean;
}

interface SwipeState {
  startX: number;
  currentX: number;
  isDragging: boolean;
  dragOffset: number;
}

const SwipeableChartContainer: React.FC<SwipeableChartContainerProps> = ({
  charts,
  initialChart = 0,
  onChartChange,
  className = '',
  showIndicators = true,
  showNavigation = true,
  autoHeight = true
}) => {
  const isMobile = useIsMobile();
  const isTouch = useIsTouchDevice();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentChart, setCurrentChart] = useState(initialChart);
  const [swipeState, setSwipeState] = useState<SwipeState>({
    startX: 0,
    currentX: 0,
    isDragging: false,
    dragOffset: 0
  });

  const swipeThreshold = 50; // Minimum distance to trigger swipe
  const animationDuration = 300; // ms

  // Handle touch start
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isTouch || charts.length <= 1) return;
    
    const touch = e.touches[0];
    setSwipeState({
      startX: touch.clientX,
      currentX: touch.clientX,
      isDragging: true,
      dragOffset: 0
    });
  }, [isTouch, charts.length]);

  // Handle touch move
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isTouch || !swipeState.isDragging || charts.length <= 1) return;
    
    e.preventDefault();
    const touch = e.touches[0];
    const dragOffset = touch.clientX - swipeState.startX;
    
    setSwipeState(prev => ({
      ...prev,
      currentX: touch.clientX,
      dragOffset
    }));
  }, [isTouch, swipeState.isDragging, swipeState.startX, charts.length]);

  // Handle touch end
  const handleTouchEnd = useCallback(() => {
    if (!isTouch || !swipeState.isDragging || charts.length <= 1) return;
    
    const { dragOffset } = swipeState;
    let newChartIndex = currentChart;
    
    if (Math.abs(dragOffset) > swipeThreshold) {
      if (dragOffset > 0 && currentChart > 0) {
        // Swipe right - previous chart
        newChartIndex = currentChart - 1;
      } else if (dragOffset < 0 && currentChart < charts.length - 1) {
        // Swipe left - next chart
        newChartIndex = currentChart + 1;
      }
    }
    
    setCurrentChart(newChartIndex);
    onChartChange?.(newChartIndex, charts[newChartIndex]);
    
    setSwipeState({
      startX: 0,
      currentX: 0,
      isDragging: false,
      dragOffset: 0
    });
  }, [isTouch, swipeState.isDragging, swipeState.dragOffset, currentChart, charts, onChartChange]);

  // Navigation functions
  const goToChart = useCallback((index: number) => {
    if (index >= 0 && index < charts.length) {
      setCurrentChart(index);
      onChartChange?.(index, charts[index]);
    }
  }, [charts, onChartChange]);

  const goToPrevious = useCallback(() => {
    goToChart(currentChart - 1);
  }, [currentChart, goToChart]);

  const goToNext = useCallback(() => {
    goToChart(currentChart + 1);
  }, [currentChart, goToChart]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrevious, goToNext]);

  // Calculate transform for smooth transitions
  const getTransform = () => {
    const baseTransform = -currentChart * 100;
    const dragTransform = swipeState.isDragging 
      ? (swipeState.dragOffset / (containerRef.current?.offsetWidth || 1)) * 100
      : 0;
    
    return `translateX(${baseTransform + dragTransform}%)`;
  };

  const getTransitionStyle = () => {
    return swipeState.isDragging 
      ? 'none' 
      : `transform ${animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
  };

  if (charts.length === 0) {
    return (
      <div className={`flex items-center justify-center h-64 text-gray-500 ${className}`}>
        No charts available
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Header with title and navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {charts[currentChart]?.title}
          </h3>
          {charts[currentChart]?.subtitle && (
            <p className="text-sm text-gray-600 truncate">
              {charts[currentChart].subtitle}
            </p>
          )}
        </div>
        
        {/* Desktop navigation buttons */}
        {!isMobile && showNavigation && charts.length > 1 && (
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={goToPrevious}
              disabled={currentChart === 0}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous chart"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              disabled={currentChart === charts.length - 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next chart"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Chart container */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-lg bg-white border border-gray-200"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          height: autoHeight ? 'auto' : '400px'
        }}
      >
        <div
          className="flex"
          style={{
            width: `${charts.length * 100}%`,
            transform: getTransform(),
            transition: getTransitionStyle()
          }}
        >
          {charts.map((chart, index) => (
            <div
              key={chart.id}
              className="flex-shrink-0 w-full"
              style={{ width: `${100 / charts.length}%` }}
            >
              <div className={`p-4 ${autoHeight ? '' : 'h-full'}`}>
                {chart.component}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indicators */}
      {showIndicators && charts.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {charts.map((_, index) => (
            <button
              key={index}
              onClick={() => goToChart(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                isTouch ? 'touch-manipulation' : ''
              } ${
                currentChart === index
                  ? 'bg-blue-600 w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to chart ${index + 1}: ${charts[index].title}`}
            />
          ))}
        </div>
      )}

      {/* Mobile navigation tabs */}
      {isMobile && charts.length > 1 && (
        <div className="mt-4 flex overflow-x-auto space-x-2 pb-2">
          {charts.map((chart, index) => (
            <button
              key={chart.id}
              onClick={() => goToChart(index)}
              className={`flex-shrink-0 flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
                currentChart === index
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {chart.icon && <span className="text-base">{chart.icon}</span>}
              <span className="whitespace-nowrap">{chart.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Swipe instruction for mobile */}
      {isMobile && isTouch && charts.length > 1 && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          Swipe left/right to navigate charts
        </div>
      )}

      {/* Chart counter */}
      {charts.length > 1 && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
          {currentChart + 1} / {charts.length}
        </div>
      )}
    </div>
  );
};

// Hook for managing swipeable chart state
export const useSwipeableCharts = (charts: any[], initialChart = 0) => {
  const [currentChart, setCurrentChart] = useState(initialChart);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToChart = useCallback((index: number) => {
    if (index >= 0 && index < charts.length && index !== currentChart) {
      setIsTransitioning(true);
      setCurrentChart(index);
      
      // Reset transition state after animation
      setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
    }
  }, [charts.length, currentChart]);

  const goToNext = useCallback(() => {
    if (currentChart < charts.length - 1) {
      goToChart(currentChart + 1);
    }
  }, [currentChart, charts.length, goToChart]);

  const goToPrevious = useCallback(() => {
    if (currentChart > 0) {
      goToChart(currentChart - 1);
    }
  }, [currentChart, goToChart]);

  return {
    currentChart,
    isTransitioning,
    goToChart,
    goToNext,
    goToPrevious,
    hasNext: currentChart < charts.length - 1,
    hasPrevious: currentChart > 0
  };
};

export default SwipeableChartContainer;