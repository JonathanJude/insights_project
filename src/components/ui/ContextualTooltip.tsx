import { InformationCircleIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';

interface ContextualTooltipProps {
  content: React.ReactNode;
  title?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  size?: 'sm' | 'md' | 'lg';
  trigger?: 'hover' | 'click';
  className?: string;
  children?: React.ReactNode;
}

const ContextualTooltip: React.FC<ContextualTooltipProps> = ({
  content,
  title,
  position = 'top',
  size = 'md',
  trigger = 'hover',
  className = '',
  children
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const sizeClasses = {
    sm: 'max-w-xs text-xs',
    md: 'max-w-sm text-sm',
    lg: 'max-w-md text-sm'
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-900',
    bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-900',
    left: 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-900',
    right: 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-900'
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsVisible(false);
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      setIsVisible(!isVisible);
    }
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className="cursor-help"
      >
        {children || (
          <InformationCircleIcon className="h-4 w-4 text-gray-400 hover:text-gray-600 transition-colors" />
        )}
      </div>

      {isVisible && (
        <>
          {/* Backdrop for click-triggered tooltips */}
          {trigger === 'click' && (
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsVisible(false)}
            />
          )}
          
          {/* Tooltip */}
          <div
            className={`absolute z-20 ${positionClasses[position]} ${sizeClasses[size]} bg-gray-900 text-white rounded-lg shadow-lg p-3`}
          >
            {title && (
              <div className="font-semibold mb-1 text-white">
                {title}
              </div>
            )}
            <div className="text-gray-100">
              {content}
            </div>
            
            {/* Arrow */}
            <div
              className={`absolute w-0 h-0 border-4 ${arrowClasses[position]}`}
            />
          </div>
        </>
      )}
    </div>
  );
};

// Specialized tooltip components for common use cases
export const ConfidenceTooltip: React.FC<{ 
  score: number; 
  description?: string;
  className?: string;
}> = ({ score, description, className }) => {
  const getConfidenceLevel = (score: number) => {
    if (score >= 0.8) return { level: 'High', color: 'text-green-600', description: 'Very reliable classification' };
    if (score >= 0.6) return { level: 'Medium', color: 'text-yellow-600', description: 'Moderately reliable classification' };
    if (score >= 0.4) return { level: 'Low', color: 'text-orange-600', description: 'Less reliable, interpret carefully' };
    return { level: 'Very Low', color: 'text-red-600', description: 'Uncertain classification, use with caution' };
  };

  const confidence = getConfidenceLevel(score);

  const content = (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span>Confidence Score:</span>
        <span className="font-semibold">{(score * 100).toFixed(1)}%</span>
      </div>
      <div className="flex items-center justify-between">
        <span>Reliability:</span>
        <span className={`font-semibold ${confidence.color}`}>{confidence.level}</span>
      </div>
      <div className="text-xs text-gray-300 border-t border-gray-700 pt-2">
        {description || confidence.description}
      </div>
      <div className="text-xs text-gray-400">
        Higher scores indicate more reliable AI model agreement and data quality.
      </div>
    </div>
  );

  return (
    <ContextualTooltip
      title="Confidence Score"
      content={content}
      className={className}
    >
      <div className="flex items-center space-x-1">
        <span className={`text-xs font-medium ${confidence.color}`}>
          {(score * 100).toFixed(0)}%
        </span>
        <InformationCircleIcon className="h-3 w-3 text-gray-400" />
      </div>
    </ContextualTooltip>
  );
};

