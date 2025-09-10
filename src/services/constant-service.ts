import {
    AllEnumHelpers,
    AllEnumValidators,
    ChartTypes,
    ColorSchemes,
    DaysOfWeek,
    ErrorTypes,
    LoadingStates,
    Months,
    NigerianRegions,
    SentimentLabels,
    SentimentUtils,
    SystemUtils
} from '../constants/enums';

export interface EnumValidationResult {
  isValid: boolean;
  enumType: string;
  value: string;
  suggestions?: string[];
}

export interface ConstantServiceConfig {
  enableValidation: boolean;
  enableSuggestions: boolean;
  cacheResults: boolean;
}

export class ConstantService {
  private static instance: ConstantService;
  private config: ConstantServiceConfig;
  private validationCache: Map<string, EnumValidationResult> = new Map();

  private constructor(config: Partial<ConstantServiceConfig> = {}) {
    this.config = {
      enableValidation: true,
      enableSuggestions: true,
      cacheResults: true,
      ...config
    };
  }

  public static getInstance(config?: Partial<ConstantServiceConfig>): ConstantService {
    if (!ConstantService.instance) {
      ConstantService.instance = new ConstantService(config);
    }
    return ConstantService.instance;
  }

  // Generic enum validation
  public validateEnum(enumType: string, value: string): EnumValidationResult {
    const cacheKey = `${enumType}:${value}`;
    
    if (this.config.cacheResults && this.validationCache.has(cacheKey)) {
      return this.validationCache.get(cacheKey)!;
    }

    const validatorName = `isValid${enumType}` as keyof typeof AllEnumValidators;
    const validator = AllEnumValidators[validatorName];

    let result: EnumValidationResult;

    if (typeof validator === 'function') {
      const isValid = validator(value);
      result = {
        isValid,
        enumType,
        value,
        suggestions: isValid ? undefined : this.generateSuggestions(enumType, value)
      };
    } else {
      result = {
        isValid: false,
        enumType,
        value,
        suggestions: [`Unknown enum type: ${enumType}`]
      };
    }

    if (this.config.cacheResults) {
      this.validationCache.set(cacheKey, result);
    }

    return result;
  }

  private generateSuggestions(enumType: string, value: string): string[] {
    if (!this.config.enableSuggestions) return [];

    const helperName = `get${enumType}Options` as keyof typeof AllEnumHelpers;
    const helper = AllEnumHelpers[helperName];

    if (typeof helper === 'function') {
      const options = helper() as Array<{ value: string; label: string }>;
      const suggestions = options
        .filter(option => 
          option.value.toLowerCase().includes(value.toLowerCase()) ||
          option.label.toLowerCase().includes(value.toLowerCase())
        )
        .map(option => option.value)
        .slice(0, 5); // Limit to 5 suggestions

      return suggestions.length > 0 ? suggestions : options.slice(0, 3).map(o => o.value);
    }

    return [];
  }

  // Specific enum getters with validation
  public getMonths(): Array<{ value: Months; label: string }> {
    return AllEnumHelpers.getMonthOptions() as Array<{ value: Months; label: string }>;
  }

  public getDaysOfWeek(): Array<{ value: DaysOfWeek; label: string }> {
    return AllEnumHelpers.getDayOfWeekOptions() as Array<{ value: DaysOfWeek; label: string }>;
  }

  public getNigerianRegions(): Array<{ value: NigerianRegions; label: string }> {
    return AllEnumHelpers.getNigerianRegionOptions() as Array<{ value: NigerianRegions; label: string }>;
  }

  public getSentimentLabels(): Array<{ value: SentimentLabels; label: string; color: string }> {
    return AllEnumHelpers.getSentimentLabelOptions() as Array<{ value: SentimentLabels; label: string; color: string }>;
  }

  public getChartTypes(): Array<{ value: ChartTypes; label: string }> {
    return AllEnumHelpers.getChartTypeOptions() as Array<{ value: ChartTypes; label: string }>;
  }

  public getColorSchemes(): Array<{ value: ColorSchemes; label: string }> {
    return AllEnumHelpers.getColorSchemeOptions() as Array<{ value: ColorSchemes; label: string }>;
  }

  public getErrorTypes(): Array<{ value: ErrorTypes; label: string }> {
    return AllEnumHelpers.getErrorTypeOptions() as Array<{ value: ErrorTypes; label: string }>;
  }

