/**
 * PageHeader – consistent header used by every screen.
 *
 * Variants:
 *   large  – big title + optional search bar (Home, Categories, Favorites)
 *   detail – back button + centred title (ViewAll, Wallpaper detail)
 */

import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme, SPACING, FONT_SIZE, FONT_WEIGHT, RADIUS } from '@/constants/theme';

// ─── Large header (tabs) ──────────────────────────────────────────────────────
interface LargeHeaderProps {
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onSearch?: (text: string) => void;
  onSearchSubmit?: () => void;
  searchValue?: string;
  isLogo?: boolean;
  style?: any;
}

export function LargeHeader({
  title,
  subtitle,
  searchPlaceholder = 'Search…',
  onSearch,
  onSearchSubmit,
  searchValue,
  isLogo = false,
  style,
}: LargeHeaderProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.largeContainer, { backgroundColor: t.surface, paddingTop: insets.top + SPACING.xs + 2 }, style]}>
      <View style={styles.titleRow}>
        <View>
          <Text style={[styles.largeTitle, { color: t.text }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: t.textSub }]}>{subtitle}</Text>
          ) : null}
        </View>
      </View>

      {onSearch ? (
        <View style={[
          styles.searchBox,
          {
            backgroundColor: t.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
            borderColor: t.isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.12)',
          },
        ]}>
          <Ionicons name="search" size={15} color={t.textMuted} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: t.text }]}
            placeholder={searchPlaceholder}
            placeholderTextColor={t.placeholder}
            value={searchValue}
            onChangeText={onSearch}
            returnKeyType="search"
            onSubmitEditing={onSearchSubmit}
            clearButtonMode="while-editing"
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
      ) : null}

      {/* Bottom border */}
      <View style={[styles.headerBorder, { backgroundColor: t.border }]} />
    </View>
  );
}

// ─── Detail header (stack screens) ───────────────────────────────────────────
interface DetailHeaderProps {
  title?: string;
  onBack?: () => void;
  rightElement?: React.ReactNode;
  transparent?: boolean;
}

export function DetailHeader({
  title,
  onBack,
  rightElement,
  transparent = false,
}: DetailHeaderProps) {
  const t = useTheme();
  const router = useRouter();

  const handleBack = onBack ?? (() => router.back());

  return (
    <View
      style={[
        styles.detailContainer,
        transparent
          ? styles.detailTransparent
          : { backgroundColor: t.bg, borderBottomColor: t.separator, borderBottomWidth: StyleSheet.hairlineWidth },
      ]}
    >
      <TouchableOpacity
        onPress={handleBack}
        style={[styles.backBtn, { backgroundColor: transparent ? 'rgba(0,0,0,0.45)' : t.surface }]}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons
          name="arrow-back"
          size={20}
          color={transparent ? '#fff' : t.text}
        />
      </TouchableOpacity>

      {title ? (
        <Text style={[styles.detailTitle, { color: transparent ? '#fff' : t.text }]} numberOfLines={1}>
          {title}
        </Text>
      ) : (
        <View style={styles.flex} />
      )}

      <View style={styles.rightSlot}>{rightElement ?? null}</View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Large
  largeContainer: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xs + 2,
    paddingBottom: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  largeTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.medium,
    marginTop: 2,
  },
  headerBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 0.5,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    borderWidth: 0.8,
    paddingHorizontal: 12,
    height: 44,
    marginTop: SPACING.xs,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.medium,
    height: '100%',
    ...Platform.select({ android: { paddingVertical: 0 } }),
  },

  // Detail
  detailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    height: 58,
  },
  detailTransparent: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailTitle: {
    flex: 1,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
    marginHorizontal: SPACING.sm,
  },
  rightSlot: {
    width: 40,
    alignItems: 'flex-end',
  },
  flex: { flex: 1 },

  // Floating Header specific styles
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
    paddingHorizontal: SPACING.lg,
  },
  floatingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
    marginBottom: 10,
  },
  logoTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.8,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  searchWrap: {
    // animated container
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    borderWidth: 0.8,
    paddingHorizontal: 12,
    height: 44,
  },
});

