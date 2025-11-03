import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';

interface ChessClockProps {
  initialTime?: number; // seconds
  increment?: number; // seconds
  onTimeExpired?: (color: 'white' | 'black') => void;
}

export function ChessClock({
  initialTime = 600,
  increment = 0,
  onTimeExpired,
}: ChessClockProps) {
  const { chess, gameMode, moveHistory } = useGameStore();
  
  const [whiteTime, setWhiteTime] = useState(initialTime * 1000);
  const [blackTime, setBlackTime] = useState(initialTime * 1000);
  const [isRunning, setIsRunning] = useState(false);
  const [activeColor, setActiveColor] = useState<'w' | 'b'>('w');
  const lastTickRef = useRef(Date.now());

  // Reset clock when game resets
  useEffect(() => {
    if (moveHistory.length === 0) {
      setWhiteTime(initialTime * 1000);
      setBlackTime(initialTime * 1000);
      setIsRunning(false);
      setActiveColor('w');
      lastTickRef.current = Date.now();
    }
  }, [moveHistory.length, initialTime]);

  // Update active color when turn changes
  useEffect(() => {
    const currentTurn = chess.turn();

    if (currentTurn !== activeColor && isRunning) {
      if (activeColor === 'w') {
        setWhiteTime((time) => time + increment * 1000);
      } else {
        setBlackTime((time) => time + increment * 1000);
      }

      setActiveColor(currentTurn);
      lastTickRef.current = Date.now();
    }
  }, [chess, activeColor, increment, isRunning]);

  // Start clock on first move
  useEffect(() => {
    if (gameMode === 'analyze') {
      setIsRunning(false);
      return;
    }

    if (moveHistory.length > 0 && !isRunning) {
      setIsRunning(true);
      lastTickRef.current = Date.now();
    }
  }, [moveHistory.length, isRunning, gameMode]);

  // Clock tick
  useEffect(() => {
    if (!isRunning || gameMode === 'analyze') return;

    const interval = setInterval(() => {
      const now = Date.now();
      const delta = now - lastTickRef.current;
      lastTickRef.current = now;

      if (activeColor === 'w') {
        setWhiteTime((time) => {
          const newTime = Math.max(0, time - delta);
          if (newTime === 0) {
            setIsRunning(false);
            onTimeExpired?.('white');
          }
          return newTime;
        });
      } else {
        setBlackTime((time) => {
          const newTime = Math.max(0, time - delta);
          if (newTime === 0) {
            setIsRunning(false);
            onTimeExpired?.('black');
          }
          return newTime;
        });
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, activeColor, gameMode, onTimeExpired]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isLowTime = (ms: number) => ms < 20000; // Less than 20 seconds
  const isCriticalTime = (ms: number) => ms < 10000; // Less than 10 seconds

  // Don't show clock in analyze mode
  if (gameMode === 'analyze') {
    return null;
  }

  return (
    <div className="w-full max-w-[600px] mx-auto mb-4">
      <div className="flex justify-between items-center gap-4 px-4">
        {/* Black Clock */}
        <div
          className={`
            flex-1 px-6 py-4 rounded-xl font-mono text-2xl font-bold
            transition-all duration-200
            ${activeColor === 'b' && isRunning
              ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-500/50 scale-105'
              : 'bg-slate-700 text-slate-300'
            }
            ${isLowTime(blackTime) && activeColor === 'b' ? 'animate-pulse' : ''}
            ${isCriticalTime(blackTime) && activeColor === 'b' ? 'bg-red-600' : ''}
          `}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-normal opacity-75">Black</span>
            <span>{formatTime(blackTime)}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => {
              setIsRunning((running) => {
                if (!running) {
                  lastTickRef.current = Date.now();
                }
                return !running;
              });
            }}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
            title={isRunning ? 'Pause' : 'Resume'}
          >
            {isRunning ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
          
          <button
            onClick={() => {
              setWhiteTime(initialTime * 1000);
              setBlackTime(initialTime * 1000);
              setIsRunning(false);
              setActiveColor('w');
              lastTickRef.current = Date.now();
            }}
            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors"
            title="Reset clocks"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {/* White Clock */}
        <div
          className={`
            flex-1 px-6 py-4 rounded-xl font-mono text-2xl font-bold
            transition-all duration-200
            ${activeColor === 'w' && isRunning
              ? 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-blue-500/50 scale-105'
              : 'bg-slate-700 text-slate-300'
            }
            ${isLowTime(whiteTime) && activeColor === 'w' ? 'animate-pulse' : ''}
            ${isCriticalTime(whiteTime) && activeColor === 'w' ? 'bg-red-600' : ''}
          `}
        >
          <div className="flex items-center justify-between">
            <span>{formatTime(whiteTime)}</span>
            <span className="text-sm font-normal opacity-75">White</span>
          </div>
        </div>
      </div>

      {/* Time Control Info */}
      <div className="text-center mt-2 text-sm text-slate-400">
        {Math.floor(initialTime / 60)} min {increment > 0 ? `+ ${increment}s` : ''}
      </div>
    </div>
  );
}
