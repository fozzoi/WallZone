import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Dimensions,
  useColorScheme,
  Platform,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

// API Fetcher
import { fetchCuratedTopics } from '@/services/api'; 

const { width } = Dimensions.get('window');
const GUTTER = 14;
const CARD_W = (width - (GUTTER * 3)) / 2; 

export default function CategoriesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Theme Config
  const theme = {
    bg: isDark ? '#000000' : '#FFFFFF',
    surface: isDark ? '#111111' : '#F2F2F7',
    textMain: isDark ? '#FFFFFF' : '#111111',
    textSub: isDark ? '#8E8E93' : '#666666',
    border: isDark ? '#222222' : '#E5E5E5',
  };

  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      try {
        const dynamicData = await fetchCuratedTopics(1);
        setCategories(dynamicData || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  const handleSearchSubmit = () => {
    if (search.trim().length > 0) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push({
        pathname: '/view-all',
        params: { query: search.trim(), title: `Search: ${search.trim()}` }
      });
    }
  };

  const handlePress = (query: string, label: string) => {
    Haptics.selectionAsync();
    router.push({
      pathname: '/view-all',
      params: { query, title: label }
    });
  };

  const renderCard = (item: any, isTall: boolean) => (
    <TouchableOpacity
      key={item.id}
      activeOpacity={0.9}
      onPress={() => handlePress(item.id, item.label)} // item.id is the slug
      style={[
        styles.card, 
        { 
          height: isTall ? 240 : 180, 
          backgroundColor: isDark ? '#111' : '#EEE',
        }
      ]}
    >
      <Image
        source={{ uri: item.cover }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        transition={400}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.gradientMask}
      />
      <View style={styles.glassWrapper}>
        <BlurView 
          intensity={Platform.OS === 'ios' ? 30 : 60} 
          tint="dark" 
          style={styles.glassPanel}
        >
          <Text style={styles.cardLabel} numberOfLines={1}>
            {item.label}
          </Text>
        </BlurView>
      </View>
    </TouchableOpacity>
  );

  const leftColumn = categories.filter((_, i) => i % 2 === 0);
  const rightColumn = categories.filter((_, i) => i % 2 !== 0);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.bg }]}>
      
      {/* ── Dynamic Header ── */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textMain }]}>Discover</Text>

        <View style={[styles.searchBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Ionicons name="search" size={18} color={theme.textSub} />
          <TextInput
            style={[styles.searchInput, { color: theme.textMain }]}
            placeholder="Search aesthetic wallpapers..."
            placeholderTextColor={theme.textSub}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            onSubmitEditing={handleSearchSubmit}
            clearButtonMode="while-editing"
          />
        </View>
      </View>

      {/* ── Masonry Content ── */}
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="small" color={theme.textMain} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.masonryContainer}>
            <View style={styles.masonryColumn}>
              {leftColumn.map((item, index) => renderCard(item, index % 2 === 0))}
            </View>

            <View style={styles.masonryColumn}>
              {rightColumn.map((item, index) => renderCard(item, index % 2 !== 0))}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { 
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20, 
  },
  title: { 
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 20
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16, 
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 10,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: GUTTER,
    paddingBottom: 130, // Extra space for the pill tab bar
  },
  masonryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  masonryColumn: {
    width: CARD_W,
  },
  card: {
    width: '100%',
    borderRadius: 28, 
    overflow: 'hidden',
    marginBottom: GUTTER,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      }
    })
  },
  gradientMask: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: '50%',
  },
  glassWrapper: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    borderRadius: 20,
    overflow: 'hidden',
  },
  glassPanel: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});