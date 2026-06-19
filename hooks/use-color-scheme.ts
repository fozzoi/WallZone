import { useColorScheme as useRNColorScheme } from 'react-native';
import { useSettings } from '@/context/SettingsContext';

/**
 * Returns the effective color scheme: respects manual override from Settings,
 * falls back to system preference when set to 'system'.
 */
export function useColorScheme(): 'light' | 'dark' {
  const { theme } = useSettings();
  const systemScheme = useRNColorScheme() ?? 'light';
  if (theme === 'light' || theme === 'dark') return theme;
  return systemScheme as 'light' | 'dark';
}
