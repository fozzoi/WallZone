/**
 * WallpaperCarousel – horizontal hero carousel used on the home screen.
 */

import React, { useContext, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { FavoritesContext } from '@/context/FavoritesContext';
import { useTheme, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '@/constants/theme';
import type { Wallpaper } from '@/services/api';

const { width: W } = Dimensions.get('window');
const CARD_W    = W * 0.70;
const CARD_H    = CARD_W * 1.28;
const ITEM_GAP  = 14;
const ITEM_SIZE = CARD_W + ITEM_GAP;
const LOOP      = 8; // loop multiplier – low enough to not waste memory

interface Props {
  title?: string;
  data: Wallpaper[];
  onSeeAll?: () => void;
}

export default function WallpaperCarousel({ title = 'Trending', data, onSeeAll }: Props) {
  const router = useRouter();
  const t = useTheme();
  const { isFavorite, toggleFavorite, favorites } = useContext(FavoritesContext);
  const scrollX = useRef(new Animated.Value(0)).current;

  const loopedData = useMemo(() => {
    if (!data?.length) return [];
    return Array(LOOP).fill(data).flat() as Wallpaper[];
  }, [data]);

  const middleOffset = data?.length
    ? Math.floor(LOOP / 2) * data.length * ITEM_SIZE
    : 0;

  // Pre-calculate dot animation ranges
  const dotRanges = useMemo(() => {
    if (!data?.length) return { input: [], widths: [], opacities: [] };
    const input = loopedData.map((_, i) => i * ITEM_SIZE);
    const widths = data.map((_, orig) =>
      loopedData.map((_, i) => (i % data.length === orig ? 22 : 7))
    );
    const opacities = data.map((_, orig) =>
      loopedData.map((_, i) => (i % data.length === orig ? 1 : 0.22))
    );
    return { input, widths, opacities };
  }, [data, loopedData]);

  if (!data?.length) return null;

  const renderItem = ({ item, index }: { item: Wallpaper; index: number }) => {
    const isFav = isFavorite(item.id);
    const range = [(index - 1) * ITEM_SIZE, index * ITEM_SIZE, (index + 1) * ITEM_SIZE];

    const scale = scrollX.interpolate({ inputRange: range, outputRange: [0.90, 1, 0.90], extrapolate: 'clamp' });
    const opacity = scrollX.interpolate({ inputRange: range, outputRange: [0.55, 1, 0.55], extrapolate: 'clamp' });

    return (
      <Animated.View style={[styles.cardWrapper, { transform: [{ scale }], opacity }]}>
        <TouchableOpacity
          style={[styles.card, { backgroundColor: t.card }]}
          activeOpacity={0.88}
          onPress={() =>
            router.push({ pathname: '/wallpaper/[id]', params: { id: item.id, ...item } })
          }
        >
          <Image
            source={{ uri: item.url }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={200}
            recyclingKey={item.id}
          />

          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.75)']}
            style={styles.gradient}
            pointerEvents="none"
          />

          <View style={styles.glassWrapper}>
            <BlurView
              intensity={Platform.OS === 'android' ? 60 : 42}
              tint="dark"
              style={styles.glass}
            >
              <View style={styles.glassText}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title || 'Wallpaper'}
                </Text>
                <Text style={styles.cardSub} numberOfLines={1}>
                  by {item.author || 'WallZone'}
                </Text>
              </View>
              <Pressable
                onPress={() => toggleFavorite(item)}
                hitSlop={14}
                style={styles.favBtn}
              >
                <Ionicons
                  name={isFav ? 'heart' : 'heart-outline'}
                  size={22}
                  color={isFav ? '#FF3B5C' : '#fff'}
                />
              </Pressable>
            </BlurView>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      {/* Header row */}
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: t.text }]}>{title}</Text>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll} activeOpacity={0.6} hitSlop={10}>
            <Text style={[styles.seeAll, { color: t.accent }]}>See all</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Carousel */}
      <Animated.FlatList
        data={loopedData}
        extraData={favorites}
        renderItem={renderItem}
        keyExtractor={(item, i) => `${item.id}-${i}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: (W - ITEM_SIZE) / 2 }}
        contentOffset={{ x: middleOffset, y: 0 }}
        snapToInterval={ITEM_SIZE}
        snapToAlignment="start"
        decelerationRate="fast"
        bounces={false}
        initialNumToRender={3}
        windowSize={3}
        maxToRenderPerBatch={3}
        removeClippedSubviews
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      />

      {/* Dot indicators */}
      <View style={styles.dots}>
        {data.map((_, i) => {
          const width = scrollX.interpolate({
            inputRange: dotRanges.input,
            outputRange: dotRanges.widths[i],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange: dotRanges.input,
            outputRange: dotRanges.opacities[i],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={i}
              style={[styles.dot, { width, opacity, backgroundColor: t.text }]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: SPACING.md },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.extrabold,
    letterSpacing: -0.4,
  },
  seeAll: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
  },

  cardWrapper: {
    width: ITEM_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
  },
  glassWrapper: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  glass: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md - 2,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  glassText: { flex: 1, marginRight: SPACING.sm },
  cardTitle: {
    color: '#fff',
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.extrabold,
    letterSpacing: 0.1,
  },
  cardSub: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.semibold,
    marginTop: 2,
  },
  favBtn: {
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: RADIUS.pill,
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.md + 4,
    height: 10,
  },
  dot: {
    height: 7,
    borderRadius: RADIUS.pill,
    marginHorizontal: 3,
  },
});
