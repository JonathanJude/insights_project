/**
 * Comprehensive Data Validation Framework
 * 
 * This framework provides:
 * - JSON schema validation for all data files
 * - Foreign key relationship validation with repair mechanisms
 * - Data integrity monitoring and alerting
 * - Cross-referential validation
 * - Data quality scoring and reporting
 */

import { EventEmitter } from 'events';
import { schemaValidator, type ValidationError, type ValidationResult } from './schema-validator';

// Data integrity types
export interface IntegrityCheck {
  id: string;
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  category: 'schema' | 'reference' | 'consistency' | 'quality';
}

export interface IntegrityViolation {
  checkId: string;
  path: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  value?: any;
  expectedValue?: any;
  repairSuggestion?: string;
  autoRepairable: boolean;
}

export interface DataQualityScore {
  overall: number;
  completeness: number;
  accuracy: number;
  consistency: number;
  validity: number;
  uniqueness: number;
  breakdown: {
    [category: string]: {
      score: number;
      issues: number;
      total: number;
    };
  };
}

export interface ValidationReport {
  timestamp: number;
  dataFiles: string[];
  totalRecords: number;
  validationResults: Map<string, ValidationResult>;
  integrityViolations: IntegrityViolation[];
  qualityScore: DataQualityScore;
  repairActions: RepairAction[];
  summary: {
    errors: number;
    warnings: number;
    infos: number;
    autoRepairableIssues: number;
  };
}

export interface RepairAction {
  id: string;
  type: 'fix' | 'remove' | 'update' | 'add';
  description: string;
  path: string;
  currentValue?: any;
  proposedValue?: any;
  confidence: number;
  dependencies: string[];
}

/**
 * Comprehensive Data Validation Framework
 */
export class DataValidationFramework extends EventEmitter {
  private static instance: DataValidationFramework;
  
  // Integrity checks registry
  private integrityChecks = new Map<string, IntegrityCheck>();
  
  // Reference data for cross-validation
  private referenceData = new Map<string, Map<string, any>>();
  
  // Validation history for trend analysis
  private validationHistory: ValidationReport[] = [];
  private readonly maxHistorySize = 100;
  
  // Auto-repair configuration
  private autoRepairEnabled = false;
  private repairConfidenceThreshold = 0.8;
  
  private constructor() {
    super();
    this.initializeIntegrityChecks();
  }
  
  /**
   * Get singleton instance
   */
  static getInstance(): DataValidationFramework {
    if (!DataValidationFramework.instance) {
      DataValidationFramework.instance = new DataValidationFramework();
    }
    return DataValidationFramework.instance;
  }  
  
/**
   * Initialize built-in integrity checks
   */
  private initializeIntegrityChecks(): void {
    // Schema validation checks
    this.registerIntegrityCheck({
      id: 'schema-validation',
      name: 'JSON Schema Validation',
      description: 'Validates data against JSON schemas',
      severity: 'error',
      category: 'schema'
    });
    
    // Foreign key reference checks
    this.registerIntegrityCheck({
      id: 'foreign-key-references',
      name: 'Foreign Key References',
      description: 'Validates foreign key relationships between data files',
      severity: 'error',
      category: 'reference'
    });
    
    // Data consistency checks
    this.registerIntegrityCheck({
      id: 'data-consistency',
      name: 'Data Consistency',
      description: 'Checks for consistent data across related records',
      severity: 'warning',
      category: 'consistency'
    });
    
    // Uniqueness checks
    this.registerIntegrityCheck({
      id: 'unique-constraints',
      name: 'Unique Constraints',
      description: 'Validates unique field constraints',
      severity: 'error',
      category: 'consistency'
    });
    
    // Data completeness checks
    this.registerIntegrityCheck({
      id: 'data-completeness',
      name: 'Data Completeness',
      description: 'Checks for missing required and recommended fields',
      severity: 'warning',
      category: 'quality'
    });
    
    // Data format checks
    this.registerIntegrityCheck({
      id: 'data-formats',
      name: 'Data Format Validation',
      description: 'Validates data formats (dates, emails, URLs, etc.)',
      severity: 'warning',
      category: 'quality'
    });
  }
  
  /**
   * Register a custom integrity check
   */
  registerIntegrityCheck(check: IntegrityCheck): void {
    this.integrityChecks.set(check.id, check);
    this.emit('integrityCheckRegistered', check);
  }
  
