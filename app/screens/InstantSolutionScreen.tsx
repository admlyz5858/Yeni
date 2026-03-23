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

const STEPS = [
  { icon: '📷', title: 'Fotoğrafını Çek', sub: 'Soruyu net bir şekilde görüntüle.' },
  { icon: '✨', title: 'Bilge Baykuş Çözsün', sub: 'Saniyeler içinde detaylı anlatım.' },
  { icon: '💬', title: 'Anlamadığını Sor', sub: 'Tavşan ile sohbet et.' },
  { icon: '🔖', title: 'Dilersen Soruyu Kaydet', sub: 'İstediğin zaman tekrar bak.' },
];

type Props = { navigation: any };

export default function InstantSolutionScreen({ navigation }: Props) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.accent }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Anlık Çözüm</Text>
        <TouchableOpacity style={styles.bookmarkBtn}>
          <Text style={styles.bookmarkIcon}>🔖</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.heroCard, { backgroundColor: theme.card }]}>
        <LinearGradient
          colors={['#e0f2fe', '#f0fdfa']}
          style={styles.heroGradient}
        >
          <View style={[styles.avatarWrap, { backgroundColor: '#fff' }]}>
            <Text style={styles.avatarEmoji}>🦉</Text>
          </View>
          <Text style={[styles.heroTitle, { color: theme.text }]}>
            Sorularla Boğuşma, Bilge Baykuş Yanında!
          </Text>
          <Text style={[styles.heroSub, { color: theme.textSecondary }]}>
            Takıldığın sorunun fotoğrafını çek, Bilge Baykuş senin için adım adım çözsün.
          </Text>
        </LinearGradient>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Nasıl Çalışır?</Text>
      {STEPS.map((step, i) => (
        <View
          key={i}
          style={[styles.stepCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        >
          <View style={[styles.stepIcon, { backgroundColor: theme.cardBorder }]}>
            <Text style={styles.stepIconText}>{step.icon}</Text>
          </View>
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { color: theme.text }]}>{step.title}</Text>
            <Text style={[styles.stepSub, { color: theme.textSecondary }]}>{step.sub}</Text>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.askBtn}>
        <LinearGradient
          colors={['#22d3ee', '#06b6d4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.askBtnGradient}
        >
          <Text style={styles.askBtnIcon}>📷</Text>
          <Text style={styles.askBtnText}>Soru Sor</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backBtn: { padding: 8 },
  backText: { fontSize: 24 },
  title: { fontSize: 20, fontWeight: 'bold' },
  bookmarkBtn: { padding: 8 },
  bookmarkIcon: { fontSize: 22 },
  heroCard: { borderRadius: 24, overflow: 'hidden', marginBottom: 32 },
  heroGradient: { padding: 32, alignItems: 'center' },
  avatarWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  avatarEmoji: { fontSize: 56 },
  heroTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  heroSub: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  stepIconText: { fontSize: 24 },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 16, fontWeight: '600' },
  stepSub: { fontSize: 14, marginTop: 4 },
  askBtn: { marginTop: 32, borderRadius: 28, overflow: 'hidden' },
  askBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 10,
  },
  askBtnIcon: { fontSize: 24 },
  askBtnText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});
