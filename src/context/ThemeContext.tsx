'use client';

import React, { createContext, useContext, useLayoutEffect, useSyncExternalStore } from 'react';
import { createPersistentStore } from '@/utils/persistentStore';
import { THEME_STORAGE_KEY } from '@/utils/themeScript';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const themeStore = createPersistentStore<Theme>(
  THEME_STORAGE_KEY,
  'dark',
  (v): v is Theme => v === 'dark' || v === 'light'
);

const applyTheme = (theme: Theme) => document.documentElement.setAttribute('data-theme', theme);

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(themeStore.subscribe, themeStore.get, themeStore.getServer);

  useLayoutEffect(() => {
    applyTheme(themeStore.get());
  }, []);

  const setTheme = (next: Theme) => {
    themeStore.set(next);
    applyTheme(next);
  };

  const toggleTheme = () => setTheme(themeStore.get() === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
