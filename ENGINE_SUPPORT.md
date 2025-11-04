# Multiple Chess Engine Support

CatChess now supports multiple chess engines! You can choose between Stockfish (traditional, strongest) and Maia (human-like play at different rating levels).

## Available Engines

### 1. Stockfish
The world's strongest open-source chess engine.

**Features:**
- Maximum strength chess play
- Skill levels 0-20 for adjustable difficulty
- Extremely fast analysis
- Deep tactical calculation
- Perfect for serious analysis and maximum challenge

**When to use:**
- Finding the objectively best moves
- Deep tactical analysis
- Maximum difficulty opponent
- Tournament-level preparation

### 2. Maia
A neural network-based engine that plays like humans at specific rating levels.

**Features:**
- Human-like play patterns
- 5 rating levels: 1100, 1300, 1500, 1700, 1900
- Makes human-typical mistakes
- Follows common human opening choices
- Great for learning and practice

**When to use:**
- Practicing against your rating level
- Understanding human chess patterns
- Learning from realistic mistakes
- More enjoyable casual play

## Architecture

### Engine Interface
All engines implement a common `ChessEngine` interface:

```typescript
interface ChessEngine {
  init(): Promise<void>;
  isReady(): boolean;
  getLoadingError(): string | null;
  getBestMove(fen: string, depth?: number): Promise<EngineResult>;
  getEngineMove(fen: string, skill?: number): Promise<string>;
  terminate(): void;
}
```

### Engine Manager
The `engineManager` handles switching between engines and routing requests:

```typescript
import { engineManager } from './utils/engineManager';

// Set the engine
await engineManager.setEngine('maia', 1500);

// Get best move
const result = await engineManager.getBestMove(fen, 18);
```

### Integration Points

1. **Game Store** (`src/store/gameStore.ts`)
   - Uses engineManager for all engine operations
   - Respects engine settings from UI
   - Handles engine initialization and errors

2. **UI Controls** (`src/components/GameControls.tsx`)
   - Engine selection buttons
   - Maia rating level selector
   - Stockfish skill level slider

3. **Status Component** (`src/components/StockfishStatus.tsx`)
   - Now renamed internally to support all engines
   - Shows loading state for any engine
   - Displays engine-specific error messages

## File Structure

```
frontend/src/
├── types/index.ts              # Engine types and settings
├── utils/
│   ├── engine.ts              # Engine interface definition
│   ├── stockfish.ts           # Stockfish implementation
│   ├── maiaEngine.ts          # Maia implementation
│   └── engineManager.ts       # Engine switching manager
├── store/
│   └── gameStore.ts           # Uses engineManager
└── components/
    ├── GameControls.tsx       # Engine selection UI
    └── StockfishStatus.tsx    # Engine status display

frontend/public/
├── stockfish.js               # Stockfish worker
├── stockfish.wasm             # Stockfish WASM
└── maia/
    ├── maia_kdd_1100.onnx    # Maia 1100 model
    ├── maia_kdd_1300.onnx    # Maia 1300 model
    ├── maia_kdd_1500.onnx    # Maia 1500 model
    ├── maia_kdd_1700.onnx    # Maia 1700 model
    └── maia_kdd_1900.onnx    # Maia 1900 model
```

## Settings Structure

```typescript
interface EngineSettings {
  enabled: boolean;              // Enable/disable analysis
  engineType: 'stockfish' | 'maia';  // Selected engine
  depth: number;                 // Analysis depth (10-20)
  skill: number;                 // Stockfish skill level (0-20)
  multiPv: number;              // Number of lines to analyze
  threads: number;              // Worker threads
  maiaLevel?: 1100 | 1300 | 1500 | 1700 | 1900;  // Maia rating
}
```

## Adding New Engines

To add a new chess engine:

1. **Create Engine Implementation**
   ```typescript
   // src/utils/newEngine.ts
   import { ChessEngine, EngineResult } from './engine';
   
   class NewEngine implements ChessEngine {
     async init(): Promise<void> { /* ... */ }
     isReady(): boolean { /* ... */ }
     getLoadingError(): string | null { /* ... */ }
     async getBestMove(fen: string, depth?: number): Promise<EngineResult> { /* ... */ }
     async getEngineMove(fen: string, skill?: number): Promise<string> { /* ... */ }
     terminate(): void { /* ... */ }
   }
   
   export const newEngine = new NewEngine();
   ```

2. **Update Types**
   ```typescript
   // src/types/index.ts
   export type EngineType = 'stockfish' | 'maia' | 'newengine';
   ```

3. **Register in Engine Manager**
   ```typescript
   // src/utils/engineManager.ts
   import { newEngine } from './newEngine';
   
   async setEngine(engineType: EngineType) {
     if (engineType === 'newengine') {
       this.currentEngine = newEngine;
     }
     // ...
   }
   ```

4. **Update UI**
   ```typescript
   // src/components/GameControls.tsx
   <button onClick={() => setEngineSettings({ engineType: 'newengine' })}>
     New Engine
   </button>
   ```

## Performance Considerations

### Stockfish
- **Initialization**: ~1-2 seconds
- **Analysis**: Very fast (20 depth in <1s)
- **Memory**: ~50MB
- **Best for**: Fast, deep analysis

### Maia
- **Initialization**: ~3-5 seconds (loads ONNX model)
- **Analysis**: Moderate (inference time ~500ms)
- **Memory**: ~100MB (model + runtime)
- **Best for**: Human-like move generation

## Testing

Test engine switching:

```typescript
import { engineManager } from './utils/engineManager';

// Test Stockfish
await engineManager.setEngine('stockfish');
const stockfishMove = await engineManager.getBestMove('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

// Test Maia
await engineManager.setEngine('maia', 1500);
const maiaMove = await engineManager.getBestMove('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
```

## Troubleshooting

### Engine Not Loading
- Check browser console for errors
- Verify model files are in correct location
- Ensure WebAssembly is enabled
- Try different browser

### Slow Performance
- Reduce analysis depth
- Close other tabs
- Try different engine
- Check system resources

### Move Analysis Errors
- Verify FEN string is valid
- Check engine initialization
- Look for timeout issues
- Review browser console

## Future Enhancements

Potential additions:
- Leela Chess Zero (LCZero) support
- Komodo engine integration
- Custom neural network models
- Cloud-based engine analysis
- Multi-engine comparison mode
- Engine tournaments

## License Notes

- **Stockfish**: GNU GPL v3
- **Maia**: Research project, see https://github.com/CSSLab/maia-chess
- **ONNX Runtime Web**: MIT License

Always comply with respective engine licenses when using or distributing.
