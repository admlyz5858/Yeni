import { KpssTrack } from '../data/curriculum';
import type { DailyTask } from '../lib/planner';

export type TopicStatus = 'not_started' | 'in_progress' | 'completed' | 'review';

export interface TopicProgress {
  status: TopicStatus;
  questionsSolved: number;
  correctAnswers: number;
  notes: string;
  lastStudiedAt?: number;
  studySeconds: number;
}

export interface StudySession {
  id: string;
  topicId?: string;
  subjectId?: string;
  durationSeconds: number;
  mode: 'focus' | 'manual';
  endedAt: number;
}

export type FocusPresetId = 'classic' | 'long' | 'deep' | 'short' | 'custom';

export interface AppSettings {
  track: KpssTrack;
  dailyGoalMinutes: number;
  focusMinutes: number;
  breakMinutes: number;
  longBreakMinutes: number;
  pomodorosUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartNextFocus: boolean;
  deepFocusEnabled: boolean;
  keepScreenOn: boolean;
  hapticsEnabled: boolean;
  focusPresetId: FocusPresetId;
}

export interface Profile {
  firstName: string | null;
  email: string | null;
  examDate: string | null;
  avatarUrl: string | null;
  onboardingCompleted: boolean;
}

export interface AppState {
  settings: AppSettings;
  progress: Record<string, TopicProgress>;
  sessions: StudySession[];
  profile: Profile;
  dailyTasks: DailyTask[];
  plannerGeneratedFor: string | null;
}

export const defaultSettings: AppSettings = {
  track: 'lisans',
  dailyGoalMinutes: 120,
  focusMinutes: 25,
  breakMinutes: 5,
  longBreakMinutes: 15,
  pomodorosUntilLongBreak: 4,
  autoStartBreaks: true,
  autoStartNextFocus: false,
  deepFocusEnabled: false,
  keepScreenOn: true,
  hapticsEnabled: true,
  focusPresetId: 'classic',
};

export const defaultTopicProgress: TopicProgress = {
  status: 'not_started',
  questionsSolved: 0,
  correctAnswers: 0,
  notes: '',
  studySeconds: 0,
};

export const defaultProfile: Profile = {
  firstName: null,
  email: null,
  examDate: null,
  avatarUrl: null,
  onboardingCompleted: false,
};

export const defaultState: AppState = {
  settings: defaultSettings,
  progress: {},
  sessions: [],
  profile: defaultProfile,
  dailyTasks: [],
  plannerGeneratedFor: null,
};
