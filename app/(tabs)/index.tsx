// app/(tabs)/index.tsx

import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import WallpaperCarousel from '@/components/explore/WallpaperCarousel';
import { FlashListRef } from '@shopify/flash-list';
import WallpaperGrid from '@/components/explore/WallpaperGrid';
import { FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING, useTheme } from '@/constants/theme';
import type { Wallpaper } from '@/services/api';
import { fetchExplore, fetchSearch, fetchTrending } from '@/services/api';
import { contentCache } from '@/services/cache';

const { width: W } = Dimensions.get('window');

// ─── Collapse thresholds ───────────────────────────────────────────────────────
const HEADER_EXPANDED_H = 96; // logo (35) + margin (8) + search (40) + bottom padding (13)
const HEADER_COLLAPSED_H = 56; // search (40) + vertical padding (16)
const COLLAPSE_START = 0;
const COLLAPSE_END = 50;

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
  const [searchFocused, setSearchFocused] = useState(false);

  const isFetchingRef = useRef(false);
  const listRef = useRef<FlashListRef<any>>(null);
  const hasLoadedOnce = useRef(false);
  const searchInputRef = useRef<TextInput>(null);

  // ─── Scroll-driven header animation ─────────────────────────────────────────
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [COLLAPSE_START, COLLAPSE_END],
    outputRange: [HEADER_EXPANDED_H, HEADER_COLLAPSED_H],
    extrapolate: 'clamp',
  });

  const logoOpacity = scrollY.interpolate({
    inputRange: [COLLAPSE_START, COLLAPSE_END * 0.8],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const logoTranslateY = scrollY.interpolate({
    inputRange: [COLLAPSE_START, COLLAPSE_END],
    outputRange: [0, -40],
    extrapolate: 'clamp',
  });

  const searchTranslateY = scrollY.interpolate({
    inputRange: [COLLAPSE_START, COLLAPSE_END],
    outputRange: [0, -43],
    extrapolate: 'clamp',
  });

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
  const totalHeaderH = Animated.add(headerHeight, new Animated.Value(topInset));

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
      <Animated.View
        style={[
          styles.header,
          { paddingTop: topInset, height: totalHeaderH },
        ]}
        pointerEvents="box-none"
      >
        {/* Blur backing */}
        <BlurView
          intensity={Platform.OS === 'android' ? 80 : 55}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />

        {/* Glass border bottom */}
        <View style={styles.headerBorder} />

        {/* Logo row */}
        <Animated.View 
          style={[
            styles.logoRow,
            {
              opacity: logoOpacity,
              transform: [{ translateY: logoTranslateY }],
            }
          ]}
        >
          <Text style={styles.logoText}>
            Wall<Text style={styles.logoDim}>Zone</Text>
          </Text>
        </Animated.View>

        {/* Floating search bar */}
        <Animated.View
          style={[
            styles.searchWrap,
            {
              transform: [{ translateY: searchTranslateY }],
            },
          ]}
          pointerEvents="auto"
        >
          <View
            style={[
              styles.searchBar,
              searchFocused && styles.searchBarFocused,
            ]}
          >
            <Ionicons
              name="search"
              size={15}
              color={searchFocused ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)'}
              style={{ marginRight: 8 }}
            />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search wallpapers..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={query}
              onChangeText={handleSearch}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={handleClearSearch} hitSlop={10}>
                <Ionicons name="close-circle" size={16} color="rgba(255,255,255,0.45)" />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </Animated.View>

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

  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    overflow: 'hidden',
    paddingHorizontal: SPACING.lg,
    paddingBottom: 10,
    justifyContent: 'flex-end',
  },
  headerBorder: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 0.5,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },

  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  logoText: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.8,
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
  },
  logoDim: {
    color: 'rgba(255,255,255,0.32)',
  },
  miniActions: {
    flexDirection: 'row',
    gap: 8,
  },
  miniBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchWrap: {
    // animated container
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: RADIUS.lg,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    height: 40,
  },
  searchBarFocused: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderColor: 'rgba(255,255,255,0.22)',
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.medium,
    paddingVertical: 0,
  },
});