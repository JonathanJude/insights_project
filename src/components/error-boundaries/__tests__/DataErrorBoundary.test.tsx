import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DataErrorBoundary, withDataErrorBoundary } from '../DataErrorBoundary';

// Mock component that throws an error
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('DataErrorBoundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('[]');
  });

  it('should render children when there is no error', () => {
    render(
      <DataErrorBoundary>
        <ThrowError shouldThrow={false} />
      </DataErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should render error UI when child component throws', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <DataErrorBoundary dataType="test-data">
        <ThrowError shouldThrow={true} />
      </DataErrorBoundary>
    );

    expect(screen.getByText('Data Loading Error')).toBeInTheDocument();
    expect(screen.getByText(/Failed to load test-data data/)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('should render custom fallback when provided', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const customFallback = <div>Custom error message</div>;

    render(
      <DataErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </DataErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('should call onError callback when error occurs', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const onError = vi.fn();

    render(
      <DataErrorBoundary onError={onError}>
        <ThrowError shouldThrow={true} />
      </DataErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        errorId: expect.any(String),
        timestamp: expect.any(Date),
        componentStack: expect.any(String)
      })
    );

    consoleSpy.mockRestore();
  });

  it('should store error in localStorage', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <DataErrorBoundary>
        <ThrowError shouldThrow={true} />
      </DataErrorBoundary>
    );

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'data-error-log',
      expect.any(String)
    );

    consoleSpy.mockRestore();
  });

  it('should show retry button and handle retry', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <DataErrorBoundary enableRecovery={true} maxRetries={3} recoveryDelay={5000}>
        <ThrowError shouldThrow={true} />
      </DataErrorBoundary>
    );

    // Should show error state first with retry button
    expect(screen.getByText('Data Loading Error')).toBeInTheDocument();
    const retryButton = screen.getByText(/Try Again/);
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);

    // Should show recovering state
    await waitFor(() => {
      expect(screen.getByText('Recovering...')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('should show report issue button', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });

    render(
      <DataErrorBoundary>
        <ThrowError shouldThrow={true} />
      </DataErrorBoundary>
    );

    const reportButton = screen.getByText('Report Issue');
    expect(reportButton).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('should show reload page button', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock window.location.reload
    const mockReload = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true
    });

    render(
      <DataErrorBoundary>
        <ThrowError shouldThrow={true} />
      </DataErrorBoundary>
    );

    const reloadButton = screen.getByText('Reload Page');
    expect(reloadButton).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it('should limit retry attempts', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <DataErrorBoundary enableRecovery={true} maxRetries={1} recoveryDelay={5000}>
        <ThrowError shouldThrow={true} />
      </DataErrorBoundary>
    );

    // Should show error state first
    expect(screen.getByText('Data Loading Error')).toBeInTheDocument();
    expect(screen.getByText(/1 attempts left/)).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});

describe('withDataErrorBoundary HOC', () => {
  it('should wrap component with DataErrorBoundary', () => {
    const TestComponent = () => <div>Test Component</div>;
    const WrappedComponent = withDataErrorBoundary(TestComponent, {
      dataType: 'test-data'
    });

    render(<WrappedComponent />);

    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });

  it('should handle errors in wrapped component', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const WrappedThrowError = withDataErrorBoundary(ThrowError, {
      dataType: 'test-data'
    });

    render(<WrappedThrowError shouldThrow={true} />);

    expect(screen.getByText('Data Loading Error')).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});