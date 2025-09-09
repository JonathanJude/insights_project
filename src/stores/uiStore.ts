import { create } from 'zustand';
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
}

const initialState: UIState = {
  sidebarOpen: true,
  theme: 'light',
  loading: false,
  error: null
};

export const useUIStore = create<UIStore>()((set, get) => ({
  ...initialState,
  
  // Notification state
  notifications: [],
  
  // Sidebar actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  openSidebar: () => set({ sidebarOpen: true }),
  closeSidebar: () => set({ sidebarOpen: false }),
  
  // Theme actions
  toggleTheme: () => {
    const currentTheme = get().theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    // Apply theme to document
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', newTheme);
    }
    
    set({ theme: newTheme });
  },
  setTheme: (theme: 'light' | 'dark') => {
    // Apply theme to document
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
    
    set({ theme });
  },
  
  // Loading actions
  setLoading: (loading: boolean) => set({ loading }),
  
  // Error actions
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
  
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
  
  clearNotifications: () => set({ notifications: [] })
}));

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