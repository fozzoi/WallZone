'use client';

import React, { createContext, useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

export const FavoritesContext = createContext<any>(null);

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [shuffleEnabled, setShuffleEnabled] = useState<boolean>(false);
  const [shuffleInterval, setShuffleInterval] = useState<number>(3600000); // Default: 1 hour

  useEffect(() => {
    loadFavorites();
    loadShuffleSettings();
  }, []);

  const loadFavorites = () => {
    try {
      const stored = localStorage.getItem('@wallzone_favorites');
      if (stored) setFavorites(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  };

  const loadShuffleSettings = () => {
    try {
      const enabled = localStorage.getItem('@wallzone_shuffle_enabled');
      if (enabled) setShuffleEnabled(JSON.parse(enabled));

      const interval = localStorage.getItem('@wallzone_shuffle_interval');
      if (interval) setShuffleInterval(JSON.parse(interval));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      invoke('update_shuffle_settings', { 
        settings: {
          enabled: shuffleEnabled,
          intervalMs: shuffleInterval,
          wallpapers: favorites,
        }
      }).catch(e => console.error("Failed to sync shuffle settings", e));
    }
  }, [shuffleEnabled, shuffleInterval, favorites]);

  const toggleFavorite = (wallpaper: any) => {
    const isFav = favorites.some(fav => fav.id === wallpaper.id);
    let newFavs;
    if (isFav) {
      newFavs = favorites.filter(fav => fav.id !== wallpaper.id);
    } else {
      newFavs = [...favorites, wallpaper];
    }
    setFavorites(newFavs);
    try {
      localStorage.setItem('@wallzone_favorites', JSON.stringify(newFavs));
    } catch (e) {
      console.error(e);
    }
  };

  const isFavorite = (id: string) => favorites.some(fav => fav.id === id);

  const toggleShuffle = (enabled: boolean) => {
    setShuffleEnabled(enabled);
    localStorage.setItem('@wallzone_shuffle_enabled', JSON.stringify(enabled));
  };

  const changeShuffleInterval = (ms: number) => {
    setShuffleInterval(ms);
    localStorage.setItem('@wallzone_shuffle_interval', JSON.stringify(ms));
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      toggleFavorite,
      isFavorite,
      shuffleEnabled,
      shuffleInterval,
      toggleShuffle,
      changeShuffleInterval
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};
