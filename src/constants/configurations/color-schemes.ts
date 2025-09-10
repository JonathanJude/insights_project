import { ColorSchemes, ThemeOptions } from '../enums';

// Color Palette Interface
export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  hover: string;
  active: string;
  disabled: string;
  gradient: string[];
}

// Extended Color Palette with Semantic Colors
export interface ExtendedColorPalette extends ColorPalette {
  success: string;
  warning: string;
  error: string;
  info: string;
  successLight: string;
  warningLight: string;
  errorLight: string;
  infoLight: string;
  successDark: string;
  warningDark: string;
  errorDark: string;
  infoDark: string;
}

// Chart-Specific Color Palettes
export interface ChartColorPalette {
  scheme: ColorSchemes;
  colors: string[];
  backgroundColors: string[];
  borderColors: string[];
  gradients: string[][];
  opacity: {
    full: number;
    high: number;
    medium: number;
    low: number;
  };
}

// Light Theme Color Schemes
export const LIGHT_COLOR_SCHEMES: Record<ColorSchemes, ExtendedColorPalette> = {
  [ColorSchemes.PRIMARY]: {
    primary: '#3B82F6',
    secondary: '#1E40AF',
    accent: '#60A5FA',
    background: '#FFFFFF',
    surface: '#F8FAFC',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    hover: '#F3F4F6',
    active: '#EBF8FF',
    disabled: '#D1D5DB',
    gradient: ['#3B82F6', '#1E40AF', '#1E3A8A'],
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
    successLight: '#D1FAE5',
    warningLight: '#FEF3C7',
    errorLight: '#FEE2E2',
    infoLight: '#CFFAFE',
    successDark: '#047857',
    warningDark: '#92400E',
    errorDark: '#B91C1C',
    infoDark: '#0E7490'
  },
  [ColorSchemes.SECONDARY]: {
    primary: '#8B5CF6',
    secondary: '#5B21B6',
    accent: '#A78BFA',
    background: '#FFFFFF',
    surface: '#FAFAFA',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    hover: '#F3F4F6',
    active: '#F3E8FF',
    disabled: '#D1D5DB',
    gradient: ['#8B5CF6', '#7C3AED', '#5B21B6'],
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
    successLight: '#D1FAE5',
    warningLight: '#FEF3C7',
    errorLight: '#FEE2E2',
    infoLight: '#CFFAFE',
    successDark: '#047857',
    warningDark: '#92400E',
    errorDark: '#B91C1C',
    infoDark: '#0E7490'
  },
  [ColorSchemes.SUCCESS]: {
    primary: '#10B981',
    secondary: '#047857',
    accent: '#34D399',
    background: '#FFFFFF',
    surface: '#F0FDF4',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    hover: '#F3F4F6',
    active: '#ECFDF5',
    disabled: '#D1D5DB',
    gradient: ['#10B981', '#059669', '#047857'],
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
    successLight: '#D1FAE5',
    warningLight: '#FEF3C7',
    errorLight: '#FEE2E2',
    infoLight: '#CFFAFE',
    successDark: '#047857',
    warningDark: '#92400E',
    errorDark: '#B91C1C',
    infoDark: '#0E7490'
  },
  [ColorSchemes.WARNING]: {
    primary: '#F59E0B',
    secondary: '#92400E',
    accent: '#FCD34D',
    background: '#FFFFFF',
    surface: '#FFFBEB',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    hover: '#F3F4F6',
    active: '#FEF3C7',
    disabled: '#D1D5DB',
    gradient: ['#F59E0B', '#D97706', '#92400E'],
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
    successLight: '#D1FAE5',
    warningLight: '#FEF3C7',
    errorLight: '#FEE2E2',
    infoLight: '#CFFAFE',
    successDark: '#047857',
    warningDark: '#92400E',
    errorDark: '#B91C1C',
    infoDark: '#0E7490'
  },
  [ColorSchemes.DANGER]: {
    primary: '#EF4444',
    secondary: '#991B1B',
    accent: '#F87171',
    background: '#FFFFFF',
    surface: '#FEF2F2',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    hover: '#F3F4F6',
    active: '#FEE2E2',
    disabled: '#D1D5DB',
    gradient: ['#EF4444', '#DC2626', '#991B1B'],
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
    successLight: '#D1FAE5',
    warningLight: '#FEF3C7',
    errorLight: '#FEE2E2',
    infoLight: '#CFFAFE',
    successDark: '#047857',
    warningDark: '#92400E',
    errorDark: '#B91C1C',
    infoDark: '#0E7490'
  },
  [ColorSchemes.INFO]: {
    primary: '#06B6D4',
    secondary: '#0E7490',
    accent: '#22D3EE',
    background: '#FFFFFF',
    surface: '#F0F9FF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    hover: '#F3F4F6',
    active: '#E0F2FE',
    disabled: '#D1D5DB',
    gradient: ['#06B6D4', '#0891B2', '#0E7490'],
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4',
    successLight: '#D1FAE5',
    warningLight: '#FEF3C7',
    errorLight: '#FEE2E2',
    infoLight: '#CFFAFE',
    successDark: '#047857',
    warningDark: '#92400E',
    errorDark: '#B91C1C',
    infoDark: '#0E7490'
  }
};

