import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const MENU_ITEMS = [
  { name: 'Ana Sayfa', icon: '🏠', screen: 'Tabs' },
  { name: 'Odaklan', icon: '⏱️', screen: 'Pomodoro' },
  { name: 'Haftalık Plan', icon: '📅', screen: 'Schedule' },
  { name: 'Konular', icon: '🎓', screen: 'Plan' },
  { name: 'Kartlar', icon: '📇', screen: 'Flashcards' },
  { name: 'Ayarlar', icon: '⚙️', screen: 'Settings' },
];

export default function CustomDrawerContent(props: any) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { navigation } = props;

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={[styles.container, { backgroundColor: theme.bg }]}
    >
      <TouchableOpacity
        style={[styles.profileHeader, { backgroundColor: theme.card }]}
        onPress={() => {
          navigation.closeDrawer();
          navigation.navigate('Main', { screen: 'Tabs', params: { screen: 'ProfileTab' } });
        }}
      >
        <View style={[styles.avatar, { backgroundColor: theme.accentLight }]}>
          <Text style={styles.avatarEmoji}>🦉</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.userName, { color: theme.text }]}>{user?.name || 'Kullanıcı'}</Text>
          <View style={styles.rankRow}>
            <Text style={styles.pinIcon}>📍</Text>
            <Text style={[styles.rankText, { color: theme.accent }]}>Acemi Kâşif</Text>
          </View>
        </View>
        <Text style={[styles.chevron, { color: theme.textSecondary }]}>›</Text>
      </TouchableOpacity>

      <View style={styles.menu}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.screen}
            style={styles.menuItem}
            onPress={() => {
              navigation.closeDrawer();
              navigation.navigate('Main', { screen: item.screen });
            }}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={[styles.menuLabel, { color: theme.text }]}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 48 },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 24,
    gap: 12,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarEmoji: { fontSize: 24 },
  profileInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: 'bold' },
  rankRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  pinIcon: { fontSize: 12 },
  rankText: { fontSize: 13 },
  chevron: { fontSize: 20 },
  menu: { paddingHorizontal: 8 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 16,
  },
  menuIcon: { fontSize: 22 },
  menuLabel: { fontSize: 16 },
});
