import {
    ArrowLeftIcon,
    ArrowRightIcon,
    PlayIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useState } from 'react';

interface TourStep {
  id: string;
  title: string;
  content: React.ReactNode;
  target?: string; // CSS selector for element to highlight
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: () => void; // Optional action to perform when step is shown
  validation?: () => boolean; // Optional validation before proceeding
  skippable?: boolean;
}

interface GuidedTourProps {
  tourId: string;
  title: string;
  description: string;
  steps: TourStep[];
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
  autoStart?: boolean;
  showProgress?: boolean;
  allowSkip?: boolean;
  className?: string;
}

const GuidedTour: React.FC<GuidedTourProps> = ({
  tourId,
  title,
  description,
  steps,
  isActive,
  onComplete,
  onSkip,
  autoStart = false,
  showProgress = true,
  allowSkip = true,
  className = ''
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(autoStart);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  // Calculate tooltip position based on target element
  const calculateTooltipPosition = useCallback((target: HTMLElement, position: string = 'top') => {
    const rect = target.getBoundingClientRect();
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;

    switch (position) {
      case 'top':
        return {
          x: rect.left + scrollX + rect.width / 2,
          y: rect.top + scrollY - 10
        };
      case 'bottom':
        return {
          x: rect.left + scrollX + rect.width / 2,
          y: rect.bottom + scrollY + 10
        };
      case 'left':
        return {
          x: rect.left + scrollX - 10,
          y: rect.top + scrollY + rect.height / 2
        };
      case 'right':
        return {
          x: rect.right + scrollX + 10,
          y: rect.top + scrollY + rect.height / 2
        };
      default:
        return {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2
        };
    }
  }, []);

  // Highlight target element and position tooltip
  useEffect(() => {
    if (!isActive || !isStarted || !currentStep) return;

    // Remove previous highlight
    if (highlightedElement) {
      highlightedElement.classList.remove('tour-highlight');
      highlightedElement.style.removeProperty('z-index');
      highlightedElement.style.removeProperty('position');
    }

    // Add new highlight
    if (currentStep.target) {
      const element = document.querySelector(currentStep.target) as HTMLElement;
      if (element) {
        element.classList.add('tour-highlight');
        element.style.position = 'relative';
        element.style.zIndex = '1001';
        setHighlightedElement(element);

        // Calculate tooltip position
        const position = calculateTooltipPosition(element, currentStep.position);
        setTooltipPosition(position);

        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      setHighlightedElement(null);
      setTooltipPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    }

    // Execute step action
    if (currentStep.action) {
      currentStep.action();
    }
  }, [currentStepIndex, isActive, isStarted, currentStep, calculateTooltipPosition, highlightedElement]);

  // Cleanup on unmount or tour end
  useEffect(() => {
    return () => {
      if (highlightedElement) {
        highlightedElement.classList.remove('tour-highlight');
        highlightedElement.style.removeProperty('z-index');
        highlightedElement.style.removeProperty('position');
      }
    };
  }, [highlightedElement]);

  const startTour = () => {
    setIsStarted(true);
    setCurrentStepIndex(0);
  };

  const nextStep = () => {
    if (currentStep.validation && !currentStep.validation()) {
      return; // Don't proceed if validation fails
    }

    if (isLastStep) {
      completeTour();
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const previousStep = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const skipTour = () => {
    setIsStarted(false);
    onSkip();
  };

  const completeTour = () => {
    setIsStarted(false);
    onComplete();
  };

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStepIndex(stepIndex);
    }
  };

  if (!isActive) return null;

  // Tour start screen
  if (!isStarted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <PlayIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Tour Progress</span>
              <span>{steps.length} steps</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full w-0"></div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={startTour}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              Start Tour
            </button>
            {allowSkip && (
              <button
                onClick={skipTour}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 focus:outline-none"
              >
                Skip
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Tour overlay and tooltip
  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-40 z-50" />

      {/* Tooltip */}
      <div
        className={`fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 max-w-sm w-full ${className}`}
        style={{
          left: `${tooltipPosition.x}px`,
          top: `${tooltipPosition.y}px`,
          transform: currentStep.position === 'center' ? 'translate(-50%, -50%)' : 
                     currentStep.position === 'top' ? 'translate(-50%, -100%)' :
                     currentStep.position === 'bottom' ? 'translate(-50%, 0)' :
                     currentStep.position === 'left' ? 'translate(-100%, -50%)' :
                     currentStep.position === 'right' ? 'translate(0, -50%)' :
                     'translate(-50%, -100%)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold">
              {currentStepIndex + 1}
            </div>
            <h3 className="font-semibold text-gray-900">{currentStep.title}</h3>
          </div>
          
          <button
            onClick={skipTour}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="text-gray-700 mb-4">
            {currentStep.content}
          </div>

          {/* Progress bar */}
          {showProgress && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{currentStepIndex + 1} of {steps.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Step indicators */}
          <div className="flex justify-center space-x-1 mb-4">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => goToStep(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStepIndex ? 'bg-blue-600' :
                  index < currentStepIndex ? 'bg-blue-300' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-gray-200">
          <button
            onClick={previousStep}
            disabled={isFirstStep}
            className={`flex items-center space-x-1 px-3 py-1 text-sm font-medium rounded-md transition-colors ${
              isFirstStep 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <div className="flex space-x-2">
            {allowSkip && currentStep.skippable !== false && (
              <button
                onClick={skipTour}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                Skip Tour
              </button>
            )}
            
            <button
              onClick={nextStep}
              className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
            >
              <span>{isLastStep ? 'Complete' : 'Next'}</span>
              {!isLastStep && <ArrowRightIcon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Arrow pointer */}
        {currentStep.target && currentStep.position !== 'center' && (
          <div
            className={`absolute w-0 h-0 border-8 ${
              currentStep.position === 'top' ? 'top-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-white' :
              currentStep.position === 'bottom' ? 'bottom-full left-1/2 transform -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-white' :
              currentStep.position === 'left' ? 'left-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-white' :
              currentStep.position === 'right' ? 'right-full top-1/2 transform -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-white' :
              ''
            }`}
          />
        )}
      </div>

      {/* CSS for highlighting */}
      <style jsx global>{`
        .tour-highlight {
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.2) !important;
          border-radius: 4px !important;
        }
      `}</style>
    </>
  );
};

// Specialized tour components for different analysis pages
export const GeographicAnalysisTour: React.FC<{
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}> = ({ isActive, onComplete, onSkip }) => {
  const steps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Geographic Analysis',
      position: 'center',
      content: (
        <div className="space-y-3">
          <p>This tour will guide you through analyzing political sentiment across Nigeria's administrative hierarchy.</p>
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>What you'll learn:</strong> How to navigate from national overview to polling unit details, 
              interpret choropleth maps, and compare regional patterns.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'choropleth-map',
      title: 'Nigeria Choropleth Map',
      target: '.nigeria-map, [data-tour="choropleth-map"]',
      position: 'bottom',
      content: (
        <div className="space-y-2">
          <p>This color-coded map shows sentiment intensity across Nigerian states.</p>
          <ul className="text-sm space-y-1">
            <li>🟢 <strong>Green:</strong> Positive sentiment</li>
            <li>🔴 <strong>Red:</strong> Negative sentiment</li>
            <li>⚪ <strong>Gray:</strong> Neutral or insufficient data</li>
          </ul>
          <p className="text-sm text-gray-600">Click on any state to drill down to LGA level.</p>
        </div>
      )
    },
    {
      id: 'view-controls',
      title: 'View Controls',
      target: '[data-tour="view-controls"]',
      position: 'bottom',
      content: (
        <div className="space-y-2">
          <p>Switch between different visualization types:</p>
          <ul className="text-sm space-y-1">
            <li><strong>Choropleth:</strong> Color-coded map view</li>
            <li><strong>Treemap:</strong> Hierarchical data visualization</li>
            <li><strong>Comparison:</strong> Regional side-by-side analysis</li>
            <li><strong>Timeline:</strong> Sentiment trends over time</li>
          </ul>
        </div>
      )
    },
    {
      id: 'state-selector',
      title: 'State Selection',
      target: '[data-tour="state-selector"]',
      position: 'bottom',
      content: (
        <div className="space-y-2">
          <p>Use this dropdown to focus on specific states and drill down to LGA level.</p>
          <div className="bg-yellow-50 p-2 rounded text-sm text-yellow-800">
            <strong>Tip:</strong> Start with states showing extreme sentiment values for interesting insights.
          </div>
        </div>
      )
    },
    {
      id: 'breadcrumb-navigation',
      title: 'Breadcrumb Navigation',
      target: '[data-tour="breadcrumb"]',
      position: 'bottom',
      content: (
        <div className="space-y-2">
          <p>Track your current location in the administrative hierarchy.</p>
          <p className="text-sm text-gray-600">
            Click on any level (Nigeria → State → LGA → Ward) to navigate back up.
          </p>
        </div>
      )
    },
    {
      id: 'data-quality',
      title: 'Data Quality Indicators',
      target: '[data-tour="data-quality"]',
      position: 'top',
      content: (
        <div className="space-y-2">
          <p>Always check data point counts and confidence scores before drawing conclusions.</p>
          <div className="bg-green-50 p-2 rounded text-sm text-green-800">
            <strong>Best Practice:</strong> Higher data point counts provide more reliable insights.
          </div>
        </div>
      )
    }
  ];

  return (
    <GuidedTour
      tourId="geographic-analysis"
      title="Geographic Analysis Tour"
      description="Learn to analyze political sentiment across Nigeria's administrative levels"
      steps={steps}
      isActive={isActive}
      onComplete={onComplete}
      onSkip={onSkip}
      showProgress={true}
      allowSkip={true}
    />
  );
};

export const DemographicAnalysisTour: React.FC<{
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}> = ({ isActive, onComplete, onSkip }) => {
  const steps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Demographic Analysis',
      position: 'center',
      content: (
        <div className="space-y-3">
          <p>Discover how different demographic groups respond to political messages.</p>
          <div className="bg-purple-50 p-3 rounded-lg">
            <p className="text-sm text-purple-800">
              <strong>Privacy First:</strong> All demographic analysis respects user privacy and consent preferences.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'demographic-matrix',
      title: 'Demographic Sentiment Matrix',
      target: '[data-tour="demographic-matrix"]',
      position: 'bottom',
      content: (
        <div className="space-y-2">
          <p>This matrix shows sentiment patterns across demographic intersections.</p>
          <ul className="text-sm space-y-1">
            <li><strong>Rows:</strong> Age groups or education levels</li>
            <li><strong>Columns:</strong> Occupation sectors or gender</li>
            <li><strong>Colors:</strong> Sentiment intensity</li>
          </ul>
        </div>
      )
    },
    {
      id: 'confidence-scores',
      title: 'Confidence Scores',
      target: '[data-tour="confidence-indicator"]',
      position: 'top',
      content: (
        <div className="space-y-2">
          <p>Demographic classifications include confidence scores indicating reliability.</p>
          <div className="space-y-1 text-sm">
            <div>🟢 <strong>High (80%+):</strong> Very reliable classification</div>
            <div>🟡 <strong>Medium (60-80%):</strong> Moderately reliable</div>
            <div>🔴 <strong>Low (&lt;60%):</strong> Use with caution</div>
          </div>
        </div>
      )
    },
    {
      id: 'privacy-controls',
      title: 'Privacy Controls',
      target: '[data-tour="privacy-controls"]',
      position: 'left',
      content: (
        <div className="space-y-2">
          <p>Users can control their demographic data visibility and opt-out at any time.</p>
          <div className="bg-red-50 p-2 rounded text-sm text-red-800">
            <strong>Important:</strong> Always respect privacy settings and consent preferences.
          </div>
        </div>
      )
    }
  ];

  return (
    <GuidedTour
      tourId="demographic-analysis"
      title="Demographic Analysis Tour"
      description="Learn privacy-first demographic sentiment analysis"
      steps={steps}
      isActive={isActive}
      onComplete={onComplete}
      onSkip={onSkip}
      showProgress={true}
      allowSkip={true}
    />
  );
};

export const SentimentAnalysisTour: React.FC<{
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}> = ({ isActive, onComplete, onSkip }) => {
  const steps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Advanced Sentiment Analysis',
      position: 'center',
      content: (
        <div className="space-y-3">
          <p>Explore multi-layered sentiment analysis beyond simple positive/negative classification.</p>
          <div className="bg-indigo-50 p-3 rounded-lg">
            <p className="text-sm text-indigo-800">
              <strong>Multi-Dimensional:</strong> Polarity, emotions, intensity, and complexity analysis.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'emotion-wheel',
      title: 'Emotion Detection Wheel',
      target: '[data-tour="emotion-wheel"]',
      position: 'bottom',
      content: (
        <div className="space-y-2">
          <p>This wheel shows the emotional composition of sentiment beyond polarity.</p>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div>😊 Joy</div>
            <div>😠 Anger</div>
            <div>😨 Fear</div>
            <div>😢 Sadness</div>
            <div>🤢 Disgust</div>
            <div>🤔 Mixed</div>
          </div>
        </div>
      )
    },
    {
      id: 'intensity-scale',
      title: 'Intensity Scaling',
      target: '[data-tour="intensity-scale"]',
      position: 'top',
      content: (
        <div className="space-y-2">
          <p>Sentiment intensity indicates the strength of emotional expression.</p>
          <div className="space-y-1 text-sm">
            <div><strong>Mild (0.1-0.4):</strong> Subtle sentiment</div>
            <div><strong>Moderate (0.4-0.7):</strong> Clear sentiment</div>
            <div><strong>Strong (0.7-1.0):</strong> Intense sentiment</div>
          </div>
        </div>
      )
    },
    {
      id: 'model-agreement',
      title: 'Model Agreement Scores',
      target: '[data-tour="model-agreement"]',
      position: 'left',
      content: (
        <div className="space-y-2">
          <p>Multiple AI models analyze each piece of content. High agreement indicates reliable classification.</p>
          <div className="bg-orange-50 p-2 rounded text-sm text-orange-800">
            <strong>Tip:</strong> Low agreement scores may indicate sarcasm or complex sentiment.
          </div>
        </div>
      )
    }
  ];

  return (
    <GuidedTour
      tourId="sentiment-analysis"
      title="Sentiment Analysis Tour"
      description="Master advanced multi-layered sentiment analysis"
      steps={steps}
      isActive={isActive}
      onComplete={onComplete}
      onSkip={onSkip}
      showProgress={true}
      allowSkip={true}
    />
  );
};

export default GuidedTour;