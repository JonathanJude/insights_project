// Success Message Constants
export const SUCCESS_MESSAGES = {
  // Data Operations
  DATA_LOADED: 'Data loaded successfully',
  DATA_REFRESHED: 'Data has been refreshed with the latest information',
  DATA_UPDATED: 'Data updated successfully',
  DATA_SAVED: 'Your changes have been saved',
  
  // Search Operations
  SEARCH_COMPLETED: 'Search completed successfully',
  SEARCH_RESULTS_FOUND: 'Found {count} results for your search',
  SEARCH_FILTERS_APPLIED: 'Search filters applied successfully',
  SEARCH_CLEARED: 'Search results cleared',
  
  // Filter Operations
  FILTERS_APPLIED: 'Filters applied successfully',
  FILTERS_CLEARED: 'All filters have been cleared',
  FILTERS_SAVED: 'Filter preferences saved',
  FILTERS_RESET: 'Filters reset to default values',
  
  // Export Operations
  EXPORT_STARTED: 'Export process has started',
  EXPORT_COMPLETED: 'Export completed successfully',
  EXPORT_DOWNLOADED: 'File downloaded successfully',
  EXPORT_READY: 'Your export is ready for download',
  
  // Chart Operations
  CHART_LOADED: 'Chart data loaded successfully',
  CHART_UPDATED: 'Chart updated with latest data',
  CHART_EXPORTED: 'Chart exported successfully',
  CHART_REFRESHED: 'Chart refreshed with new data',
  
  // User Actions
  SETTINGS_SAVED: 'Settings saved successfully',
  PREFERENCES_UPDATED: 'Your preferences have been updated',
  THEME_CHANGED: 'Theme changed successfully',
  NOTIFICATION_SENT: 'Notification sent successfully',
  
  // Authentication
  LOGIN_SUCCESS: 'Welcome back! You have successfully logged in',
  LOGOUT_SUCCESS: 'You have been logged out successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  
  // File Operations
  FILE_UPLOADED: 'File uploaded successfully',
  FILE_PROCESSED: 'File processed successfully',
  FILE_DELETED: 'File deleted successfully',
  
  // Generic Success Messages
  OPERATION_COMPLETED: 'Operation completed successfully',
  CHANGES_APPLIED: 'Changes applied successfully',
  ACTION_COMPLETED: 'Action completed successfully',
  TASK_FINISHED: 'Task finished successfully'
};

// Success Messages with Dynamic Content
export const DYNAMIC_SUCCESS_MESSAGES = {
  SEARCH_RESULTS: (count: number) => 
    count === 0 ? 'No results found for your search' :
    count === 1 ? 'Found 1 result for your search' :
    `Found ${count} results for your search`,
    
  ITEMS_LOADED: (count: number, type: string) =>
    count === 0 ? `No ${type} found` :
    count === 1 ? `Loaded 1 ${type}` :
    `Loaded ${count} ${type}`,
    
  FILTERS_APPLIED_COUNT: (count: number) =>
    count === 0 ? 'All filters cleared' :
    count === 1 ? '1 filter applied' :
    `${count} filters applied`,
    
  EXPORT_SIZE: (size: string, format: string) =>
    `${format.toUpperCase()} file (${size}) ready for download`,
    
  TIME_SAVED: (seconds: number) =>
    seconds < 60 ? `Completed in ${seconds} seconds` :
    `Completed in ${Math.round(seconds / 60)} minutes`
};

// Contextual Success Messages for Different Components
export const COMPONENT_SUCCESS_MESSAGES = {
  // Dashboard
  DASHBOARD_LOADED: 'Dashboard loaded with the latest political insights',
  DASHBOARD_REFRESHED: 'Dashboard refreshed with real-time data',
  
  // Politician Profile
  POLITICIAN_PROFILE_LOADED: 'Politician profile loaded successfully',
  POLITICIAN_DATA_UPDATED: 'Politician data updated with latest information',
  
  // Party Analytics
  PARTY_ANALYTICS_LOADED: 'Party analytics loaded successfully',
  PARTY_COMPARISON_READY: 'Party comparison data is ready',
  
  // Sentiment Analysis
  SENTIMENT_ANALYSIS_COMPLETED: 'Sentiment analysis completed successfully',
  SENTIMENT_TRENDS_UPDATED: 'Sentiment trends updated with latest data',
  
  // Geographic Analysis
  GEOGRAPHIC_DATA_LOADED: 'Geographic analysis data loaded successfully',
  MAP_DATA_UPDATED: 'Map visualization updated with current data',
  
  // Search Results
  SEARCH_INDEX_UPDATED: 'Search index updated with latest content',
  ADVANCED_SEARCH_COMPLETED: 'Advanced search completed successfully',
  
  // Data Quality
  DATA_VALIDATION_PASSED: 'All data validation checks passed',
  DATA_INTEGRITY_VERIFIED: 'Data integrity verified successfully',
  
  // Performance
  CACHE_UPDATED: 'Data cache updated for faster loading',
  OPTIMIZATION_APPLIED: 'Performance optimizations applied successfully'
};

// Success Message Categories
export const SUCCESS_MESSAGE_CATEGORIES = {
  DATA: 'Data Operation',
  USER: 'User Action',
  SYSTEM: 'System Operation',
  EXPORT: 'Export Operation',
  SEARCH: 'Search Operation',
  FILTER: 'Filter Operation',
  CHART: 'Chart Operation',
  AUTH: 'Authentication',
  FILE: 'File Operation'
};

// Success Message Utilities
export const SuccessMessageUtils = {
  getMessage: (key: keyof typeof SUCCESS_MESSAGES): string => {
    return SUCCESS_MESSAGES[key] || SUCCESS_MESSAGES.OPERATION_COMPLETED;
  },

  getComponentMessage: (key: keyof typeof COMPONENT_SUCCESS_MESSAGES): string => {
    return COMPONENT_SUCCESS_MESSAGES[key] || SUCCESS_MESSAGES.OPERATION_COMPLETED;
  },

  getDynamicMessage: (key: keyof typeof DYNAMIC_SUCCESS_MESSAGES, ...args: any[]): string => {
    const messageFunction = DYNAMIC_SUCCESS_MESSAGES[key];
    return typeof messageFunction === 'function' ? (messageFunction as any)(...args) : SUCCESS_MESSAGES.OPERATION_COMPLETED;
  },

  formatWithCount: (baseMessage: string, count: number): string => {
    return baseMessage.replace('{count}', count.toString());
  },

  formatWithData: (baseMessage: string, data: Record<string, any>): string => {
    let formattedMessage = baseMessage;
    Object.entries(data).forEach(([key, value]) => {
      formattedMessage = formattedMessage.replace(`{${key}}`, String(value));
    });
    return formattedMessage;
  },

  getRandomSuccessMessage: (category?: keyof typeof SUCCESS_MESSAGE_CATEGORIES): string => {
    const messages = Object.values(SUCCESS_MESSAGES);
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
  }
};