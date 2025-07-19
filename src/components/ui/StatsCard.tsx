import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconColor?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
  isLoading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor = 'text-blue-600',
  trend,
  description,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="interactive-card animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4 mb-3"></div>
            <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/2 mb-3"></div>
            <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-full"></div>
          </div>
          <div className="w-14 h-14 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // Determine icon background gradient based on iconColor
  const getIconBgGradient = (color: string) => {
    if (color.includes('green')) return 'success-gradient';
    if (color.includes('red')) return 'danger-gradient';
    if (color.includes('yellow')) return 'warning-gradient';
    if (color.includes('blue')) return 'primary-gradient';
    if (color.includes('purple')) return 'primary-gradient';
    return 'secondary-gradient';
  };

  return (
    <div className="interactive-card group relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 mb-2 tracking-wide uppercase">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">{value}</p>
          
          {/* Trend indicator */}
          {trend && (
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${
                trend.isPositive 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {trend.isPositive ? (
                  <ArrowUpIcon className="h-3 w-3" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3" />
                )}
                <span>
                  {trend.value.toFixed(1)}%
                </span>
              </div>
              {description && (
                <span className="text-xs text-gray-500 font-medium">{description}</span>
              )}
            </div>
          )}
          
          {/* Description without trend */}
          {description && !trend && (
            <p className="text-xs text-gray-500 font-medium">{description}</p>
          )}
        </div>
        
        {/* Icon */}
        <div className={`p-4 rounded-xl ${getIconBgGradient(iconColor)} shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
          <Icon className="h-7 w-7 text-white" />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;