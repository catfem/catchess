# ⚡ Quick Start Guide

Get CatChess up and running in 5 minutes!

## 1️⃣ Prerequisites Check

Make sure you have:
- Node.js 18+ (`node --version`)
- npm 9+ (`npm --version`)

If not installed, download from [nodejs.org](https://nodejs.org)

## 2️⃣ Installation

```bash
# Clone the repository
git clone <repository-url>
cd catchess

# Install dependencies
npm install
cd frontend && npm install
cd ../backend && npm install
cd ..
```

## 3️⃣ Start Development

```bash
# Start both frontend and backend
npm run dev
```

This will start:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

## 4️⃣ Try It Out!

Open http://localhost:3000 in your browser.

### Play vs Computer
1. Select **"🤖 vs Engine"**
2. Use the slider to adjust difficulty (0-20)
3. Start playing!

### Play with a Friend Locally
1. Select **"👥 Local PvP"**
2. Take turns on the same device

### Play Online
1. Select **"🌐 Online PvP"**
2. Click **"Create New Room"**
3. Share the room link with your friend
4. Start playing!

### Analyze a Game
1. Select **"🔍 Analyze"**
2. Click **"📋 Import PGN"**
3. Paste your PGN
4. Click **"Import & Analyze"**
5. See move-by-move analysis with labels!

## 5️⃣ Build for Production

```bash
cd frontend
npm run build
```

Built files will be in `frontend/dist/`

## 🎨 Features to Explore

- **Evaluation Bar**: Shows position evaluation
- **Evaluation Graph**: Visualizes game progression
- **Move Labels**: Brilliant, Great, Best, Mistake, Blunder
- **Dark Mode**: Toggle in top-right corner
- **Game Controls**: New Game, Undo, Analyze

## 🐛 Troubleshooting

### "Cannot find module" errors
```bash
rm -rf node_modules package-lock.json
npm install
```

### Port already in use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or change port in vite.config.ts
```

### Stockfish not loading
- Check browser console for errors
- Ensure you have internet connection (loads from CDN)
- Try refreshing the page

## 📚 Next Steps

- Read [README.md](./README.md) for full documentation
- Check [DEVELOPMENT.md](./DEVELOPMENT.md) for developer guide
- See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions

## 🎮 Keyboard Shortcuts

(To be implemented - suggestions welcome!)

- `Ctrl/Cmd + Z`: Undo move
- `Ctrl/Cmd + Y`: Redo move
- `Space`: Flip board
- `Left/Right Arrow`: Navigate moves
- `T`: Toggle theme

## 💡 Tips

1. **Adjust Engine Strength**: Lower skill for learning, higher for challenge
2. **Use Analysis Mode**: Learn from your mistakes with move labels
3. **Share Games**: Export PGN and share with friends
4. **Online Play**: Create private rooms for friends or join public games

## 🆘 Need Help?

- Check the [FAQ](./README.md#faq) (if available)
- Open an issue on GitHub
- Check console logs for errors

---

**Happy playing! ♟️**
