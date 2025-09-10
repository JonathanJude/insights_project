export interface SchemaVersion {
  version: string;
  releaseDate: string;
  changes: SchemaChange[];
  breakingChanges: boolean;
  migrationRequired: boolean;
}

export interface SchemaChange {
  type: 'added' | 'modified' | 'deprecated' | 'removed';
  path: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
}

export interface MigrationPlan {
  fromVersion: string;
  toVersion: string;
  steps: MigrationStep[];
  estimatedTime: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface MigrationStep {
  order: number;
  description: string;
  action: 'transform' | 'validate' | 'backup' | 'rollback';
  reversible: boolean;
}

export class SchemaVersionManager {
  private static instance: SchemaVersionManager;
  private versions: Map<string, Map<string, SchemaVersion>> = new Map();

  private constructor() {
    this.initializeVersionHistory();
  }

  public static getInstance(): SchemaVersionManager {
    if (!SchemaVersionManager.instance) {
      SchemaVersionManager.instance = new SchemaVersionManager();
    }
    return SchemaVersionManager.instance;
  }

  private initializeVersionHistory(): void {
    // States schema versions
    this.versions.set('states', new Map([
      ['1.0.0', {
        version: '1.0.0',
        releaseDate: '2024-01-15',
        changes: [
          {
            type: 'added',
            path: 'root',
            description: 'Initial schema definition for Nigerian states',
            impact: 'low'
          }
        ],
        breakingChanges: false,
        migrationRequired: false
      }]
    ]));

    // Parties schema versions
    this.versions.set('parties', new Map([
      ['1.0.0', {
        version: '1.0.0',
        releaseDate: '2024-01-15',
        changes: [
          {
            type: 'added',
            path: 'root',
            description: 'Initial schema definition for political parties',
            impact: 'low'
          }
        ],
        breakingChanges: false,
        migrationRequired: false
      }]
    ]));

    // Politicians schema versions
    this.versions.set('politicians', new Map([
      ['1.0.0', {
        version: '1.0.0',
        releaseDate: '2024-01-15',
        changes: [
          {
            type: 'added',
            path: 'root',
            description: 'Initial schema definition for politicians',
            impact: 'low'
          }
        ],
        breakingChanges: false,
        migrationRequired: false
      }]
    ]));
  }

  public getSchemaVersion(schemaName: string, version: string): SchemaVersion | null {
    const schemaVersions = this.versions.get(schemaName);
    return schemaVersions?.get(version) || null;
  }

  public getLatestVersion(schemaName: string): string | null {
    const schemaVersions = this.versions.get(schemaName);
    if (!schemaVersions || schemaVersions.size === 0) return null;

    const versions = Array.from(schemaVersions.keys());
    return versions.sort(this.compareVersions).pop() || null;
  }

  public getAllVersions(schemaName: string): string[] {
    const schemaVersions = this.versions.get(schemaName);
    if (!schemaVersions) return [];

    return Array.from(schemaVersions.keys()).sort(this.compareVersions);
  }

  public isVersionSupported(schemaName: string, version: string): boolean {
    const schemaVersions = this.versions.get(schemaName);
    return schemaVersions?.has(version) || false;
  }

  public hasBreakingChanges(schemaName: string, fromVersion: string, toVersion: string): boolean {
    const schemaVersions = this.versions.get(schemaName);
    if (!schemaVersions) return false;

    const versions = this.getVersionsBetween(schemaName, fromVersion, toVersion);
    return versions.some(version => {
      const versionInfo = schemaVersions.get(version);
      return versionInfo?.breakingChanges || false;
    });
  }

  public requiresMigration(schemaName: string, fromVersion: string, toVersion: string): boolean {
    const schemaVersions = this.versions.get(schemaName);
    if (!schemaVersions) return false;

    const versions = this.getVersionsBetween(schemaName, fromVersion, toVersion);
    return versions.some(version => {
      const versionInfo = schemaVersions.get(version);
      return versionInfo?.migrationRequired || false;
    });
  }

  public generateMigrationPlan(schemaName: string, fromVersion: string, toVersion: string): MigrationPlan | null {
    if (!this.isVersionSupported(schemaName, fromVersion) || !this.isVersionSupported(schemaName, toVersion)) {
      return null;
    }

    const hasBreaking = this.hasBreakingChanges(schemaName, fromVersion, toVersion);
    const requiresMigration = this.requiresMigration(schemaName, fromVersion, toVersion);

    const steps: MigrationStep[] = [];
    let stepOrder = 1;

    // Always start with backup
    steps.push({
      order: stepOrder++,
      description: `Backup current ${schemaName} data`,
      action: 'backup',
      reversible: true
    });

    if (requiresMigration) {
      steps.push({
        order: stepOrder++,
        description: `Transform ${schemaName} data from v${fromVersion} to v${toVersion}`,
        action: 'transform',
        reversible: !hasBreaking
      });
    }

    steps.push({
      order: stepOrder++,
      description: `Validate ${schemaName} data against v${toVersion} schema`,
      action: 'validate',
      reversible: true
    });

    return {
      fromVersion,
      toVersion,
      steps,
      estimatedTime: this.estimateMigrationTime(steps.length, hasBreaking),
      riskLevel: hasBreaking ? 'high' : requiresMigration ? 'medium' : 'low'
    };
  }

  private getVersionsBetween(schemaName: string, fromVersion: string, toVersion: string): string[] {
    const allVersions = this.getAllVersions(schemaName);
    const fromIndex = allVersions.indexOf(fromVersion);
    const toIndex = allVersions.indexOf(toVersion);

    if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) {
      return [];
    }

    return allVersions.slice(fromIndex + 1, toIndex + 1);
  }

  private compareVersions(a: string, b: string): number {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aPart = aParts[i] || 0;
      const bPart = bParts[i] || 0;

      if (aPart < bPart) return -1;
      if (aPart > bPart) return 1;
    }

    return 0;
  }

  private estimateMigrationTime(stepCount: number, hasBreaking: boolean): string {
    const baseTime = stepCount * 2; // 2 minutes per step
    const breakingMultiplier = hasBreaking ? 2 : 1;
    const totalMinutes = baseTime * breakingMultiplier;

    if (totalMinutes < 60) {
      return `${totalMinutes} minutes`;
    } else {
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  }

  public addSchemaVersion(schemaName: string, versionInfo: SchemaVersion): void {
    if (!this.versions.has(schemaName)) {
      this.versions.set(schemaName, new Map());
    }

    const schemaVersions = this.versions.get(schemaName)!;
    schemaVersions.set(versionInfo.version, versionInfo);
  }

  public getVersionChanges(schemaName: string, version: string): SchemaChange[] {
    const versionInfo = this.getSchemaVersion(schemaName, version);
    return versionInfo?.changes || [];
  }

  public getChangesSince(schemaName: string, sinceVersion: string): SchemaChange[] {
    const allVersions = this.getAllVersions(schemaName);
    const sinceIndex = allVersions.indexOf(sinceVersion);

    if (sinceIndex === -1) return [];

    const laterVersions = allVersions.slice(sinceIndex + 1);
    const changes: SchemaChange[] = [];

    laterVersions.forEach(version => {
      const versionChanges = this.getVersionChanges(schemaName, version);
      changes.push(...versionChanges);
    });

    return changes;
  }
}

// Export singleton instance
export const schemaVersionManager = SchemaVersionManager.getInstance();