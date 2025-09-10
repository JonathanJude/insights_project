import { AlertTriangle, CheckCircle, Database, Info, TrendingUp, XCircle } from 'lucide-react';
import React, { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface DataQualityMetrics {
  geographic: {
    definedPercentage: number;
    averageConfidence: number;
    statesCovered: number;
    undefinedCount: number;
    totalRecords: number;
  };
  demographic: {
    classificationRate: number;
    confidenceDistribution: Record<string, number>;
    undefinedRate: number;
    totalRecords: number;
  };
  sentiment: {
    modelAgreementRate: number;
    complexityDistribution: Record<string, number>;
    confidenceCalibration: number;
    totalRecords: number;
  };
  overall: {
    dataCompleteness: number;
    dataAccuracy: number;
    dataConsistency: number;
    lastUpdated: string;
  };
}

interface DataQualityDashboardProps {
  metrics: DataQualityMetrics;
  className?: string;
}

const DataQualityDashboard: React.FC<DataQualityDashboardProps> = ({
  metrics,
  className = ''
}) => {
  const confidenceDistributionData = useMemo(() => {
    return Object.entries(metrics.demographic.confidenceDistribution).map(([range, value]) => ({
      range,
      value: Math.round(value * 100),
      count: Math.round(value * metrics.demographic.totalRecords)
    }));
  }, [metrics.demographic]);

  const complexityDistributionData = useMemo(() => {
    return Object.entries(metrics.sentiment.complexityDistribution).map(([type, value]) => ({
      type,
      value: Math.round(value * 100),
      count: Math.round(value * metrics.sentiment.totalRecords)
    }));
  }, [metrics.sentiment]);

  const overallQualityData = useMemo(() => [
    { metric: 'Completeness', value: metrics.overall.dataCompleteness },
    { metric: 'Accuracy', value: metrics.overall.dataAccuracy },
    { metric: 'Consistency', value: metrics.overall.dataConsistency }
  ], [metrics.overall]);

  const getQualityColor = (value: number) => {
    if (value >= 90) return '#10B981'; // Green
    if (value >= 75) return '#F59E0B'; // Yellow
    if (value >= 60) return '#EF4444'; // Red
    return '#6B7280'; // Gray
  };

  const getQualityIcon = (value: number) => {
    if (value >= 90) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (value >= 75) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const getQualityStatus = (value: number) => {
    if (value >= 90) return 'Excellent';
    if (value >= 75) return 'Good';
    if (value >= 60) return 'Fair';
    return 'Poor';
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Quality Score */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Database className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Data Quality Overview</h2>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date(metrics.overall.lastUpdated).toLocaleString()}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {overallQualityData.map((item) => (
            <div key={item.metric} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{item.metric}</span>
                {getQualityIcon(item.value)}
              </div>
              <div className="flex items-end space-x-2">
                <span className="text-2xl font-bold text-gray-900">{item.value}%</span>
                <span className={`text-sm font-medium ${
                  item.value >= 90 ? 'text-green-600' :
                  item.value >= 75 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {getQualityStatus(item.value)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={overallQualityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => [`${value}%`, 'Quality Score']} />
              <Bar dataKey="value" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Geographic Data Quality */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Geographic Data Quality</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {metrics.geographic.definedPercentage}%
            </div>
            <div className="text-sm text-gray-600">Defined Locations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(metrics.geographic.averageConfidence * 100)}%
            </div>
            <div className="text-sm text-gray-600">Avg Confidence</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {metrics.geographic.statesCovered}
            </div>
            <div className="text-sm text-gray-600">States Covered</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {metrics.geographic.undefinedCount.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Undefined Records</div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <div className="flex items-start space-x-2">
            <Info className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Geographic Quality Assessment</p>
              <p>
                {metrics.geographic.definedPercentage >= 85 
                  ? 'Excellent geographic coverage with high confidence scores.'
                  : metrics.geographic.definedPercentage >= 70
                  ? 'Good geographic coverage, some improvement possible.'
                  : 'Geographic data quality needs improvement. Consider additional data sources.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Demographic Data Quality */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Demographic Data Quality</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Confidence Distribution</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={confidenceDistributionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ range, value }) => `${range}: ${value}%`}
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {confidenceDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Classification Rate</span>
                <span className="text-sm font-bold text-blue-600">
                  {metrics.demographic.classificationRate}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Undefined Rate</span>
                <span className="text-sm font-bold text-red-600">
                  {metrics.demographic.undefinedRate}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total Records</span>
                <span className="text-sm font-bold text-gray-600">
                  {metrics.demographic.totalRecords.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-700">
                  <p className="font-medium mb-1">Demographic Quality Note</p>
                  <p>
                    {metrics.demographic.undefinedRate > 25
                      ? 'High undefined rate may impact analysis accuracy. Consider improving data collection.'
                      : 'Demographic classification quality is within acceptable ranges.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sentiment Data Quality */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sentiment Analysis Quality</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Complexity Distribution</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={complexityDistributionData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="type" type="category" width={80} />
                  <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  <Bar dataKey="value" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Model Agreement</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {metrics.sentiment.modelAgreementRate}%
                </div>
                <p className="text-sm text-green-700">
                  {metrics.sentiment.modelAgreementRate >= 80
                    ? 'High model consensus indicates reliable sentiment analysis.'
                    : 'Model agreement could be improved for better reliability.'
                  }
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Confidence Calibration</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(metrics.sentiment.confidenceCalibration * 100)}%
                </div>
                <p className="text-sm text-blue-700">
                  Measures how well confidence scores match actual accuracy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataQualityDashboard;