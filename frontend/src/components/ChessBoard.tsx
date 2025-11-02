import { useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { useGameStore } from '../store/gameStore';
import { Square } from 'chess.js';
import { MoveLabel } from './MoveLabel';
import { PieceLabelBadge } from './PieceLabelBadge';

export function ChessBoard() {
  const { chess, makeMove, gameMode, playerColor, moveHistory, currentMoveIndex } = useGameStore();
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [optionSquares, setOptionSquares] = useState<Record<string, { background: string; borderRadius?: string }>>({});
  
  // Get the current move's label and destination square
  const currentMove = moveHistory[currentMoveIndex >= 0 ? currentMoveIndex : moveHistory.length - 1];
  const currentLabel = currentMove?.label || null;
  const toSquare = currentMove?.to || null;

  // Calculate legal moves for a given square
  const getMoveOptions = (square: Square) => {
    const moves = chess.moves({
      square,
      verbose: true,
    });

    if (moves.length === 0) {
      return {};
    }

    const newSquares: Record<string, { background: string; borderRadius?: string }> = {};
    
    moves.forEach((move) => {
      const isCapture = move.captured;
      newSquares[move.to] = {
        background: isCapture
          ? 'radial-gradient(circle, rgba(100, 70, 50, 0.5) 85%, transparent 85%)'
          : 'radial-gradient(circle, rgba(139, 101, 76, 0.3) 25%, transparent 25%)',
        borderRadius: '50%',
      };
    });

    // Highlight the selected square
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)',
    };

    return newSquares;
  };

  const onSquareClick = (square: Square) => {
    // If game mode is vs-engine and it's not player's turn, ignore
    if (gameMode === 'vs-engine' && chess.turn() !== playerColor[0]) {
      return;
    }

    // If a square is already selected
    if (selectedSquare) {
      // Try to make the move
      makeMove(selectedSquare, square);
      
      // Clear selection regardless of move success
      setSelectedSquare(null);
      setOptionSquares({});
      
      return;
    }

    // Get the piece on the clicked square
    const piece = chess.get(square);
    
    // If there's a piece and it belongs to the player to move
    if (piece && piece.color === chess.turn()) {
      setSelectedSquare(square);
      const moves = getMoveOptions(square);
      setOptionSquares(moves);
    }
  };

  const onDrop = (sourceSquare: string, targetSquare: string): boolean => {
    if (gameMode === 'vs-engine' && chess.turn() !== playerColor[0]) {
      return false;
    }

    makeMove(sourceSquare, targetSquare);
    
    // Clear selection after drop
    setSelectedSquare(null);
    setOptionSquares({});
    
    return true;
  };

  const onPieceClick = (_piece: string, square: Square) => {
    // Trigger the square click handler
    onSquareClick(square);
  };

  const boardOrientation = gameMode === 'vs-engine' ? playerColor : 'white';

  return (
    <div className="relative w-full aspect-square max-w-[600px] mx-auto">
      <MoveLabel label={currentLabel} moveNumber={moveHistory.length} />
      <PieceLabelBadge 
        label={currentLabel} 
        toSquare={toSquare}
        boardOrientation={boardOrientation}
        moveNumber={moveHistory.length}
      />
      <Chessboard
        position={chess.fen()}
        onPieceDrop={onDrop}
        onSquareClick={onSquareClick}
        onPieceClick={onPieceClick}
        boardOrientation={boardOrientation}
        // Board styling - Classic wooden digital theme
        customBoardStyle={{
          borderRadius: '8px',
          boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.4)',
        }}
        // Dark squares - warm brown
        customDarkSquareStyle={{
          backgroundColor: '#b58863',
        }}
        // Light squares - soft beige
        customLightSquareStyle={{
          backgroundColor: '#f0d9b5',
        }}
        // Move highlights - show possible moves
        customSquareStyles={optionSquares}
        // Show coordinates with subtle styling
        showBoardNotation={true}
        boardWidth={600}
        // Custom styling for responsive behavior
        customDropSquareStyle={{
          boxShadow: 'inset 0 0 1px 6px rgba(255, 255, 255, 0.75)',
        }}
        // Drag styling
        customPremoveDarkSquareStyle={{
          backgroundColor: '#c9a268',
        }}
        customPremoveLightSquareStyle={{
          backgroundColor: '#f5deb3',
        }}
        // Clean animations
        animationDuration={200}
        // Disable drag outside board
        snapToCursor={false}
        // Allow both click and drag
        isDraggablePiece={({ piece }) => {
          if (gameMode === 'vs-engine') {
            const pieceColor = piece[0] === 'w' ? 'w' : 'b';
            return pieceColor === chess.turn() && chess.turn() === playerColor[0];
          }
          return piece[0] === chess.turn();
        }}
      />
    </div>
  );
}
