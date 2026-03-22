import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
import * as Haptics from 'expo-haptics';
import { usePlan } from '../context/PlanContext';
import { useTheme } from '../context/ThemeContext';
import {
  playAmbient,
  stopAmbient,
  AMBIENT_OPTIONS,
} from '../services/ambient';

const PRESETS = [
  { work: 25, break: 5, label: 'Klasik' },
  { work: 50, break: 10, label: 'Derin' },
  { work: 90, break: 20, label: 'Ultra' },
];

const CIRCLE_SIZE = 200;
const STROKE_WIDTH = 8;
const R = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;

type Props = {
  navigation: any;
};

export default function PomodoroScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const { addPomodoro } = usePlan();
  const [presetIndex, setPresetIndex] = useState(0);
  const preset = PRESETS[presetIndex];
  const [phase, setPhase] = useState<'work' | 'break'>('work');
  const [secondsLeft, setSecondsLeft] = useState(preset.work * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [rounds, setRounds] = useState(0);
  const [ambientId, setAmbientId] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const phaseFadeAnim = useRef(new Animated.Value(1)).current;
  const scaleInAnim = useRef(new Animated.Value(0.9)).current;

  const totalSeconds = phase === 'work' ? preset.work * 60 : preset.break * 60;
  const progress = 1 - secondsLeft / totalSeconds;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 400,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic),
    }).start();
  }, [progress]);

  useEffect(() => {
    if (isRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 1200,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRunning]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Animated.sequence([
              Animated.timing(phaseFadeAnim, {
                toValue: 0,
                duration: 150,
                useNativeDriver: true,
              }),
              Animated.timing(phaseFadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }),
            ]).start();
            if (phase === 'work') {
              addPomodoro();
              setPhase('break');
              setRounds((r) => r + 1);
              return preset.break * 60;
            } else {
              setPhase('work');
              return preset.work * 60;
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
  }, [isRunning, phase, preset]);

  useEffect(() => {
    return () => {
      stopAmbient();
    };
  }, []);

  const reset = () => {
    setIsRunning(false);
    setPhase('work');
    setSecondsLeft(preset.work * 60);
  };

  const changePreset = (i: number) => {
    if (isRunning) return;
    setPresetIndex(i);
    setPhase('work');
    setSecondsLeft(PRESETS[i].work * 60);
    Animated.spring(scaleInAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      friction: 8,
      tension: 80,
    }).start(() => scaleInAnim.setValue(1));
  };

  const handleAmbientSelect = async (id: string | null) => {
    if (ambientId === id) return;
    await stopAmbient();
    setAmbientId(id);
    if (id) {
      const opt = AMBIENT_OPTIONS.find((a) => a.id === id);
      if (opt) await playAmbient(opt.uri, 0.35);
    }
  };

  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;

  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, 0],
  });

  const phaseColor = phase === 'work' ? theme.accent : theme.success;
  const phaseBg = phase === 'work' ? theme.accentLight : theme.successLight;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backBtnText, { color: theme.accent }]}>← Geri</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Pomodoro</Text>
        <View style={styles.presetRow}>
          {PRESETS.map((p, i) => (
            <TouchableOpacity
              key={p.label}
              style={[
                styles.presetBtn,
                { backgroundColor: theme.card, borderColor: theme.cardBorder },
                presetIndex === i && { backgroundColor: theme.accent, borderColor: theme.accent },
              ]}
              onPress={() => changePreset(i)}
            >
              <Text
                style={[
                  styles.presetLabel,
                  { color: theme.textSecondary },
                  presetIndex === i && { color: '#fff' },
                ]}
              >
                {p.label}
              </Text>
              <Text
                style={[
                  styles.presetTime,
                  { color: theme.textSecondary },
                  presetIndex === i && { color: 'rgba(255,255,255,0.9)' },
                ]}
              >
                {p.work}/{p.break}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Animated.View
        style={[
          styles.timerCard,
          {
            backgroundColor: theme.card,
            shadowColor: theme.text,
          },
          {
            transform: [{ scale: Animated.multiply(pulseAnim, scaleInAnim) }],
          },
        ]}
      >
        <Animated.View style={{ opacity: phaseFadeAnim }}>
          <View style={[styles.phaseBadge, { backgroundColor: phaseBg }]}>
            <Text style={[styles.phaseLabel, { color: phaseColor }]}>
              {phase === 'work' ? '🎯 Odaklanma' : '☕ Mola'}
            </Text>
          </View>
        </Animated.View>

        <View style={styles.circleWrapper}>
          <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE} style={styles.svg}>
            <Circle
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={R}
              stroke={theme.cardBorder}
              strokeWidth={STROKE_WIDTH}
              fill="transparent"
            />
            <AnimatedCircle
              cx={CIRCLE_SIZE / 2}
              cy={CIRCLE_SIZE / 2}
              r={R}
              stroke={phaseColor}
              strokeWidth={STROKE_WIDTH}
              fill="transparent"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              transform={`rotate(-90, ${CIRCLE_SIZE / 2}, ${CIRCLE_SIZE / 2})`}
            />
          </Svg>
          <View style={styles.timerInner}>
            <Text style={[styles.timer, { color: theme.text }]}>
              {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
            </Text>
          </View>
        </View>

        <View style={styles.timerActions}>
          <TouchableOpacity
            style={[styles.timerBtn, styles.timerBtnPrimary, { backgroundColor: theme.accent }]}
            onPress={() => setIsRunning(!isRunning)}
          >
            <Text style={styles.timerBtnText}>{isRunning ? 'Duraklat' : 'Başla'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timerBtn, { borderColor: theme.cardBorder }]}
            onPress={reset}
          >
            <Text style={[styles.timerBtnTextSecondary, { color: theme.textSecondary }]}>
              Sıfırla
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <View style={[styles.ambientSection, { backgroundColor: theme.card }]}>
        <Text style={[styles.ambientTitle, { color: theme.textSecondary }]}>
          🎵 Ambians Müzik
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.ambientRow}
        >
          <TouchableOpacity
            style={[
              styles.ambientChip,
              { borderColor: theme.cardBorder },
              !ambientId && { borderColor: theme.accent, borderWidth: 2 },
            ]}
            onPress={() => handleAmbientSelect(null)}
          >
            <Text style={[styles.ambientIcon, { color: theme.text }]}>🔇</Text>
            <Text style={[styles.ambientLabel, { color: theme.text }]}>Yok</Text>
          </TouchableOpacity>
          {AMBIENT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={[
                styles.ambientChip,
                { borderColor: theme.cardBorder },
                ambientId === opt.id && { borderColor: theme.accent, borderWidth: 2 },
              ]}
              onPress={() => handleAmbientSelect(opt.id)}
            >
              <Text style={[styles.ambientIcon, { color: theme.text }]}>{opt.icon}</Text>
              <Text style={[styles.ambientLabel, { color: theme.text }]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={[styles.statsCard, { backgroundColor: theme.accentLight }]}>
        <Text style={[styles.statsLabel, { color: theme.textSecondary }]}>Tamamlanan Tur</Text>
        <Text style={[styles.statsValue, { color: theme.accent }]}>{rounds}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  backBtn: { padding: 8, marginBottom: 8 },
  backBtnText: { fontSize: 16, fontWeight: '500' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 12 },
  presetRow: { flexDirection: 'row', gap: 8 },
  presetBtn: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  presetLabel: { fontSize: 14, fontWeight: '600' },
  presetTime: { fontSize: 11 },
  timerCard: {
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 12,
  },
  phaseBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  phaseLabel: { fontSize: 16, fontWeight: '600' },
  circleWrapper: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  svg: { position: 'absolute', top: 0, left: 0 },
  timerInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timer: {
    fontSize: 56,
    fontWeight: '200',
    fontVariant: ['tabular-nums'],
  },
  timerActions: { flexDirection: 'row', gap: 16 },
  timerBtn: {
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  timerBtnPrimary: {},
  timerBtnText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  timerBtnTextSecondary: { fontSize: 18, fontWeight: '600' },
  ambientSection: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  ambientTitle: { fontSize: 13, fontWeight: '600', marginBottom: 12, textTransform: 'uppercase' },
  ambientRow: { flexDirection: 'row', gap: 10 },
  ambientChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 70,
  },
  ambientIcon: { fontSize: 22, marginBottom: 4 },
  ambientLabel: { fontSize: 12, fontWeight: '600' },
  statsCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  statsLabel: { fontSize: 14 },
  statsValue: { fontSize: 36, fontWeight: 'bold' },
});
