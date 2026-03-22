import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDailyChallenge } from '../data/activities';

const GAMIFICATION_KEY = '@kpss_gamification';
const LOGIN_KEY = '@kpss_last_login';
const CHALLENGE_KEY = '@kpss_daily_challenge';

export type Achievement = {
  id: string;
  title: string;
  desc: string;
  icon: string;
  xp: number;
  premium?: boolean;
  unlockedAt: string | null;
};

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_study', title: 'İlk Adım', desc: 'İlk çalışma kaydı', icon: '🌟', xp: 50, unlockedAt: null },
  { id: 'streak_3', title: 'Kararlı', desc: '3 gün üst üste çalış', icon: '🔥', xp: 100, unlockedAt: null },
  { id: 'streak_7', title: 'Haftalık Devam', desc: '7 gün üst üste çalış', icon: '💪', xp: 200, unlockedAt: null },
  { id: 'streak_14', title: 'İki Hafta', desc: '14 gün üst üste çalış', icon: '⚡', xp: 350, unlockedAt: null },
  { id: 'streak_30', title: 'Demir İrade', desc: '30 gün üst üste çalış', icon: '🏆', xp: 500, unlockedAt: null },
  { id: 'streak_60', title: 'Efsane', desc: '60 gün üst üste çalış', icon: '👑', xp: 800, premium: true, unlockedAt: null },
  { id: 'topic_5', title: 'Konu Ustası', desc: '5 konu tamamla', icon: '📚', xp: 75, unlockedAt: null },
  { id: 'topic_10', title: 'Onluk Kulüp', desc: '10 konu tamamla', icon: '📖', xp: 150, unlockedAt: null },
  { id: 'topic_20', title: 'Yirmilik', desc: '20 konu tamamla', icon: '🎓', xp: 300, unlockedAt: null },
  { id: 'topic_all', title: 'Tamamlama', desc: 'Tüm konuları bitir', icon: '🎯', xp: 1000, unlockedAt: null },
  { id: 'pomodoro_5', title: 'Odaklanma', desc: '5 Pomodoro tamamla', icon: '⏱️', xp: 100, unlockedAt: null },
  { id: 'pomodoro_10', title: 'Odak Ustası', desc: '10 Pomodoro tamamla', icon: '🍅', xp: 200, unlockedAt: null },
  { id: 'pomodoro_25', title: 'Pomodoro Şampiyonu', desc: '25 Pomodoro tamamla', icon: '🌟', xp: 400, premium: true, unlockedAt: null },
  { id: 'hour_5', title: 'Beş Saat', desc: 'Tek günde 5 saat çalış', icon: '📈', xp: 80, unlockedAt: null },
  { id: 'hour_10', title: 'Maratoncu', desc: 'Tek günde 10 saat', icon: '🏃', xp: 150, unlockedAt: null },
  { id: 'hour_12', title: 'Ultra Maraton', desc: 'Tek günde 12 saat', icon: '🦾', xp: 250, premium: true, unlockedAt: null },
  { id: 'week_10', title: 'Haftalık On', desc: 'Haftada 10+ saat', icon: '📊', xp: 150, unlockedAt: null },
  { id: 'week_20', title: 'Haftalık Şampiyon', desc: 'Haftada 20+ saat', icon: '📊', xp: 300, unlockedAt: null },
  { id: 'week_30', title: 'Süper Hafta', desc: 'Haftada 30+ saat', icon: '🚀', xp: 500, premium: true, unlockedAt: null },
  { id: 'month_50', title: 'Aylık 50', desc: 'Ayda 50+ saat', icon: '📆', xp: 400, unlockedAt: null },
  { id: 'month_100', title: 'Aylık Yüz', desc: 'Ayda 100+ saat', icon: '💯', xp: 700, premium: true, unlockedAt: null },
  { id: 'note_first', title: 'Not Alan', desc: 'İlk konu notunu yaz', icon: '📝', xp: 25, unlockedAt: null },
  { id: 'note_10', title: 'Not Tutucu', desc: '10 konu notu', icon: '📒', xp: 100, unlockedAt: null },
  { id: 'early_bird', title: 'Erken Kuş', desc: 'Sabah 7\'den önce çalış', icon: '🐦', xp: 50, unlockedAt: null },
  { id: 'night_owl', title: 'Gece Kuşu', desc: 'Gece 23\'ten sonra çalış', icon: '🦉', xp: 50, unlockedAt: null },
  { id: 'flashcard_10', title: 'Kart Oynatıcı', desc: '10 flashcard oluştur', icon: '📇', xp: 60, unlockedAt: null },
  { id: 'flashcard_50', title: 'Kart Koleksiyoncusu', desc: '50 flashcard', icon: '🃏', xp: 200, unlockedAt: null },
  { id: 'flashcard_100', title: 'Kart Ustası', desc: '100 flashcard', icon: '✨', xp: 400, premium: true, unlockedAt: null },
  { id: 'challenge_7', title: 'Haftalık Mücadeleci', desc: '7 günlük challenge tamamla', icon: '🎯', xp: 200, unlockedAt: null },
  { id: 'challenge_30', title: 'Aylık Şampiyon', desc: '30 günlük challenge tamamla', icon: '🏅', xp: 600, premium: true, unlockedAt: null },
  { id: 'login_7', title: 'Düzenli Kullanıcı', desc: '7 gün üst üste giriş', icon: '📲', xp: 100, unlockedAt: null },
  { id: 'login_30', title: 'Sadık Kullanıcı', desc: '30 gün üst üste giriş', icon: '💎', xp: 300, unlockedAt: null },
  { id: 'level_10', title: 'Seviye 10', desc: '10. seviyeye ulaş', icon: '🔟', xp: 0, unlockedAt: null },
  { id: 'level_25', title: 'Seviye 25', desc: '25. seviyeye ulaş', icon: '⭐', xp: 0, premium: true, unlockedAt: null },
  { id: 'level_50', title: 'Elit Öğrenci', desc: '50. seviyeye ulaş', icon: '🌟', xp: 0, premium: true, unlockedAt: null },
  { id: 'total_100h', title: '100 Saat', desc: 'Toplam 100 saat çalış', icon: '⏰', xp: 300, unlockedAt: null },
  { id: 'total_500h', title: '500 Saat', desc: 'Toplam 500 saat çalış', icon: '⌛', xp: 800, premium: true, unlockedAt: null },
  { id: 'plan_first', title: 'Planlayıcı', desc: 'İlk programı oluştur', icon: '📅', xp: 30, unlockedAt: null },
  { id: 'exam_set', title: 'Hedef Belirleyici', desc: 'Sınav tarihini ayarla', icon: '🎯', xp: 20, unlockedAt: null },
];