// ─── Floating header constants ───────────────────────────────────────────────
export const HEADER_EXPANDED_H = 106;
export const HEADER_COLLAPSED_H = 64;
const COLLAPSE_START = 0;
const COLLAPSE_END = 50;

// ─── Floating Header Component ────────────────────────────────────────────────
interface FloatingHeaderProps {
  title: string;
  titleSuffix?: string;
  subtitle?: string;
  scrollY?: Animated.Value;
  search?: {
    placeholder?: string;
    value: string;
    onChangeText: (text: string) => void;
    onClear: () => void;
    inputRef?: React.RefObject<TextInput | null>;
  };
  isLogo?: boolean;
}

export function FloatingHeader({
  title,
  titleSuffix,
  subtitle,
  scrollY: externalScrollY,
  search,
  isLogo = false,
}: FloatingHeaderProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const topInset = insets.top;

  const fallbackScrollY = useRef(new Animated.Value(0)).current;
  const scrollY = externalScrollY ?? fallbackScrollY;

  const [searchFocused, setSearchFocused] = useState(false);

  const headerHeight = scrollY.interpolate({
    inputRange: [COLLAPSE_START, COLLAPSE_END],
    outputRange: [HEADER_EXPANDED_H, HEADER_COLLAPSED_H],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [COLLAPSE_START, COLLAPSE_END * 0.8],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [COLLAPSE_START, COLLAPSE_END],
    outputRange: [0, -40],
    extrapolate: 'clamp',
  });

  const searchTranslateY = scrollY.interpolate({
    inputRange: [COLLAPSE_START, COLLAPSE_END],
    outputRange: [0, -42],
    extrapolate: 'clamp',
  });

  const totalHeaderH = Animated.add(headerHeight, new Animated.Value(topInset));

  return (
    <Animated.View
      style={[
        styles.floatingHeader,
        { paddingTop: topInset, height: totalHeaderH },
      ]}
      pointerEvents="box-none"
    >
      <View style={[StyleSheet.absoluteFill, { backgroundColor: t.surface }]} />
      <View style={[styles.headerBorder, { backgroundColor: t.border }]} />

      <Animated.View
        style={[
          styles.floatingTitleRow,
          {
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslateY }],
          },
        ]}
      >
        <View>
          <Text
            style={[
              isLogo ? styles.logoTitle : styles.pageTitle,
              { color: t.text },
            ]}
          >
            {title}
            {titleSuffix ? (
              <Text style={{ color: t.textMuted }}>{titleSuffix}</Text>
            ) : null}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: t.textSub }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </Animated.View>

      {search ? (
        <Animated.View
          style={[
            styles.searchWrap,
            { transform: [{ translateY: searchTranslateY }] },
          ]}
          pointerEvents="auto"
        >
          <View
            style={[
              styles.searchBar,
              {
                backgroundColor: t.isDark
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.06)',
                borderColor: t.isDark
                  ? 'rgba(255, 255, 255, 0.25)'
                  : 'rgba(0, 0, 0, 0.12)',
              },
              searchFocused && {
                backgroundColor: t.isDark
                  ? 'rgba(255,255,255,0.10)'
                  : 'rgba(0,0,0,0.08)',
                borderColor: t.isDark
                  ? 'rgba(255,255,255,0.22)'
                  : t.accent,
              },
            ]}
          >
            <Ionicons
              name="search"
              size={15}
              color={searchFocused ? t.textSub : t.textMuted}
              style={{ marginRight: 8 }}
            />
            <TextInput
              ref={search.inputRef as any}
              style={[styles.searchInput, { color: t.text }]}
              placeholder={search.placeholder ?? 'Search…'}
              placeholderTextColor={t.placeholder}
              value={search.value}
              onChangeText={search.onChangeText}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {search.value.length > 0 && (
              <TouchableOpacity onPress={search.onClear} hitSlop={10}>
                <Ionicons name="close-circle" size={16} color={t.textSub} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      ) : null}
    </Animated.View>
  );
}

