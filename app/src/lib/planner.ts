import {
  KpssSection,
  KpssSubject,
  KpssTopic,
  KpssTrack,
  getSectionsForTrack,
  getTopicMeta,
} from '../data/curriculum';
import { TopicProgress, defaultTopicProgress } from '../storage/types';

export type DailyTaskStatus = 'pending' | 'in_progress' | 'done' | 'skipped';

export interface DailyTask {
  id: string;
  date: string;
  topicId: string;
  subjectId: string;
  targetMinutes: number;
  status: DailyTaskStatus;
  sortIndex: number;
  updatedAt: number;
}

export interface PlannerInput {
  track: KpssTrack;
  dailyGoalMinutes: number;
  examDate: string | null;
  progress: Record<string, TopicProgress>;
}

export interface RankedTopic {
  topicId: string;
  subjectId: string;
  sectionId: string;
  title: string;
  subjectTitle: string;
  subjectColor: string;
  targetMinutes: number;
  score: number;
  progress: TopicProgress;
  examWeight: number;
  difficulty: number;
}

export interface PlanDay {
  date: string;
  tasks: DailyTask[];
  totalMinutes: number;
}

export interface WeeklyPlan {
  generatedFor: string;
  days: PlanDay[];
}

const MS_DAY = 24 * 60 * 60 * 1000;

export function todayKey(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = (now.getMonth() + 1).toString().padStart(2, '0');
  const d = now.getDate().toString().padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(dateKey: string, delta: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + delta);
  const ny = date.getUTCFullYear();
  const nm = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const nd = date.getUTCDate().toString().padStart(2, '0');
  return `${ny}-${nm}-${nd}`;
}

export function daysUntilExam(examDate: string | null, now = new Date()): number | null {
  if (!examDate) return null;
  const [y, m, d] = examDate.split('-').map(Number);
  const exam = new Date(Date.UTC(y, m - 1, d));
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.ceil((exam.getTime() - today) / MS_DAY);
}

function* iterateTopics(track: KpssTrack): Generator<{
  section: KpssSection;
  subject: KpssSubject;
  topic: KpssTopic;
}> {
  const sections = getSectionsForTrack(track);
  for (const section of sections) {
    for (const subject of section.subjects) {
      for (const topic of subject.topics) {
        yield { section, subject, topic };
      }
    }
  }
}

function daysBetween(a: number, b: number): number {
  return Math.floor((b - a) / MS_DAY);
}

function statusPriority(status: TopicProgress['status']): number {
  switch (status) {
    case 'in_progress':
      return 3;
    case 'review':
      return 4;
    case 'not_started':
      return 2;
    case 'completed':
      return 0;
    default:
      return 1;
  }
}

function topicScore(
  topic: KpssTopic,
  subject: KpssSubject,
  progress: TopicProgress,
  examUrgency: number,
  now: number,
): number {
  const meta = getTopicMeta(subject, topic);
  let score = 0;
  score += meta.examWeight * 10;
  score += statusPriority(progress.status) * 12;
  score += meta.difficulty * 2;

  const questions = progress.questionsSolved;
  if (questions > 0) {
    const accuracy = progress.correctAnswers / questions;
    if (accuracy < 0.5) score += 15;
    else if (accuracy < 0.7) score += 8;
    else if (accuracy < 0.85) score += 3;
  } else if (progress.status === 'not_started') {
    score += 4;
  }

  if (progress.lastStudiedAt) {
    const days = daysBetween(progress.lastStudiedAt, now);
    if (days >= 14) score += 10;
    else if (days >= 7) score += 6;
    else if (days >= 3) score += 2;
    else if (days <= 1) score -= 4;
  } else if (progress.status !== 'completed') {
    score += 6;
  }

  score += examUrgency;
  return score;
}

