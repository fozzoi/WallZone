// app/view-all.tsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

import { DetailHeader } from '@/components/ui/PageHeader';
import WallpaperGrid from '@/components/explore/WallpaperGrid';
import { fetchSearch, fetchCategory, fetchTrending } from '@/services/api';
import { useTheme } from '@/constants/theme';
import type { Wallpaper } from '@/services/api';

export default function ViewAllScreen() {
  const t = useTheme();
  const { query = '', title = 'Wallpapers', isCategory } = useLocalSearchParams<{
    query: string;
    title: string;
    isCategory: string;
  }>();

  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasMore, setHasMore]       = useState(true);
  const isFetchingRef = useRef(false);

  const isCat = isCategory === '1';

  const load = useCallback(async (p: number, reset = false) => {
    if (reset) setLoading(true);
    try {
      let data: Wallpaper[];
      if (!query)     data = await fetchTrending(p);
      else if (isCat) data = await fetchCategory(query, p);
      else            data = await fetchSearch(query, p);

      if (reset) {
        setWallpapers(data);
        setHasMore(data.length > 0);
      } else {
        if (data.length === 0) {
          setHasMore(false);
        } else {
          setWallpapers(prev => {
            const existingIds = new Set(prev.map(w => w.id));
            const unique = data.filter(w => !existingIds.has(w.id));
            return [...prev, ...unique];
          });
          setHasMore(true);
        }
      }
      setPage(p);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [query, isCat]);

  useEffect(() => {
    setHasMore(true);
    load(1, true);
  }, [query]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setHasMore(true);
    await load(1, true);
    setIsRefreshing(false);
  };

  const loadMore = useCallback(async () => {
    // Guard: skip if already fetching, refreshing, or no more pages
    if (isFetchingRef.current || isRefreshing || !hasMore) return;
    isFetchingRef.current = true;
    setLoadingMore(true);
    await load(page + 1, false);
    isFetchingRef.current = false;
  }, [isRefreshing, hasMore, page, load]);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.bg }]} edges={['top']}>
      <DetailHeader title={title} />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={t.accent} />
        </View>
      ) : (
        <WallpaperGrid
          wallpapers={wallpapers}
          onLoadMore={loadMore}
          isLoadingMore={loadingMore}
          emptyMessage="No wallpapers found"
          // NEW: Pass refresh props
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />
      )}
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  root:   { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
