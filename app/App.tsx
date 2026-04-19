import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { usePomodoroTicker } from './src/hooks/usePomodoroTicker';
import {
  playActionBeep,
  playCompletionChime,
  playSoftResetBeep,
  startAmbientPad,
  stopAmbientPad,
} from './src/services/soundscape';
import { usePomodoroStore } from './src/store/usePomodoroStore';
import { PomodoroPhase } from './src/types/pomodoro';
import { formatSeconds } from './src/utils/time';

const phaseLabels: Record<PomodoroPhase, string> = {
  focus: 'Odak',
  shortBreak: 'Kısa Mola',
  longBreak: 'Uzun Mola',
};

const phaseThemes: Record<
  PomodoroPhase,
  {
    scene: [string, string, string];
    orb: [string, string];
    aura: string;
    accent: string;
  }
> = {
  focus: {
    scene: ['#070B1A', '#0A1232', '#1A0E3A'],
    orb: ['#22d3ee', '#8b5cf6'],
    aura: 'rgba(34, 211, 238, 0.35)',
    accent: '#67e8f9',
  },
  shortBreak: {
    scene: ['#031A15', '#0F3A2C', '#144A37'],
    orb: ['#34d399', '#2dd4bf'],
    aura: 'rgba(52, 211, 153, 0.34)',
    accent: '#6ee7b7',
  },
  longBreak: {
    scene: ['#1D102F', '#25154A', '#102A59'],
    orb: ['#f472b6', '#60a5fa'],
    aura: 'rgba(244, 114, 182, 0.32)',
    accent: '#f9a8d4',
  },
};

const cardColors = ['rgba(15, 23, 42, 0.78)', 'rgba(15, 23, 42, 0.58)'] as const;

