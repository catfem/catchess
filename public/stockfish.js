// Stockfish.js Web Worker - Full version from CDN
// Uses full Stockfish WASM from CDN for better compatibility

let stockfishInstance = null;
let isLoading = false;

async function loadStockfish() {
  if (stockfishInstance || isLoading) return true;
  
  isLoading = true;
  
  try {
    self.postMessage('info string Loading Stockfish engine...');
    
    // Check if WebAssembly is supported
    const wasmSupported = typeof WebAssembly === 'object' && 
      WebAssembly.validate(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
    
    if (!wasmSupported) {
      self.postMessage('info string ERROR: WebAssembly not supported in this browser');
      isLoading = false;
      return false;
    }
    
    // Load Stockfish from CDN (full version)
    // Using official Stockfish.js WASM version from CDN
    try {
      importScripts('https://cdn.jsdelivr.net/npm/stockfish.js@10.0.2/stockfish.wasm.js');
    } catch (cdnError) {
      self.postMessage('info string WARNING: CDN load failed, trying alternative...');
      // Try alternative CDN
      try {
        importScripts('https://unpkg.com/stockfish.js@10.0.2/stockfish.wasm.js');
      } catch (altError) {
        self.postMessage('info string ERROR: All CDN sources failed');
        isLoading = false;
        return false;
      }
    }
    
    // Wait a bit for the script to initialize
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check if Stockfish was loaded and create instance
    if (typeof Stockfish === 'function') {
      stockfishInstance = Stockfish();
      stockfishInstance.onmessage = function(line) {
        self.postMessage(line);
      };
      self.postMessage('info string Stockfish loaded successfully');
      isLoading = false;
      return true;
    } else if (typeof STOCKFISH === 'function') {
      stockfishInstance = STOCKFISH();
      stockfishInstance.onmessage = function(line) {
        self.postMessage(line);
      };
      self.postMessage('info string Stockfish loaded successfully');
      isLoading = false;
      return true;
    } else if (typeof Module !== 'undefined' && Module.ccall) {
      // Modern Emscripten-compiled version
      stockfishInstance = {
        postMessage: function(cmd) {
          Module.ccall('uci_command', 'number', ['string'], [cmd]);
        },
        onmessage: function(line) {
          self.postMessage(line);
        }
      };
      self.postMessage('info string Stockfish loaded successfully (Module)');
      isLoading = false;
      return true;
    } else {
      throw new Error('Stockfish constructor not found after loading');
    }
  } catch (error) {
    console.error('Failed to load Stockfish:', error);
    self.postMessage('info string ERROR: Failed to load Stockfish engine: ' + error.message);
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
