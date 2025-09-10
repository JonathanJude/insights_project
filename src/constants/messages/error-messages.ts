import { ErrorTypes } from '../enums';

// Error Message Constants
export const ERROR_MESSAGES: Record<ErrorTypes, string> = {
  [ErrorTypes.DATA_NOT_FOUND]: 'The requested data could not be found. Please try again or contact support if the problem persists.',
  [ErrorTypes.VALIDATION_ERROR]: 'Please check your input and ensure all required fields are filled correctly.',
  [ErrorTypes.NETWORK_ERROR]: 'Network connection failed. Please check your internet connection and try again.',
  [ErrorTypes.PARSING_ERROR]: 'Unable to process the data. The information may be corrupted or in an unexpected format.',
  [ErrorTypes.REFERENCE_ERROR]: 'A reference to related data could not be resolved. Some information may be missing.',
  [ErrorTypes.TIMEOUT_ERROR]: 'The request took too long to complete. Please try again.',
  [ErrorTypes.PERMISSION_ERROR]: 'You do not have permission to access this resource.',
  [ErrorTypes.RATE_LIMIT_ERROR]: 'Too many requests. Please wait a moment before trying again.'
};

// Specific Error Messages for Different Components
export const COMPONENT_ERROR_MESSAGES = {
  // Data Loading Errors
  POLITICIAN_LOAD_ERROR: 'Failed to load politician data. Please refresh the page.',
  PARTY_LOAD_ERROR: 'Failed to load political party information. Please try again.',
  STATE_LOAD_ERROR: 'Failed to load state data. Geographic information may be incomplete.',
  SENTIMENT_LOAD_ERROR: 'Failed to load sentiment analysis data. Charts may not display correctly.',
  
  // Search Errors
  SEARCH_FAILED: 'Search request failed. Please try a different search term.',
  SEARCH_TIMEOUT: 'Search took too long to complete. Please try again with fewer terms.',
  SEARCH_INVALID_QUERY: 'Invalid search query. Please check your search terms and try again.',
  
  // Filter Errors
  FILTER_APPLY_ERROR: 'Failed to apply filters. Please reset and try again.',
  FILTER_INVALID_COMBINATION: 'Invalid filter combination. Please adjust your selections.',
  FILTER_LOAD_OPTIONS_ERROR: 'Failed to load filter options. Some filters may not be available.',
  
  // Chart Errors
  CHART_RENDER_ERROR: 'Failed to render chart. Please refresh the page.',
  CHART_DATA_ERROR: 'Chart data is invalid or incomplete. Please try again.',
  CHART_CONFIG_ERROR: 'Chart configuration error. Please contact support.',
  
  // Export Errors
  EXPORT_FAILED: 'Export failed. Please try again or choose a different format.',
  EXPORT_TIMEOUT: 'Export took too long to complete. Please try exporting smaller datasets.',
  EXPORT_PERMISSION_ERROR: 'Export permission denied. Please check your access rights.',
  
  // Validation Errors
  REQUIRED_FIELD_MISSING: 'This field is required and cannot be empty.',
  INVALID_EMAIL_FORMAT: 'Please enter a valid email address.',
  INVALID_DATE_FORMAT: 'Please enter a valid date in the correct format.',
  INVALID_NUMBER_FORMAT: 'Please enter a valid number.',
  VALUE_OUT_OF_RANGE: 'Value is outside the acceptable range.',
  
  // Authentication Errors
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  UNAUTHORIZED_ACCESS: 'You are not authorized to access this resource.',
  LOGIN_FAILED: 'Login failed. Please check your credentials and try again.',
  
  // File Upload Errors
  FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit.',
  INVALID_FILE_TYPE: 'Invalid file type. Please select a supported file format.',
  FILE_UPLOAD_FAILED: 'File upload failed. Please try again.',
  
  // Generic Component Errors
  COMPONENT_LOAD_ERROR: 'Failed to load component. Please refresh the page.',
  COMPONENT_RENDER_ERROR: 'Component rendering error. Please try again.',
  COMPONENT_UPDATE_ERROR: 'Failed to update component. Please refresh and try again.'
};

// User-Friendly Error Messages for Common Scenarios
export const USER_FRIENDLY_ERROR_MESSAGES = {
  NO_INTERNET: 'It looks like you\'re offline. Please check your internet connection.',
  SERVER_DOWN: 'Our servers are currently experiencing issues. Please try again in a few minutes.',
  PAGE_NOT_FOUND: 'The page you\'re looking for doesn\'t exist or has been moved.',
  ACCESS_DENIED: 'You don\'t have permission to view this content.',
  DATA_OUTDATED: 'The data you\'re viewing may be outdated. Please refresh to get the latest information.',
  FEATURE_UNAVAILABLE: 'This feature is currently unavailable. We\'re working to restore it.',
  MAINTENANCE_MODE: 'The system is currently under maintenance. Please try again later.',
  QUOTA_EXCEEDED: 'You\'ve reached your usage limit. Please upgrade your plan or try again later.'
};

// Error Recovery Suggestions
export const ERROR_RECOVERY_SUGGESTIONS = {
  [ErrorTypes.DATA_NOT_FOUND]: [
    'Refresh the page',
    'Check if the item still exists',
    'Try searching for similar content',
    'Contact support if the issue persists'
  ],
  [ErrorTypes.NETWORK_ERROR]: [
    'Check your internet connection',
    'Try refreshing the page',
    'Disable VPN if you\'re using one',
    'Try again in a few minutes'
  ],
  [ErrorTypes.VALIDATION_ERROR]: [
    'Check all required fields are filled',
    'Verify the format of your input',
    'Remove any special characters',
    'Try using different values'
  ],
  [ErrorTypes.TIMEOUT_ERROR]: [
    'Try again with a smaller request',
    'Check your internet connection',
    'Wait a moment before retrying',
    'Contact support if timeouts persist'
  ]
};

// Error Message Utilities
export const ErrorMessageUtils = {
  getMessage: (errorType: ErrorTypes): string => {
    return ERROR_MESSAGES[errorType] || 'An unexpected error occurred. Please try again.';
  },

  getComponentMessage: (componentError: keyof typeof COMPONENT_ERROR_MESSAGES): string => {
    return COMPONENT_ERROR_MESSAGES[componentError] || 'A component error occurred.';
  },

  getUserFriendlyMessage: (scenario: keyof typeof USER_FRIENDLY_ERROR_MESSAGES): string => {
    return USER_FRIENDLY_ERROR_MESSAGES[scenario] || 'Something went wrong. Please try again.';
  },

  getRecoverySuggestions: (errorType: ErrorTypes): string[] => {
    return ERROR_RECOVERY_SUGGESTIONS[errorType] || ['Try refreshing the page', 'Contact support if the issue persists'];
  },

  formatErrorWithSuggestions: (errorType: ErrorTypes): { message: string; suggestions: string[] } => {
    return {
      message: ERROR_MESSAGES[errorType],
      suggestions: ERROR_RECOVERY_SUGGESTIONS[errorType] || []
    };
  }
};