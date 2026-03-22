import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Easing,
  ScrollView,
  AppState,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as KeepAwake from 'expo-keep-awake';
import Svg, { Circle, Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { usePlan } from '../context/PlanContext';
import { useSettings } from '../context/SettingsContext';
import {
  playAmbient,
  stopAmbient,
  AMBIENT_OPTIONS,
} from '../services/ambient';
import { StatusBar } from 'expo-status-bar';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const MODES = [
  { id: 'work', work: 25, break: 5, icon: '🎯', label: 'Odaklanma' },
  { id: 'short', work: 15, break: 3, icon: '💎', label: 'Kısa' },
  { id: 'long', work: 45, break: 15, icon: '🌿', label: 'Uzun' },
];

const CIRCLE_SIZE = 240;
const STROKE_WIDTH = 6;
const R = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * R;
const ACCENT_PURPLE = '#9D50FF';

type Props = { navigation: any };

export default function PomodoroScreen({ navigation }: Props) {
  const { addPomodoro } = usePlan();
  const { keepScreenOn, strictMode, soundEffects } = useSettings();
  const [modeIndex, setModeIndex] = useState(0);
  const mode = MODES[modeIndex];
  const [phase, setPhase] = useState<'work' | 'break'>('work');
  const [secondsLeft, setSecondsLeft] = useState(mode.work * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [rounds, setRounds] = useState(0);
  const [ambientId, setAmbientId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState('');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const totalSeconds = phase === 'work' ? mode.work * 60 : mode.break * 60;
  const progress = 1 - secondsLeft / totalSeconds;

  useEffect(() => {
    const tick = () =>
      setCurrentTime(
        new Date().toLocaleTimeString('tr-TR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

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
            toValue: 1.03,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
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
    if (keepScreenOn && isRunning) {
      KeepAwake.activateKeepAwakeAsync();
      return () => {
        KeepAwake.deactivateKeepAwake();
      };
    }
  }, [keepScreenOn, isRunning]);

  useEffect(() => {
    if (!strictMode || !isRunning) return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') setIsRunning(false);
    });
    return () => sub.remove();
  }, [strictMode, isRunning]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            if (soundEffects) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (phase === 'work') {
              addPomodoro();
              setPhase('break');
              setRounds((r) => r + 1);
              return mode.break * 60;
            } else {
              setPhase('work');
              return mode.work * 60;
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
  }, [isRunning, phase, mode]);

  useEffect(() => {
    return () => {
      stopAmbient();
    };
  }, []);

  const reset = () => {
    setIsRunning(false);
    setPhase('work');
    setSecondsLeft(mode.work * 60);
  };

  const changeMode = (i: number) => {
    if (isRunning) return;
    setModeIndex(i);
    setPhase('work');
    setSecondsLeft(MODES[i].work * 60);
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

  const cx = CIRCLE_SIZE / 2;
  const cy = CIRCLE_SIZE / 2;
  const tickCount = 60;
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const angle = ((i / tickCount) * 360 - 90) * (Math.PI / 180);
    const r0 = R - 4;
    const r1 = R + 2;
    const x0 = cx + r0 * Math.cos(angle);
    const y0 = cy + r0 * Math.sin(angle);
    const x1 = cx + r1 * Math.cos(angle);
    const y1 = cy + r1 * Math.sin(angle);
    return { x0, y0, x1, y1 };
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background */}
      <LinearGradient
        colors={['#0d1b0d', '#1a2e1a', '#152415', '#0f1a0f', '#1a0a2e']}
        style={StyleSheet.absoluteFill}
      />

      {/* Menu button */}
      <TouchableOpacity
        style={styles.menuBtn}
        onPress={() => navigation.goBack()}
      >
        <BlurView intensity={60} tint="dark" style={styles.menuBtnBlur}>
          <Text style={styles.menuIcon}>☰</Text>
        </BlurView>
      </TouchableOpacity>

      {/* Mode selection bar */}
      <View style={styles.modeBarWrapper}>
        <BlurView intensity={40} tint="dark" style={styles.modeBar}>
          {MODES.map((m, i) => (
            <TouchableOpacity
              key={m.id}
              style={[styles.modeBtn, modeIndex === i && styles.modeBtnActive]}
              onPress={() => changeMode(i)}
            >
              <Text style={styles.modeIcon}>{m.icon}</Text>
            </TouchableOpacity>
          ))}
        </BlurView>
      </View>

      {/* Timer card */}
      <Animated.View style={[styles.cardWrapper, { transform: [{ scale: pulseAnim }] }]}>
        <BlurView intensity={50} tint="dark" style={styles.timerCard}>
          <Text style={styles.clockText}>{currentTime}</Text>

          <View style={styles.circleWrapper}>
            <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
              {ticks.map((t, i) => (
                <Line
                  key={i}
                  x1={t.x0}
                  y1={t.y0}
                  x2={t.x1}
                  y2={t.y1}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth={1}
                />
              ))}
              <Circle
                cx={cx}
                cy={cy}
                r={R}
                stroke="rgba(255,255,255,0.15)"
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
              />
              <AnimatedCircle
                cx={cx}
                cy={cy}
                r={R}
                stroke={ACCENT_PURPLE}
                strokeWidth={STROKE_WIDTH}
                fill="transparent"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90, ${cx}, ${cy})`}
              />
            </Svg>
            <View style={styles.timerOverlay}>
              <Text style={styles.timerText}>
                {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
              </Text>
            </View>
          </View>

          <View style={styles.controlRow}>
            <TouchableOpacity
              style={styles.playBtn}
              onPress={() => setIsRunning(!isRunning)}
            >
              <View style={styles.playBtnGlow} />
              <View style={styles.playBtnInner}>
                <Text style={styles.playIcon}>{isRunning ? '⏸' : '▶'}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.resetBtn} onPress={reset}>
              <BlurView intensity={40} tint="dark" style={styles.resetBtnBlur}>
                <Text style={styles.resetIcon}>↺</Text>
              </BlurView>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Animated.View>

      {/* Ambient */}
      <View style={styles.ambientWrapper}>
        <BlurView intensity={30} tint="dark" style={styles.ambientBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.ambientRow}
          >
            <TouchableOpacity
              style={[styles.ambientChip, !ambientId && styles.ambientChipActive]}
              onPress={() => handleAmbientSelect(null)}
            >
              <Text style={styles.ambientLabel}>Yok</Text>
            </TouchableOpacity>
            {AMBIENT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.ambientChip, ambientId === opt.id && styles.ambientChipActive]}
                onPress={() => handleAmbientSelect(opt.id)}
              >
                <Text style={styles.ambientLabel}>{opt.icon} {opt.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </BlurView>
      </View>

      {rounds > 0 && (
        <View style={styles.roundsBadge}>
          <Text style={styles.roundsText}>Tamamlanan: {rounds} tur</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  menuBtn: {
    position: 'absolute',
    top: 56,
    left: 20,
    zIndex: 10,
  },
  menuBtnBlur: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  menuIcon: { fontSize: 22, color: '#fff' },
  modeBarWrapper: {
    position: 'absolute',
    top: 120,
    left: 20,
    right: 20,
  },
  modeBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  modeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeBtnActive: {
    backgroundColor: 'rgba(157, 80, 255, 0.4)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  modeIcon: { fontSize: 22 },
  cardWrapper: { marginTop: 100 },
  timerCard: {
    width: '90%',
    maxWidth: 340,
    borderRadius: 32,
    padding: 28,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  clockText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 20,
    fontVariant: ['tabular-nums'],
  },
  circleWrapper: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#fff',
    fontVariant: ['tabular-nums'],
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 28,
    gap: 20,
  },
  playBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtnGlow: {
    position: 'absolute',
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: ACCENT_PURPLE,
    opacity: 0.4,
  },
  playBtnInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: ACCENT_PURPLE,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: ACCENT_PURPLE,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
  },
  playIcon: { fontSize: 28, color: '#fff' },
  resetBtn: { overflow: 'hidden', borderRadius: 28 },
  resetBtnBlur: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  resetIcon: { fontSize: 24, color: '#fff' },
  ambientWrapper: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  ambientBar: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  ambientRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  ambientChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  ambientChipActive: {
    backgroundColor: 'rgba(157, 80, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  ambientLabel: { fontSize: 13, color: '#fff' },
  roundsBadge: {
    position: 'absolute',
    bottom: 100,
  },
  roundsText: { fontSize: 14, color: 'rgba(255,255,255,0.7)' },
});
