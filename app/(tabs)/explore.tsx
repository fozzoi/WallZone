import { View, StyleSheet, ActivityIndicator, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import Topbar from '@/components/explore/topbar';
import WallpaperGrid from '@/components/explore/WallpaperGrid';
import WallpaperCarousel from '@/components/explore/WallpaperCarousel';
import { fetchWallpapers, fetchTrending } from '@/services/api';

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [wallpapers, setWallpapers] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);

  // Get the current system theme
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  // Load initial data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Handle search queries
  useEffect(() => {
    const search = async () => {
      setLoading(true);
      const data = await fetchWallpapers(searchQuery);
      setWallpapers(data);
      setLoading(false);
    };

    if (searchQuery.trim() !== '') {
      search();
    } else {
      // If search is cleared, reload the default latest wallpapers
      loadData();
    }
  }, [searchQuery]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch grid and carousel data at the same time for better performance
      const [gridData, carouselData] = await Promise.all([
        fetchWallpapers(),
        fetchTrending()
      ]);
      setWallpapers(gridData);
      setTrending(carouselData);
    } catch (error) {
      console.error("Failed to fetch initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Only show the trending carousel if the user is NOT searching
  const renderCarouselHeader = () => (
    !searchQuery ? (
      <WallpaperCarousel 
        title="Trending" 
        data={trending} 
      />
    ) : null
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#ffffff' }]}> 
      <Topbar title="Wallzone" onSearch={setSearchQuery} />
      
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator 
            size="large" 
            color={isDark ? "#ffffff" : "#111111"} 
            style={{marginTop: 50}} 
          />
        ) : (
          <WallpaperGrid 
            wallpapers={wallpapers} 
            header={renderCarouselHeader()} 
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    // Background color is handled dynamically in the component style array
  },
  content: {
    flex: 1, 
  }
});