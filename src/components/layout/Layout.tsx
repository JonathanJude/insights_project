import React, { useState, useEffect } from 'react';
import { useUIStore } from '../../stores/uiStore';
import Header from './Header';
import Sidebar from './Sidebar';

// Inline useMediaQuery hook to avoid module resolution issues
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const isMobile = useMediaQuery('(max-width: 1024px)');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" 
          onClick={toggleSidebar}
        />
      )}
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className={`transition-all duration-300 ${
        !isMobile && sidebarOpen ? 'lg:ml-64' : ''
      }`}>
        {/* Header */}
        <Header />
        
        {/* Page content */}
        <main className="p-6 min-h-screen">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;