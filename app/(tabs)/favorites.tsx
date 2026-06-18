// app/(tabs)/favorites.tsx

import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { LargeHeader } from '@/components/ui/PageHeader';
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
      <LargeHeader
        title="Collection"
        subtitle={count > 0 ? `${count} wallpaper${count !== 1 ? 's' : ''} saved` : 'Your saved wallpapers'}
      />

      {/* Content */}
      {count === 0 ? (
        <EmptyState 
          // FIX: Pass a timestamp parameter to force the home screen to react and scroll
          onExplore={() => router.push({ pathname: '/', params: { scrollToTop: Date.now() } })} 
          t={t} 
        />
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

// ... Keep your existing styles at the bottom ...
const styles = StyleSheet.create({
  root: { flex: 1 },

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
