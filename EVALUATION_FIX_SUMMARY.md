# Evaluation Display Fix - White Perspective Consistency

## Problem

The evaluation display was inconsistent because:

1. **Stockfish behavior**: Stockfish returns evaluations from the **side to move** perspective
   - When White is to move: positive score = White advantage
   - When Black is to move: positive score = Black advantage (NOT White!)

2. **Previous implementation**: The code incorrectly assumed Stockfish always returned evaluations from White's perspective

3. **Result**: When navigating through moves, the evaluation would flip sign incorrectly depending on whose turn it was, making it confusing to track position advantages

## Solution

Modified `frontend/src/utils/stockfish.ts` in the `getBestMove()` function to:

1. Parse the FEN string to determine whose turn it is (second field: 'w' or 'b')
2. When it's Black's turn, invert the evaluation sign (multiply by -1)
3. Return evaluations **consistently from White's perspective**

### Code Changes

```typescript
// Determine whose turn it is from the FEN (second field)
const fenParts = fen.split(' ');
const sideToMove = fenParts[1]; // 'w' or 'b'

// In the callback processing Stockfish output:
if (cpMatch) {
  cp = parseInt(cpMatch[1]);
  // If it's Black's turn, invert the sign to get White's perspective
  if (sideToMove === 'b') {
    cp = -cp;
  }
  evaluation = cp / 100;
}

if (mateMatch) {
  mate = parseInt(mateMatch[1]);
  evaluation = mate > 0 ? 100 : -100;
  if (sideToMove === 'b') {
    evaluation = -evaluation;
    mate = -mate; // Also invert mate value for consistency
  }
}
```

## Impact

### What Now Works Correctly

1. **Evaluation Display**: All evaluations shown in the UI are from White's perspective
   - Positive values always mean White is better
   - Negative values always mean Black is better

2. **Evaluation Bar**: The vertical bar correctly shows White advantage growing upward and Black advantage growing downward

3. **Move List**: Evaluations next to each move are consistent regardless of whose turn it was

4. **Analysis Panel**: The evaluation display in the analysis panel shows consistent values

5. **Move Labels**: Since `labelMove()` already expected evaluations from White's perspective, move quality labels (best, good, inaccuracy, mistake, blunder) continue to work correctly

### Testing

Created test script `test_evaluation.js` that validates the conversion logic:
- ✓ All 6 test cases pass
- ✓ Confirms proper sign inversion when Black is to move
- ✓ Confirms no change when White is to move
- ✓ Confirms equal positions remain 0.00 regardless of turn

### Files Modified

- `frontend/src/utils/stockfish.ts` - Added FEN parsing and conditional sign inversion

### Files That Automatically Work Correctly (no changes needed)

- `frontend/src/components/EvaluationBar.tsx` - Reads from `move.eval`
- `frontend/src/components/MoveList.tsx` - Displays `move.eval` values
- `frontend/src/components/EvaluationGraph.tsx` - Plots `move.eval` values
- `frontend/src/App.tsx` - Shows evaluation in analysis panel
- `frontend/src/store/gameStore.ts` - Stores evaluations from `getBestMove()`

All these components now receive consistent White-perspective evaluations automatically.

## Verification

To verify the fix works:

1. Make moves as White - evaluation should show White's advantage growing with good moves
2. Make moves as Black - evaluation should show Black's advantage (negative values) growing with good moves
3. Navigate backward and forward through moves - evaluation should remain consistent
4. Import and analyze a PGN - evaluations should be consistent throughout the game

The evaluation should always reflect: **Positive = White better, Negative = Black better**
