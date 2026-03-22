/**
 * Supabase backend API - Kullanıcı verilerinin senkronizasyonu
 */
import { supabase, hasSupabase } from './supabase';

export async function ensureUserRows(userId: string) {
  if (!hasSupabase || !supabase) return;
  await Promise.all([
    supabase.from('user_plan').upsert({ user_id: userId }, { onConflict: 'user_id' }),
    supabase.from('user_subjects').upsert({ user_id: userId }, { onConflict: 'user_id' }),
    supabase.from('user_gamification').upsert({ user_id: userId }, { onConflict: 'user_id' }),
    supabase.from('user_game').upsert({ user_id: userId }, { onConflict: 'user_id' }),
    supabase.from('user_settings').upsert({ user_id: userId }, { onConflict: 'user_id' }),
  ]);
}

export async function fetchPlan(userId: string) {
  if (!hasSupabase || !supabase) return null;
  const { data } = await supabase.from('user_plan').select('*').eq('user_id', userId).single();
  return data;
}

export async function savePlan(userId: string, plan: Record<string, unknown>) {
  if (!hasSupabase || !supabase) return;
  const row: Record<string, unknown> = {
    user_id: userId,
    exam_date: plan.examDate || null,
    daily_goal_hours: plan.dailyGoalHours ?? 4,
    completed_topics: plan.completedTopics ?? {},
    schedule: plan.schedule ?? [],
    topic_notes: plan.topicNotes ?? {},
    has_seen_onboarding: plan.hasSeenOnboarding ?? false,
    pomodoro_count: plan.pomodoroCount ?? 0,
    pomodoro_log: plan.pomodoroLog ?? {},
  };
  await supabase.from('user_plan').upsert(row, { onConflict: 'user_id' });
}

export async function fetchStudyLog(userId: string): Promise<Record<string, number>> {
  if (!hasSupabase || !supabase) return {};
  const { data } = await supabase.from('study_log').select('date, hours').eq('user_id', userId);
  const out: Record<string, number> = {};
  (data || []).forEach((r: { date: string; hours: number }) => { out[r.date] = Number(r.hours); });
  return out;
}

export async function upsertStudyLog(userId: string, date: string, hours: number) {
  if (!hasSupabase || !supabase) return;
  const { data } = await supabase.from('study_log').select('hours').eq('user_id', userId).eq('date', date).single();
  const prev = data?.hours ? Number(data.hours) : 0;
  const next = prev + hours;
  await supabase.from('study_log').upsert({ user_id: userId, date, hours: next }, { onConflict: 'user_id,date' });
}

export async function fetchSubjects(userId: string) {
  if (!hasSupabase || !supabase) return null;
  const { data } = await supabase.from('user_subjects').select('subjects').eq('user_id', userId).single();
  return data?.subjects ?? [];
}

