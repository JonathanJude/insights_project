import { AlertTriangle, CheckCircle, Database, Eye, EyeOff, HelpCircle, Info } from 'lucide-react';
import React, { useState } from 'react';

interface DataReliabilityMetrics {
  totalRecords: number;
  definedRecords: number;
  undefinedRecords: number;
  averageConfidence: number;
  dataCompleteness: number;
  lastUpdated: string;
  sources: string[];
}

interface DataReliabilityIndicatorProps {
  metrics: DataReliabilityMetrics;
  dataType: string;
  showDetails?: boolean;
  showUndefinedToggle?: boolean;
  onUndefinedToggle?: (includeUndefined: boolean) => void;
  includeUndefined?: boolean;
  className?: string;
}

const DataReliabilityIndicator: React.FC<DataReliabilityIndicatorProps> = ({
  metrics,
  dataType,
  showDetails = false,
  showUndefinedToggle = false,
  onUndefinedToggle,
  includeUndefined = true,
  className = ''
}) => {
  const [expanded, setExpanded] = useState(false);

  const undefinedPercentage = (metrics.undefinedRecords / metrics.totalRecords) * 100;
  const definedPercentage = (metrics.definedRecords / metrics.totalRecords) * 100;

  const getReliabilityLevel = () => {
    if (metrics.dataCompleteness >= 90 && metrics.averageConfidence >= 0.8) return 'excellent';
    if (metrics.dataCompleteness >= 80 && metrics.averageConfidence >= 0.7) return 'good';
    if (metrics.dataCompleteness >= 70 && metrics.averageConfidence >= 0.6) return 'fair';
    return 'poor';
  };

  const getReliabilityColor = (level: string) => {
    switch (level) {
      case 'excellent':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'good':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'fair':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'poor':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getReliabilityIcon = (level: string) => {
    switch (level) {
      case 'excellent':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'good':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'fair':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'poor':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <HelpCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getReliabilityLabel = (level: string) => {
    switch (level) {
      case 'excellent':
        return 'Excellent';
      case 'good':
        return 'Good';
      case 'fair':
        return 'Fair';
      case 'poor':
        return 'Poor';
      default:
        return 'Unknown';
    }
  };

  const reliabilityLevel = getReliabilityLevel();

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-gray-600" />
            <h3 className="text-sm font-medium text-gray-900">
              {dataType} Data Reliability
            </h3>
          </div>
          
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-sm font-medium ${getReliabilityColor(reliabilityLevel)}`}>
            {getReliabilityIcon(reliabilityLevel)}
            <span>{getReliabilityLabel(reliabilityLevel)}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900">
              {metrics.totalRecords.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Total Records</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {definedPercentage.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">Defined Data</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">
              {undefinedPercentage.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">Undefined Data</div>
          </div>
          
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {Math.round(metrics.averageConfidence * 100)}%
            </div>
            <div className="text-xs text-gray-600">Avg Confidence</div>
          </div>
        </div>

        {/* Data Completeness Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">Data Completeness</span>
            <span className="text-sm text-gray-600">{metrics.dataCompleteness}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="flex h-2 rounded-full overflow-hidden">
              <div
                className="bg-green-500 transition-all duration-300"
                style={{ width: `${definedPercentage}%` }}
              />
              <div
                className="bg-red-300 transition-all duration-300"
                style={{ width: `${undefinedPercentage}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Defined: {metrics.definedRecords.toLocaleString()}</span>
            <span>Undefined: {metrics.undefinedRecords.toLocaleString()}</span>
          </div>
        </div>

        {/* Undefined Data Toggle */}
        {showUndefinedToggle && (
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded border mb-4">
            <div className="flex items-center space-x-2">
              <HelpCircle className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Include Undefined Data in Analysis
              </span>
            </div>
            <button
              onClick={() => onUndefinedToggle?.(!includeUndefined)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                includeUndefined ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  includeUndefined ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        )}

        {/* Details Section */}
        {showDetails && (
          <div className="space-y-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
            >
              {expanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{expanded ? 'Hide' : 'Show'} Details</span>
            </button>

            {expanded && (
              <div className="space-y-3 pt-3 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Data Sources</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {metrics.sources.map((source, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full" />
                          <span>{source}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Quality Metrics</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Last Updated:</span>
                        <span>{new Date(metrics.lastUpdated).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Completeness:</span>
                        <span>{metrics.dataCompleteness}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reliability:</span>
                        <span className={`font-medium ${
                          reliabilityLevel === 'excellent' ? 'text-green-600' :
                          reliabilityLevel === 'good' ? 'text-blue-600' :
                          reliabilityLevel === 'fair' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {getReliabilityLabel(reliabilityLevel)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <div className="flex items-start space-x-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium mb-1">Undefined Data Handling</p>
                      <p>
                        Undefined data represents information that couldn't be classified with sufficient confidence. 
                        This data is preserved separately to maintain transparency and can be included or excluded 
                        from analysis based on your requirements.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataReliabilityIndicator;