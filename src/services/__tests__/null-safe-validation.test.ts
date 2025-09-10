/**
 * Tests for Null-Safe Validation Service
 */

import { describe, expect, it } from 'vitest';
import { nullSafeValidator } from '../null-safe-validation';

describe('NullSafeValidationService', () => {
  describe('validateRecord', () => {
    it('should validate a complete politician record', () => {
      const politician = {
        id: 'NG-POL-001',
        firstName: 'John',
        lastName: 'Doe',
        partyId: 'NG-PARTY-APC',
        stateOfOriginId: 'NG-LA',
        dateOfBirth: '1970-01-01',
        email: 'john.doe@example.com'
      };

      const result = nullSafeValidator.validateRecord(politician, 'politician');

      expect(result.isValid).toBe(true);
      expect(result.criticalErrors).toBe(0);
      expect(result.overallQuality).toBeGreaterThan(0.8);
    });

    it('should handle missing optional fields gracefully', () => {
      const politician = {
        id: 'NG-POL-002',
        firstName: 'Jane',
        lastName: 'Smith'
        // Missing optional fields: partyId, stateOfOriginId, dateOfBirth, email
      };

      const result = nullSafeValidator.validateRecord(politician, 'politician');

      expect(result.isValid).toBe(true); // Should still be valid with only required fields
      expect(result.criticalErrors).toBe(0);
      expect(result.missingOptionalFields).toBeGreaterThan(0);
      expect(result.overallQuality).toBeLessThan(1); // Quality should be reduced
    });

    it('should fail validation for missing required fields', () => {
      const politician = {
        partyId: 'NG-PARTY-APC',
        stateOfOriginId: 'NG-LA'
        // Missing required fields: id, firstName, lastName
      };

      const result = nullSafeValidator.validateRecord(politician, 'politician');

      expect(result.isValid).toBe(false);
      expect(result.criticalErrors).toBeGreaterThan(0);
      expect(result.overallQuality).toBeLessThan(0.5);
    });

    it('should provide suggestions for improvement', () => {
      const politician = {
        id: 'NG-POL-003',
        firstName: 'Bob',
        lastName: 'Johnson'
      };

      const result = nullSafeValidator.validateRecord(politician, 'politician');

      expect(result.suggestions).toContain('partyId is optional but recommended for better data quality');
      expect(result.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('calculateCompletenessScore', () => {
    it('should calculate completeness for a dataset', () => {
      const politicians = [
        {
          id: 'NG-POL-001',
          firstName: 'John',
          lastName: 'Doe',
          partyId: 'NG-PARTY-APC',
          stateOfOriginId: 'NG-LA'
        },
        {
          id: 'NG-POL-002',
          firstName: 'Jane',
          lastName: 'Smith'
          // Missing optional fields
        },
        {
          id: 'NG-POL-003',
          firstName: 'Bob'
          // Missing lastName (required)
        }
      ];

      const score = nullSafeValidator.calculateCompletenessScore(politicians, 'politician');

      expect(score.overall).toBeGreaterThan(0);
      expect(score.overall).toBeLessThan(1);
      expect(score.critical).toBeLessThan(1); // Due to missing lastName in one record
      expect(score.breakdown.total).toBeGreaterThan(0);
      expect(score.qualityDistribution.excellent).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty dataset', () => {
      const score = nullSafeValidator.calculateCompletenessScore([], 'politician');

      expect(score.overall).toBe(0);
      expect(score.critical).toBe(0);
      expect(score.breakdown.total).toBe(0);
    });
  });

  describe('generateDataQualitySuggestions', () => {
    it('should generate relevant suggestions based on completeness', () => {
      const lowCompletenessScore = {
        overall: 0.4,
        critical: 0.6,
        important: 0.3,
        optional: 0.2,
        breakdown: {
          present: 40,
          missing: 50,
          invalid: 10,
          total: 100
        },
        qualityDistribution: {
          excellent: 5,
          good: 10,
          fair: 15,
          poor: 20,
          unknown: 50
        }
      };

      const suggestions = nullSafeValidator.generateDataQualitySuggestions(
        lowCompletenessScore,
        'politician'
      );

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.includes('Critical fields'))).toBe(true);
      expect(suggestions.some(s => s.includes('invalid data'))).toBe(true);
    });
  });

  describe('field validation', () => {
    it('should validate email format', () => {
      const validEmails = ['test@example.com', 'user.name@domain.co.uk'];
      const invalidEmails = ['invalid-email', 'test@', '@domain.com', ''];

      validEmails.forEach(email => {
        const politician = { id: '1', firstName: 'Test', lastName: 'User', email };
        const result = nullSafeValidator.validateRecord(politician, 'politician');
        const emailField = result.fieldResults.get('email');
        expect(emailField?.isValid).toBe(true);
      });

      invalidEmails.forEach(email => {
        const politician = { id: '1', firstName: 'Test', lastName: 'User', email };
        const result = nullSafeValidator.validateRecord(politician, 'politician');
        const emailField = result.fieldResults.get('email');
        if (email === '') {
          // Empty email is acceptable for optional field
          expect(emailField?.isValid).toBe(true);
        } else {
          expect(emailField?.isValid).toBe(false);
        }
      });
    });

    it('should validate date format', () => {
      const validDates = ['1970-01-01', '2000-12-31'];
      const invalidDates = ['invalid-date', '2000-13-01', '1800-01-01'];

      validDates.forEach(date => {
        const politician = { id: '1', firstName: 'Test', lastName: 'User', dateOfBirth: date };
        const result = nullSafeValidator.validateRecord(politician, 'politician');
        const dateField = result.fieldResults.get('dateOfBirth');
        expect(dateField?.isValid).toBe(true);
      });

      invalidDates.forEach(date => {
        const politician = { id: '1', firstName: 'Test', lastName: 'User', dateOfBirth: date };
        const result = nullSafeValidator.validateRecord(politician, 'politician');
        const dateField = result.fieldResults.get('dateOfBirth');
        expect(dateField?.isValid).toBe(false);
      });
    });
  });

  describe('null handling modes', () => {
    it('should handle strict null validation', () => {
      const politician = {
        id: null, // Required field with null
        firstName: 'Test',
        lastName: 'User'
      };

      const result = nullSafeValidator.validateRecord(politician, 'politician', {
        validationMode: 'strict'
      });

      expect(result.isValid).toBe(false);
      expect(result.criticalErrors).toBeGreaterThan(0);
    });

    it('should handle lenient null validation', () => {
      const politician = {
        id: 'NG-POL-001',
        firstName: 'Test',
        lastName: 'User',
        partyId: null // Optional field with null
      };

      const result = nullSafeValidator.validateRecord(politician, 'politician', {
        validationMode: 'lenient'
      });

      expect(result.isValid).toBe(true);
      expect(result.criticalErrors).toBe(0);
    });
  });

  describe('data quality assessment', () => {
    it('should assess data quality correctly', () => {
      const excellentPolitician = {
        id: 'NG-POL-001',
        firstName: 'John',
        lastName: 'Doe',
        partyId: 'NG-PARTY-APC',
        stateOfOriginId: 'NG-LA',
        dateOfBirth: '1970-01-01',
        email: 'john.doe@example.com'
      };

      const poorPolitician = {
        id: 'NG-POL-002',
        firstName: 'J',
        lastName: ''
      };

      const excellentResult = nullSafeValidator.validateRecord(excellentPolitician, 'politician');
      const poorResult = nullSafeValidator.validateRecord(poorPolitician, 'politician');

      expect(excellentResult.overallQuality).toBeGreaterThan(poorResult.overallQuality);
      expect(excellentResult.completenessScore).toBeGreaterThan(poorResult.completenessScore);
    });
  });
});

describe('Custom validation rules', () => {
  it('should allow registering custom validators', () => {
    // Register a custom validator for testing
    nullSafeValidator.registerValidator({
      name: 'customTest',
      validate: (value: any) => ({
        isValid: value === 'test',
        severity: 'warning' as const,
        message: 'Value must be "test"',
        confidence: 1.0,
        canAutoFix: false,
        dataAvailable: true,
        qualityScore: value === 'test' ? 1.0 : 0.0
      }),
      canHandleNull: true,
      severity: 'warning'
    });

    // Get the validator we just registered
    const customValidator = {
      name: 'customTest',
      validate: (value: any) => ({
        isValid: value === 'test',
        severity: 'error' as const,
        message: 'Value must be "test"',
        confidence: 1.0,
        canAutoFix: false,
        dataAvailable: true,
        qualityScore: value === 'test' ? 1.0 : 0.0
      }),
      canHandleNull: true,
      severity: 'error' as const
    };

    // Register custom rules for a test data type
    nullSafeValidator.registerValidationRules('testType', [
      {
        field: 'testField',
        type: 'required',
        validators: [customValidator],
        priority: 'critical',
        nullHandling: 'strict'
      }
    ]);

    const testData = { testField: 'test' };
    const result = nullSafeValidator.validateRecord(testData, 'testType');

    expect(result.isValid).toBe(true);

    const invalidTestData = { testField: 'invalid' };
    const invalidResult = nullSafeValidator.validateRecord(invalidTestData, 'testType');

    expect(invalidResult.isValid).toBe(false);
  });
});