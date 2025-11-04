import React from 'react';
import { useAppStore } from '../../store';

export const Settings: React.FC = () => {
  const { userSettings, setUserSettings, engineSettings, setEngineSettings } = useAppStore();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Appearance</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <select
              value={userSettings.theme}
              onChange={(e) => setUserSettings({ theme: e.target.value as any })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Show Coordinates</label>
            <input
              type="checkbox"
              checked={userSettings.showCoordinates}
              onChange={(e) => setUserSettings({ showCoordinates: e.target.checked })}
              className="w-4 h-4 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Highlight Legal Moves</label>
            <input
              type="checkbox"
              checked={userSettings.highlightLegalMoves}
              onChange={(e) => setUserSettings({ highlightLegalMoves: e.target.checked })}
              className="w-4 h-4 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Sound Effects</label>
            <input
              type="checkbox"
              checked={userSettings.soundEnabled}
              onChange={(e) => setUserSettings({ soundEnabled: e.target.checked })}
              className="w-4 h-4 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Animation Speed: {userSettings.animationSpeed}ms
            </label>
            <input
              type="range"
              min="0"
              max="500"
              step="50"
              value={userSettings.animationSpeed}
              onChange={(e) => setUserSettings({ animationSpeed: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Engine Settings</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Enable Engine</label>
            <input
              type="checkbox"
              checked={engineSettings.enabled}
              onChange={(e) => setEngineSettings({ enabled: e.target.checked })}
              className="w-4 h-4 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Search Depth: {engineSettings.depth}
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={engineSettings.depth}
              onChange={(e) => setEngineSettings({ depth: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Skill Level: {engineSettings.skillLevel}
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={engineSettings.skillLevel}
              onChange={(e) => setEngineSettings({ skillLevel: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Multi-PV: {engineSettings.multiPv}
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={engineSettings.multiPv}
              onChange={(e) => setEngineSettings({ multiPv: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Gameplay</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Auto-Queen Promotion</label>
            <input
              type="checkbox"
              checked={userSettings.autoQueen}
              onChange={(e) => setUserSettings({ autoQueen: e.target.checked })}
              className="w-4 h-4 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Enable Premove</label>
            <input
              type="checkbox"
              checked={userSettings.premove}
              onChange={(e) => setUserSettings({ premove: e.target.checked })}
              className="w-4 h-4 rounded"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Privacy</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Public Games</label>
            <input
              type="checkbox"
              checked={userSettings.privacy.publicGames}
              onChange={(e) =>
                setUserSettings({
                  privacy: { ...userSettings.privacy, publicGames: e.target.checked },
                })
              }
              className="w-4 h-4 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Show Online Status</label>
            <input
              type="checkbox"
              checked={userSettings.privacy.showOnlineStatus}
              onChange={(e) =>
                setUserSettings({
                  privacy: { ...userSettings.privacy, showOnlineStatus: e.target.checked },
                })
              }
              className="w-4 h-4 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Allow Spectators</label>
            <input
              type="checkbox"
              checked={userSettings.privacy.allowSpectators}
              onChange={(e) =>
                setUserSettings({
                  privacy: { ...userSettings.privacy, allowSpectators: e.target.checked },
                })
              }
              className="w-4 h-4 rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
