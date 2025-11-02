# Enhanced Move Labeling System

## Overview

The move labeling system evaluates the quality of each move played in a chess game by comparing it to the engine's recommended best move. This implementation follows industry-standard thresholds and includes sophisticated detection for special cases like brilliant moves and missed opportunities.

## Architecture

### Core Components

1. **Evaluation Perspective** (`stockfish.ts` - `getBestMove()`)
   - Converts all Stockfish evaluations to White's perspective
   - Handles the fact that Stockfish returns evaluations from the side-to-move perspective
   - Ensures consistency across all UI components

2. **Move Classification** (`stockfish.ts` - `labelMove()`)
   - Calculates evaluation loss from the player's perspective
   - Uses both centipawn loss and win probability for scale-invariant behavior
   - Applies industry-standard thresholds for move quality

3. **Visual Representation** 
   - Color-coded move labels in the move list
   - Icons representing move quality
   - Evaluation display showing consistent White-perspective values

## Move Label Categories

### Positive Labels (Good Moves)

| Label | Icon | Threshold | Description |
|-------|------|-----------|-------------|
| **Brilliant** | ‼ | Special detection | Saves a difficult/losing position; finds deep tactical resources |
| **Best** | ✓ | <10 cp loss | Matches engine's top recommendation |
| **Excellent** | ⚡ | 10-25 cp loss | Maintains evaluation with minimal loss |
| **Good** | ○ | 25-50 cp loss | Solid move with acceptable minor loss |

### Neutral Labels

| Label | Icon | Description |
|-------|------|-------------|
| **Book** | 📖 | Standard opening move from book/database |

### Negative Labels (Mistakes)

| Label | Icon | Threshold | Description |
|-------|------|-----------|-------------|
| **Inaccuracy** | ?! | 50-100 cp loss | Noticeable positional or tactical slip |
| **Mistake** | ? | 100-300 cp loss | Major error; significant evaluation change |
| **Blunder** | ?? | ≥300 cp loss | Decisive error; losing move |
| **Miss** | ⊘ | Special detection | Missed forced win or forced draw |

## Calculation Methodology

### 1. Perspective Conversion

All evaluations are stored from **White's perspective**:
- Positive values = White has advantage
- Negative values = Black has advantage

When evaluating a move, we convert to the player's perspective:
```typescript
const colorMultiplier = playerColor === 'w' ? 1 : -1;
const E_after_played = currentEval * colorMultiplier;
const E_before = prevEval * colorMultiplier;
```

### 2. Centipawn Loss Calculation

```typescript
const evalChange = E_after_played - E_before;
const deltaCp = evalChange < 0 ? -evalChange * 100 : 0;
```

- If `evalChange < 0`: position worsened → calculate loss
- If `evalChange >= 0`: position improved → no loss

### 3. Win Probability Loss (Scale-Invariant)

Uses logistic regression to convert centipawns to win probability:

```typescript
function cpToWinProbability(cp: number): number {
  const k = 0.004;  // Empirically fitted constant
  return 1 / (1 + Math.exp(-k * cp));
}

const P_before = cpToWinProbability(E_before * 100);
const P_played = cpToWinProbability(E_after_played * 100);
const deltaP = P_before > P_played ? P_before - P_played : 0;
```

This provides more accurate labeling in extreme positions where centipawn differences are less meaningful.

### 4. Dual-Threshold System

Labels are assigned using **whichever threshold is more lenient**:

```typescript
if (deltaP >= 0.35 || deltaCp >= 300) {
  return 'blunder';
}
```

This prevents over-penalization in winning/losing positions where centipawn changes are less significant.

## Special Detection Rules

### Brilliant Moves

A move is labeled "brilliant" if:

1. **Saves a lost position**: 
   - Position was losing (E_before < -1.5)
   - Move brings position to near-equal (E_after_played >= -0.5)
   - With minimal loss (deltaCp < 25)

2. **Only saving move in mate threat**:
   - Playing the engine's best move
   - Saves from losing position (E_before < -2.0)
   - Achieves at least equal position (E_after_played >= 0)

### Missed Opportunities

Detected in positions with mate scores (|eval| >= 90):

1. **Missed forced mate**:
   - Had winning mate (E_before >= 9.0)
   - Lost the advantage (E_after_played < 3.0)

2. **Lost a forced mate**:
   - Had winning mate (E_before >= 9.0)
   - Position now losing (E_after_played < 0)

3. **Missed saving draw**:
   - Position was drawable (E_before > -3.0 && < 0.5)
   - Now losing (E_after_played < -2.0)

## Threshold Reference Table

### Centipawn Loss Thresholds

| Label | Min CP Loss | Max CP Loss |
|-------|-------------|-------------|
| Best | 0 | 9 |
| Excellent | 10 | 24 |
| Good | 25 | 49 |
| Inaccuracy | 50 | 99 |
| Mistake | 100 | 299 |
| Blunder | 300 | ∞ |

### Win Probability Loss Thresholds

| Label | Min ΔP | Max ΔP |
|-------|--------|--------|
| Best | 0.00 | 0.019 |
| Excellent | 0.02 | 0.049 |
| Good | 0.05 | 0.099 |
| Inaccuracy | 0.10 | 0.199 |
| Mistake | 0.20 | 0.349 |
| Blunder | 0.35 | 1.00 |

## Implementation Details

### Integration Points

1. **Real-time Analysis** (`gameStore.ts` - `processAnalysisQueue()`)
   - Queues moves for analysis as they're played
   - Analyzes sequentially to avoid overloading Stockfish
   - Updates move history with labels

2. **PGN Import & Analysis** (`gameStore.ts` - `analyzeGame()`)
   - Analyzes complete games from PGN
   - Provides move-by-move evaluation and labeling
   - Supports depth configuration

3. **Display Components**
   - `MoveList.tsx`: Shows labeled moves with icons and colors
   - `EvaluationBar.tsx`: Visual bar showing position advantage
   - `App.tsx`: Analysis panel with detailed evaluation

### Performance Considerations

- Analysis runs at configurable depth (default: 18)
- Queue-based processing prevents UI blocking
- Sequential analysis ensures proper eval comparison
- Opening moves can use book detection (≤20 moves)

## Testing

The system includes comprehensive test suites:

- `test_evaluation.js`: Validates perspective conversion
- `test_move_labels.js`: Validates label classification logic

Run tests:
```bash
node test_evaluation.js
node test_move_labels.js
```

## Future Enhancements

Potential improvements:
- ECO/Polyglot book integration for opening detection
- Multi-PV analysis for alternative move suggestions
- Time-based evaluation (considering time pressure)
- Position-type specific thresholds (tactical vs positional)
- Neural network evaluation integration

## References

- Stockfish evaluation conventions
- Lichess move classification system
- Chess.com accuracy ratings
- FIDE rating performance calculations
