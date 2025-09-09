import React, { useEffect, useState } from 'react';
import { useLoadingTransition } from '../../hooks/useGlobalLoading';

interface LoadingTransitionProps {
  isLoading: boolean;
  children: React.ReactNode;
  fallback: React.ReactNode;
  minDuration?: number;
  className?: string;
  fadeTransition?: boolean;
}

const LoadingTransition: React.FC<LoadingTransitionProps> = ({
  isLoading,
  children,
  fallback,
  minDuration = 300,
  className = '',
  fadeTransition = true
}) => {
  const showLoading = useLoadingTransition(isLoading, minDuration);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (showLoading !== isLoading) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, fadeTransition ? 200 : 0);
      
      return () => clearTimeout(timer);
    }
  }, [showLoading, isLoading, fadeTransition]);

  const transitionClasses = fadeTransition
    ? `transition-opacity duration-200 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`
    : '';

  return (
    <div className={`${transitionClasses} ${className}`}>
      {showLoading ? fallback : children}
    </div>
  );
};

export default LoadingTransition;