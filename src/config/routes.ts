import { ComponentType, lazy } from 'react';

// Lazy load components for better performance
const Dashboard = lazy(() => import('../pages/dashboard/Dashboard'));
const PoliticianDetail = lazy(() => import('../pages/politician/PoliticianDetail'));
const SearchResults = lazy(() => import('../pages/search/SearchResults'));
const TrendingTopics = lazy(() => import('../pages/trending/TrendingTopics'));
const PartyAnalytics = lazy(() => import('../pages/party/PartyAnalytics'));
const PartyDetail = lazy(() => import('../pages/party/PartyDetail'));
const Profile = lazy(() => import('../pages/profile/Profile'));

// Analysis Pages
const GeographicAnalysis = lazy(() => import('../pages/analysis/GeographicAnalysis'));
const DemographicInsights = lazy(() => import('../pages/analysis/DemographicInsights'));
const SentimentDeepDive = lazy(() => import('../pages/analysis/SentimentDeepDive'));
const TopicTrends = lazy(() => import('../pages/analysis/TopicTrends'));
const EngagementPatterns = lazy(() => import('../pages/analysis/EngagementPatterns'));
const TimeAnalysis = lazy(() => import('../pages/analysis/TimeAnalysis'));

export interface RouteConfig {
  path: string;
  component: ComponentType<any>;
  title: string;
  description?: string;
  category?: 'main' | 'analysis' | 'party' | 'politician';
  isNew?: boolean;
  requiresAuth?: boolean;
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export const routes: RouteConfig[] = [
  // Main Routes
  {
    path: '/',
    component: Dashboard,
    title: 'Dashboard',
    description: 'Political sentiment insights across Nigerian social media',
    category: 'main'
  },
  {
    path: '/search',
    component: SearchResults,
    title: 'Search Politicians',
    description: 'Search and explore political figures',
    category: 'main'
  },
  {
    path: '/trending',
    component: TrendingTopics,
    title: 'Trending Topics',
    description: 'Discover what\'s trending in Nigerian politics',
    category: 'main'
  },
  {
    path: '/profile',
    component: Profile,
    title: 'Profile',
    description: 'User profile and settings',
    category: 'main'
  },

  // Politician Routes
  {
    path: '/politician/:id',
    component: PoliticianDetail,
    title: 'Politician Details',
    description: 'Detailed analysis of individual politicians',
    category: 'politician'
  },

  // Party Routes
  {
    path: '/party',
    component: PartyAnalytics,
    title: 'Party Analytics',
    description: 'Compare and analyze political parties',
    category: 'party'
  },
  {
    path: '/party/:partyId',
    component: PartyDetail,
    title: 'Party Details',
    description: 'Detailed party analysis and member insights',
    category: 'party'
  },

  // Analysis Routes (Enhanced Multi-Dimensional)
  {
    path: '/analysis/geographic',
    component: GeographicAnalysis,
    title: 'Geographic Analysis',
    description: 'Explore sentiment across Nigerian states and regions',
    category: 'analysis',
    isNew: true,
    breadcrumbs: [
      { label: 'Dashboard', href: '/' },
      { label: 'Advanced Analysis' },
      { label: 'Geographic Analysis' }
    ]
  },
  {
    path: '/analysis/demographic',
    component: DemographicInsights,
    title: 'Demographic Insights',
    description: 'Analyze sentiment by age, education, and occupation',
    category: 'analysis',
    isNew: true,
    breadcrumbs: [
      { label: 'Dashboard', href: '/' },
      { label: 'Advanced Analysis' },
      { label: 'Demographic Insights' }
    ]
  },
  {
    path: '/analysis/sentiment',
    component: SentimentDeepDive,
    title: 'Sentiment Deep Dive',
    description: 'Advanced emotion and intensity analysis',
    category: 'analysis',
    isNew: true,
    breadcrumbs: [
      { label: 'Dashboard', href: '/' },
      { label: 'Advanced Analysis' },
      { label: 'Sentiment Deep Dive' }
    ]
  },
  {
    path: '/analysis/topics',
    component: TopicTrends,
    title: 'Topic Trends',
    description: 'Track policy areas and campaign issues',
    category: 'analysis',
    isNew: true,
    breadcrumbs: [
      { label: 'Dashboard', href: '/' },
      { label: 'Advanced Analysis' },
      { label: 'Topic Trends' }
    ]
  },
  {
    path: '/analysis/engagement',
    component: EngagementPatterns,
    title: 'Engagement Patterns',
    description: 'Analyze viral content and influencer networks',
    category: 'analysis',
    isNew: true,
    breadcrumbs: [
      { label: 'Dashboard', href: '/' },
      { label: 'Advanced Analysis' },
      { label: 'Engagement Patterns' }
    ]
  },
  {
    path: '/analysis/temporal',
    component: TimeAnalysis,
    title: 'Time Analysis',
    description: 'Discover temporal patterns and election cycles',
    category: 'analysis',
    isNew: true,
    breadcrumbs: [
      { label: 'Dashboard', href: '/' },
      { label: 'Advanced Analysis' },
      { label: 'Time Analysis' }
    ]
  }
];

// Helper functions
export const getRouteByPath = (path: string): RouteConfig | undefined => {
  return routes.find(route => route.path === path);
};

export const getRoutesByCategory = (category: RouteConfig['category']): RouteConfig[] => {
  return routes.filter(route => route.category === category);
};

export const getAnalysisRoutes = (): RouteConfig[] => {
  return getRoutesByCategory('analysis');
};

export const getMainRoutes = (): RouteConfig[] => {
  return getRoutesByCategory('main');
};

export const getNewRoutes = (): RouteConfig[] => {
  return routes.filter(route => route.isNew);
};