import { beforeEach, describe, expect, it, vi } from 'vitest';
import { featureFlags } from '../feature-flags';
import { MigrationManager } from '../migration-manager';

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('MigrationManager', () => {
  let migrationManager: MigrationManager;

  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
    
    // Reset feature flags
    featureFlags.clearAllOverrides();
    
    migrationManager = MigrationManager.getInstance();
  });

  describe('Migration Execution', () => {
    it('should execute migration successfully when prerequisites are met', async () => {
      // Enable prerequisites
      featureFlags.setOverride('json-schema-validation', true);
      featureFlags.setOverride('error-boundary-system', true);

      const result = await migrationManager.executeMigration('data-structure-refactoring-v1');
      
      expect(result.success).toBe(true);
      expect(result.message).toBe('Migration completed successfully');
    });

    it('should fail migration when prerequisites are not met', async () => {
      // Don't enable prerequisites
      const result = await migrationManager.executeMigration('data-structure-refactoring-v1');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Prerequisites not met');
      expect(result.errors).toContain('Missing prerequisites: json-schema-validation');
    });

    it('should fail for non-existent migration', async () => {
      const result = await migrationManager.executeMigration('non-existent-migration');
      
      expect(result.success).toBe(false);
      expect(result.message).toBe('Migration not found: non-existent-migration');
    });

    it('should track migration progress', async () => {
      // Enable prerequisites
      featureFlags.setOverride('json-schema-validation', true);
      featureFlags.setOverride('error-boundary-system', true);

      // Start migration (don't await to check progress)
      const migrationPromise = migrationManager.executeMigration('data-structure-refactoring-v1');
      
      // Check initial progress
      const progress = migrationManager.getMigrationProgress('data-structure-refactoring-v1');
      expect(progress.totalSteps).toBe(5);
      expect(progress.progress).toBeGreaterThanOrEqual(0);

      // Wait for completion
      await migrationPromise;
      
      // Check final progress
      const finalProgress = migrationManager.getMigrationProgress('data-structure-refactoring-v1');
      expect(finalProgress.progress).toBe(100);
      expect(finalProgress.completedSteps).toBe(5);
    });
  });

  describe('Migration State Management', () => {
    it('should save and load migration states', async () => {
      // Enable prerequisites
      featureFlags.setOverride('json-schema-validation', true);
      featureFlags.setOverride('error-boundary-system', true);

      await migrationManager.executeMigration('data-structure-refactoring-v1');
      
      // Check that state was saved
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'migration-states',
        expect.any(String)
      );

      const state = migrationManager.getMigrationState('data-structure-refactoring-v1');
      expect(state).toBeDefined();
      expect(state?.status).toBe('completed');
    });

    it('should track completed steps', async () => {
      // Enable prerequisites
      featureFlags.setOverride('json-schema-validation', true);
      featureFlags.setOverride('error-boundary-system', true);

      await migrationManager.executeMigration('data-structure-refactoring-v1');
      
      const state = migrationManager.getMigrationState('data-structure-refactoring-v1');
      expect(state?.completedSteps).toHaveLength(5);
      expect(state?.completedSteps).toContain('backup-current-data');
      expect(state?.completedSteps).toContain('validate-migration');
    });
  });

  describe('Rollback Functionality', () => {
    it('should rollback migration successfully', async () => {
      // Enable prerequisites and run migration
      featureFlags.setOverride('json-schema-validation', true);
      featureFlags.setOverride('error-boundary-system', true);
      
      await migrationManager.executeMigration('data-structure-refactoring-v1');
      
      // Rollback
      const rollbackResult = await migrationManager.rollbackMigration('data-structure-refactoring-v1');
      
      expect(rollbackResult.success).toBe(true);
      expect(rollbackResult.message).toBe('Rollback completed successfully');
      
      const state = migrationManager.getMigrationState('data-structure-refactoring-v1');
      expect(state?.status).toBe('rolled_back');
    });

    it('should check if migration can be rolled back', async () => {
      // Enable prerequisites and run migration
      featureFlags.setOverride('json-schema-validation', true);
      featureFlags.setOverride('error-boundary-system', true);
      
      await migrationManager.executeMigration('data-structure-refactoring-v1');
      
      const canRollback = migrationManager.canRollback('data-structure-refactoring-v1');
      expect(canRollback).toBe(true);
    });

    it('should not rollback non-existent migration', async () => {
      const rollbackResult = await migrationManager.rollbackMigration('non-existent');
      
      expect(rollbackResult.success).toBe(false);
      expect(rollbackResult.message).toBe('Migration or state not found for rollback');
    });
  });

  describe('Migration Information', () => {
    it('should return all available migrations', () => {
      const migrations = migrationManager.getAllMigrations();
      
      expect(migrations).toHaveLength(1);
      expect(migrations[0].id).toBe('data-structure-refactoring-v1');
      expect(migrations[0].name).toBe('Data Structure Refactoring');
    });

    it('should return specific migration by ID', () => {
      const migration = migrationManager.getMigration('data-structure-refactoring-v1');
      
      expect(migration).toBeDefined();
      expect(migration?.name).toBe('Data Structure Refactoring');
      expect(migration?.steps).toHaveLength(5);
    });

    it('should return null for non-existent migration', () => {
      const migration = migrationManager.getMigration('non-existent');
      expect(migration).toBeNull();
    });
  });

  describe('Feature Flag Integration', () => {
    it('should enable feature flags during migration', async () => {
      // Enable prerequisites
      featureFlags.setOverride('json-schema-validation', true);
      featureFlags.setOverride('error-boundary-system', true);

      await migrationManager.executeMigration('data-structure-refactoring-v1');
      
      // Check that migration enabled the required flags
      expect(featureFlags.isEnabled('enum-constants-system')).toBe(true);
      expect(featureFlags.isEnabled('new-data-services')).toBe(true);
    });

    it('should disable feature flags during rollback', async () => {
      // Enable prerequisites and run migration
      featureFlags.setOverride('json-schema-validation', true);
      featureFlags.setOverride('error-boundary-system', true);
      
      await migrationManager.executeMigration('data-structure-refactoring-v1');
      
      // Verify flags are enabled
      expect(featureFlags.isEnabled('enum-constants-system')).toBe(true);
      expect(featureFlags.isEnabled('new-data-services')).toBe(true);
      
      // Rollback
      await migrationManager.rollbackMigration('data-structure-refactoring-v1');
      
      // Verify flags are disabled
      expect(featureFlags.isEnabled('data-structure-refactoring')).toBe(false);
      expect(featureFlags.isEnabled('enum-constants-system')).toBe(false);
      expect(featureFlags.isEnabled('new-data-services')).toBe(false);
    });
  });
});