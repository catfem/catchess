import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export function ThemeToggle() {
  const { theme, setTheme } = useGameStore();

  useEffect(() => {
    if (theme.mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme.mode]);

  const toggleTheme = () => {
    setTheme({ mode: theme.mode === 'dark' ? 'light' : 'dark' });
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle theme"
    >
      {theme.mode === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
