import React from 'react';

// Mobile-optimized chart components and utilities
export { default as TouchFriendlyChart, withTouchInteraction, useTouchChartInteractions } from './TouchFriendlyChart';
export { default as MobileOptimizedMap } from './MobileOptimizedMap';
export { default as SwipeableChartContainer, useSwipeableCharts } from './SwipeableChartContainer';
export { 
  default as MobileChartWrapper, 
  MobileSentimentChart, 
  MobileGeographicChart, 
  MobileDemographicChart,
  useMobileChart 
} from './MobileChartWrapper';

// Re-export existing chart components for consistency
export * from './index';

// Mobile chart configuration constants
export const MOBILE_CHART_CONFIG = {
  // Default heights for different screen sizes
  heights: {
    mobile: {
      small: 200,
      medium: 250,
      large: 300,
      fullscreen: 'calc(100vh - 120px)'
    },
    tablet: {
      small: 250,
      medium: 300,
      large: 400,
      fullscreen: 'calc(100vh - 120px)'
    },
    desktop: {
      small: 300,
      medium: 400,
      large: 500,
      fullscreen: 'calc(100vh - 120px)'
    }
  },
  
  // Touch interaction settings
  touch: {
    swipeThreshold: 50,
    pinchThreshold: 0.1,
    tapTimeout: 300,
    longPressTimeout: 500,
    animationDuration: 300
  },
  
  // Responsive breakpoints
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1280
  },
  
  // Chart-specific mobile optimizations
  optimizations: {
    sentiment: {
      enableZoom: true,
      enablePan: true,
      enableTooltipOnTouch: true,
      mobileHeight: 250
    },
    geographic: {
      enableZoom: true,
      enablePan: true,
      enableTooltipOnTouch: true,
      mobileHeight: 300,
      showFullscreenButton: true
    },
    demographic: {
      enableZoom: false,
      enablePan: false,
      enableTooltipOnTouch: true,
      mobileHeight: 250
    },
    temporal: {
      enableZoom: true,
      enablePan: true,
      enableTooltipOnTouch: true,
      mobileHeight: 200
    },
    engagement: {
      enableZoom: false,
      enablePan: false,
      enableTooltipOnTouch: true,
      mobileHeight: 250
    }
  }
};

// Utility functions for mobile chart optimization
export const getMobileChartHeight = (chartType: keyof typeof MOBILE_CHART_CONFIG.optimizations, size: 'small' | 'medium' | 'large' = 'medium') => {
  const isMobile = window.innerWidth < MOBILE_CHART_CONFIG.breakpoints.mobile;
  const isTablet = window.innerWidth < MOBILE_CHART_CONFIG.breakpoints.tablet;
  
  if (isMobile) {
    return MOBILE_CHART_CONFIG.heights.mobile[size];
  } else if (isTablet) {
    return MOBILE_CHART_CONFIG.heights.tablet[size];
  } else {
    return MOBILE_CHART_CONFIG.heights.desktop[size];
  }
};

export const getMobileChartConfig = (chartType: keyof typeof MOBILE_CHART_CONFIG.optimizations) => {
  return MOBILE_CHART_CONFIG.optimizations[chartType];
};

export const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export const isMobileDevice = () => {
  return window.innerWidth < MOBILE_CHART_CONFIG.breakpoints.mobile;
};

// Chart wrapper factory for consistent mobile optimization
export const createMobileOptimizedChart = (
  ChartComponent: React.ComponentType<any>,
  chartType: keyof typeof MOBILE_CHART_CONFIG.optimizations,
  defaultProps: any = {}
) => {
  return React.forwardRef<any, any>((props, ref) => {
    const config = getMobileChartConfig(chartType);
    const height = getMobileChartHeight(chartType);
    
    return (
      <MobileChartWrapper
        {...defaultProps}
        {...props}
        height={height}
        mobileHeight={config.mobileHeight}
        enableZoom={config.enableZoom}
        enablePan={config.enablePan}
        enableTooltipOnTouch={config.enableTooltipOnTouch}
        showFullscreenButton={config.showFullscreenButton}
        ref={ref}
      >
        <ChartComponent {...props} />
      </MobileChartWrapper>
    );
  });
};