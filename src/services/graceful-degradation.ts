/**
 * Graceful Degradation Service
 * 
 * Handles missing data gracefully by providing fallbacks, defaults, and indicators
 */

import { DataQualityLevels, VerificationStatus } from '../constants/enums/system-enums';

// Fallback data types
export interface FallbackValue {
  value: any;
  confidence: number;
  source: 'default' | 'computed' | 'estimated' | 'placeholder';
  isPlaceholder: boolean;
  displayText?: string;
}

export interface DataAvailabilityIndicator {
  isAvailable: boolean;
  quality: DataQualityLevels;
  confidence: number;
  lastUpdated?: Date;
  source?: string;
  fallbackUsed: boolean;
  message: string;
}

export interface GracefulDegradationOptions {
  useDefaults: boolean;
  computeFallbacks: boolean;
  showPlaceholders: boolean;
  indicateQuality: boolean;
  mode: 'strict' | 'lenient' | 'permissive';
}

/**
 * Graceful Degradation Service
 */
export class GracefulDegradationService {
  private static instance: GracefulDegradationService;
  private fallbackStrategies = new Map<string, (value: any, context?: any) => FallbackValue>();
  private defaultValues = new Map<string, any>();
  
  private constructor() {
    this.initializeFallbackStrategies();
    this.initializeDefaultValues();
  }
  
  static getInstance(): GracefulDegradationService {
    if (!GracefulDegradationService.instance) {
      GracefulDegradationService.instance = new GracefulDegradationService();
    }
    return GracefulDegradationService.instance;
  }  

  /**
   * Initialize fallback strategies for different data types
   */
  private initializeFallbackStrategies(): void {
    // Name fallback strategy
    this.fallbackStrategies.set('name', (value: any, context?: any) => {
      if (this.isValuePresent(value)) {
        return {
          value,
          confidence: 1.0,
          source: 'default',
          isPlaceholder: false
        };
      }
      
      // Try to construct from other fields
      if (context?.firstName && context?.lastName) {
        return {
          value: `${context.firstName} ${context.lastName}`,
          confidence: 0.9,
          source: 'computed',
          isPlaceholder: false,
          displayText: `${context.firstName} ${context.lastName}`
        };
      }
      
      return {
        value: 'Unknown',
        confidence: 0.1,
        source: 'placeholder',
        isPlaceholder: true,
        displayText: 'Name not available'
      };
    });
    
    // Party affiliation fallback
    this.fallbackStrategies.set('party', (value: any, context?: any) => {
      if (this.isValuePresent(value)) {
        return {
          value,
          confidence: 1.0,
          source: 'default',
          isPlaceholder: false
        };
      }
      
      return {
        value: 'INDEPENDENT',
        confidence: 0.3,
        source: 'default',
        isPlaceholder: true,
        displayText: 'Independent/Unknown'
      };
    });
    
    // State fallback
    this.fallbackStrategies.set('state', (value: any, context?: any) => {
      if (this.isValuePresent(value)) {
        return {
          value,
          confidence: 1.0,
          source: 'default',
          isPlaceholder: false
        };
      }
      
      return {
        value: 'UNKNOWN',
        confidence: 0.1,
        source: 'placeholder',
        isPlaceholder: true,
        displayText: 'State not specified'
      };
    });
    
    // Age/Date of birth fallback
    this.fallbackStrategies.set('age', (value: any, context?: any) => {
      if (this.isValuePresent(value)) {
        return {
          value,
          confidence: 1.0,
          source: 'default',
          isPlaceholder: false
        };
      }
      
      // Try to estimate from other context
      if (context?.politicalHistory && Array.isArray(context.politicalHistory)) {
        const earliestYear = Math.min(...context.politicalHistory
          .map((h: any) => new Date(h.startDate).getFullYear())
          .filter((year: number) => !isNaN(year)));
        
        if (earliestYear && earliestYear > 1950) {
          const estimatedAge = new Date().getFullYear() - earliestYear + 25; // Assume started politics at 25
          return {
            value: estimatedAge,
            confidence: 0.4,
            source: 'estimated',
            isPlaceholder: false,
            displayText: `~${estimatedAge} (estimated)`
          };
        }
      }
      
      return {
        value: null,
        confidence: 0,
        source: 'placeholder',
        isPlaceholder: true,
        displayText: 'Age not available'
      };
    });
  }  