export function rankTopics(
  input: PlannerInput,
  now = new Date(),
): RankedTopic[] {
  const left = daysUntilExam(input.examDate, now);
  const examUrgency =
    left === null ? 0 : left <= 0 ? 20 : left < 30 ? 12 : left < 90 ? 6 : 2;

  const ranked: RankedTopic[] = [];
  for (const { section, subject, topic } of iterateTopics(input.track)) {
    const progress = input.progress[topic.id] ?? defaultTopicProgress;
    if (progress.status === 'completed') continue;
    const meta = getTopicMeta(subject, topic);
    const score = topicScore(topic, subject, progress, examUrgency, now.getTime());
    ranked.push({
      topicId: topic.id,
      subjectId: subject.id,
      sectionId: section.id,
      title: topic.title,
      subjectTitle: subject.title,
      subjectColor: subject.color,
      targetMinutes: meta.estimatedMinutes,
      score,
      progress,
      examWeight: meta.examWeight,
      difficulty: meta.difficulty,
    });
  }
  ranked.sort((a, b) => b.score - a.score);
  return ranked;
}

function enforceDiversity(ranked: RankedTopic[]): RankedTopic[] {
  const perSubjectCount: Record<string, number> = {};
  const bonus: RankedTopic[] = [];
  const rest: RankedTopic[] = [];
  for (const t of ranked) {
    const c = perSubjectCount[t.subjectId] ?? 0;
    if (c < 2) {
      perSubjectCount[t.subjectId] = c + 1;
      bonus.push(t);
    } else {
      rest.push(t);
    }
  }
  return [...bonus, ...rest];
}

export interface GeneratePlanOptions {
  dateKey: string;
  targetMinutes: number;
  ranked: RankedTopic[];
  excludeTopicIds?: Set<string>;
  maxTasks?: number;
}

export function pickTasksForDay({
  dateKey,
  targetMinutes,
  ranked,
  excludeTopicIds,
  maxTasks = 6,
}: GeneratePlanOptions): DailyTask[] {
  const pool = enforceDiversity(ranked).filter(
    (t) => !excludeTopicIds || !excludeTopicIds.has(t.topicId),
  );
  const tasks: DailyTask[] = [];
  let remaining = Math.max(targetMinutes, 15);
  let sortIndex = 0;
  for (const topic of pool) {
    if (tasks.length >= maxTasks) break;
    if (remaining <= 0) break;
    const minutes = Math.max(
      15,
      Math.min(topic.targetMinutes, remaining + 10),
    );
    tasks.push({
      id: `${dateKey}:${topic.topicId}`,
      date: dateKey,
      topicId: topic.topicId,
      subjectId: topic.subjectId,
      targetMinutes: minutes,
      status: 'pending',
      sortIndex: sortIndex++,
      updatedAt: Date.now(),
    });
    remaining -= minutes;
  }
  return tasks;
}

export function generateWeeklyPlan(
  input: PlannerInput,
  now = new Date(),
): WeeklyPlan {
  const baseKey = todayKey(now);
  const ranked = rankTopics(input, now);
  const days: PlanDay[] = [];
  let rotationIndex = 0;
  for (let i = 0; i < 7; i++) {
    const dateKey = addDays(baseKey, i);
    const dayRanked = [
      ...ranked.slice(rotationIndex),
      ...ranked.slice(0, rotationIndex),
    ];
    const tasks = pickTasksForDay({
      dateKey,
      targetMinutes: input.dailyGoalMinutes,
      ranked: dayRanked,
      maxTasks: 5,
    });
    days.push({
      date: dateKey,
      tasks,
      totalMinutes: tasks.reduce((a, t) => a + t.targetMinutes, 0),
    });
    rotationIndex = (rotationIndex + 3) % Math.max(1, ranked.length);
  }
  return { generatedFor: baseKey, days };
}

export function mergeExistingTasks(
  existing: DailyTask[],
  fresh: DailyTask[],
): DailyTask[] {
  const byTopic: Record<string, DailyTask> = {};
  for (const t of existing) byTopic[t.topicId] = t;
  const result: DailyTask[] = [];
  let sortIndex = 0;
  for (const fresh1 of fresh) {
    const match = byTopic[fresh1.topicId];
    if (match) {
      result.push({ ...match, sortIndex: sortIndex++ });
      delete byTopic[fresh1.topicId];
    } else {
      result.push({ ...fresh1, sortIndex: sortIndex++ });
    }
  }
  for (const leftover of Object.values(byTopic)) {
    if (leftover.status === 'done' || leftover.status === 'in_progress') {
      result.push({ ...leftover, sortIndex: sortIndex++ });
    }
  }
  return result;
}
