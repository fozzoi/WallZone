/**
 * WallZone – API Service
 * All requests go through your Vercel backend.
 * Set EXPO_PUBLIC_API_URL in your .env file after deploying.
 */

// ─── Config ───────────────────────────────────────────────────────────────────
// After deploying to Vercel, add this to your .env:
//   EXPO_PUBLIC_API_URL=https://wallzone-api-cl.vercel.app
// For local dev, run `vercel dev` in wallzone-api/ and use localhost below.
const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  'https://wallzone-api-cl.vercel.app/api/wallpapers'; // ← replace with your Vercel URL

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Wallpaper {
  id: string;
  url: string;
  fullUrl: string;
  previewUrl?: string;
  title: string;
  tags?: string[];       // all tag names from Wallhaven
  author: string;
  source?: string;       // e.g. 'Wallhaven'
  height: number;
  resolution?: string;
  views?: number;
  favorites?: number;
  colors?: string[];
  fileSize?: number;
  category?: string;
  download_location?: string;
}

// ─── Core fetcher ─────────────────────────────────────────────────────────────
async function get(
  params: Record<string, string | number>,
  options?: { refresh?: boolean }
): Promise<any> {
  const entries = Object.entries(params).reduce((acc, [k, v]) => {
    acc[k] = String(v);
    return acc;
  }, {} as Record<string, string>);

  // Automatically request landscape orientation for the desktop app
  entries.orientation = 'landscape';

  if (options?.refresh) {
    entries.refresh = '1';
    entries._t = String(Date.now());
  }

  const qs = new URLSearchParams(entries).toString();

  const response = await fetch(`${API_URL}?${qs}`, {
    headers: { Accept: 'application/json' },
    cache: options?.refresh ? 'no-store' : 'default',
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Home screen – random mix of categories (no query = explore mode)
 */
export async function fetchExplore(page = 1, refresh = false): Promise<Wallpaper[]> {
  try {
    const data = await get({ type: 'explore', page }, { refresh });
    return data.wallpapers || [];
  } catch (err) {
    console.error('[fetchExplore]', err);
    return [];
  }
}

/**
 * Carousel – diverse top wallpapers (rotates categories)
 */
export async function fetchTrending(page = 1, refresh = false): Promise<Wallpaper[]> {
  try {
    const data = await get({ type: 'trending', page }, { refresh });
    return data.wallpapers || [];
  } catch (err) {
    console.error('[fetchTrending]', err);
    return [];
  }
}

/**
 * Search – keyword search (returns proper wallpaper images, not stock photos)
 */
export async function fetchSearch(query: string, page = 1): Promise<Wallpaper[]> {
  if (!query.trim()) return fetchExplore(page);
  try {
    const data = await get({ type: 'search', q: query.trim(), page });
    return data.wallpapers || [];
  } catch (err) {
    console.error('[fetchSearch]', err);
    return [];
  }
}

/**
 * Category grid – wallpapers for a specific category id
 */
export async function fetchCategory(categoryId: string, page = 1): Promise<Wallpaper[]> {
  try {
    const data = await get({ type: 'category', category: categoryId, page });
    return data.wallpapers || [];
  } catch (err) {
    console.error('[fetchCategory]', err);
    return [];
  }
}

/**
 * Category list – all categories with cover images (for the Categories tab)
 */
export async function fetchCategories(refresh = false): Promise<{ id: string; label: string; cover: string; query: string }[]> {
  try {
    const data = await get({ type: 'categories' }, { refresh });
    return data.categories || [];
  } catch (err) {
    console.error('[fetchCategories]', err);
    return [];
  }
}

/**
 * Track Unsplash Download
 * Required by Unsplash API Guidelines. Hits our proxy endpoint.
 */
export async function trackDownload(downloadLocationUrl?: string): Promise<void> {
  if (!downloadLocationUrl) return;
  try {
    const qs = new URLSearchParams({ downloadUrl: downloadLocationUrl }).toString();
    fetch(`${API_URL.replace('/wallpapers', '/track-download')}?${qs}`).catch(() => {});
  } catch (err) {
    console.error('[trackDownload]', err);
  }
}

/**
 * Detailed Wallpaper info by ID
 */
export async function fetchWallpaperDetail(id: string): Promise<any> {
  if (!id) return null;
  try {
    const data = await get({ type: 'detail', id });
    return data;
  } catch (err) {
    console.error('[fetchWallpaperDetail]', err);
    return null;
  }
}

