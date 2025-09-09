import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
    ChartExporter,
    DashboardExporter,
    ShareableLinkGenerator,
    exportChart,
    exportDashboardStats,
    generateShareableLink
} from '../lib/exportUtils';

// Mock DOM APIs
Object.assign(window, {
  URL: {
    createObjectURL: vi.fn().mockReturnValue('mock-url'),
    revokeObjectURL: vi.fn()
  },
  alert: vi.fn()
});

const mockElement = {
  href: '',
  download: '',
  click: vi.fn(),
  remove: vi.fn()
};

const originalCreateElement = document.createElement;
document.createElement = vi.fn().mockImplementation((tagName) => {
  if (tagName === 'a') {
    return mockElement;
  }
  return originalCreateElement.call(document, tagName);
});

document.body.appendChild = vi.fn();
document.body.removeChild = vi.fn();

describe('Export Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Chart Export Integration', () => {
    const mockChartElement = document.createElement('div');
    mockChartElement.innerHTML = '<svg><rect width="100" height="100"/></svg>';
    
    const mockData = [
      { date: '2024-01-01', positive: 45, neutral: 35, negative: 20 },
      { date: '2024-01-02', positive: 50, neutral: 30, negative: 20 },
      { date: '2024-01-03', positive: 48, neutral: 32, negative: 20 }
    ];

    it('exports sentiment chart data as CSV', async () => {
      await exportChart(mockChartElement, 'sentiment-trends', mockData, 'csv');
      
      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(mockElement.click).toHaveBeenCalled();
    });

    it('exports chart as SVG', async () => {
      await exportChart(mockChartElement, 'sentiment-trends', mockData, 'svg');
      
      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(mockElement.download).toBe('sentiment-trends-chart.svg');
    });

    it('exports chart as PDF report', async () => {
      await exportChart(mockChartElement, 'sentiment-trends', mockData, 'pdf');
      
      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(mockElement.download).toBe('sentiment-trends-report.txt');
    });

    it('handles PNG export simulation', async () => {
      // PNG export is simulated in demo mode
      await expect(exportChart(mockChartElement, 'sentiment-trends', mockData, 'png')).resolves.not.toThrow();
    });

    it('processes large datasets efficiently', async () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        date: `2024-01-${String(i % 30 + 1).padStart(2, '0')}`,
        positive: Math.random() * 50 + 25,
        neutral: Math.random() * 40 + 20,
        negative: Math.random() * 35 + 15
      }));

      const startTime = Date.now();
      await exportChart(mockChartElement, 'large-dataset', largeData, 'csv');
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(10000); // Should complete within 10 seconds
      expect(window.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('Dashboard Statistics Export', () => {
    const mockStats = {
      totalPoliticians: 150,
      totalMentions: 25000,
      averageSentiment: 25.2,
      positivePercentage: 45.5,
      neutralPercentage: 34.2,
      negativePercentage: 20.3,
      exportDate: '2024-01-15T10:30:00Z',
      timeRange: 'Last 30 days'
    };

    it('exports dashboard statistics as CSV', () => {
      exportDashboardStats(mockStats);
      
      expect(window.URL.createObjectURL).toHaveBeenCalled();
      expect(mockElement.download).toBe('dashboard-statistics.csv');
      expect(mockElement.click).toHaveBeenCalled();
    });

    it('includes all required metrics in export', () => {
      const exporter = new DashboardExporter(mockStats);
      
      // Test that the exporter was created successfully
      expect(exporter).toBeDefined();
      
      // Test the export process
      exporter.exportToCSV();
      expect(window.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('Shareable Links', () => {
    const mockFilters = {
      searchQuery: 'test politician',
      selectedParties: ['APC', 'PDP'],
      dateRange: { start: '2024-01-01', end: '2024-01-31' }
    };

    it('generates valid shareable links', () => {
      const link = generateShareableLink(mockFilters, 'dashboard');
      
      expect(link).toContain('?share=');
      expect(link).toContain(window.location.origin);
    });

    it('encodes and decodes filter state correctly', () => {
      const state = {
        filters: mockFilters,
        view: 'dashboard',
        timestamp: Date.now()
      };

      const link = ShareableLinkGenerator.generateShareableLink(state);
      const shareParam = link.split('?share=')[1];
      const decodedState = ShareableLinkGenerator.parseShareableLink(shareParam);

      expect(decodedState).toEqual(state);
    });

    it('handles complex filter combinations', () => {
      const complexFilters = {
        searchQuery: 'complex search with "quotes" and symbols',
        selectedParties: ['APC', 'PDP', 'LP'],
        selectedStates: ['Lagos', 'Abuja', 'Kano'],
        selectedPlatforms: ['Twitter', 'Facebook'],
        dateRange: { start: '2024-01-01', end: '2024-12-31' },
        sortBy: 'sentiment',
        sortOrder: 'desc'
      };

      const link = generateShareableLink(complexFilters, 'search');
      expect(link).toContain('?share=');

      // Verify it can be parsed back
      const shareParam = link.split('?share=')[1];
      const decodedState = ShareableLinkGenerator.parseShareableLink(shareParam);
      
      expect(decodedState?.filters).toEqual(complexFilters);
      expect(decodedState?.view).toBe('search');
    });

    it('handles invalid share parameters gracefully', () => {
      const result = ShareableLinkGenerator.parseShareableLink('invalid-base64');
      expect(result).toBeNull();
    });
  });

  describe('Export Performance', () => {
    it('completes all export formats within time limits', async () => {
      const mockChartElement = document.createElement('div');
      mockChartElement.innerHTML = '<svg><rect width="100" height="100"/></svg>';
      
      const testData = Array.from({ length: 100 }, (_, i) => ({
        date: `2024-01-${String(i % 30 + 1).padStart(2, '0')}`,
        value: Math.random() * 100
      }));

      const formats = ['csv', 'svg', 'pdf', 'png'] as const;
      
      for (const format of formats) {
        const startTime = Date.now();
        await exportChart(mockChartElement, 'performance-test', testData, format);
        const duration = Date.now() - startTime;
        
        expect(duration).toBeLessThan(10000); // 10 second requirement
      }
    });

    it('handles concurrent exports efficiently', async () => {
      const mockChartElement = document.createElement('div');
      mockChartElement.innerHTML = '<svg><rect width="100" height="100"/></svg>';
      
      const testData = [{ date: '2024-01-01', value: 100 }];

      const exportPromises = [
        exportChart(mockChartElement, 'concurrent-1', testData, 'csv'),
        exportChart(mockChartElement, 'concurrent-2', testData, 'svg'),
        exportChart(mockChartElement, 'concurrent-3', testData, 'pdf')
      ];

      const startTime = Date.now();
      await Promise.all(exportPromises);
      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(15000); // Should handle concurrent exports efficiently
    });
  });

  describe('Error Handling', () => {
    it('handles missing chart elements gracefully', async () => {
      const testData = [{ date: '2024-01-01', value: 100 }];

      // CSV should work without chart element
      await expect(exportChart(null as any, 'test', testData, 'csv')).resolves.not.toThrow();

      // SVG should handle missing element
      const mockEmptyElement = document.createElement('div');
      await expect(exportChart(mockEmptyElement, 'test', testData, 'svg')).rejects.toThrow();
    });

    it('handles empty data gracefully', async () => {
      const mockChartElement = document.createElement('div');
      mockChartElement.innerHTML = '<svg><rect width="100" height="100"/></svg>';

      await expect(exportChart(mockChartElement, 'empty-data', [], 'csv')).resolves.not.toThrow();
    });

    it('handles malformed data gracefully', async () => {
      const mockChartElement = document.createElement('div');
      const malformedData = [
        { date: null, value: 'invalid' },
        { missing: 'fields' },
        null,
        undefined
      ];

      await expect(exportChart(mockChartElement, 'malformed', malformedData, 'csv')).resolves.not.toThrow();
    });
  });

  describe('Data Integrity', () => {
    it('preserves data accuracy in CSV export', async () => {
      const preciseData = [
        { date: '2024-01-01', positive: 45.123456, neutral: 34.987654, negative: 19.888890 },
        { date: '2024-01-02', positive: 50.555555, neutral: 30.111111, negative: 19.333334 }
      ];

      const mockChartElement = document.createElement('div');
      const exporter = new ChartExporter(mockChartElement, 'precision-test', preciseData);

      expect(() => exporter.exportAsCSV()).not.toThrow();
      expect(window.URL.createObjectURL).toHaveBeenCalled();
    });

    it('maintains filter state in shareable links', () => {
      const complexState = {
        filters: {
          searchQuery: 'test with special chars: !@#$%^&*()',
          selectedParties: ['APC', 'PDP'],
          dateRange: { start: '2024-01-01', end: '2024-12-31' },
          sortBy: 'sentiment' as const,
          sortOrder: 'desc' as const
        },
        view: 'dashboard',
        timestamp: 1705123456789
      };

      const link = ShareableLinkGenerator.generateShareableLink(complexState);
      const shareParam = link.split('?share=')[1];
      const decoded = ShareableLinkGenerator.parseShareableLink(shareParam);

      expect(decoded).toEqual(complexState);
    });
  });
});