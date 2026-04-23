import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useKeepAwake } from 'expo-keep-awake';
import Slider from '@react-native-community/slider';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { CircularTimer } from '../components/CircularTimer';
import { PomodoroChain } from '../components/PomodoroChain';
import { SceneBackground } from '../components/SceneBackground';
import { AmbiancePicker } from '../components/AmbiancePicker';
import { useApp } from '../context/AppContext';
import { useAmbiance } from '../context/AmbianceContext';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { getTopicById, getSectionsForTrack } from '../data/curriculum';
import { FocusPresetId } from '../storage/types';
import {
  breakStartMessages,
  focusCompleteMessages,
  focusStartMessages,
  longBreakCompleteMessages,
  longBreakMessages,
  pickRandom,
} from '../lib/motivations';

interface Props {
  route?: any;
  navigation: any;
}

type Phase = 'focus' | 'break' | 'long_break';
type TimerState = 'idle' | 'running' | 'paused';

interface FocusPreset {
  id: FocusPresetId;
  title: string;
  subtitle: string;
  focus: number;
  break: number;
  longBreak: number;
  pomodorosUntilLong: number;
}

const PRESETS: FocusPreset[] = [
  {
    id: 'classic',
    title: 'Klasik',
    subtitle: '25 / 5',
    focus: 25,
    break: 5,
    longBreak: 15,
    pomodorosUntilLong: 4,
  },
  {
    id: 'short',
    title: 'Kısa',
    subtitle: '15 / 3',
    focus: 15,
    break: 3,
    longBreak: 10,
    pomodorosUntilLong: 4,
  },
  {
    id: 'long',
    title: 'Uzun',
    subtitle: '50 / 10',
    focus: 50,
    break: 10,
    longBreak: 20,
    pomodorosUntilLong: 3,
  },
  {
    id: 'deep',
    title: 'Derin',
    subtitle: '90 / 20',
    focus: 90,
    break: 20,
    longBreak: 30,
    pomodorosUntilLong: 2,
  },
];

