'use client';

import React, { createContext, useState, useEffect } from 'react';

export const FavoritesContext = createContext<any>(null);

export const FavoritesProvider = ({ children }: { children: React.ReactNode }) => {
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    try {
      const stored = localStorage.getItem('@wallzone_favorites');
      if (stored) setFavorites(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  };

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

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};
