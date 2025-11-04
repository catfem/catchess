/**
 * Move History Component
 */

import { useGameStore } from '../../../core/store/game.store';
import { getMoveColor, getMoveIcon } from '../../../core/engine/stockfish.engine';

export function MoveHistory() {
  const { position, goToMove } = useGameStore();

  const groupedMoves: Array<[number, typeof position.moves[0] | null, typeof position.moves[0] | null]> = [];
  
  for (let i = 0; i < position.moves.length; i += 2) {
    const moveNumber = Math.floor(i / 2) + 1;
    const whiteMove = position.moves[i];
    const blackMove = position.moves[i + 1] || null;
    groupedMoves.push([moveNumber, whiteMove, blackMove]);
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Moves</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {position.moves.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
            No moves yet
          </div>
        ) : (
          <div className="p-4 space-y-1">
            {groupedMoves.map(([moveNumber, whiteMove, blackMove], idx) => {
              if (!whiteMove) return null;
              
              return (
              <div key={idx} className="grid grid-cols-[40px_1fr_1fr] gap-2 text-sm">
                <div className="text-gray-500 dark:text-gray-400 font-mono">
                  {moveNumber}.
                </div>
                
                {/* White's move */}
                <button
                  onClick={() => goToMove(idx * 2)}
                  className={`text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    position.currentIndex === idx * 2
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  <span className="font-medium">{whiteMove.move.san}</span>
                  {whiteMove.label !== 'good' && !whiteMove.isAnalyzing && (
                    <span
                      className="ml-2 text-xs font-bold"
                      style={{ color: getMoveColor(whiteMove.label) }}
                    >
                      {getMoveIcon(whiteMove.label)}
                    </span>
                  )}
                  {whiteMove.isAnalyzing && (
                    <span className="ml-2 text-xs text-gray-400">...</span>
                  )}
                </button>
                
                {/* Black's move */}
                {blackMove ? (
                  <button
                    onClick={() => goToMove(idx * 2 + 1)}
                    className={`text-left px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      position.currentIndex === idx * 2 + 1
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                        : 'text-gray-900 dark:text-white'
                    }`}
                  >
                    <span className="font-medium">{blackMove.move.san}</span>
                    {blackMove.label !== 'good' && !blackMove.isAnalyzing && (
                      <span
                        className="ml-2 text-xs font-bold"
                        style={{ color: getMoveColor(blackMove.label) }}
                      >
                        {getMoveIcon(blackMove.label)}
                      </span>
                    )}
                    {blackMove.isAnalyzing && (
                      <span className="ml-2 text-xs text-gray-400">...</span>
                    )}
                  </button>
                ) : (
                  <div></div>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
