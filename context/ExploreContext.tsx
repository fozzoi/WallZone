'use client';

import React, { createContext, useContext, useState } from 'react';
import type { Wallpaper } from '@/services/api';

interface ExploreContextType {
  wallpapers: Wallpaper[];
  trending: Wallpaper[];
  page: number;
  hasMore: boolean;
  scrollPosition: number;
  searchQuery: string;
  setExploreData: (data: { wallpapers: Wallpaper[]; trending: Wallpaper[]; page: number; hasMore: boolean }) => void;
  setScrollPosition: (pos: number) => void;
  setSearchQuery: (q: string) => void;
  clearExploreData: () => void;
}

const ExploreContext = createContext<ExploreContextType | undefined>(undefined);

export function ExploreProvider({ children }: { children: React.ReactNode }) {
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [trending, setTrending] = useState<Wallpaper[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const setExploreData = (data: { wallpapers: Wallpaper[]; trending: Wallpaper[]; page: number; hasMore: boolean }) => {
    setWallpapers(data.wallpapers);
    setTrending(data.trending);
    setPage(data.page);
    setHasMore(data.hasMore);
  };

  const clearExploreData = () => {
    setWallpapers([]);
    setTrending([]);
    setPage(1);
    setHasMore(true);
    setScrollPosition(0);
  };

  return (
    <ExploreContext.Provider value={{
      wallpapers,
      trending,
      page,
      hasMore,
      scrollPosition,
      searchQuery,
      setExploreData,
      setScrollPosition,
      setSearchQuery,
      clearExploreData
    }}>
      {children}
    </ExploreContext.Provider>
  );
}

export function useExplore() {
  const context = useContext(ExploreContext);
  if (!context) {
    throw new Error('useExplore must be used within an ExploreProvider');
  }
  return context;
}
