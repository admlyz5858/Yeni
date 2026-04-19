import { supabase } from './supabase';
import {
  AppSettings,
  AppState,
  Profile,
  StudySession,
  TopicProgress,
  defaultProfile,
  defaultSettings,
  defaultTopicProgress,
} from '../storage/types';
import type { DailyTask, DailyTaskStatus } from './planner';

interface RemoteProfile {
  id: string;
  first_name: string | null;
  email: string | null;
  track: string;
  focus_minutes: number;
  break_minutes: number;
  haptics_enabled: boolean;
  daily_goal_minutes: number | null;
  onboarding_completed: boolean | null;
  exam_date: string | null;
  avatar_url: string | null;
  updated_at: string | null;
}

interface RemoteTopicProgress {
  user_id: string;
  topic_id: string;
  status: string;
  questions_solved: number;
  correct_answers: number;
  notes: string;
  study_seconds: number;
  last_studied_at: string | null;
  updated_at: string | null;
}

interface RemoteSession {
  id: string;
  user_id: string;
  topic_id: string | null;
  subject_id: string | null;
  duration_seconds: number | null;
  mode: string;
  start_time: string | null;
  end_time: string | null;
  focus_score: number | null;
  created_at: string;
}

const validTracks = ['lisans', 'onlisans', 'ortaogretim', 'egitim'] as const;
const validStatuses = [
  'not_started',
  'in_progress',
  'completed',
  'review',
] as const;

function sanitizeTrack(v: string): AppSettings['track'] {
  return (validTracks as readonly string[]).includes(v)
    ? (v as AppSettings['track'])
    : 'lisans';
}

function sanitizeStatus(v: string): TopicProgress['status'] {
  return (validStatuses as readonly string[]).includes(v)
    ? (v as TopicProgress['status'])
    : 'not_started';
}

interface RemoteDailyTask {
  id: string;
  user_id: string;
  date: string;
  topic_id: string;
  subject_id: string | null;
  target_minutes: number;
  status: string;
  sort_index: number;
  updated_at: string | null;
}

const validTaskStatuses = [
  'pending',
  'in_progress',
  'done',
  'skipped',
] as const;

function sanitizeTaskStatus(v: string): DailyTaskStatus {
  return (validTaskStatuses as readonly string[]).includes(v)
    ? (v as DailyTaskStatus)
    : 'pending';
}

export async function fetchRemoteState(userId: string): Promise<AppState> {
  const todayIso = new Date().toISOString().slice(0, 10);
  const [profileRes, progressRes, sessionsRes, tasksRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('topic_progress').select('*').eq('user_id', userId),
    supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(500),
    supabase
      .from('daily_tasks')
      .select('*')
      .eq('user_id', userId)
      .gte('date', todayIso)
      .order('date', { ascending: true })
      .order('sort_index', { ascending: true }),
  ]);

  const profile = (profileRes.data as RemoteProfile | null) ?? null;
  const progressRows = (progressRes.data as RemoteTopicProgress[] | null) ?? [];
  const sessionRows = (sessionsRes.data as RemoteSession[] | null) ?? [];
  const taskRows = (tasksRes.data as RemoteDailyTask[] | null) ?? [];

  const settings: AppSettings = {
    ...defaultSettings,
    track: profile ? sanitizeTrack(profile.track) : defaultSettings.track,
    focusMinutes: profile?.focus_minutes ?? defaultSettings.focusMinutes,
    breakMinutes: profile?.break_minutes ?? defaultSettings.breakMinutes,
    hapticsEnabled:
      profile?.haptics_enabled ?? defaultSettings.hapticsEnabled,
    dailyGoalMinutes:
      profile?.daily_goal_minutes ?? defaultSettings.dailyGoalMinutes,
  };

  const profileState: Profile = {
    ...defaultProfile,
    firstName: profile?.first_name ?? null,
    email: profile?.email ?? null,
    examDate: profile?.exam_date ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    onboardingCompleted: profile?.onboarding_completed ?? false,
  };

  const progress: Record<string, TopicProgress> = {};
  for (const row of progressRows) {
    progress[row.topic_id] = {
      ...defaultTopicProgress,
      status: sanitizeStatus(row.status),
      questionsSolved: row.questions_solved ?? 0,
      correctAnswers: row.correct_answers ?? 0,
      notes: row.notes ?? '',
      studySeconds: row.study_seconds ?? 0,
      lastStudiedAt: row.last_studied_at
        ? new Date(row.last_studied_at).getTime()
        : undefined,
    };
  }

  const sessions: StudySession[] = sessionRows.map((row) => ({
    id: row.id,
    topicId: row.topic_id ?? undefined,
    subjectId: row.subject_id ?? undefined,
    durationSeconds: row.duration_seconds ?? 0,
    mode: row.mode === 'manual' ? 'manual' : 'focus',
    endedAt: row.end_time
      ? new Date(row.end_time).getTime()
      : new Date(row.created_at).getTime(),
  }));

  const dailyTasks: DailyTask[] = taskRows.map((row) => ({
    id: row.id,
    date: row.date,
    topicId: row.topic_id,
    subjectId: row.subject_id ?? '',
    targetMinutes: row.target_minutes,
    status: sanitizeTaskStatus(row.status),
    sortIndex: row.sort_index,
    updatedAt: row.updated_at
      ? new Date(row.updated_at).getTime()
      : Date.now(),
  }));

  return {
    settings,
    progress,
    sessions,
    profile: profileState,
    dailyTasks,
    plannerGeneratedFor: null,
  };
}

