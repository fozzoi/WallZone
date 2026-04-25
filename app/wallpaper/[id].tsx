/**
 * Wallpaper Detail screen – [id].tsx
 */
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, Pressable,
  StyleSheet, StatusBar, ActivityIndicator,
  Animated, Easing, Dimensions, LayoutAnimation,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import ImageColors from 'react-native-image-colors';
import ManageWallpaper, { TYPE } from 'react-native-manage-wallpaper';

import { FavoritesContext } from '@/context/FavoritesContext';
import { useTheme, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT, SHADOW } from '@/constants/theme';

const { width: W, height: H } = Dimensions.get('window');

const PANEL_H   = 230;
const SLIDE_VAL = -(PANEL_H + 20);

type Target = 'home' | 'lock' | 'both';

export default function WallpaperDetail() {
  const params = useLocalSearchParams<any>();
  const router = useRouter();
  const t = useTheme();
  const { isFavorite, toggleFavorite } = useContext(FavoritesContext);

  const imageUrl   = params.fullUrl || params.url || '';
  const isFav      = isFavorite(params.id);
  const [accent, setAccent]         = useState(t.accent);
  const [downloading, setDownloading] = useState(false);
  const [settingWall, setSettingWall] = useState(false);
  const [selecting, setSelecting]   = useState(false);

  const slide = useRef(new Animated.Value(0)).current;

  // ── Extract dominant color from image ──────────────────────────────────────
  useEffect(() => {
    if (!imageUrl) return;
    ImageColors.getColors(imageUrl, { fallback: t.accent, cache: true })
      .then(colors => {
        let c = t.accent;
        if (colors.platform === 'android') c = colors.dominant || colors.vibrant || c;
        if (colors.platform === 'ios')     c = colors.primary  || colors.detail  || c;
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setAccent(c);
      })
      .catch(() => {});
  }, [imageUrl]);

  // ── Toggle wallpaper-target panel ─────────────────────────────────────────
  const togglePanel = (show: boolean) => {
    setSelecting(show);
    if (show) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.timing(slide, {
      toValue: show ? SLIDE_VAL : 0,
      duration: 440,
      easing: Easing.out(Easing.back(1.08)),
      useNativeDriver: true,
    }).start();
  };

  // ── Set wallpaper ──────────────────────────────────────────────────────────
  const handleSetWallpaper = (target: Target) => {
    const map = { home: TYPE.HOME, lock: TYPE.LOCK, both: TYPE.BOTH };
    togglePanel(false);
    setTimeout(() => {
      setSettingWall(true);
      ManageWallpaper.setWallpaper(
        { uri: imageUrl },
        () => {
          setSettingWall(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
        map[target]
      );
    }, 500);
  };

  // ── Download ───────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (downloading) return;
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') return;

    setDownloading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const ext  = imageUrl.endsWith('.png') ? 'png' : 'jpg';
      const path = `${FileSystem.cacheDirectory}wallzone_${params.id}.${ext}`;
      const { uri } = await FileSystem.downloadAsync(imageUrl, path);
      await MediaLibrary.saveToLibraryAsync(uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  // ── Format title ──────────────────────────────────────────────────────────
  const formatTitle = (raw: any) => {
    if (!raw || typeof raw !== 'string') return 'Wallpaper';
    return raw.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
  };

  const colors: string[] = (() => {
    try { return JSON.parse(params.colorsJson || '[]'); } catch { return []; }
  })();

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Full-bleed background image */}
      <Pressable style={StyleSheet.absoluteFill} onPress={() => selecting && togglePanel(false)}>
        <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
      </Pressable>

      {/* Back button */}
      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: 'rgba(0,0,0,0.42)' }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* ── Info card + selection panel (slide together) ── */}
      <Animated.View style={[styles.cardStack, { transform: [{ translateY: slide }] }]}>

        {/* Selection panel (sits below the card, slides up with it) */}
        <View style={[styles.panel, { backgroundColor: t.card }]}>
          <Text style={[styles.panelTitle, { color: t.text }]}>Apply to Screen</Text>
          <View style={styles.optionRow}>
            {([
              { id: 'home', icon: 'home-outline',         label: 'Home' },
              { id: 'lock', icon: 'lock-closed-outline',  label: 'Lock' },
              { id: 'both', icon: 'layers-outline',       label: 'Both' },
            ] as const).map(opt => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.option, { backgroundColor: t.isDark ? 'rgba(255,255,255,0.07)' : '#F2F2F7' }]}
                onPress={() => handleSetWallpaper(opt.id)}
                activeOpacity={0.8}
              >
                <Ionicons name={opt.icon} size={22} color={accent} />
                <Text style={[styles.optionLabel, { color: t.text }]}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Main info card */}
        <View style={[styles.card, { backgroundColor: t.card }]}>
          <View style={styles.cardInner}>
            {/* Title + fav */}
            <View style={styles.titleRow}>
              <View style={styles.titleBlock}>
                <Text style={[styles.title, { color: t.text }]} numberOfLines={2}>
                  {formatTitle(params.title)}
                </Text>
                <Text style={[styles.author, { color: t.textSub }]}>by {params.author || 'WallZone'}</Text>
              </View>
              <TouchableOpacity onPress={() => toggleFavorite({ ...params })} style={styles.favBtn} hitSlop={10}>
                <Ionicons
                  name={isFav ? 'heart' : 'heart-outline'}
                  size={26}
                  color={isFav ? '#FF3B5C' : t.text}
                />
              </TouchableOpacity>
            </View>

            {/* Meta grid */}
            <View style={styles.metaGrid}>
              {[
                { icon: 'expand-outline',        label: 'Resolution', value: params.resolution || 'HD'       },
                { icon: 'eye-outline',            label: 'Views',      value: Number(params.views || 0).toLocaleString() },
                { icon: 'heart-outline',          label: 'Favorites',  value: Number(params.favoritesCount || 0).toLocaleString() },
                { icon: 'color-palette-outline',  label: 'Dominant',   value: accent.toUpperCase()            },
              ].map(m => (
                <View key={m.label} style={[styles.metaBox, { backgroundColor: t.isDark ? 'rgba(255,255,255,0.05)' : '#F8F8F8' }]}>
                  <Ionicons name={m.icon as any} size={15} color={accent} style={styles.metaIcon} />
                  <View>
                    <Text style={[styles.metaLabel, { color: t.textSub }]}>{m.label}</Text>
                    <Text style={[styles.metaValue, { color: t.text }]} numberOfLines={1}>{m.value}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Color swatches */}
            {colors.length > 0 && (
              <View style={styles.swatches}>
                {colors.slice(0, 6).map((c, i) => (
                  <View key={i} style={[styles.swatch, { backgroundColor: c }]} />
                ))}
              </View>
            )}

            {/* Action buttons */}
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: t.isDark ? 'rgba(255,255,255,0.08)' : '#F2F2F7' }]}
                onPress={handleDownload}
                activeOpacity={0.8}
              >
                {downloading
                  ? <ActivityIndicator size="small" color={t.text} />
                  : <Ionicons name="cloud-download-outline" size={22} color={t.text} />
                }
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.applyBtn, { backgroundColor: accent }]}
                onPress={() => togglePanel(!selecting)}
                activeOpacity={0.88}
              >
                {settingWall
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.applyText}>{selecting ? 'Cancel' : 'Set Wallpaper'}</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },

  headerSafe: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 20,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
  },
  backBtn: {
    width: 40, height: 40,
    borderRadius: RADIUS.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardStack: {
    position: 'absolute',
    bottom: 0,
    left: 0, right: 0,
  },

  // Selection panel (below card in stack)
  panel: {
    marginHorizontal: SPACING.sm,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xs,
    ...SHADOW.md,
  },
  panelTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.extrabold,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  optionRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  option: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    gap: SPACING.xs,
  },
  optionLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },

  // Info card
  card: {
    marginHorizontal: SPACING.sm,
    marginBottom: Platform.OS === 'ios' ? SPACING.xl : SPACING.md,
    borderRadius: RADIUS.xl,
    ...SHADOW.lg,
  },
  cardInner: { padding: SPACING.lg },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md + 4,
  },
  titleBlock: { flex: 1, marginRight: SPACING.sm },
  title: {
    fontSize: FONT_SIZE.xxl - 2,
    fontWeight: FONT_WEIGHT.extrabold,
    letterSpacing: -0.5,
  },
  author: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.medium,
    marginTop: 3,
  },
  favBtn: { paddingTop: 2 },

  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  metaBox: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  metaIcon: {},
  metaLabel: {
    fontSize: FONT_SIZE.label,
    fontWeight: FONT_WEIGHT.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  metaValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    marginTop: 1,
  },

  swatches: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  swatch: {
    width: 24, height: 24,
    borderRadius: RADIUS.pill,
  },

  btnRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  iconBtn: {
    width: 56, height: 56,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtn: {
    flex: 1,
    height: 56,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyText: {
    color: '#fff',
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.bold,
  },
});
