import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { politicianService } from '../services/politician-service';

export interface AnalysisFilters {
  party: string;
  position: string;
  state: string;
  politician: string;
}

export interface FilteredPolitician {
  id: string;
  name: string;
  party: string;
  position: string;
  state: string;
}

export const useAnalysisFilters = () => {
  const [searchParams] = useSearchParams();
  
  // Initialize filters from URL parameters with safe defaults
  const [filters, setFilters] = useState<AnalysisFilters>(() => {
    try {
      return {
        party: searchParams.get('party') || 'all',
        position: searchParams.get('position') || 'all',
        state: searchParams.get('state') || 'all',
        politician: searchParams.get('politician') || 'all'
      };
    } catch (error) {
      return {
        party: 'all',
        position: 'all',
        state: 'all',
        politician: 'all'
      };
    }
  });

  // Update filters when URL parameters change
  useEffect(() => {
    try {
      setFilters({
        party: searchParams.get('party') || 'all',
        position: searchParams.get('position') || 'all',
        state: searchParams.get('state') || 'all',
        politician: searchParams.get('politician') || 'all'
      });
    } catch (error) {
      console.warn('Error updating filters from URL params:', error);
    }
  }, [searchParams]);

  // Load politicians from service
  const [availablePoliticians, setAvailablePoliticians] = useState<FilteredPolitician[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPoliticians = async () => {
      try {
        const politicians = await politicianService.getAllPoliticians();
        const filteredPoliticians: FilteredPolitician[] = politicians.map(politician => ({
          id: politician.id,
          name: politician.name,
          party: politician.party,
          position: politician.position,
          state: politician.state
        }));
        setAvailablePoliticians(filteredPoliticians);
      } catch (error) {
        console.error('Error loading politicians:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPoliticians();
  }, []);

  // Get filtered politicians based on current filters
  const filteredPoliticians = useMemo(() => {
    return availablePoliticians.filter(politician => {
      if (filters.party !== 'all' && politician.party !== filters.party) return false;
      if (filters.position !== 'all' && politician.position !== filters.position) return false;
      if (filters.state !== 'all' && politician.state !== filters.state) return false;
      return true;
    });
  }, [availablePoliticians, filters]);

  // Get the specific politician if one is selected
  const selectedPoliticianData = useMemo(() => {
    if (filters.politician === 'all') return null;
    return availablePoliticians.find(p => p.id === filters.politician) || null;
  }, [availablePoliticians, filters.politician]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return filters.party !== 'all' || 
           filters.position !== 'all' || 
           filters.state !== 'all' || 
           filters.politician !== 'all';
  }, [filters]);

  // Update individual filter
  const updateFilter = (key: keyof AnalysisFilters, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      
      // If changing party, position, or state, reset politician selection
      if (key !== 'politician') {
        newFilters.politician = 'all';
      }
      
      return newFilters;
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      party: 'all',
      position: 'all',
      state: 'all',
      politician: 'all'
    });
  };

  // Get filter summary for display
  const getFilterSummary = () => {
    const summary: string[] = [];
    
    if (filters.party !== 'all') {
      summary.push(`Party: ${filters.party}`);
    }
    if (filters.position !== 'all') {
      summary.push(`Position: ${filters.position}`);
    }
    if (filters.state !== 'all') {
      summary.push(`State: ${filters.state}`);
    }
    if (filters.politician !== 'all') {
      const politician = availablePoliticians.find(p => p.id === filters.politician);
      if (politician) {
        summary.push(`Politician: ${politician.name}`);
      }
    }
    
    return summary;
  };

  // Generate contextual data based on filters
  const getContextualData = () => {
    // This would normally fetch data from an API based on filters
    // For now, we'll return mock data that simulates filtering
    const baseMultiplier = hasActiveFilters ? 0.7 : 1.0; // Simulate filtered data having less volume
    
    return {
      totalDataPoints: Math.floor(150000 * baseMultiplier),
      sentimentScore: 0.65 + (Math.random() - 0.5) * 0.3, // Vary based on filters
      coveragePercentage: hasActiveFilters ? 75 + Math.random() * 15 : 85 + Math.random() * 10,
      filteredCount: filteredPoliticians.length,
      isFiltered: hasActiveFilters
    };
  };

  return {
    filters,
    availablePoliticians,
    filteredPoliticians,
    selectedPoliticianData,
    hasActiveFilters,
    loading,
    updateFilter,
    clearAllFilters,
    getFilterSummary,
    getContextualData
  };
};