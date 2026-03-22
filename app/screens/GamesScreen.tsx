import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.42;
const CARD_GAP = 12;

const CATEGORIES = [
  { id: 'turkce', name: 'Türkçe (Genel Yetenek)', icon: '📖', color: '#e74c3c' },
  { id: 'matematik', name: 'Matematik (Genel Yetenek)', icon: '∑', color: '#9b59b6' },
  { id: 'tarih', name: 'Tarih (Genel Kültür)', icon: '📜', color: '#3498db' },
  { id: 'cografya', name: 'Coğrafya (Genel Kültür)', icon: '🌍', color: '#2ecc71' },
  { id: 'vatandaslik', name: 'Vatandaşlık (Genel Kültür)', icon: '⚖️', color: '#f39c12' },
  { id: 'guncel', name: 'Güncel Bilgiler', icon: '📰', color: '#e67e22' },
];

const SAMPLE_TOPICS: Record<string, { title: string; locked?: boolean }[]> = {
  turkce: [
    { title: 'Sözcükte Anlam' },
    { title: 'Cümlede Anlam' },
    { title: 'Paragrafta Anlam', locked: true },
  ],
  matematik: [
    { title: 'Temel Kavramlar ve Sayılar' },
    { title: 'Bölme-Bölünebilme, Asal Çarpanlar' },
    { title: 'EBOB-EKOK', locked: true },
  ],
  tarih: [
    { title: 'İslamiyet Öncesi Türk Tarihi' },
    { title: 'İlk Müslüman Türk Devletleri' },
    { title: 'Osmanlı Devleti Siyasi Tarihi', locked: true },
  ],
  cografya: [
    { title: "Türkiye'nin Coğrafi Konumu" },
    { title: "Türkiye'nin Yer Şekilleri" },
    { title: "Türkiye'nin Su Varlığı", locked: true },
  ],
  vatandaslik: [
    { title: 'Temel Hukuk Kavramları' },
    { title: 'Devlet Biçimleri ve Hükümet Sistemi' },
    { title: 'Anayasa Hukukuna Giriş', locked: true },
  ],
  guncel: [
    { title: 'Güncel Olaylar' },
    { title: 'Haberler' },
    { title: 'Önemli Gündem', locked: true },
  ],
};

type Props = { navigation: any };

function CategoryCard({
  title,
  locked,
  color,
  onPress,
}: {
  title: string;
  locked?: boolean;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.topicCard, { borderColor: color }, locked && styles.topicCardLocked]}
      onPress={onPress}
      disabled={locked}
    >
      <View style={[styles.topicIconBg, { backgroundColor: color + '20' }]}>
        <Text style={styles.topicIcon}>📚</Text>
      </View>
      <Text style={[styles.topicTitle, locked && styles.topicTitleLocked]} numberOfLines={2}>
        {title}
      </Text>
      {locked && (
        <View style={styles.lockBadge}>
          <Text style={styles.lockIcon}>🔒</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function GamesScreen({ navigation }: Props) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => (navigation.getParent() as any)?.getParent()?.openDrawer?.()}
        >
          <Text style={styles.backText}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Odak Oyunları</Text>
        <TouchableOpacity style={styles.giftBtn}>
          <Text style={styles.giftIcon}>🎁</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.subtitleWrap}>
        <View style={styles.goldLine} />
        <Text style={styles.subtitle}>ÇALIŞMA OYUNLARI</Text>
        <View style={styles.goldLine} />
      </View>

      <TouchableOpacity style={styles.featuredCard}>
        <View style={styles.featuredIcon}>
          <Text style={styles.featuredIconText}>⊞</Text>
        </View>
        <View style={styles.featuredContent}>
          <Text style={styles.featuredTitle}>Karma Sınav</Text>
          <Text style={styles.featuredSub}>
            Tüm derslerden karma sorularla kendini dene.
          </Text>
        </View>
        <View style={styles.featuredLock}>
          <Text>🔒</Text>
        </View>
      </TouchableOpacity>

      {CATEGORIES.map((cat) => (
        <View key={cat.id} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.catIcon, { backgroundColor: cat.color }]}>
              <Text style={styles.catIconText}>{cat.icon}</Text>
            </View>
            <Text style={[styles.catName, { color: cat.color }]}>{cat.name}</Text>
            <TouchableOpacity style={styles.karmaBtn}>
              <Text style={styles.karmaLock}>🔒</Text>
              <Text style={styles.karmaText}>Karma</Text>
              <Text style={styles.karmaArrow}>›</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardRow}
          >
            {(SAMPLE_TOPICS[cat.id] || []).map((t, i) => (
              <CategoryCard
                key={i}
                title={t.title}
                locked={t.locked}
                color={cat.color}
                onPress={() => {}}
              />
            ))}
          </ScrollView>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  backBtn: {},
  backText: { fontSize: 16, color: '#2563eb', fontWeight: '500' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
  giftBtn: { padding: 8 },
  giftIcon: { fontSize: 24 },
  subtitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  goldLine: { flex: 1, height: 1, backgroundColor: '#f59e0b' },
  subtitle: { fontSize: 12, fontWeight: '700', color: '#f59e0b', letterSpacing: 1 },
  featuredCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  featuredIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  featuredIconText: { fontSize: 24, color: '#64748b' },
  featuredContent: { flex: 1 },
  featuredTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  featuredSub: { fontSize: 14, color: '#64748b', marginTop: 4 },
  featuredLock: { padding: 8 },
  section: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  catIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  catIconText: { fontSize: 18, color: '#fff' },
  catName: { flex: 1, fontSize: 16, fontWeight: '600' },
  karmaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  karmaLock: { fontSize: 12 },
  karmaText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  karmaArrow: { fontSize: 16, color: '#64748b' },
  cardRow: { flexDirection: 'row', gap: CARD_GAP },
  topicCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
  },
  topicCardLocked: { opacity: 0.6 },
  topicIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  topicIcon: { fontSize: 20 },
  topicTitle: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  topicTitleLocked: { color: '#94a3b8' },
  lockBadge: { position: 'absolute', top: 12, right: 12 },
  lockIcon: { fontSize: 14 },
});
