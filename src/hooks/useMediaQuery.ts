import { useEffect, useState } from 'react';

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

// Mobile-specific hooks for common breakpoints
export const useIsMobile = (): boolean => {
  return useMediaQuery('(max-width: 767px)');
};

export const useIsTablet = (): boolean => {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
};

export const useIsDesktop = (): boolean => {
  return useMediaQuery('(min-width: 1024px)');
};

// Touch device detection
export const useIsTouchDevice = (): boolean => {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    
    checkTouch();
    // Re-check on resize in case device orientation changes
    window.addEventListener('resize', checkTouch);
    return () => window.removeEventListener('resize', checkTouch);
  }, []);

  return isTouch;
};

// Combined mobile and touch detection
export const useMobileTouch = (): { isMobile: boolean; isTouch: boolean; isMobileTouch: boolean } => {
  const isMobile = useIsMobile();
  const isTouch = useIsTouchDevice();
  
  return {
    isMobile,
    isTouch,
    isMobileTouch: isMobile && isTouch
  };
};