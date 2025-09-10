/**
 * Service Interface Compatibility Layer
 * 
 * This layer provides:
 * - Backward-compatible service interfaces
 * - Gradual migration support for existing components
 * - Service mocking for testing and development
 * - Interface versioning and deprecation management
 * - Seamless transition between old and new data structures
 */

import { EventEmitter } from 'events';
import { dataLoader } from './data-loader';
import { dataValidationFramework } from './data-validation-framework';
import { intelligentCache } from './intelligent-cache';

// Legacy interface types (what components currently expect)
export interface LegacyPolitician {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  imageUrl?: string;
  party: string; // Legacy: string instead of object
  position: string; // Legacy: string instead of object
  state: string; // Legacy: string instead of object
  politicalLevel: string;
  gender: string;
  ageGroup: string;
  isActive: boolean;
  socialMediaHandles?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    threads?: string;
  };
  createdAt: string;
  updatedAt: string;
  recentSentiment?: {
    score: number;
    label: string;
    mentionCount: number;
    trend: 'up' | 'down' | 'stable';
    changePercentage: number;
  };
}

// New interface types (what the new system provides)
export interface NewPolitician {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  partyId: string;
  currentPositionId: string;
  stateOfOriginId: string;
  dateOfBirth: string;
  gender: string;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    year: number;
  }>;
  politicalHistory: Array<{
    positionId: string;
    stateId: string;
    startDate: string;
    endDate: string;
    partyId: string;
  }>;
  socialMedia: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  metadata: {
    isActive: boolean;
    verificationStatus: string;
    lastUpdated: string;
  };
}

// Migration configuration
export interface MigrationConfig {
  enableLegacySupport: boolean;
  enableNewSystem: boolean;
  migrationPhase: 'preparation' | 'gradual' | 'complete';
  componentMigrationStatus: Map<string, 'legacy' | 'migrating' | 'new'>;
  featureFlags: Map<string, boolean>;
  deprecationWarnings: boolean;
}

// Service interface versions
export enum ServiceVersion {
  LEGACY = 'v1',
  TRANSITIONAL = 'v1.5',
  NEW = 'v2'
}

// Interface adapter configuration
export interface AdapterConfig {
  version: ServiceVersion;
  enableCaching: boolean;
  enableValidation: boolean;
  enableMocking: boolean;
  mockDataPath?: string;
  transformationRules: Map<string, (data: any) => any>;
}

/**
 * Service Interface Compatibility Layer
 */
export class ServiceCompatibilityLayer extends EventEmitter {
  private static instance: ServiceCompatibilityLayer;
  
  // Configuration
  private migrationConfig: MigrationConfig;
  private adapterConfig: AdapterConfig;
  
  // Data transformation maps
  private legacyToNewTransformers = new Map<string, (data: any) => any>();
  private newToLegacyTransformers = new Map<string, (data: any) => any>();
  
  // Reference data for transformations
  private referenceData = new Map<string, Map<string, any>>();
  
  // Mock data for testing
  private mockData = new Map<string, any>();
  
  // Component registration
  private registeredComponents = new Map<string, {
    version: ServiceVersion;
    interfaces: string[];
    migrationStatus: 'legacy' | 'migrating' | 'new';
  }>();
  
  // Usage analytics
  private usageStats = {
    legacyInterfaceCalls: 0,
    newInterfaceCalls: 0,
    transformationCalls: 0,
    cacheHits: 0,
    cacheMisses: 0
  };
  
  private constructor() {
    super();
    
    this.migrationConfig = {
      enableLegacySupport: true,
      enableNewSystem: true,
      migrationPhase: 'gradual',
      componentMigrationStatus: new Map(),
      featureFlags: new Map([
        ['useNewDataLoader', false],
        ['useIntelligentCache', false],
        ['enableDataValidation', false],
        ['showDeprecationWarnings', true]
      ]),
      deprecationWarnings: true
    };
    
    this.adapterConfig = {
      version: ServiceVersion.TRANSITIONAL,
      enableCaching: true,
      enableValidation: false,
      enableMocking: false,
      transformationRules: new Map()
    };
    
    this.initializeTransformers();
    this.loadReferenceData();
  }
  
