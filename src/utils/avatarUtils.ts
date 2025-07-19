/**
 * Avatar utility functions for generating local avatars without external API calls
 */

/**
 * Generate a simple color based on a string (name)
 */
export const getAvatarColor = (name: string): string => {
  const colors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96CEB4', // Green
    '#FFEAA7', // Yellow
    '#DDA0DD', // Purple
    '#98D8C8', // Mint
    '#F7DC6F', // Light Yellow
    '#BDC3C7', // Gray
    '#FF8A80', // Light Red
    '#80CBC4', // Light Teal
    '#81C784', // Light Green
    '#FFB74D', // Orange
    '#CE93D8', // Light Purple
    '#90CAF9', // Light Blue
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Get initials from a full name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

/**
 * Generate a data URL for an SVG avatar
 */
export const generateAvatarDataUrl = (name: string, size: number = 96): string => {
  const initials = getInitials(name);
  const backgroundColor = getAvatarColor(name);
  const textColor = '#FFFFFF';
  const fontSize = Math.round(size * 0.4);
  
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${backgroundColor}" rx="${size / 2}" />
      <text 
        x="50%" 
        y="50%" 
        dominant-baseline="middle" 
        text-anchor="middle" 
        fill="${textColor}" 
        font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
        font-size="${fontSize}" 
        font-weight="600"
      >
        ${initials}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

/**
 * Get fallback avatar URL (local generation)
 */
export const getFallbackAvatarUrl = (name: string, size: number = 96): string => {
  return generateAvatarDataUrl(name, size);
};