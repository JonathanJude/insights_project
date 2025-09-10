import React from 'react';
import { useIsMobile, useIsTablet, useIsTouchDevice } from '../../hooks/useMediaQuery';

interface ResponsiveAnalysisGridProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'compact' | 'cards' | 'charts';
  minItemWidth?: string;
  gap?: 'sm' | 'md' | 'lg';
}

const ResponsiveAnalysisGrid: React.FC<ResponsiveAnalysisGridProps> = ({
  children,
  className = '',
  variant = 'default',
  minItemWidth = '300px',
  gap = 'md'
}) => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isTouch = useIsTouchDevice();

  const getGridClasses = () => {
    const gapClasses = {
      sm: 'gap-2 sm:gap-3',
      md: 'gap-3 sm:gap-4 lg:gap-6',
      lg: 'gap-4 sm:gap-6 lg:gap-8'
    };

    const variantClasses = {
      default: isMobile 
        ? 'grid grid-cols-1' 
        : isTablet 
          ? 'grid grid-cols-1 md:grid-cols-2' 
          : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      
      compact: isMobile 
        ? 'grid grid-cols-1' 
        : isTablet 
          ? 'grid grid-cols-2' 
          : 'grid grid-cols-2 lg:grid-cols-4',
      
      cards: isMobile 
        ? 'grid grid-cols-1' 
        : isTablet 
          ? 'grid grid-cols-1 sm:grid-cols-2' 
          : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      
      charts: isMobile 
        ? 'flex flex-col' 
        : isTablet 
          ? 'grid grid-cols-1 lg:grid-cols-2' 
          : 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'
    };

    return `${variantClasses[variant]} ${gapClasses[gap]}`;
  };

  const getTouchClasses = () => {
    return isTouch ? 'touch-manipulation' : '';
  };

  // For mobile, we might want to use CSS Grid with auto-fit for better responsiveness
  const getAutoFitStyle = () => {
    if (variant === 'default' && !isMobile) {
      return {
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`,
        gap: gap === 'sm' ? '0.75rem' : gap === 'md' ? '1rem' : '1.5rem'
      };
    }
    return {};
  };

  return (
    <div 
      className={`${getGridClasses()} ${getTouchClasses()} ${className}`}
      style={getAutoFitStyle()}
    >
      {children}
    </div>
  );
};

// Specialized grid components for different content types
export const MobileChartGrid: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-1 lg:grid-cols-2 gap-6'} ${className}`}>
      {children}
    </div>
  );
};

export const MobileCardGrid: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  
  return (
    <div className={`${
      isMobile 
        ? 'grid grid-cols-1 gap-3' 
        : isTablet 
          ? 'grid grid-cols-2 gap-4' 
          : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
    } ${className}`}>
      {children}
    </div>
  );
};

export const MobileStatsGrid: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`${
      isMobile 
        ? 'grid grid-cols-2 gap-3' 
        : 'grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4'
    } ${className}`}>
      {children}
    </div>
  );
};

// Mobile-optimized container for analysis pages
export const MobileAnalysisContainer: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}> = ({ 
  children, 
  className = '',
  padding = 'md'
}) => {
  const isMobile = useIsMobile();
  const isTouch = useIsTouchDevice();
  
  const paddingClasses = {
    sm: isMobile ? 'p-3' : 'p-4',
    md: isMobile ? 'p-4' : 'p-6',
    lg: isMobile ? 'p-4' : 'p-8'
  };
  
  return (
    <div className={`
      ${paddingClasses[padding]}
      ${isTouch ? 'touch-manipulation' : ''}
      ${isMobile ? 'space-y-4' : 'space-y-6'}
      ${className}
    `}>
      {children}
    </div>
  );
};

// Mobile-optimized section wrapper
export const MobileSection: React.FC<{ 
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}> = ({ 
  children, 
  title,
  subtitle,
  className = '',
  collapsible = false,
  defaultExpanded = true
}) => {
  const isMobile = useIsMobile();
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
  
  const handleToggle = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {(title || subtitle) && (
        <div 
          className={`px-4 py-3 border-b border-gray-200 ${collapsible && isMobile ? 'cursor-pointer' : ''}`}
          onClick={handleToggle}
        >
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className={`font-semibold text-gray-900 ${isMobile ? 'text-base' : 'text-lg'}`}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className={`text-gray-600 ${isMobile ? 'text-xs mt-1' : 'text-sm'}`}>
                  {subtitle}
                </p>
              )}
            </div>
            {collapsible && isMobile && (
              <svg
                className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>
      )}
      
      <div className={`${(!collapsible || isExpanded) ? 'block' : 'hidden'} ${isMobile ? 'p-4' : 'p-6'}`}>
        {children}
      </div>
    </div>
  );
};

export default ResponsiveAnalysisGrid;