  /**
   * Comprehensive validation of all data files
   */
  async validateAllData(dataFiles: {
    [fileName: string]: {
      schemaName: string;
      data: any;
    };
  }): Promise<ValidationReport> {
    const startTime = Date.now();
    const report: ValidationReport = {
      timestamp: startTime,
      dataFiles: Object.keys(dataFiles),
      totalRecords: 0,
      validationResults: new Map(),
      integrityViolations: [],
      qualityScore: this.initializeQualityScore(),
      repairActions: [],
      summary: { errors: 0, warnings: 0, infos: 0, autoRepairableIssues: 0 }
    };
    
    try {
      // Step 1: Schema validation
      await this.performSchemaValidation(dataFiles, report);
      
      // Step 2: Build reference data
      this.buildReferenceData(dataFiles);
      
      // Step 3: Foreign key validation
      await this.performForeignKeyValidation(dataFiles, report);
      
      // Step 4: Data consistency validation
      await this.performConsistencyValidation(dataFiles, report);
      
      // Step 5: Data quality assessment
      await this.assessDataQuality(dataFiles, report);
      
      // Step 6: Generate repair actions
      await this.generateRepairActions(report);
      
      // Step 7: Calculate summary
      this.calculateSummary(report);
      
      // Store in history
      this.addToHistory(report);
      
      // Emit completion event
      this.emit('validationCompleted', report);
      
      return report;
      
    } catch (error) {
      this.emit('validationError', { error, report });
      throw error;
    }
  }
  
  /**
   * Perform schema validation for all data files
   */
  private async performSchemaValidation(
    dataFiles: { [fileName: string]: { schemaName: string; data: any } },
    report: ValidationReport
  ): Promise<void> {
    for (const [fileName, { schemaName, data }] of Object.entries(dataFiles)) {
      try {
        const result = schemaValidator.validateData(schemaName, data);
        report.validationResults.set(fileName, result);
        
        // Count records
        if (data && typeof data === 'object') {
          const records = this.countRecords(data);
          report.totalRecords += records;
        }
        
        // Convert schema errors to integrity violations
        result.errors.forEach(error => {
          report.integrityViolations.push({
            checkId: 'schema-validation',
            path: `${fileName}${error.path}`,
            message: error.message,
            severity: 'error',
            value: error.value,
            repairSuggestion: this.generateSchemaRepairSuggestion(error),
            autoRepairable: this.isSchemaErrorAutoRepairable(error)
          });
        });
        
        // Convert schema warnings to integrity violations
        result.warnings.forEach(warning => {
          report.integrityViolations.push({
            checkId: 'schema-validation',
            path: `${fileName}${warning.path}`,
            message: warning.message,
            severity: 'warning',
            repairSuggestion: warning.suggestion,
            autoRepairable: false
          });
        });
        
      } catch (error) {
        report.integrityViolations.push({
          checkId: 'schema-validation',
          path: fileName,
          message: `Schema validation failed: ${error}`,
          severity: 'error',
          autoRepairable: false
        });
      }
    }
  }
  
  /**
   * Build reference data for cross-validation
   */
  private buildReferenceData(dataFiles: { [fileName: string]: { schemaName: string; data: any } }): void {
    this.referenceData.clear();
    
    for (const [fileName, { data }] of Object.entries(dataFiles)) {
      const references = new Map<string, any>();
      
      // Extract IDs and build reference maps
      if (data && typeof data === 'object') {
        this.extractReferences(data, references);
        this.referenceData.set(fileName, references);
      }
    }
  }
  
