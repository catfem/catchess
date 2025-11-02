# Move Label Display - On-Board Label Indicator

## Overview

A visual move quality indicator that appears on top of the chess board in the top-right corner, displaying the label of the most recent move. The label automatically fades out after 2.5 seconds and updates immediately when a new move is made.

## Features

### Visual Feedback
- **Real-time display**: Shows immediately after each move
- **Smooth animations**: Slides in from right, fades out gradually
- **Color-coded**: Each label type has distinctive colors
- **Icon support**: Emoji icons for quick recognition
- **Non-intrusive**: Positioned at top-right, doesn't block gameplay

### Label Types & Styling

| Label | Background | Text | Icon | Description |
|-------|-----------|------|------|-------------|
| **Brilliant** | Gold (#FFD700) | Black | ✨ | Exceptional, position-saving move |
| **Best Move** | Green (#22C55E) | White | ✅ | Engine's top recommendation |
| **Excellent** | Lime (#4ADE80) | White | 👍 | Very slight loss, nearly perfect |
| **Great** | Blue (#3B82F6) | White | ! | Strong move (legacy label) |
| **Good** | Teal (#2DD4BF) | White | ✔ | Acceptable minor loss |
| **Inaccuracy** | Orange (#F97316) | Black | ⚠ | Noticeable slip |
| **Mistake** | Red (#EF4444) | White | ❌ | Major error |
| **Blunder** | Dark Red (#991B1B) | White | 💀 | Decisive/losing error |
| **Missed Win** | Purple (#9333EA) | White | 😢 | Failed to find forced win |
| **Book Move** | Gray (#6B7280) | White | 📘 | Standard opening (hidden) |

**Note**: Book moves are intentionally not displayed to reduce visual noise in the opening.

## Implementation

### Component Structure

```
ChessBoard (container)
├── MoveLabel (floating overlay)
└── Chessboard (react-chessboard)
```

### Files

1. **`frontend/src/components/MoveLabel.tsx`**
   - Main component
   - Handles visibility state
   - Auto-fade timing
   - Label configuration

2. **`frontend/src/components/ChessBoard.tsx`**
   - Integrates MoveLabel
   - Passes current move data
   - Wraps board in relative container

3. **`frontend/src/styles/index.css`**
   - CSS animations (slideInRight, fadeOut)
   - Animation classes

### Props

```typescript
interface MoveLabelProps {
  label: MoveLabel | null;      // Current move's label
  moveNumber?: number;           // Triggers re-render on new move
}
```

### Positioning

```css
position: absolute;
top: 2%;      /* From top of board container */
right: 2%;    /* From right of board container */
z-index: 50;  /* Above board, below modals */
```

## Behavior

### Display Logic

1. **Move is made** → Label appears with slide-in animation
2. **2.5 seconds pass** → Label fades out
3. **New move during fade** → Label updates immediately
4. **Book moves** → Skipped (not displayed)

### Animation Timeline

```
0.0s - 0.4s:  Slide in from right (slideInRight)
0.4s - 2.0s:  Fully visible
2.0s - 2.5s:  Fade out (fadeOut)
2.5s+:        Hidden
```

### State Management

```typescript
const [visible, setVisible] = useState(false);
const [currentLabel, setCurrentLabel] = useState<MoveLabelType | null>(null);
const [fadeKey, setFadeKey] = useState(0);

useEffect(() => {
  if (label && label !== 'book') {
    setCurrentLabel(label);
    setVisible(true);
    setFadeKey(prev => prev + 1);  // Force re-render for animation

    const timer = setTimeout(() => {
      setVisible(false);
    }, 2500);

    return () => clearTimeout(timer);
  }
}, [label, moveNumber]);
```

## CSS Animations

### Slide In Right
```css
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

### Fade Out
```css
@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
```

### Combined Animation
```css
.animate-fade-in-out {
  animation: 
    slideInRight 0.4s ease-out,
    fadeOut 0.5s ease-in 2s forwards;
}
```

## Integration with Move Labeling System

The component automatically receives labels from the move analysis system:

1. **When move is made**:
   - `gameStore.ts` analyzes the move
   - Compares to engine's best move
   - Assigns label based on centipawn/win-probability loss
   - Stores in `moveHistory[].label`

2. **ChessBoard reads label**:
   ```typescript
   const currentMove = moveHistory[currentMoveIndex >= 0 
     ? currentMoveIndex 
     : moveHistory.length - 1];
   const currentLabel = currentMove?.label || null;
   ```

3. **MoveLabel displays it**:
   - If label exists and isn't 'book'
   - Shows with configured colors/icon
   - Auto-fades after 2.5 seconds

## User Experience

### Advantages

✅ **Immediate feedback**: Players know move quality instantly  
✅ **Non-disruptive**: Doesn't block board or pieces  
✅ **Self-dismissing**: Auto-fades, no manual close needed  
✅ **Visually appealing**: Smooth animations, clear colors  
✅ **Consistent**: Always same position, predictable behavior

### Design Decisions

1. **Top-right positioning**: 
   - Natural eye flow after move
   - Doesn't cover most active squares
   - Visible on both board orientations

2. **2.5 second display**:
   - Long enough to read
   - Short enough not to clutter
   - Can be interrupted by new move

3. **Book moves hidden**:
   - Reduces opening noise
   - Focus on tactical phase
   - Book label shown in move list only

4. **No manual dismissal**:
   - Simplifies interaction
   - Prevents accidental clicks
   - Keeps focus on game

## Customization Options

### Easy Modifications

**Change display duration**:
```typescript
// In MoveLabel.tsx, line ~52
const timer = setTimeout(() => {
  setVisible(false);
}, 3000);  // 3 seconds instead of 2.5
```

**Adjust position**:
```typescript
// In MoveLabel.tsx, line ~66-67
style={{
  top: '5%',     // Further from edge
  right: '5%',
}}
```

**Add glow effect** (for brilliant moves):
```typescript
// In labelConfig
brilliant: { 
  bg: '#FFD700', 
  text: '#000', 
  icon: '✨',
  glow: true  // Custom property
},

// In render
style={{
  ...config,
  boxShadow: config.glow ? '0 0 20px rgba(255, 215, 0, 0.8)' : undefined
}}
```

**Change animation speed**:
```css
/* In index.css */
.animate-fade-in-out {
  animation: 
    slideInRight 0.2s ease-out,      /* Faster: 0.2s */
    fadeOut 0.3s ease-in 1.5s forwards;  /* Earlier fade */
}
```

## Testing

### Manual Testing Checklist

- [ ] Label appears after move
- [ ] Correct color for each label type
- [ ] Correct icon for each label type
- [ ] Slides in smoothly from right
- [ ] Fades out after ~2.5 seconds
- [ ] New move updates label immediately
- [ ] Book moves don't show label
- [ ] Position correct at top-right
- [ ] Doesn't block pieces or squares
- [ ] Visible on both board orientations (white/black)
- [ ] Works with navigate forward/back
- [ ] Works with PGN import

### Label Type Tests

Test each label appears correctly:
```
Brilliant: Find a move that saves a lost position
Best: Play engine's recommended move
Excellent: Play a move with <25cp loss
Good: Play a move with 25-50cp loss
Inaccuracy: Play a move with 50-100cp loss
Mistake: Play a move with 100-300cp loss
Blunder: Play a move with >300cp loss
```

## Performance

- **Minimal overhead**: Pure CSS animations
- **No external dependencies**: No framer-motion needed
- **Efficient re-renders**: Key-based animation reset
- **Memory friendly**: Single timer cleanup

## Future Enhancements

Potential improvements:

1. **Click to explain**: Show why move got that label
2. **Sound effects**: Audio feedback for blunders/brilliants
3. **Animation variants**: Different styles for different labels
4. **Configurable position**: User preference (top-left, bottom-right, etc.)
5. **Persist during navigation**: Keep showing label when reviewing
6. **Comparative display**: Show "was X, engine says Y"

## Summary

The move label display provides instant, visual feedback on move quality directly on the board. It's non-intrusive, self-dismissing, and seamlessly integrated with the existing move analysis system. The implementation uses pure CSS animations for smooth performance and requires no external dependencies.

**Key Benefits**:
- ✨ Immediate feedback without checking move list
- 🎯 Always visible, predictable position
- 🎨 Color-coded for quick recognition
- ⚡ Smooth animations enhance experience
- 🎮 Doesn't interrupt gameplay flow
