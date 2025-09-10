/**
 * Intelligent Data Aggregation Service
 * 
 * Handles data aggregation with null-safe operations, weighted averages,
 * and statistical confidence intervals for sparse data
 */

import { DataQualityLevels } from '../constants/enums/system-enums';

// Aggregation types
export interface AggregationOptions {
  method: 'mean' | 'median' | 'mode' | 'sum' | 'count' | 'weighted_mean';
  handleNulls: 'skip' | 'zero' | 'interpolate' | 'weighted_skip';
  confidenceLevel: number; // 0.95 for 95% confidence
  minDataPoints: number;
  weights?: number[] | ((value: any, index: number, array: any[]) => number);
}

export interface AggregationResult {
  value: number | null;
  confidence: number;
  dataPoints: number;
  totalPoints: number;
  completeness: number;
  quality: DataQualityLevels;
  confidenceInterval?: {
    lower: number;
    upper: number;
    level: number;
  };
  metadata: {
    method: string;
    nullHandling: string;
    outliers: number;
    interpolated: number;
    weighted: boolean;
  };
}

export interface GroupedAggregationResult {
  groups: Map<string, AggregationResult>;
  overall: AggregationResult;
  groupComparisons: {
    [groupA: string]: {
      [groupB: string]: {
        difference: number;
        significantDifference: boolean;
        confidenceLevel: number;
      };
    };
  };
}

/**
 * Intelligent Data Aggregation Service
 */
export class IntelligentAggregationService {
  private static instance: IntelligentAggregationService;
  
  private constructor() {}
  
  static getInstance(): IntelligentAggregationService {
    if (!IntelligentAggregationService.instance) {
      IntelligentAggregationService.instance = new IntelligentAggregationService();
    }
    return IntelligentAggregationService.instance;
  }
  
  /**
   * Aggregate data with null-safe handling
   */
  aggregate(
    data: any[],
    field: string,
    options: Partial<AggregationOptions> = {}
  ): AggregationResult {
    const defaultOptions: AggregationOptions = {
      method: 'mean',
      handleNulls: 'skip',
      confidenceLevel: 0.95,
      minDataPoints: 3,
      weights: undefined
    };
    
    const opts = { ...defaultOptions, ...options };
    
    // Extract and clean data
    const extractedData = this.extractFieldData(data, field);
    const { cleanData, metadata } = this.processDataWithNullHandling(extractedData, opts);
    
    if (cleanData.length < opts.minDataPoints) {
      return this.createInsufficientDataResult(extractedData.length, opts);
    }
    
    // Calculate aggregation
    const aggregatedValue = this.calculateAggregation(cleanData, opts);
    const confidence = this.calculateConfidence(cleanData, opts);
    const quality = this.assessAggregationQuality(cleanData, extractedData, opts);
    const confidenceInterval = this.calculateConfidenceInterval(cleanData, opts);
    
    return {
      value: aggregatedValue,
      confidence,
      dataPoints: cleanData.length,
      totalPoints: extractedData.length,
      completeness: extractedData.length > 0 ? cleanData.length / extractedData.length : 0,
      quality,
      confidenceInterval,
      metadata: {
        method: opts.method,
        nullHandling: opts.handleNulls,
        outliers: metadata.outliers,
        interpolated: metadata.interpolated,
        weighted: !!opts.weights
      }
    };
  }
  
  /**
   * Aggregate data grouped by a field
   */
  aggregateGrouped(
    data: any[],
    valueField: string,
    groupField: string,
    options: Partial<AggregationOptions> = {}
  ): GroupedAggregationResult {
    // Group data
    const groups = this.groupData(data, groupField);
    const groupResults = new Map<string, AggregationResult>();
    
    // Aggregate each group
    groups.forEach((groupData, groupKey) => {
      const result = this.aggregate(groupData, valueField, options);
      groupResults.set(groupKey, result);
    });
    
    // Calculate overall aggregation
    const overall = this.aggregate(data, valueField, options);
    
    // Calculate group comparisons
    const groupComparisons = this.calculateGroupComparisons(groupResults);
    
    return {
      groups: groupResults,
      overall,
      groupComparisons
    };
  }
  
