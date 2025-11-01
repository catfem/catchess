# Stockfish Setup Guide

## Automatic Loading (Default)

CatChess automatically downloads Stockfish from CDN when you first load the application. This requires an internet connection.

### CDN Sources (tried in order):
1. jsDelivr: `https://cdn.jsdelivr.net/npm/stockfish@16.1.0/src/stockfish.js`
2. unpkg: `https://unpkg.com/stockfish@16.1.0/src/stockfish.js`
3. Fallback: `https://cdn.jsdelivr.net/npm/stockfish.wasm@0.11.0/stockfish.js`

## Troubleshooting

If Stockfish fails to load automatically, you have several options:

### Option 1: Check Internet Connection
- Ensure you have a stable internet connection
- Try refreshing the page
- Check if your firewall is blocking CDN access

### Option 2: Use Local Stockfish (Advanced)

1. Download Stockfish.js from: https://github.com/nmrugg/stockfish.js/releases
2. Place the `stockfish.js` and `stockfish.wasm` files in the `public/` folder
3. The application will use the local version instead of CDN

### Option 3: Download Stockfish WASM

You can also use the WebAssembly version:

```bash
# Install via npm (if you have Node.js installed)
npm install stockfish.wasm
```

Then copy the files to your public folder.

## Verification

To verify Stockfish is working:
1. Open the browser console (F12)
2. Look for the message: "Stockfish engine ready"
3. If you see errors, check the console for specific error messages

## Performance Notes

- First load may take 10-30 seconds depending on your connection
- Subsequent loads use browser cache and are instant
- Analysis depth and move calculation speed depend on your device's CPU
- Recommended depth: 15-20 for best results (may take a few seconds per move)

## Support

If you continue to have issues:
- Check browser console for error messages
- Try using a different browser (Chrome/Firefox recommended)
- Ensure JavaScript is enabled
- Try clearing browser cache and reloading
