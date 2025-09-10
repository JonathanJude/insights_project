import React, { useCallback, useRef, useState } from 'react';
import { useIsMobile, useIsTouchDevice } from '../../hooks/useMediaQuery';

interface MobileOptimizedMapProps {
  data: Array<{
    id: string;
    name: string;
    value: number;
    sentiment?: number;
    color?: string;
    coordinates?: { x: number; y: number; width: number; height: number };
  }>;
  width?: number;
  height?: number;
  onRegionClick?: (region: any) => void;
  onRegionTouch?: (region: any) => void;
  className?: string;
  enableZoom?: boolean;
  enablePan?: boolean;
  minZoom?: number;
  maxZoom?: number;
}

interface TouchState {
  scale: number;
  translateX: number;
  translateY: number;
  isDragging: boolean;
  isPinching: boolean;
  lastTouchDistance: number;
  startX: number;
  startY: number;
}

const MobileOptimizedMap: React.FC<MobileOptimizedMapProps> = ({
  data,
  width = 400,
  height = 300,
  onRegionClick,
  onRegionTouch,
  className = '',
  enableZoom = true,
  enablePan = true,
  minZoom = 0.5,
  maxZoom = 3
}) => {
  const isMobile = useIsMobile();
  const isTouch = useIsTouchDevice();
  const mapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  const [touchState, setTouchState] = useState<TouchState>({
    scale: 1,
    translateX: 0,
    translateY: 0,
    isDragging: false,
    isPinching: false,
    lastTouchDistance: 0,
    startX: 0,
    startY: 0
  });
  
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    content: any;
  }>({ visible: false, x: 0, y: 0, content: null });

  // Calculate distance between two touch points
  const getTouchDistance = (touches: TouchList) => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) + 
      Math.pow(touch2.clientY - touch1.clientY, 2)
    );
  };

  // Touch event handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isTouch) return;
    
    e.preventDefault();
    
    if (e.touches.length === 1) {
      // Single touch - start dragging
      const touch = e.touches[0];
      setTouchState(prev => ({
        ...prev,
        isDragging: enablePan,
        startX: touch.clientX - prev.translateX,
        startY: touch.clientY - prev.translateY
      }));
    } else if (e.touches.length === 2 && enableZoom) {
      // Two touches - start pinching
      const distance = getTouchDistance(e.touches);
      setTouchState(prev => ({
        ...prev,
        isPinching: true,
        isDragging: false,
        lastTouchDistance: distance
      }));
    }
  }, [isTouch, enablePan, enableZoom]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isTouch) return;
    
    e.preventDefault();
    
    if (touchState.isDragging && e.touches.length === 1) {
      // Single touch drag
      const touch = e.touches[0];
      setTouchState(prev => ({
        ...prev,
        translateX: touch.clientX - prev.startX,
        translateY: touch.clientY - prev.startY
      }));
    } else if (touchState.isPinching && e.touches.length === 2) {
      // Pinch zoom
      const distance = getTouchDistance(e.touches);
      const scaleDelta = distance / touchState.lastTouchDistance;
      
      setTouchState(prev => {
        const newScale = Math.max(minZoom, Math.min(maxZoom, prev.scale * scaleDelta));
        return {
          ...prev,
          scale: newScale,
          lastTouchDistance: distance
        };
      });
    }
  }, [isTouch, touchState.isDragging, touchState.isPinching, touchState.lastTouchDistance, minZoom, maxZoom]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isTouch) return;
    
    setTouchState(prev => ({
      ...prev,
      isDragging: false,
      isPinching: false
    }));

    // Handle tap on region
    if (e.changedTouches.length === 1 && !touchState.isDragging && !touchState.isPinching) {
      const touch = e.changedTouches[0];
      const rect = svgRef.current?.getBoundingClientRect();
      
      if (rect) {
        const x = (touch.clientX - rect.left - touchState.translateX) / touchState.scale;
        const y = (touch.clientY - rect.top - touchState.translateY) / touchState.scale;
        
        // Find clicked region (simplified - would need actual SVG path hit testing)
        const clickedRegion = data.find(region => {
          if (!region.coordinates) return false;
          return (
            x >= region.coordinates.x &&
            x <= region.coordinates.x + region.coordinates.width &&
            y >= region.coordinates.y &&
            y <= region.coordinates.y + region.coordinates.height
          );
        });
        
        if (clickedRegion) {
          setSelectedRegion(clickedRegion.id);
          onRegionTouch?.(clickedRegion);
          
          // Show tooltip
          setTooltip({
            visible: true,
            x: touch.clientX,
            y: touch.clientY - 60,
            content: clickedRegion
          });
          
          // Hide tooltip after 3 seconds
          setTimeout(() => {
            setTooltip(prev => ({ ...prev, visible: false }));
          }, 3000);
        }
      }
    }
  }, [isTouch, touchState.isDragging, touchState.isPinching, touchState.translateX, touchState.translateY, touchState.scale, data, onRegionTouch]);

  // Reset zoom and pan
  const handleReset = useCallback(() => {
    setTouchState({
      scale: 1,
      translateX: 0,
      translateY: 0,
      isDragging: false,
      isPinching: false,
      lastTouchDistance: 0,
      startX: 0,
      startY: 0
    });
    setSelectedRegion(null);
    setTooltip(prev => ({ ...prev, visible: false }));
  }, []);

  // Double tap to reset
  const handleDoubleClick = useCallback(() => {
    if (isMobile) {
      handleReset();
    }
  }, [isMobile, handleReset]);

  // Mouse handlers for desktop
  const handleMouseClick = useCallback((e: React.MouseEvent, region: any) => {
    if (!isMobile) {
      setSelectedRegion(region.id);
      onRegionClick?.(region);
    }
  }, [isMobile, onRegionClick]);

  // Generate simplified Nigeria map (placeholder - would use actual SVG paths)
  const generateNigeriaRegions = () => {
    const regions = [
      { id: 'lagos', name: 'Lagos', x: 50, y: 200, width: 40, height: 30 },
      { id: 'kano', name: 'Kano', x: 150, y: 80, width: 50, height: 40 },
      { id: 'rivers', name: 'Rivers', x: 120, y: 220, width: 45, height: 35 },
      { id: 'kaduna', name: 'Kaduna', x: 130, y: 120, width: 55, height: 40 },
      { id: 'oyo', name: 'Oyo', x: 80, y: 180, width: 40, height: 35 },
      { id: 'fct', name: 'FCT Abuja', x: 160, y: 160, width: 25, height: 25 }
    ];

    return regions.map(region => {
      const regionData = data.find(d => d.name.toLowerCase().includes(region.name.toLowerCase()));
      const sentiment = regionData?.sentiment || 0;
      const color = regionData?.color || getSentimentColor(sentiment);
      
      return {
        ...region,
        ...regionData,
        coordinates: { x: region.x, y: region.y, width: region.width, height: region.height },
        color
      };
    });
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.1) return '#10B981'; // Green
    if (sentiment < -0.1) return '#EF4444'; // Red
    return '#6B7280'; // Gray
  };

  const regions = generateNigeriaRegions();

  const mapStyle = {
    transform: `translate(${touchState.translateX}px, ${touchState.translateY}px) scale(${touchState.scale})`,
    transformOrigin: 'center center',
    transition: touchState.isDragging || touchState.isPinching ? 'none' : 'transform 0.2s ease-out'
  };

  return (
    <div className={`relative ${className}`}>
      {/* Mobile controls */}
      {isMobile && (
        <div className="absolute top-2 right-2 z-10 flex flex-col space-y-2">
          <button
            onClick={handleReset}
            className="bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 shadow-md touch-manipulation"
            title="Reset zoom and pan"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          
          {/* Zoom level indicator */}
          <div className="bg-white bg-opacity-90 rounded-full px-2 py-1 text-xs font-medium text-gray-600">
            {Math.round(touchState.scale * 100)}%
          </div>
        </div>
      )}

      {/* Map container */}
      <div
        ref={mapRef}
        className={`overflow-hidden rounded-lg border border-gray-200 ${
          isTouch ? 'touch-manipulation' : ''
        } ${enablePan ? 'cursor-grab active:cursor-grabbing' : ''}`}
        style={{ width, height }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
      >
        <svg
          ref={svgRef}
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          style={mapStyle}
        >
          {/* Background */}
          <rect width={width} height={height} fill="#F3F4F6" />
          
          {/* Regions */}
          {regions.map((region) => (
            <g key={region.id}>
              {/* Region rectangle (simplified representation) */}
              <rect
                x={region.coordinates?.x}
                y={region.coordinates?.y}
                width={region.coordinates?.width}
                height={region.coordinates?.height}
                fill={region.color}
                stroke={selectedRegion === region.id ? '#3B82F6' : '#FFFFFF'}
                strokeWidth={selectedRegion === region.id ? 3 : 1}
                className={`transition-all duration-200 ${
                  !isMobile ? 'hover:stroke-blue-500 hover:stroke-2 cursor-pointer' : ''
                }`}
                onClick={(e) => handleMouseClick(e, region)}
                opacity={0.8}
              />
              
              {/* Region label */}
              <text
                x={(region.coordinates?.x || 0) + (region.coordinates?.width || 0) / 2}
                y={(region.coordinates?.y || 0) + (region.coordinates?.height || 0) / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-medium fill-white pointer-events-none"
                style={{ fontSize: Math.max(8, 12 / touchState.scale) }}
              >
                {region.name}
              </text>
              
              {/* Sentiment value */}
              {region.sentiment !== undefined && (
                <text
                  x={(region.coordinates?.x || 0) + (region.coordinates?.width || 0) / 2}
                  y={(region.coordinates?.y || 0) + (region.coordinates?.height || 0) / 2 + 12}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs fill-white pointer-events-none"
                  style={{ fontSize: Math.max(6, 10 / touchState.scale) }}
                >
                  {region.sentiment.toFixed(2)}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-center space-x-4 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
          <span>Positive</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-gray-400 rounded mr-2"></div>
          <span>Neutral</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
          <span>Negative</span>
        </div>
      </div>

      {/* Mobile instructions */}
      {isMobile && (enableZoom || enablePan) && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          {enablePan && enableZoom && "Tap regions • Drag to pan • Pinch to zoom • Double tap to reset"}
          {enablePan && !enableZoom && "Tap regions • Drag to pan • Double tap to reset"}
          {!enablePan && enableZoom && "Tap regions • Pinch to zoom • Double tap to reset"}
        </div>
      )}

      {/* Touch tooltip */}
      {tooltip.visible && tooltip.content && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-sm rounded-lg px-3 py-2 shadow-lg pointer-events-none max-w-xs"
          style={{
            left: `${Math.min(tooltip.x, window.innerWidth - 200)}px`,
            top: `${Math.max(tooltip.y, 60)}px`,
            transform: 'translateX(-50%)'
          }}
        >
          <div className="font-medium">{tooltip.content.name}</div>
          {tooltip.content.sentiment !== undefined && (
            <div className="text-xs mt-1">
              Sentiment: {tooltip.content.sentiment.toFixed(2)}
            </div>
          )}
          {tooltip.content.value !== undefined && (
            <div className="text-xs">
              Value: {tooltip.content.value.toLocaleString()}
            </div>
          )}
          
          {/* Tooltip arrow */}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2">
            <div className="border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileOptimizedMap;