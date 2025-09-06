import { useEffect } from 'react';
import { useUIStore } from '@/store';

export function useTheme() {
  const { theme, setTheme, toggleTheme } = useUIStore();

  useEffect(() => {
    // Apply theme on mount
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
  };
}
