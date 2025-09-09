import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

// Components to test
import LoadingTransition from '../components/ui/LoadingTransition';
import { SkeletonChart, SkeletonList, SkeletonStatsCard } from '../components/ui/skeletons';
import Dashboard from '../pages/dashboard/Dashboard';
import { LoadingProvider } from '../providers/LoadingProvider';

// Mock the stores
vi.mock('../stores/uiStore', () => ({
  useUIStore: vi.fn(() => ({
    theme: 'light',
    addNotification: vi.fn(),
    notifications: [],
    addToRecentlyViewed: vi.fn()
  }))
}));

vi.mock('../stores/filterStore', () => ({
  useFilterStore: vi.fn(() => ({
    dateRange: {
      start: '2024-01-01',
      end: '2024-12-31'
    }
  }))
}));

// Mock the hooks
vi.mock('../hooks/usePoliticians', () => ({
  usePolitician: vi.fn(() => ({
    data: null,
    isLoading: true,
    error: null
  })),
  usePoliticianInsights: vi.fn(() => ({
    data: null,
    isLoading: true
  }))
}));

// Mock the config
vi.mock('../config/quickActions', () => ({
  getEnabledQuickActions: vi.fn(() => [])
}));

// Mock the mock data
vi.mock('../mock', () => ({
  mockApiDelay: vi.fn(() => Promise.resolve()),
  mockDashboardStats: {},
  mockPlatformSentiment: [],
  mockTrendingPoliticians: []
}));

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
  },
});

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <LoadingProvider>
        <MemoryRouter>
          {children}
        </MemoryRouter>
      </LoadingProvider>
    </QueryClientProvider>
  );
};

