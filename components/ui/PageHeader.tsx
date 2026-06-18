/**
 * PageHeader – consistent header used by every screen.
 *
 * Variants:
 *   large  – big title + optional search bar (Home, Categories, Favorites)
 *   detail – back button + centred title (ViewAll, Wallpaper detail)
 */

import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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
}

export function LargeHeader({
  title,
  subtitle,
  searchPlaceholder = 'Search…',
  onSearch,
  onSearchSubmit,
  searchValue,
  isLogo = false,
}: LargeHeaderProps) {
  const t = useTheme();

  return (
    <View style={[styles.largeContainer, { backgroundColor: t.bg }]}>
      <View style={styles.titleRow}>
        <View>
          <Text style={[styles.largeTitle, { color: t.text }]}>{title}</Text>
          {isLogo && (
            <LinearGradient
              colors={[t.accent, '#A69BFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.logoUnderline}
            />
          )}
          {subtitle ? (
            <Text style={[styles.subtitle, { color: t.textSub }]}>{subtitle}</Text>
          ) : null}
        </View>
        
        {isLogo && (
          <TouchableOpacity style={[styles.bellBtn, { backgroundColor: t.pillBg }]}>
            <Ionicons name="notifications-outline" size={20} color={t.text} />
            <View style={[styles.bellDot, { backgroundColor: t.heart }]} />
          </TouchableOpacity>
        )}
      </View>

      {onSearch ? (
        <View style={[styles.searchBox, { backgroundColor: t.surface, borderColor: t.border }]}>
          <Ionicons name="search" size={17} color={t.icon} style={styles.searchIcon} />
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
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  largeTitle: {
    fontSize: FONT_SIZE.title + 2,
    fontWeight: FONT_WEIGHT.black,
    letterSpacing: -1.2,
  },
  logoUnderline: {
    height: 4,
    width: 32,
    borderRadius: 2,
    marginTop: 4,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.medium,
    marginTop: 4,
    letterSpacing: 0.2,
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#000', // Will blend into dark mode bg, maybe tweak later
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md + 4,
    height: 50,
    borderWidth: 1,
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
});
