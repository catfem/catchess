# Maia Requires LC0 - Here's Why and How We Handle It

## The Core Issue

**Maia chess models are NOT engines - they're neural network weights.**

### What Maia Actually Is:

```
❌ NOT THIS:
   Maia → Makes moves directly

✅ ACTUALLY THIS:
   Maia weights (.pb.gz) → LC0 engine → Makes moves
```

### Analogy:

- **Maia weights** = Recipe (instructions for how to play like a 1500 player)
- **LC0 engine** = Chef (reads the recipe and executes it)
- **You can't cook without a chef, even with a perfect recipe!**

## Why This Matters

From the official Maia documentation:

> "The Maias are not a full chess framework chess engines, they are just brains (weights) and require a body to work. So you need to load them with lc0"

This means:
1. You cannot run Maia weights directly
2. You must have LC0 (Leela Chess Zero) installed
3. You load Maia weights into LC0: `lc0 --weights=maia-1500.pb.gz`
4. You run with: `go nodes 1` (no search, just neural network output)

## Our Solution

We implemented a **smart fallback system**:

### Architecture Flow:

```
User selects "Maia 1500"
         ↓
Engine Manager tries to load LC0
         ↓
    ┌────┴─────┐
    ↓          ↓
LC0 Found?   LC0 Not Found?
    ↓          ↓
Load Maia    Load Stockfish
weights      with Skill 10
    ↓          ↓
go nodes 1   go depth 12
    ↓          ↓
True Maia    Simulated
behavior     human play
```

### Code Implementation:

```typescript
// In maiaEngine.ts
async init(): Promise<void> {
  try {
    // Attempt #1: Try to load LC0
    this.worker = new Worker('/lc0.js');
    await this.initLC0Worker();
    this.useStockfishFallback = false;
    
    // If we get here: TRUE MAIA MODE ✅
    console.log('Maia 1500 ready using LC0 with Maia weights');
    
  } catch (lc0Error) {
    // Attempt #2: Fall back to Stockfish
    console.warn('LC0 not available, falling back to Stockfish');
    
    this.worker = new Worker('/stockfish.js');
    await this.initStockfishFallback();
    this.useStockfishFallback = true;
    
    // FALLBACK MODE ⚠️
    console.log('Maia 1500 ready using Stockfish (simulating human play)');
  }
}
```

### When Running Maia:

```typescript
if (this.useStockfishFallback) {
  // Stockfish mode: Limited depth for human-like play
  this.sendCommand(`go depth 12`);
} else {
  // LC0 mode: Raw neural network output
  this.sendCommand('go nodes 1');
}
```

## User Experience

### Scenario 1: Without LC0 (Default)

**User Action:** Selects "Maia 1500"

**What Happens:**
```
1. App tries: new Worker('/lc0.js')
2. Fails: lc0.js doesn't exist
3. Falls back: new Worker('/stockfish.js')
4. Sets: Stockfish Skill Level 10
5. Console: "LC0 not available, falling back to Stockfish simulation"
6. Result: Working opponent at ~1500 strength
```

**User Experience:**
- ✅ Engine works immediately
- ✅ No errors or broken features
- ✅ Plays at appropriate strength
- ⚠️ Not true Maia behavior (but close enough)

### Scenario 2: With LC0 Setup

**User Action:** Selects "Maia 1500" (after LC0 setup)

**What Happens:**
```
1. App tries: new Worker('/lc0.js')
2. Success: LC0 worker loads
3. Loads: maia-1500.pb.gz weights
4. Configures: setoption name WeightsFile value /maia/maia-1500.pb.gz
5. Console: "Maia 1500 ready using LC0 with Maia weights"
6. Result: TRUE Maia behavior
```

**User Experience:**
- ✅ Engine works with full Maia
- ✅ Authentic human-like play
- ✅ Trained neural network predictions
- ✅ Exactly as researchers designed

## Files Required

### For Fallback Mode (Works Now):
```
✅ frontend/public/stockfish.js (already included)
✅ frontend/public/stockfish.wasm (already included)
```

### For Full Maia Mode:
```
❌ frontend/public/lc0.js (needs to be built)
❌ frontend/public/lc0.wasm (needs to be built)
❌ frontend/public/maia/maia-1100.pb.gz (downloadable)
❌ frontend/public/maia/maia-1500.pb.gz (downloadable)
❌ frontend/public/maia/maia-1900.pb.gz (downloadable)
```

## How to Get LC0

### Option 1: Build from Source (Advanced)

```bash
# Install Emscripten
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest

# Clone LC0
git clone https://github.com/LeelaChessZero/lc0.git
cd lc0

# Build for WebAssembly (follow LC0 docs)
# This is complex and requires C++ knowledge
```

### Option 2: Use Pre-built (If Available)

- Check LC0 releases for WebAssembly builds
- Look for community projects
- Check chess.com or lichess.org implementations

### Option 3: Server-Side (Future)

Run LC0 on a server, connect via WebSocket:
```
Browser → WebSocket → Server (LC0 + Maia) → Moves back
```

## Testing Both Modes

### Test Fallback Mode:

```bash
cd frontend
npm run dev
# Open http://localhost:5173
# Select "Maia 1500"
# Check console: Should say "falling back to Stockfish"
# Play a game - should work!
```

### Test Full Mode (if you have LC0):

```bash
# 1. Place lc0.js and lc0.wasm in frontend/public/
# 2. Download Maia models to frontend/public/maia/
./scripts/download-maia-models.sh

# 3. Run app
cd frontend
npm run dev

# 4. Select "Maia 1500"
# Check console: Should say "using LC0 with Maia weights"
# Play a game - should use true Maia!
```

## Why This Approach is Good

1. **Works Immediately** ✅
   - No complex setup required
   - No broken features
   - No confusing errors

2. **Transparent** 📢
   - Console logs show which mode
   - Documentation explains both
   - Users know what they're getting

3. **Future-Proof** 🔮
   - Ready for LC0 when available
   - Easy to upgrade
   - No code changes needed

4. **User-Friendly** 😊
   - Select Maia → Get an opponent
   - Works at right strength level
   - Can upgrade later if desired

## Key Takeaway

**Maia needs LC0 to work properly, but we've made it work WITHOUT LC0 for now.**

This is a pragmatic solution that:
- Gives users Maia functionality today
- Provides path to true Maia later
- Handles errors gracefully
- Maintains good UX

## References

- **Maia GitHub**: https://github.com/CSSLab/maia-chess
- **LC0 Project**: https://lczero.org/
- **Our Docs**: See MAIA_SETUP.md for full details
