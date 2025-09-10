import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface PageLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  showBreadcrumbs?: boolean;
  customBreadcrumbs?: BreadcrumbItem[];
  headerActions?: React.ReactNode;
  badge?: {
    text: string;
    color?: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'indigo';
  };
}

const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  subtitle,
  children,
  className = '',
  showBreadcrumbs = true,
  customBreadcrumbs,
  headerActions,
  badge
}) => {
  const location = useLocation();

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customBreadcrumbs) return customBreadcrumbs;

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Dashboard', href: '/' }
    ];

    // Map path segments to readable labels
    const segmentLabels: Record<string, string> = {
      'analysis': 'Advanced Analysis',
      'geographic': 'Geographic Analysis',
      'demographic': 'Demographic Insights',
      'sentiment': 'Sentiment Deep Dive',
      'topics': 'Topic Trends',
      'engagement': 'Engagement Patterns',
      'temporal': 'Time Analysis',
      'party': 'Party Analytics',
      'politician': 'Politicians',
      'search': 'Search',
      'trending': 'Trending',
      'profile': 'Profile'
    };

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Skip dynamic segments (like IDs)
      if (segment.match(/^[a-f0-9-]{36}$/) || segment.match(/^\d+$/)) {
        return;
      }

      breadcrumbs.push({
        label: segmentLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: isLast ? undefined : currentPath,
        current: isLast
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const getBadgeClasses = (color: string = 'blue') => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      red: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Breadcrumbs */}
      {showBreadcrumbs && breadcrumbs.length > 1 && (
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            {breadcrumbs.map((item, index) => (
              <li key={index} className="flex items-center">
                {index > 0 && (
                  <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-2" />
                )}
                
                {index === 0 && (
                  <HomeIcon className="h-4 w-4 text-gray-400 mr-2" />
                )}
                
                {item.href && !item.current ? (
                  <Link
                    to={item.href}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200 hover:underline"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className={`
                    ${item.current 
                      ? 'text-gray-900 dark:text-white font-medium' 
                      : 'text-gray-500 dark:text-gray-400'
                    }
                  `}>
                    {item.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient">
              {title}
            </h1>
            
            {/* Badge */}
            {badge && (
              <span className={`
                inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm
                ${getBadgeClasses(badge.color)}
              `}>
                {badge.text}
              </span>
            )}

            {/* Enhanced indicator for analysis pages */}
            {location.pathname.startsWith('/analysis/') && (
              <span className="text-2xl animate-pulse">✨</span>
            )}
          </div>
          
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {/* Header Actions */}
        {headerActions && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            {headerActions}
          </div>
        )}
      </div>

      {/* Page Content */}
      <div className="page-content">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;