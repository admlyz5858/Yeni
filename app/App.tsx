import { StatusBar } from 'expo-status-bar';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { usePomodoroTicker } from './src/hooks/usePomodoroTicker';
import { usePomodoroStore } from './src/store/usePomodoroStore';
import { PomodoroPhase } from './src/types/pomodoro';
import { formatSeconds } from './src/utils/time';

const phaseLabels: Record<PomodoroPhase, string> = {
  focus: 'Odak',
  shortBreak: 'Kısa Mola',
  longBreak: 'Uzun Mola',
};

export default function App() {
  usePomodoroTicker();

  const presets = usePomodoroStore((state) => state.presets);
  const selectedPresetId = usePomodoroStore((state) => state.selectedPresetId);
  const phase = usePomodoroStore((state) => state.phase);
  const secondsLeft = usePomodoroStore((state) => state.secondsLeft);
  const isRunning = usePomodoroStore((state) => state.isRunning);
  const completedFocusSessions = usePomodoroStore((state) => state.completedFocusSessions);
  const start = usePomodoroStore((state) => state.start);
  const pause = usePomodoroStore((state) => state.pause);
  const resetCurrentPhase = usePomodoroStore((state) => state.resetCurrentPhase);
  const skipPhase = usePomodoroStore((state) => state.skipPhase);
  const selectPreset = usePomodoroStore((state) => state.selectPreset);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.brand}>Pomodoro Stack v1</Text>
      <Text style={styles.headline}>Yeni stack ile ilk çalışan sürüm hazır</Text>

      <View style={styles.presetRow}>
        {presets.map((preset) => {
          const isSelected = preset.id === selectedPresetId;
          return (
            <Pressable
              key={preset.id}
              style={[styles.presetChip, isSelected && styles.presetChipActive]}
              onPress={() => selectPreset(preset.id)}
            >
              <Text style={[styles.presetText, isSelected && styles.presetTextActive]}>
                {preset.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.timerCard}>
        <Text style={styles.phase}>{phaseLabels[phase]}</Text>
        <Text style={styles.timer}>{formatSeconds(secondsLeft)}</Text>
        <Text style={styles.meta}>Tamamlanan odak seansı: {completedFocusSessions}</Text>
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.button, styles.primaryButton]}
          onPress={isRunning ? pause : start}
        >
          <Text style={styles.primaryButtonText}>{isRunning ? 'Durdur' : 'Başlat'}</Text>
        </Pressable>
      </View>

      <View style={styles.actionsRow}>
        <Pressable style={[styles.button, styles.secondaryButton]} onPress={resetCurrentPhase}>
          <Text style={styles.secondaryButtonText}>Sıfırla</Text>
        </Pressable>
        <Pressable style={[styles.button, styles.secondaryButton]} onPress={skipPhase}>
          <Text style={styles.secondaryButtonText}>Fazı Geç</Text>
        </Pressable>
      </View>

      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingHorizontal: 20,
    paddingTop: 24,
    alignItems: 'center',
  },
  brand: {
    color: '#22d3ee',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: 12,
  },
  headline: {
    color: '#e2e8f0',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 20,
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
    borderColor: '#475569',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  presetChipActive: {
    borderColor: '#22d3ee',
    backgroundColor: '#164e63',
  },
  presetText: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  presetTextActive: {
    color: '#67e8f9',
  },
  timerCard: {
    width: '100%',
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 18,
  },
  phase: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  timer: {
    color: '#f8fafc',
    fontSize: 62,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 10,
  },
  meta: {
    color: '#94a3b8',
    fontSize: 14,
  },
  actionsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },
  button: {
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#22d3ee',
  },
  primaryButtonText: {
    color: '#082f49',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    backgroundColor: '#334155',
  },
  secondaryButtonText: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '700',
  },
});
