import {
    FireIcon,
    HeartIcon,
    ScaleIcon
} from '@heroicons/react/24/outline';
import type { QuickAction } from '../types/quickActions';

export const quickActions: QuickAction[] = [
  {
    id: 'trending-topics',
    label: 'View Trending Topics',
    description: 'See what\'s trending in Nigerian politics',
    icon: FireIcon,
    route: '/trending',
    isEnabled: true
  },
  {
    id: 'compare-parties',
    label: 'Compare Parties',
    description: 'Analyze party performance side-by-side',
    icon: ScaleIcon,
    route: '/party',
    isEnabled: true
  },
  {
    id: 'positive-politicians',
    label: 'Most Positive Politicians',
    description: 'Politicians with highest positive sentiment',
    icon: HeartIcon,
    route: '/search',
    params: { filter: 'positive', sort: 'sentiment' },
    isEnabled: true
  }
];

export const getQuickActionById = (id: string): QuickAction | undefined => {
  return quickActions.find(action => action.id === id);
};

export const getEnabledQuickActions = (): QuickAction[] => {
  return quickActions.filter(action => action.isEnabled !== false);
};