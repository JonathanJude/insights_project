import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { convertToChartData, generateFilteredChartData, getTimeRangeLabel } from '../lib/chartDataUtils';
import { useChartFilterStore } from '../stores/chartFilterStore';
import type { ChartFilter } from '../types';
import { NigerianState, PoliticalParty, SocialPlatform } from '../types';

describe('Chart Filters', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useChartFilterStore());
    act(() => {
      result.current.resetChartFilter();
    });
  });

  describe('Chart Filter Store', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useChartFilterStore());
      
      expect(result.current.chartFilter.timeRange).toBe('30d');
      expect(result.current.chartFilter.platforms).toEqual([]);
      expect(result.current.chartFilter.parties).toEqual([]);
      expect(result.current.chartFilter.states).toEqual([]);
    });

    it('should update time range', () => {
      const { result } = renderHook(() => useChartFilterStore());
      
      act(() => {
        result.current.setTimeRange('7d');
      });
      
      expect(result.current.chartFilter.timeRange).toBe('7d');
    });

    it('should toggle platforms', () => {
      const { result } = renderHook(() => useChartFilterStore());
      
      act(() => {
        result.current.togglePlatform(SocialPlatform.TWITTER);
      });
      
      expect(result.current.chartFilter.platforms).toContain(SocialPlatform.TWITTER);
      
      act(() => {
        result.current.togglePlatform(SocialPlatform.TWITTER);
      });
      
      expect(result.current.chartFilter.platforms).not.toContain(SocialPlatform.TWITTER);
    });

    it('should reset filter to defaults', () => {
      const { result } = renderHook(() => useChartFilterStore());
      
      // Make some changes
      act(() => {
        result.current.setTimeRange('1y');
        result.current.togglePlatform(SocialPlatform.TWITTER);
        result.current.toggleParty(PoliticalParty.APC);
      });
      
      // Reset
      act(() => {
        result.current.resetChartFilter();
      });
      
      expect(result.current.chartFilter.timeRange).toBe('30d');
      expect(result.current.chartFilter.platforms).toEqual([]);
      expect(result.current.chartFilter.parties).toEqual([]);
    });
  });

  describe('Chart Data Utils', () => {
    it('should generate different data lengths for different time ranges', () => {
      const filter7d: ChartFilter = { timeRange: '7d' };
      const filter30d: ChartFilter = { timeRange: '30d' };
      const filter3m: ChartFilter = { timeRange: '3m' };
      const filter1y: ChartFilter = { timeRange: '1y' };
      
      const data7d = generateFilteredChartData(filter7d);
      const data30d = generateFilteredChartData(filter30d);
      const data3m = generateFilteredChartData(filter3m);
      const data1y = generateFilteredChartData(filter1y);
      
      expect(data7d).toHaveLength(7);
      expect(data30d).toHaveLength(30);
      expect(data3m).toHaveLength(90);
      expect(data1y).toHaveLength(365);
    });

    it('should convert trend points to chart data format', () => {
      const filter: ChartFilter = { timeRange: '7d' };
      const trendPoints = generateFilteredChartData(filter);
      const chartData = convertToChartData(trendPoints, filter.timeRange);
      
      expect(chartData).toHaveLength(7);
      expect(chartData[0]).toHaveProperty('date');
      expect(chartData[0]).toHaveProperty('sentiment');
      expect(chartData[0]).toHaveProperty('positive');
      expect(chartData[0]).toHaveProperty('negative');
      expect(chartData[0]).toHaveProperty('neutral');
      
      // Sentiment should be in 0-100 range
      chartData.forEach(point => {
        expect(point.sentiment).toBeGreaterThanOrEqual(0);
        expect(point.sentiment).toBeLessThanOrEqual(100);
      });
    });

    it('should return correct time range labels', () => {
      expect(getTimeRangeLabel('7d')).toBe('Last 7 days');
      expect(getTimeRangeLabel('30d')).toBe('Last 30 days');
      expect(getTimeRangeLabel('3m')).toBe('Last 3 months');
      expect(getTimeRangeLabel('1y')).toBe('Last year');
    });

    it('should apply platform filtering to data', () => {
      const filterWithPlatforms: ChartFilter = { 
        timeRange: '30d',
        platforms: [SocialPlatform.TWITTER, SocialPlatform.FACEBOOK]
      };
      const filterWithoutPlatforms: ChartFilter = { 
        timeRange: '30d'
      };
      
      const dataWithPlatforms = generateFilteredChartData(filterWithPlatforms);
      const dataWithoutPlatforms = generateFilteredChartData(filterWithoutPlatforms);
      
      // Both should have same length but different metadata
      expect(dataWithPlatforms).toHaveLength(30);
      expect(dataWithoutPlatforms).toHaveLength(30);
      
      // Data with platform filter should have platform metadata
      expect(dataWithPlatforms[0].metadata?.platforms).toEqual([SocialPlatform.TWITTER, SocialPlatform.FACEBOOK]);
      expect(dataWithoutPlatforms[0].metadata?.platforms).toBeUndefined();
    });

    it('should apply party filtering to data', () => {
      const filterWithParties: ChartFilter = { 
        timeRange: '30d',
        parties: [PoliticalParty.APC, PoliticalParty.PDP]
      };
      
      const dataWithParties = generateFilteredChartData(filterWithParties);
      
      expect(dataWithParties).toHaveLength(30);
      expect(dataWithParties[0].metadata?.parties).toEqual([PoliticalParty.APC, PoliticalParty.PDP]);
    });

    it('should apply state filtering to data', () => {
      const filterWithStates: ChartFilter = { 
        timeRange: '30d',
        states: [NigerianState.LAGOS, NigerianState.FCT]
      };
      
      const dataWithStates = generateFilteredChartData(filterWithStates);
      
      expect(dataWithStates).toHaveLength(30);
      expect(dataWithStates[0].metadata?.states).toEqual([NigerianState.LAGOS, NigerianState.FCT]);
    });
  });

  describe('Performance Requirements', () => {
    it('should generate chart data within performance requirements', async () => {
      const filter: ChartFilter = { timeRange: '1y' }; // Largest dataset
      
      const startTime = performance.now();
      const data = generateFilteredChartData(filter);
      const chartData = convertToChartData(data, filter.timeRange);
      const endTime = performance.now();
      
      const executionTime = endTime - startTime;
      
      // Should complete within 500ms as per requirement 13.4
      expect(executionTime).toBeLessThan(500);
      expect(chartData).toHaveLength(365);
    });

    it('should handle multiple filter combinations efficiently', async () => {
      const complexFilter: ChartFilter = { 
        timeRange: '3m',
        platforms: [SocialPlatform.TWITTER, SocialPlatform.FACEBOOK, SocialPlatform.INSTAGRAM],
        parties: [PoliticalParty.APC, PoliticalParty.PDP, PoliticalParty.LP],
        states: [NigerianState.LAGOS, NigerianState.FCT, NigerianState.KANO]
      };
      
      const startTime = performance.now();
      const data = generateFilteredChartData(complexFilter);
      const chartData = convertToChartData(data, complexFilter.timeRange);
      const endTime = performance.now();
      
      const executionTime = endTime - startTime;
      
      // Should still complete within 500ms even with complex filters
      expect(executionTime).toBeLessThan(500);
      expect(chartData).toHaveLength(90);
      
      // Should have all filter metadata
      expect(data[0].metadata?.platforms).toEqual([SocialPlatform.TWITTER, SocialPlatform.FACEBOOK, SocialPlatform.INSTAGRAM]);
      expect(data[0].metadata?.parties).toEqual([PoliticalParty.APC, PoliticalParty.PDP, PoliticalParty.LP]);
      expect(data[0].metadata?.states).toEqual([NigerianState.LAGOS, NigerianState.FCT, NigerianState.KANO]);
    });
  });
});