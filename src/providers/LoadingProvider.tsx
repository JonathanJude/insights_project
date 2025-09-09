import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUIStore } from '../stores/uiStore';

interface LoadingContextType {
  isGlobalLoading: boolean;
  loadingComponents: Set<string>;
  registerLoading: (componentId: string) => void;
  unregisterLoading: (componentId: string) => void;
  setComponentLoading: (componentId: string, loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: React.ReactNode;
  minLoadingTime?: number;
  debounceTime?: number;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
  minLoadingTime = 300,
  debounceTime = 100
}) => {
  const [loadingComponents, setLoadingComponents] = useState<Set<string>>(new Set());
  const [debouncedLoading, setDebouncedLoading] = useState(false);
  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);

  // Get loading states from various sources
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const uiLoading = useUIStore(state => state.loading);

  // Calculate if we're currently loading
  const isCurrentlyLoading = isFetching > 0 || isMutating > 0 || uiLoading || loadingComponents.size > 0;

  // Debounce loading state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLoading(isCurrentlyLoading);
    }, debounceTime);

    return () => clearTimeout(timer);
  }, [isCurrentlyLoading, debounceTime]);

  // Handle loading state transitions with minimum loading time
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  useEffect(() => {
    if (debouncedLoading && !isGlobalLoading) {
      // Starting to load
      setLoadingStartTime(Date.now());
      setIsGlobalLoading(true);
    } else if (!debouncedLoading && isGlobalLoading) {
      // Stopping load - check minimum time
      const elapsed = loadingStartTime ? Date.now() - loadingStartTime : minLoadingTime;
      
      if (elapsed >= minLoadingTime) {
        // Minimum time has passed, stop immediately
        setIsGlobalLoading(false);
        setLoadingStartTime(null);
      } else {
        // Wait for minimum time to pass
        const remainingTime = minLoadingTime - elapsed;
        setTimeout(() => {
          setIsGlobalLoading(false);
          setLoadingStartTime(null);
        }, remainingTime);
      }
    }
  }, [debouncedLoading, isGlobalLoading, loadingStartTime, minLoadingTime]);

  const registerLoading = (componentId: string) => {
    setLoadingComponents(prev => new Set(prev).add(componentId));
  };

  const unregisterLoading = (componentId: string) => {
    setLoadingComponents(prev => {
      const newSet = new Set(prev);
      newSet.delete(componentId);
      return newSet;
    });
  };

  const setComponentLoading = (componentId: string, loading: boolean) => {
    if (loading) {
      registerLoading(componentId);
    } else {
      unregisterLoading(componentId);
    }
  };

  const contextValue: LoadingContextType = {
    isGlobalLoading,
    loadingComponents,
    registerLoading,
    unregisterLoading,
    setComponentLoading
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoadingContext = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoadingContext must be used within a LoadingProvider');
  }
  return context;
};

// Hook for component-specific loading management
export const useComponentLoading = (componentId: string) => {
  const { setComponentLoading, loadingComponents } = useLoadingContext();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      setComponentLoading(componentId, false);
    };
  }, [componentId, setComponentLoading]);

  const startLoading = () => {
    setIsLoading(true);
    setComponentLoading(componentId, true);
  };

  const stopLoading = () => {
    setIsLoading(false);
    setComponentLoading(componentId, false);
  };

  return {
    isLoading: loadingComponents.has(componentId),
    startLoading,
    stopLoading
  };
};