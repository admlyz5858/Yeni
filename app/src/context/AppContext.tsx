import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import {
  AppSettings,
  AppState,
  Profile,
  StudySession,
  TopicProgress,
  TopicStatus,
  defaultState,
  defaultTopicProgress,
} from '../storage/types';
import { clearState, loadState, saveState } from '../storage/storage';
import { useAuth } from './AuthContext';
import {
  clearDailyTasksFromDate,
  fetchRemoteState,
  pushDailyTaskStatus,
  pushDailyTasks,
  pushProfile,
  pushSession,
  pushSettings,
  pushTopicProgress,
  wipeUserData,
} from '../lib/remote';
import {
  DailyTask,
  DailyTaskStatus,
  generateWeeklyPlan,
  mergeExistingTasks,
  todayKey,
} from '../lib/planner';

type Action =
  | { type: 'HYDRATE'; payload: AppState }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'UPDATE_PROFILE'; payload: Partial<Profile> }
  | { type: 'UPDATE_TOPIC'; topicId: string; payload: Partial<TopicProgress> }
  | { type: 'ADD_SESSION'; payload: StudySession }
  | { type: 'SET_DAILY_TASKS'; tasks: DailyTask[]; generatedFor: string }
  | {
      type: 'UPDATE_TASK_STATUS';
      taskId: string;
      status: DailyTaskStatus;
      updatedAt: number;
    }
  | { type: 'RESET' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'UPDATE_PROFILE':
      return { ...state, profile: { ...state.profile, ...action.payload } };
    case 'UPDATE_TOPIC': {
      const existing = state.progress[action.topicId] ?? defaultTopicProgress;
      return {
        ...state,
        progress: {
          ...state.progress,
          [action.topicId]: { ...existing, ...action.payload },
        },
      };
    }
    case 'ADD_SESSION': {
      const session = action.payload;
      const newSessions = [session, ...state.sessions].slice(0, 500);
      let progress = state.progress;
      if (session.topicId) {
        const existing = progress[session.topicId] ?? defaultTopicProgress;
        progress = {
          ...progress,
          [session.topicId]: {
            ...existing,
            studySeconds: existing.studySeconds + session.durationSeconds,
            lastStudiedAt: session.endedAt,
            status:
              existing.status === 'not_started' ? 'in_progress' : existing.status,
          },
        };
      }
      return { ...state, sessions: newSessions, progress };
    }
    case 'SET_DAILY_TASKS':
      return {
        ...state,
        dailyTasks: action.tasks,
        plannerGeneratedFor: action.generatedFor,
      };
    case 'UPDATE_TASK_STATUS':
      return {
        ...state,
        dailyTasks: state.dailyTasks.map((t) =>
          t.id === action.taskId
            ? { ...t, status: action.status, updatedAt: action.updatedAt }
            : t,
        ),
      };
    case 'RESET':
      return defaultState;
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  hydrated: boolean;
  syncing: boolean;
  updateSettings: (payload: Partial<AppSettings>) => void;
  updateProfile: (payload: Partial<Profile>) => Promise<void>;
  updateTopic: (topicId: string, payload: Partial<TopicProgress>) => void;
  setTopicStatus: (topicId: string, status: TopicStatus) => void;
  addSession: (session: StudySession) => void;
  resetAll: () => Promise<void>;
  getTopicProgress: (topicId: string) => TopicProgress;
  regeneratePlan: () => Promise<void>;
  ensurePlanForToday: () => Promise<void>;
  setTaskStatus: (taskId: string, status: DailyTaskStatus) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, defaultState);
  const [hydrated, setHydrated] = React.useState(false);
  const [syncing, setSyncing] = React.useState(false);
  const hydratedRef = useRef(false);
  const currentUserRef = useRef<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    let mounted = true;
    loadState().then((loaded) => {
      if (!mounted) return;
      dispatch({ type: 'HYDRATE', payload: loaded });
      hydratedRef.current = true;
      setHydrated(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hydratedRef.current) return;
    saveState(state);
  }, [state]);

  useEffect(() => {
    const userId = user?.id ?? null;
    if (currentUserRef.current === userId) return;
    currentUserRef.current = userId;

    if (!userId) {
      return;
    }

    let cancelled = false;
    setSyncing(true);
    fetchRemoteState(userId)
      .then((remote) => {
        if (cancelled) return;
        dispatch({ type: 'HYDRATE', payload: remote });
      })
      .catch((e) => {
        console.warn('[sync] fetchRemoteState failed', e?.message ?? e);
      })
      .finally(() => {
        if (!cancelled) setSyncing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const updateSettings = useCallback(
    (payload: Partial<AppSettings>) => {
      dispatch({ type: 'UPDATE_SETTINGS', payload });
      const userId = user?.id;
      if (userId) {
        const nextSettings = { ...state.settings, ...payload };
        pushSettings(userId, nextSettings).catch((e) =>
          console.warn('[sync] pushSettings failed', e?.message ?? e),
        );
      }
    },
    [user?.id, state.settings],
  );

  const updateProfile = useCallback(
    async (payload: Partial<Profile>) => {
      dispatch({ type: 'UPDATE_PROFILE', payload });
      const userId = user?.id;
      if (userId) {
        try {
          await pushProfile(userId, payload);
        } catch (e: any) {
          console.warn('[sync] pushProfile failed', e?.message ?? e);
          throw e;
        }
      }
    },
    [user?.id],
  );

  const updateTopic = useCallback(
    (topicId: string, payload: Partial<TopicProgress>) => {
      dispatch({ type: 'UPDATE_TOPIC', topicId, payload });
      const userId = user?.id;
      if (userId) {
        const existing = state.progress[topicId] ?? defaultTopicProgress;
        const merged: TopicProgress = { ...existing, ...payload };
        pushTopicProgress(userId, topicId, merged).catch((e) =>
          console.warn('[sync] pushTopicProgress failed', e?.message ?? e),
        );
      }
    },
    [user?.id, state.progress],
  );

  const setTopicStatus = useCallback(
    (topicId: string, status: TopicStatus) => {
      updateTopic(topicId, { status });
    },
    [updateTopic],
  );

  const addSession = useCallback(
    (session: StudySession) => {
      dispatch({ type: 'ADD_SESSION', payload: session });
      const userId = user?.id;
      if (userId) {
        pushSession(userId, session).catch((e) =>
          console.warn('[sync] pushSession failed', e?.message ?? e),
        );
        if (session.topicId) {
          const existing =
            state.progress[session.topicId] ?? defaultTopicProgress;
          const merged: TopicProgress = {
            ...existing,
            studySeconds: existing.studySeconds + session.durationSeconds,
            lastStudiedAt: session.endedAt,
            status:
              existing.status === 'not_started'
                ? 'in_progress'
                : existing.status,
          };
          pushTopicProgress(userId, session.topicId, merged).catch((e) =>
            console.warn('[sync] session topic push failed', e?.message ?? e),
          );
        }
      }
    },
    [user?.id, state.progress],
  );

  const resetAll = useCallback(async () => {
    const userId = user?.id;
    await clearState();
    dispatch({ type: 'RESET' });
    if (userId) {
      wipeUserData(userId).catch((e) =>
        console.warn('[sync] wipeUserData failed', e?.message ?? e),
      );
    }
  }, [user?.id]);

  const regeneratePlan = useCallback(async () => {
    const plan = generateWeeklyPlan({
      track: state.settings.track,
      dailyGoalMinutes: state.settings.dailyGoalMinutes,
      examDate: state.profile.examDate,
      progress: state.progress,
    });
    const fresh: DailyTask[] = plan.days.flatMap((d) => d.tasks);
    const merged = mergeExistingTasks(state.dailyTasks, fresh);
    dispatch({
      type: 'SET_DAILY_TASKS',
      tasks: merged,
      generatedFor: plan.generatedFor,
    });
    const userId = user?.id;
    if (userId) {
      try {
        const today = todayKey();
        await clearDailyTasksFromDate(userId, today);
        await pushDailyTasks(userId, merged);
      } catch (e: any) {
        console.warn('[sync] regeneratePlan push failed', e?.message ?? e);
      }
    }
  }, [
    state.settings.track,
    state.settings.dailyGoalMinutes,
    state.profile.examDate,
    state.progress,
    state.dailyTasks,
    user?.id,
  ]);

  const ensurePlanForToday = useCallback(async () => {
    const today = todayKey();
    if (state.plannerGeneratedFor === today) return;
    const hasTodayTasks = state.dailyTasks.some((t) => t.date === today);
    if (!hasTodayTasks) {
      await regeneratePlan();
    } else {
      dispatch({
        type: 'SET_DAILY_TASKS',
        tasks: state.dailyTasks,
        generatedFor: today,
      });
    }
  }, [state.plannerGeneratedFor, state.dailyTasks, regeneratePlan]);

  const setTaskStatus = useCallback(
    (taskId: string, status: DailyTaskStatus) => {
      const updatedAt = Date.now();
      dispatch({ type: 'UPDATE_TASK_STATUS', taskId, status, updatedAt });
      const userId = user?.id;
      const task = state.dailyTasks.find((t) => t.id === taskId);
      if (!task) return;
      if (userId) {
        pushDailyTaskStatus(userId, { ...task, status, updatedAt }).catch((e) =>
          console.warn('[sync] task status push failed', e?.message ?? e),
        );
      }
    },
    [state.dailyTasks, user?.id],
  );

  const getTopicProgress = useCallback(
    (topicId: string): TopicProgress =>
      state.progress[topicId] ?? defaultTopicProgress,
    [state.progress],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      hydrated,
      syncing,
      updateSettings,
      updateProfile,
      updateTopic,
      setTopicStatus,
      addSession,
      resetAll,
      getTopicProgress,
      regeneratePlan,
      ensurePlanForToday,
      setTaskStatus,
    }),
    [
      state,
      hydrated,
      syncing,
      updateSettings,
      updateProfile,
      updateTopic,
      setTopicStatus,
      addSession,
      resetAll,
      getTopicProgress,
      regeneratePlan,
      ensurePlanForToday,
      setTaskStatus,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
