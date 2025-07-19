import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';

// Layout Components
import Layout from './components/layout/Layout';

// Pages
import Dashboard from './pages/dashboard/Dashboard';
import PartyAnalytics from './pages/party/PartyAnalytics';
import PoliticianDetail from './pages/politician/PoliticianDetail';
import SearchResults from './pages/search/SearchResults';



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
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Layout>
            <Routes>
              {/* Dashboard - Home page */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Politician routes */}
              <Route path="/politician/:id" element={<PoliticianDetail />} />
              
              {/* Party analytics */}
              <Route path="/party" element={<PartyAnalytics />} />
              <Route path="/party/:partyId" element={<PartyAnalytics />} />
              
              {/* Search results */}
              <Route path="/search" element={<SearchResults />} />
              
              {/* Catch all route - redirect to dashboard */}
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </Layout>
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
