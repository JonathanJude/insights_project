import { AlertTriangle, CheckCircle, HelpCircle, Info, XCircle } from 'lucide-react';
import React from 'react';

interface ConfidenceIndicatorProps {
  confidence: number;
  dataType?: string;
  showLabel?: boolean;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'badge' | 'bar' | 'icon' | 'detailed';
  className?: string;
  undefinedData?: boolean;
  modelAgreement?: number;
}

const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  confidence,
  dataType = 'data',
  showLabel = true,
  showTooltip = false,
  size = 'md',
  variant = 'badge',
  className = '',
  undefinedData = false,
  modelAgreement
}) => {
  const getConfidenceLevel = (score: number) => {
    if (score >= 0.9) return 'very-high';
    if (score >= 0.8) return 'high';
    if (score >= 0.6) return 'medium';
    if (score >= 0.4) return 'low';
    return 'very-low';
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'very-high':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'high':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'very-low':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConfidenceIcon = (level: string) => {
    const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4';
    
    switch (level) {
      case 'very-high':
        return <CheckCircle className={`${iconSize} text-green-600`} />;
      case 'high':
        return <CheckCircle className={`${iconSize} text-blue-600`} />;
      case 'medium':
        return <AlertTriangle className={`${iconSize} text-yellow-600`} />;
      case 'low':
        return <AlertTriangle className={`${iconSize} text-orange-600`} />;
      case 'very-low':
        return <XCircle className={`${iconSize} text-red-600`} />;
      default:
        return <HelpCircle className={`${iconSize} text-gray-600`} />;
    }
  };

  const getConfidenceLabel = (level: string) => {
    switch (level) {
      case 'very-high':
        return 'Very High';
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
      case 'very-low':
        return 'Very Low';
      default:
        return 'Unknown';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'lg':
        return 'text-base px-4 py-2';
      default:
        return 'text-sm px-3 py-1';
    }
  };

  if (undefinedData) {
    return (
      <div className={`inline-flex items-center space-x-1 rounded-full border bg-gray-100 text-gray-600 border-gray-300 ${getSizeClasses()} ${className}`}>
        <HelpCircle className={size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />
        {showLabel && <span>Undefined</span>}
      </div>
    );
  }

  const level = getConfidenceLevel(confidence);
  const percentage = Math.round(confidence * 100);

  if (variant === 'bar') {
    return (
      <div className={`w-full ${className}`}>
        {showLabel && (
          <div className="flex justify-between items-center mb-1">
            <span className={`font-medium ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'} text-gray-700`}>
              {dataType} Confidence
            </span>
            <span className={`${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'} text-gray-600`}>
              {percentage}%
            </span>
          </div>
        )}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              level === 'very-high' ? 'bg-green-500' :
              level === 'high' ? 'bg-blue-500' :
              level === 'medium' ? 'bg-yellow-500' :
              level === 'low' ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {modelAgreement !== undefined && (
          <div className="mt-1 text-xs text-gray-500">
            Model agreement: {Math.round(modelAgreement * 100)}%
          </div>
        )}
      </div>
    );
  }

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center ${className}`} title={showTooltip ? `${percentage}% confidence` : undefined}>
        {getConfidenceIcon(level)}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-3 ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {getConfidenceIcon(level)}
            <span className="font-medium text-gray-900">{dataType} Quality</span>
          </div>
          <span className="text-lg font-bold text-gray-900">{percentage}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              level === 'very-high' ? 'bg-green-500' :
              level === 'high' ? 'bg-blue-500' :
              level === 'medium' ? 'bg-yellow-500' :
              level === 'low' ? 'bg-orange-500' : 'bg-red-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className={`font-medium ${
            level === 'very-high' ? 'text-green-700' :
            level === 'high' ? 'text-blue-700' :
            level === 'medium' ? 'text-yellow-700' :
            level === 'low' ? 'text-orange-700' : 'text-red-700'
          }`}>
            {getConfidenceLabel(level)} Confidence
          </span>
          {modelAgreement !== undefined && (
            <span className="text-gray-600">
              Agreement: {Math.round(modelAgreement * 100)}%
            </span>
          )}
        </div>
        
        {showTooltip && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
            <div className="flex items-start space-x-1">
              <Info className="h-3 w-3 mt-0.5" />
              <div>
                <p className="font-medium mb-1">Confidence Score Explanation:</p>
                <p>
                  {level === 'very-high' && 'Extremely reliable data with high certainty.'}
                  {level === 'high' && 'Reliable data with good certainty.'}
                  {level === 'medium' && 'Moderately reliable data, use with some caution.'}
                  {level === 'low' && 'Less reliable data, interpret carefully.'}
                  {level === 'very-low' && 'Unreliable data, consider alternative sources.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Default badge variant
  return (
    <div className={`inline-flex items-center space-x-1 rounded-full border ${getConfidenceColor(level)} ${getSizeClasses()} ${className}`}>
      {getConfidenceIcon(level)}
      {showLabel && (
        <span className="font-medium">
          {percentage}%
        </span>
      )}
      {showTooltip && (
        <div className="ml-1" title={`${getConfidenceLabel(level)} confidence (${percentage}%)`}>
          <Info className={size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} />
        </div>
      )}
    </div>
  );
};

export default ConfidenceIndicator;