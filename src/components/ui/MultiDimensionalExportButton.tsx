import { ArrowDownTrayIcon, ChartBarIcon, DocumentTextIcon, ShareIcon, TableCellsIcon } from '@heroicons/react/24/outline';
import React, { useRef, useState } from 'react';
import type { EnhancedPoliticianData } from '../../lib/enhancedMockDataService';
import { copyShareableLink, generateShareableLink } from '../../lib/exportUtils';
import type { ExportProgress, MultiDimensionalExportFormat } from '../../lib/multiDimensionalExportUtils';
import { createMultiDimensionalExporter } from '../../lib/multiDimensionalExportUtils';
import { useFilterStore } from '../../stores/filterStore';
import type { FilterState } from '../../types';

interface MultiDimensionalExportButtonProps {
  data: EnhancedPoliticianData[];
  chartElement?: HTMLElement | null;
  chartType?: string;
  filters?: Partial<FilterState>;
  view?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showShareButton?: boolean;
  showMetadata?: boolean;
  includeAllDimensions?: boolean;
}

const MultiDimensionalExportButton: React.FC<MultiDimensionalExportButtonProps> = ({
  data,
  chartElement,
  chartType = 'multi-dimensional-analysis',
  filters = {},
  view = 'analysis',
  className = '',
  size = 'md',
  showShareButton = true,
  showMetadata = true,
  includeAllDimensions = true
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
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

  const exportFormats = [
    {
      format: 'csv' as MultiDimensionalExportFormat,
      label: 'CSV Data',
      description: 'Comprehensive data export with all dimensions',
      icon: TableCellsIcon,
      requiresChart: false
    },
    {
      format: 'json' as MultiDimensionalExportFormat,
      label: 'JSON Export',
      description: 'Structured data with metadata',
      icon: DocumentTextIcon,
      requiresChart: false
    },
    {
      format: 'pdf' as MultiDimensionalExportFormat,
      label: 'PDF Report',
      description: 'Detailed analysis report',
      icon: DocumentTextIcon,
      requiresChart: false
    },
    {
      format: 'xlsx' as MultiDimensionalExportFormat,
      label: 'Excel Workbook',
      description: 'Multi-sheet analysis with charts',
      icon: TableCellsIcon,
      requiresChart: false
    },
    {
      format: 'png' as MultiDimensionalExportFormat,
      label: 'PNG Image',
      description: 'High-resolution chart image',
      icon: ChartBarIcon,
      requiresChart: true
    },
    {
      format: 'svg' as MultiDimensionalExportFormat,
      label: 'SVG Vector',
      description: 'Scalable vector chart',
      icon: ChartBarIcon,
      requiresChart: true
    }
  ];

  const handleExport = async (format: MultiDimensionalExportFormat) => {
    const formatConfig = exportFormats.find(f => f.format === format);
    
    if (formatConfig?.requiresChart && !chartElement) {
      setExportError('Chart element not available for image export');
      return;
    }

    if (data.length === 0) {
      setExportError('No data available for export');
      return;
    }

    setIsExporting(true);
    setExportError(null);
    setShowDropdown(false);
    setShowProgressModal(true);
    setExportProgress({ stage: 'preparing', progress: 0, message: 'Initializing export...' });

    try {
      const exporter = createMultiDimensionalExporter(
        data,
        { ...filterState, ...filters },
        (progress) => setExportProgress(progress)
      );

      if (format === 'png' || format === 'svg') {
        if (chartElement) {
          await exporter.exportChartAsImage(chartElement, format, {
            width: 1920,
            height: 1080,
            quality: 1.0,
            includeMetadata: showMetadata
          });
        }
      } else {
        await exporter.exportData(format);
      }

      // Show success message
      setTimeout(() => {
        setShowProgressModal(false);
        setExportProgress(null);
      }, 1500);

    } catch (error) {
      console.error('Export failed:', error);
      setExportError(error instanceof Error ? error.message : 'Export failed');
      setShowProgressModal(false);
      setExportProgress(null);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareableLink = generateShareableLink({ ...filterState, ...filters }, view);
      await copyShareableLink(shareableLink);
      
      // Show success notification
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('Shareable link with current filters copied to clipboard!');
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
    <>
      <div className={`relative inline-block ${className}`} ref={dropdownRef}>
        <div className="flex items-center space-x-2">
          {/* Export Button */}
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={isExporting || data.length === 0}
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
            title={`Export multi-dimensional analysis (${data.length} records)`}
          >
            <ArrowDownTrayIcon className={`${iconSizes[size]} ${size !== 'sm' ? 'mr-2' : ''}`} />
            {size !== 'sm' && (isExporting ? 'Exporting...' : `Export (${data.length})`)}
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
              title="Share current analysis with filters"
            >
              <ShareIcon className={`${iconSizes[size]} ${size !== 'sm' ? 'mr-2' : ''}`} />
              {size !== 'sm' && 'Share'}
            </button>
          )}
        </div>

        {/* Export Dropdown */}
        {showDropdown && (
          <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <div className="py-1">
              <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700">
                Multi-Dimensional Export
              </div>
              
              {exportFormats.map((formatConfig) => {
                const Icon = formatConfig.icon;
                const isDisabled = formatConfig.requiresChart && !chartElement;
                
                return (
                  <button
                    key={formatConfig.format}
                    onClick={() => handleExport(formatConfig.format)}
                    disabled={isDisabled}
                    className={`
                      w-full text-left px-3 py-3 text-sm
                      ${isDisabled 
                        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                      transition-colors duration-150
                    `}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{formatConfig.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {formatConfig.description}
                          {isDisabled && ' (Chart required)'}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Export Options */}
              {includeAllDimensions && (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                    <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      Export Options
                    </div>
                    <div className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center justify-between">
                        <span>Include metadata</span>
                        <span className={showMetadata ? 'text-green-600' : 'text-gray-400'}>
                          {showMetadata ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span>All dimensions</span>
                        <span className="text-green-600">Yes</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span>Data quality scores</span>
                        <span className="text-green-600">Yes</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {exportError && (
          <div className="absolute top-full left-0 mt-2 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md text-red-700 dark:text-red-300 text-sm max-w-xs z-50">
            {exportError}
            <button
              onClick={() => setExportError(null)}
              className="ml-2 text-red-500 hover:text-red-700 font-bold"
            >
              ×
            </button>
          </div>
        )}
      </div>

      {/* Progress Modal */}
      {showProgressModal && exportProgress && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mb-4">
                <ArrowDownTrayIcon className="h-12 w-12 text-blue-600 mx-auto" />
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Exporting Multi-Dimensional Data
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {exportProgress.message}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress.progress}%` }}
                />
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                {exportProgress.progress}% complete
                {exportProgress.stage === 'complete' && (
                  <div className="text-green-600 font-medium mt-2">
                    ✓ Export completed successfully
                  </div>
                )}
                {exportProgress.stage === 'error' && (
                  <div className="text-red-600 font-medium mt-2">
                    ✗ Export failed
                  </div>
                )}
              </div>

              {/* Cancel button for long operations */}
              {exportProgress.stage !== 'complete' && exportProgress.stage !== 'error' && (
                <button
                  onClick={() => {
                    setShowProgressModal(false);
                    setExportProgress(null);
                    setIsExporting(false);
                  }}
                  className="mt-4 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MultiDimensionalExportButton;