'use client';

import React, { useContext, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import WallpaperGrid from '@/components/WallpaperGrid';
import { FavoritesContext } from '@/context/FavoritesContext';
import { useSettings } from '@/context/SettingsContext';
import { invoke } from '@tauri-apps/api/core';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import { Switch } from '@/components/ui/switch';
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

export default function SavedPage() {
  const {
    favorites,
    shuffleEnabled,
    shuffleInterval,
    toggleShuffle,
    changeShuffleInterval
  } = useContext(FavoritesContext);
  const settings = useSettings();

  const [shuffling, setShuffling] = useState(false);
  const [showError, setShowError] = useState(false);
  const count = favorites?.length ?? 0;
  const leftScrollRef = useScrollRestoration('saved-left');
  const rightScrollRef = useScrollRestoration('saved-right');

  const handleShuffleNow = async () => {
    if (count === 0 || shuffling) return;
    setShuffling(true);
    try {
      if (typeof window !== 'undefined') {
        const success = await invoke('trigger_shuffle');
        if (success) {
          console.log('Shuffle successful');
        }
      }
    } catch (e) {
      console.error(e);
      setShowError(true);
    } finally {
      setShuffling(false);
    }
  };

  const shufflePanel = count > 0 ? (
    <div style={styles.shuffleCard}>
      <div style={styles.shuffleLeft}>
        <h3 style={styles.shuffleTitle}>Auto-Wallpaper Shuffle</h3>
        <p style={styles.shuffleDesc}>
          Automatically rotate your desktop background using your saved wallpapers.
        </p>
        <div style={styles.shuffleControls}>
          <label style={styles.switchLabel}>
            <Switch
              checked={shuffleEnabled}
              onCheckedChange={(checked) => toggleShuffle(!!checked)}
            />
            <span style={styles.switchText}>Enable Auto-Shuffle</span>
          </label>

          {shuffleEnabled && (
            <div style={styles.selectWrapper}>
              <span style={styles.selectLabel}>Interval:</span>
              <select
                value={shuffleInterval}
                onChange={(e) => changeShuffleInterval(Number(e.target.value))}
                style={styles.select}
              >
                <option value={60000}>1 Minute (Testing)</option>
                <option value={300000}>5 Minutes</option>
                <option value={900000}>15 Minutes</option>
                <option value={3600000}>1 Hour</option>
                <option value={43200000}>12 Hours</option>
                <option value={86400000}>24 Hours</option>
              </select>
            </div>
          )}
        </div>
        
        {/* Warning if shuffle is on but background mode is off */}
        {shuffleEnabled && !settings.runInBackground && (
          <div style={styles.warningBox}>
            <span style={styles.warningText}>
              Note: To rotate wallpapers after closing the app, ensure "Run in Background" is enabled in Settings.
            </span>
          </div>
        )}
      </div>
      <RippleButton
        onClick={handleShuffleNow}
        disabled={count === 0 || shuffling}
        style={{
          ...styles.shuffleBtn,
          ...(count === 0 ? styles.shuffleBtnDisabled : {})
        }}
      >
        {shuffling ? (
          <div className="spinner" style={{ width: '14px', height: '14px', border: '2px solid transparent', borderTopColor: '#000000' }} />
        ) : (
          <span>Rotate Now</span>
        )}
        <RippleButtonRipples />
      </RippleButton>
    </div>
  ) : null;

  return (
    <div style={styles.container} className="fade-in">
      
      {/* Left Column: Shuffle Settings (Scrollable) */}
      <div ref={leftScrollRef as React.RefObject<HTMLDivElement>} style={styles.leftPane}>
        <div style={styles.pageHeader}>
          <h2 style={styles.pageTitle}>Saved Collection</h2>
          <p style={styles.pageSubtitle}>
            {count === 0 ? 'Your personal library is empty' : `${count} wallpaper${count !== 1 ? 's' : ''} stored locally`}
          </p>
        </div>
        {shufflePanel}
      </div>

      {/* Right Column: Wallpaper Grid (Scrollable) */}
      <div ref={rightScrollRef as React.RefObject<HTMLDivElement>} style={styles.rightPane}>
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
              <RippleButton variant="default" style={styles.exploreBtn}>
                Browse Wallpapers
                <RippleButtonRipples />
              </RippleButton>
            </Link>
          </div>
        ) : (
          <WallpaperGrid
            wallpapers={favorites}
            emptyMessage="Nothing saved yet"
          />
        )}
      </div>

      {/* Error Dialog for Shuffle Failure */}
      <AlertDialog open={showError} onOpenChange={setShowError}>
        <AlertDialogPopup>
          <AlertDialogHeader>
            <AlertDialogTitle>Action Failed</AlertDialogTitle>
            <AlertDialogDescription>
              Failed to rotate wallpaper. Make sure the saved images are valid.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-md border px-4 py-2 text-sm text-foreground">
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogPopup>
      </AlertDialog>

    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row' as const,
    flex: 1,
    height: '100%',
    overflow: 'hidden',
  },
  leftPane: {
    width: '380px',
    height: '100%',
    overflowY: 'auto' as const,
    padding: '32px 24px',
    borderRight: '1px solid var(--border)',
    backgroundColor: 'var(--sidebar-bg)',
    backdropFilter: 'blur(20px)',
  },
  rightPane: {
    flex: 1,
    height: '100%',
    overflowY: 'auto' as const,
    padding: '16px',
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
    paddingTop: '60px',
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
  shuffleCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--surface-elevated)',
    backdropFilter: 'blur(10px)',
    marginBottom: '28px',
    gap: '16px',
    flexWrap: 'wrap' as const,
  },
  shuffleLeft: {
    display: 'flex',
    flexDirection: 'column' as const,
    flex: 1,
    minWidth: '280px',
  },
  shuffleTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text)',
    marginBottom: '4px',
  },
  shuffleDesc: {
    fontSize: '12px',
    color: 'var(--text-sub)',
    marginBottom: '12px',
  },
  shuffleControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
    flexWrap: 'wrap' as const,
  },
  switchLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--text)',
  },
  switchText: {
    userSelect: 'none' as const,
  },
  selectWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  selectLabel: {
    fontSize: '12px',
    color: 'var(--text-sub)',
  },
  select: {
    padding: '4px 8px',
    borderRadius: '6px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--surface)',
    color: 'var(--text)',
    fontSize: '12px',
    outline: 'none',
    cursor: 'pointer',
  },
  shuffleBtn: {
    backgroundColor: '#ffffff',
    color: '#000000',
    border: 'none',
    borderRadius: '10px',
    padding: '10px 20px',
    fontSize: '12px',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: 'var(--card-shadow)',
    transition: 'transform 0.15s ease, opacity 0.15s ease',
  },
  shuffleBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  warningBox: {
    marginTop: '16px',
    padding: '8px 12px',
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    borderLeft: '3px solid orange',
    borderRadius: '4px',
  },
  warningText: {
    fontSize: '11px',
    color: 'var(--text-sub)',
    fontWeight: '500',
  },
};