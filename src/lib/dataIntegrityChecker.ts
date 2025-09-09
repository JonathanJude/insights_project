import { mockPoliticians } from '../mock/politicians';
import { generateSentimentInsights } from '../mock/sentimentData';
import { checkDataConsistency, monitorDataPerformance, validatePoliticianData, validateSentimentData } from './dataValidation';

// Data integrity checker that runs comprehensive validation
export interface DataIntegrityReport {
  timestamp: string;
  overall: {
    status: 'healthy' | 'warning' | 'critical';
    score: number; // 0-100
    summary: string;
  };
  politicians: {
    total: number;
    valid: number;
    errorRate: number;
    issues: string[];
  };
  sentimentData: {
    total: number;
    valid: number;
    errorRate: number;
    issues: string[];
  };
  consistency: {
    status: 'consistent' | 'inconsistent';
    issues: string[];
    recommendations: string[];
  };
  performance: {
    validationDuration: number;
    memoryUsage?: number;
    recommendations: string[];
  };
  recommendations: string[];
}

// Main integrity check function
export const runDataIntegrityCheck = (): DataIntegrityReport => {
  console.log('🔍 Running data integrity check...');
  
  const startTime = performance.now();
  
  // Validate politician data
  const politicianValidation = monitorDataPerformance(
    () => validatePoliticianData(mockPoliticians),
    'politician-validation'
  );
  
  // Generate sample sentiment data for validation
  const sampleSentimentData = monitorDataPerformance(
    () => {
      const sampleData = [];
      for (let i = 0; i < Math.min(5, mockPoliticians.length); i++) {
        const politician = mockPoliticians[i];
        const insights = generateSentimentInsights(politician.id, 7); // 7 days of data
        sampleData.push(...insights);
      }
      return sampleData;
    },
    'sentiment-data-generation'
  );
  
  // Validate sentiment data
  const sentimentValidation = monitorDataPerformance(
    () => validateSentimentData(sampleSentimentData.result),
    'sentiment-validation'
  );
  
  // Check cross-data consistency
  const consistencyCheck = monitorDataPerformance(
    () => checkDataConsistency(mockPoliticians, sampleSentimentData.result),
    'consistency-check'
  );
  
  const endTime = performance.now();
  const totalDuration = endTime - startTime;
  
  // Calculate overall health score
  const politicianScore = (1 - politicianValidation.result.summary.errorRate) * 40;
  const sentimentScore = (1 - sentimentValidation.result.summary.errorRate) * 40;
  const consistencyScore = consistencyCheck.result.consistent ? 20 : 0;
  const overallScore = Math.round(politicianScore + sentimentScore + consistencyScore);
  
  // Determine overall status
  let overallStatus: 'healthy' | 'warning' | 'critical';
  if (overallScore >= 90) {
    overallStatus = 'healthy';
  } else if (overallScore >= 70) {
    overallStatus = 'warning';
  } else {
    overallStatus = 'critical';
  }
  
  // Collect all recommendations
  const recommendations: string[] = [];
  
  if (politicianValidation.result.warnings.length > 0) {
    recommendations.push(...politicianValidation.result.warnings.map(w => w.recommendation));
  }
  
  if (sentimentValidation.result.warnings.length > 0) {
    recommendations.push(...sentimentValidation.result.warnings.map(w => w.recommendation));
  }
  
  if (!consistencyCheck.result.consistent) {
    recommendations.push(...consistencyCheck.result.recommendations);
  }
  
  // Performance recommendations
  const performanceRecommendations: string[] = [];
  if (totalDuration > 500) {
    performanceRecommendations.push('Consider optimizing data validation for better performance');
  }
  
  if (politicianValidation.duration > 100) {
    performanceRecommendations.push('Politician data validation is slow - consider data structure optimization');
  }
  
  const report: DataIntegrityReport = {
    timestamp: new Date().toISOString(),
    overall: {
      status: overallStatus,
      score: overallScore,
      summary: generateSummary(overallStatus, overallScore, politicianValidation.result, sentimentValidation.result)
    },
    politicians: {
      total: politicianValidation.result.summary.total,
      valid: politicianValidation.result.summary.valid,
      errorRate: politicianValidation.result.summary.errorRate,
      issues: politicianValidation.result.errors.map(e => e.message)
    },
    sentimentData: {
      total: sentimentValidation.result.summary.total,
      valid: sentimentValidation.result.summary.valid,
      errorRate: sentimentValidation.result.summary.errorRate,
      issues: sentimentValidation.result.errors.map(e => e.message)
    },
    consistency: {
      status: consistencyCheck.result.consistent ? 'consistent' : 'inconsistent',
      issues: consistencyCheck.result.issues,
      recommendations: consistencyCheck.result.recommendations
    },
    performance: {
      validationDuration: totalDuration,
      memoryUsage: politicianValidation.memoryUsage,
      recommendations: performanceRecommendations
    },
    recommendations: [...new Set(recommendations)] // Remove duplicates
  };
  
  // Log results
  logIntegrityReport(report);
  
  return report;
};

