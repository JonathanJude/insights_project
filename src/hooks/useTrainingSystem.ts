import { useCallback, useEffect, useState } from 'react';

interface TrainingProgress {
  completedTours: string[];
  completedTutorials: string[];
  hintsUsed: number;
  totalTimeSpent: number;
  lastActivity: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  preferences: {
    showTooltips: boolean;
    autoStartTours: boolean;
    skipBasicInstructions: boolean;
  };
}

interface TutorialResults {
  scenarioId: string;
  completedSteps: string[];
  timeSpent: number;
  hintsUsed: number;
  insights: string[];
}

interface TrainingSystemState {
  progress: TrainingProgress;
  activeTour: string | null;
  activeTutorial: string | null;
  showHelpModal: boolean;
  helpModalTopic: string;
}

const STORAGE_KEY = 'multi-dimensional-training-progress';

const defaultProgress: TrainingProgress = {
  completedTours: [],
  completedTutorials: [],
  hintsUsed: 0,
  totalTimeSpent: 0,
  lastActivity: Date.now(),
  skillLevel: 'beginner',
  preferences: {
    showTooltips: true,
    autoStartTours: false,
    skipBasicInstructions: false
  }
};

export const useTrainingSystem = () => {
  const [state, setState] = useState<TrainingSystemState>({
    progress: defaultProgress,
    activeTour: null,
    activeTutorial: null,
    showHelpModal: false,
    helpModalTopic: 'overview'
  });

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const progress = JSON.parse(saved);
        setState(prev => ({ ...prev, progress: { ...defaultProgress, ...progress } }));
      }
    } catch (error) {
      console.warn('Failed to load training progress:', error);
    }
  }, []);

  // Save progress to localStorage when it changes
  const saveProgress = useCallback((progress: TrainingProgress) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.warn('Failed to save training progress:', error);
    }
  }, []);

  // Update progress and save
  const updateProgress = useCallback((updates: Partial<TrainingProgress>) => {
    setState(prev => {
      const newProgress = { ...prev.progress, ...updates, lastActivity: Date.now() };
      saveProgress(newProgress);
      return { ...prev, progress: newProgress };
    });
  }, [saveProgress]);

  // Start a guided tour
  const startTour = useCallback((tourId: string) => {
    setState(prev => ({ ...prev, activeTour: tourId }));
  }, []);

  // Complete a guided tour
  const completeTour = useCallback((tourId: string) => {
    setState(prev => ({ ...prev, activeTour: null }));
    updateProgress({
      completedTours: [...state.progress.completedTours, tourId]
    });
  }, [state.progress.completedTours, updateProgress]);

  // Skip a guided tour
  const skipTour = useCallback(() => {
    setState(prev => ({ ...prev, activeTour: null }));
  }, []);

  // Start an interactive tutorial
  const startTutorial = useCallback((tutorialId: string) => {
    setState(prev => ({ ...prev, activeTutorial: tutorialId }));
  }, []);

  // Complete an interactive tutorial
  const completeTutorial = useCallback((results: TutorialResults) => {
    setState(prev => ({ ...prev, activeTutorial: null }));
    
    const newCompletedTutorials = [...state.progress.completedTutorials, results.scenarioId];
    const newTotalTime = state.progress.totalTimeSpent + results.timeSpent;
    const newHintsUsed = state.progress.hintsUsed + results.hintsUsed;
    
    // Determine skill level based on progress
    let skillLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
    if (newCompletedTutorials.length >= 5 && newHintsUsed / newCompletedTutorials.length < 2) {
      skillLevel = 'advanced';
    } else if (newCompletedTutorials.length >= 2) {
      skillLevel = 'intermediate';
    }

    updateProgress({
      completedTutorials: newCompletedTutorials,
      totalTimeSpent: newTotalTime,
      hintsUsed: newHintsUsed,
      skillLevel
    });
  }, [state.progress, updateProgress]);

  // Exit tutorial
  const exitTutorial = useCallback(() => {
    setState(prev => ({ ...prev, activeTutorial: null }));
  }, []);

  // Show help modal
  const showHelp = useCallback((topic: string = 'overview') => {
    setState(prev => ({ ...prev, showHelpModal: true, helpModalTopic: topic }));
  }, []);

  // Hide help modal
  const hideHelp = useCallback(() => {
    setState(prev => ({ ...prev, showHelpModal: false }));
  }, []);

  // Update preferences
  const updatePreferences = useCallback((preferences: Partial<TrainingProgress['preferences']>) => {
    updateProgress({
      preferences: { ...state.progress.preferences, ...preferences }
    });
  }, [state.progress.preferences, updateProgress]);

  // Check if user should see onboarding
  const shouldShowOnboarding = useCallback((feature: string) => {
    if (state.progress.preferences.skipBasicInstructions) return false;
    if (state.progress.skillLevel === 'advanced') return false;
    return !state.progress.completedTours.includes(`${feature}-tour`);
  }, [state.progress]);

  // Get recommended next steps
  const getRecommendedNextSteps = useCallback(() => {
    const { completedTours, completedTutorials, skillLevel } = state.progress;
    const recommendations: string[] = [];

    // Basic tours
    const basicTours = ['geographic-tour', 'demographic-tour', 'sentiment-tour'];
    const incompleteTours = basicTours.filter(tour => !completedTours.includes(tour));
    
    if (incompleteTours.length > 0) {
      recommendations.push(`Complete the ${incompleteTours[0].replace('-tour', '')} analysis tour`);
    }

    // Tutorials based on skill level
    if (skillLevel === 'beginner' && completedTutorials.length === 0) {
      recommendations.push('Try the "Geographic Analysis Basics" tutorial');
    } else if (skillLevel === 'intermediate' && !completedTutorials.includes('demographic-sentiment-correlation')) {
      recommendations.push('Explore demographic sentiment correlation analysis');
    } else if (skillLevel === 'advanced' && !completedTutorials.includes('advanced-sentiment-complexity')) {
      recommendations.push('Master advanced sentiment complexity analysis');
    }

    return recommendations;
  }, [state.progress]);

  // Get user statistics
  const getStatistics = useCallback(() => {
    const { completedTours, completedTutorials, totalTimeSpent, hintsUsed, skillLevel } = state.progress;
    
    return {
      toursCompleted: completedTours.length,
      tutorialsCompleted: completedTutorials.length,
      totalTimeSpent: Math.round(totalTimeSpent / 60000), // Convert to minutes
      averageHintsPerTutorial: completedTutorials.length > 0 ? Math.round(hintsUsed / completedTutorials.length) : 0,
      skillLevel,
      proficiencyScore: Math.min(100, (completedTours.length * 10) + (completedTutorials.length * 20) + (skillLevel === 'advanced' ? 30 : skillLevel === 'intermediate' ? 15 : 0))
    };
  }, [state.progress]);

  // Reset progress (for testing or user request)
  const resetProgress = useCallback(() => {
    setState(prev => ({ ...prev, progress: defaultProgress }));
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Check if feature is new to user
  const isFeatureNew = useCallback((feature: string) => {
    return !state.progress.completedTours.includes(`${feature}-tour`) && 
           !state.progress.completedTutorials.some(t => t.includes(feature));
  }, [state.progress]);

  return {
    // State
    progress: state.progress,
    activeTour: state.activeTour,
    activeTutorial: state.activeTutorial,
    showHelpModal: state.showHelpModal,
    helpModalTopic: state.helpModalTopic,

    // Tour management
    startTour,
    completeTour,
    skipTour,

    // Tutorial management
    startTutorial,
    completeTutorial,
    exitTutorial,

    // Help system
    showHelp,
    hideHelp,

    // Preferences
    updatePreferences,

    // Utility functions
    shouldShowOnboarding,
    getRecommendedNextSteps,
    getStatistics,
    resetProgress,
    isFeatureNew
  };
};

// Hook for contextual help tooltips
export const useContextualHelp = () => {
  const [activeTooltips, setActiveTooltips] = useState<Set<string>>(new Set());
  const [tooltipPreferences, setTooltipPreferences] = useState({
    showConfidenceHelp: true,
    showDataQualityHelp: true,
    showUndefinedHelp: true,
    showModelAgreementHelp: true
  });

  const showTooltip = useCallback((tooltipId: string) => {
    setActiveTooltips(prev => new Set([...prev, tooltipId]));
  }, []);

  const hideTooltip = useCallback((tooltipId: string) => {
    setActiveTooltips(prev => {
      const newSet = new Set(prev);
      newSet.delete(tooltipId);
      return newSet;
    });
  }, []);

  const toggleTooltip = useCallback((tooltipId: string) => {
    setActiveTooltips(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tooltipId)) {
        newSet.delete(tooltipId);
      } else {
        newSet.add(tooltipId);
      }
      return newSet;
    });
  }, []);

  const isTooltipActive = useCallback((tooltipId: string) => {
    return activeTooltips.has(tooltipId);
  }, [activeTooltips]);

  const updateTooltipPreferences = useCallback((updates: Partial<typeof tooltipPreferences>) => {
    setTooltipPreferences(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    activeTooltips,
    tooltipPreferences,
    showTooltip,
    hideTooltip,
    toggleTooltip,
    isTooltipActive,
    updateTooltipPreferences
  };
};

export default useTrainingSystem;