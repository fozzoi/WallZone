'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import WallpaperGrid from '@/components/WallpaperGrid';
import WallpaperCarousel from '@/components/WallpaperCarousel';
import { fetchExplore, fetchSearch, fetchTrending } from '@/services/api';
import { contentCache } from '@/services/cache';
import type { Wallpaper } from '@/services/api';

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [trending, setTrending] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const isFetchingRef = useRef(false);

  const applyFeed = useCallback((grid: Wallpaper[], carousel: Wallpaper[]) => {
    setWallpapers(grid);
    const carouselData = carousel.length > 0 ? carousel : grid.slice(0, 6);
    setTrending(carouselData.slice(0, 6));
    setPage(1);
  }, []);

  const loadInitial = useCallback(async (options: { silent?: boolean } = {}) => {
    const { silent = false } = options;

    if (!silent) {
      const cached = await contentCache.getExplore();
      if (cached?.wallpapers?.length) {
        applyFeed(cached.wallpapers, cached.trending || []);
        setLoading(false);
      } else {
        setLoading(true);
      }
    }

    try {
      const [grid, carousel] = await Promise.all([
        fetchExplore(1, true),
        fetchTrending(1, true),
      ]);
      applyFeed(grid, carousel);
      setHasMore(grid.length > 0);
      await contentCache.setExplore({ wallpapers: grid, trending: carousel.slice(0, 6) });
    } catch (e) {
      console.error('[loadInitial error]', e);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [applyFeed]);

  // Sync with search queries in URL
  useEffect(() => {
    if (!query.trim()) {
      setHasMore(true);
      loadInitial();
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setPage(1);
      setHasMore(true);
      try {
        const data = await fetchSearch(query, 1);
        setWallpapers(data);
        setTrending([]);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query, loadInitial]);

  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || !hasMore) return;
    isFetchingRef.current = true;
    setLoadingMore(true);
    try {
      const next = page + 1;
      const fresh = query.trim()
        ? await fetchSearch(query, next)
        : await fetchExplore(next);
      if (fresh.length > 0) {
        setWallpapers(prev => {
          const existingIds = new Set(prev.map(w => w.id));
          return [...prev, ...fresh.filter(w => !existingIds.has(w.id))];
        });
        setPage(next);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      isFetchingRef.current = false;
      setLoadingMore(false);
    }
  }, [hasMore, page, query]);

  const handleSeeAllTrending = () => {
    router.push('/view-all?query=trending&title=Trending');
  };

  const carouselComponent = !query.trim() && trending.length > 0 ? (
    <WallpaperCarousel
      title="Trending Wallpapers"
      data={trending}
      onSeeAll={handleSeeAllTrending}
    />
  ) : null;

  return (
    <div style={styles.container} className="fade-in">
      <div style={styles.scrollArea}>
        {loading ? (
          <div style={styles.centerSpinner}>
            <div className="spinner" />
          </div>
        ) : (
          <WallpaperGrid
            wallpapers={wallpapers}
            header={carouselComponent}
            onLoadMore={loadMore}
            isLoadingMore={loadingMore}
            emptyMessage="No wallpapers found - try another keyword"
          />
        )}
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={
      <div style={styles.centerSpinner}>
        <div className="spinner" />
      </div>
    }>
      <ExploreContent />
    </Suspense>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    flex: 1,
    height: '100%',
    overflow: 'hidden',
  },
  scrollArea: {
    flex: 1,
    overflowY: 'auto' as const,
  },
  centerSpinner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '240px',
    width: '100%',
  },
};
