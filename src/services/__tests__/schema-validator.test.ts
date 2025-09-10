import { beforeEach, describe, expect, it } from 'vitest';
import { SchemaValidatorService } from '../schema-validator';

describe('SchemaValidatorService', () => {
  let validator: SchemaValidatorService;

  beforeEach(() => {
    validator = SchemaValidatorService.getInstance();
  });

  describe('States Schema Validation', () => {
    it('should validate valid states data', () => {
      const validStatesData = {
        states: [
          {
            id: 'NG-LA',
            name: 'Lagos',
            code: 'LA',
            capital: 'Ikeja',
            region: 'south-west',
            population: 15946991,
            coordinates: {
              latitude: 6.5244,
              longitude: 3.3792
            },
            metadata: {
              established: '1967-05-27',
              area_km2: 3345,
              timezone: 'WAT'
            }
          }
        ]
      };

      const result = validator.validateData('states', validStatesData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.schemaVersion).toBe('1.0.0');
    });

    it('should reject invalid state ID format', () => {
      const invalidStatesData = {
        states: [
          {
            id: 'INVALID-ID',
            name: 'Lagos',
            code: 'LA',
            capital: 'Ikeja',
            region: 'south-west',
            coordinates: {
              latitude: 6.5244,
              longitude: 3.3792
            }
          }
        ]
      };

      const result = validator.validateData('states', invalidStatesData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].path).toBe('/states/0/id');
    });

    it('should reject invalid region', () => {
      const invalidStatesData = {
        states: [
          {
            id: 'NG-LA',
            name: 'Lagos',
            code: 'LA',
            capital: 'Ikeja',
            region: 'invalid-region',
            coordinates: {
              latitude: 6.5244,
              longitude: 3.3792
            }
          }
        ]
      };

      const result = validator.validateData('states', invalidStatesData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.path.includes('region'))).toBe(true);
    });

    it('should generate warnings for missing optional fields', () => {
      const statesDataWithoutOptional = {
        states: [
          {
            id: 'NG-LA',
            name: 'Lagos',
            code: 'LA',
            capital: 'Ikeja',
            region: 'south-west',
            coordinates: {
              latitude: 6.5244,
              longitude: 3.3792
            }
          }
        ]
      };

      const result = validator.validateData('states', statesDataWithoutOptional);
      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.path.includes('population'))).toBe(true);
    });
  });

  describe('Parties Schema Validation', () => {
    it('should validate valid parties data', () => {
      const validPartiesData = {
        parties: [
          {
            id: 'NG-PARTY-APC',
            name: 'All Progressives Congress',
            abbreviation: 'APC',
            founded: '2013-02-06',
            colors: {
              primary: '#FF0000',
              secondary: '#FFFFFF'
            },
            logo: '/assets/logos/apc.png',
            metadata: {
              status: 'active'
            }
          }
        ]
      };

      const result = validator.validateData('parties', validPartiesData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid party ID format', () => {
      const invalidPartiesData = {
        parties: [
          {
            id: 'INVALID-PARTY-ID',
            name: 'All Progressives Congress',
            abbreviation: 'APC',
            colors: {
              primary: '#FF0000'
            }
          }
        ]
      };

      const result = validator.validateData('parties', invalidPartiesData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.path.includes('id'))).toBe(true);
    });

    it('should reject invalid color format', () => {
      const invalidPartiesData = {
        parties: [
          {
            id: 'NG-PARTY-APC',
            name: 'All Progressives Congress',
            abbreviation: 'APC',
            colors: {
              primary: 'red' // Invalid hex format
            }
          }
        ]
      };

      const result = validator.validateData('parties', invalidPartiesData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.path.includes('primary'))).toBe(true);
    });
  });

  describe('Politicians Schema Validation', () => {
    it('should validate valid politicians data', () => {
      const validPoliticiansData = {
        politicians: [
          {
            id: 'NG-POL-001',
            firstName: 'Peter',
            lastName: 'Obi',
            fullName: 'Peter Gregory Obi',
            partyId: 'NG-PARTY-LP',
            currentPositionId: 'NG-POS-ASPIRANT',
            stateOfOriginId: 'NG-AN',
            dateOfBirth: '1961-07-19',
            gender: 'male',
            metadata: {
              isActive: true,
              verificationStatus: 'verified'
            }
          }
        ]
      };

      const result = validator.validateData('politicians', validPoliticiansData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid politician ID format', () => {
      const invalidPoliticiansData = {
        politicians: [
          {
            id: 'INVALID-ID',
            firstName: 'Peter',
            lastName: 'Obi',
            fullName: 'Peter Gregory Obi'
          }
        ]
      };

      const result = validator.validateData('politicians', invalidPoliticiansData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.path.includes('id'))).toBe(true);
    });

    it('should generate warnings for missing recommended fields', () => {
      const politiciansDataMinimal = {
        politicians: [
          {
            id: 'NG-POL-001',
            firstName: 'Peter',
            lastName: 'Obi',
            fullName: 'Peter Gregory Obi'
          }
        ]
      };

      const result = validator.validateData('politicians', politiciansDataMinimal);
      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.path.includes('dateOfBirth'))).toBe(true);
      expect(result.warnings.some(w => w.path.includes('socialMedia'))).toBe(true);
    });
  });

  describe('Cross-Reference Validation', () => {
    it('should validate cross-references between data files', () => {
      const testData = {
        states: {
          states: [
            { id: 'NG-LA', name: 'Lagos', code: 'LA', capital: 'Ikeja', region: 'south-west', coordinates: { latitude: 6.5244, longitude: 3.3792 } }
          ]
        },
        parties: {
          parties: [
            { id: 'NG-PARTY-APC', name: 'All Progressives Congress', abbreviation: 'APC', colors: { primary: '#FF0000' } }
          ]
        },
        politicians: {
          politicians: [
            {
              id: 'NG-POL-001',
              firstName: 'Test',
              lastName: 'Politician',
              fullName: 'Test Politician',
              partyId: 'NG-PARTY-APC',
              stateOfOriginId: 'NG-LA'
            }
          ]
        }
      };

      const result = validator.validateCrossReferences(testData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid cross-references', () => {
      const testData = {
        states: {
          states: [
            { id: 'NG-LA', name: 'Lagos', code: 'LA', capital: 'Ikeja', region: 'south-west', coordinates: { latitude: 6.5244, longitude: 3.3792 } }
          ]
        },
        parties: {
          parties: [
            { id: 'NG-PARTY-APC', name: 'All Progressives Congress', abbreviation: 'APC', colors: { primary: '#FF0000' } }
          ]
        },
        politicians: {
          politicians: [
            {
              id: 'NG-POL-001',
              firstName: 'Test',
              lastName: 'Politician',
              fullName: 'Test Politician',
              partyId: 'NG-PARTY-INVALID', // Invalid reference
              stateOfOriginId: 'NG-INVALID' // Invalid reference
            }
          ]
        }
      };

      const result = validator.validateCrossReferences(testData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.message.includes('Invalid party reference'))).toBe(true);
      expect(result.errors.some(e => e.message.includes('Invalid state reference'))).toBe(true);
    });
  });

  describe('Batch Validation', () => {
    it('should validate multiple data files in batch', () => {
      const validations = [
        {
          schemaName: 'states',
          data: {
            states: [
              { id: 'NG-LA', name: 'Lagos', code: 'LA', capital: 'Ikeja', region: 'south-west', coordinates: { latitude: 6.5244, longitude: 3.3792 } }
            ]
          },
          fileName: 'states.json'
        },
        {
          schemaName: 'parties',
          data: {
            parties: [
              { id: 'NG-PARTY-APC', name: 'All Progressives Congress', abbreviation: 'APC', colors: { primary: '#FF0000' } }
            ]
          },
          fileName: 'parties.json'
        }
      ];

      const results = validator.validateBatch(validations);
      expect(results.size).toBe(2);
      expect(results.get('states.json')?.isValid).toBe(true);
      expect(results.get('parties.json')?.isValid).toBe(true);
    });
  });

  describe('Sentiment Sources Schema Validation', () => {
    it('should validate valid sentiment sources data', () => {
      const validSourcesData = {
        sources: [
          {
            id: 'twitter',
            name: 'Twitter',
            type: 'social_media',
            isActive: true,
            apiEndpoint: 'https://api.twitter.com/2/',
            rateLimit: {
              requestsPerMinute: 300,
              requestsPerHour: 15000
            },
            dataFields: ['text', 'author', 'timestamp'],
            metadata: {
              description: 'Twitter platform',
              color: '#1DA1F2',
              tags: ['social']
            }
          }
        ]
      };

      const result = validator.validateData('sentiment-sources', validSourcesData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid source ID format', () => {
      const invalidSourcesData = {
        sources: [
          {
            id: 'Invalid ID!',
            name: 'Test',
            type: 'social_media',
            isActive: true
          }
        ]
      };

      const result = validator.validateData('sentiment-sources', invalidSourcesData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.path.includes('id'))).toBe(true);
    });

    it('should reject invalid source type', () => {
      const invalidSourcesData = {
        sources: [
          {
            id: 'test',
            name: 'Test',
            type: 'invalid_type',
            isActive: true
          }
        ]
      };

      const result = validator.validateData('sentiment-sources', invalidSourcesData);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.path.includes('type'))).toBe(true);
    });
  });

  describe('Schema Information', () => {
    it('should return schema information', () => {
      const schemaInfo = validator.getSchemaInfo('states');
      expect(schemaInfo).toBeDefined();
      expect(schemaInfo?.id).toBe('states.schema.json');
      expect(schemaInfo?.version).toBe('1.0.0');
      expect(schemaInfo?.title).toBe('Nigerian States Schema');
    });

    it('should return all available schemas', () => {
      const schemas = validator.getAllSchemas();
      expect(schemas).toContain('states');
      expect(schemas).toContain('parties');
      expect(schemas).toContain('politicians');
      expect(schemas).toContain('sentiment-sources');
    });

    it('should validate schema versions', () => {
      expect(validator.validateSchemaVersion('states', '1.0.0')).toBe(true);
      expect(validator.validateSchemaVersion('states', '2.0.0')).toBe(false);
    });
  });
});