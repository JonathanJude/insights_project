// UI State and Interaction Enums
export enum LoadingStates {
  IDLE = "idle",
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
  REFRESHING = "refreshing",
}

export enum ThemeOptions {
  LIGHT = "light",
  DARK = "dark",
  AUTO = "auto",
}

export enum DeviceTypes {
  MOBILE = "mobile",
  TABLET = "tablet",
  DESKTOP = "desktop",
}

export enum ModalTypes {
  SETTINGS = "settings",
  NOTIFICATIONS = "notifications",
  FILTER = "filter",
  EXPORT = "export",
  HELP = "help",
  CONFIRMATION = "confirmation",
}

export enum NotificationTypes {
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}

export enum ButtonVariants {
  PRIMARY = "primary",
  SECONDARY = "secondary",
  SUCCESS = "success",
  WARNING = "warning",
  DANGER = "danger",
  INFO = "info",
  GHOST = "ghost",
  OUTLINE = "outline",
}

export enum ButtonSizes {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
}

export enum InputTypes {
  TEXT = "text",
  EMAIL = "email",
  PASSWORD = "password",
  NUMBER = "number",
  SEARCH = "search",
  TEL = "tel",
  URL = "url",
  DATE = "date",
  TIME = "time",
  DATETIME_LOCAL = "datetime-local",
}

export enum ChartTypes {
  LINE = "line",
  BAR = "bar",
  PIE = "pie",
  AREA = "area",
  SCATTER = "scatter",
  HEATMAP = "heatmap",
  TREEMAP = "treemap",
  SANKEY = "sankey",
}

export enum ColorSchemes {
  PRIMARY = "primary",
  SECONDARY = "secondary",
  SUCCESS = "success",
  WARNING = "warning",
  DANGER = "danger",
  INFO = "info",
}

// Color palette definitions
export const ColorPalettes = {
  [ColorSchemes.PRIMARY]: {
    50: "#eff6ff",
    100: "#dbeafe",
    200: "#bfdbfe",
    300: "#93c5fd",
    400: "#60a5fa",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
    800: "#1e40af",
    900: "#1e3a8a",
  },
  [ColorSchemes.SUCCESS]: {
    50: "#f0fdf4",
    100: "#dcfce7",
    200: "#bbf7d0",
    300: "#86efac",
    400: "#4ade80",
    500: "#22c55e",
    600: "#16a34a",
    700: "#15803d",
    800: "#166534",
    900: "#14532d",
  },
  [ColorSchemes.WARNING]: {
    50: "#fffbeb",
    100: "#fef3c7",
    200: "#fde68a",
    300: "#fcd34d",
    400: "#fbbf24",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
    800: "#92400e",
    900: "#78350f",
  },
  [ColorSchemes.DANGER]: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    300: "#fca5a5",
    400: "#f87171",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
    800: "#991b1b",
    900: "#7f1d1d",
  },
} as const;

// Validation functions for UI enums
export const UIEnumValidators = {
  isValidLoadingState: (value: string): value is LoadingStates => {
    return Object.values(LoadingStates).includes(value as LoadingStates);
  },

  isValidThemeOption: (value: string): value is ThemeOptions => {
    return Object.values(ThemeOptions).includes(value as ThemeOptions);
  },

  isValidDeviceType: (value: string): value is DeviceTypes => {
    return Object.values(DeviceTypes).includes(value as DeviceTypes);
  },

  isValidModalType: (value: string): value is ModalTypes => {
    return Object.values(ModalTypes).includes(value as ModalTypes);
  },

  isValidNotificationType: (value: string): value is NotificationTypes => {
    return Object.values(NotificationTypes).includes(
      value as NotificationTypes
    );
  },

  isValidButtonVariant: (value: string): value is ButtonVariants => {
    return Object.values(ButtonVariants).includes(value as ButtonVariants);
  },

  isValidButtonSize: (value: string): value is ButtonSizes => {
    return Object.values(ButtonSizes).includes(value as ButtonSizes);
  },

  isValidInputType: (value: string): value is InputTypes => {
    return Object.values(InputTypes).includes(value as InputTypes);
  },

  isValidChartType: (value: string): value is ChartTypes => {
    return Object.values(ChartTypes).includes(value as ChartTypes);
  },

  isValidColorScheme: (value: string): value is ColorSchemes => {
    return Object.values(ColorSchemes).includes(value as ColorSchemes);
  },
};

// Helper functions for getting UI enum options
export const UIEnumHelpers = {
  getLoadingStateOptions: () =>
    Object.values(LoadingStates).map((state) => ({
      value: state,
      label: state.charAt(0).toUpperCase() + state.slice(1),
    })),

  getThemeOptions: () =>
    Object.values(ThemeOptions).map((theme) => ({
      value: theme,
      label: theme.charAt(0).toUpperCase() + theme.slice(1),
    })),

  getDeviceTypeOptions: () =>
    Object.values(DeviceTypes).map((device) => ({
      value: device,
      label: device.charAt(0).toUpperCase() + device.slice(1),
    })),

  getModalTypeOptions: () =>
    Object.values(ModalTypes).map((modal) => ({
      value: modal,
      label: modal.charAt(0).toUpperCase() + modal.slice(1),
    })),

  getNotificationTypeOptions: () =>
    Object.values(NotificationTypes).map((type) => ({
      value: type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
    })),

  getButtonVariantOptions: () =>
    Object.values(ButtonVariants).map((variant) => ({
      value: variant,
      label: variant.charAt(0).toUpperCase() + variant.slice(1),
    })),

  getButtonSizeOptions: () =>
    Object.values(ButtonSizes).map((size) => ({
      value: size,
      label: size.charAt(0).toUpperCase() + size.slice(1),
    })),

  getInputTypeOptions: () =>
    Object.values(InputTypes).map((type) => ({
      value: type,
      label: type
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    })),

  getChartTypeOptions: () =>
    Object.values(ChartTypes).map((chart) => ({
      value: chart,
      label: chart.charAt(0).toUpperCase() + chart.slice(1),
    })),

  getColorSchemeOptions: () =>
    Object.values(ColorSchemes).map((scheme) => ({
      value: scheme,
      label: scheme.charAt(0).toUpperCase() + scheme.slice(1),
    })),
};
