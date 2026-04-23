import { sections, getSectionsForTrack, KpssTrack } from '../data/curriculum';
import { AppState, defaultTopicProgress } from '../storage/types';
import { startOfDay, startOfWeek } from './format';

export interface SectionStats {
  total: number;
  completed: number;
  inProgress: number;
  review: number;
  notStarted: number;
  questionsSolved: number;
  correctAnswers: number;
  studySeconds: number;
}

const empty = (): SectionStats => ({
  total: 0,
  completed: 0,
  inProgress: 0,
  review: 0,
  notStarted: 0,
  questionsSolved: 0,
  correctAnswers: 0,
  studySeconds: 0,
});

export function computeAllStats(
  state: AppState,
  track: KpssTrack,
): { overall: SectionStats; bySection: Record<string, SectionStats> } {
  const overall = empty();
  const bySection: Record<string, SectionStats> = {};
  const allowed = new Set(getSectionsForTrack(track).map((s) => s.id));

  for (const section of sections) {
    if (!allowed.has(section.id)) continue;
    const s = empty();
    for (const subject of section.subjects) {
      for (const topic of subject.topics) {
        const p = state.progress[topic.id] ?? defaultTopicProgress;
        s.total += 1;
        overall.total += 1;
        if (p.status === 'completed') {
          s.completed += 1;
          overall.completed += 1;
        } else if (p.status === 'in_progress') {
          s.inProgress += 1;
          overall.inProgress += 1;
        } else if (p.status === 'review') {
          s.review += 1;
          overall.review += 1;
        } else {
          s.notStarted += 1;
          overall.notStarted += 1;
        }
        s.questionsSolved += p.questionsSolved;
        s.correctAnswers += p.correctAnswers;
        s.studySeconds += p.studySeconds;
        overall.questionsSolved += p.questionsSolved;
        overall.correctAnswers += p.correctAnswers;
        overall.studySeconds += p.studySeconds;
      }
    }
    bySection[section.id] = s;
  }

  return { overall, bySection };
}

export function todayStudySeconds(state: AppState): number {
  const today = startOfDay(Date.now());
  return state.sessions
    .filter((s) => s.endedAt >= today)
    .reduce((acc, s) => acc + s.durationSeconds, 0);
}

export function weeklyStudyByDay(state: AppState): { ts: number; seconds: number }[] {
  const start = startOfWeek(Date.now());
  const days = Array.from({ length: 7 }, (_, i) => ({
    ts: start + i * 86400000,
    seconds: 0,
  }));
  for (const s of state.sessions) {
    if (s.endedAt < start) continue;
    const d = new Date(s.endedAt);
    d.setHours(0, 0, 0, 0);
    const idx = Math.round((d.getTime() - start) / 86400000);
    if (idx >= 0 && idx < 7) days[idx].seconds += s.durationSeconds;
  }
  return days;
}

export function totalStreak(state: AppState): number {
  if (state.sessions.length === 0) return 0;
  const days = new Set<number>();
  for (const s of state.sessions) {
    days.add(startOfDay(s.endedAt));
  }
  let streak = 0;
  let cursor = startOfDay(Date.now());
  while (days.has(cursor)) {
    streak += 1;
    cursor -= 86400000;
  }
  return streak;
}
