import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { light, dark, ocean, forest, sunset, night, type Theme } from '../theme/colors';

const THEME_KEY = '@study_theme';

export type ThemeMode = 'light' | 'dark' | 'system' | 'ocean' | 'forest' | 'sunset' | 'night';

const THEMES = {
  light,
  dark,
  ocean,
  forest,
  sunset,
  night,
} as Record<Exclude<ThemeMode, 'system'>, Theme>;

export const THEME_OPTIONS: { id: ThemeMode; label: string; icon: string }[] = [
  { id: 'light', label: 'Açık', icon: '☀️' },
  { id: 'dark', label: 'Koyu', icon: '🌙' },
  { id: 'system', label: 'Sistem', icon: '📱' },
  { id: 'ocean', label: 'Okyanus', icon: '🌊' },
  { id: 'forest', label: 'Orman', icon: '🌲' },
  { id: 'sunset', label: 'Gün Batımı', icon: '🌅' },
  { id: 'night', label: 'Gece', icon: '✨' },
];

type ThemeContextType = {
  theme: Theme;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((v) => {
      if (v && (THEMES[v as Exclude<ThemeMode, 'system'>] || v === 'system')) setModeState(v as ThemeMode);
    });
  }, []);

  const resolvedMode: Exclude<ThemeMode, 'system'> =
    mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;
  const theme = THEMES[resolvedMode];

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(THEME_KEY, m);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        mode,
        setMode,
        isDark: resolvedMode === 'dark' || resolvedMode === 'night',
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