  /**
   * Get singleton instance
   */
  static getInstance(): ServiceCompatibilityLayer {
    if (!ServiceCompatibilityLayer.instance) {
      ServiceCompatibilityLayer.instance = new ServiceCompatibilityLayer();
    }
    return ServiceCompatibilityLayer.instance;
  }
  
  /**
   * Initialize data transformers
   */
  private initializeTransformers(): void {
    // Politician transformers
    this.legacyToNewTransformers.set('politician', (legacy: LegacyPolitician): Partial<NewPolitician> => {
      return {
        id: legacy.id,
        firstName: legacy.firstName,
        lastName: legacy.lastName,
        fullName: legacy.name,
        partyId: this.resolvePartyId(legacy.party),
        currentPositionId: this.resolvePositionId(legacy.position),
        stateOfOriginId: this.resolveStateId(legacy.state),
        gender: legacy.gender,
        socialMedia: legacy.socialMediaHandles || {},
        metadata: {
          isActive: legacy.isActive,
          verificationStatus: 'unverified',
          lastUpdated: legacy.updatedAt || new Date().toISOString()
        }
      };
    });
    
    this.newToLegacyTransformers.set('politician', (newData: NewPolitician): LegacyPolitician => {
      return {
        id: newData.id,
        name: newData.fullName,
        firstName: newData.firstName,
        lastName: newData.lastName,
        party: this.resolvePartyName(newData.partyId),
        position: this.resolvePositionName(newData.currentPositionId),
        state: this.resolveStateName(newData.stateOfOriginId),
        politicalLevel: this.inferPoliticalLevel(newData.currentPositionId),
        gender: newData.gender,
        ageGroup: this.calculateAgeGroup(newData.dateOfBirth),
        isActive: newData.metadata.isActive,
        socialMediaHandles: newData.socialMedia,
        createdAt: newData.metadata.lastUpdated,
        updatedAt: newData.metadata.lastUpdated
      };
    });
  }
  
  /**
   * Load reference data for transformations
   */
  private async loadReferenceData(): Promise<void> {
    try {
      // Load reference data if new system is enabled
      if (this.migrationConfig.enableNewSystem) {
        // This would load actual reference data in a real implementation
        // For now, we'll use placeholder data
        this.referenceData.set('parties', new Map([
          ['NG-PARTY-APC', { id: 'NG-PARTY-APC', name: 'APC', abbreviation: 'APC' }],
          ['NG-PARTY-PDP', { id: 'NG-PARTY-PDP', name: 'PDP', abbreviation: 'PDP' }],
          ['NG-PARTY-LP', { id: 'NG-PARTY-LP', name: 'LP', abbreviation: 'LP' }]
        ]));
        
        this.referenceData.set('states', new Map([
          ['NG-LA', { id: 'NG-LA', name: 'Lagos', code: 'LA' }],
          ['NG-KN', { id: 'NG-KN', name: 'Kano', code: 'KN' }],
          ['NG-RV', { id: 'NG-RV', name: 'Rivers', code: 'RV' }]
        ]));
        
        this.referenceData.set('positions', new Map([
          ['NG-POS-PRESIDENT', { id: 'NG-POS-PRESIDENT', title: 'President', level: 'federal' }],
          ['NG-POS-GOVERNOR', { id: 'NG-POS-GOVERNOR', title: 'Governor', level: 'state' }],
          ['NG-POS-SENATOR', { id: 'NG-POS-SENATOR', title: 'Senator', level: 'federal' }]
        ]));
      }
    } catch (error) {
      console.warn('Failed to load reference data:', error);
    }
  }
  
  /**
   * Register a component with its migration status
   */
  registerComponent(
    componentName: string,
    version: ServiceVersion,
    interfaces: string[],
    migrationStatus: 'legacy' | 'migrating' | 'new' = 'legacy'
  ): void {
    this.registeredComponents.set(componentName, {
      version,
      interfaces,
      migrationStatus
    });
    
    this.migrationConfig.componentMigrationStatus.set(componentName, migrationStatus);
    
    this.emit('componentRegistered', {
      componentName,
      version,
      interfaces,
      migrationStatus
    });
  }
  
