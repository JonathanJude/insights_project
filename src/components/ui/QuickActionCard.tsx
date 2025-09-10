import { ArrowRightIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { QuickAction } from '../../types/quickActions';

interface QuickActionCardProps {
  action: QuickAction;
  variant?: 'default' | 'enhanced' | 'compact';
  className?: string;
  showDescription?: boolean;
  onClick?: (action: QuickAction) => void;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  action,
  variant = 'default',
  className = '',
  showDescription = true,
  onClick
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick(action);
    } else {
      // Default navigation behavior
      if (action.params) {
        const searchParams = new URLSearchParams(action.params);
        navigate(`${action.route}?${searchParams.toString()}`);
      } else {
        navigate(action.route);
      }
    }
  };

  const getBadgeClasses = (badge: string | number) => {
    if (badge === 'New') {
      return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
    }
    if (typeof badge === 'number') {
      return 'bg-red-500 text-white';
    }
    return 'bg-blue-500 text-white';
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'enhanced':
        return `
          relative overflow-hidden group
          bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30
          dark:from-gray-800 dark:via-blue-900/20 dark:to-purple-900/20
          border border-blue-200/50 dark:border-gray-600
          hover:border-blue-300 dark:hover:border-gray-500
          hover:shadow-lg hover:shadow-blue-500/10
          transform hover:scale-[1.02] hover:-translate-y-1
          transition-all duration-300 ease-out
        `;
      case 'compact':
        return `
          bg-white dark:bg-gray-800
          border border-gray-200 dark:border-gray-700
          hover:border-gray-300 dark:hover:border-gray-600
          hover:shadow-md
          transition-all duration-200
        `;
      default:
        return `
          bg-white/80 backdrop-blur-sm
          border border-white/50
          hover:bg-white hover:shadow-md
          transition-all duration-200
        `;
    }
  };

  const IconComponent = action.icon;

  return (
    <button
      onClick={handleClick}
      className={`
        w-full flex items-center justify-between p-3 lg:p-4 rounded-lg group touch-manipulation
        ${getVariantClasses()}
        ${className}
      `}
      aria-label={`${action.label}: ${action.description}`}
    >
      {/* Enhanced variant background effects */}
      {variant === 'enhanced' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-xl transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500"></div>
        </>
      )}

      <div className="relative flex items-center space-x-3 flex-1 min-w-0">
        {/* Icon */}
        <div className={`
          flex-shrink-0 p-2 rounded-lg transition-all duration-200
          ${variant === 'enhanced' 
            ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 group-hover:from-blue-500/20 group-hover:to-purple-500/20' 
            : 'bg-gray-50 dark:bg-gray-700 group-hover:bg-gray-100 dark:group-hover:bg-gray-600'
          }
        `}>
          <IconComponent className={`
            h-4 w-4 lg:h-5 lg:w-5 transition-all duration-200
            ${variant === 'enhanced'
              ? 'text-blue-600 dark:text-blue-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:scale-110'
              : 'text-gray-500 group-hover:text-blue-600 transition-colors duration-200'
            }
          `} />
        </div>

        {/* Content */}
        <div className="text-left min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <span className={`
              text-sm font-semibold block truncate transition-colors duration-200
              ${variant === 'enhanced'
                ? 'text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white'
                : 'text-gray-700 group-hover:text-gray-900'
              }
            `}>
              {action.label}
            </span>
            
            {/* Badge */}
            {action.badge && (
              <span className={`
                text-xs px-2 py-1 rounded-full font-medium shadow-sm transition-all duration-200 group-hover:scale-105
                ${getBadgeClasses(action.badge)}
              `}>
                {action.badge}
              </span>
            )}

            {/* Enhanced indicator */}
            {action.category === 'analysis' && variant === 'enhanced' && (
              <span className="text-sm transition-transform group-hover:scale-110 group-hover:rotate-12">
                ✨
              </span>
            )}
          </div>
          
          {showDescription && (
            <span className={`
              text-xs block truncate transition-colors duration-200 mt-1
              ${variant === 'enhanced'
                ? 'text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300'
                : 'text-gray-500 group-hover:text-gray-600'
              }
            `}>
              {action.description}
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <ArrowRightIcon className={`
        h-4 w-4 flex-shrink-0 transition-all duration-200
        ${variant === 'enhanced'
          ? 'text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 group-hover:scale-110'
          : 'text-gray-400 group-hover:text-blue-600 transition-colors duration-200'
        }
      `} />
    </button>
  );
};

export default QuickActionCard;