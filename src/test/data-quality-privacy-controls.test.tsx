import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ConfidenceIndicator from '../components/ui/ConfidenceIndicator';
import ConsentIndicator from '../components/ui/ConsentIndicator';
import DataReliabilityIndicator from '../components/ui/DataReliabilityIndicator';
import PrivacyDashboard from '../components/ui/PrivacyDashboard';
import PrivacySettingsModal from '../components/ui/PrivacySettingsModal';

// Mock the hooks
vi.mock('../hooks/usePrivacyControls', () => ({
  default: () => ({
    privacySettings: {
      demographicConsent: false,
      geographicPrecision: 'state',
      dataMinimization: true,
      anonymization: true,
      crossBorderTransfer: false,
      auditLogging: true
    },
    consentStatus: {
      demographic: false,
      geographic: true,
      sentiment: true,
      crossBorder: false
    },
    auditLog: [
      {
        timestamp: '2024-01-01T00:00:00Z',
        action: 'consent_granted',
        dataType: 'geographic',
        purpose: 'User granted consent for geographic data processing',
        legalBasis: 'NDPR Article 7 - Consent'
      }
    ],
    isLoading: false,
    updatePrivacySettings: vi.fn(),
    updateConsentStatus: vi.fn(),
    exportUserData: vi.fn(),
    deleteUserData: vi.fn(),
    getDataRetentionPeriod: vi.fn(() => 30)
  })
}));

describe('Privacy Controls', () => {
  describe('PrivacySettingsModal', () => {
    const mockSettings = {
      demographicConsent: false,
      geographicPrecision: 'state' as const,
      dataMinimization: true,
      anonymization: true,
      crossBorderTransfer: false,
      auditLogging: true
    };

    it('renders privacy settings modal correctly', () => {
      render(
        <PrivacySettingsModal
          isOpen={true}
          onClose={vi.fn()}
          settings={mockSettings}
          onSettingsChange={vi.fn()}
        />
      );

      expect(screen.getByText('Privacy Settings')).toBeInTheDocument();
      expect(screen.getByText('Demographic Data Processing')).toBeInTheDocument();
      expect(screen.getByText('Geographic Data Precision')).toBeInTheDocument();
    });

    it('handles settings changes correctly', () => {
      const onSettingsChange = vi.fn();
      render(
        <PrivacySettingsModal
          isOpen={true}
          onClose={vi.fn()}
          settings={mockSettings}
          onSettingsChange={onSettingsChange}
        />
      );

      const saveButton = screen.getByText('Save Settings');
      fireEvent.click(saveButton);

      expect(onSettingsChange).toHaveBeenCalled();
    });
  });

  describe('ConsentIndicator', () => {
    const mockConsentStatus = {
      demographic: false,
      geographic: true,
      sentiment: true,
      crossBorder: false
    };

    it('renders consent status correctly', () => {
      render(
        <ConsentIndicator
          consentStatus={mockConsentStatus}
          showDetails={true}
        />
      );

      expect(screen.getByText('Data Usage Consent')).toBeInTheDocument();
      expect(screen.getByText('Partial Consent')).toBeInTheDocument();
    });

    it('handles consent changes', () => {
      const onConsentChange = vi.fn();
      render(
        <ConsentIndicator
          consentStatus={mockConsentStatus}
          onConsentChange={onConsentChange}
          showDetails={true}
        />
      );

      const grantButtons = screen.getAllByText('Grant');
      if (grantButtons.length > 0) {
        fireEvent.click(grantButtons[0]);
        expect(onConsentChange).toHaveBeenCalled();
      }
    });
  });

  describe('PrivacyDashboard', () => {
    it('renders privacy dashboard correctly', () => {
      render(<PrivacyDashboard />);

      expect(screen.getByText('Privacy Dashboard')).toBeInTheDocument();
      expect(screen.getByText(/Privacy Score:/)).toBeInTheDocument();
    });
  });
});

