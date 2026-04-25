import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Platform, useColorScheme, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Responsive Measurements (Slightly larger, lifted higher) ─────────────
const IS_SMALL_SCREEN = SCREEN_WIDTH < 380;
const TAB_BAR_HEIGHT = IS_SMALL_SCREEN ? 54 : 62; // Increased size slightly
const BASE_ICON_SIZE = IS_SMALL_SCREEN ? 20 : 24; // Increased icon size
const DOCK_MARGIN_BOTTOM = Platform.OS === 'ios' ? 34 : 28; // Lifted higher, especially for Android

// ─── Animated Icon Wrapper (Smooth Zoom In/Out) ────────────────────────────
const AnimatedTabIcon = ({ isFocused, children }: { isFocused: boolean; children: React.ReactNode }) => {
  const scale = useRef(new Animated.Value(isFocused ? 1.2 : 1)).current;

  useEffect(() => {
    Animated.timing(scale, {
      toValue: isFocused ? 1.2 : 1, 
      duration: 250, 
      easing: Easing.out(Easing.cubic), 
      useNativeDriver: true,
    }).start();
  }, [isFocused]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      {children}
    </Animated.View>
  );
};

// ─── Custom Tab Bar Component ───────────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation, isDark }: any) {
  const gradientColors = isDark 
    ? ['transparent', 'rgba(0, 0, 0, 0.23)', 'rgba(0, 0, 0, 0.56)', '#000000f8'] 
    : ['transparent', 'rgba(255, 255, 255, 0.23)', 'rgba(255, 255, 255, 0.8)', '#ffffff']; 
    
  const pillBackground = isDark ? 'rgb(15, 15, 15)' : '#ffffff';
  const pillBorder = isDark ? 'rgb(30, 30, 30)' : '#e5e5e5';
  const inactiveIconColor = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)';
  const shadowColor = isDark ? '#000000' : '#888888';
  const pillicon = isDark ? '#ffffff' : 'rgb(15, 15, 15)' ;

  return (
    <View style={styles.overlayContainer} pointerEvents="box-none">
      <LinearGradient
        colors={gradientColors}
        locations={[0, 0.3, 0.7, 1]}
        style={styles.bottomGradient}
        pointerEvents="none"
      />
      
      <View style={[
        styles.pillContainer, 
        { 
          backgroundColor: pillBackground, 
          borderColor: pillBorder,
          shadowColor: shadowColor 
        }
      ]}>
        <View style={styles.tabBarInner}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate(route.name);
              }
            };

            const iconComponent = options.tabBarIcon
              ? options.tabBarIcon({
                  focused: isFocused,
                  color: isFocused ? pillicon : inactiveIconColor,
                  size: BASE_ICON_SIZE,
                })
              : null;

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={onPress}
                style={styles.tabButton}
                activeOpacity={1}
              >
                <AnimatedTabIcon isFocused={isFocused}>
                  {iconComponent}
                </AnimatedTabIcon>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ─── Main Layout ────────────────────────────────────────────────────────────
export default function TabLayout() {
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} isDark={isDark} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'compass' : 'compass-outline'} size={BASE_ICON_SIZE} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={BASE_ICON_SIZE - 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'heart' : 'heart-outline'} size={BASE_ICON_SIZE - 1} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

// ─── Styles ───────────────────────────────────────────────
const styles = StyleSheet.create({
  overlayContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140, // Increased to cover the higher lift from the bottom
  },
  pillContainer: {
    width: Math.min(SCREEN_WIDTH - 60, 310), // Slightly wider to accommodate larger icons
    height: TAB_BAR_HEIGHT,
    marginBottom: DOCK_MARGIN_BOTTOM,
    borderRadius: TAB_BAR_HEIGHT / 2, 
    overflow: 'hidden',
    borderWidth: 1,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25, 
    shadowRadius: 12,
    elevation: 8,
  },
  tabBarInner: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
    justifyContent: 'space-evenly',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});