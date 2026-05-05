import React from 'react';
import { StyleSheet, View } from 'react-native';

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    paddingHorizontal: 20,
    paddingBottom: 130,
  },
  columns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  card: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  cardInner: {
    padding: 20,
  },
  favBtn: {
    backgroundColor: '#FF5733',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  favIcon: {
    fontSize: 24,
    color: '#FFFFFF',
  },
  favLabel: {
    fontSize: 16,
    color: '#FFFFFF',
  },
});

const WallpaperCard = ({ wallpaper }) => (
  <View style={styles.card}>
    <View style={styles.cardInner}>
      <Image
        source={{ uri: wallpaper.fullUrl }}
        style={{ width: '100%', height: 'auto' }}
      />
      <Text style={styles.title}>{wallpaper.title}</Text>
      <Text style={styles.author}>By {wallpaper.author}</Text>
    </View>
  </View>
);

export default WallpaperCard;
