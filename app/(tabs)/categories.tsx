/**
 * Categories screen
 */
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, ActivityIndicator, Dimensions, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { LargeHeader } from '@/components/ui/PageHeader';
import { fetchCategories } from '@/services/api';
import { useTheme, SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '@/constants/theme';

const { width: W } = Dimensions.get('window');
const COL_GAP = SPACING.sm + 2;
const CARD_W  = (W - SPACING.md * 2 - COL_GAP) / 2;

export default function CategoriesScreen() {
  const t = useTheme();
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  const handleCategory = (id: string, label: string) => {
    Haptics.selectionAsync();
    router.push({ pathname: '/view-all', params: { query: id, title: label, isCategory: '1' } });
  };

  const handleSearch = () => {
    if (!search.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({ pathname: '/view-all', params: { query: search.trim(), title: `"${search.trim()}"` } });
  };

  // Two-column masonry: alternate tall/short per column
  const left  = categories.filter((_, i) => i % 2 === 0);
  const right = categories.filter((_, i) => i % 2 !== 0);

  const renderCard = (item: any, tall: boolean) => (
    <TouchableOpacity
      key={item.id}
      activeOpacity={0.88}
      onPress={() => handleCategory(item.id, item.label)}
      style={[styles.card, { height: tall ? 230 : 172, backgroundColor: t.card }]}
    >
      {item.cover ? (
        <Image
          source={{ uri: item.cover }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={350}
          recyclingKey={item.id}
        />
      ) : null}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.72)']}
        style={styles.gradient}
      />
      <View style={styles.labelWrapper}>
        <BlurView
          intensity={Platform.OS === 'ios' ? 28 : 52}
          tint="dark"
          style={styles.label}
        >
          <Text style={styles.labelText}>{item.label}</Text>
        </BlurView>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.bg }]} edges={['top']}>
      <LargeHeader
        title="Discover"
        subtitle={`${categories.length} categories`}
        searchPlaceholder="Search wallpapers…"
        onSearch={setSearch}
        searchValue={search}
        onSearchSubmit={handleSearch}
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="small" color={t.accent} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.columns}>
            <View style={styles.col}>
              {left.map((item, i) => renderCard(item, i % 2 === 0))}
            </View>
            <View style={styles.col}>
              {right.map((item, i) => renderCard(item, i % 2 !== 0))}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  grid: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 130,
  },
  columns: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  col: { width: CARD_W },

  card: {
    width: '100%',
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: COL_GAP,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  gradient: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: '55%',
  },
  labelWrapper: {
    position: 'absolute',
    bottom: SPACING.sm + 2,
    left: SPACING.sm + 2,
    right: SPACING.sm + 2,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  label: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm + 4,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  labelText: {
    color: '#fff',
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.extrabold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
