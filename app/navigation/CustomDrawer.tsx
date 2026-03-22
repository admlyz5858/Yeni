import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { usePremium } from '../context/PremiumContext';

const MENU_ITEMS = [
  { name: 'Odaklan', icon: '⏱️', screen: 'Pomodoro' },
  { name: 'Çalışma Gelişimi', icon: '📊', screen: 'StudyLog' },
  { name: 'Genel Bakış', icon: '📈', screen: 'Tabs' },
  { name: 'Haftalık Plan', icon: '📅', screen: 'Schedule' },
  { name: 'Konu Netlerim', icon: '🎓', screen: 'Plan' },
  { name: 'Kart Arşivi', icon: '📇', screen: 'Flashcards' },
  { name: 'Soru Kutusu', icon: '📥', screen: 'Goals' },
  { name: 'Zihin Haritası', icon: '🧠', screen: 'MindMap' },
  { name: 'Anlık Çözüm', icon: '📷', screen: 'InstantSolution' },
  { name: 'Etüt Odası', icon: '📖', screen: 'StudyRoom' },
  { name: 'Akıllı Analiz', icon: '📊', screen: 'SmartAnalysis' },
  { name: 'Sohbet', icon: '💬', screen: 'Chat' },
  { name: 'Dönüştürücü', icon: '🔄', screen: 'Converter' },
  { name: 'Zaman Haritası', icon: '🕐', screen: 'TimeMap' },
  { name: 'Taktik Blog', icon: '📝', screen: 'DailyActivity' },
  { name: 'Ayarlar', icon: '⚙️', screen: 'Settings' },
];

export default function CustomDrawerContent(props: any) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { isPremium } = usePremium();
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

      <View style={[styles.socialSection, { borderTopColor: theme.cardBorder }]}>
        <Text style={[styles.socialTitle, { color: theme.textSecondary }]}>BİZİ TAKİP EDİN</Text>
        <View style={styles.socialIcons}>
          <TouchableOpacity style={styles.socialBtn}>
            <Text style={styles.socialIcon}>📱</Text>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />
          <TouchableOpacity style={styles.socialBtn}>
            <Text style={styles.socialIcon}>📷</Text>
          </TouchableOpacity>
          <View style={[styles.divider, { backgroundColor: theme.cardBorder }]} />
          <TouchableOpacity style={styles.socialBtn}>
            <Text style={styles.socialIcon}>🎵</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.proBadge, { backgroundColor: theme.card }]}>
        <Text style={styles.mascotIcon}>🦉</Text>
        <Text style={[styles.proBrand, { color: theme.text }]}>Bilge Baykuş</Text>
        <View style={[styles.proTag, { backgroundColor: '#fef3c7' }]}>
          <Text style={styles.proTagText}>{isPremium ? 'PRO' : 'ÜCRETSİZ'}</Text>
        </View>
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
  socialSection: { marginTop: 24, paddingTop: 24, borderTopWidth: 1, paddingHorizontal: 24 },
  socialTitle: { fontSize: 11, fontWeight: '700', marginBottom: 12, letterSpacing: 0.5 },
  socialIcons: { flexDirection: 'row', alignItems: 'center' },
  socialBtn: { padding: 12 },
  socialIcon: { fontSize: 24 },
  divider: { width: 1, height: 20 },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 24,
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  mascotIcon: { fontSize: 32 },
  proBrand: { flex: 1, fontSize: 16, fontWeight: 'bold' },
  proTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  proTagText: { fontSize: 12, fontWeight: '700', color: '#b45309' },
});
