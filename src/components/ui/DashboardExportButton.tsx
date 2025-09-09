import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { DashboardExportData, exportDashboardStats } from '../../lib/exportUtils';

interface DashboardExportButtonProps {
  stats: {
    totalPoliticians: number;
    totalMentions: number;
    overallSentiment: {
      positive: number;
      neutral: number;
      negative: number;
    };
    lastUpdated: string;
  };
  timeRange?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const DashboardExportButton: React.FC<DashboardExportButtonProps> = ({
  stats,
  timeRange = 'Last 30 days',
  className = '',
  size = 'md'
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Calculate average sentiment
      const totalSentiment = stats.overallSentiment.positive + stats.overallSentiment.neutral + stats.overallSentiment.negative;
      const averageSentiment = totalSentiment > 0 
        ? (stats.overallSentiment.positive - stats.overallSentiment.negative) / totalSentiment * 100
        : 0;

      const exportData: DashboardExportData = {
        totalPoliticians: stats.totalPoliticians,
        totalMentions: stats.totalMentions,
        averageSentiment,
        positivePercentage: stats.overallSentiment.positive,
        neutralPercentage: stats.overallSentiment.neutral,
        negativePercentage: stats.overallSentiment.negative,
        exportDate: new Date().toISOString(),
        timeRange
      };

      exportDashboardStats(exportData);
    } catch (error) {
      console.error('Dashboard export failed:', error);
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('Export failed. Please try again.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`
        ${sizeClasses[size]}
        ${className}
        inline-flex items-center justify-center
        bg-white dark:bg-gray-800 
        border border-gray-300 dark:border-gray-600 
        rounded-md shadow-sm
        text-gray-700 dark:text-gray-300
        hover:bg-gray-50 dark:hover:bg-gray-700
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors duration-200
      `}
      title="Export dashboard statistics"
    >
      <ArrowDownTrayIcon className={`${iconSizes[size]} ${size !== 'sm' ? 'mr-2' : ''}`} />
      {size !== 'sm' && (isExporting ? 'Exporting...' : 'Export Stats')}
    </button>
  );
};

export default DashboardExportButton;