export const FocusScreen: React.FC<Props> = ({ route, navigation }) => {
  const { state, addSession, updateSettings } = useApp();
  const { settings } = state;
  const {
    ambiance,
    setAmbianceById,
    volume,
    setVolume,
    muted,
    toggleMute,
    playing: ambiancePlaying,
    play: playAmbiance,
    stop: stopAmbiance,
  } = useAmbiance();

  const initialTopicId = (route?.params as any)?.topicId as string | undefined;
  const [selectedTopicId, setSelectedTopicId] = useState<string | undefined>(
    initialTopicId,
  );
  const [phase, setPhase] = useState<Phase>('focus');
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [remaining, setRemaining] = useState(settings.focusMinutes * 60);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [ambianceSheetOpen, setAmbianceSheetOpen] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [motivation, setMotivation] = useState<string>(() =>
    pickRandom(focusStartMessages),
  );
  const [immersive, setImmersive] = useState(false);

  const totalRef = useRef(settings.focusMinutes * 60);
  const startedAtRef = useRef<number | null>(null);
  const accumulatedFocusRef = useRef(0);
  const motivationFade = useRef(new Animated.Value(1)).current;

  const keepOn = settings.keepScreenOn && timerState === 'running';
  useKeepAwake(keepOn ? 'kpss-focus' : undefined);

  const phaseColor =
    phase === 'focus'
      ? ambiance.accent
      : phase === 'long_break'
        ? colors.accent
        : colors.success;

  const phaseLabel =
    phase === 'focus'
      ? 'ODAK'
      : phase === 'long_break'
        ? 'UZUN MOLA'
        : 'MOLA';

  const durationForPhase = useCallback(
    (p: Phase): number => {
      if (p === 'focus') return settings.focusMinutes * 60;
      if (p === 'long_break') return settings.longBreakMinutes * 60;
      return settings.breakMinutes * 60;
    },
    [
      settings.focusMinutes,
      settings.breakMinutes,
      settings.longBreakMinutes,
    ],
  );

  useEffect(() => {
    if (timerState === 'idle') {
      const total = durationForPhase(phase);
      totalRef.current = total;
      setRemaining(total);
    }
  }, [phase, timerState, durationForPhase]);

  useEffect(() => {
    if (timerState !== 'running') return;
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handlePhaseComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerState]);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(motivationFade, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(motivationFade, {
        toValue: 1,
        duration: 320,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [motivation, motivationFade]);

  const topicData = selectedTopicId ? getTopicById(selectedTopicId) : null;
  const sectionsForTrack = useMemo(
    () => getSectionsForTrack(settings.track),
    [settings.track],
  );

  const triggerHaptics = (style: Haptics.ImpactFeedbackStyle) => {
    if (!settings.hapticsEnabled) return;
    Haptics.impactAsync(style).catch(() => {});
  };
  const notificationHaptic = (type: Haptics.NotificationFeedbackType) => {
    if (!settings.hapticsEnabled) return;
    Haptics.notificationAsync(type).catch(() => {});
  };

  const computeElapsedFocus = () => {
    let total = accumulatedFocusRef.current;
    if (timerState === 'running' && startedAtRef.current) {
      total += Math.floor((Date.now() - startedAtRef.current) / 1000);
    }
    return total;
  };

  const logFocusSession = () => {
    const seconds = computeElapsedFocus();
    if (seconds < 30) return;
    const topic = selectedTopicId ? getTopicById(selectedTopicId) : null;
    addSession({
      id: `s_${Date.now()}`,
      topicId: selectedTopicId,
      subjectId: topic?.subject.id,
      durationSeconds: seconds,
      mode: 'focus',
      endedAt: Date.now(),
    });
  };

  const resetAccumulators = () => {
    accumulatedFocusRef.current = 0;
    startedAtRef.current = null;
  };

  const start = async () => {
    startedAtRef.current = Date.now();
    setTimerState('running');
    triggerHaptics(Haptics.ImpactFeedbackStyle.Medium);
    if (!ambiancePlaying && ambiance.id !== 'silent') {
      playAmbiance().catch(() => {});
    }
  };

  const pause = () => {
    if (phase === 'focus' && startedAtRef.current) {
      const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
      accumulatedFocusRef.current += Math.max(0, elapsed);
      startedAtRef.current = null;
    }
    setTimerState('paused');
    triggerHaptics(Haptics.ImpactFeedbackStyle.Light);
  };

  const resume = () => {
    startedAtRef.current = Date.now();
    setTimerState('running');
    triggerHaptics(Haptics.ImpactFeedbackStyle.Medium);
  };

  const stop = () => {
    const confirm = () => {
      if (phase === 'focus') logFocusSession();
      resetAccumulators();
      setPhase('focus');
      setTimerState('idle');
      const total = durationForPhase('focus');
      totalRef.current = total;
      setRemaining(total);
      setMotivation(pickRandom(focusStartMessages));
      notificationHaptic(Haptics.NotificationFeedbackType.Warning);
      stopAmbiance().catch(() => {});
    };
    if (settings.deepFocusEnabled && phase === 'focus') {
      Alert.alert(
        'Derin Odak Aktif',
        'Seansı erken bitirmek ister misin?',
        [
          { text: 'Devam Et', style: 'cancel' },
          { text: 'Yine de Bitir', style: 'destructive', onPress: confirm },
        ],
      );
      return;
    }
    Alert.alert('Seansı bitir', 'Bu seansı bitirmek istiyor musun?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Bitir', style: 'destructive', onPress: confirm },
    ]);
  };

  const addFiveMinutes = () => {
    setRemaining((r) => r + 5 * 60);
    totalRef.current = totalRef.current + 5 * 60;
    triggerHaptics(Haptics.ImpactFeedbackStyle.Light);
  };

  const skipPhase = () => {
    if (phase === 'focus') return;
    handlePhaseComplete(true);
    triggerHaptics(Haptics.ImpactFeedbackStyle.Medium);
  };

  const goToPhase = (next: Phase, autoStart: boolean) => {
    setPhase(next);
    const total = durationForPhase(next);
    totalRef.current = total;
    setRemaining(total);
    resetAccumulators();
    if (next === 'focus') {
      setMotivation(pickRandom(focusStartMessages));
    } else if (next === 'long_break') {
      setMotivation(pickRandom(longBreakMessages));
    } else {
      setMotivation(pickRandom(breakStartMessages));
    }
    if (autoStart) {
      startedAtRef.current = Date.now();
      setTimerState('running');
    } else {
      setTimerState('idle');
    }
  };

  const handlePhaseComplete = (skipped = false) => {
    notificationHaptic(Haptics.NotificationFeedbackType.Success);
    if (phase === 'focus') {
      if (!skipped) logFocusSession();
      const nextCompleted = completedPomodoros + 1;
      setCompletedPomodoros(nextCompleted);
      setMotivation(pickRandom(focusCompleteMessages));
      const isLong =
        settings.pomodorosUntilLongBreak > 0 &&
        nextCompleted % settings.pomodorosUntilLongBreak === 0;
      goToPhase(isLong ? 'long_break' : 'break', settings.autoStartBreaks);
    } else {
      if (phase === 'long_break') {
        setMotivation(pickRandom(longBreakCompleteMessages));
      }
      goToPhase('focus', settings.autoStartNextFocus);
    }
  };

  const applyPreset = (preset: FocusPreset) => {
    updateSettings({
      focusMinutes: preset.focus,
      breakMinutes: preset.break,
      longBreakMinutes: preset.longBreak,
      pomodorosUntilLongBreak: preset.pomodorosUntilLong,
      focusPresetId: preset.id,
    });
    if (timerState === 'idle') {
      const total =
        phase === 'focus'
          ? preset.focus * 60
          : phase === 'long_break'
            ? preset.longBreak * 60
            : preset.break * 60;
      totalRef.current = total;
      setRemaining(total);
    }
    triggerHaptics(Haptics.ImpactFeedbackStyle.Light);
  };

  const subtitle = topicData
    ? `${topicData.subject.title} • ${topicData.topic.title}`
    : phase === 'focus'
      ? ambiance.subtitle
      : 'Molanı değerlendir';

  const running = timerState === 'running';
  const { width: windowW, height: windowH } = Dimensions.get('window');

  return (
    <View style={styles.safe}>
      <SceneBackground
        ambiance={ambiance}
        width={windowW}
        height={windowH}
      />
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: '#000',
            opacity: immersive ? 0.1 : 0.22,
          },
        ]}
      />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            immersive && { paddingBottom: 0 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topBar}>
            <Pressable
              onPress={() => setAmbianceSheetOpen(true)}
              style={({ pressed }) => [
                styles.ambiancePill,
                {
                  borderColor: ambiance.accent,
                  backgroundColor: ambiance.accent + '22',
                },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.ambianceEmoji}>{ambiance.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.ambianceTitle,
                    { color: ambiance.accent },
                  ]}
                  numberOfLines={1}
                >
                  {ambiance.title}
                </Text>
                <Text style={styles.ambianceSub} numberOfLines={1}>
                  Değiştir
                </Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => setImmersive((v) => !v)}
              style={({ pressed }) => [
                styles.iconBtn,
                pressed && { opacity: 0.85 },
              ]}
            >
              <Text style={styles.iconBtnText}>
                {immersive ? '↙' : '↗'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.topArea}>
            <Animated.Text
              style={[styles.motivation, { opacity: motivationFade }]}
              numberOfLines={2}
            >
              {motivation}
            </Animated.Text>
          </View>

          <View style={styles.timerArea}>
            <CircularTimer
              size={290}
              remainingSeconds={remaining}
              totalSeconds={totalRef.current}
              color={phaseColor}
              phaseLabel={phaseLabel}
              running={running}
              paused={timerState === 'paused'}
              subtitle={subtitle}
            />
          </View>

          <View style={styles.chainWrap}>
            <PomodoroChain
              total={settings.pomodorosUntilLongBreak}
              completed={
                completedPomodoros % settings.pomodorosUntilLongBreak
              }
              active={phase === 'focus'}
              color={phaseColor}
            />
            <Text style={styles.chainText}>
              Bu set: {completedPomodoros % settings.pomodorosUntilLongBreak}/
              {settings.pomodorosUntilLongBreak} • Bugün tamamlanan:{' '}
              {completedPomodoros}
            </Text>
          </View>

          <View style={styles.controls}>
            {timerState === 'idle' && (
              <Button
                title={
                  phase === 'focus'
                    ? 'Başlat'
                    : phase === 'long_break'
                      ? 'Uzun Molaya Başla'
                      : 'Molaya Başla'
                }
                onPress={start}
                fullWidth
              />
            )}

            {timerState === 'running' && (
              <>
                <View style={styles.rowBtns}>
                  <Button
                    title="Duraklat"
                    variant="secondary"
                    onPress={pause}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Bitir"
                    variant="danger"
                    onPress={stop}
                    style={{ flex: 1 }}
                  />
                </View>
                <View style={styles.rowBtns}>
                  <Button
                    title="+5 Dakika"
                    variant="ghost"
                    onPress={addFiveMinutes}
                    style={{ flex: 1 }}
                  />
                  {phase !== 'focus' && (
                    <Button
                      title="Molayı Atla"
                      variant="ghost"
                      onPress={skipPhase}
                      style={{ flex: 1 }}
                    />
                  )}
                </View>
              </>
            )}

            {timerState === 'paused' && (
              <>
                <View style={styles.rowBtns}>
                  <Button
                    title="Devam Et"
                    onPress={resume}
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Bitir"
                    variant="danger"
                    onPress={stop}
                    style={{ flex: 1 }}
                  />
                </View>
                {phase !== 'focus' && (
                  <Button
                    title="Molayı Atla"
                    variant="ghost"
                    onPress={skipPhase}
                  />
                )}
              </>
            )}
          </View>

          <GlassCard>
            <View style={styles.volumeRow}>
              <Pressable
                onPress={toggleMute}
                style={({ pressed }) => [
                  styles.muteBtn,
                  {
                    borderColor: muted ? colors.textDim : ambiance.accent,
                    backgroundColor: muted
                      ? colors.bgSoft
                      : ambiance.accent + '22',
                  },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text
                  style={[
                    styles.muteText,
                    { color: muted ? colors.textDim : ambiance.accent },
                  ]}
                >
                  {muted ? '🔇' : '🔊'}
                </Text>
              </Pressable>
              <Slider
                style={{ flex: 1 }}
                minimumValue={0}
                maximumValue={1}
                step={0.01}
                value={volume}
                onValueChange={setVolume}
                minimumTrackTintColor={ambiance.accent}
                maximumTrackTintColor={colors.border}
                thumbTintColor={ambiance.accent}
                disabled={muted || ambiance.id === 'silent'}
              />
              <Pressable
                onPress={() =>
                  ambiancePlaying ? stopAmbiance() : playAmbiance()
                }
                style={({ pressed }) => [
                  styles.muteBtn,
                  {
                    borderColor: ambiance.accent,
                    backgroundColor: ambiancePlaying
                      ? ambiance.accent + '33'
                      : colors.bgSoft,
                  },
                  pressed && { opacity: 0.85 },
                ]}
              >
                <Text
                  style={[styles.muteText, { color: ambiance.accent }]}
                >
                  {ambiancePlaying ? '⏸' : '▶'}
                </Text>
              </Pressable>
            </View>
            {Platform.OS === 'web' && (
              <Text style={styles.hint}>
                Ses yalnızca mobil cihazda çalışır (web'de video sessizdir).
              </Text>
            )}
          </GlassCard>

          {!immersive && (
            <>
              <GlassCard>
                <Text style={styles.cardLabel}>Mod</Text>
                <View style={styles.presetRow}>
                  {PRESETS.map((p) => {
                    const active = settings.focusPresetId === p.id;
                    return (
                      <Pressable
                        key={p.id}
                        onPress={() => applyPreset(p)}
                        style={({ pressed }) => [
                          styles.presetItem,
                          {
                            borderColor: active ? phaseColor : colors.border,
                            backgroundColor: active
                              ? phaseColor + '22'
                              : 'rgba(0,0,0,0.25)',
                          },
                          pressed && { opacity: 0.85 },
                        ]}
                      >
                        <Text
                          style={[
                            styles.presetTitle,
                            { color: active ? phaseColor : colors.text },
                          ]}
                        >
                          {p.title}
                        </Text>
                        <Text style={styles.presetSub}>{p.subtitle}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </GlassCard>

              <GlassCard>
                <View style={styles.rowBetween}>
                  <Text style={styles.cardLabel}>Derin Odak</Text>
                  <Pressable
                    onPress={() =>
                      updateSettings({
                        deepFocusEnabled: !settings.deepFocusEnabled,
                      })
                    }
                    style={({ pressed }) => [
                      styles.toggle,
                      {
                        backgroundColor: settings.deepFocusEnabled
                          ? ambiance.accent
                          : colors.bgSoft,
                        borderColor: settings.deepFocusEnabled
                          ? ambiance.accent
                          : colors.border,
                      },
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleDot,
                        {
                          transform: [
                            {
                              translateX: settings.deepFocusEnabled ? 18 : 0,
                            },
                          ],
                        },
                      ]}
                    />
                  </Pressable>
                </View>
                <Text style={styles.muted}>
                  Açıkken erken bitiş onay ister, ekran uyanık kalır.
                </Text>
              </GlassCard>

              <GlassCard>
                <Text style={styles.cardLabel}>Çalışılan Konu</Text>
                {topicData ? (
                  <View>
                    <Text style={styles.topicLine}>
                      {topicData.section.title} • {topicData.subject.title}
                    </Text>
                    <Text style={styles.topicTitle}>
                      {topicData.topic.title}
                    </Text>
                    <View style={{ height: spacing.sm }} />
                    <Button
                      title="Konu Seçimini Değiştir"
                      variant="secondary"
                      onPress={() => setPickerOpen((v) => !v)}
                    />
                    {selectedTopicId && (
                      <>
                        <View style={{ height: spacing.xs }} />
                        <Button
                          title="Konu Seçimini Kaldır"
                          variant="ghost"
                          onPress={() => setSelectedTopicId(undefined)}
                        />
                      </>
                    )}
                  </View>
                ) : (
                  <View>
                    <Text style={styles.muted}>
                      Konu seçersen süre o konuya kaydedilir.
                    </Text>
                    <View style={{ height: spacing.sm }} />
                    <Button
                      title="Konu Seç"
                      variant="secondary"
                      onPress={() => setPickerOpen((v) => !v)}
                    />
                  </View>
                )}

                {pickerOpen && (
                  <View style={{ marginTop: spacing.md }}>
                    {sectionsForTrack.map((section) =>
                      section.subjects.map((subject) => (
                        <View
                          key={subject.id}
                          style={{ marginBottom: spacing.sm }}
                        >
                          <Text style={styles.pickerSubject}>
                            {subject.title}
                          </Text>
                          <View style={styles.topicsWrap}>
                            {subject.topics.map((topic) => {
                              const active =
                                topic.id === selectedTopicId;
                              return (
                                <Pressable
                                  key={topic.id}
                                  onPress={() => {
                                    setSelectedTopicId(topic.id);
                                    setPickerOpen(false);
                                  }}
                                  style={({ pressed }) => [
                                    styles.topicChip,
                                    {
                                      borderColor: active
                                        ? subject.color
                                        : colors.border,
                                      backgroundColor: active
                                        ? subject.color + '22'
                                        : 'rgba(0,0,0,0.25)',
                                    },
                                    pressed && { opacity: 0.85 },
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.topicChipText,
                                      {
                                        color: active
                                          ? subject.color
                                          : colors.text,
                                      },
                                    ]}
                                  >
                                    {topic.title}
                                  </Text>
                                </Pressable>
                              );
                            })}
                          </View>
                        </View>
                      )),
                    )}
                  </View>
                )}
              </GlassCard>
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      <AmbiancePicker
        visible={ambianceSheetOpen}
        activeId={ambiance.id}
        onClose={() => setAmbianceSheetOpen(false)}
        onSelect={(id) => {
          setAmbianceById(id).catch(() => {});
        }}
      />
    </View>
  );
};

const GlassCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <View style={styles.glass}>{children}</View>
);

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ambiancePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 8,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  ambianceEmoji: { fontSize: 22 },
  ambianceTitle: { fontSize: 14, fontWeight: '700' },
  ambianceSub: { color: colors.textMuted, fontSize: 11 },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnText: { color: colors.text, fontSize: 18, fontWeight: '700' },
  topArea: { alignItems: 'center', marginTop: spacing.xs },
  motivation: {
    color: colors.text,
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: spacing.md,
    lineHeight: 20,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 6,
  },
  timerArea: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  chainWrap: {
    alignItems: 'center',
    gap: spacing.xs,
    marginVertical: spacing.xs,
  },
  chainText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowRadius: 4,
  },
  controls: { gap: spacing.sm, marginTop: spacing.xs },
  rowBtns: { flexDirection: 'row', gap: spacing.sm },
  glass: {
    backgroundColor: 'rgba(10,15,30,0.32)',
    borderColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  cardLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  presetRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  presetItem: {
    flexGrow: 1,
    flexBasis: '22%',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 70,
  },
  presetTitle: { fontSize: 13, fontWeight: '700' },
  presetSub: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  toggle: {
    width: 42,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    padding: 2,
    justifyContent: 'center',
  },
  toggleDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.white,
  },
  muted: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  topicLine: { color: colors.textMuted, fontSize: 12 },
  topicTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  pickerSubject: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  topicsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  topicChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  topicChipText: { fontSize: 12, fontWeight: '500' },
  volumeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  muteBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  muteText: { fontSize: 16 },
  hint: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

void screenWidth;
