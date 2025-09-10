import {
    AcademicCapIcon,
    CheckCircleIcon,
    LightBulbIcon,
    PlayIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';

interface TutorialScenario {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  objectives: string[];
  steps: TutorialStep[];
  realWorldContext: string;
  keyInsights: string[];
}

interface TutorialStep {
  id: string;
  title: string;
  instruction: string;
  expectedAction: string;
  hints?: string[];
  validation?: () => boolean;
  feedback: {
    success: string;
    error?: string;
    tips?: string[];
  };
  demoData?: any;
}

interface InteractiveTutorialProps {
  scenario: TutorialScenario;
  isActive: boolean;
  onComplete: (results: TutorialResults) => void;
  onExit: () => void;
  className?: string;
}

interface TutorialResults {
  scenarioId: string;
  completedSteps: string[];
  timeSpent: number;
  hintsUsed: number;
  insights: string[];
}

const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  scenario,
  isActive,
  onComplete,
  onExit,
  className = ''
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [startTime] = useState(Date.now());
  const [stepStartTime, setStepStartTime] = useState(Date.now());
  const [userInsights, setUserInsights] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentStep = scenario.steps[currentStepIndex];
  const isLastStep = currentStepIndex === scenario.steps.length - 1;
  const progress = ((completedSteps.size) / scenario.steps.length) * 100;

  const nextStep = () => {
    if (currentStep.validation && !currentStep.validation()) {
      return;
    }

    const newCompleted = new Set(completedSteps);
    newCompleted.add(currentStep.id);
    setCompletedSteps(newCompleted);

    if (isLastStep) {
      completeTutorial();
    } else {
      setCurrentStepIndex(prev => prev + 1);
      setStepStartTime(Date.now());
      setShowHints(false);
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setStepStartTime(Date.now());
      setShowHints(false);
    }
  };

  const useHint = () => {
    setShowHints(true);
    setHintsUsed(prev => prev + 1);
  };

  const addInsight = (insight: string) => {
    setUserInsights(prev => [...prev, insight]);
  };

  const completeTutorial = () => {
    const results: TutorialResults = {
      scenarioId: scenario.id,
      completedSteps: Array.from(completedSteps),
      timeSpent: Date.now() - startTime,
      hintsUsed,
      insights: [...userInsights, ...scenario.keyInsights]
    };
    
    setIsCompleted(true);
    onComplete(results);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isActive) return null;

  // Tutorial completion screen
  if (isCompleted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 p-6">
          <div className="text-center mb-6">
            <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Tutorial Completed!</h2>
            <p className="text-gray-600">
              You've successfully completed the "{scenario.title}" scenario.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((Date.now() - startTime) / 60000)}m
              </div>
              <div className="text-sm text-blue-800">Time Spent</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {completedSteps.size}/{scenario.steps.length}
              </div>
              <div className="text-sm text-green-800">Steps Completed</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {scenario.keyInsights.length}
              </div>
              <div className="text-sm text-purple-800">Key Insights</div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Key Insights from this Tutorial:</h3>
            <ul className="space-y-2">
              {scenario.keyInsights.map((insight, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <LightBulbIcon className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-center">
            <button
              onClick={onExit}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              Continue to Analysis
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <AcademicCapIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{scenario.title}</h2>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(scenario.difficulty)}`}>
                  {scenario.difficulty.charAt(0).toUpperCase() + scenario.difficulty.slice(1)}
                </span>
                <span className="text-sm text-gray-600">~{scenario.estimatedTime}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={onExit}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{completedSteps.size} of {scenario.steps.length} steps</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Instructions */}
          <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
            <div className="space-y-4">
              {/* Current Step */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold">
                    {currentStepIndex + 1}
                  </div>
                  <h3 className="font-semibold text-gray-900">{currentStep.title}</h3>
                </div>
                
                <p className="text-gray-700 mb-3">{currentStep.instruction}</p>
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-1">Expected Action:</h4>
                  <p className="text-sm text-blue-800">{currentStep.expectedAction}</p>
                </div>
              </div>

              {/* Hints */}
              {currentStep.hints && currentStep.hints.length > 0 && (
                <div>
                  {!showHints ? (
                    <button
                      onClick={useHint}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      💡 Need a hint? ({hintsUsed} used)
                    </button>
                  ) : (
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <h4 className="font-medium text-yellow-900 mb-2">💡 Hints:</h4>
                      <ul className="space-y-1">
                        {currentStep.hints.map((hint, index) => (
                          <li key={index} className="text-sm text-yellow-800">
                            • {hint}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Real-world Context */}
              <div className="bg-green-50 p-3 rounded-lg">
                <h4 className="font-medium text-green-900 mb-1">Real-World Context:</h4>
                <p className="text-sm text-green-800">{scenario.realWorldContext}</p>
              </div>

              {/* Objectives */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Learning Objectives:</h4>
                <ul className="space-y-1">
                  {scenario.objectives.map((objective, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Right Panel - Interactive Demo */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="h-full bg-gray-50 rounded-lg p-4 flex items-center justify-center">
              <div className="text-center">
                <PlayIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Demo Area</h3>
                <p className="text-gray-600 mb-4">
                  This area would contain the actual analysis interface for hands-on practice.
                </p>
                <div className="bg-white p-4 rounded-lg border border-gray-200 max-w-md mx-auto">
                  <h4 className="font-medium text-gray-900 mb-2">Demo Data Preview:</h4>
                  <div className="text-left space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Lagos State Sentiment:</span>
                      <span className="text-green-600 font-medium">+0.65</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data Points:</span>
                      <span className="font-medium">15,432</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confidence:</span>
                      <span className="text-blue-600 font-medium">87%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={previousStep}
            disabled={currentStepIndex === 0}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              currentStepIndex === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
            }`}
          >
            Previous Step
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">
              Step {currentStepIndex + 1} of {scenario.steps.length}
            </span>
          </div>

          <button
            onClick={nextStep}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
          >
            {isLastStep ? 'Complete Tutorial' : 'Next Step'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Predefined tutorial scenarios
export const tutorialScenarios: Record<string, TutorialScenario> = {
  'geographic-analysis-basics': {
    id: 'geographic-analysis-basics',
    title: 'Geographic Analysis: Lagos State Deep Dive',
    description: 'Learn to analyze political sentiment from state to polling unit level using Lagos as a case study.',
    difficulty: 'beginner',
    estimatedTime: '10 minutes',
    objectives: [
      'Navigate from state to LGA to ward level analysis',
      'Interpret choropleth map color coding',
      'Understand confidence scores and data quality',
      'Compare urban vs rural sentiment patterns'
    ],
    realWorldContext: 'Lagos State is Nigeria\'s economic hub with diverse demographics. Understanding sentiment patterns here helps predict national trends and identify key voter segments.',
    keyInsights: [
      'Urban areas often show different sentiment patterns than rural areas',
      'Higher data point counts provide more reliable insights',
      'Confidence scores help validate geographic classifications',
      'Administrative boundaries can affect sentiment aggregation'
    ],
    steps: [
      {
        id: 'state-overview',
        title: 'State Overview Analysis',
        instruction: 'Start by examining the Lagos State overview on the choropleth map.',
        expectedAction: 'Click on Lagos State to view detailed sentiment data',
        hints: [
          'Look for the green-colored state in the South West region',
          'Check the data point count for statistical significance',
          'Note the confidence score for this classification'
        ],
        feedback: {
          success: 'Great! Lagos shows positive sentiment with high confidence.',
          tips: ['Always check data quality before drawing conclusions']
        }
      },
      {
        id: 'lga-breakdown',
        title: 'LGA-Level Analysis',
        instruction: 'Drill down to examine Local Government Area patterns within Lagos.',
        expectedAction: 'Select Lagos from the state dropdown and view LGA breakdown',
        hints: [
          'Use the state selector dropdown',
          'Look for variations between mainland and island LGAs',
          'Compare urban centers like Ikeja with residential areas'
        ],
        feedback: {
          success: 'Excellent! You can see sentiment varies across Lagos LGAs.',
          tips: ['Urban-rural differences often reveal important insights']
        }
      },
      {
        id: 'ward-analysis',
        title: 'Ward-Level Deep Dive',
        instruction: 'Select an LGA to examine ward-level sentiment patterns.',
        expectedAction: 'Choose an LGA and analyze ward-level data',
        hints: [
          'Try selecting Ikeja or Surulere LGA',
          'Look for wards with extreme sentiment values',
          'Check polling unit counts per ward'
        ],
        feedback: {
          success: 'Perfect! Ward-level analysis reveals local political dynamics.',
          tips: ['Consider population density when interpreting ward data']
        }
      },
      {
        id: 'data-validation',
        title: 'Data Quality Assessment',
        instruction: 'Evaluate the reliability of your findings using confidence indicators.',
        expectedAction: 'Review confidence scores and data point counts',
        hints: [
          'Look for confidence percentage indicators',
          'Check sample sizes for statistical validity',
          'Note any "undefined" classifications'
        ],
        feedback: {
          success: 'Well done! Data quality assessment is crucial for reliable analysis.',
          tips: ['Low confidence scores suggest uncertain classifications']
        }
      }
    ]
  },

  'demographic-sentiment-correlation': {
    id: 'demographic-sentiment-correlation',
    title: 'Demographic Sentiment Analysis: Youth vs Seniors',
    description: 'Explore how different age groups respond to political messages using privacy-first analysis.',
    difficulty: 'intermediate',
    estimatedTime: '15 minutes',
    objectives: [
      'Compare sentiment across age demographics',
      'Understand confidence scores in demographic inference',
      'Identify generational political differences',
      'Respect privacy controls and consent'
    ],
    realWorldContext: 'Nigerian politics shows significant generational divides. Youth (18-35) often have different priorities than older voters, affecting electoral outcomes and policy preferences.',
    keyInsights: [
      'Generational differences reflect different life experiences and priorities',
      'Digital engagement varies significantly by age group',
      'Privacy protection is essential in demographic analysis',
      'Cross-demographic validation strengthens findings'
    ],
    steps: [
      {
        id: 'age-matrix',
        title: 'Age Group Sentiment Matrix',
        instruction: 'Examine the demographic sentiment matrix focusing on age groups.',
        expectedAction: 'Navigate to demographic analysis and view age-based sentiment',
        feedback: {
          success: 'Good! You can see clear differences between age groups.',
          tips: ['Look for consistent patterns across multiple politicians']
        }
      },
      {
        id: 'confidence-validation',
        title: 'Validate Demographic Confidence',
        instruction: 'Check confidence scores for age group classifications.',
        expectedAction: 'Review confidence indicators for demographic inferences',
        feedback: {
          success: 'Excellent! Always validate demographic classifications.',
          tips: ['Low confidence suggests uncertain age inference']
        }
      },
      {
        id: 'cross-reference',
        title: 'Cross-Reference with Topics',
        instruction: 'Compare age group sentiment across different political topics.',
        expectedAction: 'Filter by topics to see age-specific responses',
        feedback: {
          success: 'Great insight! Different topics resonate differently by age.',
          tips: ['Economic issues often show strong generational patterns']
        }
      }
    ]
  },

  'advanced-sentiment-complexity': {
    id: 'advanced-sentiment-complexity',
    title: 'Advanced Sentiment: Detecting Sarcasm and Mixed Emotions',
    description: 'Master complex sentiment analysis including sarcasm detection and mixed emotional responses.',
    difficulty: 'advanced',
    estimatedTime: '20 minutes',
    objectives: [
      'Identify sarcastic and ironic content',
      'Analyze mixed emotional responses',
      'Understand model agreement scores',
      'Handle sentiment complexity in analysis'
    ],
    realWorldContext: 'Nigerian political discourse often includes sarcasm, irony, and complex emotional expressions. Advanced sentiment analysis helps capture these nuances for more accurate insights.',
    keyInsights: [
      'Sarcasm detection requires cultural and contextual understanding',
      'Mixed emotions are common in political discourse',
      'Low model agreement often indicates complex sentiment',
      'Human validation is valuable for ambiguous cases'
    ],
    steps: [
      {
        id: 'complexity-identification',
        title: 'Identify Complex Sentiment',
        instruction: 'Find examples of sarcastic or mixed sentiment in the data.',
        expectedAction: 'Look for content with complexity flags or low model agreement',
        feedback: {
          success: 'Well spotted! Complex sentiment requires careful interpretation.',
          tips: ['Context clues help identify sarcasm and irony']
        }
      },
      {
        id: 'model-agreement',
        title: 'Analyze Model Agreement',
        instruction: 'Examine cases where AI models disagree on sentiment classification.',
        expectedAction: 'Review model agreement scores and consensus indicators',
        feedback: {
          success: 'Excellent! Low agreement suggests complex or ambiguous content.',
          tips: ['Multiple models provide more reliable classification']
        }
      },
      {
        id: 'emotion-layers',
        title: 'Multi-Emotion Analysis',
        instruction: 'Analyze content showing multiple simultaneous emotions.',
        expectedAction: 'Examine emotion wheel data for mixed emotional responses',
        feedback: {
          success: 'Perfect! Political content often evokes multiple emotions.',
          tips: ['Mixed emotions reflect complex political relationships']
        }
      }
    ]
  }
};

// Tutorial launcher component
export const TutorialLauncher: React.FC<{
  availableScenarios: string[];
  onLaunchTutorial: (scenarioId: string) => void;
  className?: string;
}> = ({ availableScenarios, onLaunchTutorial, className = '' }) => {
  const [selectedScenario, setSelectedScenario] = useState<string>('');

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-3 mb-3">
        <AcademicCapIcon className="h-6 w-6 text-blue-600" />
        <h3 className="font-semibold text-blue-900">Interactive Tutorials</h3>
      </div>
      
      <p className="text-sm text-blue-800 mb-4">
        Learn through hands-on scenarios with real-world political analysis examples.
      </p>

      <div className="space-y-3">
        {availableScenarios.map(scenarioId => {
          const scenario = tutorialScenarios[scenarioId];
          if (!scenario) return null;

          return (
            <div
              key={scenarioId}
              className="bg-white border border-blue-200 rounded-lg p-3 cursor-pointer hover:bg-blue-50 transition-colors"
              onClick={() => setSelectedScenario(scenarioId)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{scenario.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{scenario.description}</p>
                  <div className="flex items-center space-x-3 mt-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(scenario.difficulty)}`}>
                      {scenario.difficulty}
                    </span>
                    <span className="text-xs text-gray-500">~{scenario.estimatedTime}</span>
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onLaunchTutorial(scenarioId);
                  }}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Start
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner': return 'text-green-600 bg-green-100';
    case 'intermediate': return 'text-yellow-600 bg-yellow-100';
    case 'advanced': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export default InteractiveTutorial;