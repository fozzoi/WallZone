'use client';

import React from 'react';
import { useSettings, ThemeMode, WallTarget, ImageQuality } from '@/context/SettingsContext';
import { Settings, Shield, Image as ImageIcon, Smartphone, Trash2, Info, Server } from 'lucide-react';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPopup,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';

export default function SettingsPage() {
  const settings = useSettings();
  const scrollRef = useScrollRestoration('settings');

  const handleThemeChange = (val: ThemeMode) => {
    settings.setSetting('theme', val);
  };

  const handleTargetChange = (val: WallTarget) => {
    settings.setSetting('wallTarget', val);
  };

  const handleQualityChange = (val: ImageQuality) => {
    settings.setSetting('imageQuality', val);
  };

  const toggleSafeMode = (val: boolean) => {
    settings.setSetting('safeMode', val);
  };

  const toggleRunInBackground = (val: boolean) => {
    settings.setSetting('runInBackground', val);
  };

  const toggleStartOnBoot = (val: boolean) => {
    settings.setSetting('startOnBoot', val);
  };

  return (
    <div style={styles.container} className="fade-in">
      <div ref={scrollRef as React.RefObject<HTMLDivElement>} style={styles.scrollArea}>
        <div style={styles.contentWrap}>
          {/* Clean Inline Header */}
          <div style={styles.pageHeader}>
            <h2 style={styles.pageTitle}>Settings</h2>
            <p style={styles.pageSubtitle}>Configure visual defaults, content filters, and offline asset caches</p>
          </div>

          {/* Appearance Section */}
          <SectionTitle title="Appearance" />
          <div style={styles.card}>
            <SettingRow
              icon={Settings}
              title="Theme"
              description="System auto, light, or dark mode."
              control={
                <ToggleGroup
                  type="single"
                  value={settings.theme}
                  onValueChange={(val) => {
                    if (val) handleThemeChange(val as ThemeMode);
                  }}
                >
                  <ToggleGroupItem value="system">Auto</ToggleGroupItem>
                  <ToggleGroupItem value="light">Light</ToggleGroupItem>
                  <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
                </ToggleGroup>
              }
            />
          </div>

          {/* Preferences Section */}
          <SectionTitle title="Preferences" />
          <div style={styles.card}>
            <SettingRow
              icon={Shield}
              title="Safe Mode"
              description="Hide potentially sensitive content and anime."
              control={
                <Switch
                  checked={settings.safeMode}
                  onCheckedChange={(checked) => toggleSafeMode(!!checked)}
                />
              }
            />
            <div style={styles.divider} />
            <SettingRow
              icon={ImageIcon}
              title="Grid Quality"
              description="High-res looks better but uses more network data."
              control={
                <ToggleGroup
                  type="single"
                  value={settings.imageQuality}
                  onValueChange={(val) => {
                    if (val) handleQualityChange(val as ImageQuality);
                  }}
                >
                  <ToggleGroupItem value="thumb">Fast</ToggleGroupItem>
                  <ToggleGroupItem value="full">High</ToggleGroupItem>
                </ToggleGroup>
              }
            />
            <div style={styles.divider} />
            <SettingRow
              icon={Smartphone}
              title="Set Wallpaper Default"
              description="Which screen to set by default on your device."
              control={
                <ToggleGroup
                  type="single"
                  value={settings.wallTarget}
                  onValueChange={(val) => {
                    if (val) handleTargetChange(val as WallTarget);
                  }}
                >
                  <ToggleGroupItem value="both">Both</ToggleGroupItem>
                  <ToggleGroupItem value="home">Home</ToggleGroupItem>
                  <ToggleGroupItem value="lock">Lock</ToggleGroupItem>
                </ToggleGroup>
              }
            />
          </div>

          {/* System Section */}
          <SectionTitle title="System" />
          <div style={styles.card}>
            <SettingRow
              icon={Settings}
              title="Run in Background"
              description="Keep the app alive in the system tray when closed."
              control={
                <Switch
                  checked={settings.runInBackground}
                  onCheckedChange={(checked) => toggleRunInBackground(!!checked)}
                />
              }
            />
            <div style={styles.divider} />
            <SettingRow
              icon={Settings}
              title="Start on Boot"
              description="Launch WallZone automatically when Windows starts."
              control={
                <Switch
                  checked={settings.startOnBoot}
                  onCheckedChange={(checked) => toggleStartOnBoot(!!checked)}
                />
              }
            />
          </div>

          {/* Storage Section */}
          <SectionTitle title="Storage" />
          <div style={styles.card}>
            <AlertDialog>
              <AlertDialogTrigger className="w-full text-left" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                <SettingRow
                  icon={Trash2}
                  title="Clear Image Cache"
                  description={`Currently using ~${settings.cacheSize}`}
                />
              </AlertDialogTrigger>
              <AlertDialogPopup>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear Cache?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will free up storage space but may cause images to load slower next time.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-md border px-4 py-2 text-sm text-foreground">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => settings.clearCache()}
                    className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
                  >
                    Clear Cache
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogPopup>
            </AlertDialog>
          </div>

          {/* About Section */}
          <SectionTitle title="About" />
          <div style={styles.card}>
            <SettingRow
              icon={Info}
              title="Version"
              description="1.0.0 (Desktop Edition)"
            />
            <div style={styles.divider} />
            <SettingRow
              icon={Server}
              title="Powered by Unsplash"
              description="High-resolution photography API"
            />
          </div>

        </div>
      </div>
    </div>
  );
}

// Helper Components
const SectionTitle = ({ title }: { title: string }) => (
  <h4 style={styles.sectionTitle}>{title}</h4>
);

const SettingRow = ({
  icon: Icon,
  title,
  description,
  control,
  onPress,
}: {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  control?: React.ReactNode;
  onPress?: () => void;
}) => {
  const content = (
    <div style={styles.row}>
      <div style={styles.iconBox}>
        <Icon size={18} style={{ color: 'var(--text)' }} />
      </div>
      <div style={styles.rowTextWrap}>
        <span style={styles.rowTitle}>{title}</span>
        <span style={styles.rowDesc}>{description}</span>
      </div>
      {control && <div style={styles.controlWrap}>{control}</div>}
    </div>
  );

  if (onPress) {
    return (
      <div onClick={onPress} className="setting-row-interact" style={{ cursor: 'pointer' }}>
        {content}
      </div>
    );
  }
  return content;
};


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
  contentWrap: {
    padding: '32px 24px',
    maxWidth: '800px',
    margin: '0 auto',
    width: '100%',
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
  sectionTitle: {
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.8px',
    marginTop: '28px',
    marginBottom: '8px',
    paddingLeft: '4px',
    color: 'var(--text-sub)',
  },
  card: {
    borderRadius: '16px',
    border: '1px solid var(--border)',
    overflow: 'hidden',
    backgroundColor: 'var(--surface-elevated)',
    backdropFilter: 'blur(20px)',
  },
  divider: {
    height: '1px',
    marginLeft: '64px',
    backgroundColor: 'var(--separator)',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    width: '100%',
  },
  iconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: 'var(--accent-dim)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '16px',
  },
  rowTextWrap: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: 'var(--text)',
    marginBottom: '2px',
  },
  rowDesc: {
    fontSize: '12px',
    color: 'var(--text-sub)',
  },
  controlWrap: {
    marginLeft: '16px',
  },
};