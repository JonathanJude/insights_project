import React, { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useTrainingSystem from '../../hooks/useTrainingSystem';
import FeatureDocumentation from './FeatureDocumentation';
import {
    DemographicAnalysisTour,
    GeographicAnalysisTour,
    SentimentAnalysisTour
} from './GuidedTour';
import HelpModal from './HelpModal';
import InteractiveTutorial, { TutorialLauncher, tutorialScenarios } from './InteractiveTutorial';

interface TrainingSystemContextType {
  startTour: (tourId: string) => void;
  startTutorial: (tutorialId: string) => void;
  showHelp: (topic?: string) => void;
  isFeatureNew: (feature: string) => boolean;
  shouldShowOnboarding: (feature: string) => boolean;
  getRecommendedNextSteps: () => string[];
}

const TrainingSystemContext = createContext<TrainingSystemContextType | null>(null);

export const useTrainingSystemContext = () => {
  const context = useContext(TrainingSystemContext);
  if (!context) {
    throw new Error('useTrainingSystemContext must be used within TrainingSystemProvider');
  }
  return context;
};

interface TrainingSystemProviderProps {
  children: React.ReactNode;
}

const TrainingSystemProvider: React.FC<TrainingSystemProviderProps> = ({ children }) => {
  const location = useLocation();
  const {
    progress,
    activeTour,
    activeTutorial,
    showHelpModal,
    helpModalTopic,
    startTour,
    completeTour,
    skipTour,
    startTutorial,
    completeTutorial,
    exitTutorial,
    showHelp,
    hideHelp,
    shouldShowOnboarding,
    getRecommendedNextSteps,
    isFeatureNew
  } = useTrainingSystem();

  // Auto-start tours for new features based on route
  useEffect(() => {
    if (!progress.preferences.autoStartTours) return;

    const path = location.pathname;
    let tourId: string | null = null;

    if (path.includes('/analysis/geographic') && shouldShowOnboarding('geographic')) {
      tourId = 'geographic-analysis';
    } else if (path.includes('/analysis/demographic') && shouldShowOnboarding('demographic')) {
      tourId = 'demographic-analysis';
    } else if (path.includes('/analysis/sentiment') && shouldShowOnboarding('sentiment')) {
      tourId = 'sentiment-analysis';
    }

    if (tourId && !activeTour && !activeTutorial) {
      // Small delay to ensure page is loaded
      const timer = setTimeout(() => startTour(tourId!), 1000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, progress.preferences.autoStartTours, shouldShowOnboarding, activeTour, activeTutorial, startTour]);

  const contextValue: TrainingSystemContextType = {
    startTour,
    startTutorial,
    showHelp,
    isFeatureNew,
    shouldShowOnboarding,
    getRecommendedNextSteps
  };

  return (
    <TrainingSystemContext.Provider value={contextValue}>
      {children}

      {/* Guided Tours */}
      <GeographicAnalysisTour
        isActive={activeTour === 'geographic-analysis'}
        onComplete={() => completeTour('geographic-analysis')}
        onSkip={skipTour}
      />

      <DemographicAnalysisTour
        isActive={activeTour === 'demographic-analysis'}
        onComplete={() => completeTour('demographic-analysis')}
        onSkip={skipTour}
      />

      <SentimentAnalysisTour
        isActive={activeTour === 'sentiment-analysis'}
        onComplete={() => completeTour('sentiment-analysis')}
        onSkip={skipTour}
      />

      {/* Interactive Tutorials */}
      {activeTutorial && tutorialScenarios[activeTutorial] && (
        <InteractiveTutorial
          scenario={tutorialScenarios[activeTutorial]}
          isActive={true}
          onComplete={completeTutorial}
          onExit={exitTutorial}
        />
      )}

      {/* Help Modal */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={hideHelp}
        topic={helpModalTopic as any}
      />
    </TrainingSystemContext.Provider>
  );
};

// Training dashboard component for managing learning progress
export const TrainingDashboard: React.FC<{ className?: string }> = ({ className = '' }) => {
  const {
    progress,
    startTour,
    startTutorial,
    showHelp,
    getRecommendedNextSteps,
    getStatistics
  } = useTrainingSystem();

  const stats = getStatistics();
  const recommendations = getRecommendedNextSteps();

  const availableTours = [
    { id: 'geographic-analysis', name: 'Geographic Analysis', completed: progress.completedTours.includes('geographic-analysis') },
    { id: 'demographic-analysis', name: 'Demographic Analysis', completed: progress.completedTours.includes('demographic-analysis') },
    { id: 'sentiment-analysis', name: 'Sentiment Analysis', completed: progress.completedTours.includes('sentiment-analysis') }
  ];

  const availableTutorials = [
    'geographic-analysis-basics',
    'demographic-sentiment-correlation',
    'advanced-sentiment-complexity'
  ];

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Learning Dashboard</h2>

      {/* Progress Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.proficiencyScore}%</div>
          <div className="text-sm text-blue-800">Proficiency Score</div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">{stats.toursCompleted}</div>
          <div className="text-sm text-green-800">Tours Completed</div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.tutorialsCompleted}</div>
          <div className="text-sm text-purple-800">Tutorials Completed</div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.totalTimeSpent}m</div>
          <div className="text-sm text-orange-800">Time Spent Learning</div>
        </div>
      </div>

      {/* Skill Level */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Skill Level</span>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            stats.skillLevel === 'advanced' ? 'bg-red-100 text-red-800' :
            stats.skillLevel === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {stats.skillLevel.charAt(0).toUpperCase() + stats.skillLevel.slice(1)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${stats.proficiencyScore}%` }}
          />
        </div>
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Recommended Next Steps</h3>
          <ul className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></span>
                <span className="text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Available Tours */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Guided Tours</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {availableTours.map(tour => (
            <div
              key={tour.id}
              className={`border rounded-lg p-3 ${
                tour.completed ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{tour.name}</span>
                {tour.completed ? (
                  <span className="text-green-600 text-sm">✓ Completed</span>
                ) : (
                  <button
                    onClick={() => startTour(tour.id)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Start Tour
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Tutorials */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Interactive Tutorials</h3>
        <TutorialLauncher
          availableScenarios={availableTutorials}
          onLaunchTutorial={startTutorial}
        />
      </div>

      {/* Quick Help */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Quick Help</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {['overview', 'geographic', 'demographic', 'sentiment'].map(topic => (
            <button
              key={topic}
              onClick={() => showHelp(topic)}
              className="px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md border border-blue-200 transition-colors"
            >
              {topic.charAt(0).toUpperCase() + topic.slice(1)} Help
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Onboarding banner component
export const OnboardingBanner: React.FC<{
  feature: string;
  title: string;
  description: string;
  className?: string;
}> = ({ feature, title, description, className = '' }) => {
  const { shouldShowOnboarding, startTour, isFeatureNew } = useTrainingSystemContext();

  if (!shouldShowOnboarding(feature) && !isFeatureNew(feature)) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 mb-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-1">{title}</h3>
          <p className="text-sm text-blue-800">{description}</p>
        </div>
        
        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => startTour(`${feature}-analysis`)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
          >
            Take Tour
          </button>
        </div>
      </div>
    </div>
  );
};

// Feature introduction component
export const FeatureIntroduction: React.FC<{
  feature: 'geographic' | 'demographic' | 'sentiment' | 'topics' | 'engagement' | 'temporal' | 'filters';
  embedded?: boolean;
  className?: string;
}> = ({ feature, embedded = true, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      <FeatureDocumentation
        feature={feature}
        embedded={embedded}
      />
    </div>
  );
};

export default TrainingSystemProvider;