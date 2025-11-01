import { Chessboard } from 'react-chessboard';
import { useGameStore } from '../store/gameStore';

export function ChessBoard() {
  const { chess, makeMove, gameMode, playerColor } = useGameStore();

  const onDrop = (sourceSquare: string, targetSquare: string): boolean => {
    if (gameMode === 'vs-engine' && chess.turn() !== playerColor[0]) {
      return false;
    }

    makeMove(sourceSquare, targetSquare);
    return true;
  };

  const boardOrientation = gameMode === 'vs-engine' ? playerColor : 'white';

  return (
    <div className="w-full aspect-square max-w-[600px] mx-auto">
      <Chessboard
        position={chess.fen()}
        onPieceDrop={onDrop}
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
        // Piece styling - flat, clean SVG-like
        customPieces={{
          // Using default pieces but can customize if needed
        }}
        // Move highlights
        customSquareStyles={{
          // Will be set dynamically for selected squares
        }}
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
      />
    </div>
  );
}
