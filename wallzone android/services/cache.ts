import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Wallpaper } from './api';

const CACHE_PREFIX = 'wz_cache_';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min — show instantly, refresh on app open

interface CacheEntry<T> {
  data: T;
  savedAt: number;
}

async function read<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    if (Date.now() - entry.savedAt > CACHE_TTL_MS) return entry.data; // stale but usable
    return entry.data;
  } catch {
    return null;
  }
}

async function write<T>(key: string, data: T): Promise<void> {
  try {
    const entry: CacheEntry<T> = { data, savedAt: Date.now() };
    await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // cache write failure is non-fatal
  }
}

export interface ExploreCache {
  wallpapers: Wallpaper[];
  trending: Wallpaper[];
}

export const contentCache = {
  getExplore: () => read<ExploreCache>('explore'),
  setExplore: (data: ExploreCache) => write('explore', data),

  getCategories: () => read<{ id: string; label: string; cover: string; query: string }[]>('categories'),
  setCategories: (data: { id: string; label: string; cover: string; query: string }[]) =>
    write('categories', data),
};