  /**
   * Extract reference IDs from data
   */
  private extractReferences(data: any, references: Map<string, any>, path: string = ''): void {
    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        if (item && typeof item === 'object' && item.id) {
          references.set(item.id, { ...item, _path: `${path}[${index}]` });
        }
        this.extractReferences(item, references, `${path}[${index}]`);
      });
    } else if (data && typeof data === 'object') {
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'id' && typeof value === 'string') {
          references.set(value, { ...data, _path: path });
        } else if (Array.isArray(value) || (value && typeof value === 'object')) {
          this.extractReferences(value, references, path ? `${path}.${key}` : key);
        }
      });
    }
  }
  
  /**
   * Perform foreign key validation
   */
  private async performForeignKeyValidation(
    dataFiles: { [fileName: string]: { schemaName: string; data: any } },
    report: ValidationReport
  ): Promise<void> {
    // Define foreign key relationships
    const foreignKeyMappings = {
      'politicians.json': {
        'partyId': 'parties.json',
        'stateOfOriginId': 'states.json',
        'politicalHistory.*.stateId': 'states.json',
        'politicalHistory.*.partyId': 'parties.json'
      },
      'lgas.json': {
        'stateId': 'states.json'
      },
      'wards.json': {
        'stateId': 'states.json',
        'lgaId': 'lgas.json'
      },
      'polling-units.json': {
        'stateId': 'states.json',
        'lgaId': 'lgas.json',
        'wardId': 'wards.json'
      }
    };
    
    for (const [fileName, mappings] of Object.entries(foreignKeyMappings)) {
      const fileData = dataFiles[fileName];
      if (!fileData) continue;
      
      await this.validateForeignKeys(fileName, fileData.data, mappings, report);
    }
  }
  
  /**
   * Validate foreign keys for a specific file
   */
  private async validateForeignKeys(
    fileName: string,
    data: any,
    mappings: { [field: string]: string },
    report: ValidationReport
  ): Promise<void> {
    if (!data || typeof data !== 'object') return;
    
    const records = this.getRecordsArray(data);
    
    records.forEach((record, index) => {
      Object.entries(mappings).forEach(([fieldPath, referenceFile]) => {
        const value = this.getNestedValue(record, fieldPath);
        
        if (value && typeof value === 'string') {
          const referenceData = this.referenceData.get(referenceFile);
          
          if (!referenceData || !referenceData.has(value)) {
            report.integrityViolations.push({
              checkId: 'foreign-key-references',
              path: `${fileName}[${index}].${fieldPath}`,
              message: `Invalid foreign key reference: ${value} not found in ${referenceFile}`,
              severity: 'error',
              value,
              repairSuggestion: this.generateForeignKeyRepairSuggestion(value, referenceFile),
              autoRepairable: this.isForeignKeyAutoRepairable(value, referenceFile)
            });
          }
        }
      });
    });
  }  
  /*
*
   * Perform data consistency validation
   */
  private async performConsistencyValidation(
    dataFiles: { [fileName: string]: { schemaName: string; data: any } },
    report: ValidationReport
  ): Promise<void> {
    // Check for duplicate IDs within files
    for (const [fileName, { data }] of Object.entries(dataFiles)) {
      await this.checkUniqueConstraints(fileName, data, report);
    }
    
    // Check cross-file consistency
    await this.checkCrossFileConsistency(dataFiles, report);
  }
  
  /**
   * Check unique constraints within a file
   */
  private async checkUniqueConstraints(fileName: string, data: any, report: ValidationReport): Promise<void> {
    if (!data || typeof data !== 'object') return;
    
    const records = this.getRecordsArray(data);
    const idCounts = new Map<string, number>();
    const duplicateIds: string[] = [];
    
    records.forEach((record, index) => {
      if (record && record.id) {
        const count = idCounts.get(record.id) || 0;
        idCounts.set(record.id, count + 1);
        
        if (count > 0 && !duplicateIds.includes(record.id)) {
          duplicateIds.push(record.id);
        }
      }
    });
    
    duplicateIds.forEach(id => {
      report.integrityViolations.push({
        checkId: 'unique-constraints',
        path: `${fileName}`,
        message: `Duplicate ID found: ${id}`,
        severity: 'error',
        value: id,
        repairSuggestion: 'Remove duplicate records or assign unique IDs',
        autoRepairable: false
      });
    });
  }
  
  /**
   * Check cross-file consistency
   */
  private async checkCrossFileConsistency(
    dataFiles: { [fileName: string]: { schemaName: string; data: any } },
    report: ValidationReport
  ): Promise<void> {
    // Check politician-party consistency
    const politiciansData = dataFiles['politicians.json'];
    const partiesData = dataFiles['parties.json'];
    
    if (politiciansData && partiesData) {
      await this.checkPoliticianPartyConsistency(politiciansData.data, partiesData.data, report);
    }
    
    // Check geographic hierarchy consistency
    await this.checkGeographicHierarchyConsistency(dataFiles, report);
  }
  
  /**
   * Check politician-party consistency
   */
  private async checkPoliticianPartyConsistency(
    politiciansData: any,
    partiesData: any,
    report: ValidationReport
  ): Promise<void> {
    const politicians = this.getRecordsArray(politiciansData);
    const parties = this.getRecordsArray(partiesData);
    const partyMap = new Map(parties.map(p => [p.id, p]));
    
    politicians.forEach((politician, index) => {
      if (politician.partyId) {
        const party = partyMap.get(politician.partyId);
        
        // Check if party exists and is active
        if (party && party.metadata?.status === 'inactive') {
          report.integrityViolations.push({
            checkId: 'data-consistency',
            path: `politicians.json[${index}].partyId`,
            message: `Politician ${politician.name} belongs to inactive party ${party.name}`,
            severity: 'warning',
            value: politician.partyId,
            repairSuggestion: 'Update politician party affiliation or reactivate party',
            autoRepairable: false
          });
        }
      }
    });
  }
  
  /**
   * Check geographic hierarchy consistency
   */
  private async checkGeographicHierarchyConsistency(
    dataFiles: { [fileName: string]: { schemaName: string; data: any } },
    report: ValidationReport
  ): Promise<void> {
    const statesData = dataFiles['states.json'];
    const lgasData = dataFiles['lgas.json'];
    const wardsData = dataFiles['wards.json'];
    
    if (lgasData && statesData) {
      const lgas = this.getRecordsArray(lgasData.data);
      const stateIds = new Set(this.getRecordsArray(statesData.data).map(s => s.id));
      
      lgas.forEach((lga, index) => {
        if (lga.stateId && !stateIds.has(lga.stateId)) {
          report.integrityViolations.push({
            checkId: 'data-consistency',
            path: `lgas.json[${index}].stateId`,
            message: `LGA ${lga.name} references non-existent state ${lga.stateId}`,
            severity: 'error',
            value: lga.stateId,
            repairSuggestion: 'Update state reference or add missing state data',
            autoRepairable: false
          });
        }
      });
    }
    
    if (wardsData && lgasData) {
      const wards = this.getRecordsArray(wardsData.data);
      const lgaIds = new Set(this.getRecordsArray(lgasData.data).map(l => l.id));
      
      wards.forEach((ward, index) => {
        if (ward.lgaId && !lgaIds.has(ward.lgaId)) {
          report.integrityViolations.push({
            checkId: 'data-consistency',
            path: `wards.json[${index}].lgaId`,
            message: `Ward ${ward.name} references non-existent LGA ${ward.lgaId}`,
            severity: 'error',
            value: ward.lgaId,
            repairSuggestion: 'Update LGA reference or add missing LGA data',
            autoRepairable: false
          });
        }
      });
    }
  }
  
  /**
   * Assess data quality and calculate scores
   */
  private async assessDataQuality(
    dataFiles: { [fileName: string]: { schemaName: string; data: any } },
    report: ValidationReport
  ): Promise<void> {
    const qualityMetrics = {
      completeness: 0,
      accuracy: 0,
      consistency: 0,
      validity: 0,
      uniqueness: 0
    };
    
    let totalFiles = 0;
    
    for (const [fileName, { data }] of Object.entries(dataFiles)) {
      const fileQuality = await this.assessFileQuality(fileName, data, report);
      
      qualityMetrics.completeness += fileQuality.completeness;
      qualityMetrics.accuracy += fileQuality.accuracy;
      qualityMetrics.consistency += fileQuality.consistency;
      qualityMetrics.validity += fileQuality.validity;
      qualityMetrics.uniqueness += fileQuality.uniqueness;
      
      totalFiles++;
    }
    
    // Calculate averages
    Object.keys(qualityMetrics).forEach(key => {
      qualityMetrics[key as keyof typeof qualityMetrics] /= totalFiles;
    });
    
    // Calculate overall score
    const overall = Object.values(qualityMetrics).reduce((sum, score) => sum + score, 0) / Object.keys(qualityMetrics).length;
    
    report.qualityScore = {
      overall,
      ...qualityMetrics,
      breakdown: this.calculateQualityBreakdown(report)
    };
  }
  
  /**
   * Assess quality for a single file
   */
  private async assessFileQuality(fileName: string, data: any, report: ValidationReport): Promise<{
    completeness: number;
    accuracy: number;
    consistency: number;
    validity: number;
    uniqueness: number;
  }> {
    const records = this.getRecordsArray(data);
    if (records.length === 0) {
      return { completeness: 0, accuracy: 0, consistency: 0, validity: 0, uniqueness: 0 };
    }
    
    // Completeness: percentage of non-null/non-empty fields
    const completeness = this.calculateCompleteness(records);
    
    // Accuracy: based on format validation and schema compliance
    const accuracy = this.calculateAccuracy(fileName, records, report);
    
    // Consistency: based on data consistency violations
    const consistency = this.calculateConsistency(fileName, report);
    
    // Validity: based on schema validation results
    const validity = this.calculateValidity(fileName, report);
    
    // Uniqueness: based on duplicate detection
    const uniqueness = this.calculateUniqueness(records);
    
    return { completeness, accuracy, consistency, validity, uniqueness };
  }
  
  /**
   * Generate repair actions for identified issues
   */
  private async generateRepairActions(report: ValidationReport): Promise<void> {
    const repairActions: RepairAction[] = [];
    
    report.integrityViolations.forEach((violation, index) => {
      if (violation.autoRepairable && violation.repairSuggestion) {
        const action: RepairAction = {
          id: `repair-${index}`,
          type: this.determineRepairType(violation),
          description: violation.repairSuggestion,
          path: violation.path,
          currentValue: violation.value,
          proposedValue: violation.expectedValue,
          confidence: this.calculateRepairConfidence(violation),
          dependencies: []
        };
        
        repairActions.push(action);
      }
    });
    
    report.repairActions = repairActions;
  }
  
  /**
   * Calculate validation summary
   */
  private calculateSummary(report: ValidationReport): void {
    const summary = {
      errors: 0,
      warnings: 0,
      infos: 0,
      autoRepairableIssues: 0
    };
    
    report.integrityViolations.forEach(violation => {
      switch (violation.severity) {
        case 'error':
          summary.errors++;
          break;
        case 'warning':
          summary.warnings++;
          break;
        case 'info':
          summary.infos++;
          break;
      }
      
      if (violation.autoRepairable) {
        summary.autoRepairableIssues++;
      }
    });
    
    report.summary = summary;
  }
  
  // Helper methods
  private countRecords(data: any): number {
    if (Array.isArray(data)) return data.length;
    if (data && typeof data === 'object') {
      return Object.values(data).reduce((count, value) => {
        if (Array.isArray(value)) return count + value.length;
        return count;
      }, 0);
    }
    return 0;
  }
  
  private getRecordsArray(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') {
      const firstArrayValue = Object.values(data).find(value => Array.isArray(value));
      return firstArrayValue as any[] || [];
    }
    return [];
  }
  
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      if (key.includes('*')) {
        // Handle wildcard paths like "politicalHistory.*.stateId"
        const [arrayKey, ...restPath] = key.split('*');
        const array = current?.[arrayKey.replace('.', '')];
        if (Array.isArray(array)) {
          return array.map(item => this.getNestedValue(item, restPath.join('*').substring(1)));
        }
        return undefined;
      }
      return current?.[key];
    }, obj);
  }
  
  private initializeQualityScore(): DataQualityScore {
    return {
      overall: 0,
      completeness: 0,
      accuracy: 0,
      consistency: 0,
      validity: 0,
      uniqueness: 0,
      breakdown: {}
    };
  }  
  
