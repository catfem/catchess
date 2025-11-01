// Stockfish.js Web Worker Wrapper
// This is a lightweight wrapper that loads Stockfish from CDN

const STOCKFISH_CDN = 'https://cdn.jsdelivr.net/npm/stockfish@16.0.0/src/stockfish.js';

let stockfishInstance = null;

self.onmessage = async function(e) {
  const command = e.data;

  if (!stockfishInstance) {
    try {
      importScripts(STOCKFISH_CDN);
      if (typeof STOCKFISH === 'function') {
        stockfishInstance = STOCKFISH();
        stockfishInstance.onmessage = function(line) {
          self.postMessage(line);
        };
      }
    } catch (error) {
      console.error('Failed to load Stockfish:', error);
      self.postMessage('info string Failed to load Stockfish engine');
      return;
    }
  }

  if (stockfishInstance && stockfishInstance.postMessage) {
    stockfishInstance.postMessage(command);
  }
};
