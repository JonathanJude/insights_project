import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import DemographicsChart from '../components/charts/DemographicsChart';
import PartyDistributionChart from '../components/charts/PartyDistributionChart';
import SentimentChart from '../components/charts/SentimentChart';
import PoliticianCard from '../components/ui/PoliticianCard';
import TrendingPoliticians from '../components/ui/TrendingPoliticians';
import { mockPoliticians } from '../mock/politicians';
import type { TrendingPolitician } from '../types';

// Mock window.matchMedia
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
};

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

const createTestWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Mobile Responsiveness', () => {
  let originalInnerWidth: number;

  beforeEach(() => {
    originalInnerWidth = window.innerWidth;
    // Mock touch events
    global.TouchEvent = class TouchEvent extends Event {
      touches: Touch[];
      targetTouches: Touch[];
      changedTouches: Touch[];

      constructor(type: string, eventInitDict?: TouchEventInit) {
        super(type, eventInitDict);
        this.touches = eventInitDict?.touches || [];
        this.targetTouches = eventInitDict?.targetTouches || [];
        this.changedTouches = eventInitDict?.changedTouches || [];
      }
    } as any;
  });

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    });
    vi.clearAllMocks();
  });

  describe('Chart Components Mobile Adaptations', () => {
    it('should render SentimentChart with mobile-friendly controls', async () => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      mockMatchMedia(true); // Mobile

      const Wrapper = createTestWrapper();
      render(
        <Wrapper>
          <SentimentChart showFilters={true} />
        </Wrapper>
      );

      await waitFor(() => {
        // Should show mobile button controls instead of select dropdown
        expect(screen.getByText('7d')).toBeInTheDocument();
        expect(screen.getByText('30d')).toBeInTheDocument();
        expect(screen.getByText('3m')).toBeInTheDocument();
        expect(screen.getByText('1y')).toBeInTheDocument();

        // Should show swipe hint
        expect(screen.getByText('Swipe left/right to change time period')).toBeInTheDocument();
      });
    });

    it('should handle swipe gestures on mobile charts', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      mockMatchMedia(true);

      const Wrapper = createTestWrapper();
      const { container } = render(
        <Wrapper>
          <SentimentChart showFilters={true} />
        </Wrapper>
      );

      const chartContainer = container.firstChild as HTMLElement;

      // Simulate swipe left (should move to next time range)
      fireEvent.touchStart(chartContainer, {
        touches: [{ clientX: 200 }],
      });
      fireEvent.touchMove(chartContainer, {
        touches: [{ clientX: 100 }],
      });
      fireEvent.touchEnd(chartContainer);

      // Should handle the swipe gesture without errors
      expect(chartContainer).toBeInTheDocument();
    });

    it('should render PartyDistributionChart with mobile optimizations', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      mockMatchMedia(true);

      const Wrapper = createTestWrapper();
      render(
        <Wrapper>
          <PartyDistributionChart showFilters={true} />
        </Wrapper>
      );

      await waitFor(() => {
        // Should show mobile button controls
        expect(screen.getByText('7d')).toBeInTheDocument();
        // Should show swipe hint
        expect(screen.getByText('Swipe left/right to change time period')).toBeInTheDocument();
      });
    });

    it('should render DemographicsChart with mobile layout', async () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      mockMatchMedia(true);

      const Wrapper = createTestWrapper();
      render(
        <Wrapper>
          <DemographicsChart showFilters={true} />
        </Wrapper>
      );

      await waitFor(() => {
        // Should show mobile controls
        expect(screen.getByText('Gender')).toBeInTheDocument();
        expect(screen.getByText('Age Group')).toBeInTheDocument();
        expect(screen.getByText('State')).toBeInTheDocument();

        // Should show swipe hint
        expect(screen.getByText('Swipe left/right to change demographic view')).toBeInTheDocument();
      });
    });
  });

  describe('UI Components Mobile Adaptations', () => {
    it('should render PoliticianCard with mobile-friendly layout', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      mockMatchMedia(true);

      const politician = mockPoliticians[0];
      const Wrapper = createTestWrapper();

      render(
        <Wrapper>
          <PoliticianCard politician={politician} />
        </Wrapper>
      );

      // Should render politician name
      expect(screen.getByText(politician.name)).toBeInTheDocument();

      // Should render position
      expect(screen.getByText(politician.position)).toBeInTheDocument();

      // Should have touch-friendly styling
      const card = screen.getByText(politician.name).closest('div');
      expect(card).toHaveClass('touch-manipulation');
    });

    it('should render TrendingPoliticians with mobile optimizations', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      mockMatchMedia(true);

      const trendingPoliticians: TrendingPolitician[] = [
        {
          politician: mockPoliticians[0],
          sentimentScore: 0.7,
          sentimentChange: 5.2,
          mentionCount: 1250,
          engagementRate: 0.15,
          trendingRank: 1
        },
        {
          politician: mockPoliticians[1],
          sentimentScore: 0.6,
          sentimentChange: -2.1,
          mentionCount: 980,
          engagementRate: 0.12,
          trendingRank: 2
        }
      ];

      const Wrapper = createTestWrapper();

      render(
        <Wrapper>
          <TrendingPoliticians politicians={trendingPoliticians} />
        </Wrapper>
      );

      // Should render trending politicians
      expect(screen.getByText(mockPoliticians[0].name)).toBeInTheDocument();
      expect(screen.getByText(mockPoliticians[1].name)).toBeInTheDocument();

      // Should have mobile-friendly touch targets
      const cards = screen.getAllByText(/.*/).filter(el =>
        el.closest('a')?.classList.contains('touch-manipulation')
      );
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  describe('Touch Interactions', () => {
    it('should handle touch events properly on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      mockMatchMedia(true);

      const Wrapper = createTestWrapper();
      const { container } = render(
        <Wrapper>
          <SentimentChart showFilters={true} />
        </Wrapper>
      );

      const chartElement = container.querySelector('[class*="touch-pan-y"]');
      expect(chartElement).toBeInTheDocument();

      // Should handle touch start
      if (chartElement) {
        fireEvent.touchStart(chartElement, {
          touches: [{ clientX: 100, clientY: 100 }],
        });

        // Should not throw errors
        expect(chartElement).toBeInTheDocument();
      }
    });

    it('should provide appropriate touch targets size', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      mockMatchMedia(true);

      const politician = mockPoliticians[0];
      const Wrapper = createTestWrapper();

      render(
        <Wrapper>
          <PoliticianCard politician={politician} />
        </Wrapper>
      );

      // Touch targets should be appropriately sized for mobile
      const card = screen.getByText(politician.name).closest('a');
      expect(card).toHaveClass('touch-manipulation');
    });
  });

  describe('Responsive Layout', () => {
    it('should adapt layout for different screen sizes', () => {
      // Test mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      mockMatchMedia(true);

      const politician = mockPoliticians[0];
      const Wrapper = createTestWrapper();

      const { rerender } = render(
        <Wrapper>
          <PoliticianCard politician={politician} />
        </Wrapper>
      );

      // Should render with mobile layout
      expect(screen.getByText(politician.name)).toBeInTheDocument();

      // Test desktop
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      mockMatchMedia(false);

      rerender(
        <Wrapper>
          <PoliticianCard politician={politician} />
        </Wrapper>
      );

      // Should still render correctly
      expect(screen.getByText(politician.name)).toBeInTheDocument();
    });
  });

  describe('Accessibility on Mobile', () => {
    it('should maintain accessibility features on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      mockMatchMedia(true);

      const politician = mockPoliticians[0];
      const Wrapper = createTestWrapper();

      render(
        <Wrapper>
          <PoliticianCard politician={politician} />
        </Wrapper>
      );

      // Should have proper link structure
      const link = screen.getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', `/politician/${politician.id}`);
    });

    it('should provide proper focus management on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
      mockMatchMedia(true);

      const Wrapper = createTestWrapper();
      render(
        <Wrapper>
          <SentimentChart showFilters={true} />
        </Wrapper>
      );

      // Filter buttons should be focusable
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toBeInTheDocument();
        // Should be able to focus
        button.focus();
        expect(document.activeElement).toBe(button);
      });
    });
  });
});