// Quality calculation methods
  private calculateCompleteness(records: any[]): number {
    if (records.length === 0) return 1;
    
    let totalFields = 0;
    let completedFields = 0;
    
    records.forEach(record => {
      if (record && typeof record === 'object') {
        Object.values(record).forEach(value => {
          totalFields++;
          if (value !== null && value !== undefined && value !== '') {
            completedFields++;
          }
        });
      }
    });
    
    return totalFields > 0 ? completedFields / totalFields : 1;
  }
  
  private calculateAccuracy(fileName: string, records: any[], report: ValidationReport): number {
    const validationResult = report.validationResults.get(fileName);
    if (!validationResult) return 1;
    
    const totalRecords = records.length;
    const errorCount = validationResult.errors.length;
    
    return totalRecords > 0 ? Math.max(0, (totalRecords - errorCount) / totalRecords) : 1;
  }
  
  private calculateConsistency(fileName: string, report: ValidationReport): number {
    const consistencyViolations = report.integrityViolations.filter(
      v => v.path.startsWith(fileName) && v.checkId === 'data-consistency'
    );
    
    // Assume good consistency if no violations
    return consistencyViolations.length === 0 ? 1 : Math.max(0, 1 - (consistencyViolations.length * 0.1));
  }
  
  private calculateValidity(fileName: string, report: ValidationReport): number {
    const validationResult = report.validationResults.get(fileName);
    return validationResult?.isValid ? 1 : 0.5;
  }
  
  private calculateUniqueness(records: any[]): number {
    if (records.length === 0) return 1;
    
    const ids = records.map(r => r?.id).filter(Boolean);
    const uniqueIds = new Set(ids);
    
    return ids.length > 0 ? uniqueIds.size / ids.length : 1;
  }
  
  private calculateQualityBreakdown(report: ValidationReport): { [category: string]: { score: number; issues: number; total: number } } {
    const breakdown: { [category: string]: { score: number; issues: number; total: number } } = {};
    
    // Group violations by category
    const categories = ['schema', 'reference', 'consistency', 'quality'];
    
    categories.forEach(category => {
      const categoryViolations = report.integrityViolations.filter(v => {
        const check = this.integrityChecks.get(v.checkId);
        return check?.category === category;
      });
      
      const errorCount = categoryViolations.filter(v => v.severity === 'error').length;
      const warningCount = categoryViolations.filter(v => v.severity === 'warning').length;
      const total = errorCount + warningCount;
      
      // Calculate score based on severity-weighted issues
      const weightedIssues = errorCount * 1.0 + warningCount * 0.5;
      const maxPossibleIssues = report.totalRecords;
      const score = maxPossibleIssues > 0 ? Math.max(0, 1 - (weightedIssues / maxPossibleIssues)) : 1;
      
      breakdown[category] = {
        score,
        issues: total,
        total: report.totalRecords
      };
    });
    
    return breakdown;
  }
  
  // Repair suggestion methods
  private generateSchemaRepairSuggestion(error: ValidationError): string {
    if (error.message.includes('required')) {
      return `Add missing required field: ${error.path}`;
    }
    if (error.message.includes('type')) {
      return `Fix data type for field: ${error.path}`;
    }
    if (error.message.includes('format')) {
      return `Fix format for field: ${error.path}`;
    }
    return `Fix schema validation error at: ${error.path}`;
  }
  
  private generateForeignKeyRepairSuggestion(value: string, referenceFile: string): string {
    // Try to find similar IDs in reference file
    const referenceData = this.referenceData.get(referenceFile);
    if (referenceData) {
      const similarIds = Array.from(referenceData.keys()).filter(id => 
        this.calculateStringSimilarity(id, value) > 0.7
      );
      
      if (similarIds.length > 0) {
        return `Consider using similar ID: ${similarIds[0]} instead of ${value}`;
      }
    }
    
    return `Add missing reference ${value} to ${referenceFile} or update the reference`;
  }
  
  private isSchemaErrorAutoRepairable(error: ValidationError): boolean {
    // Only simple format errors are auto-repairable
    return error.message.includes('format') && !error.message.includes('required');
  }
  
  private isForeignKeyAutoRepairable(value: string, referenceFile: string): boolean {
    // Check if there's a highly similar ID that could be used
    const referenceData = this.referenceData.get(referenceFile);
    if (referenceData) {
      return Array.from(referenceData.keys()).some(id => 
        this.calculateStringSimilarity(id, value) > 0.9
      );
    }
    return false;
  }
  
  private calculateStringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.calculateEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }
  
  private calculateEditDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }
  
  private determineRepairType(violation: IntegrityViolation): 'fix' | 'remove' | 'update' | 'add' {
    if (violation.message.includes('missing') || violation.message.includes('required')) {
      return 'add';
    }
    if (violation.message.includes('duplicate')) {
      return 'remove';
    }
    if (violation.message.includes('invalid') || violation.message.includes('reference')) {
      return 'update';
    }
    return 'fix';
  }
  
  private calculateRepairConfidence(violation: IntegrityViolation): number {
    // Base confidence on violation type and available repair suggestions
    let confidence = 0.5;
    
    if (violation.repairSuggestion?.includes('Consider using similar')) {
      confidence = 0.8;
    } else if (violation.repairSuggestion?.includes('Add missing')) {
      confidence = 0.9;
    } else if (violation.repairSuggestion?.includes('Fix format')) {
      confidence = 0.7;
    }
    
    return confidence;
  }
  
  private addToHistory(report: ValidationReport): void {
    this.validationHistory.push(report);
    
    // Keep only recent history
    if (this.validationHistory.length > this.maxHistorySize) {
      this.validationHistory.shift();
    }
  }
  
  /**
   * Get validation history for trend analysis
   */
  getValidationHistory(limit?: number): ValidationReport[] {
    const history = [...this.validationHistory].reverse();
    return limit ? history.slice(0, limit) : history;
  }
  
  /**
   * Get quality trends over time
   */
  getQualityTrends(): {
    timestamps: number[];
    overall: number[];
    completeness: number[];
    accuracy: number[];
    consistency: number[];
    validity: number[];
    uniqueness: number[];
  } {
    const trends = {
      timestamps: [] as number[],
      overall: [] as number[],
      completeness: [] as number[],
      accuracy: [] as number[],
      consistency: [] as number[],
      validity: [] as number[],
      uniqueness: [] as number[]
    };
    
    this.validationHistory.forEach(report => {
      trends.timestamps.push(report.timestamp);
      trends.overall.push(report.qualityScore.overall);
      trends.completeness.push(report.qualityScore.completeness);
      trends.accuracy.push(report.qualityScore.accuracy);
      trends.consistency.push(report.qualityScore.consistency);
      trends.validity.push(report.qualityScore.validity);
      trends.uniqueness.push(report.qualityScore.uniqueness);
    });
    
    return trends;
  }
  
  /**
   * Enable or disable auto-repair functionality
   */
  setAutoRepairEnabled(enabled: boolean, confidenceThreshold: number = 0.8): void {
    this.autoRepairEnabled = enabled;
    this.repairConfidenceThreshold = confidenceThreshold;
  }
  
  /**
   * Apply auto-repair actions
   */
  async applyRepairActions(report: ValidationReport, actionIds?: string[]): Promise<{
    applied: RepairAction[];
    failed: { action: RepairAction; error: string }[];
  }> {
    const applied: RepairAction[] = [];
    const failed: { action: RepairAction; error: string }[] = [];
    
    const actionsToApply = actionIds 
      ? report.repairActions.filter(action => actionIds.includes(action.id))
      : report.repairActions.filter(action => action.confidence >= this.repairConfidenceThreshold);
    
    for (const action of actionsToApply) {
      try {
        // This would need to be implemented based on specific repair logic
        // For now, just mark as applied
        applied.push(action);
        this.emit('repairActionApplied', action);
      } catch (error) {
        failed.push({ action, error: error instanceof Error ? error.message : 'Unknown error' });
        this.emit('repairActionFailed', { action, error });
      }
    }
    
    return { applied, failed };
  }
}

