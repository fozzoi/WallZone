/**
 * Wallpaper Detail — [id].tsx
 */
import React, { useContext, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, Pressable,
  StyleSheet, StatusBar, ActivityIndicator,
  Animated, Easing, Dimensions, Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import ManageWallpaper, { TYPE } from 'react-native-manage-wallpaper';

import { FavoritesContext } from '@/context/FavoritesContext';
import { useTheme } from '@/constants/theme';

const { height: H } = Dimensions.get('window');
type Target = 'home' | 'lock' | 'both';

const SHEET_OPEN   = 0;
const SHEET_HIDDEN = 206;

export default function WallpaperDetail() {
  const params = useLocalSearchParams<any>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const t      = useTheme();
  const { isFavorite, toggleFavorite } = useContext(FavoritesContext);

  const imageUrl = params.fullUrl || params.url || '';
  const isFav    = isFavorite(params.id);

  const [downloading, setDownloading] = useState(false);
  const [settingWall, setSettingWall] = useState(false);
  const [targetOpen,  setTargetOpen]  = useState(false);
  const [collapsed,   setCollapsed]   = useState(false);

  const sheetY     = useRef(new Animated.Value(SHEET_OPEN)).current;
  const pickerH    = useRef(new Animated.Value(0)).current;
  const pickerOpac = useRef(new Animated.Value(0)).current;

  // ── Sheet ──────────────────────────────────────────────────────────────────
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
      Animated.timing(pickerH, {
        toValue: 1, duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(pickerOpac, {
        toValue: 1, duration: 200,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
    ]).start();
  };

  const closePicker = () => {
    Animated.parallel([
      Animated.timing(pickerH, {
        toValue: 0, duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(pickerOpac, {
        toValue: 0, duration: 150,
        useNativeDriver: false,
      }),
    ]).start(() => setTargetOpen(false));
  };

  // ── Set wallpaper ──────────────────────────────────────────────────────────
  const handleSetWallpaper = (target: Target) => {
    const map = { home: TYPE.HOME, lock: TYPE.LOCK, both: TYPE.BOTH };
    closePicker();
    setTimeout(() => {
      setSettingWall(true);
      ManageWallpaper.setWallpaper({ uri: imageUrl }, () => {
        setSettingWall(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, map[target]);
    }, 280);
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
      const path = `${FileSystem.cacheDirectory}wz_${params.id}.${ext}`;
      const { uri } = await FileSystem.downloadAsync(imageUrl, path);
      await MediaLibrary.saveToLibraryAsync(uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  const formatTitle = (raw: any) => {
    if (!raw || typeof raw !== 'string') return 'Wallpaper';
    return raw.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
  };

  const isDark   = t.isDark;
  const sheetBg  = isDark ? '#1C1C1E' : '#FFFFFF';
  const subBg    = isDark ? '#2C2C2E' : '#F2F2F7';
  const sub2Bg   = isDark ? '#3A3A3C' : '#E5E5EA';
  const textPri  = isDark ? '#FFFFFF' : '#000000';
  const textSec  = isDark ? 'rgba(255,255,255,0.40)' : 'rgba(0,0,0,0.36)';
  const divider  = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';

  // Picker height interpolation — 3 rows × 54px + 12px padding
  const pickerMaxH = 3 * 54 + 12;
  const pickerHeightInterp = pickerH.interpolate({
    inputRange:  [0, 1],
    outputRange: [0, pickerMaxH],
  });

  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Wallpaper */}
      <Pressable style={StyleSheet.absoluteFill} onPress={() => snapSheet(!collapsed)}>
        <Image
          source={{ uri: imageUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={350}
        />
      </Pressable>

      {/* Vignette */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.52)']}
        style={styles.vignette}
        pointerEvents="none"
      />

      {/* ── Top bar ── */}
      <SafeAreaView style={styles.topBar} edges={['top']}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={14}
          style={styles.topBtn}
          activeOpacity={0.75}
        >
          <Ionicons name="chevron-back" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => { toggleFavorite({ ...params }); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          hitSlop={14}
          style={styles.topBtn}
          activeOpacity={0.75}
        >
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={19}
            color={isFav ? '#FF375F' : '#fff'}
          />
        </TouchableOpacity>
      </SafeAreaView>

      {/* ── Sheet ── */}
      <Animated.View
        style={[
          styles.sheetWrap,
          { bottom: insets.bottom + 16, transform: [{ translateY: sheetY }] },
        ]}
      >
        {/* Handle */}
        <TouchableOpacity
          style={styles.handleWrap}
          onPress={() => snapSheet(!collapsed)}
          hitSlop={{ top: 12, bottom: 12, left: 80, right: 80 }}
          activeOpacity={1}
        >
          <View style={styles.handle} />
        </TouchableOpacity>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: sheetBg }]}>

          {/* ── Header ── */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: textPri }]} numberOfLines={1}>
                {formatTitle(params.title)}
              </Text>
              <Text style={[styles.author, { color: textSec }]}>
                by {params.author || 'Wallheven'}
              </Text>
            </View>

            {/* Stat chips */}
            <View style={styles.chips}>
              <View style={[styles.chip, { backgroundColor: subBg }]}>
                <Ionicons name="eye-outline" size={12} color={textSec} />
                <Text style={[styles.chipText, { color: textPri }]}>
                  {Number(params.views || 0).toLocaleString()}
                </Text>
              </View>
              <View style={[styles.chip, { backgroundColor: subBg }]}>
                <Ionicons name="scan-outline" size={12} color={textSec} />
                <Text style={[styles.chipText, { color: textPri }]}>
                  {params.resolution || 'HD'}
                </Text>
              </View>
            </View>
          </View>

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: divider }]} />

          {/* ── Picker (animated height) ── */}
          <Animated.View
            style={{
              height: pickerHeightInterp,
              opacity: pickerOpac,
              overflow: 'hidden',
            }}
          >
            <View style={styles.picker}>
              {([
                { id: 'home' as Target, icon: 'phone-portrait-outline', label: 'Home Screen' },
                { id: 'lock' as Target, icon: 'lock-closed-outline',    label: 'Lock Screen' },
                { id: 'both' as Target, icon: 'layers-outline',         label: 'Both Screens' },
              ]).map((opt, i, arr) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.pickerRow,
                    i < arr.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: divider },
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
            </View>

            {/* Picker bottom divider */}
            <View style={[styles.divider, { backgroundColor: divider, marginTop: 0 }]} />
          </Animated.View>

          {/* ── Actions ── */}
          <View style={styles.actions}>
            {/* Set Wallpaper */}
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={targetOpen ? closePicker : openPicker}
              activeOpacity={0.78}
            >
              {settingWall ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons
                    name={targetOpen ? 'close' : 'albums-outline'}
                    size={16}
                    color="#fff"
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.primaryLabel}>
                    {targetOpen ? 'Cancel' : 'Set Wallpaper'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Download */}
            <TouchableOpacity
              style={[styles.squareBtn, { backgroundColor: subBg }]}
              onPress={handleDownload}
              activeOpacity={0.7}
            >
              {downloading
                ? <ActivityIndicator size="small" color={textPri} />
                : <Ionicons name="arrow-down-outline" size={20} color={textPri} />
              }
            </TouchableOpacity>

            {/* Favourite */}
            <TouchableOpacity
              style={[styles.squareBtn, { backgroundColor: subBg }]}
              onPress={() => { toggleFavorite({ ...params }); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isFav ? 'heart' : 'heart-outline'}
                size={20}
                color={isFav ? '#FF375F' : textPri}
              />
            </TouchableOpacity>
          </View>

        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },

  vignette: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: H * 0.4,
  },

  // ── Top bar ─────────────────────────────────────────────────────────────────
  topBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    zIndex: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 2,
  },
  topBtn: {
    width: 36, height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Sheet ────────────────────────────────────────────────────────────────────
  sheetWrap: {
    position: 'absolute',
    left: 12, right: 12,
  },
  handleWrap: {
    alignItems: 'center',
    paddingBottom: 7,
  },
  handle: {
    width: 32, height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.36)',
  },
  card: {
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 8 : 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.22,
        shadowRadius: 20,
      },
      android: { elevation: 14 },
    }),
  },

  // ── Header ───────────────────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  author: {
    fontSize: 12,
    fontWeight: '500',
  },
  chips: {
    alignItems: 'flex-end',
    gap: 5,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 12,
  },

  // ── Picker ────────────────────────────────────────────────────────────────────
  picker: {
    marginBottom: 0,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    gap: 12,
  },
  pickerIcon: {
    width: 32, height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },

  // ── Actions ───────────────────────────────────────────────────────────────────
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryBtn: {
    flex: 1,
    height: 50,
    backgroundColor: '#111',
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 10,
      },
      android: { elevation: 8 },
    }),
  },
  primaryLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  squareBtn: {
    width: 50, height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});