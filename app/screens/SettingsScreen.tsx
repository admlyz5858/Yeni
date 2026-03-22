import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { usePlan } from '../context/PlanContext';
import { useAuth } from '../context/AuthContext';
import { requestNotificationPermissions, scheduleStudyReminder } from '../services/notifications';

type Props = {
  navigation: any;
};

export default function SettingsScreen({ navigation }: Props) {
  const { theme, mode, setMode } = useTheme();
  const { hasSeenOnboarding, setHasSeenOnboarding } = usePlan();
  const { user, logout } = useAuth();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backBtnText, { color: theme.accent }]}>← Geri</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Ayarlar</Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Görünüm</Text>
        <View style={styles.themeRow}>
          <TouchableOpacity
            style={[
              styles.themeBtn,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
              mode === 'light' && { borderColor: theme.accent, borderWidth: 2 },
            ]}
            onPress={() => setMode('light')}
          >
            <Text style={styles.themeIcon}>☀️</Text>
            <Text style={[styles.themeLabel, { color: theme.text }]}>Açık</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.themeBtn,
              { backgroundColor: theme.card, borderColor: theme.cardBorder },
              mode === 'dark' && { borderColor: theme.accent, borderWidth: 2 },
            ]}
            onPress={() => setMode('dark')}
          >
            <Text style={styles.themeIcon}>🌙</Text>
            <Text style={[styles.themeLabel, { color: theme.text }]}>Koyu</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Uygulama</Text>
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => setHasSeenOnboarding(false)}
        >
          <Text style={[styles.settingLabel, { color: theme.text }]}>Hoş geldin ekranını tekrar göster</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.settingRow}
          onPress={async () => {
            const ok = await requestNotificationPermissions();
            if (ok) {
              await scheduleStudyReminder(9, 0);
              Alert.alert('Tamam', 'Her gün saat 09:00\'da çalışma hatırlatması alacaksınız.');
            } else {
              Alert.alert('İzin Gerekli', 'Bildirimleri açmak için ayarlardan izin verin.');
            }
          }}
        >
          <Text style={[styles.settingLabel, { color: theme.text }]}>🔔 Günlük çalışma hatırlatması (09:00)</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.logoutRow, { borderTopColor: theme.cardBorder }]}
        onPress={() => {
          Alert.alert('Çıkış', 'Hesabınızdan çıkış yapmak istiyor musunuz?', [
            { text: 'İptal', style: 'cancel' },
            { text: 'Çıkış', style: 'destructive', onPress: logout },
          ]);
        }}
      >
        <Text style={[styles.logoutText, { color: theme.danger }]}>Çıkış Yap</Text>
      </TouchableOpacity>

      <View style={[styles.footer, { borderTopColor: theme.cardBorder }]}>
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          {user?.email} • Çalışma Asistanı v1.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  backBtn: { padding: 8, marginBottom: 8 },
  backBtnText: { fontSize: 16, fontWeight: '500' },
  title: { fontSize: 24, fontWeight: 'bold' },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 13, fontWeight: '600', marginBottom: 16, textTransform: 'uppercase' },
  themeRow: { flexDirection: 'row', gap: 12 },
  themeBtn: {
    flex: 1,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  themeIcon: { fontSize: 28, marginBottom: 8 },
  themeLabel: { fontSize: 16, fontWeight: '600' },
  settingRow: { paddingVertical: 16 },
  settingLabel: { fontSize: 16 },
  logoutRow: {
    padding: 20,
    borderTopWidth: 1,
  },
  logoutText: { fontSize: 16, fontWeight: '600' },
  footer: {
    paddingTop: 24,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  footerText: { fontSize: 14 },
});
