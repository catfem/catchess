import { useGameStore } from '../store/gameStore';
import { getMoveColor, getMoveIcon } from '../utils/stockfish';

export function MoveList() {
  const { moveHistory, currentMoveIndex, goToMove } = useGameStore();

  if (moveHistory.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        No moves yet
      </div>
    );
  }

  const movePairs: Array<[typeof moveHistory[0], typeof moveHistory[0] | null]> = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    movePairs.push([moveHistory[i], moveHistory[i + 1] || null]);
  }

  return (
    <div className="h-[400px] overflow-y-auto bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-3 dark:text-white">Move History</h3>
      <div className="space-y-1">
        {movePairs.map((pair, pairIndex) => {
          const [whiteMove, blackMove] = pair;
          const moveNumber = pairIndex + 1;

          return (
            <div key={pairIndex} className="flex items-center space-x-2 text-sm">
              <span className="w-8 text-gray-500 dark:text-gray-400 font-mono">
                {moveNumber}.
              </span>
              
              <button
                onClick={() => goToMove(pairIndex * 2)}
                className={`flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  currentMoveIndex === pairIndex * 2 ? 'bg-blue-100 dark:bg-blue-900' : ''
                }`}
              >
                <span className="font-mono dark:text-white">{whiteMove.san}</span>
                <span 
                  className="text-xs font-bold"
                  style={{ color: getMoveColor(whiteMove.label) }}
                >
                  {getMoveIcon(whiteMove.label)}
                </span>
                {whiteMove.eval !== 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {whiteMove.eval > 0 ? '+' : ''}{whiteMove.eval.toFixed(1)}
                  </span>
                )}
              </button>

              {blackMove && (
                <button
                  onClick={() => goToMove(pairIndex * 2 + 1)}
                  className={`flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    currentMoveIndex === pairIndex * 2 + 1 ? 'bg-blue-100 dark:bg-blue-900' : ''
                  }`}
                >
                  <span className="font-mono dark:text-white">{blackMove.san}</span>
                  <span 
                    className="text-xs font-bold"
                    style={{ color: getMoveColor(blackMove.label) }}
                  >
                    {getMoveIcon(blackMove.label)}
                  </span>
                  {blackMove.eval !== 0 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {blackMove.eval > 0 ? '+' : ''}{blackMove.eval.toFixed(1)}
                    </span>
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
