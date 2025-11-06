// Stockfish.js Web Worker - Using bundled WASM version
// This version uses the locally bundled stockfish.wasm.js instead of CDN

let isLoading = false;
let loaded = false;

async function loadStockfish() {
  if (loaded || isLoading) return true;
  
  isLoading = true;
  
  try {
    self.postMessage('info string Loading bundled Stockfish engine...');
    
    // Check if WebAssembly is supported
    const wasmSupported = typeof WebAssembly === 'object' && 
      WebAssembly.validate(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));
    
    if (!wasmSupported) {
      self.postMessage('info string ERROR: WebAssembly not supported in this browser');
      isLoading = false;
      return false;
    }
    
    // Load bundled Stockfish WASM version (no CDN dependency)
    try {
      importScripts('/stockfish.wasm.js');
    } catch (error) {
      self.postMessage('info string ERROR: Failed to load bundled Stockfish: ' + error.message);
      isLoading = false;
      return false;
    }
    
    // Wait for the module to initialize
    await new Promise(resolve => setTimeout(resolve, 100));
    
    self.postMessage('info string Bundled Stockfish loaded successfully');
    loaded = true;
    isLoading = false;
    return true;
  } catch (error) {
    console.error('Failed to load Stockfish:', error);
    self.postMessage('info string ERROR: Failed to load Stockfish engine: ' + error.message);
    isLoading = false;
    return false;
  }
}

self.onmessage = async function(e) {
  const command = e.data;

  if (!loaded) {
    const success = await loadStockfish();
    if (!success) {
      return;
    }
  }

  // The bundled stockfish.wasm.js uses the Module interface
  if (typeof Module !== 'undefined' && Module.ccall) {
    try {
      Module.ccall('uci_command', 'number', ['string'], [command]);
    } catch (error) {
      self.postMessage('info string ERROR executing command: ' + error.message);
    }
  }
};