function xpToLevel(xp: number): number {
  let level = 1;
  let needed = 100;
  let total = 0;
  while (total + needed <= xp) {
    total += needed;
    level++;
    needed = Math.floor(needed * 1.15);
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
    needed = Math.floor(needed * 1.15);
  }
  const current = xp - total;
  return { current, needed, percent: Math.min(100, (current / needed) * 100) };
}

export type DailyChallenge = {
  id: string;
  type: string;
  target: number;
  xp: number;
  title: string;
  icon: string;
};

export type DailyChallengeProgress = {
  challengeId: string;
  date: string;
  completed: boolean;
  progress: number;
};

type GamificationContextType = {
  xp: number;
  addXp: (amount: number) => void;
  level: number;
  levelProgress: { current: number; needed: number; percent: number };
  achievements: Achievement[];
  unlockAchievement: (id: string) => void;
  checkAchievements: (stats: AchievementStats) => void;
  dailyChallenge: DailyChallenge;
  dailyChallengeProgress: number;
  dailyChallengeCompleted: boolean;
  updateDailyChallengeFromStats: (stats: { todayHours: number; todayTopics: number; todayPomodoro: number; todayFlashcards: number; todayNotes: number; before8am: boolean }) => void;
  dailyLoginBonus: number;
  claimDailyLogin: () => number;
  loginStreak: number;
};

