import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

// Layout Components
import Layout from './components/layout/Layout';

// Route Configuration

// Error Handling

// Loading Components
import GlobalLoadingIndicator from './components/ui/GlobalLoadingIndicator';
import { LoadingProvider } from './providers/LoadingProvider';

// Store
import RouteSuspense from './components/layout/RouteSuspense';
import DashboardErrorBoundary from './components/ui/DashboardErrorBoundary';
import { routes } from './config/routes';
import { createEnhancedQueryClient } from './lib/queryErrorHandler';
import { useUIStore } from './stores/uiStore';

// Enhanced Query Client with error handling



// Create enhanced query client with error handling
const queryClient = createEnhancedQueryClient();

function App() {
  const { theme, addNotification, notifications } = useUIStore();
  // const { isLoadingSharedState } = useShareableLink();

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

  // Show loading indicator while shared state is being loaded
  // if (isLoadingSharedState) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
  //         <p className="text-gray-600 dark:text-gray-400">Loading shared view...</p>
  //       </div>
  //     </div>
  //   );
  // }

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
              <RouteSuspense>
                <Routes>
                  {routes.map((route) => {
                    const Component = route.component;
                    return (
                      <Route
                        key={route.path}
                        path={route.path}
                        element={<Component />}
                      />
                    );
                  })}
                </Routes>
              </RouteSuspense>
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
