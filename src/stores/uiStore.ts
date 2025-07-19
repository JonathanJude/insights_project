import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import type { UIState } from '../types';

interface UIStore extends UIState {
  // Sidebar actions
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  
  // Theme actions
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Loading actions
  setLoading: (loading: boolean) => void;
  
  // Error actions
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Modal and overlay states
  modals: {
    searchModal: boolean;
    filterModal: boolean;
    politicianModal: boolean;
    exportModal: boolean;
  };
  
  // Modal actions
  openModal: (modal: keyof UIStore['modals']) => void;
  closeModal: (modal: keyof UIStore['modals']) => void;
  closeAllModals: () => void;
  
  // Notification state
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: number;
    duration?: number;
  }>;
  
  // Notification actions
  addNotification: (notification: Omit<UIStore['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Mobile detection
  isMobile: boolean;
  setIsMobile: (isMobile: boolean) => void;
  
  // Search state
  searchHistory: string[];
  addToSearchHistory: (query: string) => void;
  clearSearchHistory: () => void;
  
  // Recent views
  recentPoliticians: string[]; // politician IDs
  addRecentPolitician: (politicianId: string) => void;
  addToRecentlyViewed: (politician: { id: string }) => void;
  clearRecentPoliticians: () => void;
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: 'light',
  loading: false,
  error: null
};

export const useUIStore = create<UIStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Modal states
        modals: {
          searchModal: false,
          filterModal: false,
          politicianModal: false,
          exportModal: false
        },
        
        // Notification state
        notifications: [],
        
        // Mobile state
        isMobile: false,
        
        // Search history
        searchHistory: [],
        
        // Recent politicians
        recentPoliticians: [],
        
        // Sidebar actions
        toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        openSidebar: () => set({ sidebarOpen: true }),
        closeSidebar: () => set({ sidebarOpen: false }),
        
        // Theme actions
        toggleTheme: () => set((state) => ({ 
          theme: state.theme === 'light' ? 'dark' : 'light' 
        })),
        setTheme: (theme: 'light' | 'dark') => set({ theme }),
        
        // Loading actions
        setLoading: (loading: boolean) => set({ loading }),
        
        // Error actions
        setError: (error: string | null) => set({ error }),
        clearError: () => set({ error: null }),
        
        // Modal actions
        openModal: (modal: keyof UIStore['modals']) => set((state) => ({
          modals: { ...state.modals, [modal]: true }
        })),
        
        closeModal: (modal: keyof UIStore['modals']) => set((state) => ({
          modals: { ...state.modals, [modal]: false }
        })),
        
        closeAllModals: () => set((state) => ({
          modals: Object.keys(state.modals).reduce((acc, key) => {
            acc[key as keyof typeof state.modals] = false;
            return acc;
          }, {} as typeof state.modals)
        })),
        
        // Notification actions
        addNotification: (notification: Omit<UIStore['notifications'][0], 'id' | 'timestamp'>) => {
          const id = Math.random().toString(36).substr(2, 9);
          const timestamp = Date.now();
          const newNotification = {
            ...notification,
            id,
            timestamp,
            duration: notification.duration || 5000
          };
          
          set((state) => ({
            notifications: [...state.notifications, newNotification]
          }));
          
          // Auto-remove notification after duration
          if (newNotification.duration > 0) {
            setTimeout(() => {
              get().removeNotification(id);
            }, newNotification.duration);
          }
        },
        
        removeNotification: (id: string) => set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id)
        })),
        
        clearNotifications: () => set({ notifications: [] }),
        
        // Mobile detection
        setIsMobile: (isMobile: boolean) => set({ isMobile }),
        
        // Search history actions
        addToSearchHistory: (query: string) => {
          if (!query.trim()) return;
          
          set((state) => {
            const filtered = state.searchHistory.filter((item) => item !== query);
            const updated = [query, ...filtered].slice(0, 10); // Keep last 10 searches
            return { searchHistory: updated };
          });
        },
        
        clearSearchHistory: () => set({ searchHistory: [] }),
        
        // Recent politicians actions
        addRecentPolitician: (politicianId: string) => {
          set((state) => {
            const filtered = state.recentPoliticians.filter((id) => id !== politicianId);
            const updated = [politicianId, ...filtered].slice(0, 5); // Keep last 5 viewed
            return { recentPoliticians: updated };
          });
        },
        
        addToRecentlyViewed: (politician: { id: string }) => {
          set((state) => {
            const filtered = state.recentPoliticians.filter((id) => id !== politician.id);
            const updated = [politician.id, ...filtered].slice(0, 5); // Keep last 5 viewed
            return { recentPoliticians: updated };
          });
        },
        
        clearRecentPoliticians: () => set({ recentPoliticians: [] })
      }),
      {
        name: 'ui-store',
        storage: createJSONStorage(() => localStorage),
        partialize: (state: UIStore) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
          searchHistory: state.searchHistory,
          recentPoliticians: state.recentPoliticians
        })
      }
    ),
    { name: 'ui-store' }
  )
);

// Utility hooks for common UI operations
export const useNotification = () => {
  const addNotification = useUIStore(state => state.addNotification);
  
  return {
    success: (title: string, message: string) => 
      addNotification({ type: 'success', title, message }),
    error: (title: string, message: string) => 
      addNotification({ type: 'error', title, message }),
    warning: (title: string, message: string) => 
      addNotification({ type: 'warning', title, message }),
    info: (title: string, message: string) => 
      addNotification({ type: 'info', title, message })
  };
};

export const useTheme = () => {
  const theme = useUIStore(state => state.theme);
  const toggleTheme = useUIStore(state => state.toggleTheme);
  const setTheme = useUIStore(state => state.setTheme);
  
  return { theme, toggleTheme, setTheme };
};

export const useSidebar = () => {
  const sidebarOpen = useUIStore(state => state.sidebarOpen);
  const toggleSidebar = useUIStore(state => state.toggleSidebar);
  const openSidebar = useUIStore(state => state.openSidebar);
  const closeSidebar = useUIStore(state => state.closeSidebar);
  
  return { sidebarOpen, toggleSidebar, openSidebar, closeSidebar };
};