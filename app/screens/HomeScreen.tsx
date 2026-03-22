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

export default function HomeScreen({ navigation }: Props) {
  const { examDate, dailyGoalHours, completedTopics } = usePlan();

  const daysRemaining = getDaysRemaining(examDate);
  const totalTopics = SUBJECTS.reduce((acc, s) => acc + s.topics.length, 0);
  const doneCount = Object.values(completedTopics).reduce(
    (acc, subj) => acc + Object.values(subj).filter(Boolean).length,
    0
  );

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

      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Konu İlerlemesi</Text>
          <Text style={styles.progressValue}>{doneCount} / {totalTopics}</Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[styles.progressFill, { width: `${(doneCount / totalTopics) * 100}%` }]}
          />
        </View>
      </View>

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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24, paddingTop: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#64748b', lineHeight: 24 },
  countdownCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  countdownLabel: { fontSize: 14, color: '#94a3b8', marginBottom: 4 },
  countdownValue: { fontSize: 48, fontWeight: 'bold', color: '#fff' },
  countdownUnit: { fontSize: 16, color: '#94a3b8' },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  progressTitle: { fontSize: 16, fontWeight: '600', color: '#1e293b' },
  progressValue: { fontSize: 16, fontWeight: '600', color: '#2563eb' },
  progressBar: { height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#2563eb', borderRadius: 4 },
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
