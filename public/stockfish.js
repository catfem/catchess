// Stockfish.js Web Worker - Local version (no CDN)
// Uses locally bundled Stockfish WASM for offline support

let stockfishInstance = null;
let isLoading = false;

async function loadStockfish() {
  if (stockfishInstance || isLoading) return true;
  
  isLoading = true;
  
  try {
    self.postMessage('info string Loading Stockfish from local files...');
    
    // Check if WebAssembly is supported
    const wasmSupported = typeof WebAssembly === 'object' && 
      WebAssembly.validate(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
    
    if (wasmSupported) {
      // Use WASM version (faster)
      importScripts('/stockfish.wasm.js');
    } else {
      self.postMessage('info string ERROR: WebAssembly not supported in this browser');
      isLoading = false;
      return false;
    }
    
    // Check if Stockfish was loaded
    if (typeof Stockfish === 'function') {
      stockfishInstance = Stockfish();
      stockfishInstance.onmessage = function(line) {
        self.postMessage(line);
      };
      self.postMessage('info string Stockfish loaded successfully from local files');
      isLoading = false;
      return true;
    } else if (typeof STOCKFISH === 'function') {
      stockfishInstance = STOCKFISH();
      stockfishInstance.onmessage = function(line) {
        self.postMessage(line);
      };
      self.postMessage('info string Stockfish loaded successfully from local files');
      isLoading = false;
      return true;
    } else {
      throw new Error('Stockfish constructor not found');
    }
  } catch (error) {
    console.error('Failed to load Stockfish:', error);
    self.postMessage('info string ERROR: Failed to load Stockfish engine');
    self.postMessage('info string Error: ' + error.message);
    isLoading = false;
    return false;
  }
}

self.onmessage = async function(e) {
  const command = e.data;

  if (!stockfishInstance) {
    const loaded = await loadStockfish();
    if (!loaded) {
      return;
    }
  }

  if (stockfishInstance && stockfishInstance.postMessage) {
    stockfishInstance.postMessage(command);
  }
};
