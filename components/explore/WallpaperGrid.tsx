import React, { useContext } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Pressable } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FavoritesContext } from '@/context/FavoritesContext';

export default function WallpaperGrid({ wallpapers, header }) {
  const router = useRouter();
  // We pull in 'favorites' to pass it as extraData!
  const { isFavorite, toggleFavorite, favorites } = useContext(FavoritesContext);

  const renderItem = ({ item }) => {
    const isFav = isFavorite(item.id);

    return (
      <TouchableOpacity 
        style={[styles.cardContainer, { height: item.height }]}
        activeOpacity={0.8}
        onPress={() => router.push({ pathname: '/wallpaper/[id]', params: { id: item.id, ...item } })}
      >
        <Image source={{ uri: item.url }} style={styles.image} contentFit="cover" transition={300} />
        
        <View style={styles.overlay}>
          <Text style={styles.authorText} numberOfLines={1}>{item.author || 'Wallzone'}</Text>
          {/* Pressable handles nested touches much better than TouchableOpacity */}
          <Pressable 
            onPress={() => toggleFavorite(item)} 
            style={styles.favButton}
            hitSlop={10} // Makes the tap target larger so it's easier to press
          >
            <Ionicons name={isFav ? "heart" : "heart-outline"} size={22} color={isFav ? "#ff4757" : "#fff"} />
          </Pressable>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlashList
        data={wallpapers}
        // THIS IS THE FIX: Tells FlashList to re-render when favorites change!
        extraData={favorites} 
        estimatedItemSize={250}
        masonry 
        numColumns={2} 
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listPadding}
        ListHeaderComponent={header} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%' },
  listPadding: { paddingHorizontal: 8, paddingBottom: 120 },
  cardContainer: {
    margin: 8, borderRadius: 20, overflow: 'hidden', backgroundColor: '#333',
  },
  image: { width: '100%', height: '100%' },
  overlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 10, backgroundColor: 'rgba(0,0,0,0.4)',
  },
  authorText: { color: '#fff', fontSize: 12, fontWeight: '600', flex: 1, marginRight: 8 },
  favButton: { padding: 4 }
});