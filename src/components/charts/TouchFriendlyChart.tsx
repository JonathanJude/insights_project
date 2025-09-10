import React, { useCallback, useRef, useState } from 'react';
import { ResponsiveContainer } from 'recharts';
import { useIsMobile, useIsTouchDevice } from '../../hooks/useMediaQuery';

interface TouchFriendlyChartProps {
  children: React.ReactNode;
  data: any[];
  height?: number;
  enableZoom?: boolean;
  enablePan?: boolean;
  enableTooltipOnTouch?: boolean;
  className?: string;
  onDataPointTouch?: (data: any, index: number) => void;
}

interface TouchState {
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  scale: number;
  translateX: number;
  translateY: number;
  isDragging: boolean;
  isPinching: boolean;
}

const TouchFriendlyChart: React.FC<TouchFriendlyChartProps> = ({
  children,
  data,
  height = 300,
  enableZoom = true,
  enablePan = true,
  enableTooltipOnTouch = true,
  className = '',
  onDataPointTouch
}) => {
  const isMobile = useIsMobile();
  const isTouch = useIsTouchDevice();
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchState, setTouchState] = useState<TouchState>({
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    scale: 1,
    translateX: 0,
    translateY: 0,
    isDragging: false,
    isPinching: false
  });
  const [activeTooltip, setActiveTooltip] = useState<{ data: any; x: number; y: number } | null>(null);

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isTouch || !enablePan) return;

    const touch = e.touches[0];
    setTouchState(prev => ({
      ...prev,
      startX: touch.clientX,
      startY: touch.clientY,
      lastX: touch.clientX,
      lastY: touch.clientY,
      isDragging: e.touches.length === 1,
      isPinching: e.touches.length === 2
    }));

    // Handle tooltip on touch
    if (enableTooltipOnTouch && e.touches.length === 1) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        // Calculate which data point was touched (simplified)
        const dataIndex = Math.floor((x / rect.width) * data.length);
        if (dataIndex >= 0 && dataIndex < data.length) {
          setActiveTooltip({
            data: data[dataIndex],
            x: touch.clientX,
            y: touch.clientY
          });
          
          if (onDataPointTouch) {
            onDataPointTouch(data[dataIndex], dataIndex);
          }
        }
      }
    }
  }, [isTouch, enablePan, enableTooltipOnTouch, data, onDataPointTouch]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isTouch || !enablePan) return;

    e.preventDefault(); // Prevent scrolling

    if (touchState.isDragging && e.touches.length === 1) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchState.lastX;
      const deltaY = touch.clientY - touchState.lastY;

      setTouchState(prev => ({
        ...prev,
        translateX: prev.translateX + deltaX,
        translateY: prev.translateY + deltaY,
        lastX: touch.clientX,
        lastY: touch.clientY
      }));
    } else if (touchState.isPinching && e.touches.length === 2 && enableZoom) {
      // Handle pinch-to-zoom
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      // This is a simplified zoom implementation
      // In a real implementation, you'd want to track the initial distance
      const newScale = Math.max(0.5, Math.min(3, touchState.scale * (distance / 100)));
      
      setTouchState(prev => ({
        ...prev,
        scale: newScale
      }));
    }
  }, [isTouch, enablePan, enableZoom, touchState]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isTouch) return;

    setTouchState(prev => ({
      ...prev,
      isDragging: false,
      isPinching: false
    }));

    // Hide tooltip after a delay
    if (activeTooltip) {
      setTimeout(() => {
        setActiveTooltip(null);
      }, 2000);
    }
  }, [isTouch, activeTooltip]);

  // Reset zoom and pan
  const handleReset = useCallback(() => {
    setTouchState({
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
      scale: 1,
      translateX: 0,
      translateY: 0,
      isDragging: false,
      isPinching: false
    });
    setActiveTooltip(null);
  }, []);

  // Double tap to reset (mobile)
  const handleDoubleClick = useCallback(() => {
    if (isMobile) {
      handleReset();
    }
  }, [isMobile, handleReset]);

  const containerStyle = {
    transform: `translate(${touchState.translateX}px, ${touchState.translateY}px) scale(${touchState.scale})`,
    transformOrigin: 'center center',
    transition: touchState.isDragging || touchState.isPinching ? 'none' : 'transform 0.2s ease-out'
  };

  return (
    <div className={`relative ${className}`}>
      {/* Mobile controls */}
      {isMobile && (enableZoom || enablePan) && (
        <div className="absolute top-2 right-2 z-10 flex space-x-2">
          <button
            onClick={handleReset}
            className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-md touch-manipulation"
            title="Reset zoom and pan"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      )}

      {/* Chart container */}
      <div
        ref={containerRef}
        className={`${isTouch ? 'touch-manipulation' : ''} ${enablePan ? 'cursor-grab active:cursor-grabbing' : ''}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
        style={{
          height: `${height}px`,
          overflow: 'hidden',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none'
        }}
      >
        <div style={containerStyle}>
          <ResponsiveContainer width="100%" height={height}>
            {children}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Touch tooltip */}
      {activeTooltip && isMobile && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none"
          style={{
            left: `${activeTooltip.x}px`,
            top: `${activeTooltip.y - 60}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="space-y-1">
            {Object.entries(activeTooltip.data).map(([key, value]) => (
              <div key={key} className="flex justify-between space-x-2">
                <span className="capitalize">{key}:</span>
                <span className="font-medium">
                  {typeof value === 'number' ? value.toFixed(2) : String(value)}
                </span>
              </div>
            ))}
          </div>
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}

      {/* Instructions for mobile users */}
      {isMobile && (enableZoom || enablePan) && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          {enablePan && enableZoom && "Drag to pan • Pinch to zoom • Double tap to reset"}
          {enablePan && !enableZoom && "Drag to pan • Double tap to reset"}
          {!enablePan && enableZoom && "Pinch to zoom • Double tap to reset"}
        </div>
      )}
    </div>
  );
};

