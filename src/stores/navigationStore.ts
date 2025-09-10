import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NavigationState {
  // Expanded sections
  expandedSections: string[];
  
  // Recently visited pages
  recentPages: Array<{
    id: string;
    name: string;
    href: string;
    timestamp: number;
  }>;
  
  // Navigation preferences
  preferences: {
    autoExpandOnHover: boolean;
    showBadges: boolean;
    compactMode: boolean;
  };
  
  // Actions
  toggleSection: (sectionId: string) => void;
  expandSection: (sectionId: string) => void;
  collapseSection: (sectionId: string) => void;
  addRecentPage: (page: { id: string; name: string; href: string }) => void;
  clearRecentPages: () => void;
  updatePreferences: (preferences: Partial<NavigationState['preferences']>) => void;
  
  // Keyboard navigation
  focusedItemId: string | null;
  setFocusedItem: (itemId: string | null) => void;
}

export const useNavigationStore = create<NavigationState>()(
  persist(
    (set, get) => ({
      expandedSections: ['advanced-analysis'], // Default to expanded
      recentPages: [],
      preferences: {
        autoExpandOnHover: false,
        showBadges: true,
        compactMode: false,
      },
      focusedItemId: null,

      toggleSection: (sectionId: string) => {
        set((state) => ({
          expandedSections: state.expandedSections.includes(sectionId)
            ? state.expandedSections.filter(id => id !== sectionId)
            : [...state.expandedSections, sectionId]
        }));
      },

      expandSection: (sectionId: string) => {
        set((state) => ({
          expandedSections: state.expandedSections.includes(sectionId)
            ? state.expandedSections
            : [...state.expandedSections, sectionId]
        }));
      },

      collapseSection: (sectionId: string) => {
        set((state) => ({
          expandedSections: state.expandedSections.filter(id => id !== sectionId)
        }));
      },

      addRecentPage: (page) => {
        set((state) => {
          const existingIndex = state.recentPages.findIndex(p => p.id === page.id);
          let newRecentPages = [...state.recentPages];
          
          if (existingIndex >= 0) {
            // Move to front if already exists
            newRecentPages.splice(existingIndex, 1);
          }
          
          // Add to front with timestamp
          newRecentPages.unshift({
            ...page,
            timestamp: Date.now()
          });
          
          // Keep only last 10 pages
          newRecentPages = newRecentPages.slice(0, 10);
          
          return { recentPages: newRecentPages };
        });
      },

      clearRecentPages: () => {
        set({ recentPages: [] });
      },

      updatePreferences: (newPreferences) => {
        set((state) => ({
          preferences: { ...state.preferences, ...newPreferences }
        }));
      },

      setFocusedItem: (itemId) => {
        set({ focusedItemId: itemId });
      },
    }),
    {
      name: 'navigation-store',
      partialize: (state) => ({
        expandedSections: state.expandedSections,
        recentPages: state.recentPages,
        preferences: state.preferences,
      }),
    }
  )
);

// Navigation data with enhanced features
export const navigationData = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    href: '/',
    icon: 'HomeIcon',
    iconSolid: 'HomeIconSolid',
  },
  {
    id: 'politicians',
    name: 'Politicians',
    href: '/search',
    icon: 'UserGroupIcon',
    iconSolid: 'UserGroupIconSolid',
    enhanced: true,
  },
  {
    id: 'party-analytics',
    name: 'Party Analytics',
    href: '/party',
    icon: 'ChartBarIcon',
    iconSolid: 'ChartBarIconSolid',
    enhanced: true,
  },
  {
    id: 'search',
    name: 'Search',
    href: '/search',
    icon: 'MagnifyingGlassIcon',
    iconSolid: 'MagnifyingGlassIconSolid',
    enhanced: true,
  },
  {
    id: 'advanced-analysis',
    name: 'Advanced Analysis',
    enhanced: true,
    badge: {
      text: 'New',
      color: 'purple' as const,
    },
    subItems: [
      {
        id: 'geographic-analysis',
        name: 'Geographic Analysis',
        href: '/analysis/geographic',
        emoji: '🗺️',
      },
      {
        id: 'demographic-insights',
        name: 'Demographic Insights',
        href: '/analysis/demographic',
        emoji: '👥',
        badge: {
          text: 'New',
          color: 'green' as const,
        },
      },
      {
        id: 'sentiment-deep-dive',
        name: 'Sentiment Deep Dive',
        href: '/analysis/sentiment',
        emoji: '💭',
        badge: {
          text: 'New',
          color: 'blue' as const,
        },
      },
      {
        id: 'topic-trends',
        name: 'Topic Trends',
        href: '/analysis/topics',
        emoji: '📊',
        badge: {
          text: 'New',
          color: 'yellow' as const,
        },
      },
      {
        id: 'engagement-patterns',
        name: 'Engagement Patterns',
        href: '/analysis/engagement',
        emoji: '🚀',
        badge: {
          text: 'New',
          color: 'red' as const,
        },
      },
      {
        id: 'time-analysis',
        name: 'Time Analysis',
        href: '/analysis/temporal',
        emoji: '⏰',
        badge: {
          text: 'New',
          color: 'indigo' as const,
        },
      },
    ],
  },
  {
    id: 'trending',
    name: 'Trending',
    href: '/trending',
    icon: 'TrendingUpIcon',
  },
  {
    id: 'profile',
    name: 'Profile',
    href: '/profile',
    icon: 'UserIcon',
  },
];