  /**
   * Get politicians with backward compatibility
   */
  async getPoliticians(options: {
    useNewInterface?: boolean;
    componentName?: string;
    filters?: any;
    limit?: number;
  } = {}): Promise<LegacyPolitician[] | NewPolitician[]> {
    const startTime = Date.now();
    
    try {
      // Determine which interface to use
      const useNewInterface = this.shouldUseNewInterface('getPoliticians', options);
      
      // Get data from appropriate source
      let data: any[];
      
      if (this.adapterConfig.enableMocking) {
        data = this.getMockData('politicians');
      } else if (useNewInterface && this.migrationConfig.enableNewSystem) {
        data = await this.getDataFromNewSystem('politicians', options);
        this.usageStats.newInterfaceCalls++;
      } else {
        data = await this.getDataFromLegacySystem('politicians', options);
        this.usageStats.legacyInterfaceCalls++;
      }
      
      // Transform data if needed
      if (useNewInterface && data.length > 0 && this.isLegacyData(data[0])) {
        data = data.map(item => this.transformLegacyToNew('politician', item));
        this.usageStats.transformationCalls++;
      } else if (!useNewInterface && data.length > 0 && this.isNewData(data[0])) {
        data = data.map(item => this.transformNewToLegacy('politician', item));
        this.usageStats.transformationCalls++;
      }
      
      // Emit deprecation warning if using legacy interface
      if (!useNewInterface && this.migrationConfig.deprecationWarnings) {
        this.emitDeprecationWarning('getPoliticians', options.componentName);
      }
      
      // Track performance
      const duration = Date.now() - startTime;
      this.emit('interfaceCall', {
        method: 'getPoliticians',
        version: useNewInterface ? 'new' : 'legacy',
        duration,
        resultCount: data.length
      });
      
      return data;
      
    } catch (error) {
      this.emit('interfaceError', {
        method: 'getPoliticians',
        error,
        options
      });
      throw error;
    }
  }
  
  /**
   * Get politician by ID with backward compatibility
   */
  async getPoliticianById(
    id: string,
    options: {
      useNewInterface?: boolean;
      componentName?: string;
    } = {}
  ): Promise<LegacyPolitician | NewPolitician | null> {
    const cacheKey = `politician-${id}-${options.useNewInterface ? 'new' : 'legacy'}`;
    
    // Check cache first
    if (this.adapterConfig.enableCaching) {
      const cached = await intelligentCache.get(cacheKey);
      if (cached) {
        this.usageStats.cacheHits++;
        return cached;
      }
      this.usageStats.cacheMisses++;
    }
    
    try {
      const useNewInterface = this.shouldUseNewInterface('getPoliticianById', options);
      
      let data: any;
      
      if (this.adapterConfig.enableMocking) {
        data = this.getMockData('politicians').find((p: any) => p.id === id);
      } else if (useNewInterface && this.migrationConfig.enableNewSystem) {
        data = await this.getDataFromNewSystem('politician', { id });
        this.usageStats.newInterfaceCalls++;
      } else {
        data = await this.getDataFromLegacySystem('politician', { id });
        this.usageStats.legacyInterfaceCalls++;
      }
      
      if (!data) return null;
      
      // Transform data if needed
      if (useNewInterface && this.isLegacyData(data)) {
        data = this.transformLegacyToNew('politician', data);
        this.usageStats.transformationCalls++;
      } else if (!useNewInterface && this.isNewData(data)) {
        data = this.transformNewToLegacy('politician', data);
        this.usageStats.transformationCalls++;
      }
      
      // Cache result
      if (this.adapterConfig.enableCaching) {
        await intelligentCache.set(cacheKey, data, {
          ttl: 5 * 60 * 1000, // 5 minutes
          tags: ['politician', `politician-${id}`]
        });
      }
      
      return data;
      
    } catch (error) {
      this.emit('interfaceError', {
        method: 'getPoliticianById',
        error,
        id,
        options
      });
      throw error;
    }
  } 
 
