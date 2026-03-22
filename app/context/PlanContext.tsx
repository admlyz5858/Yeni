import React, { createContext, useContext, useState } from 'react';

type CompletedTopics = Record<string, Record<string, boolean>>;

type PlanContextType = {
  examDate: string | null;
  setExamDate: (date: string | null) => void;
  dailyGoalHours: number;
  setDailyGoalHours: (h: number) => void;
  completedTopics: CompletedTopics;
  toggleTopic: (subjectId: string, topic: string) => void;
  schedule: { day: string; subjectId: string; hours: number }[];
  setSchedule: (s: { day: string; subjectId: string; hours: number }[]) => void;
};

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [examDate, setExamDate] = useState<string | null>(null);
  const [dailyGoalHours, setDailyGoalHours] = useState(4);
  const [completedTopics, setCompletedTopics] = useState<CompletedTopics>({});
  const [schedule, setSchedule] = useState<{ day: string; subjectId: string; hours: number }[]>([]);

  const toggleTopic = (subjectId: string, topic: string) => {
    setCompletedTopics((prev) => ({
      ...prev,
      [subjectId]: {
        ...(prev[subjectId] || {}),
        [topic]: !(prev[subjectId]?.[topic] ?? false),
      },
    }));
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
