import { DARK_THEME, LIGHT_THEME } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
type ThemeKey = keyof typeof DARK_THEME;
export function useThemeColor(props: { light?: string; dark?: string }, colorName: ThemeKey) {
  const scheme = useColorScheme() ?? 'light';
  const fromProps = props[scheme];
  if (fromProps) return fromProps;
  return scheme === 'dark' ? DARK_THEME[colorName] : LIGHT_THEME[colorName];
}