// Dark Theme Color Schemes
export const DARK_COLOR_SCHEMES: Record<ColorSchemes, ExtendedColorPalette> = {
  [ColorSchemes.PRIMARY]: {
    primary: '#60A5FA',
    secondary: '#3B82F6',
    accent: '#93C5FD',
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    border: '#374151',
    hover: '#374151',
    active: '#1E3A8A',
    disabled: '#4B5563',
    gradient: ['#60A5FA', '#3B82F6', '#1E40AF'],
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#22D3EE',
    successLight: '#065F46',
    warningLight: '#92400E',
    errorLight: '#991B1B',
    infoLight: '#0E7490',
    successDark: '#D1FAE5',
    warningDark: '#FEF3C7',
    errorDark: '#FEE2E2',
    infoDark: '#CFFAFE'
  },
  [ColorSchemes.SECONDARY]: {
    primary: '#A78BFA',
    secondary: '#8B5CF6',
    accent: '#C4B5FD',
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    border: '#374151',
    hover: '#374151',
    active: '#5B21B6',
    disabled: '#4B5563',
    gradient: ['#A78BFA', '#8B5CF6', '#7C3AED'],
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#22D3EE',
    successLight: '#065F46',
    warningLight: '#92400E',
    errorLight: '#991B1B',
    infoLight: '#0E7490',
    successDark: '#D1FAE5',
    warningDark: '#FEF3C7',
    errorDark: '#FEE2E2',
    infoDark: '#CFFAFE'
  },
  [ColorSchemes.SUCCESS]: {
    primary: '#34D399',
    secondary: '#10B981',
    accent: '#6EE7B7',
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    border: '#374151',
    hover: '#374151',
    active: '#047857',
    disabled: '#4B5563',
    gradient: ['#34D399', '#10B981', '#059669'],
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#22D3EE',
    successLight: '#065F46',
    warningLight: '#92400E',
    errorLight: '#991B1B',
    infoLight: '#0E7490',
    successDark: '#D1FAE5',
    warningDark: '#FEF3C7',
    errorDark: '#FEE2E2',
    infoDark: '#CFFAFE'
  },
  [ColorSchemes.WARNING]: {
    primary: '#FBBF24',
    secondary: '#F59E0B',
    accent: '#FCD34D',
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    border: '#374151',
    hover: '#374151',
    active: '#92400E',
    disabled: '#4B5563',
    gradient: ['#FBBF24', '#F59E0B', '#D97706'],
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#22D3EE',
    successLight: '#065F46',
    warningLight: '#92400E',
    errorLight: '#991B1B',
    infoLight: '#0E7490',
    successDark: '#D1FAE5',
    warningDark: '#FEF3C7',
    errorDark: '#FEE2E2',
    infoDark: '#CFFAFE'
  },
  [ColorSchemes.DANGER]: {
    primary: '#F87171',
    secondary: '#EF4444',
    accent: '#FCA5A5',
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    border: '#374151',
    hover: '#374151',
    active: '#991B1B',
    disabled: '#4B5563',
    gradient: ['#F87171', '#EF4444', '#DC2626'],
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#22D3EE',
    successLight: '#065F46',
    warningLight: '#92400E',
    errorLight: '#991B1B',
    infoLight: '#0E7490',
    successDark: '#D1FAE5',
    warningDark: '#FEF3C7',
    errorDark: '#FEE2E2',
    infoDark: '#CFFAFE'
  },
  [ColorSchemes.INFO]: {
    primary: '#22D3EE',
    secondary: '#06B6D4',
    accent: '#67E8F9',
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    border: '#374151',
    hover: '#374151',
    active: '#0E7490',
    disabled: '#4B5563',
    gradient: ['#22D3EE', '#06B6D4', '#0891B2'],
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    info: '#22D3EE',
    successLight: '#065F46',
    warningLight: '#92400E',
    errorLight: '#991B1B',
    infoLight: '#0E7490',
    successDark: '#D1FAE5',
    warningDark: '#FEF3C7',
    errorDark: '#FEE2E2',
    infoDark: '#CFFAFE'
  }
};

