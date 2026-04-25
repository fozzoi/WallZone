import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, useColorScheme, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import WallpaperGrid from '@/components/explore/WallpaperGrid';
// UPDATED: Changed fetchTrending to fetchTopicAssets
import { fetchTopicAssets, fetchWallpapers } from '@/services/api'; 

export default function ViewAllScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  // Read params passed from Categories or Explore page
  const query = typeof params.query === 'string' ? params.query : '';
  const title = typeof params.title === 'string' ? params.title : 'Trending Wallpapers';

  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      // UPDATED: Fetch based on whether a query was provided
      const data = query 
        ? await fetchWallpapers(query, 1) 
        : await fetchTopicAssets('wallpapers', 1); 
      
      setWallpapers(data || []);
      setLoading(false);
    };
    loadInitialData();
  }, [query]);

  const loadMoreData = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    
    try {
      // UPDATED: Using fetchTopicAssets for the next page
      const newWallpapers = query 
        ? await fetchWallpapers(query, nextPage) 
        : await fetchTopicAssets('wallpapers', nextPage);

      if (newWallpapers && newWallpapers.length > 0) {
        setWallpapers((prev) => [...prev, ...newWallpapers]);
        setPage(nextPage);
      }
    } catch (error) {
      console.error("Error loading more wallpapers", error);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <View style={[styles.header, { borderBottomColor: isDark ? '#222' : '#f0f0f0' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#fff' : '#111'} />
        </TouchableOpacity>
        
        {/* Dynamic Title based on params */}
        <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#111' }]} numberOfLines={1}>
          {title}
        </Text>
        
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={isDark ? '#fff' : '#111'} style={{ marginTop: 50 }} />
        ) : (
          <WallpaperGrid 
            wallpapers={wallpapers} 
            header={null} 
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  content: { flex: 1 }
});