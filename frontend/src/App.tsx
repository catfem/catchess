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
  const { gameMode, moveHistory, chess, currentMoveIndex, goToMove, resetGame } = useGameStore();
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [showOpeningBook, setShowOpeningBook] = useState(true);
  const [timeControl, setTimeControl] = useState<'standard' | 'rapid' | 'blitz' | 'bullet'>('standard');

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

  // Navigation controls
  const canGoBack = currentMoveIndex > -1;
  const canGoForward = currentMoveIndex < moveHistory.length - 1;

  const goFirst = () => goToMove(-1);
  const goPrevious = () => currentMoveIndex >= 0 && goToMove(currentMoveIndex - 1);
  const goNext = () => currentMoveIndex < moveHistory.length - 1 && goToMove(currentMoveIndex + 1);
  const goLast = () => goToMove(moveHistory.length - 1);

  return (
    <div className="min-h-screen bg-[#262421] text-gray-200 flex flex-col">
      {/* Top Navigation Bar - Lichess Style */}
      <header className="bg-[#1d1b19] border-b border-gray-800">
        <div className="max-w-[1920px] mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <h1 className="text-2xl font-bold text-white flex items-center">
                <span className="text-3xl mr-2">♟️</span>
                CatChess
              </h1>
              
              {/* Time Control Selector */}
              <nav className="hidden md:flex space-x-1">
                <button 
                  onClick={() => setTimeControl('standard')}
                  className={`px-4 py-2 rounded transition-colors text-sm ${
                    timeControl === 'standard' ? 'bg-gray-700' : 'hover:bg-gray-700'
                  }`}
                >
                  Standard
                </button>
                <button 
                  onClick={() => setTimeControl('rapid')}
                  className={`px-4 py-2 rounded transition-colors text-sm ${
                    timeControl === 'rapid' ? 'bg-gray-700' : 'hover:bg-gray-700'
                  }`}
                >
                  Rapid
                </button>
                <button 
                  onClick={() => setTimeControl('blitz')}
                  className={`px-4 py-2 rounded transition-colors text-sm ${
                    timeControl === 'blitz' ? 'bg-gray-700' : 'hover:bg-gray-700'
                  }`}
                >
                  Blitz
                </button>
                <button 
                  onClick={() => setTimeControl('bullet')}
                  className={`px-4 py-2 rounded transition-colors text-sm ${
                    timeControl === 'bullet' ? 'bg-gray-700' : 'hover:bg-gray-700'
                  }`}
                >
                  Bullet
                </button>
                <button 
                  onClick={() => setShowAnalysis(!showAnalysis)}
                  className={`px-4 py-2 rounded transition-colors text-sm ${
                    showAnalysis ? 'bg-blue-700' : 'hover:bg-gray-700'
                  }`}
                >
                  Analysis {showAnalysis ? '✓' : ''}
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
      <div className="flex-1 max-w-[1920px] mx-auto w-full">
        <div className="flex h-[calc(100vh-120px)]">
          {/* Left Panel - Opening Book / WikiBook */}
          {showOpeningBook && (
            <aside className="w-80 bg-[#2b2926] border-r border-gray-800 overflow-y-auto">
              <div className="p-4 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-300">Opening Explorer</h3>
                  <button
                    onClick={() => setShowOpeningBook(false)}
                    className="text-gray-500 hover:text-gray-300"
                  >
                    ✕
                  </button>
                </div>

                {/* Opening Info */}
                <div className="bg-[#312e2b] rounded p-3">
                  <div className="text-sm font-semibold text-white mb-2">
                    {moveHistory.length === 0 ? 'Starting Position' : 
                     moveHistory.length <= 5 ? 'Opening Phase' :
                     moveHistory.length <= 15 ? 'Early Middle Game' : 'Middle Game'}
                  </div>
                  <div className="text-xs text-gray-400 space-y-1">
                    <div>Moves: {moveHistory.length}</div>
                    <div>Phase: {chess.isGameOver() ? 'Game Over' : 'In Progress'}</div>
                  </div>
                </div>

                {/* Game Status */}
                <div className="bg-[#312e2b] rounded p-3">
                  <h4 className="text-xs font-semibold text-gray-400 mb-2">Status</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Turn</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        whiteToMove ? 'bg-gray-200 text-gray-900' : 'bg-gray-700 text-white'
                      }`}>
                        {whiteToMove ? 'White' : 'Black'}
                      </span>
                    </div>
                    {chess.isCheck() && (
                      <div className="text-yellow-500 font-semibold">⚠️ Check!</div>
                    )}
                    {chess.isCheckmate() && (
                      <div className="text-red-500 font-bold">♔ Checkmate!</div>
                    )}
                    {chess.isStalemate() && (
                      <div className="text-blue-400">Stalemate - Draw</div>
                    )}
                    {chess.isDraw() && !chess.isStalemate() && (
                      <div className="text-blue-400">½ Draw</div>
                    )}
                  </div>
                </div>

                {/* Game Controls */}
                <GameControls />
                {gameMode === 'vs-player-online' && <OnlineRoom />}
              </div>
            </aside>
          )}

          {/* Show Opening Book Toggle Button when hidden */}
          {!showOpeningBook && (
            <button
              onClick={() => setShowOpeningBook(true)}
              className="fixed left-0 top-1/2 -translate-y-1/2 bg-[#2b2926] hover:bg-[#3a3633] text-gray-300 px-2 py-4 rounded-r-lg border-r border-t border-b border-gray-800 z-10"
            >
              📖
            </button>
          )}

          {/* Center - Chessboard */}
          <main className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-[#262421]">
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

          {/* Right Panel - Move List & Analysis */}
          <aside className="w-96 bg-[#2b2926] border-l border-gray-800 flex flex-col">
            {/* Move List Section */}
            <div className="flex-1 overflow-hidden">
              <MoveList />
            </div>

            {/* Computer Analysis Section */}
            {showAnalysis && (
              <div className="border-t border-gray-800 p-4 space-y-3">
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
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                    <div className="flex items-center gap-1">
                      <span className="text-[#1abc9c]">‼</span>
                      <span className="text-gray-400">Brilliant</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[#3498db]">!</span>
                      <span className="text-gray-400">Great</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[#95a5a6]">✓</span>
                      <span className="text-gray-400">Best</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[#16a085]">⚡</span>
                      <span className="text-gray-400">Excellent</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[#f39c12]">📖</span>
                      <span className="text-gray-400">Book</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[#2ecc71]">○</span>
                      <span className="text-gray-400">Good</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[#f1c40f]">?!</span>
                      <span className="text-gray-400">Inaccurate</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[#e67e22]">?</span>
                      <span className="text-gray-400">Mistake</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[#9b59b6]">⊘</span>
                      <span className="text-gray-400">Miss</span>
                    </div>
                    <div className="flex items-center gap-1">
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

      {/* Bottom Control Bar - FEN, PGN, Playback Controls */}
      <footer className="bg-[#1d1b19] border-t border-gray-800">
        <div className="max-w-[1920px] mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-4">
            {/* Left - FEN Display */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="text-xs text-gray-500 truncate">
                <span className="font-semibold">FEN:</span> {chess.fen()}
              </div>
            </div>

            {/* Center - Playback Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={goFirst}
                disabled={!canGoBack}
                className="p-2 hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="First move"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
                </svg>
              </button>
              <button
                onClick={goPrevious}
                disabled={!canGoBack}
                className="p-2 hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Previous move"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
                </svg>
              </button>
              <button
                onClick={goNext}
                disabled={!canGoForward}
                className="p-2 hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Next move"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
                </svg>
              </button>
              <button
                onClick={goLast}
                disabled={!canGoForward}
                className="p-2 hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Last move"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 5.202v2.798l-5.445-3.63z" />
                </svg>
              </button>
              
              <div className="h-6 w-px bg-gray-700 mx-1"></div>
              
              <button
                onClick={resetGame}
                className="p-2 hover:bg-gray-700 rounded transition-colors"
                title="New game"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Right - Status */}
            <div className="flex items-center gap-4">
              <div className="text-xs text-gray-500">
                Move {Math.floor((currentMoveIndex + 2) / 2)}/{Math.floor((moveHistory.length + 1) / 2)}
              </div>
              <StockfishStatus />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
