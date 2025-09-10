import { createContext, ReactNode, useContext, useReducer } from 'react';

export interface ErrorState {
  errors: Map<string, ErrorRecord>;
  recoveryAttempts: Map<string, number>;
  isRecovering: boolean;
  globalErrorCount: number;
}

export interface ErrorRecord {
  id: string;
  error: Error;
  timestamp: Date;
  context: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  recovered: boolean;
  retryCount: number;
  maxRetries: number;
}

export type ErrorAction =
  | { type: 'ADD_ERROR'; payload: Omit<ErrorRecord, 'id' | 'timestamp' | 'recovered' | 'retryCount'> }
  | { type: 'REMOVE_ERROR'; payload: { id: string } }
  | { type: 'RETRY_ERROR'; payload: { id: string } }
  | { type: 'MARK_RECOVERED'; payload: { id: string } }
  | { type: 'SET_RECOVERING'; payload: { isRecovering: boolean } }
  | { type: 'CLEAR_ALL_ERRORS' }
  | { type: 'CLEAR_CONTEXT_ERRORS'; payload: { context: string } };

const initialState: ErrorState = {
  errors: new Map(),
  recoveryAttempts: new Map(),
  isRecovering: false,
  globalErrorCount: 0
};

function errorReducer(state: ErrorState, action: ErrorAction): ErrorState {
  switch (action.type) {
    case 'ADD_ERROR': {
      const id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const errorRecord: ErrorRecord = {
        ...action.payload,
        id,
        timestamp: new Date(),
        recovered: false,
        retryCount: 0
      };

      const newErrors = new Map(state.errors);
      newErrors.set(id, errorRecord);

      return {
        ...state,
        errors: newErrors,
        globalErrorCount: state.globalErrorCount + 1
      };
    }

    case 'REMOVE_ERROR': {
      const newErrors = new Map(state.errors);
      newErrors.delete(action.payload.id);

      return {
        ...state,
        errors: newErrors
      };
    }

    case 'RETRY_ERROR': {
      const error = state.errors.get(action.payload.id);
      if (!error) return state;

      const newErrors = new Map(state.errors);
      newErrors.set(action.payload.id, {
        ...error,
        retryCount: error.retryCount + 1
      });

      const newRecoveryAttempts = new Map(state.recoveryAttempts);
      newRecoveryAttempts.set(action.payload.id, (newRecoveryAttempts.get(action.payload.id) || 0) + 1);

      return {
        ...state,
        errors: newErrors,
        recoveryAttempts: newRecoveryAttempts
      };
    }

    case 'MARK_RECOVERED': {
      const error = state.errors.get(action.payload.id);
      if (!error) return state;

      const newErrors = new Map(state.errors);
      newErrors.set(action.payload.id, {
        ...error,
        recovered: true
      });

      return {
        ...state,
        errors: newErrors
      };
    }

    case 'SET_RECOVERING': {
      return {
        ...state,
        isRecovering: action.payload.isRecovering
      };
    }

    case 'CLEAR_ALL_ERRORS': {
      return {
        ...state,
        errors: new Map(),
        recoveryAttempts: new Map()
      };
    }

    case 'CLEAR_CONTEXT_ERRORS': {
      const newErrors = new Map();
      for (const [id, error] of state.errors) {
        if (error.context !== action.payload.context) {
          newErrors.set(id, error);
        }
      }

      return {
        ...state,
        errors: newErrors
      };
    }

    default:
      return state;
  }
}

export interface ErrorRecoveryContextValue {
  state: ErrorState;
  addError: (error: Omit<ErrorRecord, 'id' | 'timestamp' | 'recovered' | 'retryCount'>) => string;
  removeError: (id: string) => void;
  retryError: (id: string) => void;
  markRecovered: (id: string) => void;
  setRecovering: (isRecovering: boolean) => void;
  clearAllErrors: () => void;
  clearContextErrors: (context: string) => void;
  getErrorsByContext: (context: string) => ErrorRecord[];
  getErrorsBySeverity: (severity: ErrorRecord['severity']) => ErrorRecord[];
  canRetry: (id: string) => boolean;
  getRecoveryStats: () => {
    total: number;
    recovered: number;
    failed: number;
    pending: number;
  };
}

const ErrorRecoveryContext = createContext<ErrorRecoveryContextValue | null>(null);

