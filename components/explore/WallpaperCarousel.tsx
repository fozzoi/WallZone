import React, { useRef, useContext } from 'react';
import { View, Text, Animated, StyleSheet, TouchableOpacity, Dimensions, useColorScheme, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons'; 
import { FavoritesContext } from '@/context/FavoritesContext';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.72; 
const CARD_HEIGHT = CARD_WIDTH * 1.1; 
const GAP = 12;

export default function WallpaperCarousel({ title, data }) {
  const scrollX = useRef(new Animated.Value(0)).current;
  // Pull in 'favorites' for extraData
  const { isFavorite, toggleFavorite, favorites } = useContext(FavoritesContext);
  const router = useRouter();
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  if (!data || data.length === 0) return null;

  const renderItem = ({ item }) => {
    const isFav = isFavorite(item.id);

    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: isDark ? '#333' : '#f1f1f1' }]} 
        activeOpacity={0.9}
        onPress={() => router.push({ pathname: '/wallpaper/[id]', params: { id: item.id, ...item } })}
      >
        <Image source={{ uri: item.url }} style={styles.image} contentFit="cover" transition={200} />
        
        {/* Improved Favorite Button */}
        <Pressable 
          style={styles.menuBtn} 
          onPress={() => toggleFavorite(item)}
          hitSlop={15}
        >
          <Ionicons name={isFav ? "heart" : "heart-outline"} size={22} color={isFav ? "#ff4757" : "white"} />
        </Pressable>

        <View style={styles.textContainer}>
          <Text style={styles.fileName} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.subText}>{item.author || 'Wallzone'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#1f1f1f' }]}>{title || "Trending"}</Text>
        <TouchableOpacity onPress={() => router.push('/view-all')}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>
      
      <Animated.FlatList
        data={data}
        // THE FIX FOR CAROUSEL RE-RENDERING
        extraData={favorites} 
        renderItem={renderItem}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listPadding}
        snapToInterval={CARD_WIDTH + GAP} 
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum={true}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false } 
        )}
        scrollEventThrottle={16}
      />

      <View style={styles.paginationContainer}>
        {data.map((_, i) => {
          const inputRange = [(i - 1) * (CARD_WIDTH + GAP), i * (CARD_WIDTH + GAP), (i + 1) * (CARD_WIDTH + GAP)];
          const dotWidth = scrollX.interpolate({ inputRange, outputRange: [8, 20, 8], extrapolate: 'clamp' });
          const opacity = scrollX.interpolate({ inputRange, outputRange: [0.3, 1, 0.3], extrapolate: 'clamp' });

          return (
            <Animated.View key={i.toString()} style={[styles.dot, { width: dotWidth, opacity, backgroundColor: isDark ? '#fff' : '#111' }]} />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 14 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  seeAll: { fontSize: 14, color: '#0061a4', fontWeight: '600' },
  listPadding: { paddingHorizontal: 20 },
  card: { width: CARD_WIDTH, height: CARD_HEIGHT, marginRight: GAP, borderRadius: 24, overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  menuBtn: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 20, padding: 6 },
  textContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingTop: 40, backgroundColor: 'rgba(0,0,0,0.4)' },
  fileName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  subText: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  paginationContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16, height: 10 },
  dot: { height: 8, borderRadius: 4, marginHorizontal: 4 },
});