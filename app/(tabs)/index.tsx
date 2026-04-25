/**
 * Home / Explore screen
 */
import React, { useState, useEffect, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { LargeHeader } from '@/components/ui/PageHeader';
import WallpaperGrid from '@/components/explore/WallpaperGrid';
import WallpaperCarousel from '@/components/explore/WallpaperCarousel';
import { fetchExplore, fetchTrending, fetchSearch } from '@/services/api';
import { useTheme } from '@/constants/theme';
import type { Wallpaper } from '@/services/api';

export default function ExploreScreen() {
  const t = useTheme();
  const router = useRouter();

  const [query, setQuery]         = useState('');
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [trending, setTrending]   = useState<Wallpaper[]>([]);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // ── Initial load ────────────────────────────────────────────────────────────
  const loadInitial = useCallback(async () => {
    setLoading(true);
    setPage(1);
    try {
      const [grid, carousel] = await Promise.all([
        fetchExplore(1),
        fetchTrending(1),
      ]);
      setWallpapers(grid);
      setTrending(carousel.slice(0, 6));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadInitial(); }, []);

  // ── Search (debounced) ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!query.trim()) {
      loadInitial();
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      setPage(1);
      try {
        const data = await fetchSearch(query, 1);
        setWallpapers(data);
        setTrending([]);
      } finally {
        setLoading(false);
      }
    }, 480);
    return () => clearTimeout(timer);
  }, [query]);

  // ── Infinite scroll ─────────────────────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (loadingMore || loading) return;
    setLoadingMore(true);
    const next = page + 1;
    try {
      const fresh = query.trim()
        ? await fetchSearch(query, next)
        : await fetchExplore(next);
      if (fresh.length > 0) {
        setWallpapers(prev => [...prev, ...fresh]);
        setPage(next);
      }
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, loading, page, query]);

  const carousel = !query.trim() && trending.length > 0 ? (
    <WallpaperCarousel
      title="Trending"
      data={trending}
      onSeeAll={() => router.push('/view-all')}
    />
  ) : null;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.bg }]} edges={['top']}>
      <LargeHeader
        title="WallZone"
        searchPlaceholder="Search wallpapers…"
        onSearch={setQuery}
        searchValue={query}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={t.accent} />
        </View>
      ) : (
        <WallpaperGrid
          wallpapers={wallpapers}
          header={carousel}
          onLoadMore={loadMore}
          isLoadingMore={loadingMore}
          emptyMessage="No results found — try a different keyword"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
