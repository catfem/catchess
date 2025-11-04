/**
 * Main Game View
 * Clean, modern game interface
 */

import { useState } from 'react';
import { GameBoard } from './components/GameBoard';
import { MoveHistory } from './components/MoveHistory';
import { AnalysisPanel } from './components/AnalysisPanel';
import { GameHeader } from './components/GameHeader';
import { GameControls } from './components/GameControls';
import { useGameStore } from '../../core/store/game.store';

export function GameView() {
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [showMoves, setShowMoves] = useState(true);
  const { position } = useGameStore();

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <GameHeader
        onToggleAnalysis={() => setShowAnalysis(!showAnalysis)}
        onToggleMoves={() => setShowMoves(!showMoves)}
        showAnalysis={showAnalysis}
        showMoves={showMoves}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Board */}
        <main className="flex-1 flex items-center justify-center p-4 lg:p-8">
          <div className="w-full max-w-3xl">
            <GameBoard />
          </div>
        </main>

        {/* Right Panel - Analysis & Moves */}
        {(showAnalysis || showMoves) && (
          <aside className="w-96 border-l border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 flex flex-col overflow-hidden">
            {showMoves && (
              <div className="flex-1 overflow-hidden">
                <MoveHistory />
              </div>
            )}
            
            {showAnalysis && position.moves.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-800">
                <AnalysisPanel />
              </div>
            )}
          </aside>
        )}
      </div>

      {/* Bottom Controls */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
        <GameControls />
      </footer>
    </div>
  );
}
