import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ExportModal from '../components/ui/ExportModal';
import MultiDimensionalExportButton from '../components/ui/MultiDimensionalExportButton';
import ShareModal from '../components/ui/ShareModal';
import type { EnhancedPoliticianData } from '../lib/enhancedMockDataService';
import { MultiDimensionalExporter } from '../lib/multiDimensionalExportUtils';
import { EnhancedShareableLinkGenerator } from '../lib/shareableLinkUtils';

// Mock the enhanced mock data service
vi.mock('../lib/enhancedMockDataService', () => ({
  EnhancedMockDataService: {
    getEnhancedPoliticianData: vi.fn()
  }
}));

// Mock the export utilities
vi.mock('../lib/multiDimensionalExportUtils', () => ({
  MultiDimensionalExporter: vi.fn().mockImplementation(() => ({
    exportData: vi.fn().mockResolvedValue(undefined),
    exportChartAsImage: vi.fn().mockResolvedValue(undefined)
  })),
  createMultiDimensionalExporter: vi.fn().mockImplementation(() => ({
    exportData: vi.fn().mockResolvedValue(undefined),
    exportChartAsImage: vi.fn().mockResolvedValue(undefined)
  }))
}));

// Mock the shareable link utilities
vi.mock('../lib/shareableLinkUtils', () => ({
  EnhancedShareableLinkGenerator: {
    generateShareableLink: vi.fn().mockReturnValue('https://example.com/share/abc123'),
    copyToClipboard: vi.fn().mockResolvedValue(undefined),
    generateShortLink: vi.fn().mockResolvedValue('https://example.com/s/abc123'),
    generateQRCode: vi.fn().mockReturnValue('data:image/png;base64,mock-qr-code')
  },
  generateShareableLink: vi.fn().mockReturnValue('https://example.com/share/abc123'),
  copyShareableLink: vi.fn().mockResolvedValue(undefined)
}));

// Mock the filter store
vi.mock('../stores/filterStore', () => ({
  useFilterStore: vi.fn().mockReturnValue({
    searchTerm: '',
    selectedParties: [],
    sentimentFilter: 'all',
    dateRange: 'all'
  })
}));

// Mock enhanced politician data
const mockEnhancedData: EnhancedPoliticianData[] = [
  {
    id: 'pol_1',
    name: 'Test Politician 1',
    party: 'APC',
    position: 'Governor',
    state: 'Lagos',
    sentiment: 0.65,
    geographic: {
      country: { code: 'NG', name: 'Nigeria', confidence: 0.95 },
      state: { code: 'LA', name: 'Lagos', confidence: 0.90, isUndefined: false },
      lga: { code: 'SUR', name: 'Surulere', confidence: 0.85, isUndefined: false },
      ward: { number: 1, name: 'Ward 1', confidence: 0.80, isUndefined: false },
      pollingUnit: { code: 'PU001', name: 'Polling Unit 001', confidence: 0.75, isUndefined: false }
    },
    demographic: {
      education: { level: 'Tertiary', confidence: 0.85 },
      occupation: { sector: 'Public Sector', confidence: 0.90 },
      ageGroup: { range: '45-55', confidence: 0.80 },
      gender: { classification: 'Male', confidence: 0.95 }
    },
    enhancedSentiment: {
      polarity: { classification: 'Positive', score: 0.65, confidence: 0.88 },
      emotions: {
        primary: 'Joy',
        scores: { joy: 0.70, anger: 0.15, fear: 0.10, sadness: 0.05, disgust: 0.00 },
        confidence: 0.85
      },
      intensity: { level: 'Moderate', score: 0.65, description: 'Moderately positive' },
      complexity: { type: 'Simple', confidence: 0.90, indicators: [] },
      modelAgreement: { score: 0.88, models: ['model1', 'model2'], consensus: true }
    },
    topics: {
      policyAreas: ['Economy', 'Infrastructure'],
      campaignIssues: ['Job Creation', 'Road Construction'],
      eventDriven: ['Rally', 'Town Hall'],
      trending: { score: 0.75, topics: ['Economic Development'] }
    },
    engagement: {
      level: 'High',
      virality: { score: 0.80, threshold: 0.70 },
      quality: { score: 0.85, factors: ['authenticity', 'relevance'] },
      influencerAmplification: { detected: true, count: 5 }
    },
    temporal: {
      daily: { peakHours: ['8:00 PM', '9:00 PM'], pattern: 'evening' },
      weekly: { activeDays: ['Sunday', 'Wednesday'], pattern: 'weekend-heavy' },
      electionCycle: { currentPhase: 'Pre-Election', daysToElection: 120 }
    },
    insights: {
      primaryStrengths: ['Strong economic message', 'High engagement'],
      keyWeaknesses: ['Limited rural reach'],
      demographicAppeal: { 'Young Adults': 0.75, 'Professionals': 0.80 },
      geographicStronghold: ['Lagos', 'Ogun'],
      trendingTopics: ['Economic Development', 'Infrastructure']
    },
    dataQuality: {
      completeness: 0.92,
      confidence: 0.85,
      lastUpdated: new Date('2024-01-15'),
      sources: ['social_media', 'news_articles']
    }
  }
];

