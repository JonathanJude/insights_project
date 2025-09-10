import { ChartTypes, ColorSchemes } from '../enums';

// Chart Type Configurations
export interface ChartConfiguration {
  type: ChartTypes;
  defaultHeight: number;
  defaultWidth?: number;
  animationDuration: number;
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: {
    legend: boolean;
    tooltip: boolean;
    title: boolean;
  };
  scales?: {
    x?: any;
    y?: any;
  };
}

export const CHART_CONFIGURATIONS: Record<ChartTypes, ChartConfiguration> = {
  [ChartTypes.LINE]: {
    type: ChartTypes.LINE,
    defaultHeight: 300,
    animationDuration: 750,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: true,
      tooltip: true,
      title: true
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  },
  [ChartTypes.BAR]: {
    type: ChartTypes.BAR,
    defaultHeight: 300,
    animationDuration: 500,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: true,
      tooltip: true,
      title: true
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false
        }
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  },
  [ChartTypes.PIE]: {
    type: ChartTypes.PIE,
    defaultHeight: 300,
    animationDuration: 1000,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: true,
      tooltip: true,
      title: true
    }
  },
  [ChartTypes.AREA]: {
    type: ChartTypes.AREA,
    defaultHeight: 300,
    animationDuration: 750,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: true,
      tooltip: true,
      title: true
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        },
        stacked: true
      }
    }
  },
  [ChartTypes.SCATTER]: {
    type: ChartTypes.SCATTER,
    defaultHeight: 300,
    animationDuration: 500,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: true,
      tooltip: true,
      title: true
    },
    scales: {
      x: {
        display: true,
        type: 'linear',
        position: 'bottom',
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      y: {
        display: true,
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    }
  },
  [ChartTypes.HEATMAP]: {
    type: ChartTypes.HEATMAP,
    defaultHeight: 400,
    animationDuration: 300,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: false,
      tooltip: true,
      title: true
    }
  },
  [ChartTypes.TREEMAP]: {
    type: ChartTypes.TREEMAP,
    defaultHeight: 400,
    animationDuration: 500,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: false,
      tooltip: true,
      title: true
    }
  },
  [ChartTypes.SANKEY]: {
    type: ChartTypes.SANKEY,
    defaultHeight: 500,
    animationDuration: 750,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: false,
      tooltip: true,
      title: true
    }
  }
};

// Responsive Breakpoint Configurations
export interface ResponsiveBreakpoint {
  name: string;
  minWidth: number;
  maxWidth?: number;
  chartHeight: number;
  fontSize: number;
  padding: number;
  showLegend: boolean;
  showTitle: boolean;
}

export const RESPONSIVE_BREAKPOINTS: Record<string, ResponsiveBreakpoint> = {
  mobile: {
    name: 'mobile',
    minWidth: 0,
    maxWidth: 767,
    chartHeight: 250,
    fontSize: 12,
    padding: 10,
    showLegend: false,
    showTitle: true
  },
  tablet: {
    name: 'tablet',
    minWidth: 768,
    maxWidth: 1023,
    chartHeight: 300,
    fontSize: 14,
    padding: 15,
    showLegend: true,
    showTitle: true
  },
  desktop: {
    name: 'desktop',
    minWidth: 1024,
    chartHeight: 350,
    fontSize: 16,
    padding: 20,
    showLegend: true,
    showTitle: true
  },
  large: {
    name: 'large',
    minWidth: 1440,
    chartHeight: 400,
    fontSize: 16,
    padding: 25,
    showLegend: true,
    showTitle: true
  }
};

// Animation and Interaction Settings
export interface AnimationSettings {
  duration: number;
  easing: string;
  delay: number;
  loop: boolean;
}

export interface InteractionSettings {
  hover: {
    mode: string;
    intersect: boolean;
    animationDuration: number;
  };
  click: {
    mode: string;
    intersect: boolean;
  };
  tooltip: {
    enabled: boolean;
    mode: string;
    intersect: boolean;
    position: string;
    backgroundColor: string;
    titleColor: string;
    bodyColor: string;
    borderColor: string;
    borderWidth: number;
    cornerRadius: number;
    displayColors: boolean;
    callbacks?: any;
  };
}

