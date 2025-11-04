/**
 * Theme State Management
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppTheme, ThemeMode, BoardTheme } from '../types/chess.types';

interface ThemeStore {
  theme: AppTheme;
  setThemeMode: (mode: ThemeMode) => void;
  setBoardTheme: (board: BoardTheme) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: {
        mode: 'dark',
        board: 'classic',
      },

      setThemeMode: (mode: ThemeMode) => {
        set((state) => ({
          theme: { ...state.theme, mode },
        }));
        
        // Apply to document
        if (mode === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (mode === 'light') {
          document.documentElement.classList.remove('dark');
        } else {
          // Auto mode
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          document.documentElement.classList.toggle('dark', prefersDark);
        }
      },

      setBoardTheme: (board: BoardTheme) => {
        set((state) => ({
          theme: { ...state.theme, board },
        }));
      },

      toggleTheme: () => {
        const { theme } = get();
        const newMode: ThemeMode = theme.mode === 'dark' ? 'light' : 'dark';
        get().setThemeMode(newMode);
      },
    }),
    {
      name: 'catchess-theme',
    }
  )
);
