import { View, StyleSheet, Text, useColorScheme } from 'react-native';
import React, { useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FavoritesContext } from '@/context/FavoritesContext';
import WallpaperGrid from '@/components/explore/WallpaperGrid';

export default function FavoritesScreen() {
  const { favorites } = useContext(FavoritesContext);
  
  // Tap into the system theme
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#ffffff' }]}>
      <View style={[styles.header, { borderBottomColor: isDark ? '#222222' : '#f0f0f0' }]}>
        <Text style={[styles.title, { color: isDark ? '#ffffff' : '#111111' }]}>
          Your Favorites
        </Text>
      </View>
      
      {/* Fallback if favorites is undefined or empty */}
      {!favorites || favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: isDark ? '#888888' : '#888888' }]}>
            No favorites yet. Start exploring!
          </Text>
        </View>
      ) : (
        <View style={styles.content}>
          <WallpaperGrid wallpapers={favorites} header={null} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, borderBottomWidth: 1 },
  title: { fontSize: 28, fontWeight: 'bold' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 16 },
  content: { flex: 1 }
});