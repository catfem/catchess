import { useState } from 'react';
import { ChessBoard } from './components/board/ChessBoard';
import { useAppStore } from './store';
import { ChessGame } from './utils/chess';
import { ChessMove } from './types';

function App() {
  const { game, setGame, userSettings } = useAppStore();
  const [chess] = useState(() => new ChessGame());

  const handleMove = (_move: ChessMove) => {
    const newGameState = chess.getGameState();
    setGame(newGameState);
  };

  const resetGame = () => {
    chess.reset();
    const newGameState = chess.getGameState();
    setGame(newGameState);
  };

  return (
    <div className={`min-h-screen ${userSettings.theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2">♟️ CatChess</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Production-Grade Chess Platform powered by Stockfish 17
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="flex justify-center">
                  <ChessBoard onMove={handleMove} />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Game Controls</h2>
                <div className="space-y-2">
                  <button
                    onClick={resetGame}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    New Game
                  </button>
                  <button
                    onClick={() => chess.undoMove()}
                    className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                  >
                    Undo Move
                  </button>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Game Info</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Turn:</span>
                    <span className="font-semibold">
                      {game.turn === 'w' ? 'White' : 'Black'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Moves:</span>
                    <span className="font-semibold">{game.moves.length}</span>
                  </div>
                  {game.inCheck && (
                    <div className="text-red-600 dark:text-red-400 font-semibold">
                      Check!
                    </div>
                  )}
                  {game.inCheckmate && (
                    <div className="text-red-600 dark:text-red-400 font-semibold">
                      Checkmate!
                    </div>
                  )}
                  {game.inStalemate && (
                    <div className="text-yellow-600 dark:text-yellow-400 font-semibold">
                      Stalemate
                    </div>
                  )}
                  {game.inDraw && (
                    <div className="text-gray-600 dark:text-gray-400 font-semibold">
                      Draw
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Move History</h2>
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {game.history.map((move, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    >
                      <span className="text-gray-600 dark:text-gray-400 w-8">
                        {Math.floor(index / 2) + 1}.
                      </span>
                      <span className="font-mono">{move}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <footer className="mt-8 text-center text-gray-600 dark:text-gray-400 text-sm">
            <p>Built with ♟️ and ❤️ using Stockfish 17 • Powered by Cloudflare</p>
            <p className="mt-1">
              Version 3.0 - Full-Stack Cloudflare Platform
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
