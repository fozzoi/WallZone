import React, { useContext, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import ManageWallpaper, { TYPE } from 'react-native-manage-wallpaper';
import { FavoritesContext } from '@/context/FavoritesContext';

export default function WallpaperDetails() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useContext(FavoritesContext);
  
  // Safe item reconstruction to ensure numbers stay numbers
  const item = {
    ...params,
    height: params.height ? Number(params.height) : 250,
  };
  
  const isFav = isFavorite(item.id);
  const [downloading, setDownloading] = useState(false);
  const [settingWall, setSettingWall] = useState(false);
  
  // Custom Toast State
  const [toastMessage, setToastMessage] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const showToast = (message: string) => {
    setToastMessage(message);
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true })
    ]).start();
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        showToast('Permission needed to save photos.');
        setDownloading(false);
        return;
      }

      const fileUri = `${FileSystem.documentDirectory}${item.id}.jpg`;
      const downloadedFile = await FileSystem.downloadAsync(item.fullUrl || item.url, fileUri);
      
      await MediaLibrary.createAssetAsync(downloadedFile.uri);
      showToast('Wallpaper saved to gallery!');
    } catch (error) {
      showToast('Failed to download image.');
    } finally {
      setDownloading(false);
    }
  };

  const handleSetWallpaper = () => {
    try {
      setSettingWall(true);
      // TYPE.HOME sets the home screen. Can also use TYPE.LOCK or TYPE.BOTH
      ManageWallpaper.setWallpaper(
        { uri: item.fullUrl || item.url },
        (res: any) => {
          showToast('Wallpaper applied successfully!');
          setSettingWall(false);
        },
        TYPE.HOME
      );
    } catch (error) {
      showToast('Failed to set wallpaper.');
      setSettingWall(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: item.fullUrl || item.url }} style={styles.image} contentFit="cover" />
      
      {/* Top Navigation */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => toggleFavorite(item)} style={styles.iconBtn}>
          <Ionicons name={isFav ? "heart" : "heart-outline"} size={24} color={isFav ? "#ff4757" : "#fff"} />
        </TouchableOpacity>
      </View>

      {/* Custom Styled Toast Notification */}
      <Animated.View style={[styles.toastContainer, { opacity: fadeAnim }]}>
        <Ionicons name="information-circle" size={20} color="#fff" style={{marginRight: 8}}/>
        <Text style={styles.toastText}>{toastMessage}</Text>
      </Animated.View>

      {/* Bottom Information & Controls */}
      <View style={styles.bottomBar}>
        <View style={styles.infoSection}>
          <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.author}>By {item.author}</Text>
        </View>
        
        <View style={styles.actions}>
          {/* Download Button */}
          <TouchableOpacity style={styles.actionBtn} onPress={handleDownload} disabled={downloading}>
            {downloading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="download-outline" size={24} color="#fff" />
            )}
            <Text style={styles.actionText}>Save</Text>
          </TouchableOpacity>

          {/* Set Wallpaper Button */}
          <TouchableOpacity style={[styles.actionBtn, styles.primaryBtn]} onPress={handleSetWallpaper} disabled={settingWall}>
             {settingWall ? (
              <ActivityIndicator color="#111" size="small" />
            ) : (
              <Ionicons name="color-wand-outline" size={24} color="#111" />
            )}
            <Text style={[styles.actionText, {color: '#111', fontWeight: 'bold'}]}>Set Wall</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  image: { flex: 1, width: '100%', height: '100%' },
  topBar: {
    position: 'absolute', top: 50, left: 20, right: 20,
    flexDirection: 'row', justifyContent: 'space-between', zIndex: 10
  },
  iconBtn: {
    backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 20
  },
  toastContainer: {
    position: 'absolute', top: 110, alignSelf: 'center',
    backgroundColor: 'rgba(20, 20, 20, 0.9)', paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 30, flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 5, zIndex: 20
  },
  toastText: { color: '#fff', fontSize: 14, fontWeight: '500' },
  bottomBar: {
    position: 'absolute', bottom: 0, width: '100%',
    padding: 24, paddingBottom: 40, backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  infoSection: { flex: 1, paddingRight: 16 },
  title: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  author: { color: '#ccc', fontSize: 14, marginTop: 4 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  actionBtn: { alignItems: 'center', marginLeft: 16 },
  primaryBtn: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  actionText: { color: '#fff', fontSize: 12, marginTop: 4 }
});