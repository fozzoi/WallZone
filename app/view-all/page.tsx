// app/view-all/page.tsx
"use client";

import WallpaperGrid from "@/components/WallpaperGrid";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import type { Wallpaper } from "@/services/api";
import { fetchCategory, fetchSearch, fetchTrending } from "@/services/api";
import { ArrowLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

function ViewAllContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const query = searchParams.get("query") || "";
  const title = searchParams.get("title") || "Wallpapers";
  const isCategory = searchParams.get("isCategory") === "1";
  const scrollRef = useScrollRestoration(`view-all-${query}`);

  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const isFetchingRef = useRef(false);

  const load = useCallback(
    async (p: number, reset = false) => {
      if (reset) setLoading(true);
      try {
        let data: Wallpaper[];
        if (!query || query === "trending") {
          data = await fetchTrending(p);
        } else if (isCategory) {
          data = await fetchCategory(query, p);
        } else {
          data = await fetchSearch(query, p);
        }

        if (reset) {
          setWallpapers(data);
          setHasMore(data.length > 0);
        } else {
          if (data.length === 0) {
            setHasMore(false);
          } else {
            setWallpapers((prev) => {
              const existingIds = new Set(prev.map((w) => w.id));
              const unique = data.filter((w) => !existingIds.has(w.id));
              return [...prev, ...unique];
            });
            setHasMore(true);
          }
        }
        setPage(p);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [query, isCategory],
  );

  useEffect(() => {
    setHasMore(true);
    load(1, true);
  }, [query, load]);

  const loadMore = useCallback(async () => {
    if (isFetchingRef.current || !hasMore) return;
    isFetchingRef.current = true;
    setLoadingMore(true);
    await load(page + 1, false);
    isFetchingRef.current = false;
  }, [hasMore, page, load]);

  return (
    <div style={styles.container} className="fade-in">
      <div
        ref={scrollRef as React.RefObject<HTMLDivElement>}
        style={styles.scrollArea}
      >
        {/* Compact Inline Header */}
        <div style={styles.inlineHeader}>
          <button
            onClick={() => router.back()}
            style={styles.backBtn}
            title="Go Back"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 style={styles.pageTitle}>{title}</h2>
            <p style={styles.pageSubtitle}>
              {isCategory
                ? "Browsing category collection"
                : query === "trending"
                  ? "Top rated desktop wallpapers"
                  : "Search results"}
            </p>
          </div>
        </div>

        {loading ? (
          <div style={styles.centerSpinner}>
            <div className="spinner" />
          </div>
        ) : (
          <WallpaperGrid
            wallpapers={wallpapers}
            onLoadMore={loadMore}
            isLoadingMore={loadingMore}
            emptyMessage="No wallpapers found"
          />
        )}
      </div>
    </div>
  );
}

export default function ViewAllPage() {
  return (
    <Suspense
      fallback={
        <div style={styles.centerSpinner}>
          <div className="spinner" />
        </div>
      }
    >
      <ViewAllContent />
    </Suspense>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    flex: 1,
    height: "100%",
    overflow: "hidden",
  },
  inlineHeader: {
    display: "flex",
    alignItems: "center",
    padding: "32px 24px 12px 24px",
    gap: "16px",
  },
  backBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "18px",
    border: "1px solid var(--border)",
    backgroundColor: "var(--surface-elevated)",
    color: "var(--text)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s ease, border-color 0.2s ease",
  },
  pageTitle: {
    fontSize: "22px",
    fontWeight: "800",
    letterSpacing: "-0.5px",
    color: "var(--text)",
  },
  pageSubtitle: {
    fontSize: "12px",
    color: "var(--text-sub)",
    marginTop: "2px",
  },
  scrollArea: {
    flex: 1,
    overflowY: "auto" as const,
  },
  centerSpinner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "240px",
    width: "100%",
  },
};
