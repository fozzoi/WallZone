// app/(tabs)/index.tsx

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import WallpaperCarousel from '@/components/explore/WallpaperCarousel';
import { FloatingHeader, HEADER_EXPANDED_H } from '@/components/ui/PageHeader';
import { FlashListRef } from '@shopify/flash-list';
import WallpaperGrid from '@/components/explore/WallpaperGrid';
import { useTheme } from '@/constants/theme';
import type { Wallpaper } from '@/services/api';
import { fetchExplore, fetchSearch, fetchTrending } from '@/services/api';
import { contentCache } from '@/services/cache';

const { width: W } = Dimensions.get('window');

export default function ExploreScreen() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams();

  const [query, setQuery] = useState('');
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [trending, setTrending] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const isFetchingRef = useRef(false);
  const listRef = useRef<FlashListRef<any>>(null);
  const hasLoadedOnce = useRef(false);
  const searchInputRef = useRef<TextInput>(null);

  // ─── Scroll-driven header animation ─────────────────────────────────────────
  const scrollY = useRef(new Animated.Value(0)).current;

  // ─── scroll-to-top from tab press ────────────────────────────────────────────
  useEffect(() => {
    if (params.scrollToTop) {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
  }, [params.scrollToTop]);

  // ─── Data helpers ─────────────────────────────────────────────────────────────
  const applyFeed = useCallback((grid: Wallpaper[], carousel: Wallpaper[]) => {
    setWallpapers(grid);
    const carouselData = carousel.length > 0 ? carousel : grid.slice(0, 6);
    setTrending(carouselData.slice(0, 6));
    setPage(1);
  }, []);

  const loadInitial = useCallback(async (options: { silent?: boolean } = {}) => {
    const { silent = false } = options;

    if (!silent) {
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

  useEffect(() => { loadInitial(); }, [loadInitial]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setHasMore(true);
    await loadInitial({ silent: true });
    setIsRefreshing(false);
  };

  // ─── Search ───────────────────────────────────────────────────────────────────
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

  const handleClearSearch = useCallback(() => {
    setQuery('');
    searchInputRef.current?.blur();
    if (hasLoadedOnce.current) loadInitial({ silent: true });
  }, [loadInitial]);

  // ─── Pagination ───────────────────────────────────────────────────────────────
  const loadMore = useCallback(async () => {
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
          return [...prev, ...fresh.filter(w => !existingIds.has(w.id))];
        });
        setPage(next);
      } else {
        setHasMore(false);
      }
    } finally {
      isFetchingRef.current = false;
      setLoadingMore(false);
    }
  }, [isRefreshing, hasMore, page, query]);

  // ─── Header total height = animated area + safe area top ─────────────────────
  const topInset = insets.top;

  const carousel = !query.trim() && trending.length > 0 ? (
    <WallpaperCarousel
      title="Trending"
      data={trending}
      onSeeAll={() => router.push('/view-all')}
    />
  ) : null;

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>

      {/* ── Floating Header ── */}
      <FloatingHeader
        title="Wall"
        titleSuffix="Zone"
        isLogo
        scrollY={scrollY}
        search={{
          placeholder: 'Search wallpapers...',
          value: query,
          onChangeText: handleSearch,
          onClear: handleClearSearch,
          inputRef: searchInputRef,
        }}
      />

      {/* ── Grid (full screen, inset for header) ── */}
      <WallpaperGrid
        ref={listRef}
        wallpapers={wallpapers}
        header={carousel}
        onLoadMore={loadMore}
        isLoadingMore={loadingMore}
        isLoading={loading}
        emptyMessage="No results found — try a different keyword"
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        scrollY={scrollY}
        headerHeight={HEADER_EXPANDED_H + topInset}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});