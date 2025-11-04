import { useState } from 'react';
import { ChessBoard } from '../ChessBoard';
import { MoveList } from '../MoveList';
import { EvaluationBar } from '../EvaluationBar';
import { ChessClock } from '../ChessClock';
import { GameControls } from '../GameControls';
import { OpeningPanel } from '../OpeningPanel';
import { useGameStore } from '../../store/gameStore';

type GameMode = 'local' | 'online' | 'ai';

export function PlayView() {
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const { chess, moveHistory, currentMoveIndex } = useGameStore();

  const currentMove = moveHistory[currentMoveIndex >= 0 ? currentMoveIndex : moveHistory.length - 1];

  // If no game mode selected, show mode selector
  if (!selectedMode) {
    return (
      <div className="h-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Choose Game Mode
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Select how you want to play
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Local Play */}
            <button
              onClick={() => setSelectedMode('local')}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-blue-500 group"
            >
              <div className="text-6xl mb-4">🏠</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Local Game
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Play on one device with a friend or practice by yourself
              </p>
            </button>

            {/* Online Play */}
            <button
              onClick={() => setSelectedMode('online')}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-green-500 group"
            >
              <div className="text-6xl mb-4">🌐</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Online Game
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Play against opponents online in real-time
              </p>
              <span className="inline-block mt-3 text-xs font-semibold px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                Coming Soon
              </span>
            </button>

            {/* AI Play */}
            <button
              onClick={() => setSelectedMode('ai')}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-500 group"
            >
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Play vs AI
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Challenge Stockfish AI at different difficulty levels
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game interface
  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
      {/* Left Sidebar */}
      <aside
        className={`${
          showSidebar ? 'w-80' : 'w-0'
        } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden flex-shrink-0`}
      >
        <div className="h-full overflow-y-auto p-6 space-y-6">
          {/* Game Mode Badge */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedMode(null)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Change Mode
            </button>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {selectedMode === 'local' ? '🏠 Local' : selectedMode === 'ai' ? '🤖 vs AI' : '🌐 Online'}
            </span>
          </div>

          {/* Opening Info */}
          <OpeningPanel />

          {/* Game Status */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Game Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 dark:text-gray-300">Turn</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    chess.turn() === 'w'
                      ? 'bg-white text-gray-900 border border-gray-300'
                      : 'bg-gray-900 text-white border border-gray-700'
                  }`}
                >
                  {chess.turn() === 'w' ? '⚪ White' : '⚫ Black'}
                </span>
              </div>

              {chess.isCheck() && (
                <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-400 dark:border-yellow-600 rounded-lg px-3 py-2 text-yellow-800 dark:text-yellow-300 text-sm font-semibold">
                  ⚠️ Check!
                </div>
              )}

              {chess.isCheckmate() && (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded-lg px-3 py-2 text-red-800 dark:text-red-300 text-sm font-bold">
                  ♔ Checkmate!
                </div>
              )}

              {chess.isDraw() && (
                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-400 dark:border-blue-600 rounded-lg px-3 py-2 text-blue-800 dark:text-blue-300 text-sm font-semibold">
                  ½ Draw
                </div>
              )}
            </div>
          </div>

          {/* Game Controls */}
          <GameControls />
        </div>
      </aside>

      {/* Main Board Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex-1 flex justify-center">
            <ChessClock initialTime={600} increment={0} />
          </div>
        </div>

        {/* Board Area */}
        <div className="flex-1 flex items-center justify-center p-4 lg:p-8 overflow-auto">
          <div className="flex items-center justify-center gap-6 max-w-5xl w-full">
            {/* Evaluation Bar */}
            <div className="hidden lg:block">
              <EvaluationBar />
            </div>

            {/* Chess Board */}
            <div className="flex-1 max-w-[600px]">
              <ChessBoard />
            </div>
          </div>
        </div>

        {/* Mobile Evaluation */}
        {currentMove && (
          <div className="lg:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Evaluation</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {currentMove.mate ? (
                    <span className="text-blue-500">M{Math.abs(currentMove.mate)}</span>
                  ) : (
                    <span className={currentMove.eval > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-500'}>
                      {currentMove.eval > 0 ? '+' : ''}
                      {currentMove.eval.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              {currentMove.depth && (
                <div className="text-right">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Depth</div>
                  <div className="text-lg font-mono text-gray-700 dark:text-gray-300">{currentMove.depth}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Right Sidebar - Move List */}
      <aside className="hidden lg:flex lg:w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex-col">
        <MoveList />
      </aside>
    </div>
  );
}
