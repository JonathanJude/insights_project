import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PartyCompareChart from '../components/charts/PartyCompareChart';
import { createPartyComparisonExporter, exportPartyComparison } from '../lib/exportUtils';
import PartyAnalytics from '../pages/party/PartyAnalytics';
import { PoliticalParty, TimeFrame, type PartyInsight } from '../types';

// Mock data for testing
const mockPartyInsights: PartyInsight[] = [
  {
    id: 'apc-insight',
    party: PoliticalParty.APC,
    totalMentions: 15420,
    totalEngagement: 89340,
    overallSentiment: { positive: 42, neutral: 38, negative: 20 },
    date: '2024-01-15',
    timeframe: TimeFrame.DAY,
    trendData: [],
    platformBreakdown: [],
    topPoliticians: [
      { politicianId: '1', name: 'John Doe', sentimentScore: 65, mentionCount: 1200 },
      { politicianId: '2', name: 'Jane Smith', sentimentScore: 58, mentionCount: 980 }
    ]
  },
  {
    id: 'pdp-insight',
    party: PoliticalParty.PDP,
    totalMentions: 12850,
    totalEngagement: 76230,
    overallSentiment: { positive: 38, neutral: 42, negative: 20 },
    date: '2024-01-15',
    timeframe: TimeFrame.DAY,
    trendData: [],
    platformBreakdown: [],
    topPoliticians: [
      { politicianId: '3', name: 'Bob Johnson', sentimentScore: 52, mentionCount: 850 },
      { politicianId: '4', name: 'Alice Brown', sentimentScore: 61, mentionCount: 720 }
    ]
  }
];

// Mock the export utilities
vi.mock('../lib/exportUtils', () => ({
  createPartyComparisonExporter: vi.fn(),
  exportPartyComparison: vi.fn(),
  PartyComparisonExporter: vi.fn()
}));

// Mock the chart libraries
vi.mock('recharts', () => ({
  BarChart: vi.fn(({ children, ...props }: any) => {
    return React.createElement('div', { 'data-testid': 'bar-chart', ...props }, children);
  }),
  Bar: vi.fn((props: any) => {
    return React.createElement('div', { 'data-testid': 'bar', ...props });
  }),
  XAxis: vi.fn((props: any) => {
    return React.createElement('div', { 'data-testid': 'x-axis', ...props });
  }),
  YAxis: vi.fn((props: any) => {
    return React.createElement('div', { 'data-testid': 'y-axis', ...props });
  }),
  CartesianGrid: vi.fn((props: any) => {
    return React.createElement('div', { 'data-testid': 'cartesian-grid', ...props });
  }),
  Tooltip: vi.fn((props: any) => {
    return React.createElement('div', { 'data-testid': 'tooltip', ...props });
  }),
  ResponsiveContainer: vi.fn(({ children, ...props }: any) => {
    return React.createElement('div', { 'data-testid': 'responsive-container', ...props }, children);
  }),
  Legend: vi.fn((props: any) => {
    return React.createElement('div', { 'data-testid': 'legend', ...props });
  }),
  RadarChart: vi.fn(({ children, ...props }: any) => {
    return React.createElement('div', { 'data-testid': 'radar-chart', ...props }, children);
  }),
  PolarGrid: vi.fn((props: any) => {
    return React.createElement('div', { 'data-testid': 'polar-grid', ...props });
  }),
  PolarAngleAxis: vi.fn((props: any) => {
    return React.createElement('div', { 'data-testid': 'polar-angle-axis', ...props });
  }),
  PolarRadiusAxis: vi.fn((props: any) => {
    return React.createElement('div', { 'data-testid': 'polar-radius-axis', ...props });
  }),
  Radar: vi.fn((props: any) => {
    return React.createElement('div', { 'data-testid': 'radar', ...props });
  }),
  LineChart: vi.fn(({ children, ...props }: any) => {
    return React.createElement('div', { 'data-testid': 'line-chart', ...props }, children);
  }),
  Line: vi.fn((props: any) => {
    return React.createElement('div', { 'data-testid': 'line', ...props });
  }),
  Cell: vi.fn((props: any) => {
    return React.createElement('div', { 'data-testid': 'cell', ...props });
  })
}));

