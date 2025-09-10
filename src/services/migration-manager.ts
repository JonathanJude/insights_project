import { featureFlags } from './feature-flags';

export interface MigrationStep {
  id: string;
  name: string;
  description: string;
  order: number;
  dependencies: string[];
  rollbackable: boolean;
  estimatedDuration: number; // in milliseconds
  execute: () => Promise<MigrationResult>;
  rollback?: () => Promise<MigrationResult>;
  validate?: () => Promise<ValidationResult>;
}

export interface MigrationResult {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
  warnings?: string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface MigrationState {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'rolled_back';
  startTime?: Date;
  endTime?: Date;
  completedSteps: string[];
  failedStep?: string;
  error?: string;
  rollbackReason?: string;
}

export interface MigrationPlan {
  id: string;
  name: string;
  description: string;
  version: string;
  steps: MigrationStep[];
  rollbackPlan: RollbackPlan;
  prerequisites: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface RollbackPlan {
  automatic: boolean;
  maxRetries: number;
  rollbackSteps: string[];
  fallbackStrategy: 'previous_version' | 'safe_mode' | 'manual_intervention';
}

export class MigrationManager {
  private static instance: MigrationManager;
  private migrations: Map<string, MigrationPlan> = new Map();
  private migrationStates: Map<string, MigrationState> = new Map();
  private backups: Map<string, any> = new Map();

  private constructor() {
    this.initializeMigrations();
    this.loadMigrationStates();
  }

  public static getInstance(): MigrationManager {
    if (!MigrationManager.instance) {
      MigrationManager.instance = new MigrationManager();
    }
    return MigrationManager.instance;
  }

  private initializeMigrations(): void {
    // Data structure refactoring migration
    const dataStructureMigration: MigrationPlan = {
      id: 'data-structure-refactoring-v1',
      name: 'Data Structure Refactoring',
      description: 'Migrate from hardcoded data to JSON-based structure',
      version: '1.0.0',
      prerequisites: ['json-schema-validation', 'error-boundary-system'],
      riskLevel: 'high',
      rollbackPlan: {
        automatic: true,
        maxRetries: 3,
        rollbackSteps: ['restore-backup', 'disable-feature-flags', 'clear-cache'],
        fallbackStrategy: 'previous_version'
      },
      steps: [
        {
          id: 'backup-current-data',
          name: 'Backup Current Data',
          description: 'Create backup of current data structure',
          order: 1,
          dependencies: [],
          rollbackable: true,
          estimatedDuration: 5000,
          execute: this.backupCurrentData.bind(this),
          rollback: this.restoreBackup.bind(this),
          validate: this.validateBackup.bind(this)
        },
        {
          id: 'enable-schema-validation',
          name: 'Enable Schema Validation',
          description: 'Enable JSON schema validation system',
          order: 2,
          dependencies: ['backup-current-data'],
          rollbackable: true,
          estimatedDuration: 2000,
          execute: this.enableSchemaValidation.bind(this),
          rollback: this.disableSchemaValidation.bind(this)
        },
        {
          id: 'migrate-constants',
          name: 'Migrate Constants',
          description: 'Convert hardcoded strings to enums and constants',
          order: 3,
          dependencies: ['enable-schema-validation'],
          rollbackable: true,
          estimatedDuration: 10000,
          execute: this.migrateConstants.bind(this),
          rollback: this.rollbackConstants.bind(this)
        },
        {
          id: 'migrate-data-services',
          name: 'Migrate Data Services',
          description: 'Switch to new JSON-based data services',
          order: 4,
          dependencies: ['migrate-constants'],
          rollbackable: true,
          estimatedDuration: 15000,
          execute: this.migrateDataServices.bind(this),
          rollback: this.rollbackDataServices.bind(this)
        },
        {
          id: 'validate-migration',
          name: 'Validate Migration',
          description: 'Validate all migrated data and functionality',
          order: 5,
          dependencies: ['migrate-data-services'],
          rollbackable: false,
          estimatedDuration: 8000,
          execute: this.validateMigration.bind(this)
        }
      ]
    };

    this.migrations.set(dataStructureMigration.id, dataStructureMigration);
  }

