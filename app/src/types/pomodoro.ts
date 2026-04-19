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

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
}

export interface SessionRecord {
  id: string;
  completedAt: number;
  durationSeconds: number;
  presetId: string;
  taskId: string | null;
}
