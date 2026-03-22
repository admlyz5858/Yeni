import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { usePlan } from '../context/PlanContext';
import { useGamification } from '../context/GamificationContext';
import { useFlashcards } from '../context/FlashcardContext';
import { useSubjects } from '../context/SubjectsContext';
import { useGame } from '../context/GameContext';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import { usePremium } from '../context/PremiumContext';
import LevelUpModal from '../components/LevelUpModal';

const { width } = Dimensions.get('window');
const CARD_GAP = 10;
const GRID_COLS = 4;
const CIRCLE_SIZE = (width - 40 - CARD_GAP * (GRID_COLS - 1)) / GRID_COLS - 4;

const BG_DARK = '#1e293b';
const CARD_DARK = '#334155';
const CARD_BORDER = '#475569';
const TEXT_WHITE = '#f8fafc';
const TEXT_MUTED = '#94a3b8';
const ACCENT = '#dc2626';

const QUOTES = [
  'Başarı, küçük çabaların günlük tekrarıdır.',
  'Bugün yapacağın çalışma, yarının başarının temelidir.',
  'Odaklanmak, sıradanı olağanüstü yapar.',
];
const TIPS = [
  'Her gün 25 dakika odaklanma ile başlayın.',
  'Konuları küçük parçalara bölün.',
  'Düzenli tekrar, kalıcı öğrenmenin anahtarıdır.',
];

type Props = { navigation: any };

