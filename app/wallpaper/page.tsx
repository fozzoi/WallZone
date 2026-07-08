'use client';

import React, { useState, useEffect, useContext, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Heart, Download, Bookmark, MapPin, Loader2 } from 'lucide-react';
import { FavoritesContext } from '@/context/FavoritesContext';
import { trackDownload, fetchWallpaperDetail } from '@/services/api';
import { invoke } from '@tauri-apps/api/core';
import { RippleButton, RippleButtonRipples } from '@/components/ui/ripple-button';
import {
  AlertDialog,
  AlertDialogPopup,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';

function WallpaperDetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isFavorite, toggleFavorite } = useContext(FavoritesContext);

  const id = searchParams.get('id') || '';
  const url = searchParams.get('url') || '';
  const fullUrl = searchParams.get('fullUrl') || url || '';
  const title = searchParams.get('title') || 'Wallpaper';
  const author = searchParams.get('author') || 'Unsplash Photographer';
  const source = searchParams.get('source') || 'Unsplash';
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
  const [settingWall, setSettingWall] = useState(false);
  const [details, setDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [showAllTags, setShowAllTags] = useState(false);
  
  // Unified Error Dialog State
  const [errorDialog, setErrorDialog] = useState({ show: false, title: '', message: '' });

  // Fetch full details (Exif, Stats, Location, User Avatar) from Unsplash API
  useEffect(() => {
    if (!id) return;
    let active = true;
    async function load() {
      setLoadingDetails(true);
      try {
        const data = await fetchWallpaperDetail(id);
        if (active && data) {
          setDetails(data);
        }
      } catch (err) {
        console.error('Failed to load wallpaper details', err);
      } finally {
        if (active) setLoadingDetails(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [id]);

  const displayUrl = details?.fullUrl || fullUrl || url;
  const displayTitle = details?.title || title;
  const displayAuthor = details?.author || author;
  const displaySource = details?.source || source;
  const displayResolution = details?.resolution || resolution;
  const displayViews = details?.views || views;
  const displayDownloads = details?.downloads || 0;
  const displayLikes = details?.likes || 0;
  const displayTags = details?.tags || tags;
  const displayLocation = details?.location || null;
  const displayAvatar = details?.authorAvatar || '';
  const displayExif = details?.exif || {
    make: 'Unknown',
    model: 'Unknown',
    aperture: 'Unknown',
    focal_length: 'Unknown',
    exposure_time: 'Unknown',
    iso: 'Unknown'
  };

  const formatTitle = (raw: string) => {
    if (!raw) return 'Wallpaper';
    return raw
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
  };

  const formatStat = (num: number) => {
    if (isNaN(num) || num === 0) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
  };

  const handleToggleFav = () => {
    toggleFavorite({
      id,
      url,
      fullUrl,
      title: displayTitle,
      author: displayAuthor,
      source: displaySource,
      resolution: displayResolution,
      views: displayViews,
      fileSize,
      download_location: downloadLocation
    });
  };

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);
    try {
      const response = await fetch(displayUrl);
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
      setErrorDialog({
        show: true,
        title: 'Download Failed',
        message: 'Failed to download image. Please try again.'
      });
    } finally {
      setDownloading(false);
    }
  };

  const handleSetWallpaper = async () => {
    if (settingWall) return;
    setSettingWall(true);
    try {
      if (typeof window !== 'undefined') {
        const success = await invoke('set_wallpaper', { imageUrl: displayUrl });
        if (success) {
          console.log('Set wallpaper success');
        }
      }
    } catch (err) {
      console.error(err);
      setErrorDialog({
        show: true,
        title: 'Action Failed',
        message: 'Failed to set desktop wallpaper. Check connection or try another image.'
      });
    } finally {
      setSettingWall(false);
    }
  };

  return (
    <div style={styles.root} className="fade-in">
      {/* Immersive Blurred Backdrop */}
      <div style={styles.bgWrapper}>
        <img src={displayUrl} alt="" style={styles.bgImage} />
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
            <img src={displayUrl} alt={displayTitle} className="detail-main-image" style={styles.mainImage} />
          </div>
        </div>

        {/* Right Side: Floating Glass Details Panel */}
        <div style={styles.panel}>
          <div style={styles.glassCard}>
            {loadingDetails ? (
              <div style={styles.loadingPanel}>
                <Loader2 className="spinner" size={24} style={{ color: '#ffffff' }} />
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '12px' }}>
                  Loading specifications...
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                
                {/* Header Location */}
                {displayLocation && (
                  <div style={styles.locationContainer}>
                    <MapPin size={14} style={styles.locationIcon} />
                    <span style={styles.locationText}>{displayLocation}</span>
                  </div>
                )}

                {/* Header Title */}
                <h1 style={styles.title} title={displayTitle}>
                  {formatTitle(displayTitle)}
                </h1>

                {/* Author Row */}
                <div style={styles.authorRow}>
                  <div style={styles.authorLeft}>
                    {displayAvatar ? (
                      <img src={displayAvatar} alt={displayAuthor} style={styles.avatarImage} />
                    ) : (
                      <div style={styles.authorBadge}>
                        {displayAuthor.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <span style={styles.authorName}>{displayAuthor}</span>
                  </div>
                  
                  <div style={styles.authorRight}>
                    <button onClick={handleDownload} disabled={downloading} style={styles.iconActionBtn} title="Download">
                      <Download size={16} />
                    </button>
                    <button onClick={handleToggleFav} style={styles.iconActionBtn} title={isFav ? 'Remove from saved' : 'Save wallpaper'}>
                      <Heart size={16} fill={isFav ? '#FF375F' : 'transparent'} style={{ color: isFav ? '#FF375F' : '#ffffff' }} />
                    </button>
                    <button onClick={handleToggleFav} style={styles.iconActionBtn} title="Bookmark">
                      <Bookmark size={16} fill={isFav ? '#ffffff' : 'transparent'} style={{ color: '#ffffff' }} />
                    </button>
                  </div>
                </div>

                <div style={styles.divider} />

                {/* EXIF Specifications Grid */}
                <div style={styles.exifGrid}>
                  <div style={styles.exifCell}>
                    <span style={styles.exifLabel}>Camera</span>
                    <span style={styles.exifValue}>{displayExif.model && displayExif.model !== 'Unknown' ? `${displayExif.make} ${displayExif.model}` : 'Unknown'}</span>
                  </div>
                  <div style={styles.exifCell}>
                    <span style={styles.exifLabel}>Aperture</span>
                    <span style={styles.exifValue}>{displayExif.aperture && displayExif.aperture !== 'Unknown' ? (displayExif.aperture.startsWith('f/') ? displayExif.aperture : `f/${displayExif.aperture}`) : 'Unknown'}</span>
                  </div>
                  <div style={styles.exifCell}>
                    <span style={styles.exifLabel}>Focal Length</span>
                    <span style={styles.exifValue}>{displayExif.focal_length && displayExif.focal_length !== 'Unknown' ? (displayExif.focal_length.endsWith('mm') ? displayExif.focal_length : `${displayExif.focal_length}mm`) : 'Unknown'}</span>
                  </div>
                  <div style={styles.exifCell}>
                    <span style={styles.exifLabel}>Shutter Speed</span>
                    <span style={styles.exifValue}>{displayExif.exposure_time && displayExif.exposure_time !== 'Unknown' ? (displayExif.exposure_time.endsWith('s') ? displayExif.exposure_time : `${displayExif.exposure_time}s`) : 'Unknown'}</span>
                  </div>
                  <div style={styles.exifCell}>
                    <span style={styles.exifLabel}>ISO</span>
                    <span style={styles.exifValue}>{displayExif.iso !== 'Unknown' ? displayExif.iso : 'Unknown'}</span>
                  </div>
                  <div style={styles.exifCell}>
                    <span style={styles.exifLabel}>Dimensions</span>
                    <span style={styles.exifValue}>{displayResolution}</span>
                  </div>
                </div>

                <div style={styles.divider} />

                {/* Statistics Row */}
                <div style={styles.statsRow}>
                  <div style={styles.statItem}>
                    <span style={styles.statItemLabel}>Views</span>
                    <span style={styles.statItemValue}>{formatStat(Number(displayViews))}</span>
                  </div>
                  <div style={styles.statItem}>
                    <span style={styles.statItemLabel}>Downloads</span>
                    <span style={styles.statItemValue}>{formatStat(Number(displayDownloads))}</span>
                  </div>
                  <div style={styles.statItem}>
                    <span style={styles.statItemLabel}>Likes</span>
                    <span style={styles.statItemValue}>{formatStat(Number(displayLikes))}</span>
                  </div>
                </div>

                {/* Tags section */}
                {displayTags.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <span style={styles.exifLabel}>Tags</span>
                    <div style={styles.tagsWrapper}>
                      {(showAllTags ? displayTags : displayTags.slice(0, 3)).map((tag: string, idx: number) => (
                        <div key={idx} className="detail-tag-pill" style={styles.tagPill}>
                          #{tag.replace(/[_]/g, ' ')}
                        </div>
                      ))}
                      {displayTags.length > 3 && (
                        <button
                          onClick={() => setShowAllTags(!showAllTags)}
                          style={{
                            ...styles.tagPill,
                            cursor: 'pointer',
                            backgroundColor: 'rgba(255, 255, 255, 0.15)',
                            border: 'none',
                          }}
                        >
                          {showAllTags ? 'Show less' : `+${displayTags.length - 3} more`}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div style={styles.divider} />

                {/* Set Desktop Wallpaper Button upgraded to RippleButton */}
                <RippleButton
                  onClick={handleSetWallpaper}
                  disabled={settingWall}
                  className="primary-btn btn-set-wallpaper"
                  style={styles.setWallpaperBtn}
                >
                  {settingWall ? (
                    <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid transparent', borderTopColor: '#000000', marginRight: '8px' }} />
                  ) : null}
                  <span>{settingWall ? 'Setting Background...' : 'Set Desktop Wallpaper'}</span>
                  <RippleButtonRipples color="rgba(0,0,0,0.2)" />
                </RippleButton>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Global Action Error Dialog */}
      <AlertDialog open={errorDialog.show} onOpenChange={(open) => setErrorDialog(prev => ({ ...prev, show: open }))}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>{errorDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{errorDialog.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-md border px-4 py-2 text-sm text-foreground">
              Dismiss
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>

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
    width: '440px',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    paddingRight: '36px',
    paddingLeft: '12px',
  },
  glassCard: {
    width: '100%',
    borderRadius: '24px',
    padding: '28px 24px',
    backgroundColor: 'rgba(20, 20, 22, 0.65)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0px 12px 40px rgba(0,0,0,0.5)',
    maxHeight: '90%',
    overflowY: 'auto' as const,
  },
  loadingPanel: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '320px',
    width: '100%',
  },
  locationContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '12px',
    opacity: 0.8,
  },
  locationIcon: {
    color: '#ffffff',
  },
  locationText: {
    fontSize: '13px',
    color: '#ffffff',
    fontWeight: '500',
  },
  title: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: '-0.5px',
    lineHeight: '1.3',
    marginBottom: '16px',
    whiteSpace: 'nowrap' as const,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
  },
  authorRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  authorLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  authorBadge: {
    width: '32px',
    height: '32px',
    borderRadius: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.25)',
    color: '#ffffff',
    fontSize: '11px',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover' as const,
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  authorName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#ffffff',
  },
  authorRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  iconActionBtn: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
    transition: 'background-color 0.2s ease, transform 0.15s ease',
  },
  divider: {
    height: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    margin: '16px 0',
  },
  exifGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '14px 16px',
  },
  exifCell: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  exifLabel: {
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase' as const,
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: '0.6px',
    marginBottom: '3px',
  },
  exifValue: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#ffffff',
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 0',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    flex: 1,
  },
  statItemLabel: {
    fontSize: '10px',
    fontWeight: '700',
    textTransform: 'uppercase' as const,
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: '0.6px',
    marginBottom: '4px',
  },
  statItemValue: {
    fontSize: '15px',
    fontWeight: '800',
    color: '#ffffff',
  },
  tagsWrapper: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '6px',
    marginTop: '6px',
  },
  tagPill: {
    padding: '4px 10px',
    borderRadius: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: '11px',
    fontWeight: '500',
    textTransform: 'lowercase' as const,
  },
  setWallpaperBtn: {
    width: '100%',
    height: '46px',
    backgroundColor: '#ffffff',
    color: '#000000',
    border: 'none',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
  },
};