import { describe, expect, it } from 'vitest';
import {
    AllEnumHelpers,
    AllEnumValidators,
    ChartTypes,
    DataQualityLevels,
    DaysOfWeek,
    Months,
    SentimentLabels,
    SentimentUtils,
    SystemUtils
} from '../index';

describe('Enum Validation System', () => {
  describe('Core Enum Validators', () => {
    it('should validate months correctly', () => {
      expect(AllEnumValidators.isValidMonth('January')).toBe(true);
      expect(AllEnumValidators.isValidMonth('December')).toBe(true);
      expect(AllEnumValidators.isValidMonth('InvalidMonth')).toBe(false);
      expect(AllEnumValidators.isValidMonth('')).toBe(false);
    });

    it('should validate days of week correctly', () => {
      expect(AllEnumValidators.isValidDayOfWeek('Monday')).toBe(true);
      expect(AllEnumValidators.isValidDayOfWeek('Sunday')).toBe(true);
      expect(AllEnumValidators.isValidDayOfWeek('InvalidDay')).toBe(false);
    });

    it('should validate Nigerian regions correctly', () => {
      expect(AllEnumValidators.isValidNigerianRegion('North Central')).toBe(true);
      expect(AllEnumValidators.isValidNigerianRegion('South West')).toBe(true);
      expect(AllEnumValidators.isValidNigerianRegion('Invalid Region')).toBe(false);
    });

    it('should validate gender correctly', () => {
      expect(AllEnumValidators.isValidGender('male')).toBe(true);
      expect(AllEnumValidators.isValidGender('female')).toBe(true);
      expect(AllEnumValidators.isValidGender('non-binary')).toBe(true);
      expect(AllEnumValidators.isValidGender('invalid')).toBe(false);
    });
  });

  describe('Political Enum Validators', () => {
    it('should validate political levels correctly', () => {
      expect(AllEnumValidators.isValidPoliticalLevel('federal')).toBe(true);
      expect(AllEnumValidators.isValidPoliticalLevel('state')).toBe(true);
      expect(AllEnumValidators.isValidPoliticalLevel('local')).toBe(true);
      expect(AllEnumValidators.isValidPoliticalLevel('invalid')).toBe(false);
    });

    it('should validate position categories correctly', () => {
      expect(AllEnumValidators.isValidPositionCategory('executive')).toBe(true);
      expect(AllEnumValidators.isValidPositionCategory('legislative')).toBe(true);
      expect(AllEnumValidators.isValidPositionCategory('judicial')).toBe(true);
      expect(AllEnumValidators.isValidPositionCategory('invalid')).toBe(false);
    });

    it('should validate verification status correctly', () => {
      expect(AllEnumValidators.isValidVerificationStatus('verified')).toBe(true);
      expect(AllEnumValidators.isValidVerificationStatus('pending')).toBe(true);
      expect(AllEnumValidators.isValidVerificationStatus('invalid')).toBe(false);
    });
  });

  describe('Sentiment Enum Validators', () => {
    it('should validate sentiment labels correctly', () => {
      expect(AllEnumValidators.isValidSentimentLabel('Very Positive')).toBe(true);
      expect(AllEnumValidators.isValidSentimentLabel('Neutral')).toBe(true);
      expect(AllEnumValidators.isValidSentimentLabel('Very Negative')).toBe(true);
      expect(AllEnumValidators.isValidSentimentLabel('Invalid')).toBe(false);
    });

    it('should validate emotion types correctly', () => {
      expect(AllEnumValidators.isValidEmotionType('Joy')).toBe(true);
      expect(AllEnumValidators.isValidEmotionType('Anger')).toBe(true);
      expect(AllEnumValidators.isValidEmotionType('Mixed')).toBe(true);
      expect(AllEnumValidators.isValidEmotionType('Invalid')).toBe(false);
    });

    it('should validate intensity levels correctly', () => {
      expect(AllEnumValidators.isValidIntensityLevel('Mild')).toBe(true);
      expect(AllEnumValidators.isValidIntensityLevel('Moderate')).toBe(true);
      expect(AllEnumValidators.isValidIntensityLevel('Strong')).toBe(true);
      expect(AllEnumValidators.isValidIntensityLevel('Invalid')).toBe(false);
    });
  });

  describe('UI Enum Validators', () => {
    it('should validate loading states correctly', () => {
      expect(AllEnumValidators.isValidLoadingState('idle')).toBe(true);
      expect(AllEnumValidators.isValidLoadingState('loading')).toBe(true);
      expect(AllEnumValidators.isValidLoadingState('success')).toBe(true);
      expect(AllEnumValidators.isValidLoadingState('error')).toBe(true);
      expect(AllEnumValidators.isValidLoadingState('invalid')).toBe(false);
    });

    it('should validate chart types correctly', () => {
      expect(AllEnumValidators.isValidChartType('line')).toBe(true);
      expect(AllEnumValidators.isValidChartType('bar')).toBe(true);
      expect(AllEnumValidators.isValidChartType('pie')).toBe(true);
      expect(AllEnumValidators.isValidChartType('invalid')).toBe(false);
    });

    it('should validate theme options correctly', () => {
      expect(AllEnumValidators.isValidThemeOption('light')).toBe(true);
      expect(AllEnumValidators.isValidThemeOption('dark')).toBe(true);
      expect(AllEnumValidators.isValidThemeOption('auto')).toBe(true);
      expect(AllEnumValidators.isValidThemeOption('invalid')).toBe(false);
    });
  });

  describe('System Enum Validators', () => {
    it('should validate error types correctly', () => {
      expect(AllEnumValidators.isValidErrorType('Data not found')).toBe(true);
      expect(AllEnumValidators.isValidErrorType('Network error')).toBe(true);
      expect(AllEnumValidators.isValidErrorType('Invalid error')).toBe(false);
    });

    it('should validate data quality levels correctly', () => {
      expect(AllEnumValidators.isValidDataQualityLevel('Excellent')).toBe(true);
      expect(AllEnumValidators.isValidDataQualityLevel('Good')).toBe(true);
      expect(AllEnumValidators.isValidDataQualityLevel('Poor')).toBe(true);
      expect(AllEnumValidators.isValidDataQualityLevel('Invalid')).toBe(false);
    });

    it('should validate HTTP status codes correctly', () => {
      expect(AllEnumValidators.isValidHttpStatusCode(200)).toBe(true);
      expect(AllEnumValidators.isValidHttpStatusCode(404)).toBe(true);
      expect(AllEnumValidators.isValidHttpStatusCode(500)).toBe(true);
      expect(AllEnumValidators.isValidHttpStatusCode(999)).toBe(false);
    });
  });

  describe('Enum Helpers', () => {
    it('should return month options', () => {
      const options = AllEnumHelpers.getMonthOptions();
      expect(options).toHaveLength(12);
      expect(options[0]).toEqual({ value: 'January', label: 'January' });
      expect(options[11]).toEqual({ value: 'December', label: 'December' });
    });

    it('should return day of week options', () => {
      const options = AllEnumHelpers.getDayOfWeekOptions();
      expect(options).toHaveLength(7);
      expect(options[0]).toEqual({ value: 'Sunday', label: 'Sunday' });
      expect(options[6]).toEqual({ value: 'Saturday', label: 'Saturday' });
    });

    it('should return sentiment label options with colors', () => {
      const options = AllEnumHelpers.getSentimentLabelOptions();
      expect(options).toHaveLength(5);
      expect(options[0]).toHaveProperty('value');
      expect(options[0]).toHaveProperty('label');
      expect(options[0]).toHaveProperty('color');
    });

    it('should return chart type options', () => {
      const options = AllEnumHelpers.getChartTypeOptions();
      expect(options.length).toBeGreaterThan(0);
      expect(options[0]).toHaveProperty('value');
      expect(options[0]).toHaveProperty('label');
    });
  });

  describe('Utility Functions', () => {
    describe('SentimentUtils', () => {
      it('should convert sentiment labels to scores', () => {
        expect(SentimentUtils.getSentimentScore(SentimentLabels.VERY_POSITIVE)).toBe(2);
        expect(SentimentUtils.getSentimentScore(SentimentLabels.POSITIVE)).toBe(1);
        expect(SentimentUtils.getSentimentScore(SentimentLabels.NEUTRAL)).toBe(0);
        expect(SentimentUtils.getSentimentScore(SentimentLabels.NEGATIVE)).toBe(-1);
        expect(SentimentUtils.getSentimentScore(SentimentLabels.VERY_NEGATIVE)).toBe(-2);
      });

      it('should convert scores to sentiment labels', () => {
        expect(SentimentUtils.getSentimentFromScore(2)).toBe(SentimentLabels.VERY_POSITIVE);
        expect(SentimentUtils.getSentimentFromScore(1)).toBe(SentimentLabels.POSITIVE);
        expect(SentimentUtils.getSentimentFromScore(0)).toBe(SentimentLabels.NEUTRAL);
        expect(SentimentUtils.getSentimentFromScore(-1)).toBe(SentimentLabels.NEGATIVE);
        expect(SentimentUtils.getSentimentFromScore(-2)).toBe(SentimentLabels.VERY_NEGATIVE);
      });

      it('should handle edge cases in score conversion', () => {
        expect(SentimentUtils.getSentimentFromScore(1.5)).toBe(SentimentLabels.VERY_POSITIVE);
        expect(SentimentUtils.getSentimentFromScore(0.5)).toBe(SentimentLabels.POSITIVE);
        expect(SentimentUtils.getSentimentFromScore(-0.5)).toBe(SentimentLabels.NEGATIVE);
        expect(SentimentUtils.getSentimentFromScore(-1.5)).toBe(SentimentLabels.VERY_NEGATIVE);
      });
    });

    describe('SystemUtils', () => {
      it('should convert data quality levels to scores', () => {
        expect(SystemUtils.getDataQualityScore(DataQualityLevels.EXCELLENT)).toBe(5);
        expect(SystemUtils.getDataQualityScore(DataQualityLevels.GOOD)).toBe(4);
        expect(SystemUtils.getDataQualityScore(DataQualityLevels.FAIR)).toBe(3);
        expect(SystemUtils.getDataQualityScore(DataQualityLevels.POOR)).toBe(2);
        expect(SystemUtils.getDataQualityScore(DataQualityLevels.UNKNOWN)).toBe(1);
      });

      it('should identify HTTP status code types', () => {
        expect(SystemUtils.isSuccessStatusCode(200)).toBe(true);
        expect(SystemUtils.isSuccessStatusCode(201)).toBe(true);
        expect(SystemUtils.isSuccessStatusCode(299)).toBe(true);
        expect(SystemUtils.isSuccessStatusCode(300)).toBe(false);
        expect(SystemUtils.isSuccessStatusCode(400)).toBe(false);
        expect(SystemUtils.isSuccessStatusCode(500)).toBe(false);

        expect(SystemUtils.isClientErrorStatusCode(400)).toBe(true);
        expect(SystemUtils.isClientErrorStatusCode(404)).toBe(true);
        expect(SystemUtils.isClientErrorStatusCode(499)).toBe(true);
        expect(SystemUtils.isClientErrorStatusCode(200)).toBe(false);
        expect(SystemUtils.isClientErrorStatusCode(500)).toBe(false);

        expect(SystemUtils.isServerErrorStatusCode(500)).toBe(true);
        expect(SystemUtils.isServerErrorStatusCode(502)).toBe(true);
        expect(SystemUtils.isServerErrorStatusCode(599)).toBe(true);
        expect(SystemUtils.isServerErrorStatusCode(200)).toBe(false);
        expect(SystemUtils.isServerErrorStatusCode(400)).toBe(false);
      });
    });
  });

  describe('Type Safety', () => {
    it('should maintain type safety with enum values', () => {
      const month: Months = Months.JANUARY;
      expect(AllEnumValidators.isValidMonth(month)).toBe(true);

      const day: DaysOfWeek = DaysOfWeek.MONDAY;
      expect(AllEnumValidators.isValidDayOfWeek(day)).toBe(true);

      const sentiment: SentimentLabels = SentimentLabels.POSITIVE;
      expect(AllEnumValidators.isValidSentimentLabel(sentiment)).toBe(true);
    });

    it('should work with enum values in switch statements', () => {
      const getChartColor = (type: ChartTypes): string => {
        switch (type) {
          case ChartTypes.LINE:
            return 'blue';
          case ChartTypes.BAR:
            return 'green';
          case ChartTypes.PIE:
            return 'orange';
          default:
            return 'gray';
        }
      };

      expect(getChartColor(ChartTypes.LINE)).toBe('blue');
      expect(getChartColor(ChartTypes.BAR)).toBe('green');
      expect(getChartColor(ChartTypes.PIE)).toBe('orange');
    });
  });
});