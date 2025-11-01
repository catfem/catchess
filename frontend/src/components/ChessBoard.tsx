import { Chessboard } from 'react-chessboard';
import { useGameStore } from '../store/gameStore';

export function ChessBoard() {
  const { chess, makeMove, gameMode, playerColor, theme } = useGameStore();

  const onDrop = (sourceSquare: string, targetSquare: string): boolean => {
    if (gameMode === 'vs-engine' && chess.turn() !== playerColor[0]) {
      return false;
    }

    makeMove(sourceSquare, targetSquare);
    return true;
  };

  const boardOrientation = gameMode === 'vs-engine' ? playerColor : 'white';

  return (
    <div className="w-full max-w-[600px] mx-auto">
      <Chessboard
        position={chess.fen()}
        onPieceDrop={onDrop}
        boardOrientation={boardOrientation}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        }}
        customDarkSquareStyle={
          theme.boardTheme === 'blue' 
            ? { backgroundColor: '#769656' }
            : theme.boardTheme === 'brown'
            ? { backgroundColor: '#b58863' }
            : { backgroundColor: '#769656' }
        }
        customLightSquareStyle={
          theme.boardTheme === 'blue'
            ? { backgroundColor: '#eeeed2' }
            : theme.boardTheme === 'brown'
            ? { backgroundColor: '#f0d9b5' }
            : { backgroundColor: '#eeeed2' }
        }
      />
    </div>
  );
}
