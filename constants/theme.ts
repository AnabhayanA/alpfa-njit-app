/**
 * ALPFA NJIT Theme Constants
 * Colors, spacing, and design system
 */

// Brand colors stay constant across light/dark mode (navy headers, burgundy accents).
// These "surface" palettes cover the neutral backgrounds, cards, and text that flip per mode.
export const lightPalette = {
  background: '#F6F6F8',
  backgroundAlt: '#F6F7FB',
  surface: '#FFFFFF',
  surfaceAlt: '#F9F9FB',
  surfaceBorder: 'rgba(15, 16, 46, 0.05)',
  iconBgLight: '#F5F1F2',
  textPrimary: '#17182F',
  textSecondary: '#586178',
  textMuted: '#697389',
  divider: 'rgba(15, 16, 46, 0.08)',
  statusBarStyle: 'dark' as const,
};

export const darkPalette = {
  background: '#0B0B16',
  backgroundAlt: '#0F1022',
  surface: '#1A1B30',
  surfaceAlt: '#20213A',
  surfaceBorder: 'rgba(255, 255, 255, 0.08)',
  iconBgLight: '#2A2B44',
  textPrimary: '#F2F2F7',
  textSecondary: '#ADB1C7',
  textMuted: '#9498B2',
  divider: 'rgba(255, 255, 255, 0.08)',
  statusBarStyle: 'light' as const,
};

export type ThemePalette = Omit<typeof lightPalette, 'statusBarStyle'> & { statusBarStyle: 'light' | 'dark' };

export const colors = {
  // Brand colors
  navy: '#0F102E',
  burgundy: '#6E1B2D',
  white: '#FFFFFF',
  lightGray: '#F7F7F9',
  mediumGray: '#E8E8EB',
  darkGray: '#77778A',
  textDark: '#1A1A2E',
  textLight: '#77778A',

  // Semantic colors
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',

  // Backgrounds
  background: '#F7F7F9',
  surface: '#FFFFFF',
  surfaceAlt: '#F9F9FB',

  // Borders
  border: '#E8E8EB',
  borderLight: '#F0F0F2',

  // Transparency
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayLight: 'rgba(0, 0, 0, 0.1)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
};

export default {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};
