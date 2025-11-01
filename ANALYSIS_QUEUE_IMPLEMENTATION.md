# Analysis Queue Implementation Guide

## Overview
This document provides a complete implementation guide for adding queue-based analysis, piece label overlays, and enhanced UI improvements.

---

## Part 1: Queue-Based Analysis System

### 1.1 Store State Extensions

Add to `gameStore.ts`:

```typescript
interface GameStore {
  // ... existing fields
  analysisQueue: number[]; // Move indices waiting for analysis
  processingAnalysis: boolean; // Is queue being processed
  labelPreferences: {
    showOnBoard: boolean;
    selectedLabels: MoveLabel[];
  };
}
```

### 1.2 Queue Processing Logic

```typescript
// Add to gameStore
processAnalysisQueue: async () => {
  const { analysisQueue, moveHistory, processingAnalysis } = get();
  
  if (processingAnalysis || analysisQueue.length === 0) {
    return;
  }
  
  set({ processingAnalysis: true });
  
  while (analysisQueue.length > 0) {
    const moveIndex = analysisQueue[0];
    const move = moveHistory[moveIndex];
    
    if (move && !move.depth) {
      // Analyze this move
      const fenBefore = moveIndex === 0 
        ? 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
        : moveHistory[moveIndex - 1].fen;
      
      const beforeResult = await stockfishEngine.getBestMove(fenBefore, 18);
      const afterResult = await stockfishEngine.getBestMove(move.fen, 18);
      
      // Evaluate based on comprehensive factors
      const evaluation = {
        material: calculateMaterialBalance(move.fen),
        kingS safety: evaluateKingSafety(move.fen),
        pieceActivity: evaluatePieceActivity(move.fen),
        pawnStructure: evaluatePawnStructure(move.fen),
        centerControl: evaluateCenterControl(move.fen),
      };
      
      const label = labelMove(
        move.san,
        beforeResult.bestMove || '',
        beforeResult.evaluation,
        afterResult.evaluation,
        move.color
      );
      
      // Update move with analysis
      const updatedHistory = [...get().moveHistory];
      updatedHistory[moveIndex] = {
        ...move,
        eval: afterResult.evaluation,
        label,
        depth: 18,
        bestMove: beforeResult.bestMove,
      };
      
      set({ moveHistory: updatedHistory });
    }
    
    // Remove from queue
    set({ analysisQueue: analysisQueue.slice(1) });
  }
  
  set({ processingAnalysis: false });
},

// Add move to queue
queueMoveForAnalysis: (moveIndex: number) => {
  const { analysisQueue } = get();
  if (!analysisQueue.includes(moveIndex)) {
    set({ analysisQueue: [...analysisQueue, moveIndex] });
    // Start processing if not already running
    setTimeout(() => get().processAnalysisQueue(), 0);
  }
},
```

### 1.3 Enhanced Evaluation Functions

```typescript
// utils/evaluation.ts
export const calculateMaterialBalance = (fen: string): number => {
  const chess = new Chess(fen);
  const pieceValues = {
    p: 1, n: 3, b: 3, r: 5, q: 9, k: 0,
  };
  
  let balance = 0;
  for (let sq = 0; sq < 64; sq++) {
    const square = ['a8','b8','c8','d8','e8','f8','g8','h8',
                    'a7','b7','c7','d7','e7','f7','g7','h7',
                    // ... all squares
                   ][sq];
    const piece = chess.get(square as any);
    if (piece) {
      const value = pieceValues[piece.type as keyof typeof pieceValues];
      balance += piece.color === 'w' ? value : -value;
    }
  }
  return balance;
};

export const evaluateKingSafety = (fen: string): number => {
  const chess = new Chess(fen);
  let safety = 0;
  
  // Check if king is castled
  // Check pawn shield
  // Check attackers near king
  // Penalize exposed king
  
  return safety;
};

export const evaluatePieceActivity = (fen: string): number => {
  const chess = new Chess(fen);
  let activity = 0;
  
  // Count possible moves for each piece
  // Bonus for pieces on good squares
  // Penalty for trapped pieces
  
  return activity;
};

export const evaluatePawnStructure = (fen: string): number => {
  let structure = 0;
  
  // Penalty for doubled pawns
  // Penalty for isolated pawns
  // Bonus for passed pawns
  // Bonus for connected pawns
  
  return structure;
};

export const evaluateCenterControl = (fen: string): number => {
  const chess = new Chess(fen);
  const centerSquares = ['d4', 'e4', 'd5', 'e5'];
  const extendedCenter = ['c3', 'd3', 'e3', 'f3', 
                          'c4', 'f4', 
                          'c5', 'f5', 
                          'c6', 'd6', 'e6', 'f6'];
  
  let control = 0;
  
  // Count pieces attacking center
  // Bonus for pawns in center
  
  return control;
};
```

---

## Part 2: Piece Label Overlays

### 2.1 Create Label Overlay Component

```typescript
// components/PieceLabelOverlay.tsx
import { useGameStore } from '../store/gameStore';
import { getMoveIcon, getMoveColor } from '../utils/stockfish';

export function PieceLabelOverlay() {
  const { moveHistory, labelPreferences, currentMoveIndex } = useGameStore();
  
  if (!labelPreferences.showOnBoard || moveHistory.length === 0) {
    return null;
  }
  
  // Get current board position
  const displayIndex = currentMoveIndex >= 0 
    ? currentMoveIndex 
    : moveHistory.length - 1;
  
  const move = moveHistory[displayIndex];
  
  if (!move || !labelPreferences.selectedLabels.includes(move.label)) {
    return null;
  }
  
  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {/* Position label at move destination square */}
      <div 
        className="absolute animate-fade-in"
        style={{
          // Calculate position based on move.to square
          top: `${Math.floor('abcdefgh'.indexOf(move.to[0]) / 8) * 12.5}%`,
          left: `${('12345678'.indexOf(move.to[1])) * 12.5}%`,
        }}
      >
        <div 
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg"
          style={{
            backgroundColor: getMoveColor(move.label),
            color: 'white',
          }}
        >
          {getMoveIcon(move.label)}
        </div>
      </div>
    </div>
  );
}
```

### 2.2 Label Preference Controls

```typescript
// In GameControls.tsx, add:
<div className="bg-[#312e2b] rounded-xl p-4 shadow-lg">
  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-3">
    Label Display
  </h3>
  
  <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#3a3633] cursor-pointer transition-colors">
    <input
      type="checkbox"
      checked={labelPreferences.showOnBoard}
      onChange={(e) => setLabelPreferences({ showOnBoard: e.target.checked })}
      className="w-4 h-4 rounded"
    />
    <span className="text-sm text-gray-200">Show labels on board</span>
  </label>
  
  <div className="mt-3 space-y-1">
    {['brilliant', 'great', 'best', 'excellent', 'book', 'good', 'inaccuracy', 'mistake', 'miss', 'blunder'].map((label) => (
      <label key={label} className="flex items-center gap-2 p-1 text-xs">
        <input
          type="checkbox"
          checked={labelPreferences.selectedLabels.includes(label)}
          onChange={(e) => toggleLabel(label)}
        />
        <span style={{ color: getMoveColor(label) }}>
          {getMoveIcon(label)} {label}
        </span>
      </label>
    ))}
  </div>
</div>
```

---

## Part 3: Pale Color Palette

### 3.1 Update Button Colors

Replace existing button styles:

```typescript
// OLD: bg-blue-600
// NEW: bg-blue-400/70

// OLD: bg-green-600
// NEW: bg-green-400/70

// OLD: bg-red-600  
// NEW: bg-red-400/70

// OLD: bg-purple-600
// NEW: bg-purple-400/70
```

### 3.2 Pale Color Definitions

```css
/* Add to index.css */
:root {
  --pale-blue: rgba(96, 165, 250, 0.7);
  --pale-green: rgba(74, 222, 128, 0.7);
  --pale-red: rgba(248, 113, 113, 0.7);
  --pale-purple: rgba(192, 132, 252, 0.7);
  --pale-yellow: rgba(250, 204, 21, 0.7);
}
```

---

## Part 4: Collapsible Panels with Animations

### 4.1 Add Collapse State

```typescript
// In GameControls.tsx
const [collapsed, setCollapsed] = useState({
  gameMode: false,
  engine: false,
  analysis: false,
  labels: false,
  actions: false,
});

const toggleSection = (section: keyof typeof collapsed) => {
  setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));
};
```

### 4.2 Collapsible Section Component

