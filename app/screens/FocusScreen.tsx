import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { usePlan } from '../context/PlanContext';
import { useGame } from '../context/GameContext';

type Props = {
  navigation: any;
};

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

export default function FocusScreen({ navigation }: Props) {
  const { pomodoroLog, todayPomodoro } = usePlan();
  const { focusStreak, activePowerUp } = useGame();
  const weekDates = getWeekDates();
  const weekPomodoro = weekDates.reduce((a, d) => a + (pomodoroLog[d] || 0), 0);
  const totalPomodoro = Object.values(pomodoroLog).reduce((a, b) => a + b, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backBtnText}>← Geri</Text>
      </TouchableOpacity>

      <Text style={styles.title}>🎯 Odaklanma Merkezi</Text>
      <Text style={styles.subtitle}>Pomodoro ile derin odaklanma, serin kırma!</Text>

      <TouchableOpacity
        style={styles.pomodoroCta}
        onPress={() => navigation.navigate('Pomodoro')}
      >
        <Text style={styles.pomodoroCtaIcon}>🍅</Text>
        <Text style={styles.pomodoroCtaTitle}>Pomodoro Başlat</Text>
        <Text style={styles.pomodoroCtaSub}>25 dk odaklanma seansı</Text>
      </TouchableOpacity>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🔥</Text>
          <Text style={styles.statValue}>{focusStreak}</Text>
          <Text style={styles.statLabel}>Odak Serisi (gün)</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>🍅</Text>
          <Text style={styles.statValue}>{todayPomodoro}</Text>
          <Text style={styles.statLabel}>Bugün</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statIcon}>📅</Text>
          <Text style={styles.statValue}>{weekPomodoro}</Text>
          <Text style={styles.statLabel}>Bu Hafta</Text>
        </View>
      </View>

      <View style={styles.totalCard}>
        <Text style={styles.totalIcon}>⏱️</Text>
        <Text style={styles.totalValue}>{totalPomodoro}</Text>
        <Text style={styles.totalLabel}>Toplam Pomodoro</Text>
      </View>

      {activePowerUp && activePowerUp.expiresAt > Date.now() && (
        <View style={styles.powerUpCard}>
          <Text style={styles.powerUpIcon}>⚡</Text>
          <Text style={styles.powerUpText}>XP Çarpanı aktif!</Text>
          <Text style={styles.powerUpSub}>
            {Math.ceil((activePowerUp.expiresAt - Date.now()) / 60000)} dk kaldı
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 40 },
  backBtn: { padding: 8, marginBottom: 16 },
  backBtnText: { fontSize: 16, color: '#2563eb', fontWeight: '500' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#64748b', marginBottom: 24 },
  pomodoroCta: {
    backgroundColor: '#dc2626',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  pomodoroCtaIcon: { fontSize: 64, marginBottom: 12 },
  pomodoroCtaTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  pomodoroCtaSub: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: { fontSize: 28, marginBottom: 8 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  statLabel: { fontSize: 12, color: '#64748b', marginTop: 4 },
  totalCard: {
    backgroundColor: '#7c3aed',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  totalIcon: { fontSize: 48, marginBottom: 8 },
  totalValue: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  totalLabel: { fontSize: 16, color: 'rgba(255,255,255,0.9)' },
  powerUpCard: {
    marginTop: 20,
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  powerUpIcon: { fontSize: 32, marginRight: 16 },
  powerUpText: { fontSize: 18, fontWeight: '600', color: '#92400e', flex: 1 },
  powerUpSub: { fontSize: 14, color: '#b45309' },
});