export interface ErrorRecoveryProviderProps {
  children: ReactNode;
  maxGlobalErrors?: number;
  onCriticalError?: (error: ErrorRecord) => void;
}

export function ErrorRecoveryProvider({ 
  children, 
  maxGlobalErrors = 10,
  onCriticalError 
}: ErrorRecoveryProviderProps) {
  const [state, dispatch] = useReducer(errorReducer, initialState);

  const addError = (error: Omit<ErrorRecord, 'id' | 'timestamp' | 'recovered' | 'retryCount'>): string => {
    const id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    dispatch({ type: 'ADD_ERROR', payload: error });

    // Handle critical errors
    if (error.severity === 'critical' && onCriticalError) {
      const errorRecord: ErrorRecord = {
        ...error,
        id,
        timestamp: new Date(),
        recovered: false,
        retryCount: 0
      };
      onCriticalError(errorRecord);
    }

    // Auto-clear old errors if we exceed the limit
    if (state.globalErrorCount >= maxGlobalErrors) {
      const oldestErrors = Array.from(state.errors.values())
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
        .slice(0, Math.floor(maxGlobalErrors / 2));

      oldestErrors.forEach(error => {
        dispatch({ type: 'REMOVE_ERROR', payload: { id: error.id } });
      });
    }

    return id;
  };

  const removeError = (id: string) => {
    dispatch({ type: 'REMOVE_ERROR', payload: { id } });
  };

  const retryError = (id: string) => {
    dispatch({ type: 'RETRY_ERROR', payload: { id } });
  };

  const markRecovered = (id: string) => {
    dispatch({ type: 'MARK_RECOVERED', payload: { id } });
  };

  const setRecovering = (isRecovering: boolean) => {
    dispatch({ type: 'SET_RECOVERING', payload: { isRecovering } });
  };

  const clearAllErrors = () => {
    dispatch({ type: 'CLEAR_ALL_ERRORS' });
  };

  const clearContextErrors = (context: string) => {
    dispatch({ type: 'CLEAR_CONTEXT_ERRORS', payload: { context } });
  };

  const getErrorsByContext = (context: string): ErrorRecord[] => {
    return Array.from(state.errors.values()).filter(error => error.context === context);
  };

  const getErrorsBySeverity = (severity: ErrorRecord['severity']): ErrorRecord[] => {
    return Array.from(state.errors.values()).filter(error => error.severity === severity);
  };

  const canRetry = (id: string): boolean => {
    const error = state.errors.get(id);
    return error ? error.recoverable && error.retryCount < error.maxRetries : false;
  };

  const getRecoveryStats = () => {
    const errors = Array.from(state.errors.values());
    return {
      total: errors.length,
      recovered: errors.filter(e => e.recovered).length,
      failed: errors.filter(e => !e.recoverable || e.retryCount >= e.maxRetries).length,
      pending: errors.filter(e => e.recoverable && e.retryCount < e.maxRetries && !e.recovered).length
    };
  };

  const contextValue: ErrorRecoveryContextValue = {
    state,
    addError,
    removeError,
    retryError,
    markRecovered,
    setRecovering,
    clearAllErrors,
    clearContextErrors,
    getErrorsByContext,
    getErrorsBySeverity,
    canRetry,
    getRecoveryStats
  };

  return (
    <ErrorRecoveryContext.Provider value={contextValue}>
      {children}
    </ErrorRecoveryContext.Provider>
  );
}

export function useErrorRecovery(): ErrorRecoveryContextValue {
  const context = useContext(ErrorRecoveryContext);
  if (!context) {
    throw new Error('useErrorRecovery must be used within an ErrorRecoveryProvider');
  }
  return context;
}

// Hook for handling data-specific errors
export function useDataErrorRecovery(dataContext: string) {
  const errorRecovery = useErrorRecovery();

  const addDataError = (
    error: Error,
    severity: ErrorRecord['severity'] = 'medium',
    recoverable: boolean = true,
    maxRetries: number = 3
  ) => {
    return errorRecovery.addError({
      error,
      context: dataContext,
      severity,
      recoverable,
      maxRetries
    });
  };

  const getContextErrors = () => errorRecovery.getErrorsByContext(dataContext);
  const clearContextErrors = () => errorRecovery.clearContextErrors(dataContext);

  return {
    ...errorRecovery,
    addDataError,
    getContextErrors,
    clearContextErrors
  };
}