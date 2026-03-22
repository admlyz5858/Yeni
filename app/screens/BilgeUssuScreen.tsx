import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { usePremium } from '../context/PremiumContext';
import ProModal from '../components/ProModal';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2 - 8;

const FEATURE_CARDS = [
  {
    id: 'mentor',
    tag: 'MENTÖR',
    tagColor: '#3b82f6',
    title: 'Bilge Baykuş',
    desc: 'Sınav stresini yöneten koçun.',
    icon: '🦉',
    nav: 'Chat',
    locked: false,
  },
  {
    id: 'donusturucu',
    icon: '✨',
    title: 'Dönüştürücü',
    desc: 'PDF veya görsel yükle, kart veya özet üret.',
    nav: 'Converter',
    locked: false,
  },
  {
    id: 'plan',
    icon: '📅',
    title: 'Haftalık Plan',
    desc: 'Senin verilerin ile sana özel',
    nav: 'Schedule',
    locked: true,
  },
  {
    id: 'soru',
    icon: '📷',
    title: 'Soru Çözücü',
    desc: 'Sorunu çek, anında çözümünü al.',
    nav: 'InstantSolution',
    locked: false,
  },
  {
    id: 'etut',
    icon: '📖',
    title: 'Etüt Odası',
    desc: 'Eksik konularına özel çalışma setleri üretir.',
    nav: 'StudyRoom',
    locked: true,
  },
  {
    id: 'zihin',
    icon: '🧠',
    title: 'Zihin Haritası',
    desc: 'Konuları görselleştir, daha iyi anla ve hatırla.',
    nav: 'MindMap',
    locked: false,
  },
];

const ICON_COLORS: Record<string, string> = {
  donusturucu: '#38bdf8',
  plan: '#22c55e',
  soru: '#f97316',
  etut: '#8b5cf6',
  zihin: '#6366f1',
};

type Props = { navigation: any };

export default function BilgeUssuScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { isPremium } = usePremium();
  const [proModal, setProModal] = useState(false);

  const handleCardPress = (card: (typeof FEATURE_CARDS)[0]) => {
    if (card.locked && !isPremium) {
      setProModal(true);
    } else {
      navigation.navigate(card.nav);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (navigation.getParent() as any)?.getParent()?.openDrawer?.()}
          style={styles.menuBtn}
        >
          <Text style={[styles.menuIcon, { color: theme.accent }]}>☰</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Bilge Üssü</Text>
        <TouchableOpacity style={styles.helpBtn}>
          <Text style={[styles.helpIcon, { color: theme.textSecondary }]}>?</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {FEATURE_CARDS.map((card) => (
            <TouchableOpacity
              key={card.id}
              style={[styles.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
              onPress={() => handleCardPress(card)}
              activeOpacity={0.8}
            >
              {card.locked && !isPremium && (
                <View style={styles.lockBadge}>
                  <Text style={styles.lockIcon}>🔒</Text>
                </View>
              )}
              {card.tag && (
                <View style={[styles.tag, { backgroundColor: (card as any).tagColor + '30' }]}>
                  <Text style={[styles.tagText, { color: (card as any).tagColor }]}>{card.tag}</Text>
                </View>
              )}
              <View
                style={[
                  styles.iconWrap,
                  { backgroundColor: ICON_COLORS[card.id] || theme.accentLight },
                ]}
              >
                <Text style={styles.cardIcon}>{card.icon}</Text>
              </View>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{card.title}</Text>
              <Text style={[styles.cardDesc, { color: theme.textSecondary }]}>{card.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.premiumBanner}
          onPress={() => setProModal(true)}
        >
          <View style={styles.premiumStar}>
            <Text style={styles.starIcon}>⭐</Text>
          </View>
          <View style={styles.premiumContent}>
            <Text style={styles.premiumTitle}>Bilge Baykuş Pro'ya Yükselt</Text>
            <Text style={styles.premiumDesc}>Tüm araçların kilidini aç, rakiplerini geride bırak.</Text>
          </View>
          <Text style={styles.premiumArrow}>›</Text>
        </TouchableOpacity>
      </ScrollView>

      <ProModal
        visible={proModal}
        onStart={() => {
          setProModal(false);
          navigation.navigate('Premium');
        }}
        onLater={() => setProModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 56 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuBtn: { padding: 8 },
  menuIcon: { fontSize: 22 },
  title: { flex: 1, fontSize: 20, fontWeight: 'bold', textAlign: 'center' },
  helpBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpIcon: { fontSize: 18, fontWeight: 'bold' },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 100 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    minHeight: 160,
  },
  lockBadge: { position: 'absolute', top: 12, right: 12, zIndex: 1 },
  lockIcon: { fontSize: 16 },
  tag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  tagText: { fontSize: 11, fontWeight: '700' },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardIcon: { fontSize: 28 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  cardDesc: { fontSize: 13, lineHeight: 18 },
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  premiumStar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starIcon: { fontSize: 24 },
  premiumContent: { flex: 1 },
  premiumTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  premiumDesc: { fontSize: 13, color: '#94a3b8' },
  premiumArrow: { fontSize: 24, color: '#94a3b8' },
});
