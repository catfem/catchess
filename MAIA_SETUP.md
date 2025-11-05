# Maia Chess Engine Setup

CatChess now supports the Maia chess engine in addition to Stockfish! Maia is a neural network-based chess engine that plays like humans at different rating levels (1100-1900).

## ⚠️ Important: Understanding Maia

**Maia is NOT a standalone chess engine!** It consists of:

1. **Neural network weights** (`.pb.gz` files) - The "brain"
2. **Leela Chess Zero (LC0)** - The "body" that runs the neural network

Think of it like this: Maia weights are like a trained AI model, and LC0 is the engine that interprets and executes those predictions.

## About Maia

Maia is a research project from Cornell University that uses deep learning to create chess engines that play like humans at specific skill levels. Unlike traditional engines like Stockfish that always try to play the objectively best move, Maia predicts what human players at different rating levels would actually play.

### Available Models

- **Maia 1100**: Plays like a 1100-rated player (beginner)
- **Maia 1300**: Plays like a 1300-rated player (intermediate)
- **Maia 1500**: Plays like a 1500-rated player (advanced)
- **Maia 1700**: Plays like a 1700-rated player (expert)
- **Maia 1900**: Plays like a 1900-rated player (master)

Learn more at: https://maiachess.com

## Two Modes of Operation

CatChess can run Maia in two modes:

### Mode 1: Full Maia (LC0 + Weights)

**Requirements:**
- LC0 engine compiled to WebAssembly (`lc0.js` + `lc0.wasm`)
- Maia `.pb.gz` model files
- ~200MB browser RAM

**Features:**
- True human-like play from trained neural networks
- Authentic Maia behavior
- Run with `go nodes 1` for raw NN output

**Status:** Complex setup, requires LC0 WASM build

### Mode 2: Stockfish Fallback (Default)

**Requirements:**
- Just Stockfish (already included)
- No additional files needed

**Features:**
- Automatically enabled if LC0 not available
- Uses Stockfish with adjusted skill levels
- Approximates human play at each rating level

**Status:** Works out of the box! ✅

## Quick Start (Stockfish Fallback Mode)

This mode works **right now** without any additional setup:

1. Start the application:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. In the UI, select **Chess Engine** → **Maia**

3. Choose your rating level (1100-1900)

4. The app will use Stockfish with human-like settings

**That's it!** You're now playing against an engine tuned to play like a human at your chosen rating level.

## Advanced Setup (Full LC0 + Maia)

For the authentic Maia experience with true neural network predictions:

### Step 1: Download Maia Models

Run the download script:

```bash
./scripts/download-maia-models.sh
```

Or manually download `.pb.gz` files from:
https://github.com/CSSLab/maia-chess/tree/master/maia_weights

Place them in: `frontend/public/maia/`

### Step 2: Get LC0 for WebAssembly

**Option A: Build from Source (Advanced)**

```bash
# Install Emscripten
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh

# Clone and build LC0
git clone https://github.com/LeelaChessZero/lc0.git
cd lc0
# Follow LC0 WebAssembly build instructions
# This is complex and may require additional setup
```

**Option B: Find Pre-built WASM (Recommended)**

- Check LC0 releases for web builds
- Search for community-built LC0 WASM versions
- Look for chess.com or lichess.org implementations

**Option C: Use Docker/Server-Side**

Run LC0 on a server and connect via WebSocket (future enhancement)

### Step 3: Deploy LC0 Files

Place in `frontend/public/`:
- `lc0.js`
- `lc0.wasm`

### Step 4: Test

The app will automatically detect LC0 and use it with Maia weights!

## How Maia Differs from Stockfish

| Feature | Stockfish | Maia (Full) | Maia (Fallback) |
|---------|-----------|-------------|-----------------|
| Engine | UCI C++ | LC0 + NN | Stockfish |
| Play Style | Perfect | Human-like | Weakened |
| Move Selection | Best move | Average human move | Reduced depth |
| Strength Control | Skill 0-20 | Rating 1100-1900 | Skill 2-18 |
| Mistakes | Intentional | Natural human patterns | Random |
| Setup | ✅ Included | ❌ Complex | ✅ Included |

## Usage in App

1. Open the application
2. Find the **Chess Engine** section in the controls panel
3. Select **Maia** (or **Stockfish** for traditional play)
4. Choose Maia rating level (1100-1900)
5. Start playing or analyzing

