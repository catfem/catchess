# 🧪 Testing Guide

Comprehensive testing guide for CatChess.

## Manual Testing Checklist

### 🎮 Game Functionality

#### Basic Chess Rules
- [ ] Pieces move according to chess rules
- [ ] Illegal moves are prevented
- [ ] Castling works (both kingside and queenside)
- [ ] En passant capture works
- [ ] Pawn promotion works (all piece types)
- [ ] Check detection works
- [ ] Checkmate detection works
- [ ] Stalemate detection works
- [ ] Draw by insufficient material works
- [ ] Draw by repetition (if implemented)

#### Game Controls
- [ ] New Game button resets the board
- [ ] Undo button works correctly
- [ ] Move navigation works (if implemented)
- [ ] Flip board works (if implemented)

### 🤖 Engine Play

#### vs Stockfish Mode
- [ ] Can select engine difficulty (0-20)
- [ ] Engine makes valid moves
- [ ] Engine responds in reasonable time (< 2 sec)
- [ ] Lower skill makes weaker moves
- [ ] Higher skill makes stronger moves
- [ ] Can play as White
- [ ] Can play as Black (if implemented)
- [ ] Game ends properly (checkmate/draw)

#### Engine Analysis
- [ ] Analyze button triggers analysis
- [ ] Evaluation displays correctly
- [ ] Best move is shown
- [ ] Analysis completes in reasonable time
- [ ] Can analyze mid-game
- [ ] Can analyze end-game

### 👥 Multiplayer

#### Local PvP
- [ ] Two players can alternate moves
- [ ] Turns are enforced correctly
- [ ] Game state persists
- [ ] Can undo moves
- [ ] Game ends properly

#### Online PvP
- [ ] Can create a room
- [ ] Room code is generated
- [ ] Can copy room link
- [ ] Can join a room with code
- [ ] Second player sees game state
- [ ] Moves sync in real-time
- [ ] Both players can see moves
- [ ] Disconnect handling works
- [ ] Room expires after timeout

### 📊 Analysis Features

#### Move Labeling
- [ ] Brilliant moves labeled correctly (🟩)
- [ ] Great moves labeled correctly (🟦)
- [ ] Best moves labeled correctly (⚪)
- [ ] Book moves labeled correctly (🟧)
- [ ] Mistakes labeled correctly (🟧)
- [ ] Blunders labeled correctly (🟥)
- [ ] Labels match evaluation logic

#### Evaluation Display
- [ ] Evaluation bar shows correct position
- [ ] Bar updates on each move
- [ ] Centipawn value displays correctly
- [ ] Mate scores show correctly (M5, M-3, etc.)
- [ ] Evaluation graph displays
- [ ] Graph updates with each move
- [ ] Graph axes are labeled correctly

#### PGN Import/Export
- [ ] Can open PGN import dialog
- [ ] Can paste valid PGN
- [ ] PGN imports correctly
- [ ] Invalid PGN shows error
- [ ] Can analyze imported game
- [ ] Can export current game
- [ ] Exported PGN is valid

### 🎨 UI/UX

#### Theme
- [ ] Dark mode toggle works
- [ ] Light mode toggle works
- [ ] Theme persists on reload
- [ ] All components respect theme
- [ ] Colors are readable in both modes
- [ ] Board colors change with theme

#### Responsive Design
- [ ] Desktop layout looks good (1920x1080)
- [ ] Laptop layout looks good (1366x768)
- [ ] Tablet portrait works (768x1024)
- [ ] Tablet landscape works (1024x768)
- [ ] Mobile portrait works (375x667)
- [ ] Mobile landscape works (667x375)
- [ ] Board scales appropriately
- [ ] Sidebars stack on mobile
- [ ] Touch controls work on mobile

#### Accessibility
- [ ] Keyboard navigation works
- [ ] Tab order is logical
- [ ] Focus indicators visible
- [ ] Color contrast is sufficient
- [ ] Screen reader compatible (if implemented)
- [ ] Works without mouse

### ⚡ Performance

#### Load Time
- [ ] Initial load < 3 seconds
- [ ] Board renders immediately
- [ ] No visible lag when moving pieces
- [ ] Smooth animations
- [ ] No jank when scrolling

#### Engine Performance
- [ ] Analysis completes in reasonable time
- [ ] No UI freezing during analysis
- [ ] Web Worker doesn't block UI
- [ ] Memory usage is reasonable
- [ ] No memory leaks

#### Online Performance
- [ ] WebSocket connects quickly
- [ ] Moves sync in < 100ms
- [ ] No lag between moves
- [ ] Reconnection works
- [ ] Handles slow connections

## Browser Testing

Test on multiple browsers:

### Desktop
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest, macOS only)
- [ ] Edge (latest)

### Mobile
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)
- [ ] Firefox Mobile (Android)
- [ ] Samsung Internet (Android)

### Testing Checklist per Browser
- [ ] Chess board displays correctly
- [ ] Drag and drop works
- [ ] Touch controls work (mobile)
- [ ] WebSocket connects
- [ ] Stockfish loads
- [ ] Styles render correctly
- [ ] No console errors

## API Testing

### REST Endpoints

#### GET /health
```bash
curl http://localhost:3001/health
# Expected: {"status":"ok","message":"CatChess Backend API"}
```

