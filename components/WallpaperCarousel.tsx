'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

interface CarouselProps {
  title: string;
  data: Wallpaper[];
  onSeeAll?: () => void;
}

export default function WallpaperCarousel({
  title,
  data,
  onSeeAll,
}: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const ITEM_WIDTH = 480;
  const GAP = 16;
  const STEP = ITEM_WIDTH + GAP; // 496px

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const offset = direction === 'left' ? -STEP : STEP;
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const scrollLeft = scrollRef.current.scrollLeft;
    const index = Math.round(scrollLeft / STEP);
    if (index >= 0 && index < data.length) {
      setActiveIndex(index);
    }
  };

  const handleDotClick = (idx: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ left: idx * STEP, behavior: 'smooth' });
  };

  const formatTitle = (raw: string) => {
    if (!raw) return 'Wallpaper';
    return raw
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.titleText}>{title}</h3>
        <div style={styles.headerControls}>
          <button onClick={() => scroll('left')} style={styles.arrowBtn} title="Scroll Left">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => scroll('right')} style={styles.arrowBtn} title="Scroll Right">
            <ChevronRight size={16} />
          </button>
          {onSeeAll && (
            <button onClick={onSeeAll} style={styles.seeAllBtn}>
              See All
            </button>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="carousel-scroll"
        style={styles.scrollList}
      >
        {data.map((item) => (
          <Link
            key={item.id}
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
            style={{ textDecoration: 'none' }}
          >
            <div className="carousel-card" style={styles.card}>
              <img
                src={item.url}
                alt={item.title}
                loading="lazy"
                style={styles.cardImage}
              />
              <div style={styles.gradient} />
              <div style={styles.overlay}>
                <div style={styles.glassLabel}>
                  <p style={styles.cardTitle}>{formatTitle(item.title)}</p>
                  <p style={styles.cardAuthor}>by {item.author || 'Wallhaven'}</p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Animated Indicators */}
      {data.length > 0 && (
        <div style={styles.dotsContainer}>
          {data.map((_, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={idx}
                onClick={() => handleDotClick(idx)}
                style={{
                  ...styles.dot,
                  width: isActive ? '20px' : '6px',
                  backgroundColor: isActive ? 'var(--text)' : 'var(--text-sub)',
                  opacity: isActive ? 1 : 0.35,
                }}
                title={`Go to slide ${idx + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    marginBottom: '32px',
    position: 'relative' as const,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: '6px',
    paddingRight: '6px',
    marginBottom: '14px',
  },
  titleText: {
    fontSize: '18px',
    fontWeight: '800',
    letterSpacing: '-0.3px',
    color: 'var(--text)',
  },
  headerControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  arrowBtn: {
    width: '32px',
    height: '32px',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--surface)',
    color: 'var(--text)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
  },
  seeAllBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text)',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    paddingLeft: '12px',
    paddingRight: '6px',
  },
  scrollList: {
    display: 'flex',
    gap: '16px',
    overflowX: 'auto' as const,
    scrollSnapType: 'x mandatory',
    paddingBottom: '8px',
    paddingLeft: '6px',
    paddingRight: '6px',
  },
  card: {
    width: '480px',
    height: '270px',
    borderRadius: '16px',
    overflow: 'hidden',
    position: 'relative' as const,
    scrollSnapAlign: 'start',
    boxShadow: 'var(--card-shadow)',
    backgroundColor: 'var(--card)',
    cursor: 'pointer',
    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    display: 'block',
  },
  gradient: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
    pointerEvents: 'none' as const,
  },
  overlay: {
    position: 'absolute' as const,
    bottom: '14px',
    left: '14px',
    right: '14px',
  },
  glassLabel: {
    padding: '10px 14px',
    borderRadius: '10px',
    backgroundColor: 'rgba(20, 20, 20, 0.65)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: '13px',
    fontWeight: '700',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  },
  cardAuthor: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: '11px',
    marginTop: '2px',
  },
  dotsContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '6px',
    marginTop: '16px',
  },
  dot: {
    height: '6px',
    borderRadius: '3px',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.25s ease, opacity 0.25s ease',
  },
};
