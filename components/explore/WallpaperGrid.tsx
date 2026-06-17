// components/explore/WallpaperGrid.tsx

import React, { useContext, forwardRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { FavoritesContext } from '@/context/FavoritesContext';
import { useTheme, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '@/constants/theme';
import type { Wallpaper } from '@/services/api';

// ─── OPTIMIZATION 2: Memoized Card Component ─────────────────────────────────
// React.memo ensures this card ONLY re-renders if its specific props change.
// This stops the entire grid from flashing when you like a single wallpaper.
const WallpaperCard = React.memo(({ 
  item, 
  isFav, 
  onPress, 
  onToggleFav, 
  cardColor 
}: { 
  item: Wallpaper; 
  isFav: boolean; 
  onPress: (item: Wallpaper) => void; 
  onToggleFav: (item: Wallpaper) => void;
  cardColor: string;
}) => {
  const cardHeight = Math.max(200, Math.min(item.height ?? 260, 360));

  return (
    <TouchableOpacity
      style={[styles.card, { height: cardHeight, backgroundColor: cardColor }]}
      onPress={() => onPress(item)}
      activeOpacity={0.88}
    >
      <Image
        source={{ uri: item.previewUrl || item.url }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={250}
        recyclingKey={item.id}
        cachePolicy="memory-disk"
      />

      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.65)']} // Slightly darkened to compensate for no blur
        style={styles.gradient}
        pointerEvents="none"
      />

      <View style={styles.infoWrapper}>
        {/* OPTIMIZATION 1: Replaced BlurView with a simple rgba View. 
            BlurView is a massive performance killer in scrolling lists. */}
        <View style={styles.infoPill}>
          <Text style={styles.authorText} numberOfLines={1}>
            {item.author || 'WallZone'}
          </Text>
          <Pressable
            onPress={() => onToggleFav(item)}
            hitSlop={14}
            style={styles.favBtn}
          >
            <Ionicons
              name={isFav ? 'heart' : 'heart-outline'}
              size={18}
              color={isFav ? '#FF3B5C' : '#fff'}
            />
          </Pressable>
        </View>
      </View>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Only re-render if the ID or the Favorite status changes
  return prevProps.item.id === nextProps.item.id && prevProps.isFav === nextProps.isFav;
});

// ─── Main Grid Component ──────────────────────────────────────────────────────

interface Props {
  wallpapers: Wallpaper[];
  header?: React.ReactNode;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  emptyMessage?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

const WallpaperGrid = forwardRef<FlashList<any>, Props>(({
  wallpapers,
  header,
  onLoadMore,
  isLoadingMore = false,
  emptyMessage = 'No wallpapers found',
  onRefresh,
  isRefreshing = false,
}, ref) => {
  const router = useRouter();
  const t = useTheme();
  const { toggleFavorite, favorites } = useContext(FavoritesContext);

  // OPTIMIZATION 3: Convert favorites array to a Set.
  // This changes the lookup time from O(N) to O(1), saving thousands of operations during fast scrolls.
  const favoriteIds = useMemo(() => {
    return new Set(favorites?.map((fav: Wallpaper) => fav.id) || []);
  }, [favorites]);

  const handlePress = useCallback((item: Wallpaper) => {
    router.push({
      pathname: '/wallpaper/[id]',
      params: {
        id: String(item.id),
        url: item.url,
        fullUrl: item.fullUrl || item.url,
        title: item.title || 'Wallpaper',
        author: item.author || 'Unknown',
        height: String(item.height ?? 280),
        resolution: item.resolution || '',
        views: String(item.views ?? 0),
        favoritesCount: String(item.favorites ?? 0),
        colorsJson: JSON.stringify(item.colors ?? []),
        fileSize: String(item.fileSize ?? 0),
      },
    });
  }, [router]);

  const renderItem = useCallback(({ item }: { item: Wallpaper }) => {
    return (
      <WallpaperCard
        item={item}
        isFav={favoriteIds.has(item.id)}
        onPress={handlePress}
        onToggleFav={toggleFavorite}
        cardColor={t.card}
      />
    );
  }, [favoriteIds, handlePress, toggleFavorite, t.card]);

  const ListEmpty = () => (
    <View style={styles.empty}>
      <Ionicons name="images-outline" size={48} color={t.textMuted} />
      <Text style={[styles.emptyText, { color: t.textSub }]}>{emptyMessage}</Text>
    </View>
  );

  return (
    <FlashList
      ref={ref}
      data={wallpapers}
      // Pass the Set here so FlashList knows when to trigger re-renders
      extraData={favoriteIds} 
      estimatedItemSize={260}
      numColumns={2}
      // @ts-ignore
      masonry
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: SPACING.sm, paddingBottom: 130 }}
      ListHeaderComponent={header ?? undefined}
      ListEmptyComponent={wallpapers.length === 0 && !isLoadingMore ? <ListEmpty /> : null}
      ListFooterComponent={
        <View style={[styles.footer, { opacity: isLoadingMore ? 1 : 0 }]}>
          <ActivityIndicator size="small" color={t.textSub} />
        </View>
      }
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.6}
      refreshing={isRefreshing}
      onRefresh={onRefresh}
    />
  );
});

WallpaperGrid.displayName = 'WallpaperGrid';
export default WallpaperGrid;

const styles = StyleSheet.create({
  card: {
    marginHorizontal: SPACING.xs + 2,
    marginBottom: SPACING.sm + 4,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
  },
  infoWrapper: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    right: SPACING.sm,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  infoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.sm + 4,
    paddingVertical: SPACING.sm + 2,
    // Replaced BlurView intensity/tint with a solid semi-transparent background
    backgroundColor: 'rgba(20, 20, 20, 0.45)', 
  },
  authorText: {
    flex: 1,
    color: '#fff',
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.bold,
    marginRight: SPACING.xs,
    letterSpacing: 0.2,
  },
  favBtn: {
    padding: 2,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: SPACING.md,
  },
  emptyText: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.medium,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
});