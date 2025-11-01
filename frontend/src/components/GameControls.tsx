import { useGameStore } from '../store/gameStore';
import { GameMode } from '../types';

export function GameControls() {
  const {
    gameMode,
    setGameMode,
    resetGame,
    undoMove,
    analyzePosition,
    isAnalyzing,
    chess,
    engineSettings,
    setEngineSettings,
  } = useGameStore();

  const modes: { value: GameMode; label: string }[] = [
    { value: 'vs-engine', label: '🤖 vs Engine' },
    { value: 'analyze', label: '🔍 Analyze' },
    { value: 'vs-player-online', label: '🌐 Online PvP' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2 dark:text-white">Game Mode</h3>
        <div className="grid grid-cols-2 gap-2">
          {modes.map((mode) => (
            <button
              key={mode.value}
              onClick={() => setGameMode(mode.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                gameMode === mode.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {gameMode === 'vs-engine' && (
        <div>
          <h3 className="text-lg font-semibold mb-2 dark:text-white">Engine Difficulty</h3>
          <input
            type="range"
            min="0"
            max="20"
            value={engineSettings.skill}
            onChange={(e) => setEngineSettings({ skill: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Beginner</span>
            <span>Level {engineSettings.skill}</span>
            <span>Master</span>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold mb-2 dark:text-white">Game Controls</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            🔄 New Game
          </button>
          <button
            onClick={undoMove}
            disabled={chess.history().length === 0}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ↶ Undo
          </button>
          {(gameMode === 'analyze' || engineSettings.enabled) && (
            <button
              onClick={analyzePosition}
              disabled={isAnalyzing}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isAnalyzing ? '⏳ Analyzing...' : '🔍 Analyze'}
            </button>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        <p>Turn: {chess.turn() === 'w' ? '⚪ White' : '⚫ Black'}</p>
        {chess.isCheck() && <p className="text-red-600 font-bold">♔ Check!</p>}
        {chess.isCheckmate() && <p className="text-red-600 font-bold">♔ Checkmate!</p>}
        {chess.isDraw() && <p className="text-yellow-600 font-bold">Draw</p>}
      </div>
    </div>
  );
}