  /**
   * Calculate weighted average with null handling
   */
  weightedAverage(
    values: number[],
    weights: number[],
    options: Partial<AggregationOptions> = {}
  ): AggregationResult {
    const opts = { ...{ handleNulls: 'skip', confidenceLevel: 0.95, minDataPoints: 3 }, ...options };
    
    if (values.length !== weights.length) {
      throw new Error('Values and weights arrays must have the same length');
    }
    
    // Filter out null/undefined values and corresponding weights
    const validPairs = values
      .map((value, index) => ({ value, weight: weights[index] }))
      .filter(pair => this.isValidNumber(pair.value) && this.isValidNumber(pair.weight) && pair.weight > 0);
    
    if (validPairs.length < opts.minDataPoints) {
      return this.createInsufficientDataResult(values.length, opts);
    }
    
    const totalWeight = validPairs.reduce((sum, pair) => sum + pair.weight, 0);
    const weightedSum = validPairs.reduce((sum, pair) => sum + (pair.value * pair.weight), 0);
    const weightedMean = totalWeight > 0 ? weightedSum / totalWeight : 0;
    
    // Calculate weighted variance for confidence interval
    const weightedVariance = this.calculateWeightedVariance(validPairs, weightedMean);
    const confidence = this.calculateWeightedConfidence(validPairs, weightedVariance);
    
    return {
      value: weightedMean,
      confidence,
      dataPoints: validPairs.length,
      totalPoints: values.length,
      completeness: values.length > 0 ? validPairs.length / values.length : 0,
      quality: this.assessWeightedQuality(validPairs, values.length),
      confidenceInterval: this.calculateWeightedConfidenceInterval(
        weightedMean,
        weightedVariance,
        validPairs.length,
        opts.confidenceLevel
      ),
      metadata: {
        method: 'weighted_mean',
        nullHandling: opts.handleNulls,
        outliers: 0,
        interpolated: 0,
        weighted: true
      }
    };
  }
  
  /**
   * Calculate temporal aggregation with missing time points
   */
  temporalAggregation(
    data: Array<{ timestamp: Date | string; value: number; weight?: number }>,
    interval: 'hour' | 'day' | 'week' | 'month',
    options: Partial<AggregationOptions> = {}
  ): Map<string, AggregationResult> {
    const opts = { ...{ method: 'mean', handleNulls: 'interpolate', confidenceLevel: 0.95 }, ...options };
    
    // Group data by time interval
    const timeGroups = this.groupByTimeInterval(data, interval);
    const results = new Map<string, AggregationResult>();
    
    // Fill in missing time intervals if interpolation is enabled
    if (opts.handleNulls === 'interpolate') {
      const filledGroups = this.fillMissingTimeIntervals(timeGroups, interval);
      timeGroups.clear();
      filledGroups.forEach((value, key) => timeGroups.set(key, value));
    }
    
    // Aggregate each time group
    timeGroups.forEach((groupData, timeKey) => {
      const values = groupData.map(d => d.value);
      const weights = groupData.map(d => d.weight || 1);
      
      let result: AggregationResult;
      if (opts.method === 'weighted_mean' && groupData.some(d => d.weight)) {
        result = this.weightedAverage(values, weights, opts);
      } else {
        result = this.aggregate(groupData, 'value', opts);
      }
      
      results.set(timeKey, result);
    });
    
    return results;
  }
  
  /**
   * Calculate sentiment aggregation with confidence weighting
   */
  sentimentAggregation(
    sentimentData: Array<{
      sentiment: number;
      confidence: number;
      platform?: string;
      timestamp?: Date | string;
    }>,
    groupBy?: 'platform' | 'time',
    options: Partial<AggregationOptions> = {}
  ): AggregationResult | GroupedAggregationResult {
    const opts = { 
      ...{ 
        method: 'weighted_mean', 
        handleNulls: 'weighted_skip', 
        confidenceLevel: 0.95,
        minDataPoints: 5
      }, 
      ...options 
    };
    
    // Use confidence as weights
    const values = sentimentData.map(d => d.sentiment);
    const weights = sentimentData.map(d => d.confidence);
    
    if (!groupBy) {
      return this.weightedAverage(values, weights, opts);
    }
    
    if (groupBy === 'platform') {
      return this.aggregateGrouped(sentimentData, 'sentiment', 'platform', {
        ...opts,
        weights: (value, index) => sentimentData[index].confidence
      });
    }
    
    if (groupBy === 'time') {
      const temporalData = sentimentData.map(d => ({
        timestamp: d.timestamp || new Date(),
        value: d.sentiment,
        weight: d.confidence
      }));
      
      const temporalResults = this.temporalAggregation(temporalData, 'day', opts);
      
      // Convert to GroupedAggregationResult format
      const overall = this.weightedAverage(values, weights, opts);
      return {
        groups: temporalResults,
        overall,
        groupComparisons: {}
      };
    }
    
    return this.weightedAverage(values, weights, opts);
  }  
  
// Private helper methods
  
