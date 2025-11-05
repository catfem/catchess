# Maia Chess Models

This directory contains the Maia chess engine models for use with Leela Chess Zero (LC0).

## Important Information

**Maia models are NOT standalone chess engines!** They are neural network weights (`.pb.gz` files) that must be loaded with the LC0 (Leela Chess Zero) engine.

## Required Files

### Maia Model Files (.pb.gz)

The following model files should be placed in this directory:

- `maia-1100.pb.gz` - Maia 1100 rating level (beginner)
- `maia-1200.pb.gz` - Maia 1200 rating level
- `maia-1300.pb.gz` - Maia 1300 rating level (intermediate)
- `maia-1400.pb.gz` - Maia 1400 rating level
- `maia-1500.pb.gz` - Maia 1500 rating level (advanced)
- `maia-1600.pb.gz` - Maia 1600 rating level
- `maia-1700.pb.gz` - Maia 1700 rating level (expert)
- `maia-1800.pb.gz` - Maia 1800 rating level
- `maia-1900.pb.gz` - Maia 1900 rating level (master)

### LC0 Engine Files

You also need LC0 compiled to WebAssembly in `frontend/public/`:

- `lc0.js` - LC0 JavaScript worker
- `lc0.wasm` - LC0 WebAssembly binary

## Downloading Models

### Automatic Download

Run the download script from the project root:

```bash
./scripts/download-maia-models.sh
```

### Manual Download

Download directly from the official repository:
https://github.com/CSSLab/maia-chess/tree/master/maia_weights

## How Maia Works

Maia models are trained on human games at specific rating levels. Key points:

1. **LC0 Required**: Models must be loaded with: `lc0 --weights=maia-1500.pb.gz`
2. **Disable Search**: Run with `go nodes 1` to get raw neural network predictions
3. **Human-like Play**: Models play the *average* move of a player at that rating
4. **Stronger Than Rating**: Models are slightly stronger than their target rating since they make the average move

## Model Details

- **Format**: Protocol Buffer (.pb.gz)
- **Size**: ~40-80MB per model (compressed)
- **Total**: ~500MB for all 9 models
- **Engine**: Requires Leela Chess Zero (LC0)
- **License**: See https://github.com/CSSLab/maia-chess for licensing

## Getting LC0 for Web

LC0 needs to be compiled to WebAssembly to run in browsers. Options:

1. **Build from source**: https://github.com/LeelaChessZero/lc0
   - Requires Emscripten toolchain
   - Complex build process
   
2. **Use pre-built WASM** (if available):
   - Check LC0 releases for web builds
   - Community projects may have pre-built versions

3. **Fallback mode**: Without LC0, the app uses Stockfish with adjusted skill levels to simulate human-like play

## Running Maia Locally (Command Line)

If you want to test Maia models locally:

```bash
# Install LC0
# On Ubuntu/Debian:
sudo apt-get install lc0

# Run Maia 1500
lc0 --weights=maia-1500.pb.gz

# In the LC0 prompt, use:
# position startpos
# go nodes 1
```

## Application Behavior

### With LC0 Available
- App loads LC0 worker from `/lc0.js`
- Loads Maia weights from `/maia/maia-{level}.pb.gz`
- Runs with `go nodes 1` for raw NN output
- Provides true human-like play at selected rating

### Without LC0 (Fallback Mode)
- App falls back to Stockfish
- Uses adjusted skill levels to approximate rating:
  - 1100 → Skill 2
  - 1300 → Skill 6
  - 1500 → Skill 10
  - 1700 → Skill 14
  - 1900 → Skill 18
- Not as human-like but provides similar challenge level

## Troubleshooting

### Models Not Loading

1. Check that model files exist in this directory
2. Verify files are named correctly (e.g., `maia-1500.pb.gz`)
3. Check browser console for specific errors
4. Ensure files aren't corrupted (redownload if needed)

### LC0 Not Available

If you see "LC0 not available, falling back to Stockfish":
- This is normal if lc0.js isn't in frontend/public/
- App will use Stockfish to simulate human play
- To get true Maia behavior, compile LC0 to WASM

### Performance Issues

- Maia models are larger than traditional engines
- First load may take 10-30 seconds
- Subsequent moves should be fast (no search needed)
- Browser needs ~200MB free RAM per model

## References

- **Maia Project**: https://maiachess.com/
- **GitHub**: https://github.com/CSSLab/maia-chess
- **Paper**: https://arxiv.org/abs/2006.01855
- **LC0 Project**: https://lczero.org/
- **LC0 GitHub**: https://github.com/LeelaChessZero/lc0

## Credits

Maia Chess is developed by:
- Cornell Social Systems Lab (CSSLab)
- Microsoft Research
- University of Toronto

Paper: "Aligning Superhuman AI with Human Behavior: Chess as a Model System"
