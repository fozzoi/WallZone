import { View, StyleSheet, ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import Topbar from '@/components/explore/topbar';
import WallpaperGrid from '@/components/explore/WallpaperGrid';
import WallpaperCarousel from '@/components/explore/WallpaperCarousel';
// UPDATED: Changed fetchTrending to fetchTopicAssets to match your api.js
import { fetchWallpapers, fetchTopicAssets } from '@/services/api';

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [wallpapers, setWallpapers] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const theme = useColorScheme();
  const isDark = theme === 'dark';

  // UPDATED: Standardized initial data fetch
  const loadInitialData = async () => {
    setLoading(true);
    setPage(1);
    try {
      // Use fetchTopicAssets('wallpapers') to replace the old trending call
      const [gridData, carouselData] = await Promise.all([
        fetchWallpapers('', 1),
        fetchTopicAssets('wallpapers', 1)
      ]);
      
      setWallpapers(gridData || []);
      setTrending((carouselData || []).slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  // UPDATED: Handle search queries specifically
  useEffect(() => {
    if (searchQuery.trim() === '') {
      loadInitialData();
      return;
    }

    const search = async () => {
      setLoading(true);
      setPage(1);
      try {
        const data = await fetchWallpapers(searchQuery, 1);
        setWallpapers(data || []);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      search();
    }, 500); // 500ms debounce to prevent API spam while typing

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // UPDATED: Pagination logic
  const loadMoreData = async () => {
    if (loadingMore || loading) return; 
    setLoadingMore(true);
    const nextPage = page + 1;
    
    try {
      const newWallpapers = await fetchWallpapers(searchQuery, nextPage);
      if (newWallpapers && newWallpapers.length > 0) {
        setWallpapers((prev) => [...prev, ...newWallpapers]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error("Error loading more", error);
    } finally {
      setLoadingMore(false);
    }
  };

  const renderCarouselHeader = () => (
    !searchQuery ? <WallpaperCarousel title="Trending" data={trending} /> : null
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}> 
      <Topbar title="Wallzone" onSearch={setSearchQuery} />
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={isDark ? "#fff" : "#111"} style={{marginTop: 50}} />
        ) : (
          <WallpaperGrid 
            wallpapers={wallpapers} 
            header={renderCarouselHeader()} 
            onLoadMore={loadMoreData}
            isLoadingMore={loadingMore}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 }
});