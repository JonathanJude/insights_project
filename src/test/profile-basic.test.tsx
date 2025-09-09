import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Profile from '../pages/profile/Profile';

// Mock the UI store
vi.mock('../stores/uiStore', () => ({
  useUIStore: vi.fn(() => ({
    theme: 'light'
  }))
}));

// Mock StatsCard component
vi.mock('../components/ui/StatsCard', () => ({
  default: ({ title, value }: { title: string; value: string | number }) => (
    <div data-testid="stats-card">
      <div>{title}</div>
      <div>{value}</div>
    </div>
  )
}));

// Mock SkeletonProfile component
vi.mock('../components/ui/skeletons/SkeletonProfile', () => ({
  default: () => <div data-testid="skeleton-profile">Loading...</div>
}));

const ProfileWrapper: React.FC = () => (
  <MemoryRouter>
    <Profile />
  </MemoryRouter>
);

describe('Profile Component', () => {
  it('renders loading skeleton initially', () => {
    render(<ProfileWrapper />);
    
    // Should show skeleton loading initially
    expect(screen.getByTestId('skeleton-profile')).toBeInTheDocument();
  });

  it('renders profile content after loading', async () => {
    // Mock setTimeout to resolve immediately
    vi.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
      callback();
      return 0 as any;
    });

    render(<ProfileWrapper />);
    
    // Wait for loading to complete and content to render
    await screen.findByText('Alex Johnson');
    
    // Should show user name
    expect(screen.getByText('Alex Johnson')).toBeInTheDocument();
    
    // Should show role
    expect(screen.getByText('Political Analyst')).toBeInTheDocument();
    
    // Should show organization
    expect(screen.getByText('Insight Intelligence')).toBeInTheDocument();
    
    // Should show location
    expect(screen.getByText('Lagos, Nigeria')).toBeInTheDocument();
    
    // Should show stats cards
    expect(screen.getAllByTestId('stats-card')).toHaveLength(4);
    
    // Should show tabs
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('Preferences')).toBeInTheDocument();
    expect(screen.getByText('Security')).toBeInTheDocument();
    
    // Restore setTimeout
    vi.restoreAllMocks();
  });

  it('shows breadcrumb navigation', async () => {
    vi.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
      callback();
      return 0 as any;
    });

    render(<ProfileWrapper />);
    
    await screen.findByText('Alex Johnson');
    
    // Should show breadcrumb
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    
    vi.restoreAllMocks();
  });

  it('displays user avatar and edit button', async () => {
    vi.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
      callback();
      return 0 as any;
    });

    render(<ProfileWrapper />);
    
    await screen.findByText('Alex Johnson');
    
    // Should show avatar image
    const avatar = screen.getByAltText('Alex Johnson');
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute('src');
    
    // Should show edit profile button
    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    
    vi.restoreAllMocks();
  });

  it('displays user bio and meta information', async () => {
    vi.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
      callback();
      return 0 as any;
    });

    render(<ProfileWrapper />);
    
    await screen.findByText('Alex Johnson');
    
    // Should show bio
    expect(screen.getByText(/Experienced political analyst/)).toBeInTheDocument();
    
    // Should show timezone
    expect(screen.getByText('WAT (UTC+1)')).toBeInTheDocument();
    
    vi.restoreAllMocks();
  });

  it('shows favorite politicians section', async () => {
    vi.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
      callback();
      return 0 as any;
    });

    render(<ProfileWrapper />);
    
    await screen.findByText('Alex Johnson');
    
    // Should show favorite politicians section
    expect(screen.getByText('Favorite Politicians')).toBeInTheDocument();
    expect(screen.getByText('Bola Ahmed Tinubu')).toBeInTheDocument();
    expect(screen.getByText('Peter Obi')).toBeInTheDocument();
    
    vi.restoreAllMocks();
  });

  it('shows quick actions section', async () => {
    vi.spyOn(global, 'setTimeout').mockImplementation((callback: any) => {
      callback();
      return 0 as any;
    });

    render(<ProfileWrapper />);
    
    await screen.findByText('Alex Johnson');
    
    // Should show quick actions
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Search Politicians')).toBeInTheDocument();
    expect(screen.getByText('Party Analytics')).toBeInTheDocument();
    expect(screen.getByText('Trending Topics')).toBeInTheDocument();
    
    vi.restoreAllMocks();
  });
});