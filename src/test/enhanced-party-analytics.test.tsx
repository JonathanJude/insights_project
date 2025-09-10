import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import PartyAnalytics from '../pages/party/PartyAnalytics';

// Mock the enhanced hooks
vi.mock('../hooks/useEnhancedPoliticians', () => ({
  useMultiDimensionalInsights: () => ({
    data: {
      geographic: {
        'Lagos': 0.75,
        'Abuja': 0.68,
        'Kano': 0.52,
        'Rivers': 0.61,
        'Ogun': 0.58
      },
      demographic: {
        'education_Tertiary': 0.72,
        'education_Secondary': 0.58,
        'age_26-35': 0.65,
        'age_36-45': 0.61,
        'occupation_Technology': 0.78,
        'occupation_Public Sector': 0.55
      },
      topics: {
        'Economy': 45,
        'Security': 32,
        'Education': 28,
        'Infrastructure': 25,
        'Health': 22,
        'Corruption': 18,
        'Youth/Jobs': 15
      },
      engagement: {
        'High_Engagement': 12,
        'Medium_Engagement': 28,
        'Low_Engagement': 15,
        'Viral_Politicians': 8,
        'Influencer_Amplified': 6
      }
    },
    isLoading: false
  })
}));

// Mock other hooks and data
vi.mock('../hooks/usePageTitle', () => ({
  usePageTitle: vi.fn()
}));

vi.mock('../stores/filterStore', () => ({
  useFilterStore: vi.fn(() => ({
    selectedParties: ['APC', 'PDP'],
    selectedStates: ['Lagos', 'Abuja'],
    selectedPlatforms: [],
    selectedGenders: [],
    selectedAgeGroups: [],
    selectedLevels: [],
    dateRange: { start: '', end: '' },
    hasActiveFilters: () => true,
    toggleParty: vi.fn(),
    toggleState: vi.fn(),
    togglePlatform: vi.fn(),
    toggleGender: vi.fn(),
    toggleAgeGroup: vi.fn(),
    toggleLevel: vi.fn(),
    setDateRange: vi.fn(),
    clearAllFilters: vi.fn(),
    getActiveFilterCount: () => 2
  }))
}));

// Mock chart components
vi.mock('../components/charts', () => ({
  DemographicsChart: ({ isLoading }: { isLoading: boolean }) => (
    <div data-testid="demographics-chart">
      {isLoading ? 'Loading...' : 'Demographics Chart'}
    </div>
  ),
  PartyCompareChart: ({ isLoading }: { isLoading: boolean }) => (
    <div data-testid="party-compare-chart">
      {isLoading ? 'Loading...' : 'Party Compare Chart'}
    </div>
  )
}));

// Mock filter components
vi.mock('../components/filters/FilterBar', () => ({
  default: () => <div data-testid="filter-bar">Filter Bar</div>
}));

vi.mock('../components/filters/EnhancedFiltersPanel', () => ({
  default: () => <div data-testid="enhanced-filters-panel">Enhanced Filters Panel</div>
}));

vi.mock('../components/filters/FilterIndicator', () => ({
  default: () => <div data-testid="filter-indicator">Filter Indicator</div>
}));

