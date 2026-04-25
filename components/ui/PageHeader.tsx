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
import { useTheme, SPACING, FONT_SIZE, FONT_WEIGHT, RADIUS } from '@/constants/theme';

// ─── Large header (tabs) ──────────────────────────────────────────────────────
interface LargeHeaderProps {
  title: string;
  subtitle?: string;
  searchPlaceholder?: string;
  onSearch?: (text: string) => void;
  onSearchSubmit?: () => void;
  searchValue?: string;
}

export function LargeHeader({
  title,
  subtitle,
  searchPlaceholder = 'Search…',
  onSearch,
  onSearchSubmit,
  searchValue,
}: LargeHeaderProps) {
  const t = useTheme();

  return (
    <View style={[styles.largeContainer, { backgroundColor: t.bg }]}>
      <View style={styles.titleRow}>
        <Text style={[styles.largeTitle, { color: t.text }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: t.textSub }]}>{subtitle}</Text>
        ) : null}
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
    marginBottom: SPACING.md,
  },
  largeTitle: {
    fontSize: FONT_SIZE.title,
    fontWeight: FONT_WEIGHT.extrabold,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    marginTop: 3,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 48,
    borderWidth: StyleSheet.hairlineWidth,
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
