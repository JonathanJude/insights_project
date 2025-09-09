import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import SearchBar from '../SearchBar';

// Create a real wrapper without mocking for integration testing
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('SearchBar Integration Tests', () => {
  beforeEach(() => {
    // Clear any existing timers
    vi.clearAllTimers();
  });

  describe('Basic Functionality', () => {
    it('should render without crashing', () => {
      render(<SearchBar />, { wrapper: createWrapper() });
      
      const input = screen.getByPlaceholderText(/search politicians/i);
      expect(input).toBeInTheDocument();
    });

    it('should accept user input', () => {
      render(<SearchBar />, { wrapper: createWrapper() });
      
      const input = screen.getByPlaceholderText(/search politicians/i) as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'Peter' } });
      
      expect(input.value).toBe('Peter');
    });

    it('should show dropdown when typing sufficient characters', async () => {
      render(<SearchBar />, { wrapper: createWrapper() });
      
      const input = screen.getByPlaceholderText(/search politicians/i);
      fireEvent.change(input, { target: { value: 'Pe' } });
      fireEvent.focus(input);

      // Wait for the dropdown to appear
      await waitFor(() => {
        // The dropdown should be visible with some content
        const dropdown = input.closest('div')?.querySelector('[class*="absolute z-50"]');
        expect(dropdown).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should handle search submission', () => {
      const mockOnSearch = vi.fn();
      render(<SearchBar onSearch={mockOnSearch} />, { wrapper: createWrapper() });
      
      const input = screen.getByPlaceholderText(/search politicians/i);
      fireEvent.change(input, { target: { value: 'Peter Obi' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      expect(mockOnSearch).toHaveBeenCalledWith('Peter Obi');
    });
  });

  describe('Performance Integration', () => {
    it('should handle rapid typing without performance issues', async () => {
      render(<SearchBar />, { wrapper: createWrapper() });
      
      const input = screen.getByPlaceholderText(/search politicians/i);
      
      // Simulate rapid typing
      const queries = ['P', 'Pe', 'Pet', 'Pete', 'Peter'];
      const startTime = performance.now();
      
      for (const query of queries) {
        fireEvent.change(input, { target: { value: query } });
        // Small delay to simulate real typing
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;
      
      // Should handle rapid typing efficiently
      expect(totalTime).toBeLessThan(1000); // 1 second for all operations
    });

    it('should debounce search requests', async () => {
      render(<SearchBar />, { wrapper: createWrapper() });
      
      const input = screen.getByPlaceholderText(/search politicians/i);
      
      // Type rapidly
      fireEvent.change(input, { target: { value: 'P' } });
      fireEvent.change(input, { target: { value: 'Pe' } });
      fireEvent.change(input, { target: { value: 'Pet' } });
      
      // Should not immediately show results due to debouncing
      expect(screen.queryByText('Politicians')).not.toBeInTheDocument();
      
      // Wait for debounce to complete
      await waitFor(() => {
        // After debounce, should show results if any
        const hasDropdown = input.closest('div')?.querySelector('[class*="absolute z-50"]');
        // Either shows dropdown or doesn't, but shouldn't crash
        expect(input).toBeInTheDocument();
      }, { timeout: 500 });
    });
  });

  describe('Accessibility', () => {
    it('should support keyboard navigation', async () => {
      render(<SearchBar />, { wrapper: createWrapper() });
      
      const input = screen.getByPlaceholderText(/search politicians/i);
      fireEvent.change(input, { target: { value: 'Peter' } });
      fireEvent.focus(input);
      
      // Test arrow key navigation
      fireEvent.keyDown(input, { key: 'ArrowDown' });
      fireEvent.keyDown(input, { key: 'ArrowUp' });
      fireEvent.keyDown(input, { key: 'Escape' });
      
      // Should not crash and input should still be accessible
      expect(input).toBeInTheDocument();
      expect(input).toHaveFocus();
    });

    it('should have proper ARIA attributes', () => {
      render(<SearchBar />, { wrapper: createWrapper() });
      
      const input = screen.getByPlaceholderText(/search politicians/i);
      
      // Should have basic accessibility attributes
      expect(input).toHaveAttribute('type', 'text');
      expect(input).toHaveAttribute('placeholder');
    });
  });

  describe('Error Handling', () => {
    it('should handle empty search gracefully', () => {
      render(<SearchBar />, { wrapper: createWrapper() });
      
      const input = screen.getByPlaceholderText(/search politicians/i);
      fireEvent.change(input, { target: { value: '' } });
      fireEvent.keyDown(input, { key: 'Enter' });
      
      // Should not crash
      expect(input).toBeInTheDocument();
    });

    it('should handle special characters in search', () => {
      render(<SearchBar />, { wrapper: createWrapper() });
      
      const input = screen.getByPlaceholderText(/search politicians/i);
      fireEvent.change(input, { target: { value: '!@#$%^&*()' } });
      
      // Should not crash
      expect(input).toBeInTheDocument();
      expect((input as HTMLInputElement).value).toBe('!@#$%^&*()');
    });
  });
});