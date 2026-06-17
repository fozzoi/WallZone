// app/view-all.tsx

import React, { useState, useEffect, useCallback } from 'react';
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
  
  // NEW: State for pull-to-refresh
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isCat = isCategory === '1';

  const load = useCallback(async (p: number, reset = false, isRefresh = false, bustCache = false) => {
    if (reset && !isRefresh) setLoading(true);
    try {
      let data: Wallpaper[];
      if (!query)     data = await fetchTrending(p, bustCache);
      else if (isCat) data = await fetchCategory(query, p);
      else            data = await fetchSearch(query, p);

      setWallpapers(prev => (reset ? data : [...prev, ...data]));
      setPage(p);
    } finally {
      if (reset && !isRefresh) setLoading(false);
      if (!reset) setLoadingMore(false);
    }
  }, [query, isCat]);

  useEffect(() => {
    load(1, true);
  }, [query]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await load(1, true, true, true);
    setIsRefreshing(false);
  };

  const loadMore = useCallback(async () => {
    if (loadingMore || loading || isRefreshing) return;
    setLoadingMore(true);
    await load(page + 1, false);
  }, [loadingMore, loading, isRefreshing, page, load]);

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
