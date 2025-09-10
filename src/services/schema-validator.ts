import Ajv, { ErrorObject, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

// Schema imports
import partiesSchema from '../schemas/core/parties.schema.json';
import statesSchema from '../schemas/core/states.schema.json';
import politiciansSchema from '../schemas/politicians/politicians.schema.json';
import sentimentSourcesSchema from '../schemas/sentiment/sentiment-sources.schema.json';

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  schemaVersion: string;
}

export interface ValidationError {
  path: string;
  message: string;
  value?: any;
  schemaPath: string;
}

export interface ValidationWarning {
  path: string;
  message: string;
  suggestion?: string;
}

export interface SchemaInfo {
  id: string;
  version: string;
  title: string;
  description: string;
}

export class SchemaValidatorService {
  private static instance: SchemaValidatorService;
  private ajv: Ajv;
  private validators: Map<string, ValidateFunction> = new Map();
  private schemas: Map<string, any> = new Map();

  private constructor() {
    this.ajv = new Ajv({
      allErrors: true,
      verbose: true,
      strict: false,
      validateFormats: true
    });
    
    // Add format validation
    addFormats(this.ajv);
    
    this.initializeSchemas();
  }

  public static getInstance(): SchemaValidatorService {
    if (!SchemaValidatorService.instance) {
      SchemaValidatorService.instance = new SchemaValidatorService();
    }
    return SchemaValidatorService.instance;
  }

  private initializeSchemas(): void {
    // Register all schemas
    this.registerSchema('states', statesSchema);
    this.registerSchema('parties', partiesSchema);
    this.registerSchema('politicians', politiciansSchema);
    this.registerSchema('sentiment-sources', sentimentSourcesSchema);
  }

  private registerSchema(name: string, schema: any): void {
    try {
      const validator = this.ajv.compile(schema);
      this.validators.set(name, validator);
      this.schemas.set(name, schema);
      console.log(`Schema registered: ${name} v${schema.version}`);
    } catch (error) {
      console.error(`Failed to register schema ${name}:`, error);
      throw new Error(`Schema registration failed for ${name}: ${error}`);
    }
  }

  public validateData(schemaName: string, data: any): ValidationResult {
    const validator = this.validators.get(schemaName);
    const schema = this.schemas.get(schemaName);
    
    if (!validator || !schema) {
      throw new Error(`Schema not found: ${schemaName}`);
    }

    const isValid = validator(data);
    const errors = this.formatErrors(validator.errors || []);
    const warnings = this.generateWarnings(schemaName, data);

    return {
      isValid,
      errors,
      warnings,
      schemaVersion: schema.version
    };
  }

  private formatErrors(ajvErrors: ErrorObject[]): ValidationError[] {
    return ajvErrors.map(error => ({
      path: error.instancePath || 'root',
      message: error.message || 'Unknown validation error',
      value: error.data,
      schemaPath: error.schemaPath
    }));
  }

