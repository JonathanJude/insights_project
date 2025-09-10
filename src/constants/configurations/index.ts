// Export all configuration constants and utilities
export * from './chart-configs';
export * from './color-schemes';

// Re-export utilities for convenience
import { ChartConfigUtils } from './chart-configs';
import { ColorSchemeUtils } from './color-schemes';

export const ConfigurationUtils = {
  Chart: ChartConfigUtils,
  ColorScheme: ColorSchemeUtils
};

// Combined configuration interface for centralized access
export interface ApplicationConfiguration {
  charts: typeof ChartConfigUtils;
  colors: typeof ColorSchemeUtils;
}

// Configuration factory for creating application-wide settings
export const ConfigurationFactory = {
  createApplicationConfig: (): ApplicationConfiguration => ({
    charts: ChartConfigUtils,
    colors: ColorSchemeUtils
  }),

  getDefaultChartConfig: () => ChartConfigUtils.getConfiguration,
  getDefaultColorScheme: () => ColorSchemeUtils.getColorScheme,
  getResponsiveConfig: () => ChartConfigUtils.getResponsiveConfig
};