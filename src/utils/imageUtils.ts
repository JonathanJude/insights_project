// Image placeholder utility functions

export interface ImageConfig {
  width: number;
  height: number;
  backgroundColor?: string;
  textColor?: string;
  text?: string;
}

/**
 * Generate a placeholder image URL using placehold.co
 */
export const generatePlaceholderUrl = (config: ImageConfig): string => {
  const { 
    width, 
    height, 
    backgroundColor = '3b82f6', 
    textColor = 'ffffff', 
    text 
  } = config;
  
  const displayText = text || `${width}x${height}`;
  return `https://placehold.co/${width}x${height}/${backgroundColor}/${textColor}.png?text=${encodeURIComponent(displayText)}`;
};

/**
 * Generate initials from a full name
 */
export const generateInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .slice(0, 2); // Limit to 2 characters
};

/**
 * Generate a placeholder URL for a politician with their initials
 */
export const generatePoliticianPlaceholder = (
  name: string, 
  width: number = 80, 
  height: number = 80
): string => {
  const initials = generateInitials(name);
  return generatePlaceholderUrl({
    width,
    height,
    text: initials,
    backgroundColor: '6366f1', // Indigo color
    textColor: 'ffffff'
  });
};

/**
 * Get appropriate dimensions for different image sizes
 */
export const getImageDimensions = (size: 'sm' | 'md' | 'lg' | 'xl') => {
  const dimensions = {
    sm: { width: 40, height: 40 },
    md: { width: 80, height: 80 },
    lg: { width: 120, height: 120 },
    xl: { width: 200, height: 200 }
  };
  
  return dimensions[size];
};