export default function App() {
  usePomodoroTicker();
  const [taskTitle, setTaskTitle] = useState('');
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [isAmbientOn, setIsAmbientOn] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const presets = usePomodoroStore((state) => state.presets);
  const selectedPresetId = usePomodoroStore((state) => state.selectedPresetId);
  const phase = usePomodoroStore((state) => state.phase);
  const secondsLeft = usePomodoroStore((state) => state.secondsLeft);
  const isRunning = usePomodoroStore((state) => state.isRunning);
  const completedFocusSessions = usePomodoroStore((state) => state.completedFocusSessions);
  const tasks = usePomodoroStore((state) => state.tasks);
  const activeTaskId = usePomodoroStore((state) => state.activeTaskId);
  const sessionHistory = usePomodoroStore((state) => state.sessionHistory);
  const start = usePomodoroStore((state) => state.start);
  const pause = usePomodoroStore((state) => state.pause);
  const resetCurrentPhase = usePomodoroStore((state) => state.resetCurrentPhase);
  const skipPhase = usePomodoroStore((state) => state.skipPhase);
  const selectPreset = usePomodoroStore((state) => state.selectPreset);
  const addTask = usePomodoroStore((state) => state.addTask);
  const toggleTask = usePomodoroStore((state) => state.toggleTask);
  const setActiveTask = usePomodoroStore((state) => state.setActiveTask);

  const pulseAnim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const prevCompletedRef = useRef(completedFocusSessions);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeTask = tasks.find((task) => task.id === activeTaskId) ?? null;
  const selectedPreset = useMemo(
    () => presets.find((preset) => preset.id === selectedPresetId) ?? presets[0],
    [presets, selectedPresetId],
  );
  const phaseTheme = phaseThemes[phase];
  const phaseTotalSeconds =
    phase === 'focus'
      ? selectedPreset.focusMinutes * 60
      : phase === 'shortBreak'
        ? selectedPreset.shortBreakMinutes * 60
        : selectedPreset.longBreakMinutes * 60;
  const progressValue = phaseTotalSeconds > 0 ? secondsLeft / phaseTotalSeconds : 0;

  const showToast = (message: string): void => {
    setToastMessage(message);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 1800);
  };

  const triggerActionFeedback = async (): Promise<void> => {
    await Haptics.selectionAsync().catch(() => undefined);
    if (isSoundOn) {
      await playActionBeep();
    }
  };

  const triggerResetFeedback = async (): Promise<void> => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    if (isSoundOn) {
      await playSoftResetBeep();
    }
  };

  const triggerCompletionFeedback = async (): Promise<void> => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    if (isSoundOn) {
      await playCompletionChime();
    }
  };

  const handleAddTask = (): void => {
    addTask(taskTitle);
    setTaskTitle('');
  };

  const getPresetLabel = (presetId: string): string => {
    return presets.find((preset) => preset.id === presetId)?.label ?? 'Bilinmeyen preset';
  };

  const handleStartPause = async (): Promise<void> => {
    await triggerActionFeedback();
    if (isRunning) {
      pause();
      showToast('Odak ritmi korundu. Duraklatıldı.');
      return;
    }

    start();
    showToast('Akış başladı. Derin odağa geçiş yapıldı.');
  };

  const handleReset = async (): Promise<void> => {
    await triggerResetFeedback();
    resetCurrentPhase();
    showToast('Zamanlayıcı sıfırlandı.');
  };

  const handleSkip = async (): Promise<void> => {
    await triggerActionFeedback();
    skipPhase();
    showToast('Yeni faza geçildi.');
  };

  const handleSelectPreset = async (presetId: string): Promise<void> => {
    if (presetId === selectedPresetId) {
      return;
    }
    await triggerActionFeedback();
    selectPreset(presetId);
    showToast('Preset değiştirildi.');
  };

  const handleAmbientToggle = async (): Promise<void> => {
    if (isAmbientOn) {
      stopAmbientPad();
      setIsAmbientOn(false);
      showToast('Ambiyans kapatıldı.');
      await triggerActionFeedback();
      return;
    }

    const started = await startAmbientPad();
    if (started) {
      setIsAmbientOn(true);
      showToast('Ambiyans açıldı.');
      await triggerActionFeedback();
      return;
    }

    showToast('Bu cihazda ambiyans desteklenmiyor.');
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
  };

  const handleSoundToggle = async (): Promise<void> => {
    if (isSoundOn) {
      setIsSoundOn(false);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      showToast('Ses efektleri kapalı.');
      return;
    }

    setIsSoundOn(true);
    await triggerActionFeedback();
    showToast('Ses efektleri açık.');
  };

  useEffect(() => {
    if (!isRunning) {
      pulseAnim.stopAnimation();
      Animated.timing(pulseAnim, {
        toValue: 0,
        duration: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      return;
    }

    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );
    pulseLoop.start();

    return () => {
      pulseLoop.stop();
    };
  }, [isRunning, pulseAnim]);

  useEffect(() => {
    const shimmerLoop = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2400,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    );
    shimmerLoop.start();

    return () => {
      shimmerLoop.stop();
    };
  }, [shimmerAnim]);

  useEffect(() => {
    if (completedFocusSessions > prevCompletedRef.current) {
      triggerCompletionFeedback().catch(() => undefined);
      showToast('Pomodoro tamamlandı. Harika gidiyorsun!');
    }
    prevCompletedRef.current = completedFocusSessions;
  }, [completedFocusSessions]);

  useEffect(() => {
    return () => {
      stopAmbientPad();
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const pulseScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });
  const pulseOpacity = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.34, 0.72],
  });
  const shimmerTranslate = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-180, 260],
  });

  return (
    <LinearGradient colors={phaseTheme.scene} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.brand}>Pomodoro Aether</Text>
          <Text style={styles.headline}>Derin odak için sinematik deneyim</Text>

          <LinearGradient colors={cardColors} style={styles.glassCard}>
            <View style={styles.topControls}>
              <Pressable style={styles.ghostToggle} onPress={handleSoundToggle}>
                <Text style={styles.ghostToggleText}>{isSoundOn ? 'Ses: Açık' : 'Ses: Kapalı'}</Text>
              </Pressable>
              <Pressable style={styles.ghostToggle} onPress={handleAmbientToggle}>
                <Text style={styles.ghostToggleText}>
                  {isAmbientOn ? 'Ambiyans: Açık' : 'Ambiyans: Kapalı'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.orbStack}>
              <Animated.View
                style={[
                  styles.orbAura,
                  {
                    backgroundColor: phaseTheme.aura,
                    opacity: pulseOpacity,
                    transform: [{ scale: pulseScale }],
                  },
                ]}
              />
              <LinearGradient colors={phaseTheme.orb} style={styles.timerOrb}>
                <Text style={styles.phase}>{phaseLabels[phase]}</Text>
                <Text style={styles.timer}>{formatSeconds(secondsLeft)}</Text>
                <Text style={styles.meta}>Aktif görev: {activeTask ? activeTask.title : 'Seçilmedi'}</Text>
                <Text style={styles.meta}>Tamamlanan odak seansı: {completedFocusSessions}</Text>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.max(6, Math.round(progressValue * 100))}%`,
                        backgroundColor: phaseTheme.accent,
                      },
                    ]}
                  />
                </View>
              </LinearGradient>
              <Animated.View
                style={[
                  styles.shimmerStripe,
                  {
                    transform: [{ translateX: shimmerTranslate }, { rotate: '18deg' }],
                  },
                ]}
              />
            </View>

            <View style={styles.actionsRow}>
              <Pressable style={[styles.button, styles.primaryButton]} onPress={handleStartPause}>
                <Text style={styles.primaryButtonText}>{isRunning ? 'Durdur' : 'Başlat'}</Text>
              </Pressable>
            </View>

            <View style={styles.actionsRow}>
              <Pressable style={[styles.button, styles.secondaryButton]} onPress={handleReset}>
                <Text style={styles.secondaryButtonText}>Sıfırla</Text>
              </Pressable>
              <Pressable style={[styles.button, styles.secondaryButton]} onPress={handleSkip}>
                <Text style={styles.secondaryButtonText}>Fazı Geç</Text>
              </Pressable>
            </View>
          </LinearGradient>

          <View style={styles.presetRow}>
            {presets.map((preset) => {
              const isSelected = preset.id === selectedPresetId;
              return (
                <Pressable
                  key={preset.id}
                  style={[styles.presetChip, isSelected && styles.presetChipActive]}
                  onPress={() => handleSelectPreset(preset.id)}
                >
                  <Text style={[styles.presetText, isSelected && styles.presetTextActive]}>
                    {preset.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <LinearGradient colors={cardColors} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Görevler</Text>
            <View style={styles.taskComposerRow}>
              <TextInput
                value={taskTitle}
                onChangeText={setTaskTitle}
                placeholder="Yeni görev ekle"
                placeholderTextColor="#94a3b8"
                style={styles.taskInput}
                onSubmitEditing={handleAddTask}
              />
              <Pressable
                style={styles.addTaskButton}
                onPress={async () => {
                  if (!taskTitle.trim()) {
                    return;
                  }
                  await triggerActionFeedback();
                  handleAddTask();
                  showToast('Yeni görev eklendi.');
                }}
              >
                <Text style={styles.addTaskButtonText}>Ekle</Text>
              </Pressable>
            </View>

            {tasks.length === 0 ? (
              <Text style={styles.emptyText}>Görev ekle, odak seansını bağla ve akışı başlat.</Text>
            ) : (
              tasks.map((task) => {
                const isActive = task.id === activeTaskId;
                return (
                  <View key={task.id} style={[styles.taskRow, isActive && styles.taskRowActive]}>
                    <Pressable
                      style={styles.taskMain}
                      onPress={async () => {
                        await triggerActionFeedback();
                        setActiveTask(task.completed ? null : task.id);
                        showToast(task.completed ? 'Tamamlanan görev seçilemez.' : 'Aktif görev değişti.');
                      }}
                    >
                      <Text style={[styles.taskTitle, task.completed && styles.taskTitleDone]}>
                        {task.title}
                      </Text>
                      <Text style={styles.taskState}>
                        {task.completed ? 'Tamamlandı' : isActive ? 'Aktif' : 'Bekliyor'}
                      </Text>
                    </Pressable>
                    <Pressable
                      style={styles.taskToggleButton}
                      onPress={async () => {
                        await triggerActionFeedback();
                        toggleTask(task.id);
                      }}
                    >
                      <Text style={styles.taskToggleButtonText}>
                        {task.completed ? 'Geri Al' : 'Bitti'}
                      </Text>
                    </Pressable>
                  </View>
                );
              })
            )}
          </LinearGradient>

          <LinearGradient colors={cardColors} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Seans Geçmişi</Text>
            {sessionHistory.length === 0 ? (
              <Text style={styles.emptyText}>Henüz tamamlanan odak seansı yok.</Text>
            ) : (
              sessionHistory.map((session) => {
                const linkedTask = tasks.find((task) => task.id === session.taskId);
                return (
                  <View key={session.id} style={styles.sessionRow}>
                    <View>
                      <Text style={styles.sessionDuration}>{formatSeconds(session.durationSeconds)}</Text>
                      <Text style={styles.sessionMeta}>
                        {getPresetLabel(session.presetId)} •{' '}
                        {new Date(session.completedAt).toLocaleTimeString('tr-TR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                    <Text style={styles.sessionTask} numberOfLines={1}>
                      {linkedTask ? linkedTask.title : 'Görevsiz seans'}
                    </Text>
                  </View>
                );
              })
            )}
          </LinearGradient>
        </ScrollView>

        {toastMessage ? (
          <View style={styles.toastWrap}>
            <Text style={styles.toastText}>{toastMessage}</Text>
          </View>
        ) : null}

        <StatusBar style="light" />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 64,
    alignItems: 'center',
  },
  brand: {
    color: '#b2f5ff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginTop: 8,
  },
  headline: {
    color: '#f5f3ff',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 16,
  },
  glassCard: {
    width: '100%',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.24)',
    padding: 16,
    overflow: 'hidden',
    marginBottom: 14,
  },
  topControls: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 10,
  },
  ghostToggle: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.5)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: 'rgba(15, 23, 42, 0.44)',
  },
  ghostToggleText: {
    color: '#e2e8f0',
    fontSize: 12,
    fontWeight: '700',
  },
  orbStack: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 320,
    marginBottom: 8,
  },
  orbAura: {
    position: 'absolute',
    width: 276,
    height: 276,
    borderRadius: 138,
  },
  timerOrb: {
    width: 248,
    height: 248,
    borderRadius: 124,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: 'rgba(248, 250, 252, 0.35)',
    shadowColor: '#0ea5e9',
    shadowOpacity: 0.34,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 14,
  },
  shimmerStripe: {
    position: 'absolute',
    width: 120,
    height: 360,
    backgroundColor: 'rgba(248, 250, 252, 0.16)',
    borderRadius: 999,
  },
  presetRow: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 10,
  },
  presetChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.44)',
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  presetChipActive: {
    borderColor: '#8b5cf6',
    backgroundColor: 'rgba(139, 92, 246, 0.22)',
  },
  presetText: {
    color: '#dbeafe',
    fontSize: 13,
    fontWeight: '700',
  },
  presetTextActive: {
    color: '#ddd6fe',
  },
  phase: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  timer: {
    color: '#f8fafc',
    fontSize: 58,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  meta: {
    color: 'rgba(248, 250, 252, 0.86)',
    fontSize: 12,
    fontWeight: '600',
  },
  progressTrack: {
    marginTop: 10,
    width: 158,
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  actionsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },
  button: {
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
    minWidth: 128,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#f8fafc',
  },
  primaryButtonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: 'rgba(15, 23, 42, 0.52)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.44)',
  },
  secondaryButtonText: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionCard: {
    width: '100%',
    borderRadius: 18,
    padding: 16,
    marginTop: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.22)',
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  taskComposerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  taskInput: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.54)',
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.42)',
    borderRadius: 12,
    color: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  addTaskButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  addTaskButtonText: {
    color: '#f5f3ff',
    fontWeight: '700',
    fontSize: 14,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)',
    padding: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.36)',
  },
  taskRowActive: {
    borderColor: '#a78bfa',
    backgroundColor: 'rgba(76, 29, 149, 0.42)',
  },
  taskMain: {
    flex: 1,
    gap: 2,
  },
  taskTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '600',
  },
  taskTitleDone: {
    color: '#cbd5e1',
    textDecorationLine: 'line-through',
  },
  taskState: {
    color: '#bfdbfe',
    fontSize: 12,
  },
  taskToggleButton: {
    backgroundColor: 'rgba(15, 23, 42, 0.54)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  taskToggleButtonText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  sessionRow: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.3)',
    padding: 10,
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  sessionDuration: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  sessionMeta: {
    color: '#bfdbfe',
    fontSize: 12,
  },
  sessionTask: {
    color: '#d8b4fe',
    fontSize: 13,
    fontWeight: '600',
  },
  toastWrap: {
    position: 'absolute',
    bottom: 26,
    left: 20,
    right: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.44)',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  toastText: {
    color: '#f8fafc',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '700',
  },
});
