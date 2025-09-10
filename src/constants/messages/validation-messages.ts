// Validation Message Constants
export const VALIDATION_MESSAGES = {
  // Required Field Validations
  REQUIRED_FIELD: 'This field is required',
  REQUIRED_SELECTION: 'Please make a selection',
  REQUIRED_CHECKBOX: 'You must accept this to continue',
  REQUIRED_FILE: 'Please select a file',
  
  // Format Validations
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_URL: 'Please enter a valid URL',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_DATE: 'Please enter a valid date',
  INVALID_TIME: 'Please enter a valid time',
  INVALID_NUMBER: 'Please enter a valid number',
  INVALID_INTEGER: 'Please enter a whole number',
  INVALID_DECIMAL: 'Please enter a valid decimal number',
  
  // Length Validations
  TOO_SHORT: 'This field is too short (minimum {min} characters)',
  TOO_LONG: 'This field is too long (maximum {max} characters)',
  EXACT_LENGTH: 'This field must be exactly {length} characters',
  
  // Range Validations
  VALUE_TOO_LOW: 'Value must be at least {min}',
  VALUE_TOO_HIGH: 'Value cannot exceed {max}',
  VALUE_OUT_OF_RANGE: 'Value must be between {min} and {max}',
  
  // Pattern Validations
  INVALID_PATTERN: 'Please enter a value in the correct format',
  INVALID_ALPHANUMERIC: 'Only letters and numbers are allowed',
  INVALID_ALPHABETIC: 'Only letters are allowed',
  INVALID_NUMERIC: 'Only numbers are allowed',
  
  // Password Validations
  PASSWORD_TOO_WEAK: 'Password is too weak',
  PASSWORD_MISSING_UPPERCASE: 'Password must contain at least one uppercase letter',
  PASSWORD_MISSING_LOWERCASE: 'Password must contain at least one lowercase letter',
  PASSWORD_MISSING_NUMBER: 'Password must contain at least one number',
  PASSWORD_MISSING_SPECIAL: 'Password must contain at least one special character',
  PASSWORD_MISMATCH: 'Passwords do not match',
  
  // File Validations
  FILE_TOO_LARGE: 'File size exceeds the maximum limit of {maxSize}',
  FILE_TOO_SMALL: 'File size is below the minimum requirement of {minSize}',
  INVALID_FILE_TYPE: 'Invalid file type. Allowed types: {allowedTypes}',
  FILE_CORRUPTED: 'File appears to be corrupted or unreadable',
  
  // Date Validations
  DATE_IN_PAST: 'Date cannot be in the past',
  DATE_IN_FUTURE: 'Date cannot be in the future',
  DATE_TOO_OLD: 'Date is too far in the past',
  DATE_TOO_RECENT: 'Date is too recent',
  INVALID_DATE_RANGE: 'End date must be after start date',
  
  // Search Validations
  SEARCH_TOO_SHORT: 'Search term must be at least {min} characters',
  SEARCH_TOO_LONG: 'Search term cannot exceed {max} characters',
  SEARCH_INVALID_CHARACTERS: 'Search contains invalid characters',
  SEARCH_NO_RESULTS: 'No results found for your search criteria',
  
  // Filter Validations
  INVALID_FILTER_COMBINATION: 'Invalid filter combination selected',
  FILTER_VALUE_REQUIRED: 'Please select a value for this filter',
  FILTER_RANGE_INVALID: 'Invalid range specified for filter',
  TOO_MANY_FILTERS: 'Too many filters selected. Please reduce the number of active filters.',
  
  // Data Integrity Validations
  DUPLICATE_ENTRY: 'This entry already exists',
  REFERENCE_NOT_FOUND: 'Referenced item could not be found',
  CIRCULAR_REFERENCE: 'Circular reference detected',
  DATA_INCONSISTENCY: 'Data inconsistency detected',
  
  // Business Logic Validations
  INVALID_STATE_TRANSITION: 'Invalid state transition',
  OPERATION_NOT_ALLOWED: 'This operation is not allowed in the current state',
  INSUFFICIENT_PERMISSIONS: 'You do not have sufficient permissions for this action',
  QUOTA_EXCEEDED: 'You have exceeded your quota limit',
  
  // Custom Field Validations
  INVALID_POLITICIAN_NAME: 'Please enter a valid politician name',
  INVALID_PARTY_SELECTION: 'Please select a valid political party',
  INVALID_STATE_SELECTION: 'Please select a valid Nigerian state',
  INVALID_DATE_RANGE_SELECTION: 'Please select a valid date range',
  INVALID_SENTIMENT_SCORE: 'Sentiment score must be between -1 and 1',
  
  // Export Validations
  NO_DATA_TO_EXPORT: 'No data available to export',
  EXPORT_SIZE_TOO_LARGE: 'Export size exceeds maximum limit. Please apply filters to reduce data.',
  INVALID_EXPORT_FORMAT: 'Invalid export format selected',
  EXPORT_PERMISSION_DENIED: 'You do not have permission to export this data'
};

