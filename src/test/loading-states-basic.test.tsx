import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

// Import skeleton components
import {
    SkeletonBase,
    SkeletonCard,
    SkeletonChart,
    SkeletonList,
    SkeletonStatsCard,
    SkeletonText
} from '../components/ui/skeletons';

describe('Basic Loading States', () => {
  describe('SkeletonBase', () => {
    it('renders with default props', () => {
      const { container } = render(<SkeletonBase />);
      const element = container.firstChild as HTMLElement;
      
      expect(element).toHaveClass('bg-gradient-to-r');
      expect(element).toHaveClass('animate-pulse');
      expect(element).toHaveClass('rounded-md');
    });

    it('applies custom className', () => {
      const { container } = render(<SkeletonBase className="custom-class" />);
      const element = container.firstChild as HTMLElement;
      
      expect(element).toHaveClass('custom-class');
    });

    it('applies different rounded styles', () => {
      const { container: container1 } = render(<SkeletonBase rounded="full" />);
      const element1 = container1.firstChild as HTMLElement;
      expect(element1).toHaveClass('rounded-full');

      const { container: container2 } = render(<SkeletonBase rounded="lg" />);
      const element2 = container2.firstChild as HTMLElement;
      expect(element2).toHaveClass('rounded-lg');
    });

    it('can disable animation', () => {
      const { container } = render(<SkeletonBase animate={false} />);
      const element = container.firstChild as HTMLElement;
      
      expect(element).not.toHaveClass('animate-pulse');
    });
  });

  describe('SkeletonText', () => {
    it('renders single line by default', () => {
      const { container } = render(<SkeletonText />);
      const lines = container.querySelectorAll('.h-4');
      
      expect(lines).toHaveLength(1);
    });

    it('renders multiple lines', () => {
      const { container } = render(<SkeletonText lines={3} />);
      const lines = container.querySelectorAll('.h-4');
      
      expect(lines).toHaveLength(3);
    });

    it('applies different line heights', () => {
      const { container: container1 } = render(<SkeletonText lineHeight="sm" />);
      expect(container1.querySelector('.h-3')).toBeInTheDocument();

      const { container: container2 } = render(<SkeletonText lineHeight="lg" />);
      expect(container2.querySelector('.h-5')).toBeInTheDocument();
    });

    it('applies custom widths', () => {
      const { container } = render(<SkeletonText width={['50%', '75%']} lines={2} />);
      const lines = container.querySelectorAll('.h-4');
      
      expect(lines).toHaveLength(2);
      // Check that styles are applied (width is set via style attribute)
      expect(lines[0]).toHaveStyle({ width: '50%' });
      expect(lines[1]).toHaveStyle({ width: '75%' });
    });
  });

  describe('SkeletonCard', () => {
    it('renders with default structure', () => {
      const { container } = render(<SkeletonCard />);
      
      // Should have card container
      expect(container.querySelector('.bg-white')).toBeInTheDocument();
      expect(container.querySelector('.border')).toBeInTheDocument();
      expect(container.querySelector('.rounded-lg')).toBeInTheDocument();
    });

    it('shows avatar when enabled', () => {
      const { container } = render(<SkeletonCard showAvatar={true} />);
      
      // Should have avatar skeleton
      expect(container.querySelector('.rounded-full')).toBeInTheDocument();
    });

    it('hides avatar when disabled', () => {
      const { container } = render(<SkeletonCard showAvatar={false} />);
      
      // Should not have avatar skeleton (large rounded element)
      expect(container.querySelector('.w-12.h-12.rounded-full')).not.toBeInTheDocument();
      expect(container.querySelector('.w-8.h-8.rounded-full')).not.toBeInTheDocument();
      expect(container.querySelector('.w-16.h-16.rounded-full')).not.toBeInTheDocument();
    });

    it('shows stats when enabled', () => {
      const { container } = render(<SkeletonCard showStats={true} statsCount={3} />);
      
      // Should have stats section
      expect(container.querySelector('.border-t')).toBeInTheDocument();
      expect(container.querySelector('.grid')).toBeInTheDocument();
    });

    it('applies different padding sizes', () => {
      const { container: container1 } = render(<SkeletonCard padding="sm" />);
      expect(container1.querySelector('.p-3')).toBeInTheDocument();

      const { container: container2 } = render(<SkeletonCard padding="lg" />);
      expect(container2.querySelector('.p-6')).toBeInTheDocument();
    });
  });

  describe('SkeletonStatsCard', () => {
    it('renders with proper structure', () => {
      const { container } = render(<SkeletonStatsCard />);
      
      // Should have card structure
      expect(container.querySelector('.bg-white')).toBeInTheDocument();
      expect(container.querySelector('.border')).toBeInTheDocument();
      expect(container.querySelector('.rounded-lg')).toBeInTheDocument();
      expect(container.querySelector('.p-6')).toBeInTheDocument();
    });

    it('shows trend when enabled', () => {
      const { container } = render(<SkeletonStatsCard showTrend={true} />);
      
      // Should have multiple skeleton elements for trend
      const skeletonElements = container.querySelectorAll('.bg-gradient-to-r');
      expect(skeletonElements.length).toBeGreaterThan(3); // Title, value, trend, description
    });

    it('shows icon when enabled', () => {
      const { container } = render(<SkeletonStatsCard showIcon={true} />);
      
      // Should have icon skeleton
      expect(container.querySelector('.w-16.h-16')).toBeInTheDocument();
    });
  });

  describe('SkeletonChart', () => {
    it('renders line chart skeleton', () => {
      const { container } = render(<SkeletonChart type="line" />);
      
      expect(container.querySelector('.bg-white')).toBeInTheDocument();
      expect(container.querySelector('.p-6')).toBeInTheDocument();
    });

    it('renders pie chart skeleton', () => {
      const { container } = render(<SkeletonChart type="pie" />);
      
      expect(container.querySelector('.bg-white')).toBeInTheDocument();
      // Pie chart should have circular skeleton
      expect(container.querySelector('.rounded-full')).toBeInTheDocument();
    });

    it('renders bar chart skeleton', () => {
      const { container } = render(<SkeletonChart type="bar" />);
      
      expect(container.querySelector('.bg-white')).toBeInTheDocument();
      // Bar chart should have multiple bar elements
      const bars = container.querySelectorAll('.w-8');
      expect(bars.length).toBeGreaterThan(0);
    });

    it('shows filters when enabled', () => {
      const { container } = render(<SkeletonChart showFilters={true} />);
      
      // Should have filter section
      const filterElements = container.querySelectorAll('.flex.justify-between');
      expect(filterElements.length).toBeGreaterThan(0);
    });

    it('shows legend when enabled', () => {
      const { container } = render(<SkeletonChart showLegend={true} />);
      
      // Should have legend section
      const legendElements = container.querySelectorAll('.flex.justify-center');
      expect(legendElements.length).toBeGreaterThan(0);
    });

    it('applies custom height', () => {
      const { container } = render(<SkeletonChart height={400} />);
      
      // Should have container with specified height
      const chartContainer = container.querySelector('[style*="height"]');
      expect(chartContainer).toBeInTheDocument();
    });
  });

  describe('SkeletonList', () => {
    it('renders specified number of items', () => {
      const { container } = render(<SkeletonList items={3} />);
      
      // Should have 3 list items
      const items = container.querySelectorAll('.space-y-3 > div');
      expect(items).toHaveLength(3);
    });

    it('shows rank when enabled', () => {
      const { container } = render(<SkeletonList showRank={true} />);
      
      // Should have rank indicators
      const rankElements = container.querySelectorAll('.w-8.h-8');
      expect(rankElements.length).toBeGreaterThan(0);
    });

    it('shows avatar when enabled', () => {
      const { container } = render(<SkeletonList showAvatar={true} />);
      
      // Should have avatar skeletons
      const avatarElements = container.querySelectorAll('.w-12.h-12');
      expect(avatarElements.length).toBeGreaterThan(0);
    });

    it('shows stats when enabled', () => {
      const { container } = render(<SkeletonList showStats={true} />);
      
      // Should have stats sections
      const statsElements = container.querySelectorAll('.flex.items-center.justify-between');
      expect(statsElements.length).toBeGreaterThan(0);
    });
  });

  describe('Dark Mode Support', () => {
    it('includes dark mode classes', () => {
      const { container } = render(<SkeletonBase />);
      const element = container.firstChild as HTMLElement;
      
      // Should have dark mode gradient classes
      expect(element.className).toContain('dark:from-gray-700');
      expect(element.className).toContain('dark:via-gray-600');
      expect(element.className).toContain('dark:to-gray-700');
    });

    it('applies dark mode to card components', () => {
      const { container } = render(<SkeletonCard />);
      
      // Should have dark mode background classes
      expect(container.querySelector('.dark\\:bg-gray-800')).toBeInTheDocument();
      expect(container.querySelector('.dark\\:border-gray-700')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('includes responsive classes', () => {
      const { container } = render(<SkeletonCard />);
      
      // Should have responsive padding and layout classes
      expect(container.querySelector('.p-4')).toBeInTheDocument();
    });

    it('handles responsive grid layouts', () => {
      const { container } = render(<SkeletonList />);
      
      // Should have responsive spacing
      expect(container.querySelector('.space-y-3')).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('includes pulse animation by default', () => {
      const { container } = render(<SkeletonBase />);
      const element = container.firstChild as HTMLElement;
      
      expect(element).toHaveClass('animate-pulse');
    });

    it('can disable animation', () => {
      const { container } = render(<SkeletonBase animate={false} />);
      const element = container.firstChild as HTMLElement;
      
      expect(element).not.toHaveClass('animate-pulse');
    });
  });

  describe('Accessibility', () => {
    it('provides proper semantic structure', () => {
      const { container } = render(<SkeletonCard />);
      
      // Should have proper container structure
      expect(container.querySelector('.bg-white')).toBeInTheDocument();
      expect(container.querySelector('.border')).toBeInTheDocument();
    });

    it('maintains layout structure during loading', () => {
      const { container } = render(<SkeletonStatsCard />);
      
      // Should maintain the same layout as the actual component
      expect(container.querySelector('.flex.items-center.justify-between')).toBeInTheDocument();
    });
  });
});