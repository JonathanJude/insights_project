/**
 * Optimized Multi-Dimensional State Management Store
 * 
 * This store provides intelligent state management for multi-dimensional data
 * with performance optimizations, intelligent caching integration, and
 * efficient state updates for complex filter combinations.
 */

import React from 'react';
import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { optimizedDataStructures } from '../lib/enhancedCaching';
import { OptimizedFilterState } from '../lib/optimizedEnhancedMockDataService';

// Performance tracking interface
interface PerformanceMetrics {
  stateUpdateTime: number;
  filterApplicationTime: number;
  cacheHitRate: number;
  totalStateUpdates: number;
  averageUpdateTime: number;
  lastOptimization: number;
}

// UI state for performance optimization
interface UIOptimizationState {
  isFilterPanelExpanded: boolean;
  expandedFilterSections: Set<string>;
  recentFilterCombinations: Array<{
    filters: Partial<OptimizedFilterState>;
    timestamp: number;
    usage: number;
  }>;
  performanceMode: 'auto' | 'performance' | 'quality';
  batchUpdates: boolean;
  debounceMs: number;
}

// Main store interface
interface OptimizedMultiDimensionalStore {
  // Filter state
  filters: OptimizedFilterState;
  previousFilters: OptimizedFilterState;
  
  // UI optimization state
  ui: UIOptimizationState;
  
  // Performance metrics
  performance: PerformanceMetrics;
  
  // Computed state
  hasActiveFilters: boolean;
  activeFilterCount: number;
  isFrequentCombination: boolean;
  
  // Filter actions
  updateFilters: (updates: Partial<OptimizedFilterState> | ((prev: OptimizedFilterState) => OptimizedFilterState)) => void;
  updateGeographicFilters: (updates: Partial<OptimizedFilterState['geographic']>) => void;
  updateDemographicFilters: (updates: Partial<OptimizedFilterState['demographic']>) => void;
  updateSentimentFilters: (updates: Partial<OptimizedFilterState['sentiment']>) => void;
  updateTopicFilters: (updates: Partial<OptimizedFilterState['topics']>) => void;
  updateEngagementFilters: (updates: Partial<OptimizedFilterState['engagement']>) => void;
  updateTemporalFilters: (updates: Partial<OptimizedFilterState['temporal']>) => void;
  
  // Batch operations
  batchUpdateFilters: (updates: Array<{ section: keyof OptimizedFilterState; data: any }>) => void;
  applyFilterPreset: (preset: Partial<OptimizedFilterState>) => void;
  
  // State management
  clearAllFilters: () => void;
  resetToDefaults: () => void;
  undoLastChange: () => void;
  
  // UI actions
  toggleFilterPanel: () => void;
  toggleFilterSection: (section: string) => void;
  setPerformanceMode: (mode: 'auto' | 'performance' | 'quality') => void;
  
  // Performance actions
  optimizeState: () => void;
  getPerformanceReport: () => PerformanceMetrics & { suggestions: string[] };
  clearPerformanceData: () => void;
  
  // Utility actions
  saveFilterCombination: (name: string) => void;
  loadFilterCombination: (name: string) => void;
  getRecentCombinations: () => Array<Partial<OptimizedFilterState>>;
}

// Default filter state
const defaultFilterState: OptimizedFilterState = {
  geographic: {
    countries: [],
    states: [],
    lgas: [],
    wards: [],
    pollingUnits: [],
    confidenceThreshold: 0.5
  },
  demographic: {
    education: [],
    occupation: [],
    ageRanges: [],
    gender: [],
    confidenceThreshold: 0.5
  },
  sentiment: {
    polarity: [],
    emotions: [],
    intensityRange: { min: 0, max: 1 },
    complexity: [],
    modelAgreementThreshold: 0.5
  },
  topics: {
    policyAreas: [],
    campaignIssues: [],
    events: [],
    trendingThreshold: 0.5
  },
  engagement: {
    levels: [],
    viralityThreshold: 1000,
    qualityScoreRange: { min: 0, max: 1 },
    influencerAmplification: false
  },
  temporal: {
    timeBlocks: [],
    daysOfWeek: [],
    electionPhases: [],
    dateRange: { start: '', end: '' }
  },
  query: '',
  sortBy: 'relevance',
  sortOrder: 'desc',
  limit: 100
};

// Default UI state
const defaultUIState: UIOptimizationState = {
  isFilterPanelExpanded: true,
  expandedFilterSections: new Set(['geographic', 'demographic']),
  recentFilterCombinations: [],
  performanceMode: 'auto',
  batchUpdates: false,
  debounceMs: 150
};

// Default performance metrics
const defaultPerformanceMetrics: PerformanceMetrics = {
  stateUpdateTime: 0,
  filterApplicationTime: 0,
  cacheHitRate: 0,
  totalStateUpdates: 0,
  averageUpdateTime: 0,
  lastOptimization: Date.now()
};