function getStreak(studyLog: Record<string, number>): number {
  const today = new Date().toISOString().slice(0, 10);
  let streak = 0;
  const d = new Date(today);
  for (let i = 0; i < 365; i++) {
    const key = d.toISOString().slice(0, 10);
    if ((studyLog[key] || 0) >= 0.5) streak++;
    else if (key !== today) break;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export default function HomeScreen({ navigation }: Props) {
  const {
    examDate,
    completedTopics,
    studyLog,
    dailyGoalHours,
    todayPomodoro,
    todayTopicCompletions,
    isLoading,
  } = usePlan();
  const { level, xp, checkAchievements, updateDailyChallengeFromStats, dailyLoginBonus } =
    useGamification();
  const { getDueCards } = useFlashcards();
  const { subjects } = useSubjects();
  const { checkLevelUp, levelUpModal, setLevelUpModal, weeklyQuests, weeklyCompleted } = useGame();
  const { customQuotes } = useSettings();
  const { user } = useAuth();
  const { isPremium } = usePremium();

  const [tab, setTab] = useState<'quote' | 'tip' | 'motivation'>('quote');
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'İyi Sabahlar';
    if (h < 18) return 'İyi Öğlenler';
    return 'İyi Akşamlar';
  })();
  const completedQuests = Object.values(weeklyCompleted || {}).filter(Boolean).length;
  const totalQuests = weeklyQuests?.length ?? 4;
  const totalTopics = subjects.reduce((acc, s) => acc + s.topics.length, 0);
  const doneCount = Object.values(completedTopics).reduce(
    (acc, subj) => acc + Object.values(subj).filter(Boolean).length,
    0
  );
  const streak = getStreak(studyLog);
  const today = new Date().toISOString().slice(0, 10);
  const todayHours = studyLog[today] || 0;
  const weekHours = (() => {
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
    let sum = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      sum += studyLog[d.toISOString().slice(0, 10)] || 0;
    }
    return sum;
  })();
  const remainGoal = Math.max(0, dailyGoalHours - todayHours);
  const remainMins = Math.round(remainGoal * 60);

  useEffect(() => {
    checkAchievements({
      totalStudyHours: Object.values(studyLog).reduce((a, b) => a + b, 0),
      streak,
      topicsDone: doneCount,
      totalTopics,
      pomodoroCompleted: 0,
      hasNotes: false,
      noteCount: 0,
      flashcardCount: getDueCards().length,
      studyLog,
    });
  }, [doneCount, streak, totalTopics]);

  useEffect(() => {
    checkLevelUp(level);
  }, [level]);

  useEffect(() => {
    updateDailyChallengeFromStats({
      todayHours,
      todayTopics: todayTopicCompletions,
      todayPomodoro,
      todayFlashcards: 0,
      todayNotes: 0,
      before8am: false,
    });
  }, [todayHours, todayTopicCompletions, todayPomodoro]);

  const daySeed = new Date().getDate() % 3;
  const defaultQuotes = QUOTES;
  const allQuotes = customQuotes.length > 0 ? customQuotes : defaultQuotes;
  const quote = allQuotes[daySeed % allQuotes.length];
  const tip = TIPS[daySeed];
  const activeIndex = 4; // Bugün kartı vurgulu

  const gridItems = [
    { icon: '📋', label: 'Plan', nav: 'Plan' },
    { icon: '🍅', label: 'Pomodoro', nav: 'Pomodoro' },
    { icon: '📇', label: 'Kartlar', nav: 'Flashcards' },
    { icon: '🏆', label: 'Sıralama', nav: 'LeaderboardTab' },
    { icon: '📚', label: 'Dersler', nav: 'Subjects' },
    { icon: '📌', label: 'Günlük', nav: 'DailyActivity' },
    { icon: '🌟', label: 'Rozetler', nav: 'Achievements' },
    { icon: '⚙️', label: 'Ayarlar', nav: 'Settings' },
  ];
  const bilgeFeatures = [
    { icon: '📷', label: 'Soru Çözücü', nav: 'InstantSolution' },
    { icon: '📖', label: 'Etüt Odası', nav: 'StudyRoom' },
    { icon: '🔄', label: 'Dönüştürücü', nav: 'Converter' },
    { icon: '🧠', label: 'Zihin Haritası', nav: 'MindMap' },
    { icon: '📊', label: 'Akıllı Analiz', nav: 'SmartAnalysis' },
  ];

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🦉</Text>
            </View>
            <Text style={styles.appName}>Bilge Baykuş</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => (navigation.getParent() as any)?.getParent()?.openDrawer?.()}
            >
              <Text style={styles.iconBtnText}>☰</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('DailyActivity')} style={styles.iconBtn}>
              <Text style={styles.iconBtnText}>🔔</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Greeting + License */}
        <View style={styles.greetingRow}>
          <View style={styles.greetingLeft}>
            <Text style={styles.greetingText}>
              {greeting} {user?.name?.split(' ')[0] || 'Kullanıcı'} 👋
            </Text>
          </View>
          <View style={[styles.licenseBadge, isPremium ? styles.licensePro : styles.licenseFree]}>
            <Text style={styles.licenseText}>{isPremium ? 'Lisans 167 gün' : 'Ücretsiz'}</Text>
          </View>
        </View>

        {/* Rütbe + Görevler */}
        <View style={styles.rankRow}>
          <View style={[styles.rankCard, { backgroundColor: CARD_DARK, borderColor: CARD_BORDER }]}>
            <Text style={styles.rankLabel}>Rütbe</Text>
            <Text style={styles.rankVal}>Acemi Kâşif</Text>
            <Text style={styles.rankXp}>{xp} TP</Text>
            <View style={styles.rankBarBg}>
              <View style={[styles.rankBarFill, { width: `${Math.min(100, (xp / 500) * 100)}%` }]} />
            </View>
          </View>
          <View style={[styles.rankCard, { backgroundColor: CARD_DARK, borderColor: CARD_BORDER }]}>
            <Text style={styles.rankLabel}>Görevler</Text>
            <Text style={styles.rankVal}>{completedQuests}/{totalQuests}</Text>
            <Text style={styles.rankXp}>⏱ {Math.round(remainMins / 60)} sa</Text>
          </View>
        </View>

        {/* Genel Bakış */}
        <View style={[styles.genelBakis, { backgroundColor: CARD_DARK, borderColor: CARD_BORDER }]}>
          <View style={styles.genelItem}>
            <Text style={styles.genelNum}>0</Text>
            <Text style={styles.genelLabel}>DENEME</Text>
          </View>
          <View style={styles.genelItem}>
            <Text style={styles.genelNum}>0</Text>
            <Text style={styles.genelLabel}>EN İYİ</Text>
          </View>
          <View style={styles.genelItem}>
            <Text style={styles.genelNum}>0</Text>
            <Text style={styles.genelLabel}>SON NET</Text>
          </View>
        </View>

        {/* Hızlı Aksiyonlar */}
        <Text style={styles.sectionTitle}>🚀 Hızlı Aksiyonlar</Text>
        <View style={styles.hizliRow}>
          <TouchableOpacity
            style={[styles.hizliBtn, { backgroundColor: '#3b82f6' }]}
            onPress={() => navigation.navigate('InstantSolution')}
          >
            <Text style={styles.hizliIcon}>📷</Text>
            <Text style={styles.hizliText}>Soru Çözdür</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.hizliBtn, { backgroundColor: '#38bdf8' }]}
            onPress={() => navigation.navigate('Converter')}
          >
            <Text style={styles.hizliIcon}>✨</Text>
            <Text style={styles.hizliText}>Dönüştür</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.hizliBtn, { backgroundColor: '#8b5cf6' }]}
            onPress={() => navigation.navigate('SmartAnalysis')}
          >
            <Text style={styles.hizliIcon}>📊</Text>
            <Text style={styles.hizliText}>Deneme Ekle</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.hizliBtn, { backgroundColor: '#14b8a6' }]}
            onPress={() => navigation.navigate('Goals')}
          >
            <Text style={styles.hizliIcon}>📋</Text>
            <Text style={styles.hizliText}>Test Ekle</Text>
          </TouchableOpacity>
        </View>

        {/* Bilge Baykuş Card */}
        <TouchableOpacity
          style={[styles.bilgeCard, { backgroundColor: CARD_DARK, borderColor: CARD_BORDER }]}
          onPress={() => navigation.navigate('Chat')}
        >
          <View style={styles.bilgeCardLeft}>
            <View style={styles.bilgeMascot}>
              <Text style={styles.bilgeMascotIcon}>🦉</Text>
            </View>
            <View>
              <Text style={styles.bilgeCardTitle}>Bilge Baykuş</Text>
              <View style={styles.bilgeActive}>
                <Text style={styles.bilgeActiveText}>AKTİF</Text>
              </View>
              <Text style={styles.bilgeCardDesc}>Son denemeni birlikte inceleyelim.</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Bilge Üssü Card */}
        <TouchableOpacity
          style={[styles.ussuCard, { backgroundColor: CARD_DARK, borderColor: CARD_BORDER }]}
          onPress={() => navigation.navigate('BilgeUssu')}
        >
          <Text style={styles.ussuIcon}>🦉</Text>
          <View style={styles.ussuContent}>
            <Text style={styles.ussuTitle}>Bilge Üssü</Text>
            <Text style={styles.ussuDesc}>Tüm araçlara tek yerden eriş</Text>
          </View>
          <Text style={styles.ussuArrow}>›</Text>
        </TouchableOpacity>

        {/* Top Featured Card */}
        <TouchableOpacity
          style={styles.featuredCard}
          onPress={() => navigation.navigate('Pomodoro')}
        >
          <View style={styles.featuredLeft}>
            <Text style={styles.featuredTitle}>Odaklanma</Text>
            <Text style={styles.featuredSub}>Pomodoro Zamanlayıcı</Text>
          </View>
          <View style={styles.playCircle}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
        </TouchableOpacity>

        {/* Date */}
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('tr-TR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
        </View>

        {/* Countdown + Location */}
        <View style={styles.countdownSection}>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <View>
              <Text style={styles.locationCity}>BUGÜNKÜ HEDEF</Text>
              <Text style={styles.locationAddr}>
                {todayHours.toFixed(1)} / {dailyGoalHours} saat tamamlandı
              </Text>
            </View>
          </View>
          <View style={styles.countdownPill}>
            <Text style={styles.countdownPillText}>Hedefe kalan süre</Text>
          </View>
          <View style={styles.countdownDisplay}>
            <View style={styles.countdownBox}>
              <Text style={styles.countdownNum}>
                {String(Math.floor(remainMins / 60)).padStart(2, '0')}
              </Text>
            </View>
            <Text style={styles.countdownSep}>:</Text>
            <View style={styles.countdownBox}>
              <Text style={styles.countdownNum}>
                {String(remainMins % 60).padStart(2, '0')}
              </Text>
            </View>
          </View>
        </View>

        {/* Horizontal Stats Row (like prayer times) */}
        <View style={styles.statsRow}>
          {[
            { label: 'Hedef', val: `${dailyGoalHours}h` },
            { label: 'Seri', val: `${streak}` },
            { label: 'XP', val: `${xp}` },
            { label: 'Seviye', val: `${level}` },
            { label: 'Bugün', val: `${todayHours.toFixed(1)}` },
            { label: 'Hafta', val: `${weekHours.toFixed(1)}` },
          ].map((item, i) => (
            <View
              key={item.label}
              style={[
                styles.statCard,
                i === activeIndex && styles.statCardActive,
              ]}
            >
              <Text style={[styles.statLabel, i === activeIndex && styles.statLabelActive]}>
                {item.label}
              </Text>
              <Text style={[styles.statVal, i === activeIndex && styles.statValActive]}>
                {item.val}
              </Text>
              {i === activeIndex && <View style={styles.statDot} />}
            </View>
          ))}
        </View>

        {/* 2x4 Grid */}
        <View style={styles.grid}>
          {gridItems.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.gridItem}
              onPress={() => navigation.navigate(item.nav)}
            >
              <View style={styles.circleIcon}>
                <Text style={styles.circleEmoji}>{item.icon}</Text>
              </View>
              <Text style={styles.circleLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bilge Baykuş Özellikleri */}
        <View style={styles.bilgeSection}>
          <Text style={styles.bilgeTitle}>🦉 Bilge Baykuş ile</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bilgeRow}
          >
            {bilgeFeatures.map((f) => (
              <TouchableOpacity
                key={f.nav}
                style={styles.bilgePill}
                onPress={() => navigation.navigate(f.nav)}
              >
                <Text style={styles.bilgePillIcon}>{f.icon}</Text>
                <Text style={styles.bilgePillText}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
        >
          <TouchableOpacity
            style={styles.pill}
            onPress={() => navigation.navigate('Pomodoro')}
          >
            <Text style={styles.pillIcon}>🎯</Text>
            <Text style={styles.pillText}>Odaklanmaya başla</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pill}
            onPress={() => navigation.navigate('StudyRoom')}
          >
            <Text style={styles.pillIcon}>📖</Text>
            <Text style={styles.pillText}>Etüt Odası</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pill}
            onPress={() => navigation.navigate('DailyActivity')}
          >
            <Text style={styles.pillIcon}>📌</Text>
            <Text style={styles.pillText}>Haftalık görevler</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Bottom Tabbed Card */}
        <View style={styles.bottomCard}>
          <View style={styles.tabs}>
            {(['quote', 'tip', 'motivation'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tab, tab === t && styles.tabActive]}
                onPress={() => setTab(t)}
              >
                <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
                  {t === 'quote' ? 'Günün Sözü' : t === 'tip' ? 'İpucu' : 'Motivasyon'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.tabContent}>
            {tab === 'quote' && <Text style={styles.contentText}>"{quote}"</Text>}
            {tab === 'tip' && <Text style={styles.contentText}>💡 {tip}</Text>}
            {tab === 'motivation' && (
              <Text style={styles.contentText}>
                {remainGoal > 0
                  ? `Bugün ${remainGoal.toFixed(1)} saat daha çalışarak hedefini tamamla! 💪`
                  : 'Bugünkü hedefe ulaştın! Tebrikler! 🎉'}
              </Text>
            )}
          </View>
        </View>

        {dailyLoginBonus > 0 && (
          <TouchableOpacity
            style={styles.loginBonusBtn}
            onPress={() => navigation.navigate('DailyActivity')}
          >
            <Text style={styles.loginBonusText}>🎁 +{dailyLoginBonus} XP Giriş hediyesi</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, styles.fabGlow]}
        onPress={() => navigation.navigate('Pomodoro')}
      >
        <Text style={styles.fabIcon}>🦉</Text>
        <Text style={styles.fabText}>Odaklan</Text>
      </TouchableOpacity>

      <LevelUpModal
        visible={levelUpModal}
        level={level}
        onClose={() => setLevelUpModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_DARK },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: TEXT_MUTED },
  scrollContent: { padding: 20, paddingBottom: 100 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: { fontSize: 24 },
  appName: { fontSize: 22, fontWeight: '600', color: TEXT_WHITE },
  headerIcons: { flexDirection: 'row', gap: 12 },
  iconBtn: { padding: 8 },
  iconBtnText: { fontSize: 22 },
  greetingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  greetingLeft: { flex: 1 },
  greetingText: { fontSize: 18, fontWeight: '600', color: TEXT_WHITE },
  licenseBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  licensePro: { backgroundColor: '#22c55e' },
  licenseFree: { backgroundColor: CARD_BORDER },
  licenseText: { fontSize: 12, fontWeight: '700', color: TEXT_WHITE },
  rankRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  rankCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  rankLabel: { fontSize: 12, color: TEXT_MUTED, marginBottom: 4 },
  rankVal: { fontSize: 16, fontWeight: 'bold', color: TEXT_WHITE },
  rankXp: { fontSize: 12, color: TEXT_MUTED, marginTop: 4 },
  rankBarBg: { height: 4, backgroundColor: CARD_BORDER, borderRadius: 2, marginTop: 8, overflow: 'hidden' },
  rankBarFill: { height: '100%', backgroundColor: '#22c55e', borderRadius: 2 },
  genelBakis: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    justifyContent: 'space-around',
  },
  genelItem: { alignItems: 'center' },
  genelNum: { fontSize: 24, fontWeight: 'bold', color: TEXT_WHITE },
  genelLabel: { fontSize: 11, color: TEXT_MUTED, marginTop: 4 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: TEXT_MUTED, marginBottom: 12 },
  hizliRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  hizliBtn: {
    width: (width - 40 - 30) / 4,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
  },
  hizliIcon: { fontSize: 24, marginBottom: 6 },
  hizliText: { fontSize: 11, color: '#fff', fontWeight: '600', textAlign: 'center' },
  bilgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
  },
  bilgeCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  bilgeMascot: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bilgeMascotIcon: { fontSize: 32 },
  bilgeCardTitle: { fontSize: 18, fontWeight: 'bold', color: TEXT_WHITE },
  bilgeActive: { alignSelf: 'flex-start', backgroundColor: '#22c55e', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, marginTop: 4 },
  bilgeActiveText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  bilgeCardDesc: { fontSize: 14, color: TEXT_MUTED, marginTop: 6 },
  ussuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    backgroundColor: CARD_DARK,
  },
  ussuIcon: { fontSize: 32, marginRight: 14 },
  ussuContent: { flex: 1 },
  ussuTitle: { fontSize: 16, fontWeight: 'bold', color: TEXT_WHITE },
  ussuDesc: { fontSize: 13, color: TEXT_MUTED, marginTop: 2 },
  ussuArrow: { fontSize: 24, color: TEXT_MUTED },
  featuredCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CARD_DARK,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  featuredLeft: {},
  featuredTitle: { fontSize: 18, fontWeight: 'bold', color: TEXT_WHITE },
  featuredSub: { fontSize: 14, color: TEXT_MUTED },
  playCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { fontSize: 24, color: '#fff' },
  dateRow: { marginBottom: 16 },
  dateText: { fontSize: 14, color: TEXT_MUTED },
  countdownSection: {
    backgroundColor: CARD_DARK,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  locationIcon: { fontSize: 20 },
  locationCity: { fontSize: 14, fontWeight: 'bold', color: '#22c55e' },
  locationAddr: { fontSize: 12, color: TEXT_MUTED },
  countdownPill: {
    alignSelf: 'flex-start',
    backgroundColor: CARD_BORDER,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  countdownPillText: { fontSize: 12, color: TEXT_WHITE },
  countdownDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  countdownBox: {
    backgroundColor: '#0f172a',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  countdownNum: { fontSize: 28, fontWeight: 'bold', color: TEXT_WHITE, fontVariant: ['tabular-nums'] },
  countdownSep: { fontSize: 24, color: TEXT_WHITE },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: CARD_DARK,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: CARD_BORDER,
  },
  statCardActive: { borderColor: '#fff', borderWidth: 2 },
  statLabel: { fontSize: 11, color: TEXT_MUTED, marginBottom: 4 },
  statLabelActive: { color: '#fff' },
  statVal: { fontSize: 14, fontWeight: 'bold', color: TEXT_WHITE },
  statValActive: { color: '#fff' },
  statDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#fff',
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    marginBottom: 24,
  },
  gridItem: {
    width: CIRCLE_SIZE + 8,
    alignItems: 'center',
  },
  circleIcon: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: CARD_DARK,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  circleEmoji: { fontSize: CIRCLE_SIZE * 0.35 },
  circleLabel: { fontSize: 12, color: TEXT_WHITE, textAlign: 'center' },
  bilgeSection: { marginBottom: 20 },
  bilgeTitle: { fontSize: 14, fontWeight: '600', color: TEXT_MUTED, marginBottom: 12 },
  bilgeRow: { flexDirection: 'row', gap: 10 },
  bilgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_DARK,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    gap: 6,
  },
  bilgePillIcon: { fontSize: 16 },
  bilgePillText: { fontSize: 13, color: TEXT_WHITE, fontWeight: '500' },
  pillsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_DARK,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    gap: 8,
  },
  pillIcon: { fontSize: 18 },
  pillText: { fontSize: 14, color: TEXT_WHITE, fontWeight: '500' },
  bottomCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive: { backgroundColor: '#1e293b' },
  tabText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  tabTextActive: { color: '#fff' },
  tabContent: { padding: 20 },
  contentText: { fontSize: 15, color: '#334155', lineHeight: 24 },
  loginBonusBtn: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginBonusText: { fontSize: 14, fontWeight: '700', color: '#b45309' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCENT,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    gap: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
  },
  fabGlow: {
    shadowColor: '#3b82f6',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 2 },
  },
  fabIcon: { fontSize: 18, color: '#fff' },
  fabText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});
