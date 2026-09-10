import { useColorScheme } from 'react-native';
import { darkPalette, lightPalette, ThemePalette } from '../constants/theme';

export interface AppTheme {
  scheme: 'light' | 'dark';
  isDark: boolean;
  colors: ThemePalette;
}

// Follows the device's system-wide light/dark mode setting automatically
export default function useTheme(): AppTheme {
  const systemScheme = useColorScheme();
  const scheme: 'light' | 'dark' = systemScheme === 'dark' ? 'dark' : 'light';
  const isDark = scheme === 'dark';

  return {
    scheme,
    isDark,
    colors: isDark ? darkPalette : lightPalette,
  };
}
