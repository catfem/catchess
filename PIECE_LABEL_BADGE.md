# Piece Label Badge - On-Square Move Indicator

## Overview

A visual move quality indicator that appears directly on the square where a piece moved to, displaying a small badge icon at the top-right corner of that square. This provides immediate, localized feedback about move quality.

## Features

### Visual Design
- **Badge positioning**: Top-right corner of destination square
- **Size**: 32x32 pixels circular badge
- **Animation**: Pop-in with bounce effect, fade-out after 1.8 seconds
- **Border**: 2px white border for visibility
- **Z-index**: 40 (below top-right label, above pieces)

### Badge Icons & Colors

| Label | Icon | Background | Description |
|-------|------|-----------|-------------|
| **Brilliant** | ✨ | Gold (#FFD700) | Exceptional, position-saving move |
| **Best Move** | ✅ | Green (#22C55E) | Engine's top recommendation |
| **Excellent** | 👍 | Lime (#4ADE80) | Very slight loss, nearly perfect |
| **Great** | ! | Blue (#3B82F6) | Strong move |
| **Good** | ✔ | Teal (#2DD4BF) | Acceptable minor loss |
| **Inaccuracy** | ⚠ | Orange (#F97316) | Noticeable slip |
| **Mistake** | ❌ | Red (#EF4444) | Major error |
| **Blunder** | 💀 | Dark Red (#991B1B) | Decisive/losing error |
| **Missed Win** | 😢 | Purple (#9333EA) | Failed to find forced win |
| **Book Move** | 📘 | Gray (#6B7280) | Standard opening (hidden) |

**Note**: Book moves are intentionally not displayed to reduce visual noise.

## Implementation

### Component Structure

```
ChessBoard (container)
├── MoveLabel (top-right corner)
├── PieceLabelBadge (on-square badge)
└── Chessboard (react-chessboard)
```

### Files

1. **`frontend/src/components/PieceLabelBadge.tsx`**
   - Main badge component
   - Square position calculation
   - Board orientation handling
   - Auto-fade timing

2. **`frontend/src/components/ChessBoard.tsx`**
   - Integrates PieceLabelBadge
   - Passes move destination square
   - Provides board orientation

3. **`frontend/src/styles/index.css`**
   - Badge animations (badgePop, badgeFadeOut)
   - Animation classes

### Props

```typescript
interface PieceLabelBadgeProps {
  label: MoveLabel | null;           // Current move's label
  toSquare: string | null;           // Destination square (e.g., "e4")
  boardOrientation: 'white' | 'black';  // Current board orientation
  moveNumber?: number;                // Triggers re-render
}
```

## Position Calculation

### Square Coordinate System

The chess board is divided into an 8x8 grid:
- Each square is 12.5% of board width/height
- Squares are indexed from 0-7 for both rows and columns

### Conversion Logic

```typescript
function getSquarePosition(square: string, orientation: 'white' | 'black') {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0); // 0-7 (a-h)
  const rank = parseInt(square[1]) - 1; // 0-7 (1-8)
  
  if (orientation === 'white') {
    return {
      col: file,        // a=0, h=7
      row: 7 - rank     // 8=0, 1=7
    };
  } else {
    return {
      col: 7 - file,    // h=0, a=7 (flipped)
      row: rank         // 1=0, 8=7 (flipped)
    };
  }
}
```

### Position Examples

**White's perspective** (normal):
- e4 → column: 4 (e), row: 4 (rank 4 from bottom)
- a1 → column: 0 (a), row: 7 (rank 1 at bottom)
- h8 → column: 7 (h), row: 0 (rank 8 at top)

**Black's perspective** (flipped):
- e4 → column: 3, row: 3 (coordinates inverted)
- a1 → column: 7, row: 0
- h8 → column: 0, row: 7

## Behavior

### Display Timeline

```
0.0s - 0.3s:  Badge pops in with bounce (badgePop)
0.3s - 1.4s:  Badge fully visible
1.4s - 1.8s:  Badge fades out and shrinks (badgeFadeOut)
1.8s+:        Badge hidden
```

### Animation Details

**Pop-in Animation** (0.3s):
```css
@keyframes badgePop {
  0% {
    opacity: 0;
    transform: scale(0.3);      /* Start small */
  }
  50% {
    transform: scale(1.1);      /* Overshoot (bounce) */
  }
  100% {
    opacity: 1;
    transform: scale(1);        /* Settle to normal size */
  }
}
```

**Fade-out Animation** (0.4s, starts at 1.4s):
```css
@keyframes badgeFadeOut {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.8);      /* Shrink while fading */
  }
}
```

### State Management

```typescript
const [visible, setVisible] = useState(false);
const [currentLabel, setCurrentLabel] = useState<MoveLabelType | null>(null);
const [currentSquare, setCurrentSquare] = useState<string | null>(null);
const [badgeKey, setBadgeKey] = useState(0);

useEffect(() => {
  if (label && toSquare && label !== 'book') {
    setCurrentLabel(label);
    setCurrentSquare(toSquare);
    setVisible(true);
    setBadgeKey(prev => prev + 1);  // Force re-animation

    const timer = setTimeout(() => {
      setVisible(false);
    }, 1800);  // 1.8 seconds

    return () => clearTimeout(timer);
  }
}, [label, toSquare, moveNumber]);
```

## Positioning System

### CSS Structure

```tsx
<div 
  className="absolute pointer-events-none z-40"
  style={{
    top: `${row * 12.5}%`,      // Square's vertical position
    left: `${col * 12.5}%`,     // Square's horizontal position
    width: '12.5%',              // One square width
    height: '12.5%',             // One square height
  }}
>
  <div style={{
    top: '5%',                   // 5% from square top
    right: '5%',                 // 5% from square right
    width: '32px',
    height: '32px',
  }}>
    {icon}
  </div>
</div>
```

### Positioning Relative to Board

```
Board (600px × 600px)
├─ Square (75px × 75px, 12.5%)
│  └─ Badge (32px × 32px)
│     └─ Position: top-right corner with 5% margin
```

## Board Orientation Handling

### White's Perspective

```
8  ┌─┬─┬─┬─┬─┬─┬─┬─┐  Row 0
7  ├─┼─┼─┼─┼─┼─┼─┼─┤  Row 1
6  ├─┼─┼─┼─┼─┼─┼─┼─┤  Row 2
5  ├─┼─┼─┼─┼─┼─┼─┼─┤  Row 3
4  ├─┼─┼─┼─┼─┼─┼─┼─┤  Row 4
3  ├─┼─┼─┼─┼─┼─┼─┼─┤  Row 5
2  ├─┼─┼─┼─┼─┼─┼─┼─┤  Row 6
1  └─┴─┴─┴─┴─┴─┴─┴─┘  Row 7
   a b c d e f g h
   Col 0→→→→→→→7
```

### Black's Perspective (Flipped)

```
1  ┌─┬─┬─┬─┬─┬─┬─┬─┐  Row 0
2  ├─┼─┼─┼─┼─┼─┼─┼─┤  Row 1
3  ├─┼─┼─┼─┼─┼─┼─┼─┤  Row 2
4  ├─┼─┼─┼─┼─┼─┼─┼─┤  Row 3
5  ├─┼─┼─┼─┼─┼─┼─┼─┤  Row 4
6  ├─┼─┼─┼─┼─┼─┼─┼─┤  Row 5
7  ├─┼─┼─┼─┼─┼─┼─┼─┤  Row 6
8  └─┴─┴─┴─┴─┴─┴─┴─┘  Row 7
   h g f e d c b a
   Col 0←←←←←←←7
```

## Integration with Move System

### Data Flow

1. **Move made** → `gameStore.ts` analyzes move
2. **Label assigned** → Based on engine comparison
3. **Move stored** → Includes `label` and `to` square
4. **ChessBoard reads**:
   ```typescript
   const currentMove = moveHistory[currentMoveIndex >= 0 
     ? currentMoveIndex 
     : moveHistory.length - 1];
   const currentLabel = currentMove?.label || null;
   const toSquare = currentMove?.to || null;
   ```
5. **PieceLabelBadge displays** → On the `to` square
6. **Auto-fades** → After 1.8 seconds

## Visual Examples

### Blunder on e4

```
  ┌─┬─┬─┬─┬─┬─┬─┬─┐
  ├─┼─┼─┼─┼─┼─┼─┼─┤
  ├─┼─┼─┼─┼─┼─┼─┼─┤
  ├─┼─┼─┼─┼─┼─┼─┼─┤
  ├─┼─┼─┼[💀]┼─┼─┼─┤  ← Blunder badge on e4
  ├─┼─┼─┼─┼─┼─┼─┼─┤
  ├─┼─┼─┼─┼─┼─┼─┼─┤
  └─┴─┴─┴─┴─┴─┴─┴─┘
```

### Brilliant on d5

```
  ┌─┬─┬─┬─┬─┬─┬─┬─┐
  ├─┼─┼─┼─┼─┼─┼─┼─┤
  ├─┼─┼─┼─┼─┼─┼─┼─┤
  ├─┼─┼─┼[✨]┼─┼─┼─┤  ← Brilliant badge on d5
  ├─┼─┼─┼─┼─┼─┼─┼─┤
  ├─┼─┼─┼─┼─┼─┼─┼─┤
  ├─┼─┼─┼─┼─┼─┼─┼─┤
  └─┴─┴─┴─┴─┴─┴─┴─┘
```

## User Experience

### Dual Feedback System

Now players get **two forms of feedback**:

1. **Top-right label**: General, always visible, board-level
   - Good for: Overview, at-a-glance checking
   - Position: Predictable, non-blocking

2. **On-square badge**: Specific, piece-level
   - Good for: Immediate context, "what did I just do?"
   - Position: Exactly where the move was made

### Advantages

✅ **Immediate context**: Badge shows exactly where the evaluated move landed  
✅ **Non-intrusive**: Small badge doesn't block board view  
✅ **Self-dismissing**: Auto-fades, no manual interaction needed  
✅ **Orientation-aware**: Works correctly when board is flipped  
✅ **Complementary**: Works alongside top-right label for dual feedback

## Customization

### Adjust Badge Size

```typescript
// In PieceLabelBadge.tsx
style={{
  width: '40px',    // Larger badge
  height: '40px',
  fontSize: '20px', // Larger icon
}}
```

### Change Display Duration

```typescript
// In PieceLabelBadge.tsx, line ~53
const timer = setTimeout(() => {
  setVisible(false);
}, 2500);  // 2.5 seconds instead of 1.8
```

### Adjust Badge Position

```typescript
// In PieceLabelBadge.tsx
style={{
  top: '2%',     // Closer to top edge
  right: '2%',   // Closer to right edge
}}
```

### Add Glow Effect for Brilliant Moves

```typescript
// In labelConfig
brilliant: { 
  icon: '✨', 
  bg: '#FFD700',
  glow: '0 0 15px rgba(255, 215, 0, 0.8)'
}

// In render
style={{
  ...baseStyle,
  boxShadow: config.glow || baseStyle.boxShadow
}}
```

## Performance

- **Minimal overhead**: Pure CSS animations
- **Efficient positioning**: Simple percentage-based layout
- **Clean state**: Proper timer cleanup
- **Responsive**: Scales with board size

## Testing Checklist

### Basic Functionality
- [ ] Badge appears on destination square
- [ ] Correct icon for each label type
- [ ] Correct color for each label type
- [ ] Badge positioned at top-right of square
- [ ] Badge fades out after ~1.8 seconds

### Orientation Testing
- [ ] Badge correct position when board is white-oriented
- [ ] Badge correct position when board is black-oriented
- [ ] Badge position updates when board flips

### Edge Cases
- [ ] Badge on corner squares (a1, a8, h1, h8)
- [ ] Badge on edge squares
- [ ] Badge on center squares
- [ ] Multiple moves in quick succession
- [ ] Book moves don't show badge

### Integration
- [ ] Works with top-right label simultaneously
- [ ] Doesn't interfere with piece dragging
- [ ] Doesn't block square highlighting
- [ ] Works with game navigation (forward/back)
- [ ] Works with PGN import

## Browser Compatibility

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

All modern browsers support:
- CSS transforms
- CSS animations
- Absolute positioning with percentages
- Emoji rendering

## Comparison with Top-Right Label

| Feature | Top-Right Label | On-Square Badge |
|---------|----------------|-----------------|
| **Location** | Fixed (top-right corner) | Dynamic (destination square) |
| **Duration** | 2.5 seconds | 1.8 seconds |
| **Size** | Larger, text + icon | Smaller, icon only |
| **Purpose** | General awareness | Specific context |
| **Z-index** | 50 (highest) | 40 (below label) |
| **Animation** | Slide in + fade | Pop + fade |

## Future Enhancements

Potential improvements:

1. **Click interaction**: Click badge to see move analysis
2. **Multiple badges**: Show badges for both players
3. **Badge history**: Keep badges visible longer when reviewing
4. **Shake animation**: For blunders (add emphasis)
5. **Glow effect**: For brilliant moves
6. **SVG icons**: Replace emojis for consistent look
7. **Size scaling**: Based on board size
8. **Sound effects**: Audio feedback for special moves

## Summary

The piece label badge provides immediate, localized feedback on move quality directly on the board. It complements the top-right corner label by showing exactly where the evaluated move was made. The implementation handles board orientation correctly and uses smooth animations for a polished user experience.

**Key Benefits**:
- 🎯 Shows feedback exactly where move was made
- ⚡ Quick pop-in animation for immediate feedback
- 🎨 Color-coded icons for instant recognition
- 🔄 Orientation-aware positioning
- 👁 Non-intrusive, auto-dismissing design
