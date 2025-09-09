import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/solid';
import React from 'react';

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
      <div className="interactive-card p-8">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-3/4 mb-4 animate-pulse"></div>
            <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-1/2 mb-4 animate-pulse"></div>
            <div className="h-3 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg w-full animate-pulse"></div>
          </div>
          <div className="w-16 h-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-2xl animate-pulse"></div>
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
    <div className="interactive-card group relative overflow-hidden p-8">
      {/* Enhanced background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-purple-50/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Subtle border accent */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-500 mb-3 tracking-wider uppercase letter-spacing-wide">{title}</p>
          <p className="text-4xl font-black text-gray-900 mb-4 tracking-tight leading-none">{value}</p>
          
          {/* Trend indicator */}
          {trend && (
            <div className="flex items-center space-x-3 mb-2">
              <div className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                trend.isPositive 
                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200/60' 
                  : 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200/60'
              }`}>
                {trend.isPositive ? (
                  <ArrowUpIcon className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownIcon className="h-3.5 w-3.5" />
                )}
                <span>
                  {trend.value.toFixed(1)}%
                </span>
              </div>
            </div>
          )}
          
          {/* Description */}
          {description && (
            <p className="text-sm text-gray-600 font-medium leading-relaxed">{description}</p>
          )}
        </div>
        
        {/* Enhanced Icon */}
        <div className="flex-shrink-0 ml-6">
          <div className={`p-5 rounded-2xl ${getIconBgGradient(iconColor)} shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;