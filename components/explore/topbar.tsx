import React from 'react';
import { View, Text, TextInput, StyleSheet, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TopBar({ title = "Wallzone", onSearch }) {
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#ffffff', borderBottomColor: isDark ? '#222' : '#f0f0f0' }]}>
      <Text style={[styles.heading, { color: isDark ? '#fff' : '#111' }]}>{title}</Text>

      <View style={[styles.searchContainer, { backgroundColor: isDark ? '#222' : '#f5f5f5' }]}>
        <Ionicons name="search" size={20} color={isDark ? "#aaa" : "#888"} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: isDark ? '#fff' : '#111' }]}
          placeholder="Search wallpapers..."
          placeholderTextColor={isDark ? "#888" : "#888"}
          onChangeText={onSearch}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111',
    height: '100%',
  },
});