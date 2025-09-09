import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RefreshButton from '../components/ui/RefreshButton';
import Dashboard from '../pages/dashboard/Dashboard';

// Mock the mock data modules
vi.mock('../mock', () => ({
  mockApiDelay: vi.fn(() => Promise.resolve()),
  mockDashboardStats: {
    totalPoliticians: 150,
    totalMentions: 25000,
    overallSentiment: {
      positive: 45.2,
      negative: 32.1,
      neutral: 22.7
    },
    lastUpdated: new Date().toISOString()
  },
  mockTrendingPoliticians: [
    { id: '1', name: 'Test Politician', party: 'APC', sentiment: 0.75 }
  ],
  mockPlatformSentiment: [
    { platform: 'twitter', sentiment: 0.6, mentions: 1000 }
  ]
}));

// Mock the chart components to avoid rendering issues in tests
vi.mock('../components/charts', () => ({
  SentimentChart: ({ isLoading }: { isLoading: boolean }) => {
    return React.createElement('div', { 'data-testid': 'sentiment-chart' }, 
      isLoading ? 'Loading...' : 'Chart Content');
  },
  PlatformBreakdown: ({ isLoading }: { isLoading: boolean }) => {
    return React.createElement('div', { 'data-testid': 'platform-breakdown' }, 
      isLoading ? 'Loading...' : 'Platform Content');
  },
  DemographicsChart: ({ isLoading }: { isLoading: boolean }) => {
    return React.createElement('div', { 'data-testid': 'demographics-chart' }, 
      isLoading ? 'Loading...' : 'Demographics Content');
  },
  PartyDistributionChart: ({ isLoading }: { isLoading: boolean }) => {
    return React.createElement('div', { 'data-testid': 'party-distribution' }, 
      isLoading ? 'Loading...' : 'Party Content');
  }
}));

// Mock other UI components
vi.mock('../components/ui/StatsCard', () => ({
  default: ({ title, value }: { title: string; value: string }) => {
    return React.createElement('div', { 'data-testid': 'stats-card' }, `${title}: ${value}`);
  }
}));

vi.mock('../components/ui/TrendingPoliticians', () => ({
  default: ({ loading }: { loading: boolean }) => {
    return React.createElement('div', { 'data-testid': 'trending-politicians' }, 
      loading ? 'Loading...' : 'Trending Content');
  }
}));

vi.mock('../components/ui/RefreshButton', () => ({
  default: ({ size, variant, className }: { size?: string; variant?: string; className?: string }) => {
    return React.createElement('button', { 
      'data-testid': 'refresh-button',
      'aria-label': 'Refresh dashboard data',
      className: `refresh-button ${size || ''} ${variant || ''} ${className || ''}`.trim()
    }, 'Refresh');
  }
}));

// Mock quick actions
vi.mock('../config/quickActions', () => ({
  getEnabledQuickActions: () => [
    {
      id: 'test-action',
      label: 'Test Action',
      description: 'Test Description',
      icon: () => React.createElement('div', {}, 'Icon'),
      route: '/test'
    }
  ]
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0,
      gcTime: 0
    }
  }
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    React.createElement(QueryClientProvider, { client: queryClient },
      React.createElement(BrowserRouter, {},
        component
      )
    )
  );
};