```typescript
interface CollapsibleSectionProps {
  title: string;
  isCollapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function CollapsibleSection({ title, isCollapsed, onToggle, children }: CollapsibleSectionProps) {
  return (
    <div className="bg-[#312e2b] rounded-xl shadow-lg overflow-hidden transition-all duration-300">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-[#3a3633] transition-colors"
      >
        <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
          {title}
        </h3>
        <svg 
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
            isCollapsed ? '' : 'rotate-180'
          }`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      <div 
        className={`transition-all duration-300 ease-in-out ${
          isCollapsed 
            ? 'max-h-0 opacity-0' 
            : 'max-h-[1000px] opacity-100'
        }`}
      >
        <div className="p-4 pt-0">
          {children}
        </div>
      </div>
    </div>
  );
}
```

### 4.3 Animation CSS

```css
/* Add to index.css */
@layer components {
  .animate-fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }
  
  .animate-slide-down {
    animation: slideDown 0.3s ease-in-out;
  }
  
  .animate-slide-up {
    animation: slideUp 0.3s ease-in-out;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideDown {
  from {
    max-height: 0;
    opacity: 0;
  }
  to {
    max-height: 1000px;
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    max-height: 1000px;
    opacity: 1;
  }
  to {
    max-height: 0;
    opacity: 0;
  }
}
```

---

## Part 5: Complete Integration Example

### 5.1 Updated GameControls with All Features

```typescript
export function GameControls() {
  const {
    gameMode,
    setGameMode,
    resetGame,
    undoMove,
    analyzePosition,
    isAnalyzing,
    chess,
    engineSettings,
    setEngineSettings,
    labelPreferences,
    setLabelPreferences,
    analysisQueue,
  } = useGameStore();
  
  const [collapsed, setCollapsed] = useState({
    gameMode: false,
    engine: false,
    analysis: false,
    labels: false,
    actions: false,
  });
  
  return (
    <div className="space-y-4">
      {/* Game Mode Section */}
      <CollapsibleSection
        title="Game Mode"
        isCollapsed={collapsed.gameMode}
        onToggle={() => setCollapsed(prev => ({ ...prev, gameMode: !prev.gameMode }))}
      >
        {/* Game mode buttons with pale colors */}
        <div className="grid grid-cols-2 gap-2">
          {modes.map((mode) => (
            <button
              key={mode.value}
              onClick={() => setGameMode(mode.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                gameMode === mode.value
                  ? 'bg-blue-400/70 text-white shadow-lg'
                  : 'bg-[#2b2926] text-gray-300 hover:bg-[#3a3633] border border-gray-700'
              }`}
            >
              {/* ... */}
            </button>
          ))}
        </div>
      </CollapsibleSection>
      
      {/* Analysis Queue Status */}
      {analysisQueue.length > 0 && (
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-blue-300">
              Analyzing: {analysisQueue.length} moves in queue
            </span>
          </div>
        </div>
      )}
      
      {/* Other sections... */}
    </div>
  );
}
```

---

## Part 6: Implementation Checklist

### Phase 1: Queue System
- [ ] Add queue state to store
- [ ] Implement processAnalysisQueue function
- [ ] Add queueMoveForAnalysis function
- [ ] Update makeMove to use queue
- [ ] Add queue status indicator

### Phase 2: Enhanced Evaluation
- [ ] Implement calculateMaterialBalance
- [ ] Implement evaluateKingSafety
- [ ] Implement evaluatePieceActivity
- [ ] Implement evaluatePawnStructure
- [ ] Implement evaluateCenterControl
- [ ] Integrate into move labeling

### Phase 3: Label Overlays
- [ ] Create PieceLabelOverlay component
- [ ] Add label preferences to store
- [ ] Integrate with board display
- [ ] Add toggle controls
- [ ] Test positioning

### Phase 4: Pale Colors
- [ ] Update all button styles
- [ ] Add pale color variables
- [ ] Test contrast/readability
- [ ] Update hover states

### Phase 5: Collapsible Panels
- [ ] Create CollapsibleSection component
- [ ] Add collapse state management
- [ ] Implement animations
- [ ] Update all control panels
- [ ] Test transitions

### Phase 6: Testing
- [ ] Test queue with rapid moves
- [ ] Test label display accuracy
- [ ] Test panel animations
- [ ] Test responsive behavior
- [ ] Performance testing

---

## Summary

This implementation provides:

1. **Queue-Based Analysis**: Moves are analyzed sequentially without blocking UI
2. **Enhanced Evaluation**: Comprehensive factors (King Safety, Material, Activity, Pawn Structure, Center Control)
3. **Visual Labels**: Display evaluation labels on board pieces
4. **Pale Colors**: Softer, more pleasant button colors
5. **Animated Panels**: Smooth collapse/expand with animations

**Estimated Implementation Time**: 8-12 hours for complete implementation and testing

**Priority Order**:
1. Queue system (critical for performance)
2. Pale colors (quick win)
3. Collapsible panels (UX improvement)
4. Enhanced evaluation (accuracy)
5. Label overlays (nice-to-have)
