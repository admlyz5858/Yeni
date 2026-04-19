export type PomodoroPhase = 'focus' | 'shortBreak' | 'longBreak';

export interface DurationSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
}

export interface PresetConfig extends DurationSettings {
  id: string;
  label: string;
}
