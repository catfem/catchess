import { useGameStore } from '../../store/gameStore';

export function SettingsView() {
  const { theme, setTheme, engineSettings, setEngineSettings } = useGameStore();

  const boardThemes: Array<{ id: 'blue' | 'brown' | 'green' | 'purple'; name: string; colors: [string, string] }> = [
    { id: 'blue', name: 'Blue', colors: ['#dee3e6', '#8ca2ad'] },
    { id: 'brown', name: 'Brown', colors: ['#f0d9b5', '#b58863'] },
    { id: 'green', name: 'Green', colors: ['#ffffdd', '#86a666'] },
    { id: 'purple', name: 'Purple', colors: ['#e8e0d7', '#9f7fb5'] },
  ];

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 overflow-auto">
      <div className="max-w-4xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">⚙️ Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Customize your chess experience</p>
        </div>

        {/* Appearance */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🎨 Appearance</h2>

          {/* Theme Mode */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Theme Mode</label>
            <div className="flex gap-3">
              <button
                onClick={() => setTheme({ mode: 'light' })}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                  theme.mode === 'light'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  ☀️ Light
                  {theme.mode === 'light' && <span className="text-xs">✓</span>}
                </span>
              </button>
              <button
                onClick={() => setTheme({ mode: 'dark' })}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                  theme.mode === 'dark'
                    ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  🌙 Dark
                  {theme.mode === 'dark' && <span className="text-xs">✓</span>}
                </span>
              </button>
            </div>
          </div>

          {/* Board Theme */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Board Theme</label>
            <div className="grid grid-cols-2 gap-3">
              {boardThemes.map((boardTheme) => (
                <button
                  key={boardTheme.id}
                  onClick={() => setTheme({ boardTheme: boardTheme.id })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    theme.boardTheme === boardTheme.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex gap-1">
                      <div
                        className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: boardTheme.colors[0] }}
                      ></div>
                      <div
                        className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: boardTheme.colors[1] }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{boardTheme.name}</span>
                  </div>
                  {theme.boardTheme === boardTheme.id && (
                    <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">✓ Selected</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Engine Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🤖 Engine Settings</h2>

          {/* Engine Enabled */}
          <div className="mb-6">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Enable Analysis</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Automatically analyze moves with Stockfish
                </div>
              </div>
              <div
                onClick={() => setEngineSettings({ enabled: !engineSettings.enabled })}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  engineSettings.enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                    engineSettings.enabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                ></div>
              </div>
            </label>
          </div>

          {/* Analysis Depth */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Analysis Depth: {engineSettings.depth}
            </label>
            <input
              type="range"
              min="8"
              max="25"
              value={engineSettings.depth}
              onChange={(e) => setEngineSettings({ depth: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
              <span>Faster (8)</span>
              <span>Stronger (25)</span>
            </div>
          </div>

          {/* AI Skill Level */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              AI Difficulty: {engineSettings.skill}/20
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={engineSettings.skill}
              onChange={(e) => setEngineSettings({ skill: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
              <span>Beginner (0)</span>
              <span>Master (20)</span>
            </div>
          </div>

          {/* Multi PV */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Alternative Lines: {engineSettings.multiPv}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={engineSettings.multiPv}
              onChange={(e) => setEngineSettings({ multiPv: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
              <span>1 line</span>
              <span>5 lines</span>
            </div>
          </div>
        </div>

        {/* Game Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🎮 Game Settings</h2>

          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Move Sounds</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Play sound effects for moves</div>
              </div>
              <div className="relative w-14 h-8 rounded-full bg-gray-300 dark:bg-gray-600">
                <div className="absolute top-1 translate-x-1 w-6 h-6 bg-white rounded-full"></div>
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Show Coordinates</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Display file and rank labels</div>
              </div>
              <div className="relative w-14 h-8 rounded-full bg-blue-600">
                <div className="absolute top-1 translate-x-7 w-6 h-6 bg-white rounded-full"></div>
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Highlight Legal Moves</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Show possible moves when piece selected</div>
              </div>
              <div className="relative w-14 h-8 rounded-full bg-blue-600">
                <div className="absolute top-1 translate-x-7 w-6 h-6 bg-white rounded-full"></div>
              </div>
            </label>
          </div>
        </div>

        {/* About */}
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">About CatChess</h2>
          <p className="text-blue-100 text-sm mb-4">
            A modern, production-grade chess platform built with React, TypeScript, and powered by Stockfish 17.
            Designed for Cloudflare Pages with support for Workers, Durable Objects, and D1.
          </p>
          <div className="text-sm text-blue-50">
            <div>Version: 2.0.0</div>
            <div>Engine: Stockfish 17</div>
            <div>Platform: Cloudflare Pages</div>
          </div>
        </div>
      </div>
    </div>
  );
}