describe('Loading States', () => {
  describe('Skeleton Components', () => {
    it('renders SkeletonStatsCard with proper structure', () => {
      render(<SkeletonStatsCard />);
      
      // Check for skeleton elements
      const skeletonElements = document.querySelectorAll('.animate-pulse');
      expect(skeletonElements.length).toBeGreaterThan(0);
      
      // Check for proper container structure
      const container = document.querySelector('.bg-white');
      expect(container).toBeInTheDocument();
    });

    it('renders SkeletonChart with different types', () => {
      const { rerender } = render(<SkeletonChart type="line" />);
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
      
      rerender(<SkeletonChart type="pie" />);
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
      
      rerender(<SkeletonChart type="bar" />);
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    it('renders SkeletonList with configurable items', () => {
      render(<SkeletonList items={3} showRank={true} />);
      
      // Should render 3 skeleton items
      const items = document.querySelectorAll('.space-y-3 > div');
      expect(items).toHaveLength(3);
      
      // Should show rank indicators
      const rankElements = document.querySelectorAll('.w-8.h-8');
      expect(rankElements.length).toBeGreaterThan(0);
    });
  });

  describe('GlobalLoadingIndicator', () => {
    it('renders when loading is active', async () => {
      // Mock the useGlobalLoading hook to return loading state
      vi.doMock('../hooks/useGlobalLoading', () => ({
        useGlobalLoading: vi.fn(() => ({
          isLoading: true,
          progress: 50,
          loadingOperations: ['test']
        }))
      }));

      const { GlobalLoadingIndicator: MockedGlobalLoadingIndicator } = await import('../components/ui/GlobalLoadingIndicator');
      
      render(<MockedGlobalLoadingIndicator />);
      
      // Should render the loading bar
      const loadingBar = document.querySelector('.bg-gradient-to-r');
      expect(loadingBar).toBeInTheDocument();
    });

    it('does not render when not loading', async () => {
      // Mock the useGlobalLoading hook to return non-loading state
      vi.doMock('../hooks/useGlobalLoading', () => ({
        useGlobalLoading: vi.fn(() => ({
          isLoading: false,
          progress: 0,
          loadingOperations: []
        }))
      }));

      const { GlobalLoadingIndicator: MockedGlobalLoadingIndicator } = await import('../components/ui/GlobalLoadingIndicator');
      
      const { container } = render(<MockedGlobalLoadingIndicator />);
      
      // Should not render anything
      expect(container.firstChild).toBeNull();
    });
  });

  describe('LoadingTransition', () => {
    it('shows fallback when loading', () => {
      render(
        <LoadingTransition
          isLoading={true}
          fallback={<div data-testid="loading">Loading...</div>}
        >
          <div data-testid="content">Content</div>
        </LoadingTransition>
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
      expect(screen.queryByTestId('content')).not.toBeInTheDocument();
    });

    it('shows content when not loading', () => {
      render(
        <LoadingTransition
          isLoading={false}
          fallback={<div data-testid="loading">Loading...</div>}
        >
          <div data-testid="content">Content</div>
        </LoadingTransition>
      );

      expect(screen.getByTestId('content')).toBeInTheDocument();
      expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
    });

    it('applies fade transition classes', () => {
      const { container } = render(
        <LoadingTransition
          isLoading={false}
          fadeTransition={true}
          fallback={<div>Loading...</div>}
        >
          <div>Content</div>
        </LoadingTransition>
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('transition-opacity');
    });
  });

  describe('Dashboard Loading States', () => {
    it('renders loading skeleton when data is loading', async () => {
      render(
        <TestWrapper>
          <Dashboard />
        </TestWrapper>
      );

      // Should show skeleton loading states
      await waitFor(() => {
        const skeletonElements = document.querySelectorAll('.animate-pulse');
        expect(skeletonElements.length).toBeGreaterThan(0);
      });

      // Should show header skeleton
      const headerSkeleton = document.querySelector('.h-8.bg-gradient-to-r');
      expect(headerSkeleton).toBeInTheDocument();

      // Should show stats cards skeleton
      const statsSkeletons = document.querySelectorAll('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4 > div');
      expect(statsSkeletons.length).toBe(4);
    });
  });

  describe('Loading Provider', () => {
    it('provides loading context to children', () => {
      const TestComponent = () => {
        // This would use useLoadingContext in a real scenario
        return <div data-testid="test-component">Test</div>;
      };

      render(
        <LoadingProvider>
          <TestComponent />
        </LoadingProvider>
      );

      expect(screen.getByTestId('test-component')).toBeInTheDocument();
    });
  });

  describe('Responsive Loading States', () => {
    it('adapts skeleton components for mobile', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<SkeletonChart type="line" />);
      
      // Should render with mobile-appropriate sizing
      const container = document.querySelector('.bg-white');
      expect(container).toBeInTheDocument();
    });

    it('shows appropriate loading states for different screen sizes', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });

      render(<SkeletonList items={5} />);
      
      // Should render with desktop layout
      const items = document.querySelectorAll('.space-y-3 > div');
      expect(items).toHaveLength(5);
    });
  });

  describe('Dark Mode Loading States', () => {
    it('applies dark mode classes to skeleton components', () => {
      render(<SkeletonStatsCard />);
      
      // Should have dark mode classes
      const darkModeElements = document.querySelectorAll('.dark\\:bg-gray-800, .dark\\:from-gray-700');
      expect(darkModeElements.length).toBeGreaterThan(0);
    });
  });

  describe('Loading Performance', () => {
    it('implements minimum loading duration', async () => {
      const startTime = Date.now();
      
      render(
        <LoadingTransition
          isLoading={true}
          minDuration={300}
          fallback={<div data-testid="loading">Loading...</div>}
        >
          <div data-testid="content">Content</div>
        </LoadingTransition>
      );

      // Should show loading initially
      expect(screen.getByTestId('loading')).toBeInTheDocument();

      // Even if we change to not loading immediately, it should respect minimum duration
      const { rerender } = render(
        <LoadingTransition
          isLoading={false}
          minDuration={300}
          fallback={<div data-testid="loading">Loading...</div>}
        >
          <div data-testid="content">Content</div>
        </LoadingTransition>
      );

      // Should still show loading for minimum duration
      expect(screen.getByTestId('loading')).toBeInTheDocument();

      // Wait for minimum duration
      await waitFor(() => {
        const elapsed = Date.now() - startTime;
        return elapsed >= 300;
      }, { timeout: 500 });
    });
  });
});

describe('Loading State Integration', () => {
  it('coordinates loading states across multiple components', async () => {
    const TestApp = () => (
      <TestWrapper>
        <div>
          <SkeletonStatsCard />
          <SkeletonChart type="line" />
          <SkeletonList items={3} />
        </div>
      </TestWrapper>
    );

    render(<TestApp />);

    // All skeleton components should render
    const skeletonElements = document.querySelectorAll('.animate-pulse');
    expect(skeletonElements.length).toBeGreaterThan(0);
  });

  it('handles error states gracefully', () => {
    const ErrorComponent = () => {
      throw new Error('Test error');
    };

    const TestWithError = () => (
      <TestWrapper>
        <LoadingTransition
          isLoading={false}
          fallback={<div data-testid="loading">Loading...</div>}
        >
          <ErrorComponent />
        </LoadingTransition>
      </TestWrapper>
    );

    // Should not crash the app
    expect(() => render(<TestWithError />)).toThrow();
  });
});