// Chart Color Palettes
export const CHART_COLOR_PALETTES: Record<ColorSchemes, ChartColorPalette> = {
  [ColorSchemes.PRIMARY]: {
    scheme: ColorSchemes.PRIMARY,
    colors: ['#3B82F6', '#1E40AF', '#1E3A8A', '#312E81', '#1E1B4B'],
    backgroundColors: ['rgba(59, 130, 246, 0.2)', 'rgba(30, 64, 175, 0.2)', 'rgba(30, 58, 138, 0.2)', 'rgba(49, 46, 129, 0.2)', 'rgba(30, 27, 75, 0.2)'],
    borderColors: ['#3B82F6', '#1E40AF', '#1E3A8A', '#312E81', '#1E1B4B'],
    gradients: [
      ['#3B82F6', '#1E40AF'],
      ['#1E40AF', '#1E3A8A'],
      ['#1E3A8A', '#312E81'],
      ['#312E81', '#1E1B4B']
    ],
    opacity: { full: 1.0, high: 0.8, medium: 0.5, low: 0.2 }
  },
  [ColorSchemes.SECONDARY]: {
    scheme: ColorSchemes.SECONDARY,
    colors: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95'],
    backgroundColors: ['rgba(139, 92, 246, 0.2)', 'rgba(124, 58, 237, 0.2)', 'rgba(109, 40, 217, 0.2)', 'rgba(91, 33, 182, 0.2)', 'rgba(76, 29, 149, 0.2)'],
    borderColors: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6', '#4C1D95'],
    gradients: [
      ['#8B5CF6', '#7C3AED'],
      ['#7C3AED', '#6D28D9'],
      ['#6D28D9', '#5B21B6'],
      ['#5B21B6', '#4C1D95']
    ],
    opacity: { full: 1.0, high: 0.8, medium: 0.5, low: 0.2 }
  },
  [ColorSchemes.SUCCESS]: {
    scheme: ColorSchemes.SUCCESS,
    colors: ['#10B981', '#059669', '#047857', '#065F46', '#064E3B'],
    backgroundColors: ['rgba(16, 185, 129, 0.2)', 'rgba(5, 150, 105, 0.2)', 'rgba(4, 120, 87, 0.2)', 'rgba(6, 95, 70, 0.2)', 'rgba(6, 78, 59, 0.2)'],
    borderColors: ['#10B981', '#059669', '#047857', '#065F46', '#064E3B'],
    gradients: [
      ['#10B981', '#059669'],
      ['#059669', '#047857'],
      ['#047857', '#065F46'],
      ['#065F46', '#064E3B']
    ],
    opacity: { full: 1.0, high: 0.8, medium: 0.5, low: 0.2 }
  },
  [ColorSchemes.WARNING]: {
    scheme: ColorSchemes.WARNING,
    colors: ['#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F'],
    backgroundColors: ['rgba(245, 158, 11, 0.2)', 'rgba(217, 119, 6, 0.2)', 'rgba(180, 83, 9, 0.2)', 'rgba(146, 64, 14, 0.2)', 'rgba(120, 53, 15, 0.2)'],
    borderColors: ['#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F'],
    gradients: [
      ['#F59E0B', '#D97706'],
      ['#D97706', '#B45309'],
      ['#B45309', '#92400E'],
      ['#92400E', '#78350F']
    ],
    opacity: { full: 1.0, high: 0.8, medium: 0.5, low: 0.2 }
  },
  [ColorSchemes.DANGER]: {
    scheme: ColorSchemes.DANGER,
    colors: ['#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D'],
    backgroundColors: ['rgba(239, 68, 68, 0.2)', 'rgba(220, 38, 38, 0.2)', 'rgba(185, 28, 28, 0.2)', 'rgba(153, 27, 27, 0.2)', 'rgba(127, 29, 29, 0.2)'],
    borderColors: ['#EF4444', '#DC2626', '#B91C1C', '#991B1B', '#7F1D1D'],
    gradients: [
      ['#EF4444', '#DC2626'],
      ['#DC2626', '#B91C1C'],
      ['#B91C1C', '#991B1B'],
      ['#991B1B', '#7F1D1D']
    ],
    opacity: { full: 1.0, high: 0.8, medium: 0.5, low: 0.2 }
  },
  [ColorSchemes.INFO]: {
    scheme: ColorSchemes.INFO,
    colors: ['#06B6D4', '#0891B2', '#0E7490', '#155E75', '#164E63'],
    backgroundColors: ['rgba(6, 182, 212, 0.2)', 'rgba(8, 145, 178, 0.2)', 'rgba(14, 116, 144, 0.2)', 'rgba(21, 94, 117, 0.2)', 'rgba(22, 78, 99, 0.2)'],
    borderColors: ['#06B6D4', '#0891B2', '#0E7490', '#155E75', '#164E63'],
    gradients: [
      ['#06B6D4', '#0891B2'],
      ['#0891B2', '#0E7490'],
      ['#0E7490', '#155E75'],
      ['#155E75', '#164E63']
    ],
    opacity: { full: 1.0, high: 0.8, medium: 0.5, low: 0.2 }
  }
};

