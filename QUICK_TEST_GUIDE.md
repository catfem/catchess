# Quick Test Guide - New GUI

## 🚀 Start the App

```bash
cd frontend
npm install  # If not already done
npm run dev
```

Visit: `http://localhost:5173` (or the port shown in terminal)

---

## 🎮 Test Core Features

### 1. Play Mode - Local Game
1. Click **"Play"** tab in navigation
2. Click **"Local Game"** card
3. Make some moves on the board
4. ✅ **Verify**: Moves appear in move list with labels (📖, ✓, ○, etc.)
5. ✅ **Verify**: Evaluation bar updates after each move
6. ✅ **Verify**: Opening name appears in left sidebar
7. Try using bottom controls (First, Previous, Next, Last)
8. ✅ **Verify**: Board position updates correctly

### 2. Play Mode - vs AI
1. From game mode selection, click **"Play vs AI"**
2. Make a move
3. ✅ **Verify**: AI responds automatically (after ~500ms)
4. Continue for several moves
5. ✅ **Verify**: AI makes legal moves
6. ✅ **Verify**: Game continues normally

### 3. Analysis Mode
1. Click **"Analyze"** tab in navigation
2. Make some moves manually, or...
3. Click **"Import PGN"** and paste a game
4. ✅ **Verify**: Moves appear in move list
5. ✅ **Verify**: Each move shows analysis (evaluation, labels)
6. ✅ **Verify**: Move labels show correctly:
   - 📖 for opening moves (book moves)
   - ‼️ for brilliant moves
   - ! for great moves
   - ✓ for best moves
   - ⚡ for excellent moves
   - ○ for good moves
   - ?! for inaccuracies
   - ? for mistakes
   - ?? for blunders
7. Click on individual moves in the list
8. ✅ **Verify**: Board shows that position
9. Check the analysis panel (right side on desktop)
10. ✅ **Verify**: Shows evaluation, depth, best move

### 4. Settings
1. Click **"Settings"** tab or gear icon
2. Toggle **Light/Dark theme**
3. ✅ **Verify**: Theme changes immediately
4. Change **Board Theme** (Blue, Brown, Green, Purple)
5. ✅ **Verify**: Board colors change
6. Adjust **Analysis Depth** slider
7. ✅ **Verify**: Slider moves (8-25)
8. Adjust **AI Difficulty** slider
9. ✅ **Verify**: Slider moves (0-20)
10. Toggle **Enable Analysis** switch
11. ✅ **Verify**: Switch toggles on/off

### 5. Mobile Responsive
1. Open browser DevTools (F12)
2. Click device toolbar (Ctrl+Shift+M)
3. Select a mobile device (e.g., iPhone 12)
4. ✅ **Verify**: Navigation collapses to hamburger menu
5. ✅ **Verify**: Board scales appropriately
6. ✅ **Verify**: Sidebars collapse/hide automatically
7. Click hamburger menu
8. ✅ **Verify**: Mobile menu appears
9. Try different screen sizes
10. ✅ **Verify**: Layout adjusts smoothly

---

## 🧪 Test Specific Features

### Book Move Detection
**Expected**: First 10-15 moves show 📖 symbol

1. Start a new game (Analyze or Play)
2. Play: **e4 e5 Nf3 Nc6 Bb5**
3. ✅ **Verify**: All moves show 📖 (book move) label
4. ✅ **Verify**: Opening name shows "Ruy Lopez" or similar

### Brilliant Move Detection
**Expected**: Brilliant moves show ‼️ symbol

This is harder to test naturally, but brilliant moves should:
- Be sacrifices that improve position significantly
- Save a losing position
- Be the only move to maintain balance

You can test by importing games with known brilliant moves.

### Mistake/Blunder Detection
**Expected**: Bad moves show ?, ?? symbols

1. Play several good moves in opening
2. Make an obviously bad move (e.g., hang a queen)
3. ✅ **Verify**: Move shows ?? (blunder) with red color
4. ✅ **Verify**: Centipawn loss is visible

### PGN Import
**Test PGN** (copy this):
```
[Event "Test Game"]
[White "Player1"]
[Black "Player2"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6 8. c3 O-O 9. h3 Nb8 10. d4 Nbd7
```

1. Go to **Analyze** view
2. Click **"Import PGN"**
3. Paste the PGN above
4. Click **"Analyze"**
5. ✅ **Verify**: Moves appear in move list
6. ✅ **Verify**: Analysis starts (shows "Analyzing..." or depth)
7. Wait ~30 seconds for analysis to complete
8. ✅ **Verify**: All moves have labels
9. ✅ **Verify**: Opening is identified (Ruy Lopez)

### Move Navigation
1. Have a game with several moves
2. Click **Last** button (⏭️)
3. ✅ **Verify**: Jumps to final position
4. Click **First** button (⏮️)
5. ✅ **Verify**: Jumps to starting position
6. Click **Next** button (▶️) several times
7. ✅ **Verify**: Advances move by move
8. Click **Previous** button (◀️)
9. ✅ **Verify**: Goes back move by move
10. Click on a specific move in the move list
11. ✅ **Verify**: Board shows that position

### Undo Feature
1. Make several moves in a game
2. Click **Undo** button (↶)
3. ✅ **Verify**: Last move is removed
4. ✅ **Verify**: Move list updates
5. ✅ **Verify**: Board position updates

