'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'catppuccin' | 'monokai' | 'claude';

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (theme: Theme) => void;
} | null>(null);

const THEME_KEY = 'openapi-theme';

const themeClassMap: Record<Theme, string> = {
  light: '',
  dark: 'dark',
  catppuccin: 'catppuccin-mocha',
  monokai: 'monokai-pro',
  claude: 'claude',
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    // On mount, check localStorage
    const stored = localStorage.getItem(THEME_KEY) as Theme | null;
    if (stored && themeClassMap[stored]) {
      setThemeState(stored);
    }
  }, []);

  useEffect(() => {
    // Apply theme class to <html>
    const html = document.documentElement;
    Object.values(themeClassMap).forEach((cls) => {
      if (cls) html.classList.remove(cls);
    });
    if (themeClassMap[theme]) {
      html.classList.add(themeClassMap[theme]);
    }
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
