import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.42;
const MAIN_GAME_WIDTH = width * 0.35;
const CARD_GAP = 12;

const MAIN_GAMES = [
  { id: 'yazim', name: 'Yazım Yanlışları', icon: '✏️', color: '#2ecc71', footer: 'Oyna →' },
  { id: 'yazar', name: 'Yazar-Eser', icon: '📖', color: '#9b59b6', footer: 'Oyna →' },
  { id: 'islem', name: 'Dört İşlem', icon: '➕', color: '#3498db', footer: 'Oyna →' },
];

const CATEGORIES = [
  { id: 'turkce', name: 'Türkçe (Genel Yetenek)', icon: '📖', color: '#e74c3c' },
  { id: 'matematik', name: 'Matematik (Genel Yetenek)', icon: '∑', color: '#9b59b6' },
  { id: 'tarih', name: 'Tarih (Genel Kültür)', icon: '📜', color: '#3498db' },
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
};

type Props = { navigation: any };

function InviteModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [inviteCount] = useState(0);
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleRow}>
              <Text style={styles.modalGift}>🎁</Text>
              <View>
                <Text style={styles.modalTitle}>Arkadaşını Davet Et</Text>
                <Text style={styles.modalSub}>3 davet → Oyunlara sınırsız erişim</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.inviteStatus}>
            <Text style={styles.inviteStatusLabel}>Davet Durumu</Text>
            <View style={styles.inviteBadge}>
              <Text style={styles.inviteBadgeText}>{inviteCount} / 3</Text>
            </View>
          </View>
          <View style={styles.progressRow}>
            <View style={styles.progressLine} />
            <View style={styles.progressDots}>
              {[1, 2, 3].map((i) => (
                <View key={i} style={styles.progressDot}>
                  <Text style={styles.dotIcon}>👤+</Text>
                  <Text style={styles.dotLabel}>{i}. Davet</Text>
                </View>
              ))}
            </View>
          </View>
          <TouchableOpacity style={styles.inviteBtn}>
            <Text style={styles.inviteBtnIcon}>✨</Text>
            <Text style={styles.inviteBtnText}>Davet Kodunu Oluştur</Text>
          </TouchableOpacity>
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <Text style={styles.infoText}>
              Davet ettiğin kişi oyunlara 7 gün ücretsiz erişim kazanır!
            </Text>
          </View>
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>ya da</Text>
            <View style={styles.orLine} />
          </View>
          <TouchableOpacity style={styles.proBtn} onPress={onClose}>
            <LinearGradient
              colors={['#f97316', '#a855f7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.proBtnGradient}
            >
              <Text style={styles.proBtnText}>PRO'ya Geç ›</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

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
  const [inviteModal, setInviteModal] = useState(false);

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
        <Text style={styles.title}>Taktik Oyunları</Text>
        <TouchableOpacity style={styles.giftBtn} onPress={() => setInviteModal(true)}>
          <Text style={styles.giftIcon}>🎁</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Card - Öğrenmeyi oyuna dök */}
      <View style={styles.heroCard}>
        <View style={styles.heroAccent} />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Öğrenmeyi oyuna dök</Text>
          <Text style={styles.heroSub}>Sınav konularını mini oyunlarla pekiştir</Text>
        </View>
      </View>

      {/* Ana Oyunlar */}
      <Text style={styles.sectionLabel}>✦ Ana Oyunlar</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.mainGamesRow}
      >
        {MAIN_GAMES.map((g) => (
          <TouchableOpacity
            key={g.id}
            style={[styles.mainGameCard, { backgroundColor: g.color }]}
            onPress={() => Alert.alert('Yakında', `${g.name} oyunu yakında eklenecek.`)}
          >
            <Text style={styles.mainGameIcon}>{g.icon}</Text>
            <Text style={styles.mainGameTitle}>{g.name}</Text>
            <Text style={styles.mainGameFooter}>{g.footer}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* KPSS LİSANS OYUNLARI divider */}
      <View style={styles.dividerWrap}>
        <View style={styles.goldLine} />
        <Text style={styles.dividerText}>ÇALIŞMA OYUNLARI</Text>
        <View style={styles.goldLine} />
      </View>

      {/* Karma Sınav */}
      <TouchableOpacity
        style={styles.karmaCard}
        onPress={() => Alert.alert('Yakında', 'Karma Sınav özelliği yakında eklenecek.')}
      >
        <View style={styles.karmaIcon}>
          <Text style={styles.karmaIconText}>⊞</Text>
        </View>
        <View style={styles.karmaContent}>
          <Text style={styles.karmaTitle}>Karma Sınav</Text>
          <Text style={styles.karmaSub}>Tüm derslerden karma sorularla kendini dene.</Text>
        </View>
        <View style={styles.karmaLock}>
          <Text>🔒</Text>
        </View>
      </TouchableOpacity>

      {/* Subject sections */}
      {CATEGORIES.map((cat) => (
        <View key={cat.id} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.catIcon, { backgroundColor: cat.color }]}>
              <Text style={styles.catIconText}>{cat.icon}</Text>
            </View>
            <Text style={[styles.catName, { color: cat.color }]}>{cat.name}</Text>
            <TouchableOpacity
              style={styles.karmaBtn}
              onPress={() => Alert.alert('Yakında', 'Karma sınav özelliği yakında eklenecek.')}
            >
              <Text style={styles.karmaBtnLock}>🔒</Text>
              <Text style={styles.karmaBtnText}>Karma</Text>
              <Text style={styles.karmaBtnArrow}>›</Text>
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
                onPress={() => Alert.alert('Yakında', `${t.title} oyunu yakında eklenecek.`)}
              />
            ))}
          </ScrollView>
        </View>
      ))}

      <InviteModal visible={inviteModal} onClose={() => setInviteModal(false)} />
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
    marginBottom: 20,
  },
  backBtn: {},
  backText: { fontSize: 16, color: '#2563eb', fontWeight: '500' },
  title: { fontSize: 22, fontWeight: 'bold', color: '#0f172a' },
  giftBtn: { padding: 8 },
  giftIcon: { fontSize: 24 },
  heroCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    marginBottom: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  heroAccent: {
    width: 6,
    backgroundColor: '#3b82f6',
  },
  heroContent: { flex: 1, padding: 20 },
  heroTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  heroSub: { fontSize: 14, color: '#64748b', marginTop: 4 },
  sectionLabel: { fontSize: 16, fontWeight: '600', color: '#0f172a', marginBottom: 12 },
  mainGamesRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  mainGameCard: {
    width: MAIN_GAME_WIDTH,
    padding: 20,
    borderRadius: 20,
    justifyContent: 'space-between',
  },
  mainGameIcon: { fontSize: 36, color: '#fff' },
  mainGameTitle: { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  mainGameFooter: { fontSize: 13, color: 'rgba(255,255,255,0.9)' },
  dividerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  goldLine: { flex: 1, height: 1, backgroundColor: '#f59e0b' },
  dividerText: { fontSize: 12, fontWeight: '700', color: '#f59e0b', letterSpacing: 1 },
  karmaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  karmaIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  karmaIconText: { fontSize: 24, color: '#64748b' },
  karmaContent: { flex: 1 },
  karmaTitle: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  karmaSub: { fontSize: 14, color: '#64748b', marginTop: 4 },
  karmaLock: { padding: 8 },
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
  karmaBtnLock: { fontSize: 12 },
  karmaBtnText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  karmaBtnArrow: { fontSize: 16, color: '#64748b' },
  cardRow: { flexDirection: 'row', gap: CARD_GAP },
  topicCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
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
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  modalGift: { fontSize: 40 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  modalSub: { fontSize: 14, color: '#64748b', marginTop: 4 },
  modalClose: { padding: 8 },
  modalCloseText: { fontSize: 18, color: '#64748b' },
  inviteStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inviteStatusLabel: { fontSize: 15, fontWeight: '600', color: '#0f172a' },
  inviteBadge: { backgroundColor: '#a855f7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  inviteBadgeText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  progressRow: { marginBottom: 24 },
  progressLine: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    marginBottom: 16,
  },
  progressDots: { flexDirection: 'row', justifyContent: 'space-between' },
  progressDot: { alignItems: 'center' },
  dotIcon: { fontSize: 20, marginBottom: 4 },
  dotLabel: { fontSize: 12, color: '#64748b' },
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#a855f7',
    padding: 18,
    borderRadius: 16,
    gap: 8,
    marginBottom: 16,
  },
  inviteBtnIcon: { fontSize: 18 },
  inviteBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#3b82f6',
    gap: 12,
    marginBottom: 24,
  },
  infoIcon: { fontSize: 20 },
  infoText: { flex: 1, fontSize: 14, color: '#1e40af' },
  orRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12 },
  orLine: { flex: 1, height: 1, backgroundColor: '#e2e8f0' },
  orText: { fontSize: 14, color: '#64748b' },
  proBtn: { overflow: 'hidden', borderRadius: 16 },
  proBtnGradient: { padding: 18, alignItems: 'center' },
  proBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