  /**
   * Initialize default values for common fields
   */
  private initializeDefaultValues(): void {
    this.defaultValues.set('gender', 'Not specified');
    this.defaultValues.set('education', 'Not available');
    this.defaultValues.set('occupation', 'Not specified');
    this.defaultValues.set('email', null);
    this.defaultValues.set('phone', null);
    this.defaultValues.set('website', null);
    this.defaultValues.set('socialMedia', {});
    this.defaultValues.set('biography', 'No biography available');
    this.defaultValues.set('achievements', []);
    this.defaultValues.set('controversies', []);
    this.defaultValues.set('isActive', true);
    this.defaultValues.set('verificationStatus', VerificationStatus.UNVERIFIED);
  }
  
  /**
   * Apply graceful degradation to a data object
   */
  applyGracefulDegradation<T>(
    data: Partial<T>,
    fieldMappings: { [key: string]: string },
    options: Partial<GracefulDegradationOptions> = {}
  ): T & { _dataAvailability: { [key: string]: DataAvailabilityIndicator } } {
    const defaultOptions: GracefulDegradationOptions = {
      useDefaults: true,
      computeFallbacks: true,
      showPlaceholders: true,
      indicateQuality: true,
      mode: 'lenient'
    };
    
    const opts = { ...defaultOptions, ...options };
    const result = { ...data } as any;
    const dataAvailability: { [key: string]: DataAvailabilityIndicator } = {};
    
    Object.entries(fieldMappings).forEach(([field, strategy]) => {
      const originalValue = data[field as keyof T];
      const availability = this.assessDataAvailability(originalValue, field);
      
      if (!availability.isAvailable && opts.useDefaults) {
        const fallback = this.getFallbackValue(strategy, originalValue, data);
        result[field] = fallback.value;
        
        availability.fallbackUsed = true;
        availability.confidence = fallback.confidence;
        availability.message = fallback.displayText || `Using ${fallback.source} value`;
        
        if (fallback.isPlaceholder) {
          availability.quality = DataQualityLevels.POOR;
        } else if (fallback.source === 'computed') {
          availability.quality = DataQualityLevels.FAIR;
        } else if (fallback.source === 'estimated') {
          availability.quality = DataQualityLevels.FAIR;
        }
      }
      
      dataAvailability[field] = availability;
    });
    
    if (opts.indicateQuality) {
      result._dataAvailability = dataAvailability;
    }
    
    return result;
  }
  
  /**
   * Get fallback value for a field
   */
  private getFallbackValue(strategy: string, value: any, context?: any): FallbackValue {
    const fallbackStrategy = this.fallbackStrategies.get(strategy);
    
    if (fallbackStrategy) {
      return fallbackStrategy(value, context);
    }
    
    // Default fallback
    const defaultValue = this.defaultValues.get(strategy);
    return {
      value: defaultValue || null,
      confidence: defaultValue ? 0.5 : 0,
      source: 'default',
      isPlaceholder: true,
      displayText: defaultValue ? `Default: ${defaultValue}` : 'Not available'
    };
  }
  
