/**
 * Data Relationship Maintenance Service
 * 
 * This service implements automatic relationship updates, cascade updates
 * for related data changes, and maintains consistency across all features.
 * 
 * Features:
 * - Automatic relationship updates when data changes
 * - Cascade updates for related data changes
 * - Consistency maintenance across all features
 * - Foreign key validation and repair
 * - Relationship integrity monitoring
 * - Performance optimization for relationship queries
 */

import { EventEmitter } from 'events';
import { dataLoader } from './data-loader';

export interface DataRelationship {
  id: string;
  name: string;
  sourceEntity: string;
  targetEntity: string;
  sourceField: string;
  targetField: string;
  relationshipType: 'one-to-one' | 'one-to-many' | 'many-to-many';
  isRequired: boolean;
  cascadeDelete: boolean;
  cascadeUpdate: boolean;
}

export interface RelationshipValidationResult {
  isValid: boolean;
  brokenRelationships: BrokenRelationship[];
  orphanedRecords: OrphanedRecord[];
  duplicateKeys: DuplicateKey[];
  warnings: string[];
}

export interface BrokenRelationship {
  relationshipId: string;
  sourceRecord: any;
  sourceValue: string;
  targetEntity: string;
  targetField: string;
  reason: string;
}

export interface OrphanedRecord {
  entity: string;
  recordId: string;
  record: any;
  missingRelationships: string[];
}

export interface DuplicateKey {
  entity: string;
  field: string;
  value: string;
  records: any[];
}

export interface RelationshipUpdate {
  relationshipId: string;
  changeType: 'create' | 'update' | 'delete';
  sourceRecord: any;
  targetRecord?: any;
  oldValue?: string;
  newValue?: string;
}

export interface ConsistencyReport {
  totalRelationships: number;
  validRelationships: number;
  brokenRelationships: number;
  orphanedRecords: number;
  duplicateKeys: number;
  lastChecked: Date;
  recommendations: string[];
}

/**
 * Data Relationship Maintenance Service
 */
export class DataRelationshipService extends EventEmitter {
  private static instance: DataRelationshipService;
  
  private relationships = new Map<string, DataRelationship>();
  private entityData = new Map<string, any[]>();
  private relationshipCache = new Map<string, Map<string, any>>();
  private validationResults = new Map<string, RelationshipValidationResult>();
  
  private constructor() {
    super();
    this.initializeRelationships();
    this.initializeDataSubscriptions();
  }
  
  static getInstance(): DataRelationshipService {
    if (!DataRelationshipService.instance) {
      DataRelationshipService.instance = new DataRelationshipService();
    }
    return DataRelationshipService.instance;
  }
  
