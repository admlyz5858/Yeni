import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GAMIFICATION_KEY = '@kpss_gamification';

export type Achievement = {
  id: string;
  title: string;
  desc: string;
  icon: string;
  xp: number;
  unlockedAt: string | null;
};

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_study', title: 'İlk Adım', desc: 'İlk çalışma kaydı', icon: '🌟', xp: 50, unlockedAt: null },
  { id: 'streak_3', title: 'Kararlı', desc: '3 gün üst üste çalış', icon: '🔥', xp: 100, unlockedAt: null },
  { id: 'streak_7', title: 'Haftalık Devam', desc: '7 gün üst üste çalış', icon: '💪', xp: 200, unlockedAt: null },
  { id: 'streak_30', title: 'Demir İrade', desc: '30 gün üst üste çalış', icon: '🏆', xp: 500, unlockedAt: null },
  { id: 'topic_5', title: 'Konu Ustası', desc: '5 konu tamamla', icon: '📚', xp: 75, unlockedAt: null },
  { id: 'topic_all', title: 'Tamamlama', desc: 'Tüm konuları bitir', icon: '🎯', xp: 1000, unlockedAt: null },
  { id: 'pomodoro_5', title: 'Odaklanma', desc: '5 Pomodoro tamamla', icon: '⏱️', xp: 100, unlockedAt: null },
  { id: 'hour_10', title: 'Maratoncu', desc: 'Tek günde 10 saat', icon: '🏃', xp: 150, unlockedAt: null },
  { id: 'week_20', title: 'Haftalık Şampiyon', desc: 'Haftada 20+ saat', icon: '📊', xp: 300, unlockedAt: null },
  { id: 'note_first', title: 'Not Alan', desc: 'İlk konu notunu yaz', icon: '📝', xp: 25, unlockedAt: null },
  { id: 'early_bird', title: 'Erken Kuş', desc: 'Sabah 7\'den önce çalış', icon: '🐦', xp: 50, unlockedAt: null },
  { id: 'night_owl', title: 'Gece Kuşu', desc: 'Gece 23\'ten sonra çalış', icon: '🦉', xp: 50, unlockedAt: null },
];

function xpToLevel(xp: number): number {
  let level = 1;
  let needed = 100;
  let total = 0;
  while (total + needed <= xp) {
    total += needed;
    level++;
    needed = Math.floor(needed * 1.2);
  }
  return level;
}

function xpProgressInLevel(xp: number): { current: number; needed: number; percent: number } {
  let level = 1;
  let needed = 100;
  let total = 0;
  while (total + needed <= xp) {
    total += needed;
    level++;
    needed = Math.floor(needed * 1.2);
  }
  const current = xp - total;
  return { current, needed, percent: Math.min(100, (current / needed) * 100) };
}

type GamificationContextType = {
  xp: number;
  addXp: (amount: number) => void;
  level: number;
  levelProgress: { current: number; needed: number; percent: number };
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
  checkAchievements: (stats: AchievementStats) => void;
};

type AchievementStats = {
  totalStudyHours: number;
  streak: number;
  topicsDone: number;
  totalTopics: number;
  pomodoroCompleted: number;
  hasNotes: boolean;
  studyLog: Record<string, number>;
};

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const [xp, setXpState] = useState(0);
  const [achievements, setAchievementsState] = useState<Achievement[]>(ACHIEVEMENTS);

  useEffect(() => {
    AsyncStorage.getItem(GAMIFICATION_KEY).then((raw) => {
      if (raw) {
        const d = JSON.parse(raw);
        setXpState(d.xp || 0);
        setAchievementsState(ACHIEVEMENTS.map((a) => ({
          ...a,
          unlockedAt: d.achievements?.[a.id] || null,
        })));
      }
    });
  }, []);

  const persist = (newXp: number, newAchievements: Achievement[]) => {
    const unlocked: Record<string, string> = {};
    newAchievements.forEach((a) => {
      if (a.unlockedAt) unlocked[a.id] = a.unlockedAt;
    });
    AsyncStorage.setItem(GAMIFICATION_KEY, JSON.stringify({ xp: newXp, achievements: unlocked }));
  };

  const addXp = (amount: number) => {
    setXpState((prev) => {
      const next = prev + amount;
      persist(next, achievements);
      return next;
    });
  };

  const unlockAchievement = (id: string) => {
    const a = achievements.find((x) => x.id === id);
    if (!a || a.unlockedAt) return;
    const now = new Date().toISOString();
    setAchievementsState((prev) => {
      const next = prev.map((x) => (x.id === id ? { ...x, unlockedAt: now } : x));
      persist(xp, next);
      return next;
    });
    addXp(a.xp);
  };

  const checkAchievements = (stats: AchievementStats) => {
    if (stats.totalStudyHours >= 0.5) unlockAchievement('first_study');
    if (stats.streak >= 3) unlockAchievement('streak_3');
    if (stats.streak >= 7) unlockAchievement('streak_7');
    if (stats.streak >= 30) unlockAchievement('streak_30');
    if (stats.topicsDone >= 5) unlockAchievement('topic_5');
    if (stats.topicsDone >= stats.totalTopics && stats.totalTopics > 0) unlockAchievement('topic_all');
    if (stats.pomodoroCompleted >= 5) unlockAchievement('pomodoro_5');
    if (stats.totalStudyHours >= 10) unlockAchievement('hour_10');
    const weekHours = Object.entries(stats.studyLog)
      .filter(([d]) => {
        const date = new Date(d);
        const now = new Date();
        const diff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
        return diff < 7;
      })
      .reduce((a, [, h]) => a + h, 0);
    if (weekHours >= 20) unlockAchievement('week_20');
    if (stats.hasNotes) unlockAchievement('note_first');
  };

  return (
    <GamificationContext.Provider
      value={{
        xp,
        addXp,
        level: xpToLevel(xp),
        levelProgress: xpProgressInLevel(xp),
        achievements,
        unlockAchievement,
        checkAchievements,
      }}
    >
      {children}
    </GamificationContext.Provider>
  );
}

export function useGamification() {
  const ctx = useContext(GamificationContext);
  if (!ctx) throw new Error('useGamification must be used within GamificationProvider');
  return ctx;
}