// Create the optimized store
export const useOptimizedMultiDimensionalStore = create<OptimizedMultiDimensionalStore>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // Initial state
          filters: defaultFilterState,
          previousFilters: defaultFilterState,
          ui: defaultUIState,
          performance: defaultPerformanceMetrics,
          
          // Computed state
          get hasActiveFilters() {
            const state = get();
            return (
              state.filters.query.length > 0 ||
              state.filters.geographic.states.length > 0 ||
              state.filters.demographic.education.length > 0 ||
              state.filters.sentiment.polarity.length > 0 ||
              state.filters.topics.policyAreas.length > 0 ||
              state.filters.engagement.levels.length > 0 ||
              state.filters.temporal.timeBlocks.length > 0
            );
          },
          
          get activeFilterCount() {
            const state = get();
            let count = 0;
            if (state.filters.query.length > 0) count++;
            if (state.filters.geographic.states.length > 0) count++;
            if (state.filters.demographic.education.length > 0) count++;
            if (state.filters.sentiment.polarity.length > 0) count++;
            if (state.filters.topics.policyAreas.length > 0) count++;
            if (state.filters.engagement.levels.length > 0) count++;
            if (state.filters.temporal.timeBlocks.length > 0) count++;
            return count;
          },
          
          get isFrequentCombination() {
            const state = get();
            return optimizedDataStructures.isFrequentCombination(state.filters);
          },
          
          // Filter actions with performance tracking
          updateFilters: (updates) => {
            const startTime = performance.now();
            
            set((state) => {
              state.previousFilters = { ...state.filters };
              
              if (typeof updates === 'function') {
                state.filters = updates(state.filters);
              } else {
                Object.assign(state.filters, updates);
              }
              
              // Track usage
              optimizedDataStructures.trackFilterUsage(state.filters);
              
              // Update performance metrics
              const updateTime = performance.now() - startTime;
              state.performance.stateUpdateTime = updateTime;
              state.performance.totalStateUpdates++;
              state.performance.averageUpdateTime = 
                (state.performance.averageUpdateTime * (state.performance.totalStateUpdates - 1) + updateTime) / 
                state.performance.totalStateUpdates;
            });
          },
          
          updateGeographicFilters: (updates) => {
            get().updateFilters((prev) => ({
              ...prev,
              geographic: { ...prev.geographic, ...updates }
            }));
          },
          
          updateDemographicFilters: (updates) => {
            get().updateFilters((prev) => ({
              ...prev,
              demographic: { ...prev.demographic, ...updates }
            }));
          },
          
          updateSentimentFilters: (updates) => {
            get().updateFilters((prev) => ({
              ...prev,
              sentiment: { ...prev.sentiment, ...updates }
            }));
          },
          
          updateTopicFilters: (updates) => {
            get().updateFilters((prev) => ({
              ...prev,
              topics: { ...prev.topics, ...updates }
            }));
          },
          
          updateEngagementFilters: (updates) => {
            get().updateFilters((prev) => ({
              ...prev,
              engagement: { ...prev.engagement, ...updates }
            }));
          },
          
          updateTemporalFilters: (updates) => {
            get().updateFilters((prev) => ({
              ...prev,
              temporal: { ...prev.temporal, ...updates }
            }));
          },
          
          // Batch operations for performance
          batchUpdateFilters: (updates) => {
            const startTime = performance.now();
            
            set((state) => {
              state.previousFilters = { ...state.filters };
              
              updates.forEach(({ section, data }) => {
                if (section in state.filters) {
                  Object.assign((state.filters as any)[section], data);
                }
              });
              
              // Track usage
              optimizedDataStructures.trackFilterUsage(state.filters);
              
              // Update performance metrics
              const updateTime = performance.now() - startTime;
              state.performance.stateUpdateTime = updateTime;
              state.performance.totalStateUpdates++;
            });
          },
          
          applyFilterPreset: (preset) => {
            get().updateFilters(preset);
          },
          
          // State management
          clearAllFilters: () => {
            set((state) => {
              state.previousFilters = { ...state.filters };
              state.filters = { ...defaultFilterState };
            });
          },
          
          resetToDefaults: () => {
            set((state) => {
              state.filters = { ...defaultFilterState };
              state.previousFilters = { ...defaultFilterState };
              state.ui = { ...defaultUIState };
            });
          },
          
          undoLastChange: () => {
            set((state) => {
              const temp = { ...state.filters };
              state.filters = { ...state.previousFilters };
              state.previousFilters = temp;
            });
          },
          
          // UI actions
          toggleFilterPanel: () => {
            set((state) => {
              state.ui.isFilterPanelExpanded = !state.ui.isFilterPanelExpanded;
            });
          },
          
          toggleFilterSection: (section) => {
            set((state) => {
              if (state.ui.expandedFilterSections.has(section)) {
                state.ui.expandedFilterSections.delete(section);
              } else {
                state.ui.expandedFilterSections.add(section);
              }
            });
          },
          
          setPerformanceMode: (mode) => {
            set((state) => {
              state.ui.performanceMode = mode;
              
              // Adjust settings based on mode
              switch (mode) {
                case 'performance':
                  state.ui.batchUpdates = true;
                  state.ui.debounceMs = 300;
                  break;
                case 'quality':
                  state.ui.batchUpdates = false;
                  state.ui.debounceMs = 50;
                  break;
                case 'auto':
                default:
                  state.ui.batchUpdates = state.performance.averageUpdateTime > 100;
                  state.ui.debounceMs = 150;
                  break;
              }
            });
          },
          
          // Performance actions
          optimizeState: () => {
            set((state) => {
              // Clean up old recent combinations
              const now = Date.now();
              state.ui.recentFilterCombinations = state.ui.recentFilterCombinations
                .filter(combo => now - combo.timestamp < 24 * 60 * 60 * 1000) // Keep last 24 hours
                .slice(-20); // Keep only last 20
              
              // Update performance mode based on metrics
              if (state.ui.performanceMode === 'auto') {
                if (state.performance.averageUpdateTime > 200) {
                  state.ui.performanceMode = 'performance';
                  state.ui.batchUpdates = true;
                  state.ui.debounceMs = 300;
                } else if (state.performance.averageUpdateTime < 50) {
                  state.ui.performanceMode = 'quality';
                  state.ui.batchUpdates = false;
                  state.ui.debounceMs = 50;
                }
              }
              
              state.performance.lastOptimization = now;
            });
          },
          
          getPerformanceReport: () => {
            const state = get();
            const suggestions: string[] = [];
            
            if (state.performance.averageUpdateTime > 100) {
              suggestions.push('Consider enabling batch updates for better performance');
            }
            
            if (state.performance.cacheHitRate < 0.5) {
              suggestions.push('Cache hit rate is low. Try using more consistent filter combinations');
            }
            
            if (state.ui.expandedFilterSections.size > 3) {
              suggestions.push('Consider collapsing unused filter sections to improve UI performance');
            }
            
            if (state.performance.totalStateUpdates > 1000 && Date.now() - state.performance.lastOptimization > 60000) {
              suggestions.push('State optimization is overdue. Consider running optimizeState()');
            }
            
            return {
              ...state.performance,
              suggestions
            };
          },
          
          clearPerformanceData: () => {
            set((state) => {
              state.performance = { ...defaultPerformanceMetrics };
            });
          },
          
          // Utility actions
          saveFilterCombination: (name) => {
            set((state) => {
              const combination = {
                filters: { ...state.filters },
                timestamp: Date.now(),
                usage: 1
              };
              
              // Add to recent combinations
              state.ui.recentFilterCombinations.unshift(combination);
              
              // Keep only last 10 recent combinations
              state.ui.recentFilterCombinations = state.ui.recentFilterCombinations.slice(0, 10);
            });
          },
          
          loadFilterCombination: (name) => {
            // This would load from saved combinations
            // For now, just a placeholder
            console.log(`Loading filter combination: ${name}`);
          },
          
          getRecentCombinations: () => {
            const state = get();
            return state.ui.recentFilterCombinations
              .sort((a, b) => b.usage - a.usage)
              .slice(0, 5)
              .map(combo => combo.filters);
          }
        }))
      ),
      {
        name: 'optimized-multi-dimensional-store',
        partialize: (state) => ({
          filters: state.filters,
          ui: {
            ...state.ui,
            expandedFilterSections: Array.from(state.ui.expandedFilterSections) // Convert Set to Array for serialization
          },
          performance: state.performance
        }),
        onRehydrateStorage: () => (state) => {
          if (state?.ui?.expandedFilterSections) {
            // Convert Array back to Set after rehydration
            state.ui.expandedFilterSections = new Set(state.ui.expandedFilterSections as any);
          }
        }
      }
    ),
    { name: 'optimized-multi-dimensional-store' }
  )
);

