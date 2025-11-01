import { useEffect, useState } from 'react';
import { ChessBoard } from './components/ChessBoard';
import { MoveList } from './components/MoveList';
import { EvaluationBar } from './components/EvaluationBar';
import { GameControls } from './components/GameControls';
import { PGNImport } from './components/PGNImport';
import { OnlineRoom } from './components/OnlineRoom';
import { ThemeToggle } from './components/ThemeToggle';
import { StockfishStatus } from './components/StockfishStatus';
import { useGameStore } from './store/gameStore';

function App() {
  const { gameMode, moveHistory, chess } = useGameStore();
  const [showAnalysis, setShowAnalysis] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('room');
    if (roomId) {
      useGameStore.getState().setGameMode('vs-player-online');
      useGameStore.getState().joinOnlineRoom(roomId);
    }
  }, []);

  const currentMove = moveHistory[moveHistory.length - 1];
  const whiteToMove = chess.turn() === 'w';

  return (
    <div className="min-h-screen bg-[#262421] text-gray-200">
      {/* Top Navigation Bar - Lichess Style */}
      <header className="bg-[#1d1b19] border-b border-gray-800">
        <div className="max-w-[1920px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold text-white flex items-center">
                <span className="text-3xl mr-2">♟️</span>
                CatChess
              </h1>
              <nav className="hidden md:flex space-x-1">
                <button className="px-4 py-2 rounded hover:bg-gray-700 transition-colors text-sm">
                  Play
                </button>
                <button className="px-4 py-2 rounded hover:bg-gray-700 transition-colors text-sm">
                  Puzzles
                </button>
                <button 
                  onClick={() => setShowAnalysis(!showAnalysis)}
                  className={`px-4 py-2 rounded transition-colors text-sm ${
                    showAnalysis ? 'bg-gray-700' : 'hover:bg-gray-700'
                  }`}
                >
                  Analysis {showAnalysis ? '✓' : ''}
                </button>
                <button className="px-4 py-2 rounded hover:bg-gray-700 transition-colors text-sm">
                  Learn
                </button>
              </nav>
            </div>
            <div className="flex items-center space-x-3">
              <PGNImport />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-[1920px] mx-auto pb-12">
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-8rem)]">
          {/* Left Sidebar - Board Controls & Game Info */}
          <aside className="lg:w-64 xl:w-80 bg-[#2b2926] border-r border-gray-800 p-4 space-y-4">
            <GameControls />
            {gameMode === 'vs-player-online' && <OnlineRoom />}
            
            {/* Game Status */}
            <div className="bg-[#312e2b] rounded p-3 text-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400">Status</span>
                <span className={`px-2 py-0.5 rounded text-xs ${
                  whiteToMove ? 'bg-gray-200 text-gray-900' : 'bg-gray-700 text-white'
                }`}>
                  {whiteToMove ? 'White to move' : 'Black to move'}
                </span>
              </div>
              {chess.isCheck() && (
                <div className="text-yellow-500 font-semibold">⚠️ Check!</div>
              )}
              {chess.isCheckmate() && (
                <div className="text-red-500 font-bold">♔ Checkmate!</div>
              )}
              {chess.isDraw() && (
                <div className="text-blue-400">½ Draw</div>
              )}
            </div>

            {/* Opening Book Info */}
            <div className="bg-[#312e2b] rounded p-3">
              <h3 className="text-sm font-semibold mb-2 text-gray-300">Opening Explorer</h3>
              <p className="text-xs text-gray-400">
                {moveHistory.length === 0 ? 'Start position' : 
                 moveHistory.length <= 10 ? 'Opening phase' : 'Middle game'}
              </p>
              <div className="mt-2 text-xs text-gray-500">
                {moveHistory.length} moves played
              </div>
            </div>
          </aside>

          {/* Center - Chessboard */}
          <main className="flex-1 flex items-center justify-center p-4 lg:p-8 min-h-[600px]">
            <div className="flex items-center gap-4 w-full max-w-4xl">
              {/* Evaluation Bar */}
              <div className="hidden lg:block flex-shrink-0">
                <EvaluationBar />
              </div>

              {/* Board Container */}
              <div className="flex-1 max-w-[600px]">
                <ChessBoard />
              </div>
            </div>
          </main>

          {/* Right Sidebar - Move List & Analysis */}
          <aside className="lg:w-80 xl:w-96 bg-[#2b2926] border-l border-gray-800">
            {/* Move List Section */}
            <div className="border-b border-gray-800">
              <MoveList />
            </div>

            {/* Computer Analysis Section - Only show if analysis is enabled */}
            {showAnalysis && (
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-300">Computer Analysis</h3>
                  <span className="text-xs text-gray-500">Stockfish 17</span>
                </div>

                {/* Current Evaluation */}
                {currentMove && (
                  <div className="bg-[#312e2b] rounded p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-400">Evaluation</span>
                      {currentMove.depth && (
                        <span className="text-xs text-gray-500 font-mono">
                          Depth {currentMove.depth}
                        </span>
                      )}
                    </div>
                    <div className="text-2xl font-bold">
                      {currentMove.mate ? (
                        <span className="text-blue-400">
                          M{Math.abs(currentMove.mate)}
                        </span>
                      ) : (
                        <span className={currentMove.eval > 0 ? 'text-white' : 'text-gray-400'}>
                          {currentMove.eval > 0 ? '+' : ''}{currentMove.eval.toFixed(2)}
                        </span>
                      )}
                    </div>
                    {currentMove.bestMove && (
                      <div className="mt-2 text-xs text-gray-400">
                        Best: {currentMove.bestMove}
                      </div>
                    )}
                  </div>
                )}

                {/* Move Labels Legend */}
                <div className="bg-[#312e2b] rounded p-3">
                  <h4 className="text-xs font-semibold mb-2 text-gray-400">Move Annotations</h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[#1abc9c]">‼</span>
                      <span className="text-gray-400">Brilliant</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#3498db]">!</span>
                      <span className="text-gray-400">Great</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#95a5a6]">✓</span>
                      <span className="text-gray-400">Best</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#16a085]">⚡</span>
                      <span className="text-gray-400">Excellent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#f39c12]">📖</span>
                      <span className="text-gray-400">Book</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#2ecc71]">○</span>
                      <span className="text-gray-400">Good</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#f1c40f]">?!</span>
                      <span className="text-gray-400">Inaccurate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#e67e22]">?</span>
                      <span className="text-gray-400">Mistake</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#9b59b6]">⊘</span>
                      <span className="text-gray-400">Miss</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#e74c3c]">??</span>
                      <span className="text-gray-400">Blunder</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#1d1b19] border-t border-gray-800 px-4 py-2">
        <div className="max-w-[1920px] mx-auto flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>FEN: {chess.fen().substring(0, 50)}...</span>
          </div>
          <StockfishStatus />
        </div>
      </footer>
    </div>
  );
}

export default App;
