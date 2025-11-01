// Stockfish.js Web Worker
// Loads Stockfish engine from multiple CDN sources with fallback

const STOCKFISH_SOURCES = [
  'https://cdn.jsdelivr.net/npm/stockfish@16.1.0/src/stockfish.js',
  'https://unpkg.com/stockfish@16.1.0/src/stockfish.js',
  'https://cdn.jsdelivr.net/npm/stockfish.wasm@0.11.0/stockfish.js',
];

let stockfishInstance = null;
let currentSourceIndex = 0;
let isLoading = false;

async function loadStockfish() {
  if (stockfishInstance || isLoading) return;
  
  isLoading = true;
  
  for (let i = currentSourceIndex; i < STOCKFISH_SOURCES.length; i++) {
    try {
      self.postMessage('info string Loading Stockfish from CDN...');
      
      importScripts(STOCKFISH_SOURCES[i]);
      
      if (typeof STOCKFISH === 'function') {
        stockfishInstance = STOCKFISH();
        stockfishInstance.onmessage = function(line) {
          self.postMessage(line);
        };
        self.postMessage('info string Stockfish loaded successfully');
        isLoading = false;
        return true;
      } else if (typeof Stockfish === 'function') {
        stockfishInstance = Stockfish();
        stockfishInstance.onmessage = function(line) {
          self.postMessage(line);
        };
        self.postMessage('info string Stockfish loaded successfully');
        isLoading = false;
        return true;
      }
    } catch (error) {
      console.error(`Failed to load from ${STOCKFISH_SOURCES[i]}:`, error);
      self.postMessage(`info string Failed to load from source ${i + 1}, trying next...`);
      continue;
    }
  }
  
  isLoading = false;
  self.postMessage('info string ERROR: Failed to load Stockfish from all sources');
  self.postMessage('info string Please check your internet connection or download Stockfish manually');
  return false;
}

self.onmessage = async function(e) {
  const command = e.data;

  if (!stockfishInstance) {
    const loaded = await loadStockfish();
    if (!loaded) {
      // Still try to process the command queue
      setTimeout(() => {
        if (stockfishInstance && stockfishInstance.postMessage) {
          stockfishInstance.postMessage(command);
        }
      }, 1000);
      return;
    }
  }

  if (stockfishInstance && stockfishInstance.postMessage) {
    stockfishInstance.postMessage(command);
  }
};
