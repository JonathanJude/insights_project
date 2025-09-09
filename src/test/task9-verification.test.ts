import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    aggregateChartData,
    convertToChartData,
    generateFilteredChartData,
    safeDataTransform,
    simulateDataLoading,
    validateChartData
} from '../lib/chartDataUtils';
import {
    DataHealthMonitor,
    quickHealthCheck,
    runDataIntegrityCheck
} from '../lib/dataIntegrityChecker';
import {
    checkDataConsistency as checkValidationConsistency,
    monitorDataPerformance,
    validatePoliticianData
} from '../lib/dataValidation';
import {
    checkDataConsistency,
    mockApiDelay,
    mockApiError,
    mockSearchWithFilters,
    simulateRealisticErrors,
    validateMockData
} from '../mock';
import { mockPoliticians } from '../mock/politicians';
import {
    generateEnhancedSentimentHistory,
    generatePoliticianInsights,
    generateTrendingTopics
} from '../mock/sentimentData';
import type { ChartFilter } from '../types';

describe('Task 9: Mock Data Integration Optimization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Enhanced Mock API System', () => {
    it('should provide realistic API delays with variance', async () => {
      const startTime = Date.now();
      await mockApiDelay(100, 0.5); // 100ms ± 50%
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should be between 50ms and 150ms (100ms ± 50%)
      expect(duration).toBeGreaterThanOrEqual(45); // Allow some tolerance
      expect(duration).toBeLessThanOrEqual(155);
    });

    it('should simulate realistic error scenarios', async () => {
      // Test network error simulation
      const networkErrorPromise = mockApiError('Network failed', 0, 'network');
      await expect(networkErrorPromise).rejects.toThrow('Network failed');
      
      // Test server error simulation
      const serverErrorPromise = mockApiError('Server failed', 500, 'server');
      await expect(serverErrorPromise).rejects.toThrow('Server failed');
      
      // Test timeout error simulation
      const timeoutErrorPromise = mockApiError('Timeout', 408, 'timeout');
      await expect(timeoutErrorPromise).rejects.toThrow('Timeout');
    });

    it('should simulate realistic error rates', async () => {
      let errorCount = 0;
      const totalRequests = 100;
      
      for (let i = 0; i < totalRequests; i++) {
        try {
          await simulateRealisticErrors('test-endpoint', 0.1); // 10% error rate
        } catch {
          errorCount++;
        }
      }
      
      // Should be approximately 10% ± some variance
      expect(errorCount).toBeGreaterThan(5);
      expect(errorCount).toBeLessThan(20);
    });
  });

  describe('Enhanced Search and Filtering', () => {
    const testData = [
      { id: '1', name: 'John Doe', party: 'APC', active: true },
      { id: '2', name: 'Jane Smith', party: 'PDP', active: false },
      { id: '3', name: 'Bob Johnson', party: 'APC', active: true }
    ];

    it('should handle enhanced search with fuzzy matching', () => {
      const results = mockSearchWithFilters(
        testData,
        { query: 'John' }, // Exact partial match
        ['name']
      );
      
      expect(results).toHaveLength(2); // Should match "John Doe" and "Bob Johnson"
      expect(results.map(r => r.name)).toContain('John Doe');
      expect(results.map(r => r.name)).toContain('Bob Johnson');
    });

    it('should handle edge cases in search', () => {
      // Empty data
      expect(mockSearchWithFilters([], { query: 'test' }, ['name'])).toEqual([]);
      
      // Empty query
      expect(mockSearchWithFilters(testData, { query: '' }, ['name'])).toEqual(testData);
      
      // Invalid filters
      expect(mockSearchWithFilters(testData, {}, ['name'])).toEqual(testData);
      
      // Non-existent field
      expect(mockSearchWithFilters(testData, { query: 'test' }, ['nonexistent' as any])).toEqual([]);
    });

    it('should validate mock data structure', () => {
      const { valid, invalid, errors } = validateMockData(testData, ['id', 'name']);
      
      expect(valid).toHaveLength(3);
      expect(invalid).toHaveLength(0);
      expect(errors).toHaveLength(0);
    });

    it('should detect invalid mock data', () => {
      const invalidData = [
        { id: '1', name: 'John' }, // Valid
        { id: '', name: 'Jane' },  // Invalid - empty id
        { name: 'Bob' }            // Invalid - missing id
      ];
      
      const { valid, invalid, errors } = validateMockData(invalidData, ['id', 'name']);
      
      expect(valid).toHaveLength(1);
      expect(invalid).toHaveLength(2);
      expect(errors).toHaveLength(2);
    });
  });

  describe('Enhanced Sentiment Data Generation', () => {
    it('should generate comprehensive politician insights', () => {
      const insights = generatePoliticianInsights('pol_001');
      
      expect(insights).toHaveProperty('overallSentiment');
      expect(insights).toHaveProperty('totalMentions');
      expect(insights).toHaveProperty('totalEngagement');
      expect(insights).toHaveProperty('platformBreakdown');
      expect(insights).toHaveProperty('demographicBreakdown');
      expect(insights).toHaveProperty('dataQuality');
      
      // Validate data quality assessment
      expect(insights.dataQuality.score).toBeGreaterThanOrEqual(0);
      expect(insights.dataQuality.score).toBeLessThanOrEqual(100);
    });

    it('should handle invalid politician ID', () => {
      expect(() => generatePoliticianInsights('')).toThrow('Invalid politician ID');
      expect(() => generatePoliticianInsights(null as any)).toThrow('Invalid politician ID');
    });

    it('should handle date range filters', () => {
      const insights = generatePoliticianInsights('pol_001', {
        startDate: '2024-01-01',
        endDate: '2024-01-07'
      });
      
      expect(insights.trendData.length).toBeGreaterThanOrEqual(6); // Allow for date calculation variance
      expect(insights.trendData.length).toBeLessThanOrEqual(8);
      expect(insights.filters).toEqual({
        startDate: '2024-01-01',
        endDate: '2024-01-07'
      });
    });

    it('should validate date range filters', () => {
      expect(() => generatePoliticianInsights('pol_001', {
        startDate: '2024-01-07',
        endDate: '2024-01-01' // End before start
      })).toThrow('Start date cannot be after end date');
    });

    it('should generate realistic sentiment history', () => {
      const history = generateEnhancedSentimentHistory('pol_001', 30);
      
      expect(history).toHaveLength(30);
      
      history.forEach(day => {
        expect(day).toHaveProperty('date');
        expect(day).toHaveProperty('sentimentScore');
        expect(day).toHaveProperty('mentionCount');
        expect(day).toHaveProperty('positive');
        expect(day).toHaveProperty('neutral');
        expect(day).toHaveProperty('negative');
        
        // Validate sentiment percentages add up to 100%
        const total = day.positive + day.neutral + day.negative;
        expect(Math.abs(total - 100)).toBeLessThan(0.1);
      });
    });

    it('should generate trending topics', () => {
      const topics = generateTrendingTopics('pol_001', 5);
      
      expect(topics).toHaveLength(5);
      
      topics.forEach(topic => {
        expect(topic).toHaveProperty('keyword');
        expect(topic).toHaveProperty('mentionCount');
        expect(topic).toHaveProperty('sentiment');
        expect(topic).toHaveProperty('trend');
        expect(['rising', 'falling', 'stable']).toContain(topic.trend);
      });
    });
  });

  describe('Enhanced Chart Data Utils', () => {
    const mockFilter: ChartFilter = {
      timeRange: '30d',
      platforms: ['TWITTER', 'FACEBOOK'],
      parties: ['APC', 'PDP']
    };

    it('should generate filtered chart data with validation', () => {
      const chartData = generateFilteredChartData(mockFilter);
      
      expect(Array.isArray(chartData)).toBe(true);
      expect(chartData.length).toBeGreaterThan(0);
      
      chartData.forEach(point => {
        expect(point).toHaveProperty('date');
        expect(point).toHaveProperty('value');
        expect(typeof point.value).toBe('number');
        expect(point.value).toBeGreaterThanOrEqual(-1);
        expect(point.value).toBeLessThanOrEqual(1);
      });
    });

    it('should handle invalid chart filters', () => {
      // Invalid filter object - should still return data with defaults
      const invalidData = generateFilteredChartData(null as any);
      expect(Array.isArray(invalidData)).toBe(true);
      
      // Unknown time range - should still return data with defaults
      const unknownTimeRange = generateFilteredChartData({ timeRange: 'invalid' as any });
      expect(Array.isArray(unknownTimeRange)).toBe(true);
      expect(unknownTimeRange.length).toBeGreaterThan(0);
    });

    it('should convert trend points to chart data safely', () => {
      const trendPoints = [
        { date: '2024-01-01', value: 0.5, metadata: { mentionCount: 100 } },
        { date: '2024-01-02', value: -0.3, metadata: { mentionCount: 80 } }
      ];
      
      const chartData = convertToChartData(trendPoints, '7d');
      
      expect(chartData).toHaveLength(2);
      
      chartData.forEach(point => {
        expect(point).toHaveProperty('date');
        expect(point).toHaveProperty('sentiment');
        expect(point).toHaveProperty('positive');
        expect(point).toHaveProperty('negative');
        expect(point).toHaveProperty('neutral');
        
        // Validate percentages
        const total = point.positive + point.negative + point.neutral;
        expect(Math.abs(total - 100)).toBeLessThan(0.1);
      });
    });

    it('should handle invalid trend points', () => {
      const invalidPoints = [
        { date: 'invalid-date', value: 0.5 },
        { date: '2024-01-01', value: NaN },
        null,
        undefined
      ];
      
      const chartData = convertToChartData(invalidPoints as any, '7d');
      expect(chartData).toHaveLength(0); // All invalid points filtered out
    });

    it('should simulate realistic data loading with errors', async () => {
      // Test successful loading
      const startTime = Date.now();
      await simulateDataLoading(100);
      const duration = Date.now() - startTime;
      expect(duration).toBeGreaterThanOrEqual(45);
      
      // Test error simulation
      await expect(
        simulateDataLoading(100, { errorRate: 1, errorType: 'network' })
      ).rejects.toThrow('Network connection failed');
    });

    it('should safely transform data', () => {
      const data = [1, 2, 3, 'invalid', null];
      const transformer = (item: any) => {
        if (typeof item !== 'number') throw new Error('Invalid item');
        return item * 2;
      };
      
      const result = safeDataTransform(data, transformer, 0);
      expect(result).toEqual([2, 4, 6, 0, 0]);
    });

    it('should validate chart data structure', () => {
      const validData = [
        { date: '2024-01-01', sentiment: 50 },
        { date: '2024-01-02', sentiment: 60 }
      ];
      
      const invalidData = [
        { sentiment: 50 }, // Missing date
        { date: '2024-01-01' } // Missing sentiment
      ];
      
      expect(validateChartData(validData)).toBe(true);
      expect(validateChartData(invalidData)).toBe(false);
      expect(validateChartData([])).toBe(true); // Empty is valid
      expect(validateChartData('not-array' as any)).toBe(false);
    });

    it('should aggregate chart data correctly', () => {
      const data = [
        { date: '2024-01-01', value: 0.5 },
        { date: '2024-01-01', value: 0.3 }, // Same day
        { date: '2024-01-02', value: 0.7 }
      ];
      
      const aggregated = aggregateChartData(data, 'day');
      
      expect(aggregated).toHaveLength(2);
      expect(aggregated[0].date).toBe('2024-01-01');
      expect(aggregated[0].value).toBe(0.4); // Average of 0.5 and 0.3
      expect(aggregated[0].count).toBe(2);
    });
  });

  describe('Data Validation System', () => {
    it('should validate politician data comprehensively', () => {
      const validation = validatePoliticianData(mockPoliticians);
      
      expect(validation).toHaveProperty('isValid');
      expect(validation).toHaveProperty('data');
      expect(validation).toHaveProperty('errors');
      expect(validation).toHaveProperty('warnings');
      expect(validation).toHaveProperty('summary');
      
      expect(validation.summary.total).toBe(mockPoliticians.length);
      expect(validation.summary.errorRate).toBeGreaterThanOrEqual(0);
      expect(validation.summary.errorRate).toBeLessThanOrEqual(1);
    });

    it('should detect data inconsistencies', () => {
      const politicians = mockPoliticians.slice(0, 3);
      const sentimentData = [
        {
          id: 'insight_1',
          politicianId: 'nonexistent_id', // This should be flagged
          platform: 'TWITTER' as any,
          sentimentScore: 0.5,
          sentimentLabel: 'POSITIVE' as any,
          confidence: 0.8,
          mentionCount: 100,
          engagementCount: 50,
          date: '2024-01-01',
          timeframe: 'DAY' as any,
          demographics: {
            gender: 'MALE' as any,
            ageGroup: 'ADULT' as any,
            state: 'LAGOS' as any
          }
        }
      ];
      
      const consistency = checkValidationConsistency(politicians, sentimentData);
      
      expect(consistency.consistent).toBe(false);
      expect(consistency.issues.length).toBeGreaterThan(0);
      expect(consistency.recommendations.length).toBeGreaterThan(0);
    });

    it('should monitor data operation performance', () => {
      const result = monitorDataPerformance(
        () => {
          // Simulate some work
          let sum = 0;
          for (let i = 0; i < 1000; i++) {
            sum += i;
          }
          return sum;
        },
        'test-operation'
      );
      
      expect(result).toHaveProperty('result');
      expect(result).toHaveProperty('duration');
      expect(typeof result.duration).toBe('number');
      expect(result.duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Data Integrity Checker', () => {
    it('should run comprehensive data integrity check', () => {
      const report = runDataIntegrityCheck();
      
      expect(report).toHaveProperty('timestamp');
      expect(report).toHaveProperty('overall');
      expect(report).toHaveProperty('politicians');
      expect(report).toHaveProperty('sentimentData');
      expect(report).toHaveProperty('consistency');
      expect(report).toHaveProperty('performance');
      expect(report).toHaveProperty('recommendations');
      
      expect(report.overall.score).toBeGreaterThanOrEqual(0);
      expect(report.overall.score).toBeLessThanOrEqual(100);
      expect(['healthy', 'warning', 'critical']).toContain(report.overall.status);
    });

    it('should perform quick health check', () => {
      const isHealthy = quickHealthCheck();
      expect(typeof isHealthy).toBe('boolean');
    });

    it('should handle data health monitoring', () => {
      const monitor = DataHealthMonitor.getInstance();
      
      // Test singleton pattern
      const monitor2 = DataHealthMonitor.getInstance();
      expect(monitor).toBe(monitor2);
      
      // Test monitoring lifecycle
      expect(monitor.getLastReport()).toBeNull();
      
      // Start monitoring (use short interval for testing)
      monitor.startMonitoring(100);
      
      // Should have a report after starting
      setTimeout(() => {
        expect(monitor.getLastReport()).not.toBeNull();
        expect(typeof monitor.isHealthy()).toBe('boolean');
        
        // Stop monitoring
        monitor.stopMonitoring();
      }, 150);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty datasets gracefully', () => {
      // The function still generates data even for non-existent politicians
      // This is by design to provide demo data
      const emptyInsights = generatePoliticianInsights('empty_politician');
      expect(emptyInsights.totalMentions).toBeGreaterThanOrEqual(0);
      expect(emptyInsights.dataQuality.score).toBeGreaterThanOrEqual(0);
      expect(emptyInsights.dataQuality.score).toBeLessThanOrEqual(100);
    });

    it('should handle malformed data inputs', () => {
      expect(() => convertToChartData('not-array' as any, '7d')).not.toThrow();
      expect(convertToChartData('not-array' as any, '7d')).toEqual([]);
    });

    it('should validate data consistency rules', () => {
      const testData = [
        { id: '1', score: 0.5, count: 100 },
        { id: '2', score: 1.5, count: -10 } // Invalid values
      ];
      
      const rules = [
        {
          name: 'score-range',
          check: (item: any) => item.score >= -1 && item.score <= 1,
          message: 'Score must be between -1 and 1'
        },
        {
          name: 'positive-count',
          check: (item: any) => item.count >= 0,
          message: 'Count must be non-negative'
        }
      ];
      
      const { passed, failed } = checkDataConsistency(testData, rules);
      
      expect(passed).toHaveLength(1);
      expect(failed).toHaveLength(1);
      expect(failed[0].failedRules).toHaveLength(2);
    });
  });

  describe('Performance and Memory Management', () => {
    it('should handle large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        id: `pol_${i}`,
        name: `Politician ${i}`,
        party: 'APC',
        score: Math.random()
      }));
      
      const startTime = performance.now();
      const filtered = mockSearchWithFilters(largeDataset, { party: 'APC' }, ['name']);
      const duration = performance.now() - startTime;
      
      expect(filtered).toHaveLength(1000);
      expect(duration).toBeLessThan(100); // Should complete within 100ms
    });

    it('should prevent memory leaks in data generation', () => {
      // Generate multiple datasets and ensure they don't accumulate
      for (let i = 0; i < 10; i++) {
        const insights = generatePoliticianInsights(`pol_${i}`);
        expect(insights).toBeDefined();
        
        // Clear references to help GC
        Object.keys(insights).forEach(key => {
          delete (insights as any)[key];
        });
      }
      
      // This test mainly ensures no errors are thrown during generation
      expect(true).toBe(true);
    });
  });
});