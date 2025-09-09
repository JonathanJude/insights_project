import { ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/outline';
import React, { useRef, useState } from 'react';
import { copyShareableLink, exportChart, generateShareableLink } from '../../lib/exportUtils';
import type { ExportFormat } from '../../lib/exportUtils';
import { useFilterStore } from '../../stores/filterStore';

interface ExportButtonProps {
  chartElement?: HTMLElement | null;
  chartType: string;
  data: any[];
  filters?: any;
  view?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showShareButton?: boolean;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  chartElement,
  chartType,
  data,
  filters = {},
  view = 'dashboard',
  className = '',
  size = 'md',
  showShareButton = true
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const filterState = useFilterStore();

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

  const handleExport = async (format: ExportFormat) => {
    if (!chartElement && (format === 'png' || format === 'svg')) {
      setExportError('Chart element not available for image export');
      return;
    }

    setIsExporting(true);
    setExportError(null);
    setShowDropdown(false);

    try {
      if (chartElement) {
        await exportChart(chartElement, chartType, data, format, filters);
      } else {
        throw new Error('Chart element is required for export');
      }
    } catch (error) {
      console.error('Export failed:', error);
      setExportError(error instanceof Error ? error.message : 'Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareableLink = generateShareableLink(filterState, view);
      await copyShareableLink(shareableLink);
      
      // Show success notification
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('Shareable link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
      setExportError('Failed to generate shareable link');
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <div className="flex items-center space-x-2">
        {/* Export Button */}
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={isExporting}
          className={`
            ${sizeClasses[size]}
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
          title="Export chart"
        >
          <ArrowDownTrayIcon className={`${iconSizes[size]} ${size !== 'sm' ? 'mr-2' : ''}`} />
          {size !== 'sm' && (isExporting ? 'Exporting...' : 'Export')}
        </button>

        {/* Share Button */}
        {showShareButton && (
          <button
            onClick={handleShare}
            className={`
              ${sizeClasses[size]}
              inline-flex items-center justify-center
              bg-blue-600 hover:bg-blue-700
              text-white
              rounded-md shadow-sm
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              transition-colors duration-200
            `}
            title="Share current view"
          >
            <ShareIcon className={`${iconSizes[size]} ${size !== 'sm' ? 'mr-2' : ''}`} />
            {size !== 'sm' && 'Share'}
          </button>
        )}
      </div>

      {/* Export Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-1">
            <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700">
              Export Format
            </div>
            
            <button
              onClick={() => handleExport('png')}
              disabled={!chartElement}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              PNG Image
            </button>
            
            <button
              onClick={() => handleExport('svg')}
              disabled={!chartElement}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              SVG Vector
            </button>
            
            <button
              onClick={() => handleExport('pdf')}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              PDF Report
            </button>
            
            <button
              onClick={() => handleExport('csv')}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              CSV Data
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {exportError && (
        <div className="absolute top-full left-0 mt-2 p-2 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md text-red-700 dark:text-red-300 text-xs whitespace-nowrap z-50">
          {exportError}
          <button
            onClick={() => setExportError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportButton;