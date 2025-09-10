/**
 * Null-Safe Data Validation Service
 * 
 * This service provides comprehensive validation that gracefully handles null/undefined/missing data
 * while maintaining data quality standards and providing meaningful feedback.
 */

import { DYNAMIC_VALIDATION_MESSAGES, VALIDATION_MESSAGES, ValidationMessageUtils } from '../constants/messages/validation-messages';

// Core validation types
export interface ValidationRule {
  field: string;
  type: 'required' | 'optional' | 'conditional';
  validators: ValidatorFunction[];
  priority: 'critical' | 'important' | 'nice-to-have';
  fallbackValue?: any;
  nullHandling: 'strict' | 'lenient' | 'ignore';
}

export interface ValidatorFunction {
  name: string;
  validate: (value: any, context?: ValidationContext) => ValidationResult;
  canHandleNull: boolean;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationContext {
  record: any;
  allData?: any;
  fieldPath: string;
  dataSource: string;
  validationMode: 'strict' | 'lenient' | 'permissive';
}

export interface ValidationResult {
  isValid: boolean;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestedValue?: any;
  confidence: number;
  canAutoFix: boolean;
  dataAvailable: boolean;
  qualityScore: number;
}

export interface FieldValidationResult {
  field: string;
  value: any;
  isPresent: boolean;
  isValid: boolean;
  results: ValidationResult[];
  overallQuality: number;
  dataCompleteness: number;
  suggestions: string[];
}

export interface RecordValidationResult {
  recordId: string;
  recordPath: string;
  isValid: boolean;
  fieldResults: Map<string, FieldValidationResult>;
  overallQuality: number;
  completenessScore: number;
  criticalErrors: number;
  warnings: number;
  missingOptionalFields: number;
  suggestions: string[];
}

export interface DataCompletenessScore {
  overall: number;
  critical: number;
  important: number;
  optional: number;
  breakdown: {
    present: number;
    missing: number;
    invalid: number;
    total: number;
  };
  qualityDistribution: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
    unknown: number;
  };
}

/**
 * Null-Safe Validation Service
 */
export class NullSafeValidationService {
  private static instance: NullSafeValidationService;
  private validationRules = new Map<string, ValidationRule[]>();
  private validators = new Map<string, ValidatorFunction>();
  
  private constructor() {
    this.initializeBuiltInValidators();
    this.initializeDefaultRules();
  }
  
  static getInstance(): NullSafeValidationService {
    if (!NullSafeValidationService.instance) {
      NullSafeValidationService.instance = new NullSafeValidationService();
    }
    return NullSafeValidationService.instance;
  }
  
