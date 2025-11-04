/**
 * Chess Board Component
 * Uses react-chessboard with game store integration
 */

import { Chessboard } from 'react-chessboard';
import { useGameStore } from '../../../core/store/game.store';
import { useThemeStore } from '../../../core/store/theme.store';

export function GameBoard() {
  const { chess, makeMove } = useGameStore();
  const { theme } = useThemeStore();

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    // Check if pawn promotion
    const piece = chess.get(sourceSquare as 'a1'); // Type assertion for chess.js
    const isPromotion = piece?.type === 'p' && (targetSquare[1] === '8' || targetSquare[1] === '1');

    if (isPromotion) {
      // Auto-promote to queen for now
      // TODO: Add promotion dialog
      makeMove(sourceSquare, targetSquare, 'q');
    } else {
      makeMove(sourceSquare, targetSquare);
    }

    return true;
  };

  const getBoardColors = () => {
    switch (theme.board) {
      case 'wood':
        return {
          lightSquare: '#f0d9b5',
          darkSquare: '#b58863',
        };
      case 'blue':
        return {
          lightSquare: '#dee3e6',
          darkSquare: '#8ca2ad',
        };
      case 'green':
        return {
          lightSquare: '#ffffdd',
          darkSquare: '#86a666',
        };
      case 'marble':
        return {
          lightSquare: '#e8e0d7',
          darkSquare: '#9f7fb5',
        };
      default: // classic
        return {
          lightSquare: '#f0d9b5',
          darkSquare: '#b58863',
        };
    }
  };

  return (
    <div className="w-full aspect-square">
      <Chessboard
        position={chess.fen()}
        onPieceDrop={onDrop}
        boardWidth={600}
        customBoardStyle={{
          borderRadius: '8px',
          boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3)',
        }}
        customLightSquareStyle={{ backgroundColor: getBoardColors().lightSquare }}
        customDarkSquareStyle={{ backgroundColor: getBoardColors().darkSquare }}
      />
    </div>
  );
}
