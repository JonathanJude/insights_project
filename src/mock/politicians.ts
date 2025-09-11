import type { Politician } from '../types';
import { politicianService } from '../services/politician-service';

// Cache for politician data to avoid repeated async calls
let cachedPoliticians: Politician[] | null = null;

/**
 * Get mock politicians from the politician service
 * This function maintains backward compatibility while using the new JSON-based data
 */
export const getMockPoliticians = async (): Promise<Politician[]> => {
  if (cachedPoliticians) {
    return cachedPoliticians;
  }
  
  try {
    cachedPoliticians = await politicianService.convertToLegacyFormat();
    return cachedPoliticians;
  } catch (error) {
    console.error('Error loading politician data:', error);
    return [];
  }
};

/**
 * Mock politicians array (async-loaded from JSON)
 * Use getMockPoliticians() for new code, or await this property for legacy compatibility
 */
export const mockPoliticians: Promise<Politician[]> = getMockPoliticians();

// Helper function to get politicians by party
export const getPoliticiansByParty = async (party: string): Promise<Politician[]> => {
  const politicians = await getMockPoliticians();
  return politicians.filter(politician => politician.party === party);
};

// Helper function to get politicians by state
export const getPoliticiansByState = async (state: string): Promise<Politician[]> => {
  const politicians = await getMockPoliticians();
  return politicians.filter(politician => politician.state === state);
};

// Helper function to get politicians by gender
export const getPoliticiansByGender = async (gender: string): Promise<Politician[]> => {
  const politicians = await getMockPoliticians();
  return politicians.filter(politician => politician.gender === gender);
};

// Helper function to get trending politicians
export const getTrendingPoliticians = async (limit: number = 5): Promise<Politician[]> => {
  const politicians = await getMockPoliticians();
  return politicians
    .filter(politician => politician.recentSentiment)
    .sort((a, b) => {
      const aChange = a.recentSentiment?.changePercentage || 0;
      const bChange = b.recentSentiment?.changePercentage || 0;
      return bChange - aChange;
    })
    .slice(0, limit);
};

// Helper function to search politicians
export const searchPoliticians = async (query: string): Promise<Politician[]> => {
  if (!query.trim()) return await getMockPoliticians();
  
  const politicians = await getMockPoliticians();
  const searchTerm = query.toLowerCase();
  return politicians.filter(politician => 
    politician.name.toLowerCase().includes(searchTerm) ||
    politician.position.toLowerCase().includes(searchTerm) ||
    politician.party.toLowerCase().includes(searchTerm) ||
    politician.state.toLowerCase().includes(searchTerm)
  );
};