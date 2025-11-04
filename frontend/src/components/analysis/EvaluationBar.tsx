import React from 'react';

interface EvaluationBarProps {
  evaluation: number;
  mate?: number;
}

export const EvaluationBar: React.FC<EvaluationBarProps> = ({ evaluation, mate }) => {
  const getWhiteHeight = () => {
    if (mate !== undefined) {
      return mate > 0 ? 100 : 0;
    }

    const normalizedEval = Math.max(-10, Math.min(10, evaluation));
    const percentage = 50 + (normalizedEval / 20) * 100;
    return Math.max(0, Math.min(100, percentage));
  };

  const whiteHeight = getWhiteHeight();

  const getEvalText = () => {
    if (mate !== undefined) {
      return mate > 0 ? `M${mate}` : `M${Math.abs(mate)}`;
    }
    return evaluation > 0 ? `+${evaluation.toFixed(1)}` : evaluation.toFixed(1);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative w-8 h-96 bg-gray-800 dark:bg-gray-900 rounded-lg overflow-hidden shadow-lg">
        <div
          className="absolute bottom-0 left-0 right-0 bg-white transition-all duration-300 ease-out"
          style={{ height: `${whiteHeight}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-gray-900 bg-opacity-80 text-white text-xs font-bold px-2 py-1 rounded">
            {getEvalText()}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col gap-2 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-white border border-gray-300 rounded-sm" />
          <span>White</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-800 border border-gray-600 rounded-sm" />
          <span>Black</span>
        </div>
      </div>
    </div>
  );
};
