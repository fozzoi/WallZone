'use client';

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import WallpaperGrid from '@/components/WallpaperGrid';
import WallpaperCarousel from '@/components/WallpaperCarousel';
import { fetchExplore, fetchSearch, fetchTrending } from '@/services/api';
import { contentCache } from '@/services/cache';
import { useExplore } from '@/context/ExploreContext';
import type { Wallpaper } from '@/services/api';

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';

  const {
    wallpapers: cachedWallpapers,
    trending: cachedTrending,
    page: cachedPage,
    hasMore: cachedHasMore,
    scrollPosition,
    searchQuery: cachedQuery,
    setExploreData,
    setScrollPosition,
    setSearchQuery,
  } = useExplore();

  const [wallpapers, setWallpapers] = useState<Wallpaper[]>(() => {
    return query === cachedQuery ? cachedWallpapers : [];
  });
  const [trending, setTrending] = useState<Wallpaper[]>(() => {
    return query === cachedQuery ? cachedTrending : [];
  });
  const [page, setPage] = useState(() => {
    return query === cachedQuery ? cachedPage : 1;
  });
  const [loading, setLoading] = useState(() => {
    return query === cachedQuery ? cachedWallpapers.length === 0 : true;
  });
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(() => {
    return query === cachedQuery ? cachedHasMore : true;
  });

  const isFetchingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync local changes to ExploreContext
  useEffect(() => {
    setExploreData({ wallpapers, trending, page, hasMore });
    setSearchQuery(query);
  }, [wallpapers, trending, page, hasMore, query, setExploreData, setSearchQuery]);

  // Restore scroll height on mount/cache load
  useEffect(() => {
    if (scrollRef.current && query === cachedQuery && scrollPosition > 0) {
      const timer = setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollPosition;
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [scrollPosition, query, cachedQuery]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollPosition(e.currentTarget.scrollTop);
  };

  const applyFeed = useCallback((grid: Wallpaper[], carousel: Wallpaper[]) => {
    setWallpapers(grid);
    const carouselData = carousel.length > 0 ? carousel : grid.slice(0, 6);
    setTrending(carouselData.slice(0, 6));
    setPage(1);
  }, []);

  const loadInitial = useCallback(async (options: { silent?: boolean } = {}) => {
    const { silent = false } = options;

    if (wallpapers.length > 0) {
      setLoading(false);
      return;
    }

    if (query === cachedQuery && cachedWallpapers.length > 0) {
      setLoading(false);
      return;
    }

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
  }, [applyFeed, query, cachedQuery, cachedWallpapers]);

  // Sync with search queries in URL
  useEffect(() => {
    if (!query.trim()) {
      if (wallpapers.length === 0) {
        setHasMore(true);
        loadInitial();
      } else {
        setLoading(false);
      }
      return;
    }

    if (query === cachedQuery && cachedWallpapers.length > 0) {
      setLoading(false);
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
  }, [query, loadInitial, cachedQuery, cachedWallpapers]);

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
      <div ref={scrollRef} onScroll={handleScroll} style={styles.scrollArea}>
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
