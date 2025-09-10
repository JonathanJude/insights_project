import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import PoliticianCard from '../components/ui/PoliticianCard';
import type { EnhancedPoliticianData } from '../lib/enhancedMockDataService';
import type { Politician } from '../types';

// Mock politician data
const mockPolitician: Politician = {
  id: 'politician_1',
  name: 'Bola Tinubu',
  party: 'APC',
  position: 'Presidential Candidate',
  state: 'Lagos',
  sentiment: 0.65,
  recentSentiment: {
    score: 0.65,
    mentionCount: 15420,
    changePercentage: 8.5,
    trend: 'up'
  },
  socialMediaHandles: {
    twitter: 'officialABAT'
  }
};

// Mock enhanced data
const mockEnhancedData: Partial<EnhancedPoliticianData> = {
  id: 'politician_1',
  name: 'Bola Tinubu',
  party: 'APC',
  position: 'Presidential Candidate',
  state: 'Lagos',
  sentiment: 0.65,
  geographic: {
    country: { code: 'NG', name: 'Nigeria', confidence: 0.95 },
    state: { code: 'LA', name: 'Lagos', confidence: 0.88, isUndefined: false },
    lga: { code: 'IKJ', name: 'Ikeja', confidence: 0.75, isUndefined: false },
    ward: { number: 5, name: 'Ward 5', confidence: 0.65, isUndefined: false },
    pollingUnit: { code: 'PU001', name: 'Polling Unit 001', confidence: 0.55, isUndefined: false }
  },
  demographic: {
    education: { level: 'Tertiary', confidence: 0.82 },
    occupation: { sector: 'Public Sector', confidence: 0.90 },
    ageGroup: { range: '56-65', confidence: 0.95 },
    gender: { classification: 'Male', confidence: 0.98 }
  },
  enhancedSentiment: {
    polarity: { classification: 'Positive', score: 0.65, confidence: 0.85 },
    emotions: {
      primary: 'Joy',
      scores: { joy: 0.7, anger: 0.1, fear: 0.05, sadness: 0.05, disgust: 0.1 },
      confidence: 0.78
    },
    intensity: { level: 'Moderate', score: 0.65, description: 'Moderately positive sentiment' },
    complexity: { type: 'Simple', confidence: 0.85, indicators: [] },
    modelAgreement: { score: 0.82, models: ['model1', 'model2'], consensus: true }
  },
  topics: {
    policyAreas: { primary: 'Economy', secondary: ['Infrastructure'], confidence: 0.85 },
    campaignIssues: { issues: ['Fuel Subsidy', 'Minimum Wage'], relevance: {}, confidence: 0.75 },
    eventDriven: { events: [], temporal: false, urgency: 'Low', confidence: 0.5 }
  },
  engagement: {
    level: 'High',
    metrics: { shares: 25000, comments: 8500, reach: 150000, impressions: 500000 },
    virality: { score: 0.85, velocity: 12.5, isViral: true },
    quality: { authenticity: 0.88, relevance: 0.92, constructiveness: 0.75 },
    influencerAmplification: { hasInfluencers: true, influencerCount: 15, totalFollowers: 2500000 }
  }
} as EnhancedPoliticianData;

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

describe('Enhanced PoliticianCard', () => {
  it('renders basic politician information', () => {
    render(
      <TestWrapper>
        <PoliticianCard politician={mockPolitician} />
      </TestWrapper>
    );

    expect(screen.getByText('Bola Tinubu')).toBeInTheDocument();
    expect(screen.getByText('Presidential Candidate')).toBeInTheDocument();
    expect(screen.getByText('Lagos')).toBeInTheDocument();
  });

  it('shows enhanced data when showEnhanced is true', () => {
    render(
      <TestWrapper>
        <PoliticianCard 
          politician={mockPolitician} 
          enhancedData={mockEnhancedData}
          showEnhanced={true}
        />
      </TestWrapper>
    );

    // Check for enhanced geographic context
    expect(screen.getByText('Ikeja')).toBeInTheDocument();
    
    // Check for demographic highlights
    expect(screen.getByText('Age: 56-65')).toBeInTheDocument();
    expect(screen.getByText('Tertiary')).toBeInTheDocument();
    
    // Check for enhanced sentiment indicators
    expect(screen.getByText('Joy')).toBeInTheDocument();
    expect(screen.getByText(/High/)).toBeInTheDocument();
    
    // Check for topic highlights
    expect(screen.getByText('Economy')).toBeInTheDocument();
    expect(screen.getByText('Fuel Subsidy')).toBeInTheDocument();
  });

  it('does not show enhanced data when showEnhanced is false', () => {
    render(
      <TestWrapper>
        <PoliticianCard 
          politician={mockPolitician} 
          enhancedData={mockEnhancedData}
          showEnhanced={false}
        />
      </TestWrapper>
    );

    // Enhanced data should not be visible
    expect(screen.queryByText('Ikeja')).not.toBeInTheDocument();
    expect(screen.queryByText('Age: 56-65')).not.toBeInTheDocument();
    expect(screen.queryByText('Joy')).not.toBeInTheDocument();
  });

  it('handles undefined geographic data gracefully', () => {
    const enhancedDataWithUndefined = {
      ...mockEnhancedData,
      geographic: {
        ...mockEnhancedData.geographic!,
        state: { code: 'UND', name: 'Undefined', confidence: 0.0, isUndefined: true },
        lga: { code: 'UND', name: 'Undefined', confidence: 0.0, isUndefined: true }
      }
    };

    render(
      <TestWrapper>
        <PoliticianCard 
          politician={mockPolitician} 
          enhancedData={enhancedDataWithUndefined}
          showEnhanced={true}
        />
      </TestWrapper>
    );

    // Should not show undefined geographic data
    expect(screen.queryByText('Undefined')).not.toBeInTheDocument();
  });

  it('shows viral indicator for high engagement', () => {
    render(
      <TestWrapper>
        <PoliticianCard 
          politician={mockPolitician} 
          enhancedData={mockEnhancedData}
          showEnhanced={true}
        />
      </TestWrapper>
    );

    // Should show fire emoji for viral content
    expect(screen.getByText(/🔥/)).toBeInTheDocument();
  });

  it('displays confidence indicators for high-confidence data', () => {
    render(
      <TestWrapper>
        <PoliticianCard 
          politician={mockPolitician} 
          enhancedData={mockEnhancedData}
          showEnhanced={true}
        />
      </TestWrapper>
    );

    // Should show confidence indicator (green dot) for high confidence location data
    const confidenceIndicator = screen.getByTitle('High confidence location data');
    expect(confidenceIndicator).toBeInTheDocument();
  });

  it('renders appropriate emotion emoji', () => {
    render(
      <TestWrapper>
        <PoliticianCard 
          politician={mockPolitician} 
          enhancedData={mockEnhancedData}
          showEnhanced={true}
        />
      </TestWrapper>
    );

    // Should show joy emoji for Joy emotion
    expect(screen.getByText('😊')).toBeInTheDocument();
  });

  it('maintains existing functionality when enhanced data is not provided', () => {
    render(
      <TestWrapper>
        <PoliticianCard 
          politician={mockPolitician} 
          showEnhanced={true}
        />
      </TestWrapper>
    );

    // Basic information should still be displayed
    expect(screen.getByText('Bola Tinubu')).toBeInTheDocument();
    expect(screen.getByText('Presidential Candidate')).toBeInTheDocument();
    
    // Enhanced sections should not crash the component
    expect(screen.queryByText('Joy')).not.toBeInTheDocument();
  });
});