// Accessibility Color Constants
export const ACCESSIBILITY_COLORS = {
  // High Contrast Colors
  highContrast: {
    background: '#FFFFFF',
    text: '#000000',
    primary: '#0000FF',
    secondary: '#800080',
    success: '#008000',
    warning: '#FFA500',
    error: '#FF0000',
    info: '#0080FF'
  },
  
  // Color Blind Friendly Palette
  colorBlindFriendly: {
    blue: '#0173B2',
    orange: '#DE8F05',
    green: '#029E73',
    red: '#CC78BC',
    cyan: '#56B4E9',
    magenta: '#E69F00',
    yellow: '#F0E442',
    gray: '#999999'
  },
  
  // WCAG AA Compliant Colors
  wcagCompliant: {
    lightBackground: '#FFFFFF',
    darkBackground: '#000000',
    lightText: '#767676', // 4.5:1 contrast ratio
    darkText: '#595959',  // 7:1 contrast ratio
    primaryLight: '#0066CC', // 4.5:1 on white
    primaryDark: '#4D94FF'   // 4.5:1 on black
  }
};

// Theme Configuration Interface
export interface ThemeConfiguration {
  name: string;
  colors: ExtendedColorPalette;
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
  };
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Complete Theme Configurations
export const THEME_CONFIGURATIONS: Record<ThemeOptions, ThemeConfiguration> = {
  [ThemeOptions.LIGHT]: {
    name: 'Light Theme',
    colors: LIGHT_COLOR_SCHEMES[ColorSchemes.PRIMARY],
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem'
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem'
    },
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      full: '9999px'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    }
  },
  [ThemeOptions.DARK]: {
    name: 'Dark Theme',
    colors: DARK_COLOR_SCHEMES[ColorSchemes.PRIMARY],
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem'
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem'
    },
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      full: '9999px'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)'
    }
  },
  [ThemeOptions.AUTO]: {
    name: 'Auto Theme',
    colors: LIGHT_COLOR_SCHEMES[ColorSchemes.PRIMARY], // Default to light, will be overridden by system preference
    typography: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem'
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem'
    },
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      full: '9999px'
    },
    shadows: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
    }
  }
};

// Color Scheme Utilities
export const ColorSchemeUtils = {
  getColorScheme: (scheme: ColorSchemes, theme: ThemeOptions = ThemeOptions.LIGHT): ExtendedColorPalette => {
    const colorSchemes = theme === ThemeOptions.DARK ? DARK_COLOR_SCHEMES : LIGHT_COLOR_SCHEMES;
    return colorSchemes[scheme];
  },

  getChartColors: (scheme: ColorSchemes): ChartColorPalette => {
    return CHART_COLOR_PALETTES[scheme];
  },

  getThemeConfiguration: (theme: ThemeOptions): ThemeConfiguration => {
    return THEME_CONFIGURATIONS[theme];
  },

  getAccessibilityColors: (type: 'highContrast' | 'colorBlindFriendly' | 'wcagCompliant') => {
    return ACCESSIBILITY_COLORS[type];
  },

  generateGradient: (colors: string[], direction: string = 'to right'): string => {
    return `linear-gradient(${direction}, ${colors.join(', ')})`;
  },

  adjustOpacity: (color: string, opacity: number): string => {
    // Simple opacity adjustment for hex colors
    if (color.startsWith('#')) {
      const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
      return color + alpha;
    }
    return color;
  },

  getContrastColor: (backgroundColor: string): string => {
    // Simple contrast calculation - in real implementation, use proper color contrast algorithms
    const lightColors = ['#FFFFFF', '#F8FAFC', '#F3F4F6', '#E5E7EB'];
    return lightColors.includes(backgroundColor) ? '#1F2937' : '#F9FAFB';
  }
};