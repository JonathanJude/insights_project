import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import EnhancedFiltersPanel from '../../components/filters/EnhancedFiltersPanel';
import FilterBar from '../../components/filters/FilterBar';
import FilterSummary from '../../components/filters/FilterSummary';
import UnifiedSearchResults from '../../components/search/UnifiedSearchResults';
import PoliticianCard from '../../components/ui/PoliticianCard';
import { useAdvancedSearch } from '../../hooks/useAdvancedSearch';
import { useEnhancedPoliticians } from '../../hooks/useEnhancedPoliticians';
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
  const [showEnhancedFilters, setShowEnhancedFilters] = useState(false);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
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

  // Get enhanced data for current politicians when enhanced view is enabled
  const politicianIds = politicians.map(p => p.id);
  const { data: enhancedPoliticians, isLoading: enhancedLoading } = useEnhancedPoliticians(
    showEnhancedFilters ? politicianIds : []
  );

  // Advanced search with multi-dimensional filtering
  const { data: advancedSearchResults, isLoading: advancedSearchLoading } = useAdvancedSearch(
    {
      query: searchQuery,
      parties: [],
      states: [],
      platforms: [],
      geographic: { countries: [], states: [], lgas: [], confidenceThreshold },
      demographic: { education: [], occupation: [], ageRanges: [18, 65], gender: [], confidenceThreshold },
      sentiment: { polarity: [], emotions: [], intensityRange: [0, 1], complexity: [], modelAgreement: 0.5 },
      topics: { policyAreas: [], campaignIssues: [], events: [], trendingThreshold: 0.5 },
      engagement: { levels: [], viralityThreshold: 0.5, qualityScore: 0.5, influencerAmplification: false },
      temporal: { timeBlocks: [], daysOfWeek: [], electionPhases: [] }
    },
    {
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
      sortBy: 'relevance',
      sortOrder: 'desc',
      includeConfidenceScores: true,
      includeDataQuality: true
    },
    showAdvancedSearch && !!searchQuery && searchQuery.length >= 2
  );

  // Determine which loading state and data to use
  const isLoading = showAdvancedSearch && searchQuery ? advancedSearchLoading :
    searchQuery ? unifiedLoading : politiciansLoading;
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
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === page
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
            {isLoading ? 'Searching...' :
              showAdvancedSearch && advancedSearchResults ?
                `${advancedSearchResults.total} result${advancedSearchResults.total !== 1 ? 's' : ''} found with advanced search` :
                hasSearchQuery ?
                  `${unifiedResults?.length || 0} result${(unifiedResults?.length || 0) !== 1 ? 's' : ''} found across all categories` :
                  `${totalCount} politician${totalCount !== 1 ? 's' : ''} found`
            }
            {!hasSearchQuery && hasActiveFilters() && (
              <span className="ml-2">
                • {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} applied
              </span>
            )}
            {showAdvancedSearch && advancedSearchResults?.searchMetadata && (
              <span className="ml-2 text-blue-600">
                • {advancedSearchResults.searchMetadata.totalDimensions} dimensions analyzed
              </span>
            )}
          </p>
          {hasSearchQuery && unifiedResults && unifiedResults.length > 0 && !showAdvancedSearch && (
            <div className="mt-2 text-sm text-gray-500">
              Search includes politicians, parties, topics, states, positions, and platforms
            </div>
          )}
          {showAdvancedSearch && hasSearchQuery && (
            <div className="mt-2 text-sm text-blue-600">
              Advanced multi-dimensional search with confidence scoring and data quality analysis
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4 mt-4 lg:mt-0">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${showAdvancedSearch
                ? 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {showAdvancedSearch ? 'Advanced Search' : 'Enable Advanced'}
              {showAdvancedSearch && <span className="ml-1">🔍</span>}
            </button>

            <button
              onClick={() => setShowEnhancedFilters(!showEnhancedFilters)}
              className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium transition-colors ${showEnhancedFilters
                ? 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                }`}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {showEnhancedFilters ? 'Enhanced View' : 'Enable Enhanced'}
              {showEnhancedFilters && <span className="ml-1">✨</span>}
            </button>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Advanced Search Bar */}
      {showAdvancedSearch && (
        <div className="mb-6">
          <AdvancedSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={(query) => {
              setSearchQuery(query);
              setCurrentPage(1);
            }}
            showSuggestions={true}
            showConfidenceFilter={true}
            confidenceThreshold={confidenceThreshold}
            onConfidenceChange={setConfidenceThreshold}
            placeholder="Advanced search with multi-dimensional filtering..."
            className="mb-4"
          />

          {/* Search Analytics */}
          {advancedSearchResults && advancedSearchResults.results.length > 0 && (
            <SearchAnalytics
              searchResults={advancedSearchResults.results}
              searchMetadata={advancedSearchResults.searchMetadata}
              className="mb-4"
            />
          )}
        </div>
      )}

      {/* Enhanced Filter Bar */}
      <div className="mb-6">
        {showEnhancedFilters ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <EnhancedFiltersPanel
                variant="sidebar"
                showEnhancedFilters={true}
                className="h-fit"
              />
            </div>
            <div className="lg:col-span-3">
              <FilterBar
                showFilterButton={false}
                showSortOptions={true}
                className="mb-4"
              />
              {hasActiveFilters() && (
                <FilterSummary className="mb-4" />
              )}
            </div>
          </div>
        ) : (
          <>
            <FilterBar
              showFilterButton={true}
              showSortOptions={true}
              className="mb-4"
            />
            {hasActiveFilters() && (
              <FilterSummary className="mb-4" />
            )}
          </>
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
      ) : showAdvancedSearch && advancedSearchResults ? (
        // Show advanced search results
        <div className={`grid gap-6 ${showEnhancedFilters
          ? 'grid-cols-1 lg:grid-cols-2'
          : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          }`}>
          {advancedSearchResults.results.map((result, index) => {
            const enhancedData = result.politician;
            return (
              <div key={result.politician.id} className="relative">
                <PoliticianCard
                  politician={result.politician}
                  enhancedData={enhancedData}
                  showEnhanced={true}
                />

                {/* Relevance and confidence indicators */}
                <div className="absolute top-2 right-2 flex space-x-1">
                  <div
                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                    title={`Relevance: ${(result.relevanceScore * 100).toFixed(0)}%`}
                  >
                    {(result.relevanceScore * 100).toFixed(0)}%
                  </div>
                  {result.politician.dataQuality && (
                    <div
                      className={`px-2 py-1 text-xs font-medium rounded-full ${result.politician.dataQuality.confidence > 0.8
                        ? 'bg-green-100 text-green-800'
                        : result.politician.dataQuality.confidence > 0.5
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                        }`}
                      title={`Data Quality: ${(result.politician.dataQuality.confidence * 100).toFixed(0)}%`}
                    >
                      Q{(result.politician.dataQuality.confidence * 100).toFixed(0)}
                    </div>
                  )}
                </div>

                {/* Matched dimensions */}
                {result.matchedDimensions && result.matchedDimensions.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {result.matchedDimensions.slice(0, 3).map((dimension, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800"
                      >
                        {dimension}
                      </span>
                    ))}
                    {result.matchedDimensions.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{result.matchedDimensions.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
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
          <div className={`grid gap-6 ${showEnhancedFilters
            ? 'grid-cols-1 lg:grid-cols-2'
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
            {politicians.map((politician: Politician, index: number) => {
              const enhancedData = enhancedPoliticians?.[index];
              return (
                <PoliticianCard
                  key={politician.id}
                  politician={politician}
                  enhancedData={enhancedData}
                  showEnhanced={showEnhancedFilters}
                />
              );
            })}
          </div>

          {(enhancedLoading && showEnhancedFilters) && (
            <div className="text-center py-4">
              <div className="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-700 rounded-lg">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-purple-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading enhanced data...
              </div>
            </div>
          )}

          <Pagination />
        </>
      )}
    </div>
  );
};

export default SearchResults;