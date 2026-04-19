import { create } from 'zustand';

import { LONG_BREAK_EVERY, POMODORO_PRESETS } from '../constants/presets';
import { PomodoroPhase, PresetConfig } from '../types/pomodoro';
import { minutesToSeconds } from '../utils/time';

interface PomodoroState {
  presets: PresetConfig[];
  selectedPresetId: string;
  phase: PomodoroPhase;
  secondsLeft: number;
  isRunning: boolean;
  completedFocusSessions: number;
  tick: () => void;
  start: () => void;
  pause: () => void;
  resetCurrentPhase: () => void;
  skipPhase: () => void;
  selectPreset: (presetId: string) => void;
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

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  presets: POMODORO_PRESETS,
  selectedPresetId: POMODORO_PRESETS[0].id,
  phase: 'focus',
  secondsLeft: minutesToSeconds(POMODORO_PRESETS[0].focusMinutes),
  isRunning: false,
  completedFocusSessions: 0,
  tick: () => {
    const { secondsLeft, phase, completedFocusSessions, selectedPresetId } = get();
    if (secondsLeft > 1) {
      set({ secondsLeft: secondsLeft - 1 });
      return;
    }

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
}));
