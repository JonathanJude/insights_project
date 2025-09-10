import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import AdvancedSearchBar from '../components/search/AdvancedSearchBar';
import SearchAnalytics from '../components/search/SearchAnalytics';

// Mock the advanced search hooks
vi.mock('../hooks/useAdvancedSearch', () => ({
  useSearchSuggestions: () => ({
    data: {
      politicians: ['Bola Tinubu', 'Atiku Abubakar'],
      topics: ['Economy', 'Security'],
      locations: ['Lagos', 'Abuja'],
      demographics: ['Youth (18-35)', 'Technology Sector']
    },
    isLoading: false
  }),
  useSearchAnalytics: () => ({
    data: {
      totalResults: 25,
      averageRelevance: 0.78,
      dimensionCoverage: {
        geographic: 0.85,
        demographic: 0.72,
        sentiment: 0.90,
        topics: 0.68,
        engagement: 0.55
      },
      confidenceMetrics: {
        high: 0.45,
        medium: 0.35,
        low: 0.20
      },
      qualityScore: 0.82
    },
    isLoading: false
  })
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

describe('Advanced Search Components', () => {
  describe('AdvancedSearchBar', () => {
    it('renders search input with placeholder', () => {
      const mockOnChange = vi.fn();
      const mockOnSearch = vi.fn();

      render(
        <TestWrapper>
          <AdvancedSearchBar
            value=""
            onChange={mockOnChange}
            onSearch={mockOnSearch}
            placeholder="Advanced search test..."
          />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('Advanced search test...');
      expect(input).toBeInTheDocument();
    });

    it('calls onChange when typing in search input', () => {
      const mockOnChange = vi.fn();
      const mockOnSearch = vi.fn();

      render(
        <TestWrapper>
          <AdvancedSearchBar
            value=""
            onChange={mockOnChange}
            onSearch={mockOnSearch}
          />
        </TestWrapper>
      );

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test query' } });

      expect(mockOnChange).toHaveBeenCalledWith('test query');
    });

    it('calls onSearch when Enter key is pressed', () => {
      const mockOnChange = vi.fn();
      const mockOnSearch = vi.fn();

      render(
        <TestWrapper>
          <AdvancedSearchBar
            value="test query"
            onChange={mockOnChange}
            onSearch={mockOnSearch}
          />
        </TestWrapper>
      );

      const input = screen.getByRole('textbox');
      fireEvent.keyDown(input, { key: 'Enter' });

      expect(mockOnSearch).toHaveBeenCalledWith('test query');
    });

    it('shows confidence threshold slider when enabled', () => {
      const mockOnChange = vi.fn();
      const mockOnSearch = vi.fn();
      const mockOnConfidenceChange = vi.fn();

      render(
        <TestWrapper>
          <AdvancedSearchBar
            value=""
            onChange={mockOnChange}
            onSearch={mockOnSearch}
            showConfidenceFilter={true}
            confidenceThreshold={0.7}
            onConfidenceChange={mockOnConfidenceChange}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Confidence:')).toBeInTheDocument();
      expect(screen.getByText('70%')).toBeInTheDocument();
    });

    it('shows search suggestions when focused and has query', async () => {
      const mockOnChange = vi.fn();
      const mockOnSearch = vi.fn();

      render(
        <TestWrapper>
          <AdvancedSearchBar
            value="tin"
            onChange={mockOnChange}
            onSearch={mockOnSearch}
            showSuggestions={true}
          />
        </TestWrapper>
      );

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      await waitFor(() => {
        expect(screen.getByText('Politicians')).toBeInTheDocument();
        expect(screen.getByText('Bola Tinubu')).toBeInTheDocument();
        expect(screen.getByText('Topics')).toBeInTheDocument();
        expect(screen.getByText('Economy')).toBeInTheDocument();
      });
    });

    it('handles suggestion click', async () => {
      const mockOnChange = vi.fn();
      const mockOnSearch = vi.fn();

      render(
        <TestWrapper>
          <AdvancedSearchBar
            value="tin"
            onChange={mockOnChange}
            onSearch={mockOnSearch}
            showSuggestions={true}
          />
        </TestWrapper>
      );

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      await waitFor(() => {
        const suggestion = screen.getByText('Bola Tinubu');
        fireEvent.click(suggestion);
      });

      expect(mockOnChange).toHaveBeenCalledWith('Bola Tinubu');
      expect(mockOnSearch).toHaveBeenCalledWith('Bola Tinubu');
    });
  });

  describe('SearchAnalytics', () => {
    const mockSearchResults = [
      {
        politician: {
          id: 'pol1',
          name: 'Test Politician',
          dataQuality: { confidence: 0.85, completeness: 0.90 }
        },
        relevanceScore: 0.78
      }
    ];

    const mockSearchMetadata = {
      processingTime: 150,
      totalDimensions: 3,
      confidenceDistribution: {
        'High (>0.8)': 45,
        'Medium (0.5-0.8)': 35,
        'Low (<0.5)': 20
      },
      dataQualityScore: 0.82
    };

    it('renders search analytics with key metrics', () => {
      render(
        <TestWrapper>
          <SearchAnalytics
            searchResults={mockSearchResults}
            searchMetadata={mockSearchMetadata}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Search Analytics')).toBeInTheDocument();
      expect(screen.getByText('25.00')).toBeInTheDocument(); // Total results
      expect(screen.getByText('78%')).toBeInTheDocument(); // Avg relevance
      expect(screen.getAllByText('82%')).toHaveLength(2); // Quality score appears twice
    });

    it('displays dimension coverage bars', () => {
      render(
        <TestWrapper>
          <SearchAnalytics
            searchResults={mockSearchResults}
            searchMetadata={mockSearchMetadata}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Dimension Coverage')).toBeInTheDocument();
      expect(screen.getByText('Geographic')).toBeInTheDocument();
      expect(screen.getByText('Demographic')).toBeInTheDocument();
      expect(screen.getByText('Sentiment')).toBeInTheDocument();
    });

    it('shows confidence distribution', () => {
      render(
        <TestWrapper>
          <SearchAnalytics
            searchResults={mockSearchResults}
            searchMetadata={mockSearchMetadata}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Confidence Distribution')).toBeInTheDocument();
      expect(screen.getByText('High Confidence')).toBeInTheDocument();
      expect(screen.getByText('Medium Confidence')).toBeInTheDocument();
      expect(screen.getByText('Low Confidence')).toBeInTheDocument();
    });

    it('displays data quality insights', () => {
      render(
        <TestWrapper>
          <SearchAnalytics
            searchResults={mockSearchResults}
            searchMetadata={mockSearchMetadata}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Data Quality Insights')).toBeInTheDocument();
      expect(screen.getByText('Overall Quality')).toBeInTheDocument();
      expect(screen.getByText('Active Dimensions')).toBeInTheDocument();
      expect(screen.getByText('Processing Time')).toBeInTheDocument();
      expect(screen.getByText('150ms')).toBeInTheDocument();
    });

    it('shows search tips', () => {
      render(
        <TestWrapper>
          <SearchAnalytics
            searchResults={mockSearchResults}
            searchMetadata={mockSearchMetadata}
          />
        </TestWrapper>
      );

      expect(screen.getByText('Search Tips:')).toBeInTheDocument();
      expect(screen.getByText(/Use specific terms for better relevance/)).toBeInTheDocument();
      expect(screen.getByText(/Enable enhanced filters/)).toBeInTheDocument();
    });

    it('handles empty search results gracefully', () => {
      render(
        <TestWrapper>
          <SearchAnalytics
            searchResults={[]}
            searchMetadata={undefined}
          />
        </TestWrapper>
      );

      // Should show loading state or handle empty state
      expect(screen.getByText('Search Analytics')).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    it('advanced search bar and analytics work together', async () => {
      const mockOnChange = vi.fn();
      const mockOnSearch = vi.fn();

      render(
        <TestWrapper>
          <div>
            <AdvancedSearchBar
              value="test"
              onChange={mockOnChange}
              onSearch={mockOnSearch}
              showSuggestions={true}
              showConfidenceFilter={true}
            />
            <SearchAnalytics
              searchResults={[]}
              searchMetadata={{
                processingTime: 100,
                totalDimensions: 2,
                confidenceDistribution: {},
                dataQualityScore: 0.75
              }}
            />
          </div>
        </TestWrapper>
      );

      expect(screen.getByRole('textbox')).toBeInTheDocument();
      expect(screen.getByText('Search Analytics')).toBeInTheDocument();
      expect(screen.getByText('Confidence:')).toBeInTheDocument();
    });
  });
});