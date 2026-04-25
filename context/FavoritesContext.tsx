import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const FavoritesContext = createContext<any>(null);

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const stored = await AsyncStorage.getItem('@wallzone_favorites');
    if (stored) setFavorites(JSON.parse(stored));
  };

  const toggleFavorite = async (wallpaper: any) => {
    const isFav = favorites.some(fav => fav.id === wallpaper.id);
    let newFavs;
    if (isFav) {
      newFavs = favorites.filter(fav => fav.id !== wallpaper.id);
    } else {
      newFavs = [...favorites, wallpaper];
    }
    setFavorites(newFavs);
    await AsyncStorage.setItem('@wallzone_favorites', JSON.stringify(newFavs));
  };

  const isFavorite = (id: string) => favorites.some(fav => fav.id === id);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};