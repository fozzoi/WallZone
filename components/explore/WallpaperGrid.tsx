/**
 * WallpaperGrid – masonry 2-column grid used everywhere.
 */

import React, { useContext } from 'react';
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
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { useRouter } from 'expo-router';
import { FavoritesContext } from '@/context/FavoritesContext';
import { useTheme, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '@/constants/theme';
import type { Wallpaper } from '@/services/api';

interface Props {
  wallpapers: Wallpaper[];
  header?: React.ReactNode;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  emptyMessage?: string;
}

export default function WallpaperGrid({
  wallpapers,
  header,
  onLoadMore,
  isLoadingMore = false,
  emptyMessage = 'No wallpapers found',
}: Props) {
  const router = useRouter();
  const t = useTheme();
  const { isFavorite, toggleFavorite, favorites } = useContext(FavoritesContext);

  const handlePress = (item: Wallpaper) => {
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
  };

  const renderItem = ({ item }: { item: Wallpaper }) => {
    const isFav = isFavorite(item.id);
    const cardHeight = Math.max(200, Math.min(item.height ?? 260, 360));

    return (
      <TouchableOpacity
        style={[styles.card, { height: cardHeight, backgroundColor: t.card }]}
        onPress={() => handlePress(item)}
        activeOpacity={0.88}
      >
        <Image
          source={{ uri: item.url }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={250}
          recyclingKey={item.id}
        />

        {/* Gradient fade for info legibility */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)']}
          style={styles.gradient}
          pointerEvents="none"
        />

        {/* Author + Fav pill */}
        <View style={styles.infoWrapper}>
          <BlurView
            intensity={Platform.OS === 'android' ? 55 : 38}
            tint="dark"
            style={styles.infoPill}
          >
            <Text style={styles.authorText} numberOfLines={1}>
              {item.author || 'WallZone'}
            </Text>
            <Pressable
              onPress={() => toggleFavorite(item)}
              hitSlop={14}
              style={styles.favBtn}
            >
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={18}
                color={isFav ? '#FF3B5C' : '#fff'}
              />
            </Pressable>
          </BlurView>
        </View>
      </TouchableOpacity>
    );
  };

  const ListEmpty = () => (
    <View style={styles.empty}>
      <Ionicons name="images-outline" size={48} color={t.textMuted} />
      <Text style={[styles.emptyText, { color: t.textSub }]}>{emptyMessage}</Text>
    </View>
  );

  const Footer = () =>
    isLoadingMore ? (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={t.textSub} />
      </View>
    ) : null;

  return (
    <FlashList
      data={wallpapers}
      extraData={favorites}
      estimatedItemSize={260}
      numColumns={2}
      // @ts-ignore – FlashList supports masonry via this prop
      masonry
      renderItem={renderItem}
      keyExtractor={(item, index) => `${item.id}-${index}`}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: SPACING.sm, paddingBottom: 130 }}
      ListHeaderComponent={header ?? undefined}
      ListEmptyComponent={wallpapers.length === 0 && !isLoadingMore ? <ListEmpty /> : null}
      ListFooterComponent={<Footer />}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.4}
    />
  );
}

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
    backgroundColor: 'rgba(0,0,0,0.08)',
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
  },
});
