# Comprehensive Error Handling System

This document describes the comprehensive error handling system implemented for the Insight Intelligence Dashboard.

## Overview

The error handling system provides:
- **Automatic error classification** by type (network, server, client, etc.)
- **User-friendly error messages** with actionable guidance
- **Smart retry logic** with exponential backoff
- **Global error boundaries** for catching unhandled errors
- **Success feedback** for completed actions
- **Integration with React Query** for API error handling

## Components

### 1. DashboardErrorBoundary

A React error boundary that catches JavaScript errors anywhere in the component tree.

```tsx
import DashboardErrorBoundary from './components/ui/DashboardErrorBoundary';

<DashboardErrorBoundary
  onError={(error, errorInfo) => {
    // Custom error logging
    console.error('App Error:', error, errorInfo);
  }}
>
  <App />
</DashboardErrorBoundary>
```

**Features:**
- Catches and displays user-friendly error messages
- Provides retry and refresh options
- Shows technical details in development mode
- Customizable fallback components

### 2. Error Classification System

Automatically classifies errors into categories with appropriate handling:

```tsx
import { classifyError, ErrorType } from './lib/errorHandling';

const error = new TypeError('Failed to fetch');
const classified = classifyError(error);
// Returns: { type: ErrorType.NETWORK_ERROR, message: "Unable to connect...", ... }
```

**Error Types:**
- `NETWORK_ERROR` - Connection issues, retryable
- `SERVER_ERROR` - 5xx HTTP errors, retryable  
- `CLIENT_ERROR` - 4xx HTTP errors, not retryable
- `AUTHENTICATION_ERROR` - 401 errors
- `AUTHORIZATION_ERROR` - 403 errors
- `NOT_FOUND_ERROR` - 404 errors
- `VALIDATION_ERROR` - Data validation failures
- `UNKNOWN_ERROR` - Unclassified errors

### 3. ErrorDisplay Component

Displays errors with appropriate styling and actions:

```tsx
import ErrorDisplay from './components/ui/ErrorDisplay';

<ErrorDisplay
  error={apiError}
  onRetry={() => refetch()}
  onGoHome={() => navigate('/')}
  showDetails={import.meta.env.DEV}
/>
```

**Props:**
- `error` - Classified error object
- `onRetry` - Optional retry callback
- `onGoHome` - Optional navigation callback
- `size` - Display size ('sm', 'md', 'lg')
- `showDetails` - Show technical details

### 4. Action Feedback Hooks

Hooks for handling user actions with automatic error handling and success feedback:

```tsx
import { useActionFeedback, useDataRefresh } from './hooks/useActionFeedback';

// Generic action handling
const { executeAction, isLoading, error } = useActionFeedback();

const handleSave = async () => {
  await executeAction(
    async () => {
      await saveData();
    },
    {
      successTitle: 'Saved',
      successMessage: 'Data saved successfully',
      errorTitle: 'Save Failed'
    }
  );
};

// Specialized refresh handling
const { refreshData, isLoading: isRefreshing } = useDataRefresh();

const handleRefresh = async () => {
  await refreshData(async () => {
    await queryClient.invalidateQueries();
  });
};
```

### 5. Enhanced Query Client

React Query client with built-in error handling:

```tsx
import { createEnhancedQueryClient } from './lib/queryErrorHandler';

const queryClient = createEnhancedQueryClient();
// Automatically handles retries, error classification, and notifications
```

**Features:**
- Smart retry logic based on error type
- Exponential backoff for retryable errors
- Global error handling for queries and mutations
- Integration with notification system

## Usage Examples

### Basic Error Handling in Components

```tsx
import { useQuery } from '@tanstack/react-query';
import { useErrorHandler } from '../lib/errorHandling';
import ErrorDisplay from '../components/ui/ErrorDisplay';

const MyComponent = () => {
  const { handleError } = useErrorHandler();
  
  const { data, error, refetch } = useQuery({
    queryKey: ['my-data'],
    queryFn: fetchMyData,
    onError: (error) => {
      handleError(error, {
        showNotification: true,
        fallbackMessage: 'Failed to load data'
      });
    }
  });

  if (error) {
    const apiError = handleError(error, { showNotification: false });
    return <ErrorDisplay error={apiError} onRetry={refetch} />;
  }

  return <div>{data}</div>;
};
```

### Manual Error Handling

```tsx
import { useErrorHandler } from '../lib/errorHandling';

const MyComponent = () => {
  const { handleError, handleSuccess } = useErrorHandler();

  const handleSubmit = async () => {
    try {
      await submitForm();
      handleSuccess('Form submitted successfully');
    } catch (error) {
      handleError(error, {
        showNotification: true,
        fallbackMessage: 'Failed to submit form'
      });
    }
  };

  return <button onClick={handleSubmit}>Submit</button>;
};
```