  public getLoadingStates(): Array<{ value: LoadingStates; label: string }> {
    return AllEnumHelpers.getLoadingStateOptions() as Array<{ value: LoadingStates; label: string }>;
  }

  // Utility functions
  public getSentimentScore(label: SentimentLabels): number {
    return SentimentUtils.getSentimentScore(label);
  }

  public getSentimentFromScore(score: number): SentimentLabels {
    return SentimentUtils.getSentimentFromScore(score);
  }

  public getDataQualityScore(level: string): number {
    if (AllEnumValidators.isValidDataQualityLevel(level)) {
      return SystemUtils.getDataQualityScore(level);
    }
    return 0;
  }

  public isSuccessStatusCode(code: number): boolean {
    return SystemUtils.isSuccessStatusCode(code);
  }

  // Batch validation
  public validateMultiple(validations: Array<{ enumType: string; value: string }>): Map<string, EnumValidationResult> {
    const results = new Map<string, EnumValidationResult>();
    
    validations.forEach(({ enumType, value }) => {
      const key = `${enumType}:${value}`;
      results.set(key, this.validateEnum(enumType, value));
    });

    return results;
  }

  // Get all available enum types
  public getAvailableEnumTypes(): string[] {
    return Object.keys(AllEnumValidators)
      .filter(key => key.startsWith('isValid'))
      .map(key => key.replace('isValid', ''));
  }

  // Get all options for a specific enum type
  public getEnumOptions(enumType: string): Array<{ value: string; label: string }> {
    const helperName = `get${enumType}Options` as keyof typeof AllEnumHelpers;
    const helper = AllEnumHelpers[helperName];

    if (typeof helper === 'function') {
      return helper() as Array<{ value: string; label: string }>;
    }

    return [];
  }

  // Clear validation cache
  public clearCache(): void {
    this.validationCache.clear();
  }

  // Get cache statistics
  public getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.validationCache.size,
      hitRate: 0 // Would need to track hits/misses for actual hit rate
    };
  }

  // Configuration management
  public updateConfig(newConfig: Partial<ConstantServiceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): ConstantServiceConfig {
    return { ...this.config };
  }

  // Enum synchronization with JSON data
  public validateDataAgainstEnums(data: any, schema: Record<string, string>): {
    isValid: boolean;
    errors: Array<{ field: string; value: any; enumType: string; message: string }>;
    warnings: Array<{ field: string; value: any; enumType: string; message: string }>;
  } {
    const errors: Array<{ field: string; value: any; enumType: string; message: string }> = [];
    const warnings: Array<{ field: string; value: any; enumType: string; message: string }> = [];

    Object.entries(schema).forEach(([field, enumType]) => {
      const value = this.getNestedValue(data, field);
      
      if (value !== undefined && value !== null) {
        const validation = this.validateEnum(enumType, String(value));
        
        if (!validation.isValid) {
          errors.push({
            field,
            value,
            enumType,
            message: `Invalid ${enumType} value: ${value}. ${validation.suggestions ? `Suggestions: ${validation.suggestions.join(', ')}` : ''}`
          });
        }
      } else {
        warnings.push({
          field,
          value,
          enumType,
          message: `Missing value for ${enumType} field: ${field}`
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  // Type-safe enum checking
  public isValidEnumValue<T extends Record<string, string>>(
    enumObject: T,
    value: string
  ): value is T[keyof T] {
    return Object.values(enumObject).includes(value as T[keyof T]);
  }

  // Get enum value by label (case-insensitive)
  public getEnumValueByLabel<T extends Record<string, string>>(
    enumObject: T,
    label: string
  ): T[keyof T] | null {
    const entry = Object.entries(enumObject).find(
      ([, value]) => value.toLowerCase() === label.toLowerCase()
    );
    return entry ? entry[1] as T[keyof T] : null;
  }
}

// Export singleton instance
export const constantService = ConstantService.getInstance();

// React hook for using constant service
export function useConstantService() {
  return constantService;
}

// React hook for enum validation
export function useEnumValidation(enumType: string, value: string) {
  const [validation, setValidation] = React.useState<EnumValidationResult>(() =>
    constantService.validateEnum(enumType, value)
  );

  React.useEffect(() => {
    setValidation(constantService.validateEnum(enumType, value));
  }, [enumType, value]);

  return validation;
}

import React from 'react';
