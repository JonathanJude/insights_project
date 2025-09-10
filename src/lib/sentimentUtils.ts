/**
 * Utility functions for sentiment analysis and color coding
 */

export const getSentimentColor = (score: number): string => {
  if (score > 0.3) return '#10B981'; // Green for positive
  if (score < -0.3) return '#EF4444'; // Red for negative
  return '#6B7280'; // Gray for neutral
};

export const getSentimentLabel = (score: number): string => {
  if (score > 0.3) return 'Positive';
  if (score < -0.3) return 'Negative';
  return 'Neutral';
};

export const getSentimentIntensity = (score: number): 'low' | 'medium' | 'high' => {
  const absScore = Math.abs(score);
  if (absScore > 0.7) return 'high';
  if (absScore > 0.3) return 'medium';
  return 'low';
};

export const formatSentimentScore = (score: number): string => {
  return (score * 100).toFixed(1) + '%';
};

export const getSentimentTrend = (current: number, previous: number): 'up' | 'down' | 'stable' => {
  const diff = current - previous;
  if (Math.abs(diff) < 0.05) return 'stable';
  return diff > 0 ? 'up' : 'down';
};

export const getSentimentTrendIcon = (trend: 'up' | 'down' | 'stable'): string => {
  switch (trend) {
    case 'up': return '📈';
    case 'down': return '📉';
    case 'stable': return '➡️';
  }
};