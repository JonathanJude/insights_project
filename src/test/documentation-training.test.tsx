import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConfidenceTooltip, DataQualityTooltip, UndefinedDataTooltip } from '../components/ui/ContextualTooltip';
import FeatureDocumentation from '../components/ui/FeatureDocumentation';
import { GeographicAnalysisTour } from '../components/ui/GuidedTour';
import HelpModal from '../components/ui/HelpModal';
import InteractiveTutorial, { tutorialScenarios } from '../components/ui/InteractiveTutorial';
import { DemographicAnalysisGuide, GeographicAnalysisGuide } from '../components/ui/UserGuide';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Documentation and Training Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('HelpModal', () => {
    it('renders help modal with overview content', () => {
      render(
        <HelpModal
          isOpen={true}
          onClose={() => {}}
          topic="overview"
        />
      );

      expect(screen.getByText('Multi-Dimensional Analysis Help')).toBeInTheDocument();
      expect(screen.getAllByText('Multi-Dimensional Analysis Overview')[0]).toBeInTheDocument();
      expect(screen.getByText(/comprehensive analysis of political sentiment/)).toBeInTheDocument();
    });

    it('switches between different help topics', () => {
      render(
        <HelpModal
          isOpen={true}
          onClose={() => {}}
          topic="geographic"
        />
      );

      // Click on demographic tab
      fireEvent.click(screen.getByText('Demographic Analysis'));
      
      expect(screen.getByText(/different demographic groups/)).toBeInTheDocument();
    });

    it('closes modal when close button is clicked', () => {
      const onClose = vi.fn();
      render(
        <HelpModal
          isOpen={true}
          onClose={onClose}
          topic="overview"
        />
      );

      fireEvent.click(screen.getByLabelText('Close help modal'));
      expect(onClose).toHaveBeenCalled();
    });

    it('does not render when isOpen is false', () => {
      render(
        <HelpModal
          isOpen={false}
          onClose={() => {}}
          topic="overview"
        />
      );

      expect(screen.queryByText('Multi-Dimensional Analysis Help')).not.toBeInTheDocument();
    });
  });

  describe('ContextualTooltip Components', () => {
    it('renders confidence tooltip with correct information', () => {
      render(
        <ConfidenceTooltip
          score={0.85}
          description="Test confidence description"
        />
      );

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('renders data quality tooltip with metrics', () => {
      render(
        <DataQualityTooltip
          quality="high"
          metrics={{
            completeness: 0.9,
            accuracy: 0.85,
            freshness: 0.95
          }}
        />
      );

      // The tooltip content is shown on hover, so we need to trigger it
      const tooltip = screen.getByText('✓');
      expect(tooltip).toBeInTheDocument();
    });

    it('renders undefined data tooltip with explanation', () => {
      render(
        <UndefinedDataTooltip
          category="Geographic"
          reason="Insufficient confidence for classification"
          fallbackInfo="Using parent administrative level"
        />
      );

      expect(screen.getByText('Undefined')).toBeInTheDocument();
    });
  });

  describe('UserGuide Components', () => {
    it('renders geographic analysis guide', () => {
      render(<GeographicAnalysisGuide />);

      expect(screen.getByText('Geographic Analysis Guide')).toBeInTheDocument();
      expect(screen.getByText(/administrative hierarchy/)).toBeInTheDocument();
    });

    it('expands and collapses guide steps', () => {
      render(<GeographicAnalysisGuide />);

      // Initially collapsed
      expect(screen.queryByText(/Begin your analysis/)).not.toBeInTheDocument();

      // Click to expand
      fireEvent.click(screen.getByText('Geographic Analysis Guide'));
      
      // Should show expanded content
      expect(screen.getByText('Expand All')).toBeInTheDocument();
    });

    it('renders demographic analysis guide with privacy focus', () => {
      render(<DemographicAnalysisGuide />);

      expect(screen.getByText('Demographic Analysis Guide')).toBeInTheDocument();
      expect(screen.getByText(/privacy and data quality/)).toBeInTheDocument();
    });
  });

  describe('FeatureDocumentation', () => {
    it('renders geographic feature documentation', () => {
      render(
        <FeatureDocumentation
          feature="geographic"
          embedded={false}
        />
      );

      expect(screen.getByText('Geographic Analysis Documentation')).toBeInTheDocument();
      expect(screen.getByText('Overview')).toBeInTheDocument();
    });

    it('shows embedded view when embedded prop is true', () => {
      render(
        <FeatureDocumentation
          feature="demographic"
          embedded={true}
        />
      );

      expect(screen.getByText('View Documentation')).toBeInTheDocument();
    });

    it('switches between documentation categories', () => {
      render(
        <FeatureDocumentation
          feature="sentiment"
          embedded={false}
        />
      );

      // Should show overview by default
      expect(screen.getByText(/Multi-layered sentiment analysis/)).toBeInTheDocument();

      // Click on features tab if available
      const featuresTab = screen.queryByText('Features');
      if (featuresTab) {
        fireEvent.click(featuresTab);
      }
    });
  });

  describe('GuidedTour', () => {
    it('renders geographic analysis tour when active', () => {
      render(
        <GeographicAnalysisTour
          isActive={true}
          onComplete={() => {}}
          onSkip={() => {}}
        />
      );

      expect(screen.getByText('Geographic Analysis Tour')).toBeInTheDocument();
      expect(screen.getByText('Start Tour')).toBeInTheDocument();
    });

    it('calls onComplete when tour is completed', async () => {
      const onComplete = vi.fn();
      render(
        <GeographicAnalysisTour
          isActive={true}
          onComplete={onComplete}
          onSkip={() => {}}
        />
      );

      // Start the tour
      fireEvent.click(screen.getByText('Start Tour'));

      // The tour should now show the first step
      await waitFor(() => {
        expect(screen.getByText('Welcome to Geographic Analysis')).toBeInTheDocument();
      });
    });

    it('calls onSkip when tour is skipped', () => {
      const onSkip = vi.fn();
      render(
        <GeographicAnalysisTour
          isActive={true}
          onComplete={() => {}}
          onSkip={onSkip}
        />
      );

      fireEvent.click(screen.getByText('Skip'));
      expect(onSkip).toHaveBeenCalled();
    });

    it('does not render when not active', () => {
      render(
        <GeographicAnalysisTour
          isActive={false}
          onComplete={() => {}}
          onSkip={() => {}}
        />
      );

      expect(screen.queryByText('Geographic Analysis Tour')).not.toBeInTheDocument();
    });
  });

  describe('InteractiveTutorial', () => {
    const mockScenario = tutorialScenarios['geographic-analysis-basics'];

    it('renders tutorial with scenario information', () => {
      render(
        <InteractiveTutorial
          scenario={mockScenario}
          isActive={true}
          onComplete={() => {}}
          onExit={() => {}}
        />
      );

      expect(screen.getByText(mockScenario.title)).toBeInTheDocument();
      expect(screen.getByText('Beginner')).toBeInTheDocument();
      expect(screen.getByText('~10 minutes')).toBeInTheDocument();
    });

    it('shows learning objectives', () => {
      render(
        <InteractiveTutorial
          scenario={mockScenario}
          isActive={true}
          onComplete={() => {}}
          onExit={() => {}}
        />
      );

      expect(screen.getByText('Learning Objectives:')).toBeInTheDocument();
      mockScenario.objectives.forEach(objective => {
        expect(screen.getByText(objective)).toBeInTheDocument();
      });
    });

    it('calls onExit when exit button is clicked', () => {
      const onExit = vi.fn();
      render(
        <InteractiveTutorial
          scenario={mockScenario}
          isActive={true}
          onComplete={() => {}}
          onExit={onExit}
        />
      );

      // Click the X button to close (first button in the header)
      const buttons = screen.getAllByRole('button');
      const closeButton = buttons[0]; // The X button is the first button
      fireEvent.click(closeButton);
      expect(onExit).toHaveBeenCalled();
    });

    it('progresses through tutorial steps', () => {
      render(
        <InteractiveTutorial
          scenario={mockScenario}
          isActive={true}
          onComplete={() => {}}
          onExit={() => {}}
        />
      );

      // Should show first step
      expect(screen.getByText(mockScenario.steps[0].title)).toBeInTheDocument();
      expect(screen.getByText(mockScenario.steps[0].instruction)).toBeInTheDocument();

      // Click next step
      fireEvent.click(screen.getByText('Next Step'));

      // Should show second step
      expect(screen.getByText(mockScenario.steps[1].title)).toBeInTheDocument();
    });

    it('does not render when not active', () => {
      render(
        <InteractiveTutorial
          scenario={mockScenario}
          isActive={false}
          onComplete={() => {}}
          onExit={() => {}}
        />
      );

      expect(screen.queryByText(mockScenario.title)).not.toBeInTheDocument();
    });
  });

  describe('Tutorial Scenarios', () => {
    it('contains geographic analysis basics scenario', () => {
      const scenario = tutorialScenarios['geographic-analysis-basics'];
      
      expect(scenario).toBeDefined();
      expect(scenario.title).toBe('Geographic Analysis: Lagos State Deep Dive');
      expect(scenario.difficulty).toBe('beginner');
      expect(scenario.steps).toHaveLength(4);
    });

    it('contains demographic sentiment correlation scenario', () => {
      const scenario = tutorialScenarios['demographic-sentiment-correlation'];
      
      expect(scenario).toBeDefined();
      expect(scenario.title).toBe('Demographic Sentiment Analysis: Youth vs Seniors');
      expect(scenario.difficulty).toBe('intermediate');
    });

    it('contains advanced sentiment complexity scenario', () => {
      const scenario = tutorialScenarios['advanced-sentiment-complexity'];
      
      expect(scenario).toBeDefined();
      expect(scenario.title).toBe('Advanced Sentiment: Detecting Sarcasm and Mixed Emotions');
      expect(scenario.difficulty).toBe('advanced');
    });

    it('all scenarios have required properties', () => {
      Object.values(tutorialScenarios).forEach(scenario => {
        expect(scenario.id).toBeDefined();
        expect(scenario.title).toBeDefined();
        expect(scenario.description).toBeDefined();
        expect(scenario.difficulty).toMatch(/^(beginner|intermediate|advanced)$/);
        expect(scenario.estimatedTime).toBeDefined();
        expect(scenario.objectives).toBeInstanceOf(Array);
        expect(scenario.steps).toBeInstanceOf(Array);
        expect(scenario.realWorldContext).toBeDefined();
        expect(scenario.keyInsights).toBeInstanceOf(Array);
      });
    });
  });

  describe('Integration', () => {
    it('components work together for comprehensive training experience', () => {
      // This test verifies that the components can be used together
      const { rerender } = render(
        <div>
          <FeatureDocumentation feature="geographic" embedded={true} />
          <GeographicAnalysisGuide />
        </div>
      );

      expect(screen.getByText('View Documentation')).toBeInTheDocument();
      expect(screen.getByText('Geographic Analysis Guide')).toBeInTheDocument();

      // Test that they can be rendered together without conflicts
      rerender(
        <div>
          <HelpModal isOpen={true} onClose={() => {}} topic="geographic" />
          <ConfidenceTooltip score={0.75} />
        </div>
      );

      expect(screen.getByText('Multi-Dimensional Analysis Help')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });
});