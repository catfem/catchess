import { useEffect, useState } from 'react';
import { stockfishEngine } from '../utils/stockfish';

export function StockfishStatus() {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const checkStockfish = async () => {
      try {
        if (stockfishEngine.isReady()) {
          setStatus('ready');
          return;
        }

        await stockfishEngine.init();
        setStatus('ready');
      } catch (error) {
        setStatus('error');
        const err = stockfishEngine.getLoadingError() || 'Failed to load Stockfish engine';
        setErrorMessage(err);
        console.error('Stockfish loading error:', error);
      }
    };

    checkStockfish();
  }, []);

  if (status === 'ready') {
    return null; // Don't show anything when ready
  }

  if (status === 'loading') {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 z-50">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        <div>
          <p className="font-semibold">Loading Stockfish Engine...</p>
          <p className="text-sm opacity-90">Downloading from CDN (first load may take 10-30s)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg max-w-md z-50">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="font-semibold">Stockfish Engine Error</p>
          <p className="text-sm mt-1">{errorMessage}</p>
          
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm underline mt-2 hover:opacity-80"
          >
            {showDetails ? 'Hide' : 'Show'} troubleshooting steps
          </button>

          {showDetails && (
            <div className="mt-3 text-sm space-y-2 bg-red-600 p-3 rounded">
              <p className="font-semibold">Try these steps:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Check your internet connection</li>
                <li>Disable ad-blockers or VPN temporarily</li>
                <li>Try refreshing the page (F5 or Ctrl+R)</li>
                <li>Clear browser cache and reload</li>
                <li>Try a different browser (Chrome/Firefox recommended)</li>
              </ol>
              <p className="mt-2">
                <strong>Note:</strong> Analysis features require Stockfish. 
                You can still play locally or online without it.
              </p>
              <a
                href="/STOCKFISH_SETUP.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 px-3 py-1 bg-red-700 rounded hover:bg-red-800"
              >
                View Full Setup Guide
              </a>
            </div>
          )}

          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-3 py-1 bg-white text-red-500 rounded hover:bg-gray-100 text-sm font-medium"
          >
            Reload Page
          </button>
        </div>
        <button
          onClick={() => setStatus('ready')}
          className="flex-shrink-0 text-white hover:text-gray-200"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
