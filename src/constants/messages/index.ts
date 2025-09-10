// Export all message constants and utilities
export * from './error-messages';
export * from './info-messages';
export * from './success-messages';
export * from './validation-messages';

// Re-export utilities for convenience
import { ErrorMessageUtils } from './error-messages';
import { InfoMessageUtils } from './info-messages';
import { SuccessMessageUtils } from './success-messages';
import { ValidationMessageUtils } from './validation-messages';

export const MessageUtils = {
  Error: ErrorMessageUtils,
  Success: SuccessMessageUtils,
  Info: InfoMessageUtils,
  Validation: ValidationMessageUtils
};

// Combined message interface for type safety
export interface MessageResponse {
  type: 'error' | 'success' | 'info' | 'warning';
  message: string;
  details?: string;
  suggestions?: string[];
  timestamp?: Date;
}

// Message factory for creating consistent message objects
export const MessageFactory = {
  createError: (message: string, details?: string, suggestions?: string[]): MessageResponse => ({
    type: 'error',
    message,
    details,
    suggestions,
    timestamp: new Date()
  }),

  createSuccess: (message: string, details?: string): MessageResponse => ({
    type: 'success',
    message,
    details,
    timestamp: new Date()
  }),

  createInfo: (message: string, details?: string): MessageResponse => ({
    type: 'info',
    message,
    details,
    timestamp: new Date()
  }),

  createWarning: (message: string, details?: string, suggestions?: string[]): MessageResponse => ({
    type: 'warning',
    message,
    details,
    suggestions,
    timestamp: new Date()
  })
};