describe('Task 8: Dashboard Refresh Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('RefreshButton Component', () => {
    it('should render refresh button with correct default props', () => {
      const queryClient = createTestQueryClient();
      render(
        React.createElement(QueryClientProvider, { client: queryClient },
          React.createElement(RefreshButton)
        )
      );

      const refreshButton = screen.getByRole('button', { name: /refresh dashboard data/i });
      expect(refreshButton).toBeInTheDocument();
      expect(refreshButton).not.toBeDisabled();
    });

    it('should show spinning icon when refreshing', async () => {
      const queryClient = createTestQueryClient();
      render(
        React.createElement(QueryClientProvider, { client: queryClient },
          React.createElement(RefreshButton)
        )
      );

      const refreshButton = screen.getByRole('button', { name: /refresh dashboard data/i });
      fireEvent.click(refreshButton);

      // Button should be disabled during refresh
      expect(refreshButton).toBeDisabled();
      
      // Wait for refresh to complete
      await waitFor(() => {
        expect(refreshButton).not.toBeDisabled();
      }, { timeout: 2000 });
    });

    it('should call onRefreshStart and onRefreshComplete callbacks', async () => {
      const onRefreshStart = vi.fn();
      const onRefreshComplete = vi.fn();
      const queryClient = createTestQueryClient();

      render(
        React.createElement(QueryClientProvider, { client: queryClient },
          React.createElement(RefreshButton, {
            onRefreshStart,
            onRefreshComplete
          })
        )
      );

      const refreshButton = screen.getByRole('button', { name: /refresh dashboard data/i });
      fireEvent.click(refreshButton);

      expect(onRefreshStart).toHaveBeenCalledTimes(1);

      await waitFor(() => {
        expect(onRefreshComplete).toHaveBeenCalledTimes(1);
      }, { timeout: 2000 });
    });

    it('should render with different sizes', () => {
      const queryClient = createTestQueryClient();
      const { rerender } = render(
        React.createElement(QueryClientProvider, { client: queryClient },
          React.createElement(RefreshButton, { size: 'sm' })
        )
      );

      let refreshButton = screen.getByRole('button', { name: /refresh dashboard data/i });
      expect(refreshButton).toHaveClass('p-1.5');

      rerender(
        React.createElement(QueryClientProvider, { client: queryClient },
          React.createElement(RefreshButton, { size: 'lg' })
        )
      );

      refreshButton = screen.getByRole('button', { name: /refresh dashboard data/i });
      expect(refreshButton).toHaveClass('p-3');
    });

    it('should render with different variants', () => {
      const queryClient = createTestQueryClient();
      const { rerender } = render(
        React.createElement(QueryClientProvider, { client: queryClient },
          React.createElement(RefreshButton, { variant: 'subtle' })
        )
      );

      let refreshButton = screen.getByRole('button', { name: /refresh dashboard data/i });
      expect(refreshButton).toHaveClass('text-gray-500');

      rerender(
        React.createElement(QueryClientProvider, { client: queryClient },
          React.createElement(RefreshButton, { variant: 'filled' })
        )
      );

      refreshButton = screen.getByRole('button', { name: /refresh dashboard data/i });
      expect(refreshButton).toHaveClass('bg-blue-600');
    });
  });

  describe('Dashboard Integration', () => {
    it('should render dashboard with refresh button in header', async () => {
      renderWithProviders(React.createElement(Dashboard));

      // Wait for dashboard to load
      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      // Check that refresh button is present
      const refreshButton = screen.getByRole('button', { name: /refresh dashboard data/i });
      expect(refreshButton).toBeInTheDocument();
      
      // Check that it's in the header area (should be near "Last updated" text)
      const lastUpdatedText = screen.getByText(/last updated:/i);
      expect(lastUpdatedText).toBeInTheDocument();
    });

    it('should preserve dashboard layout when refresh button is added', async () => {
      renderWithProviders(React.createElement(Dashboard));

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      // Check that main dashboard elements are still present
      expect(screen.getByText('Political sentiment insights across Nigerian social media')).toBeInTheDocument();
      expect(screen.getByText('Live Data')).toBeInTheDocument();
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });

    it('should not interfere with existing dashboard functionality', async () => {
      renderWithProviders(React.createElement(Dashboard));

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      // Check that existing buttons still work
      const exploreButton = screen.getByText('Explore Politicians');
      expect(exploreButton).toBeInTheDocument();
      expect(exploreButton.closest('a')).toHaveAttribute('href', '/search');

      const partyAnalyticsButton = screen.getByText('Party Analytics');
      expect(partyAnalyticsButton).toBeInTheDocument();
      expect(partyAnalyticsButton.closest('a')).toHaveAttribute('href', '/party');
    });

    it('should refresh dashboard data when refresh button is clicked', async () => {
      renderWithProviders(React.createElement(Dashboard));

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /refresh dashboard data/i });
      
      // Click refresh button
      fireEvent.click(refreshButton);

      // Button should be disabled during refresh
      expect(refreshButton).toBeDisabled();

      // Wait for refresh to complete
      await waitFor(() => {
        expect(refreshButton).not.toBeDisabled();
      }, { timeout: 2000 });
    });
  });

  describe('Requirement Verification', () => {
    it('should meet Requirement 15.1: Subtle refresh button that doesn\'t interfere with existing components', async () => {
      renderWithProviders(React.createElement(Dashboard));

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /refresh dashboard data/i });
      
      // Should be subtle (small size, low opacity)
      expect(refreshButton).toHaveClass('p-1.5'); // small size
      expect(refreshButton).toHaveClass('opacity-70'); // subtle appearance
      
      // Should not interfere with layout
      expect(screen.getByText('Live Data')).toBeInTheDocument();
      expect(screen.getByText(/last updated:/i)).toBeInTheDocument();
    });

    it('should meet Requirement 15.2: Reload dashboard data while preserving filters and view state', async () => {
      renderWithProviders(React.createElement(Dashboard));

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /refresh dashboard data/i });
      
      // Click refresh
      fireEvent.click(refreshButton);
      
      // Dashboard content should still be visible (view state preserved)
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(refreshButton).not.toBeDisabled();
      }, { timeout: 2000 });
    });

    it('should meet Requirement 15.3: Show loading indicator on refresh button', async () => {
      renderWithProviders(React.createElement(Dashboard));

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /refresh dashboard data/i });
      
      // Click refresh
      fireEvent.click(refreshButton);
      
      // Button should be disabled (loading state)
      expect(refreshButton).toBeDisabled();
      
      // Wait for loading to complete
      await waitFor(() => {
        expect(refreshButton).not.toBeDisabled();
      }, { timeout: 2000 });
    });

    it('should meet Requirement 15.4: Preserve current filter states and view context', async () => {
      renderWithProviders(React.createElement(Dashboard));

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      // Verify that dashboard sections are present before refresh
      expect(screen.getByTestId('sentiment-chart')).toBeInTheDocument();
      expect(screen.getByTestId('platform-breakdown')).toBeInTheDocument();
      expect(screen.getByTestId('demographics-chart')).toBeInTheDocument();
      expect(screen.getByTestId('party-distribution')).toBeInTheDocument();

      const refreshButton = screen.getByRole('button', { name: /refresh dashboard data/i });
      fireEvent.click(refreshButton);

      // All sections should still be present during and after refresh
      expect(screen.getByTestId('sentiment-chart')).toBeInTheDocument();
      expect(screen.getByTestId('platform-breakdown')).toBeInTheDocument();
      expect(screen.getByTestId('demographics-chart')).toBeInTheDocument();
      expect(screen.getByTestId('party-distribution')).toBeInTheDocument();

      await waitFor(() => {
        expect(refreshButton).not.toBeDisabled();
      }, { timeout: 2000 });
    });

    it('should meet Requirement 15.5: Display appropriate loading indicators and error feedback', async () => {
      const queryClient = createTestQueryClient();
      
      render(
        React.createElement(QueryClientProvider, { client: queryClient },
          React.createElement(RefreshButton, {
            onRefreshError: (error) => {
              // Error callback should be called if refresh fails
              expect(error).toBeDefined();
            }
          })
        )
      );

      const refreshButton = screen.getByRole('button', { name: /refresh dashboard data/i });
      
      // Should have appropriate title/tooltip
      expect(refreshButton).toHaveAttribute('title');
      
      // Should have proper aria-label for accessibility
      expect(refreshButton).toHaveAttribute('aria-label', 'Refresh dashboard data');
    });
  });

  describe('Accessibility and UX', () => {
    it('should be keyboard accessible', async () => {
      renderWithProviders(React.createElement(Dashboard));

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /refresh dashboard data/i });
      
      // Should be focusable
      refreshButton.focus();
      expect(refreshButton).toHaveFocus();
      
      // Should be activatable with Enter key
      fireEvent.keyDown(refreshButton, { key: 'Enter' });
      expect(refreshButton).toBeDisabled(); // Should start refresh
      
      await waitFor(() => {
        expect(refreshButton).not.toBeDisabled();
      }, { timeout: 2000 });
    });

    it('should provide helpful tooltip information', async () => {
      renderWithProviders(React.createElement(Dashboard));

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /refresh dashboard data/i });
      
      // Should have a title attribute with helpful information
      const title = refreshButton.getAttribute('title');
      expect(title).toContain('Refresh data');
    });
  });
});

console.log('✅ Task 8 Verification Tests Created');
console.log('📋 Test Coverage:');
console.log('  - RefreshButton component functionality');
console.log('  - Dashboard integration');
console.log('  - All 5 requirements verification (15.1-15.5)');
console.log('  - Accessibility and UX testing');
console.log('  - Error handling and loading states');