  /**
   * Determine whether to use new interface based on configuration and component status
   */
  private shouldUseNewInterface(method: string, options: any): boolean {
    // Check feature flags
    if (method === 'getPoliticians' && this.migrationConfig.featureFlags.get('useNewDataLoader')) {
      return true;
    }
    
    // Check component migration status
    if (options.componentName) {
      const componentStatus = this.migrationConfig.componentMigrationStatus.get(options.componentName);
      if (componentStatus === 'new') return true;
      if (componentStatus === 'legacy') return false;
    }
    
    // Check explicit option
    if (options.useNewInterface !== undefined) {
      return options.useNewInterface;
    }
    
    // Check migration phase
    switch (this.migrationConfig.migrationPhase) {
      case 'preparation':
        return false;
      case 'gradual':
        return Math.random() < 0.5; // 50% chance for gradual rollout
      case 'complete':
        return true;
      default:
        return false;
    }
  }
  
  /**
   * Get data from new system
   */
  private async getDataFromNewSystem(dataType: string, options: any): Promise<any> {
    if (this.migrationConfig.featureFlags.get('useNewDataLoader')) {
      // Use new data loader service
      return await dataLoader.loadData(
        `${dataType}-${JSON.stringify(options)}`,
        async () => {
          // This would call the actual new data service
          return this.fetchFromNewDataService(dataType, options);
        },
        {
          timeout: 10000,
          retries: 2,
          cacheTTL: 5 * 60 * 1000
        }
      );
    } else {
      // Direct call to new data service
      return await this.fetchFromNewDataService(dataType, options);
    }
  }
  
  /**
   * Get data from legacy system
   */
  private async getDataFromLegacySystem(dataType: string, options: any): Promise<any> {
    // This would call the existing legacy data services
    // For now, return mock data
    return this.getMockData(dataType);
  }
  
  /**
   * Fetch from new data service (placeholder)
   */
  private async fetchFromNewDataService(dataType: string, options: any): Promise<any> {
    // This would be the actual implementation calling new JSON-based data services
    // For now, return transformed mock data
    const mockData = this.getMockData(dataType);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    
    return mockData;
  }
  
  /**
   * Get mock data for testing
   */
  private getMockData(dataType: string): any {
    if (!this.mockData.has(dataType)) {
      this.generateMockData(dataType);
    }
    return this.mockData.get(dataType) || [];
  }
  
  /**
   * Generate mock data for testing
   */
  private generateMockData(dataType: string): void {
    switch (dataType) {
      case 'politicians':
        this.mockData.set('politicians', [
          {
            id: '1',
            name: 'John Doe',
            firstName: 'John',
            lastName: 'Doe',
            party: 'APC',
            position: 'Senator',
            state: 'Lagos',
            politicalLevel: 'federal',
            gender: 'male',
            ageGroup: '46-55',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          },
          {
            id: '2',
            name: 'Jane Smith',
            firstName: 'Jane',
            lastName: 'Smith',
            party: 'PDP',
            position: 'Governor',
            state: 'Kano',
            politicalLevel: 'state',
            gender: 'female',
            ageGroup: '36-45',
            isActive: true,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-01-01T00:00:00Z'
          }
        ]);
        break;
      
      case 'politician':
        // Return single politician for ID-based queries
        this.mockData.set('politician', {
          id: '1',
          name: 'John Doe',
          firstName: 'John',
          lastName: 'Doe',
          party: 'APC',
          position: 'Senator',
          state: 'Lagos',
          politicalLevel: 'federal',
          gender: 'male',
          ageGroup: '46-55',
          isActive: true,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        });
        break;
    }
  }
  
  /**
   * Transform legacy data to new format
   */
  private transformLegacyToNew(dataType: string, data: any): any {
    const transformer = this.legacyToNewTransformers.get(dataType);
    if (transformer) {
      return transformer(data);
    }
    return data;
  }
  
  /**
   * Transform new data to legacy format
   */
  private transformNewToLegacy(dataType: string, data: any): any {
    const transformer = this.newToLegacyTransformers.get(dataType);
    if (transformer) {
      return transformer(data);
    }
    return data;
  }
  