  private loadMigrationStates(): void {
    try {
      const states = localStorage.getItem('migration-states');
      if (states) {
        const parsed = JSON.parse(states);
        Object.entries(parsed).forEach(([id, state]) => {
          this.migrationStates.set(id, state as MigrationState);
        });
      }
    } catch (error) {
      console.warn('Failed to load migration states:', error);
    }
  }

  private saveMigrationStates(): void {
    try {
      const states = Object.fromEntries(this.migrationStates);
      localStorage.setItem('migration-states', JSON.stringify(states));
    } catch (error) {
      console.warn('Failed to save migration states:', error);
    }
  }

  public async executeMigration(migrationId: string): Promise<MigrationResult> {
    const migration = this.migrations.get(migrationId);
    if (!migration) {
      return {
        success: false,
        message: `Migration not found: ${migrationId}`,
        errors: [`Migration ${migrationId} does not exist`]
      };
    }

    // Check prerequisites
    const prerequisiteCheck = this.checkPrerequisites(migration);
    if (!prerequisiteCheck.success) {
      return prerequisiteCheck;
    }

    // Initialize migration state
    const migrationState: MigrationState = {
      id: migrationId,
      status: 'running',
      startTime: new Date(),
      completedSteps: []
    };

    this.migrationStates.set(migrationId, migrationState);
    this.saveMigrationStates();

    try {
      // Execute steps in order
      const sortedSteps = migration.steps.sort((a, b) => a.order - b.order);
      
      for (const step of sortedSteps) {
        console.log(`Executing migration step: ${step.name}`);
        
        // Check dependencies
        const dependenciesCheck = this.checkStepDependencies(step, migrationState.completedSteps);
        if (!dependenciesCheck.success) {
          throw new Error(`Step dependencies not met: ${dependenciesCheck.message}`);
        }

        // Execute step
        const stepResult = await step.execute();
        
        if (!stepResult.success) {
          migrationState.status = 'failed';
          migrationState.failedStep = step.id;
          migrationState.error = stepResult.message;
          migrationState.endTime = new Date();
          
          this.migrationStates.set(migrationId, migrationState);
          this.saveMigrationStates();

          // Attempt automatic rollback if configured
          if (migration.rollbackPlan.automatic) {
            console.log('Attempting automatic rollback...');
            await this.rollbackMigration(migrationId);
          }

          return {
            success: false,
            message: `Migration failed at step: ${step.name}`,
            errors: stepResult.errors
          };
        }

        // Validate step if validation function exists
        if (step.validate) {
          const validationResult = await step.validate();
          if (!validationResult.valid) {
            throw new Error(`Step validation failed: ${validationResult.errors.join(', ')}`);
          }
        }

        migrationState.completedSteps.push(step.id);
        this.migrationStates.set(migrationId, migrationState);
        this.saveMigrationStates();
      }

      // Migration completed successfully
      migrationState.status = 'completed';
      migrationState.endTime = new Date();
      this.migrationStates.set(migrationId, migrationState);
      this.saveMigrationStates();

      return {
        success: true,
        message: 'Migration completed successfully',
        data: { migrationId, completedSteps: migrationState.completedSteps }
      };

    } catch (error) {
      migrationState.status = 'failed';
      migrationState.error = error instanceof Error ? error.message : String(error);
      migrationState.endTime = new Date();
      
      this.migrationStates.set(migrationId, migrationState);
      this.saveMigrationStates();

      // Attempt automatic rollback if configured
      if (migration.rollbackPlan.automatic) {
        console.log('Attempting automatic rollback due to error...');
        await this.rollbackMigration(migrationId);
      }

      return {
        success: false,
        message: `Migration failed: ${error}`,
        errors: [String(error)]
      };
    }
  }

