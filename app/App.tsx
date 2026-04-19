import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

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
  const [taskTitle, setTaskTitle] = useState('');

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

  const activeTask = tasks.find((task) => task.id === activeTaskId) ?? null;

  const handleAddTask = (): void => {
    addTask(taskTitle);
    setTaskTitle('');
  };

  const getPresetLabel = (presetId: string): string => {
    return presets.find((preset) => preset.id === presetId)?.label ?? 'Bilinmeyen preset';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.brand}>Pomodoro Stack v1</Text>
        <Text style={styles.headline}>Roadmap Sprint: görev + seans geçmişi</Text>

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
          <Text style={styles.meta}>
            Aktif görev: {activeTask ? activeTask.title : 'Seçilmedi'}
          </Text>
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

        <View style={styles.sectionCard}>
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
            <Pressable style={styles.addTaskButton} onPress={handleAddTask}>
              <Text style={styles.addTaskButtonText}>Ekle</Text>
            </Pressable>
          </View>

          {tasks.length === 0 ? (
            <Text style={styles.emptyText}>Henüz görev eklenmedi.</Text>
          ) : (
            tasks.map((task) => {
              const isActive = task.id === activeTaskId;
              return (
                <View key={task.id} style={[styles.taskRow, isActive && styles.taskRowActive]}>
                  <Pressable
                    style={styles.taskMain}
                    onPress={() => setActiveTask(task.completed ? null : task.id)}
                  >
                    <Text style={[styles.taskTitle, task.completed && styles.taskTitleDone]}>
                      {task.title}
                    </Text>
                    <Text style={styles.taskState}>
                      {task.completed ? 'Tamamlandı' : isActive ? 'Aktif' : 'Bekliyor'}
                    </Text>
                  </Pressable>
                  <Pressable style={styles.taskToggleButton} onPress={() => toggleTask(task.id)}>
                    <Text style={styles.taskToggleButtonText}>
                      {task.completed ? 'Geri Al' : 'Bitti'}
                    </Text>
                  </Pressable>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.sectionCard}>
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
        </View>
      </ScrollView>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 42,
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
  sectionCard: {
    width: '100%',
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 16,
    marginTop: 18,
    gap: 10,
  },
  sectionTitle: {
    color: '#e2e8f0',
    fontSize: 18,
    fontWeight: '700',
  },
  taskComposerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  taskInput: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    color: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  addTaskButton: {
    backgroundColor: '#0e7490',
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  addTaskButtonText: {
    color: '#cffafe',
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
    borderColor: '#334155',
    padding: 10,
  },
  taskRowActive: {
    borderColor: '#22d3ee',
    backgroundColor: '#082f49',
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
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  taskState: {
    color: '#94a3b8',
    fontSize: 12,
  },
  taskToggleButton: {
    backgroundColor: '#334155',
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
    color: '#94a3b8',
    fontSize: 14,
  },
  sessionRow: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 10,
    gap: 4,
  },
  sessionDuration: {
    color: '#f8fafc',
    fontSize: 16,
    fontWeight: '700',
  },
  sessionMeta: {
    color: '#94a3b8',
    fontSize: 12,
  },
  sessionTask: {
    color: '#67e8f9',
    fontSize: 13,
    fontWeight: '600',
  },
});
