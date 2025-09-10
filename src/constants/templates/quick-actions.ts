import {
    ArrowPathIcon,
    BellIcon,
    BookmarkIcon,
    CalendarIcon,
    ChartBarIcon,
    ChatBubbleLeftRightIcon,
    ClockIcon,
    Cog6ToothIcon,
    DocumentArrowDownIcon,
    EyeIcon,
    FireIcon,
    FunnelIcon,
    GlobeAltIcon,
    HeartIcon,
    HomeIcon,
    MagnifyingGlassIcon,
    MapIcon,
    QuestionMarkCircleIcon,
    RocketLaunchIcon,
    ScaleIcon,
    ShareIcon,
    TrendingUpIcon,
    UserGroupIcon,
    UserIcon
} from '@heroicons/react/24/outline';
import type { ComponentType } from 'react';

export interface QuickActionTemplate {
  id: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  route: string;
  params?: Record<string, string>;
  badge?: string | number;
  isEnabled: boolean;
  category: QuickActionCategory;
  priority: number;
  requiresAuth?: boolean;
  featureFlag?: string;
  metadata?: {
    keywords: string[];
    tags: string[];
    lastUpdated: string;
    version: string;
  };
}

export enum QuickActionCategory {
  DASHBOARD = 'dashboard',
  ANALYSIS = 'analysis',
  SEARCH = 'search',
  COMPARISON = 'comparison',
  TRENDING = 'trending',
  EXPORT = 'export',
  SETTINGS = 'settings',
  HELP = 'help',
  NAVIGATION = 'navigation'
}

export enum QuickActionPriority {
  HIGH = 1,
  MEDIUM = 2,
  LOW = 3
}

// Core Dashboard Actions
export const DASHBOARD_ACTIONS: QuickActionTemplate[] = [
  {
    id: 'dashboard-overview',
    label: 'Dashboard Overview',
    description: 'View comprehensive political sentiment dashboard',
    icon: HomeIcon,
    route: '/dashboard',
    isEnabled: true,
    category: QuickActionCategory.DASHBOARD,
    priority: QuickActionPriority.HIGH,
    metadata: {
      keywords: ['dashboard', 'overview', 'home', 'main'],
      tags: ['core', 'navigation'],
      lastUpdated: '2024-01-15',
      version: '1.0.0'
    }
  },
  {
    id: 'trending-topics',
    label: 'Trending Topics',
    description: 'See what\'s trending in Nigerian politics',
    icon: FireIcon,
    route: '/trending',
    badge: 'Hot',
    isEnabled: true,
    category: QuickActionCategory.TRENDING,
    priority: QuickActionPriority.HIGH,
    metadata: {
      keywords: ['trending', 'hot', 'popular', 'viral'],
      tags: ['trending', 'topics'],
      lastUpdated: '2024-01-15',
      version: '1.0.0'
    }
  },
  {
    id: 'refresh-data',
    label: 'Refresh Data',
    description: 'Update all dashboard data with latest information',
    icon: ArrowPathIcon,
    route: '/dashboard',
    params: { action: 'refresh' },
    isEnabled: true,
    category: QuickActionCategory.DASHBOARD,
    priority: QuickActionPriority.MEDIUM,
    metadata: {
      keywords: ['refresh', 'update', 'reload', 'sync'],
      tags: ['data', 'update'],
      lastUpdated: '2024-01-15',
      version: '1.0.0'
    }
  }
];

