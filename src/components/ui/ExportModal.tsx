import { ArrowDownTrayIcon, ChartBarIcon, DocumentTextIcon, TableCellsIcon, XMarkIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import type { EnhancedPoliticianData } from '../../lib/enhancedMockDataService';
import type { ExportProgress, MultiDimensionalExportFormat } from '../../lib/multiDimensionalExportUtils';
import { createMultiDimensionalExporter } from '../../lib/multiDimensionalExportUtils';
import type { FilterState } from '../../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: EnhancedPoliticianData[];
  chartElement?: HTMLElement | null;
  chartType?: string;
  filters?: Partial<FilterState>;
  title?: string;
}

interface ExportOptions {
  format: MultiDimensionalExportFormat;
  includeMetadata: boolean;
  includeDataQuality: boolean;
  includeConfidenceScores: boolean;
  selectedDimensions: string[];
  imageOptions: {
    width: number;
    height: number;
    quality: number;
  };
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  data,
  chartElement,
  chartType = 'multi-dimensional-analysis',
  filters = {},
  title = 'Export Multi-Dimensional Analysis'
}) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    includeMetadata: true,
    includeDataQuality: true,
    includeConfidenceScores: true,
    selectedDimensions: ['geographic', 'demographic', 'sentiment', 'topics', 'engagement', 'temporal'],
    imageOptions: {
      width: 1920,
      height: 1080,
      quality: 1.0
    }
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  const exportFormats = [
    {
      format: 'csv' as MultiDimensionalExportFormat,
      label: 'CSV Data',
      description: 'Comma-separated values with all dimensional data',
      icon: TableCellsIcon,
      requiresChart: false,
      supportsOptions: true
    },
    {
      format: 'json' as MultiDimensionalExportFormat,
      label: 'JSON Export',
      description: 'Structured JSON with metadata and hierarchical data',
      icon: DocumentTextIcon,
      requiresChart: false,
      supportsOptions: true
    },
    {
      format: 'pdf' as MultiDimensionalExportFormat,
      label: 'PDF Report',
      description: 'Comprehensive analysis report with charts and insights',
      icon: DocumentTextIcon,
      requiresChart: false,
      supportsOptions: true
    },
    {
      format: 'xlsx' as MultiDimensionalExportFormat,
      label: 'Excel Workbook',
      description: 'Multi-sheet workbook with separate dimension analysis',
      icon: TableCellsIcon,
      requiresChart: false,
      supportsOptions: true
    },
    {
      format: 'png' as MultiDimensionalExportFormat,
      label: 'PNG Image',
      description: 'High-resolution raster image of current chart',
      icon: ChartBarIcon,
      requiresChart: true,
      supportsOptions: false
    },
    {
      format: 'svg' as MultiDimensionalExportFormat,
      label: 'SVG Vector',
      description: 'Scalable vector graphics with embedded metadata',
      icon: ChartBarIcon,
      requiresChart: true,
      supportsOptions: false
    }
  ];

  const dimensions = [
    { id: 'geographic', label: 'Geographic Analysis', description: 'State, LGA, ward, and polling unit data' },
    { id: 'demographic', label: 'Demographic Insights', description: 'Education, occupation, age, and gender data' },
    { id: 'sentiment', label: 'Sentiment Analysis', description: 'Polarity, emotions, intensity, and complexity' },
    { id: 'topics', label: 'Topic Classification', description: 'Policy areas, campaign issues, and events' },
    { id: 'engagement', label: 'Engagement Metrics', description: 'Virality, quality scores, and amplification' },
    { id: 'temporal', label: 'Temporal Patterns', description: 'Time-based analysis and election cycles' }
  ];

  const handleExport = async () => {
    if (data.length === 0) {
      setExportError('No data available for export');
      return;
    }

    const selectedFormat = exportFormats.find(f => f.format === exportOptions.format);
    if (selectedFormat?.requiresChart && !chartElement) {
      setExportError('Chart element not available for image export');
      return;
    }

    setIsExporting(true);
    setExportError(null);
    setExportProgress({ stage: 'preparing', progress: 0, message: 'Preparing export...' });

    try {
      const exporter = createMultiDimensionalExporter(
        data,
        filters,
        (progress) => setExportProgress(progress)
      );

      if (exportOptions.format === 'png' || exportOptions.format === 'svg') {
        if (chartElement) {
          await exporter.exportChartAsImage(chartElement, exportOptions.format, {
            width: exportOptions.imageOptions.width,
            height: exportOptions.imageOptions.height,
            quality: exportOptions.imageOptions.quality,
            includeMetadata: exportOptions.includeMetadata
          });
        }
      } else {
        await exporter.exportData(exportOptions.format);
      }

      // Show success and close modal after delay
      setTimeout(() => {
        onClose();
        setExportProgress(null);
      }, 2000);

    } catch (error) {
      console.error('Export failed:', error);
      setExportError(error instanceof Error ? error.message : 'Export failed');
      setExportProgress(null);
    } finally {
      setIsExporting(false);
    }
  };

  const updateExportOptions = (updates: Partial<ExportOptions>) => {
    setExportOptions(prev => ({ ...prev, ...updates }));
  };

  const toggleDimension = (dimensionId: string) => {
    const newDimensions = exportOptions.selectedDimensions.includes(dimensionId)
      ? exportOptions.selectedDimensions.filter(d => d !== dimensionId)
      : [...exportOptions.selectedDimensions, dimensionId];
    
    updateExportOptions({ selectedDimensions: newDimensions });
  };

  if (!isOpen) return null;

  const selectedFormat = exportFormats.find(f => f.format === exportOptions.format);
  const isImageFormat = exportOptions.format === 'png' || exportOptions.format === 'svg';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Export {data.length} records with multi-dimensional analysis
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Export Progress */}
          {exportProgress && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <ArrowDownTrayIcon className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900 dark:text-blue-100">
                  {exportProgress.message}
                </span>
              </div>
              <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress.progress}%` }}
                />
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                {exportProgress.progress}% complete
              </div>
            </div>
          )}

          {/* Error Message */}
          {exportError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="text-red-800 dark:text-red-200">
                <strong>Export Error:</strong> {exportError}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Format Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Export Format
              </h3>
              <div className="space-y-3">
                {exportFormats.map((format) => {
                  const Icon = format.icon;
                  const isDisabled = format.requiresChart && !chartElement;
                  const isSelected = exportOptions.format === format.format;
                  
                  return (
                    <div
                      key={format.format}
                      className={`
                        relative rounded-lg border-2 p-4 cursor-pointer transition-all
                        ${isSelected 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }
                        ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                      onClick={() => !isDisabled && updateExportOptions({ format: format.format })}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className="h-6 w-6 mt-0.5 flex-shrink-0 text-gray-600 dark:text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {format.label}
                            </span>
                            {isDisabled && (
                              <span className="text-xs text-red-600 dark:text-red-400">
                                (Chart required)
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {format.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <div className="h-4 w-4 bg-blue-600 rounded-full flex items-center justify-center">
                              <div className="h-2 w-2 bg-white rounded-full" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Export Options */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                Export Options
              </h3>

              {/* General Options */}
              {selectedFormat?.supportsOptions && (
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Include metadata
                    </label>
                    <input
                      type="checkbox"
                      checked={exportOptions.includeMetadata}
                      onChange={(e) => updateExportOptions({ includeMetadata: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Include data quality scores
                    </label>
                    <input
                      type="checkbox"
                      checked={exportOptions.includeDataQuality}
                      onChange={(e) => updateExportOptions({ includeDataQuality: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Include confidence scores
                    </label>
                    <input
                      type="checkbox"
                      checked={exportOptions.includeConfidenceScores}
                      onChange={(e) => updateExportOptions({ includeConfidenceScores: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              )}

              {/* Image Options */}
              {isImageFormat && (
                <div className="space-y-4 mb-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Image Settings
                  </h4>
                  
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Width (pixels)
                    </label>
                    <input
                      type="number"
                      value={exportOptions.imageOptions.width}
                      onChange={(e) => updateExportOptions({
                        imageOptions: { ...exportOptions.imageOptions, width: parseInt(e.target.value) || 1920 }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                      min="800"
                      max="4000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Height (pixels)
                    </label>
                    <input
                      type="number"
                      value={exportOptions.imageOptions.height}
                      onChange={(e) => updateExportOptions({
                        imageOptions: { ...exportOptions.imageOptions, height: parseInt(e.target.value) || 1080 }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                      min="600"
                      max="3000"
                    />
                  </div>
                  
                  {exportOptions.format === 'png' && (
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                        Quality (0.1 - 1.0)
                      </label>
                      <input
                        type="number"
                        value={exportOptions.imageOptions.quality}
                        onChange={(e) => updateExportOptions({
                          imageOptions: { ...exportOptions.imageOptions, quality: parseFloat(e.target.value) || 1.0 }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm"
                        min="0.1"
                        max="1.0"
                        step="0.1"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Dimension Selection */}
              {selectedFormat?.supportsOptions && !isImageFormat && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Include Dimensions
                  </h4>
                  <div className="space-y-2">
                    {dimensions.map((dimension) => (
                      <div key={dimension.id} className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id={dimension.id}
                          checked={exportOptions.selectedDimensions.includes(dimension.id)}
                          onChange={() => toggleDimension(dimension.id)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <label 
                            htmlFor={dimension.id}
                            className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                          >
                            {dimension.label}
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {dimension.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {data.length} records • {exportOptions.selectedDimensions.length} dimensions
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              Cancel
            </button>
            
            <button
              onClick={handleExport}
              disabled={isExporting || data.length === 0 || exportOptions.selectedDimensions.length === 0}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? 'Exporting...' : `Export ${selectedFormat?.label}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;