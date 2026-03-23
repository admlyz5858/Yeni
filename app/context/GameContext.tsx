import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGamification } from './GamificationContext';
import { usePlan } from './PlanContext';
import { useAuth } from './AuthContext';
import * as backend from '../lib/backend';

const GAME_KEY = '@study_game';

const TITLES = [
  { id: 'yeni', name: 'Yeni Öğrenci', minLevel: 1 },
  { id: 'caliskan', name: 'Çalışkan', minLevel: 5 },
  { id: 'odaklanan', name: 'Odaklanan', minLevel: 10 },
  { id: 'uzman', name: 'Uzman', minLevel: 15 },
  { id: 'ustasi', name: 'Ustası', minLevel: 20 },
  { id: 'efsane', name: 'Efsane', minLevel: 30 },
  { id: 'sehit', name: 'Şehit 🏆', minLevel: 50 },
];

const STUDY_GROUPS = [
  { id: '1', name: 'Maraton Koşucuları', icon: '🏃', color: '#ec4899', weeklyGoal: 20, members: 1247 },
  { id: '2', name: 'Gece Kuşları', icon: '🦉', color: '#7c3aed', weeklyGoal: 15, members: 892 },
  { id: '3', name: 'Erkenci Grubu', icon: '🌅', color: '#f59e0b', weeklyGoal: 18, members: 654 },
  { id: '4', name: 'Pomodoro Takımı', icon: '🍅', color: '#dc2626', weeklyGoal: 25, members: 2103 },
  { id: '5', name: 'Sessiz Odacılar', icon: '🤫', color: '#059669', weeklyGoal: 12, members: 445 },
];

const FAKE_NAMES = [
  'Ayşe K.', 'Mehmet Y.', 'Zeynep D.', 'Can S.', 'Elif M.', 'Burak T.', 'Deniz A.', 'Selin K.',
  'Emre Ö.', 'Aslı P.', 'Kerem B.', 'İrem V.', 'Onur Ç.', 'Ece L.', 'Arda N.', 'Sude H.',
];

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getLeaderboard(weekSeed: number, userXp: number): { rank: number; name: string; xp: number; isUser: boolean }[] {
  const list: { rank: number; name: string; xp: number; isUser: boolean }[] = [];
  const baseXp = 500 + Math.floor(seededRandom(weekSeed) * 2000);
  for (let i = 0; i < 15; i++) {
    const seed = weekSeed + i * 131;
    const xp = baseXp + Math.floor(seededRandom(seed) * 1500) + i * 80;
    list.push({ rank: i + 1, name: FAKE_NAMES[i % FAKE_NAMES.length], xp, isUser: false });
  }
  list.sort((a, b) => b.xp - a.xp);
  list.forEach((r, i) => r.rank = i + 1);
  const userRank = list.findIndex((r) => r.xp < userXp);
  const insertAt = userRank === -1 ? list.length : userRank;
  list.splice(insertAt, 0, { rank: insertAt + 1, name: 'Sen', xp: userXp, isUser: true });
  list.forEach((r, i) => r.rank = i + 1);
  return list.slice(0, 20);
}

export type PowerUp = {
  id: string;
  name: string;
  icon: string;
  desc: string;
  effect: 'xp2' | 'streak_shield';
  durationMinutes: number;
  costXp: number;
};

const POWER_UPS: PowerUp[] = [
  { id: 'xp2', name: 'XP Çarpanı', icon: '⚡', desc: '1 saat boyunca 2x XP', effect: 'xp2', durationMinutes: 60, costXp: 200 },
  { id: 'streak_shield', name: 'Seri Kalkanı', icon: '🛡️', desc: '1 gün seri kırılmasın', effect: 'streak_shield', durationMinutes: 24 * 60, costXp: 500 },
];

export type WeeklyQuest = {
  id: string;
  title: string;
  icon: string;
  target: number;
  xp: number;
  type: 'hours' | 'pomodoro' | 'days';
};

const WEEKLY_QUESTS: WeeklyQuest[] = [
  { id: 'w1', title: 'Haftada 15 saat', icon: '⏱️', target: 15, xp: 150, type: 'hours' },
  { id: 'w2', title: '12 Pomodoro', icon: '🍅', target: 12, xp: 120, type: 'pomodoro' },
  { id: 'w3', title: '5 gün çalış', icon: '📅', target: 5, xp: 100, type: 'days' },
];

type GameContextType = {
  leaderboard: { rank: number; name: string; xp: number; isUser: boolean }[];
  studyGroups: typeof STUDY_GROUPS;
  myGroupId: string | null;
  joinGroup: (groupId: string) => void;
  leaveGroup: () => void;
  titles: typeof TITLES;
  equippedTitleId: string;
  setEquippedTitle: (id: string) => void;
  powerUps: PowerUp[];
  activePowerUp: { id: string; expiresAt: number } | null;
  activatePowerUp: (id: string) => boolean;
  weeklyQuests: WeeklyQuest[];
  weeklyQuestProgress: Record<string, number>;
  weeklyCompleted: Record<string, boolean>;
  claimWeeklyQuest: (id: string) => number;
  focusStreak: number;
  levelUpModal: boolean;
  setLevelUpModal: (v: boolean) => void;
  checkLevelUp: (currentLevel: number) => void;
};

const Context = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const { user, hasBackend } = useAuth();
  const { xp, level, addXp } = useGamification();
  const { studyLog, pomodoroLog } = usePlan();
  const useSupabase = !!(user && user.id !== 'demo' && hasBackend);
  const userId = useSupabase ? user!.id : null;

  const [leaderboard, setLeaderboard] = useState<{ rank: number; name: string; xp: number; isUser: boolean }[]>([]);
  const [myGroupId, setMyGroupId] = useState<string | null>(null);
  const [equippedTitleId, setEquippedTitleId] = useState('yeni');
  const [activePowerUp, setActivePowerUp] = useState<{ id: string; expiresAt: number } | null>(null);
  const [weeklyCompleted, setWeeklyCompleted] = useState<Record<string, boolean>>({});
  const [levelUpModal, setLevelUpModal] = useState(false);
  const [lastSeenLevel, setLastSeenLevel] = useState(1);

  const weekStart = (() => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - (day === 0 ? 6 : day - 1);
    d.setDate(diff);
    return d.getTime();
  })();

  useEffect(() => {
    if (useSupabase && userId) {
      backend.getLeaderboard(25).then((data) => {
        const list = data.map((r, i) => ({
          rank: i + 1,
          name: r.userId === userId ? 'Sen' : (r.name || 'Anonim'),
          xp: r.xp,
          isUser: r.userId === userId,
        }));
        const me = list.find((r) => r.isUser);
        if (!me && userId) {
          list.push({ rank: list.length + 1, name: 'Sen', xp, isUser: true });
          list.sort((a, b) => b.xp - a.xp);
          list.forEach((r, i) => r.rank = i + 1);
        }
        setLeaderboard(list.slice(0, 20));
      });
    } else {
      setLeaderboard(getLeaderboard(Math.floor(weekStart / 86400000), xp));
    }
  }, [useSupabase, userId, xp]);

  useEffect(() => {
    if (useSupabase && userId) {
      backend.fetchGame(userId).then((data) => {
        if (data) {
          setMyGroupId(data.my_group_id || null);
          setEquippedTitleId(data.equipped_title_id || 'yeni');
          setWeeklyCompleted((data.weekly_completed as Record<string, boolean>) || {});
          setLastSeenLevel(data.last_seen_level ?? 1);
        }
      });
    }
  }, [useSupabase, userId]);

  useEffect(() => {
    if (!useSupabase) {
      AsyncStorage.getItem(GAME_KEY).then((r) => {
      if (r) {
        const d = JSON.parse(r);
        setMyGroupId(d.myGroupId || null);
        setEquippedTitleId(d.equippedTitleId || 'yeni');
        setWeeklyCompleted(d.weeklyCompleted || {});
        setLastSeenLevel(d.lastSeenLevel || 1);
      }
    });
    }
  }, [useSupabase]);

  const persist = (updates: Record<string, unknown>) => {
    if (useSupabase && userId) {
      backend.saveGame(userId, updates);
    } else {
      AsyncStorage.getItem(GAME_KEY).then((r) => {
        const d = r ? JSON.parse(r) : {};
        AsyncStorage.setItem(GAME_KEY, JSON.stringify({ ...d, ...updates }));
      });
    }
  };

  const checkLevelUp = (currentLevel: number) => {
    if (currentLevel > lastSeenLevel) {
      setLevelUpModal(true);
      setLastSeenLevel(currentLevel);
      persist({ lastSeenLevel: currentLevel });
    }
  };

  const joinGroup = (groupId: string) => {
    setMyGroupId(groupId);
    persist({ myGroupId: groupId });
  };

  const leaveGroup = () => {
    setMyGroupId(null);
    persist({ myGroupId: null });
  };

  const setEquippedTitle = (id: string) => {
    const t = TITLES.find((x) => x.id === id);
    if (t && level >= t.minLevel) {
      setEquippedTitleId(id);
      persist({ equippedTitleId: id });
    }
  };

  const activatePowerUp = (id: string): boolean => {
    const pu = POWER_UPS.find((x) => x.id === id);
    if (!pu || xp < pu.costXp) return false;
    addXp(-pu.costXp);
    setActivePowerUp({ id, expiresAt: Date.now() + pu.durationMinutes * 60 * 1000 });
    return true;
  };

  const weekDates = (() => {
    const dates: string[] = [];
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      dates.push(d.toISOString().slice(0, 10));
    }
    return dates;
  })();

  const weekHours = weekDates.reduce((a, d) => a + (studyLog[d] || 0), 0);
  const weekPomodoro = weekDates.reduce((a, d) => a + (pomodoroLog[d] || 0), 0);
  const weekDays = weekDates.filter((d) => (studyLog[d] || 0) >= 0.5).length;

  const weeklyQuestProgress: Record<string, number> = {
    w1: weekHours,
    w2: weekPomodoro,
    w3: weekDays,
  };

  const claimWeeklyQuest = (id: string): number => {
    const q = WEEKLY_QUESTS.find((x) => x.id === id);
    if (!q || weeklyCompleted[id]) return 0;
    const prog = weeklyQuestProgress[id] ?? 0;
    if (prog < q.target) return 0;
    setWeeklyCompleted((p) => ({ ...p, [id]: true }));
    persist({ weeklyCompleted: { ...weeklyCompleted, [id]: true } });
    addXp(q.xp);
    return q.xp;
  };

  const focusStreak = (() => {
    const today = new Date().toISOString().slice(0, 10);
    let count = 0;
    const d = new Date(today);
    for (let i = 0; i < 365; i++) {
      const key = d.toISOString().slice(0, 10);
      const dayPomodoro = pomodoroLog[key] || 0;
      if (dayPomodoro >= 1) count++;
      else break;
      d.setDate(d.getDate() - 1);
    }
    return count;
  })();

  return (
    <Context.Provider
      value={{
        leaderboard,
        studyGroups: STUDY_GROUPS,
        myGroupId,
        joinGroup,
        leaveGroup,
        titles: TITLES,
        equippedTitleId,
        setEquippedTitle,
        powerUps: POWER_UPS,
        activePowerUp,
        activatePowerUp,
        weeklyQuests: WEEKLY_QUESTS,
        weeklyQuestProgress,
        weeklyCompleted,
        claimWeeklyQuest,
        focusStreak,
        levelUpModal,
        setLevelUpModal,
        checkLevelUp,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useGame() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
