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
  StudySession,
  TopicProgress,
  TopicStatus,
  defaultState,
  defaultTopicProgress,
} from '../storage/types';
import { loadState, saveState, clearState } from '../storage/storage';

type Action =
  | { type: 'HYDRATE'; payload: AppState }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'UPDATE_TOPIC'; topicId: string; payload: Partial<TopicProgress> }
  | { type: 'ADD_SESSION'; payload: StudySession }
  | { type: 'RESET' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };
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
    case 'RESET':
      return defaultState;
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  hydrated: boolean;
  updateSettings: (payload: Partial<AppSettings>) => void;
  updateTopic: (topicId: string, payload: Partial<TopicProgress>) => void;
  setTopicStatus: (topicId: string, status: TopicStatus) => void;
  addSession: (session: StudySession) => void;
  resetAll: () => Promise<void>;
  getTopicProgress: (topicId: string) => TopicProgress;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, defaultState);
  const hydratedRef = useRef(false);
  const [hydrated, setHydrated] = React.useState(false);

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

  const updateSettings = useCallback((payload: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload });
  }, []);

  const updateTopic = useCallback(
    (topicId: string, payload: Partial<TopicProgress>) => {
      dispatch({ type: 'UPDATE_TOPIC', topicId, payload });
    },
    [],
  );

  const setTopicStatus = useCallback(
    (topicId: string, status: TopicStatus) => {
      dispatch({ type: 'UPDATE_TOPIC', topicId, payload: { status } });
    },
    [],
  );

  const addSession = useCallback((session: StudySession) => {
    dispatch({ type: 'ADD_SESSION', payload: session });
  }, []);

  const resetAll = useCallback(async () => {
    await clearState();
    dispatch({ type: 'RESET' });
  }, []);

  const getTopicProgress = useCallback(
    (topicId: string): TopicProgress =>
      state.progress[topicId] ?? defaultTopicProgress,
    [state.progress],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      state,
      hydrated,
      updateSettings,
      updateTopic,
      setTopicStatus,
      addSession,
      resetAll,
      getTopicProgress,
    }),
    [
      state,
      hydrated,
      updateSettings,
      updateTopic,
      setTopicStatus,
      addSession,
      resetAll,
      getTopicProgress,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
