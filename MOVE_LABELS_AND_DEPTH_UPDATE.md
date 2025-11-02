# Chess Move Labels and Max Depth Implementation

## Summary
Updated the chess move labeling system to match industry-standard criteria and increased the maximum analysis depth to 99.

## Changes Made

### 1. Updated Move Labeling Algorithm (`frontend/src/utils/stockfish.ts`)

Implemented comprehensive move labeling based on centipawn evaluation loss:

| Label | Criteria (CP Loss) | Description |
|-------|-------------------|-------------|
| **Best** | 0 (exact match) | Matches engine's top move |
| **Brilliant** | < -100 (gain) | Exceptional tactical move that gains significant advantage |
| **Excellent** | ≤ 20 | Very strong, almost perfect (≤ 0.2 pawn) |
| **Great** | ≤ 50 | Very good move (≤ 0.5 pawn) |
| **Good** | < 100 | Solid move, slightly suboptimal |
| **Inaccuracy** | 50-100 | Small deviation (0.5-1.0 pawn) |
| **Mistake** | 100-200 | Clearly bad move (1.0-2.0 pawns) |
| **Blunder** | > 200 | Major error (> 2.0 pawns) |
| **Book** | N/A | Opening theory move |

### 2. Increased Max Depth to 99

Updated the following files:

#### Engine Configuration
- **`frontend/src/store/gameStore.ts`**: Changed default depth from 18 to 99
- **`frontend/src/utils/stockfish.ts`**: Changed getBestMove default depth parameter from 20 to 99

#### UI Components
- **`frontend/src/components/GameControls.tsx`**: Updated depth slider range from 10-20 to 10-99

#### Documentation
- **`README.md`**: Updated all references to depth (18/20 → 99), updated move labeling table, and updated algorithm description

### 3. Improved Move Labeling Logic

The `labelMove()` function now:
- Properly calculates evaluation loss from the player's perspective
- Handles color-based evaluation correctly (White/Black)
- Detects brilliant moves (non-best moves that gain significant advantage)
- Uses industry-standard thresholds matching chess analysis platforms

## How Move Labeling Works

1. **Evaluation Perspective**: All evaluations are from White's perspective
   - Positive values = White advantage
   - Negative values = Black advantage

2. **Evaluation Loss Calculation**:
   ```typescript
   const colorMultiplier = playerColor === 'w' ? 1 : -1;
   const evalChange = (currentEval - prevEval) * colorMultiplier;
   const evalLossCp = -evalChange * 100; // In centipawns
   ```

3. **Label Assignment**: Based on evalLossCp (evaluation loss in centipawns)

## Examples

### Example 1: Excellent Move
- Previous eval: +1.50
- After move: +1.30
- Loss: 0.20 pawns (20 cp)
- **Label: Excellent**

### Example 2: Mistake
- Previous eval: +2.00
- After move: +0.80
- Loss: 1.20 pawns (120 cp)
- **Label: Mistake**

### Example 3: Brilliant Move
- Previous eval: +0.50
- After move: +2.00 (sacrifice that leads to winning position)
- Gain: 1.50 pawns (150 cp)
- **Label: Brilliant**

## Testing

To test the changes:

1. Start the development server: `npm run dev`
2. Play a game or analyze a PGN
3. Verify move labels appear correctly based on evaluation
4. Check that depth slider now goes up to 99
5. Verify analysis depth indicator shows up to 99

## Technical Details

### Evaluation Handling
- Stockfish returns evaluations from White's perspective
- For Black moves, we flip the perspective using a color multiplier
- Evaluation loss is calculated relative to the player who made the move

### Brilliant Move Detection
Brilliant moves are detected when:
- The move is NOT the engine's best move
- The move results in a significant evaluation gain (> 100 cp)
- This typically indicates a tactical shot or brilliant sacrifice

### Performance Considerations
- Depth 99 provides extremely deep analysis but takes longer
- Users can adjust depth via slider (10-99) based on preference
- Analysis is queued and processed sequentially to avoid overwhelming the engine

## Files Modified

1. `frontend/src/store/gameStore.ts` - Updated default depth
2. `frontend/src/utils/stockfish.ts` - Updated labelMove() function and default depth
3. `frontend/src/components/GameControls.tsx` - Updated depth slider range
4. `README.md` - Updated documentation

## Compatibility

- All existing game modes (vs Engine, Analyze, PvP) work with the new labeling system
- Backward compatible with existing games and PGN analysis
- UI displays depth dynamically in the move list
