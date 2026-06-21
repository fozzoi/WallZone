import type { Wallpaper } from './api';

const CACHE_PREFIX = 'wz_cache_';
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 min

interface CacheEntry<T> {
  data: T;
  savedAt: number;
}

function read<T>(key: string): T | null {
  try {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const entry: CacheEntry<T> = JSON.parse(raw);
    return entry.data;
  } catch {
    return null;
  }
}

function write<T>(key: string, data: T): void {
  try {
    if (typeof window === 'undefined') return;
    const entry: CacheEntry<T> = { data, savedAt: Date.now() };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // ignore
  }
}

export interface ExploreCache {
  wallpapers: Wallpaper[];
  trending: Wallpaper[];
}

export const contentCache = {
  getExplore: async () => read<ExploreCache>('explore'),
  setExplore: async (data: ExploreCache) => write('explore', data),

  getCategories: async () => read<{ id: string; label: string; cover: string; query: string }[]>('categories'),
  setCategories: async (data: { id: string; label: string; cover: string; query: string }[]) =>
    write('categories', data),
};
