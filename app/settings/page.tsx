'use client';

import React from 'react';
import { useSettings, ThemeMode, WallTarget, ImageQuality } from '@/context/SettingsContext';
import { Settings, Shield, Image as ImageIcon, Smartphone, Trash2, Info, Server } from 'lucide-react';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';

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

  const handleClearCache = () => {
    if (confirm('Clear Cache? This will free up storage space but may cause images to load slower next time.')) {
      settings.clearCache();
    }
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
                <SegmentedControl
                  options={[
                    { label: 'Auto', value: 'system' },
                    { label: 'Light', value: 'light' },
                    { label: 'Dark', value: 'dark' },
                  ]}
                  currentValue={settings.theme}
                  onChange={(val) => handleThemeChange(val as ThemeMode)}
                />
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
                <input
                  type="checkbox"
                  checked={settings.safeMode}
                  onChange={(e) => toggleSafeMode(e.target.checked)}
                  style={styles.checkbox}
                />
              }
            />
            <div style={styles.divider} />
            <SettingRow
              icon={ImageIcon}
              title="Grid Quality"
              description="High-res looks better but uses more network data."
              control={
                <SegmentedControl
                  options={[
                    { label: 'Fast', value: 'thumb' },
                    { label: 'High', value: 'full' },
                  ]}
                  currentValue={settings.imageQuality}
                  onChange={(val) => handleQualityChange(val as ImageQuality)}
                />
              }
            />
            <div style={styles.divider} />
            <SettingRow
              icon={Smartphone}
              title="Set Wallpaper Default"
              description="Which screen to set by default on your device."
              control={
                <SegmentedControl
                  options={[
                    { label: 'Both', value: 'both' },
                    { label: 'Home', value: 'home' },
                    { label: 'Lock', value: 'lock' },
                  ]}
                  currentValue={settings.wallTarget}
                  onChange={(val) => handleTargetChange(val as WallTarget)}
                />
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
                <input
                  type="checkbox"
                  checked={settings.runInBackground}
                  onChange={(e) => toggleRunInBackground(e.target.checked)}
                  style={styles.checkbox}
                />
              }
            />
            <div style={styles.divider} />
            <SettingRow
              icon={Settings}
              title="Start on Boot"
              description="Launch WallZone automatically when Windows starts."
              control={
                <input
                  type="checkbox"
                  checked={settings.startOnBoot}
                  onChange={(e) => toggleStartOnBoot(e.target.checked)}
                  style={styles.checkbox}
                />
              }
            />
          </div>

          {/* Storage Section */}
          <SectionTitle title="Storage" />
          <div style={styles.card}>
            <SettingRow
              icon={Trash2}
              title="Clear Image Cache"
              description={`Currently using ~${settings.cacheSize}`}
              onPress={handleClearCache}
            />
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

const SegmentedControl = ({
  options,
  currentValue,
  onChange,
}: {
  options: { label: string; value: string }[];
  currentValue: string;
  onChange: (val: string) => void;
}) => {
  return (
    <div style={styles.segContainer}>
      {options.map((opt) => {
        const active = currentValue === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              ...styles.segBtn,
              ...(active ? styles.segBtnActive : {}),
            }}
          >
            <span
              style={{
                ...styles.segText,
                ...(active ? styles.segTextActive : {}),
              }}
            >
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
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
  checkbox: {
    width: '18px',
    height: '18px',
    accentColor: 'var(--text)',
    cursor: 'pointer',
  },
  segContainer: {
    display: 'flex',
    padding: '3px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--accent-dim)',
  },
  segBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
  },
  segBtnActive: {
    backgroundColor: 'var(--surface-elevated)',
    boxShadow: '0px 1px 2px rgba(0,0,0,0.1)',
  },
  segText: {
    fontSize: '12px',
    fontWeight: '500',
    color: 'var(--text-sub)',
  },
  segTextActive: {
    fontWeight: '700',
    color: 'var(--text)',
  },
};