/**
 * Data Validator Service - Simplified interface for common validation tasks
 */
export class DataValidatorService {
  private static instance: DataValidatorService;
  private framework: DataValidationFramework;
  
  private constructor() {
    this.framework = DataValidationFramework.getInstance();
  }
  
  static getInstance(): DataValidatorService {
    if (!DataValidatorService.instance) {
      DataValidatorService.instance = new DataValidatorService();
    }
    return DataValidatorService.instance;
  }
  
  /**
   * Validate states data
   */
  validateStatesData(data: any): ValidationResult {
    return schemaValidator.validateData('states', data);
  }
  
  /**
   * Validate politicians data
   */
  validatePoliticiansData(data: any): ValidationResult {
    return schemaValidator.validateData('politicians', data);
  }
  
  /**
   * Validate parties data
   */
  validatePartiesData(data: any): ValidationResult {
    return schemaValidator.validateData('parties', data);
  }
  
  /**
   * Validate LGAs data
   */
  validateLGAsData(data: any): ValidationResult {
    return schemaValidator.validateData('lgas', data);
  }
  
  /**
   * Validate wards data
   */
  validateWardsData(data: any): ValidationResult {
    return schemaValidator.validateData('wards', data);
  }
  
  /**
   * Validate polling units data
   */
  validatePollingUnitsData(data: any): ValidationResult {
    return schemaValidator.validateData('polling-units', data);
  }
  
