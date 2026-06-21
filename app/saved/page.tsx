'use client';

import React, { useContext } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import WallpaperGrid from '@/components/WallpaperGrid';
import { FavoritesContext } from '@/context/FavoritesContext';

export default function SavedPage() {
  const { favorites } = useContext(FavoritesContext);
  const count = favorites?.length ?? 0;

  return (
    <div style={styles.container} className="fade-in">
      <div style={styles.scrollArea}>
        {/* Clean Inline Header */}
        <div style={styles.pageHeader}>
          <h2 style={styles.pageTitle}>Saved Collection</h2>
          <p style={styles.pageSubtitle}>
            {count === 0 ? 'Your personal library is empty' : `${count} wallpaper${count !== 1 ? 's' : ''} stored locally`}
          </p>
        </div>

        {count === 0 ? (
          <div style={styles.empty}>
            <div style={styles.iconCircle}>
              <Heart size={36} style={{ color: 'var(--text-sub)' }} />
            </div>
            <h3 style={styles.emptyTitle}>Nothing saved yet</h3>
            <p style={styles.emptyBody}>
              Click the heart icon on any wallpaper card or detail view to add it to your saved collection.
            </p>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <button style={styles.exploreBtn}>Browse Wallpapers</button>
            </Link>
          </div>
        ) : (
          <WallpaperGrid
            wallpapers={favorites}
            emptyMessage="Nothing saved yet"
          />
        )}
      </div>
    </div>
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
    padding: '32px 24px',
  },
  pageHeader: {
    marginBottom: '28px',
    paddingLeft: '4px',
  },
  pageTitle: {
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    color: 'var(--text)',
  },
  pageSubtitle: {
    fontSize: '12px',
    color: 'var(--text-sub)',
    marginTop: '4px',
  },
  empty: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '80px',
    paddingLeft: '24px',
    paddingRight: '24px',
    gap: '16px',
  },
  iconCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: 'var(--surface-elevated)',
    border: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: 'var(--text)',
  },
  emptyBody: {
    fontSize: '13px',
    color: 'var(--text-sub)',
    textAlign: 'center' as const,
    maxWidth: '360px',
    lineHeight: '1.5',
  },
  exploreBtn: {
    marginTop: '12px',
    backgroundColor: '#ffffff',
    color: '#000000',
    border: 'none',
    borderRadius: '20px',
    padding: '8px 24px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: 'var(--card-shadow)',
    transition: 'transform 0.15s ease',
  },
};
