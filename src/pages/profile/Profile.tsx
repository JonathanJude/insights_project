import {
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
  Cog6ToothIcon,
  EyeIcon,
  GlobeAltIcon,
  HeartIcon,
  MapPinIcon,
  PencilIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';

import { Link } from 'react-router-dom';
import StatsCard from '../../components/ui/StatsCard';
import SkeletonProfile from '../../components/ui/skeletons/SkeletonProfile';
import { usePageTitle } from '../../hooks/usePageTitle';

// Mock user data
const mockUserData = {
  id: 'user-001',
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  role: 'Political Analyst',
  organization: 'Insight Intelligence',
  location: 'Lagos, Nigeria',
  timezone: 'WAT (UTC+1)',
  joinedDate: '2023-06-15',
  lastActive: '2024-01-15T10:30:00Z',
  bio: 'Experienced political analyst specializing in Nigerian politics and social media sentiment analysis. Passionate about data-driven insights and democratic processes.',
  preferences: {
    theme: 'light',
    notifications: {
      email: true,
      push: true,
      sms: false,
      weeklyReport: true,
      trendingAlerts: true,
      mentionAlerts: false
    },
    dashboard: {
      defaultTimeRange: '30d',
      favoriteCharts: ['sentiment-trend', 'party-distribution'],
      autoRefresh: true,
      refreshInterval: 300000 // 5 minutes
    }
  },
  stats: {
    totalSearches: 1247,
    favoritesPoliticians: 23,
    reportsGenerated: 89,
    timeSpent: 156, // hours
    lastLogin: '2024-01-15T08:15:00Z'
  },
  recentActivity: [
    {
      id: 1,
      type: 'search',
      description: 'Searched for "Bola Tinubu sentiment analysis"',
      timestamp: '2024-01-15T09:45:00Z',
      icon: 'search'
    },
    {
      id: 2,
      type: 'favorite',
      description: 'Added Peter Obi to favorites',
      timestamp: '2024-01-15T09:30:00Z',
      icon: 'heart'
    },
    {
      id: 3,
      type: 'report',
      description: 'Generated weekly sentiment report',
      timestamp: '2024-01-15T08:20:00Z',
      icon: 'chart'
    },
    {
      id: 4,
      type: 'view',
      description: 'Viewed APC party analytics',
      timestamp: '2024-01-14T16:45:00Z',
      icon: 'eye'
    },
    {
      id: 5,
      type: 'settings',
      description: 'Updated notification preferences',
      timestamp: '2024-01-14T14:30:00Z',
      icon: 'settings'
    }
  ],
  favoritePoliticians: [
    { id: 'pol-001', name: 'Bola Ahmed Tinubu', party: 'APC', position: 'President' },
    { id: 'pol-002', name: 'Peter Obi', party: 'LP', position: 'Former Governor' },
    { id: 'pol-003', name: 'Atiku Abubakar', party: 'PDP', position: 'Former Vice President' },
    { id: 'pol-004', name: 'Babajide Sanwo-Olu', party: 'APC', position: 'Governor' },
    { id: 'pol-005', name: 'Nyesom Wike', party: 'PDP', position: 'Former Governor' }
  ]
};

const Profile: React.FC = () => {
  usePageTitle('Profile');
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'preferences' | 'security'>('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Simulate loading state for demo purposes
  React.useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'search':
        return <ChartBarIcon className="h-4 w-4" />;
      case 'favorite':
        return <HeartIcon className="h-4 w-4" />;
      case 'report':
        return <ChartBarIcon className="h-4 w-4" />;
      case 'view':
        return <EyeIcon className="h-4 w-4" />;
      case 'settings':
        return <Cog6ToothIcon className="h-4 w-4" />;
      default:
        return <ClockIcon className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'search':
        return 'text-blue-600 bg-blue-100';
      case 'favorite':
        return 'text-red-600 bg-red-100';
      case 'report':
        return 'text-green-600 bg-green-100';
      case 'view':
        return 'text-purple-600 bg-purple-100';
      case 'settings':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const TabButton: React.FC<{ 
    tab: typeof activeTab; 
    label: string; 
    isActive: boolean; 
    onClick: () => void;
  }> = ({ label, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:bg-gray-800'
      }`}
    >
      {label}
    </button>
  );

  if (isLoading) {
    return <SkeletonProfile />;
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex mb-6" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          <li>
            <Link to="/" className="text-gray-400 hover:text-gray-500 transition-colors">
              Dashboard
            </Link>
          </li>
          <li>
            <svg className="flex-shrink-0 h-5 w-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </li>
          <li>
            <span className="text-gray-500 font-medium">Profile</span>
          </li>
        </ol>
      </nav>

      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        
        {/* Profile Info */}
        <div className="px-6 pb-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-6 -mt-12">
            {/* Avatar */}
            <div className="relative">
              <img
                src={mockUserData.avatar}
                alt={mockUserData.name}
                className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg object-cover"
              />
              <button className="absolute bottom-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <PencilIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            
            {/* User Info */}
            <div className="flex-1 mt-6 sm:mt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div className="mb-4 sm:mb-0">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{mockUserData.name}</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-1">{mockUserData.role}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">{mockUserData.organization}</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 self-start sm:self-auto">
                  <PencilIcon className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              </div>
              
              {/* Meta Info */}
              <div className="flex flex-wrap items-center space-x-6 mt-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{mockUserData.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <GlobeAltIcon className="h-4 w-4" />
                  <span>{mockUserData.timezone}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Joined {formatDate(mockUserData.joinedDate)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ClockIcon className="h-4 w-4" />
                  <span>Last active {formatDateTime(mockUserData.lastActive)}</span>
                </div>
              </div>
              
              {/* Bio */}
              <p className="mt-4 text-gray-700 dark:text-gray-300 max-w-2xl">{mockUserData.bio}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Searches"
          value={mockUserData.stats.totalSearches.toLocaleString()}
          icon={ChartBarIcon}
          trend={{ value: 12.5, isPositive: true }}
          description="This month"
        />
        <StatsCard
          title="Favorite Politicians"
          value={mockUserData.stats.favoritesPoliticians}
          icon={HeartIcon}
          iconColor="text-red-600"
          trend={{ value: 3, isPositive: true }}
          description="Currently tracking"
        />
        <StatsCard
          title="Reports Generated"
          value={mockUserData.stats.reportsGenerated}
          icon={ChartBarIcon}
          iconColor="text-green-600"
          trend={{ value: 8.2, isPositive: true }}
          description="All time"
        />
        <StatsCard
          title="Time Spent"
          value={`${mockUserData.stats.timeSpent}h`}
          icon={ClockIcon}
          iconColor="text-purple-600"
          trend={{ value: 15.3, isPositive: true }}
          description="This month"
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700 mb-6">
        <TabButton
          tab="overview"
          label="Overview"
          isActive={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
        />
        <TabButton
          tab="activity"
          label="Recent Activity"
          isActive={activeTab === 'activity'}
          onClick={() => setActiveTab('activity')}
        />
        <TabButton
          tab="preferences"
          label="Preferences"
          isActive={activeTab === 'preferences'}
          onClick={() => setActiveTab('preferences')}
        />
        <TabButton
          tab="security"
          label="Security"
          isActive={activeTab === 'security'}
          onClick={() => setActiveTab('security')}
        />
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Favorite Politicians */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Favorite Politicians</h3>
                <Link to="/search" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {mockUserData.favoritePoliticians.map((politician) => (
                  <div key={politician.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{politician.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{politician.position} • {politician.party}</p>
                    </div>
                    <button className="text-red-500 hover:text-red-600 transition-colors">
                      <HeartIcon className="h-5 w-5 fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/search"
                  className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <ChartBarIcon className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Search Politicians</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Find and analyze political figures</p>
                  </div>
                </Link>
                <Link
                  to="/party"
                  className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                >
                  <ChartBarIcon className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Party Analytics</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">View party performance data</p>
                  </div>
                </Link>
                <Link
                  to="/trending"
                  className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                >
                  <EyeIcon className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Trending Topics</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Explore what's trending now</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {mockUserData.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-gray-100">{activity.description}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {formatDateTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="space-y-6">
            {/* Notification Preferences */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                {Object.entries(mockUserData.preferences.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {key === 'email' && 'Receive notifications via email'}
                        {key === 'push' && 'Browser push notifications'}
                        {key === 'sms' && 'SMS notifications for urgent updates'}
                        {key === 'weeklyReport' && 'Weekly summary reports'}
                        {key === 'trendingAlerts' && 'Alerts for trending topics'}
                        {key === 'mentionAlerts' && 'Notifications when politicians are mentioned'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        className="sr-only peer"
                        readOnly
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Dashboard Preferences */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Dashboard Preferences</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default Time Range
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
                    <option value="7d">Last 7 days</option>
                    <option value="30d" selected>Last 30 days</option>
                    <option value="3m">Last 3 months</option>
                    <option value="1y">Last year</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Auto Refresh</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Automatically refresh dashboard data</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mockUserData.preferences.dashboard.autoRefresh}
                      className="sr-only peer"
                      readOnly
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Account Security */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Account Security</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <ShieldCheckIcon className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Account Verified</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Your account is secure and verified</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Password</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Last changed 3 months ago</p>
                    </div>
                    <button className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium">
                      Change Password
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      Enable 2FA
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Login Sessions</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Manage your active sessions</p>
                    </div>
                    <button className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium">
                      View Sessions
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Data & Privacy */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Data & Privacy</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Download Your Data</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Export your account data and activity</p>
                  </div>
                  <button className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium">
                    Download
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">Delete Account</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Permanently delete your account and data</p>
                  </div>
                  <button className="px-4 py-2 text-red-600 hover:text-red-700 font-medium">
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;