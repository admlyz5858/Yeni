import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { usePlan } from '../context/PlanContext';
import { SUBJECTS } from '../data/subjects';

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
  const { examDate, dailyGoalHours, completedTopics, studyLog, isLoading } = usePlan();

  const daysRemaining = getDaysRemaining(examDate);
  const totalTopics = SUBJECTS.reduce((acc, s) => acc + s.topics.length, 0);
  const doneCount = Object.values(completedTopics).reduce(
    (acc, subj) => acc + Object.values(subj).filter(Boolean).length,
    0
  );
  const progressPercent = totalTopics > 0 ? Math.round((doneCount / totalTopics) * 100) : 0;
  const streak = getStreak(studyLog);
  const weekDates = getWeekDates();
  const weekHours = weekDates.reduce((acc, d) => acc + (studyLog[d] || 0), 0);
  const today = new Date().toISOString().slice(0, 10);
  const todayHours = studyLog[today] || 0;

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>KPSS Planlama</Text>
        <Text style={styles.subtitle}>
          Çalışma planınızı oluşturun ve ilerlemenizi takip edin
        </Text>
      </View>

      {examDate && daysRemaining !== null && (
        <View style={styles.countdownCard}>
          <Text style={styles.countdownLabel}>Sınava Kalan</Text>
          <Text style={styles.countdownValue}>{daysRemaining}</Text>
          <Text style={styles.countdownUnit}>gün</Text>
        </View>
      )}

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>Seri (gün)</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{weekHours.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Bu hafta (saat)</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{todayHours.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Bugün (saat)</Text>
        </View>
      </View>

      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Konu İlerlemesi</Text>
          <Text style={styles.progressValue}>{doneCount} / {totalTopics} (%{progressPercent})</Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${progressPercent}%` }]}
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.logCard}
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
          style={styles.menuCard}
          onPress={() => navigation.navigate('Plan')}
        >
          <Text style={styles.menuIcon}>📋</Text>
          <Text style={styles.menuTitle}>Çalışma Planı</Text>
          <Text style={styles.menuSub}>Konuları planla ve tamamla</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => navigation.navigate('Schedule')}
        >
          <Text style={styles.menuIcon}>📅</Text>
          <Text style={styles.menuTitle}>Haftalık Program</Text>
          <Text style={styles.menuSub}>Günlük çalışma saatlerini belirle</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => navigation.navigate('Goals')}
        >
          <Text style={styles.menuIcon}>🎯</Text>
          <Text style={styles.menuTitle}>Hedefler</Text>
          <Text style={styles.menuSub}>Sınav tarihi ve günlük hedef</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuCard}
          onPress={() => navigation.navigate('StudyLog')}
        >
          <Text style={styles.menuIcon}>📊</Text>
          <Text style={styles.menuTitle}>Çalışma Günlüğü</Text>
          <Text style={styles.menuSub}>Günlük çalışma kayıtları ve istatistikler</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 40 },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#64748b' },
  header: { marginBottom: 24, paddingTop: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748b', lineHeight: 24 },
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
  progressBar: { height: 10, backgroundColor: '#e2e8f0', borderRadius: 5, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#2563eb', borderRadius: 5 },
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
