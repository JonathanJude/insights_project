import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

// Layout Components
// import Layout from './components/layout/Layout';

// Pages
// import Dashboard from './pages/dashboard/Dashboard';
// import PoliticianDetail from './pages/politician/PoliticianDetail';
// import SearchResults from './pages/search/SearchResults';
// import TrendingTopics from './pages/trending/TrendingTopics';

// Store
import { useUIStore } from './stores/uiStore';

// Pages
import PartyAnalytics from './pages/party/PartyAnalytics';



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
  // useEffect(() => {
  //   // Apply the current theme to the document
  //   document.documentElement.setAttribute('data-theme', theme);
  // }, [theme]);

  // Add demo notifications on app initialization
  // useEffect(() => {
  //   if (notifications.length === 0) {
  //     addNotification({
  //       type: 'info',
  //       title: 'Welcome to Insight Intelligence',
  //       message: 'Your political sentiment dashboard is ready to use.',
  //       duration: 0 // Persistent notification
  //     });
      
  //     addNotification({
  //       type: 'success',
  //       title: 'Data Updated',
  //       message: 'Latest sentiment data has been synchronized.',
  //       duration: 0
  //     });
  //   }
  // }, []); // Only run once on app mount

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-white">
          <Routes>
            <Route path="/party" element={<PartyAnalytics />} />
            <Route path="*" element={
              <div className="p-8">
                <h1 className="text-2xl font-bold">Test App Loading</h1>
                <p>If you can see this, React is working!</p>
                <p><a href="/party" className="text-blue-600 underline">Go to Party Analytics</a></p>
              </div>
            } />
          </Routes>
        </div>
      </Router>
      
      {/* React Query Devtools - only in development */}
      {import.meta.env.DEV && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

export default App;
