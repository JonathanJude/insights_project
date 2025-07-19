import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  StarIcon,
  ClockIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  ChartBarIcon as ChartBarIconSolid,
  MagnifyingGlassIcon as MagnifyingGlassIconSolid
} from '@heroicons/react/24/solid';
import { useUIStore } from '../../stores/uiStore';
import { useFilterStore } from '../../stores/filterStore';
import { POLITICAL_PARTIES } from '../../constants';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isMobile, toggleSidebar, recentPoliticians } = useUIStore();
  const { selectedParties, toggleParty, clearAllFilters, hasActiveFilters } = useFilterStore();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: HomeIcon,
      iconSolid: HomeIconSolid,
      current: location.pathname === '/' || location.pathname === '/dashboard'
    },
    {
      name: 'Politicians',
      href: '/search',
      icon: UserGroupIcon,
      iconSolid: UserGroupIconSolid,
      current: location.pathname.startsWith('/politician') || location.pathname === '/search'
    },
    {
      name: 'Party Analytics',
      href: '/party',
      icon: ChartBarIcon,
      iconSolid: ChartBarIconSolid,
      current: location.pathname.startsWith('/party')
    },
    {
      name: 'Search',
      href: '/search',
      icon: MagnifyingGlassIcon,
      iconSolid: MagnifyingGlassIconSolid,
      current: location.pathname === '/search'
    }
  ];

  const handleLinkClick = () => {
    if (isMobile) {
      toggleSidebar();
    }
  };

  const handlePartyFilter = (partyValue: string) => {
    toggleParty(partyValue as any);
  };

  const { sidebarOpen } = useUIStore();

  return (
    <aside
      className={`
        fixed top-0 left-0 z-50 h-screen w-64 bg-white shadow-lg
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}
    >
      <div className="flex flex-col h-full">
      {/* Sidebar header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">II</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Insights</h2>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.current ? item.iconSolid : item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={handleLinkClick}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                  ${
                    item.current
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <Icon
                  className={`
                    mr-3 h-5 w-5 flex-shrink-0
                    ${
                      item.current
                        ? 'text-blue-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                    }
                  `}
                />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Quick Filters Section */}
        <div className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Quick Filters
            </h3>
            {hasActiveFilters() && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear
              </button>
            )}
          </div>

          {/* Party Filters */}
          <div className="space-y-1">
            <div className="flex items-center text-xs font-medium text-gray-500 mb-2">
              <TagIcon className="h-4 w-4 mr-1" />
              Political Parties
            </div>
            {POLITICAL_PARTIES.slice(0, 6).map((party) => (
              <label key={party.value} className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedParties.includes(party.value)}
                  onChange={() => handlePartyFilter(party.value)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: party.color }}
                  />
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 truncate">
                    {party.label}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Recently Viewed */}
        {recentPoliticians.length > 0 && (
          <div className="pt-6">
            <div className="flex items-center mb-3">
              <ClockIcon className="h-4 w-4 mr-1 text-gray-500" />
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Recently Viewed
              </h3>
            </div>
            <div className="space-y-1">
              {recentPoliticians.slice(0, 5).map((politicianId: string) => (
                <Link
                  key={politicianId}
                  to={`/politician/${politicianId}`}
                  onClick={handleLinkClick}
                  className="flex items-center space-x-2 px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded group"
                >
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs text-gray-500">{politicianId.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <span className="truncate">Politician {politicianId}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Sidebar footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <StarIcon className="h-4 w-4 text-gray-500" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              Demo Mode
            </p>
            <p className="text-xs text-gray-500 truncate">
              Using mock data
            </p>
          </div>
        </div>
      </div>
      </div>
    </aside>
  );
};

export default Sidebar;