  public async rollbackMigration(migrationId: string): Promise<MigrationResult> {
    const migration = this.migrations.get(migrationId);
    const migrationState = this.migrationStates.get(migrationId);

    if (!migration || !migrationState) {
      return {
        success: false,
        message: 'Migration or state not found for rollback'
      };
    }

    try {
      // Get completed steps in reverse order
      const completedSteps = migrationState.completedSteps.reverse();
      const rollbackErrors: string[] = [];

      for (const stepId of completedSteps) {
        const step = migration.steps.find(s => s.id === stepId);
        
        if (step && step.rollback && step.rollbackable) {
          console.log(`Rolling back step: ${step.name}`);
          
          const rollbackResult = await step.rollback();
          if (!rollbackResult.success) {
            rollbackErrors.push(`Failed to rollback ${step.name}: ${rollbackResult.message}`);
          }
        }
      }

      // Update migration state
      migrationState.status = 'rolled_back';
      migrationState.rollbackReason = migrationState.error || 'Manual rollback';
      migrationState.endTime = new Date();
      
      this.migrationStates.set(migrationId, migrationState);
      this.saveMigrationStates();

      // Execute fallback strategy
      await this.executeFallbackStrategy(migration.rollbackPlan.fallbackStrategy);

      return {
        success: rollbackErrors.length === 0,
        message: rollbackErrors.length === 0 
          ? 'Rollback completed successfully' 
          : 'Rollback completed with errors',
        errors: rollbackErrors
      };

    } catch (error) {
      return {
        success: false,
        message: `Rollback failed: ${error}`,
        errors: [String(error)]
      };
    }
  }

  private checkPrerequisites(migration: MigrationPlan): MigrationResult {
    const missingPrerequisites: string[] = [];

    for (const prerequisite of migration.prerequisites) {
      if (!featureFlags.isEnabled(prerequisite)) {
        missingPrerequisites.push(prerequisite);
      }
    }

    if (missingPrerequisites.length > 0) {
      return {
        success: false,
        message: 'Prerequisites not met',
        errors: [`Missing prerequisites: ${missingPrerequisites.join(', ')}`]
      };
    }

    return { success: true, message: 'Prerequisites met' };
  }

  private checkStepDependencies(step: MigrationStep, completedSteps: string[]): MigrationResult {
    const missingDependencies = step.dependencies.filter(dep => !completedSteps.includes(dep));

    if (missingDependencies.length > 0) {
      return {
        success: false,
        message: `Missing dependencies: ${missingDependencies.join(', ')}`
      };
    }

    return { success: true, message: 'Dependencies met' };
  }

  private async executeFallbackStrategy(strategy: RollbackPlan['fallbackStrategy']): Promise<void> {
    switch (strategy) {
      case 'previous_version':
        // Disable all new feature flags
        featureFlags.setOverride('data-structure-refactoring', false);
        featureFlags.setOverride('json-schema-validation', false);
        featureFlags.setOverride('enum-constants-system', false);
        featureFlags.setOverride('new-data-services', false);
        break;
      
      case 'safe_mode':
        // Enable only essential features
        featureFlags.setOverride('error-boundary-system', true);
        break;
      
      case 'manual_intervention':
        console.warn('Manual intervention required for migration rollback');
        break;
    }
  }

  // Migration step implementations
  private async backupCurrentData(): Promise<MigrationResult> {
    try {
      // In a real implementation, this would backup actual data
      const backup = {
        timestamp: new Date().toISOString(),
        mockData: 'current-mock-data-structure',
        featureFlags: featureFlags.getAllFlags()
      };

      this.backups.set('data-structure-refactoring-v1', backup);
      localStorage.setItem('migration-backup', JSON.stringify(backup));

      return {
        success: true,
        message: 'Data backup completed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: `Backup failed: ${error}`,
        errors: [String(error)]
      };
    }
  }