// Analysis Actions
export const ANALYSIS_ACTIONS: QuickActionTemplate[] = [
  {
    id: 'geographic-analysis',
    label: 'Geographic Analysis',
    description: 'Explore sentiment across Nigerian states and regions',
    icon: MapIcon,
    route: '/analysis/geographic',
    badge: 'New',
    isEnabled: true,
    category: QuickActionCategory.ANALYSIS,
    priority: QuickActionPriority.HIGH,
    metadata: {
      keywords: ['geographic', 'states', 'regions', 'map', 'location'],
      tags: ['analysis', 'geography'],
      lastUpdated: '2024-01-15',
      version: '1.0.0'
    }
  },
  {
    id: 'demographic-insights',
    label: 'Demographic Insights',
    description: 'Analyze sentiment by age, education, and occupation',
    icon: UserGroupIcon,
    route: '/analysis/demographic',
    badge: 'New',
    isEnabled: true,
    category: QuickActionCategory.ANALYSIS,
    priority: QuickActionPriority.HIGH,
    metadata: {
      keywords: ['demographic', 'age', 'education', 'occupation', 'population'],
      tags: ['analysis', 'demographics'],
      lastUpdated: '2024-01-15',
      version: '1.0.0'
    }
  },
  {
    id: 'sentiment-deep-dive',
    label: 'Sentiment Deep Dive',
    description: 'Advanced emotion and intensity analysis',
    icon: ChatBubbleLeftRightIcon,
    route: '/analysis/sentiment',
    badge: 'Advanced',
    isEnabled: true,
    category: QuickActionCategory.ANALYSIS,
    priority: QuickActionPriority.HIGH,
    metadata: {
      keywords: ['sentiment', 'emotion', 'intensity', 'feelings', 'mood'],
      tags: ['analysis', 'sentiment'],
      lastUpdated: '2024-01-15',
      version: '1.0.0'
    }
  },
  {
    id: 'topic-trends',
    label: 'Topic Trends',
    description: 'Track policy areas and campaign issues',
    icon: ChartBarIcon,
    route: '/analysis/topics',
    badge: 'New',
    isEnabled: true,
    category: QuickActionCategory.ANALYSIS,
    priority: QuickActionPriority.HIGH,
    metadata: {
      keywords: ['topics', 'policy', 'campaign', 'issues', 'trends'],
      tags: ['analysis', 'topics'],
      lastUpdated: '2024-01-15',
      version: '1.0.0'
    }
  },
  {
    id: 'engagement-patterns',
    label: 'Engagement Patterns',
    description: 'Analyze viral content and influencer networks',
    icon: RocketLaunchIcon,
    route: '/analysis/engagement',
    badge: 'New',
    isEnabled: true,
    category: QuickActionCategory.ANALYSIS,
    priority: QuickActionPriority.HIGH,
    metadata: {
      keywords: ['engagement', 'viral', 'influencer', 'networks', 'social'],
      tags: ['analysis', 'engagement'],
      lastUpdated: '2024-01-15',
      version: '1.0.0'
    }
  },
  {
    id: 'time-analysis',
    label: 'Time Analysis',
    description: 'Discover temporal patterns and election cycles',
    icon: ClockIcon,
    route: '/analysis/temporal',
    badge: 'New',
    isEnabled: true,
    category: QuickActionCategory.ANALYSIS,
    priority: QuickActionPriority.HIGH,
    metadata: {
      keywords: ['time', 'temporal', 'patterns', 'election', 'cycles'],
      tags: ['analysis', 'temporal'],
      lastUpdated: '2024-01-15',
      version: '1.0.0'
    }
  },
  {
    id: 'data-quality',
    label: 'Data Quality Dashboard',
    description: 'Monitor data completeness and reliability',
    icon: EyeIcon,
    route: '/analysis/data-quality',
    isEnabled: true,
    category: QuickActionCategory.ANALYSIS,
    priority: QuickActionPriority.MEDIUM,
    metadata: {
      keywords: ['data', 'quality', 'reliability', 'completeness', 'monitoring'],
      tags: ['analysis', 'quality'],
      lastUpdated: '2024-01-15',
      version: '1.0.0'
    }
  }
];

