export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  conditions?: FeatureFlagCondition[];
  metadata?: Record<string, any>;
}

export interface FeatureFlagCondition {
  type: 'user' | 'environment' | 'date' | 'custom';
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
  field?: string;
}

export interface FeatureFlagContext {
  userId?: string;
  userEmail?: string;
  environment: string;
  timestamp: Date;
  customProperties?: Record<string, any>;
}

export class FeatureFlagService {
  private static instance: FeatureFlagService;
  private flags: Map<string, FeatureFlag> = new Map();
  private overrides: Map<string, boolean> = new Map();

  private constructor() {
    this.initializeFlags();
    this.loadOverrides();
  }

  public static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  private initializeFlags(): void {
    // Data structure refactoring flags
    this.flags.set('data-structure-refactoring', {
      key: 'data-structure-refactoring',
      name: 'Data Structure Refactoring',
      description: 'Enable new JSON-based data structure system',
      enabled: false,
      rolloutPercentage: 0,
      metadata: {
        phase: 'development',
        riskLevel: 'high',
        rollbackPlan: 'immediate'
      }
    });

    this.flags.set('json-schema-validation', {
      key: 'json-schema-validation',
      name: 'JSON Schema Validation',
      description: 'Enable JSON schema validation for data files',
      enabled: false,
      rolloutPercentage: 0,
      metadata: {
        phase: 'testing',
        riskLevel: 'medium'
      }
    });

    this.flags.set('enum-constants-system', {
      key: 'enum-constants-system',
      name: 'Enum Constants System',
      description: 'Enable new enum-based constants system',
      enabled: false,
      rolloutPercentage: 0,
      metadata: {
        phase: 'development',
        riskLevel: 'medium'
      }
    });

    this.flags.set('new-data-services', {
      key: 'new-data-services',
      name: 'New Data Services',
      description: 'Enable new data service layer',
      enabled: false,
      rolloutPercentage: 0,
      metadata: {
        phase: 'development',
        riskLevel: 'high'
      }
    });

    this.flags.set('error-boundary-system', {
      key: 'error-boundary-system',
      name: 'Error Boundary System',
      description: 'Enable comprehensive error boundary system',
      enabled: true,
      rolloutPercentage: 100,
      metadata: {
        phase: 'production',
        riskLevel: 'low'
      }
    });
  }