  private async restoreBackup(): Promise<MigrationResult> {
    try {
      const backup = this.backups.get('data-structure-refactoring-v1');
      if (!backup) {
        throw new Error('No backup found');
      }

      // Restore backup (implementation would restore actual data)
      console.log('Restoring backup:', backup);

      return {
        success: true,
        message: 'Backup restored successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: `Restore failed: ${error}`,
        errors: [String(error)]
      };
    }
  }

  private async validateBackup(): Promise<ValidationResult> {
    const backup = this.backups.get('data-structure-refactoring-v1');
    return {
      valid: !!backup,
      errors: backup ? [] : ['No backup found'],
      warnings: []
    };
  }

  private async enableSchemaValidation(): Promise<MigrationResult> {
    featureFlags.setOverride('json-schema-validation', true);
    return {
      success: true,
      message: 'Schema validation enabled'
    };
  }

  private async disableSchemaValidation(): Promise<MigrationResult> {
    featureFlags.setOverride('json-schema-validation', false);
    return {
      success: true,
      message: 'Schema validation disabled'
    };
  }

  private async migrateConstants(): Promise<MigrationResult> {
    featureFlags.setOverride('enum-constants-system', true);
    return {
      success: true,
      message: 'Constants migration completed'
    };
  }

  private async rollbackConstants(): Promise<MigrationResult> {
    featureFlags.setOverride('enum-constants-system', false);
    return {
      success: true,
      message: 'Constants rollback completed'
    };
  }

  private async migrateDataServices(): Promise<MigrationResult> {
    featureFlags.setOverride('new-data-services', true);
    return {
      success: true,
      message: 'Data services migration completed'
    };
  }

  private async rollbackDataServices(): Promise<MigrationResult> {
    featureFlags.setOverride('new-data-services', false);
    return {
      success: true,
      message: 'Data services rollback completed'
    };
  }

  private async validateMigration(): Promise<MigrationResult> {
    try {
      // Validate that all systems are working
      const validationErrors: string[] = [];

      // Check feature flags
      if (!featureFlags.isEnabled('json-schema-validation')) {
        validationErrors.push('Schema validation not enabled');
      }

      if (!featureFlags.isEnabled('enum-constants-system')) {
        validationErrors.push('Enum constants system not enabled');
      }

      if (!featureFlags.isEnabled('new-data-services')) {
        validationErrors.push('New data services not enabled');
      }

      return {
        success: validationErrors.length === 0,
        message: validationErrors.length === 0 
          ? 'Migration validation successful' 
          : 'Migration validation failed',
        errors: validationErrors
      };
    } catch (error) {
      return {
        success: false,
        message: `Validation failed: ${error}`,
        errors: [String(error)]
      };
    }
  }

  // Public API methods
  public getMigrationState(migrationId: string): MigrationState | null {
    return this.migrationStates.get(migrationId) || null;
  }

  public getAllMigrations(): MigrationPlan[] {
    return Array.from(this.migrations.values());
  }

  public getMigration(migrationId: string): MigrationPlan | null {
    return this.migrations.get(migrationId) || null;
  }

  public canRollback(migrationId: string): boolean {
    const state = this.migrationStates.get(migrationId);
    const migration = this.migrations.get(migrationId);
    
    return !!(state && migration && 
      (state.status === 'completed' || state.status === 'failed') &&
      migration.steps.some(step => step.rollbackable));
  }

  public getMigrationProgress(migrationId: string): {
    totalSteps: number;
    completedSteps: number;
    currentStep?: string;
    progress: number;
  } {
    const migration = this.migrations.get(migrationId);
    const state = this.migrationStates.get(migrationId);

    if (!migration || !state) {
      return { totalSteps: 0, completedSteps: 0, progress: 0 };
    }

    const totalSteps = migration.steps.length;
    const completedSteps = state.completedSteps.length;
    const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

    return {
      totalSteps,
      completedSteps,
      progress,
      currentStep: state.status === 'running' ? 
        migration.steps.find(s => !state.completedSteps.includes(s.id))?.name : 
        undefined
    };
  }
}

// Export singleton instance
export const migrationManager = MigrationManager.getInstance();