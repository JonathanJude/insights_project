/**
 * State Data Utilities
 * 
 * This utility provides functions to access state data from the JSON file
 * instead of using hardcoded enums. This ensures data consistency and
 * provides access to rich state information beyond just names.
 */

import { dataLoader } from '../services/data-loader';

// Types for state data
export interface NigerianState {
  id: string;
  name: string;
  code: string;
  capital: string;
  region: string;
  population: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  metadata: {
    established: string;
    area_km2: number;
    timezone: string;
    slogan: string;
  };
}

export interface StateOption {
  value: string;
  label: string;
  state?: NigerianState;
}

export interface StateRegion {
  name: string;
  states: NigerianState[];
}

// Cache key for state data
const STATES_CACHE_KEY = 'nigerian-states-data';

/**
 * Load all Nigerian states from JSON data
 */
export async function getAllStates(): Promise<NigerianState[]> {
  try {
    const response = await fetch('/data/core/states.json');
    if (!response.ok) {
      throw new Error(`Failed to load states data: ${response.status}`);
    }
    const data = await response.json();
    return data.states || [];
  } catch (error) {
    console.error('Error loading states data:', error);
    return [];
  }
}

/**
 * Get state by name
 */
export async function getStateByName(name: string): Promise<NigerianState | null> {
  const states = await getAllStates();
  return states.find(state => state.name === name) || null;
}

/**
 * Get state by code
 */
export async function getStateByCode(code: string): Promise<NigerianState | null> {
  const states = await getAllStates();
  return states.find(state => state.code === code) || null;
}

/**
 * Get state by ID
 */
export async function getStateById(id: string): Promise<NigerianState | null> {
  const states = await getAllStates();
  return states.find(state => state.id === id) || null;
}

/**
 * Get state options for dropdown/select components
 */
export async function getStateOptions(): Promise<StateOption[]> {
  const states = await getAllStates();
  return states.map(state => ({
    value: state.name,
    label: `${state.name} (${state.code})`,
    state
  }));
}

/**
 * Get state names array (replacement for enum values)
 */
export async function getStateNames(): Promise<string[]> {
  const states = await getAllStates();
  return states.map(state => state.name);
}

/**
 * Get state codes array
 */
export async function getStateCodes(): Promise<string[]> {
  const states = await getAllStates();
  return states.map(state => state.code);
}

/**
 * Check if a state name is valid
 */
export async function isValidStateName(name: string): Promise<boolean> {
  const states = await getAllStates();
  return states.some(state => state.name === name);
}

/**
 * Check if a state code is valid
 */
export async function isValidStateCode(code: string): Promise<boolean> {
  const states = await getAllStates();
  return states.some(state => state.code === code);
}

/**
 * Get states by region
 */
export async function getStatesByRegion(region: string): Promise<NigerianState[]> {
  const states = await getAllStates();
  return states.filter(state => state.region === region);
}

/**
 * Get all regions with their states
 */
export async function getRegions(): Promise<StateRegion[]> {
  const states = await getAllStates();
  const regionsMap = new Map<string, NigerianState[]>();
  
  states.forEach(state => {
    if (!regionsMap.has(state.region)) {
      regionsMap.set(state.region, []);
    }
    regionsMap.get(state.region)!.push(state);
  });
  
  return Array.from(regionsMap.entries()).map(([name, states]) => ({
    name,
    states: states.sort((a, b) => a.name.localeCompare(b.name))
  }));
}

/**
 * Get state capital
 */
export async function getStateCapital(stateName: string): Promise<string | null> {
  const state = await getStateByName(stateName);
  return state ? state.capital : null;
}

/**
 * Get state coordinates
 */
export async function getStateCoordinates(stateName: string): Promise<{ latitude: number; longitude: number } | null> {
  const state = await getStateByName(stateName);
  return state ? state.coordinates : null;
}

/**
 * Get states by population range
 */
export async function getStatesByPopulation(min: number, max: number): Promise<NigerianState[]> {
  const states = await getAllStates();
  return states.filter(state => state.population >= min && state.population <= max);
}

/**
 * Get largest states by population
 */
