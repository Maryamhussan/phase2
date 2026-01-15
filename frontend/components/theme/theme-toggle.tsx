'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme';

import { Button } from '@/components/ui/button';

export function ThemeToggle() {
  const { theme, setTheme, isDarkMode } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      <Sun className={`h-5 w-5 rotate-0 scale-100 transition-all ${isDarkMode ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
      <Moon className={`absolute h-5 w-5 rotate-90 scale-0 transition-all ${isDarkMode ? 'rotate-0 scale-100' : 'rotate-90 scale-0'}`} />
    </Button>
  );
}