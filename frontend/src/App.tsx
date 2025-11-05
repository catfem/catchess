import { useState } from 'react';
import { ChessBoard } from './components/ChessBoard';
import { EvaluationBar } from './components/EvaluationBar';
import { GameControls } from './components/GameControls';
import { PGNImport } from './components/PGNImport';
import { StockfishStatus } from './components/StockfishStatus';
import { OpeningPanel } from './components/OpeningPanel';
import { ChessClock } from './components/ChessClock';
import { AnalysisPanel } from './components/AnalysisPanel';
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
  
  const [showLeftSidebar, setShowLeftSidebar] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      <header className="bg-[#1d1b19] border-b border-gray-800 px-4 md:px-6 py-3 md:py-4 flex-shrink-0">
        <div className="max-w-[2400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
              <span className="text-3xl md:text-4xl">♟️</span>
              <span className="hidden sm:inline">CatChess</span>
            </h1>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2">
              <button
                onClick={() => setShowRightPanel(!showRightPanel)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  showRightPanel 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                aria-label="Toggle analysis panel"
              >
                <span className="flex items-center gap-2">
                  🔍 Analysis
                  {showRightPanel && <span className="text-xs">✓</span>}
                </span>
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <PGNImport />
            
            {/* Mobile Analysis Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
              aria-label={isMobileMenuOpen ? 'Close analysis' : 'Open analysis'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                )}
              </svg>
            </button>

            {/* Left Sidebar Toggle */}
            <button
              onClick={() => setShowLeftSidebar(!showLeftSidebar)}
              className="hidden md:block lg:block p-2 hover:bg-gray-700 rounded-lg transition-colors"
              aria-label={showLeftSidebar ? 'Hide sidebar' : 'Show sidebar'}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showLeftSidebar ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Responsive Grid */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Hidden on mobile */}
        <aside 
          className={`${
            showLeftSidebar ? 'w-64 lg:w-80' : 'w-0'
          } hidden md:flex bg-[#2b2926] border-r border-gray-800 transition-all duration-300 overflow-hidden flex-shrink-0`}
        >
          <div className="h-full overflow-y-auto p-4 lg:p-6 space-y-4 lg:space-y-6">
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
          </div>
        </aside>

        {/* Center - Board Area */}
        <main className="flex-1 flex flex-col items-center justify-center p-2 md:p-4 lg:p-8 bg-[#262421] overflow-auto min-w-0">
          <div className="w-full max-w-[90vw] md:max-w-[700px] lg:max-w-5xl mx-auto">
            {/* Chess Clock */}
            <ChessClock initialTime={600} increment={0} />
            
            <div className="flex items-center justify-center gap-2 md:gap-6">
              {/* Evaluation Bar */}
              <div className="hidden lg:block">
                <EvaluationBar />
              </div>

              {/* Board - Responsive sizing */}
              <div className="flex-1 max-w-full md:max-w-[600px]">
                <ChessBoard />
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar - Analysis Panel */}
        {/* Desktop: Fixed width sidebar */}
        <aside 
          className={`${
            showRightPanel ? 'w-[420px] xl:w-[480px]' : 'w-0'
          } hidden lg:flex bg-[#2b2926] border-l border-gray-800 transition-all duration-300 overflow-hidden flex-shrink-0`}
        >
          {showRightPanel && <AnalysisPanel />}
        </aside>

        {/* Mobile/Tablet: Slide-over panel */}
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />
            
            {/* Slide-over Panel */}
            <div 
              className="lg:hidden fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-[#2b2926] z-50 shadow-2xl transform transition-transform duration-300 ease-in-out"
              role="dialog"
              aria-modal="true"
              aria-label="Analysis panel"
            >
              <div className="h-full flex flex-col">
                {/* Close Button */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                  <h2 className="text-lg font-semibold text-white">Analysis</h2>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="Close analysis panel"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Panel Content */}
                <div className="flex-1 overflow-hidden">
                  <AnalysisPanel />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Bottom Control Bar */}
      <footer className="bg-[#1d1b19] border-t border-gray-800 px-3 md:px-6 py-2 md:py-3 flex-shrink-0">
        <div className="max-w-[2400px] mx-auto flex flex-wrap items-center justify-between gap-2 md:gap-4">
          {/* FEN Display */}
          <div className="hidden md:block flex-1 min-w-0">
            <div className="text-xs text-gray-500 truncate font-mono">
              <span className="text-gray-400 font-semibold">FEN:</span> {chess.fen()}
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={goFirst}
              disabled={!canGoBack}
              className="p-1.5 md:p-2 hover:bg-gray-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="First move"
              aria-label="Go to first move"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
              </svg>
            </button>
            
            <button
              onClick={goPrevious}
              disabled={!canGoBack}
              className="p-1.5 md:p-2 hover:bg-gray-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Previous"
              aria-label="Go to previous move"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
              </svg>
            </button>
            
            <button
              onClick={goNext}
              disabled={!canGoForward}
              className="p-1.5 md:p-2 hover:bg-gray-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Next"
              aria-label="Go to next move"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
              </svg>
            </button>
            
            <button
              onClick={goLast}
              disabled={!canGoForward}
              className="p-1.5 md:p-2 hover:bg-gray-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Last move"
              aria-label="Go to last move"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 5.202v2.798l-5.445-3.63z" />
              </svg>
            </button>

            <div className="w-px h-5 md:h-6 bg-gray-700 mx-1 md:mx-2" />

            <button
              onClick={undoMove}
              disabled={moveHistory.length === 0}
              className="p-1.5 md:p-2 hover:bg-gray-700 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Undo"
              aria-label="Undo last move"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            <button
              onClick={resetGame}
              className="p-1.5 md:p-2 hover:bg-gray-700 rounded-lg transition-all"
              title="New game"
              aria-label="Start new game"
            >
              <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 md:gap-4">
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
