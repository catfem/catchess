# 🚀 START HERE - Your First Steps with CatChess

**Welcome to CatChess!** This guide will get you started in the simplest way possible.

---

## ✅ What You Need

Before starting, you need:

1. **A computer** (Windows, Mac, or Linux)
2. **Node.js** version 18 or higher ([Download here](https://nodejs.org))
3. **10 minutes** of your time

Check if you have Node.js:
```bash
node --version
```
Should show v18.0.0 or higher.

---

## 🎯 Three Simple Steps

### Step 1: Get the Code

```bash
# Download the project
git clone <your-repository-url>
cd catchess
```

### Step 2: Install Everything

```bash
# Install all dependencies (takes 2-3 minutes)
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..
```

### Step 3: Start the App

```bash
# Start both frontend and backend
npm run dev
```

Wait a few seconds, then open: **http://localhost:3000**

---

## 🎮 Now What?

You should see the CatChess interface! Here's what to do:

### Try Playing Against the Computer
1. The game mode **"🤖 vs Engine"** is already selected
2. Use the slider to adjust difficulty (try 10 for medium)
3. Click and drag a piece to make a move
4. Watch the computer respond!

### Play with a Friend
1. Select **"👥 Local PvP"**
2. Take turns making moves on the same device

### Analyze a Chess Game
1. Select **"🔍 Analyze"**
2. Click **"📋 Import PGN"**
3. Paste this example game:
   ```
   1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7
   ```
4. Click **"Import & Analyze"**
5. See move-by-move analysis!

---

## 🎨 Cool Features to Try

### Toggle Dark Mode
Click the 🌙 button in the top-right corner

### See Move Quality
Watch the colored symbols next to moves:
- ‼ = Brilliant
- ! = Great
- ✓ = Best
- ? = Mistake
- ?? = Blunder

### Check the Evaluation
The bar on the left shows who's winning:
- White at top = Black winning
- White at bottom = White winning
- Even = Equal position

---

## 🐛 Something Not Working?

### "Cannot find module" Error
```bash
cd catchess
rm -rf node_modules package-lock.json
npm install
cd frontend && rm -rf node_modules && npm install
cd ../backend && rm -rf node_modules && npm install
```

### "Port already in use" Error
```bash
# Kill the process and try again
npx kill-port 3000
npx kill-port 3001
npm run dev
```

### Chess Board Not Loading
1. Refresh your browser (Ctrl+R or Cmd+R)
2. Clear browser cache
3. Make sure you're using a modern browser (Chrome, Firefox, Safari, Edge)

### Pieces Won't Move
1. Check that the game hasn't ended (checkmate/stalemate)
2. Make sure it's your turn (in vs Engine mode)
3. Try clicking instead of dragging

---

## 📚 Want to Learn More?

Now that you're up and running:

- **[Quick Start Guide](QUICKSTART.md)** - More detailed walkthrough
- **[Full Documentation](INDEX.md)** - All available docs
- **[Features List](README.md#-features)** - Everything CatChess can do

---

## 🎓 Understanding the Interface

```
┌─────────────────────────────────────────────────┐
│  🏠 CatChess    [Import PGN] [🌙]             │
├──────┬──────────────────────────┬──────────────┤
│      │                          │              │
│ Eval │    Chess Board           │  Controls    │
│ Bar  │    (Drag pieces here)    │  Mode Select │
│      │                          │  New Game    │
│      │                          │  Undo        │
│      │  [Evaluation Graph]      │              │
│      │                          │  Move List   │
│      │                          │  (Shows all  │
│      │                          │   moves)     │
└──────┴──────────────────────────┴──────────────┘
```

---

## 🎯 Your First Game Checklist

Let's play a complete game:

- [ ] Start the app (`npm run dev`)
- [ ] Open http://localhost:3000
- [ ] Select a game mode
- [ ] Make your first move (try moving the e-pawn: e2 to e4)
- [ ] See the engine respond
- [ ] Make a few more moves
- [ ] Try the "Undo" button
- [ ] Start a new game
- [ ] Toggle dark mode
- [ ] Check the evaluation bar

**Congratulations!** 🎉 You're now using CatChess!

---

## 💡 Pro Tips

1. **Lower difficulty to learn**: Set engine to 5-10 when starting
2. **Use analysis mode**: Import your games to learn from mistakes
3. **Check evaluations**: The eval bar shows position strength
4. **Look at move labels**: Learn what makes moves good or bad
5. **Try online play**: Create a room and play with friends

---

## 🆘 Need Help?

- **Documentation**: See [INDEX.md](INDEX.md) for all docs
- **Issues**: Open a GitHub issue
- **Questions**: Check existing issues or discussions

---

## 🚀 Next Steps

Ready to dive deeper?

### For Playing
→ [How to Use Guide](README.md#-how-to-use)

### For Building
→ [Development Guide](DEVELOPMENT.md)

### For Deploying
→ [Deployment Guide](DEPLOYMENT.md)

---

**You're all set!** Enjoy playing chess! ♟️

---

_Last updated: 2024-01-01_