### Retry Logic

```tsx
import { withRetry } from '../lib/errorHandling';

const fetchWithRetry = async () => {
  return withRetry(
    async () => {
      const response = await fetch('/api/data');
      if (!response.ok) throw response;
      return response.json();
    },
    3, // max attempts
    (attempt) => 1000 * attempt // delay function
  );
};
```

### Success Feedback

```tsx
import { useSuccessFeedback, SuccessMessages } from '../components/ui/SuccessFeedback';

const MyComponent = () => {
  const { showSuccess, SuccessFeedbackComponent } = useSuccessFeedback();

  const handleSave = async () => {
    try {
      await saveData();
      showSuccess(
        SuccessMessages.SETTINGS_SAVED.title,
        SuccessMessages.SETTINGS_SAVED.message,
        [
          {
            label: 'View Settings',
            onClick: () => navigate('/settings'),
            variant: 'primary'
          }
        ]
      );
    } catch (error) {
      // Error handling...
    }
  };

  return (
    <>
      <button onClick={handleSave}>Save</button>
      <SuccessFeedbackComponent />
    </>
  );
};
```

## Error Messages

The system provides user-friendly error messages for common scenarios:

### Network Errors
- **Message:** "Unable to connect to the server. Please check your internet connection."
- **Guidance:** "Check your internet connection and try again."
- **Retryable:** Yes

### Server Errors (5xx)
- **Message:** "Server error occurred. Please try again later."
- **Guidance:** "The server is temporarily unavailable. Please try again in a few minutes."
- **Retryable:** Yes

### Authentication Errors (401)
- **Message:** "Authentication required. Please log in and try again."
- **Guidance:** "Please log in again to continue."
- **Retryable:** No

### Not Found Errors (404)
- **Message:** "The requested resource was not found."
- **Guidance:** "The requested resource could not be found."
- **Retryable:** No

### Chunk Load Errors
- **Message:** "Application update required. Please refresh the page."
- **Guidance:** "Try refreshing the page to get the latest version of the application."
- **Retryable:** No

## Configuration

### Retry Configuration

```tsx
// Default retry configuration in enhanced query client
const retryConfig = {
  queries: {
    retry: (failureCount, error) => {
      const apiError = classifyError(error);
      const handler = ErrorHandler.getInstance();
      
      // Don't retry if error is not retryable
      if (!handler.isRetryable(apiError)) {
        return false;
      }
      
      // Limit retry attempts
      return failureCount < 3;
    },
    retryDelay: (attemptIndex, error) => {
      const apiError = classifyError(error);
      const handler = ErrorHandler.getInstance();
      return handler.getRetryDelay(apiError, attemptIndex);
    }
  }
};
```

### Notification Configuration

```tsx
// Customize notification behavior
const { handleError } = useErrorHandler();

handleError(error, {
  showNotification: true,        // Show user notification
  logError: true,               // Log to console/service
  fallbackMessage: 'Custom message', // Override default message
});
```

## Best Practices

### 1. Use Error Boundaries
Wrap your application or major sections with `DashboardErrorBoundary`:

```tsx
<DashboardErrorBoundary>
  <Router>
    <Routes>
      {/* Your routes */}
    </Routes>
  </Router>
</DashboardErrorBoundary>
```

### 2. Handle Errors at the Right Level
- Use global error boundaries for unhandled errors
- Handle specific errors in components where context matters
- Use query-level error handling for API errors

### 3. Provide Actionable Feedback
- Always provide clear error messages
- Include retry options for retryable errors
- Offer alternative actions when possible

### 4. Log Errors Appropriately
- Log all errors in development
- Send critical errors to monitoring services in production
- Include relevant context and user actions

### 5. Test Error Scenarios
- Test network failures
- Test server errors
- Test authentication failures
- Test edge cases and race conditions

## Integration with Monitoring

In production, integrate with error monitoring services:

```tsx
// In DashboardErrorBoundary or ErrorHandler
if (import.meta.env.PROD) {
  // Example integrations:
  // Sentry.captureException(error, { extra: errorInfo });
  // LogRocket.captureException(error);
  // Bugsnag.notify(error);
}
```

## Testing

The error handling system includes comprehensive tests:

```bash
npm test -- --run src/test/error-handling.test.tsx
```

Tests cover:
- Error classification
- Retry logic
- Error boundary behavior
- Component error displays
- Integration scenarios

## Migration Guide

To integrate the error handling system into existing components:

1. **Wrap your app with DashboardErrorBoundary**
2. **Replace manual error handling with useErrorHandler hook**
3. **Use ErrorDisplay component for consistent error UI**
4. **Replace success alerts with useSuccessFeedback**
5. **Update React Query configuration to use enhanced client**

This comprehensive error handling system ensures a robust, user-friendly experience while providing developers with the tools needed to diagnose and fix issues effectively.