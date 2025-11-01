import { useGameStore } from '../store/gameStore';

export function EvaluationBar() {
  const { moveHistory, currentMoveIndex } = useGameStore();

  const currentMove = moveHistory[currentMoveIndex];
  const evaluation = currentMove?.eval || 0;

  const normalizedEval = Math.max(-10, Math.min(10, evaluation));
  const whitePercentage = ((normalizedEval + 10) / 20) * 100;

  return (
    <div className="w-12 h-[600px] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden shadow relative">
      <div 
        className="absolute bottom-0 left-0 right-0 bg-white transition-all duration-300"
        style={{ height: `${whitePercentage}%` }}
      />
      <div 
        className="absolute top-0 left-0 right-0 bg-gray-900 transition-all duration-300"
        style={{ height: `${100 - whitePercentage}%` }}
      />
      
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-500 text-white text-xs px-1 py-0.5 rounded font-mono z-10">
        {evaluation > 0 ? '+' : ''}{evaluation.toFixed(1)}
      </div>

      {currentMove?.mate && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-black text-xs px-1 py-0.5 rounded font-bold z-10">
          M{currentMove.mate}
        </div>
      )}
    </div>
  );
}
