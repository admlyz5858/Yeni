import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { usePlan } from '../context/PlanContext';
import { useTheme } from '../context/ThemeContext';
import { useGamification } from '../context/GamificationContext';
import { useFlashcards } from '../context/FlashcardContext';
import { useSubjects } from '../context/SubjectsContext';
import { useGame } from '../context/GameContext';
import StudyHeatmap from '../components/StudyHeatmap';
import StudyPet from '../components/StudyPet';
import LevelUpModal from '../components/LevelUpModal';

type Props = {
  navigation: any;
};

function getDaysRemaining(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const exam = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  exam.setHours(0, 0, 0, 0);
  const diff = Math.ceil((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diff >= 0 ? diff : null;
}

function getWeekDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

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
  const { examDate, completedTopics, studyLog, isLoading, topicNotes, pomodoroCount, todayTopicCompletions, todayPomodoro } = usePlan();
  const { theme } = useTheme();
  const { level, xp, checkAchievements, updateDailyChallengeFromStats, dailyLoginBonus } = useGamification();
  const { getDueCards, cardsCount } = useFlashcards();
  const { subjects } = useSubjects();
  const { checkLevelUp, levelUpModal, setLevelUpModal } = useGame();

  const totalTopics = subjects.reduce((acc, s) => acc + s.topics.length, 0);
  const doneCount = Object.values(completedTopics).reduce(
    (acc, subj) => acc + Object.values(subj).filter(Boolean).length,
    0
  );
  const hasNotes = Object.values(topicNotes).some((subj) => Object.values(subj).some((n) => n?.trim()));
  const noteCount = Object.values(topicNotes).reduce((a, subj) => a + Object.values(subj).filter((n) => n?.trim()).length, 0);
  const streak = getStreak(studyLog);
  const totalStudyHours = Object.values(studyLog).reduce((a, b) => a + b, 0);
  const today = new Date().toISOString().slice(0, 10);
  const todayHours = studyLog[today] || 0;
  const before8am = false;

  useEffect(() => {
    checkAchievements({
      totalStudyHours,
      streak,
      topicsDone: doneCount,
      totalTopics,
      pomodoroCompleted: pomodoroCount,
      hasNotes,
      noteCount,
      flashcardCount: cardsCount,
      studyLog,
    });
  }, [doneCount, streak, pomodoroCount, totalStudyHours, hasNotes, noteCount, cardsCount]);

  useEffect(() => {
    checkLevelUp(level);
  }, [level]);

  useEffect(() => {
    updateDailyChallengeFromStats({
      todayHours,
      todayTopics: todayTopicCompletions,
      todayPomodoro,
      todayFlashcards: 0,
      todayNotes: noteCount,
      before8am,
    });
  }, [todayHours, todayTopicCompletions, todayPomodoro, noteCount]);

  const daysRemaining = getDaysRemaining(examDate);
  const progressPercent = totalTopics > 0 ? Math.round((doneCount / totalTopics) * 100) : 0;
  const weekDates = getWeekDates();
  const weekHours = weekDates.reduce((acc, d) => acc + (studyLog[d] || 0), 0);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.text }]}>Çalışma Asistanı</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.settingsBtn}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Odaklan, planla, rozetler kazan! 🎮
        </Text>
      </View>

      <View style={styles.petRow}>
        <StudyPet xp={xp} level={level} streak={streak} />
        <View style={styles.petActions}>
          <TouchableOpacity
            style={[styles.gameBtn, { backgroundColor: theme.card }]}
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <Text style={styles.gameBtnIcon}>🏆</Text>
            <Text style={[styles.gameBtnText, { color: theme.text }]}>Sıralama</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.gameBtn, { backgroundColor: theme.card }]}
            onPress={() => navigation.navigate('StudyGroups')}
          >
            <Text style={styles.gameBtnIcon}>👥</Text>
            <Text style={[styles.gameBtnText, { color: theme.text }]}>Gruplar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={styles.focusCta}
        onPress={() => navigation.navigate('Focus')}
      >
        <Text style={styles.focusCtaIcon}>🎯</Text>
        <View style={styles.focusCtaContent}>
          <Text style={styles.focusCtaTitle}>Odaklanma Merkezi</Text>
          <Text style={styles.focusCtaSub}>Pomodoro • Seri • İstatistikler</Text>
        </View>
        <Text style={styles.focusCtaArrow}>→</Text>
      </TouchableOpacity>

      <View style={styles.topBadges}>
        <TouchableOpacity
          style={[styles.levelBadge, { backgroundColor: theme.card }]}
          onPress={() => navigation.navigate('Achievements')}
        >
          <Text style={styles.levelText}>Seviye {level}</Text>
          <Text style={[styles.xpText, { color: theme.textSecondary }]}>{xp} XP</Text>
        </TouchableOpacity>
        {(dailyLoginBonus > 0) && (
          <TouchableOpacity
            style={styles.loginBonusBtn}
            onPress={() => navigation.navigate('DailyActivity')}
          >
            <Text style={styles.loginBonusBtnText}>🎁 +{dailyLoginBonus}</Text>
          </TouchableOpacity>
        )}
      </View>

      {examDate && daysRemaining !== null && (
        <View style={[styles.countdownCard, { backgroundColor: theme.countdownBg }]}>
          <Text style={[styles.countdownLabel, { color: theme.textSecondary }]}>Sınava Kalan</Text>
          <Text style={[styles.countdownValue, { color: theme.countdownText }]}>{daysRemaining}</Text>
          <Text style={[styles.countdownUnit, { color: theme.textSecondary }]}>gün</Text>
        </View>
      )}

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.statValue, { color: theme.text }]}>{streak}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Seri (gün)</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.statValue, { color: theme.text }]}>{weekHours.toFixed(1)}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Bu hafta (saat)</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.statValue, { color: theme.text }]}>{todayHours.toFixed(1)}</Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Bugün (saat)</Text>
        </View>
      </View>

      <View style={[styles.progressCard, { backgroundColor: theme.card }]}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressTitle, { color: theme.text }]}>Konu İlerlemesi</Text>
          <Text style={[styles.progressValue, { color: theme.accent }]}>{doneCount} / {totalTopics} (%{progressPercent})</Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: theme.cardBorder }]}>
          <View
            style={[styles.progressFill, { width: `${progressPercent}%`, backgroundColor: theme.accent }]}
          />
        </View>
      </View>

      <View style={[styles.heatmapCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.heatmapTitle, { color: theme.text }]}>Çalışma Aktivitesi</Text>
        <StudyHeatmap studyLog={studyLog} weeks={12} />
      </View>

      <TouchableOpacity
          style={[styles.logCard, { backgroundColor: theme.success }]}
          onPress={() => navigation.navigate('StudyLog')}
        >
        <Text style={styles.logIcon}>📝</Text>
        <View style={styles.logContent}>
          <Text style={styles.logTitle}>Bugün Çalıştım</Text>
          <Text style={styles.logSub}>Çalışma saatinizi kaydedin</Text>
        </View>
        <Text style={styles.logArrow}>→</Text>
      </TouchableOpacity>

      <View style={styles.menu}>
        <TouchableOpacity
          style={[styles.menuCard, { backgroundColor: theme.card }]}
          onPress={() => navigation.navigate('Subjects')}
        >
          <Text style={styles.menuIcon}>📚</Text>
          <Text style={[styles.menuTitle, { color: theme.text }]}>Derslerim</Text>
          <Text style={[styles.menuSub, { color: theme.textSecondary }]}>Ders ve konularını ekle/düzenle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuCard, { backgroundColor: theme.card }]}
          onPress={() => navigation.navigate('Plan')}
        >
          <Text style={styles.menuIcon}>📋</Text>
          <Text style={[styles.menuTitle, { color: theme.text }]}>Çalışma Planı</Text>
          <Text style={[styles.menuSub, { color: theme.textSecondary }]}>Konuları planla ve not ekle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuCard, { backgroundColor: theme.card }]}
          onPress={() => navigation.navigate('Focus')}
        >
          <Text style={styles.menuIcon}>🎯</Text>
          <Text style={[styles.menuTitle, { color: theme.text }]}>Odaklanma</Text>
          <Text style={[styles.menuSub, { color: theme.textSecondary }]}>Pomodoro, seri, odak istatistikleri</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuCard, { backgroundColor: theme.card }]}
          onPress={() => navigation.navigate('Pomodoro')}
        >
          <Text style={styles.menuIcon}>🍅</Text>
          <Text style={[styles.menuTitle, { color: theme.text }]}>Pomodoro</Text>
          <Text style={[styles.menuSub, { color: theme.textSecondary }]}>25 dk odaklanma zamanlayıcısı</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuCard, { backgroundColor: theme.card }]}
          onPress={() => navigation.navigate('Schedule')}
        >
          <Text style={styles.menuIcon}>📅</Text>
          <Text style={[styles.menuTitle, { color: theme.text }]}>Haftalık Program</Text>
          <Text style={[styles.menuSub, { color: theme.textSecondary }]}>Günlük çalışma saatlerini belirle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuCard, { backgroundColor: theme.card }]}
          onPress={() => navigation.navigate('Goals')}
        >
          <Text style={styles.menuIcon}>🎯</Text>
          <Text style={[styles.menuTitle, { color: theme.text }]}>Hedefler</Text>
          <Text style={[styles.menuSub, { color: theme.textSecondary }]}>Sınav tarihi ve günlük hedef</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuCard, { backgroundColor: theme.card }]}
          onPress={() => navigation.navigate('StudyLog')}
        >
          <Text style={styles.menuIcon}>📊</Text>
          <Text style={[styles.menuTitle, { color: theme.text }]}>Çalışma Günlüğü</Text>
          <Text style={[styles.menuSub, { color: theme.textSecondary }]}>Günlük çalışma kayıtları</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuCard, { backgroundColor: theme.card }]}
          onPress={() => navigation.navigate('SmartPlan')}
        >
          <Text style={styles.menuIcon}>🤖</Text>
          <Text style={[styles.menuTitle, { color: theme.text }]}>Akıllı Plan</Text>
          <Text style={[styles.menuSub, { color: theme.textSecondary }]}>AI ile otomatik program oluştur</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuCard, { backgroundColor: theme.card }]}
          onPress={() => navigation.navigate('Flashcards')}
        >
          <Text style={styles.menuIcon}>📇</Text>
          <Text style={[styles.menuTitle, { color: theme.text }]}>Kartlar</Text>
          <Text style={[styles.menuSub, { color: theme.textSecondary }]}>
            Aralıklı tekrar ({getDueCards().length} bekliyor)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuCard, { backgroundColor: theme.card }]}
          onPress={() => navigation.navigate('Leaderboard')}
        >
          <Text style={styles.menuIcon}>🏆</Text>
          <Text style={[styles.menuTitle, { color: theme.text }]}>Sıralama</Text>
          <Text style={[styles.menuSub, { color: theme.textSecondary }]}>Haftalık liderler tablosu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuCard, { backgroundColor: theme.card }]}
          onPress={() => navigation.navigate('Achievements')}
        >
          <Text style={styles.menuIcon}>🌟</Text>
          <Text style={[styles.menuTitle, { color: theme.text }]}>Rozetler</Text>
          <Text style={[styles.menuSub, { color: theme.textSecondary }]}>38 başarı, XP kazan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuCard, { backgroundColor: theme.card }]}
          onPress={() => navigation.navigate('DailyActivity')}
        >
          <Text style={styles.menuIcon}>📌</Text>
          <Text style={[styles.menuTitle, { color: theme.text }]}>Günlük Aktivite</Text>
          <Text style={[styles.menuSub, { color: theme.textSecondary }]}>Görev, söz, ipucu</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuCard, { backgroundColor: theme.card }]}
          onPress={() => navigation.navigate('Premium')}
        >
          <Text style={styles.menuIcon}>👑</Text>
          <Text style={[styles.menuTitle, { color: theme.text }]}>Premium</Text>
          <Text style={[styles.menuSub, { color: theme.textSecondary }]}>5000 XP ile kilidi aç</Text>
        </TouchableOpacity>
      </View>

      <LevelUpModal
        visible={levelUpModal}
        level={level}
        onClose={() => setLevelUpModal(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 40 },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#64748b' },
  header: { marginBottom: 24, paddingTop: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: 'bold' },
  settingsBtn: { padding: 8 },
  settingsIcon: { fontSize: 24 },
  subtitle: { fontSize: 16, lineHeight: 24 },
  petRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  petActions: { flex: 1, flexDirection: 'row', gap: 8 },
  gameBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  gameBtnIcon: { fontSize: 24, marginBottom: 4 },
  gameBtnText: { fontSize: 12, fontWeight: '600' },
  focusCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dc2626',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  focusCtaIcon: { fontSize: 36, marginRight: 16 },
  focusCtaContent: { flex: 1 },
  focusCtaTitle: { fontSize: 18, fontWeight: '700', color: '#fff' },
  focusCtaSub: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  focusCtaArrow: { fontSize: 24, color: '#fff' },
  countdownCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  countdownLabel: { fontSize: 14, color: '#94a3b8', marginBottom: 4 },
  countdownValue: { fontSize: 48, fontWeight: 'bold', color: '#fff' },
  countdownUnit: { fontSize: 16, color: '#94a3b8' },
  topBadges: { flexDirection: 'row', gap: 12, marginBottom: 16, alignItems: 'center' },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  loginBonusBtn: { backgroundColor: '#fef3c7', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  loginBonusBtnText: { fontSize: 14, fontWeight: '700', color: '#b45309' },
  levelText: { fontSize: 16, fontWeight: '700', color: '#7c3aed' },
  xpText: { fontSize: 14 },
  heatmapCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  heatmapTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#1e293b' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  progressValue: { fontSize: 14, fontWeight: '600', color: '#2563eb' },
  progressBar: { height: 10, borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 5 },
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logIcon: { fontSize: 32, marginRight: 16 },
  logContent: { flex: 1 },
  logTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  logSub: { fontSize: 14, color: 'rgba(255,255,255,0.9)' },
  logArrow: { fontSize: 24, color: '#fff' },
  menu: { gap: 16 },
  menuCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  menuIcon: { fontSize: 32, marginBottom: 12 },
  menuTitle: { fontSize: 18, fontWeight: '600', color: '#1e293b', marginBottom: 4 },
  menuSub: { fontSize: 14, color: '#64748b' },
});