### What Happens:

**If LC0 is available:**
```
→ Loads /lc0.js worker
→ Loads /maia/maia-1500.pb.gz weights  
→ Runs: go nodes 1
→ Returns: Human-like move prediction
```

**If LC0 is NOT available (default):**
```
→ Console: "LC0 not available, falling back to Stockfish"
→ Loads /stockfish.js worker
→ Sets skill level based on rating (e.g., 1500 → skill 10)
→ Returns: Move with limited search depth
```

## Command Line Testing

To test Maia models locally (not in browser):

```bash
# Install LC0 on your system
# Ubuntu/Debian:
sudo apt-get install lc0

# macOS:
brew install lc0

# Windows: Download from https://github.com/LeelaChessZero/lc0/releases

# Run Maia 1500
lc0 --weights=maia-1500.pb.gz

# In UCI mode:
position startpos
go nodes 1
# e2e4 (or another move)

# See the raw NN prediction!
```

## Rating to Skill Level Mapping (Fallback Mode)

| Maia Rating | Stockfish Skill | Typical Strength |
|-------------|----------------|------------------|
| 1100 | 2 | Beginner |
| 1200 | 4 | Casual player |
| 1300 | 6 | Intermediate |
| 1400 | 8 | Club player |
| 1500 | 10 | Advanced |
| 1600 | 12 | Strong club |
| 1700 | 14 | Expert |
| 1800 | 16 | Master level |
| 1900 | 18 | Strong master |

## Troubleshooting

### "LC0 not available, falling back to Stockfish"

This is **normal** and expected if you haven't set up LC0 WASM!

- ✅ The app still works great
- ✅ You get human-level opponents
- ✅ Rating levels still work
- ⚠️ Just not true neural network Maia behavior

To get full Maia:
- Complete the Advanced Setup above
- Or wait for future updates with easier LC0 integration

### Models Not Loading

1. Check `frontend/public/maia/` has `.pb.gz` files
2. Verify filenames: `maia-1100.pb.gz`, `maia-1500.pb.gz`, etc.
3. Check file sizes (should be 40-80MB each)
4. Try redownloading with the script

### Slow Performance

- **First load**: 10-30 seconds (loading models)
- **Subsequent moves**: Should be fast (<1s)
- **Fallback mode**: Very fast (uses Stockfish)

### Browser Compatibility

**Fallback mode (default):**
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

**Full LC0 mode:**
- Requires WebAssembly with threads
- Requires SharedArrayBuffer support
- May need special headers for cross-origin isolation

## Why Is Full Maia Setup Complex?

LC0 is a sophisticated C++ chess engine that:
- Uses neural networks (computationally intensive)
- Requires WebAssembly compilation
- Needs specific browser features (SharedArrayBuffer, workers)
- Has large binary sizes (20-30MB for engine + 40-80MB per model)

Building LC0 for web is similar to porting any native C++ application to browsers - it's technically possible but requires significant effort.

## Future Enhancements

Potential improvements:

1. **Pre-built LC0 WASM package** - Ready to use
2. **Server-side Maia** - Run LC0 on server, connect via API
3. **Lightweight Maia** - Smaller models optimized for web
4. **Move database** - Pre-computed Maia moves for common positions

## Credits

**Maia Chess:**
- Cornell Social Systems Lab (CSSLab)
- Microsoft Research
- University of Toronto

**Paper:** "Aligning Superhuman AI with Human Behavior: Chess as a Model System"
- https://arxiv.org/abs/2006.01855

**Leela Chess Zero:**
- Community-driven neural network chess engine
- https://lczero.org/

## Additional Resources

- **Maia Project**: https://maiachess.com/
- **Maia GitHub**: https://github.com/CSSLab/maia-chess
- **Play against Maia on Lichess**: Search for @maia1, @maia5, @maia9
- **LC0 Project**: https://lczero.org/
- **LC0 GitHub**: https://github.com/LeelaChessZero/lc0

## Summary

- ✅ **Works Now**: Stockfish fallback mode provides great human-like play
- 🚧 **Advanced**: Full Maia with LC0 requires complex setup
- 🎯 **Recommendation**: Start with fallback mode, enjoy human-level chess
- 🔮 **Future**: Easier LC0 integration coming in future updates

Enjoy playing against human-like opponents!
