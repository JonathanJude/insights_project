import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import MobileFilterButton from '../components/filters/MobileFilterButton';
import ResponsiveAnalysisGrid from '../components/layout/ResponsiveAnalysisGrid';
import MobilePoliticianCard from '../components/ui/MobilePoliticianCard';
import { useIsMobile } from '../hooks/useMediaQuery';

// Mock the media query hook
vi.mock('../hooks/useMediaQuery', () => ({
  useIsMobile: vi.fn(() => true),
  useIsTouchDevice: vi.fn(() => true),
  useIsTablet: vi.fn(() => false),
  useIsDesktop: vi.fn(() => false),
  useMobileTouch: vi.fn(() => ({ isMobile: true, isTouch: true, isMobileTouch: true }))
}));

// Mock politician data
const mockPolitician = {
  id: '1',
  name: 'Test Politician',
  party: 'APC',
  position: 'Governor',
  state: 'Lagos',
  recentSentiment: {
    score: 0.5,
    mentionCount: 1000,
    changePercentage: 5.2,
    trend: 'up' as const
  },
  socialMediaHandles: {
    twitter: 'testpolitician'
  }
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

describe('Mobile Components Verification', () => {
  it('should render MobilePoliticianCard without crashing', () => {
    expect(() => {
      render(
        <TestWrapper>
          <MobilePoliticianCard politician={mockPolitician} />
        </TestWrapper>
      );
    }).not.toThrow();
  });

  it('should render MobileFilterButton without crashing', () => {
    expect(() => {
      render(
        <TestWrapper>
          <MobileFilterButton />
        </TestWrapper>
      );
    }).not.toThrow();
  });

  it('should render ResponsiveAnalysisGrid without crashing', () => {
    expect(() => {
      render(
        <TestWrapper>
          <ResponsiveAnalysisGrid>
            <div>Test content</div>
          </ResponsiveAnalysisGrid>
        </TestWrapper>
      );
    }).not.toThrow();
  });

  it('should detect mobile device correctly', () => {
    const isMobile = useIsMobile();
    expect(isMobile).toBe(true);
  });
});

describe('Mobile Chart Components', () => {
  it('should import mobile chart components without errors', async () => {
    // Test dynamic imports to ensure all mobile chart components can be loaded
    const touchFriendlyChart = await import('../components/charts/TouchFriendlyChart');
    const mobileOptimizedMap = await import('../components/charts/MobileOptimizedMap');
    const swipeableChartContainer = await import('../components/charts/SwipeableChartContainer');
    const mobileChartWrapper = await import('../components/charts/MobileChartWrapper');

    expect(touchFriendlyChart.default).toBeDefined();
    expect(mobileOptimizedMap.default).toBeDefined();
    expect(swipeableChartContainer.default).toBeDefined();
    expect(mobileChartWrapper.default).toBeDefined();
  });
});

describe('Mobile Filter Components', () => {
  it('should import mobile filter components without errors', async () => {
    const mobileFilterModal = await import('../components/filters/MobileFilterModal');
    const mobileFilterButton = await import('../components/filters/MobileFilterButton');
    const progressiveDisclosureFilter = await import('../components/filters/ProgressiveDisclosureFilter');

    expect(mobileFilterModal.default).toBeDefined();
    expect(mobileFilterButton.default).toBeDefined();
    expect(progressiveDisclosureFilter.default).toBeDefined();
  });
});

describe('Mobile Layout Components', () => {
  it('should import mobile layout components without errors', async () => {
    const responsiveAnalysisGrid = await import('../components/layout/ResponsiveAnalysisGrid');

    expect(responsiveAnalysisGrid.default).toBeDefined();
    expect(responsiveAnalysisGrid.MobileChartGrid).toBeDefined();
    expect(responsiveAnalysisGrid.MobileCardGrid).toBeDefined();
    expect(responsiveAnalysisGrid.MobileStatsGrid).toBeDefined();
    expect(responsiveAnalysisGrid.MobileAnalysisContainer).toBeDefined();
    expect(responsiveAnalysisGrid.MobileSection).toBeDefined();
  });
});