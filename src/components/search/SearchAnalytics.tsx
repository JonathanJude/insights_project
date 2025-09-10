import React from 'react';
import { useSearchAnalytics } from '../../hooks/useAdvancedSearch';

interface SearchAnalyticsProps {
  searchResults: any[];
  searchMetadata?: {
    processingTime: number;
    totalDimensions: number;
    confidenceDistribution: Record<string, number>;
    dataQualityScore: number;
  };
  className?: string;
}

const SearchAnalytics: React.FC<SearchAnalyticsProps> = ({
  searchResults,
  searchMetadata,
  className = ""
}) => {
  const { data: analytics, isLoading } = useSearchAnalytics(searchResults);

  if (isLoading || !analytics) {
    return (
      <div className={`bg-gray-50 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const MetricCard: React.FC<{
    title: string;
    value: string | number;
    description?: string;
    color?: string;
    icon?: string;
  }> = ({ title, value, description, color = "text-gray-600", icon }) => (
    <div className="bg-white rounded-lg p-3 border border-gray-200">
      <div className="flex items-center space-x-2 mb-1">
        {icon && <span className="text-lg">{icon}</span>}
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {title}
        </span>
      </div>
      <div className={`text-lg font-semibold ${color}`}>
        {typeof value === 'number' ? value.toFixed(2) : value}
      </div>
      {description && (
        <div className="text-xs text-gray-500 mt-1">{description}</div>
      )}
    </div>
  );

  const ProgressBar: React.FC<{
    label: string;
    value: number;
    color: string;
    showPercentage?: boolean;
  }> = ({ label, value, color, showPercentage = true }) => (
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center space-x-2">
        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color}`}
            style={{ width: `${Math.min(value * 100, 100)}%` }}
          />
        </div>
        {showPercentage && (
          <span className="text-xs text-gray-500 w-8">
            {(value * 100).toFixed(0)}%
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200/50 ${className}`}>
      <div className="flex items-center space-x-2 mb-4">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 className="text-lg font-semibold text-gray-900">Search Analytics</h3>
        {searchMetadata && (
          <span className="text-xs text-gray-500">
            ({searchMetadata.processingTime}ms)
          </span>
        )}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <MetricCard
          title="Results"
          value={analytics.totalResults}
          icon="🔍"
          color="text-blue-600"
        />
        
        <MetricCard
          title="Avg Relevance"
          value={`${(analytics.averageRelevance * 100).toFixed(0)}%`}
          icon="🎯"
          color="text-green-600"
        />
        
        <MetricCard
          title="Quality Score"
          value={`${(analytics.qualityScore * 100).toFixed(0)}%`}
          icon="⭐"
          color="text-purple-600"
        />
        
        <MetricCard
          title="Dimensions"
          value={searchMetadata?.totalDimensions || 0}
          icon="📊"
          color="text-orange-600"
        />
      </div>

      {/* Dimension Coverage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Dimension Coverage
          </h4>
          <div className="space-y-2">
            <ProgressBar
              label="Geographic"
              value={analytics.dimensionCoverage.geographic}
              color="bg-blue-500"
            />
            <ProgressBar
              label="Demographic"
              value={analytics.dimensionCoverage.demographic}
              color="bg-green-500"
            />
            <ProgressBar
              label="Sentiment"
              value={analytics.dimensionCoverage.sentiment}
              color="bg-purple-500"
            />
            <ProgressBar
              label="Topics"
              value={analytics.dimensionCoverage.topics}
              color="bg-orange-500"
            />
            <ProgressBar
              label="Engagement"
              value={analytics.dimensionCoverage.engagement}
              color="bg-red-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Confidence Distribution
          </h4>
          <div className="space-y-2">
            <ProgressBar
              label="High Confidence"
              value={analytics.confidenceMetrics.high}
              color="bg-green-500"
            />
            <ProgressBar
              label="Medium Confidence"
              value={analytics.confidenceMetrics.medium}
              color="bg-yellow-500"
            />
            <ProgressBar
              label="Low Confidence"
              value={analytics.confidenceMetrics.low}
              color="bg-red-500"
            />
          </div>
          
          {searchMetadata?.confidenceDistribution && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500 mb-2">Detailed Breakdown:</div>
              {Object.entries(searchMetadata.confidenceDistribution).map(([range, percentage]) => (
                <div key={range} className="flex justify-between text-xs">
                  <span className="text-gray-600">{range}</span>
                  <span className="font-medium">{percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Data Quality Insights */}
      {searchMetadata && (
        <div className="mt-4 bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            Data Quality Insights
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {(searchMetadata.dataQualityScore * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-gray-500">Overall Quality</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {searchMetadata.totalDimensions}
              </div>
              <div className="text-xs text-gray-500">Active Dimensions</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {searchMetadata.processingTime}ms
              </div>
              <div className="text-xs text-gray-500">Processing Time</div>
            </div>
          </div>
        </div>
      )}

      {/* Search Tips */}
      <div className="mt-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-xs text-blue-800">
            <div className="font-medium mb-1">Search Tips:</div>
            <ul className="space-y-1">
              <li>• Use specific terms for better relevance scores</li>
              <li>• Enable enhanced filters for multi-dimensional analysis</li>
              <li>• Higher confidence thresholds improve data quality</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchAnalytics;