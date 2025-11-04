/**
 * Analysis Panel Component
 */

import { useGameStore } from '../../../core/store/game.store';
import { getMoveColor, getMoveIcon } from '../../../core/engine/stockfish.engine';

export function AnalysisPanel() {
  const { position } = useGameStore();
  
  const currentMove = position.moves[position.currentIndex];
  if (!currentMove) return null;

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Analysis
        </h3>
      </div>

      {/* Evaluation */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Evaluation</div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white">
          {currentMove.mate !== undefined ? (
            <span className="text-blue-500">M{Math.abs(currentMove.mate)}</span>
          ) : (
            <span>
              {currentMove.evaluation > 0 ? '+' : ''}
              {currentMove.evaluation.toFixed(2)}
            </span>
          )}
        </div>
        {currentMove.depth && (
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            Depth {currentMove.depth}
          </div>
        )}
      </div>

      {/* Move Quality */}
      {!currentMove.isAnalyzing && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Move Quality</div>
          <div className="flex items-center gap-3">
            <span
              className="text-3xl font-bold"
              style={{ color: getMoveColor(currentMove.label) }}
            >
              {getMoveIcon(currentMove.label)}
            </span>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white capitalize">
                {currentMove.label}
              </div>
              {currentMove.bestMove && currentMove.label !== 'best' && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Best: {currentMove.bestMove}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {currentMove.isAnalyzing && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Analyzing...
            </div>
          </div>
        </div>
      )}

      {/* Move Legend */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
        <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Move Symbols
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {(['brilliant', 'great', 'best', 'excellent', 'book', 'good', 'inaccuracy', 'mistake', 'blunder'] as const).map((label) => (
            <div key={label} className="flex items-center gap-2">
              <span style={{ color: getMoveColor(label) }} className="font-bold">
                {getMoveIcon(label)}
              </span>
              <span className="text-gray-600 dark:text-gray-400 capitalize">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
