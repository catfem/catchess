import { useEffect } from 'react';
import { ChessBoard } from './components/ChessBoard';
import { MoveList } from './components/MoveList';
import { EvaluationBar } from './components/EvaluationBar';
import { EvaluationGraph } from './components/EvaluationGraph';
import { GameControls } from './components/GameControls';
import { PGNImport } from './components/PGNImport';
import { OnlineRoom } from './components/OnlineRoom';
import { ThemeToggle } from './components/ThemeToggle';
import { StockfishStatus } from './components/StockfishStatus';
import { useGameStore } from './store/gameStore';

function App() {
  const { gameMode } = useGameStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('room');
    if (roomId) {
      useGameStore.getState().setGameMode('vs-player-online');
      useGameStore.getState().joinOnlineRoom(roomId);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              ♟️ CatChess
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Chess Analysis & Play powered by Stockfish 17
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <PGNImport />
            <ThemeToggle />
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-2 flex items-start justify-center">
            <EvaluationBar />
          </div>

          <div className="xl:col-span-6 space-y-6">
            <ChessBoard />
            <EvaluationGraph />
          </div>

          <div className="xl:col-span-4 space-y-6">
            <GameControls />
            {gameMode === 'vs-player-online' && <OnlineRoom />}
            <MoveList />
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-2 dark:text-white">Move Labels</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-[#1abc9c] font-bold">‼</span>
                  <span className="dark:text-white">Brilliant</span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">- Exceptional tactical move</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[#3498db] font-bold">!</span>
                  <span className="dark:text-white">Great Move</span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">- Very strong</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[#95a5a6] font-bold">✓</span>
                  <span className="dark:text-white">Best Move</span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">- Optimal choice</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[#f39c12] font-bold">📖</span>
                  <span className="dark:text-white">Book Move</span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">- Theory</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[#e67e22] font-bold">?</span>
                  <span className="dark:text-white">Mistake</span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">- Loses advantage</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[#e74c3c] font-bold">??</span>
                  <span className="dark:text-white">Blunder</span>
                  <span className="text-gray-500 dark:text-gray-400 text-xs">- Critical error</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>
            Built with React, Stockfish 17, and ❤️ | 
            <a href="https://github.com/official-stockfish/Stockfish" target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-600 dark:text-blue-400 hover:underline">
              Stockfish Engine
            </a>
          </p>
        </footer>
      </div>
      
      <StockfishStatus />
    </div>
  );
}

export default App;
