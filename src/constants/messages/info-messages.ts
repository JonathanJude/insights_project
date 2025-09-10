// Informational Message Constants
export const INFO_MESSAGES = {
  // Loading States
  LOADING_DATA: 'Loading data, please wait...',
  LOADING_POLITICIANS: 'Loading politician profiles...',
  LOADING_PARTIES: 'Loading political party information...',
  LOADING_SENTIMENT: 'Analyzing sentiment data...',
  LOADING_CHARTS: 'Preparing charts and visualizations...',
  LOADING_SEARCH: 'Searching through political data...',
  
  // Data Status
  DATA_REFRESHING: 'Refreshing data with latest information...',
  DATA_SYNCING: 'Synchronizing data across all components...',
  DATA_PROCESSING: 'Processing data for analysis...',
  DATA_VALIDATING: 'Validating data integrity...',
  
  // Search Information
  SEARCH_IN_PROGRESS: 'Searching through political database...',
  SEARCH_INDEXING: 'Updating search index with latest content...',
  SEARCH_NO_RESULTS: 'No results found. Try adjusting your search terms or filters.',
  SEARCH_PARTIAL_RESULTS: 'Showing partial results. Refine your search for more specific results.',
  SEARCH_TOO_MANY_RESULTS: 'Too many results found. Consider adding more specific filters.',
  
  // Filter Information
  FILTERS_ACTIVE: 'Active filters are affecting the displayed results',
  FILTERS_AVAILABLE: 'Use filters to narrow down your search results',
  FILTERS_RECOMMENDED: 'Try using filters to find more specific information',
  FILTERS_CLEARED_INFO: 'All filters have been cleared. Showing all available data.',
  
  // Export Information
  EXPORT_PREPARING: 'Preparing your export file...',
  EXPORT_PROCESSING: 'Processing data for export...',
  EXPORT_LARGE_DATASET: 'Large dataset detected. Export may take a few moments.',
  EXPORT_FORMAT_INFO: 'Choose your preferred export format from the options below',
  
  // Chart Information
  CHART_UPDATING: 'Updating chart with new data...',
  CHART_RENDERING: 'Rendering visualization...',
  CHART_NO_DATA: 'No data available for the selected criteria',
  CHART_INSUFFICIENT_DATA: 'Insufficient data for meaningful visualization',
  CHART_INTERACTIVE_HINT: 'Click and drag to interact with the chart',
  
  // Data Quality Information
  DATA_QUALITY_EXCELLENT: 'Data quality is excellent with high confidence scores',
  DATA_QUALITY_GOOD: 'Data quality is good with reliable information',
  DATA_QUALITY_FAIR: 'Data quality is fair. Some information may be incomplete',
  DATA_QUALITY_POOR: 'Data quality is limited. Results should be interpreted carefully',
  
  // System Status
  SYSTEM_ONLINE: 'All systems are operational',
  SYSTEM_MAINTENANCE: 'System maintenance in progress. Some features may be limited.',
  SYSTEM_UPDATING: 'System is updating with the latest features',
  CACHE_WARMING: 'Warming up cache for better performance...',
  
  // User Guidance
  FIRST_TIME_USER: 'Welcome! Use the search bar or filters to explore political data.',
  FEATURE_TOUR_AVAILABLE: 'Take a tour to learn about all available features',
  HELP_AVAILABLE: 'Need help? Click the help icon for guidance and tips',
  KEYBOARD_SHORTCUTS: 'Press Ctrl+K to open quick search, or Ctrl+H for help',
  
  // Data Freshness
  DATA_LAST_UPDATED: 'Data was last updated {timestamp}',
  DATA_REAL_TIME: 'Showing real-time data',
  DATA_CACHED: 'Showing cached data for faster performance',
  DATA_STALE: 'Data may be outdated. Consider refreshing for latest information.',
  
  // Privacy and Security
  PRIVACY_NOTICE: 'Your privacy is protected. No personal data is stored.',
  DATA_ANONYMIZED: 'All data has been anonymized for privacy protection',
  SECURE_CONNECTION: 'Your connection is secure and encrypted',
  
  // Performance Information
  PERFORMANCE_OPTIMIZED: 'Interface optimized for your device',
  SLOW_CONNECTION_DETECTED: 'Slow connection detected. Optimizing for better performance.',
  LARGE_DATASET_WARNING: 'Large dataset may affect performance on slower devices',
  
  // Feature Availability
  FEATURE_BETA: 'This feature is in beta. Your feedback is welcome.',
  FEATURE_COMING_SOON: 'This feature is coming soon. Stay tuned for updates.',
  FEATURE_PREMIUM: 'This is a premium feature. Upgrade to access.',
  FEATURE_EXPERIMENTAL: 'This is an experimental feature. Use with caution.',
  
  // Accessibility
  ACCESSIBILITY_MODE: 'Accessibility mode is enabled',
  SCREEN_READER_SUPPORT: 'Screen reader support is available',
  HIGH_CONTRAST_MODE: 'High contrast mode is active',
  KEYBOARD_NAVIGATION: 'Use Tab and Enter keys for navigation'
};

