import { PresetConfig } from '../types/pomodoro';

export const POMODORO_PRESETS: PresetConfig[] = [
  {
    id: 'classic',
    label: 'Klasik 25/5',
    focusMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
  },
  {
    id: 'deep-work',
    label: 'Deep Work 50/10',
    focusMinutes: 50,
    shortBreakMinutes: 10,
    longBreakMinutes: 20,
  },
  {
    id: 'quick-sprint',
    label: 'Hızlı Sprint 15/3',
    focusMinutes: 15,
    shortBreakMinutes: 3,
    longBreakMinutes: 10,
  },
];

export const LONG_BREAK_EVERY = 4;