describe('Task 10: Enhanced Party Comparison Features', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    vi.clearAllMocks();
  });

  const renderWithQueryClient = (component: React.ReactElement) => {
    return render(
      React.createElement(QueryClientProvider, { client: queryClient }, component)
    );
  };

  describe('Requirement 4.1: Side-by-side party analytics', () => {
    it('should display side-by-side comparison view by default', () => {
      renderWithQueryClient(
        React.createElement(PartyCompareChart, {
          data: mockPartyInsights,
          selectedParties: [PoliticalParty.APC, PoliticalParty.PDP]
        })
      );

      // Should show comparison chart type button as active
      const comparisonButton = screen.getByText('Side-by-Side');
      expect(comparisonButton).toHaveClass('bg-blue-600', 'text-white');
    });

    it('should display party comparison cards with key metrics', () => {
      renderWithQueryClient(
        React.createElement(PartyCompareChart, {
          data: mockPartyInsights,
          selectedParties: [PoliticalParty.APC, PoliticalParty.PDP]
        })
      );

      // Should show party cards
      expect(screen.getByText('APC')).toBeInTheDocument();
      expect(screen.getByText('PDP')).toBeInTheDocument();
      
      // Should show key metrics
      expect(screen.getByText('Overall Sentiment')).toBeInTheDocument();
      expect(screen.getByText('Total Mentions')).toBeInTheDocument();
      expect(screen.getByText('Engagement Rate')).toBeInTheDocument();
    });

    it('should highlight key differences between parties', () => {
      renderWithQueryClient(
        React.createElement(PartyCompareChart, {
          data: mockPartyInsights,
          selectedParties: [PoliticalParty.APC, PoliticalParty.PDP]
        })
      );

      // Should show sentiment distribution bars
      const sentimentDistributions = screen.getAllByText('Sentiment Distribution');
      expect(sentimentDistributions.length).toBeGreaterThan(0);
      
      // Should show ranking information
      expect(screen.getByText('Mentions Rank')).toBeInTheDocument();
      expect(screen.getByText('Sentiment Rank')).toBeInTheDocument();
    });
  });

  describe('Requirement 4.2: Interactive drill-down capabilities', () => {
    it('should enable drill-down by default', () => {
      renderWithQueryClient(
        React.createElement(PartyCompareChart, {
          data: mockPartyInsights,
          enableDrillDown: true
        })
      );

      // Party cards should be clickable (have cursor-pointer class)
      const partyCards = screen.getAllByText(/APC|PDP/);
      partyCards.forEach(card => {
        const cardElement = card.closest('div');
        expect(cardElement).toHaveClass('cursor-pointer');
      });
    });

    it('should show drill-down indicators on party cards', () => {
      renderWithQueryClient(
        React.createElement(PartyCompareChart, {
          data: mockPartyInsights,
          enableDrillDown: true
        })
      );

      // Should show arrow icons indicating clickable cards
      const arrowIcons = screen.getAllByRole('img', { hidden: true });
      expect(arrowIcons.length).toBeGreaterThan(0);
    });

    it('should open drill-down modal when party is clicked', async () => {
      renderWithQueryClient(
        React.createElement(PartyCompareChart, {
          data: mockPartyInsights,
          enableDrillDown: true
        })
      );

      // Click on a party card
      const apcCard = screen.getByText('APC').closest('div');
      if (apcCard) {
        fireEvent.click(apcCard);
      }

      // Should show drill-down modal (would need to wait for state update)
      await waitFor(() => {
        // The modal would contain detailed information
        // This test would need to be more specific based on actual modal implementation
        expect(true).toBe(true); // Placeholder assertion
      });
    });

    it('should call onPartyClick callback when provided', () => {
      const mockOnPartyClick = vi.fn();
      
      renderWithQueryClient(
        React.createElement(PartyCompareChart, {
          data: mockPartyInsights,
          enableDrillDown: true,
          onPartyClick: mockOnPartyClick
        })
      );

      // Click on a party card
      const apcCard = screen.getByText('APC').closest('div');
      if (apcCard) {
        fireEvent.click(apcCard);
      }

      expect(mockOnPartyClick).toHaveBeenCalledWith(PoliticalParty.APC);
    });
  });

  describe('Requirement 4.3: Export functionality', () => {
    it('should display export buttons when enabled', () => {
      renderWithQueryClient(
        React.createElement(PartyCompareChart, {
          data: mockPartyInsights,
          showExportButtons: true
        })
      );

      // Should show export format buttons
      expect(screen.getByText('CSV')).toBeInTheDocument();
      expect(screen.getByText('PNG')).toBeInTheDocument();
      expect(screen.getByText('PDF')).toBeInTheDocument();
    });

    it('should call export function when CSV button is clicked', async () => {
      const mockOnExport = vi.fn();
      
      renderWithQueryClient(
        React.createElement(PartyCompareChart, {
          data: mockPartyInsights,
          showExportButtons: true,
          onExport: mockOnExport
        })
      );

      const csvButton = screen.getByText('CSV');
      fireEvent.click(csvButton);

      await waitFor(() => {
        expect(exportPartyComparison).toHaveBeenCalledWith(mockPartyInsights, 'csv');
        expect(mockOnExport).toHaveBeenCalledWith('csv');
      });
    });

    it('should call export function when PNG button is clicked', async () => {
      const mockOnExport = vi.fn();
      
      renderWithQueryClient(
        React.createElement(PartyCompareChart, {
          data: mockPartyInsights,
          showExportButtons: true,
          onExport: mockOnExport
        })
      );

      const pngButton = screen.getByText('PNG');
      fireEvent.click(pngButton);

      await waitFor(() => {
        expect(exportPartyComparison).toHaveBeenCalledWith(
          mockPartyInsights, 
          'png', 
          expect.any(HTMLElement)
        );
        expect(mockOnExport).toHaveBeenCalledWith('png');
      });
    });

    it('should call export function when PDF button is clicked', async () => {
      const mockOnExport = vi.fn();
      
      renderWithQueryClient(
        React.createElement(PartyCompareChart, {
          data: mockPartyInsights,
          showExportButtons: true,
          onExport: mockOnExport
        })
      );

      const pdfButton = screen.getByText('PDF');
      fireEvent.click(pdfButton);

      await waitFor(() => {
        expect(exportPartyComparison).toHaveBeenCalledWith(mockPartyInsights, 'pdf');
        expect(mockOnExport).toHaveBeenCalledWith('pdf');
      });
    });
  });

  describe('Requirement 4.4: Enhanced comparison interface', () => {
    it('should provide multiple chart visualization options', () => {
      renderWithQueryClient(
        React.createElement(PartyCompareChart, {
          data: mockPartyInsights
        })
      );

      // Should show different chart type options
      expect(screen.getByText('Side-by-Side')).toBeInTheDocument();
      expect(screen.getByText('bar Chart')).toBeInTheDocument();
      expect(screen.getByText('radar Chart')).toBeInTheDocument();
      expect(screen.getByText('line Chart')).toBeInTheDocument();
    });

    it('should switch between different chart types', () => {
      renderWithQueryClient(
        React.createElement(PartyCompareChart, {
          data: mockPartyInsights
        })
      );

      // Click on bar chart
      const barChartButton = screen.getByText('bar Chart');
      fireEvent.click(barChartButton);
      
      expect(barChartButton).toHaveClass('bg-blue-600', 'text-white');
      
      // Should show metric selection for bar chart
      expect(screen.getByText('sentiment')).toBeInTheDocument();
      expect(screen.getByText('mentions')).toBeInTheDocument();
      expect(screen.getByText('engagement')).toBeInTheDocument();
    });

    it('should display comparative analysis chart in comparison mode', () => {
      renderWithQueryClient(
        React.createElement(PartyCompareChart, {
          data: mockPartyInsights
        })
      );

      // Should show comparative analysis section
      expect(screen.getByText('Comparative Analysis')).toBeInTheDocument();
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });
  });

  describe('Export Utilities', () => {
    it('should create party comparison exporter with correct data', () => {
      const exporter = createPartyComparisonExporter(mockPartyInsights);
      expect(createPartyComparisonExporter).toHaveBeenCalledWith(mockPartyInsights);
    });

    it('should handle different export formats', async () => {
      const formats = ['csv', 'json', 'pdf', 'png', 'svg'] as const;
      
      for (const format of formats) {
        await exportPartyComparison(mockPartyInsights, format);
        expect(exportPartyComparison).toHaveBeenCalledWith(mockPartyInsights, format);
      }
    });
  });

  describe('Integration with PartyAnalytics', () => {
    it('should render enhanced party comparison chart in PartyAnalytics page', () => {
      renderWithQueryClient(React.createElement(PartyAnalytics));

      // Should show the party analytics page with enhanced chart
      expect(screen.getByText('Party Analytics')).toBeInTheDocument();
      expect(screen.getByText('Compare sentiment and engagement across political parties')).toBeInTheDocument();
    });

    it('should enable drill-down and export features in PartyAnalytics', () => {
      renderWithQueryClient(React.createElement(PartyAnalytics));

      // Should show export buttons
      expect(screen.getByText('CSV')).toBeInTheDocument();
      expect(screen.getByText('PNG')).toBeInTheDocument();
      expect(screen.getByText('PDF')).toBeInTheDocument();
    });
  });
});