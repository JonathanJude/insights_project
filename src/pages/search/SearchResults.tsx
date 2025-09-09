import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import FilterBar from '../../components/filters/FilterBar';
import FilterSummary from '../../components/filters/FilterSummary';
import UnifiedSearchResults from '../../components/search/UnifiedSearchResults';
import PoliticianCard from '../../components/ui/PoliticianCard';
import { usePageTitle } from '../../hooks/usePageTitle';
import { usePoliticians } from '../../hooks/usePoliticians';
import { useUnifiedSearch } from '../../hooks/useUnifiedSearch';
import { useFilterStore } from '../../stores/filterStore';
import { useUIStore } from '../../stores/uiStore';
import type { Politician } from '../../types';

const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const {
    searchQuery,
    sortBy,
    sortOrder,
    setSearchQuery,
    setSortBy,
    setSortOrder,
    hasActiveFilters,
    getActiveFilterCount,
    clearAllFilters
  } = useFilterStore();

  const { addToSearchHistory } = useUIStore();

  // Sync URL params with store and reset page on query change
  useEffect(() => {
    const query = searchParams.get('q');
    const filter = searchParams.get('filter');
    const sort = searchParams.get('sort');
    const previousQuery = searchQuery;
    
    // Handle search query
    if (query !== searchQuery) {
      setSearchQuery(query || '');
      if (query) {
        addToSearchHistory(query);
      }
      
      // Reset to first page when search query changes (but not on initial load)
      if (previousQuery !== '' || query !== null) {
        setCurrentPage(1);
      }
    }

    // Handle positive politicians filter
    if (filter === 'positive') {
      setSortBy('sentiment');
      setSortOrder('desc');
      setCurrentPage(1);
    }

    // Handle sort parameter
    if (sort === 'sentiment') {
      setSortBy('sentiment');
      setSortOrder('desc');
    }
  }, [searchParams, searchQuery, setSearchQuery, addToSearchHistory, setSortBy, setSortOrder]);

  // Update URL when search query changes (but avoid infinite loops)
  useEffect(() => {
    const currentQuery = searchParams.get('q');
    if (searchQuery && searchQuery !== currentQuery) {
      setSearchParams({ q: searchQuery });
    } else if (!searchQuery && currentQuery) {
      setSearchParams({});
    }
  }, [searchQuery, setSearchParams, searchParams]);

  // Use unified search when there's a search query, otherwise use politician search
  const { data: unifiedResults, isLoading: unifiedLoading } = useUnifiedSearch(
    searchQuery,
    { maxResults: 50 },
    !!searchQuery && searchQuery.length >= 2
  );
  
  const { data: paginatedData, isLoading: politiciansLoading, error } = usePoliticians(currentPage, pageSize);
  
  const politicians = paginatedData?.data || [];
  const totalCount = paginatedData?.pagination?.totalItems || 0;
  const totalPages = paginatedData?.pagination?.totalPages || 1;
  
  // Determine which loading state and data to use
  const isLoading = searchQuery ? unifiedLoading : politiciansLoading;
  const hasSearchQuery = searchQuery && searchQuery.length >= 2;

  // Reset page when search query changes from filter store
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Set page title based on current view
  usePageTitle(searchParams.get('filter') === 'positive' ? 'Most Positive Politicians' :
    hasSearchQuery ? `Search Results for "${searchQuery}"` : 'All Politicians');



  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const Pagination: React.FC = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div className="flex items-center justify-center space-x-2 mt-8">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        
        {getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="px-3 py-2 text-sm text-gray-500">...</span>
            ) : (
              <button
                onClick={() => handlePageChange(page as number)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {searchParams.get('filter') === 'positive' ? 'Most Positive Politicians' :
             hasSearchQuery ? `Search Results for "${searchQuery}"` : 'All Politicians'}
          </h1>
          <p className="text-gray-600">
            {isLoading ? 'Searching...' : hasSearchQuery ? 
              `${unifiedResults?.length || 0} result${(unifiedResults?.length || 0) !== 1 ? 's' : ''} found across all categories` :
              `${totalCount} politician${totalCount !== 1 ? 's' : ''} found`
            }
            {!hasSearchQuery && hasActiveFilters() && (
              <span className="ml-2">
                • {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} applied
              </span>
            )}
          </p>
          {hasSearchQuery && unifiedResults && unifiedResults.length > 0 && (
            <div className="mt-2 text-sm text-gray-500">
              Search includes politicians, parties, topics, states, positions, and platforms
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Enhanced Filter Bar */}
      <div className="mb-6">
        <FilterBar 
          showFilterButton={true}
          showSortOptions={true}
          className="mb-4"
        />
        
        {/* Filter Summary */}
        {hasActiveFilters() && (
          <FilterSummary className="mb-4" />
        )}
      </div>

      {/* Results Count */}
      {!hasSearchQuery && (
        <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
          </div>
          
          {hasActiveFilters() && (
            <div className="text-sm text-blue-600">
              {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} applied
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {error ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Search Error</h3>
          <p className="text-gray-500 mb-4">There was an error performing your search. Please try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : hasSearchQuery ? (
        // Show unified search results when there's a search query
        <UnifiedSearchResults
          results={unifiedResults || []}
          isLoading={isLoading}
          query={searchQuery}
          onResultClick={(result) => {
            // Handle result click if needed
            console.log('Search result clicked:', result);
          }}
        />
      ) : isLoading ? (
        // Show loading state for politician grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(pageSize)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      ) : politicians.length === 0 ? (
        // Show no results for politician search
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
          <p className="text-gray-500 mb-4">
            No politicians found with the current filters.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
            {hasActiveFilters() && (
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            )}
            <button
              onClick={() => {
                setSearchQuery('');
                navigate('/');
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      ) : (
        // Show politician grid results
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {politicians.map((politician: Politician) => (
              <PoliticianCard key={politician.id} politician={politician} />
            ))}
          </div>
          
          <Pagination />
        </>
      )}
    </div>
  );
};

export default SearchResults;