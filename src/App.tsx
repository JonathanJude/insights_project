import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

// Layout Components
import Layout from './components/layout/Layout';

// Pages
import Dashboard from './pages/dashboard/Dashboard';
import PartyAnalytics from './pages/party/PartyAnalytics';
import PoliticianDetail from './pages/politician/PoliticianDetail';
import Profile from './pages/profile/Profile';
import SearchResults from './pages/search/SearchResults';
import TrendingTopics from './pages/trending/TrendingTopics';

// Error Handling

// Loading Components
import GlobalLoadingIndicator from './components/ui/GlobalLoadingIndicator';
import { LoadingProvider } from './providers/LoadingProvider';

// Store
import DashboardErrorBoundary from './components/ui/DashboardErrorBoundary';
import { createEnhancedQueryClient } from './lib/queryErrorHandler';
import { useUIStore } from './stores/uiStore';

// Enhanced Query Client with error handling



// Create enhanced query client with error handling
const queryClient = createEnhancedQueryClient();

function App() {
  const { theme, addNotification, notifications } = useUIStore();

  // Initialize theme on app load
  useEffect(() => {
    // Apply the current theme to the document
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Add demo notifications on app initialization
  useEffect(() => {
    // Check if we already have persistent notifications to avoid duplicates
    const hasPersistentNotifications = notifications.some(n => n.isPersistent);

    if (!hasPersistentNotifications) {
      addNotification({
        type: 'info',
        title: 'Welcome to Insight Intelligence',
        message: 'Your political sentiment dashboard is ready to use.',
        duration: 0, // Persistent notification
        isPersistent: true // Mark as persistent demo notification
      });

      addNotification({
        type: 'success',
        title: 'Data Updated',
        message: 'Latest sentiment data has been synchronized.',
        duration: 0,
        isPersistent: true // Mark as persistent demo notification
      });
    }
  }, []); // Only run once on app mount

  return (
    <DashboardErrorBoundary
      onError={(error, errorInfo) => {
        // Log error to console in development
        if (import.meta.env.DEV) {
          console.error('App Error Boundary:', error, errorInfo);
        }
        
        // In production, you would send this to an error reporting service
        // Example: Sentry.captureException(error, { extra: errorInfo });
      }}
    >
      <QueryClientProvider client={queryClient}>
        <LoadingProvider minLoadingTime={300} debounceTime={100}>
          <Router>
            <GlobalLoadingIndicator position="top" height={3} />
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/politician/:id" element={<PoliticianDetail />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/trending" element={<TrendingTopics />} />
                <Route path="/party" element={<PartyAnalytics />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </Layout>
          </Router>

          {/* React Query Devtools - only in development */}
          {import.meta.env.DEV && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </LoadingProvider>
      </QueryClientProvider>
    </DashboardErrorBoundary>
  );
}

export default App;