// Field-Specific Validation Messages
export const FIELD_VALIDATION_MESSAGES = {
  // User Profile Fields
  firstName: {
    required: 'First name is required',
    tooShort: 'First name must be at least 2 characters',
    tooLong: 'First name cannot exceed 50 characters',
    invalidCharacters: 'First name can only contain letters and spaces'
  },
  
  lastName: {
    required: 'Last name is required',
    tooShort: 'Last name must be at least 2 characters',
    tooLong: 'Last name cannot exceed 50 characters',
    invalidCharacters: 'Last name can only contain letters and spaces'
  },
  
  email: {
    required: 'Email address is required',
    invalid: 'Please enter a valid email address',
    duplicate: 'This email address is already registered'
  },
  
  // Search Fields
  searchQuery: {
    required: 'Please enter a search term',
    tooShort: 'Search term must be at least 2 characters',
    tooLong: 'Search term cannot exceed 100 characters',
    invalidCharacters: 'Search term contains invalid characters'
  },
  
  // Filter Fields
  dateRange: {
    required: 'Please select a date range',
    invalid: 'Invalid date range selected',
    tooLarge: 'Date range is too large. Please select a smaller range.',
    endBeforeStart: 'End date must be after start date'
  },
  
  stateFilter: {
    required: 'Please select at least one state',
    invalid: 'Invalid state selection',
    tooMany: 'Too many states selected. Please select fewer states.'
  },
  
  partyFilter: {
    required: 'Please select at least one political party',
    invalid: 'Invalid party selection',
    tooMany: 'Too many parties selected. Please select fewer parties.'
  }
};

// Dynamic Validation Messages
export const DYNAMIC_VALIDATION_MESSAGES = {
  minLength: (min: number) => `Must be at least ${min} characters long`,
  maxLength: (max: number) => `Cannot exceed ${max} characters`,
  exactLength: (length: number) => `Must be exactly ${length} characters long`,
  minValue: (min: number) => `Value must be at least ${min}`,
  maxValue: (max: number) => `Value cannot exceed ${max}`,
  range: (min: number, max: number) => `Value must be between ${min} and ${max}`,
  fileSize: (maxSize: string) => `File size cannot exceed ${maxSize}`,
  allowedTypes: (types: string[]) => `Allowed file types: ${types.join(', ')}`,
  maxItems: (max: number) => `Cannot select more than ${max} items`,
  minItems: (min: number) => `Must select at least ${min} items`
};

// Validation Message Categories
export const VALIDATION_CATEGORIES = {
  REQUIRED: 'Required Field',
  FORMAT: 'Format Validation',
  LENGTH: 'Length Validation',
  RANGE: 'Range Validation',
  PATTERN: 'Pattern Validation',
  BUSINESS: 'Business Logic',
  SECURITY: 'Security Validation',
  DATA_INTEGRITY: 'Data Integrity'
};

// Validation Message Utilities
export const ValidationMessageUtils = {
  getMessage: (key: keyof typeof VALIDATION_MESSAGES): string => {
    return VALIDATION_MESSAGES[key] || 'Validation error occurred';
  },

  getFieldMessage: (field: keyof typeof FIELD_VALIDATION_MESSAGES, type: string): string => {
    const fieldMessages = FIELD_VALIDATION_MESSAGES[field];
    if (fieldMessages && type in fieldMessages) {
      return (fieldMessages as any)[type];
    }
    return VALIDATION_MESSAGES.REQUIRED_FIELD;
  },

  getDynamicMessage: (key: keyof typeof DYNAMIC_VALIDATION_MESSAGES, ...args: any[]): string => {
    const messageFunction = DYNAMIC_VALIDATION_MESSAGES[key];
    return typeof messageFunction === 'function' ? (messageFunction as any)(...args) : 'Validation error';
  },

  formatMessage: (template: string, values: Record<string, any>): string => {
    let formattedMessage = template;
    Object.entries(values).forEach(([key, value]) => {
      formattedMessage = formattedMessage.replace(`{${key}}`, String(value));
    });
    return formattedMessage;
  },

  getRequiredMessage: (fieldName: string): string => {
    return `${fieldName} is required`;
  },

  getLengthMessage: (fieldName: string, min?: number, max?: number): string => {
    if (min && max) {
      return `${fieldName} must be between ${min} and ${max} characters`;
    } else if (min) {
      return `${fieldName} must be at least ${min} characters`;
    } else if (max) {
      return `${fieldName} cannot exceed ${max} characters`;
    }
    return `${fieldName} has invalid length`;
  },

  getRangeMessage: (fieldName: string, min?: number, max?: number): string => {
    if (min !== undefined && max !== undefined) {
      return `${fieldName} must be between ${min} and ${max}`;
    } else if (min !== undefined) {
      return `${fieldName} must be at least ${min}`;
    } else if (max !== undefined) {
      return `${fieldName} cannot exceed ${max}`;
    }
    return `${fieldName} is out of range`;
  }
};