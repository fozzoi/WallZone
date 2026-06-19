// app/(tabs)/settings.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { LargeHeader } from '@/components/ui/PageHeader';
import { useSettings, ThemeMode, WallTarget, ImageQuality } from '@/context/SettingsContext';
import { useTheme, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '@/constants/theme';
import Constants from 'expo-constants';

export default function SettingsScreen() {
  const t = useTheme();
  const settings = useSettings();

  const handleThemeChange = (val: ThemeMode) => {
    Haptics.selectionAsync();
    settings.setSetting('theme', val);
  };

  const handleTargetChange = (val: WallTarget) => {
    Haptics.selectionAsync();
    settings.setSetting('wallTarget', val);
  };

  const handleQualityChange = (val: ImageQuality) => {
    Haptics.selectionAsync();
    settings.setSetting('imageQuality', val);
  };

  const toggleSafeMode = (val: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    settings.setSetting('safeMode', val);
  };

  const handleClearCache = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Clear Cache',
      'This will free up storage space but may cause images to load slower next time.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            settings.clearCache();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LargeHeader
          title="Settings"
          subtitle="Customize your experience"
          style={{ marginHorizontal: -SPACING.md, marginBottom: SPACING.sm }}
        />
        
        {/* ─── APPEARANCE ─── */}
        <SectionTitle title="Appearance" t={t} />
        <Card t={t}>
          <SettingRow
            icon="color-palette-outline"
            title="Theme"
            description="System, light, or dark mode."
            t={t}
            control={
              <SegmentedControl
                options={[
                  { label: 'Auto', value: 'system' },
                  { label: 'Light', value: 'light' },
                  { label: 'Dark', value: 'dark' },
                ]}
                currentValue={settings.theme}
                onChange={(val) => handleThemeChange(val as ThemeMode)}
                t={t}
              />
            }
          />
        </Card>

        {/* ─── CONTENT & PREFERENCES ─── */}
        <SectionTitle title="Preferences" t={t} />
        <Card t={t}>
          <SettingRow
            icon="shield-checkmark-outline"
            title="Safe Mode"
            description="Hide potentially sensitive content and anime."
            t={t}
            control={
              <Switch
                value={settings.safeMode}
                onValueChange={toggleSafeMode}
                trackColor={{ false: t.border, true: t.accent }}
                thumbColor={Platform.OS === 'android' ? t.surface : '#fff'}
                ios_backgroundColor={t.border}
              />
            }
          />
          <Divider t={t} />
          <SettingRow
            icon="image-outline"
            title="Grid Quality"
            description="High-res looks better but uses more data."
            t={t}
            control={
              <SegmentedControl
                options={[
                  { label: 'Fast', value: 'thumb' },
                  { label: 'High', value: 'full' },
                ]}
                currentValue={settings.imageQuality}
                onChange={(val) => handleQualityChange(val as ImageQuality)}
                t={t}
              />
            }
          />
          <Divider t={t} />
          <SettingRow
            icon="phone-portrait-outline"
            title="Set Wallpaper Default"
            description="Which screen to set by default."
            t={t}
            control={
              <SegmentedControl
                options={[
                  { label: 'Both', value: 'both' },
                  { label: 'Home', value: 'home' },
                  { label: 'Lock', value: 'lock' },
                ]}
                currentValue={settings.wallTarget}
                onChange={(val) => handleTargetChange(val as WallTarget)}
                t={t}
              />
            }
          />
        </Card>

        {/* ─── STORAGE ─── */}
        <SectionTitle title="Storage" t={t} />
        <Card t={t}>
          <SettingRow
            icon="trash-outline"
            title="Clear Image Cache"
            description={`Currently using ~${settings.cacheSize}`}
            t={t}
            onPress={handleClearCache}
          />
        </Card>

        {/* ─── ABOUT ─── */}
        <SectionTitle title="About" t={t} />
        <Card t={t}>
          <SettingRow
            icon="information-circle-outline"
            title="Version"
            description={Constants.expoConfig?.version || '1.0.0'}
            t={t}
          />
          <Divider t={t} />
          <SettingRow
            icon="server-outline"
            title="Powered by Wallhaven"
            description="API integration"
            t={t}
          />
        </Card>
      </ScrollView>
    </View>
  );
}

// ─── Component Helpers ────────────────────────────────────────────────────────

const SectionTitle = ({ title, t }: { title: string; t: any }) => (
  <Text style={[styles.sectionTitle, { color: t.textSub }]}>{title}</Text>
);

const Card = ({ children, t }: { children: React.ReactNode; t: any }) => (
  <View style={[styles.card, { backgroundColor: t.surfaceElevated, borderColor: t.border }]}>
    {children}
  </View>
);

const Divider = ({ t }: { t: any }) => (
  <View style={[styles.divider, { backgroundColor: t.separator }]} />
);

const SettingRow = ({
  icon,
  title,
  description,
  control,
  onPress,
  t,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  control?: React.ReactNode;
  onPress?: () => void;
  t: any;
}) => {
  const content = (
    <>
      <View style={[styles.iconBox, { backgroundColor: t.pillBg }]}>
        <Ionicons name={icon} size={20} color={t.text} />
      </View>
      <View style={styles.rowTextWrap}>
        <Text style={[styles.rowTitle, { color: t.text }]}>{title}</Text>
        <Text style={[styles.rowDesc, { color: t.textSub }]}>{description}</Text>
      </View>
      {control && <View style={styles.controlWrap}>{control}</View>}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }
  return <View style={styles.row}>{content}</View>;
};

const SegmentedControl = ({
  options,
  currentValue,
  onChange,
  t,
}: {
  options: { label: string; value: string }[];
  currentValue: string;
  onChange: (val: string) => void;
  t: any;
}) => {
  return (
    <View style={[styles.segContainer, { backgroundColor: t.pillBg, borderColor: t.pillBorder }]}>
      {options.map((opt) => {
        const active = currentValue === opt.value;
        return (
          <TouchableOpacity
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.segBtn,
              active && [styles.segBtnActive, { backgroundColor: t.surfaceElevated, shadowColor: t.text }],
            ]}
          >
            <Text
              style={[
                styles.segText,
                { color: active ? t.text : t.textMuted },
                active && styles.segTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 120, // space for tab bar
  },
  sectionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
  },
  card: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    marginLeft: 54, // align with text
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  rowTextWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: FONT_SIZE.body,
    fontWeight: FONT_WEIGHT.semibold,
    marginBottom: 2,
  },
  rowDesc: {
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.regular,
  },
  controlWrap: {
    marginLeft: SPACING.sm,
  },

  // Segmented Control
  segContainer: {
    flexDirection: 'row',
    padding: 3,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
  },
  segBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.sm - 2,
  },
  segBtnActive: {
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: { elevation: 1 },
    }),
  },
  segText: {
    fontSize: FONT_SIZE.caption,
    fontWeight: FONT_WEIGHT.medium,
  },
  segTextActive: {
    fontWeight: FONT_WEIGHT.bold,
  },
});
