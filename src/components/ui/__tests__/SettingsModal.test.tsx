import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useUIStore } from '../../../stores/uiStore';
import SettingsModal from '../SettingsModal';

// Mock the UI store
vi.mock('../../../stores/uiStore', () => ({
  useUIStore: vi.fn()
}));

const mockUIStore = {
  theme: 'light',
  setTheme: vi.fn(),
  notifications: [],
  clearNotifications: vi.fn()
};

describe('SettingsModal', () => {
  beforeEach(() => {
    vi.mocked(useUIStore).mockReturnValue(mockUIStore);
  });

  it('should render when open', () => {
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);
    
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<SettingsModal isOpen={false} onClose={vi.fn()} />);
    
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<SettingsModal isOpen={true} onClose={onClose} />);
    
    const closeButton = screen.getByRole('button', { name: /close settings modal/i });
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  it('should call setTheme when theme option is selected', () => {
    render(<SettingsModal isOpen={true} onClose={vi.fn()} />);
    
    const darkModeRadio = screen.getByRole('radio', { name: /dark mode/i });
    fireEvent.click(darkModeRadio);
    
    expect(mockUIStore.setTheme).toHaveBeenCalledWith('dark');
  });
});