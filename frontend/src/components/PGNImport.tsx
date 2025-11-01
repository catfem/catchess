import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

export function PGNImport() {
  const [pgn, setPgn] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { loadPGN, analyzeGame, isAnalyzing } = useGameStore();

  const handleImport = () => {
    if (pgn.trim()) {
      loadPGN(pgn);
      setShowModal(false);
      setPgn('');
    }
  };

  const handleAnalyze = async () => {
    if (pgn.trim()) {
      await analyzeGame(pgn);
      setShowModal(false);
      setPgn('');
    }
  };

  if (!showModal) {
    return (
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
      >
        📋 Import PGN
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Import PGN</h2>
        
        <textarea
          value={pgn}
          onChange={(e) => setPgn(e.target.value)}
          placeholder="Paste your PGN here..."
          className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
        />

        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={() => {
              setShowModal(false);
              setPgn('');
            }}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!pgn.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Import Only
          </button>
          <button
            onClick={handleAnalyze}
            disabled={!pgn.trim() || isAnalyzing}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? 'Analyzing...' : 'Import & Analyze'}
          </button>
        </div>
      </div>
    </div>
  );
}
