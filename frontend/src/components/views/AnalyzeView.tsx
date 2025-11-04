import { useState } from 'react';
import { ChessBoard } from '../ChessBoard';
import { MoveList } from '../MoveList';
import { EvaluationBar } from '../EvaluationBar';
import { GameControls } from '../GameControls';
import { PGNImport } from '../PGNImport';
import { OpeningPanel } from '../OpeningPanel';
import { StockfishStatus } from '../StockfishStatus';
import { useGameStore } from '../../store/gameStore';

export function AnalyzeView() {
  const [showSidebar, setShowSidebar] = useState(true);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(true);
  const {
    chess,
    moveHistory,
    currentMoveIndex,
    goToMove,
    resetGame,
    undoMove,
  } = useGameStore();

  const currentMove = moveHistory[currentMoveIndex >= 0 ? currentMoveIndex : moveHistory.length - 1];

  // Navigation functions
  const canGoBack = currentMoveIndex > -1;
  const canGoForward = currentMoveIndex < moveHistory.length - 1;
  const goFirst = () => goToMove(-1);
  const goPrevious = () => currentMoveIndex >= 0 && goToMove(currentMoveIndex - 1);
  const goNext = () => currentMoveIndex < moveHistory.length - 1 && goToMove(currentMoveIndex + 1);
  const goLast = () => goToMove(moveHistory.length - 1);

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
      {/* Left Sidebar */}
      <aside
        className={`${
          showSidebar ? 'w-80' : 'w-0'
        } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden flex-shrink-0`}
      >
        <div className="h-full overflow-y-auto p-6 space-y-6">
          {/* Import/Export Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Import Game
            </h3>
            <PGNImport />
          </div>

          {/* Opening Info */}
          <OpeningPanel />

          {/* Game Info */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              Game Info
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Moves</span>
                <span className="text-gray-900 dark:text-white font-medium">{moveHistory.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Position</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {currentMoveIndex + 1} / {moveHistory.length || 1}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Phase</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {moveHistory.length === 0
                    ? 'Start'
                    : moveHistory.length <= 10
                    ? 'Opening'
                    : moveHistory.length <= 40
                    ? 'Middlegame'
                    : 'Endgame'}
                </span>
              </div>
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
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={showSidebar ? 'Hide sidebar' : 'Show sidebar'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAnalysisPanel(!showAnalysisPanel)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                showAnalysisPanel
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <span className="flex items-center gap-2">
                🔍 Analysis
                {showAnalysisPanel && <span className="text-xs">✓</span>}
              </span>
            </button>
            <StockfishStatus />
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

        {/* Bottom Control Bar */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-4">
            {/* FEN Display */}
            <div className="hidden md:block flex-1 min-w-0">
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate font-mono">
                <span className="font-semibold">FEN:</span> {chess.fen()}
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={goFirst}
                disabled={!canGoBack}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="First move"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
                </svg>
              </button>

              <button
                onClick={goPrevious}
                disabled={!canGoBack}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Previous"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
                </svg>
              </button>

              <button
                onClick={goNext}
                disabled={!canGoForward}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Next"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
                </svg>
              </button>

              <button
                onClick={goLast}
                disabled={!canGoForward}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Last move"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 5.202v2.798l-5.445-3.63z" />
                </svg>
              </button>

              <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-2"></div>

              <button
                onClick={undoMove}
                disabled={moveHistory.length === 0}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                title="Undo"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              <button
                onClick={resetGame}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                title="New game"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Status */}
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Move {Math.floor((currentMoveIndex + 2) / 2)}/{Math.ceil(moveHistory.length / 2)}
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar - Moves & Analysis */}
      <aside className="hidden lg:flex lg:w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex-col">
        {/* Move List */}
        <div className="flex-1 overflow-hidden">
          <MoveList />
        </div>

        {/* Analysis Panel */}
        {showAnalysisPanel && currentMove && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Analysis
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Stockfish 17</span>
            </div>

            {/* Evaluation Display */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Evaluation</span>
                {currentMove.depth && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded">
                    Depth {currentMove.depth}
                  </span>
                )}
              </div>
              <div className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">
                {currentMove.mate ? (
                  <span className="text-blue-500">M{Math.abs(currentMove.mate)}</span>
                ) : (
                  <span className={currentMove.eval > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-500'}>
                    {currentMove.eval > 0 ? '+' : ''}
                    {currentMove.eval.toFixed(2)}
                  </span>
                )}
              </div>
              {currentMove.bestMove && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Best: <span className="text-gray-700 dark:text-gray-300 font-mono">{currentMove.bestMove}</span>
                </div>
              )}
            </div>

            {/* Move Labels Legend */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
              <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                Move Symbols
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { icon: '‼', label: 'Brilliant', color: '#1abc9c' },
                  { icon: '!', label: 'Great', color: '#3498db' },
                  { icon: '✓', label: 'Best', color: '#95a5a6' },
                  { icon: '⚡', label: 'Excellent', color: '#16a085' },
                  { icon: '📖', label: 'Book', color: '#f39c12' },
                  { icon: '○', label: 'Good', color: '#2ecc71' },
                  { icon: '?!', label: 'Inaccurate', color: '#f1c40f' },
                  { icon: '?', label: 'Mistake', color: '#e67e22' },
                  { icon: '⊘', label: 'Miss', color: '#9b59b6' },
                  { icon: '??', label: 'Blunder', color: '#e74c3c' },
                ].map(({ icon, label, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span style={{ color }} className="font-bold">
                      {icon}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
