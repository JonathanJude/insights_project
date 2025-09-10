import { beforeEach, describe, expect, it } from 'vitest';
import { ChartTypes, Months, SentimentLabels } from '../../constants/enums';
import { ConstantService } from '../constant-service';

describe('ConstantService', () => {
  let constantService: ConstantService;

  beforeEach(() => {
    constantService = ConstantService.getInstance();
    constantService.clearCache();
  });

  describe('Enum Validation', () => {
    it('should validate enum values correctly', () => {
      const result = constantService.validateEnum('Month', 'January');
      expect(result.isValid).toBe(true);
      expect(result.enumType).toBe('Month');
      expect(result.value).toBe('January');
      expect(result.suggestions).toBeUndefined();
    });

    it('should return false for invalid enum values', () => {
      const result = constantService.validateEnum('Month', 'InvalidMonth');
      expect(result.isValid).toBe(false);
      expect(result.enumType).toBe('Month');
      expect(result.value).toBe('InvalidMonth');
      expect(result.suggestions).toBeDefined();
      expect(result.suggestions!.length).toBeGreaterThan(0);
    });

    it('should handle unknown enum types', () => {
      const result = constantService.validateEnum('UnknownEnum', 'value');
      expect(result.isValid).toBe(false);
      expect(result.suggestions).toContain('Unknown enum type: UnknownEnum');
    });

    it('should cache validation results', () => {
      // First call
      const result1 = constantService.validateEnum('Month', 'January');
      expect(result1.isValid).toBe(true);

      // Second call should use cache
      const result2 = constantService.validateEnum('Month', 'January');
      expect(result2).toEqual(result1);

      const stats = constantService.getCacheStats();
      expect(stats.size).toBeGreaterThan(0);
    });
  });

  describe('Batch Validation', () => {
    it('should validate multiple enum values', () => {
      const validations = [
        { enumType: 'Month', value: 'January' },
        { enumType: 'SentimentLabel', value: 'Positive' },
        { enumType: 'ChartType', value: 'line' }
      ];

      const results = constantService.validateMultiple(validations);
      expect(results.size).toBe(3);

      expect(results.get('Month:January')?.isValid).toBe(true);
      expect(results.get('SentimentLabel:Positive')?.isValid).toBe(true);
      expect(results.get('ChartType:line')?.isValid).toBe(true);
    });

    it('should handle mixed valid and invalid values', () => {
      const validations = [
        { enumType: 'Month', value: 'January' },
        { enumType: 'Month', value: 'InvalidMonth' }
      ];

      const results = constantService.validateMultiple(validations);
      expect(results.size).toBe(2);

      expect(results.get('Month:January')?.isValid).toBe(true);
      expect(results.get('Month:InvalidMonth')?.isValid).toBe(false);
    });
  });

  describe('Enum Options', () => {
    it('should return month options', () => {
      const options = constantService.getMonths();
      expect(options).toHaveLength(12);
      expect(options[0].value).toBe(Months.JANUARY);
      expect(options[0].label).toBe('January');
    });

    it('should return sentiment label options with colors', () => {
      const options = constantService.getSentimentLabels();
      expect(options).toHaveLength(5);
      expect(options[0]).toHaveProperty('value');
      expect(options[0]).toHaveProperty('label');
      expect(options[0]).toHaveProperty('color');
    });

    it('should return chart type options', () => {
      const options = constantService.getChartTypes();
      expect(options.length).toBeGreaterThan(0);
      expect(options[0]).toHaveProperty('value');
      expect(options[0]).toHaveProperty('label');
    });

    it('should return generic enum options', () => {
      const options = constantService.getEnumOptions('Month');
      expect(options).toHaveLength(12);
      expect(options[0]).toHaveProperty('value');
      expect(options[0]).toHaveProperty('label');
    });

    it('should return empty array for unknown enum type', () => {
      const options = constantService.getEnumOptions('UnknownEnum');
      expect(options).toHaveLength(0);
    });
  });

  describe('Utility Functions', () => {
    it('should calculate sentiment scores', () => {
      expect(constantService.getSentimentScore(SentimentLabels.VERY_POSITIVE)).toBe(2);
      expect(constantService.getSentimentScore(SentimentLabels.POSITIVE)).toBe(1);
      expect(constantService.getSentimentScore(SentimentLabels.NEUTRAL)).toBe(0);
      expect(constantService.getSentimentScore(SentimentLabels.NEGATIVE)).toBe(-1);
      expect(constantService.getSentimentScore(SentimentLabels.VERY_NEGATIVE)).toBe(-2);
    });

    it('should convert scores to sentiment labels', () => {
      expect(constantService.getSentimentFromScore(2)).toBe(SentimentLabels.VERY_POSITIVE);
      expect(constantService.getSentimentFromScore(0)).toBe(SentimentLabels.NEUTRAL);
      expect(constantService.getSentimentFromScore(-2)).toBe(SentimentLabels.VERY_NEGATIVE);
    });

    it('should validate HTTP status codes', () => {
      expect(constantService.isSuccessStatusCode(200)).toBe(true);
      expect(constantService.isSuccessStatusCode(201)).toBe(true);
      expect(constantService.isSuccessStatusCode(400)).toBe(false);
      expect(constantService.isSuccessStatusCode(500)).toBe(false);
    });
  });

  describe('Data Validation Against Enums', () => {
    it('should validate data against enum schema', () => {
      const data = {
        month: 'January',
        sentiment: 'Positive',
        chartType: 'line'
      };

      const schema = {
        month: 'Month',
        sentiment: 'SentimentLabel',
        chartType: 'ChartType'
      };

      const result = constantService.validateDataAgainstEnums(data, schema);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid enum values in data', () => {
      const data = {
        month: 'InvalidMonth',
        sentiment: 'Positive',
        chartType: 'invalidChart'
      };

      const schema = {
        month: 'Month',
        sentiment: 'SentimentLabel',
        chartType: 'ChartType'
      };

      const result = constantService.validateDataAgainstEnums(data, schema);
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].field).toBe('month');
      expect(result.errors[1].field).toBe('chartType');
    });

    it('should handle nested object paths', () => {
      const data = {
        config: {
          display: {
            theme: 'light'
          }
        }
      };

      const schema = {
        'config.display.theme': 'ThemeOption'
      };

      const result = constantService.validateDataAgainstEnums(data, schema);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should generate warnings for missing values', () => {
      const data = {
        month: 'January'
        // sentiment is missing
      };

      const schema = {
        month: 'Month',
        sentiment: 'SentimentLabel'
      };

      const result = constantService.validateDataAgainstEnums(data, schema);
      expect(result.isValid).toBe(true); // No errors, just warnings
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].field).toBe('sentiment');
    });
  });

  describe('Type-Safe Enum Checking', () => {
    it('should check enum values type-safely', () => {
      expect(constantService.isValidEnumValue(Months, 'January')).toBe(true);
      expect(constantService.isValidEnumValue(Months, 'InvalidMonth')).toBe(false);
      expect(constantService.isValidEnumValue(ChartTypes, 'line')).toBe(true);
      expect(constantService.isValidEnumValue(ChartTypes, 'invalid')).toBe(false);
    });

    it('should get enum value by label', () => {
      expect(constantService.getEnumValueByLabel(Months, 'january')).toBe('January');
      expect(constantService.getEnumValueByLabel(Months, 'JANUARY')).toBe('January');
      expect(constantService.getEnumValueByLabel(Months, 'InvalidMonth')).toBeNull();
    });
  });

  describe('Configuration Management', () => {
    it('should update configuration', () => {
      const originalConfig = constantService.getConfig();
      expect(originalConfig.enableValidation).toBe(true);

      constantService.updateConfig({ enableValidation: false });
      const updatedConfig = constantService.getConfig();
      expect(updatedConfig.enableValidation).toBe(false);
    });

    it('should maintain other config values when updating', () => {
      // Reset to default config first
      constantService.updateConfig({ 
        enableValidation: true, 
        enableSuggestions: true, 
        cacheResults: true 
      });
      
      constantService.updateConfig({ enableSuggestions: false });
      const config = constantService.getConfig();
      expect(config.enableSuggestions).toBe(false);
      expect(config.enableValidation).toBe(true); // Should remain unchanged
      expect(config.cacheResults).toBe(true); // Should remain unchanged
    });
  });

  describe('Available Enum Types', () => {
    it('should return list of available enum types', () => {
      const enumTypes = constantService.getAvailableEnumTypes();
      expect(enumTypes.length).toBeGreaterThan(0);
      expect(enumTypes).toContain('Month');
      expect(enumTypes).toContain('SentimentLabel');
      expect(enumTypes).toContain('ChartType');
    });
  });

  describe('Cache Management', () => {
    it('should clear cache', () => {
      // Add some items to cache
      constantService.validateEnum('Month', 'January');
      constantService.validateEnum('Month', 'February');

      let stats = constantService.getCacheStats();
      expect(stats.size).toBeGreaterThan(0);

      // Clear cache
      constantService.clearCache();
      stats = constantService.getCacheStats();
      expect(stats.size).toBe(0);
    });
  });
});