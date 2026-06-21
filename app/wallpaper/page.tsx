// app/wallpaper/page.tsx
'use client';

import React, { useState, useEffect, useContext, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Eye, Scan, Download, Monitor, Database, FileImage } from 'lucide-react';
import { FavoritesContext } from '@/context/FavoritesContext';
import { trackDownload } from '@/services/api';

function WallpaperDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useContext(FavoritesContext);

  const id = searchParams.get('id') || '';
  const url = searchParams.get('url') || '';
  const fullUrl = searchParams.get('fullUrl') || url || '';
  const title = searchParams.get('title') || 'Wallpaper';
  const author = searchParams.get('author') || 'Wallhaven';
  const source = searchParams.get('source') || 'Wallhaven';
  const resolution = searchParams.get('resolution') || 'HD';
  const views = searchParams.get('views') || '0';
  const fileSize = searchParams.get('fileSize') || '';
  const downloadLocation = searchParams.get('download_location') || '';

  const isFav = isFavorite(id);

  const tags: string[] = (() => {
    try {
      return JSON.parse(searchParams.get('tagsJson') || '[]');
    } catch {
      return [];
    }
  })();

  const [downloading, setDownloading] = useState(false);

  const formatTitle = (raw: string) => {
    if (!raw) return 'Wallpaper';
    return raw
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  };

  const formatFileSize = (bytes: string | number) => {
    const num = Number(bytes);
    if (isNaN(num) || num === 0) return 'Unknown Size';
    if (num < 1024) return `${num} B`;
    if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
    return `${(num / (1024 * 1024)).toFixed(1)} MB`;
  };



  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `wallzone_${id || 'download'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      if (downloadLocation) {
        trackDownload(downloadLocation);
      }
    } catch (err) {
      console.error('Download failed', err);
      alert('Failed to download image. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div style={styles.root} className="fade-in">
      {/* Immersive Blurred Backdrop */}
      <div style={styles.bgWrapper}>
        <img src={fullUrl} alt="" style={styles.bgImage} />
        <div style={styles.bgOverlay} />
      </div>

      {/* Main Container */}
      <div style={styles.container}>
        
        {/* Left Side: Wallpaper Viewer */}
        <div style={styles.viewer}>
          <div style={styles.viewerHeader}>
            <button onClick={() => router.back()} style={styles.backBtn} title="Go Back">
              <ArrowLeft size={18} />
            </button>
          </div>
          <div style={styles.imageContainer}>
            <img src={fullUrl} alt={title} className="detail-main-image" style={styles.mainImage} />
          </div>
        </div>

        {/* Right Side: Floating Glass Details Panel */}
        <div style={styles.panel}>
          <div style={styles.glassCard}>
            
            {/* Header Title & Author */}
            <div style={styles.headerInfo}>
              <h1 style={styles.title} title={title}>
                {formatTitle(title)}
              </h1>
              <div style={styles.authorRow}>
                <div style={styles.authorBadge}>
                  {author.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p style={styles.authorName}>by {author}</p>
                  <p style={styles.sourceText}>via {source}</p>
                </div>
              </div>
            </div>

            <div style={styles.divider} />

            {/* Quick Metadata Stats Grid */}
            <div style={styles.statsGrid}>
              <div style={styles.statCell}>
                <Eye size={14} style={styles.statIcon} />
                <div>
                  <p style={styles.statLabel}>Views</p>
                  <p style={styles.statValue}>{Number(views).toLocaleString()}</p>
                </div>
              </div>
              
              <div style={styles.statCell}>
                <Scan size={14} style={styles.statIcon} />
                <div>
                  <p style={styles.statLabel}>Resolution</p>
                  <p style={styles.statValue}>{resolution}</p>
                </div>
              </div>

              <div style={styles.statCell}>
                <FileImage size={14} style={styles.statIcon} />
                <div>
                  <p style={styles.statLabel}>File Size</p>
                  <p style={styles.statValue}>{formatFileSize(fileSize)}</p>
                </div>
              </div>
            </div>

            {/* Tags section */}
            {tags.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <p style={styles.sectionHeading}>Tags</p>
                <div style={styles.tagsWrapper}>
                  {tags.map((tag, idx) => (
                    <div key={idx} className="detail-tag-pill" style={styles.tagPill}>
                      #{tag.replace(/[_]/g, ' ')}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={styles.divider} />

            {/* Actions Panel */}
            <div style={styles.actionSection}>
              {/* Action row (download, favorite) */}
              <div style={styles.secondaryActions}>
                <button
                  onClick={handleDownload}
                  className="secondary-btn btn-download-wallpaper"
                  style={styles.downloadBtn}
                >
                  {downloading ? (
                    <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid transparent', borderTopColor: '#000000', marginRight: '8px' }} />
                  ) : (
                    <Download size={16} style={{ marginRight: '8px' }} />
                  )}
                  <span>{downloading ? 'Downloading...' : 'Download Wallpaper'}</span>
                </button>

                <button
                  onClick={() => toggleFavorite({ id, url, fullUrl, title, author, source, resolution, views, fileSize })}
                  className="secondary-btn"
                  style={{
                    ...styles.squareBtn,
                    ...(isFav ? styles.favoriteBtnActive : {}),
                  }}
                  title={isFav ? 'Remove from saved' : 'Save wallpaper'}
                >
                  <Heart
                    size={18}
                    fill={isFav ? '#FF375F' : 'transparent'}
                    style={{
                      color: isFav ? '#FF375F' : 'var(--text)',
                      transition: 'color 0.2s ease, fill 0.2s ease',
                    }}
                  />
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}

export default function WallpaperDetailPage() {
  return (
    <Suspense fallback={
      <div style={styles.loadingScreen}>
        <div className="spinner" />
      </div>
    }>
      <WallpaperDetailContent />
    </Suspense>
  );
}

const styles = {
  root: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    position: 'fixed' as const,
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
    overflow: 'hidden',
    zIndex: 1000,
  },
  loadingScreen: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100vw',
    height: '100vh',
    backgroundColor: '#000000',
  },
  bgWrapper: {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  bgImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    filter: 'blur(60px) brightness(0.35)',
    transform: 'scale(1.1)',
  },
  bgOverlay: {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  container: {
    display: 'flex',
    width: '100%',
    height: '100%',
    position: 'relative' as const,
    zIndex: 5,
  },
  viewer: {
    flex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '24px',
  },
  viewerHeader: {
    height: '48px',
    display: 'flex',
    alignItems: 'center',
  },
  backBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '18px',
    border: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
    transition: 'background-color 0.2s ease',
  },
  imageContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    overflow: 'hidden',
  },
  mainImage: {
    maxWidth: '100%',
    maxHeight: '100%',
    objectFit: 'contain' as const,
    borderRadius: '16px',
  },
  panel: {
    width: '420px',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    paddingRight: '36px',
    paddingLeft: '12px',
  },
  glassCard: {
    width: '100%',
    borderRadius: '24px',
    padding: '32px',
    backgroundColor: 'rgba(20, 20, 22, 0.55)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0px 12px 40px rgba(0,0,0,0.5)',
  },
  headerInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    marginBottom: '20px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '-0.5px',
    lineHeight: '1.3',
  },
  authorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  authorBadge: {
    width: '36px',
    height: '36px',
    borderRadius: '18px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#ffffff',
  },
  sourceText: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: '1px',
  },
  divider: {
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    margin: '20px 0',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '24px',
  },
  statCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.04)',
  },
  statIcon: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  statLabel: {
    fontSize: '9px',
    fontWeight: '700',
    textTransform: 'uppercase' as const,
    color: 'rgba(255, 255, 255, 0.35)',
    letterSpacing: '0.4px',
  },
  statValue: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#ffffff',
    marginTop: '2px',
  },
  sectionHeading: {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase' as const,
    color: 'rgba(255, 255, 255, 0.45)',
    letterSpacing: '0.6px',
    marginBottom: '10px',
  },
  tagsWrapper: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '6px',
    maxHeight: '80px',
    overflowY: 'auto' as const,
  },
  tagPill: {
    padding: '5px 10px',
    borderRadius: '15px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '11px',
    fontWeight: '500',
    textTransform: 'lowercase' as const,
    transition: 'border-color 0.2s ease, color 0.2s ease',
  },
  tagText: {
    display: 'none', /* tag content is direct */
  },
  actionSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  downloadBtn: {
    flex: 1,
    height: '48px',
    backgroundColor: '#ffffff', /* white accent background */
    color: '#000000',
    border: 'none',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease',
  },
  secondaryActions: {
    display: 'flex',
    gap: '12px',
    width: '100%',
  },
  squareBtn: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'background-color 0.2s, border-color 0.2s, box-shadow 0.2s',
  },
  favoriteBtnActive: {
    borderColor: 'rgba(255, 55, 95, 0.3)',
    backgroundColor: 'rgba(255, 55, 95, 0.08)',
  },
};