// Higher-order component to wrap existing charts with touch functionality
export const withTouchInteraction = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  defaultOptions: Partial<TouchFriendlyChartProps> = {}
) => {
  return React.forwardRef<any, P & Partial<TouchFriendlyChartProps>>((props, ref) => {
    const { data, height, enableZoom, enablePan, enableTooltipOnTouch, onDataPointTouch, ...restProps } = props;
    
    if (!data) {
      return <WrappedComponent {...restProps as P} ref={ref} />;
    }

    return (
      <TouchFriendlyChart
        data={data}
        height={height || defaultOptions.height}
        enableZoom={enableZoom ?? defaultOptions.enableZoom}
        enablePan={enablePan ?? defaultOptions.enablePan}
        enableTooltipOnTouch={enableTooltipOnTouch ?? defaultOptions.enableTooltipOnTouch}
        onDataPointTouch={onDataPointTouch || defaultOptions.onDataPointTouch}
      >
        <WrappedComponent {...restProps as P} ref={ref} />
      </TouchFriendlyChart>
    );
  });
};

// Custom hook for touch chart interactions
export const useTouchChartInteractions = (data: any[]) => {
  const isMobile = useIsMobile();
  const isTouch = useIsTouchDevice();
  const [selectedDataPoint, setSelectedDataPoint] = useState<any>(null);
  const [isInteracting, setIsInteracting] = useState(false);

  const handleDataPointTouch = useCallback((dataPoint: any, index: number) => {
    setSelectedDataPoint({ ...dataPoint, index });
    setIsInteracting(true);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setIsInteracting(false);
    }, 3000);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedDataPoint(null);
    setIsInteracting(false);
  }, []);

  return {
    isMobile,
    isTouch,
    selectedDataPoint,
    isInteracting,
    handleDataPointTouch,
    clearSelection
  };
};

export default TouchFriendlyChart;