// Mock UI components
vi.mock('../components/ui/StatsCard', () => ({
  default: ({ title, value, isLoading }: { title: string; value: string; isLoading: boolean }) => (
    <div data-testid={`stats-card-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      {isLoading ? 'Loading...' : `${title}: ${value}`}
    </div>
  )
}));

// Mock data
vi.mock('../mock', () => ({
  generateFilteredDemographicsData: vi.fn(() => Promise.resolve([])),
  getPartyInsights: vi.fn(() => Promise.resolve([
    {
      party: 'APC',
      overallSentiment: { positive: 65, negative: 25, neutral: 10 },
      totalMentions: 15420,
      totalEngagement: 8500,
      topPoliticians: ['politician_1', 'politician_2']
    },
    {
      party: 'PDP',
      overallSentiment: { positive: 58, negative: 32, neutral: 10 },
      totalMentions: 12300,
      totalEngagement: 7200,
      topPoliticians: ['politician_3', 'politician_4']
    }
  ])),
  mockDashboardStats: {
    totalPoliticians: 150,
    totalMentions: 45000,
    overallSentiment: { positive: 62, negative: 28, neutral: 10 }
  }
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Enhanced Party Analytics', () => {
  it('renders basic party analytics page', async () => {
    render(
      <TestWrapper>
        <PartyAnalytics />
      </TestWrapper>
    );

    expect(screen.getByText('Party Analytics')).toBeInTheDocument();
    expect(screen.getByText(/Compare sentiment and engagement/)).toBeInTheDocument();
    expect(screen.getByTestId('filter-bar')).toBeInTheDocument();
  });

  it('shows enhanced analysis toggle button', () => {
    render(
      <TestWrapper>
        <PartyAnalytics />
      </TestWrapper>
    );

    const enhancedButton = screen.getByText('Enable Enhanced');
    expect(enhancedButton).toBeInTheDocument();
  });

  it('enables enhanced analysis when toggle is clicked', async () => {
    render(
      <TestWrapper>
        <PartyAnalytics />
      </TestWrapper>
    );

    const enhancedButton = screen.getByText('Enable Enhanced');
    fireEvent.click(enhancedButton);

    await waitFor(() => {
      expect(screen.getByText('Enhanced Analysis')).toBeInTheDocument();
      expect(screen.getByText(/Multi-dimensional analysis/)).toBeInTheDocument();
    });
  });

  it('shows enhanced filters panel when enhanced analysis is enabled', async () => {
    render(
      <TestWrapper>
        <PartyAnalytics />
      </TestWrapper>
    );

    const enhancedButton = screen.getByText('Enable Enhanced');
    fireEvent.click(enhancedButton);

    await waitFor(() => {
      expect(screen.getByTestId('enhanced-filters-panel')).toBeInTheDocument();
    });
  });

  it('displays multi-dimensional analysis section when enhanced', async () => {
    render(
      <TestWrapper>
        <PartyAnalytics />
      </TestWrapper>
    );

    const enhancedButton = screen.getByText('Enable Enhanced');
    fireEvent.click(enhancedButton);

    await waitFor(() => {
      expect(screen.getByText('Multi-Dimensional Party Analysis')).toBeInTheDocument();
      expect(screen.getByText('Geographic')).toBeInTheDocument();
      expect(screen.getByText('Demographic')).toBeInTheDocument();
      expect(screen.getByText('Topics')).toBeInTheDocument();
      expect(screen.getByText('Engagement')).toBeInTheDocument();
    });
  });

  it('shows geographic analysis by default in enhanced mode', async () => {
    render(
      <TestWrapper>
        <PartyAnalytics />
      </TestWrapper>
    );

    const enhancedButton = screen.getByText('Enable Enhanced');
    fireEvent.click(enhancedButton);

    await waitFor(() => {
      expect(screen.getByText('Geographic Performance')).toBeInTheDocument();
      expect(screen.getByText('Regional Breakdown')).toBeInTheDocument();
      expect(screen.getByText('Lagos')).toBeInTheDocument();
      expect(screen.getByText('Abuja')).toBeInTheDocument();
    });
  });

  it('switches to demographic analysis when demographic tab is clicked', async () => {
    render(
      <TestWrapper>
        <PartyAnalytics />
      </TestWrapper>
    );

    const enhancedButton = screen.getByText('Enable Enhanced');
    fireEvent.click(enhancedButton);

    await waitFor(() => {
      const demographicButton = screen.getByText('Demographic');
      fireEvent.click(demographicButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Demographic Appeal')).toBeInTheDocument();
      expect(screen.getByText('Age Group Analysis')).toBeInTheDocument();
      expect(screen.getByText('Education Tertiary')).toBeInTheDocument();
    });
  });

  it('switches to topics analysis when topics tab is clicked', async () => {
    render(
      <TestWrapper>
        <PartyAnalytics />
      </TestWrapper>
    );

    const enhancedButton = screen.getByText('Enable Enhanced');
    fireEvent.click(enhancedButton);

    await waitFor(() => {
      const topicsButton = screen.getByText('Topics');
      fireEvent.click(topicsButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Policy Area Performance')).toBeInTheDocument();
      expect(screen.getByText('Trending Issues')).toBeInTheDocument();
      expect(screen.getByText('Economy')).toBeInTheDocument();
      expect(screen.getByText('Security')).toBeInTheDocument();
    });
  });

  it('switches to engagement analysis when engagement tab is clicked', async () => {
    render(
      <TestWrapper>
        <PartyAnalytics />
      </TestWrapper>
    );

    const enhancedButton = screen.getByText('Enable Enhanced');
    fireEvent.click(enhancedButton);

    await waitFor(() => {
      const engagementButton = screen.getByText('Engagement');
      fireEvent.click(engagementButton);
    });

    await waitFor(() => {
      expect(screen.getByText('Engagement Metrics')).toBeInTheDocument();
      expect(screen.getByText('Viral Content Analysis')).toBeInTheDocument();
      expect(screen.getByText('High Engagement')).toBeInTheDocument();
    });
  });

  it('displays stats cards with party data', async () => {
    render(
      <TestWrapper>
        <PartyAnalytics />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('stats-card-total-parties')).toBeInTheDocument();
      expect(screen.getByTestId('stats-card-total-mentions')).toBeInTheDocument();
      expect(screen.getByTestId('stats-card-average-sentiment')).toBeInTheDocument();
      expect(screen.getByTestId('stats-card-top-party')).toBeInTheDocument();
    });
  });

  it('shows party comparison chart', async () => {
    render(
      <TestWrapper>
        <PartyAnalytics />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByTestId('party-compare-chart')).toBeInTheDocument();
      expect(screen.getByText('Party Comparison')).toBeInTheDocument();
    });
  });

  it('displays demographics charts', async () => {
    render(
      <TestWrapper>
        <PartyAnalytics />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Sentiment by Gender')).toBeInTheDocument();
      expect(screen.getByText('Sentiment by Age Group')).toBeInTheDocument();
      const demographicsCharts = screen.getAllByTestId('demographics-chart');
      expect(demographicsCharts).toHaveLength(2);
    });
  });

  it('shows filter indicator when filters are active', () => {
    render(
      <TestWrapper>
        <PartyAnalytics />
      </TestWrapper>
    );

    expect(screen.getByTestId('filter-indicator')).toBeInTheDocument();
  });

  it('displays enhanced sparkle icon when enhanced mode is active', async () => {
    render(
      <TestWrapper>
        <PartyAnalytics />
      </TestWrapper>
    );

    const enhancedButton = screen.getByText('Enable Enhanced');
    fireEvent.click(enhancedButton);

    await waitFor(() => {
      expect(screen.getByText('✨')).toBeInTheDocument();
    });
  });
});