// Contextual Information Messages
export const CONTEXTUAL_INFO_MESSAGES = {
  // Dashboard Context
  DASHBOARD_OVERVIEW: 'This dashboard provides an overview of Nigerian political sentiment and trends',
  DASHBOARD_REAL_TIME: 'Dashboard updates automatically with the latest political insights',
  
  // Politician Context
  POLITICIAN_PROFILE_INFO: 'Comprehensive profile including political history and public sentiment',
  POLITICIAN_SENTIMENT_INFO: 'Sentiment analysis based on social media mentions and public discourse',
  
  // Party Context
  PARTY_ANALYTICS_INFO: 'Detailed analytics comparing party performance and public perception',
  PARTY_COMPARISON_INFO: 'Compare multiple parties across various metrics and time periods',
  
  // Geographic Context
  GEOGRAPHIC_ANALYSIS_INFO: 'Geographic breakdown of political sentiment across Nigerian states',
  STATE_LEVEL_INFO: 'State-level analysis including demographic and political insights',
  
  // Temporal Context
  TEMPORAL_ANALYSIS_INFO: 'Track political trends and sentiment changes over time',
  ELECTION_CYCLE_INFO: 'Analysis focused on election periods and campaign activities',
  
  // Data Source Context
  DATA_SOURCE_SOCIAL: 'Data sourced from major social media platforms',
  DATA_SOURCE_NEWS: 'Information gathered from reputable news sources',
  DATA_SOURCE_OFFICIAL: 'Official data from government and electoral sources'
};

// Dynamic Information Messages
export const DYNAMIC_INFO_MESSAGES = {
  RESULTS_COUNT: (count: number) => 
    count === 0 ? 'No results to display' :
    count === 1 ? 'Showing 1 result' :
    `Showing ${count} results`,
    
  LOADING_PROGRESS: (percentage: number) => 
    `Loading... ${percentage}% complete`,
    
  TIME_REMAINING: (seconds: number) => 
    seconds < 60 ? `Estimated ${seconds} seconds remaining` :
    `Estimated ${Math.ceil(seconds / 60)} minutes remaining`,
    
  DATA_AGE: (hours: number) => 
    hours < 1 ? 'Data updated less than an hour ago' :
    hours < 24 ? `Data updated ${hours} hours ago` :
    `Data updated ${Math.floor(hours / 24)} days ago`,
    
  CACHE_STATUS: (hitRate: number) => 
    `Cache hit rate: ${hitRate}% (${hitRate > 80 ? 'Excellent' : hitRate > 60 ? 'Good' : 'Fair'} performance)`
};

// Information Message Utilities
export const InfoMessageUtils = {
  getMessage: (key: keyof typeof INFO_MESSAGES): string => {
    return INFO_MESSAGES[key] || 'Information not available';
  },

  getContextualMessage: (key: keyof typeof CONTEXTUAL_INFO_MESSAGES): string => {
    return CONTEXTUAL_INFO_MESSAGES[key] || 'Context information not available';
  },

  getDynamicMessage: (key: keyof typeof DYNAMIC_INFO_MESSAGES, ...args: any[]): string => {
    const messageFunction = DYNAMIC_INFO_MESSAGES[key];
    return typeof messageFunction === 'function' ? (messageFunction as any)(...args) : 'Dynamic information not available';
  },

  formatWithTimestamp: (message: string, timestamp: Date): string => {
    const formattedTime = timestamp.toLocaleString();
    return message.replace('{timestamp}', formattedTime);
  },

  formatWithData: (message: string, data: Record<string, any>): string => {
    let formattedMessage = message;
    Object.entries(data).forEach(([key, value]) => {
      formattedMessage = formattedMessage.replace(`{${key}}`, String(value));
    });
    return formattedMessage;
  },

  getLoadingMessage: (context?: string): string => {
    if (!context) return INFO_MESSAGES.LOADING_DATA;
    
    const contextMessages: Record<string, string> = {
      politicians: INFO_MESSAGES.LOADING_POLITICIANS,
      parties: INFO_MESSAGES.LOADING_PARTIES,
      sentiment: INFO_MESSAGES.LOADING_SENTIMENT,
      charts: INFO_MESSAGES.LOADING_CHARTS,
      search: INFO_MESSAGES.LOADING_SEARCH
    };
    
    return contextMessages[context] || INFO_MESSAGES.LOADING_DATA;
  }
};