import { FavoritesContext } from '@/context/FavoritesContext';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Animated,
  Dimensions,
  LayoutAnimation,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
  Easing,
  Pressable
} from 'react-native';
import ImageColors from 'react-native-image-colors';
import ManageWallpaper, { TYPE } from 'react-native-manage-wallpaper';
import * as Haptics from 'expo-haptics';

// if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
//   UIManager.setLayoutAnimationEnabledExperimental(true);
// }

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Animation constants
const ACTION_CARD_HEIGHT = 220; 
const SLIDE_UP_VALUE = -240; 

type WallTarget = 'home' | 'lock' | 'both';

export default function WallpaperDetails() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useContext(FavoritesContext);
  const isDark = useColorScheme() === 'dark';

  const item = { ...params };
  const isFav = isFavorite(item.id as string);
  const imageUrl = typeof item.fullUrl === 'string' ? item.fullUrl : (typeof item.url === 'string' ? item.url : '');

  const [downloading, setDownloading] = useState(false);
  const [settingWall, setSettingWall] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [accentColor, setAccentColor] = useState(isDark ? '#444' : '#ccc');

  const slideAnim = useRef(new Animated.Value(0)).current;

  const theme = {
    bg: isDark ? '#000' : '#F2F2F7',
    card: isDark ? '#121212' : '#FFFFFF',
    text: isDark ? '#FFFFFF' : '#111111',
    sub: isDark ? '#888888' : '#666666',
  };

  // Title formatting: remove underscores/hyphens and capitalize
  const formatTitle = (text: any) => {
    if (!text || typeof text !== 'string') return 'Untitled Art';
    return text.replace(/[_-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
  };

  useEffect(() => {
    const fetchColors = async () => {
      try {
        const colors = await ImageColors.getColors(imageUrl, { fallback: '#888', cache: true });
        let newColor = isDark ? '#444' : '#ccc';
        if (colors.platform === 'android') newColor = colors.dominant || colors.vibrant || newColor;
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setAccentColor(newColor);
      } catch (e) { console.log(e); }
    };
    fetchColors();
  }, [imageUrl]);

  const toggleAction = (show: boolean) => {
    setIsSelecting(show);
    if (show) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    Animated.timing(slideAnim, {
      toValue: show ? SLIDE_UP_VALUE : 0,
      duration: 500,
      easing: Easing.out(Easing.back(1.1)),
      useNativeDriver: true,
    }).start();
  };

  const handleSetWallpaper = (target: WallTarget) => {
    const TYPE_MAP: Record<WallTarget, any> = { home: TYPE.HOME, lock: TYPE.LOCK, both: TYPE.BOTH };
    toggleAction(false);
    
    setTimeout(() => {
      setSettingWall(true);
      ManageWallpaper.setWallpaper(
        { uri: imageUrl },
        () => {
          setSettingWall(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
        TYPE_MAP[target]
      );
    }, 600);
  };

  // MetaBox component (No borders, Grid support)
  const MetaBox = ({ label, value, icon }: any) => (
    <View style={s.metaBox}>
      <View style={[s.metaIconWrap, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
        <Ionicons name={icon} size={15} color={accentColor} />
      </View>
      <View style={s.metaTextColumn}>
        <Text style={[s.metaLabel, { color: theme.sub }]}>{label}</Text>
        <Text style={[s.metaValue, { color: theme.text }]} numberOfLines={1}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={[s.root, { backgroundColor: theme.bg }]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Background Image - Tap to close selection panel */}
      <Pressable style={StyleSheet.absoluteFill} onPress={() => isSelecting && toggleAction(false)}>
        <Image source={{ uri: imageUrl }} style={StyleSheet.absoluteFill} contentFit="cover" />
      </Pressable>

      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={[s.backBtn, { backgroundColor: theme.card }]}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
      </View>

      {/* Main Card */}
      <Animated.View style={[s.mainCard, { backgroundColor: theme.card, transform: [{ translateY: slideAnim }] }]}>
        <View style={s.cardPadding}>
          <View style={s.infoRow}>
            <View style={{ flex: 1 }}>
              <Text style={[s.title, { color: theme.text }]}>{formatTitle(item.title)}</Text>
              <Text style={[s.author, { color: theme.sub }]}>by {item.author || 'Unsplash'}</Text>
            </View>
            <TouchableOpacity onPress={() => toggleFavorite(item)}>
              <Ionicons name={isFav ? "heart" : "heart-outline"} size={28} color={isFav ? "#FF3B30" : theme.text} />
            </TouchableOpacity>
          </View>

          {/* Metadata Grid (2 in 1 Row) */}
          <View style={s.metaGrid}>
             <MetaBox icon="person-outline" label="Artist" value={item.author || 'Creator'} />
             <MetaBox icon="color-palette-outline" label="Dominant" value={accentColor.toUpperCase()} />
             <MetaBox icon="save-outline" label="Size" value="2.4 MB" /> 
             <MetaBox icon="globe-outline" label="Source" value="Unsplash" />
          </View>

          <View style={s.btnRow}>
            <TouchableOpacity style={[s.downloadBtn, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]} onPress={() => Haptics.selectionAsync()}>
              <Ionicons name="cloud-download-outline" size={24} color={theme.text} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[s.applyBtn, { backgroundColor: accentColor }]}
              onPress={() => toggleAction(!isSelecting)}
            >
              {settingWall ? <ActivityIndicator color="#FFF" /> : (
                 <Text style={s.applyBtnText}>{isSelecting ? 'Cancel' : 'Set Wallpaper'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* Selection Card */}
      <Animated.View 
        style={[
          s.selectionCard, 
          { backgroundColor: theme.card, transform: [{ translateY: slideAnim }] }
        ]}
      >
        <Text style={[s.panelTitle, { color: theme.text }]}>Apply to Screen</Text>
        <View style={s.optionGrid}>
          {[
            { id: 'home', label: 'Home', icon: 'home-outline' },
            { id: 'lock', label: 'Lock', icon: 'lock-closed-outline' },
            { id: 'both', label: 'Both', icon: 'layers-outline' }
          ].map((opt) => (
            <TouchableOpacity 
              key={opt.id} 
              style={[s.optionItem, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]}
              onPress={() => handleSetWallpaper(opt.id as WallTarget)}
            >
              <Ionicons name={opt.icon as any} size={22} color={accentColor} />
              <Text style={[s.optionText, { color: theme.text }]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: { position: 'absolute', top: 50, left: 20, zIndex: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', elevation: 4 },
  
  mainCard: {
    position: 'absolute',
    bottom: 25, 
    left: 15, right: 15,
    borderRadius: 35,
    elevation: 10,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 15,
    zIndex: 20,
  },
  cardPadding: { padding: 24 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.6 },
  author: { fontSize: 14, fontWeight: '500', marginTop: 1 },
  
  // Grid: 2 columns
  metaGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    gap: 12, 
    marginBottom: 28 
  },
  metaBox: { 
    width: '48%', 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 4 
  },
  metaIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  metaTextColumn: { marginLeft: 10, flex: 1 },
  metaLabel: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  metaValue: { fontSize: 12, fontWeight: '700', marginTop: 1 },

  btnRow: { flexDirection: 'row', gap: 12 },
  downloadBtn: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  applyBtn: { flex: 1, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  applyBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },

  selectionCard: {
    position: 'absolute',
    bottom: -ACTION_CARD_HEIGHT, 
    left: 15, right: 15,
    height: ACTION_CARD_HEIGHT,
    borderRadius: 35,
    padding: 25,
    elevation: 12,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20,
    zIndex: 10,
  },
  panelTitle: { fontSize: 18, fontWeight: '800', marginBottom: 18, textAlign: 'center' },
  optionGrid: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  optionItem: { flex: 1, paddingVertical: 18, borderRadius: 20, alignItems: 'center', gap: 8 },
  optionText: { fontSize: 12, fontWeight: '700' }
});