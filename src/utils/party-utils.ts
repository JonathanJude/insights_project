/**
 * Party Data Utilities
 * 
 * This utility provides functions to access party data from the JSON file
 * instead of using hardcoded enums. This ensures data consistency and
 * provides access to rich party information beyond just abbreviations.
 */

import { dataLoader } from '../services/data-loader';

// Types for party data
export interface PoliticalParty {
  id: string;
  name: string;
  abbreviation: string;
  founded: string;
  ideology: string[];
  colors: {
    primary: string;
    secondary: string;
  };
  logo: string;
  headquarters: {
    address: string;
    stateId: string;
  };
  leadership: {
    nationalChairman: string;
    nationalSecretary: string;
  };
  metadata: {
    registrationNumber: string;
    status: string;
    website: string;
  };
}

export interface PartyOption {
  value: string;
  label: string;
  party?: PoliticalParty;
}

// Cache key for party data
const PARTIES_CACHE_KEY = 'political-parties-data';

/**
 * Load all political parties from JSON data
 */
export async function getAllParties(): Promise<PoliticalParty[]> {
  try {
    const response = await fetch('/data/core/parties.json');
    if (!response.ok) {
      throw new Error(`Failed to load parties data: ${response.status}`);
    }
    const data = await response.json();
    return data.parties || [];
  } catch (error) {
    console.error('Error loading parties data:', error);
    return [];
  }
}

/**
 * Get party by abbreviation
 */
export async function getPartyByAbbreviation(abbreviation: string): Promise<PoliticalParty | null> {
  const parties = await getAllParties();
  return parties.find(party => party.abbreviation === abbreviation) || null;
}

/**
 * Get party by ID
 */
export async function getPartyById(id: string): Promise<PoliticalParty | null> {
  const parties = await getAllParties();
  return parties.find(party => party.id === id) || null;
}

/**
 * Get party by name (partial match)
 */
export async function getPartyByName(name: string): Promise<PoliticalParty | null> {
  const parties = await getAllParties();
  return parties.find(party => 
    party.name.toLowerCase().includes(name.toLowerCase()) ||
    party.abbreviation.toLowerCase().includes(name.toLowerCase())
  ) || null;
}

/**
 * Get party options for dropdown/select components
 */
export async function getPartyOptions(): Promise<PartyOption[]> {
  const parties = await getAllParties();
  return parties.map(party => ({
    value: party.abbreviation,
    label: `${party.name} (${party.abbreviation})`,
    party
  }));
}

/**
 * Get party abbreviations array (replacement for enum values)
 */
export async function getPartyAbbreviations(): Promise<string[]> {
  const parties = await getAllParties();
  return parties.map(party => party.abbreviation);
}

/**
 * Check if a party abbreviation is valid
 */
export async function isValidPartyAbbreviation(abbreviation: string): Promise<boolean> {
  const parties = await getAllParties();
  return parties.some(party => party.abbreviation === abbreviation);
}

/**
 * Get parties by ideology
 */
export async function getPartiesByIdeology(ideology: string): Promise<PoliticalParty[]> {
  const parties = await getAllParties();
  return parties.filter(party => 
    party.ideology.some(ideo => 
      ideo.toLowerCase().includes(ideology.toLowerCase())
    )
  );
}

/**
 * Get active parties only
 */
export async function getActiveParties(): Promise<PoliticalParty[]> {
  const parties = await getAllParties();
  return parties.filter(party => party.metadata.status === 'active');
}

/**
 * Get party color scheme
 */
export async function getPartyColors(abbreviation: string): Promise<{ primary: string; secondary: string } | null> {
  const party = await getPartyByAbbreviation(abbreviation);
  return party ? party.colors : null;
}

/**
 * Search parties by multiple criteria
 */
export async function searchParties(query: {
  abbreviation?: string;
  name?: string;
  ideology?: string;
  status?: string;
}): Promise<PoliticalParty[]> {
  const parties = await getAllParties();
  
  return parties.filter(party => {
    if (query.abbreviation && !party.abbreviation.toLowerCase().includes(query.abbreviation.toLowerCase())) {
      return false;
    }
    if (query.name && !party.name.toLowerCase().includes(query.name.toLowerCase())) {
      return false;
    }
    if (query.ideology && !party.ideology.some(ideo => ideo.toLowerCase().includes(query.ideology.toLowerCase()))) {
      return false;
    }
    if (query.status && party.metadata.status !== query.status) {
      return false;
    }
    return true;
  });
}

/**
 * Get party statistics
 */
export async function getPartyStatistics(): Promise<{
  total: number;
  active: number;
  inactive: number;
  byIdeology: Record<string, number>;
}> {
  const parties = await getAllParties();
  
  const stats = {
    total: parties.length,
    active: 0,
    inactive: 0,
    byIdeology: {} as Record<string, number>
  };
  
  parties.forEach(party => {
    // Count by status
    if (party.metadata.status === 'active') {
      stats.active++;
    } else {
      stats.inactive++;
    }
    
    // Count by ideology
    party.ideology.forEach(ideology => {
      stats.byIdeology[ideology] = (stats.byIdeology[ideology] || 0) + 1;
    });
  });
  
  return stats;
}

/**
 * Legacy compatibility function to get all party values (replaces Object.values(PoliticalParties))
 */
export async function getPartyValues(): Promise<string[]> {
  return await getPartyAbbreviations();
}

/**
 * Legacy compatibility function to check if party value is valid (replaces PoliticalParties[value])
 */
export async function isValidPartyValue(value: string): Promise<boolean> {
  return await isValidPartyAbbreviation(value);
}

// Export a default object for easy importing
const partyUtils = {
  getAllParties,
  getPartyByAbbreviation,
  getPartyById,
  getPartyByName,
  getPartyOptions,
  getPartyAbbreviations,
  isValidPartyAbbreviation,
  getPartiesByIdeology,
  getActiveParties,
  getPartyColors,
  searchParties,
  getPartyStatistics,
  getPartyValues,
  isValidPartyValue
};

export default partyUtils;