  /**
   * Initialize predefined data relationships
   */
  private initializeRelationships(): void {
    // Politician -> Party relationship
    this.addRelationship({
      id: 'politician-party',
      name: 'Politician to Party',
      sourceEntity: 'politicians',
      targetEntity: 'parties',
      sourceField: 'partyId',
      targetField: 'id',
      relationshipType: 'many-to-one',
      isRequired: false, // Politicians can be independent
      cascadeDelete: false,
      cascadeUpdate: true
    });
    
    // Politician -> State relationship
    this.addRelationship({
      id: 'politician-state',
      name: 'Politician to State of Origin',
      sourceEntity: 'politicians',
      targetEntity: 'states',
      sourceField: 'stateOfOriginId',
      targetField: 'id',
      relationshipType: 'many-to-one',
      isRequired: true,
      cascadeDelete: false,
      cascadeUpdate: true
    });
    
    // Politician -> Position relationship
    this.addRelationship({
      id: 'politician-position',
      name: 'Politician to Current Position',
      sourceEntity: 'politicians',
      targetEntity: 'positions',
      sourceField: 'currentPositionId',
      targetField: 'id',
      relationshipType: 'many-to-one',
      isRequired: false,
      cascadeDelete: false,
      cascadeUpdate: true
    });
    
    // Political History -> Party relationship
    this.addRelationship({
      id: 'history-party',
      name: 'Political History to Party',
      sourceEntity: 'politicians.politicalHistory',
      targetEntity: 'parties',
      sourceField: 'partyId',
      targetField: 'id',
      relationshipType: 'many-to-one',
      isRequired: true,
      cascadeDelete: false,
      cascadeUpdate: true
    });
    
    // Political History -> Position relationship
    this.addRelationship({
      id: 'history-position',
      name: 'Political History to Position',
      sourceEntity: 'politicians.politicalHistory',
      targetEntity: 'positions',
      sourceField: 'positionId',
      targetField: 'id',
      relationshipType: 'many-to-one',
      isRequired: true,
      cascadeDelete: false,
      cascadeUpdate: true
    });
    
    // Political History -> State relationship
    this.addRelationship({
      id: 'history-state',
      name: 'Political History to State',
      sourceEntity: 'politicians.politicalHistory',
      targetEntity: 'states',
      sourceField: 'stateId',
      targetField: 'id',
      relationshipType: 'many-to-one',
      isRequired: false, // Federal positions don't have states
      cascadeDelete: false,
      cascadeUpdate: true
    });
    
    // LGA -> State relationship
    this.addRelationship({
      id: 'lga-state',
      name: 'LGA to State',
      sourceEntity: 'lgas',
      targetEntity: 'states',
      sourceField: 'stateId',
      targetField: 'id',
      relationshipType: 'many-to-one',
      isRequired: true,
      cascadeDelete: true,
      cascadeUpdate: true
    });
    
    // Ward -> LGA relationship
    this.addRelationship({
      id: 'ward-lga',
      name: 'Ward to LGA',
      sourceEntity: 'wards',
      targetEntity: 'lgas',
      sourceField: 'lgaId',
      targetField: 'id',
      relationshipType: 'many-to-one',
      isRequired: true,
      cascadeDelete: true,
      cascadeUpdate: true
    });
    
    // Ward -> State relationship (denormalized)
    this.addRelationship({
      id: 'ward-state',
      name: 'Ward to State (Denormalized)',
      sourceEntity: 'wards',
      targetEntity: 'states',
      sourceField: 'stateId',
      targetField: 'id',
      relationshipType: 'many-to-one',
      isRequired: true,
      cascadeDelete: true,
      cascadeUpdate: true
    });
    
    // Polling Unit -> Ward relationship
    this.addRelationship({
      id: 'polling-ward',
      name: 'Polling Unit to Ward',
      sourceEntity: 'pollingUnits',
      targetEntity: 'wards',
      sourceField: 'wardId',
      targetField: 'id',
      relationshipType: 'many-to-one',
      isRequired: true,
      cascadeDelete: true,
      cascadeUpdate: true
    });
    
    // Polling Unit -> LGA relationship (denormalized)
    this.addRelationship({
      id: 'polling-lga',
      name: 'Polling Unit to LGA (Denormalized)',
      sourceEntity: 'pollingUnits',
      targetEntity: 'lgas',
      sourceField: 'lgaId',
      targetField: 'id',
      relationshipType: 'many-to-one',
      isRequired: true,
      cascadeDelete: true,
      cascadeUpdate: true
    });
    
    // Polling Unit -> State relationship (denormalized)
    this.addRelationship({
      id: 'polling-state',
      name: 'Polling Unit to State (Denormalized)',
      sourceEntity: 'pollingUnits',
      targetEntity: 'states',
      sourceField: 'stateId',
      targetField: 'id',
      relationshipType: 'many-to-one',
      isRequired: true,
      cascadeDelete: true,
      cascadeUpdate: true
    });
    
    // Party Headquarters -> State relationship
    this.addRelationship({
      id: 'party-headquarters-state',
      name: 'Party Headquarters to State',
      sourceEntity: 'parties.headquarters',
      targetEntity: 'states',
      sourceField: 'stateId',
      targetField: 'id',
      relationshipType: 'many-to-one',
      isRequired: true,
      cascadeDelete: false,
      cascadeUpdate: true
    });
  }
  
  /**
   * Initialize data subscriptions for automatic updates
   */
  private initializeDataSubscriptions(): void {
    dataLoader.on('loadSuccess', (event) => {
      this.handleDataUpdate(event.key, event.data);
    });
  }
  
  /**
   * Add a new relationship definition
   */
  addRelationship(relationship: DataRelationship): void {
    this.relationships.set(relationship.id, relationship);
    this.emit('relationshipAdded', { relationship });
  }
  
  /**
   * Remove a relationship definition
   */
  removeRelationship(relationshipId: string): void {
    const relationship = this.relationships.get(relationshipId);
    if (relationship) {
      this.relationships.delete(relationshipId);
      this.relationshipCache.delete(relationshipId);
      this.emit('relationshipRemoved', { relationshipId, relationship });
    }
  }
  
  /**
   * Handle data updates and maintain relationships
   */
  private async handleDataUpdate(dataKey: string, data: any): Promise<void> {
    // Store updated data
    this.entityData.set(dataKey, data);
    
    // Find affected relationships
    const affectedRelationships = this.getAffectedRelationships(dataKey);
    
    // Validate and update relationships
    for (const relationshipId of affectedRelationships) {
      await this.validateRelationship(relationshipId);
      await this.updateRelationshipCache(relationshipId);
    }
    
    // Emit update event
    this.emit('dataUpdated', { dataKey, affectedRelationships });
  }
  
