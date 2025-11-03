import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { openingInfoManager } from '../utils/openingInfo';
import { getOpeningDescription } from '../utils/openingDescriptions';

export function OpeningPanel() {
  const { chess, moveHistory } = useGameStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [openingName, setOpeningName] = useState<string | null>(null);
  const [eco, setEco] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);

  useEffect(() => {
    const updateOpening = () => {
      // Get opening info from current position
      const openingInfo = openingInfoManager.getOpeningInfo(chess.fen());
      
      if (openingInfo) {
        setOpeningName(openingInfo.name);
        setEco(openingInfo.eco);
        setDescription(getOpeningDescription(openingInfo.name));
      } else {
        setOpeningName(null);
        setEco(null);
        setDescription(null);
      }
    };

    updateOpening();
  }, [chess, moveHistory.length]);

  if (!openingName) {
    return (
      <div className="bg-[#312e2b] rounded-xl p-4 shadow-lg">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Opening</h3>
        <p className="text-gray-500 text-sm mt-3">Play moves to enter known openings...</p>
      </div>
    );
  }

  return (
    <div className="bg-[#312e2b] rounded-xl shadow-lg overflow-hidden flex flex-col max-h-80">
      {/* Header */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-[#3a3530] transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Opening</h3>
          <div className="mt-2">
            <p className="text-white font-semibold text-sm truncate">{openingName}</p>
            {eco && <p className="text-gray-500 text-xs mt-1">ECO: {eco}</p>}
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-gray-700 p-4 overflow-y-auto flex flex-col gap-3">
          {/* Description */}
          {description && (
            <div className="text-xs text-gray-300 leading-relaxed">
              <p className="text-gray-400 font-semibold mb-1">📖 Description</p>
              <p>{description}</p>
            </div>
          )}
          
          {/* Info */}
          <div className="space-y-2 text-xs pt-2 border-t border-gray-700">
            <div className="flex justify-between">
              <span className="text-gray-500">Moves played:</span>
              <span className="text-gray-300 font-medium">{moveHistory.length}</span>
            </div>
            {eco && (
              <div className="flex justify-between">
                <span className="text-gray-500">Classification:</span>
                <span className="text-gray-300 font-mono">{eco}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
