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

  const modes: { value: GameMode; label: string; icon: string }[] = [
    { value: 'vs-engine', label: 'vs Engine', icon: '🤖' },
    { value: 'analyze', label: 'Analyze', icon: '🔍' },
  ];

  return (
    <div className="space-y-4">
      {/* Game Mode Selection */}
      <div className="bg-[#312e2b] rounded-xl p-4 shadow-lg">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Game Mode
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {modes.map((mode) => (
            <button
              key={mode.value}
              onClick={() => setGameMode(mode.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                gameMode === mode.value
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-[#2b2926] text-gray-300 hover:bg-[#3a3633] border border-gray-700'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <span>{mode.icon}</span>
                <span>{mode.label}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Engine Difficulty */}
      {gameMode === 'vs-engine' && (
        <div className="bg-[#312e2b] rounded-xl p-4 shadow-lg">
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
            Engine Strength
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">Level</span>
              <span className="text-white font-bold">{engineSettings.skill}</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={engineSettings.skill}
              onChange={(e) => setEngineSettings({ skill: parseInt(e.target.value) })}
              className="w-full h-2 bg-[#2b2926] rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Beginner</span>
              <span>Master</span>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Settings */}
      <div className="bg-[#312e2b] rounded-xl p-4 shadow-lg">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Analysis
        </h3>
        <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#3a3633] cursor-pointer transition-colors">
          <input
            type="checkbox"
            checked={engineSettings.enabled}
            onChange={(e) => setEngineSettings({ enabled: e.target.checked })}
            className="w-4 h-4 rounded bg-[#2b2926] border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
          />
          <div className="flex-1">
            <div className="text-sm text-gray-200">Live Analysis</div>
            <div className="text-xs text-gray-500">Analyze moves automatically</div>
          </div>
        </label>

        {engineSettings.enabled && (
          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-400">Depth</span>
              <span className="text-white font-mono text-xs bg-gray-800 px-2 py-1 rounded">
                {engineSettings.depth}
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="20"
              value={engineSettings.depth}
              onChange={(e) => setEngineSettings({ depth: parseInt(e.target.value) })}
              className="w-full h-2 bg-[#2b2926] rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Faster</span>
              <span>Deeper</span>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="bg-[#312e2b] rounded-xl p-4 shadow-lg">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
          Actions
        </h3>
        <div className="space-y-2">
          <button
            onClick={resetGame}
            className="w-full px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-medium shadow-lg hover:shadow-xl"
          >
            <span className="flex items-center justify-center gap-2">
              🔄 <span>New Game</span>
            </span>
          </button>
          
          <button
            onClick={undoMove}
            disabled={chess.history().length === 0}
            className="w-full px-4 py-2.5 bg-[#2b2926] text-gray-300 rounded-lg hover:bg-[#3a3633] transition-all font-medium disabled:opacity-30 disabled:cursor-not-allowed border border-gray-700"
          >
            <span className="flex items-center justify-center gap-2">
              ↶ <span>Undo Move</span>
            </span>
          </button>
          
          {(gameMode === 'analyze' || engineSettings.enabled) && (
            <button
              onClick={analyzePosition}
              disabled={isAnalyzing}
              className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center justify-center gap-2">
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>🔍 <span>Analyze Position</span></>
                )}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