  private loadOverrides(): void {
    try {
      const overrides = localStorage.getItem('feature-flag-overrides');
      if (overrides) {
        const parsed = JSON.parse(overrides);
        Object.entries(parsed).forEach(([key, value]) => {
          if (typeof value === 'boolean') {
            this.overrides.set(key, value);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load feature flag overrides:', error);
    }
  }

  private saveOverrides(): void {
    try {
      const overrides = Object.fromEntries(this.overrides);
      localStorage.setItem('feature-flag-overrides', JSON.stringify(overrides));
    } catch (error) {
      console.warn('Failed to save feature flag overrides:', error);
    }
  }

  public isEnabled(flagKey: string, context?: FeatureFlagContext): boolean {
    // Check for local override first
    if (this.overrides.has(flagKey)) {
      return this.overrides.get(flagKey)!;
    }

    const flag = this.flags.get(flagKey);
    if (!flag) {
      console.warn(`Feature flag not found: ${flagKey}`);
      return false;
    }

    // Check if flag is globally disabled
    if (!flag.enabled) {
      return false;
    }

    // Check rollout percentage
    if (flag.rolloutPercentage < 100) {
      const hash = this.hashString(flagKey + (context?.userId || 'anonymous'));
      const percentage = (hash % 100) + 1;
      if (percentage > flag.rolloutPercentage) {
        return false;
      }
    }

    // Check conditions
    if (flag.conditions && context) {
      return this.evaluateConditions(flag.conditions, context);
    }

    return true;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private evaluateConditions(conditions: FeatureFlagCondition[], context: FeatureFlagContext): boolean {
    return conditions.every(condition => this.evaluateCondition(condition, context));
  }

  private evaluateCondition(condition: FeatureFlagCondition, context: FeatureFlagContext): boolean {
    let contextValue: any;

    switch (condition.type) {
      case 'user':
        contextValue = condition.field === 'email' ? context.userEmail : context.userId;
        break;
      case 'environment':
        contextValue = context.environment;
        break;
      case 'date':
        contextValue = context.timestamp;
        break;
      case 'custom':
        contextValue = context.customProperties?.[condition.field || ''];
        break;
      default:
        return false;
    }

    switch (condition.operator) {
      case 'equals':
        return contextValue === condition.value;
      case 'contains':
        return String(contextValue).includes(String(condition.value));
      case 'greater_than':
        return contextValue > condition.value;
      case 'less_than':
        return contextValue < condition.value;
      case 'in':
        return Array.isArray(condition.value) && condition.value.includes(contextValue);
      case 'not_in':
        return Array.isArray(condition.value) && !condition.value.includes(contextValue);
      default:
        return false;
    }
  }

  public setOverride(flagKey: string, enabled: boolean): void {
    this.overrides.set(flagKey, enabled);
    this.saveOverrides();
  }

  public removeOverride(flagKey: string): void {
    this.overrides.delete(flagKey);
    this.saveOverrides();
  }

  public clearAllOverrides(): void {
    this.overrides.clear();
    this.saveOverrides();
  }

  public updateFlag(flagKey: string, updates: Partial<FeatureFlag>): void {
    const flag = this.flags.get(flagKey);
    if (flag) {
      this.flags.set(flagKey, { ...flag, ...updates });
    }
  }

  public getAllFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  public getFlag(flagKey: string): FeatureFlag | null {
    return this.flags.get(flagKey) || null;
  }

  public getFlagStatus(flagKey: string, context?: FeatureFlagContext): {
    enabled: boolean;
    reason: string;
    override?: boolean;
  } {
    if (this.overrides.has(flagKey)) {
      return {
        enabled: this.overrides.get(flagKey)!,
        reason: 'Local override',
        override: true
      };
    }

    const flag = this.flags.get(flagKey);
    if (!flag) {
      return {
        enabled: false,
        reason: 'Flag not found'
      };
    }

    if (!flag.enabled) {
      return {
        enabled: false,
        reason: 'Flag globally disabled'
      };
    }

    if (flag.rolloutPercentage < 100) {
      const hash = this.hashString(flagKey + (context?.userId || 'anonymous'));
      const percentage = (hash % 100) + 1;
      if (percentage > flag.rolloutPercentage) {
        return {
          enabled: false,
          reason: `Outside rollout percentage (${flag.rolloutPercentage}%)`
        };
      }
    }

    if (flag.conditions && context && !this.evaluateConditions(flag.conditions, context)) {
      return {
        enabled: false,
        reason: 'Conditions not met'
      };
    }

    return {
      enabled: true,
      reason: 'All conditions met'
    };
  }
}

// Export singleton instance
export const featureFlags = FeatureFlagService.getInstance();

// React hook for using feature flags
export function useFeatureFlag(flagKey: string, context?: FeatureFlagContext): boolean {
  const [enabled, setEnabled] = React.useState(() => 
    featureFlags.isEnabled(flagKey, context)
  );

  React.useEffect(() => {
    // Re-evaluate flag when context changes
    setEnabled(featureFlags.isEnabled(flagKey, context));
  }, [flagKey, context]);

  return enabled;
}

// React hook for feature flag status
export function useFeatureFlagStatus(flagKey: string, context?: FeatureFlagContext) {
  const [status, setStatus] = React.useState(() => 
    featureFlags.getFlagStatus(flagKey, context)
  );

  React.useEffect(() => {
    setStatus(featureFlags.getFlagStatus(flagKey, context));
  }, [flagKey, context]);

  return status;
}

import React from 'react';