  private extractFieldData(data: any[], field: string): any[] {
    return data.map(item => {
      if (typeof item === 'object' && item !== null) {
        return this.getNestedValue(item, field);
      }
      return item;
    });
  }
  
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
  
  private processDataWithNullHandling(
    data: any[],
    options: AggregationOptions
  ): { cleanData: number[]; metadata: { outliers: number; interpolated: number } } {
    let cleanData: number[] = [];
    let outliers = 0;
    let interpolated = 0;
    
    switch (options.handleNulls) {
      case 'skip':
        cleanData = data.filter(this.isValidNumber);
        break;
        
      case 'zero':
        cleanData = data.map(value => this.isValidNumber(value) ? value : 0);
        break;
        
      case 'interpolate':
        cleanData = this.interpolateMissingValues(data);
        interpolated = cleanData.length - data.filter(this.isValidNumber).length;
        break;
        
      case 'weighted_skip':
        cleanData = data.filter(this.isValidNumber);
        break;
        
      default:
        cleanData = data.filter(this.isValidNumber);
    }
    
    // Remove outliers if needed
    const { data: dataWithoutOutliers, outlierCount } = this.removeOutliers(cleanData);
    cleanData = dataWithoutOutliers;
    outliers = outlierCount;
    
    return { cleanData, metadata: { outliers, interpolated } };
  }
  
  private interpolateMissingValues(data: any[]): number[] {
    const result: number[] = [];
    const validIndices: number[] = [];
    const validValues: number[] = [];
    
    // Find valid values and their indices
    data.forEach((value, index) => {
      if (this.isValidNumber(value)) {
        validIndices.push(index);
        validValues.push(value);
      }
    });
    
    if (validValues.length === 0) return [];
    if (validValues.length === 1) return new Array(data.length).fill(validValues[0]);
    
    // Interpolate missing values
    for (let i = 0; i < data.length; i++) {
      if (this.isValidNumber(data[i])) {
        result[i] = data[i];
      } else {
        // Find surrounding valid values for interpolation
        const prevIndex = validIndices.filter(idx => idx < i).pop();
        const nextIndex = validIndices.find(idx => idx > i);
        
        if (prevIndex !== undefined && nextIndex !== undefined) {
          // Linear interpolation
          const prevValue = data[prevIndex];
          const nextValue = data[nextIndex];
          const ratio = (i - prevIndex) / (nextIndex - prevIndex);
          result[i] = prevValue + (nextValue - prevValue) * ratio;
        } else if (prevIndex !== undefined) {
          // Use previous value
          result[i] = data[prevIndex];
        } else if (nextIndex !== undefined) {
          // Use next value
          result[i] = data[nextIndex];
        } else {
          // Use mean of all valid values
          result[i] = validValues.reduce((sum, val) => sum + val, 0) / validValues.length;
        }
      }
    }
    
    return result;
  }
  
  private removeOutliers(data: number[]): { data: number[]; outlierCount: number } {
    if (data.length < 4) return { data, outlierCount: 0 };
    
    // Use IQR method to detect outliers
    const sorted = [...data].sort((a, b) => a - b);
    const q1Index = Math.floor(sorted.length * 0.25);
    const q3Index = Math.floor(sorted.length * 0.75);
    const q1 = sorted[q1Index];
    const q3 = sorted[q3Index];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    const filteredData = data.filter(value => value >= lowerBound && value <= upperBound);
    const outlierCount = data.length - filteredData.length;
    
    return { data: filteredData, outlierCount };
  }
  
  private calculateAggregation(data: number[], options: AggregationOptions): number {
    if (data.length === 0) return 0;
    
    switch (options.method) {
      case 'mean':
        return data.reduce((sum, val) => sum + val, 0) / data.length;
        
      case 'median':
        const sorted = [...data].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 
          ? (sorted[mid - 1] + sorted[mid]) / 2 
          : sorted[mid];
          
      case 'mode':
        const frequency = new Map<number, number>();
        data.forEach(val => frequency.set(val, (frequency.get(val) || 0) + 1));
        let maxFreq = 0;
        let mode = data[0];
        frequency.forEach((freq, val) => {
          if (freq > maxFreq) {
            maxFreq = freq;
            mode = val;
          }
        });
        return mode;
        
      case 'sum':
        return data.reduce((sum, val) => sum + val, 0);
        
      case 'count':
        return data.length;
        
      case 'weighted_mean':
        // This should be handled by weightedAverage method
        return data.reduce((sum, val) => sum + val, 0) / data.length;
        
      default:
        return data.reduce((sum, val) => sum + val, 0) / data.length;
    }
  }
  
