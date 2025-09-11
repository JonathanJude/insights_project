/**
 * Geographic Data Infrastructure for Multi-Dimensional Sentiment Analysis
 * 
 * This module provides comprehensive geographic data for Nigerian political analysis,
 * including administrative hierarchies from country to polling unit level with
 * confidence scoring and undefined data handling.
 */

import { dataLoader } from '../services/data-loader';

// Geographic hierarchy interfaces
export interface GeographicHierarchy {
  country: {
    code: 'NG' | 'UK' | 'US' | 'INTL';
    name: string;
    confidence: number;
  };
  state: {
    code: string;
    name: string;
    confidence: number;
    isUndefined: boolean;
  };
  lga: {
    code: string;
    name: string;
    confidence: number;
    isUndefined: boolean;
  };
  ward: {
    number: number;
    name: string;
    confidence: number;
    isUndefined: boolean;
  };
  pollingUnit: {
    code: string;
    name: string;
    confidence: number;
    isUndefined: boolean;
  };
}

export interface Ward {
  number: number;
  name: string;
  pollingUnits: string[];
}

export interface LGA {
  code: string;
  name: string;
  wards: Ward[];
}

export interface NigerianState {
  code: string;
  name: string;
  capital: string;
  lgas: LGA[];
}

// Nigerian States and FCT data loaded from JSON
export const nigerianStates: NigerianState[] = [];

// Load states from JSON and convert format
export const loadStatesFromJSON = async (): Promise<NigerianState[]> => {
  try {
    const statesData = await dataLoader.loadData(
      'geographic-states',
      () => import('../data/core/states.json'),
      { cacheTTL: 30 * 60 * 1000 } // 30 minutes
    );
    
    // Convert JSON format to internal format
    return statesData.states.map((state: any) => ({
      code: state.code,
      name: state.name,
      capital: state.capital,
      lgas: state.lgas.map((lga: any) => ({
        code: lga.code,
        name: lga.name,
        wards: lga.wards.map((ward: any) => ({
          number: ward.number,
          name: ward.name,
          pollingUnits: ward.pollingUnits
        }))
      }))
    }));
  } catch (error) {
    console.error('Error loading states from JSON:', error);
    return [];
  }
};

// Initialize states asynchronously
export const initializeStates = async (): Promise<void> => {
  if (nigerianStates.length === 0) {
    const states = await loadStatesFromJSON();
    nigerianStates.push(...states);
  }
};

// Geographic sentiment distribution data
export interface GeographicSentimentDistribution {
  byState: Record<string, number>;
  byLGA: Record<string, number>;
  byWard: Record<string, number>;
  confidence: Record<string, number>;
  undefined: {
    percentage: number;
    fallbackAggregation: string;
  };
}

