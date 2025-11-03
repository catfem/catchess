import { useState } from 'react';
import { ChessBoard } from './components/ChessBoard';
import { MoveList } from './components/MoveList';
import { EvaluationBar } from './components/EvaluationBar';
import { EvaluationGraph } from './components/EvaluationGraph';
import { GameControls } from './components/GameControls';
import { PGNImport } from './components/PGNImport';
import { StockfishStatus } from './components/StockfishStatus';
import { OpeningPanel } from './components/OpeningPanel';
import { OnlineRoom } from './components/OnlineRoom';
import { ThemeToggle } from './components/ThemeToggle';
import { ChessClock } from './components/ChessClock';
import { useGameStore } from './store/gameStore';

function App() {
  const { 
    moveHistory, 
    chess, 
    currentMoveIndex, 
    goToMove, 
    resetGame,
    undoMove 
  } = useGameStore();
  
  const [showSidebar, setShowSidebar] = useState(true);
  const [showAnalysis, setShowAnalysis] = useState(true);

  const currentMove = moveHistory[currentMoveIndex >= 0 ? currentMoveIndex : moveHistory.length - 1];
  const whiteToMove = chess.turn() === 'w';

  // Navigation
  const canGoBack = currentMoveIndex > -1;
  const canGoForward = currentMoveIndex < moveHistory.length - 1;
  const goFirst = () => goToMove(-1);
  const goPrevious = () => currentMoveIndex >= 0 && goToMove(currentMoveIndex - 1);
  const goNext = () => currentMoveIndex < moveHistory.length - 1 && goToMove(currentMoveIndex + 1);
  const goLast = () => goToMove(moveHistory.length - 1);

  return (
    <div className="h-screen flex flex-col bg-[#262421] text-gray-100">
      {/* Header */}
      <header className="bg-[#1d1b19] border-b border-gray-800 px-6 py-4">
        <div className="max-w-[2000px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <span className="text-4xl">♟️</span>
              <span className="hidden sm:inline">CatChess</span>
            </h1>
            
            <nav className="hidden md:flex items-center gap-2">
              <button
                onClick={() => setShowAnalysis(!showAnalysis)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  showAnalysis 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span className="flex items-center gap-2">
                  🔍 Analysis
                  {showAnalysis && <span className="text-xs">✓</span>}
                </span>
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <PGNImport />
            <ThemeToggle />
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
              title={showSidebar ? 'Hide sidebar' : 'Show sidebar'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showSidebar ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className={`${
          showSidebar ? 'w-80' : 'w-0'
        } bg-[#2b2926] border-r border-gray-800 transition-all duration-300 overflow-hidden flex-shrink-0`}>
          <div className="h-full overflow-y-auto p-6 space-y-6">
            {/* Opening Panel */}
            <OpeningPanel />

            {/* Game Status Card */}
            <div className="bg-[#312e2b] rounded-xl p-4 shadow-lg">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Turn</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    whiteToMove 
                      ? 'bg-gray-200 text-gray-900' 
                      : 'bg-gray-800 text-white border border-gray-600'
                  }`}>
                    {whiteToMove ? '⚪ White' : '⚫ Black'}
                  </span>
                </div>
                
                {chess.isCheck() && (
                  <div className="bg-yellow-900/30 border border-yellow-600 rounded-lg px-3 py-2 text-yellow-300 text-sm font-semibold">
                    ⚠️ Check!
                  </div>
                )}
                
                {chess.isCheckmate() && (
                  <div className="bg-red-900/30 border border-red-600 rounded-lg px-3 py-2 text-red-300 text-sm font-bold">
                    ♔ Checkmate!
                  </div>
                )}
                
                {chess.isDraw() && (
                  <div className="bg-blue-900/30 border border-blue-600 rounded-lg px-3 py-2 text-blue-300 text-sm font-semibold">
                    ½ Draw
                  </div>
                )}
              </div>
            </div>

            {/* Game Info */}
            <div className="bg-[#312e2b] rounded-xl p-4 shadow-lg">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Game Info</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Moves</span>
                  <span className="text-gray-200 font-medium">{moveHistory.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Phase</span>
                  <span className="text-gray-200 font-medium">
                    {moveHistory.length === 0 ? 'Start' :
                     moveHistory.length <= 10 ? 'Opening' :
                     moveHistory.length <= 40 ? 'Middlegame' : 'Endgame'}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <GameControls />

            {/* Online Play */}
            <div className="bg-[#312e2b] rounded-xl p-4 shadow-lg">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">Online</h3>
              <OnlineRoom />
            </div>
          </div>
        </aside>

        {/* Center - Board */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 bg-[#262421] overflow-auto">
          <div className="w-full max-w-5xl mx-auto">
            {/* Chess Clock */}
            <ChessClock initialTime={600} increment={0} />
            
            <div className="flex items-center justify-center gap-6">
              {/* Evaluation Bar */}
              <div className="hidden lg:block">
                <EvaluationBar />
              </div>

              {/* Board */}
              <div className="flex-1 max-w-[600px]">
                <ChessBoard />
              </div>
            </div>

            {/* Mobile Evaluation */}
            {currentMove && (
              <div className="lg:hidden mt-6 bg-[#2b2926] rounded-xl p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Evaluation</div>
                    <div className="text-2xl font-bold">
                      {currentMove.mate ? (
                        <span className="text-blue-400">M{Math.abs(currentMove.mate)}</span>
                      ) : (
                        <span className={currentMove.eval > 0 ? 'text-white' : 'text-gray-400'}>
                          {currentMove.eval > 0 ? '+' : ''}{currentMove.eval.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  {currentMove.depth && (
                    <div className="text-right">
                      <div className="text-xs text-gray-400 mb-1">Depth</div>
                      <div className="text-lg font-mono text-gray-300">{currentMove.depth}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar - Moves & Analysis */}
        <aside className="hidden lg:flex lg:w-96 bg-[#2b2926] border-l border-gray-800 flex-col">
          {/* Move List */}
          <div className="flex-1 overflow-hidden">
            <MoveList />
          </div>

          {/* Evaluation Graph */}
          <div className="border-t border-gray-800 p-4">
            <EvaluationGraph />
          </div>

          {/* Analysis Panel */}
          {showAnalysis && currentMove && (
            <div className="border-t border-gray-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Analysis</h3>
                <span className="text-xs text-gray-500 font-medium">Stockfish 17</span>
              </div>

              {/* Evaluation Display */}
              <div className="bg-[#312e2b] rounded-xl p-4 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-400 uppercase tracking-wide">Evaluation</span>
                  {currentMove.depth && (
                    <span className="text-xs text-gray-500 font-mono bg-gray-800 px-2 py-1 rounded">
                      Depth {currentMove.depth}
                    </span>
                  )}
                </div>
                <div className="text-3xl font-bold mb-2">
                  {currentMove.mate ? (
                    <span className="text-blue-400">M{Math.abs(currentMove.mate)}</span>
                  ) : (
                    <span className={currentMove.eval > 0 ? 'text-white' : 'text-gray-400'}>
                      {currentMove.eval > 0 ? '+' : ''}{currentMove.eval.toFixed(2)}
                    </span>
                  )}
                </div>
                {currentMove.bestMove && (
                  <div className="text-xs text-gray-400">
                    Best: <span className="text-gray-300 font-mono">{currentMove.bestMove}</span>
                  </div>
                )}
              </div>

              {/* Move Labels Legend */}
              <div className="bg-[#312e2b] rounded-xl p-4 shadow-lg">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Move Symbols</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { icon: '‼', label: 'Brilliant', color: '#1abc9c' },
                    { icon: '!', label: 'Great', color: '#3498db' },
                    { icon: '✓', label: 'Best', color: '#95a5a6' },
                    { icon: '⚡', label: 'Excellent', color: '#16a085' },
                    { icon: '📖', label: 'Book', color: '#f39c12' },
                    { icon: '○', label: 'Good', color: '#2ecc71' },
                    { icon: '?!', label: 'Inaccurate', color: '#f1c40f' },
                    { icon: '?', label: 'Mistake', color: '#e67e22' },
                    { icon: '⊘', label: 'Miss', color: '#9b59b6' },
                    { icon: '??', label: 'Blunder', color: '#e74c3c' },
                  ].map(({ icon, label, color }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span style={{ color }} className="font-bold">{icon}</span>
                      <span className="text-gray-400">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Bottom Control Bar */}
      <footer className="bg-[#1d1b19] border-t border-gray-800 px-6 py-3">
        <div className="max-w-[2000px] mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* FEN Display */}
          <div className="hidden md:block flex-1 min-w-0">
            <div className="text-xs text-gray-500 truncate font-mono">
              <span className="text-gray-400 font-semibold">FEN:</span> {chess.fen()}
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={goFirst}
              disabled={!canGoBack}
              className="p-2 hover:bg-gray-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="First move"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
              </svg>
            </button>
            
            <button
              onClick={goPrevious}
              disabled={!canGoBack}
              className="p-2 hover:bg-gray-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Previous"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
              </svg>
            </button>
            
            <button
              onClick={goNext}
              disabled={!canGoForward}
              className="p-2 hover:bg-gray-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Next"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
              </svg>
            </button>
            
            <button
              onClick={goLast}
              disabled={!canGoForward}
              className="p-2 hover:bg-gray-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Last move"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 5.202v2.798l-5.445-3.63z" />
              </svg>
            </button>

            <div className="w-px h-6 bg-gray-700 mx-2"></div>

            <button
              onClick={undoMove}
              disabled={moveHistory.length === 0}
              className="p-2 hover:bg-gray-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Undo"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            <button
              onClick={resetGame}
              className="p-2 hover:bg-gray-700 rounded-lg transition-all"
              title="New game"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Status */}
          <div className="flex items-center gap-4">
            <div className="text-xs text-gray-500 font-medium">
              Move {Math.floor((currentMoveIndex + 2) / 2)}/{Math.ceil(moveHistory.length / 2)}
            </div>
            <StockfishStatus />
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