  /**
   * Check if data is in legacy format
   */
  private isLegacyData(data: any): boolean {
    // Check for legacy-specific fields
    return data && typeof data.party === 'string' && typeof data.position === 'string';
  }
  
  /**
   * Check if data is in new format
   */
  private isNewData(data: any): boolean {
    // Check for new-specific fields
    return data && typeof data.partyId === 'string' && typeof data.currentPositionId === 'string';
  }
  
  /**
   * Resolve party ID from party name
   */
  private resolvePartyId(partyName: string): string {
    const parties = this.referenceData.get('parties');
    if (parties) {
      for (const [id, party] of parties.entries()) {
        if (party.name === partyName || party.abbreviation === partyName) {
          return id;
        }
      }
    }
    // Fallback: generate ID from name
    return `NG-PARTY-${partyName.toUpperCase()}`;
  }
  
  /**
   * Resolve party name from party ID
   */
  private resolvePartyName(partyId: string): string {
    const parties = this.referenceData.get('parties');
    const party = parties?.get(partyId);
    return party?.abbreviation || party?.name || partyId;
  }
  
  /**
   * Resolve position ID from position name
   */
  private resolvePositionId(positionName: string): string {
    const positions = this.referenceData.get('positions');
    if (positions) {
      for (const [id, position] of positions.entries()) {
        if (position.title === positionName) {
          return id;
        }
      }
    }
    // Fallback: generate ID from name
    return `NG-POS-${positionName.toUpperCase().replace(/\s+/g, '-')}`;
  }
  
  /**
   * Resolve position name from position ID
   */
  private resolvePositionName(positionId: string): string {
    const positions = this.referenceData.get('positions');
    const position = positions?.get(positionId);
    return position?.title || positionId;
  }
  
  /**
   * Resolve state ID from state name
   */
  private resolveStateId(stateName: string): string {
    const states = this.referenceData.get('states');
    if (states) {
      for (const [id, state] of states.entries()) {
        if (state.name === stateName) {
          return id;
        }
      }
    }
    // Fallback: generate ID from name
    return `NG-${stateName.substring(0, 2).toUpperCase()}`;
  }
  
  /**
   * Resolve state name from state ID
   */
  private resolveStateName(stateId: string): string {
    const states = this.referenceData.get('states');
    const state = states?.get(stateId);
    return state?.name || stateId;
  }
  
  /**
   * Infer political level from position ID
   */
  private inferPoliticalLevel(positionId: string): string {
    const positions = this.referenceData.get('positions');
    const position = positions?.get(positionId);
    return position?.level || 'unknown';
  }
  
  /**
   * Calculate age group from date of birth
   */
  private calculateAgeGroup(dateOfBirth: string): string {
    if (!dateOfBirth) return 'unknown';
    
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    
    if (age < 26) return '18-25';
    if (age < 36) return '26-35';
    if (age < 46) return '36-45';
    if (age < 56) return '46-55';
    return '56+';
  }
  
  /**
   * Emit deprecation warning
   */
  private emitDeprecationWarning(method: string, componentName?: string): void {
    const warning = {
      method,
      componentName,
      message: `Legacy interface for ${method} is deprecated. Please migrate to the new interface.`,
      timestamp: Date.now()
    };
    
    this.emit('deprecationWarning', warning);
    
    if (this.migrationConfig.deprecationWarnings) {
      console.warn(`[DEPRECATION WARNING] ${warning.message}`, {
        component: componentName,
        method
      });
    }
  }
  
  /**
   * Update migration configuration
   */
  updateMigrationConfig(updates: Partial<MigrationConfig>): void {
    this.migrationConfig = { ...this.migrationConfig, ...updates };
    this.emit('migrationConfigUpdated', this.migrationConfig);
  }
  
  /**
   * Update adapter configuration
   */
  updateAdapterConfig(updates: Partial<AdapterConfig>): void {
    this.adapterConfig = { ...this.adapterConfig, ...updates };
    this.emit('adapterConfigUpdated', this.adapterConfig);
  }
  
