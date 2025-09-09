import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DashboardExportButton from '../components/ui/DashboardExportButton';
import ExportButton from '../components/ui/ExportButton';
import {
    ChartExporter,
    copyShareableLink,
    DashboardExporter,
    exportChart,
    generateShareableLink,
    ShareableLinkGenerator
} from '../lib/exportUtils';

// Mock the filter store
vi.mock('../stores/filterStore', () => ({
  useFilterStore: () => ({
    searchQuery: 'test',
    selectedParties: [],
    selectedStates: [],
    selectedPlatforms: [],
    selectedGenders: [],
    selectedAgeGroups: [],
    selectedLevels: [],
    dateRange: { start: '2024-01-01', end: '2024-01-31' },
    sortBy: 'relevance',
    sortOrder: 'desc'
  })
}));

// Mock DOM APIs
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined)
  }
});

Object.assign(window, {
  alert: vi.fn(),
  URL: {
    createObjectURL: vi.fn().mockReturnValue('mock-url'),
    revokeObjectURL: vi.fn()
  }
});

// Mock document methods
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

const originalAppendChild = document.body.appendChild;
const originalRemoveChild = document.body.removeChild;
document.body.appendChild = vi.fn();
document.body.removeChild = vi.fn();

describe('Export Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ExportButton Component', () => {
    const mockChartElement = document.createElement('div');
    mockChartElement.innerHTML = '<svg><rect width="100" height="100"/></svg>';

    const mockData = [
      { date: '2024-01-01', positive: 45, neutral: 35, negative: 20 },
      { date: '2024-01-02', positive: 50, neutral: 30, negative: 20 }
    ];

    it('renders export button correctly', () => {
      render(
        <ExportButton
          chartElement={mockChartElement}
          chartType="test-chart"
          data={mockData}
        />
      );

      expect(screen.getByText('Export')).toBeInTheDocument();
      expect(screen.getByText('Share')).toBeInTheDocument();
    });

    it('shows dropdown when export button is clicked', async () => {
      render(
        <ExportButton
          chartElement={mockChartElement}
          chartType="test-chart"
          data={mockData}
        />
      );

      fireEvent.click(screen.getByText('Export'));

      await waitFor(() => {
        expect(screen.getByText('PNG Image')).toBeInTheDocument();
        expect(screen.getByText('SVG Vector')).toBeInTheDocument();
        expect(screen.getByText('PDF Report')).toBeInTheDocument();
        expect(screen.getByText('CSV Data')).toBeInTheDocument();
      });
    });

    it('handles CSV export correctly', async () => {
      render(
        <ExportButton
          chartElement={mockChartElement}
          chartType="test-chart"
          data={mockData}
        />
      );

      fireEvent.click(screen.getByText('Export'));
      
      await waitFor(() => {
        expect(screen.getByText('CSV Data')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('CSV Data'));

      // Verify that the export process was initiated
      await waitFor(() => {
        expect(window.URL.createObjectURL).toHaveBeenCalled();
      });
    });

    it('handles share functionality', async () => {
      render(
        <ExportButton
          chartElement={mockChartElement}
          chartType="test-chart"
          data={mockData}
        />
      );

      fireEvent.click(screen.getByText('Share'));

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalled();
      });
    });

    it('disables image export when no chart element provided', () => {
      render(
        <ExportButton
          chartElement={null}
          chartType="test-chart"
          data={mockData}
        />
      );

      fireEvent.click(screen.getByText('Export'));

      const pngButton = screen.getByText('PNG Image');
      const svgButton = screen.getByText('SVG Vector');

      expect(pngButton).toBeDisabled();
      expect(svgButton).toBeDisabled();
    });
  });

  describe('DashboardExportButton Component', () => {
    const mockStats = {
      totalPoliticians: 150,
      totalMentions: 25000,
      overallSentiment: {
        positive: 45.5,
        neutral: 34.2,
        negative: 20.3
      },
      lastUpdated: '2024-01-15T10:30:00Z'
    };

    it('renders dashboard export button correctly', () => {
      render(<DashboardExportButton stats={mockStats} />);

      expect(screen.getByText('Export Stats')).toBeInTheDocument();
    });

    it('handles dashboard stats export', async () => {
      render(<DashboardExportButton stats={mockStats} />);

      fireEvent.click(screen.getByText('Export Stats'));

      await waitFor(() => {
        expect(window.URL.createObjectURL).toHaveBeenCalled();
      });
    });

    it('shows loading state during export', async () => {
      render(<DashboardExportButton stats={mockStats} />);

      fireEvent.click(screen.getByText('Export Stats'));

      // Check for loading state (button should be disabled)
      expect(screen.getByText('Exporting...')).toBeInTheDocument();
    });
  });

  describe('Export Utilities', () => {
    describe('ChartExporter', () => {
      const mockChartElement = document.createElement('div');
      mockChartElement.innerHTML = '<svg><rect width="100" height="100"/></svg>';
      
      const mockData = [
        { date: '2024-01-01', value: 100 },
        { date: '2024-01-02', value: 150 }
      ];

      it('exports CSV correctly', () => {
        const exporter = new ChartExporter(mockChartElement, 'test-chart', mockData);
        
        expect(() => exporter.exportAsCSV()).not.toThrow();
        expect(window.URL.createObjectURL).toHaveBeenCalled();
      });

      it('exports SVG correctly', async () => {
        const exporter = new ChartExporter(mockChartElement, 'test-chart', mockData);
        
        await expect(exporter.exportAsSVG()).resolves.not.toThrow();
        expect(window.URL.createObjectURL).toHaveBeenCalled();
      });

      it('exports PDF correctly', async () => {
        const exporter = new ChartExporter(mockChartElement, 'test-chart', mockData);
        
        await expect(exporter.exportAsPDF()).resolves.not.toThrow();
        expect(window.URL.createObjectURL).toHaveBeenCalled();
      });

      it('handles PNG export simulation', async () => {
        const exporter = new ChartExporter(mockChartElement, 'test-chart', mockData);
        
        await expect(exporter.exportAsPNG()).resolves.not.toThrow();
      });
    });

    describe('DashboardExporter', () => {
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

      it('exports dashboard stats to CSV', () => {
        const exporter = new DashboardExporter(mockStats);
        
        expect(() => exporter.exportToCSV()).not.toThrow();
        expect(window.URL.createObjectURL).toHaveBeenCalled();
      });
    });

    describe('ShareableLinkGenerator', () => {
      const mockState = {
        filters: {
          searchQuery: 'test',
          selectedParties: [],
          dateRange: { start: '2024-01-01', end: '2024-01-31' }
        },
        view: 'dashboard',
        timestamp: Date.now()
      };

      it('generates shareable link correctly', () => {
        const link = ShareableLinkGenerator.generateShareableLink(mockState);
        
        expect(link).toContain('?share=');
        expect(link).toContain(window.location.origin);
      });

      it('parses shareable link correctly', () => {
        const link = ShareableLinkGenerator.generateShareableLink(mockState);
        const shareParam = link.split('?share=')[1];
        
        const parsedState = ShareableLinkGenerator.parseShareableLink(shareParam);
        
        expect(parsedState).toEqual(mockState);
      });

      it('handles invalid share parameters gracefully', () => {
        const result = ShareableLinkGenerator.parseShareableLink('invalid-data');
        
        expect(result).toBeNull();
      });

      it('copies link to clipboard', async () => {
        const testLink = 'https://example.com/test';
        
        await expect(ShareableLinkGenerator.copyToClipboard(testLink)).resolves.not.toThrow();
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testLink);
      });
    });

    describe('Main Export Functions', () => {
      const mockChartElement = document.createElement('div');
      mockChartElement.innerHTML = '<svg><rect width="100" height="100"/></svg>';
      
      const mockData = [
        { date: '2024-01-01', value: 100 },
        { date: '2024-01-02', value: 150 }
      ];

      it('exports chart in different formats', async () => {
        await expect(exportChart(mockChartElement, 'test-chart', mockData, 'csv')).resolves.not.toThrow();
        await expect(exportChart(mockChartElement, 'test-chart', mockData, 'svg')).resolves.not.toThrow();
        await expect(exportChart(mockChartElement, 'test-chart', mockData, 'pdf')).resolves.not.toThrow();
        await expect(exportChart(mockChartElement, 'test-chart', mockData, 'png')).resolves.not.toThrow();
      });

      it('throws error for unsupported format', async () => {
        await expect(
          exportChart(mockChartElement, 'test-chart', mockData, 'unsupported' as any)
        ).rejects.toThrow('Unsupported chart export format');
      });

      it('generates and copies shareable link', async () => {
        const filters = { searchQuery: 'test' };
        const link = generateShareableLink(filters, 'dashboard');
        
        expect(link).toContain('?share=');
        
        await expect(copyShareableLink(link)).resolves.not.toThrow();
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(link);
      });
    });
  });

  describe('Performance Requirements', () => {
    it('completes export within 10 seconds', async () => {
      const startTime = Date.now();
      const mockChartElement = document.createElement('div');
      const mockData = [{ test: 'data' }];

      await exportChart(mockChartElement, 'test-chart', mockData, 'csv');

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(10000); // 10 seconds
    });

    it('handles large datasets efficiently', async () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        value: Math.random() * 100
      }));

      const mockChartElement = document.createElement('div');
      const startTime = Date.now();

      await exportChart(mockChartElement, 'large-dataset', largeData, 'csv');

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(10000); // Should still complete within 10 seconds
    });
  });
});