#### POST /api/rooms/create
```bash
curl -X POST http://localhost:3001/api/rooms/create
# Expected: {"roomId":"abc123","success":true}
```

#### POST /api/rooms/:roomId/join
```bash
curl -X POST http://localhost:3001/api/rooms/abc123/join \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1"}'
# Expected: {"success":true,"color":"white","opponentConnected":false}
```

#### GET /api/rooms/:roomId
```bash
curl http://localhost:3001/api/rooms/abc123
# Expected: Room info JSON
```

### WebSocket Testing

```javascript
// Test WebSocket connection
const ws = new WebSocket('ws://localhost:3001');

ws.onopen = () => {
  console.log('✅ Connected');
  
  // Test join room
  ws.send(JSON.stringify({
    type: 'join_room',
    roomId: 'test-room'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('📨 Received:', data);
};

ws.onerror = (error) => {
  console.error('❌ Error:', error);
};
```

## Automated Testing (Future)

### Unit Tests

```bash
# Frontend
cd frontend
npm test

# Backend
cd backend
npm test
```

### E2E Tests

```bash
# Using Playwright or Cypress
npm run test:e2e
```

### Example Test Cases

```typescript
// Example unit test
describe('labelMove', () => {
  it('should label best move correctly', () => {
    const label = labelMove('e2e4', 'e2e4', 0.5, 0.5, false);
    expect(label).toBe('best');
  });
  
  it('should label blunder correctly', () => {
    const label = labelMove('f3', 'e2e4', -5.0, 0.0, false);
    expect(label).toBe('blunder');
  });
});

// Example E2E test
describe('Chess Game', () => {
  it('should play a complete game', async () => {
    await page.goto('http://localhost:3000');
    await page.click('[data-testid="new-game"]');
    await page.dragAndDrop('[data-square="e2"]', '[data-square="e4"]');
    expect(await page.textContent('[data-testid="move-history"]')).toContain('e4');
  });
});
```

## Security Testing

### Input Validation
- [ ] Invalid PGN rejected
- [ ] Invalid move rejected
- [ ] Room ID validation
- [ ] XSS prevention
- [ ] SQL injection prevention (if using DB)

### WebSocket Security
- [ ] Cannot join non-existent room
- [ ] Cannot send invalid messages
- [ ] Rate limiting works
- [ ] Connection limits work

### CORS
- [ ] CORS headers correct
- [ ] Only allowed origins accepted
- [ ] Preflight requests work

## Load Testing

### Tools
- Apache Bench (ab)
- JMeter
- Artillery
- k6

### Example Load Test

```bash
# Test API endpoint
ab -n 1000 -c 10 http://localhost:3001/health

# Expected results:
# - No failed requests
# - Response time < 100ms
# - Throughput > 100 req/sec
```

### WebSocket Load Test

```bash
# Using Artillery
artillery quick --count 100 --num 10 ws://localhost:3001
```

## Regression Testing

After each change, verify:
- [ ] All existing features still work
- [ ] No new console errors
- [ ] No performance degradation
- [ ] No visual regressions
- [ ] Build completes successfully

## Bug Reporting Template

When you find a bug:

```markdown
**Bug Title**: Clear, concise description

**Severity**: Critical | High | Medium | Low

**Steps to Reproduce**:
1. Go to...
2. Click on...
3. See error

**Expected Result**: What should happen

**Actual Result**: What actually happens

**Environment**:
- OS: Windows 10 / macOS 13 / Ubuntu 22.04
- Browser: Chrome 120 / Firefox 121
- Screen Size: 1920x1080
- Device: Desktop / Mobile

**Screenshots**: [Attach if applicable]

**Console Errors**: [Paste any errors]

**Additional Info**: Any other relevant details
```

## Performance Benchmarks

### Target Metrics

| Metric | Target | Acceptable |
|--------|--------|------------|
| First Contentful Paint | < 1s | < 2s |
| Time to Interactive | < 2s | < 3s |
| Move Latency | < 50ms | < 100ms |
| Engine Response | < 1s | < 2s |
| WebSocket Latency | < 50ms | < 100ms |
| Bundle Size | < 500KB | < 1MB |
| Memory Usage | < 100MB | < 200MB |

### Measuring Performance

```javascript
// Measure move performance
console.time('move');
await makeMove('e2', 'e4');
console.timeEnd('move');

// Measure analysis performance
console.time('analysis');
await analyzePosition();
console.timeEnd('analysis');
```

## Continuous Testing

### Pre-commit Checklist
- [ ] Lint passes
- [ ] Build succeeds
- [ ] Manual smoke test
- [ ] No console errors

### Pre-merge Checklist
- [ ] All tests pass
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Manual testing complete
- [ ] Performance acceptable

### Post-deployment Checklist
- [ ] Smoke test production
- [ ] Check error logs
- [ ] Monitor performance
- [ ] Verify analytics

## Test Coverage Goals

- Unit Tests: 80%+
- Integration Tests: 60%+
- E2E Tests: Critical paths covered

---

## Quick Test Commands

```bash
# Start dev servers
npm run dev

# Run linter
cd frontend && npm run lint

# Build production
npm run build

# Preview build
cd frontend && npm run preview

# Test backend
curl http://localhost:3001/health
```

---

For bug reports, use the GitHub Issues template.
For test contributions, see [CONTRIBUTING.md](./CONTRIBUTING.md).
