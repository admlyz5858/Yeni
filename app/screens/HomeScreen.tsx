import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
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
import { useTheme } from '../context/ThemeContext';
import LevelUpModal from '../components/LevelUpModal';

const { width } = Dimensions.get('window');
const CARD_GAP = 8;
const GRID_COLS = 4;
const CIRCLE_SIZE = (width - 40 - CARD_GAP * (GRID_COLS - 1)) / GRID_COLS - 4;

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
  const { theme, isDark } = useTheme();
  const {
    studyLog,
    dailyGoalHours,
    todayPomodoro,
    todayTopicCompletions,
    isLoading,
    completedTopics,
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
  const activeIndex = 4;
  const daySeed = new Date().getDate() % 3;
  const defaultQuotes = QUOTES;
  const allQuotes = customQuotes.length > 0 ? customQuotes : defaultQuotes;
  const quote = allQuotes[daySeed % allQuotes.length];
  const tip = TIPS[daySeed];

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

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: theme.bg }]}>
        <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.cardBorder }]}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => (navigation.getParent() as any)?.getParent()?.openDrawer?.()}
        >
          <Text style={[styles.iconBtnText, { color: theme.accent }]}>☰</Text>
        </TouchableOpacity>
        <View style={styles.logoRow}>
          <Text style={styles.logoEmoji}>🦉</Text>
          <Text style={[styles.appName, { color: theme.text }]}>Bilge Baykuş</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('DailyActivity')}>
          <Text style={[styles.iconBtnText, { color: theme.accent }]}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Greeting + License */}
      <View style={[styles.greetingRow, { borderBottomColor: theme.cardBorder }]}>
        <Text style={[styles.greetingText, { color: theme.text }]}>
          {greeting} {user?.name?.split(' ')[0] || 'Kullanıcı'} 👋
        </Text>
        <View style={[styles.licenseBadge, isPremium ? styles.licensePro : styles.licenseFree]}>
          <Text style={styles.licenseText}>{isPremium ? 'PRO' : 'Ücretsiz'}</Text>
        </View>
      </View>

      {/* Odaklanma + Stats */}
      <TouchableOpacity
        style={[styles.featuredCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
        onPress={() => navigation.navigate('Pomodoro')}
      >
        <View style={styles.featuredLeft}>
          <Text style={[styles.featuredTitle, { color: theme.text }]}>Odaklanma</Text>
          <Text style={[styles.featuredSub, { color: theme.textSecondary }]}>
            {todayHours.toFixed(1)}h bugün · {weekHours.toFixed(1)}h hafta
          </Text>
        </View>
        <View style={[styles.playCircle, { backgroundColor: theme.accent }]}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
      </TouchableOpacity>

      {/* Stats row */}
      <View style={[styles.statsRow, { borderBottomColor: theme.cardBorder }]}>
        {[
          { label: 'Hedef', val: `${dailyGoalHours}h` },
          { label: 'Seri', val: `${streak}` },
          { label: 'XP', val: `${xp}` },
          { label: 'Seviye', val: `${level}` },
          { label: 'Bugün', val: `${todayHours.toFixed(1)}` },
          { label: 'Hafta', val: `${weekHours.toFixed(1)}` },
        ].map((item, i) => (
          <View key={item.label} style={styles.statItem}>
            <Text style={[styles.statVal, { color: theme.text }]}>{item.val}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Grid */}
      <View style={styles.grid}>
        {gridItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.gridItem}
            onPress={() => navigation.navigate(item.nav)}
          >
            <View style={[styles.circleIcon, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
              <Text style={styles.circleEmoji}>{item.icon}</Text>
            </View>
            <Text style={[styles.circleLabel, { color: theme.text }]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quote/Tip bar */}
      <View style={[styles.quoteBar, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
        <TouchableOpacity
          style={[styles.quoteTab, tab === 'quote' && { backgroundColor: theme.accent }]}
          onPress={() => setTab('quote')}
        >
          <Text style={[styles.quoteTabText, tab === 'quote' && { color: '#fff' }, { color: theme.textSecondary }]}>
            Söz
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quoteTab, tab === 'tip' && { backgroundColor: theme.accent }]}
          onPress={() => setTab('tip')}
        >
          <Text style={[styles.quoteTabText, tab === 'tip' && { color: '#fff' }, { color: theme.textSecondary }]}>
            İpucu
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quoteTab, tab === 'motivation' && { backgroundColor: theme.accent }]}
          onPress={() => setTab('motivation')}
        >
          <Text style={[styles.quoteTabText, tab === 'motivation' && { color: '#fff' }, { color: theme.textSecondary }]}>
            Motivasyon
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.quoteText, { color: theme.text }]} numberOfLines={2}>
        {tab === 'quote' && `"${quote}"`}
        {tab === 'tip' && `💡 ${tip}`}
        {tab === 'motivation' &&
          (remainGoal > 0
            ? `Bugün ${remainGoal.toFixed(1)} saat daha çalış! 💪`
            : 'Bugünkü hedefe ulaştın! 🎉')}
      </Text>

      {dailyLoginBonus > 0 && (
        <TouchableOpacity
          style={styles.loginBonusBtn}
          onPress={() => navigation.navigate('DailyActivity')}
        >
          <Text style={styles.loginBonusText}>🎁 +{dailyLoginBonus} XP</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.accent }]}
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
  container: { flex: 1 },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoEmoji: { fontSize: 24 },
  appName: { fontSize: 18, fontWeight: '600' },
  iconBtn: { padding: 8 },
  iconBtnText: { fontSize: 20 },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  greetingText: { fontSize: 16, fontWeight: '600' },
  licenseBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  licensePro: { backgroundColor: '#22c55e' },
  licenseFree: { backgroundColor: '#94a3b8' },
  licenseText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  featuredCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  featuredLeft: {},
  featuredTitle: { fontSize: 16, fontWeight: 'bold' },
  featuredSub: { fontSize: 13, marginTop: 4 },
  playCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: { fontSize: 20, color: '#fff' },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 8,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 14, fontWeight: 'bold' },
  statLabel: { fontSize: 10, marginTop: 2 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: CARD_GAP,
  },
  gridItem: { width: (width - 32 - CARD_GAP * 3) / 4, alignItems: 'center' },
  circleIcon: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
  },
  circleEmoji: { fontSize: CIRCLE_SIZE * 0.4 },
  circleLabel: { fontSize: 11, textAlign: 'center' },
  quoteBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 8,
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  quoteTab: { flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: 8 },
  quoteTabText: { fontSize: 12, fontWeight: '600' },
  quoteText: {
    fontSize: 13,
    fontStyle: 'italic',
    marginHorizontal: 16,
    marginTop: 8,
  },
  loginBonusBtn: {
    alignSelf: 'center',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#fef3c7',
  },
  loginBonusText: { fontSize: 13, fontWeight: '700', color: '#b45309' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  fabIcon: { fontSize: 20 },
  fabText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});
