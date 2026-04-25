import { FavoritesContext } from '@/context/FavoritesContext';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useContext, useMemo, useRef } from 'react';
import {
    Animated,
    Dimensions,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    useColorScheme,
    View
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.72; 
const CARD_HEIGHT = CARD_WIDTH * 1.25; 
const GAP = 16;
const ITEM_SIZE = CARD_WIDTH + GAP; 

// Reduced from 50 to 8 to completely eliminate lag while keeping the infinite feel
const LOOP_MULTIPLIER = 8;

export default function WallpaperCarousel({ title, data }) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const { isFavorite, toggleFavorite, favorites } = useContext(FavoritesContext);
  const router = useRouter();
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  const infiniteData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Array(LOOP_MULTIPLIER).fill(data).flat();
  }, [data]);

  // Calculate the absolute pixel offset for the middle index
  const middleIndex = data ? Math.floor(LOOP_MULTIPLIER / 2) * data.length : 0;
  const initialOffset = middleIndex * ITEM_SIZE;

  // Pre-calculate dot interpolation ranges so the JS thread doesn't lag on scroll
  const { dotInputRange, widthOutputRanges, opacityOutputRanges } = useMemo(() => {
    const ranges = { dotInputRange: [], widthOutputRanges: [], opacityOutputRanges: [] };
    if (!data) return ranges;

    infiniteData.forEach((_, index) => {
      ranges.dotInputRange.push(index * ITEM_SIZE);
    });

    data.forEach((_, originalIndex) => {
      const widthRange = [];
      const opacityRange = [];
      infiniteData.forEach((_, index) => {
        const isActive = index % data.length === originalIndex;
        widthRange.push(isActive ? 24 : 8);
        opacityRange.push(isActive ? 1 : 0.2);
      });
      ranges.widthOutputRanges.push(widthRange);
      ranges.opacityOutputRanges.push(opacityRange);
    });

    return ranges;
  }, [data, infiniteData]);

  if (!data || data.length === 0) return null;

  const renderItem = ({ item, index }) => {
    const isFav = isFavorite(item.id);

    const inputRange = [
      (index - 1) * ITEM_SIZE, 
      index * ITEM_SIZE, 
      (index + 1) * ITEM_SIZE
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.88, 1, 0.88], 
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.6, 1, 0.6],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View style={[styles.cardWrapper, { transform: [{ scale }], opacity }]}>
        <TouchableOpacity 
          style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : '#f5f5f5' }]} 
          activeOpacity={0.85}
          onPress={() => router.push({ pathname: '/wallpaper/[id]', params: { id: item.id, ...item } })}
        >
          <Image 
            source={{ uri: item.url }} 
            style={styles.image} 
            contentFit="cover" 
            transition={200} 
          />
          
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradientMask}
            pointerEvents="none"
          />

          <View style={styles.glassWrapper}>
            <BlurView 
              intensity={Platform.OS === 'android' ? 65 : 45} 
              tint="dark" 
              style={styles.glassPanel}
            >
              <View style={styles.textContainer}>
                <Text style={styles.fileName} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.subText}>{item.author || 'Wallzone'}</Text>
              </View>

              <Pressable 
                style={styles.favButton} 
                onPress={() => toggleFavorite(item)}
                hitSlop={15}
              >
                <Ionicons 
                  name={isFav ? "heart" : "heart-outline"} 
                  size={24} 
                  color={isFav ? "#ff4d6d" : "#ffffff"} 
                />
              </Pressable>
            </BlurView>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#fff' }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.headerTitle, { color: isDark ? '#fff' : '#1f1f1f' }]}>
          {title || "Trending"}
        </Text>
        <TouchableOpacity onPress={() => router.push('/view-all')} activeOpacity={0.6}>
          <Text style={[styles.seeAll,{ color: isDark ? '#fff' : '#1f1f1f' }]}>See all</Text>
        </TouchableOpacity>
      </View>
      
      <Animated.FlatList
        data={infiniteData}
        extraData={favorites} 
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.id}-loop-${index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        
        // Exact pixel calculation to force centering
        contentContainerStyle={{ paddingHorizontal: (width - ITEM_SIZE) / 2 }}
        
        // FIX: Using contentOffset directly bypasses the initialScrollIndex math bug
        contentOffset={{ x: initialOffset, y: 0 }}

        snapToInterval={ITEM_SIZE} 
        snapToAlignment="start" 
        decelerationRate="fast"
        bounces={false} 
        
        // PERFORMANCE BOOSTERS: Kills the lag completely by dropping off-screen blurs
        initialNumToRender={3}
        windowSize={3}
        maxToRenderPerBatch={3}
        removeClippedSubviews={true}
        
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false } 
        )}
        scrollEventThrottle={16}
      />

      <View style={styles.paginationContainer}>
        {data.map((_, i) => {
          const dotWidth = scrollX.interpolate({ 
            inputRange: dotInputRange, 
            outputRange: widthOutputRanges[i], 
            extrapolate: 'clamp' 
          });
          
          const opacity = scrollX.interpolate({ 
            inputRange: dotInputRange, 
            outputRange: opacityOutputRanges[i], 
            extrapolate: 'clamp' 
          });

          return (
            <Animated.View 
              key={i.toString()} 
              style={[
                styles.dot, 
                { width: dotWidth, opacity, backgroundColor: isDark ? '#ffffff' : '#111111' }
              ]} 
            />
          );
        })}
      </View>
    </View>
  );
}

/* ─────────────────── Styles ─────────────────── */
const styles = StyleSheet.create({
  container: { 
    paddingVertical: 16 
  },
  headerRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 24, 
    marginBottom: 16 
  },
  headerTitle: { 
    fontSize: 22, 
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  seeAll: { 
    fontSize: 15, 
    color: '#0a7ea4', 
    fontWeight: '700' 
  },
  
  cardWrapper: {
    width: ITEM_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: { 
    width: CARD_WIDTH, 
    height: CARD_HEIGHT, 
    borderRadius: 32, 
    overflow: 'hidden',
    // elevation: 8,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 6 },
    // shadowOpacity: 0.2,
    // shadowRadius: 10,
  },
  image: { 
    width: '100%', 
    height: '100%' 
  },

  gradientMask: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: '50%',
  },
  glassWrapper: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  glassPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'rgba(0,0,0,0.15)', 
  },
  textContainer: { 
    flex: 1, 
    marginRight: 12 
  },
  fileName: { 
    color: '#ffffff', 
    fontSize: 16, 
    fontWeight: '800',
    letterSpacing: 0.2, 
  },
  subText: { 
    color: 'rgba(255,255,255,0.7)', 
    fontSize: 13, 
    fontWeight: '600',
    marginTop: 2 
  },
  favButton: { 
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
  },
  
  paginationContainer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 20, 
    height: 10 
  },
  dot: { 
    height: 8, 
    borderRadius: 4, 
    marginHorizontal: 4 
  },
});