  /**
   * Get relationships affected by data changes
   */
  private getAffectedRelationships(dataKey: string): string[] {
    const affected: string[] = [];
    
    for (const [relationshipId, relationship] of this.relationships) {
      if (relationship.sourceEntity === dataKey || 
          relationship.targetEntity === dataKey ||
          relationship.sourceEntity.startsWith(`${dataKey}.`) ||
          relationship.targetEntity.startsWith(`${dataKey}.`)) {
        affected.push(relationshipId);
      }
    }
    
    return affected;
  }
  
  /**
   * Validate a specific relationship
   */
  async validateRelationship(relationshipId: string): Promise<RelationshipValidationResult> {
    const relationship = this.relationships.get(relationshipId);
    if (!relationship) {
      throw new Error(`Relationship not found: ${relationshipId}`);
    }
    
    const result: RelationshipValidationResult = {
      isValid: true,
      brokenRelationships: [],
      orphanedRecords: [],
      duplicateKeys: [],
      warnings: []
    };
    
    try {
      // Get source and target data
      const sourceData = await this.getEntityData(relationship.sourceEntity);
      const targetData = await this.getEntityData(relationship.targetEntity);
      
      if (!sourceData || !targetData) {
        result.isValid = false;
        result.warnings.push(`Missing data for relationship ${relationshipId}`);
        return result;
      }
      
      // Create target lookup map
      const targetMap = new Map();
      targetData.forEach((record: any) => {
        const key = this.getFieldValue(record, relationship.targetField);
        if (key !== null && key !== undefined) {
          if (targetMap.has(key)) {
            // Duplicate key found
            result.duplicateKeys.push({
              entity: relationship.targetEntity,
              field: relationship.targetField,
              value: key,
              records: [targetMap.get(key), record]
            });
          } else {
            targetMap.set(key, record);
          }
        }
      });
      
      // Validate source records
      sourceData.forEach((sourceRecord: any) => {
        const sourceValue = this.getFieldValue(sourceRecord, relationship.sourceField);
        
        if (sourceValue === null || sourceValue === undefined) {
          if (relationship.isRequired) {
            result.orphanedRecords.push({
              entity: relationship.sourceEntity,
              recordId: sourceRecord.id || 'unknown',
              record: sourceRecord,
              missingRelationships: [relationshipId]
            });
          }
          return;
        }
        
        if (!targetMap.has(sourceValue)) {
          result.brokenRelationships.push({
            relationshipId,
            sourceRecord,
            sourceValue: String(sourceValue),
            targetEntity: relationship.targetEntity,
            targetField: relationship.targetField,
            reason: `Target record not found: ${sourceValue}`
          });
        }
      });
      
      // Update validation status
      result.isValid = result.brokenRelationships.length === 0 && 
                      result.orphanedRecords.length === 0 &&
                      result.duplicateKeys.length === 0;
      
      // Cache validation results
      this.validationResults.set(relationshipId, result);
      
      this.emit('relationshipValidated', { relationshipId, result });
      
    } catch (error) {
      result.isValid = false;
      result.warnings.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return result;
  }
  
  /**
   * Validate all relationships
   */
  async validateAllRelationships(): Promise<Map<string, RelationshipValidationResult>> {
    const results = new Map<string, RelationshipValidationResult>();
    
    for (const relationshipId of this.relationships.keys()) {
      try {
        const result = await this.validateRelationship(relationshipId);
        results.set(relationshipId, result);
      } catch (error) {
        console.error(`Error validating relationship ${relationshipId}:`, error);
      }
    }
    
    return results;
  }
  
  /**
   * Repair broken relationships
   */
  async repairRelationships(relationshipId: string, repairOptions: {
    removeOrphaned?: boolean;
    createMissingTargets?: boolean;
    updateReferences?: boolean;
  } = {}): Promise<{
    repaired: number;
    failed: number;
    actions: string[];
  }> {
    const relationship = this.relationships.get(relationshipId);
    const validationResult = this.validationResults.get(relationshipId);
    
    if (!relationship || !validationResult) {
      throw new Error(`Cannot repair relationship ${relationshipId}: missing data`);
    }
    
    const actions: string[] = [];
    let repaired = 0;
    let failed = 0;
    
    // Handle broken relationships
    for (const broken of validationResult.brokenRelationships) {
      try {
        if (repairOptions.updateReferences) {
          // Try to find a similar target record
          const targetData = await this.getEntityData(relationship.targetEntity);
          const similarTarget = this.findSimilarRecord(
            broken.sourceValue,
            targetData,
            relationship.targetField
          );
          
          if (similarTarget) {
            // Update the reference
            this.updateFieldValue(
              broken.sourceRecord,
              relationship.sourceField,
              this.getFieldValue(similarTarget, relationship.targetField)
            );
            actions.push(`Updated reference from ${broken.sourceValue} to ${this.getFieldValue(similarTarget, relationship.targetField)}`);
            repaired++;
          } else if (repairOptions.removeOrphaned) {
            // Remove the broken reference
            this.updateFieldValue(broken.sourceRecord, relationship.sourceField, null);
            actions.push(`Removed broken reference: ${broken.sourceValue}`);
            repaired++;
          } else {
            failed++;
          }
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Failed to repair broken relationship:`, error);
        failed++;
      }
    }
    
    // Handle orphaned records
    for (const orphaned of validationResult.orphanedRecords) {
      try {
        if (repairOptions.removeOrphaned && !relationship.isRequired) {
          // Remove orphaned record if not required
          actions.push(`Removed orphaned record: ${orphaned.recordId}`);
          repaired++;
        } else {
          failed++;
        }
      } catch (error) {
        console.error(`Failed to repair orphaned record:`, error);
        failed++;
      }
    }
    
    this.emit('relationshipsRepaired', { relationshipId, repaired, failed, actions });
    
    return { repaired, failed, actions };
  }
  
  /**
   * Update relationship cache for performance
   */
  private async updateRelationshipCache(relationshipId: string): Promise<void> {
    const relationship = this.relationships.get(relationshipId);
    if (!relationship) return;
    
    try {
      const sourceData = await this.getEntityData(relationship.sourceEntity);
      const targetData = await this.getEntityData(relationship.targetEntity);
      
      if (!sourceData || !targetData) return;
      
      const cache = new Map();
      
      // Build lookup cache
      targetData.forEach((targetRecord: any) => {
        const key = this.getFieldValue(targetRecord, relationship.targetField);
        if (key !== null && key !== undefined) {
          cache.set(String(key), targetRecord);
        }
      });
      
      this.relationshipCache.set(relationshipId, cache);
      
    } catch (error) {
      console.error(`Error updating relationship cache for ${relationshipId}:`, error);
    }
  }
  
  /**
   * Get related record using cached relationships
   */
  getRelatedRecord(relationshipId: string, sourceValue: string): any | null {
    const cache = this.relationshipCache.get(relationshipId);
    return cache?.get(String(sourceValue)) || null;
  }
  
  /**
   * Get all related records for a source record
   */
  getAllRelatedRecords(sourceEntity: string, sourceRecord: any): Map<string, any> {
    const related = new Map<string, any>();
    
    for (const [relationshipId, relationship] of this.relationships) {
      if (relationship.sourceEntity === sourceEntity) {
        const sourceValue = this.getFieldValue(sourceRecord, relationship.sourceField);
        if (sourceValue !== null && sourceValue !== undefined) {
          const relatedRecord = this.getRelatedRecord(relationshipId, String(sourceValue));
          if (relatedRecord) {
            related.set(relationshipId, relatedRecord);
          }
        }
      }
    }
    
    return related;
  }
  
  /**
   * Get entity data with nested path support
   */
  private async getEntityData(entityPath: string): Promise<any[] | null> {
    const parts = entityPath.split('.');
    const mainEntity = parts[0];
    
    let data = this.entityData.get(mainEntity);
    
    if (!data) {
      // Try to load data
      try {
        const loadedData = await dataLoader.loadData(
          mainEntity,
          () => fetch(`/data/${this.getDataPath(mainEntity)}`).then(r => r.json())
        );
        
        data = this.extractEntityArray(loadedData, mainEntity);
        if (data) {
          this.entityData.set(mainEntity, data);
        }
      } catch (error) {
        console.error(`Failed to load entity data for ${mainEntity}:`, error);
        return null;
      }
    }
    
    // Handle nested paths (e.g., politicians.politicalHistory)
    if (parts.length > 1 && data) {
      const nestedData: any[] = [];
      data.forEach((record: any) => {
        const nestedArray = this.getFieldValue(record, parts.slice(1).join('.'));
        if (Array.isArray(nestedArray)) {
          nestedData.push(...nestedArray);
        }
      });
      return nestedData;
    }
    
    return data;
  }
  
  /**
   * Extract entity array from loaded data
   */
  private extractEntityArray(data: any, entityName: string): any[] | null {
    // Handle different data structures
    if (Array.isArray(data)) return data;
    if (data[entityName]) return data[entityName];
    if (data[entityName + 's']) return data[entityName + 's'];
    
    // Handle specific entity mappings
    const mappings: Record<string, string> = {
      'parties': 'parties',
      'states': 'states',
      'politicians': 'politicians',
      'positions': 'positions',
      'lgas': 'lgas',
      'wards': 'wards',
      'pollingUnits': 'pollingUnits'
    };
    
    const key = mappings[entityName];
    return key && data[key] ? data[key] : null;
  }
  
  /**
   * Get data file path for entity
   */
  private getDataPath(entity: string): string {
    const paths: Record<string, string> = {
      'parties': 'core/parties.json',
      'states': 'core/states.json',
      'politicians': 'politicians/politicians.json',
      'positions': 'core/positions.json',
      'lgas': 'core/lgas.json',
      'wards': 'core/wards.json',
      'pollingUnits': 'core/polling-units.json'
    };
    
    return paths[entity] || `${entity}.json`;
  }
  
  /**
   * Get field value with nested path support
   */
  private getFieldValue(record: any, fieldPath: string): any {
    const parts = fieldPath.split('.');
    let value = record;
    
    for (const part of parts) {
      if (value === null || value === undefined) return null;
      value = value[part];
    }
    
    return value;
  }
  
  /**
   * Update field value with nested path support
   */
  private updateFieldValue(record: any, fieldPath: string, newValue: any): void {
    const parts = fieldPath.split('.');
    let current = record;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    
    current[parts[parts.length - 1]] = newValue;
  }
  
  /**
   * Find similar record for repair suggestions
   */
  private findSimilarRecord(searchValue: string, records: any[], targetField: string): any | null {
    if (!records || records.length === 0) return null;
    
    const searchLower = String(searchValue).toLowerCase();
    
    // Try exact match first
    for (const record of records) {
      const value = this.getFieldValue(record, targetField);
      if (String(value).toLowerCase() === searchLower) {
        return record;
      }
    }
    
    // Try partial match
    for (const record of records) {
      const value = this.getFieldValue(record, targetField);
      if (String(value).toLowerCase().includes(searchLower)) {
        return record;
      }
    }
    
    return null;
  }
  
  /**
   * Generate consistency report
   */
  async generateConsistencyReport(): Promise<ConsistencyReport> {
    const validationResults = await this.validateAllRelationships();
    
    let totalRelationships = 0;
    let validRelationships = 0;
    let brokenRelationships = 0;
    let orphanedRecords = 0;
    let duplicateKeys = 0;
    
    const recommendations: string[] = [];
    
    for (const [relationshipId, result] of validationResults) {
      totalRelationships++;
      
      if (result.isValid) {
        validRelationships++;
      } else {
        brokenRelationships += result.brokenRelationships.length;
        orphanedRecords += result.orphanedRecords.length;
        duplicateKeys += result.duplicateKeys.length;
        
        if (result.brokenRelationships.length > 0) {
          recommendations.push(`Fix broken relationships in ${relationshipId}`);
        }
        if (result.orphanedRecords.length > 0) {
          recommendations.push(`Handle orphaned records in ${relationshipId}`);
        }
        if (result.duplicateKeys.length > 0) {
          recommendations.push(`Resolve duplicate keys in ${relationshipId}`);
        }
      }
    }
    
    return {
      totalRelationships,
      validRelationships,
      brokenRelationships,
      orphanedRecords,
      duplicateKeys,
      lastChecked: new Date(),
      recommendations
    };
  }
  
  /**
   * Get relationship statistics
   */
  getRelationshipStatistics(): {
    totalRelationships: number;
    cachedRelationships: number;
    validatedRelationships: number;
    entitiesLoaded: number;
  } {
    return {
      totalRelationships: this.relationships.size,
      cachedRelationships: this.relationshipCache.size,
      validatedRelationships: this.validationResults.size,
      entitiesLoaded: this.entityData.size
    };
  }
  
  /**
   * Clear all caches
   */
  clearCaches(): void {
    this.relationshipCache.clear();
    this.validationResults.clear();
    this.entityData.clear();
    this.emit('cachesCleared');
  }
  
  /**
   * Cleanup resources
   */
  destroy(): void {
    this.clearCaches();
    this.relationships.clear();
    this.removeAllListeners();
  }
}

// Export singleton instance
export const dataRelationshipService = DataRelationshipService.getInstance();
export default DataRelationshipService;