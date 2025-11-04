/**
 * Game Header Component
 */

import { useThemeStore } from '../../../core/store/theme.store';
import { useGameStore } from '../../../core/store/game.store';

interface GameHeaderProps {
  onToggleAnalysis: () => void;
  onToggleMoves: () => void;
  showAnalysis: boolean;
  showMoves: boolean;
}

export function GameHeader({ onToggleAnalysis, onToggleMoves, showAnalysis, showMoves }: GameHeaderProps) {
  const { toggleTheme, theme } = useThemeStore();
  const { resetGame, chess } = useGameStore();

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 px-6">
      <div className="h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <span className="text-3xl">♟️</span>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            CatChess
          </h1>
        </div>

        {/* Game Status */}
        <div className="flex items-center gap-4">
          {chess.isCheckmate() && (
            <div className="px-3 py-1 bg-red-500 text-white rounded-lg font-semibold text-sm">
              Checkmate
            </div>
          )}
          {chess.isDraw() && (
            <div className="px-3 py-1 bg-blue-500 text-white rounded-lg font-semibold text-sm">
              Draw
            </div>
          )}
          {chess.isCheck() && !chess.isCheckmate() && (
            <div className="px-3 py-1 bg-yellow-500 text-white rounded-lg font-semibold text-sm">
              Check
            </div>
          )}
          {!chess.isGameOver() && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {chess.turn() === 'w' ? '⚪ White' : '⚫ Black'} to move
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleMoves}
            className={`p-2 rounded-lg transition-colors ${
              showMoves
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="Toggle moves"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>

          <button
            onClick={onToggleAnalysis}
            className={`p-2 rounded-lg transition-colors ${
              showAnalysis
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            title="Toggle analysis"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            title="Toggle theme"
          >
            {theme.mode === 'dark' ? '🌙' : '☀️'}
          </button>

          <button
            onClick={resetGame}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            title="New game"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
