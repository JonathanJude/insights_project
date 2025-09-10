import React, { useEffect, useRef, useState } from 'react';
import { useIsMobile, useIsTouchDevice } from '../../hooks/useMediaQuery';

interface ProgressiveDisclosureFilterProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  level?: 1 | 2 | 3; // Nesting level for visual hierarchy
  className?: string;
  onToggle?: (expanded: boolean) => void;
}

const ProgressiveDisclosureFilter: React.FC<ProgressiveDisclosureFilterProps> = ({
  title,
  subtitle,
  icon,
  badge,
  children,
  defaultExpanded = false,
  level = 1,
  className = '',
  onToggle
}) => {
  const isMobile = useIsMobile();
  const isTouch = useIsTouchDevice();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isAnimating, setIsAnimating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState<number | undefined>(undefined);

  // Measure content height for smooth animations
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [children, isExpanded]);

  const handleToggle = () => {
    setIsAnimating(true);
    setIsExpanded(!isExpanded);
    onToggle?.(!isExpanded);
    
    // Reset animation state after transition
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const getLevelClasses = () => {
    const levelStyles = {
      1: {
        container: 'bg-white border border-gray-200 rounded-lg shadow-sm',
        header: 'px-4 py-3 bg-gray-50',
        content: 'px-4 py-3',
        title: 'text-base font-semibold text-gray-900',
        subtitle: 'text-sm text-gray-600'
      },
      2: {
        container: 'bg-gray-50 border border-gray-100 rounded-md',
        header: 'px-3 py-2 bg-gray-100',
        content: 'px-3 py-2',
        title: 'text-sm font-medium text-gray-800',
        subtitle: 'text-xs text-gray-600'
      },
      3: {
        container: 'bg-gray-25 border border-gray-50 rounded',
        header: 'px-2 py-1.5 bg-gray-50',
        content: 'px-2 py-1.5',
        title: 'text-xs font-medium text-gray-700',
        subtitle: 'text-xs text-gray-500'
      }
    };

    return levelStyles[level];
  };

  const styles = getLevelClasses();

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Header */}
      <button
        onClick={handleToggle}
        className={`w-full ${styles.header} flex items-center justify-between text-left hover:bg-opacity-80 transition-colors ${
          isTouch ? 'touch-manipulation active:bg-opacity-60' : ''
        } ${isExpanded ? 'rounded-t-lg' : 'rounded-lg'}`}
        aria-expanded={isExpanded}
        aria-controls={`disclosure-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Icon */}
          {icon && (
            <div className="flex-shrink-0 text-gray-500">
              {icon}
            </div>
          )}
          
          {/* Title and subtitle */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className={`${styles.title} truncate`}>
                {title}
              </h3>
              
              {/* Badge */}
              {badge && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  typeof badge === 'number' && badge > 0
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {badge}
                </span>
              )}
            </div>
            
            {subtitle && (
              <p className={`${styles.subtitle} truncate mt-0.5`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Expand/collapse indicator */}
        <div className="flex-shrink-0 ml-2">
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 9l-7 7-7-7" 
            />
          </svg>
        </div>
      </button>

      {/* Content */}
      <div
        id={`disclosure-content-${title.replace(/\s+/g, '-').toLowerCase()}`}
        ref={contentRef}
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          height: isExpanded ? (contentHeight ? `${contentHeight}px` : 'auto') : '0px'
        }}
      >
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};

// Specialized components for different filter types
export const MobileFilterSection: React.FC<{
  title: string;
  count?: number;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}> = ({ title, count, children, defaultExpanded = false, className = '' }) => {
  const isMobile = useIsMobile();
  
  return (
    <ProgressiveDisclosureFilter
      title={title}
      badge={count}
      defaultExpanded={defaultExpanded}
      level={1}
      className={className}
      icon={
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
        </svg>
      }
    >
      {children}
    </ProgressiveDisclosureFilter>
  );
};

export const MobileFilterSubsection: React.FC<{
  title: string;
  subtitle?: string;
  count?: number;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}> = ({ title, subtitle, count, children, defaultExpanded = false, className = '' }) => {
  return (
    <ProgressiveDisclosureFilter
      title={title}
      subtitle={subtitle}
      badge={count}
      defaultExpanded={defaultExpanded}
      level={2}
      className={className}
    >
      {children}
    </ProgressiveDisclosureFilter>
  );
};

// Accordion container for multiple progressive disclosure sections
export const MobileFilterAccordion: React.FC<{
  children: React.ReactNode;
  allowMultiple?: boolean;
  className?: string;
}> = ({ children, allowMultiple = true, className = '' }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const handleSectionToggle = (sectionId: string, expanded: boolean) => {
    if (allowMultiple) {
      setExpandedSections(prev => {
        const newSet = new Set(prev);
        if (expanded) {
          newSet.add(sectionId);
        } else {
          newSet.delete(sectionId);
        }
        return newSet;
      });
    } else {
      // Single section mode - close others when opening one
      setExpandedSections(expanded ? new Set([sectionId]) : new Set());
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          const sectionId = `section-${index}`;
          return React.cloneElement(child, {
            ...child.props,
            onToggle: (expanded: boolean) => {
              handleSectionToggle(sectionId, expanded);
              child.props.onToggle?.(expanded);
            }
          });
        }
        return child;
      })}
    </div>
  );
};

// Quick filter chips for common selections
export const MobileQuickFilters: React.FC<{
  filters: Array<{
    id: string;
    label: string;
    count?: number;
    active: boolean;
    onToggle: () => void;
  }>;
  className?: string;
}> = ({ filters, className = '' }) => {
  const isTouch = useIsTouchDevice();

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={filter.onToggle}
          className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            isTouch ? 'touch-manipulation' : ''
          } ${
            filter.active
              ? 'bg-blue-100 text-blue-800 border border-blue-200'
              : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
          }`}
        >
          <span>{filter.label}</span>
          {filter.count !== undefined && filter.count > 0 && (
            <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
              filter.active
                ? 'bg-blue-200 text-blue-900'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {filter.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default ProgressiveDisclosureFilter;