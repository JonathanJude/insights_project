import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNavigationStore } from '../stores/navigationStore';

interface PageMetadata {
  title: string;
  description?: string;
  category?: string;
  keywords?: string[];
}

interface UsePageNavigationProps {
  metadata: PageMetadata;
  trackVisit?: boolean;
}

export const usePageNavigation = ({ 
  metadata, 
  trackVisit = true 
}: UsePageNavigationProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addRecentPage } = useNavigationStore();

  // Track page visit
  useEffect(() => {
    if (trackVisit) {
      addRecentPage({
        id: location.pathname,
        name: metadata.title,
        href: location.pathname
      });
    }
  }, [location.pathname, metadata.title, trackVisit, addRecentPage]);

  // Update document title
  useEffect(() => {
    const baseTitle = 'Insight Intelligence';
    document.title = metadata.title ? `${metadata.title} | ${baseTitle}` : baseTitle;
    
    // Update meta description if provided
    if (metadata.description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', metadata.description);
      }
    }

    // Update meta keywords if provided
    if (metadata.keywords && metadata.keywords.length > 0) {
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', metadata.keywords.join(', '));
      }
    }
  }, [metadata]);

  // Navigation helpers
  const navigateToAnalysis = (analysisType: string) => {
    navigate(`/analysis/${analysisType}`);
  };

  const navigateBack = () => {
    navigate(-1);
  };

  const navigateToHome = () => {
    navigate('/');
  };

  const navigateWithParams = (path: string, params: Record<string, string>) => {
    const searchParams = new URLSearchParams(params);
    navigate(`${path}?${searchParams.toString()}`);
  };

  return {
    currentPath: location.pathname,
    searchParams: new URLSearchParams(location.search),
    navigateToAnalysis,
    navigateBack,
    navigateToHome,
    navigateWithParams,
    navigate
  };
};

// Page metadata constants for analysis pages
export const ANALYSIS_PAGE_METADATA = {
  geographic: {
    title: 'Geographic Analysis',
    description: 'Explore political sentiment across Nigerian states, LGAs, and regions with interactive maps and regional comparisons.',
    category: 'analysis',
    keywords: ['geographic', 'regional', 'states', 'nigeria', 'sentiment', 'choropleth', 'maps']
  },
  demographic: {
    title: 'Demographic Insights',
    description: 'Analyze political sentiment patterns across age groups, education levels, occupations, and gender demographics.',
    category: 'analysis',
    keywords: ['demographic', 'age', 'education', 'occupation', 'gender', 'insights', 'patterns']
  },
  sentiment: {
    title: 'Sentiment Deep Dive',
    description: 'Advanced sentiment analysis with emotion detection, intensity scaling, and complexity analysis.',
    category: 'analysis',
    keywords: ['sentiment', 'emotion', 'intensity', 'polarity', 'analysis', 'deep dive']
  },
  topics: {
    title: 'Topic Trends',
    description: 'Track trending political topics, policy areas, campaign issues, and event-driven discussions.',
    category: 'analysis',
    keywords: ['topics', 'trends', 'policy', 'campaign', 'issues', 'politics', 'trending']
  },
  engagement: {
    title: 'Engagement Patterns',
    description: 'Analyze content engagement, virality patterns, influencer networks, and quality metrics.',
    category: 'analysis',
    keywords: ['engagement', 'viral', 'influencer', 'networks', 'quality', 'patterns']
  },
  temporal: {
    title: 'Time Analysis',
    description: 'Discover temporal patterns, circadian rhythms, weekly cycles, and election timeline analysis.',
    category: 'analysis',
    keywords: ['temporal', 'time', 'patterns', 'circadian', 'election', 'cycles', 'timeline']
  }
} as const;