  private calculateConfidence(data: number[], options: AggregationOptions): number {
    if (data.length === 0) return 0;
    if (data.length === 1) return 0.5;
    
    // Base confidence on sample size and variance
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (data.length - 1);
    const standardError = Math.sqrt(variance / data.length);
    
    // Normalize confidence based on sample size and standard error
    const sampleSizeConfidence = Math.min(data.length / 30, 1); // Max confidence at 30+ samples
    const varianceConfidence = Math.max(0, 1 - (standardError / Math.abs(mean || 1)));
    
    return (sampleSizeConfidence + varianceConfidence) / 2;
  }
  
  private calculateConfidenceInterval(
    data: number[],
    options: AggregationOptions
  ): { lower: number; upper: number; level: number } | undefined {
    if (data.length < 2) return undefined;
    
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (data.length - 1);
    const standardError = Math.sqrt(variance / data.length);
    
    // Use t-distribution for small samples, normal for large samples
    const tValue = data.length < 30 ? this.getTValue(data.length - 1, options.confidenceLevel) : this.getZValue(options.confidenceLevel);
    const margin = tValue * standardError;
    
    return {
      lower: mean - margin,
      upper: mean + margin,
      level: options.confidenceLevel
    };
  }
  
  private assessAggregationQuality(
    cleanData: number[],
    originalData: any[],
    options: AggregationOptions
  ): DataQualityLevels {
    const completeness = originalData.length > 0 ? cleanData.length / originalData.length : 0;
    const sampleSize = cleanData.length;
    
    if (completeness >= 0.95 && sampleSize >= 30) {
      return DataQualityLevels.EXCELLENT;
    } else if (completeness >= 0.8 && sampleSize >= 15) {
      return DataQualityLevels.GOOD;
    } else if (completeness >= 0.6 && sampleSize >= 5) {
      return DataQualityLevels.FAIR;
    } else if (sampleSize >= options.minDataPoints) {
      return DataQualityLevels.POOR;
    } else {
      return DataQualityLevels.UNKNOWN;
    }
  }
  
  private groupData(data: any[], groupField: string): Map<string, any[]> {
    const groups = new Map<string, any[]>();
    
    data.forEach(item => {
      const groupValue = this.getNestedValue(item, groupField);
      const groupKey = String(groupValue || 'unknown');
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(item);
    });
    
    return groups;
  }
  
  private calculateGroupComparisons(
    groupResults: Map<string, AggregationResult>
  ): { [groupA: string]: { [groupB: string]: { difference: number; significantDifference: boolean; confidenceLevel: number } } } {
    const comparisons: any = {};
    const groups = Array.from(groupResults.keys());
    
    groups.forEach(groupA => {
      comparisons[groupA] = {};
      groups.forEach(groupB => {
        if (groupA !== groupB) {
          const resultA = groupResults.get(groupA)!;
          const resultB = groupResults.get(groupB)!;
          
          const difference = (resultA.value || 0) - (resultB.value || 0);
          const significantDifference = this.isSignificantDifference(resultA, resultB);
          
          comparisons[groupA][groupB] = {
            difference,
            significantDifference,
            confidenceLevel: Math.min(resultA.confidence, resultB.confidence)
          };
        }
      });
    });
    
    return comparisons;
  }
  
  private isSignificantDifference(resultA: AggregationResult, resultB: AggregationResult): boolean {
    if (!resultA.confidenceInterval || !resultB.confidenceInterval) return false;
    
    // Check if confidence intervals overlap
    const aLower = resultA.confidenceInterval.lower;
    const aUpper = resultA.confidenceInterval.upper;
    const bLower = resultB.confidenceInterval.lower;
    const bUpper = resultB.confidenceInterval.upper;
    
    return aUpper < bLower || bUpper < aLower;
  }
  
  private calculateWeightedVariance(
    pairs: Array<{ value: number; weight: number }>,
    weightedMean: number
  ): number {
    const totalWeight = pairs.reduce((sum, pair) => sum + pair.weight, 0);
    const weightedSumSquares = pairs.reduce(
      (sum, pair) => sum + pair.weight * Math.pow(pair.value - weightedMean, 2),
      0
    );
    
    return totalWeight > 0 ? weightedSumSquares / totalWeight : 0;
  }
  
