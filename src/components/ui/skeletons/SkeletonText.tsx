import React from 'react';
import SkeletonBase from './SkeletonBase';

interface SkeletonTextProps {
  lines?: number;
  className?: string;
  lineHeight?: 'sm' | 'md' | 'lg';
  width?: string[];
  spacing?: 'sm' | 'md' | 'lg';
}

const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 1,
  className = '',
  lineHeight = 'md',
  width,
  spacing = 'md'
}) => {
  const heightClasses = {
    sm: 'h-3',
    md: 'h-4',
    lg: 'h-5'
  };

  const spacingClasses = {
    sm: 'space-y-1',
    md: 'space-y-2',
    lg: 'space-y-3'
  };

  const defaultWidths = ['100%', '85%', '90%', '75%', '95%'];

  return (
    <div className={`${spacingClasses[spacing]} ${className}`}>
      {Array.from({ length: lines }).map((_, index) => {
        const lineWidth = width?.[index] || defaultWidths[index % defaultWidths.length];
        return (
          <SkeletonBase
            key={index}
            className={heightClasses[lineHeight]}
            width={lineWidth}
          />
        );
      })}
    </div>
  );
};

export default SkeletonText;