// Generate human-readable summary
const generateSummary = (
  status: 'healthy' | 'warning' | 'critical',
  score: number,
  politicianValidation: any,
  sentimentValidation: any
): string => {
  const politicianCount = politicianValidation.summary.valid;
  const sentimentCount = sentimentValidation.summary.valid;
  
  switch (status) {
    case 'healthy':
      return `Data integrity is excellent (${score}/100). ${politicianCount} politicians and ${sentimentCount} sentiment records validated successfully.`;
    case 'warning':
      return `Data integrity has minor issues (${score}/100). Most data is valid but some improvements needed.`;
    case 'critical':
      return `Data integrity has serious issues (${score}/100). Immediate attention required to fix data problems.`;
    default:
      return `Data integrity check completed with score ${score}/100.`;
  }
};

// Log integrity report to console
const logIntegrityReport = (report: DataIntegrityReport) => {
  const statusEmoji = {
    healthy: '✅',
    warning: '⚠️',
    critical: '❌'
  };
  
  console.log(`${statusEmoji[report.overall.status]} Data Integrity Check Complete`);
  console.log(`📊 Overall Score: ${report.overall.score}/100`);
  console.log(`📈 Politicians: ${report.politicians.valid}/${report.politicians.total} valid`);
  console.log(`📉 Sentiment Data: ${report.sentimentData.valid}/${report.sentimentData.total} valid`);
  console.log(`⏱️ Validation Duration: ${report.performance.validationDuration.toFixed(2)}ms`);
  
  if (report.overall.status !== 'healthy') {
    console.warn('🔧 Issues found:');
    [...report.politicians.issues, ...report.sentimentData.issues, ...report.consistency.issues]
      .forEach(issue => console.warn(`  - ${issue}`));
  }
  
  if (report.recommendations.length > 0) {
    console.log('💡 Recommendations:');
    report.recommendations.forEach(rec => console.log(`  - ${rec}`));
  }
};

// Automated data health monitoring
export class DataHealthMonitor {
  private static instance: DataHealthMonitor;
  private lastReport: DataIntegrityReport | null = null;
  private monitoringInterval: NodeJS.Timeout | null = null;
  
  static getInstance(): DataHealthMonitor {
    if (!DataHealthMonitor.instance) {
      DataHealthMonitor.instance = new DataHealthMonitor();
    }
    return DataHealthMonitor.instance;
  }
  
  startMonitoring(intervalMs: number = 5 * 60 * 1000): void { // Default: 5 minutes
    if (this.monitoringInterval) {
      this.stopMonitoring();
    }
    
    // Run initial check
    this.lastReport = runDataIntegrityCheck();
    
    // Set up periodic monitoring
    this.monitoringInterval = setInterval(() => {
      this.lastReport = runDataIntegrityCheck();
      
      // Alert on critical issues
      if (this.lastReport.overall.status === 'critical') {
        console.error('🚨 CRITICAL: Data integrity issues detected!');
        // In a real app, you might want to send alerts here
      }
    }, intervalMs);
    
    console.log(`📡 Data health monitoring started (interval: ${intervalMs / 1000}s)`);
  }
  
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('📡 Data health monitoring stopped');
    }
  }
  
  getLastReport(): DataIntegrityReport | null {
    return this.lastReport;
  }
  
  isHealthy(): boolean {
    return this.lastReport?.overall.status === 'healthy' || false;
  }
}

// Quick health check for components
export const quickHealthCheck = (): boolean => {
  try {
    const basicValidation = validatePoliticianData(mockPoliticians.slice(0, 5));
    return basicValidation.isValid && basicValidation.summary.errorRate < 0.1;
  } catch (error) {
    console.error('Quick health check failed:', error);
    return false;
  }
};

// Export singleton instance
export const dataHealthMonitor = DataHealthMonitor.getInstance();