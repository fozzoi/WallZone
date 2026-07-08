'use client';

import React, { useContext, useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Image as ImageIcon } from 'lucide-react';
import { FavoritesContext } from '@/context/FavoritesContext';
import { useSettings } from '@/context/SettingsContext';

interface Wallpaper {
  id: string;
  url: string;
  fullUrl: string;
  previewUrl?: string;
  title: string;
  tags?: string[];
  author: string;
  source?: string;
  height: number;
  resolution?: string;
  views?: number;
  favorites?: number;
  colors?: string[];
  fileSize?: number;
}

interface GridProps {
  wallpapers: Wallpaper[];
  header?: React.ReactNode;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
  emptyMessage?: string;
}

const formatTitle = (raw: string) => {
  if (!raw) return 'Wallpaper';
  return raw
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
};

export default function WallpaperGrid({
  wallpapers,
  header,
  onLoadMore,
  isLoadingMore = false,
  emptyMessage = 'No wallpapers found',
}: GridProps) {
  const { toggleFavorite, isFavorite } = useContext(FavoritesContext);
  const settings = useSettings();
  const [columnsCount, setColumnsCount] = useState(3);

  // Monitor screen width to adjust columns count
  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 480) setColumnsCount(1);
      else if (w < 768) setColumnsCount(2);
      else if (w < 1100) setColumnsCount(3);
      else setColumnsCount(4);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Split wallpapers into balanced columns
  const columns = Array.from({ length: columnsCount }, (_, colIndex) =>
    wallpapers.filter((_, itemIndex) => itemIndex % columnsCount === colIndex)
  );

  return (
    <div style={styles.container}>
      {header && <div style={styles.headerWrap}>{header}</div>}

      {wallpapers.length === 0 && !isLoadingMore ? (
        <div style={styles.empty}>
          <ImageIcon size={48} style={{ color: 'var(--text-muted)' }} />
          <p style={styles.emptyText}>{emptyMessage}</p>
        </div>
      ) : (
        <div style={styles.columnsContainer}>
          {columns.map((colItems, colIndex) => (
            <div key={colIndex} style={styles.column}>
              {colItems.map((item) => {
                const isFav = isFavorite(item.id);
                // Select resolution URL based on image quality settings
                const imgUrl = settings.imageQuality === 'thumb' && item.previewUrl ? item.previewUrl : item.url;
                const cardHeight = Math.max(200, Math.min(item.height || 260, 360));

                return (
                  <div key={item.id} className="grid-card-wrap" style={{ ...styles.card, height: `${cardHeight}px` }}>
                    {/* Link wrapping card */}
                    <Link
                      href={{
                        pathname: '/wallpaper',
                        query: {
                          id: String(item.id),
                          url: item.url,
                          fullUrl: item.fullUrl || item.url,
                          title: item.title || 'Wallpaper',
                          tagsJson: JSON.stringify(item.tags ?? []),
                          author: item.author || 'Wallhaven',
                          source: item.source || 'Wallhaven',
                          height: String(item.height || 280),
                          resolution: item.resolution || '',
                          views: String(item.views || 0),
                          favoritesCount: String(item.favorites || 0),
                          colorsJson: JSON.stringify(item.colors ?? []),
                          fileSize: String(item.fileSize || 0),
                        },
                      }}
                      style={{ textDecoration: 'none', height: '100%', width: '100%', display: 'block' }}
                    >
                      <img
                        src={imgUrl}
                        alt={item.title}
                        loading="lazy"
                        style={styles.cardImage}
                      />
                      <div className="card-gradient" style={styles.gradient} />
                    </Link>

                    {/* Card Info & Fav button overlay */}
                    <div className="card-info" style={styles.infoWrapper}>
                      <div style={styles.infoPill}>
                        <div style={styles.rowTextWrap}>
                          <span style={styles.authorText} title={item.title}>
                            {formatTitle(item.title)}
                          </span>
                          <span style={styles.uploaderText}>
                            by {item.author || 'Wallhaven'}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(item);
                          }}
                          style={styles.favBtn}
                          title={isFav ? 'Remove from saved' : 'Save wallpaper'}
                        >
                          <Heart
                            size={16}
                            fill={isFav ? '#FF3B5C' : 'transparent'}
                            style={{
                              color: isFav ? '#FF3B5C' : '#ffffff',
                              transition: 'color 0.2s ease, fill 0.2s ease',
                            }}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Load More Trigger */}
      {onLoadMore && wallpapers.length > 0 && (
        <div style={styles.loadMoreContainer}>
          {isLoadingMore ? (
            <div className="spinner" />
          ) : (
            <button onClick={onLoadMore} style={styles.loadMoreBtn}>
              Load More
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    width: '100%',
    // ❌ removed: overflowY: 'auto', flex: 1, height: '100%'
  },
  headerWrap: {
    marginBottom: '20px',
  },
  columnsContainer: {
    display: 'flex',
    gap: '16px',
    width: '100%',
  },
  column: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  card: {
    borderRadius: '16px',
    overflow: 'hidden',
    position: 'relative' as const,
    boxShadow: 'var(--card-shadow)',
    backgroundColor: 'var(--card)',
    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
    cursor: 'pointer',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    transition: 'transform 0.3s ease',
    display: 'block',
  },
  gradient: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
    pointerEvents: 'none' as const,
  },
  infoWrapper: {
    position: 'absolute' as const,
    bottom: '12px',
    left: '12px',
    right: '12px',
    borderRadius: '10px',
    overflow: 'hidden',
    opacity: 1,
    transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease',
  },
  infoPill: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    backgroundColor: 'rgba(20, 20, 20, 0.65)',
    backdropFilter: 'blur(8px)',
  },
  authorText: {
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '700',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  rowTextWrap: {
    display: 'flex',
    flexDirection: 'column' as const,
    flex: 1,
    overflow: 'hidden',
    marginRight: '8px',
  },
  uploaderText: {
    color: 'rgba(255, 255, 255, 0.70)',
    fontSize: '10px',
    fontWeight: '500',
    marginTop: '2px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  favBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '2px',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '80px',
    gap: '16px',
  },
  emptyText: {
    fontSize: '15px',
    fontWeight: '500',
    color: 'var(--text-sub)',
    textAlign: 'center' as const,
  },
  loadMoreContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: '32px',
    paddingBottom: '32px',
  },
  loadMoreBtn: {
    backgroundColor: 'var(--text)', /* accent is white (text color in dark mode) */
    color: 'var(--background)',
    border: 'none',
    borderRadius: '24px',
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: 'var(--card-shadow)',
    transition: 'transform 0.15s ease, opacity 0.15s ease',
  },
};
