# Maia Engine Deployment Guide

## Understanding the MIME Type Error

If you see this error in your browser console:

```
Refused to execute script from 'https://your-site.pages.dev/lc0.js' because its MIME type ('text/html') is not executable, and strict MIME type checking is enabled.
```

**This is expected behavior** when LC0 (Leela Chess Zero) WebAssembly files are not deployed. The error occurs because:

1. The browser tries to load `/lc0.js` 
2. The file doesn't exist in your deployment
3. The server returns a 404 page (HTML) instead
4. The browser refuses to execute HTML as JavaScript

## How Maia Works (Two Modes)

### Full Mode (LC0 + Maia Weights)
- **Requires**: `lc0.js`, `lc0.wasm`, and Maia `.pb.gz` model files
- **Behavior**: True human-like play using neural networks trained on human games
- **Setup**: Complex - requires compiling LC0 to WebAssembly

### Fallback Mode (Stockfish Simulation) ✓ Currently Active
- **Requires**: Only `stockfish.js` and `stockfish.wasm` (already included)
- **Behavior**: Stockfish with adjusted skill levels to approximate human play at different ratings
- **Setup**: Works out of the box - no additional files needed

**The application automatically uses Fallback Mode when LC0 is not available.**

## Error Resolution (v2)

The latest code (after this fix) handles the missing LC0 files gracefully:

1. ✓ **Pre-checks LC0 availability** using `fetch('/lc0.js', { method: 'HEAD' })`
2. ✓ **Avoids MIME type errors** by not attempting to load missing files
3. ✓ **Clear console messages** indicating which mode is active
4. ✓ **Seamless fallback** to Stockfish simulation

### Console Output (After Fix)

**When LC0 is not available (normal for most deployments):**
```
ℹ LC0 not available (lc0.js not found). Using Stockfish to simulate Maia 1500 behavior.
✓ Maia 1500 using Stockfish fallback (Skill 10)
```

**When LC0 is available:**
```
✓ Maia 1500 initialized with LC0 engine and Maia weights
```

## Deploying with Full LC0 Support (Optional)

If you want true Maia behavior with LC0, you need to:

### 1. Get LC0 WebAssembly Files

LC0 must be compiled to WebAssembly. Options:

```bash
# Option A: Build from source (requires Emscripten)
git clone https://github.com/LeelaChessZero/lc0
cd lc0
# Follow LC0's WebAssembly build instructions

# Option B: Check for pre-built WASM releases
# Visit: https://github.com/LeelaChessZero/lc0/releases
```

### 2. Download Maia Model Files

```bash
# From project root
./scripts/download-maia-models.sh

# Or manually download from:
# https://github.com/CSSLab/maia-chess/tree/master/maia_weights
```

### 3. Place Files in Correct Location

```
frontend/public/
├── lc0.js              # LC0 JavaScript worker (40-80 KB)
├── lc0.wasm            # LC0 WebAssembly binary (1-3 MB)
└── maia/
    ├── maia-1100.pb.gz # ~40-80 MB each
    ├── maia-1300.pb.gz
    ├── maia-1500.pb.gz
    ├── maia-1700.pb.gz
    └── maia-1900.pb.gz
```

### 4. Build and Deploy

```bash
cd frontend
npm run build  # Files in public/ are copied to dist/
# Deploy dist/ to Cloudflare Pages
```

### 5. Verify Deployment

After deploying, check the browser console:
- If you see "✓ Maia initialized with LC0", full mode is working
- If you see "✓ Maia using Stockfish fallback", LC0 files weren't deployed

## File Size Considerations

| Mode | Files Needed | Total Size | Notes |
|------|--------------|------------|-------|
| **Fallback** (current) | stockfish.js/wasm | ~650 KB | ✓ Already included |
| **Full LC0** | + lc0.js/wasm | +2-4 MB | Complex setup |
| **All Maia Models** | + 5 .pb.gz files | +200-400 MB | Large download for users |

## Cloudflare Pages Considerations

### Asset Size Limits
- Single file: 25 MB max
- Some Maia models may exceed this limit
- Consider serving large models from separate storage (R2, etc.)

### MIME Type Configuration

Create `frontend/public/_headers` to ensure correct MIME types:

```
/lc0.js
  Content-Type: application/javascript

/lc0.wasm
  Content-Type: application/wasm

/maia/*.pb.gz
  Content-Type: application/gzip
```

## Why Stockfish Fallback is Sufficient

For most use cases, the Stockfish fallback mode provides:

✓ **Adjustable difficulty** - 5 rating levels (1100-1900)  
✓ **Human-like errors** - Lower skill levels make realistic mistakes  
✓ **Fast setup** - Works immediately without large downloads  
✓ **Reliable** - Stockfish is battle-tested and stable  
✓ **Small footprint** - No additional files needed  

The main difference is that LC0+Maia provides statistically accurate human move distributions (trained on millions of human games), while Stockfish fallback approximates this through skill level adjustment.

## Troubleshooting

### MIME Type Error Persists After Update

If you still see the MIME type error after updating the code:

1. **Hard refresh** your browser: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
2. **Clear cache**: Browser settings → Clear browsing data
3. **Check deployment**: Verify the latest code is deployed
4. **Inspect network tab**: Look for `/lc0.js` request - should not happen with new code

### Fallback Not Working

If Stockfish fallback fails:

1. Verify `stockfish.js` and `stockfish.wasm` exist in `frontend/public/`
2. Check browser console for specific errors
3. Ensure files are being copied to `dist/` during build

### LC0 Files Present But Not Loading

If you've added LC0 files but they're not loading:

1. Check file names exactly match: `lc0.js` and `lc0.wasm`
2. Verify MIME types are correct (use Network tab)
3. Check browser console for initialization errors
4. Ensure Maia `.pb.gz` files are present in `public/maia/`

## References

- **Maia Project**: https://maiachess.com/
- **LC0 Project**: https://lczero.org/
- **Maia Paper**: https://arxiv.org/abs/2006.01855
- **Local Setup**: See `frontend/public/maia/README.md`

## Summary

✓ **The MIME type error is now fixed** - code checks for LC0 before loading  
✓ **Fallback mode works perfectly** - no additional setup needed  
✓ **Full LC0 support is optional** - for advanced deployments only  
✓ **No breaking changes** - app works the same as before, just cleaner  