  /**
   * Assess data availability for a field
   */
  private assessDataAvailability(value: any, field: string): DataAvailabilityIndicator {
    const isAvailable = this.isValuePresent(value);
    
    let quality = DataQualityLevels.UNKNOWN;
    let confidence = 0;
    let message = '';
    
    if (isAvailable) {
      // Assess quality based on value characteristics
      if (typeof value === 'string') {
        if (value.length > 2 && !value.toLowerCase().includes('unknown') && !value.toLowerCase().includes('n/a')) {
          quality = DataQualityLevels.GOOD;
          confidence = 0.8;
          message = 'Data available';
        } else {
          quality = DataQualityLevels.FAIR;
          confidence = 0.5;
          message = 'Limited data available';
        }
      } else if (typeof value === 'number' && !isNaN(value)) {
        quality = DataQualityLevels.GOOD;
        confidence = 0.9;
        message = 'Numeric data available';
      } else if (typeof value === 'object' && value !== null) {
        const keys = Object.keys(value);
        if (keys.length > 0) {
          quality = DataQualityLevels.GOOD;
          confidence = 0.7;
          message = 'Structured data available';
        } else {
          quality = DataQualityLevels.POOR;
          confidence = 0.2;
          message = 'Empty object';
        }
      } else {
        quality = DataQualityLevels.FAIR;
        confidence = 0.6;
        message = 'Data available';
      }
    } else {
      quality = DataQualityLevels.UNKNOWN;
      confidence = 0;
      message = 'Data not available';
    }
    
    return {
      isAvailable,
      quality,
      confidence,
      fallbackUsed: false,
      message
    };
  }  

  /**
   * Create data unavailable indicators for UI components
   */
  createDataUnavailableIndicator(
    field: string,
    reason: 'missing' | 'invalid' | 'restricted' | 'loading' = 'missing'
  ): {
    display: string;
    tooltip: string;
    className: string;
    icon: string;
    severity: 'info' | 'warning' | 'error';
  } {
    const indicators = {
      missing: {
        display: 'Not available',
        tooltip: `${field} information is not available`,
        className: 'data-missing',
        icon: 'info-circle',
        severity: 'info' as const
      },
      invalid: {
        display: 'Invalid data',
        tooltip: `${field} contains invalid information`,
        className: 'data-invalid',
        icon: 'exclamation-triangle',
        severity: 'warning' as const
      },
      restricted: {
        display: 'Restricted',
        tooltip: `${field} information is restricted`,
        className: 'data-restricted',
        icon: 'lock',
        severity: 'warning' as const
      },
      loading: {
        display: 'Loading...',
        tooltip: `Loading ${field} information`,
        className: 'data-loading',
        icon: 'spinner',
        severity: 'info' as const
      }
    };
    
    return indicators[reason];
  }
  
  /**
   * Generate placeholder content for missing data
   */
  generatePlaceholder(
    dataType: 'text' | 'number' | 'date' | 'list' | 'object',
    context?: { field?: string; length?: number }
  ): any {
    switch (dataType) {
      case 'text':
        const length = context?.length || 20;
        return '—'.repeat(Math.min(length / 4, 10));
      
      case 'number':
        return null;
      
      case 'date':
        return null;
      
      case 'list':
        return [];
      
      case 'object':
        return {};
      
      default:
        return null;
    }
  }
  
  /**
   * Create adaptive content based on data availability
   */
  createAdaptiveContent<T>(
    data: T,
    template: {
      available: (data: T) => any;
      partial: (data: T, available: string[]) => any;
      unavailable: () => any;
    }
  ): any {
    if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
      return template.unavailable();
    }
    
    if (typeof data === 'object') {
      const availableFields = Object.entries(data)
        .filter(([_, value]) => this.isValuePresent(value))
        .map(([key, _]) => key);
      
      const totalFields = Object.keys(data).length;
      const availabilityRatio = availableFields.length / totalFields;
      
      if (availabilityRatio >= 0.8) {
        return template.available(data);
      } else if (availabilityRatio >= 0.3) {
        return template.partial(data, availableFields);
      } else {
        return template.unavailable();
      }
    }
    
