# Stockfish Setup Guide

## Local Bundled Version (No CDN Required)

CatChess now includes Stockfish bundled locally with the application. No internet connection is required after the initial app load.

### What's Included:
- **Stockfish WASM** - High-performance WebAssembly version
- **Stockfish Worker** - Web Worker interface for non-blocking execution
- **Local Files** - All files bundled with the application

The Stockfish engine files are included in the `public/` folder:
- `stockfish.wasm.js` - WASM loader script
- `stockfish.wasm` - Compiled Stockfish engine (WebAssembly)
- `stockfish.js` - Web Worker wrapper

## How It Works

1. The application initializes a Web Worker from `/stockfish.js`
2. The worker loads the local `stockfish.wasm.js` script
3. Stockfish initializes using the WASM binary
4. All communication happens via UCI protocol through the Worker

## Browser Compatibility

Stockfish requires WebAssembly support, which is available in:
- ✅ Chrome 57+
- ✅ Firefox 52+
- ✅ Safari 11+
- ✅ Edge 16+
- ✅ Opera 44+

## Verification

To verify Stockfish is working:
1. Open the browser console (F12)
2. Look for the message: "Stockfish loaded successfully from local files"
3. Look for the message: "Stockfish engine ready"
4. If you see errors, check the console for specific error messages

## Performance Notes

- First load may take 2-5 seconds to initialize the WASM engine
- Analysis depth and move calculation speed depend on your device's CPU
- Recommended depth: 15-20 for best results (may take a few seconds per move)
- The WASM version provides near-native performance

## Troubleshooting

### Stockfish Not Loading

If the Stockfish engine fails to load:

1. **Check Browser Compatibility** - Ensure your browser supports WebAssembly
2. **Check Console** - Open F12 and look for error messages
3. **Clear Browser Cache** - Try Ctrl+Shift+Delete to clear cache
4. **Disable Extensions** - Some ad-blockers may interfere with Worker threads

### WebAssembly Not Supported

If you see "WebAssembly not supported":
- Your browser is too old and doesn't support WebAssembly
- Update to a modern browser (Chrome, Firefox, Safari, or Edge)

### Worker Errors

If you see "Failed to load Stockfish worker":
- Ensure the `stockfish.js`, `stockfish.wasm.js`, and `stockfish.wasm` files exist in the public folder
- Check that the files weren't blocked by your web server configuration
- Verify that Worker threads are enabled in your browser

## Support

For issues and questions:
- Check browser console for error messages
- Ensure you're using a modern browser
- Try reloading the page

---

**Built with ♟️ using locally bundled Stockfish - No CDN required!**
