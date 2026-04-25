/**
 * WallZone Design System
 * Single source of truth for all visual tokens.
 * Import { DS, useTheme } in every component.
 */

import { useColorScheme } from 'react-native';

// ─── Spacing ─────────────────────────────────────────────────────────────────
export const SPACING = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────
export const RADIUS = {
  sm:   12,
  md:   20,
  lg:   28,
  xl:   36,
  pill: 999,
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
export const FONT_SIZE = {
  label:   10,
  caption: 12,
  sm:      13,
  body:    15,
  md:      16,
  lg:      18,
  xl:      22,
  xxl:     28,
  title:   34,
} as const;

export const FONT_WEIGHT = {
  regular:   '400' as const,
  medium:    '500' as const,
  semibold:  '600' as const,
  bold:      '700' as const,
  extrabold: '800' as const,
  black:     '900' as const,
};

// ─── Palette ──────────────────────────────────────────────────────────────────
const PALETTE = {
  accent:  '#7C6BFF',   // purple accent – consistent in both themes
  heart:   '#FF3B5C',   // favorite / heart red
  success: '#30D158',
  warning: '#FF9F0A',
} as const;

// ─── Themes ───────────────────────────────────────────────────────────────────
export const DARK_THEME = {
  isDark:      true,
  bg:          '#000000',
  surface:     '#0F0F0F',
  card:        '#161616',
  cardAlt:     '#1C1C1E',
  border:      '#252525',
  separator:   '#1A1A1A',
  text:        '#FFFFFF',
  textSub:     '#8E8E93',
  textMuted:   '#48484A',
  placeholder: '#636366',
  icon:        '#8E8E93',
  ...PALETTE,
} as const;

export const LIGHT_THEME = {
  isDark:      false,
  bg:          '#F2F2F7',
  surface:     '#FFFFFF',
  card:        '#FFFFFF',
  cardAlt:     '#F8F8F8',
  border:      '#E5E5EA',
  separator:   '#F2F2F7',
  text:        '#0D0D0D',
  textSub:     '#6D6D72',
  textMuted:   '#AEAEB2',
  placeholder: '#AEAEB2',
  icon:        '#6D6D72',
  ...PALETTE,
} as const;

export type Theme = typeof DARK_THEME;

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useTheme(): Theme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? DARK_THEME : LIGHT_THEME;
}

// ─── Common shadow presets ────────────────────────────────────────────────────
export const SHADOW = {
  sm: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius:  6,
    elevation:     3,
  },
  md: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius:  12,
    elevation:     6,
  },
  lg: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius:  20,
    elevation:     10,
  },
} as const;
