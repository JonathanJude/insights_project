import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Profile from '../pages/profile/Profile';

// Mock the UI store
vi.mock('../stores/uiStore', () => ({
  useUIStore: vi.fn(() => ({}))
}));

// Mock StatsCard component
vi.mock('../components/ui/StatsCard', () => ({
  default: ({ title }: { title: string }) => (
    <div data-testid="stats-card">{title}</div>
  )
}));

// Mock SkeletonProfile component
vi.mock('../components/ui/skeletons/SkeletonProfile', () => ({
  default: () => <div data-testid="skeleton-profile">Loading Profile...</div>
}));

const ProfileWrapper: React.FC = () => (
  <MemoryRouter>
    <Profile />
  </MemoryRouter>
);

describe('Profile Component - Simple Tests', () => {
  it('renders without crashing', () => {
    render(<ProfileWrapper />);
    
    // Should render either skeleton or content
    const component = document.querySelector('div');
    expect(component).toBeInTheDocument();
  });

  it('shows skeleton loading initially', () => {
    render(<ProfileWrapper />);
    
    // Should show skeleton loading initially
    expect(screen.getByTestId('skeleton-profile')).toBeInTheDocument();
    expect(screen.getByText('Loading Profile...')).toBeInTheDocument();
  });

  it('has proper component structure', () => {
    const { container } = render(<ProfileWrapper />);
    
    // Should have a root div
    expect(container.firstChild).toBeInTheDocument();
    
    // Should contain the skeleton component
    expect(container.querySelector('[data-testid="skeleton-profile"]')).toBeInTheDocument();
  });
});