export const ANIMATION_SETTINGS: Record<string, AnimationSettings> = {
  default: {
    duration: 750,
    easing: 'easeInOutQuart',
    delay: 0,
    loop: false
  },
  fast: {
    duration: 300,
    easing: 'easeOutQuart',
    delay: 0,
    loop: false
  },
  slow: {
    duration: 1500,
    easing: 'easeInOutQuart',
    delay: 0,
    loop: false
  },
  bounce: {
    duration: 1000,
    easing: 'easeOutBounce',
    delay: 0,
    loop: false
  }
};

export const INTERACTION_SETTINGS: InteractionSettings = {
  hover: {
    mode: 'nearest',
    intersect: true,
    animationDuration: 200
  },
  click: {
    mode: 'nearest',
    intersect: true
  },
  tooltip: {
    enabled: true,
    mode: 'nearest',
    intersect: false,
    position: 'nearest',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    titleColor: '#ffffff',
    bodyColor: '#ffffff',
    borderColor: 'rgba(0, 0, 0, 0.8)',
    borderWidth: 1,
    cornerRadius: 6,
    displayColors: true
  }
};

// Chart Display Options
export interface ChartDisplayOptions {
  showGrid: boolean;
  showAxes: boolean;
  showLegend: boolean;
  showTitle: boolean;
  showTooltips: boolean;
  showDataLabels: boolean;
  enableZoom: boolean;
  enablePan: boolean;
  enableSelection: boolean;
}

export const CHART_DISPLAY_OPTIONS: Record<string, ChartDisplayOptions> = {
  minimal: {
    showGrid: false,
    showAxes: false,
    showLegend: false,
    showTitle: false,
    showTooltips: true,
    showDataLabels: false,
    enableZoom: false,
    enablePan: false,
    enableSelection: false
  },
  standard: {
    showGrid: true,
    showAxes: true,
    showLegend: true,
    showTitle: true,
    showTooltips: true,
    showDataLabels: false,
    enableZoom: false,
    enablePan: false,
    enableSelection: false
  },
  detailed: {
    showGrid: true,
    showAxes: true,
    showLegend: true,
    showTitle: true,
    showTooltips: true,
    showDataLabels: true,
    enableZoom: true,
    enablePan: true,
    enableSelection: true
  }
};

// Chart Color Configurations
export interface ChartColorConfiguration {
  scheme: ColorSchemes;
  colors: string[];
  backgroundColors: string[];
  borderColors: string[];
  gradients?: string[][];
}