// Selector hooks for performance optimization
export const useOptimizedFilters = () => 
  useOptimizedMultiDimensionalStore((state) => state.filters);

export const useOptimizedFilterActions = () => 
  useOptimizedMultiDimensionalStore((state) => ({
    updateFilters: state.updateFilters,
    updateGeographicFilters: state.updateGeographicFilters,
    updateDemographicFilters: state.updateDemographicFilters,
    updateSentimentFilters: state.updateSentimentFilters,
    updateTopicFilters: state.updateTopicFilters,
    updateEngagementFilters: state.updateEngagementFilters,
    updateTemporalFilters: state.updateTemporalFilters,
    batchUpdateFilters: state.batchUpdateFilters,
    clearAllFilters: state.clearAllFilters
  }));

export const useOptimizedUIState = () => 
  useOptimizedMultiDimensionalStore((state) => state.ui);

export const useOptimizedPerformanceMetrics = () => 
  useOptimizedMultiDimensionalStore((state) => ({
    performance: state.performance,
    getPerformanceReport: state.getPerformanceReport,
    optimizeState: state.optimizeState
  }));

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  const store = useOptimizedMultiDimensionalStore();
  
  // Set up automatic optimization
  React.useEffect(() => {
    const interval = setInterval(() => {
      store.optimizeState();
    }, 5 * 60 * 1000); // Every 5 minutes
    
    return () => clearInterval(interval);
  }, [store]);
  
  return {
    metrics: store.performance,
    report: store.getPerformanceReport(),
    optimize: store.optimizeState
  };
};

export default useOptimizedMultiDimensionalStore;