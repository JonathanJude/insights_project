import {
    ChartBarIcon,
    ChatBubbleLeftRightIcon,
    ClockIcon,
    FireIcon,
    HeartIcon,
    MapIcon,
    RocketLaunchIcon,
    ScaleIcon,
    UserGroupIcon
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

// Enhanced Quick Actions for Multi-Dimensional Analysis
export const enhancedQuickActions: QuickAction[] = [
  {
    id: 'geographic-analysis',
    label: 'Geographic Analysis',
    description: 'Explore sentiment across Nigerian states and regions',
    icon: MapIcon,
    route: '/analysis/geographic',
    badge: 'New',
    isEnabled: true,
    category: 'analysis'
  },
  {
    id: 'demographic-insights',
    label: 'Demographic Insights',
    description: 'Analyze sentiment by age, education, and occupation',
    icon: UserGroupIcon,
    route: '/analysis/demographic',
    badge: 'New',
    isEnabled: true,
    category: 'analysis'
  },
  {
    id: 'sentiment-deep-dive',
    label: 'Sentiment Deep Dive',
    description: 'Advanced emotion and intensity analysis',
    icon: ChatBubbleLeftRightIcon,
    route: '/analysis/sentiment',
    badge: 'New',
    isEnabled: true,
    category: 'analysis'
  },
  {
    id: 'topic-trends',
    label: 'Topic Trends',
    description: 'Track policy areas and campaign issues',
    icon: ChartBarIcon,
    route: '/analysis/topics',
    badge: 'New',
    isEnabled: true,
    category: 'analysis'
  },
  {
    id: 'engagement-patterns',
    label: 'Engagement Patterns',
    description: 'Analyze viral content and influencer networks',
    icon: RocketLaunchIcon,
    route: '/analysis/engagement',
    badge: 'New',
    isEnabled: true,
    category: 'analysis'
  },
  {
    id: 'time-analysis',
    label: 'Time Analysis',
    description: 'Discover temporal patterns and election cycles',
    icon: ClockIcon,
    route: '/analysis/temporal',
    badge: 'New',
    isEnabled: true,
    category: 'analysis'
  }
];

export const getQuickActionById = (id: string): QuickAction | undefined => {
  return quickActions.find(action => action.id === id);
};

export const getEnabledQuickActions = (): QuickAction[] => {
  return quickActions.filter(action => action.isEnabled !== false);
};

export const getEnhancedQuickActions = (): QuickAction[] => {
  return enhancedQuickActions.filter(action => action.isEnabled !== false);
};

export const getAllQuickActions = (): QuickAction[] => {
  return [...quickActions, ...enhancedQuickActions].filter(action => action.isEnabled !== false);
};

export const getQuickActionsByCategory = (category?: string): QuickAction[] => {
  const allActions = getAllQuickActions();
  if (!category) return allActions;
  return allActions.filter(action => action.category === category);
};