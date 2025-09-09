import { useIsFetching, useIsMutating } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useUIStore } from '../stores/uiStore';

interface GlobalLoadingState {
  isLoading: boolean;
  loadingOperations: string[];
  progress: number;
}

interface UseGlobalLoadingOptions {
  includeBackground?: boolean;
  minLoadingTime?: number;
  debounceTime?: number;
}

export const useGlobalLoading = (options: UseGlobalLoadingOptions = {}): GlobalLoadingState => {
  const {
    includeBackground = false,
    minLoadingTime = 300,
    debounceTime = 100
  } = options;

  const [loadingState, setLoadingState] = useState<GlobalLoadingState>({
    isLoading: false,
    loadingOperations: [],
    progress: 0
  });

  const [loadingStartTime, setLoadingStartTime] = useState<number | null>(null);
  const [debouncedLoading, setDebouncedLoading] = useState(false);

  // Get loading states from various sources
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const uiLoading = useUIStore(state => state.loading);

  // Calculate if we're currently loading
  const isCurrentlyLoading = isFetching > 0 || isMutating > 0 || uiLoading;

  // Debounce loading state changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLoading(isCurrentlyLoading);
    }, debounceTime);

    return () => clearTimeout(timer);
  }, [isCurrentlyLoading, debounceTime]);

  // Handle loading state transitions with minimum loading time
  useEffect(() => {
    if (debouncedLoading && !loadingState.isLoading) {
      // Starting to load
      setLoadingStartTime(Date.now());
      setLoadingState(prev => ({
        ...prev,
        isLoading: true,
        loadingOperations: ['Global operations'],
        progress: 0
      }));
    } else if (!debouncedLoading && loadingState.isLoading) {
      // Stopping load - check minimum time
      const elapsed = loadingStartTime ? Date.now() - loadingStartTime : minLoadingTime;
      
      if (elapsed >= minLoadingTime) {
        // Minimum time has passed, stop immediately
        setLoadingState(prev => ({
          ...prev,
          isLoading: false,
          loadingOperations: [],
          progress: 100
        }));
        setLoadingStartTime(null);
      } else {
        // Wait for minimum time to pass
        const remainingTime = minLoadingTime - elapsed;
        setTimeout(() => {
          setLoadingState(prev => ({
            ...prev,
            isLoading: false,
            loadingOperations: [],
            progress: 100
          }));
          setLoadingStartTime(null);
        }, remainingTime);
      }
    }
  }, [debouncedLoading, loadingState.isLoading, loadingStartTime, minLoadingTime]);

  // Update progress during loading
  useEffect(() => {
    if (!loadingState.isLoading) return;

    const interval = setInterval(() => {
      setLoadingState(prev => {
        if (!prev.isLoading) return prev;
        
        const newProgress = Math.min(prev.progress + Math.random() * 10, 90);
        return {
          ...prev,
          progress: newProgress
        };
      });
    }, 200);

    return () => clearInterval(interval);
  }, [loadingState.isLoading]);

  return loadingState;
};

// Hook for component-specific loading states
export const useComponentLoading = (componentName: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startLoading = () => {
    setIsLoading(true);
    setError(null);
  };

  const stopLoading = () => {
    setIsLoading(false);
  };

  const setLoadingError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  };

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setError: setLoadingError,
    clearError: () => setError(null)
  };
};

// Hook for managing loading transitions
export const useLoadingTransition = (isLoading: boolean, minDuration = 300) => {
  const [showLoading, setShowLoading] = useState(isLoading);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (isLoading && !showLoading) {
      // Start loading
      setStartTime(Date.now());
      setShowLoading(true);
    } else if (!isLoading && showLoading) {
      // Stop loading - check minimum duration
      const elapsed = startTime ? Date.now() - startTime : minDuration;
      
      if (elapsed >= minDuration) {
        setShowLoading(false);
        setStartTime(null);
      } else {
        const remainingTime = minDuration - elapsed;
        setTimeout(() => {
          setShowLoading(false);
          setStartTime(null);
        }, remainingTime);
      }
    }
  }, [isLoading, showLoading, startTime, minDuration]);

  return showLoading;
};