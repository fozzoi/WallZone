/**
 * SettingsContext — persistent user preferences backed by AsyncStorage.
 * Import { useSettings } in any component to read/write settings.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { Image as ExpoImage } from 'expo-image';

// ─── Types ────────────────────────────────────────────────────────────────────
export type ThemeMode    = 'system' | 'light' | 'dark';
export type WallTarget   = 'home' | 'lock' | 'both';
export type ImageQuality = 'full' | 'thumb';

export interface Settings {
  theme:        ThemeMode;
  safeMode:     boolean;
  wallTarget:   WallTarget;
  imageQuality: ImageQuality;
}

interface SettingsContextValue extends Settings {
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => Promise<void>;
  clearCache: () => Promise<void>;
  cacheSize:  string;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULTS: Settings = {
  theme:        'system',
  safeMode:     false,
  wallTarget:   'both',
  imageQuality: 'full',
};

const STORAGE_KEY = '@wallzone_settings';

// ─── Context ──────────────────────────────────────────────────────────────────
const SettingsContext = createContext<SettingsContextValue>({
  ...DEFAULTS,
  setSetting:  async () => {},
  clearCache:  async () => {},
  cacheSize:   '—',
});

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [cacheSize, setCacheSize] = useState('—');

  // Load persisted settings on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
      } catch { /* non-fatal */ }
    })();
    estimateCacheSize();
  }, []);

  const setSetting = useCallback(async <K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch { /* non-fatal */ }
  }, [settings]);

  const estimateCacheSize = async () => {
    try {
      const cacheDir = FileSystem.cacheDirectory ?? '';
      const info = await FileSystem.getInfoAsync(cacheDir);
      if (info.exists && 'size' in info && info.size) {
        const mb = (info.size / 1024 / 1024).toFixed(1);
        setCacheSize(`${mb} MB`);
      } else {
        setCacheSize('< 1 MB');
      }
    } catch {
      setCacheSize('—');
    }
  };

  const clearCache = useCallback(async () => {
    try {
      // Clear expo-image disk cache
      await ExpoImage.clearDiskCache();
      // Clear app-level AsyncStorage content cache (but not settings/favorites)
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(k => k.startsWith('wz_cache_'));
      if (cacheKeys.length) await AsyncStorage.multiRemove(cacheKeys);
      setCacheSize('0 MB');
    } catch { /* non-fatal */ }
  }, []);

  return (
    <SettingsContext.Provider value={{ ...settings, setSetting, clearCache, cacheSize }}>
      {children}
    </SettingsContext.Provider>
  );
}
