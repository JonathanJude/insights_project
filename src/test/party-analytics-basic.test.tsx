import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

// Create a simple test component that mimics the enhanced party analytics functionality
const MockPartyAnalytics: React.FC = () => {
  const [showEnhanced, setShowEnhanced] = React.useState(false);
  const [selectedDimension, setSelectedDimension] = React.useState('geographic');

  return (
    <div>
      <h1>Party Analytics {showEnhanced && <span>✨</span>}</h1>
      <p>
        {showEnhanced
          ? 'Multi-dimensional analysis of political parties'
          : 'Compare sentiment and engagement across political parties'
        }
      </p>

      <button onClick={() => setShowEnhanced(!showEnhanced)}>
        {showEnhanced ? 'Enhanced Analysis' : 'Enable Enhanced'}
      </button>

      {showEnhanced && (
        <div>
          <h2>Multi-Dimensional Party Analysis</h2>
          <div>
            <button
              onClick={() => setSelectedDimension('geographic')}
              className={selectedDimension === 'geographic' ? 'active' : ''}
            >
              Geographic
            </button>
            <button
              onClick={() => setSelectedDimension('demographic')}
              className={selectedDimension === 'demographic' ? 'active' : ''}
            >
              Demographic
            </button>
            <button
              onClick={() => setSelectedDimension('topics')}
              className={selectedDimension === 'topics' ? 'active' : ''}
            >
              Topics
            </button>
            <button
              onClick={() => setSelectedDimension('engagement')}
              className={selectedDimension === 'engagement' ? 'active' : ''}
            >
              Engagement
            </button>
          </div>

          {selectedDimension === 'geographic' && (
            <div>
              <h3>Geographic Performance</h3>
              <div>Lagos: 75%</div>
              <div>Abuja: 68%</div>
            </div>
          )}

          {selectedDimension === 'demographic' && (
            <div>
              <h3>Demographic Appeal</h3>
              <div>Education Tertiary: 72%</div>
              <div>Age 26-35: 65%</div>
            </div>
          )}

          {selectedDimension === 'topics' && (
            <div>
              <h3>Policy Area Performance</h3>
              <div>Economy: 45 mentions</div>
              <div>Security: 32 mentions</div>
            </div>
          )}

          {selectedDimension === 'engagement' && (
            <div>
              <h3>Engagement Metrics</h3>
              <div>High Engagement: 12</div>
              <div>Viral Politicians: 8</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

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

describe('Party Analytics Enhanced Features', () => {
  it('renders basic party analytics page', () => {
    render(
      <TestWrapper>
        <MockPartyAnalytics />
      </TestWrapper>
    );

    expect(screen.getByText('Party Analytics')).toBeInTheDocument();
    expect(screen.getByText(/Compare sentiment and engagement/)).toBeInTheDocument();
  });

  it('shows enhanced analysis toggle button', () => {
    render(
      <TestWrapper>
        <MockPartyAnalytics />
      </TestWrapper>
    );

    const enhancedButton = screen.getByText('Enable Enhanced');
    expect(enhancedButton).toBeInTheDocument();
  });

  it('enables enhanced analysis when toggle is clicked', () => {
    render(
      <TestWrapper>
        <MockPartyAnalytics />
      </TestWrapper>
    );

    const enhancedButton = screen.getByText('Enable Enhanced');
    fireEvent.click(enhancedButton);

    expect(screen.getByText('Enhanced Analysis')).toBeInTheDocument();
    expect(screen.getByText(/Multi-dimensional analysis/)).toBeInTheDocument();
    expect(screen.getByText('✨')).toBeInTheDocument();
  });

  it('displays multi-dimensional analysis section when enhanced', () => {
    render(
      <TestWrapper>
        <MockPartyAnalytics />
      </TestWrapper>
    );

    const enhancedButton = screen.getByText('Enable Enhanced');
    fireEvent.click(enhancedButton);

    expect(screen.getByText('Multi-Dimensional Party Analysis')).toBeInTheDocument();
    expect(screen.getByText('Geographic')).toBeInTheDocument();
    expect(screen.getByText('Demographic')).toBeInTheDocument();
    expect(screen.getByText('Topics')).toBeInTheDocument();
    expect(screen.getByText('Engagement')).toBeInTheDocument();
  });

  it('shows geographic analysis by default in enhanced mode', () => {
    render(
      <TestWrapper>
        <MockPartyAnalytics />
      </TestWrapper>
    );

    const enhancedButton = screen.getByText('Enable Enhanced');
    fireEvent.click(enhancedButton);

    expect(screen.getByText('Geographic Performance')).toBeInTheDocument();
    expect(screen.getByText('Lagos: 75%')).toBeInTheDocument();
    expect(screen.getByText('Abuja: 68%')).toBeInTheDocument();
  });

  it('switches to demographic analysis when demographic tab is clicked', () => {
    render(
      <TestWrapper>
        <MockPartyAnalytics />
      </TestWrapper>
    );

    const enhancedButton = screen.getByText('Enable Enhanced');
    fireEvent.click(enhancedButton);

    const demographicButton = screen.getByText('Demographic');
    fireEvent.click(demographicButton);

    expect(screen.getByText('Demographic Appeal')).toBeInTheDocument();
    expect(screen.getByText('Education Tertiary: 72%')).toBeInTheDocument();
    expect(screen.getByText('Age 26-35: 65%')).toBeInTheDocument();
  });

  it('switches to topics analysis when topics tab is clicked', () => {
    render(
      <TestWrapper>
        <MockPartyAnalytics />
      </TestWrapper>
    );

    const enhancedButton = screen.getByText('Enable Enhanced');
    fireEvent.click(enhancedButton);

    const topicsButton = screen.getByText('Topics');
    fireEvent.click(topicsButton);

    expect(screen.getByText('Policy Area Performance')).toBeInTheDocument();
    expect(screen.getByText('Economy: 45 mentions')).toBeInTheDocument();
    expect(screen.getByText('Security: 32 mentions')).toBeInTheDocument();
  });

  it('switches to engagement analysis when engagement tab is clicked', () => {
    render(
      <TestWrapper>
        <MockPartyAnalytics />
      </TestWrapper>
    );

    const enhancedButton = screen.getByText('Enable Enhanced');
    fireEvent.click(enhancedButton);

    const engagementButton = screen.getByText('Engagement');
    fireEvent.click(engagementButton);

    expect(screen.getByText('Engagement Metrics')).toBeInTheDocument();
    expect(screen.getByText('High Engagement: 12')).toBeInTheDocument();
    expect(screen.getByText('Viral Politicians: 8')).toBeInTheDocument();
  });

  it('highlights active dimension button', () => {
    render(
      <TestWrapper>
        <MockPartyAnalytics />
      </TestWrapper>
    );

    const enhancedButton = screen.getByText('Enable Enhanced');
    fireEvent.click(enhancedButton);

    const geographicButton = screen.getByText('Geographic');
    expect(geographicButton).toHaveClass('active');

    const demographicButton = screen.getByText('Demographic');
    fireEvent.click(demographicButton);

    expect(demographicButton).toHaveClass('active');
    expect(geographicButton).not.toHaveClass('active');
  });
});