describe('Multi-Dimensional Export Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('MultiDimensionalExportButton', () => {
    it('renders export button with data count', () => {
      render(
        <MultiDimensionalExportButton
          data={mockEnhancedData}
          view="analysis"
        />
      );

      expect(screen.getByText('Export (1)')).toBeInTheDocument();
    });

    it('shows dropdown when export button is clicked', async () => {
      render(
        <MultiDimensionalExportButton
          data={mockEnhancedData}
          view="analysis"
        />
      );

      const exportButton = screen.getByText('Export (1)');
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(screen.getByText('Multi-Dimensional Export')).toBeInTheDocument();
        expect(screen.getByText('CSV Data')).toBeInTheDocument();
        expect(screen.getByText('JSON Export')).toBeInTheDocument();
        expect(screen.getByText('PDF Report')).toBeInTheDocument();
        expect(screen.getByText('Excel Workbook')).toBeInTheDocument();
      });
    });

    it('handles CSV export correctly', async () => {
      const mockExporter = {
        exportData: vi.fn().mockResolvedValue(undefined)
      };
      vi.mocked(MultiDimensionalExporter).mockImplementation(() => mockExporter as any);

      render(
        <MultiDimensionalExportButton
          data={mockEnhancedData}
          view="analysis"
        />
      );

      const exportButton = screen.getByText('Export (1)');
      fireEvent.click(exportButton);

      await waitFor(() => {
        const csvButton = screen.getByText('CSV Data');
        fireEvent.click(csvButton);
      });

      await waitFor(() => {
        expect(mockExporter.exportData).toHaveBeenCalledWith('csv');
      });
    });

    it('handles share functionality', async () => {
      render(
        <MultiDimensionalExportButton
          data={mockEnhancedData}
          view="analysis"
          showShareButton={true}
        />
      );

      const shareButton = screen.getByText('Share');
      fireEvent.click(shareButton);

      await waitFor(() => {
        expect(EnhancedShareableLinkGenerator.generateShareableLink).toHaveBeenCalled();
      });
    });

    it('disables export when no data is provided', () => {
      render(
        <MultiDimensionalExportButton
          data={[]}
          view="analysis"
        />
      );

      const exportButton = screen.getByRole('button', { name: /export/i });
      expect(exportButton).toBeDisabled();
    });
  });

  describe('ExportModal', () => {
    it('renders export modal with format options', () => {
      render(
        <ExportModal
          isOpen={true}
          onClose={vi.fn()}
          data={mockEnhancedData}
          title="Test Export"
        />
      );

      expect(screen.getByText('Test Export')).toBeInTheDocument();
      expect(screen.getByText('Export Format')).toBeInTheDocument();
      expect(screen.getByText('CSV Data')).toBeInTheDocument();
      expect(screen.getByText('JSON Export')).toBeInTheDocument();
      expect(screen.getByText('PDF Report')).toBeInTheDocument();
    });

    it('shows export options section', () => {
      render(
        <ExportModal
          isOpen={true}
          onClose={vi.fn()}
          data={mockEnhancedData}
        />
      );

      expect(screen.getByText('Export Options')).toBeInTheDocument();
      expect(screen.getByText('Include metadata')).toBeInTheDocument();
      expect(screen.getByText('Include data quality scores')).toBeInTheDocument();
      expect(screen.getByText('Include confidence scores')).toBeInTheDocument();
    });

    it('shows dimension selection options', () => {
      render(
        <ExportModal
          isOpen={true}
          onClose={vi.fn()}
          data={mockEnhancedData}
        />
      );

      expect(screen.getByText('Include Dimensions')).toBeInTheDocument();
      expect(screen.getByText('Geographic Analysis')).toBeInTheDocument();
      expect(screen.getByText('Demographic Insights')).toBeInTheDocument();
      expect(screen.getByText('Sentiment Analysis')).toBeInTheDocument();
      expect(screen.getByText('Topic Classification')).toBeInTheDocument();
      expect(screen.getByText('Engagement Metrics')).toBeInTheDocument();
      expect(screen.getByText('Temporal Patterns')).toBeInTheDocument();
    });

    it('handles export button click', async () => {
      const mockOnClose = vi.fn();
      const mockExporter = {
        exportData: vi.fn().mockResolvedValue(undefined)
      };
      vi.mocked(MultiDimensionalExporter).mockImplementation(() => mockExporter as any);

      render(
        <ExportModal
          isOpen={true}
          onClose={mockOnClose}
          data={mockEnhancedData}
        />
      );

      const exportButton = screen.getByText(/Export CSV Data/);
      fireEvent.click(exportButton);

      await waitFor(() => {
        expect(mockExporter.exportData).toHaveBeenCalledWith('csv');
      });
    });
  });

  describe('ShareModal', () => {
    const mockShareableState = {
      filters: { searchTerm: 'test' },
      view: { page: 'analysis' },
      preferences: {
        showConfidenceScores: true,
        showDataQuality: true,
        showUndefinedData: true,
        chartTheme: 'auto' as const,
        compactMode: false
      }
    };

    it('renders share modal with options', () => {
      render(
        <ShareModal
          isOpen={true}
          onClose={vi.fn()}
          shareableState={mockShareableState}
          title="Test Share"
        />
      );

      expect(screen.getByText('Test Share')).toBeInTheDocument();
      expect(screen.getByText('Share Options')).toBeInTheDocument();
      expect(screen.getByText('Include filters')).toBeInTheDocument();
      expect(screen.getByText('Include preferences')).toBeInTheDocument();
      expect(screen.getByText('Include metadata')).toBeInTheDocument();
    });

    it('shows social media sharing options', () => {
      render(
        <ShareModal
          isOpen={true}
          onClose={vi.fn()}
          shareableState={mockShareableState}
        />
      );

      expect(screen.getByText('Share on Social Media')).toBeInTheDocument();
      expect(screen.getByText('Twitter')).toBeInTheDocument();
      expect(screen.getByText('Facebook')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
      expect(screen.getByText('WhatsApp')).toBeInTheDocument();
    });

    it('shows email sharing section', () => {
      render(
        <ShareModal
          isOpen={true}
          onClose={vi.fn()}
          shareableState={mockShareableState}
        />
      );

      expect(screen.getByText('Share via Email')).toBeInTheDocument();
      expect(screen.getByText('Recipient Email')).toBeInTheDocument();
      expect(screen.getByText('Subject (optional)')).toBeInTheDocument();
      expect(screen.getByText('Message (optional)')).toBeInTheDocument();
    });

    it('generates shareable link on mount', async () => {
      render(
        <ShareModal
          isOpen={true}
          onClose={vi.fn()}
          shareableState={mockShareableState}
        />
      );

      await waitFor(() => {
        expect(EnhancedShareableLinkGenerator.generateShareableLink).toHaveBeenCalled();
      });
    });
  });

  describe('Export Integration', () => {
    it('integrates export functionality with existing components', () => {
      // Test that export functionality can be integrated into existing components
      const TestComponent = () => (
        <div>
          <MultiDimensionalExportButton
            data={mockEnhancedData}
            view="politicians"
            showAdvancedExport={true}
            enableMultiDimensional={true}
          />
        </div>
      );

      render(<TestComponent />);
      
      expect(screen.getByText('Export (1)')).toBeInTheDocument();
      expect(screen.getByText('Share')).toBeInTheDocument();
    });

    it('handles empty data gracefully', () => {
      render(
        <MultiDimensionalExportButton
          data={[]}
          view="analysis"
        />
      );

      const exportButton = screen.getByRole('button', { name: /export/i });
      expect(exportButton).toBeDisabled();
    });

    it('shows progress during export operations', async () => {
      const mockExporter = {
        exportData: vi.fn().mockImplementation((format, progressCallback) => {
          // Simulate progress updates
          if (progressCallback) {
            progressCallback({ stage: 'preparing', progress: 0, message: 'Preparing...' });
            progressCallback({ stage: 'processing', progress: 50, message: 'Processing...' });
            progressCallback({ stage: 'complete', progress: 100, message: 'Complete!' });
          }
          return Promise.resolve();
        })
      };
      vi.mocked(MultiDimensionalExporter).mockImplementation(() => mockExporter as any);

      render(
        <MultiDimensionalExportButton
          data={mockEnhancedData}
          view="analysis"
        />
      );

      const exportButton = screen.getByText('Export (1)');
      fireEvent.click(exportButton);

      await waitFor(() => {
        const csvButton = screen.getByText('CSV Data');
        fireEvent.click(csvButton);
      });

      // Progress modal should appear
      await waitFor(() => {
        expect(screen.getByText('Exporting Multi-Dimensional Data')).toBeInTheDocument();
      });
    });
  });
});

describe('Export Utilities', () => {
  describe('MultiDimensionalExporter', () => {
    it('creates exporter with correct parameters', () => {
      const filters = { searchTerm: 'test' };
      const progressCallback = vi.fn();

      // This would normally create a real exporter, but we're mocking it
      const exporter = new MultiDimensionalExporter(mockEnhancedData, filters, progressCallback);
      
      expect(MultiDimensionalExporter).toHaveBeenCalledWith(mockEnhancedData, filters, progressCallback);
    });
  });

  describe('ShareableLinkGenerator', () => {
    it('generates shareable links with correct state', () => {
      const state = {
        filters: { searchTerm: 'test' },
        view: { page: 'analysis' }
      };

      EnhancedShareableLinkGenerator.generateShareableLink(state);
      
      expect(EnhancedShareableLinkGenerator.generateShareableLink).toHaveBeenCalledWith(state);
    });

    it('generates QR codes for links', () => {
      const link = 'https://example.com/share/abc123';
      
      const qrCode = EnhancedShareableLinkGenerator.generateQRCode(link);
      
      expect(qrCode).toBe('data:image/png;base64,mock-qr-code');
    });
  });
});