export async function pushSettings(
  userId: string,
  settings: AppSettings,
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      track: settings.track,
      focus_minutes: settings.focusMinutes,
      break_minutes: settings.breakMinutes,
      haptics_enabled: settings.hapticsEnabled,
      daily_goal_minutes: settings.dailyGoalMinutes,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);
  if (error) throw error;
}

export async function pushProfile(
  userId: string,
  profile: Partial<Profile>,
): Promise<void> {
  const update: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };
  if (profile.firstName !== undefined) update.first_name = profile.firstName;
  if (profile.examDate !== undefined) update.exam_date = profile.examDate;
  if (profile.avatarUrl !== undefined) update.avatar_url = profile.avatarUrl;
  if (profile.onboardingCompleted !== undefined)
    update.onboarding_completed = profile.onboardingCompleted;
  const { error } = await supabase
    .from('profiles')
    .update(update)
    .eq('id', userId);
  if (error) throw error;
}

export async function pushTopicProgress(
  userId: string,
  topicId: string,
  progress: TopicProgress,
): Promise<void> {
  const { error } = await supabase.from('topic_progress').upsert(
    {
      user_id: userId,
      topic_id: topicId,
      status: progress.status,
      questions_solved: progress.questionsSolved,
      correct_answers: progress.correctAnswers,
      notes: progress.notes,
      study_seconds: progress.studySeconds,
      last_studied_at: progress.lastStudiedAt
        ? new Date(progress.lastStudiedAt).toISOString()
        : null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,topic_id' },
  );
  if (error) throw error;
}

export async function pushSession(
  userId: string,
  session: StudySession,
): Promise<void> {
  const endedIso = new Date(session.endedAt).toISOString();
  const startedIso = new Date(
    session.endedAt - session.durationSeconds * 1000,
  ).toISOString();
  const { error } = await supabase.from('study_sessions').insert({
    id: session.id,
    user_id: userId,
    topic_id: session.topicId ?? null,
    subject_id: session.subjectId ?? null,
    duration_seconds: session.durationSeconds,
    mode: session.mode,
    start_time: startedIso,
    end_time: endedIso,
    focus_score: null,
  });
  if (error && error.code !== '23505') {
    throw error;
  }
}

export async function wipeUserData(userId: string): Promise<void> {
  await Promise.all([
    supabase.from('topic_progress').delete().eq('user_id', userId),
    supabase.from('study_sessions').delete().eq('user_id', userId),
    supabase.from('daily_tasks').delete().eq('user_id', userId),
  ]);
}

export async function pushDailyTasks(
  userId: string,
  tasks: DailyTask[],
): Promise<void> {
  if (tasks.length === 0) return;
  const rows = tasks.map((t) => ({
    user_id: userId,
    date: t.date,
    topic_id: t.topicId,
    subject_id: t.subjectId || null,
    target_minutes: t.targetMinutes,
    status: t.status,
    sort_index: t.sortIndex,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabase
    .from('daily_tasks')
    .upsert(rows, { onConflict: 'user_id,date,topic_id' });
  if (error) throw error;
}

export async function pushDailyTaskStatus(
  userId: string,
  task: DailyTask,
): Promise<void> {
  const { error } = await supabase
    .from('daily_tasks')
    .upsert(
      {
        user_id: userId,
        date: task.date,
        topic_id: task.topicId,
        subject_id: task.subjectId || null,
        target_minutes: task.targetMinutes,
        status: task.status,
        sort_index: task.sortIndex,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,date,topic_id' },
    );
  if (error) throw error;
}

export async function clearDailyTasksFromDate(
  userId: string,
  fromDate: string,
): Promise<void> {
  const { error } = await supabase
    .from('daily_tasks')
    .delete()
    .eq('user_id', userId)
    .gte('date', fromDate)
    .neq('status', 'done');
  if (error) throw error;
}
