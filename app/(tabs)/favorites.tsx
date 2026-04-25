import React, { useContext } from 'react';
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FavoritesContext } from '@/context/FavoritesContext';
import WallpaperGrid from '@/components/explore/WallpaperGrid';

export default function FavoritesScreen() {
  const { favorites } = useContext(FavoritesContext);
  const router = useRouter();
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  const bgColor = isDark ? '#000000' : '#FFFFFF';
  const textColor = isDark ? '#FFFFFF' : '#111111';
  const subTextColor = isDark ? '#888888' : '#666666';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      {/* 1. Header Section - Modern Large Title */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>Collection</Text>
        <Text style={[styles.subtitle, { color: subTextColor }]}>
          {favorites?.length || 0} wallpapers saved
        </Text>
      </View>

      {/* 2. Main Content Logic */}
      {!favorites || favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={[styles.iconCircle, { backgroundColor: isDark ? '#111' : '#F5F5F5' }]}>
            <Ionicons name="heart-outline" size={40} color={isDark ? '#444' : '#CCC'} />
          </View>
          
          <Text style={[styles.emptyTitle, { color: textColor }]}>Nothing here yet</Text>
          <Text style={[styles.emptySubtitle, { color: subTextColor }]}>
            Tap the heart icon on any wallpaper to save it to your personal collection.
          </Text>
          
          {/* Back to Explore Button */}
          <TouchableOpacity 
            style={[styles.exploreButton, { backgroundColor: isDark ? '#FFF' : '#111' }]}
            onPress={() => router.push('/')}
            activeOpacity={0.8}
          >
            <Text style={[styles.exploreButtonText, { color: isDark ? '#000' : '#FFF' }]}>
              Find Wallpapers
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.content}>
          <WallpaperGrid 
            wallpapers={favorites} 
            header={null}
            // Adding bottom padding for our custom pill tab bar
            contentContainerStyle={styles.gridPadding} 
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  header: { 
    paddingHorizontal: 24, 
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: { 
    fontSize: 34, 
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  content: { 
    flex: 1 
  },
  gridPadding: {
    paddingHorizontal: 12,
    paddingBottom: 120, // Space for the pill tab bar + some breathing room
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 60,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: { 
    fontSize: 20, 
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: { 
    fontSize: 15, 
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  exploreButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  exploreButtonText: {
    fontSize: 16,
    fontWeight: '700',
  }
});