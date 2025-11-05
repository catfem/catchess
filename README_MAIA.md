# Maia Chess Engine - Important Information

## ⚠️ Critical: Maia Requires LC0

**Maia is NOT a standalone chess engine!** It's a set of neural network weights that must be run with LC0 (Leela Chess Zero).

### What is Maia?

```
Maia = Neural Network Weights (.pb.gz files)
      + 
      LC0 (Leela Chess Zero engine)
```

Think of it this way:
- **Maia weights** = The "brain" (trained neural network)
- **LC0 engine** = The "body" (runs the neural network)
- You need both for true Maia functionality

### How CatChess Handles This

Our implementation uses a **dual-mode approach**:

#### Mode 1: Full Maia (Requires Setup)
- ✅ Uses LC0 with Maia weights
- ✅ True human-like play from trained NN
- ✅ Authentic Maia behavior
- ❌ Requires LC0 WebAssembly build
- ❌ Complex setup

#### Mode 2: Stockfish Fallback (Default)
- ✅ Works immediately, no setup
- ✅ Uses Stockfish with adjusted skill levels
- ✅ Approximates human play at each rating
- ⚠️ Not true Maia, but very similar experience

### Current Status

**Out of the box:** The app uses **Mode 2** (Stockfish fallback)
- When you select "Maia 1500", you get Stockfish with skill level 10
- This approximates 1500-level human play
- Console shows: "LC0 not available, falling back to Stockfish"

**With LC0 setup:** The app uses **Mode 1** (Full Maia)
- Requires LC0 compiled to WebAssembly
- Requires Maia .pb.gz model files
- Console shows: "Maia 1500 engine ready using LC0 with Maia weights"

## Quick Start (Works Now!)

Just run the app - Maia will work immediately using Stockfish fallback:

```bash
cd frontend
npm install
npm run dev
```

Select "Maia" in the UI, choose a rating level, and play!

## Advanced Setup (Full Maia with LC0)

See [MAIA_SETUP.md](MAIA_SETUP.md) for detailed instructions on:
1. Downloading Maia .pb.gz model files
2. Getting LC0 compiled to WebAssembly
3. Deploying files to enable full Maia mode

## Technical Details

### How Maia Models Work

Maia models are trained on human games at specific rating levels:

```bash
# Command line usage with LC0:
lc0 --weights=maia-1500.pb.gz

# In UCI mode:
position startpos
go nodes 1  # Important: Use nodes 1, not depth!
```

The `go nodes 1` command tells LC0 to:
- Evaluate position with neural network only
- No tree search (which would make it play stronger)
- Return the move prediction directly

### Why This Implementation?

We chose this approach because:

1. **LC0 WASM is complex** - Compiling LC0 to WebAssembly is non-trivial
2. **Graceful degradation** - App works without complex setup
3. **User experience** - No broken features or confusing errors
4. **Future-ready** - Easy to upgrade when LC0 WASM is available

### File Requirements

**For Full Maia:**
```
frontend/public/
├── lc0.js              # LC0 WebAssembly worker
├── lc0.wasm            # LC0 WebAssembly binary
└── maia/
    ├── maia-1100.pb.gz # Maia 1100 weights
    ├── maia-1300.pb.gz # Maia 1300 weights
    ├── maia-1500.pb.gz # Maia 1500 weights
    ├── maia-1700.pb.gz # Maia 1700 weights
    └── maia-1900.pb.gz # Maia 1900 weights
```

**For Fallback (Default):**
```
frontend/public/
└── stockfish.js        # Already included ✅
```

## Code Implementation

The Maia engine implementation (`frontend/src/utils/maiaEngine.ts`):

```typescript
async init(): Promise<void> {
  try {
    // Try to load LC0
    this.worker = new Worker('/lc0.js');
    await this.initLC0Worker();
    this.useStockfishFallback = false;
  } catch (lc0Error) {
    // Fall back to Stockfish
    console.warn('LC0 not available, falling back to Stockfish');
    this.worker = new Worker('/stockfish.js');
    await this.initStockfishFallback();
    this.useStockfishFallback = true;
  }
}
```

## Documentation

- **[MAIA_SETUP.md](MAIA_SETUP.md)** - Complete setup guide for both modes
- **[MAIA_IMPLEMENTATION_NOTES.md](MAIA_IMPLEMENTATION_NOTES.md)** - Technical implementation details
- **[ENGINE_SUPPORT.md](ENGINE_SUPPORT.md)** - Engine architecture overview
- **[frontend/public/maia/README.md](frontend/public/maia/README.md)** - Model file information

## References

- **Maia Project**: https://maiachess.com/
- **Maia GitHub**: https://github.com/CSSLab/maia-chess
- **LC0 Project**: https://lczero.org/
- **LC0 GitHub**: https://github.com/LeelaChessZero/lc0

## Summary

✅ **Works Now**: Maia mode using Stockfish fallback (no setup required)  
🚧 **Advanced**: Full Maia with LC0 (requires complex setup)  
📚 **Well Documented**: Multiple guides for all scenarios  
🔮 **Future**: Easier LC0 integration coming

The key point: **Maia needs LC0**, but we've made it work without it for now!