describe('Data Quality Components', () => {
  describe('ConfidenceIndicator', () => {
    it('renders high confidence correctly', () => {
      render(
        <ConfidenceIndicator
          confidence={0.95}
          dataType="Geographic"
          variant="badge"
        />
      );

      expect(screen.getByText('95%')).toBeInTheDocument();
    });

    it('renders low confidence correctly', () => {
      render(
        <ConfidenceIndicator
          confidence={0.25}
          dataType="Demographic"
          variant="badge"
        />
      );

      expect(screen.getByText('25%')).toBeInTheDocument();
    });

    it('renders undefined data correctly', () => {
      render(
        <ConfidenceIndicator
          confidence={0}
          undefinedData={true}
          variant="badge"
        />
      );

      expect(screen.getByText('Undefined')).toBeInTheDocument();
    });

    it('renders detailed variant with model agreement', () => {
      render(
        <ConfidenceIndicator
          confidence={0.82}
          dataType="Sentiment Analysis"
          variant="detailed"
          modelAgreement={0.89}
          showTooltip={true}
        />
      );

      expect(screen.getByText('Sentiment Analysis Quality')).toBeInTheDocument();
      expect(screen.getByText('82%')).toBeInTheDocument();
      expect(screen.getByText('Agreement: 89%')).toBeInTheDocument();
    });
  });

  describe('DataReliabilityIndicator', () => {
    const mockMetrics = {
      totalRecords: 12500,
      definedRecords: 10653,
      undefinedRecords: 1847,
      averageConfidence: 0.73,
      dataCompleteness: 85.2,
      lastUpdated: '2024-01-01T00:00:00Z',
      sources: ['Social Media API', 'News Aggregator']
    };

    it('renders reliability metrics correctly', () => {
      render(
        <DataReliabilityIndicator
          metrics={mockMetrics}
          dataType="Geographic"
          showDetails={true}
        />
      );

      expect(screen.getByText('Geographic Data Reliability')).toBeInTheDocument();
      expect(screen.getByText('12,500')).toBeInTheDocument();
      expect(screen.getAllByText('85.2%')[0]).toBeInTheDocument();
    });

    it('handles undefined data toggle', () => {
      const onUndefinedToggle = vi.fn();
      render(
        <DataReliabilityIndicator
          metrics={mockMetrics}
          dataType="Geographic"
          showUndefinedToggle={true}
          onUndefinedToggle={onUndefinedToggle}
          includeUndefined={true}
        />
      );

      const toggle = screen.getByRole('button');
      fireEvent.click(toggle);
      expect(onUndefinedToggle).toHaveBeenCalledWith(false);
    });
  });
});

describe('Integration Tests', () => {
  it('privacy controls work together correctly', async () => {
    render(<PrivacyDashboard />);

    // Check that privacy dashboard renders
    expect(screen.getByText('Privacy Dashboard')).toBeInTheDocument();

    // Check that consent indicator is present
    expect(screen.getByText('Data Usage Consent')).toBeInTheDocument();

    // Test privacy settings modal opening
    const settingsButton = screen.getByText('Privacy Settings');
    fireEvent.click(settingsButton);

    await waitFor(() => {
      expect(screen.getByText('Data Privacy & Compliance')).toBeInTheDocument();
    });
  });

  it('data quality indicators display correctly', () => {
    const mockMetrics = {
      totalRecords: 1000,
      definedRecords: 850,
      undefinedRecords: 150,
      averageConfidence: 0.8,
      dataCompleteness: 85,
      lastUpdated: '2024-01-01T00:00:00Z',
      sources: ['Test Source']
    };

    render(
      <div>
        <ConfidenceIndicator confidence={0.85} variant="badge" />
        <DataReliabilityIndicator metrics={mockMetrics} dataType="Test" />
      </div>
    );

    expect(screen.getAllByText('85%')[0]).toBeInTheDocument();
    expect(screen.getByText('Test Data Reliability')).toBeInTheDocument();
  });
});