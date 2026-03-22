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

const CHAT_OPTIONS = [
  {
    id: '1',
    icon: '💝',
    title: 'Dostça Destek',
    sub: 'Sınav kaygısı veya yorgunluk... Yargılamak yok, çözüm var. Anlat, rahatla ve odaklan.',
    colors: ['#f472b6', '#ec4899'] as [string, string],
  },
  {
    id: '2',
    icon: '⚡',
    title: 'Motivasyon Köşesi',
    sub: 'Düşük pille çalışma! Seni anında masaya kilitleyecek güç konuşması için tıkla.',
    colors: ['#fb923c', '#f97316'] as [string, string],
  },
  {
    id: '3',
    icon: '📊',
    title: 'Deneme Analizi',
    sub: 'Hatalarını keşfet. Eksiklerini MR gibi tarayalım, netlerini artıralım.',
    colors: ['#fbbf24', '#f59e0b'] as [string, string],
  },
  {
    id: '4',
    icon: '🚀',
    title: 'Strateji Danışma',
    sub: 'Stratejik program ve kişiye özel yol haritası. Planla ve kazan!',
    colors: ['#60a5fa', '#3b82f6'] as [string, string],
  },
];

type Props = { navigation: any };

export default function ChatScreen({ navigation }: Props) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backText, { color: theme.accent }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Sohbet</Text>
      </View>

      <View style={[styles.introCard, { borderColor: theme.cardBorder }]}>
        <LinearGradient
          colors={['#e0f2fe', '#ccfbf1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.introGradient}
        >
          <View style={[styles.mascot, { backgroundColor: '#fff' }]}>
            <Text style={styles.mascotEmoji}>🐰</Text>
          </View>
          <Text style={[styles.introTitle, { color: theme.text }]}>
            Koçun Çalışma Tavşanı
          </Text>
          <Text style={[styles.introSub, { color: theme.textSecondary }]}>
            Motivasyon, strateji, analiz ve destek... Çalışma Tavşanı sınav yolculuğunda her alanda yanında!
          </Text>
        </LinearGradient>
      </View>

      <ScrollView style={styles.options} showsVerticalScrollIndicator={false}>
        {CHAT_OPTIONS.map((opt) => (
          <TouchableOpacity key={opt.id} style={styles.optionBtn}>
            <LinearGradient
              colors={opt.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.optionGradient}
            >
              <View style={styles.optionIconWrap}>
                <Text style={styles.optionIcon}>{opt.icon}</Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{opt.title}</Text>
                <Text style={styles.optionSub}>{opt.sub}</Text>
              </View>
              <Text style={styles.optionLock}>🔒</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={[styles.disclaimer, { borderColor: theme.cardBorder }]}>
        <Text style={styles.disclaimerIcon}>ℹ️</Text>
        <Text style={[styles.disclaimerText, { color: theme.textSecondary }]}>
          Referans amaçlıdır, tıbbi tedavi yerine geçmez
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backBtn: { padding: 8 },
  backText: { fontSize: 24 },
  title: { fontSize: 20, fontWeight: 'bold', flex: 1, textAlign: 'center' },
  introCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
  },
  introGradient: { padding: 24, alignItems: 'center' },
  mascot: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mascotEmoji: { fontSize: 48 },
  introTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  introSub: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
  options: { flex: 1, marginBottom: 20 },
  optionBtn: { marginBottom: 12, borderRadius: 16, overflow: 'hidden' },
  optionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  optionIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  optionIcon: { fontSize: 24 },
  optionContent: { flex: 1 },
  optionTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  optionSub: { fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  optionLock: { fontSize: 18 },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  disclaimerIcon: { fontSize: 18 },
  disclaimerText: { flex: 1, fontSize: 13 },
});