### Reset Game
1. Have a game with moves
2. Click **New Game** button (↻)
3. ✅ **Verify**: Confirmation or immediate reset
4. ✅ **Verify**: Board returns to starting position
5. ✅ **Verify**: Move list clears
6. ✅ **Verify**: Evaluation resets

---

## 🎨 Visual Elements to Check

### Navigation Bar
- ✅ Logo (♟️ CatChess) visible
- ✅ Tab buttons (Play, Analyze, Puzzles, Learn)
- ✅ Active tab highlighted in blue
- ✅ Settings gear icon visible
- ✅ User avatar/profile icon visible
- ✅ Mobile: Hamburger menu appears on small screens

### Play View
- ✅ Game mode cards visible (Local, Online, AI)
- ✅ Cards have hover effects
- ✅ "Coming Soon" badge on Online mode
- ✅ Clean layout with emoji icons

### Analyze View
- ✅ Left sidebar: Import PGN, Opening info, Game info, Controls
- ✅ Center: Board with evaluation bar (on desktop)
- ✅ Right sidebar: Move list and analysis panel
- ✅ Bottom bar: FEN display, playback controls, move counter

### Move List
- ✅ Moves in two columns (White | Black)
- ✅ Move numbers visible
- ✅ Move labels show with colors:
  - 📖 Orange (book)
  - ‼️ Teal (brilliant)
  - ! Blue (great)
  - ✓ Gray (best)
  - ⚡ Teal (excellent)
  - ○ Green (good)
  - ?! Yellow (inaccuracy)
  - ? Orange (mistake)
  - ?? Red (blunder)
- ✅ Current move highlighted
- ✅ Hover effects on moves

### Evaluation Bar
- ✅ Vertical bar next to board
- ✅ White at bottom, Black at top
- ✅ Height adjusts based on evaluation
- ✅ Shows numeric evaluation
- ✅ Shows "M#" for mate in # moves

### Settings Panel
- ✅ Theme toggle (Light/Dark) with icons
- ✅ Board theme cards with color swatches
- ✅ Selected theme highlighted
- ✅ Sliders for depth, skill, multiPv
- ✅ Toggle switches animated
- ✅ "About CatChess" section at bottom

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module" errors
**Solution**: 
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue: Build fails
**Solution**: 
```bash
npm run build
# Check output for specific errors
```

### Issue: Stockfish not loading
**Solution**: 
- Check browser console (F12)
- Verify `stockfish.js` is in public folder
- Check for CORS errors

### Issue: Move labels not appearing
**Solution**: 
- Verify "Enable Analysis" is ON in Settings
- Wait for analysis to complete (check Stockfish status)
- Check console for errors

### Issue: Board not responsive
**Solution**: 
- Clear browser cache (Ctrl+Shift+Delete)
- Hard refresh (Ctrl+Shift+R)
- Check if JavaScript is enabled

### Issue: Theme not changing
**Solution**: 
- Click Settings and toggle theme
- Verify dark class is added to root div
- Check tailwind config includes 'darkMode: class'

---

## ✅ All Tests Pass Checklist

Mark each when verified:

### Core Features
- [ ] Game loads successfully
- [ ] Can make moves on board
- [ ] Moves appear in move list
- [ ] Move labels show correctly
- [ ] Analysis runs automatically
- [ ] Navigation controls work
- [ ] Can undo moves
- [ ] Can reset game

### Analysis Features
- [ ] Book moves detected (📖)
- [ ] Evaluation updates per move
- [ ] Best moves identified (✓)
- [ ] Mistakes/blunders marked (?, ??)
- [ ] Opening identified correctly
- [ ] PGN import works
- [ ] Analysis depth configurable

### UI/UX
- [ ] Navigation tabs work
- [ ] Theme switching works
- [ ] Board themes apply correctly
- [ ] Mobile responsive
- [ ] Sidebars collapsible
- [ ] Settings save (in memory)
- [ ] No visual glitches

### Performance
- [ ] Page loads quickly (< 3s)
- [ ] Moves are smooth (no lag)
- [ ] Analysis doesn't freeze UI
- [ ] Memory usage reasonable
- [ ] No console errors

---

## 📊 Expected Performance

- **Initial Load**: < 3 seconds
- **Move Response**: Instant (< 100ms)
- **AI Move**: ~500ms
- **Analysis Per Move**: 1-3 seconds (depth 18)
- **PGN Import**: < 1 second
- **Full Game Analysis**: 30-120 seconds (40 moves, depth 18)

---

## 🎯 Success Criteria

**The GUI rebuild is successful if:**

1. ✅ All moves can be made normally
2. ✅ Move classification works (book, brilliant, best, etc.)
3. ✅ Analysis runs and completes
4. ✅ No errors in console
5. ✅ UI is responsive and works on mobile
6. ✅ All navigation works
7. ✅ Settings apply correctly
8. ✅ PGN import/export works
9. ✅ Game controls function properly
10. ✅ Opening detection works

---

## 📝 Notes

- **Analysis takes time**: Be patient, especially for full game analysis
- **Book moves**: Only work for the first ~10-15 moves in common openings
- **Brilliant moves**: Rare! Don't expect them in every game
- **Mobile**: Best tested on real device, not just DevTools simulation
- **Performance**: Varies based on CPU; older devices may be slower

---

## 🚀 Ready to Deploy?

If all tests pass, the app is ready for production deployment to Cloudflare Pages!

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for deployment instructions.

---

**Happy Testing!** 🎉
