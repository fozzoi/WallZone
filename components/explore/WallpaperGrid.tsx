import { FavoritesContext } from '@/context/FavoritesContext';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function WallpaperGrid({ wallpapers, header, onLoadMore, isLoadingMore }) {
  const router = useRouter();
  const { isFavorite, toggleFavorite, favorites } = useContext(FavoritesContext);

  const renderItem = ({ item }) => {
    const isFav = isFavorite(item.id);
    const itemHeight = item.height ? Number(item.height) : 250;

    const handlePress = () => {
      router.push({
        pathname: '/wallpaper/[id]',
        params: {
          id: String(item.id), 
          url: item.url,
          fullUrl: item.fullUrl || item.url, 
          title: item.title || 'Untitled',
          author: item.author || 'Unknown',
          height: itemHeight
        }
      });
    };

    return (
      <TouchableOpacity 
        style={[styles.cardContainer, { height: itemHeight }]}
        activeOpacity={0.85}
        onPress={handlePress}
      >
        <Image 
          source={{ uri: item.url }} 
          style={styles.image} 
          contentFit="cover" 
          transition={300} 
        />
        
        {/* 1. Smooth Dark Fade: Ensures white text/icons are visible on light images */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)']}
          style={styles.gradientMask}
          pointerEvents="none"
        />
        
        {/* 2. Glassmorphism Info Panel */}
        <View style={styles.overlayWrapper}>
          <BlurView 
            intensity={Platform.OS === 'android' ? 60 : 40}
            tint="dark" 
            style={styles.glassPanel}
          >
            <Text style={styles.authorText} numberOfLines={1}>
              {item.author || 'WallZone'}
            </Text>
            <Pressable onPress={() => toggleFavorite(item)} style={styles.favButton} hitSlop={15}>
              <Ionicons 
                name={isFav ? "heart" : "heart-outline"} 
                size={20} 
                color={isFav ? "#ff4d6d" : "#ffffff"} 
              />
            </Pressable>
          </BlurView>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlashList
        data={wallpapers}
        extraData={favorites} 
        estimatedItemSize={250}
        masonry 
        numColumns={2} 
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listPadding}
        ListHeaderComponent={header} 
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.5} 
        ListFooterComponent={
          isLoadingMore ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color="#888" />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    width: '100%' 
  },
  listPadding: { 
    paddingHorizontal: 6, // 6px padding on edges + 6px margin on cards = 12px outer spacing
    paddingBottom: 140 
  },
  
  /* Modern Masonry Card */
  cardContainer: { 
    marginHorizontal: 6, // 12px gap between columns
    marginBottom: 12,    // 12px gap between rows
    borderRadius: 22, 
    overflow: 'hidden', 
    backgroundColor: '#1E1E1E',
    // Subtle shadow for depth
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: { 
    width: '100%', 
    height: '100%' 
  },

  /* Overlays */
  gradientMask: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%', // Fades up the bottom half
  },
  overlayWrapper: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    borderRadius: 16,
    overflow: 'hidden', // Required to clip the blur view into a pill shape
  },
  glassPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.1)', // Very subtle tint behind the blur
  },
  authorText: { 
    color: '#ffffff', 
    fontSize: 11,
    fontWeight: '700', 
    flex: 1, 
    marginRight: 8,
    letterSpacing: 0.3,
  },
  favButton: { 
    padding: 2,
  },
  
  loader: { 
    paddingVertical: 20, 
    alignItems: 'center' 
  }
});