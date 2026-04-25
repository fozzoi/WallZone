/**
 * Favorites / Collection screen
 */
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import WallpaperGrid from '@/components/explore/WallpaperGrid';
import { FavoritesContext } from '@/context/FavoritesContext';
import { useTheme, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '@/constants/theme';

export default function FavoritesScreen() {
  const t = useTheme();
  const router = useRouter();
  const { favorites } = useContext(FavoritesContext);

  const count = favorites?.length ?? 0;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.bg }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: t.bg }]}>
        <View>
          <Text style={[styles.title, { color: t.text }]}>Collection</Text>
          <Text style={[styles.subtitle, { color: t.textSub }]}>
            {count > 0 ? `${count} wallpaper${count !== 1 ? 's' : ''} saved` : 'Your saved wallpapers'}
          </Text>
        </View>
      </View>

      {/* Content */}
      {count === 0 ? (
        <EmptyState onExplore={() => router.push('/')} t={t} />
      ) : (
        <WallpaperGrid
          wallpapers={favorites}
          header={null}
          emptyMessage="Nothing saved yet"
        />
      )}
    </SafeAreaView>
  );
}

function EmptyState({ onExplore, t }: { onExplore: () => void; t: any }) {
  return (
    <View style={styles.empty}>
      <View style={[styles.iconCircle, { backgroundColor: t.surface }]}>
        <Ionicons name="heart-outline" size={38} color={t.textMuted} />
      </View>
      <Text style={[styles.emptyTitle, { color: t.text }]}>Nothing saved yet</Text>
      <Text style={[styles.emptyBody, { color: t.textSub }]}>
        Tap the heart on any wallpaper to add it to your collection.
      </Text>
      <TouchableOpacity
        style={[styles.exploreBtn, { backgroundColor: t.text }]}
        onPress={onExplore}
        activeOpacity={0.82}
      >
        <Text style={[styles.exploreBtnText, { color: t.bg }]}>Browse Wallpapers</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },

  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE.title,
    fontWeight: FONT_WEIGHT.extrabold,
    letterSpacing: -0.8,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    marginTop: 3,
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xxl,
    paddingBottom: 60,
    gap: SPACING.md,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: FONT_SIZE.body,
    textAlign: 'center',
    lineHeight: 22,
  },
  exploreBtn: {
    marginTop: SPACING.sm,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md - 2,
    borderRadius: RADIUS.pill,
  },
  exploreBtnText: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
  },
});
