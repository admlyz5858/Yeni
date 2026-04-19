import { create } from 'zustand';

import { LONG_BREAK_EVERY, POMODORO_PRESETS } from '../constants/presets';
import { PomodoroPhase, PresetConfig, SessionRecord, TaskItem } from '../types/pomodoro';
import { minutesToSeconds } from '../utils/time';

interface PomodoroState {
  presets: PresetConfig[];
  selectedPresetId: string;
  phase: PomodoroPhase;
  secondsLeft: number;
  isRunning: boolean;
  completedFocusSessions: number;
  tasks: TaskItem[];
  activeTaskId: string | null;
  sessionHistory: SessionRecord[];
  tick: () => void;
  start: () => void;
  pause: () => void;
  resetCurrentPhase: () => void;
  skipPhase: () => void;
  selectPreset: (presetId: string) => void;
  addTask: (title: string) => void;
  toggleTask: (taskId: string) => void;
  setActiveTask: (taskId: string | null) => void;
}

const getPresetById = (presetId: string): PresetConfig => {
  return POMODORO_PRESETS.find((preset) => preset.id === presetId) ?? POMODORO_PRESETS[0];
};

const getSecondsForPhase = (preset: PresetConfig, phase: PomodoroPhase): number => {
  if (phase === 'focus') {
    return minutesToSeconds(preset.focusMinutes);
  }

  if (phase === 'shortBreak') {
    return minutesToSeconds(preset.shortBreakMinutes);
  }

  return minutesToSeconds(preset.longBreakMinutes);
};

const getNextPhase = (
  currentPhase: PomodoroPhase,
  completedFocusSessions: number,
): PomodoroPhase => {
  if (currentPhase === 'focus') {
    return completedFocusSessions % LONG_BREAK_EVERY === 0 ? 'longBreak' : 'shortBreak';
  }

  return 'focus';
};

const createId = (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  presets: POMODORO_PRESETS,
  selectedPresetId: POMODORO_PRESETS[0].id,
  phase: 'focus',
  secondsLeft: minutesToSeconds(POMODORO_PRESETS[0].focusMinutes),
  isRunning: false,
  completedFocusSessions: 0,
  tasks: [],
  activeTaskId: null,
  sessionHistory: [],
  tick: () => {
    const {
      secondsLeft,
      phase,
      completedFocusSessions,
      selectedPresetId,
      activeTaskId,
      sessionHistory,
    } = get();
    if (secondsLeft > 1) {
      set({ secondsLeft: secondsLeft - 1 });
      return;
    }

    const nextCompletedFocusSessions =
      phase === 'focus' ? completedFocusSessions + 1 : completedFocusSessions;
    const nextPhase = getNextPhase(phase, nextCompletedFocusSessions);
    const preset = getPresetById(selectedPresetId);
    const completedSessionDuration = getSecondsForPhase(preset, phase);
    const nextSessionHistory =
      phase === 'focus'
        ? [
            {
              id: createId(),
              completedAt: Date.now(),
              durationSeconds: completedSessionDuration,
              presetId: selectedPresetId,
              taskId: activeTaskId,
            },
            ...sessionHistory,
          ].slice(0, 20)
        : sessionHistory;

    set({
      phase: nextPhase,
      completedFocusSessions: nextCompletedFocusSessions,
      secondsLeft: getSecondsForPhase(preset, nextPhase),
      isRunning: false,
      sessionHistory: nextSessionHistory,
    });
  },
  start: () => set({ isRunning: true }),
  pause: () => set({ isRunning: false }),
  resetCurrentPhase: () => {
    const { selectedPresetId, phase } = get();
    const preset = getPresetById(selectedPresetId);
    set({
      isRunning: false,
      secondsLeft: getSecondsForPhase(preset, phase),
    });
  },
  skipPhase: () => {
    const { phase, completedFocusSessions, selectedPresetId } = get();
    const nextCompletedFocusSessions =
      phase === 'focus' ? completedFocusSessions + 1 : completedFocusSessions;
    const nextPhase = getNextPhase(phase, nextCompletedFocusSessions);
    const preset = getPresetById(selectedPresetId);

    set({
      phase: nextPhase,
      completedFocusSessions: nextCompletedFocusSessions,
      secondsLeft: getSecondsForPhase(preset, nextPhase),
      isRunning: false,
    });
  },
  selectPreset: (presetId: string) => {
    const preset = getPresetById(presetId);
    const { phase } = get();
    set({
      selectedPresetId: preset.id,
      isRunning: false,
      secondsLeft: getSecondsForPhase(preset, phase),
    });
  },
  addTask: (title: string) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }

    const { tasks, activeTaskId } = get();
    const task: TaskItem = {
      id: createId(),
      title: trimmedTitle,
      completed: false,
      createdAt: Date.now(),
    };

    set({
      tasks: [task, ...tasks],
      activeTaskId: activeTaskId ?? task.id,
    });
  },
  toggleTask: (taskId: string) => {
    const { tasks, activeTaskId } = get();
    const nextTasks = tasks.map((task) => {
      if (task.id !== taskId) {
        return task;
      }

      return { ...task, completed: !task.completed };
    });

    const toggledTask = nextTasks.find((task) => task.id === taskId);
    const nextActiveTaskId = toggledTask?.completed && activeTaskId === taskId ? null : activeTaskId;

    set({
      tasks: nextTasks,
      activeTaskId: nextActiveTaskId,
    });
  },
  setActiveTask: (taskId: string | null) => {
    const { tasks } = get();
    if (taskId === null) {
      set({ activeTaskId: null });
      return;
    }

    const selectedTask = tasks.find((task) => task.id === taskId && !task.completed);
    set({
      activeTaskId: selectedTask ? selectedTask.id : null,
    });
  },
}));
