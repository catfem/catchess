/**
 * Main Application Component
 * Refactored for modern architecture
 */

import { useEffect } from 'react';
import { useThemeStore } from './core/store/theme.store';
import { GameView } from './features/game/GameView';

export default function App() {
  const { theme, setThemeMode } = useThemeStore();

  // Initialize theme on mount
  useEffect(() => {
    setThemeMode(theme.mode);
  }, [theme.mode, setThemeMode]);

  return (
    <div className="h-screen w-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <GameView />
    </div>
  );
}
