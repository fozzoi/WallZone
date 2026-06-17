// app/(tabs)/index.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, AppState, AppStateStatus } from 'react-native';
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
  const appStateRef = useRef(AppState.currentState);
  const hasLoadedOnce = useRef(false);

  useEffect(() => {
    if (params.scrollToTop) {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  }, [params.scrollToTop]);

  const applyFeed = useCallback((grid: Wallpaper[], carousel: Wallpaper[]) => {
    setWallpapers(grid);
    setTrending(carousel.slice(0, 6));
    setPage(1);
  }, []);

  const loadInitial = useCallback(async (options: { refresh?: boolean; silent?: boolean } = {}) => {
    const { refresh = false, silent = false } = options;

    if (!silent) {
      const cached = await contentCache.getExplore();
      if (cached?.wallpapers?.length) {
        applyFeed(cached.wallpapers, cached.trending || []);
        setLoading(false);
      } else if (!refresh) {
        setLoading(true);
      }
    }

    try {
      const [grid, carousel] = await Promise.all([
        fetchExplore(1, refresh),
        fetchTrending(1, refresh),
      ]);
      applyFeed(grid, carousel);
      hasLoadedOnce.current = true;
      await contentCache.setExplore({ wallpapers: grid, trending: carousel.slice(0, 6) });
    } finally {
      if (!silent) setLoading(false);
    }
  }, [applyFeed]);

  // Initial load — show cache instantly, then fetch fresh
  useEffect(() => {
    loadInitial({ refresh: true });
  }, [loadInitial]);

  // Refresh whenever the app returns to foreground
  useEffect(() => {
    const onAppStateChange = (nextState: AppStateStatus) => {
      const wasBackground = appStateRef.current.match(/inactive|background/);
      if (wasBackground && nextState === 'active' && !query.trim()) {
        loadInitial({ refresh: true, silent: true });
      }
      appStateRef.current = nextState;
    };

    const sub = AppState.addEventListener('change', onAppStateChange);
    return () => sub.remove();
  }, [loadInitial, query]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadInitial({ refresh: true, silent: true });
    setIsRefreshing(false);
  };

  useEffect(() => {
    if (!query.trim()) return;

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

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (!text.trim() && hasLoadedOnce.current) {
      loadInitial({ silent: true });
    }
  }, [loadInitial]);

  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || loading || isRefreshing) return;

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
      }
    } finally {
      isFetchingRef.current = false;
      setLoadingMore(false);
    }
  }, [loading, isRefreshing, page, query]);

  const carousel = !query.trim() && trending.length > 0 ? (
    <WallpaperCarousel
      title="Trending"
      data={trending}
      onSeeAll={() => router.push('/view-all')}
    />
  ) : null;

  const showSpinner = loading && wallpapers.length === 0;

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.bg }]} edges={['top']}>
      <LargeHeader
        title="WallZone"
        searchPlaceholder="Search wallpapers…"
        onSearch={handleSearch}
        searchValue={query}
      />

      {showSpinner ? (
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