export async function getLargestStates(limit: number = 10): Promise<NigerianState[]> {
  const states = await getAllStates();
  return states
    .sort((a, b) => b.population - a.population)
    .slice(0, limit);
}

/**
 * Get smallest states by population
 */
export async function getSmallestStates(limit: number = 10): Promise<NigerianState[]> {
  const states = await getAllStates();
  return states
    .sort((a, b) => a.population - b.population)
    .slice(0, limit);
}

/**
 * Get states by area range
 */
export async function getStatesByArea(minKm2: number, maxKm2: number): Promise<NigerianState[]> {
  const states = await getAllStates();
  return states.filter(state => 
    state.metadata.area_km2 >= minKm2 && state.metadata.area_km2 <= maxKm2
  );
}

/**
 * Search states by multiple criteria
 */
export async function searchStates(query: {
  name?: string;
  code?: string;
  region?: string;
  capital?: string;
}): Promise<NigerianState[]> {
  const states = await getAllStates();
  
  return states.filter(state => {
    if (query.name && !state.name.toLowerCase().includes(query.name.toLowerCase())) {
      return false;
    }
    if (query.code && !state.code.toLowerCase().includes(query.code.toLowerCase())) {
      return false;
    }
    if (query.region && !state.region.toLowerCase().includes(query.region.toLowerCase())) {
      return false;
    }
    if (query.capital && !state.capital.toLowerCase().includes(query.capital.toLowerCase())) {
      return false;
    }
    return true;
  });
}

/**
 * Get state statistics
 */
export async function getStateStatistics(): Promise<{
  total: number;
  totalPopulation: number;
  byRegion: Record<string, { count: number; population: number }>;
  largestState: NigerianState | null;
  smallestState: NigerianState | null;
  averagePopulation: number;
}> {
  const states = await getAllStates();
  
  const stats = {
    total: states.length,
    totalPopulation: 0,
    byRegion: {} as Record<string, { count: number; population: number }>,
    largestState: null as NigerianState | null,
    smallestState: null as NigerianState | null,
    averagePopulation: 0
  };
  
  // Calculate total population and regional stats
  states.forEach(state => {
    stats.totalPopulation += state.population;
    
    if (!stats.byRegion[state.region]) {
      stats.byRegion[state.region] = { count: 0, population: 0 };
    }
    stats.byRegion[state.region].count++;
    stats.byRegion[state.region].population += state.population;
  });
  
  // Find largest and smallest states
  stats.largestState = states.reduce((largest, state) => 
    state.population > (largest?.population || 0) ? state : largest, null
  );
  
  stats.smallestState = states.reduce((smallest, state) => 
    state.population < (smallest?.population || Infinity) ? state : smallest, null
  );
  
  // Calculate average population
  stats.averagePopulation = stats.totalPopulation / states.length;
  
  return stats;
}

/**
 * Get states within distance of a coordinate
 */
export async function getStatesWithinDistance(
  latitude: number,
  longitude: number,
  distanceKm: number
): Promise<NigerianState[]> {
  const states = await getAllStates();
  const result: NigerianState[] = [];
  
  states.forEach(state => {
    const distance = calculateDistance(
      latitude, longitude,
      state.coordinates.latitude, state.coordinates.longitude
    );
    
    if (distance <= distanceKm) {
      result.push(state);
    }
  });
  
  return result;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Legacy compatibility function to get all state values (replaces Object.values(NigerianStates))
 */
export async function getStateValues(): Promise<string[]> {
  return await getStateNames();
}

/**
 * Legacy compatibility function to check if state value is valid (replaces NigerianStates[value])
 */
export async function isValidStateValue(value: string): Promise<boolean> {
  return await isValidStateName(value);
}

// Export a default object for easy importing
const stateUtils = {
  getAllStates,
  getStateByName,
  getStateByCode,
  getStateById,
  getStateOptions,
  getStateNames,
  getStateCodes,
  isValidStateName,
  isValidStateCode,
  getStatesByRegion,
  getRegions,
  getStateCapital,
  getStateCoordinates,
  getStatesByPopulation,
  getLargestStates,
  getSmallestStates,
  getStatesByArea,
  searchStates,
  getStateStatistics,
  getStatesWithinDistance,
  getStateValues,
  isValidStateValue
};

export default stateUtils;