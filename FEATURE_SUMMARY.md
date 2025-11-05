# Feature Summary: Multiple Chess Engines

## What Was Added

CatChess now supports **multiple chess engines** instead of just Stockfish. Users can choose between:

1. **Stockfish** - Traditional, strongest engine (existing)
2. **Maia** - NEW! Human-like play at 5 rating levels (1100-1900)

> **⚠️ Important:** Maia models are **not standalone engines**. They are neural network weights (.pb.gz files) that require **LC0 (Leela Chess Zero)** to run. Without LC0, the app automatically falls back to using Stockfish with adjusted skill levels to simulate human-like play. See [MAIA_SETUP.md](MAIA_SETUP.md) for details.

## Key Features

### 🎯 Engine Selection
- Simple UI toggle between Stockfish and Maia
- Real-time engine switching without page reload
- Settings persist throughout session

### 🤖 Maia Chess Engine
- **5 Rating Levels**: 1100, 1300, 1500, 1700, 1900
- **Human-like Play**: Makes moves actual humans would make
- **Neural Network**: Requires LC0 (Leela Chess Zero) with .pb.gz weights
- **Dual Mode**: Full Maia with LC0, or Stockfish fallback (works out of box)

### ⚙️ Technical Implementation
- Clean engine abstraction layer
- Easy to add more engines in the future
- Type-safe engine management
- Efficient resource usage (only one engine active)

## Quick Start

### For Users:
1. Open the app
2. Look for "Chess Engine" section in controls
3. Click "Maia" button
4. Select a rating level (1100-1900)
5. Start playing or analyzing!

### For Developers:
```bash
# Install dependencies
cd frontend
npm install

# Download Maia models (optional)
./scripts/download-maia-models.sh

# Run the app
npm run dev
```

## Files Changed

### New Files:
- ✨ `frontend/src/utils/engine.ts` - Engine interface
- ✨ `frontend/src/utils/maiaEngine.ts` - Maia implementation
- ✨ `frontend/src/utils/engineManager.ts` - Engine manager
- 📝 `MAIA_SETUP.md` - Setup guide
- 📝 `ENGINE_SUPPORT.md` - Technical docs
- 🔧 `scripts/download-maia-models.sh` - Model download script

### Updated Files:
- 🔄 `frontend/src/types/index.ts` - Added engine types
- 🔄 `frontend/src/store/gameStore.ts` - Uses engine manager
- 🔄 `frontend/src/components/GameControls.tsx` - Engine selection UI
- 🔄 `frontend/src/components/StockfishStatus.tsx` - Supports all engines
- 🔄 `frontend/package.json` - No new dependencies (uses existing engines)

## Documentation

Three comprehensive documentation files were created:

1. **MAIA_SETUP.md** - User guide for Maia setup and usage
2. **ENGINE_SUPPORT.md** - Developer guide for architecture
3. **MULTIPLE_ENGINES_FEATURE.md** - Complete implementation details

## Benefits

### For Players:
- 🎮 **Better Practice**: Play against your rating level
- 📚 **Learn Faster**: Study human-typical patterns
- 🎯 **More Realistic**: Opponents that make human mistakes
- 🔧 **Flexible**: Switch engines based on needs

### For Developers:
- 🏗️ **Clean Architecture**: Easy to extend
- 🔌 **Pluggable**: Add new engines easily
- 🧪 **Testable**: Clear interfaces
- 📦 **Maintainable**: Separation of concerns

## What's Next?

Potential future enhancements:
- More engines (Leela, Komodo, etc.)
- Multi-engine comparison mode
- Cloud-based analysis
- Custom neural network models

## Need Help?

- Setup issues? See `MAIA_SETUP.md`
- Technical details? See `ENGINE_SUPPORT.md`
- Full changelog? See `MULTIPLE_ENGINES_FEATURE.md`

## Credits

**Maia Chess**: Cornell Social Systems Lab, Microsoft Research  
**Original Paper**: "Aligning Superhuman AI with Human Behavior: Chess as a Model System"  
**Project**: https://maiachess.com/
