import React from 'react';
import { MoveLabel } from '../../types';

interface MoveListProps {
  moves: string[];
  currentIndex: number;
  onMoveClick?: (index: number) => void;
  labels?: MoveLabel[];
}

export const MoveList: React.FC<MoveListProps> = ({
  moves,
  currentIndex,
  onMoveClick,
  labels,
}) => {
  const getLabelColor = (label?: MoveLabel) => {
    if (!label) return '';
    
    const colors: Record<MoveLabel, string> = {
      book: 'text-purple-600 dark:text-purple-400',
      brilliant: 'text-cyan-600 dark:text-cyan-400',
      best: 'text-green-600 dark:text-green-400',
      excellent: 'text-blue-600 dark:text-blue-400',
      good: 'text-gray-600 dark:text-gray-400',
      inaccuracy: 'text-yellow-600 dark:text-yellow-400',
      mistake: 'text-orange-600 dark:text-orange-400',
      miss: 'text-red-500 dark:text-red-400',
      blunder: 'text-red-700 dark:text-red-500',
    };
    
    return colors[label] || '';
  };

  const getLabelSymbol = (label?: MoveLabel) => {
    if (!label) return '';
    
    const symbols: Record<MoveLabel, string> = {
      book: '📖',
      brilliant: '‼️',
      best: '✓',
      excellent: '⌽',
      good: '○',
      inaccuracy: '?!',
      mistake: '?',
      miss: '??',
      blunder: '⁇',
    };
    
    return symbols[label] || '';
  };

  const groupedMoves: Array<[string | null, string | null]> = [];
  for (let i = 0; i < moves.length; i += 2) {
    groupedMoves.push([moves[i], moves[i + 1] || null]);
  }

  return (
    <div className="space-y-1">
      {groupedMoves.map(([whiteMove, blackMove], pairIndex) => {
        const whiteMoveIndex = pairIndex * 2;
        const blackMoveIndex = pairIndex * 2 + 1;

        return (
          <div
            key={pairIndex}
            className="flex items-center gap-2 text-sm py-1 px-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span className="text-gray-500 dark:text-gray-400 w-8 flex-shrink-0">
              {pairIndex + 1}.
            </span>

            <button
              onClick={() => onMoveClick?.(whiteMoveIndex)}
              className={`flex-1 text-left px-2 py-1 rounded transition-colors ${
                currentIndex === whiteMoveIndex
                  ? 'bg-blue-100 dark:bg-blue-900 font-semibold'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span className="font-mono">{whiteMove}</span>
              {labels && labels[whiteMoveIndex] && (
                <span
                  className={`ml-2 ${getLabelColor(labels[whiteMoveIndex])}`}
                  title={labels[whiteMoveIndex]}
                >
                  {getLabelSymbol(labels[whiteMoveIndex])}
                </span>
              )}
            </button>

            {blackMove && (
              <button
                onClick={() => onMoveClick?.(blackMoveIndex)}
                className={`flex-1 text-left px-2 py-1 rounded transition-colors ${
                  currentIndex === blackMoveIndex
                    ? 'bg-blue-100 dark:bg-blue-900 font-semibold'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <span className="font-mono">{blackMove}</span>
                {labels && labels[blackMoveIndex] && (
                  <span
                    className={`ml-2 ${getLabelColor(labels[blackMoveIndex])}`}
                    title={labels[blackMoveIndex]}
                  >
                    {getLabelSymbol(labels[blackMoveIndex])}
                  </span>
                )}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