type AchievementStats = {
  totalStudyHours: number;
  streak: number;
  topicsDone: number;
  totalTopics: number;
  pomodoroCompleted: number;
  hasNotes: boolean;
  noteCount?: number;
  studyLog: Record<string, number>;
  flashcardCount?: number;
  challengeCompletions?: number;
  loginStreak?: number;
};

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const [xp, setXpState] = useState(0);
  const [achievements, setAchievementsState] = useState<Achievement[]>(ACHIEVEMENTS);
  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [challengeProgress, setChallengeProgress] = useState(0);
  const [lastLogin, setLastLogin] = useState<string | null>(null);
  const [loginStreak, setLoginStreak] = useState(0);
  const [dailyBonusClaimed, setDailyBonusClaimed] = useState(false);
  const [challengeSynced, setChallengeSynced] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const dailyChallenge = getDailyChallenge(Date.now());

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
    AsyncStorage.getItem(CHALLENGE_KEY).then((r) => {
      if (r) {
        const d = JSON.parse(r);
        if (d.date === today) {
          setChallengeCompleted(d.completed || false);
          setChallengeProgress(d.progress || 0);
        }
      }
    });
    AsyncStorage.getItem(LOGIN_KEY + '_bonus').then((r) => {
      if (r) {
        const d = JSON.parse(r);
        if (d.date === today) setDailyBonusClaimed(true);
      }
    });
    AsyncStorage.getItem(LOGIN_KEY).then((r) => {
      if (r) {
        const d = JSON.parse(r);
        const last = d.lastLogin;
        const streak = d.streak || 0;
        setLastLogin(last);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().slice(0, 10);
        if (last === yesterdayStr) setLoginStreak(streak);
        else if (last !== today) setLoginStreak(0);
      }
    });
  }, []);

  const persist = (newXp: number, newAchievements: Achievement[]) => {
    const unlocked: Record<string, string> = {};
    newAchievements.forEach((a) => { if (a.unlockedAt) unlocked[a.id] = a.unlockedAt; });
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

  const completeDailyChallenge = () => {
    if (challengeCompleted) return;
    setChallengeCompleted(true);
    addXp(dailyChallenge.xp);
    AsyncStorage.setItem(CHALLENGE_KEY, JSON.stringify({
      date: today,
      challengeId: dailyChallenge.id,
      completed: true,
      progress: dailyChallenge.target,
    }));
  };

  const updateDailyChallengeFromStats = (stats: {
    todayHours: number;
    todayTopics: number;
    todayPomodoro: number;
    todayFlashcards: number;
    todayNotes: number;
    before8am: boolean;
  }) => {
    if (challengeCompleted) return;
    let progress = 0;
    if (dailyChallenge.type === 'hours') progress = Math.min(stats.todayHours, dailyChallenge.target);
    else if (dailyChallenge.type === 'topics') progress = stats.todayTopics;
    else if (dailyChallenge.type === 'pomodoro') progress = stats.todayPomodoro;
    else if (dailyChallenge.type === 'flashcards') progress = stats.todayFlashcards;
    else if (dailyChallenge.type === 'notes') progress = stats.todayNotes;
    else if (dailyChallenge.type === 'early') progress = stats.before8am ? 1 : 0;
    setChallengeProgress(progress);
    if (progress >= dailyChallenge.target) completeDailyChallenge();
    else if (!challengeSynced) {
      setChallengeSynced(true);
      AsyncStorage.setItem(CHALLENGE_KEY, JSON.stringify({
        date: today,
        challengeId: dailyChallenge.id,
        completed: false,
        progress,
      }));
    }
  };

  const claimDailyLogin = (): number => {
    if (dailyBonusClaimed) return 0;
    const newStreak = !lastLogin || lastLogin !== today ? (() => {
      const y = new Date();
      y.setDate(y.getDate() - 1);
      const yesterdayStr = y.toISOString().slice(0, 10);
      return lastLogin === yesterdayStr ? loginStreak + 1 : 1;
    })() : loginStreak;
    const bonus = 20 + newStreak * 5;
    setDailyBonusClaimed(true);
    setLastLogin(today);
    setLoginStreak(newStreak);
    addXp(bonus);
    AsyncStorage.setItem(LOGIN_KEY, JSON.stringify({ lastLogin: today, streak: newStreak }));
    AsyncStorage.setItem(LOGIN_KEY + '_bonus', JSON.stringify({ date: today }));
    return bonus;
  };

  const checkAchievements = (stats: AchievementStats) => {
    if (stats.totalStudyHours >= 0.5) unlockAchievement('first_study');
    if (stats.streak >= 3) unlockAchievement('streak_3');
    if (stats.streak >= 7) unlockAchievement('streak_7');
    if (stats.streak >= 14) unlockAchievement('streak_14');
    if (stats.streak >= 30) unlockAchievement('streak_30');
    if (stats.streak >= 60) unlockAchievement('streak_60');
    if (stats.topicsDone >= 5) unlockAchievement('topic_5');
    if (stats.topicsDone >= 10) unlockAchievement('topic_10');
    if (stats.topicsDone >= 20) unlockAchievement('topic_20');
    if (stats.topicsDone >= stats.totalTopics && stats.totalTopics > 0) unlockAchievement('topic_all');
    if (stats.pomodoroCompleted >= 5) unlockAchievement('pomodoro_5');
    if (stats.pomodoroCompleted >= 10) unlockAchievement('pomodoro_10');
    if (stats.pomodoroCompleted >= 25) unlockAchievement('pomodoro_25');
    if (stats.totalStudyHours >= 5) unlockAchievement('hour_5');
    if (stats.totalStudyHours >= 10) unlockAchievement('hour_10');
    if (stats.totalStudyHours >= 12) unlockAchievement('hour_12');
    const weekHours = Object.entries(stats.studyLog)
      .filter(([d]) => (new Date().getTime() - new Date(d).getTime()) / (1000 * 60 * 60 * 24) < 7)
      .reduce((a, [, h]) => a + h, 0);
    if (weekHours >= 10) unlockAchievement('week_10');
    if (weekHours >= 20) unlockAchievement('week_20');
    if (weekHours >= 30) unlockAchievement('week_30');
    const monthHours = Object.values(stats.studyLog).reduce((a, b) => a + b, 0);
    if (monthHours >= 50) unlockAchievement('month_50');
    if (monthHours >= 100) unlockAchievement('month_100');
    if (stats.hasNotes) unlockAchievement('note_first');
    if ((stats.noteCount || 0) >= 10) unlockAchievement('note_10');
    if ((stats.flashcardCount || 0) >= 10) unlockAchievement('flashcard_10');
    if ((stats.flashcardCount || 0) >= 50) unlockAchievement('flashcard_50');
    if ((stats.flashcardCount || 0) >= 100) unlockAchievement('flashcard_100');
    if (stats.totalStudyHours >= 100) unlockAchievement('total_100h');
    if (stats.totalStudyHours >= 500) unlockAchievement('total_500h');
    const level = xpToLevel(xp);
    if (level >= 10) unlockAchievement('level_10');
    if (level >= 25) unlockAchievement('level_25');
    if (level >= 50) unlockAchievement('level_50');
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
        dailyChallenge,
        dailyChallengeProgress: challengeProgress,
        dailyChallengeCompleted: challengeCompleted,
        updateDailyChallengeFromStats,
        dailyLoginBonus: dailyBonusClaimed ? 0 : 20 + loginStreak * 5,
        claimDailyLogin,
        loginStreak,
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
