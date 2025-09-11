/**
 * Geographic Service - Updated to use new JSON data structure
 * 
 * This service provides access to hierarchical geographic data with:
 * - Hierarchical geographic data loading (States -> LGAs -> Wards -> Polling Units)
 * - Coordinate and boundary data integration
 * - Geographic relationship validation
 * - Caching and performance optimization
 */

import { ErrorTypes } from '../constants/enums/system-enums';
import { ERROR_MESSAGES } from '../constants/messages/error-messages';
import type {
    Coordinates,
    LGA as JSONLga,
    PollingUnit as JSONPollingUnit,
    State as JSONState,
    Ward as JSONWard,
    ValidationResult
} from '../types/data-models';
import { dataLoader } from './data-loader';
import { DataValidatorService } from './data-validation-framework';
import { IntelligentCacheService } from './intelligent-cache';
import { NullSafeValidationService } from './null-safe-validation';

// Cache keys
const CACHE_KEYS = {
  STATES: 'geographic:states',
  LGAS: 'geographic:lgas',
  WARDS: 'geographic:wards',
  POLLING_UNITS: 'geographic:polling-units',
  STATE_BY_ID: (id: string) => `geographic:state:${id}`,
  LGAS_BY_STATE: (stateId: string) => `geographic:lgas:state:${stateId}`,
  WARDS_BY_LGA: (lgaId: string) => `geographic:wards:lga:${lgaId}`,
  WARDS_BY_STATE: (stateId: string) => `geographic:wards:state:${stateId}`,
  POLLING_UNITS_BY_WARD: (wardId: string) => `geographic:polling-units:ward:${wardId}`,
  POLLING_UNITS_BY_LGA: (lgaId: string) => `geographic:polling-units:lga:${lgaId}`,
  POLLING_UNITS_BY_STATE: (stateId: string) => `geographic:polling-units:state:${stateId}`,
  HIERARCHY: (stateId: string) => `geographic:hierarchy:${stateId}`,
  COORDINATES: (type: string, id: string) => `geographic:coordinates:${type}:${id}`
} as const;

// Geographic hierarchy interfaces
export interface GeographicHierarchy {
  state: JSONState;
  lgas: JSONLga[];
  wards: JSONWard[];
  pollingUnits: JSONPollingUnit[];
}

export interface GeographicSummary {
  totalStates: number;
  totalLgas: number;
  totalWards: number;
  totalPollingUnits: number;
  totalRegisteredVoters: number;
  averagePollingUnitsPerWard: number;
  averageWardsPerLga: number;
  averageLgasPerState: number;
}

export interface GeographicBounds {
  north: number;
  south: number;
  east: number;
  west: number;
  center: Coordinates;
}

export interface GeographicSearchResult {
  type: 'state' | 'lga' | 'ward' | 'polling-unit';
  id: string;
  name: string;
  parentName?: string;
  coordinates: Coordinates;
  metadata: Record<string, any>;
}

/**
 * Geographic Service with hierarchical data support
 */
export class GeographicService {
  private static instance: GeographicService;
  private cache: IntelligentCacheService;
  private validator: DataValidatorService;
  private nullSafeValidator: NullSafeValidationService;

  private constructor() {
    this.cache = IntelligentCacheService.getInstance();
    this.validator = DataValidatorService.getInstance();
    this.nullSafeValidator = NullSafeValidationService.getInstance();
  }

  static getInstance(): GeographicService {
    if (!GeographicService.instance) {
      GeographicService.instance = new GeographicService();
    }
    return GeographicService.instance;
  }

