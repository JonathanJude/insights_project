/**
 * Utility functions for generating safe CSS classes for sentiment visualization
 */

export const getSentimentColorClass = (sentiment: number, intensity?: number): string => {
  const normalizedIntensity = intensity || Math.abs(sentiment);
  
  if (sentiment > 0) {
    if (normalizedIntensity > 0.7) return 'bg-green-500 text-white';
    if (normalizedIntensity > 0.4) return 'bg-green-300 text-white';
    return 'bg-green-100 text-gray-800';
  } else if (sentiment < 0) {
    if (normalizedIntensity > 0.7) return 'bg-red-500 text-white';
    if (normalizedIntensity > 0.4) return 'bg-red-300 text-white';
    return 'bg-red-100 text-gray-800';
  } else {
    return 'bg-gray-100 text-gray-800';
  }
};

export const getBorderColorClass = (sentiment: number): string => {
  if (sentiment > 0) return 'border-green-500 bg-green-50';
  if (sentiment < 0) return 'border-red-500 bg-red-50';
  return 'border-gray-500 bg-gray-50';
};

export const getIntensityColorClass = (value: number, maxValue: number, colorType: 'green' | 'red' | 'blue' = 'blue'): string => {
  const intensity = value / maxValue;
  
  switch (colorType) {
    case 'green':
      if (intensity > 0.7) return 'bg-green-500 text-white';
      if (intensity > 0.4) return 'bg-green-300 text-white';
      return 'bg-green-100 text-gray-800';
    case 'red':
      if (intensity > 0.7) return 'bg-red-500 text-white';
      if (intensity > 0.4) return 'bg-red-300 text-white';
      return 'bg-red-100 text-gray-800';
    case 'blue':
    default:
      if (intensity > 0.7) return 'bg-blue-500 text-white';
      if (intensity > 0.4) return 'bg-blue-300 text-white';
      return 'bg-blue-100 text-gray-800';
  }
};

export const getAccessibilityColorClass = (level: string): string => {
  switch (level.toLowerCase()) {
    case 'high':
      return 'bg-green-100 text-green-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};