import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Card } from '../components/Card';
import { Header } from '../components/Header';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';
import { formatClock } from '../utils/format';
import { getTopicById, getSectionsForTrack } from '../data/curriculum';

interface Props {
  route?: any;
  navigation: any;
}

type Phase = 'focus' | 'break';
type TimerState = 'idle' | 'running' | 'paused' | 'finished';

export const FocusScreen: React.FC<Props> = ({ route, navigation }) => {
  const { state, addSession } = useApp();
  const { settings } = state;

  const initialTopicId = (route?.params as any)?.topicId as string | undefined;
  const [selectedTopicId, setSelectedTopicId] = useState<string | undefined>(
    initialTopicId,
  );
  const [phase, setPhase] = useState<Phase>('focus');
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [remaining, setRemaining] = useState(settings.focusMinutes * 60);
  const [pickerOpen, setPickerOpen] = useState(false);

  const totalRef = useRef(settings.focusMinutes * 60);
  const startedAtRef = useRef<number | null>(null);
  const accumulatedFocusRef = useRef(0);

  useEffect(() => {
    if (timerState === 'idle') {
      const total =
        phase === 'focus'
          ? settings.focusMinutes * 60
          : settings.breakMinutes * 60;
      totalRef.current = total;
      setRemaining(total);
    }
  }, [settings.focusMinutes, settings.breakMinutes, phase, timerState]);

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

  const topicData = selectedTopicId ? getTopicById(selectedTopicId) : null;
  const sectionsForTrack = useMemo(
    () => getSectionsForTrack(settings.track),
    [settings.track],
  );

  const triggerHaptics = (style: Haptics.ImpactFeedbackStyle) => {
    if (!settings.hapticsEnabled) return;
    Haptics.impactAsync(style).catch(() => {});
  };

  const start = () => {
    startedAtRef.current = Date.now();
    setTimerState('running');
    triggerHaptics(Haptics.ImpactFeedbackStyle.Medium);
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
    Alert.alert('Seansı bitir', 'Çalışma seansını bitirmek istiyor musun?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Bitir',
        style: 'destructive',
        onPress: finishAndLog,
      },
    ]);
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

  const resetTimers = () => {
    accumulatedFocusRef.current = 0;
    startedAtRef.current = null;
  };

  const finishAndLog = () => {
    if (phase === 'focus') logFocusSession();
    resetTimers();
    setPhase('focus');
    setTimerState('idle');
    setRemaining(settings.focusMinutes * 60);
    totalRef.current = settings.focusMinutes * 60;
    triggerHaptics(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const handlePhaseComplete = () => {
    triggerHaptics(Haptics.ImpactFeedbackStyle.Heavy);
    if (phase === 'focus') {
      logFocusSession();
      resetTimers();
      setPhase('break');
      const next = settings.breakMinutes * 60;
      totalRef.current = next;
      setRemaining(next);
      setTimerState('idle');
    } else {
      setPhase('focus');
      const next = settings.focusMinutes * 60;
      totalRef.current = next;
      setRemaining(next);
      setTimerState('idle');
    }
  };

  const phaseColor = phase === 'focus' ? colors.primary : colors.success;
  const elapsed = totalRef.current - remaining;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Header
        title="Odaklanma"
        subtitle={
          phase === 'focus'
            ? `${settings.focusMinutes} dk odak + ${settings.breakMinutes} dk mola`
            : 'Mola zamanı'
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Card>
          <View style={styles.phaseRow}>
            <View
              style={[
                styles.phasePill,
                { backgroundColor: phaseColor + '22', borderColor: phaseColor },
              ]}
            >
              <Text style={[styles.phaseText, { color: phaseColor }]}>
                {phase === 'focus' ? 'ODAK' : 'MOLA'}
              </Text>
            </View>
          </View>

          <Text style={[styles.timer, { color: phaseColor }]}>
            {formatClock(remaining)}
          </Text>

          <ProgressBar
            value={elapsed}
            total={totalRef.current}
            color={phaseColor}
            height={6}
          />

          <View style={{ height: spacing.lg }} />

          {timerState === 'idle' && (
            <Button title={phase === 'focus' ? 'Başlat' : 'Molaya Başla'} onPress={start} />
          )}
          {timerState === 'running' && (
            <View style={styles.controlsRow}>
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
          )}
          {timerState === 'paused' && (
            <View style={styles.controlsRow}>
              <Button title="Devam Et" onPress={resume} style={{ flex: 1 }} />
              <Button
                title="Bitir"
                variant="danger"
                onPress={stop}
                style={{ flex: 1 }}
              />
            </View>
          )}
        </Card>

        <Card>
          <Text style={styles.cardLabel}>Çalışılan Konu</Text>
          {topicData ? (
            <View>
              <Text style={styles.topicLine}>
                {topicData.section.title} • {topicData.subject.title}
              </Text>
              <Text style={styles.topicTitle}>{topicData.topic.title}</Text>
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
                Konu seçmeden de odaklanabilirsin. Seçersen süre bu konuya kaydedilir.
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
                  <View key={subject.id} style={{ marginBottom: spacing.sm }}>
                    <Text style={styles.pickerSubject}>{subject.title}</Text>
                    <View style={styles.topicsWrap}>
                      {subject.topics.map((topic) => {
                        const active = topic.id === selectedTopicId;
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
                                borderColor: active ? subject.color : colors.border,
                                backgroundColor: active
                                  ? subject.color + '22'
                                  : colors.bgSoft,
                              },
                              pressed && { opacity: 0.85 },
                            ]}
                          >
                            <Text
                              style={[
                                styles.topicChipText,
                                { color: active ? subject.color : colors.text },
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
        </Card>

        <Card>
          <Text style={styles.cardLabel}>İpuçları</Text>
          <Text style={styles.tip}>• Telefonunu sessize al ve yan çevir.</Text>
          <Text style={styles.tip}>• Her odak seansından sonra küçük bir mola ver.</Text>
          <Text style={styles.tip}>• Bir konu seçersen süre otomatik olarak ona sayılır.</Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xxl,
  },
  phaseRow: { alignItems: 'center', marginBottom: spacing.md },
  phasePill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  phaseText: { fontWeight: '700', letterSpacing: 2, fontSize: 12 },
  timer: {
    fontSize: 72,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: spacing.md,
    fontVariant: ['tabular-nums'],
  },
  controlsRow: { flexDirection: 'row', gap: spacing.sm },
  cardLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  topicLine: { color: colors.textMuted, fontSize: 12 },
  topicTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  muted: { color: colors.textMuted, fontSize: 13 },
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
  tip: { color: colors.textMuted, fontSize: 13, marginBottom: 4 },
});
