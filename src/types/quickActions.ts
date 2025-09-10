import type { ComponentType } from 'react';

export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  route: string;
  params?: Record<string, string>;
  badge?: string | number;
  isEnabled?: boolean;
  category?: string;
}

export interface TrendingTopic {
  id: string;
  keyword: string;
  mentionCount: number;
  sentiment: number;
  sentimentLabel: 'positive' | 'neutral' | 'negative';
  trend: 'rising' | 'falling' | 'stable';
  changePercentage: number;
  relatedPoliticians: Array<{
    id: string;
    name: string;
    party: string;
  }>;
  platforms: Array<{
    platform: string;
    mentionCount: number;
    sentiment: number;
  }>;
  lastUpdated: string;
}

export interface TrendingTopicsData {
  topics: TrendingTopic[];
  totalTopics: number;
  lastUpdated: string;
  timeframe: '24h' | '7d' | '30d';
}