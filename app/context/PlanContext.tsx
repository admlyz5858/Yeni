import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@kpss_plan_data';
const DAILY_STATS_KEY = '@kpss_daily_stats';

type CompletedTopics = Record<string, Record<string, boolean>>;
type ScheduleItem = { day: string; subjectId: string; hours: number };
type StudyLog = Record<string, number>; // date "YYYY-MM-DD" -> hours

type TopicNotes = Record<string, Record<string, string>>; // subjectId -> topic -> note

type PlanContextType = {
  examDate: string | null;
  setExamDate: (date: string | null) => void;
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
  addPomodoro: () => void;
  todayTopicCompletions: number;
  todayPomodoro: number;
  isLoading: boolean;
};

const PlanContext = createContext<PlanContextType | undefined>(undefined);

async function loadData(): Promise<Partial<PlanContextType>> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

async function saveData(data: object) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [examDate, setExamDateState] = useState<string | null>(null);
  const [dailyGoalHours, setDailyGoalHoursState] = useState(4);
  const [completedTopics, setCompletedTopicsState] = useState<CompletedTopics>({});
  const [schedule, setScheduleState] = useState<ScheduleItem[]>([]);
  const [studyLog, setStudyLogState] = useState<StudyLog>({});
  const [topicNotes, setTopicNotesState] = useState<TopicNotes>({});
  const [hasSeenOnboarding, setHasSeenOnboardingState] = useState(false);
  const [pomodoroCount, setPomodoroCountState] = useState(0);
  const [todayPomodoro, setTodayPomodoroState] = useState(0);
  const [todayTopicCompletions, setTodayTopicCompletionsState] = useState(0);

  useEffect(() => {
    loadData().then((data) => {
      if (data.examDate) setExamDateState(data.examDate);
      if (data.dailyGoalHours) setDailyGoalHoursState(data.dailyGoalHours);
      if (data.completedTopics && Object.keys(data.completedTopics).length) setCompletedTopicsState(data.completedTopics);
      if (data.schedule && Array.isArray(data.schedule)) setScheduleState(data.schedule);
      if (data.studyLog && Object.keys(data.studyLog).length) setStudyLogState(data.studyLog);
      if (data.topicNotes && Object.keys(data.topicNotes).length) setTopicNotesState(data.topicNotes);
      if (data.hasSeenOnboarding) setHasSeenOnboardingState(data.hasSeenOnboarding);
      if (data.pomodoroCount) setPomodoroCountState(data.pomodoroCount);
      const today = new Date().toISOString().slice(0, 10);
      AsyncStorage.getItem(DAILY_STATS_KEY).then((r) => {
        if (r) {
          const d = JSON.parse(r);
          if (d.date === today) {
            setTodayTopicCompletionsState(d.todayTopics || 0);
            setTodayPomodoroState(d.todayPomodoro || 0);
          }
        }
      });
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    AsyncStorage.setItem(DAILY_STATS_KEY, JSON.stringify({ date: today, todayTopics: todayTopicCompletions, todayPomodoro }));
  }, [todayTopicCompletions, todayPomodoro]);


  const persist = (updates: Partial<{
    examDate: string | null;
    dailyGoalHours: number;
    completedTopics: CompletedTopics;
    schedule: ScheduleItem[];
    studyLog: StudyLog;
    topicNotes: TopicNotes;
    hasSeenOnboarding: boolean;
    pomodoroCount: number;
  }>) => {
    saveData({
      examDate: updates.examDate !== undefined ? updates.examDate : examDate,
      dailyGoalHours: updates.dailyGoalHours !== undefined ? updates.dailyGoalHours : dailyGoalHours,
      completedTopics: updates.completedTopics !== undefined ? updates.completedTopics : completedTopics,
      schedule: updates.schedule !== undefined ? updates.schedule : schedule,
      studyLog: updates.studyLog !== undefined ? updates.studyLog : studyLog,
      topicNotes: updates.topicNotes !== undefined ? updates.topicNotes : topicNotes,
      hasSeenOnboarding: updates.hasSeenOnboarding !== undefined ? updates.hasSeenOnboarding : hasSeenOnboarding,
      pomodoroCount: updates.pomodoroCount !== undefined ? updates.pomodoroCount : pomodoroCount,
    });
  };

  const setExamDate = (v: string | null) => {
    setExamDateState(v);
    persist({ examDate: v });
  };

  const setDailyGoalHours = (h: number) => {
    setDailyGoalHoursState(h);
    persist({ dailyGoalHours: h });
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
      saveData({
        examDate,
        dailyGoalHours,
        completedTopics: next,
        schedule,
        studyLog,
        topicNotes,
        hasSeenOnboarding,
        pomodoroCount,
      });
      return next;
    });
  };

  const setSchedule = (s: ScheduleItem[]) => {
    setScheduleState(s);
    persist({ schedule: s });
  };

  const setTopicNote = (subjectId: string, topic: string, note: string) => {
    setTopicNotesState((prev) => {
      const next = {
        ...prev,
        [subjectId]: { ...(prev[subjectId] || {}), [topic]: note },
      };
      saveData({ examDate, dailyGoalHours, completedTopics, schedule, studyLog, topicNotes: next, hasSeenOnboarding, pomodoroCount });
      return next;
    });
  };

  const setHasSeenOnboarding = (v: boolean) => {
    setHasSeenOnboardingState(v);
    persist({ hasSeenOnboarding: v });
  };

  const addPomodoro = () => {
    setPomodoroCountState((prev) => {
      const next = prev + 1;
      saveData({ examDate, dailyGoalHours, completedTopics, schedule, studyLog, topicNotes, hasSeenOnboarding, pomodoroCount: next });
      return next;
    });
    setTodayPomodoroState((prev) => prev + 1);
  };

  const logStudy = (date: string, hours: number) => {
    setStudyLogState((prev) => {
      const next = { ...prev, [date]: (prev[date] || 0) + hours };
      saveData({
        examDate,
        dailyGoalHours,
        completedTopics,
        schedule,
        studyLog: next,
        topicNotes,
        hasSeenOnboarding,
        pomodoroCount,
      });
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
        pomodoroCount,
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
