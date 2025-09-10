/**
 * Adaptive Chart Component
 * 
 * Charts that adapt to data availability and quality
 */

import React, { useMemo } from 'react';
import { DataQualityLevels } from '../../constants/enums/system-enums';
import { DataAvailabilityIndicator, MissingDataPlaceholder } from '../ui/DataAvailabilityIndicator';

interface DataPoint {
  [key: string]: any;
  _dataQuality?: DataQualityLevels;
  _confidence?: number;
}

interface AdaptiveChartProps {
  data: DataPoint[];
  title: string;
  type: 'bar' | 'line' | 'pie' | 'scatter';
  xField: string;
  yField: string;
  minDataPoints?: number;
  showQualityIndicators?: boolean;
  showConfidenceIntervals?: boolean;
  className?: string;
  onDataInsufficient?: () => React.ReactNode;
}

export const AdaptiveChart: React.FC<AdaptiveChartProps> = ({
  data,
  title,
  type,
  xField,
  yField,
  minDataPoints = 3,
  showQualityIndicators = true,
  showConfidenceIntervals = false,
  className = '',
  onDataInsufficient
}) => {
  const chartAnalysis = useMemo(() => {
    const validData = data.filter(point => 
      point[xField] !== null && 
      point[xField] !== undefined && 
      point[yField] !== null && 
      point[yField] !== undefined
    );

    const totalPoints = data.length;
    const validPoints = validData.length;
    const dataCompleteness = totalPoints > 0 ? validPoints / totalPoints : 0;
    
    // Calculate average confidence
    const confidenceScores = validData
      .map(point => point._confidence || 1)
      .filter(score => !isNaN(score));
    const avgConfidence = confidenceScores.length > 0 
      ? confidenceScores.reduce((sum, score) => sum + score, 0) / confidenceScores.length 
      : 0;

    // Determine overall quality
    let overallQuality = DataQualityLevels.UNKNOWN;
    if (dataCompleteness >= 0.9 && avgConfidence >= 0.8) {
      overallQuality = DataQualityLevels.EXCELLENT;
    } else if (dataCompleteness >= 0.7 && avgConfidence >= 0.6) {
      overallQuality = DataQualityLevels.GOOD;
    } else if (dataCompleteness >= 0.5 && avgConfidence >= 0.4) {
      overallQuality = DataQualityLevels.FAIR;
    } else if (validPoints > 0) {
      overallQuality = DataQualityLevels.POOR;
    }

    return {
      validData,
      totalPoints,
      validPoints,
      dataCompleteness,
      avgConfidence,
      overallQuality,
      hasSufficientData: validPoints >= minDataPoints
    };
  }, [data, xField, yField, minDataPoints]);

  // Render insufficient data state
  if (!chartAnalysis.hasSufficientData) {
    return (
      <div className={`adaptive-chart insufficient-data ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <DataAvailabilityIndicator
            indicator={{
              isAvailable: false,
              quality: DataQualityLevels.POOR,
              confidence: 0,
              fallbackUsed: false,
              message: `Insufficient data (${chartAnalysis.validPoints}/${minDataPoints} required)`
            }}
            field="chart data"
            compact
          />
        </div>
        
        <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          {onDataInsufficient ? (
            onDataInsufficient()
          ) : (
            <>
              <div className="text-4xl text-gray-400 mb-4">📊</div>
              <div className="text-center">
                <p className="text-gray-600 font-medium mb-2">Insufficient Data</p>
                <p className="text-sm text-gray-500">
                  Need at least {minDataPoints} data points to display chart
                </p>
                <p className="text-sm text-gray-500">
                  Currently have {chartAnalysis.validPoints} valid data points
                </p>
              </div>
            </>
          )}
        </div>
        
        <DataQualitySummary analysis={chartAnalysis} />
      </div>
    );
  }

  // Render chart with quality indicators
  return (
    <div className={`adaptive-chart ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {showQualityIndicators && (
          <div className="flex items-center gap-2">
            <DataAvailabilityIndicator
              indicator={{
                isAvailable: true,
                quality: chartAnalysis.overallQuality,
                confidence: chartAnalysis.avgConfidence,
                fallbackUsed: chartAnalysis.dataCompleteness < 1,
                message: `${Math.round(chartAnalysis.dataCompleteness * 100)}% complete, ${Math.round(chartAnalysis.avgConfidence * 100)}% confidence`
              }}
              field="chart data"
            />
          </div>
        )}
      </div>

      {/* Chart container - would integrate with actual chart library */}
      <div className="chart-container relative">
        <div className="h-64 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-2xl mb-2">📈</div>
            <p>Chart would render here with {chartAnalysis.validPoints} data points</p>
            <p className="text-sm">Type: {type}, X: {xField}, Y: {yField}</p>
          </div>
        </div>

        {/* Confidence intervals overlay */}
        {showConfidenceIntervals && chartAnalysis.avgConfidence < 0.9 && (
          <div className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">
            ±{Math.round((1 - chartAnalysis.avgConfidence) * 100)}% uncertainty
          </div>
        )}
      </div>

      <DataQualitySummary analysis={chartAnalysis} />
    </div>
  );
};

interface DataQualitySummaryProps {
  analysis: {
    validData: DataPoint[];
    totalPoints: number;
    validPoints: number;
    dataCompleteness: number;
    avgConfidence: number;
    overallQuality: DataQualityLevels;
    hasSufficientData: boolean;
  };
  showDetails?: boolean;
}

const DataQualitySummary: React.FC<DataQualitySummaryProps> = ({
  analysis,
  showDetails = false
}) => {
  const [expanded, setExpanded] = React.useState(showDetails);

  const getQualityColor = (quality: DataQualityLevels): string => {
    switch (quality) {
      case DataQualityLevels.EXCELLENT: return 'text-green-600';
      case DataQualityLevels.GOOD: return 'text-blue-600';
      case DataQualityLevels.FAIR: return 'text-yellow-600';
      case DataQualityLevels.POOR: return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="text-sm font-medium text-gray-700">Data Quality Summary</span>
        <span className={`text-sm font-medium ${getQualityColor(analysis.overallQuality)}`}>
          {analysis.overallQuality} {expanded ? '▼' : '▶'}
        </span>
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 text-sm text-gray-600">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-medium">Data Points:</span>
              <span className="ml-2">{analysis.validPoints} of {analysis.totalPoints}</span>
            </div>
            <div>
              <span className="font-medium">Completeness:</span>
              <span className="ml-2">{Math.round(analysis.dataCompleteness * 100)}%</span>
            </div>
            <div>
              <span className="font-medium">Confidence:</span>
              <span className="ml-2">{Math.round(analysis.avgConfidence * 100)}%</span>
            </div>
            <div>
              <span className="font-medium">Quality:</span>
              <span className={`ml-2 ${getQualityColor(analysis.overallQuality)}`}>
                {analysis.overallQuality}
              </span>
            </div>
          </div>

          {analysis.dataCompleteness < 1 && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> {Math.round((1 - analysis.dataCompleteness) * 100)}% of data points are missing or invalid. 
                Results may not represent the complete picture.
              </p>
            </div>
          )}

          {analysis.avgConfidence < 0.7 && (
            <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded">
              <p className="text-orange-800 text-sm">
                <strong>Caution:</strong> Low confidence in data accuracy. 
                Consider verifying data sources or collecting additional information.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface SparseDataTableProps {
  data: Record<string, any>[];
  columns: {
    key: string;
    label: string;
    required?: boolean;
    fallback?: (row: any) => any;
  }[];
  showQualityIndicators?: boolean;
  className?: string;
}

export const SparseDataTable: React.FC<SparseDataTableProps> = ({
  data,
  columns,
  showQualityIndicators = true,
  className = ''
}) => {
  const tableAnalysis = useMemo(() => {
    const columnCompleteness = columns.map(col => {
      const availableCount = data.filter(row => 
        row[col.key] !== null && row[col.key] !== undefined && row[col.key] !== ''
      ).length;
      
      return {
        key: col.key,
        label: col.label,
        required: col.required || false,
        completeness: data.length > 0 ? availableCount / data.length : 0,
        availableCount,
        totalCount: data.length
      };
    });

    return { columnCompleteness };
  }, [data, columns]);

  return (
    <div className={`sparse-data-table ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.required && <span className="text-red-500">*</span>}
                    {showQualityIndicators && (
                      <div className="text-xs text-gray-400">
                        {Math.round(
                          tableAnalysis.columnCompleteness.find(c => c.key === column.key)?.completeness * 100 || 0
                        )}%
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50">
                {columns.map(column => {
                  const value = row[column.key];
                  const hasValue = value !== null && value !== undefined && value !== '';
                  const displayValue = hasValue ? value : (column.fallback ? column.fallback(row) : null);
                  
                  return (
                    <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm">
                      {displayValue !== null && displayValue !== undefined && displayValue !== '' ? (
                        <span className={hasValue ? 'text-gray-900' : 'text-gray-500 italic'}>
                          {String(displayValue)}
                        </span>
                      ) : (
                        <MissingDataPlaceholder field={column.label} />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showQualityIndicators && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Column Completeness</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {tableAnalysis.columnCompleteness.map(col => (
              <div key={col.key} className="text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-gray-600">{col.label}</span>
                  <span className="font-medium">{Math.round(col.completeness * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full ${
                      col.completeness >= 0.8 ? 'bg-green-500' :
                      col.completeness >= 0.6 ? 'bg-yellow-500' :
                      col.completeness >= 0.4 ? 'bg-orange-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${col.completeness * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};