export const DataQualityTooltip: React.FC<{ 
  quality: 'high' | 'medium' | 'low';
  metrics?: {
    completeness?: number;
    accuracy?: number;
    freshness?: number;
  };
  className?: string;
}> = ({ quality, metrics, className }) => {
  const qualityConfig = {
    high: { color: 'text-green-600', icon: '✓', description: 'High-quality data with good coverage and accuracy' },
    medium: { color: 'text-yellow-600', icon: '⚠', description: 'Moderate quality data, some limitations may apply' },
    low: { color: 'text-red-600', icon: '⚠', description: 'Limited data quality, interpret results carefully' }
  };

  const config = qualityConfig[quality];

  const content = (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span>Data Quality:</span>
        <span className={`font-semibold ${config.color}`}>
          {config.icon} {quality.charAt(0).toUpperCase() + quality.slice(1)}
        </span>
      </div>
      
      {metrics && (
        <div className="space-y-1 text-xs">
          {metrics.completeness && (
            <div className="flex justify-between">
              <span>Completeness:</span>
              <span>{(metrics.completeness * 100).toFixed(0)}%</span>
            </div>
          )}
          {metrics.accuracy && (
            <div className="flex justify-between">
              <span>Accuracy:</span>
              <span>{(metrics.accuracy * 100).toFixed(0)}%</span>
            </div>
          )}
          {metrics.freshness && (
            <div className="flex justify-between">
              <span>Freshness:</span>
              <span>{(metrics.freshness * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>
      )}
      
      <div className="text-xs text-gray-300 border-t border-gray-700 pt-2">
        {config.description}
      </div>
    </div>
  );

  return (
    <ContextualTooltip
      title="Data Quality"
      content={content}
      className={className}
    >
      <div className="flex items-center space-x-1">
        <span className={`text-xs ${config.color}`}>{config.icon}</span>
        <InformationCircleIcon className="h-3 w-3 text-gray-400" />
      </div>
    </ContextualTooltip>
  );
};

export const UndefinedDataTooltip: React.FC<{ 
  category: string;
  reason?: string;
  fallbackInfo?: string;
  className?: string;
}> = ({ category, reason, fallbackInfo, className }) => {
  const content = (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span>Classification:</span>
        <span className="font-semibold text-gray-300">Undefined</span>
      </div>
      
      <div className="text-xs text-gray-300">
        <strong>Category:</strong> {category}
      </div>
      
      {reason && (
        <div className="text-xs text-gray-300">
          <strong>Reason:</strong> {reason}
        </div>
      )}
      
      {fallbackInfo && (
        <div className="text-xs text-gray-300">
          <strong>Fallback:</strong> {fallbackInfo}
        </div>
      )}
      
      <div className="text-xs text-gray-400 border-t border-gray-700 pt-2">
        Data marked as "Undefined" indicates insufficient confidence for reliable classification. 
        This maintains data integrity by avoiding potentially incorrect assumptions.
      </div>
    </div>
  );

  return (
    <ContextualTooltip
      title="Undefined Classification"
      content={content}
      className={className}
    >
      <div className="flex items-center space-x-1">
        <span className="text-xs text-gray-500 italic">Undefined</span>
        <InformationCircleIcon className="h-3 w-3 text-gray-400" />
      </div>
    </ContextualTooltip>
  );
};

export const ModelAgreementTooltip: React.FC<{ 
  agreement: number;
  models: string[];
  consensus: boolean;
  className?: string;
}> = ({ agreement, models, consensus, className }) => {
  const getAgreementLevel = (score: number) => {
    if (score >= 0.9) return { level: 'Very High', color: 'text-green-600' };
    if (score >= 0.8) return { level: 'High', color: 'text-green-600' };
    if (score >= 0.7) return { level: 'Good', color: 'text-yellow-600' };
    if (score >= 0.6) return { level: 'Moderate', color: 'text-orange-600' };
    return { level: 'Low', color: 'text-red-600' };
  };

  const agreementLevel = getAgreementLevel(agreement);

  const content = (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span>Model Agreement:</span>
        <span className={`font-semibold ${agreementLevel.color}`}>
          {(agreement * 100).toFixed(1)}%
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <span>Consensus:</span>
        <span className={consensus ? 'text-green-400' : 'text-red-400'}>
          {consensus ? '✓ Yes' : '✗ No'}
        </span>
      </div>
      
      <div className="text-xs text-gray-300">
        <strong>Models Used:</strong>
        <div className="mt-1 space-y-1">
          {models.map((model, index) => (
            <div key={index} className="text-gray-400">• {model}</div>
          ))}
        </div>
      </div>
      
      <div className="text-xs text-gray-400 border-t border-gray-700 pt-2">
        Higher agreement indicates more reliable classification. Low agreement suggests 
        complex or ambiguous content that may require human review.
      </div>
    </div>
  );

  return (
    <ContextualTooltip
      title="AI Model Agreement"
      content={content}
      className={className}
    >
      <div className="flex items-center space-x-1">
        <span className={`text-xs font-medium ${agreementLevel.color}`}>
          {agreementLevel.level}
        </span>
        <InformationCircleIcon className="h-3 w-3 text-gray-400" />
      </div>
    </ContextualTooltip>
  );
};

export default ContextualTooltip;