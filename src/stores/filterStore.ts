import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { FilterState } from '../types';
import { PoliticalParty, NigerianState, SocialPlatform, Gender, AgeGroup, PoliticalLevel } from '../types';
import { subDays, format } from 'date-fns';

interface FilterStore extends FilterState {
  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedParties: (parties: PoliticalParty[]) => void;
  setSelectedStates: (states: NigerianState[]) => void;
  setSelectedPlatforms: (platforms: SocialPlatform[]) => void;
  setSelectedGenders: (genders: Gender[]) => void;
  setSelectedAgeGroups: (ageGroups: AgeGroup[]) => void;
  setSelectedLevels: (levels: PoliticalLevel[]) => void;
  setDateRange: (start: string, end: string) => void;
  setSortBy: (sortBy: 'name' | 'sentiment' | 'mentions' | 'relevance') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  
  // Utility actions
  clearAllFilters: () => void;
  clearSearchQuery: () => void;
  setPresetDateRange: (days: number) => void;
  toggleParty: (party: PoliticalParty) => void;
  toggleState: (state: NigerianState) => void;
  togglePlatform: (platform: SocialPlatform) => void;
  toggleGender: (gender: Gender) => void;
  toggleAgeGroup: (ageGroup: AgeGroup) => void;
  toggleLevel: (level: PoliticalLevel) => void;
  
  // Computed values
  hasActiveFilters: () => boolean;
  getActiveFilterCount: () => number;
}

const initialState: FilterState = {
  searchQuery: '',
  selectedParties: [],
  selectedStates: [],
  selectedPlatforms: [],
  selectedGenders: [],
  selectedAgeGroups: [],
  selectedLevels: [],
  dateRange: {
    start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd')
  },
  sortBy: 'relevance',
  sortOrder: 'desc'
};

export const useFilterStore = create<FilterStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Basic setters
        setSearchQuery: (query: string) => set({ searchQuery: query }),
        setSelectedParties: (parties: PoliticalParty[]) => set({ selectedParties: parties }),
        setSelectedStates: (states: NigerianState[]) => set({ selectedStates: states }),
        setSelectedPlatforms: (platforms: SocialPlatform[]) => set({ selectedPlatforms: platforms }),
        setSelectedGenders: (genders: Gender[]) => set({ selectedGenders: genders }),
        setSelectedAgeGroups: (ageGroups: AgeGroup[]) => set({ selectedAgeGroups: ageGroups }),
        setSelectedLevels: (levels: PoliticalLevel[]) => set({ selectedLevels: levels }),
        setDateRange: (start: string, end: string) => set({ dateRange: { start, end } }),
        setSortBy: (sortBy: 'name' | 'sentiment' | 'mentions' | 'relevance') => set({ sortBy }),
        setSortOrder: (sortOrder: 'asc' | 'desc') => set({ sortOrder }),
        
        // Utility actions
        clearAllFilters: () => set({
          searchQuery: '',
          selectedParties: [],
          selectedStates: [],
          selectedPlatforms: [],
          selectedGenders: [],
          selectedAgeGroups: [],
          selectedLevels: [],
          sortBy: 'relevance',
          sortOrder: 'desc'
        }),
        
        clearSearchQuery: () => set({ searchQuery: '' }),
        
        setPresetDateRange: (days: number) => {
          const end = format(new Date(), 'yyyy-MM-dd');
          const start = format(subDays(new Date(), days), 'yyyy-MM-dd');
          set({ dateRange: { start, end } });
        },
        
        // Toggle functions for multi-select filters
        toggleParty: (party: PoliticalParty) => {
          const current = get().selectedParties;
          const updated = current.includes(party)
            ? current.filter(p => p !== party)
            : [...current, party];
          set({ selectedParties: updated });
        },
        
        toggleState: (state: NigerianState) => {
          const current = get().selectedStates;
          const updated = current.includes(state)
            ? current.filter(s => s !== state)
            : [...current, state];
          set({ selectedStates: updated });
        },
        
        togglePlatform: (platform: SocialPlatform) => {
          const current = get().selectedPlatforms;
          const updated = current.includes(platform)
            ? current.filter(p => p !== platform)
            : [...current, platform];
          set({ selectedPlatforms: updated });
        },
        
        toggleGender: (gender: Gender) => {
          const current = get().selectedGenders;
          const updated = current.includes(gender)
            ? current.filter(g => g !== gender)
            : [...current, gender];
          set({ selectedGenders: updated });
        },
        
        toggleAgeGroup: (ageGroup: AgeGroup) => {
          const current = get().selectedAgeGroups;
          const updated = current.includes(ageGroup)
            ? current.filter(a => a !== ageGroup)
            : [...current, ageGroup];
          set({ selectedAgeGroups: updated });
        },
        
        toggleLevel: (level: PoliticalLevel) => {
          const current = get().selectedLevels;
          const updated = current.includes(level)
            ? current.filter(l => l !== level)
            : [...current, level];
          set({ selectedLevels: updated });
        },
        
        // Computed values
        hasActiveFilters: () => {
          const state = get();
          return (
            state.searchQuery.length > 0 ||
            state.selectedParties.length > 0 ||
            state.selectedStates.length > 0 ||
            state.selectedPlatforms.length > 0 ||
            state.selectedGenders.length > 0 ||
            state.selectedAgeGroups.length > 0 ||
            state.selectedLevels.length > 0
          );
        },
        
        getActiveFilterCount: () => {
          const state = get();
          let count = 0;
          if (state.searchQuery.length > 0) count++;
          if (state.selectedParties.length > 0) count++;
          if (state.selectedStates.length > 0) count++;
          if (state.selectedPlatforms.length > 0) count++;
          if (state.selectedGenders.length > 0) count++;
          if (state.selectedAgeGroups.length > 0) count++;
          if (state.selectedLevels.length > 0) count++;
          return count;
        }
      }),
      {
        name: 'filter-store',
        partialize: (state) => ({
          selectedParties: state.selectedParties,
          selectedStates: state.selectedStates,
          selectedPlatforms: state.selectedPlatforms,
          selectedGenders: state.selectedGenders,
          selectedAgeGroups: state.selectedAgeGroups,
          selectedLevels: state.selectedLevels,
          dateRange: state.dateRange,
          sortBy: state.sortBy,
          sortOrder: state.sortOrder
        })
      }
    ),
    { name: 'filter-store' }
  )
);