export const CHART_COLOR_CONFIGURATIONS: Record<ColorSchemes, ChartColorConfiguration> = {
  [ColorSchemes.PRIMARY]: {
    scheme: ColorSchemes.PRIMARY,
    colors: ['#3B82F6', '#1D4ED8', '#1E40AF', '#1E3A8A'],
    backgroundColors: ['rgba(59, 130, 246, 0.2)', 'rgba(29, 78, 216, 0.2)', 'rgba(30, 64, 175, 0.2)', 'rgba(30, 58, 138, 0.2)'],
    borderColors: ['#3B82F6', '#1D4ED8', '#1E40AF', '#1E3A8A'],
    gradients: [
      ['#3B82F6', '#1D4ED8'],
      ['#1D4ED8', '#1E40AF'],
      ['#1E40AF', '#1E3A8A']
    ]
  },
  [ColorSchemes.SECONDARY]: {
    scheme: ColorSchemes.SECONDARY,
    colors: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6'],
    backgroundColors: ['rgba(139, 92, 246, 0.2)', 'rgba(124, 58, 237, 0.2)', 'rgba(109, 40, 217, 0.2)', 'rgba(91, 33, 182, 0.2)'],
    borderColors: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6'],
    gradients: [
      ['#8B5CF6', '#7C3AED'],
      ['#7C3AED', '#6D28D9'],
      ['#6D28D9', '#5B21B6']
    ]
  },
  [ColorSchemes.SUCCESS]: {
    scheme: ColorSchemes.SUCCESS,
    colors: ['#10B981', '#059669', '#047857', '#065F46'],
    backgroundColors: ['rgba(16, 185, 129, 0.2)', 'rgba(5, 150, 105, 0.2)', 'rgba(4, 120, 87, 0.2)', 'rgba(6, 95, 70, 0.2)'],
    borderColors: ['#10B981', '#059669', '#047857', '#065F46'],
    gradients: [
      ['#10B981', '#059669'],
      ['#059669', '#047857'],
      ['#047857', '#065F46']
    ]
  },
  [ColorSchemes.WARNING]: {
    scheme: ColorSchemes.WARNING,
    colors: ['#F59E0B', '#D97706', '#B45309', '#92400E'],
    backgroundColors: ['rgba(245, 158, 11, 0.2)', 'rgba(217, 119, 6, 0.2)', 'rgba(180, 83, 9, 0.2)', 'rgba(146, 64, 14, 0.2)'],
    borderColors: ['#F59E0B', '#D97706', '#B45309', '#92400E'],
    gradients: [
      ['#F59E0B', '#D97706'],
      ['#D97706', '#B45309'],
      ['#B45309', '#92400E']
    ]
  },
  [ColorSchemes.DANGER]: {
    scheme: ColorSchemes.DANGER,
    colors: ['#EF4444', '#DC2626', '#B91C1C', '#991B1B'],
    backgroundColors: ['rgba(239, 68, 68, 0.2)', 'rgba(220, 38, 38, 0.2)', 'rgba(185, 28, 28, 0.2)', 'rgba(153, 27, 27, 0.2)'],
    borderColors: ['#EF4444', '#DC2626', '#B91C1C', '#991B1B'],
    gradients: [
      ['#EF4444', '#DC2626'],
      ['#DC2626', '#B91C1C'],
      ['#B91C1C', '#991B1B']
    ]
  },
  [ColorSchemes.INFO]: {
    scheme: ColorSchemes.INFO,
    colors: ['#06B6D4', '#0891B2', '#0E7490', '#155E75'],
    backgroundColors: ['rgba(6, 182, 212, 0.2)', 'rgba(8, 145, 178, 0.2)', 'rgba(14, 116, 144, 0.2)', 'rgba(21, 94, 117, 0.2)'],
    borderColors: ['#06B6D4', '#0891B2', '#0E7490', '#155E75'],
    gradients: [
      ['#06B6D4', '#0891B2'],
      ['#0891B2', '#0E7490'],
      ['#0E7490', '#155E75']
    ]
  }
};

// Export utility functions
export const ChartConfigUtils = {
  getConfiguration: (chartType: ChartTypes): ChartConfiguration => {
    return CHART_CONFIGURATIONS[chartType];
  },

  getResponsiveConfig: (width: number): ResponsiveBreakpoint => {
    if (width < 768) return RESPONSIVE_BREAKPOINTS.mobile;
    if (width < 1024) return RESPONSIVE_BREAKPOINTS.tablet;
    if (width < 1440) return RESPONSIVE_BREAKPOINTS.desktop;
    return RESPONSIVE_BREAKPOINTS.large;
  },

  getColorConfiguration: (scheme: ColorSchemes): ChartColorConfiguration => {
    return CHART_COLOR_CONFIGURATIONS[scheme];
  },

  getAnimationSettings: (type: string = 'default'): AnimationSettings => {
    return ANIMATION_SETTINGS[type] || ANIMATION_SETTINGS.default;
  },

  getDisplayOptions: (level: string = 'standard'): ChartDisplayOptions => {
    return CHART_DISPLAY_OPTIONS[level] || CHART_DISPLAY_OPTIONS.standard;
  }
};