import React, { useState } from 'react';
import type { Politician } from '../../types';
import { generatePoliticianPlaceholder, getImageDimensions } from '../../utils/imageUtils';

interface PoliticianImageProps {
  politician: Politician;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
}

const PoliticianImage: React.FC<PoliticianImageProps> = ({ 
  politician, 
  size = 'md', 
  className = '',
  alt
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { width, height } = getImageDimensions(size);
  const placeholderUrl = generatePoliticianPlaceholder(politician.name, width, height);
  
  // Use placeholder if no image URL or if image failed to load
  const imageUrl = (!politician.imageUrl || imageError) ? placeholderUrl : politician.imageUrl;
  
  const handleImageLoad = () => {
    setIsLoading(false);
  };
  
  const handleImageError = () => {
    setImageError(true);
    setIsLoading(false);
  };
  
  const containerStyle = {
    width: `${width}px`,
    height: `${height}px`
  };
  
  return (
    <div className="relative" style={containerStyle}>
      {isLoading && (
        <div 
          className="absolute inset-0 bg-secondary rounded-full animate-pulse" 
          style={containerStyle}
        />
      )}
      <img
        src={imageUrl}
        alt={alt || politician.name}
        className={`w-full h-full rounded-full object-cover transition-opacity duration-200 ${className}`}
        style={{
          opacity: isLoading ? 0 : 1
        }}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
      />
    </div>
  );
};

export default PoliticianImage;