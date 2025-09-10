import { useEffect, useMemo, useState } from 'react';

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

interface DataReliabilityMetrics {
  totalRecords: number;
  definedRecords: number;
  undefinedRecords: number;
  averageConfidence: number;
  dataCompleteness: number;
  lastUpdated: string;
  sources: string[];
}

// Mock data quality metrics generator
const generateDataQualityMetrics = (): DataQualityMetrics => {
  return {
    geographic: {
      definedPercentage: 85.2,
      averageConfidence: 0.73,
      statesCovered: 36,
      undefinedCount: 1847,
      totalRecords: 12500
    },
    demographic: {
      classificationRate: 78.5,
      confidenceDistribution: {
        'High (>0.8)': 0.45,
        'Medium (0.6-0.8)': 0.35,
        'Low (<0.6)': 0.20
      },
      undefinedRate: 21.5,
      totalRecords: 12500
    },
    sentiment: {
      modelAgreementRate: 82.3,
      complexityDistribution: {
        'Simple': 0.75,
        'Mixed': 0.18,
        'Sarcastic': 0.05,
        'Conditional': 0.02
      },
      confidenceCalibration: 0.89,
      totalRecords: 12500
    },
    overall: {
      dataCompleteness: 81.7,
      dataAccuracy: 87.3,
      dataConsistency: 79.8,
      lastUpdated: new Date().toISOString()
    }
  };
};

const generateReliabilityMetrics = (dataType: string): DataReliabilityMetrics => {
  const baseMetrics = {
    totalRecords: 12500,
    lastUpdated: new Date().toISOString(),
    sources: ['Social Media API', 'News Aggregator', 'Public Records', 'Survey Data']
  };

  switch (dataType.toLowerCase()) {
    case 'geographic':
      return {
        ...baseMetrics,
        definedRecords: 10653,
        undefinedRecords: 1847,
        averageConfidence: 0.73,
        dataCompleteness: 85.2
      };
    
    case 'demographic':
      return {
        ...baseMetrics,
        definedRecords: 9812,
        undefinedRecords: 2688,
        averageConfidence: 0.68,
        dataCompleteness: 78.5
      };
    
    case 'sentiment':
      return {
        ...baseMetrics,
        definedRecords: 11875,
        undefinedRecords: 625,
        averageConfidence: 0.82,
        dataCompleteness: 95.0
      };
    
    case 'topic':
      return {
        ...baseMetrics,
        definedRecords: 10250,
        undefinedRecords: 2250,
        averageConfidence: 0.75,
        dataCompleteness: 82.0
      };
    
    default:
      return {
        ...baseMetrics,
        definedRecords: 10000,
        undefinedRecords: 2500,
        averageConfidence: 0.70,
        dataCompleteness: 80.0
      };
  }
};

export const useDataQuality = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Simulate loading delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const metrics = useMemo(() => {
    return generateDataQualityMetrics();
  }, [lastRefresh]);

  const getReliabilityMetrics = (dataType: string): DataReliabilityMetrics => {
    return generateReliabilityMetrics(dataType);
  };

  const refreshMetrics = () => {
    setIsLoading(true);
    setTimeout(() => {
      setLastRefresh(new Date());
      setIsLoading(false);
    }, 1000);
  };

  const getQualityScore = (dataType: keyof DataQualityMetrics['geographic' | 'demographic' | 'sentiment']) => {
    switch (dataType) {
      case 'geographic':
        return (metrics.geographic.definedPercentage + metrics.geographic.averageConfidence * 100) / 2;
      case 'demographic':
        return metrics.demographic.classificationRate;
      case 'sentiment':
        return (metrics.sentiment.modelAgreementRate + metrics.sentiment.confidenceCalibration * 100) / 2;
      default:
        return 0;
    }
  };

  const getQualityTrend = (dataType: string) => {
    // Mock trend data - in a real app, this would come from historical data
    const trends = {
      geographic: { change: 2.3, direction: 'up' as const },
      demographic: { change: -1.2, direction: 'down' as const },
      sentiment: { change: 4.1, direction: 'up' as const },
      overall: { change: 1.8, direction: 'up' as const }
    };
    
    return trends[dataType as keyof typeof trends] || { change: 0, direction: 'stable' as const };
  };

  const getDataQualityInsights = () => {
    const insights = [];
    
    if (metrics.geographic.definedPercentage < 80) {
      insights.push({
        type: 'warning',
        category: 'Geographic',
        message: 'Geographic data completeness is below optimal levels. Consider additional data sources.',
        impact: 'medium'
      });
    }
    
    if (metrics.demographic.undefinedRate > 25) {
      insights.push({
        type: 'alert',
        category: 'Demographic',
        message: 'High undefined rate in demographic data may impact analysis accuracy.',
        impact: 'high'
      });
    }
    
    if (metrics.sentiment.modelAgreementRate > 85) {
      insights.push({
        type: 'success',
        category: 'Sentiment',
        message: 'Excellent model agreement indicates reliable sentiment analysis.',
        impact: 'positive'
      });
    }
    
    if (metrics.overall.dataConsistency < 80) {
      insights.push({
        type: 'warning',
        category: 'Overall',
        message: 'Data consistency could be improved through better validation processes.',
        impact: 'medium'
      });
    }
    
    return insights;
  };

  const exportQualityReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      metrics,
      insights: getDataQualityInsights(),
      trends: {
        geographic: getQualityTrend('geographic'),
        demographic: getQualityTrend('demographic'),
        sentiment: getQualityTrend('sentiment'),
        overall: getQualityTrend('overall')
      },
      recommendations: [
        'Implement additional geographic data validation',
        'Improve demographic classification algorithms',
        'Maintain current sentiment analysis quality',
        'Establish data consistency monitoring'
      ]
    };
    
    return report;
  };

  return {
    metrics,
    isLoading,
    lastRefresh,
    refreshMetrics,
    getReliabilityMetrics,
    getQualityScore,
    getQualityTrend,
    getDataQualityInsights,
    exportQualityReport
  };
};

export default useDataQuality;