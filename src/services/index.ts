// Core services
export { SchemaValidatorService, schemaValidator } from './schema-validator';
export type { SchemaInfo, ValidationError, ValidationResult, ValidationWarning } from './schema-validator';

export { SchemaVersionManager, schemaVersionManager } from './schema-version-manager';
export type { MigrationPlan, MigrationStep, SchemaChange, SchemaVersion } from './schema-version-manager';

export { FeatureFlagService, featureFlags, useFeatureFlag, useFeatureFlagStatus } from './feature-flags';
export type { FeatureFlag, FeatureFlagCondition, FeatureFlagContext } from './feature-flags';

export { MigrationManager, migrationManager } from './migration-manager';
export type { MigrationResult, MigrationState, RollbackPlan } from './migration-manager';

export { ConstantService, constantService, useConstantService, useEnumValidation } from './constant-service';
export type { ConstantServiceConfig, EnumValidationResult } from './constant-service';

export { SentimentSourcesService, sentimentSourcesService, useSentimentSources } from './sentiment-sources-service';
export type { SentimentSource, SentimentSourceOption, SentimentSourcesData } from './sentiment-sources-service';

// Data Infrastructure Services
export { DataLoaderService, dataLoader } from './data-loader';
export type { CacheEntry, DataLoaderMetrics, LoadingOptions, LoadingState } from './data-loader';

export { CacheStorageType, IntelligentCacheService, InvalidationStrategy, intelligentCache } from './intelligent-cache';
export type { CacheConfig, CacheMetadata, CacheStats, CacheEntry as IntelligentCacheEntry, InvalidationEvent } from './intelligent-cache';

export { DataValidationFramework, dataValidationFramework } from './data-validation-framework';
export type { DataQualityScore, IntegrityCheck, IntegrityViolation, RepairAction, ValidationReport } from './data-validation-framework';

export { ServiceCompatibilityLayer, ServiceVersion, serviceCompatibilityLayer } from './service-compatibility-layer';
export type { AdapterConfig, LegacyPolitician, MigrationConfig, NewPolitician } from './service-compatibility-layer';

