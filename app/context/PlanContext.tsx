import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import * as backend from '../lib/backend';

const STORAGE_KEY = '@study_plan_data';
const DAILY_STATS_KEY = '@study_daily_stats';

type CompletedTopics = Record<string, Record<string, boolean>>;
type ScheduleItem = { day: string; subjectId: string; hours: number };
type StudyLog = Record<string, number>;

type TopicNotes = Record<string, Record<string, string>>;

type PlanContextType = {
  examDate: string | null;
  setExamDate: (date: string | null) => void;
  selectedExam: string | null;
  setSelectedExam: (id: string | null) => void;
  dailyGoalHours: number;
  setDailyGoalHours: (h: number) => void;
  completedTopics: CompletedTopics;
  toggleTopic: (subjectId: string, topic: string) => void;
  schedule: ScheduleItem[];
  setSchedule: (s: ScheduleItem[]) => void;
  studyLog: StudyLog;
  logStudy: (date: string, hours: number) => void;
  topicNotes: TopicNotes;
  setTopicNote: (subjectId: string, topic: string, note: string) => void;
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (v: boolean) => void;
  pomodoroCount: number;
  pomodoroLog: Record<string, number>;
  addPomodoro: () => void;
  todayTopicCompletions: number;
  todayPomodoro: number;
  isLoading: boolean;
};

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const { user, hasBackend } = useAuth();
  const useSupabase = !!(user && user.id !== 'demo' && hasBackend);
  const userId = useSupabase ? user!.id : null;

  const [isLoading, setIsLoading] = useState(true);
  const [examDate, setExamDateState] = useState<string | null>(null);
  const [selectedExam, setSelectedExamState] = useState<string | null>(null);
  const [dailyGoalHours, setDailyGoalHoursState] = useState(4);
  const [completedTopics, setCompletedTopicsState] = useState<CompletedTopics>({});
  const [schedule, setScheduleState] = useState<ScheduleItem[]>([]);
  const [studyLog, setStudyLogState] = useState<StudyLog>({});
  const [topicNotes, setTopicNotesState] = useState<TopicNotes>({});
  const [hasSeenOnboarding, setHasSeenOnboardingState] = useState(false);
  const [pomodoroCount, setPomodoroCountState] = useState(0);
  const [pomodoroLog, setPomodoroLogState] = useState<Record<string, number>>({});
  const [todayPomodoro, setTodayPomodoroState] = useState(0);
  const [todayTopicCompletions, setTodayTopicCompletionsState] = useState(0);

  const loadFromBackend = useCallback(async () => {
    if (!userId) return;
    await backend.ensureUserRows(userId);
    const plan = await backend.fetchPlan(userId);
    const log = await backend.fetchStudyLog(userId);
    const today = new Date().toISOString().slice(0, 10);
    if (plan) {
      setExamDateState(plan.exam_date || null);
      setDailyGoalHoursState(plan.daily_goal_hours ?? 4);
      setCompletedTopicsState((plan.completed_topics as CompletedTopics) || {});
      setScheduleState((plan.schedule as ScheduleItem[]) || []);
      setTopicNotesState((plan.topic_notes as TopicNotes) || {});
      setHasSeenOnboardingState(plan.has_seen_onboarding ?? false);
      setPomodoroCountState(plan.pomodoro_count ?? 0);
      setPomodoroLogState((plan.pomodoro_log as Record<string, number>) || {});
    }
    setStudyLogState(log || {});
    const daily = await backend.fetchDaily(userId, today);
    if (daily) {
      setTodayTopicCompletionsState(daily.today_topics ?? 0);
      setTodayPomodoroState(daily.today_pomodoro ?? 0);
    }
  }, [userId]);

  const loadFromLocal = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.examDate) setExamDateState(data.examDate);
        if (data.dailyGoalHours) setDailyGoalHoursState(data.dailyGoalHours);
        if (data.completedTopics && Object.keys(data.completedTopics).length) setCompletedTopicsState(data.completedTopics);
        if (data.schedule?.length) setScheduleState(data.schedule);
        if (data.studyLog && Object.keys(data.studyLog).length) setStudyLogState(data.studyLog);
        if (data.topicNotes && Object.keys(data.topicNotes).length) setTopicNotesState(data.topicNotes);
        if (data.hasSeenOnboarding) setHasSeenOnboardingState(data.hasSeenOnboarding);
        if (data.pomodoroCount) setPomodoroCountState(data.pomodoroCount);
        if (data.pomodoroLog && Object.keys(data.pomodoroLog).length) setPomodoroLogState(data.pomodoroLog);
        if (data.selectedExam) setSelectedExamState(data.selectedExam);
      }
      const today = new Date().toISOString().slice(0, 10);
      const r = await AsyncStorage.getItem(DAILY_STATS_KEY);
      if (r) {
        const d = JSON.parse(r);
        if (d.date === today) {
          setTodayTopicCompletionsState(d.todayTopics || 0);
          setTodayPomodoroState(d.todayPomodoro || 0);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (useSupabase && userId) {
      loadFromBackend().finally(() => setIsLoading(false));
    } else {
      loadFromLocal().finally(() => setIsLoading(false));
    }
  }, [useSupabase, userId, loadFromBackend, loadFromLocal]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (useSupabase && userId) {
      backend.upsertDaily(userId, today, { today_topics: todayTopicCompletions, today_pomodoro: todayPomodoro });
    } else {
      AsyncStorage.setItem(DAILY_STATS_KEY, JSON.stringify({ date: today, todayTopics: todayTopicCompletions, todayPomodoro }));
    }
  }, [todayTopicCompletions, todayPomodoro, useSupabase, userId]);

  const persistToBackend = useCallback((data: {
    examDate: string | null;
    dailyGoalHours: number;
    completedTopics: CompletedTopics;
    schedule: ScheduleItem[];
    studyLog: StudyLog;
    topicNotes: TopicNotes;
    hasSeenOnboarding: boolean;
    pomodoroCount: number;
    pomodoroLog: Record<string, number>;
  }) => {
    if (!userId) return;
    backend.savePlan(userId, data).catch((err) => {
      if (__DEV__) console.warn('Plan kaydetme hatası:', err);
    });
  }, [userId]);

  const persistToLocal = useCallback((data: object) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  const setExamDate = (v: string | null) => {
    setExamDateState(v);
    if (useSupabase && userId) {
      persistToBackend({ examDate: v, dailyGoalHours, completedTopics, schedule, studyLog, topicNotes, hasSeenOnboarding, pomodoroCount, pomodoroLog });
    } else {
      persistToLocal({ examDate: v, dailyGoalHours, completedTopics, schedule, studyLog, topicNotes, hasSeenOnboarding, pomodoroCount, pomodoroLog });
    }
  };

  const setDailyGoalHours = (h: number) => {
    setDailyGoalHoursState(h);
    const payload = { examDate, dailyGoalHours: h, completedTopics, schedule, studyLog, topicNotes, hasSeenOnboarding, pomodoroCount, pomodoroLog };
    useSupabase && userId ? persistToBackend(payload) : persistToLocal(payload);
  };

  const toggleTopic = (subjectId: string, topic: string) => {
    setCompletedTopicsState((prev) => {
      const wasDone = prev[subjectId]?.[topic] ?? false;
      if (!wasDone) setTodayTopicCompletionsState((p) => p + 1);
      const next = {
        ...prev,
        [subjectId]: {
          ...(prev[subjectId] || {}),
          [topic]: !(prev[subjectId]?.[topic] ?? false),
        },
      };
      const payload = { examDate, dailyGoalHours, completedTopics: next, schedule, studyLog, topicNotes, hasSeenOnboarding, pomodoroCount, pomodoroLog };
      if (useSupabase && userId) persistToBackend(payload);
      else persistToLocal(payload);
      return next;
    });
  };

  const setSchedule = (s: ScheduleItem[]) => {
    setScheduleState(s);
    const payload = { examDate, dailyGoalHours, completedTopics, schedule: s, studyLog, topicNotes, hasSeenOnboarding, pomodoroCount, pomodoroLog };
    useSupabase && userId ? persistToBackend(payload) : persistToLocal(payload);
  };

  const setTopicNote = (subjectId: string, topic: string, note: string) => {
    setTopicNotesState((prev) => {
      const next = { ...prev, [subjectId]: { ...(prev[subjectId] || {}), [topic]: note } };
      const payload = { examDate, dailyGoalHours, completedTopics, schedule, studyLog, topicNotes: next, hasSeenOnboarding, pomodoroCount, pomodoroLog };
      if (useSupabase && userId) persistToBackend(payload);
      else persistToLocal(payload);
      return next;
    });
  };

  const setHasSeenOnboarding = (v: boolean) => {
    setHasSeenOnboardingState(v);
    const payload = { examDate, dailyGoalHours, completedTopics, schedule, studyLog, topicNotes, hasSeenOnboarding: v, pomodoroCount, pomodoroLog, selectedExam };
    useSupabase && userId ? persistToBackend(payload) : persistToLocal(payload);
  };

  const setSelectedExam = (id: string | null) => {
    setSelectedExamState(id);
    persistToLocal({ examDate, dailyGoalHours, completedTopics, schedule, studyLog, topicNotes, hasSeenOnboarding, pomodoroCount, pomodoroLog, selectedExam: id });
  };

  const addPomodoro = () => {
    const today = new Date().toISOString().slice(0, 10);
    const newCount = pomodoroCount + 1;
    const newLog = { ...pomodoroLog, [today]: (pomodoroLog[today] || 0) + 1 };
    setPomodoroCountState(newCount);
    setPomodoroLogState(newLog);
    setTodayPomodoroState((p) => p + 1);
    const payload = { examDate, dailyGoalHours, completedTopics, schedule, studyLog, topicNotes, hasSeenOnboarding, pomodoroCount: newCount, pomodoroLog: newLog };
    useSupabase && userId ? persistToBackend(payload) : persistToLocal(payload);
  };

  const logStudy = (date: string, hours: number) => {
    setStudyLogState((prev) => {
      const next = { ...prev, [date]: (prev[date] || 0) + hours };
      if (useSupabase && userId) {
        backend.upsertStudyLog(userId, date, hours);
      } else {
        const payload = { examDate, dailyGoalHours, completedTopics, schedule, studyLog: next, topicNotes, hasSeenOnboarding, pomodoroCount, pomodoroLog };
        persistToLocal(payload);
      }
      return next;
    });
  };

  return (
    <PlanContext.Provider
      value={{
        examDate,
        setExamDate,
        dailyGoalHours,
        setDailyGoalHours,
        completedTopics,
        toggleTopic,
        schedule,
        setSchedule,
        studyLog,
        logStudy,
        topicNotes,
        setTopicNote,
        hasSeenOnboarding,
        setHasSeenOnboarding,
        selectedExam,
        setSelectedExam,
        pomodoroCount,
        pomodoroLog,
        addPomodoro,
        todayTopicCompletions,
        todayPomodoro,
        isLoading,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error('usePlan must be used within PlanProvider');
  return ctx;
}
