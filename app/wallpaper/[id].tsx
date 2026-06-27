/**
 * Wallpaper Detail — [id].tsx
 * Expo SDK 56 compatible
 *
 * • BlurView only on the glass card
 * • Tap image → collapse/reveal sheet
 * • "Set Wallpaper" button: square pill, black/white, auto dark/light mode
 * • Picker (Home / Lock / Both) expands above the button
 */

import { Ionicons } from '@expo/vector-icons';
import { BlurView, BlurTargetView } from 'expo-blur';
import * as FileSystem from 'expo-file-system/legacy';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { requestPermissionsAsync, createAssetAsync } from 'expo-media-library/legacy';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ManageWallpaper, { TYPE } from 'react-native-manage-wallpaper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/constants/theme';
import { FavoritesContext } from '@/context/FavoritesContext';
import { trackDownload } from '@/services/api';

// ─────────────────────────────────────────────────────────────────────────────
const { height: H } = Dimensions.get('window');
type Target = 'home' | 'lock' | 'both';

const SHEET_OPEN   = 0;
const SHEET_HIDDEN = 300;

// ─────────────────────────────────────────────────────────────────────────────
export default function WallpaperDetail() {
  const params                                 = useLocalSearchParams<any>();
  const router                                 = useRouter();
  const insets                                 = useSafeAreaInsets();
  const t                                      = useTheme();
  const { isFavorite, toggleFavorite } = useContext(FavoritesContext);

  const imageUrl = params.fullUrl || params.url || '';
  const isFav    = isFavorite(params.id);

  const tags: string[] = (() => {
    try { return JSON.parse(params.tagsJson as string || '[]'); }
    catch { return []; }
  })();

  // ── UI state ───────────────────────────────────────────────────────────────
  const [downloading, setDownloading] = useState(false);
  const [settingWall, setSettingWall] = useState(false);
  const [targetOpen,  setTargetOpen]  = useState(false);
  const [collapsed,   setCollapsed]   = useState(false);

  // ── Sheet ──────────────────────────────────────────────────────────────────
  const sheetY     = useRef(new Animated.Value(SHEET_OPEN)).current;
  const pickerH    = useRef(new Animated.Value(0)).current;
  const pickerOpac = useRef(new Animated.Value(0)).current;

  // BlurTargetView ref (card BlurView targets this)
  const targetRef = useRef<View | null>(null);

  // ── Sheet snap ─────────────────────────────────────────────────────────────
  const snapSheet = (hide: boolean) => {
    setCollapsed(hide);
    if (hide && targetOpen) closePicker();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(sheetY, {
      toValue: hide ? SHEET_HIDDEN : SHEET_OPEN,
      damping: 24, stiffness: 210, mass: 0.75,
      useNativeDriver: true,
    }).start();
  };

  // ── Picker ─────────────────────────────────────────────────────────────────
  const openPicker = () => {
    setTargetOpen(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.parallel([
      Animated.timing(pickerH,    { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.timing(pickerOpac, { toValue: 1, duration: 180, useNativeDriver: false }),
    ]).start();
  };

  const closePicker = () => {
    Animated.parallel([
      Animated.timing(pickerH,    { toValue: 0, duration: 200, easing: Easing.in(Easing.cubic), useNativeDriver: false }),
      Animated.timing(pickerOpac, { toValue: 0, duration: 130, useNativeDriver: false }),
    ]).start(() => setTargetOpen(false));
  };

  // ── Set Wallpaper ──────────────────────────────────────────────────────────
  const handleSetWallpaper = (target: Target) => {
    const map = { home: TYPE.HOME, lock: TYPE.LOCK, both: TYPE.BOTH };
    closePicker();
    setTimeout(() => {
      setSettingWall(true);
      ManageWallpaper.setWallpaper({ uri: imageUrl }, () => {
        setSettingWall(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        if (params.download_location) trackDownload(params.download_location);
      }, map[target]);
    }, 280);
  };

  // ── Download ───────────────────────────────────────────────────────────────
  const handleDownload = async () => {
    if (downloading) return;
    const { status } = await requestPermissionsAsync();
    if (status !== 'granted') return;
    setDownloading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const ext  = imageUrl.endsWith('.png') ? 'png' : 'jpg';
      const path = `${FileSystem.cacheDirectory}wz_${params.id}.${ext}`;
      const { uri } = await FileSystem.downloadAsync(imageUrl, path);
      
      await createAssetAsync(uri);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (params.download_location) trackDownload(params.download_location);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  // ── Theme ──────────────────────────────────────────────────────────────────
  const isDark  = t.isDark;
  const subBg   = isDark ? '#2C2C2E'                   : '#F2F2F7';
  const textPri = isDark ? '#FFFFFF'                   : '#000000';
  const textSec = isDark ? 'rgba(255,255,255,0.40)'    : 'rgba(0,0,0,0.36)';
  const divider = isDark ? 'rgba(255,255,255,0.07)'    : 'rgba(0,0,0,0.06)';
  const btnBg   = isDark ? '#FFFFFF'                   : '#000000';
  const btnText = isDark ? '#000000'                   : '#FFFFFF';

  const pickerMaxH         = 3 * 52 + 8;
  const pickerHeightInterp = pickerH.interpolate({ inputRange: [0, 1], outputRange: [0, pickerMaxH] });

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Wallpaper — BlurTargetView lets the card BlurView blur it */}
      <BlurTargetView ref={targetRef} style={StyleSheet.absoluteFill}>
        <Pressable style={StyleSheet.absoluteFill} onPress={() => snapSheet(!collapsed)}>
          <Image
            source={{ uri: imageUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={350}
          />
        </Pressable>
      </BlurTargetView>

      {/* Bottom vignette */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.70)']}
        style={styles.vignette}
        pointerEvents="none"
      />

      {/* Top bar */}
      <SafeAreaView style={styles.topBar} edges={['top']}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={14} style={styles.topBtn}>
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Location badge */}
      {params.location && (
        <Animated.View style={[styles.locationWrap, { transform: [{ translateY: sheetY }] }]}>
          <Ionicons name="location" size={15} color="#fff" />
          <Text style={styles.locationText}>{params.location}</Text>
        </Animated.View>
      )}

      {/* ── Bottom sheet ── */}
      <Animated.View
        style={[
          styles.sheetWrap,
          { bottom: insets.bottom + 16, transform: [{ translateY: sheetY }] },
        ]}
      >
        {/* Drag handle */}
        <TouchableOpacity
          style={styles.handleWrap}
          onPress={() => snapSheet(!collapsed)}
          hitSlop={{ top: 12, bottom: 12, left: 80, right: 80 }}
          activeOpacity={1}
        >
          <View style={styles.handle} />
        </TouchableOpacity>

        {/* Glass card */}
        <BlurView
          intensity={60}
          tint={isDark ? 'dark' : 'light'}
          blurMethod="dimezisBlurView"
          blurTarget={targetRef}
          style={[
            styles.card,
            { backgroundColor: isDark ? 'rgba(28,28,30,0.68)' : 'rgba(255,255,255,0.68)' },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Image source={{ uri: params.authorAvatar }} style={styles.avatar} />
            <Text style={[styles.title, { color: textPri, flex: 1 }]} numberOfLines={1}>
              {params.author || 'Photographer'}
            </Text>
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={handleDownload} hitSlop={10}>
                {downloading
                  ? <ActivityIndicator size="small" color={textPri} />
                  : <Ionicons name="download-outline" size={24} color={textPri} />}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => toggleFavorite({ ...params })} hitSlop={10}>
                <Ionicons
                  name={isFav ? 'heart' : 'heart-outline'}
                  size={24}
                  color={isFav ? '#FF375F' : textPri}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: divider }]} />

          {/* EXIF grid */}
          <View style={styles.exifGrid}>
            {[
              { label: 'Camera',        value: params.exif?.model         || 'Unknown' },
              { label: 'Aperture',      value: params.exif?.aperture      ? `f/${params.exif.aperture}`      : 'Unknown' },
              { label: 'Focal Length',  value: params.exif?.focal_length  ? `${params.exif.focal_length}mm` : 'Unknown' },
              { label: 'Shutter Speed', value: params.exif?.exposure_time ? `${params.exif.exposure_time}s` : 'Unknown' },
              { label: 'ISO',           value: params.exif?.iso           || 'Unknown' },
              { label: 'Dimensions',    value: params.resolution          || 'Unknown' },
            ].map(({ label, value }) => (
              <View key={label} style={styles.gridItem}>
                <Text style={[styles.gridLabel, { color: textSec }]}>{label}</Text>
                <Text style={[styles.gridValue, { color: textPri }]}>{value}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.divider, { backgroundColor: divider }]} />

          {/* Stats */}
          <View style={styles.statsRow}>
            {[
              { label: 'Views',     value: Number(params.views     || 0) },
              { label: 'Downloads', value: Number(params.downloads || 0) },
              { label: 'Likes',     value: Number(params.likes     || 0) },
            ].map(({ label, value }) => (
              <View key={label} style={styles.statItem}>
                <Text style={[styles.statLabel, { color: textPri }]}>{label}</Text>
                <Text style={[styles.statValue, { color: textSec }]}>{value.toLocaleString()}</Text>
              </View>
            ))}
          </View>

          {/* Tags */}
          {tags.length > 0 && (
            <>
              <View style={[styles.divider, { backgroundColor: divider }]} />
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.tagsRow}
              >
                {tags.map((tag, idx) => (
                  <View key={idx} style={[styles.tagPill, { backgroundColor: subBg }]}>
                    <Text style={[styles.tagText, { color: textPri }]}># {tag}</Text>
                  </View>
                ))}
              </ScrollView>
            </>
          )}

          <View style={[styles.divider, { backgroundColor: divider, marginTop: 8 }]} />

          {/* Picker rows */}
          <Animated.View style={{ height: pickerHeightInterp, opacity: pickerOpac, overflow: 'hidden' }}>
            {([
              { id: 'home' as Target, icon: 'phone-portrait-outline', label: 'Home Screen'  },
              { id: 'lock' as Target, icon: 'lock-closed-outline',    label: 'Lock Screen'  },
              { id: 'both' as Target, icon: 'layers-outline',         label: 'Both Screens' },
            ]).map((opt, i, arr) => (
              <TouchableOpacity
                key={opt.id}
                style={[
                  styles.pickerRow,
                  i < arr.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: divider,
                  },
                ]}
                onPress={() => handleSetWallpaper(opt.id)}
                activeOpacity={0.55}
              >
                <View style={[styles.pickerIcon, { backgroundColor: subBg }]}>
                  <Ionicons name={opt.icon as any} size={16} color={textPri} />
                </View>
                <Text style={[styles.pickerLabel, { color: textPri }]}>{opt.label}</Text>
                <Ionicons name="chevron-forward" size={14} color={textSec} />
              </TouchableOpacity>
            ))}
          </Animated.View>

          {/* Set Wallpaper button — black/white, auto dark/light */}
          <TouchableOpacity
            style={[styles.setBtn, { backgroundColor: btnBg }]}
            onPress={targetOpen ? closePicker : openPicker}
            activeOpacity={0.78}
          >
            {settingWall ? (
              <ActivityIndicator size="small" color={btnText} />
            ) : (
              <>
                <Ionicons
                  name={targetOpen ? 'close' : 'image-outline'}
                  size={18}
                  color={btnText}
                />
                <Text style={[styles.setBtnText, { color: btnText }]}>
                  {targetOpen ? 'Cancel' : 'Set Wallpaper'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </BlurView>
      </Animated.View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },

  vignette: { position: 'absolute', bottom: 0, left: 0, right: 0, height: H * 0.45 },

  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    zIndex: 30, paddingHorizontal: 18, paddingTop: 2,
  },
  topBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.32)',
    alignItems: 'center', justifyContent: 'center',
  },

  locationWrap: {
    position: 'absolute', bottom: H * 0.52, left: 18,
    flexDirection: 'row', alignItems: 'center', gap: 6, zIndex: 10,
  },
  locationText: {
    color: '#fff', fontSize: 15, fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3,
  },

  sheetWrap:  { position: 'absolute', left: 12, right: 12 },
  handleWrap: { alignItems: 'center', paddingBottom: 7 },
  handle:     { width: 32, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.36)' },

  card: {
    borderRadius: 24, paddingHorizontal: 16, paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 14 : 18, overflow: 'hidden',
  },

  header:        { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  avatar:        { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)' },
  title:         { fontSize: 16, fontWeight: '700', letterSpacing: -0.3 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },

  exifGrid:  { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  gridItem:  { width: '50%', marginBottom: 14 },
  gridLabel: { fontSize: 12, fontWeight: '500', marginBottom: 3 },
  gridValue: { fontSize: 13, fontWeight: '400' },

  statsRow:  { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, marginBottom: 14 },
  statItem:  { alignItems: 'center' },
  statLabel: { fontSize: 12, fontWeight: '500', marginBottom: 3 },
  statValue: { fontSize: 15, fontWeight: '600' },

  divider: { height: StyleSheet.hairlineWidth, marginBottom: 10 },

  tagsRow: { flexDirection: 'row', gap: 8, paddingTop: 2, paddingBottom: 8 },
  tagPill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 30 },
  tagText: { fontSize: 12, fontWeight: '600', textTransform: 'lowercase' },

  pickerRow:   { flexDirection: 'row', alignItems: 'center', height: 52, gap: 12 },
  pickerIcon:  { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  pickerLabel: { flex: 1, fontSize: 14, fontWeight: '500' },

  setBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, height: 50, borderRadius: 12, marginTop: 10,
  },
  setBtnText: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
});