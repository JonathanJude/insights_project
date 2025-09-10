import { AlertTriangle, CheckCircle, Download, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import ConfidenceIndicator from '../../components/ui/ConfidenceIndicator';
import DataQualityDashboard from '../../components/ui/DataQualityDashboard';
import DataReliabilityIndicator from '../../components/ui/DataReliabilityIndicator';
import useDataQuality from '../../hooks/useDataQuality';

const DataQualityPage: React.FC = () => {
  const {
    metrics,
    isLoading,
    lastRefresh,
    refreshMetrics,
    getReliabilityMetrics,
    getQualityScore,
    getQualityTrend,
    getDataQualityInsights,
    exportQualityReport
  } = useDataQuality();

  const [includeUndefined, setIncludeUndefined] = useState({
    geographic: true,
    demographic: true,
    sentiment: true
  });

  const insights = getDataQualityInsights();

  const handleExportReport = () => {
    const report = exportQualityReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `data-quality-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUndefinedToggle = (dataType: string, include: boolean) => {
    setIncludeUndefined(prev => ({
      ...prev,
      [dataType]: include
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data Quality Analysis</h1>
            <p className="text-gray-600 mt-1">
              Monitor data reliability, confidence scores, and undefined data handling
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-500">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </span>
            <button
              onClick={refreshMetrics}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExportReport}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Quality Insights */}
        {insights.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Quality Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    insight.type === 'success' ? 'bg-green-50 border-green-200' :
                    insight.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {insight.type === 'success' ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    ) : (
                      <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                        insight.type === 'warning' ? 'text-yellow-600' : 'text-red-600'
                      }`} />
                    )}
                    <div>
                      <h3 className={`font-medium ${
                        insight.type === 'success' ? 'text-green-900' :
                        insight.type === 'warning' ? 'text-yellow-900' :
                        'text-red-900'
                      }`}>
                        {insight.category}
                      </h3>
                      <p className={`text-sm mt-1 ${
                        insight.type === 'success' ? 'text-green-700' :
                        insight.type === 'warning' ? 'text-yellow-700' :
                        'text-red-700'
                      }`}>
                        {insight.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quality Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {['geographic', 'demographic', 'sentiment'].map((dataType) => {
            const score = getQualityScore(dataType as any);
            const trend = getQualityTrend(dataType);
            
            return (
              <div key={dataType} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700 capitalize">
                    {dataType} Quality
                  </h3>
                  <div className="flex items-center space-x-1">
                    {trend.direction === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : trend.direction === 'down' ? (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    ) : null}
                    <span className={`text-xs ${
                      trend.direction === 'up' ? 'text-green-600' :
                      trend.direction === 'down' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {trend.change > 0 ? '+' : ''}{trend.change}%
                    </span>
                  </div>
                </div>
                
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {score.toFixed(1)}%
                </div>
                
                <ConfidenceIndicator
                  confidence={score / 100}
                  variant="bar"
                  showLabel={false}
                  size="sm"
                />
              </div>
            );
          })}
          
          {/* Overall Quality */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">Overall Quality</h3>
              <div className="flex items-center space-x-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-xs text-green-600">+1.8%</span>
              </div>
            </div>
            
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {((metrics.overall.dataCompleteness + metrics.overall.dataAccuracy + metrics.overall.dataConsistency) / 3).toFixed(1)}%
            </div>
            
            <ConfidenceIndicator
              confidence={((metrics.overall.dataCompleteness + metrics.overall.dataAccuracy + metrics.overall.dataConsistency) / 3) / 100}
              variant="bar"
              showLabel={false}
              size="sm"
            />
          </div>
        </div>

        {/* Main Dashboard */}
        <DataQualityDashboard metrics={metrics} />

        {/* Data Reliability Indicators */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DataReliabilityIndicator
            metrics={getReliabilityMetrics('geographic')}
            dataType="Geographic"
            showDetails={true}
            showUndefinedToggle={true}
            includeUndefined={includeUndefined.geographic}
            onUndefinedToggle={(include) => handleUndefinedToggle('geographic', include)}
          />
          
          <DataReliabilityIndicator
            metrics={getReliabilityMetrics('demographic')}
            dataType="Demographic"
            showDetails={true}
            showUndefinedToggle={true}
            includeUndefined={includeUndefined.demographic}
            onUndefinedToggle={(include) => handleUndefinedToggle('demographic', include)}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DataReliabilityIndicator
            metrics={getReliabilityMetrics('sentiment')}
            dataType="Sentiment"
            showDetails={true}
            showUndefinedToggle={true}
            includeUndefined={includeUndefined.sentiment}
            onUndefinedToggle={(include) => handleUndefinedToggle('sentiment', include)}
          />
          
          <DataReliabilityIndicator
            metrics={getReliabilityMetrics('topic')}
            dataType="Topic"
            showDetails={true}
            showUndefinedToggle={true}
            includeUndefined={includeUndefined.topic || true}
            onUndefinedToggle={(include) => handleUndefinedToggle('topic', include)}
          />
        </div>

        {/* Confidence Indicator Examples */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Confidence Indicator Examples</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Badge Variants</h3>
              <div className="space-y-2">
                <ConfidenceIndicator confidence={0.95} variant="badge" size="sm" />
                <ConfidenceIndicator confidence={0.75} variant="badge" size="md" />
                <ConfidenceIndicator confidence={0.45} variant="badge" size="lg" />
                <ConfidenceIndicator confidence={0} undefinedData={true} variant="badge" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Icon Variants</h3>
              <div className="flex space-x-2">
                <ConfidenceIndicator confidence={0.95} variant="icon" />
                <ConfidenceIndicator confidence={0.75} variant="icon" />
                <ConfidenceIndicator confidence={0.45} variant="icon" />
                <ConfidenceIndicator confidence={0.15} variant="icon" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Bar Variants</h3>
              <div className="space-y-2">
                <ConfidenceIndicator 
                  confidence={0.85} 
                  variant="bar" 
                  dataType="Geographic"
                  modelAgreement={0.92}
                />
                <ConfidenceIndicator 
                  confidence={0.65} 
                  variant="bar" 
                  dataType="Demographic"
                  modelAgreement={0.78}
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Detailed Variant</h3>
              <ConfidenceIndicator 
                confidence={0.82} 
                variant="detailed" 
                dataType="Sentiment Analysis"
                modelAgreement={0.89}
                showTooltip={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataQualityPage;