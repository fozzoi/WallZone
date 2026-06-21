'use client';

/**
 * SettingsContext — persistent user preferences backed by localStorage.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

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

const DEFAULTS: Settings = {
  theme:        'dark',
  safeMode:     false,
  wallTarget:   'both',
  imageQuality: 'full',
};

const STORAGE_KEY = '@wallzone_settings';

const SettingsContext = createContext<SettingsContextValue>({
  ...DEFAULTS,
  setSetting:  async () => {},
  clearCache:  async () => {},
  cacheSize:   '—',
});

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULTS);
  const [cacheSize, setCacheSize] = useState('—');

  // Load persisted settings on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSettings({ ...DEFAULTS, ...parsed });
      }
    } catch { /* non-fatal */ }
    estimateCacheSize();
  }, []);

  // Update HTML data-theme attribute on theme change
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = (theme: ThemeMode) => {
      let resolved = theme;
      if (theme === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      root.setAttribute('data-theme', resolved);
    };

    applyTheme(settings.theme);

    if (settings.theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme('system');
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [settings.theme]);

  const setSetting = useCallback(async <K extends keyof Settings>(
    key: K,
    value: Settings[K],
  ) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch { /* non-fatal */ }
  }, [settings]);

  const estimateCacheSize = () => {
    try {
      let total = 0;
      for (let x in localStorage) {
        if (localStorage.hasOwnProperty(x)) {
          total += ((localStorage[x].length + x.length) * 2);
        }
      }
      const kb = (total / 1024).toFixed(1);
      setCacheSize(`${kb} KB`);
    } catch {
      setCacheSize('—');
    }
  };

  const clearCache = useCallback(async () => {
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('wz_cache_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      setCacheSize('0 KB');
    } catch { /* non-fatal */ }
  }, []);

  return (
    <SettingsContext.Provider value={{ ...settings, setSetting, clearCache, cacheSize }}>
      {children}
    </SettingsContext.Provider>
  );
}
