import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, useColorScheme, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import WallpaperGrid from '@/components/explore/WallpaperGrid';
import { fetchTrending } from '@/services/api'; 

export default function ViewAllScreen() {
  const [wallpapers, setWallpapers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const router = useRouter();
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      // You can also create a fetchAll() in api.ts if you want more than 10 results here,
      // but for now, we will reuse fetchTrending()
      const data = await fetchTrending(); 
      setWallpapers(data);
      setLoading(false);
    };
    
    loadData();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
      {/* Custom Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? '#222' : '#f0f0f0' }]}>
        <TouchableOpacity 
          onPress={() => router.back()} 
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={isDark ? '#ffffff' : '#111111'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#ffffff' : '#111111' }]}>
          Trending Wallpapers
        </Text>
        <View style={{ width: 24 }} /> {/* Empty view to balance the flex layout */}
      </View>

      {/* Grid Content */}
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator 
            size="large" 
            color={isDark ? '#ffffff' : '#111111'} 
            style={{ marginTop: 50 }} 
          />
        ) : (
          <WallpaperGrid 
            wallpapers={wallpapers} 
            header={null} // No carousel needed on this page
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  }
});