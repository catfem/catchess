import { useState, useEffect } from 'react';

type PieceType = 'q' | 'r' | 'b' | 'n';

interface PromotionDialogProps {
  isOpen: boolean;
  color: 'w' | 'b';
  onSelect: (piece: PieceType) => void;
  position: { x: number; y: number } | null;
}

export function PromotionDialog({ isOpen, color, onSelect, position }: PromotionDialogProps) {
  const [selectedPiece, setSelectedPiece] = useState<PieceType>('q');

  useEffect(() => {
    if (isOpen) {
      setSelectedPiece('q');
    }
  }, [isOpen]);

  if (!isOpen || !position) return null;

  const pieces: { type: PieceType; label: string; symbol: string }[] = [
    { type: 'q', label: 'Queen', symbol: color === 'w' ? '♕' : '♛' },
    { type: 'r', label: 'Rook', symbol: color === 'w' ? '♖' : '♜' },
    { type: 'b', label: 'Bishop', symbol: color === 'w' ? '♗' : '♝' },
    { type: 'n', label: 'Knight', symbol: color === 'w' ? '♘' : '♞' },
  ];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onSelect(selectedPiece);
        }
      }}
    >
      <div
        className="bg-[#312e2b] rounded-xl p-6 shadow-2xl"
        style={{
          position: 'fixed',
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <h3 className="text-white text-lg font-semibold mb-4 text-center">
          Choose Promotion
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {pieces.map((piece) => (
            <button
              key={piece.type}
              onClick={() => {
                setSelectedPiece(piece.type);
                onSelect(piece.type);
              }}
              className={`
                w-20 h-20 rounded-lg flex flex-col items-center justify-center
                transition-all duration-200 hover:scale-105
                ${
                  selectedPiece === piece.type
                    ? 'bg-yellow-600 ring-2 ring-yellow-400'
                    : 'bg-[#3a3530] hover:bg-[#4a453f]'
                }
              `}
            >
              <span className="text-4xl mb-1">{piece.symbol}</span>
              <span className="text-xs text-gray-300">{piece.label}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 text-center">
          <button
            onClick={() => onSelect(selectedPiece)}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
