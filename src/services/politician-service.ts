/**
 * Politician Service - Updated to use new JSON data structure
 * 
 * This service provides access to politician data from JSON files with:
 * - Proper error handling and validation
 * - Caching and performance optimization
 * - Type safety and null-safe operations
 * - Foreign key relationship validation
 */

import { ErrorTypes } from '../constants/enums/system-enums';
import { ERROR_MESSAGES } from '../constants/messages/error-messages';
import type {
    PaginatedResponse,
    Politician,
    SearchFilters
} from '../types';
import {
    AgeGroup,
    Gender,
    NigerianState,
    PoliticalLevel,
    PoliticalParty,
    PoliticalPosition
} from '../types';
import type {
    PoliticalParty as JSONPoliticalParty,
    Politician as JSONPolitician,
    Position as JSONPosition,
    State as JSONState
} from '../types/data-models';
import { dataLoader } from './data-loader';
import { DataValidatorService } from './data-validation-framework';
import { IntelligentCacheService } from './intelligent-cache';
import { NullSafeValidationService } from './null-safe-validation';

// Cache keys
const CACHE_KEYS = {
  POLITICIANS: 'politicians',
  PARTIES: 'parties',
  STATES: 'states',
  POSITIONS: 'positions',
  POLITICIAN_BY_ID: (id: string) => `politician:${id}`,
  POLITICIANS_BY_PARTY: (partyId: string) => `politicians:party:${partyId}`,
  POLITICIANS_BY_STATE: (stateId: string) => `politicians:state:${stateId}`,
  SEARCH_RESULTS: (query: string, filters: string) => `search:${query}:${filters}`
} as const;

// Data transformation interfaces
interface PoliticianTransformContext {
  parties: Map<string, JSONPoliticalParty>;
  states: Map<string, JSONState>;
  positions: Map<string, JSONPosition>;
}

/**
 * Politician Service with JSON data integration
 */
export class PoliticianService {
  private static instance: PoliticianService;
  private cache: IntelligentCacheService;
  private validator: DataValidatorService;
  private nullSafeValidator: NullSafeValidationService;

  private constructor() {
    this.cache = IntelligentCacheService.getInstance();
    this.validator = DataValidatorService.getInstance();
    this.nullSafeValidator = NullSafeValidationService.getInstance();
  }

  static getInstance(): PoliticianService {
    if (!PoliticianService.instance) {
      PoliticianService.instance = new PoliticianService();
    }
    return PoliticianService.instance;
  }