  private calculateWeightedConfidence(
    pairs: Array<{ value: number; weight: number }>,
    variance: number
  ): number {
    const effectiveSampleSize = Math.pow(pairs.reduce((sum, pair) => sum + pair.weight, 0), 2) /
                               pairs.reduce((sum, pair) => sum + Math.pow(pair.weight, 2), 0);
    
    const sampleSizeConfidence = Math.min(effectiveSampleSize / 30, 1);
    const varianceConfidence = Math.max(0, 1 - Math.sqrt(variance));
    
    return (sampleSizeConfidence + varianceConfidence) / 2;
  }
  
  private calculateWeightedConfidenceInterval(
    mean: number,
    variance: number,
    sampleSize: number,
    confidenceLevel: number
  ): { lower: number; upper: number; level: number } {
    const standardError = Math.sqrt(variance / sampleSize);
    const tValue = sampleSize < 30 ? this.getTValue(sampleSize - 1, confidenceLevel) : this.getZValue(confidenceLevel);
    const margin = tValue * standardError;
    
    return {
      lower: mean - margin,
      upper: mean + margin,
      level: confidenceLevel
    };
  }
  
  private assessWeightedQuality(
    pairs: Array<{ value: number; weight: number }>,
    totalPoints: number
  ): DataQualityLevels {
    const completeness = totalPoints > 0 ? pairs.length / totalPoints : 0;
    const effectiveSampleSize = Math.pow(pairs.reduce((sum, pair) => sum + pair.weight, 0), 2) /
                               pairs.reduce((sum, pair) => sum + Math.pow(pair.weight, 2), 0);
    
    if (completeness >= 0.95 && effectiveSampleSize >= 30) {
      return DataQualityLevels.EXCELLENT;
    } else if (completeness >= 0.8 && effectiveSampleSize >= 15) {
      return DataQualityLevels.GOOD;
    } else if (completeness >= 0.6 && effectiveSampleSize >= 5) {
      return DataQualityLevels.FAIR;
    } else if (effectiveSampleSize >= 3) {
      return DataQualityLevels.POOR;
    } else {
      return DataQualityLevels.UNKNOWN;
    }
  }
  
  private groupByTimeInterval(
    data: Array<{ timestamp: Date | string; value: number; weight?: number }>,
    interval: 'hour' | 'day' | 'week' | 'month'
  ): Map<string, Array<{ timestamp: Date | string; value: number; weight?: number }>> {
    const groups = new Map();
    
    data.forEach(item => {
      const date = new Date(item.timestamp);
      let key: string;
      
      switch (interval) {
        case 'hour':
          key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}`;
          break;
        case 'day':
          key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = `${weekStart.getFullYear()}-W${Math.ceil(weekStart.getDate() / 7)}`;
          break;
        case 'month':
          key = `${date.getFullYear()}-${date.getMonth()}`;
          break;
        default:
          key = date.toISOString().split('T')[0];
      }
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push(item);
    });
    
    return groups;
  }
  
  private fillMissingTimeIntervals(
    groups: Map<string, any[]>,
    interval: 'hour' | 'day' | 'week' | 'month'
  ): Map<string, any[]> {
    // This is a simplified implementation
    // In a real scenario, you'd want to generate all missing intervals
    // and interpolate values based on surrounding data points
    return groups;
  }
  
  private createInsufficientDataResult(totalPoints: number, options: AggregationOptions): AggregationResult {
    return {
      value: null,
      confidence: 0,
      dataPoints: 0,
      totalPoints,
      completeness: 0,
      quality: DataQualityLevels.UNKNOWN,
      metadata: {
        method: options.method,
        nullHandling: options.handleNulls,
        outliers: 0,
        interpolated: 0,
        weighted: !!options.weights
      }
    };
  }
  
  private isValidNumber(value: any): value is number {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  }
  
  private getTValue(degreesOfFreedom: number, confidenceLevel: number): number {
    // Simplified t-value lookup - in production, use a proper statistical library
    const alpha = 1 - confidenceLevel;
    if (confidenceLevel === 0.95) {
      if (degreesOfFreedom >= 30) return 1.96;
      if (degreesOfFreedom >= 20) return 2.09;
      if (degreesOfFreedom >= 10) return 2.23;
      return 2.78;
    }
    return 1.96; // Default fallback
  }
  
  private getZValue(confidenceLevel: number): number {
    // Standard normal distribution values
    if (confidenceLevel === 0.95) return 1.96;
    if (confidenceLevel === 0.99) return 2.58;
    if (confidenceLevel === 0.90) return 1.64;
    return 1.96; // Default fallback
  }
}

// Export singleton instance
export const intelligentAggregation = IntelligentAggregationService.getInstance();