  /**
   * Initialize built-in validators that handle null values gracefully
   */
  private initializeBuiltInValidators(): void {
    // Required field validator with null handling
    this.registerValidator({
      name: 'required',
      validate: (value: any, context?: ValidationContext): ValidationResult => {
        const isPresent = this.isValuePresent(value);
        
        if (!isPresent) {
          return {
            isValid: false,
            severity: 'error',
            message: ValidationMessageUtils.getRequiredMessage(context?.fieldPath || 'Field'),
            confidence: 1.0,
            canAutoFix: false,
            dataAvailable: false,
            qualityScore: 0
          };
        }
        
        return {
          isValid: true,
          severity: 'info',
          message: 'Field is present',
          confidence: 1.0,
          canAutoFix: false,
          dataAvailable: true,
          qualityScore: 1.0
        };
      },
      canHandleNull: true,
      severity: 'error'
    });
    
    // Optional field validator
    this.registerValidator({
      name: 'optional',
      validate: (value: any, context?: ValidationContext): ValidationResult => {
        const isPresent = this.isValuePresent(value);
        
        return {
          isValid: true,
          severity: 'info',
          message: isPresent ? 'Optional field is present' : 'Optional field is missing (acceptable)',
          confidence: 1.0,
          canAutoFix: false,
          dataAvailable: isPresent,
          qualityScore: isPresent ? 1.0 : 0.5
        };
      },
      canHandleNull: true,
      severity: 'info'
    });
    
    // String length validator with null safety
    this.registerValidator({
      name: 'stringLength',
      validate: (value: any, context?: ValidationContext): ValidationResult => {
        if (!this.isValuePresent(value)) {
          return {
            isValid: true, // Null values are handled by required validator
            severity: 'info',
            message: 'No value to validate length',
            confidence: 1.0,
            canAutoFix: false,
            dataAvailable: false,
            qualityScore: 0
          };
        }
        
        const stringValue = String(value);
        const length = stringValue.length;
        
        // Default constraints (can be overridden)
        const minLength = 1;
        const maxLength = 1000;
        
        if (length < minLength) {
          return {
            isValid: false,
            severity: 'warning',
            message: DYNAMIC_VALIDATION_MESSAGES.minLength(minLength),
            confidence: 1.0,
            canAutoFix: false,
            dataAvailable: true,
            qualityScore: 0.3
          };
        }
        
        if (length > maxLength) {
          return {
            isValid: false,
            severity: 'warning',
            message: DYNAMIC_VALIDATION_MESSAGES.maxLength(maxLength),
            suggestedValue: stringValue.substring(0, maxLength),
            confidence: 0.8,
            canAutoFix: true,
            dataAvailable: true,
            qualityScore: 0.7
          };
        }
        
        return {
          isValid: true,
          severity: 'info',
          message: 'String length is valid',
          confidence: 1.0,
          canAutoFix: false,
          dataAvailable: true,
          qualityScore: 1.0
        };
      },
      canHandleNull: true,
      severity: 'warning'
    });
    
    // Email validator with null safety
    this.registerValidator({
      name: 'email',
      validate: (value: any, context?: ValidationContext): ValidationResult => {
        if (!this.isValuePresent(value)) {
          return {
            isValid: true,
            severity: 'info',
            message: 'No email to validate',
            confidence: 1.0,
            canAutoFix: false,
            dataAvailable: false,
            qualityScore: 0
          };
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isValid = emailRegex.test(String(value));
        
        return {
          isValid,
          severity: isValid ? 'info' : 'error',
          message: isValid ? 'Email format is valid' : VALIDATION_MESSAGES.INVALID_EMAIL,
          confidence: 1.0,
          canAutoFix: false,
          dataAvailable: true,
          qualityScore: isValid ? 1.0 : 0.2
        };
      },
      canHandleNull: true,
      severity: 'error'
    });
    
    // Date validator with null safety
    this.registerValidator({
      name: 'date',
      validate: (value: any, context?: ValidationContext): ValidationResult => {
        if (!this.isValuePresent(value)) {
          return {
            isValid: true,
            severity: 'info',
            message: 'No date to validate',
            confidence: 1.0,
            canAutoFix: false,
            dataAvailable: false,
            qualityScore: 0
          };
        }
        
        const date = new Date(value);
        const isValid = !isNaN(date.getTime());
        
        if (!isValid) {
          return {
            isValid: false,
            severity: 'error',
            message: VALIDATION_MESSAGES.INVALID_DATE,
            confidence: 1.0,
            canAutoFix: false,
            dataAvailable: true,
            qualityScore: 0.1
          };
        }
        
        // Check if date is reasonable (not too far in past/future)
        const now = new Date();
        const yearsDiff = Math.abs(now.getFullYear() - date.getFullYear());
        
        if (yearsDiff > 150) {
          return {
            isValid: false,
            severity: 'error',
            message: 'Date seems unrealistic (too far in past or future)',
            confidence: 0.8,
            canAutoFix: false,
            dataAvailable: true,
            qualityScore: 0.3
          };
        }
        
        return {
          isValid: true,
          severity: 'info',
          message: 'Date is valid',
          confidence: 1.0,
          canAutoFix: false,
          dataAvailable: true,
          qualityScore: 1.0
        };
      },
      canHandleNull: true,
      severity: 'error'
    });
    
    // Foreign key reference validator with null safety
    this.registerValidator({
      name: 'foreignKey',
      validate: (value: any, context?: ValidationContext): ValidationResult => {
        if (!this.isValuePresent(value)) {
          return {
            isValid: true,
            severity: 'info',
            message: 'No foreign key to validate',
            confidence: 1.0,
            canAutoFix: false,
            dataAvailable: false,
            qualityScore: 0
          };
        }
        
        // This would need to be implemented with actual reference data
        // For now, just check if it's a reasonable ID format
        const stringValue = String(value);
        const hasValidFormat = /^[A-Z]{2,}-[A-Z0-9-]+$/i.test(stringValue);
        
        return {
          isValid: hasValidFormat,
          severity: hasValidFormat ? 'info' : 'warning',
          message: hasValidFormat ? 'Foreign key format is valid' : 'Foreign key format may be invalid',
          confidence: hasValidFormat ? 0.8 : 0.6,
          canAutoFix: false,
          dataAvailable: true,
          qualityScore: hasValidFormat ? 0.8 : 0.4
        };
      },
      canHandleNull: true,
      severity: 'warning'
    });
    
    // Enum value validator with null safety
    this.registerValidator({
      name: 'enumValue',
      validate: (value: any, context?: ValidationContext): ValidationResult => {
        if (!this.isValuePresent(value)) {
          return {
            isValid: true,
            severity: 'info',
            message: 'No enum value to validate',
            confidence: 1.0,
            canAutoFix: false,
            dataAvailable: false,
            qualityScore: 0
          };
        }
        
        // This would need to be implemented with actual enum values
        // For now, just check if it's a reasonable string
        const stringValue = String(value);
        const isReasonable = stringValue.length > 0 && stringValue.length < 100;
        
        return {
          isValid: isReasonable,
          severity: isReasonable ? 'info' : 'warning',
          message: isReasonable ? 'Enum value appears valid' : 'Enum value may be invalid',
          confidence: 0.7,
          canAutoFix: false,
          dataAvailable: true,
          qualityScore: isReasonable ? 0.7 : 0.3
        };
      },
      canHandleNull: true,
      severity: 'warning'
    });
  }
  
  /**
   * Initialize default validation rules for common data types
   */
  private initializeDefaultRules(): void {
    // Politician validation rules
    this.registerValidationRules('politician', [
      {
        field: 'id',
        type: 'required',
        validators: [this.validators.get('required')!],
        priority: 'critical',
        nullHandling: 'strict'
      },
      {
        field: 'firstName',
        type: 'required',
        validators: [this.validators.get('required')!, this.validators.get('stringLength')!],
        priority: 'critical',
        nullHandling: 'strict'
      },
      {
        field: 'lastName',
        type: 'required',
        validators: [this.validators.get('required')!, this.validators.get('stringLength')!],
        priority: 'critical',
        nullHandling: 'strict'
      },
      {
        field: 'partyId',
        type: 'optional',
        validators: [this.validators.get('optional')!, this.validators.get('foreignKey')!],
        priority: 'important',
        nullHandling: 'lenient',
        fallbackValue: 'INDEPENDENT'
      },
      {
        field: 'stateOfOriginId',
        type: 'optional',
        validators: [this.validators.get('optional')!, this.validators.get('foreignKey')!],
        priority: 'important',
        nullHandling: 'lenient'
      },
      {
        field: 'dateOfBirth',
        type: 'optional',
        validators: [this.validators.get('optional')!, this.validators.get('date')!],
        priority: 'nice-to-have',
        nullHandling: 'lenient'
      },
      {
        field: 'email',
        type: 'optional',
        validators: [this.validators.get('optional')!, this.validators.get('email')!],
        priority: 'nice-to-have',
        nullHandling: 'lenient'
      }
    ]);
    
    // State validation rules
    this.registerValidationRules('state', [
      {
        field: 'id',
        type: 'required',
        validators: [this.validators.get('required')!],
        priority: 'critical',
        nullHandling: 'strict'
      },
      {
        field: 'name',
        type: 'required',
        validators: [this.validators.get('required')!, this.validators.get('stringLength')!],
        priority: 'critical',
        nullHandling: 'strict'
      },
      {
        field: 'code',
        type: 'required',
        validators: [this.validators.get('required')!, this.validators.get('stringLength')!],
        priority: 'critical',
        nullHandling: 'strict'
      },
      {
        field: 'capital',
        type: 'optional',
        validators: [this.validators.get('optional')!, this.validators.get('stringLength')!],
        priority: 'important',
        nullHandling: 'lenient'
      },
      {
        field: 'population',
        type: 'optional',
        validators: [this.validators.get('optional')!],
        priority: 'nice-to-have',
        nullHandling: 'lenient'
      }
    ]);
    
    // Party validation rules
    this.registerValidationRules('party', [
      {
        field: 'id',
        type: 'required',
        validators: [this.validators.get('required')!],
        priority: 'critical',
        nullHandling: 'strict'
      },
      {
        field: 'name',
        type: 'required',
        validators: [this.validators.get('required')!, this.validators.get('stringLength')!],
        priority: 'critical',
        nullHandling: 'strict'
      },
      {
        field: 'abbreviation',
        type: 'required',
        validators: [this.validators.get('required')!, this.validators.get('stringLength')!],
        priority: 'critical',
        nullHandling: 'strict'
      },
      {
        field: 'founded',
        type: 'optional',
        validators: [this.validators.get('optional')!, this.validators.get('date')!],
        priority: 'nice-to-have',
        nullHandling: 'lenient'
      }
    ]);
  }
  
  /**
   * Register a custom validator
   */
  registerValidator(validator: ValidatorFunction): void {
    this.validators.set(validator.name, validator);
  }
  
  /**
   * Register validation rules for a data type
   */
  registerValidationRules(dataType: string, rules: ValidationRule[]): void {
    this.validationRules.set(dataType, rules);
  }
  
  /**
   * Validate a single record with null-safe handling
   */
  validateRecord(
    record: any,
    dataType: string,
    context: Partial<ValidationContext> = {}
  ): RecordValidationResult {
    const rules = this.validationRules.get(dataType) || [];
    const fieldResults = new Map<string, FieldValidationResult>();
    
    const validationContext: ValidationContext = {
      record,
      fieldPath: context.fieldPath || '',
      dataSource: context.dataSource || dataType,
      validationMode: context.validationMode || 'lenient',
      ...context
    };
    
    let criticalErrors = 0;
    let warnings = 0;
    let missingOptionalFields = 0;
    let totalQuality = 0;
    let totalCompleteness = 0;
    
    // Validate each field according to its rules
    rules.forEach(rule => {
      const fieldResult = this.validateField(record, rule, validationContext);
      fieldResults.set(rule.field, fieldResult);
      
      if (!fieldResult.isValid && rule.priority === 'critical') {
        criticalErrors++;
      }
      
      fieldResult.results.forEach(result => {
        if (result.severity === 'warning') warnings++;
      });
      
      if (!fieldResult.isPresent && rule.type === 'optional') {
        missingOptionalFields++;
      }
      
      totalQuality += fieldResult.overallQuality;
      totalCompleteness += fieldResult.dataCompleteness;
    });
    
    const overallQuality = rules.length > 0 ? totalQuality / rules.length : 1;
    const completenessScore = rules.length > 0 ? totalCompleteness / rules.length : 1;
    
    const suggestions = this.generateRecordSuggestions(fieldResults, rules);
    
    return {
      recordId: record?.id || 'unknown',
      recordPath: validationContext.fieldPath,
      isValid: criticalErrors === 0,
      fieldResults,
      overallQuality,
      completenessScore,
      criticalErrors,
      warnings,
      missingOptionalFields,
      suggestions
    };
  }
  
  /**
   * Validate a single field with null-safe handling
   */
  private validateField(
    record: any,
    rule: ValidationRule,
    context: ValidationContext
  ): FieldValidationResult {
    const value = this.getFieldValue(record, rule.field);
    const isPresent = this.isValuePresent(value);
    
    const fieldContext: ValidationContext = {
      ...context,
      fieldPath: context.fieldPath ? `${context.fieldPath}.${rule.field}` : rule.field
    };
    
    const results: ValidationResult[] = [];
    let overallValid = true;
    
    // Run all validators for this field
    rule.validators.forEach(validator => {
      if (!validator.canHandleNull && !isPresent) {
        // Skip validators that can't handle null values
        return;
      }
      
      const result = validator.validate(value, fieldContext);
      results.push(result);
      
      if (!result.isValid && validator.severity === 'error') {
        overallValid = false;
      }
    });
    
    // For optional fields with important priority, add suggestion if missing
    if (!isPresent && rule.type === 'optional' && rule.priority === 'important') {
      results.push({
        isValid: true, // Still valid since it's optional
        severity: 'info',
        message: `${rule.field} is optional but recommended for better data quality`,
        confidence: 0.5,
        canAutoFix: false,
        dataAvailable: false,
        qualityScore: 0.5
      });
    }
    
    // Calculate overall quality and completeness
    const overallQuality = results.length > 0 
      ? results.reduce((sum, r) => sum + r.qualityScore, 0) / results.length 
      : 0;
    
    const dataCompleteness = isPresent ? 1 : (rule.type === 'required' ? 0 : 0.5);
    
    const suggestions = this.generateFieldSuggestions(results, rule, value, isPresent);
    
    return {
      field: rule.field,
      value,
      isPresent,
      isValid: overallValid,
      results,
      overallQuality,
      dataCompleteness,
      suggestions
    };
  }
  
  /**
   * Calculate data completeness score for a dataset
   */
  calculateCompletenessScore(
    records: any[],
    dataType: string
  ): DataCompletenessScore {
    const rules = this.validationRules.get(dataType) || [];
    
    if (records.length === 0 || rules.length === 0) {
      return this.getEmptyCompletenessScore();
    }
    
    let totalPresent = 0;
    let totalMissing = 0;
    let totalInvalid = 0;
    let totalFields = 0;
    
    let criticalPresent = 0;
    let criticalTotal = 0;
    let importantPresent = 0;
    let importantTotal = 0;
    let optionalPresent = 0;
    let optionalTotal = 0;
    
    const qualityDistribution = {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0,
      unknown: 0
    };
    
    records.forEach(record => {
      const recordResult = this.validateRecord(record, dataType);
      
      // Categorize record quality
      if (recordResult.overallQuality >= 0.9) qualityDistribution.excellent++;
      else if (recordResult.overallQuality >= 0.7) qualityDistribution.good++;
      else if (recordResult.overallQuality >= 0.5) qualityDistribution.fair++;
      else if (recordResult.overallQuality > 0) qualityDistribution.poor++;
      else qualityDistribution.unknown++;
      
      rules.forEach(rule => {
        const fieldResult = recordResult.fieldResults.get(rule.field);
        if (!fieldResult) return;
        
        totalFields++;
        
        if (fieldResult.isPresent) {
          totalPresent++;
          if (fieldResult.isValid) {
            // Field is present and valid
          } else {
            totalInvalid++;
          }
        } else {
          totalMissing++;
        }
        
        // Track by priority
        switch (rule.priority) {
          case 'critical':
            criticalTotal++;
            if (fieldResult.isPresent && fieldResult.isValid) criticalPresent++;
            break;
          case 'important':
            importantTotal++;
            if (fieldResult.isPresent && fieldResult.isValid) importantPresent++;
            break;
          case 'nice-to-have':
            optionalTotal++;
            if (fieldResult.isPresent && fieldResult.isValid) optionalPresent++;
            break;
        }
      });
    });
    
    const overall = totalFields > 0 ? totalPresent / totalFields : 0;
    const critical = criticalTotal > 0 ? criticalPresent / criticalTotal : 1;
    const important = importantTotal > 0 ? importantPresent / importantTotal : 1;
    const optional = optionalTotal > 0 ? optionalPresent / optionalTotal : 1;
    
    return {
      overall,
      critical,
      important,
      optional,
      breakdown: {
        present: totalPresent,
        missing: totalMissing,
        invalid: totalInvalid,
        total: totalFields
      },
      qualityDistribution
    };
  }
  
  /**
   * Generate suggestions for improving data quality
   */
  generateDataQualitySuggestions(
    completenessScore: DataCompletenessScore,
    dataType: string
  ): string[] {
    const suggestions: string[] = [];
    
    if (completenessScore.critical < 0.9) {
      suggestions.push(`Critical fields are ${Math.round(completenessScore.critical * 100)}% complete. Focus on required fields first.`);
    }
    
    if (completenessScore.important < 0.7) {
      suggestions.push(`Important fields are ${Math.round(completenessScore.important * 100)}% complete. Consider improving data collection for key fields.`);
    }
    
    if (completenessScore.breakdown.invalid > 0) {
      const invalidPercentage = Math.round((completenessScore.breakdown.invalid / completenessScore.breakdown.total) * 100);
      suggestions.push(`${invalidPercentage}% of fields have invalid data. Review data validation and cleaning processes.`);
    }
    
    if (completenessScore.qualityDistribution.poor > completenessScore.qualityDistribution.excellent) {
      suggestions.push('More records have poor quality than excellent quality. Consider implementing data quality improvement processes.');
    }
    
    if (completenessScore.overall < 0.5) {
      suggestions.push('Overall data completeness is low. Consider making more fields optional or improving data collection.');
    }
    
    return suggestions;
  }
  
  // Helper methods
  private isValuePresent(value: any): boolean {
    return value !== null && 
           value !== undefined && 
           value !== '' && 
           !(Array.isArray(value) && value.length === 0) &&
           !(typeof value === 'object' && Object.keys(value).length === 0);
  }
  
  private getFieldValue(record: any, fieldPath: string): any {
    return fieldPath.split('.').reduce((obj, key) => obj?.[key], record);
  }
  
  private generateFieldSuggestions(
    results: ValidationResult[],
    rule: ValidationRule,
    value: any,
    isPresent: boolean
  ): string[] {
    const suggestions: string[] = [];
    
    if (!isPresent && rule.type === 'required') {
      suggestions.push(`${rule.field} is required but missing`);
      if (rule.fallbackValue) {
        suggestions.push(`Consider using fallback value: ${rule.fallbackValue}`);
      }
    }
    
    if (!isPresent && rule.type === 'optional' && rule.priority === 'important') {
      suggestions.push(`${rule.field} is optional but recommended for better data quality`);
    }
    
    results.forEach(result => {
      if (result.suggestedValue) {
        suggestions.push(`Consider using: ${result.suggestedValue}`);
      }
      if (result.canAutoFix) {
        suggestions.push(`This field can be automatically corrected`);
      }
    });
    
    return suggestions;
  }
  
  private generateRecordSuggestions(
    fieldResults: Map<string, FieldValidationResult>,
    rules: ValidationRule[]
  ): string[] {
    const suggestions: string[] = [];
    
    const criticalMissing = Array.from(fieldResults.entries())
      .filter(([_, result]) => !result.isPresent && rules.find(r => r.field === result.field)?.priority === 'critical')
      .map(([field, _]) => field);
    
    if (criticalMissing.length > 0) {
      suggestions.push(`Critical fields missing: ${criticalMissing.join(', ')}`);
    }
    
    const autoFixable = Array.from(fieldResults.values())
      .filter(result => result.results.some(r => r.canAutoFix))
      .map(result => result.field);
    
    if (autoFixable.length > 0) {
      suggestions.push(`Fields that can be auto-fixed: ${autoFixable.join(', ')}`);
    }
    
    // Add suggestions from individual fields
    Array.from(fieldResults.values()).forEach(fieldResult => {
      suggestions.push(...fieldResult.suggestions);
    });
    
    return suggestions;
  }
  
  private getEmptyCompletenessScore(): DataCompletenessScore {
    return {
      overall: 0,
      critical: 0,
      important: 0,
      optional: 0,
      breakdown: {
        present: 0,
        missing: 0,
        invalid: 0,
        total: 0
      },
      qualityDistribution: {
        excellent: 0,
        good: 0,
        fair: 0,
        poor: 0,
        unknown: 0
      }
    };
  }
}

// Export singleton instance
export const nullSafeValidator = NullSafeValidationService.getInstance();