import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { openingInfoManager } from '../utils/openingInfo';

export function OpeningPanel() {
  const { chess, moveHistory } = useGameStore();
  const [isExpanded, setIsExpanded] = useState(true);
  const [openingName, setOpeningName] = useState<string | null>(null);
  const [eco, setEco] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [isLoadingDescription, setIsLoadingDescription] = useState(false);

  useEffect(() => {
    const updateOpening = async () => {
      // Get opening info from current position
      const openingInfo = openingInfoManager.getOpeningInfo(chess.fen());
      
      if (openingInfo) {
        setOpeningName(openingInfo.name);
        setEco(openingInfo.eco);
        setDescription(null);
        setIsLoadingDescription(true);

        try {
          const desc = await openingInfoManager.generateDescription(
            openingInfo.name,
            openingInfo.eco
          );
          setDescription(desc);
        } catch (error) {
          console.error('Failed to get opening description:', error);
          setDescription(`${openingInfo.name} (ECO: ${openingInfo.eco})`);
        } finally {
          setIsLoadingDescription(false);
        }
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
    <div className="bg-[#312e2b] rounded-xl shadow-lg overflow-hidden flex flex-col max-h-96">
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
        <div className="border-t border-gray-700 p-4 flex-1 overflow-y-auto">
          {isLoadingDescription ? (
            <div className="flex items-center justify-center py-6">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin text-blue-500" fill="none" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-xs text-gray-400">Generating description...</span>
              </div>
            </div>
          ) : description ? (
            <div className="text-sm text-gray-300 leading-relaxed">
              <p>{description}</p>
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              <p>Opening information available.</p>
            </div>
          )}

          {/* Additional Info */}
          {!isLoadingDescription && (
            <div className="mt-4 pt-4 border-t border-gray-700 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Moves in opening:</span>
                <span className="text-gray-300 font-medium">{moveHistory.length}</span>
              </div>
              {eco && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Classification:</span>
                  <span className="text-gray-300 font-mono">{eco}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
