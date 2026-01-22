'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Load theme from localStorage or system preference
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const currentTheme = savedTheme || 'system';
    setTheme(currentTheme);

    // Apply theme class to document
    const root = window.document.documentElement;

    if (currentTheme === 'system') {
      setIsDarkMode(systemPrefersDark);
      root.classList.toggle('dark', systemPrefersDark);
    } else {
      setIsDarkMode(currentTheme === 'dark');
      root.classList.toggle('dark', currentTheme === 'dark');
    }
  }, []);

  const updateTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);

    const root = window.document.documentElement;
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (newTheme === 'system') {
      setIsDarkMode(systemPrefersDark);
      root.classList.toggle('dark', systemPrefersDark);
    } else {
      setIsDarkMode(newTheme === 'dark');
      if (newTheme === 'light') {
        root.classList.remove('dark');
      } else if (newTheme === 'dark') {
        root.classList.add('dark');
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: updateTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}