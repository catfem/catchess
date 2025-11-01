import { useGameStore } from '../store/gameStore';
import { getMoveColor, getMoveIcon } from '../utils/stockfish';

export function MoveList() {
  const { moveHistory, currentMoveIndex, goToMove, isAnalyzing } = useGameStore();

  if (moveHistory.length === 0) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center text-gray-500 p-6">
        <div className="text-5xl mb-3">♟️</div>
        <p className="text-sm">No moves yet</p>
        <p className="text-xs text-gray-600 mt-1">Start playing to see moves here</p>
      </div>
    );
  }

  const movePairs: Array<[typeof moveHistory[0], typeof moveHistory[0] | null]> = [];
  for (let i = 0; i < moveHistory.length; i += 2) {
    movePairs.push([moveHistory[i], moveHistory[i + 1] || null]);
  }

  return (
    <div className="h-full flex flex-col bg-[#2b2926]">
      {/* Header */}
      <div className="sticky top-0 bg-[#2b2926] border-b border-gray-800 px-4 py-3 z-10">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Moves</h3>
          {isAnalyzing && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-400">Analyzing...</span>
            </div>
          )}
        </div>
      </div>

      {/* Move List */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {movePairs.map((pair, pairIndex) => {
          const [whiteMove, blackMove] = pair;
          const moveNumber = pairIndex + 1;

          return (
            <div 
              key={pairIndex} 
              className="flex items-start hover:bg-[#312e2b] rounded transition-colors py-1 px-2"
            >
              {/* Move Number */}
              <div className="w-10 flex-shrink-0 text-gray-500 font-mono text-sm pt-1">
                {moveNumber}.
              </div>
              
              {/* White's Move */}
              <button
                onClick={() => goToMove(pairIndex * 2)}
                className={`flex-1 min-w-0 text-left rounded px-2 py-1 transition-all ${
                  currentMoveIndex === pairIndex * 2 
                    ? 'bg-blue-600/30 ring-1 ring-blue-500/50' 
                    : 'hover:bg-[#3a3633]'
                }`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Move Notation */}
                  <span className="font-mono text-sm text-gray-200 font-semibold">
                    {whiteMove.san}
                  </span>
                  
                  {/* Label Icon */}
                  <span 
                    className="inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold"
                    style={{ 
                      color: getMoveColor(whiteMove.label),
                      backgroundColor: `${getMoveColor(whiteMove.label)}20`
                    }}
                  >
                    {getMoveIcon(whiteMove.label)}
                  </span>
                  
                  {/* Evaluation */}
                  {whiteMove.eval !== 0 && (
                    <span className={`text-xs font-mono font-semibold ${
                      whiteMove.eval > 0 
                        ? 'text-gray-300' 
                        : 'text-gray-400'
                    }`}>
                      {whiteMove.eval > 0 ? '+' : ''}{whiteMove.eval.toFixed(2)}
                    </span>
                  )}
                  
                  {/* Depth Indicator */}
                  {whiteMove.isAnalyzing && whiteMove.currentDepth !== undefined && (
                    <span className="text-xs text-blue-400 font-mono animate-pulse">
                      D{whiteMove.currentDepth}
                    </span>
                  )}
                  {!whiteMove.isAnalyzing && whiteMove.depth && (
                    <span className="text-xs text-gray-600 font-mono">
                      d{whiteMove.depth}
                    </span>
                  )}
                </div>
              </button>

              {/* Black's Move */}
              {blackMove && (
                <button
                  onClick={() => goToMove(pairIndex * 2 + 1)}
                  className={`flex-1 min-w-0 text-left rounded px-2 py-1 transition-all ${
                    currentMoveIndex === pairIndex * 2 + 1 
                      ? 'bg-blue-600/30 ring-1 ring-blue-500/50' 
                      : 'hover:bg-[#3a3633]'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Move Notation */}
                    <span className="font-mono text-sm text-gray-200 font-semibold">
                      {blackMove.san}
                    </span>
                    
                    {/* Label Icon */}
                    <span 
                      className="inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold"
                      style={{ 
                        color: getMoveColor(blackMove.label),
                        backgroundColor: `${getMoveColor(blackMove.label)}20`
                      }}
                    >
                      {getMoveIcon(blackMove.label)}
                    </span>
                    
                    {/* Evaluation */}
                    {blackMove.eval !== 0 && (
                      <span className={`text-xs font-mono font-semibold ${
                        blackMove.eval > 0 
                          ? 'text-gray-300' 
                          : 'text-gray-400'
                      }`}>
                        {blackMove.eval > 0 ? '+' : ''}{blackMove.eval.toFixed(2)}
                      </span>
                    )}
                    
                    {/* Depth Indicator */}
                    {blackMove.isAnalyzing && blackMove.currentDepth !== undefined && (
                      <span className="text-xs text-blue-400 font-mono animate-pulse">
                        D{blackMove.currentDepth}
                      </span>
                    )}
                    {!blackMove.isAnalyzing && blackMove.depth && (
                      <span className="text-xs text-gray-600 font-mono">
                        d{blackMove.depth}
                      </span>
                    )}
                  </div>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
