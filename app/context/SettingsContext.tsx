import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import * as backend from '../lib/backend';

const SETTINGS_KEY = '@study_app_settings';

export type AppSettings = {
  keepScreenOn: boolean;
  strictMode: boolean;
  firstDayOfWeek: 'sunday' | 'monday';
  dayStartHour: number;
  showTimeAsHours: boolean;
  hiddenFromRanking: boolean;
  soundEffects: boolean;
  customQuotes: string[];
};

const DEFAULT: AppSettings = {
  keepScreenOn: false,
  strictMode: false,
  firstDayOfWeek: 'monday',
  dayStartHour: 0,
  showTimeAsHours: false,
  hiddenFromRanking: false,
  soundEffects: true,
  customQuotes: [],
};

type SettingsContextType = AppSettings & {
  setKeepScreenOn: (v: boolean) => void;
  setStrictMode: (v: boolean) => void;
  setFirstDayOfWeek: (v: 'sunday' | 'monday') => void;
  setDayStartHour: (v: number) => void;
  setShowTimeAsHours: (v: boolean) => void;
  setHiddenFromRanking: (v: boolean) => void;
  setSoundEffects: (v: boolean) => void;
  setCustomQuotes: (v: string[]) => void;
  addCustomQuote: (q: string) => void;
  removeCustomQuote: (i: number) => void;
};

const Context = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user, hasBackend } = useAuth();
  const useSupabase = !!(user && user.id !== 'demo' && hasBackend);
  const userId = useSupabase ? user!.id : null;

  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT);

  const load = useCallback(async () => {
    if (userId) {
      try {
        const data = await backend.fetchSettings(userId);
        const prefs = (data as Record<string, unknown>)?.app_preferences;
        if (prefs && typeof prefs === 'object') {
          setSettingsState((s) => ({ ...s, ...prefs }));
          return;
        }
      } catch {}
    }
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setSettingsState((s) => ({ ...s, ...parsed }));
      } catch {}
    }
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  const persist = useCallback(
    (next: AppSettings) => {
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      if (userId) backend.saveAppPreferences(userId, next);
    },
    [userId]
  );

  const update = useCallback(
    (patch: Partial<AppSettings>) => {
      setSettingsState((s) => {
        const next = { ...s, ...patch };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const setKeepScreenOn = (v: boolean) => update({ keepScreenOn: v });
  const setStrictMode = (v: boolean) => update({ strictMode: v });
  const setFirstDayOfWeek = (v: 'sunday' | 'monday') => update({ firstDayOfWeek: v });
  const setDayStartHour = (v: number) => update({ dayStartHour: v });
  const setShowTimeAsHours = (v: boolean) => update({ showTimeAsHours: v });
  const setHiddenFromRanking = (v: boolean) => update({ hiddenFromRanking: v });
  const setSoundEffects = (v: boolean) => update({ soundEffects: v });
  const setCustomQuotes = (v: string[]) => update({ customQuotes: v });

  const addCustomQuote = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    setSettingsState((s) => {
      const next = { ...s, customQuotes: [...s.customQuotes, trimmed].slice(-20) };
      persist(next);
      return next;
    });
  };

  const removeCustomQuote = (i: number) => {
    setSettingsState((s) => {
      const next = {
        ...s,
        customQuotes: s.customQuotes.filter((_, j) => j !== i),
      };
      persist(next);
      return next;
    });
  };

  return (
    <Context.Provider
      value={{
        ...settings,
        setKeepScreenOn,
        setStrictMode,
        setFirstDayOfWeek,
        setDayStartHour,
        setShowTimeAsHours,
        setHiddenFromRanking,
        setSoundEffects,
        setCustomQuotes,
        addCustomQuote,
        removeCustomQuote,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
