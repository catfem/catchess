import React from 'react';
import { GameMode } from '../../types';

interface GameModesProps {
  currentMode: GameMode;
  onModeChange: (mode: GameMode) => void;
}

export const GameModes: React.FC<GameModesProps> = ({ currentMode, onModeChange }) => {
  const modes: { value: GameMode; label: string; icon: string; description: string }[] = [
    {
      value: 'single',
      label: 'vs Computer',
      icon: '🤖',
      description: 'Play against Stockfish AI',
    },
    {
      value: 'local',
      label: 'Local PvP',
      icon: '👥',
      description: 'Two players on same device',
    },
    {
      value: 'online',
      label: 'Online PvP',
      icon: '🌐',
      description: 'Play with friends online',
    },
    {
      value: 'analysis',
      label: 'Analyze',
      icon: '🔍',
      description: 'Analyze games with engine',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {modes.map((mode) => (
        <button
          key={mode.value}
          onClick={() => onModeChange(mode.value)}
          className={`p-4 rounded-lg border-2 transition-all ${
            currentMode === mode.value
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
          }`}
        >
          <div className="text-3xl mb-2">{mode.icon}</div>
          <h3 className="font-semibold text-sm mb-1">{mode.label}</h3>
          <p className="text-xs text-gray-600 dark:text-gray-400">{mode.description}</p>
        </button>
      ))}
    </div>
  );
};
