/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 */

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};

export const colors = {
  light: {
    // Backgrounds
    primary: "#ffffff",
    secondary: "#f9fafb",
    tertiary: "#f3f4f6",
    card: "#ffffff",

    // Text
    text: "#111827",
    textSecondary: "#6b7280",
    textMuted: "#9ca3af",

    // Accents
    accent: "#3b82f6",
    accentSecondary: "#1d4ed8",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",

    // Borders
    border: "#e5e7eb",
    borderLight: "#f3f4f6",

    // Status colors
    red: "#ef4444",
    green: "#10b981",
    blue: "#3b82f6",
    yellow: "#f59e0b",
    purple: "#8b5cf6",
    orange: "#f97316",

    // Header colors
    header: "#dcfce7", // lime-100
    headerText: "#1f2937",
  },
  dark: {
    // Backgrounds
    primary: "#111827",
    secondary: "#1f2937",
    tertiary: "#374151",
    card: "#1f2937",

    // Text
    text: "#f9fafb",
    textSecondary: "#d1d5db",
    textMuted: "#9ca3af",

    // Accents
    accent: "#60a5fa",
    accentSecondary: "#3b82f6",
    success: "#34d399",
    warning: "#fbbf24",
    error: "#f87171",

    // Borders
    border: "#374151",
    borderLight: "#4b5563",

    // Status colors
    red: "#f87171",
    green: "#34d399",
    blue: "#60a5fa",
    yellow: "#fbbf24",
    purple: "#a78bfa",
    orange: "#fb923c",

    // Header colors
    header: "#1f2937",
    headerText: "#f9fafb",
  },
};

export const getThemeColors = (isDark: boolean) => {
  return isDark ? colors.dark : colors.light;
};
