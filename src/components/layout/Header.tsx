import {
    Bars3Icon,
    BellIcon,
    Cog6ToothIcon,
    MagnifyingGlassIcon,
    MoonIcon,
    SunIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useFilterStore } from '../../stores/filterStore';
import { useUIStore } from '../../stores/uiStore';
import NotificationsPanel from '../ui/NotificationsPanel';
import SettingsModal from '../ui/SettingsModal';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const { 
    toggleSidebar, 
    theme, 
    toggleTheme, 
    notifications,
    isMobile,
    modals,
    openModal,
    closeModal
  } = useUIStore();
  
  const { searchQuery: globalSearchQuery, setSearchQuery: setGlobalSearchQuery } = useFilterStore();

  // Sync local search query with global search query when on search page
  React.useEffect(() => {
    if (location.pathname === '/search') {
      setLocalSearchQuery(globalSearchQuery || '');
    }
  }, [globalSearchQuery, location.pathname]);

  // Clear local search when navigating away from search page
  React.useEffect(() => {
    if (location.pathname !== '/search') {
      setLocalSearchQuery('');
    }
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearchQuery.trim()) {
      setGlobalSearchQuery(localSearchQuery.trim());
      navigate(`/search?q=${encodeURIComponent(localSearchQuery.trim())}`);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchQuery(e.target.value);
  };

  const unreadNotifications = notifications.length;

  return (
    <>
    <header className="bg-card shadow-sm border-b border-default sticky top-0 z-30">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md text-secondary hover:text-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden transition-colors duration-200 hover:scale-105 active:scale-95"
            aria-label="Toggle sidebar"
          >
            <Bars3Icon className="h-6 w-6 transition-transform duration-200" />
          </button>

          {/* Logo and title */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center hover:scale-105 transition-transform duration-200">
              <span className="text-white font-bold text-sm">II</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-primary">Insight Intelligence</h1>
              <p className="text-xs text-secondary">Political Sentiment Dashboard</p>
            </div>
          </Link>
        </div>

        {/* Center section - Search */}
        <div className="flex-1 max-w-2xl mx-4">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
              <input
                type="text"
                value={localSearchQuery}
                onChange={handleSearchInputChange}
                placeholder="Search politicians, parties, or topics..."
                className="w-full pl-10 pr-4 py-2 border border-default rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-secondary text-primary text-sm"
              />
            </div>
          </form>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-secondary hover:text-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 hover:scale-105 active:scale-95"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5 transition-transform duration-200" />
            ) : (
              <MoonIcon className="h-5 w-5 transition-transform duration-200" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => openModal('notificationsPanel')}
              className="p-2 rounded-md text-secondary hover:text-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 relative transition-colors duration-200 hover:scale-105 active:scale-95"
              aria-label="Notifications"
            >
              <BellIcon className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotifications > 9 ? '9+' : unreadNotifications}
                </span>
              )}
            </button>
          </div>

          {/* Settings */}
          <button
            onClick={() => openModal('settingsModal')}
            className="p-2 rounded-md text-secondary hover:text-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 hover:scale-105 active:scale-95"
            aria-label="Settings"
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="p-2 rounded-md text-secondary hover:text-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 hover:scale-105 active:scale-95"
              aria-label="User menu"
            >
              <UserCircleIcon className="h-6 w-6 transition-transform duration-200" />
            </button>

            {/* User dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg py-1 z-50 border border-default animate-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 text-sm text-primary border-b border-default">
                  <p className="font-medium">Demo User</p>
                  <p className="text-secondary">demo@example.com</p>
                </div>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-primary hover:bg-secondary transition-colors duration-150"
                  onClick={() => setShowUserMenu(false)}
                >
                  Profile
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-primary hover:bg-secondary transition-colors duration-150"
                  onClick={() => {
                    setShowUserMenu(false);
                    openModal('settingsModal');
                  }}
                >
                  Settings
                </a>
                <a
                  href="#"
                  className="block px-4 py-2 text-sm text-primary hover:bg-secondary transition-colors duration-150"
                  onClick={() => setShowUserMenu(false)}
                >
                  Help
                </a>
                <div className="border-t border-default">
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-primary hover:bg-secondary transition-colors duration-150"
                    onClick={() => setShowUserMenu(false)}
                  >
                    Sign out
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search bar */}
      {isMobile && location.pathname === '/search' && (
        <div className="px-4 pb-4">
          <form onSubmit={handleSearch} className="relative">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
              <input
                type="text"
                value={localSearchQuery}
                onChange={handleSearchInputChange}
                placeholder="Search politicians, parties, or topics..."
                className="w-full pl-10 pr-4 py-2 border border-default rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-secondary text-primary text-sm"
              />
            </div>
          </form>
        </div>
      )}
    </header>

    {/* Settings Modal */}
    <SettingsModal
      isOpen={modals.settingsModal}
      onClose={() => closeModal('settingsModal')}
    />

    {/* Notifications Panel */}
    <NotificationsPanel
      isOpen={modals.notificationsPanel}
      onClose={() => closeModal('notificationsPanel')}
    />
    </>
  );
};

export default Header;