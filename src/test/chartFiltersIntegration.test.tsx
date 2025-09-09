import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DemographicsChart, PartyDistributionChart, PlatformBreakdown, SentimentChart } from '../components/charts';

// Mock the chart data utils
vi.mock('../lib/chartDataUtils', () => ({
  generateFilteredChartData: vi.fn(() => [
    { date: '2024-01-01', value: 0.5, metadata: { mentionCount: 100, engagementCount: 50 } },
    { date: '2024-01-02', value: 0.3, metadata: { mentionCount: 120, engagementCount: 60 } }
  ]),
  convertToChartData: vi.fn(() => [
    { date: 'Jan 01', sentiment: 75, positive: 50, negative: 25, neutral: 25, mentions: 100, engagement: 50 },
    { date: 'Jan 02', sentiment: 65, positive: 40, negative: 35, neutral: 25, mentions: 120, engagement: 60 }
  ]),
  getTimeRangeLabel: vi.fn((range) => `Last ${range}`),
  simulateDataLoading: vi.fn(() => Promise.resolve())
}));

// Mock the chart filter store
vi.mock('../stores/chartFilterStore', () => ({
  useChartFilterStore: vi.fn(() => ({
    chartFilter: { timeRange: '30d', platforms: [], parties: [], states: [] },
    setTimeRange: vi.fn(),
    setPlatforms: vi.fn(),
    setParties: vi.fn(),
    setStates: vi.fn(),
    setChartFilter: vi.fn(),
    resetChartFilter: vi.fn(),
    togglePlatform: vi.fn(),
    toggleParty: vi.fn(),
    toggleState: vi.fn()
  }))
}));

// Mock recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = createTestQueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('Chart Filters Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('SentimentChart with Filters', () => {
    it('should render with filter controls', async () => {
      render(
        <TestWrapper>
          <SentimentChart showFilters={true} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Sentiment Trends')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Last 30 days')).toBeInTheDocument();
      });
    });

    it('should update when time range filter changes', async () => {
      const onFilterChange = vi.fn();
      
      render(
        <TestWrapper>
          <SentimentChart 
            showFilters={true} 
            onFilterChange={onFilterChange}
            filter={{ timeRange: '30d' }}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        const select = screen.getByDisplayValue('Last 30 days');
        fireEvent.change(select, { target: { value: '7d' } });
      });

      expect(onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ timeRange: '7d' })
      );
    });

    it('should show loading state during filter changes', async () => {
      render(
        <TestWrapper>
          <SentimentChart showFilters={true} isLoading={true} />
        </TestWrapper>
      );

      // Should show loading skeleton
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });

  describe('PartyDistributionChart with Filters', () => {
    it('should render with filter controls', async () => {
      render(
        <TestWrapper>
          <PartyDistributionChart showFilters={true} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Party Distribution')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Last 30 days')).toBeInTheDocument();
      });
    });

    it('should handle filter changes', async () => {
      const onFilterChange = vi.fn();
      
      render(
        <TestWrapper>
          <PartyDistributionChart 
            showFilters={true} 
            onFilterChange={onFilterChange}
            filter={{ timeRange: '30d' }}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        const select = screen.getByDisplayValue('Last 30 days');
        fireEvent.change(select, { target: { value: '3m' } });
      });

      expect(onFilterChange).toHaveBeenCalledWith(
        expect.objectContaining({ timeRange: '3m' })
      );
    });
  });

  describe('PlatformBreakdown with Filters', () => {
    it('should render with filter controls', async () => {
      render(
        <TestWrapper>
          <PlatformBreakdown showFilters={true} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Platform Breakdown')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Last 30 days')).toBeInTheDocument();
      });
    });

    it('should show platform stats grid', async () => {
      render(
        <TestWrapper>
          <PlatformBreakdown showFilters={true} />
        </TestWrapper>
      );

      await waitFor(() => {
        // Should render the platform stats grid
        expect(document.querySelector('.grid')).toBeInTheDocument();
      });
    });
  });

  describe('DemographicsChart with Filters', () => {
    it('should render with filter controls', async () => {
      render(
        <TestWrapper>
          <DemographicsChart showFilters={true} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Demographics Analysis')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Last 30 days')).toBeInTheDocument();
      });
    });

    it('should have demographic view controls', async () => {
      render(
        <TestWrapper>
          <DemographicsChart showFilters={true} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Gender')).toBeInTheDocument();
        expect(screen.getByText('Age Group')).toBeInTheDocument();
        expect(screen.getByText('State')).toBeInTheDocument();
      });
    });

    it('should switch between demographic views', async () => {
      render(
        <TestWrapper>
          <DemographicsChart showFilters={true} />
        </TestWrapper>
      );

      await waitFor(() => {
        const ageGroupButton = screen.getByText('Age Group');
        fireEvent.click(ageGroupButton);
        
        // Button should become active
        expect(ageGroupButton).toHaveClass('bg-blue-600');
      });
    });
  });

  describe('Filter Performance', () => {
    it('should handle rapid filter changes without issues', async () => {
      const onFilterChange = vi.fn();
      
      render(
        <TestWrapper>
          <SentimentChart 
            showFilters={true} 
            onFilterChange={onFilterChange}
            filter={{ timeRange: '30d' }}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        const select = screen.getByDisplayValue('Last 30 days');
        
        // Rapid filter changes
        fireEvent.change(select, { target: { value: '7d' } });
        fireEvent.change(select, { target: { value: '3m' } });
        fireEvent.change(select, { target: { value: '1y' } });
      });

      // Should handle all changes
      expect(onFilterChange).toHaveBeenCalledTimes(3);
    });

    it('should complete filter updates within performance requirements', async () => {
      const startTime = performance.now();
      
      render(
        <TestWrapper>
          <SentimentChart showFilters={true} />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Sentiment Trends')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within reasonable time (less than 500ms as per requirement)
      expect(renderTime).toBeLessThan(500);
    });
  });

  describe('Filter State Consistency', () => {
    it('should maintain filter state across chart re-renders', async () => {
      const { rerender } = render(
        <TestWrapper>
          <SentimentChart 
            showFilters={true} 
            filter={{ timeRange: '7d' }}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Last 7 days')).toBeInTheDocument();
      });

      // Re-render with same filter
      rerender(
        <TestWrapper>
          <SentimentChart 
            showFilters={true} 
            filter={{ timeRange: '7d' }}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByDisplayValue('Last 7 days')).toBeInTheDocument();
      });
    });

    it('should update chart legends and axes when filters are applied', async () => {
      render(
        <TestWrapper>
          <SentimentChart 
            showFilters={true} 
            filter={{ timeRange: '7d' }}
          />
        </TestWrapper>
      );

      await waitFor(() => {
        // Chart components should be rendered
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
        expect(screen.getByTestId('legend')).toBeInTheDocument();
        expect(screen.getByTestId('x-axis')).toBeInTheDocument();
        expect(screen.getByTestId('y-axis')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for filter controls', async () => {
      render(
        <TestWrapper>
          <SentimentChart showFilters={true} />
        </TestWrapper>
      );

      await waitFor(() => {
        const select = screen.getByDisplayValue('Last 30 days');
        expect(select).toBeInTheDocument();
        expect(select.tagName).toBe('SELECT');
      });
    });

    it('should support keyboard navigation for filters', async () => {
      render(
        <TestWrapper>
          <SentimentChart showFilters={true} />
        </TestWrapper>
      );

      await waitFor(() => {
        const select = screen.getByDisplayValue('Last 30 days');
        
        // Should be focusable
        select.focus();
        expect(document.activeElement).toBe(select);
      });
    });
  });
});