// Search and Filter Actions
export const SEARCH_ACTIONS: QuickActionTemplate[] = [
  {
    id: 'advanced-search',
    label: 'Advanced Search',
    description: 'Search politicians, parties, and topics with filters',
    icon: MagnifyingGlassIcon,
    route: '/search',
    params: { mode: 'advanced' },
    isEnabled: true,
    category: QuickActionCategory.SEARCH,
    priority: QuickActionPriority.HIGH,
    metadata: {
      keywords: ['search', 'advanced', 'filter', 'find', 'query'],
      tags: ['search', 'filter'],
      lastUpdated: '2024-01-15',
      version: '1.0.0'
    }
  },
  {
    id: 'filter-presets',
    label: 'Filter Presets',
    description: 'Quick access to common filter combinations',
    icon: FunnelIcon,
    route: '/search',
    params: { view: 'presets' },
    isEnabled: true,
    category: QuickActionCategory.SEARCH,
    priority: QuickActionPriority.MEDIUM,
    metadata: {
      keywords: ['filter', 'presets', 'quick', 'combinations', 'saved'],
      tags: ['search', 'presets'],
      lastUpdated: '2024-01-15',
      version: '1.0.0'
    }
  },
  {
    id: 'search-history',
    label: 'Search History',
    description: 'View and repeat previous searches',
    icon: ClockIcon,
    route: '/search',
    params: { view: 'history' },
    isEnabled: true,
    category: QuickActionCategory.SEARCH,
    priority: QuickActionPriority.LOW,
    metadata: {
      keywords: ['search', 'history', 'previous', 'recent', 'repeat'],
      tags: ['search', 'history'],
      lastUpdated: '2024-01-15',
      version: '1.0.0'
    }
  }
];

// Comparison Actions
export const COMPARISON_ACTIONS: QuickActionTemplate[] = [
  {
    id: 'compare-parties',
    label: 'Compare Parties',
    description: 'Analyze party performance side-by-side',
    icon: ScaleIcon,
    route: '/party',
    params: { view: 'compare' },
    isEnabled: true,
    category: QuickActionCategory.COMPARISON,
    priority: QuickActionPriority.HIGH,
    metadata: {
      keywords: ['compare', 'parties', 'side-by-side', 'analysis', 'performance'],
      tags: ['comparison', 'parties'],
      lastUpdated: '2024-01-15',
      version: '1.0.0'
    }
  },
  {
    id: 'compare-politicians',
    label: 'Compare Politicians',
    description: 'Compare sentiment and engagement across politicians',
    icon: UserIcon,
    route: '/search',
    params: { view: 'compare', type: 'politicians' },
    isEnabled: true,
    category: QuickActionCategory.COMPARISON,
    priority: QuickActionPriority.HIGH,
    metadata: {
      keywords: ['compare', 'politicians', 'sentiment', 'engagement', 'analysis'],
      tags: ['comparison', 'politicians'],
      lastUpdated: '2024-01-15',
      version: '1.0.0'
    }
  },
  {
    id: 'compare-states',
    label: 'Compare States',
    description: 'Compare political sentiment across Nigerian states',
    icon: GlobeAltIcon,
    route: '/analysis/geographic',
    params: { view: 'compare' },
    isEnabled: true,
    category: QuickActionCategory.COMPARISON,
    priority: QuickActionPriority.MEDIUM,
    metadata: {
      keywords: ['compare', 'states', 'geographic', 'sentiment', 'regions'],
      tags: ['comparison', 'geography'],
      lastUpdated: '2024-01-15',
      version: '1.0.0'
    }
  }
];

