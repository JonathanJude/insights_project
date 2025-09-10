/**
 * Tests for Data Validation Framework
 */

import { beforeEach, describe, expect, it } from "vitest";
import type { LGA, PoliticalParty, Politician, PollingUnit, State, Ward } from "../../types/data-models";
import { DataValidatorService } from "../data-validation-framework";

describe("DataValidatorService", () => {
  let validator: DataValidatorService;

  beforeEach(() => {
    validator = DataValidatorService.getInstance();
  });

  describe("singleton pattern", () => {
    it("should return the same instance", () => {
      const instance1 = DataValidatorService.getInstance();
      const instance2 = DataValidatorService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("validateStatesData", () => {
    it("should validate valid states data", () => {
      const validData = {
        states: [
          {
            id: 'NG-LA',
            name: 'Lagos',
            code: 'LA',
            capital: 'Ikeja',
            region: 'south-west',
            coordinates: { latitude: 6.5244, longitude: 3.3792 }
          }
        ] as State[]
      };

      const result = validator.validateStatesData(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect missing required fields", () => {
      const invalidData = {
        states: [
          {
            id: 'NG-LA',
            // Missing name, code, capital, region, coordinates
          }
        ] as any[]
      };

      const result = validator.validateStatesData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('name'))).toBe(true);
    });

    it("should validate coordinate ranges", () => {
      const invalidData = {
        states: [
          {
            id: 'NG-LA',
            name: 'Lagos',
            code: 'LA',
            capital: 'Ikeja',
            region: 'south-west',
            coordinates: { latitude: 200, longitude: 200 } // Invalid coordinates
          }
        ] as State[]
      };

      const result = validator.validateStatesData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('latitude'))).toBe(true);
      expect(result.errors.some(e => e.includes('longitude'))).toBe(true);
    });

    it("should validate region values", () => {
      const invalidData = {
        states: [
          {
            id: 'NG-LA',
            name: 'Lagos',
            code: 'LA',
            capital: 'Ikeja',
            region: 'invalid-region',
            coordinates: { latitude: 6.5244, longitude: 3.3792 }
          }
        ] as State[]
      };

      const result = validator.validateStatesData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('region'))).toBe(true);
    });

    it("should detect duplicate IDs", () => {
      const invalidData = {
        states: [
          {
            id: 'NG-LA',
            name: 'Lagos',
            code: 'LA',
            capital: 'Ikeja',
            region: 'south-west',
            coordinates: { latitude: 6.5244, longitude: 3.3792 }
          },
          {
            id: 'NG-LA', // Duplicate ID
            name: 'Lagos State',
            code: 'LA2',
            capital: 'Ikeja',
            region: 'south-west',
            coordinates: { latitude: 6.5244, longitude: 3.3792 }
          }
        ] as State[]
      };

      const result = validator.validateStatesData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('duplicate'))).toBe(true);
    });
  });

  describe("validatePoliticiansData", () => {
    it("should validate valid politicians data", () => {
      const validData = {
        politicians: [
          {
            id: 'NG-POL-001',
            firstName: 'John',
            lastName: 'Doe',
            fullName: 'John Doe',
            partyId: 'NG-PARTY-APC',
            currentPositionId: 'NG-POS-GOVERNOR',
            stateOfOriginId: 'NG-LA',
            dateOfBirth: '1970-01-01',
            gender: 'male'
          }
        ] as Politician[]
      };

      const result = validator.validatePoliticiansData(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect missing required fields", () => {
      const invalidData = {
        politicians: [
          {
            id: 'NG-POL-001',
            // Missing firstName, lastName, fullName
          }
        ] as any[]
      };

      const result = validator.validatePoliticiansData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('firstName'))).toBe(true);
      expect(result.errors.some(e => e.includes('lastName'))).toBe(true);
    });

    it("should validate date formats", () => {
      const invalidData = {
        politicians: [
          {
            id: 'NG-POL-001',
            firstName: 'John',
            lastName: 'Doe',
            fullName: 'John Doe',
            dateOfBirth: 'invalid-date'
          }
        ] as Politician[]
      };

      const result = validator.validatePoliticiansData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('dateOfBirth'))).toBe(true);
    });

    it("should validate gender values", () => {
      const invalidData = {
        politicians: [
          {
            id: 'NG-POL-001',
            firstName: 'John',
            lastName: 'Doe',
            fullName: 'John Doe',
            gender: 'invalid-gender'
          }
        ] as Politician[]
      };

      const result = validator.validatePoliticiansData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('gender'))).toBe(true);
    });

    it("should validate social media handles format", () => {
      const invalidData = {
        politicians: [
          {
            id: 'NG-POL-001',
            firstName: 'John',
            lastName: 'Doe',
            fullName: 'John Doe',
            socialMedia: {
              twitter: 'invalid-handle', // Should start with @
              facebook: 'valid-handle'
            }
          }
        ] as Politician[]
      };

      const result = validator.validatePoliticiansData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('twitter'))).toBe(true);
    });
  });

  describe("validateLGAsData", () => {
    it("should validate valid LGAs data", () => {
      const validData = {
        lgas: [
          {
            id: 'NG-LA-SUR',
            name: 'Surulere',
            code: 'SUR',
            stateId: 'NG-LA',
            coordinates: { latitude: 6.5056, longitude: 3.3619 }
          }
        ] as LGA[]
      };

      const result = validator.validateLGAsData(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate state ID references", () => {
      const invalidData = {
        lgas: [
          {
            id: 'NG-LA-SUR',
            name: 'Surulere',
            code: 'SUR',
            stateId: 'INVALID-STATE',
            coordinates: { latitude: 6.5056, longitude: 3.3619 }
          }
        ] as LGA[]
      };

      const result = validator.validateLGAsData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('stateId'))).toBe(true);
    });
  });

  describe("validateWardsData", () => {
    it("should validate valid wards data", () => {
      const validData = {
        wards: [
          {
            id: 'NG-LA-SUR-W01',
            number: 1,
            name: 'Ward 1',
            lgaId: 'NG-LA-SUR',
            stateId: 'NG-LA',
            coordinates: { latitude: 6.5089, longitude: 3.3654 }
          }
        ] as Ward[]
      };

      const result = validator.validateWardsData(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate ward numbers", () => {
      const invalidData = {
        wards: [
          {
            id: 'NG-LA-SUR-W01',
            number: -1, // Invalid ward number
            name: 'Ward 1',
            lgaId: 'NG-LA-SUR',
            stateId: 'NG-LA',
            coordinates: { latitude: 6.5089, longitude: 3.3654 }
          }
        ] as Ward[]
      };

      const result = validator.validateWardsData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('number'))).toBe(true);
    });
  });

  describe("validatePollingUnitsData", () => {
    it("should validate valid polling units data", () => {
      const validData = {
        pollingUnits: [
          {
            id: 'NG-LA-SUR-W01-PU001',
            code: 'SUR/001/001',
            name: 'Polling Unit 1',
            wardId: 'NG-LA-SUR-W01',
            lgaId: 'NG-LA-SUR',
            stateId: 'NG-LA',
            address: 'Test Address',
            coordinates: { latitude: 6.5092, longitude: 3.3658 },
            capacity: { maxVoters: 500, registeredVoters: 400 },
            facilities: { accessible: true, hasElectricity: true, hasWater: true, securityLevel: 'medium' }
          }
        ] as PollingUnit[]
      };

      const result = validator.validatePollingUnitsData(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate capacity constraints", () => {
      const invalidData = {
        pollingUnits: [
          {
            id: 'NG-LA-SUR-W01-PU001',
            code: 'SUR/001/001',
            name: 'Polling Unit 1',
            wardId: 'NG-LA-SUR-W01',
            lgaId: 'NG-LA-SUR',
            stateId: 'NG-LA',
            address: 'Test Address',
            coordinates: { latitude: 6.5092, longitude: 3.3658 },
            capacity: { maxVoters: 500, registeredVoters: 600 }, // More registered than max
            facilities: { accessible: true, hasElectricity: true, hasWater: true, securityLevel: 'medium' }
          }
        ] as PollingUnit[]
      };

      const result = validator.validatePollingUnitsData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('capacity'))).toBe(true);
    });

    it("should validate security level values", () => {
      const invalidData = {
        pollingUnits: [
          {
            id: 'NG-LA-SUR-W01-PU001',
            code: 'SUR/001/001',
            name: 'Polling Unit 1',
            wardId: 'NG-LA-SUR-W01',
            lgaId: 'NG-LA-SUR',
            stateId: 'NG-LA',
            address: 'Test Address',
            coordinates: { latitude: 6.5092, longitude: 3.3658 },
            capacity: { maxVoters: 500, registeredVoters: 400 },
            facilities: { accessible: true, hasElectricity: true, hasWater: true, securityLevel: 'invalid' as any }
          }
        ] as PollingUnit[]
      };

      const result = validator.validatePollingUnitsData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('securityLevel'))).toBe(true);
    });
  });

  describe("validatePartiesData", () => {
    it("should validate valid parties data", () => {
      const validData = {
        parties: [
          {
            id: 'NG-PARTY-APC',
            name: 'All Progressives Congress',
            abbreviation: 'APC',
            colors: { primary: '#FF0000', secondary: '#FFFFFF' }
          }
        ] as PoliticalParty[]
      };

      const result = validator.validatePartiesData(validData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should validate color formats", () => {
      const invalidData = {
        parties: [
          {
            id: 'NG-PARTY-APC',
            name: 'All Progressives Congress',
            abbreviation: 'APC',
            colors: { primary: 'red', secondary: 'white' } // Invalid hex format
          }
        ] as PoliticalParty[]
      };

      const result = validator.validatePartiesData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('color'))).toBe(true);
    });

    it("should validate abbreviation length", () => {
      const invalidData = {
        parties: [
          {
            id: 'NG-PARTY-APC',
            name: 'All Progressives Congress',
            abbreviation: 'VERYLONGABBREVIATION', // Too long
            colors: { primary: '#FF0000' }
          }
        ] as PoliticalParty[]
      };

      const result = validator.validatePartiesData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('abbreviation'))).toBe(true);
    });
  });

  describe("cross-reference validation", () => {
    it("should validate foreign key relationships", () => {
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

    it("should detect broken foreign key relationships", () => {
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
      expect(result.errors.some(e => e.includes('party reference'))).toBe(true);
      expect(result.errors.some(e => e.includes('state reference'))).toBe(true);
    });
  });

  describe("batch validation", () => {
    it("should validate multiple data files", () => {
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

    it("should handle validation errors in batch", () => {
      const validations = [
        {
          schemaName: 'states',
          data: {
            states: [
              { id: '', name: '', code: '', capital: '', region: '', coordinates: { latitude: 200, longitude: 200 } } // Invalid data
            ]
          },
          fileName: 'invalid-states.json'
        }
      ];

      const results = validator.validateBatch(validations);

      expect(results.size).toBe(1);
      expect(results.get('invalid-states.json')?.isValid).toBe(false);
      expect(results.get('invalid-states.json')?.errors.length).toBeGreaterThan(0);
    });
  });

  describe("data integrity checks", () => {
    it("should validate data completeness", () => {
      const incompleteData = {
        states: [
          {
            id: 'NG-LA',
            name: 'Lagos',
            code: 'LA',
            capital: 'Ikeja',
            region: 'south-west',
            coordinates: { latitude: 6.5244, longitude: 3.3792 }
            // Missing optional fields like population, metadata
          }
        ] as State[]
      };

      const result = validator.validateStatesData({ states: incompleteData });

      expect(result.isValid).toBe(true); // Should still be valid
      expect(result.warnings.length).toBeGreaterThan(0); // But should have warnings
    });

    it("should calculate validation scores", () => {
      const validData = {
        states: [
          {
            id: 'NG-LA',
            name: 'Lagos',
            code: 'LA',
            capital: 'Ikeja',
            region: 'south-west',
            population: 15946991,
            coordinates: { latitude: 6.5244, longitude: 3.3792 },
            metadata: { established: '1967-05-27', area_km2: 3345, timezone: 'WAT' }
          }
        ] as State[]
      };

      const result = validator.validateStatesData(validData);

      expect(result.score).toBeGreaterThan(90); // High score for complete data
    });
  });

  describe("error recovery", () => {
    it("should provide helpful error messages", () => {
      const invalidData = {
        states: [
          {
            id: '',
            name: '',
            coordinates: { latitude: 200, longitude: 200 }
          }
        ] as any[]
      };

      const result = validator.validateStatesData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.errors.every(error => error.length > 0)).toBe(true);
      expect(result.errors.some(error => error.includes('required'))).toBe(true);
    });

    it("should suggest fixes for common issues", () => {
      const invalidData = {
        politicians: [
          {
            id: 'NG-POL-001',
            firstName: 'John',
            lastName: 'Doe',
            fullName: 'John Doe',
            socialMedia: {
              twitter: 'johndoe' // Missing @ symbol
            }
          }
        ] as Politician[]
      };

      const result = validator.validatePoliticiansData(invalidData);

      expect(result.isValid).toBe(false);
      expect(result.suggestions.length).toBeGreaterThan(0);
      expect(result.suggestions.some(s => s.includes('@'))).toBe(true);
    });
  });
});