export async function saveSubjects(userId: string, subjects: unknown[]) {
  if (!hasSupabase || !supabase) return;
  await supabase.from('user_subjects').upsert({ user_id: userId, subjects, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
}

export async function fetchGamification(userId: string) {
  if (!hasSupabase || !supabase) return null;
  const { data } = await supabase.from('user_gamification').select('*').eq('user_id', userId).single();
  return data;
}

export async function saveGamification(userId: string, payload: Record<string, unknown>) {
  if (!hasSupabase || !supabase) return;
  const row: Record<string, unknown> = { user_id: userId };
  if (payload.xp !== undefined) row.xp = payload.xp;
  if (payload.achievements !== undefined) row.achievements = payload.achievements;
  if (payload.last_login !== undefined) row.last_login = payload.last_login;
  if (payload.login_streak !== undefined) row.login_streak = payload.login_streak;
  await supabase.from('user_gamification').upsert(row, { onConflict: 'user_id' });
}

export async function fetchFlashcards(userId: string): Promise<Record<string, unknown>[]> {
  if (!hasSupabase || !supabase) return [];
  const { data } = await supabase.from('flashcards').select('*').eq('user_id', userId);
  return (data || []).map((r: Record<string, unknown>) => ({
    id: r.id,
    subjectId: r.subject_id,
    topic: r.topic,
    front: r.front,
    back: r.back,
    nextReview: r.next_review,
    interval: r.interval ?? 0,
    easeFactor: r.ease_factor ?? 2.5,
    repetitions: r.repetitions ?? 0,
  }));
}

export async function addFlashcard(userId: string, card: {
  subjectId: string;
  topic: string;
  front: string;
  back: string;
  nextReview: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
}) {
  if (!hasSupabase || !supabase) return null;
  const { data } = await supabase.from('flashcards').insert({
    user_id: userId,
    subject_id: card.subjectId,
    topic: card.topic,
    front: card.front,
    back: card.back,
    next_review: card.nextReview,
    interval: card.interval,
    ease_factor: card.easeFactor,
    repetitions: card.repetitions,
  }).select('id').single();
  return data?.id;
}

export async function updateFlashcard(userId: string, cardId: string, updates: Record<string, unknown>) {
  if (!hasSupabase || !supabase) return;
  const map: Record<string, string> = { subjectId: 'subject_id', topic: 'topic', nextReview: 'next_review', easeFactor: 'ease_factor' };
  const row: Record<string, unknown> = {};
  Object.entries(updates).forEach(([k, v]) => { row[map[k] || k] = v; });
  await supabase.from('flashcards').update(row).eq('id', cardId).eq('user_id', userId);
}

export async function deleteFlashcard(userId: string, cardId: string) {
  if (!hasSupabase || !supabase) return;
  await supabase.from('flashcards').delete().eq('id', cardId).eq('user_id', userId);
}

export async function fetchGame(userId: string) {
  if (!hasSupabase || !supabase) return null;
  const { data } = await supabase.from('user_game').select('*').eq('user_id', userId).single();
  return data;
}

export async function saveGame(userId: string, payload: Record<string, unknown>) {
  if (!hasSupabase || !supabase) return;
  const row: Record<string, unknown> = { user_id: userId };
  if (payload.myGroupId !== undefined) row.my_group_id = payload.myGroupId;
  if (payload.equippedTitleId !== undefined) row.equipped_title_id = payload.equippedTitleId;
  if (payload.weeklyCompleted !== undefined) row.weekly_completed = payload.weeklyCompleted;
  if (payload.lastSeenLevel !== undefined) row.last_seen_level = payload.lastSeenLevel;
  await supabase.from('user_game').upsert(row, { onConflict: 'user_id' });
}

export async function fetchSettings(userId: string) {
  if (!hasSupabase || !supabase) return null;
  const { data } = await supabase.from('user_settings').select('*').eq('user_id', userId).single();
  return data;
}

export async function saveSettings(userId: string, themeMode: string) {
  if (!hasSupabase || !supabase) return;
  await supabase.from('user_settings').upsert({ user_id: userId, theme_mode: themeMode, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
}

export async function fetchDaily(userId: string, date: string) {
  if (!hasSupabase || !supabase) return null;
  const { data } = await supabase.from('user_daily').select('*').eq('user_id', userId).eq('date', date).single();
  return data;
}

export async function upsertDaily(userId: string, date: string, updates: Record<string, unknown>) {
  if (!hasSupabase || !supabase) return;
  const row: Record<string, unknown> = { user_id: userId, date };
  if (updates.today_topics !== undefined) row.today_topics = updates.today_topics;
  if (updates.today_pomodoro !== undefined) row.today_pomodoro = updates.today_pomodoro;
  if (updates.challenge_completed !== undefined) row.challenge_completed = updates.challenge_completed;
  if (updates.challenge_progress !== undefined) row.challenge_progress = updates.challenge_progress;
  if (updates.bonus_claimed !== undefined) row.bonus_claimed = updates.bonus_claimed;
  await supabase.from('user_daily').upsert(row, { onConflict: 'user_id,date' });
}

export async function getLeaderboard(limitCount = 20): Promise<{ rank: number; userId: string; name: string; xp: number }[]> {
  if (!hasSupabase || !supabase) return [];
  const { data } = await supabase.rpc('get_leaderboard', { limit_count: limitCount });
  return (data || []).map((r: { rank: number; user_id: string; name: string; xp: number }, i: number) => ({
    rank: Number(r.rank) || i + 1,
    userId: r.user_id,
    name: r.name || 'Anonim',
    xp: Number(r.xp) || 0,
  }));
}
