import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';

const WORK_MIN = 25;
const BREAK_MIN = 5;

type Props = {
  navigation: any;
};

export default function PomodoroScreen({ navigation }: Props) {
  const [phase, setPhase] = useState<'work' | 'break'>('work');
  const [secondsLeft, setSecondsLeft] = useState(WORK_MIN * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [rounds, setRounds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (phase === 'work') {
              setPhase('break');
              setRounds((r) => r + 1);
              return BREAK_MIN * 60;
            } else {
              setPhase('work');
              return WORK_MIN * 60;
            }
          }
          return s - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, phase]);

  const reset = () => {
    setIsRunning(false);
    setPhase('work');
    setSecondsLeft(WORK_MIN * 60);
  };

  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pomodoro</Text>
        <Text style={styles.subtitle}>
          25 dk odaklanma • 5 dk mola
        </Text>
      </View>

      <View style={styles.timerCard}>
        <Text style={styles.phaseLabel}>
          {phase === 'work' ? '🎯 Odaklanma' : '☕ Mola'}
        </Text>
        <Text style={styles.timer}>
          {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
        </Text>
        <View style={styles.timerActions}>
          <TouchableOpacity
            style={[styles.timerBtn, styles.timerBtnPrimary]}
            onPress={() => setIsRunning(!isRunning)}
          >
            <Text style={styles.timerBtnText}>{isRunning ? 'Duraklat' : 'Başla'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.timerBtn} onPress={reset}>
            <Text style={styles.timerBtnTextSecondary}>Sıfırla</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsCard}>
        <Text style={styles.statsLabel}>Tamamlanan Tur</Text>
        <Text style={styles.statsValue}>{rounds}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 32 },
  backBtn: { padding: 8, marginBottom: 8 },
  backBtnText: { fontSize: 16, color: '#2563eb', fontWeight: '500' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0f172a', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#64748b' },
  timerCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  phaseLabel: { fontSize: 18, color: '#64748b', marginBottom: 16 },
  timer: { fontSize: 72, fontWeight: '200', color: '#0f172a', fontVariant: ['tabular-nums'] },
  timerActions: { flexDirection: 'row', gap: 16, marginTop: 32 },
  timerBtn: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  timerBtnPrimary: { backgroundColor: '#2563eb' },
  timerBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  timerBtnTextSecondary: { color: '#64748b', fontSize: 18 },
  statsCard: {
    backgroundColor: '#eff6ff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  statsLabel: { fontSize: 14, color: '#64748b' },
  statsValue: { fontSize: 36, fontWeight: 'bold', color: '#2563eb' },
});