    return this.isValuePresent(data) ? template.available(data) : template.unavailable();
  }
  
  /**
   * Handle demographic data with graceful degradation
   */
  handleDemographicData(demographics: any): {
    ageGroup: string;
    gender: string;
    education: string;
    location: string;
    confidence: number;
    indicators: { [key: string]: DataAvailabilityIndicator };
  } {
    const result = {
      ageGroup: 'Not specified',
      gender: 'Not specified',
      education: 'Not specified',
      location: 'Not specified',
      confidence: 0,
      indicators: {} as { [key: string]: DataAvailabilityIndicator }
    };
    
    let totalConfidence = 0;
    let fieldCount = 0;
    
    // Handle age group
    if (demographics?.age || demographics?.dateOfBirth) {
      const age = demographics.age || this.calculateAgeFromBirthDate(demographics.dateOfBirth);
      if (age) {
        result.ageGroup = this.categorizeAge(age);
        result.indicators.ageGroup = {
          isAvailable: true,
          quality: DataQualityLevels.GOOD,
          confidence: demographics.age ? 0.9 : 0.7,
          fallbackUsed: !demographics.age,
          message: demographics.age ? 'Age available' : 'Age calculated from birth date'
        };
        totalConfidence += result.indicators.ageGroup.confidence;
      } else {
        result.indicators.ageGroup = {
          isAvailable: false,
          quality: DataQualityLevels.UNKNOWN,
          confidence: 0,
          fallbackUsed: true,
          message: 'Age not available'
        };
      }
    }
    fieldCount++;
    
    // Handle gender
    if (this.isValuePresent(demographics?.gender)) {
      result.gender = demographics.gender;
      result.indicators.gender = {
        isAvailable: true,
        quality: DataQualityLevels.GOOD,
        confidence: 0.9,
        fallbackUsed: false,
        message: 'Gender specified'
      };
      totalConfidence += 0.9;
    } else {
      result.indicators.gender = {
        isAvailable: false,
        quality: DataQualityLevels.UNKNOWN,
        confidence: 0,
        fallbackUsed: true,
        message: 'Gender not specified'
      };
    }
    fieldCount++;
    
    // Handle education
    if (this.isValuePresent(demographics?.education)) {
      result.education = Array.isArray(demographics.education) 
        ? demographics.education[demographics.education.length - 1]?.degree || 'Education available'
        : demographics.education;
      result.indicators.education = {
        isAvailable: true,
        quality: DataQualityLevels.GOOD,
        confidence: 0.8,
        fallbackUsed: false,
        message: 'Education information available'
      };
      totalConfidence += 0.8;
    } else {
      result.indicators.education = {
        isAvailable: false,
        quality: DataQualityLevels.UNKNOWN,
        confidence: 0,
        fallbackUsed: true,
        message: 'Education not specified'
      };
    }
    fieldCount++;
    
    // Handle location
    if (this.isValuePresent(demographics?.stateOfOrigin) || this.isValuePresent(demographics?.location)) {
      result.location = demographics.stateOfOrigin || demographics.location;
      result.indicators.location = {
        isAvailable: true,
        quality: DataQualityLevels.GOOD,
        confidence: 0.8,
        fallbackUsed: false,
        message: 'Location available'
      };
      totalConfidence += 0.8;
    } else {
      result.indicators.location = {
        isAvailable: false,
        quality: DataQualityLevels.UNKNOWN,
        confidence: 0,
        fallbackUsed: true,
        message: 'Location not specified'
      };
    }
    fieldCount++;
    
    result.confidence = fieldCount > 0 ? totalConfidence / fieldCount : 0;
    
    return result;
  }
  
  // Helper methods
  private isValuePresent(value: any): boolean {
    return value !== null && 
           value !== undefined && 
           value !== '' && 
           !(Array.isArray(value) && value.length === 0) &&
           !(typeof value === 'object' && Object.keys(value).length === 0);
  }
  
  private calculateAgeFromBirthDate(birthDate: string): number | null {
    if (!birthDate) return null;
    
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return null;
    
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age > 0 && age < 150 ? age : null;
  }
  
  private categorizeAge(age: number): string {
    if (age < 25) return '18-24';
    if (age < 35) return '25-34';
    if (age < 45) return '35-44';
    if (age < 55) return '45-54';
    if (age < 65) return '55-64';
    return '65+';
  }
}

// Export singleton instance
export const gracefulDegradation = GracefulDegradationService.getInstance();