  private generateWarnings(schemaName: string, data: any): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];
    
    // Generate context-specific warnings
    switch (schemaName) {
      case 'states':
        warnings.push(...this.generateStatesWarnings(data));
        break;
      case 'parties':
        warnings.push(...this.generatePartiesWarnings(data));
        break;
      case 'politicians':
        warnings.push(...this.generatePoliticiansWarnings(data));
        break;
    }

    return warnings;
  }

  private generateStatesWarnings(data: any): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];
    
    if (data.states) {
      data.states.forEach((state: any, index: number) => {
        // Check for missing optional but recommended fields
        if (!state.population) {
          warnings.push({
            path: `states[${index}].population`,
            message: 'Population data is missing',
            suggestion: 'Consider adding population data for better analytics'
          });
        }
        
        if (!state.metadata?.area_km2) {
          warnings.push({
            path: `states[${index}].metadata.area_km2`,
            message: 'Area data is missing',
            suggestion: 'Consider adding area data for geographic analysis'
          });
        }
      });
    }

    return warnings;
  }

  private generatePartiesWarnings(data: any): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];
    
    if (data.parties) {
      data.parties.forEach((party: any, index: number) => {
        // Check for missing optional but recommended fields
        if (!party.founded) {
          warnings.push({
            path: `parties[${index}].founded`,
            message: 'Founded date is missing',
            suggestion: 'Consider adding founding date for historical context'
          });
        }
        
        if (!party.logo) {
          warnings.push({
            path: `parties[${index}].logo`,
            message: 'Party logo is missing',
            suggestion: 'Consider adding logo path for better UI representation'
          });
        }
      });
    }

    return warnings;
  }

  private generatePoliticiansWarnings(data: any): ValidationWarning[] {
    const warnings: ValidationWarning[] = [];
    
    if (data.politicians) {
      data.politicians.forEach((politician: any, index: number) => {
        // Check for missing optional but recommended fields
        if (!politician.dateOfBirth) {
          warnings.push({
            path: `politicians[${index}].dateOfBirth`,
            message: 'Date of birth is missing',
            suggestion: 'Consider adding birth date for demographic analysis'
          });
        }
        
        if (!politician.stateOfOriginId) {
          warnings.push({
            path: `politicians[${index}].stateOfOriginId`,
            message: 'State of origin is missing',
            suggestion: 'Consider adding state of origin for geographic analysis'
          });
        }

        if (!politician.socialMedia || Object.keys(politician.socialMedia).length === 0) {
          warnings.push({
            path: `politicians[${index}].socialMedia`,
            message: 'Social media information is missing',
            suggestion: 'Consider adding social media handles for sentiment analysis'
          });
        }
      });
    }

    return warnings;
  }

  public getSchemaInfo(schemaName: string): SchemaInfo | null {
    const schema = this.schemas.get(schemaName);
    if (!schema) return null;

    return {
      id: schema.$id,
      version: schema.version,
      title: schema.title,
      description: schema.description
    };
  }

  public getAllSchemas(): string[] {
    return Array.from(this.schemas.keys());
  }

  public validateSchemaVersion(schemaName: string, expectedVersion: string): boolean {
    const schema = this.schemas.get(schemaName);
    return schema?.version === expectedVersion;
  }

  // Batch validation for multiple data files
  public validateBatch(validations: Array<{ schemaName: string; data: any; fileName?: string }>): Map<string, ValidationResult> {
    const results = new Map<string, ValidationResult>();
    
    validations.forEach(({ schemaName, data, fileName }) => {
      const key = fileName || schemaName;
      try {
        results.set(key, this.validateData(schemaName, data));
      } catch (error) {
        results.set(key, {
          isValid: false,
          errors: [{
            path: 'root',
            message: `Validation failed: ${error}`,
            schemaPath: 'root'
          }],
          warnings: [],
          schemaVersion: 'unknown'
        });
      }
    });

    return results;
  }

  // Cross-reference validation for foreign keys
  public validateCrossReferences(data: { states?: any; parties?: any; politicians?: any }): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Extract IDs for reference checking
    const stateIds = new Set(data.states?.states?.map((s: any) => s.id) || []);
    const partyIds = new Set(data.parties?.parties?.map((p: any) => p.id) || []);

    // Validate politician references
    if (data.politicians?.politicians) {
      data.politicians.politicians.forEach((politician: any, index: number) => {
        // Check party reference
        if (politician.partyId && !partyIds.has(politician.partyId)) {
          errors.push({
            path: `politicians[${index}].partyId`,
            message: `Invalid party reference: ${politician.partyId}`,
            value: politician.partyId,
            schemaPath: 'politicians/partyId'
          });
        }

        // Check state of origin reference
        if (politician.stateOfOriginId && !stateIds.has(politician.stateOfOriginId)) {
          errors.push({
            path: `politicians[${index}].stateOfOriginId`,
            message: `Invalid state reference: ${politician.stateOfOriginId}`,
            value: politician.stateOfOriginId,
            schemaPath: 'politicians/stateOfOriginId'
          });
        }

        // Check political history state references
        if (politician.politicalHistory) {
          politician.politicalHistory.forEach((history: any, histIndex: number) => {
            if (history.stateId && !stateIds.has(history.stateId)) {
              errors.push({
                path: `politicians[${index}].politicalHistory[${histIndex}].stateId`,
                message: `Invalid state reference in political history: ${history.stateId}`,
                value: history.stateId,
                schemaPath: 'politicians/politicalHistory/stateId'
              });
            }
          });
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      schemaVersion: '1.0.0'
    };
  }
}

// Export singleton instance
export const schemaValidator = SchemaValidatorService.getInstance();