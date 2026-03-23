import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

type Props = { navigation: any };

export default function SmartAnalysisScreen({ navigation }: Props) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (navigation.getParent() as any)?.getParent()?.openDrawer?.()}
          style={styles.menuBtn}
        >
          <Text style={[styles.menuIcon, { color: theme.accent }]}>☰</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Akıllı Analiz Sistemi</Text>
      </View>

      <View style={[styles.hero, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <LinearGradient
          colors={['#e0f2fe', '#bae6fd']}
          style={styles.heroGradient}
        >
          <Text style={styles.heroIcon}>📊</Text>
          <Text style={[styles.heroTitle, { color: theme.text }]}>
            Gelişimini Adım Adım Takip Ediyorum
          </Text>
          <Text style={[styles.heroSub, { color: theme.textSecondary }]}>
            Deneme sonuçlarını analiz eder, hangi konuda ne kadar ilerlediğini raporlarım. Bilge
            Baykuş olarak başarının tesadüf olmadığını gösteriyorum!
          </Text>
        </LinearGradient>
      </View>

      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>Son Deneme Analizi</Text>
        <Text style={[styles.cardPlaceholder, { color: theme.textSecondary }]}>
          Henüz deneme eklenmedi. Bir deneme çözüp sonuçlarını girerek analiz almaya başlayabilirsin.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: theme.accent }]}
        onPress={() => Alert.alert('Yakında', 'Deneme ekleme özelliği yakında eklenecek.')}
      >
        <Text style={styles.addBtnText}>+ Deneme Ekle</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  menuBtn: { padding: 8 },
  menuIcon: { fontSize: 20 },
  title: { flex: 1, fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  hero: {
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 28,
    borderWidth: 1,
  },
  heroGradient: { padding: 28, alignItems: 'center' },
  heroIcon: { fontSize: 64, marginBottom: 16 },
  heroTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  heroSub: { fontSize: 15, textAlign: 'center', lineHeight: 24 },
  card: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  cardPlaceholder: { fontSize: 15, lineHeight: 24 },
  addBtn: {
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
