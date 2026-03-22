import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { light, dark, type Theme } from '../theme/colors';

const THEME_KEY = '@kpss_theme';

type ThemeMode = 'light' | 'dark';

type ThemeContextType = {
  theme: Theme;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  isDark: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((v) => {
      if (v === 'light' || v === 'dark') setModeState(v);
    });
  }, []);

  const theme = mode === 'dark' ? dark : light;

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
        isDark: mode === 'dark',
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