// Quick Filter Actions
export const QUICK_FILTER_ACTIONS: QuickActionTemplate[] = [
  {
    id: 'positive-politicians',
    label: 'Most Positive Politicians',
    description: 'Politicians with highest positive sentiment',
    icon: HeartIcon,
    route: '/search',
    params: { filter: 'positive', sort: 'sentiment' },
    isEnabled: true,
    category: QuickActionCategory.SEARCH,
    priority: QuickActionPriority.HIGH,
    metadata: {
      keywords: ['positive', 'politicians', 'sentiment', 'highest', 'best'],
      tags: ['filter', 'sentiment'],
      lastUpdated: '2024-01-15',
      version: '1.0.0'
    }
  },
  {
    id: 'trending-politicians',
    label: 'Trending Politicians',
    description: 'Politicians with highest recent engagement',
    icon: TrendingUpIcon,
    route: '/search',
    params: { filter: 'trending', sort: 'engagement' },
    badge: 'Hot',
    isEnabled: true,
    category: QuickActionCategory.TRENDING,
    priority: QuickActionPriority.HIGH,
    metadata: {
      keywords: ['trending', 'politicians', 'engagement', 'popular', 'viral'],
      tags: ['trending', 'engagement'],
      lastUpdated: '2024-01-15',
      version: '1.0.0'
    }
  },
  {
    id: 'recent-activity',
    label: 'Recent Activity',
    description: 'Latest political discussions and mentions',
    icon: CalendarIcon,
    route: '/search',
    params: { filter: 'recent', sort: 'date' },
    isEnabled: true,
    category: QuickActionCategory.SEARCH,
    priority: QuickActionPriority.MEDIUM,
    metadata: {
      keywords: ['recent', 'activity', 'latest', 'discussions', 'mentions'],
      tags: ['filter', 'recent'],
      lastUpdated: '2024-01-15',
      version: '1.0.0'
    }
  }
];

// Export Actions
export const EXPORT_ACTIONS: QuickActionTemplate[] = [
  {
    id: 'export-dashboard',
    label: 'Export Dashboard',
    description: 'Download dashboard data and visualizations',
    icon: DocumentArrowDownIcon,
    route: '/dashboard',
    params: { action: 'export' },
    isEnabled: true,
    category: QuickActionCategory.EXPORT,
    priority: QuickActionPriority.MEDIUM,
    metadata: {
      keywords: ['export', 'dashboard', 'download', 'data', 'visualizations'],
      tags: ['export', 'data'],
      lastUpdated: '2024-01-15',
      version: '1.0.0'
    }
  },
  {
    id: 'share-insights',
    label: 'Share Insights',
    description: 'Generate shareable links for current analysis',
    icon: ShareIcon,
    route: '/dashboard',
    params: { action: 'share' },
    isEnabled: true,
    category: QuickActionCategory.EXPORT,
    priority: QuickActionPriority.MEDIUM,
    metadata: {
      keywords: ['share', 'insights', 'links', 'analysis', 'collaborate'],
      tags: ['share', 'collaboration'],
      lastUpdated: '2024-01-15',
      version: '1.0.0'
    }
  },
  {
    id: 'save-bookmark',
    label: 'Save Bookmark',
    description: 'Bookmark current view for quick access',
    icon: BookmarkIcon,
    route: '/dashboard',
    params: { action: 'bookmark' },
    isEnabled: true,
    category: QuickActionCategory.EXPORT,
    priority: QuickActionPriority.LOW,
    metadata: {
      keywords: ['save', 'bookmark', 'quick', 'access', 'favorite'],
      tags: ['bookmark', 'save'],
      lastUpdated: '2024-01-15',
      version: '1.0.0'
    }
  }
];

// Settings and Help Actions
export const UTILITY_ACTIONS: QuickActionTemplate[] = [
  {
    id: 'settings',
    label: 'Settings',
    description: 'Configure dashboard preferences and options',
    icon: Cog6ToothIcon,
    route: '/settings',
    isEnabled: true,
    category: QuickActionCategory.SETTINGS,
    priority: QuickActionPriority.LOW,
    metadata: {
      keywords: ['settings', 'preferences', 'configuration', 'options'],
      tags: ['settings', 'configuration'],
      lastUpdated: '2024-01-15',
      version: '1.0.0'
    }
  },
  {
    id: 'notifications',
    label: 'Notifications',
    description: 'View alerts and system notifications',
    icon: BellIcon,
    route: '/notifications',
    isEnabled: true,
    category: QuickActionCategory.SETTINGS,
    priority: QuickActionPriority.MEDIUM,
    metadata: {
      keywords: ['notifications', 'alerts', 'system', 'messages'],
      tags: ['notifications', 'alerts'],
      lastUpdated: '2024-01-15',
      version: '1.0.0'
    }
  },
  {
    id: 'help',
    label: 'Help & Support',
    description: 'Get help and learn about dashboard features',
    icon: QuestionMarkCircleIcon,
    route: '/help',
    isEnabled: true,
    category: QuickActionCategory.HELP,
    priority: QuickActionPriority.LOW,
    metadata: {
      keywords: ['help', 'support', 'documentation', 'guide', 'tutorial'],
      tags: ['help', 'support'],
      lastUpdated: '2024-01-15',
      version: '1.0.0'
    }
  }
];

