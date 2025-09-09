import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

// Layout Components
import Layout from './components/layout/Layout';

// Pages
import Dashboard from './pages/dashboard/Dashboard';
import PartyAnalytics from './pages/party/PartyAnalytics';
import PoliticianDetail from './pages/politician/PoliticianDetail';
import SearchResults from './pages/search/SearchResults';
import TrendingTopics from './pages/trending/TrendingTopics';

// Loading Components

// Store
import GlobalLoadingIndicator from './components/ui/GlobalLoadingIndicator';
import { LoadingProvider } from './providers/LoadingProvider';
import { useUIStore } from './stores/uiStore';



// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

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
            </Routes>
          </Layout>
        </Router>

        {/* React Query Devtools - only in development */}
        {import.meta.env.DEV && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </LoadingProvider>
    </QueryClientProvider>
  );
}

export default App;
