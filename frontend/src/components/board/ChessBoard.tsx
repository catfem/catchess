import React, { useState, useCallback, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Square } from 'chess.js';
import { ChessGame } from '../../utils/chess';
import { useAppStore } from '../../store';
import { ChessMove } from '../../types';

interface ChessBoardProps {
  onMove?: (move: ChessMove) => void;
  orientation?: 'white' | 'black';
  interactive?: boolean;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  onMove,
  orientation = 'white',
  interactive = true,
}) => {
  const { game, userSettings } = useAppStore();
  const [chess] = useState(() => new ChessGame(game.fen));
  const [moveFrom, setMoveFrom] = useState<Square | null>(null);
  const [moveTo, setMoveTo] = useState<Square | null>(null);
  const [showPromotionDialog, setShowPromotionDialog] = useState(false);
  const [optionSquares, setOptionSquares] = useState<Record<string, any>>({});

  useEffect(() => {
    if (game.fen) {
      chess.loadFen(game.fen);
    }
  }, [game.fen, chess]);

  const getMoveOptions = useCallback((square: Square) => {
    const moves = chess.getLegalMoves(square);
    if (moves.length === 0) {
      return {};
    }

    const newSquares: Record<string, any> = {};
    moves.forEach((move) => {
      newSquares[move] = {
        background:
          chess.getPiece(move) && chess.getPiece(move).color !== chess.getTurn()
            ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%',
      };
    });
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)',
    };
    return newSquares;
  }, [chess]);

  const playMoveSound = useCallback((move: ChessMove) => {
    const audio = new Audio();
    if (move.captured) {
      audio.src = '/sounds/capture.mp3';
    } else if (move.flags.includes('k') || move.flags.includes('q')) {
      audio.src = '/sounds/castle.mp3';
    } else {
      audio.src = '/sounds/move.mp3';
    }
    audio.play().catch(() => {});
  }, []);

  const makeMove = useCallback(
    (from: Square, to: Square, promotion?: string) => {
      const move = chess.makeMove(from, to, promotion);
      if (move && onMove) {
        onMove(move);
        if (userSettings.soundEnabled) {
          playMoveSound(move);
        }
      }
      setMoveFrom(null);
      setMoveTo(null);
      setOptionSquares({});
      setShowPromotionDialog(false);
    },
    [chess, onMove, userSettings.soundEnabled, playMoveSound]
  );

  const onSquareClick = useCallback(
    (square: Square) => {
      if (!interactive) return;

      if (!moveFrom) {
        const piece = chess.getPiece(square);
        if (piece && piece.color === chess.getTurn()) {
          setMoveFrom(square);
          if (userSettings.highlightLegalMoves) {
            setOptionSquares(getMoveOptions(square));
          }
        }
        return;
      }

      if (moveFrom === square) {
        setMoveFrom(null);
        setOptionSquares({});
        return;
      }

      const moves = chess.getLegalMoves(moveFrom);
      if (!moves.includes(square)) {
        const piece = chess.getPiece(square);
        if (piece && piece.color === chess.getTurn()) {
          setMoveFrom(square);
          if (userSettings.highlightLegalMoves) {
            setOptionSquares(getMoveOptions(square));
          }
        } else {
          setMoveFrom(null);
          setOptionSquares({});
        }
        return;
      }

      const piece = chess.getPiece(moveFrom);
      if (
        piece &&
        piece.type === 'p' &&
        ((piece.color === 'w' && square[1] === '8') ||
          (piece.color === 'b' && square[1] === '1'))
      ) {
        setMoveTo(square);
        setShowPromotionDialog(true);
        return;
      }

      makeMove(moveFrom, square);
    },
    [moveFrom, chess, interactive, userSettings.highlightLegalMoves, getMoveOptions, makeMove]
  );

  const onPieceDrop = useCallback(
    (sourceSquare: Square, targetSquare: Square): boolean => {
      if (!interactive) return false;

      const piece = chess.getPiece(sourceSquare);
      if (
        piece &&
        piece.type === 'p' &&
        ((piece.color === 'w' && targetSquare[1] === '8') ||
          (piece.color === 'b' && targetSquare[1] === '1'))
      ) {
        setMoveFrom(sourceSquare);
        setMoveTo(targetSquare);
        setShowPromotionDialog(true);
        return false;
      }

      const move = chess.makeMove(sourceSquare, targetSquare);
      if (move) {
        if (onMove) {
          onMove(move);
        }
        if (userSettings.soundEnabled) {
          playMoveSound(move);
        }
        return true;
      }
      return false;
    },
    [chess, interactive, onMove, userSettings.soundEnabled, playMoveSound]
  );

  const handlePromotion = (piece: 'q' | 'r' | 'b' | 'n') => {
    if (moveFrom && moveTo) {
      makeMove(moveFrom, moveTo, piece);
    }
  };

  return (
    <div className="relative">
      <Chessboard
        position={game.fen}
        onPieceDrop={onPieceDrop}
        onSquareClick={onSquareClick}
        boardOrientation={orientation}
        customSquareStyles={{
          ...optionSquares,
        }}
        animationDuration={userSettings.animationSpeed}
        arePiecesDraggable={interactive}
        boardWidth={600}
        customBoardStyle={{
          borderRadius: '8px',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
        }}
      />

      {showPromotionDialog && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Promote Pawn
            </h3>
            <div className="flex gap-4">
              {(['q', 'r', 'b', 'n'] as const).map((piece) => (
                <button
                  key={piece}
                  onClick={() => handlePromotion(piece)}
                  className="w-16 h-16 flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <span className="text-4xl">
                    {piece === 'q' ? '♛' : piece === 'r' ? '♜' : piece === 'b' ? '♝' : '♞'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