  /**
   * Set feature flag
   */
  setFeatureFlag(flag: string, enabled: boolean): void {
    this.migrationConfig.featureFlags.set(flag, enabled);
    this.emit('featureFlagUpdated', { flag, enabled });
  }
  
  /**
   * Get feature flag status
   */
  getFeatureFlag(flag: string): boolean {
    return this.migrationConfig.featureFlags.get(flag) || false;
  }
  
  /**
   * Enable mock mode for testing
   */
  enableMockMode(mockDataPath?: string): void {
    this.adapterConfig.enableMocking = true;
    this.adapterConfig.mockDataPath = mockDataPath;
    this.emit('mockModeEnabled', { mockDataPath });
  }
  
  /**
   * Disable mock mode
   */
  disableMockMode(): void {
    this.adapterConfig.enableMocking = false;
    this.adapterConfig.mockDataPath = undefined;
    this.emit('mockModeDisabled');
  }
  
  /**
   * Get migration status for a component
   */
  getComponentMigrationStatus(componentName: string): 'legacy' | 'migrating' | 'new' | 'unknown' {
    return this.migrationConfig.componentMigrationStatus.get(componentName) || 'unknown';
  }
  
  /**
   * Update component migration status
   */
  updateComponentMigrationStatus(componentName: string, status: 'legacy' | 'migrating' | 'new'): void {
    this.migrationConfig.componentMigrationStatus.set(componentName, status);
    
    const component = this.registeredComponents.get(componentName);
    if (component) {
      component.migrationStatus = status;
    }
    
    this.emit('componentMigrationStatusUpdated', { componentName, status });
  }
  
  /**
   * Get usage statistics
   */
  getUsageStats(): typeof this.usageStats {
    return { ...this.usageStats };
  }
  
  /**
   * Reset usage statistics
   */
  resetUsageStats(): void {
    this.usageStats = {
      legacyInterfaceCalls: 0,
      newInterfaceCalls: 0,
      transformationCalls: 0,
      cacheHits: 0,
      cacheMisses: 0
    };
    this.emit('usageStatsReset');
  }
  
  /**
   * Get registered components
   */
  getRegisteredComponents(): Map<string, {
    version: ServiceVersion;
    interfaces: string[];
    migrationStatus: 'legacy' | 'migrating' | 'new';
  }> {
    return new Map(this.registeredComponents);
  }
  
  /**
   * Get migration report
   */
  getMigrationReport(): {
    totalComponents: number;
    legacyComponents: number;
    migratingComponents: number;
    newComponents: number;
    migrationProgress: number;
    usageStats: typeof this.usageStats;
    featureFlags: Map<string, boolean>;
  } {
    const components = Array.from(this.registeredComponents.values());
    const legacyComponents = components.filter(c => c.migrationStatus === 'legacy').length;
    const migratingComponents = components.filter(c => c.migrationStatus === 'migrating').length;
    const newComponents = components.filter(c => c.migrationStatus === 'new').length;
    const totalComponents = components.length;
    
    const migrationProgress = totalComponents > 0 ? 
      (migratingComponents * 0.5 + newComponents) / totalComponents : 0;
    
    return {
      totalComponents,
      legacyComponents,
      migratingComponents,
      newComponents,
      migrationProgress,
      usageStats: this.getUsageStats(),
      featureFlags: new Map(this.migrationConfig.featureFlags)
    };
  }
  
  /**
   * Validate data using new validation framework if enabled
   */
  private async validateData(data: any, schemaName: string): Promise<void> {
    if (this.adapterConfig.enableValidation && this.migrationConfig.featureFlags.get('enableDataValidation')) {
      try {
        const result = await dataValidationFramework.validateAllData({
          [schemaName]: { schemaName, data }
        });
        
        if (!result.validationResults.get(schemaName)?.isValid) {
          this.emit('validationWarning', {
            schemaName,
            errors: result.integrityViolations
          });
        }
      } catch (error) {
        this.emit('validationError', { schemaName, error });
      }
    }
  }
}

// Export singleton instance
export const serviceCompatibilityLayer = ServiceCompatibilityLayer.getInstance();
export default ServiceCompatibilityLayer;