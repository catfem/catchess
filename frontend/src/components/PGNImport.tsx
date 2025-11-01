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
        className="px-4 py-2 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
        style={{ backgroundColor: 'var(--pale-purple)' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--pale-purple-hover)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--pale-purple)'}
      >
        <span className="flex items-center gap-2">
          📋 <span className="hidden sm:inline">Import PGN</span>
        </span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#2b2926] rounded-xl shadow-2xl max-w-2xl w-full border border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">Import PGN</h2>
          <button
            onClick={() => {
              setShowModal(false);
              setPgn('');
            }}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <textarea
            value={pgn}
            onChange={(e) => setPgn(e.target.value)}
            placeholder="Paste your PGN here...

Example:
[Event &quot;Example Game&quot;]
[Site &quot;?&quot;]
[Date &quot;2024.01.01&quot;]
[Round &quot;?&quot;]
[White &quot;Player 1&quot;]
[Black &quot;Player 2&quot;]

1. e4 e5 2. Nf3 Nc6 3. Bb5"
            className="w-full h-64 p-4 border border-gray-700 rounded-lg bg-[#1d1b19] text-gray-200 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder:text-gray-600"
          />

          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
            <p className="text-xs text-blue-300">
              💡 <strong>Tip:</strong> You can import a PGN to view the game, or import & analyze to get move-by-move evaluation.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-800 bg-[#1d1b19] rounded-b-xl">
          <button
            onClick={() => {
              setShowModal(false);
              setPgn('');
            }}
            className="px-5 py-2.5 bg-[#2b2926] text-gray-300 rounded-lg hover:bg-[#3a3633] transition-all font-medium border border-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!pgn.trim()}
            className="px-5 py-2.5 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: !pgn.trim() ? 'var(--pale-gray)' : 'var(--pale-blue)' }}
            onMouseEnter={(e) => pgn.trim() && (e.currentTarget.style.backgroundColor = 'var(--pale-blue-hover)')}
            onMouseLeave={(e) => pgn.trim() && (e.currentTarget.style.backgroundColor = 'var(--pale-blue)')}
          >
            Import Only
          </button>
          <button
            onClick={handleAnalyze}
            disabled={!pgn.trim() || isAnalyzing}
            className="px-5 py-2.5 text-white rounded-lg transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ backgroundColor: (!pgn.trim() || isAnalyzing) ? 'var(--pale-gray)' : 'var(--pale-green)' }}
            onMouseEnter={(e) => (pgn.trim() && !isAnalyzing) && (e.currentTarget.style.backgroundColor = 'var(--pale-green-hover)')}
            onMouseLeave={(e) => (pgn.trim() && !isAnalyzing) && (e.currentTarget.style.backgroundColor = 'var(--pale-green)')}
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Analyzing...</span>
              </>
            ) : (
              <span>Import & Analyze</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
