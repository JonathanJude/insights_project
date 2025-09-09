import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ChartFilter, NigerianState, PoliticalParty, SocialPlatform } from '../types';

interface ChartFilterStore {
  // Chart filter state
  chartFilter: ChartFilter;
  
  // Actions
  setTimeRange: (timeRange: ChartFilter['timeRange']) => void;
  setPlatforms: (platforms: SocialPlatform[]) => void;
  setParties: (parties: PoliticalParty[]) => void;
  setStates: (states: NigerianState[]) => void;
  setChartFilter: (filter: Partial<ChartFilter>) => void;
  resetChartFilter: () => void;
  
  // Utility actions
  togglePlatform: (platform: SocialPlatform) => void;
  toggleParty: (party: PoliticalParty) => void;
  toggleState: (state: NigerianState) => void;
}

const initialChartFilter: ChartFilter = {
  timeRange: '30d',
  platforms: [],
  parties: [],
  states: []
};

export const useChartFilterStore = create<ChartFilterStore>()(
  devtools(
    (set, get) => ({
      chartFilter: initialChartFilter,
      
      // Basic setters
      setTimeRange: (timeRange: ChartFilter['timeRange']) => 
        set((state) => ({
          chartFilter: { ...state.chartFilter, timeRange }
        })),
      
      setPlatforms: (platforms: SocialPlatform[]) =>
        set((state) => ({
          chartFilter: { ...state.chartFilter, platforms }
        })),
      
      setParties: (parties: PoliticalParty[]) =>
        set((state) => ({
          chartFilter: { ...state.chartFilter, parties }
        })),
      
      setStates: (states: NigerianState[]) =>
        set((state) => ({
          chartFilter: { ...state.chartFilter, states }
        })),
      
      setChartFilter: (filter: Partial<ChartFilter>) =>
        set((state) => ({
          chartFilter: { ...state.chartFilter, ...filter }
        })),
      
      resetChartFilter: () => set({ chartFilter: initialChartFilter }),
      
      // Toggle functions
      togglePlatform: (platform: SocialPlatform) => {
        const current = get().chartFilter.platforms || [];
        const updated = current.includes(platform)
          ? current.filter(p => p !== platform)
          : [...current, platform];
        set((state) => ({
          chartFilter: { ...state.chartFilter, platforms: updated }
        }));
      },
      
      toggleParty: (party: PoliticalParty) => {
        const current = get().chartFilter.parties || [];
        const updated = current.includes(party)
          ? current.filter(p => p !== party)
          : [...current, party];
        set((state) => ({
          chartFilter: { ...state.chartFilter, parties: updated }
        }));
      },
      
      toggleState: (state: NigerianState) => {
        const current = get().chartFilter.states || [];
        const updated = current.includes(state)
          ? current.filter(s => s !== state)
          : [...current, state];
        set((chartState) => ({
          chartFilter: { ...chartState.chartFilter, states: updated }
        }));
      }
    }),
    { name: 'chart-filter-store' }
  )
);