// All Quick Actions Combined
export const ALL_QUICK_ACTIONS: QuickActionTemplate[] = [
  ...DASHBOARD_ACTIONS,
  ...ANALYSIS_ACTIONS,
  ...SEARCH_ACTIONS,
  ...COMPARISON_ACTIONS,
  ...QUICK_FILTER_ACTIONS,
  ...EXPORT_ACTIONS,
  ...UTILITY_ACTIONS
];

// Quick Action Generation Functions
export const generateQuickActionsByCategory = (category: QuickActionCategory): QuickActionTemplate[] => {
  return ALL_QUICK_ACTIONS.filter(action => action.category === category);
};

export const generateQuickActionsByPriority = (priority: QuickActionPriority): QuickActionTemplate[] => {
  return ALL_QUICK_ACTIONS.filter(action => action.priority === priority);
};

export const generateEnabledQuickActions = (): QuickActionTemplate[] => {
  return ALL_QUICK_ACTIONS.filter(action => action.isEnabled);
};

export const generateQuickActionsByKeyword = (keyword: string): QuickActionTemplate[] => {
  const lowerKeyword = keyword.toLowerCase();
  return ALL_QUICK_ACTIONS.filter(action => 
    action.metadata?.keywords.some(k => k.includes(lowerKeyword)) ||
    action.label.toLowerCase().includes(lowerKeyword) ||
    action.description.toLowerCase().includes(lowerKeyword)
  );
};

export const generateQuickActionsByTag = (tag: string): QuickActionTemplate[] => {
  return ALL_QUICK_ACTIONS.filter(action => 
    action.metadata?.tags.includes(tag)
  );
};

export const generateQuickActionById = (id: string): QuickActionTemplate | undefined => {
  return ALL_QUICK_ACTIONS.find(action => action.id === id);
};

// Dynamic Action Generation System
export interface DynamicActionConfig {
  baseAction: string;
  parameters: Record<string, string>;
  label?: string;
  description?: string;
  badge?: string;
}

export const generateDynamicAction = (config: DynamicActionConfig): QuickActionTemplate | null => {
  const baseAction = generateQuickActionById(config.baseAction);
  if (!baseAction) return null;

  return {
    ...baseAction,
    id: `${baseAction.id}-dynamic-${Date.now()}`,
    label: config.label || baseAction.label,
    description: config.description || baseAction.description,
    badge: config.badge || baseAction.badge,
    params: { ...baseAction.params, ...config.parameters }
  };
};

// Action Routing System
export interface ActionRoute {
  path: string;
  params?: Record<string, string>;
  hash?: string;
}

export const generateActionRoute = (action: QuickActionTemplate): ActionRoute => {
  const route: ActionRoute = {
    path: action.route
  };

  if (action.params && Object.keys(action.params).length > 0) {
    route.params = action.params;
  }

  return route;
};

export const generateActionUrl = (action: QuickActionTemplate): string => {
  const route = generateActionRoute(action);
  let url = route.path;

  if (route.params) {
    const searchParams = new URLSearchParams(route.params);
    url += `?${searchParams.toString()}`;
  }

  if (route.hash) {
    url += `#${route.hash}`;
  }

  return url;
};