// Realistic sentiment distributions across Nigerian states
export const geographicSentimentDistributions: GeographicSentimentDistribution = {
  byState: {
    'LA': 0.65, // Lagos - generally positive due to economic opportunities
    'AB': 0.72, // FCT - positive due to federal presence
    'KN': 0.45, // Kano - mixed due to economic challenges
    'RV': 0.58, // Rivers - moderate positive due to oil revenue
    'OG': 0.52, // Ogun
    'ON': 0.48, // Ondo
    'OS': 0.55, // Osun
    'OY': 0.60, // Oyo
    'AN': 0.42, // Anambra
    'IM': 0.38, // Imo
    'EN': 0.35, // Enugu
    'EB': 0.40, // Ebonyi
    'AK': 0.68, // Akwa Ibom
    'CR': 0.50, // Cross River
    'BA': 0.32, // Bauchi
    'BO': 0.28, // Borno
    'AD': 0.30, // Adamawa
    'GO': 0.25, // Gombe
    'YO': 0.22, // Yobe
    'TA': 0.26, // Taraba
    'KD': 0.38, // Kaduna
    'KT': 0.35, // Katsina
    'JI': 0.40, // Jigawa
    'KE': 0.33, // Kebbi
    'SO': 0.36, // Sokoto
    'ZA': 0.31, // Zamfara
    'NI': 0.45, // Niger
    'KW': 0.48, // Kwara
    'PL': 0.42, // Plateau
    'BE': 0.38, // Benue
    'KO': 0.40, // Kogi
    'NA': 0.44, // Nasarawa
    'DE': 0.50, // Delta
    'ED': 0.46, // Edo
    'EK': 0.52, // Ekiti
    'BA2': 0.48 // Bayelsa
  },
  byLGA: {
    'SUR': 0.68, // Surulere - high urban engagement
    'IKJ': 0.70, // Ikeja - business district
    'ALM': 0.62, // Alimosho - mixed residential
    'ETO': 0.75, // Eti-Osa - affluent area
    'GAR': 0.78, // Garki - government area
    'WUS': 0.74, // Wuse - commercial area
    'KNM': 0.48, // Kano Municipal
    'NAS': 0.42, // Nasarawa LGA
    'PHC': 0.60, // Port Harcourt
    'OBG': 0.56  // Obio-Akpor
  },
  byWard: {
    'SUR_001': 0.70, // Aguda/Surulere
    'SUR_002': 0.66, // Coker/Aguda
    'IKJ_001': 0.72, // Agidingbi
    'IKJ_002': 0.68, // Anifowoshe
    'GAR_001': 0.80, // Garki I
    'GAR_002': 0.76, // Garki II
    'KNM_001': 0.50, // Fagge
    'KNM_002': 0.46, // Gwale
    'PHC_001': 0.62, // Mile 1 Diobu
    'PHC_002': 0.58  // Mile 2 Diobu
  },
  confidence: {
    'country': 0.95,
    'state': 0.85,
    'lga': 0.75,
    'ward': 0.65,
    'pollingUnit': 0.55
  },
  undefined: {
    percentage: 15.2,
    fallbackAggregation: 'state'
  }
};
// Geographic context generation functions
export const generateGeographicContext = (politicianId: string): GeographicHierarchy => {
  // Get base politician data to determine likely geographic context
  const politicianIndex = parseInt(politicianId.split('_')[1] || '1');
  const stateIndex = politicianIndex % nigerianStates.length;
  const selectedState = nigerianStates[stateIndex];
  
  // Determine confidence based on data availability
  const hasFullData = Math.random() > 0.15; // 85% have full geographic data
  
  if (!hasFullData) {
    // Return undefined data with fallback
    return {
      country: { code: 'NG', name: 'Nigeria', confidence: 0.95 },
      state: { 
        code: 'UND', 
        name: 'Undefined', 
        confidence: 0.0, 
        isUndefined: true 
      },
      lga: { 
        code: 'UND', 
        name: 'Undefined', 
        confidence: 0.0, 
        isUndefined: true 
      },
      ward: { 
        number: 0, 
        name: 'Undefined', 
        confidence: 0.0, 
        isUndefined: true 
      },
      pollingUnit: { 
        code: 'UND', 
        name: 'Undefined', 
        confidence: 0.0, 
        isUndefined: true 
      }
    };
  }
  
  // Generate realistic geographic hierarchy
  const lgaIndex = politicianIndex % selectedState.lgas.length;
  const selectedLGA = selectedState.lgas[lgaIndex];
  
  const wardIndex = politicianIndex % selectedLGA.wards.length;
  const selectedWard = selectedLGA.wards[wardIndex];
  
  const pollingUnitIndex = politicianIndex % selectedWard.pollingUnits.length;
  const selectedPollingUnit = selectedWard.pollingUnits[pollingUnitIndex];
  
  return {
    country: { 
      code: 'NG', 
      name: 'Nigeria', 
      confidence: 0.95 
    },
    state: { 
      code: selectedState.code, 
      name: selectedState.name, 
      confidence: 0.85 + Math.random() * 0.1, 
      isUndefined: false 
    },
    lga: { 
      code: selectedLGA.code, 
      name: selectedLGA.name, 
      confidence: 0.75 + Math.random() * 0.1, 
      isUndefined: false 
    },
    ward: { 
      number: selectedWard.number, 
      name: selectedWard.name, 
      confidence: 0.65 + Math.random() * 0.1, 
      isUndefined: false 
    },
    pollingUnit: { 
      code: selectedPollingUnit, 
      name: `Polling Unit ${selectedPollingUnit}`, 
      confidence: 0.55 + Math.random() * 0.1, 
      isUndefined: false 
    }
  };
};

// Get geographic sentiment for a specific location
export const getGeographicSentiment = (
  stateCode: string, 
  lgaCode?: string, 
  wardCode?: string
): number => {
  // Return sentiment based on most specific available level
  if (wardCode && geographicSentimentDistributions.byWard[wardCode]) {
    return geographicSentimentDistributions.byWard[wardCode];
  }
  
  if (lgaCode && geographicSentimentDistributions.byLGA[lgaCode]) {
    return geographicSentimentDistributions.byLGA[lgaCode];
  }
  
  if (geographicSentimentDistributions.byState[stateCode]) {
    return geographicSentimentDistributions.byState[stateCode];
  }
  
  // Fallback to national average
  return 0.50;
};

// Get state by code
export const getStateByCode = (code: string): NigerianState | undefined => {
  return nigerianStates.find(state => state.code === code);
};

// Get LGA by state and LGA code
export const getLGAByCode = (stateCode: string, lgaCode: string): LGA | undefined => {
  const state = getStateByCode(stateCode);
  return state?.lgas.find(lga => lga.code === lgaCode);
};

// Generate geographic sentiment distribution for a politician
export const generateGeographicSentimentDistribution = (politicianId: string) => {
  const context = generateGeographicContext(politicianId);
  
  if (context.state.isUndefined) {
    return {
      national: 0.50,
      state: undefined,
      lga: undefined,
      ward: undefined,
      confidence: 0.0
    };
  }
  
  const stateSentiment = getGeographicSentiment(context.state.code);
  const lgaSentiment = context.lga.isUndefined ? undefined : 
    getGeographicSentiment(context.state.code, context.lga.code);
  const wardSentiment = context.ward.isUndefined ? undefined : 
    getGeographicSentiment(context.state.code, context.lga.code, `${context.lga.code}_${context.ward.number.toString().padStart(3, '0')}`);
  
  return {
    national: 0.50,
    state: stateSentiment,
    lga: lgaSentiment,
    ward: wardSentiment,
    confidence: context.state.confidence
  };
};

// Export utility functions for integration
export const geographicDataUtils = {
  generateGeographicContext,
  getGeographicSentiment,
  getStateByCode,
  getLGAByCode,
  generateGeographicSentimentDistribution
};