  /**
   * Load all states with validation and caching
   */
  async getAllStates(): Promise<JSONState[]> {
    try {
      const statesData = await dataLoader.loadData<{ states: JSONState[] }>(
        CACHE_KEYS.STATES,
        async () => {
          const response = await fetch('/data/states.json');
          if (!response.ok) {
            throw new Error('Failed to load states data');
          }
          return response.json();
        }
      );

      // Validate data structure
      const validation = this.validator.validateStatesData(statesData);
      if (!validation.isValid) {
        console.warn('States data validation issues:', validation.errors);
      }

      return statesData.states;

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.DATA_LOADING_ERROR]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get state by ID with caching
   */
  async getStateById(stateId: string): Promise<JSONState | null> {
    if (!stateId) {
      throw new Error(ERROR_MESSAGES[ErrorTypes.VALIDATION_ERROR]);
    }

    const cacheKey = CACHE_KEYS.STATE_BY_ID(stateId);
    const cached = this.cache.get<JSONState>(cacheKey);
    if (cached) return cached;

    try {
      const states = await this.getAllStates();
      const state = states.find(s => s.id === stateId) || null;

      if (state) {
        // Cache individual state for 30 minutes
        this.cache.set(cacheKey, state, 30 * 60 * 1000);
      }

      return state;

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.DATA_NOT_FOUND]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load all LGAs with validation and caching
   */
  async getAllLGAs(): Promise<JSONLga[]> {
    try {
      const lgasData = await dataLoader.loadData<{ lgas: JSONLga[] }>(
        CACHE_KEYS.LGAS,
        () => import('../data/core/lgas.json').then(m => m.default)
      );

      // Validate data structure and relationships
      const validation = this.validator.validateLGAsData(lgasData);
      if (!validation.isValid) {
        console.warn('LGAs data validation issues:', validation.errors);
      }

      return lgasData.lgas;

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.DATA_LOADING_ERROR]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get LGAs by state with caching and relationship validation
   */
  async getLGAsByState(stateId: string): Promise<JSONLga[]> {
    if (!stateId) {
      throw new Error(ERROR_MESSAGES[ErrorTypes.VALIDATION_ERROR]);
    }

    const cacheKey = CACHE_KEYS.LGAS_BY_STATE(stateId);
    const cached = this.cache.get<JSONLga[]>(cacheKey);
    if (cached) return cached;

    try {
      // Validate state exists
      const state = await this.getStateById(stateId);
      if (!state) {
        throw new Error(`State with ID ${stateId} not found`);
      }

      const lgas = await this.getAllLGAs();
      const stateLgas = lgas.filter(lga => lga.stateId === stateId);

      // Validate relationships
      const validation = this.validateGeographicRelationships(stateLgas, 'lga', stateId);
      if (!validation.isValid) {
        console.warn(`LGA-State relationship validation issues for ${stateId}:`, validation.warnings);
      }

      // Cache for 20 minutes
      this.cache.set(cacheKey, stateLgas, 20 * 60 * 1000);
      return stateLgas;

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.DATA_LOADING_ERROR]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load all wards with validation and caching
   */
  async getAllWards(): Promise<JSONWard[]> {
    try {
      const wardsData = await dataLoader.loadData<{ wards: JSONWard[] }>(
        CACHE_KEYS.WARDS,
        () => import('../data/core/wards.json').then(m => m.default)
      );

      // Validate data structure and relationships
      const validation = this.validator.validateWardsData(wardsData);
      if (!validation.isValid) {
        console.warn('Wards data validation issues:', validation.errors);
      }

      return wardsData.wards;

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.DATA_LOADING_ERROR]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get wards by LGA with caching and relationship validation
   */
  async getWardsByLGA(lgaId: string): Promise<JSONWard[]> {
    if (!lgaId) {
      throw new Error(ERROR_MESSAGES[ErrorTypes.VALIDATION_ERROR]);
    }

    const cacheKey = CACHE_KEYS.WARDS_BY_LGA(lgaId);
    const cached = this.cache.get<JSONWard[]>(cacheKey);
    if (cached) return cached;

    try {
      const wards = await this.getAllWards();
      const lgaWards = wards.filter(ward => ward.lgaId === lgaId);

      // Validate relationships
      const validation = this.validateGeographicRelationships(lgaWards, 'ward', lgaId);
      if (!validation.isValid) {
        console.warn(`Ward-LGA relationship validation issues for ${lgaId}:`, validation.warnings);
      }

      // Cache for 15 minutes
      this.cache.set(cacheKey, lgaWards, 15 * 60 * 1000);
      return lgaWards;

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.DATA_LOADING_ERROR]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get wards by state with caching
   */
  async getWardsByState(stateId: string): Promise<JSONWard[]> {
    if (!stateId) {
      throw new Error(ERROR_MESSAGES[ErrorTypes.VALIDATION_ERROR]);
    }

    const cacheKey = CACHE_KEYS.WARDS_BY_STATE(stateId);
    const cached = this.cache.get<JSONWard[]>(cacheKey);
    if (cached) return cached;

    try {
      const wards = await this.getAllWards();
      const stateWards = wards.filter(ward => ward.stateId === stateId);

      // Cache for 15 minutes
      this.cache.set(cacheKey, stateWards, 15 * 60 * 1000);
      return stateWards;

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.DATA_LOADING_ERROR]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load all polling units with validation and caching
   */
  async getAllPollingUnits(): Promise<JSONPollingUnit[]> {
    try {
      const pollingUnitsData = await dataLoader.loadData<{ pollingUnits: JSONPollingUnit[] }>(
        CACHE_KEYS.POLLING_UNITS,
        () => import('../data/core/polling-units.json').then(m => m.default)
      );

      // Validate data structure and relationships
      const validation = this.validator.validatePollingUnitsData(pollingUnitsData);
      if (!validation.isValid) {
        console.warn('Polling units data validation issues:', validation.errors);
      }

      return pollingUnitsData.pollingUnits;

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.DATA_LOADING_ERROR]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get polling units by ward with caching and relationship validation
   */
  async getPollingUnitsByWard(wardId: string): Promise<JSONPollingUnit[]> {
    if (!wardId) {
      throw new Error(ERROR_MESSAGES[ErrorTypes.VALIDATION_ERROR]);
    }

    const cacheKey = CACHE_KEYS.POLLING_UNITS_BY_WARD(wardId);
    const cached = this.cache.get<JSONPollingUnit[]>(cacheKey);
    if (cached) return cached;

    try {
      const pollingUnits = await this.getAllPollingUnits();
      const wardPollingUnits = pollingUnits.filter(pu => pu.wardId === wardId);

      // Validate relationships
      const validation = this.validateGeographicRelationships(wardPollingUnits, 'polling-unit', wardId);
      if (!validation.isValid) {
        console.warn(`Polling Unit-Ward relationship validation issues for ${wardId}:`, validation.warnings);
      }

      // Cache for 10 minutes
      this.cache.set(cacheKey, wardPollingUnits, 10 * 60 * 1000);
      return wardPollingUnits;

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.DATA_LOADING_ERROR]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get polling units by LGA with caching
   */
  async getPollingUnitsByLGA(lgaId: string): Promise<JSONPollingUnit[]> {
    if (!lgaId) {
      throw new Error(ERROR_MESSAGES[ErrorTypes.VALIDATION_ERROR]);
    }

    const cacheKey = CACHE_KEYS.POLLING_UNITS_BY_LGA(lgaId);
    const cached = this.cache.get<JSONPollingUnit[]>(cacheKey);
    if (cached) return cached;

    try {
      const pollingUnits = await this.getAllPollingUnits();
      const lgaPollingUnits = pollingUnits.filter(pu => pu.lgaId === lgaId);

      // Cache for 10 minutes
      this.cache.set(cacheKey, lgaPollingUnits, 10 * 60 * 1000);
      return lgaPollingUnits;

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.DATA_LOADING_ERROR]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get polling units by state with caching
   */
  async getPollingUnitsByState(stateId: string): Promise<JSONPollingUnit[]> {
    if (!stateId) {
      throw new Error(ERROR_MESSAGES[ErrorTypes.VALIDATION_ERROR]);
    }

    const cacheKey = CACHE_KEYS.POLLING_UNITS_BY_STATE(stateId);
    const cached = this.cache.get<JSONPollingUnit[]>(cacheKey);
    if (cached) return cached;

    try {
      const pollingUnits = await this.getAllPollingUnits();
      const statePollingUnits = pollingUnits.filter(pu => pu.stateId === stateId);

      // Cache for 10 minutes
      this.cache.set(cacheKey, statePollingUnits, 10 * 60 * 1000);
      return statePollingUnits;

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.DATA_LOADING_ERROR]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get complete geographic hierarchy for a state
   */
  async getGeographicHierarchy(stateId: string): Promise<GeographicHierarchy> {
    if (!stateId) {
      throw new Error(ERROR_MESSAGES[ErrorTypes.VALIDATION_ERROR]);
    }

    const cacheKey = CACHE_KEYS.HIERARCHY(stateId);
    const cached = this.cache.get<GeographicHierarchy>(cacheKey);
    if (cached) return cached;

    try {
      const [state, lgas, wards, pollingUnits] = await Promise.all([
        this.getStateById(stateId),
        this.getLGAsByState(stateId),
        this.getWardsByState(stateId),
        this.getPollingUnitsByState(stateId)
      ]);

      if (!state) {
        throw new Error(`State with ID ${stateId} not found`);
      }

      const hierarchy: GeographicHierarchy = {
        state,
        lgas,
        wards,
        pollingUnits
      };

      // Validate complete hierarchy
      const validation = this.validateCompleteHierarchy(hierarchy);
      if (!validation.isValid) {
        console.warn(`Geographic hierarchy validation issues for ${stateId}:`, validation.warnings);
      }

      // Cache for 30 minutes
      this.cache.set(cacheKey, hierarchy, 30 * 60 * 1000);
      return hierarchy;

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.DATA_LOADING_ERROR]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get geographic bounds for a region
   */
  async getGeographicBounds(
    type: 'state' | 'lga' | 'ward',
    id: string
  ): Promise<GeographicBounds> {
    try {
      let coordinates: Coordinates[] = [];

      switch (type) {
        case 'state':
          const stateLgas = await this.getLGAsByState(id);
          coordinates = stateLgas.map(lga => lga.coordinates);
          break;
        case 'lga':
          const lgaWards = await this.getWardsByLGA(id);
          coordinates = lgaWards.map(ward => ward.coordinates);
          break;
        case 'ward':
          const wardPollingUnits = await this.getPollingUnitsByWard(id);
          coordinates = wardPollingUnits.map(pu => pu.coordinates);
          break;
      }

      if (coordinates.length === 0) {
        throw new Error(`No coordinates found for ${type} ${id}`);
      }

      const lats = coordinates.map(c => c.latitude);
      const lngs = coordinates.map(c => c.longitude);

      const bounds: GeographicBounds = {
        north: Math.max(...lats),
        south: Math.min(...lats),
        east: Math.max(...lngs),
        west: Math.min(...lngs),
        center: {
          latitude: (Math.max(...lats) + Math.min(...lats)) / 2,
          longitude: (Math.max(...lngs) + Math.min(...lngs)) / 2
        }
      };

      return bounds;

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.DATA_PROCESSING_ERROR]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search geographic entities
   */
  async searchGeographic(query: string, limit: number = 20): Promise<GeographicSearchResult[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const searchTerm = query.toLowerCase();
      const results: GeographicSearchResult[] = [];

      // Search states
      const states = await this.getAllStates();
      states.forEach(state => {
        if (state.name.toLowerCase().includes(searchTerm) || 
            state.code.toLowerCase().includes(searchTerm)) {
          results.push({
            type: 'state',
            id: state.id,
            name: state.name,
            coordinates: state.coordinates,
            metadata: { code: state.code, capital: state.capital, region: state.region }
          });
        }
      });

      // Search LGAs
      const lgas = await this.getAllLGAs();
      lgas.forEach(lga => {
        if (lga.name.toLowerCase().includes(searchTerm) || 
            lga.code.toLowerCase().includes(searchTerm)) {
          const state = states.find(s => s.id === lga.stateId);
          results.push({
            type: 'lga',
            id: lga.id,
            name: lga.name,
            parentName: state?.name,
            coordinates: lga.coordinates,
            metadata: { code: lga.code, stateId: lga.stateId }
          });
        }
      });

      // Search wards
      const wards = await this.getAllWards();
      wards.forEach(ward => {
        if (ward.name.toLowerCase().includes(searchTerm)) {
          const lga = lgas.find(l => l.id === ward.lgaId);
          results.push({
            type: 'ward',
            id: ward.id,
            name: ward.name,
            parentName: lga?.name,
            coordinates: ward.coordinates,
            metadata: { number: ward.number, lgaId: ward.lgaId, stateId: ward.stateId }
          });
        }
      });

      // Search polling units
      const pollingUnits = await this.getAllPollingUnits();
      pollingUnits.forEach(pu => {
        if (pu.name.toLowerCase().includes(searchTerm) || 
            pu.code.toLowerCase().includes(searchTerm)) {
          const ward = wards.find(w => w.id === pu.wardId);
          results.push({
            type: 'polling-unit',
            id: pu.id,
            name: pu.name,
            parentName: ward?.name,
            coordinates: pu.coordinates,
            metadata: { code: pu.code, address: pu.address, wardId: pu.wardId }
          });
        }
      });

      // Sort by relevance and limit results
      return results
        .sort((a, b) => {
          const aExact = a.name.toLowerCase() === searchTerm;
          const bExact = b.name.toLowerCase() === searchTerm;
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          return a.name.localeCompare(b.name);
        })
        .slice(0, limit);

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.SEARCH_ERROR]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get geographic summary statistics
   */
  async getGeographicSummary(): Promise<GeographicSummary> {
    try {
      const [states, lgas, wards, pollingUnits] = await Promise.all([
        this.getAllStates(),
        this.getAllLGAs(),
        this.getAllWards(),
        this.getAllPollingUnits()
      ]);

      const totalRegisteredVoters = pollingUnits.reduce(
        (sum, pu) => sum + (pu.capacity.registeredVoters || 0), 0
      );

      return {
        totalStates: states.length,
        totalLgas: lgas.length,
        totalWards: wards.length,
        totalPollingUnits: pollingUnits.length,
        totalRegisteredVoters,
        averagePollingUnitsPerWard: pollingUnits.length / wards.length,
        averageWardsPerLga: wards.length / lgas.length,
        averageLgasPerState: lgas.length / states.length
      };

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.DATA_PROCESSING_ERROR]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate geographic relationships
   */
  private validateGeographicRelationships(
    entities: any[],
    type: string,
    parentId: string
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    entities.forEach(entity => {
      // Check for required fields
      if (!entity.id) {
        errors.push(`${type} missing required field: id`);
      }
      if (!entity.name) {
        errors.push(`${type} ${entity.id} missing required field: name`);
      }
      if (!entity.coordinates) {
        warnings.push(`${type} ${entity.id} missing coordinates`);
      }

      // Check coordinate validity
      if (entity.coordinates) {
        const { latitude, longitude } = entity.coordinates;
        if (latitude < -90 || latitude > 90) {
          errors.push(`${type} ${entity.id} has invalid latitude: ${latitude}`);
        }
        if (longitude < -180 || longitude > 180) {
          errors.push(`${type} ${entity.id} has invalid longitude: ${longitude}`);
        }
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, 100 - (errors.length * 10) - (warnings.length * 2))
    };
  }

  /**
   * Validate complete geographic hierarchy
   */
  private validateCompleteHierarchy(hierarchy: GeographicHierarchy): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate state
    if (!hierarchy.state) {
      errors.push('Missing state in hierarchy');
      return { isValid: false, errors, warnings, score: 0 };
    }

    // Validate LGA relationships
    hierarchy.lgas.forEach(lga => {
      if (lga.stateId !== hierarchy.state.id) {
        errors.push(`LGA ${lga.id} has incorrect state reference: ${lga.stateId}`);
      }
    });

    // Validate ward relationships
    hierarchy.wards.forEach(ward => {
      if (ward.stateId !== hierarchy.state.id) {
        errors.push(`Ward ${ward.id} has incorrect state reference: ${ward.stateId}`);
      }
      const lga = hierarchy.lgas.find(l => l.id === ward.lgaId);
      if (!lga) {
        errors.push(`Ward ${ward.id} references non-existent LGA: ${ward.lgaId}`);
      }
    });

    // Validate polling unit relationships
    hierarchy.pollingUnits.forEach(pu => {
      if (pu.stateId !== hierarchy.state.id) {
        errors.push(`Polling unit ${pu.id} has incorrect state reference: ${pu.stateId}`);
      }
      const lga = hierarchy.lgas.find(l => l.id === pu.lgaId);
      if (!lga) {
        errors.push(`Polling unit ${pu.id} references non-existent LGA: ${pu.lgaId}`);
      }
      const ward = hierarchy.wards.find(w => w.id === pu.wardId);
      if (!ward) {
        errors.push(`Polling unit ${pu.id} references non-existent ward: ${pu.wardId}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: Math.max(0, 100 - (errors.length * 5) - (warnings.length * 1))
    };
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get service metrics
   */
  getMetrics() {
    return {
      cache: this.cache.getMetrics(),
      dataLoader: dataLoader.getMetrics()
    };
  }
}

// Export singleton instance
export const geographicService = GeographicService.getInstance();
export default GeographicService;