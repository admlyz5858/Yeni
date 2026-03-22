import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@kpss_plan_data';

type CompletedTopics = Record<string, Record<string, boolean>>;
type ScheduleItem = { day: string; subjectId: string; hours: number };
type StudyLog = Record<string, number>; // date "YYYY-MM-DD" -> hours

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

  useEffect(() => {
    loadData().then((data) => {
      if (data.examDate) setExamDateState(data.examDate);
      if (data.dailyGoalHours) setDailyGoalHoursState(data.dailyGoalHours);
      if (data.completedTopics && Object.keys(data.completedTopics).length) setCompletedTopicsState(data.completedTopics);
      if (data.schedule && Array.isArray(data.schedule)) setScheduleState(data.schedule);
      if (data.studyLog && Object.keys(data.studyLog).length) setStudyLogState(data.studyLog);
      setIsLoading(false);
    });
  }, []);

  const persist = (updates: Partial<{
    examDate: string | null;
    dailyGoalHours: number;
    completedTopics: CompletedTopics;
    schedule: ScheduleItem[];
    studyLog: StudyLog;
  }>) => {
    saveData({
      examDate: updates.examDate !== undefined ? updates.examDate : examDate,
      dailyGoalHours: updates.dailyGoalHours !== undefined ? updates.dailyGoalHours : dailyGoalHours,
      completedTopics: updates.completedTopics !== undefined ? updates.completedTopics : completedTopics,
      schedule: updates.schedule !== undefined ? updates.schedule : schedule,
      studyLog: updates.studyLog !== undefined ? updates.studyLog : studyLog,
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
      });
      return next;
    });
  };

  const setSchedule = (s: ScheduleItem[]) => {
    setScheduleState(s);
    persist({ schedule: s });
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
