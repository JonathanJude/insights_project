import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useUIStore } from '../../../stores/uiStore';
import NotificationsPanel from '../NotificationsPanel';

// Mock the UI store
vi.mock('../../../stores/uiStore', () => ({
  useUIStore: vi.fn()
}));

const mockNotifications = [
  {
    id: '1',
    type: 'info' as const,
    title: 'Test Notification',
    message: 'This is a test message',
    timestamp: Date.now() - 60000 // 1 minute ago
  }
];

const mockUIStore = {
  notifications: mockNotifications,
  removeNotification: vi.fn(),
  clearNotifications: vi.fn()
};

describe('NotificationsPanel', () => {
  beforeEach(() => {
    vi.mocked(useUIStore).mockReturnValue(mockUIStore);
  });

  it('should render when open', () => {
    render(<NotificationsPanel isOpen={true} onClose={vi.fn()} />);
    
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText('Test Notification')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<NotificationsPanel isOpen={false} onClose={vi.fn()} />);
    
    expect(screen.queryByText('Notifications')).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<NotificationsPanel isOpen={true} onClose={onClose} />);
    
    const closeButton = screen.getByRole('button', { name: /close notifications panel/i });
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('should call removeNotification when notification is dismissed', () => {
    render(<NotificationsPanel isOpen={true} onClose={vi.fn()} />);
    
    const dismissButton = screen.getByRole('button', { name: /dismiss notification/i });
    fireEvent.click(dismissButton);
    
    expect(mockUIStore.removeNotification).toHaveBeenCalledWith('1');
  });

  it('should call clearNotifications when clear all is clicked', () => {
    render(<NotificationsPanel isOpen={true} onClose={vi.fn()} />);
    
    const clearAllButton = screen.getByText('Clear all');
    fireEvent.click(clearAllButton);
    
    expect(mockUIStore.clearNotifications).toHaveBeenCalled();
  });
});