// Stockfish loader for browser environment
// This will load the stockfish.js library from CDN

(function() {
  if (typeof window !== 'undefined' && !window.STOCKFISH_LOADED) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/stockfish@16.0.0/src/stockfish.js';
    script.async = true;
    script.onload = () => {
      window.STOCKFISH_LOADED = true;
      console.log('Stockfish loaded successfully');
    };
    document.head.appendChild(script);
  }
})();
