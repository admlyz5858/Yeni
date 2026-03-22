import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  Platform,
  Share,
} from 'react-native';
import * as StoreReview from 'expo-store-review';
import { useTheme } from '../context/ThemeContext';
import Constants from 'expo-constants';
import { PLAY_STORE_URL, PRIVACY_POLICY_URL, FEEDBACK_EMAIL } from '../constants/store';

type Props = {
  navigation: any;
};

const APP_VERSION = Constants.expoConfig?.version ?? Constants.manifest?.version ?? '1.0.0';

export default function AboutScreen({ navigation }: Props) {
  const { theme } = useTheme();

  const openUrl = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
      else Alert.alert('Hata', 'Bu link açılamıyor.');
    } catch {
      Alert.alert('Hata', 'Bir sorun oluştu.');
    }
  };

  const handleRateApp = async () => {
    try {
      const available = await StoreReview.isAvailableAsync();
      if (available) {
        await StoreReview.requestReview();
      } else {
        openUrl(PLAY_STORE_URL);
      }
    } catch {
      openUrl(PLAY_STORE_URL);
    }
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: `Çalışma Asistanı - Odaklan, planla, rozetler kazan! İndir: ${PLAY_STORE_URL}`,
        title: 'Çalışma Asistanı',
        url: PLAY_STORE_URL,
      });
    } catch {
      // User cancelled
    }
  };

  const handleFeedback = () => {
    Linking.openURL(`mailto:${FEEDBACK_EMAIL}?subject=Çalışma Asistanı Geri Bildirim`);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.content}
    >
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={[styles.backBtnText, { color: theme.accent }]}>← Geri</Text>
      </TouchableOpacity>

      <View style={styles.logoSection}>
        <Text style={styles.logo}>📚</Text>
        <Text style={[styles.appName, { color: theme.text }]}>Çalışma Asistanı</Text>
        <Text style={[styles.version, { color: theme.textSecondary }]}>
          Sürüm {APP_VERSION}
          {Platform.OS === 'android' && ` (Build ${Constants.expoConfig?.android?.versionCode ?? 1})`}
        </Text>
      </View>

      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Uygulama</Text>
        <TouchableOpacity style={styles.row} onPress={handleRateApp}>
          <Text style={styles.rowIcon}>⭐</Text>
          <Text style={[styles.rowLabel, { color: theme.text }]}>Uygulamayı Puanla</Text>
          <Text style={[styles.rowArrow, { color: theme.textSecondary }]}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={handleShareApp}>
          <Text style={styles.rowIcon}>📤</Text>
          <Text style={[styles.rowLabel, { color: theme.text }]}>Arkadaşlarla Paylaş</Text>
          <Text style={[styles.rowArrow, { color: theme.textSecondary }]}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={handleFeedback}>
          <Text style={styles.rowIcon}>✉️</Text>
          <Text style={[styles.rowLabel, { color: theme.text }]}>Geri Bildirim Gönder</Text>
          <Text style={[styles.rowArrow, { color: theme.textSecondary }]}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Yasal</Text>
        <TouchableOpacity style={styles.row} onPress={() => openUrl(PRIVACY_POLICY_URL)}>
          <Text style={styles.rowIcon}>🔒</Text>
          <Text style={[styles.rowLabel, { color: theme.text }]}>Gizlilik Politikası</Text>
          <Text style={[styles.rowArrow, { color: theme.textSecondary }]}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} onPress={() => openUrl(PLAY_STORE_URL)}>
          <Text style={styles.rowIcon}>🛒</Text>
          <Text style={[styles.rowLabel, { color: theme.text }]}>Google Play'de Görüntüle</Text>
          <Text style={[styles.rowArrow, { color: theme.textSecondary }]}>→</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.textSecondary }]}>
          © 2025 Çalışma Asistanı{'\n'}
          Expo & React Native ile geliştirilmiştir.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  backBtn: { padding: 8, marginBottom: 16 },
  backBtnText: { fontSize: 16, fontWeight: '500' },
  logoSection: { alignItems: 'center', marginBottom: 32 },
  logo: { fontSize: 64, marginBottom: 12 },
  appName: { fontSize: 24, fontWeight: 'bold' },
  version: { fontSize: 14, marginTop: 4 },
  section: {
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 12, fontWeight: '600', marginLeft: 16, marginBottom: 12, textTransform: 'uppercase' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  rowIcon: { fontSize: 22, marginRight: 12 },
  rowLabel: { fontSize: 16, flex: 1 },
  rowArrow: { fontSize: 16 },
  footer: { alignItems: 'center', paddingVertical: 24 },
  footerText: { fontSize: 13, textAlign: 'center', lineHeight: 22 },
});
