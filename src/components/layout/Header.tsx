import {
    Bars3Icon,
    BellIcon,
    Cog6ToothIcon,
    MagnifyingGlassIcon,
    MoonIcon,
    SunIcon,
    UserCircleIcon
} from '@heroicons/react/24/outline';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSearchSuggestions } from '../../hooks/useUnifiedSearch';
import { useFilterStore } from '../../stores/filterStore';
import { useUIStore } from '../../stores/uiStore';
import SearchSuggestions from '../search/SearchSuggestions';
import NotificationsPanel from '../ui/NotificationsPanel';
import SettingsModal from '../ui/SettingsModal';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
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
  
  // Get search suggestions
  const { data: suggestions = [], isLoading: suggestionsLoading } = useSearchSuggestions(
    localSearchQuery,
    8,
    showSuggestions && localSearchQuery.length >= 2
  );

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
    const value = e.target.value;
    setLocalSearchQuery(value);
    setShowSuggestions(value.length >= 2);
  };

  const handleSearchInputFocus = () => {
    if (localSearchQuery.length >= 2) {
      setShowSuggestions(true);
    }
  };

  const handleSearchInputBlur = () => {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleSuggestionClick = (suggestion: any) => {
    setShowSuggestions(false);
    // Navigate based on suggestion type - this will be handled by UnifiedSearchResults
  };

  const handleSuggestionSelect = (suggestion: any) => {
    const suggestionText = suggestion.type === 'politician' ? suggestion.item.name :
                          suggestion.type === 'party' ? suggestion.item.name :
                          suggestion.type === 'topic' ? suggestion.item.keyword :
                          suggestion.type === 'state' ? suggestion.item.name :
                          suggestion.type === 'position' ? suggestion.item.displayName :
                          suggestion.type === 'platform' ? suggestion.item.displayName :
                          suggestion.item.name || suggestion.item.keyword || '';
    
    setLocalSearchQuery(suggestionText);
    setShowSuggestions(false);
    
    // Trigger search
    if (suggestionText.trim()) {
      setGlobalSearchQuery(suggestionText.trim());
      navigate(`/search?q=${encodeURIComponent(suggestionText.trim())}`);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
            <div className="relative" ref={searchInputRef}>
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary" />
              <input
                type="text"
                value={localSearchQuery}
                onChange={handleSearchInputChange}
                onFocus={handleSearchInputFocus}
                onBlur={handleSearchInputBlur}
                placeholder="Search politicians, parties, topics, states, positions..."
                className="w-full pl-10 pr-4 py-2 border border-default rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-secondary text-primary text-sm"
                autoComplete="off"
              />
              
              {/* Search Suggestions */}
              {showSuggestions && (
                <SearchSuggestions
                  suggestions={suggestions}
                  isLoading={suggestionsLoading}
                  onSuggestionClick={handleSuggestionClick}
                  onSuggestionSelect={handleSuggestionSelect}
                  query={localSearchQuery}
                />
              )}
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
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-sm text-primary hover:bg-secondary transition-colors duration-150"
                  onClick={() => setShowUserMenu(false)}
                >
                  Profile
                </Link>
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
                onFocus={handleSearchInputFocus}
                onBlur={handleSearchInputBlur}
                placeholder="Search politicians, parties, topics, states, positions..."
                className="w-full pl-10 pr-4 py-2 border border-default rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-secondary text-primary text-sm"
                autoComplete="off"
              />
              
              {/* Mobile Search Suggestions */}
              {showSuggestions && (
                <SearchSuggestions
                  suggestions={suggestions}
                  isLoading={suggestionsLoading}
                  onSuggestionClick={handleSuggestionClick}
                  onSuggestionSelect={handleSuggestionSelect}
                  query={localSearchQuery}
                />
              )}
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