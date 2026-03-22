import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';

type Props = { navigation: any };

export default function StudyRoomScreen({ navigation }: Props) {
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
        <Text style={[styles.title, { color: theme.text }]}>Etüt Odası</Text>
      </View>

      <View style={[styles.hero, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <LinearGradient
          colors={['#ede9fe', '#e9d5ff']}
          style={styles.heroGradient}
        >
          <Text style={styles.heroIcon}>📖</Text>
          <Text style={[styles.heroTitle, { color: theme.text }]}>
            Soruları Reels Kaydırır Gibi Çöz!
          </Text>
          <Text style={[styles.heroSub, { color: theme.textSecondary }]}>
            Sıkıcı testleri unut. Eksik konularını eğlenceli bir alışkanlığa dönüştür. Bilge Baykuş
            zayıf noktalarını tespit edip özel içeriklerle seni ustalaştırır.
          </Text>
        </LinearGradient>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Konulara Göre Soru</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
          {['Türkçe', 'Matematik', 'Tarih', 'Coğrafya', 'Vatandaşlık'].map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.pill, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
            >
              <Text style={[styles.pillText, { color: theme.text }]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <TouchableOpacity
        style={[styles.startBtn, { backgroundColor: theme.accent }]}
        onPress={() => {}}
      >
        <Text style={styles.startBtnText}>Sorulara Başla →</Text>
      </TouchableOpacity>

      <Text style={[styles.hint, { color: theme.textSecondary }]}>
        Yukarı kaydırarak yeni soru, aşağı kaydırarak cevabı gör
      </Text>
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
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  pillRow: { marginHorizontal: -4 },
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 1,
  },
  pillText: { fontSize: 15, fontWeight: '500' },
  startBtn: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  startBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  hint: { fontSize: 13, textAlign: 'center' },
});