  /**
   * Validate sentiment data
   */
  validateSentimentData(data: any): ValidationResult {
    return schemaValidator.validateData('sentiment-data', data);
  }
  
  /**
   * Validate engagement data
   */
  validateEngagementData(data: any): ValidationResult {
    return schemaValidator.validateData('engagement-metrics', data);
  }
  
  /**
   * Validate topic data
   */
  validateTopicData(data: any): ValidationResult {
    return schemaValidator.validateData('topic-trends', data);
  }
  
  /**
   * Validate election data
   */
  validateElectionData(data: any): ValidationResult {
    return schemaValidator.validateData('election-schedules', data);
  }
  
  /**
   * Validate electoral events data
   */
  validateElectoralEventsData(data: any): ValidationResult {
    return schemaValidator.validateData('electoral-events', data);
  }
  
  /**
   * Validate cross-references between data files
   */
  validateCrossReferences(dataFiles: { [fileName: string]: any }): ValidationResult {
    // Simplified cross-reference validation
    const errors: any[] = [];
    const warnings: any[] = [];
    
    // Check politician references
    if (dataFiles.politicians && dataFiles.parties && dataFiles.states) {
      const politicians = dataFiles.politicians.politicians || [];
      const partyIds = new Set((dataFiles.parties.parties || []).map((p: any) => p.id));
      const stateIds = new Set((dataFiles.states.states || []).map((s: any) => s.id));
      
      politicians.forEach((politician: any, index: number) => {
        if (politician.partyId && !partyIds.has(politician.partyId)) {
          errors.push({
            path: `/politicians/${index}/partyId`,
            message: `Invalid party reference: ${politician.partyId}`,
            value: politician.partyId
          });
        }
        
        if (politician.stateOfOriginId && !stateIds.has(politician.stateOfOriginId)) {
          errors.push({
            path: `/politicians/${index}/stateOfOriginId`,
            message: `Invalid state reference: ${politician.stateOfOriginId}`,
            value: politician.stateOfOriginId
          });
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: errors.length === 0 ? 100 : Math.max(0, 100 - (errors.length * 10))
    };
  }
  
  /**
   * Validate batch of data files
   */
  validateBatch(validations: Array<{
    schemaName: string;
    data: any;
    fileName: string;
  }>): Map<string, ValidationResult> {
    const results = new Map<string, ValidationResult>();
    
    validations.forEach(({ schemaName, data, fileName }) => {
      try {
        const result = schemaValidator.validateData(schemaName, data);
        results.set(fileName, result);
      } catch (error) {
        results.set(fileName, {
          isValid: false,
          errors: [{
            path: '/',
            message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            value: undefined
          }],
          warnings: [],
          score: 0
        });
      }
    });
    
    return results;
  }
}

/**
 * Data Validator Service - Simplified interface for common validation tasks
 */
export class DataValidatorService {
  private static instance: DataValidatorService;
  private framework: DataValidationFramework;
  
  private constructor() {
    this.framework = DataValidationFramework.getInstance();
  }
  
  static getInstance(): DataValidatorService {
    if (!DataValidatorService.instance) {
      DataValidatorService.instance = new DataValidatorService();
    }
    return DataValidatorService.instance;
  }
  
  /**
   * Validate states data
   */
  validateStatesData(data: any): ValidationResult {
    return schemaValidator.validateData('states', data);
  }
  
  /**
   * Validate politicians data
   */
  validatePoliticiansData(data: any): ValidationResult {
    return schemaValidator.validateData('politicians', data);
  }
  
  /**
   * Validate parties data
   */
  validatePartiesData(data: any): ValidationResult {
    return schemaValidator.validateData('parties', data);
  }
  
  /**
   * Validate LGAs data
   */
  validateLGAsData(data: any): ValidationResult {
    return schemaValidator.validateData('lgas', data);
  }
  
  /**
   * Validate wards data
   */
  validateWardsData(data: any): ValidationResult {
    return schemaValidator.validateData('wards', data);
  }
  
  /**
   * Validate polling units data
   */
  validatePollingUnitsData(data: any): ValidationResult {
    return schemaValidator.validateData('polling-units', data);
  }
  
  /**
   * Validate sentiment data
   */
  validateSentimentData(data: any): ValidationResult {
    return schemaValidator.validateData('sentiment-data', data);
  }
  
  /**
   * Validate engagement data
   */
  validateEngagementData(data: any): ValidationResult {
    return schemaValidator.validateData('engagement-metrics', data);
  }
  
  /**
   * Validate topic data
   */
  validateTopicData(data: any): ValidationResult {
    return schemaValidator.validateData('topic-trends', data);
  }
  
  /**
   * Validate election data
   */
  validateElectionData(data: any): ValidationResult {
    return schemaValidator.validateData('election-schedules', data);
  }
  
  /**
   * Validate electoral events data
   */
  validateElectoralEventsData(data: any): ValidationResult {
    return schemaValidator.validateData('electoral-events', data);
  }
  
  /**
   * Validate cross-references between data files
   */
  validateCrossReferences(dataFiles: { [fileName: string]: any }): ValidationResult {
    // Simplified cross-reference validation
    const errors: any[] = [];
    const warnings: any[] = [];
    
    // Check politician references
    if (dataFiles.politicians && dataFiles.parties && dataFiles.states) {
      const politicians = dataFiles.politicians.politicians || [];
      const partyIds = new Set((dataFiles.parties.parties || []).map((p: any) => p.id));
      const stateIds = new Set((dataFiles.states.states || []).map((s: any) => s.id));
      
      politicians.forEach((politician: any, index: number) => {
        if (politician.partyId && !partyIds.has(politician.partyId)) {
          errors.push({
            path: `/politicians/${index}/partyId`,
            message: `Invalid party reference: ${politician.partyId}`,
            value: politician.partyId
          });
        }
        
        if (politician.stateOfOriginId && !stateIds.has(politician.stateOfOriginId)) {
          errors.push({
            path: `/politicians/${index}/stateOfOriginId`,
            message: `Invalid state reference: ${politician.stateOfOriginId}`,
            value: politician.stateOfOriginId
          });
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: errors.length === 0 ? 100 : Math.max(0, 100 - (errors.length * 10))
    };
  }
  
  /**
   * Validate batch of data files
   */
  validateBatch(validations: Array<{
    schemaName: string;
    data: any;
    fileName: string;
  }>): Map<string, ValidationResult> {
    const results = new Map<string, ValidationResult>();
    
    validations.forEach(({ schemaName, data, fileName }) => {
      try {
        const result = schemaValidator.validateData(schemaName, data);
        results.set(fileName, result);
      } catch (error) {
        results.set(fileName, {
          isValid: false,
          errors: [{
            path: '/',
            message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            value: undefined
          }],
          warnings: [],
          score: 0
        });
      }
    });
    
    return results;
  }
}

// Export singleton instance
export const dataValidationFramework = DataValidationFramework.getInstance();
export default DataValidationFramework;