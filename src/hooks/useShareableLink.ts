import { useCallback, useEffect, useState } from 'react';
import type { EnhancedShareableState, ShareableLinkOptions } from '../lib/shareableLinkUtils';
import { generateShareableLink, parseShareableLink } from '../lib/shareableLinkUtils';
import { useFilterStore } from '../stores/filterStore';

/**
 * Hook for managing shareable links with multi-dimensional state
 */
export const useShareableLink = () => {
  const [shareableState, setShareableState] = useState<Partial<EnhancedShareableState>>({});
  const [currentLink, setCurrentLink] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const filterState = useFilterStore();

  /**
   * Generate a shareable link with current state
   */
  const generateLink = useCallback(async (
    customState?: Partial<EnhancedShareableState>,
    options?: ShareableLinkOptions
  ): Promise<string> => {
    try {
      setIsGenerating(true);
      setError(null);

      const stateToShare = customState || {
        filters: filterState,
        view: { page: window.location.pathname.slice(1) || 'dashboard' },
        preferences: {
          showConfidenceScores: true,
          showDataQuality: true,
          showUndefinedData: true,
          chartTheme: 'auto' as const,
          compactMode: false
        }
      };

      const link = generateShareableLink(stateToShare, options);
      setCurrentLink(link);
      setShareableState(stateToShare);
      
      return link;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate shareable link';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [filterState]);

  /**
   * Parse a shareable link from URL parameters
   */
  const parseFromUrl = useCallback((): EnhancedShareableState | null => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const shareParam = urlParams.get('share');
      
      if (!shareParam) {
        return null;
      }

      const parsedState = parseShareableLink(shareParam);
      if (parsedState) {
        setShareableState(parsedState);
      }
      
      return parsedState;
    } catch (err) {
      console.error('Failed to parse shareable link from URL:', err);
      setError('Invalid shareable link');
      return null;
    }
  }, []);

  /**
   * Apply shared state to current application state
   */
  const applySharedState = useCallback((state: EnhancedShareableState) => {
    try {
      // Apply filters to filter store
      if (state.filters && Object.keys(state.filters).length > 0) {
        // Update filter store with shared filters
        Object.entries(state.filters).forEach(([key, value]) => {
          if (value !== undefined) {
            filterState[key as keyof typeof filterState] = value;
          }
        });
      }

      // Apply multi-dimensional filters if available
      if (state.multiDimensionalFilters) {
        // Store multi-dimensional filters in a way that components can access them
        // This would typically be stored in a dedicated multi-dimensional filter store
        sessionStorage.setItem('multiDimensionalFilters', JSON.stringify(state.multiDimensionalFilters));
      }

      // Apply preferences
      if (state.preferences) {
        sessionStorage.setItem('sharedPreferences', JSON.stringify(state.preferences));
      }

      // Navigate to the shared view if different from current
      if (state.view?.page && state.view.page !== window.location.pathname.slice(1)) {
        const targetPath = state.view.page === 'dashboard' ? '/' : `/${state.view.page}`;
        window.history.pushState({}, '', targetPath + window.location.search);
      }

      setShareableState(state);
      setError(null);
    } catch (err) {
      console.error('Failed to apply shared state:', err);
      setError('Failed to apply shared settings');
    }
  }, [filterState]);

  /**
   * Copy current link to clipboard
   */
  const copyCurrentLink = useCallback(async (): Promise<void> => {
    if (!currentLink) {
      throw new Error('No link to copy');
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(currentLink);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = currentLink;
        textArea.style.position = 'absolute';
        textArea.style.left = '-999999px';
        
        document.body.prepend(textArea);
        textArea.select();
        
        try {
          document.execCommand('copy');
        } finally {
          textArea.remove();
        }
      }
    } catch (err) {
      throw new Error('Failed to copy link to clipboard');
    }
  }, [currentLink]);

  /**
   * Clear current shareable state
   */
  const clearSharedState = useCallback(() => {
    setShareableState({});
    setCurrentLink('');
    setError(null);
    
    // Clear stored shared data
    sessionStorage.removeItem('multiDimensionalFilters');
    sessionStorage.removeItem('sharedPreferences');
    
    // Remove share parameter from URL
    const url = new URL(window.location.href);
    url.searchParams.delete('share');
    window.history.replaceState({}, '', url.toString());
  }, []);

  /**
   * Check if current state has been shared
   */
  const isSharedState = useCallback((): boolean => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('share');
  }, []);

  /**
   * Get stored multi-dimensional filters
   */
  const getMultiDimensionalFilters = useCallback(() => {
    try {
      const stored = sessionStorage.getItem('multiDimensionalFilters');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  /**
   * Get stored shared preferences
   */
  const getSharedPreferences = useCallback(() => {
    try {
      const stored = sessionStorage.getItem('sharedPreferences');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  // Auto-parse shared state on mount
  useEffect(() => {
    const parsedState = parseFromUrl();
    if (parsedState) {
      applySharedState(parsedState);
    }
  }, [parseFromUrl, applySharedState]);

  return {
    // State
    shareableState,
    currentLink,
    isGenerating,
    error,
    
    // Actions
    generateLink,
    parseFromUrl,
    applySharedState,
    copyCurrentLink,
    clearSharedState,
    
    // Utilities
    isSharedState,
    getMultiDimensionalFilters,
    getSharedPreferences,
    
    // Setters
    setShareableState,
    setError
  };
};

export default useShareableLink;