  /**
   * Load and cache reference data needed for politician transformation
   */
  private async loadReferenceData(): Promise<PoliticianTransformContext> {
    const cacheKey = 'reference-data';
    const cached = this.cache.get<PoliticianTransformContext>(cacheKey);
    if (cached) return cached;

    try {
      const [partiesData, statesData, positionsData] = await Promise.all([
        dataLoader.loadData<{ parties: JSONPoliticalParty[] }>(
          CACHE_KEYS.PARTIES,
          () => import('../data/core/parties.json').then(m => m.default)
        ),
        dataLoader.loadData<{ states: JSONState[] }>(
          CACHE_KEYS.STATES,
          () => import('../data/core/states.json').then(m => m.default)
        ),
        dataLoader.loadData<{ positions: JSONPosition[] }>(
          CACHE_KEYS.POSITIONS,
          () => import('../data/core/positions.json').then(m => m.default)
        )
      ]);

      const context: PoliticianTransformContext = {
        parties: new Map(partiesData.parties.map(p => [p.id, p])),
        states: new Map(statesData.states.map(s => [s.id, s])),
        positions: new Map(positionsData.positions.map(pos => [pos.id, pos]))
      };

      // Cache for 10 minutes
      this.cache.set(cacheKey, context, 10 * 60 * 1000);
      return context;

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.DATA_LOADING_ERROR]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Transform JSON politician data to application format
   */
  private transformPolitician(
    jsonPolitician: JSONPolitician,
    context: PoliticianTransformContext
  ): Politician {
    // Validate required fields with null-safe validation
    const validation = this.nullSafeValidator.validatePolitician(jsonPolitician);
    if (!validation.isValid) {
      console.warn(`Politician ${jsonPolitician.id} has validation issues:`, validation.warnings);
    }

    // Get reference data with fallbacks
    const party = jsonPolitician.partyId ? context.parties.get(jsonPolitician.partyId) : null;
    const state = context.states.get(jsonPolitician.stateOfOriginId);
    const position = context.positions.get(jsonPolitician.currentPositionId);

    // Transform to application format with null-safe operations
    return {
      id: jsonPolitician.id,
      name: jsonPolitician.fullName || `${jsonPolitician.firstName} ${jsonPolitician.lastName}`,
      firstName: jsonPolitician.firstName,
      lastName: jsonPolitician.lastName,
      imageUrl: undefined, // Will be handled by image service
      party: this.mapPartyIdToEnum(jsonPolitician.partyId, party),
      position: this.mapPositionIdToEnum(jsonPolitician.currentPositionId, position),
      state: this.mapStateIdToEnum(jsonPolitician.stateOfOriginId, state),
      politicalLevel: this.determinePoliticalLevel(position),
      gender: this.mapGender(jsonPolitician.gender),
      ageGroup: this.calculateAgeGroup(jsonPolitician.dateOfBirth),
      isActive: jsonPolitician.metadata?.isActive ?? true,
      socialMediaHandles: {
        twitter: jsonPolitician.socialMedia?.twitter,
        facebook: jsonPolitician.socialMedia?.facebook,
        instagram: jsonPolitician.socialMedia?.instagram,
        threads: undefined // Not in current data
      },
      createdAt: jsonPolitician.metadata?.lastUpdated || new Date().toISOString(),
      updatedAt: jsonPolitician.metadata?.lastUpdated || new Date().toISOString(),
      recentSentiment: undefined // Will be populated by sentiment service
    };
  }

  /**
   * Map party ID to enum with fallback
   */
  private mapPartyIdToEnum(partyId: string | null, party: JSONPoliticalParty | null | undefined): PoliticalParty {
    if (!partyId || !party) return PoliticalParty.OTHER;

    const abbreviation = party.abbreviation.toUpperCase();
    switch (abbreviation) {
      case 'APC': return PoliticalParty.APC;
      case 'PDP': return PoliticalParty.PDP;
      case 'LP': return PoliticalParty.LP;
      case 'NNPP': return PoliticalParty.NNPP;
      case 'APGA': return PoliticalParty.APGA;
      case 'ADC': return PoliticalParty.ADC;
      case 'SDP': return PoliticalParty.SDP;
      case 'YPP': return PoliticalParty.YPP;
      default: return PoliticalParty.OTHER;
    }
  }

  /**
   * Map state ID to enum with fallback
   */
  private mapStateIdToEnum(stateId: string, state: JSONState | undefined): NigerianState {
    if (!state) return NigerianState.FCT; // Default fallback

    // Map state names to enum values
    const stateName = state.name;
    const stateEnumValue = Object.values(NigerianState).find(
      enumValue => enumValue === stateName
    );

    return stateEnumValue || NigerianState.FCT;
  }

  /**
   * Map position ID to enum with fallback
   */
  private mapPositionIdToEnum(positionId: string, position: JSONPosition | undefined): PoliticalPosition {
    if (!position) return PoliticalPosition.OTHER;

    const title = position.title.toLowerCase().replace(/\s+/g, '_');
    switch (title) {
      case 'president': return PoliticalPosition.PRESIDENT;
      case 'vice_president': return PoliticalPosition.VICE_PRESIDENT;
      case 'governor': return PoliticalPosition.GOVERNOR;
      case 'deputy_governor': return PoliticalPosition.DEPUTY_GOVERNOR;
      case 'senator': return PoliticalPosition.SENATOR;
      case 'house_of_representatives': return PoliticalPosition.HOUSE_REP;
      case 'state_assembly': return PoliticalPosition.STATE_ASSEMBLY;
      case 'minister': return PoliticalPosition.MINISTER;
      case 'commissioner': return PoliticalPosition.COMMISSIONER;
      case 'senate_president': return PoliticalPosition.OTHER; // Map to OTHER for now
      case 'house_speaker': return PoliticalPosition.OTHER; // Map to OTHER for now
      case 'aspirant': return PoliticalPosition.ASPIRANT;
      default: return PoliticalPosition.OTHER;
    }
  }

  /**
   * Determine political level from position
   */
  private determinePoliticalLevel(position: JSONPosition | undefined): PoliticalLevel {
    if (!position) return PoliticalLevel.FEDERAL;

    switch (position.level) {
      case 'federal': return PoliticalLevel.FEDERAL;
      case 'state': return PoliticalLevel.STATE;
      case 'local': return PoliticalLevel.LOCAL;
      default: return PoliticalLevel.FEDERAL;
    }
  }

  /**
   * Map gender string to enum
   */
  private mapGender(gender: string): Gender {
    switch (gender?.toLowerCase()) {
      case 'male': return Gender.MALE;
      case 'female': return Gender.FEMALE;
      default: return Gender.OTHER;
    }
  }

  /**
   * Calculate age group from date of birth
   */
  private calculateAgeGroup(dateOfBirth: string): AgeGroup {
    if (!dateOfBirth) return AgeGroup.ADULT; // Default fallback

    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 26) return AgeGroup.YOUNG;
      if (age < 36) return AgeGroup.ADULT;
      if (age < 46) return AgeGroup.MIDDLE;
      if (age < 56) return AgeGroup.MATURE;
      return AgeGroup.SENIOR;
    } catch {
      return AgeGroup.ADULT; // Fallback on date parsing error
    }
  }

  /**
   * Get all politicians with caching and error handling
   */
  async getAllPoliticians(): Promise<Politician[]> {
    try {
      const [politiciansData, context] = await Promise.all([
        dataLoader.loadData<{ politicians: JSONPolitician[] }>(
          CACHE_KEYS.POLITICIANS,
          () => import('../data/politicians/politicians.json').then(m => m.default)
        ),
        this.loadReferenceData()
      ]);

      // Validate data structure
      const validation = this.validator.validatePoliticiansData(politiciansData);
      if (!validation.isValid) {
        console.warn('Politicians data validation issues:', validation.errors);
      }

      // Transform politicians with error handling
      const politicians = politiciansData.politicians
        .map(jsonPolitician => {
          try {
            return this.transformPolitician(jsonPolitician, context);
          } catch (error) {
            console.error(`Error transforming politician ${jsonPolitician.id}:`, error);
            return null;
          }
        })
        .filter((politician): politician is Politician => politician !== null);

      return politicians;

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.DATA_LOADING_ERROR]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get politician by ID with caching
   */
  async getPoliticianById(id: string): Promise<Politician | null> {
    if (!id) {
      throw new Error(ERROR_MESSAGES[ErrorTypes.VALIDATION_ERROR]);
    }

    const cacheKey = CACHE_KEYS.POLITICIAN_BY_ID(id);
    const cached = this.cache.get<Politician>(cacheKey);
    if (cached) return cached;

    try {
      const politicians = await this.getAllPoliticians();
      const politician = politicians.find(p => p.id === id) || null;

      if (politician) {
        // Cache individual politician for 15 minutes
        this.cache.set(cacheKey, politician, 15 * 60 * 1000);
      }

      return politician;

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.DATA_NOT_FOUND]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get politicians by party with caching
   */
  async getPoliticiansByParty(party: PoliticalParty): Promise<Politician[]> {
    const cacheKey = CACHE_KEYS.POLITICIANS_BY_PARTY(party);
    const cached = this.cache.get<Politician[]>(cacheKey);
    if (cached) return cached;

    try {
      const politicians = await this.getAllPoliticians();
      const filteredPoliticians = politicians.filter(p => p.party === party);

      // Cache for 10 minutes
      this.cache.set(cacheKey, filteredPoliticians, 10 * 60 * 1000);
      return filteredPoliticians;

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.DATA_LOADING_ERROR]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get politicians by state with caching
   */
  async getPoliticiansByState(state: NigerianState): Promise<Politician[]> {
    const cacheKey = CACHE_KEYS.POLITICIANS_BY_STATE(state);
    const cached = this.cache.get<Politician[]>(cacheKey);
    if (cached) return cached;

    try {
      const politicians = await this.getAllPoliticians();
      const filteredPoliticians = politicians.filter(p => p.state === state);

      // Cache for 10 minutes
      this.cache.set(cacheKey, filteredPoliticians, 10 * 60 * 1000);
      return filteredPoliticians;

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.DATA_LOADING_ERROR]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Search politicians with filters and caching
   */
  async searchPoliticians(
    query: string = '',
    filters: Partial<SearchFilters> = {},
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Politician>> {
    const filtersKey = JSON.stringify(filters);
    const cacheKey = CACHE_KEYS.SEARCH_RESULTS(query, filtersKey);
    const cached = this.cache.get<PaginatedResponse<Politician>>(cacheKey);
    if (cached) return cached;

    try {
      let politicians = await this.getAllPoliticians();

      // Apply text search
      if (query.trim()) {
        const searchTerm = query.toLowerCase();
        politicians = politicians.filter(politician =>
          politician.name.toLowerCase().includes(searchTerm) ||
          politician.firstName.toLowerCase().includes(searchTerm) ||
          politician.lastName.toLowerCase().includes(searchTerm) ||
          politician.party.toLowerCase().includes(searchTerm) ||
          politician.position.toLowerCase().includes(searchTerm) ||
          politician.state.toLowerCase().includes(searchTerm)
        );
      }

      // Apply filters
      if (filters.party?.length) {
        politicians = politicians.filter(p => filters.party!.includes(p.party));
      }
      if (filters.state?.length) {
        politicians = politicians.filter(p => filters.state!.includes(p.state));
      }
      if (filters.level?.length) {
        politicians = politicians.filter(p => filters.level!.includes(p.politicalLevel));
      }
      if (filters.gender?.length) {
        politicians = politicians.filter(p => filters.gender!.includes(p.gender));
      }
      if (filters.ageGroup?.length) {
        politicians = politicians.filter(p => filters.ageGroup!.includes(p.ageGroup));
      }

      // Apply sorting
      if (filters.sortBy) {
        politicians.sort((a, b) => {
          let aVal: any, bVal: any;

          switch (filters.sortBy) {
            case 'sentiment':
              aVal = a.recentSentiment?.score || 0;
              bVal = b.recentSentiment?.score || 0;
              break;
            case 'mentions':
              aVal = a.recentSentiment?.mentionCount || 0;
              bVal = b.recentSentiment?.mentionCount || 0;
              break;
            case 'name':
              aVal = a.name.toLowerCase();
              bVal = b.name.toLowerCase();
              break;
            case 'relevance':
            default:
              aVal = (a.recentSentiment?.score || 0) * (a.recentSentiment?.mentionCount || 1);
              bVal = (b.recentSentiment?.score || 0) * (b.recentSentiment?.mentionCount || 1);
              break;
          }

          const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          return filters.sortOrder === 'desc' ? -comparison : comparison;
        });
      }

      // Apply pagination
      const totalItems = politicians.length;
      const totalPages = Math.ceil(totalItems / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPoliticians = politicians.slice(startIndex, endIndex);

      const result: PaginatedResponse<Politician> = {
        success: true,
        data: paginatedPoliticians,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNext: page < totalPages,
          hasPrevious: page > 1
        },
        message: 'Politicians retrieved successfully',
        timestamp: new Date().toISOString()
      };

      // Cache for 5 minutes
      this.cache.set(cacheKey, result, 5 * 60 * 1000);
      return result;

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.SEARCH_ERROR]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get trending politicians (mock implementation for now)
   */
  async getTrendingPoliticians(limit: number = 10): Promise<Politician[]> {
    try {
      const politicians = await this.getAllPoliticians();
      
      // For now, return random politicians as trending
      // In a real implementation, this would use sentiment data
      const shuffled = [...politicians].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, limit);

    } catch (error) {
      throw new Error(`${ERROR_MESSAGES[ErrorTypes.DATA_LOADING_ERROR]}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
export const politicianService = PoliticianService.getInstance();
export default PoliticianService;