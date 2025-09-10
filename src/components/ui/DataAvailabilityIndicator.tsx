/**
 * Data Availability Indicator Component
 * 
 * Shows users when data is missing, incomplete, or of low quality
 */

import React from 'react';
import { DataQualityLevels } from '../../constants/enums/system-enums';
import { DataAvailabilityIndicator as DataIndicator, gracefulDegradation } from '../../services/graceful-degradation';

interface DataAvailabilityIndicatorProps {
  indicator: DataIndicator;
  field: string;
  showTooltip?: boolean;
  compact?: boolean;
  className?: string;
}

export const DataAvailabilityIndicator: React.FC<DataAvailabilityIndicatorProps> = ({
  indicator,
  field,
  showTooltip = true,
  compact = false,
  className = ''
}) => {
  const getQualityColor = (quality: DataQualityLevels): string => {
    switch (quality) {
      case DataQualityLevels.EXCELLENT:
        return 'text-green-600 bg-green-50';
      case DataQualityLevels.GOOD:
        return 'text-blue-600 bg-blue-50';
      case DataQualityLevels.FAIR:
        return 'text-yellow-600 bg-yellow-50';
      case DataQualityLevels.POOR:
        return 'text-orange-600 bg-orange-50';
      case DataQualityLevels.UNKNOWN:
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getQualityIcon = (quality: DataQualityLevels): string => {
    switch (quality) {
      case DataQualityLevels.EXCELLENT:
        return '✓';
      case DataQualityLevels.GOOD:
        return '✓';
      case DataQualityLevels.FAIR:
        return '⚠';
      case DataQualityLevels.POOR:
        return '!';
      case DataQualityLevels.UNKNOWN:
      default:
        return '?';
    }
  };

  if (!indicator || indicator.isAvailable && indicator.quality === DataQualityLevels.EXCELLENT) {
    return null; // Don't show indicator for perfect data
  }

  const colorClass = getQualityColor(indicator.quality);
  const icon = getQualityIcon(indicator.quality);

  if (compact) {
    return (
      <span
        className={`inline-flex items-center justify-center w-4 h-4 text-xs rounded-full ${colorClass} ${className}`}
        title={showTooltip ? indicator.message : undefined}
      >
        {icon}
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded ${colorClass} ${className}`}>
      <span>{icon}</span>
      <span>{indicator.message}</span>
      {indicator.confidence < 1 && (
        <span className="opacity-75">
          ({Math.round(indicator.confidence * 100)}%)
        </span>
      )}
    </div>
  );
};

interface MissingDataPlaceholderProps {
  field: string;
  reason?: 'missing' | 'invalid' | 'restricted' | 'loading';
  showIcon?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const MissingDataPlaceholder: React.FC<MissingDataPlaceholderProps> = ({
  field,
  reason = 'missing',
  showIcon = true,
  className = '',
  children
}) => {
  const indicator = gracefulDegradation.createDataUnavailableIndicator(field, reason);

  const getReasonColor = (reason: string): string => {
    switch (reason) {
      case 'invalid':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'restricted':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'loading':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'missing':
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 border rounded-md ${getReasonColor(reason)} ${className}`}
      title={indicator.tooltip}
    >
      {showIcon && (
        <span className="text-sm">
          {reason === 'loading' ? '⟳' : reason === 'restricted' ? '🔒' : reason === 'invalid' ? '⚠' : '—'}
        </span>
      )}
      <span className="text-sm">
        {children || indicator.display}
      </span>
    </div>
  );
};

interface AdaptiveContentProps<T> {
  data: T;
  renderAvailable: (data: T) => React.ReactNode;
  renderPartial?: (data: T, availableFields: string[]) => React.ReactNode;
  renderUnavailable?: () => React.ReactNode;
  field?: string;
}

export function AdaptiveContent<T>({
  data,
  renderAvailable,
  renderPartial,
  renderUnavailable,
  field = 'data'
}: AdaptiveContentProps<T>): React.ReactElement {
  const content = gracefulDegradation.createAdaptiveContent(data, {
    available: renderAvailable,
    partial: renderPartial || renderAvailable,
    unavailable: renderUnavailable || (() => <MissingDataPlaceholder field={field} />)
  });

  return <>{content}</>;
}