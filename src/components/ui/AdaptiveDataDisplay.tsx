/**
 * Adaptive Data Display Components
 * 
 * Components that adapt their rendering based on data availability and quality
 */

import React, { useState } from 'react';
import { DataQualityLevels } from '../../constants/enums/system-enums';
import { gracefulDegradation } from '../../services/graceful-degradation';
import { DataAvailabilityIndicator, MissingDataPlaceholder } from './DataAvailabilityIndicator';

interface AdaptiveFieldProps {
  label: string;
  value: any;
  fallbackValue?: any;
  showQualityIndicator?: boolean;
  required?: boolean;
  className?: string;
  renderValue?: (value: any) => React.ReactNode;
}

export const AdaptiveField: React.FC<AdaptiveFieldProps> = ({
  label,
  value,
  fallbackValue,
  showQualityIndicator = true,
  required = false,
  className = '',
  renderValue
}) => {
  const isPresent = value !== null && value !== undefined && value !== '';
  const displayValue = isPresent ? value : fallbackValue;
  const hasDisplayValue = displayValue !== null && displayValue !== undefined && displayValue !== '';

  const indicator = gracefulDegradation.createDataUnavailableIndicator(
    label,
    !isPresent ? 'missing' : 'loading'
  );

  return (
    <div className={`adaptive-field ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        <label className={`text-sm font-medium ${required ? 'text-gray-900' : 'text-gray-700'}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {showQualityIndicator && !isPresent && (
          <DataAvailabilityIndicator
            indicator={{
              isAvailable: false,
              quality: DataQualityLevels.UNKNOWN,
              confidence: 0,
              fallbackUsed: !!fallbackValue,
              message: fallbackValue ? 'Using fallback value' : 'Data not available'
            }}
            field={label}
            compact
          />
        )}
      </div>
      
      <div className="text-sm">
        {hasDisplayValue ? (
          <span className={!isPresent ? 'text-gray-500 italic' : 'text-gray-900'}>
            {renderValue ? renderValue(displayValue) : displayValue}
          </span>
        ) : (
          <MissingDataPlaceholder field={label} />
        )}
      </div>
    </div>
  );
};

interface ProgressiveDisclosureProps {
  title: string;
  data: Record<string, any>;
  priorityFields: string[];
  secondaryFields?: string[];
  tertiaryFields?: string[];
  maxInitialFields?: number;
  className?: string;
}

export const ProgressiveDisclosure: React.FC<ProgressiveDisclosureProps> = ({
  title,
  data,
  priorityFields,
  secondaryFields = [],
  tertiaryFields = [],
  maxInitialFields = 3,
  className = ''
}) => {
  const [showSecondary, setShowSecondary] = useState(false);
  const [showTertiary, setShowTertiary] = useState(false);

  // Filter fields based on data availability
  const availablePriorityFields = priorityFields.filter(field => 
    data[field] !== null && data[field] !== undefined && data[field] !== ''
  );
  
  const availableSecondaryFields = secondaryFields.filter(field => 
    data[field] !== null && data[field] !== undefined && data[field] !== ''
  );
  
  const availableTertiaryFields = tertiaryFields.filter(field => 
    data[field] !== null && data[field] !== undefined && data[field] !== ''
  );

  const initialFields = availablePriorityFields.slice(0, maxInitialFields);
  const remainingPriorityFields = availablePriorityFields.slice(maxInitialFields);

  const hasMoreData = remainingPriorityFields.length > 0 || 
                     availableSecondaryFields.length > 0 || 
                     availableTertiaryFields.length > 0;

  const renderField = (field: string, value: any) => (
    <AdaptiveField
      key={field}
      label={field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
      value={value}
      className="mb-2"
    />
  );

  return (
    <div className={`progressive-disclosure ${className}`}>
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      
      {/* Always show priority fields */}
      <div className="space-y-2">
        {initialFields.map(field => renderField(field, data[field]))}
        
        {remainingPriorityFields.length > 0 && showSecondary && (
          <>
            {remainingPriorityFields.map(field => renderField(field, data[field]))}
          </>
        )}
        
        {/* Secondary fields */}
        {showSecondary && availableSecondaryFields.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-md font-medium mb-2 text-gray-700">Additional Information</h4>
            {availableSecondaryFields.map(field => renderField(field, data[field]))}
          </div>
        )}
        
        {/* Tertiary fields */}
        {showTertiary && availableTertiaryFields.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-md font-medium mb-2 text-gray-600">Extended Details</h4>
            {availableTertiaryFields.map(field => renderField(field, data[field]))}
          </div>
        )}
      </div>

      {/* Show more/less controls */}
      {hasMoreData && (
        <div className="mt-4 space-x-2">
          {!showSecondary && (
            <button
              onClick={() => setShowSecondary(true)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Show more details ({remainingPriorityFields.length + availableSecondaryFields.length} fields)
            </button>
          )}
          
          {showSecondary && !showTertiary && availableTertiaryFields.length > 0 && (
            <button
              onClick={() => setShowTertiary(true)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Show extended details ({availableTertiaryFields.length} fields)
            </button>
          )}
          
          {showSecondary && (
            <button
              onClick={() => {
                setShowSecondary(false);
                setShowTertiary(false);
              }}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium"
            >
              Show less
            </button>
          )}
        </div>
      )}
      
      {/* Data completeness indicator */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <DataCompletenessIndicator
          totalFields={priorityFields.length + secondaryFields.length + tertiaryFields.length}
          availableFields={availablePriorityFields.length + availableSecondaryFields.length + availableTertiaryFields.length}
          priorityFields={priorityFields.length}
          availablePriorityFields={availablePriorityFields.length}
        />
      </div>
    </div>
  );
};

interface DataCompletenessIndicatorProps {
  totalFields: number;
  availableFields: number;
  priorityFields: number;
  availablePriorityFields: number;
  showDetails?: boolean;
}

export const DataCompletenessIndicator: React.FC<DataCompletenessIndicatorProps> = ({
  totalFields,
  availableFields,
  priorityFields,
  availablePriorityFields,
  showDetails = true
}) => {
  const completenessPercentage = totalFields > 0 ? Math.round((availableFields / totalFields) * 100) : 0;
  const priorityCompleteness = priorityFields > 0 ? Math.round((availablePriorityFields / priorityFields) * 100) : 100;
  
  const getCompletenessColor = (percentage: number): string => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getCompletenessLabel = (percentage: number): string => {
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 60) return 'Good';
    if (percentage >= 40) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="data-completeness-indicator">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-600">Data Completeness</span>
        <span className="text-xs text-gray-500">
          {getCompletenessLabel(completenessPercentage)} ({completenessPercentage}%)
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getCompletenessColor(completenessPercentage)}`}
          style={{ width: `${completenessPercentage}%` }}
        />
      </div>
      
      {showDetails && (
        <div className="mt-2 text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Available fields:</span>
            <span>{availableFields} of {totalFields}</span>
          </div>
          <div className="flex justify-between">
            <span>Priority fields:</span>
            <span>{availablePriorityFields} of {priorityFields} ({priorityCompleteness}%)</span>
          </div>
        </div>
      )}
    </div>
  );
};