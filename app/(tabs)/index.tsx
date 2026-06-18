// app/(tabs)/index.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FlashList } from '@shopify/flash-list';

import { LargeHeader } from '@/components/ui/PageHeader';
import WallpaperGrid from '@/components/explore/WallpaperGrid';
import WallpaperCarousel from '@/components/explore/WallpaperCarousel';
import { fetchExplore, fetchTrending, fetchSearch } from '@/services/api';
import { contentCache } from '@/services/cache';
import { useTheme } from '@/constants/theme';
import type { Wallpaper } from '@/services/api';

export default function ExploreScreen() {
  const t = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [query, setQuery]         = useState('');
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [trending, setTrending]   = useState<Wallpaper[]>([]);
  const [loading, setLoading]     = useState(true);
  const [page, setPage]           = useState(1);

  const [loadingMore, setLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isFetchingRef = useRef(false);
  const listRef = useRef<FlashList<any>>(null);
  const hasLoadedOnce = useRef(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (params.scrollToTop) {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  }, [params.scrollToTop]);

  const applyFeed = useCallback((grid: Wallpaper[], carousel: Wallpaper[]) => {
    setWallpapers(grid);
    const carouselData = carousel.length > 0 ? carousel : grid.slice(0, 6);
    setTrending(carouselData.slice(0, 6));
    setPage(1);
  }, []);

  const loadInitial = useCallback(async (options: { silent?: boolean } = {}) => {
    const { silent = false } = options;

    if (!silent) {
      // Show cached content instantly while fresh data loads
      const cached = await contentCache.getExplore();
      if (cached?.wallpapers?.length) {
        applyFeed(cached.wallpapers, cached.trending || []);
        setLoading(false);
      } else {
        setLoading(true);
      }
    }

    try {
      const [grid, carousel] = await Promise.all([
        fetchExplore(1),
        fetchTrending(1),
      ]);
      applyFeed(grid, carousel);
      setHasMore(grid.length > 0);
      hasLoadedOnce.current = true;
      await contentCache.setExplore({ wallpapers: grid, trending: carousel.slice(0, 6) });
    } finally {
      if (!silent) setLoading(false);
    }
  }, [applyFeed]);

  // Initial load — show cache instantly, then fetch once (no auto-refresh)
  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  // Manual pull-to-refresh — the ONLY way content refreshes
  const handleRefresh = async () => {
    setIsRefreshing(true);
    setHasMore(true);
    await loadInitial({ silent: true });
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (!query.trim()) return;

    const timer = setTimeout(async () => {
      setLoading(true);
      setPage(1);
      setHasMore(true);
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

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (!text.trim() && hasLoadedOnce.current) {
      setHasMore(true);
      loadInitial({ silent: true });
    }
  }, [loadInitial]);

  const loadMore = useCallback(async () => {
    // Guard: don't fetch while already fetching, refreshing, or no more pages
    if (isFetchingRef.current || isRefreshing || !hasMore) return;

    isFetchingRef.current = true;
    setLoadingMore(true);

    try {
      const next = page + 1;
      const fresh = query.trim()
        ? await fetchSearch(query, next)
        : await fetchExplore(next);

      if (fresh.length > 0) {
        setWallpapers(prev => {
          const existingIds = new Set(prev.map(w => w.id));
          const uniqueNew = fresh.filter(w => !existingIds.has(w.id));
          return [...prev, ...uniqueNew];
        });
        setPage(next);
      } else {
        // No more results from Wallhaven
        setHasMore(false);
      }
    } finally {
      isFetchingRef.current = false;
      setLoadingMore(false);
    }
  }, [isRefreshing, hasMore, page, query]);

  const carousel = !query.trim() && trending.length > 0 ? (
    <WallpaperCarousel
      title="Trending"
      data={trending}
      onSeeAll={() => router.push('/view-all')}
    />
  ) : null;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.bg }]} edges={['top']}>
      {/* Premium Header */}
      <LargeHeader
        title="WallZone"
        isLogo={true}
        searchPlaceholder="Search wallpapers..."
        searchValue={query}
        onSearch={setQuery}
        onSearchSubmit={() => {}}
      />

      {loading && wallpapers.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={t.accent} />
        </View>
      ) : (
        <WallpaperGrid
          ref={listRef}
          wallpapers={wallpapers}
          header={carousel}
          onLoadMore={loadMore}
          isLoadingMore={loadingMore}
          emptyMessage="No results found — try a different keyword"
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
