import { useEffect, useState } from 'react';
import { MoveLabel as MoveLabelType } from '../types';
import { MoveLabelIcon } from './MoveLabelIcon';

interface PieceLabelBadgeProps {
  label: MoveLabelType | null;
  toSquare: string | null;  // e.g., "e4"
  boardOrientation: 'white' | 'black';
  moveNumber?: number;
}

const labelConfig: Record<MoveLabelType, { bg: string; iconColor: string }> = {
  brilliant: { bg: '#FFD700', iconColor: '#000000' },
  best: { bg: '#22C55E', iconColor: '#FFFFFF' },
  excellent: { bg: '#4ADE80', iconColor: '#FFFFFF' },
  great: { bg: '#3B82F6', iconColor: '#FFFFFF' },
  good: { bg: '#2DD4BF', iconColor: '#FFFFFF' },
  inaccuracy: { bg: '#F97316', iconColor: '#000000' },
  mistake: { bg: '#EF4444', iconColor: '#FFFFFF' },
  blunder: { bg: '#991B1B', iconColor: '#FFFFFF' },
  miss: { bg: '#9333EA', iconColor: '#FFFFFF' },
  book: { bg: '#6B7280', iconColor: '#FFFFFF' },
};

// Convert square notation (e.g., "e4") to board coordinates
function getSquarePosition(square: string, orientation: 'white' | 'black'): { row: number; col: number } {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0); // 0-7 (a-h)
  const rank = parseInt(square[1]) - 1; // 0-7 (1-8)
  
  if (orientation === 'white') {
    return {
      col: file,           // a=0, h=7
      row: 7 - rank        // 8=0, 1=7
    };
  } else {
    return {
      col: 7 - file,       // h=0, a=7
      row: rank            // 1=0, 8=7
    };
  }
}

export function PieceLabelBadge({ label, toSquare, boardOrientation, moveNumber }: PieceLabelBadgeProps) {
  const [visible, setVisible] = useState(false);
  const [currentLabel, setCurrentLabel] = useState<MoveLabelType | null>(null);
  const [currentSquare, setCurrentSquare] = useState<string | null>(null);
  const [badgeKey, setBadgeKey] = useState(0);

  useEffect(() => {
    if (label && toSquare && label !== 'book') {
      setCurrentLabel(label);
      setCurrentSquare(toSquare);
      setVisible(true);
      setBadgeKey(prev => prev + 1);

      // Fade out after 1.8 seconds
      const timer = setTimeout(() => {
        setVisible(false);
      }, 1800);

      return () => clearTimeout(timer);
    }
  }, [label, toSquare, moveNumber]);

  if (!currentLabel || !currentSquare || !visible) {
    return null;
  }

  const config = labelConfig[currentLabel];
  const { row, col } = getSquarePosition(currentSquare, boardOrientation);
  
  // Calculate position as percentage (each square is 12.5% of board)
  const top = `${row * 12.5}%`;
  const left = `${col * 12.5}%`;

  return (
    <div
      key={badgeKey}
      className="absolute pointer-events-none z-40"
      style={{
        top,
        left,
        width: '12.5%',
        height: '12.5%',
      }}
    >
      <div
        className="absolute flex items-center justify-center rounded-full shadow-lg animate-badge-pop"
        style={{
          top: '5%',
          right: '5%',
          width: '32px',
          height: '32px',
          backgroundColor: config.bg,
          border: '2px solid rgba(255, 255, 255, 0.9)',
          color: config.iconColor,
          animation: 'badgePop 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55), badgeFadeOut 0.4s ease-in 1.4s forwards',
        }}
      >
        <MoveLabelIcon label={currentLabel} size={18} />
      </div>
    </div>
  );
}
