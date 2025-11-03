# ♟️ CatChess - Production-Grade Chess Platform

A comprehensive **Cloudflare Pages** chess platform powered by **Stockfish 17**, featuring real-time multiplayer, advanced analysis, time controls, PWA support, and production-grade scalability.

![Chess Analysis](https://img.shields.io/badge/Chess-Analysis-blue)
![Stockfish 17](https://img.shields.io/badge/Stockfish-17-green)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Cloudflare](https://img.shields.io/badge/Cloudflare-Pages-orange)
![PWA](https://img.shields.io/badge/PWA-Ready-purple)

## 🎯 Features

### 🧩 Core Gameplay System
- Interactive drag-and-drop chess board with click-to-move support
- Full FIDE rule implementation (castling, en passant, promotion)
- Board orientation controls (flip, mirror)
- Highlighted legal moves, checks, captures, and last move
- Multiple piece sets, board themes, and coordinate labels
- Smooth animations, sound effects, and mobile scaling

### 🤖 Chess Engine (Client + Worker)
- Stockfish 17 WebAssembly engine running locally with adjustable depth/skill
- MultiPV analysis, evaluation bar, accuracy scoring, and auto-annotation
- Optional Cloudflare Worker engine for server-side evaluation and caching

### 👥 Player Modes
- Human vs AI (local or worker)
- Local multiplayer (hot-seat)
- Real-time online multiplayer via Durable Objects WebSocket rooms
- Spectator mode, undo/redo, hints, and replay navigation
- Matchmaking lobby and invite links

### 🕒 Time Controls
- Blitz, rapid, classical presets plus custom timing
- Increment/delay options, pause/resume, and flag detection
- Server-authoritative clock synchronization for online games

### 🧠 Analysis & Insights
- Move list with SAN notation and ECO opening classification
- Evaluation graph, accuracy score, and move quality labels
- Heatmap visualizations and automated puzzle extraction
- PGN import/export and queue-based full game analysis

### 📊 Player Profiles & Data
- Persistent profiles with avatars, bios, and statistics
- Cloudflare D1 storage of game history, ratings, and achievements
- Stored opening repertoires, lessons, and training progress

### 🌐 Networking Architecture
- Cloudflare Pages frontend deployment with global CDN caching
- Workers API for auth, matchmaking, and data access
- Durable Objects for real-time game rooms and chat relay
- D1 database for persistent storage and analytics

### 🔐 Authentication & Security
- OAuth2-ready architecture with JWT sessions and local login fallback
- Rate limiting, Turnstile (anti-bot), and IP/device session tracking
- Encrypted local storage and audit logs for moderation

### 🧩 Teaching, Study, and Practice Tools
- Opening explorer, position explorer, and tactics trainer
- Interactive lessons, puzzle rush mode, and annotation overlays
- Progress synchronization with D1 and offline practice support

### 🧱 Storage Systems
- IndexedDB caches for offline mode, local preferences, and game saves
- Cloudflare D1 structured tables (`users`, `games`, `moves`, `ratings`, etc.)
- Durable Objects for in-memory match state and Workers KV cache support

### 🧭 Frontend Features & UI
- Responsive layout with customizable panels, themes, and shortcuts
- Accessibility-friendly (screen reader SAN, keyboard controls, high contrast)
- Multilingual support and configurable animation speeds

### 💬 Social & Community
- In-game and spectator chat with moderation tools
- Friend lists, presence, match sharing, and comment threads
- Reporting, blocking, and emoji reactions

### 📈 Ratings, Leaderboards, and Tournaments
- Elo/Glicko-ready rating system per time control with history graphing
- Global/weekly/friends leaderboards and badge rewards
- Swiss/Arena tournament formats with live standings and replays

### 📚 Resource Libraries
- ECO opening database, puzzle collections, lesson library, and annotated games
- Server-driven content loading via Workers with KV caching

### 🧮 Analytics & Logging
- Player timing analytics, accuracy distributions, and engine comparisons
- Durable Object event logs, Workers analytics, and performance metrics

### ⚙️ Settings & Customization
- Theme selector, engine difficulty, hint toggles, privacy controls, and accessibility suite
- Seamless toggles between P2P and Worker modes with auto-analysis preferences

### 📱 Progressive Web App (PWA)
- Installable application with offline caching, push notifications, and background sync
- Service worker versioning and automatic cache invalidation

### 🧠 Administration & Moderation
- Admin dashboard with player management, moderation actions, and analytics
- Cheating detection heuristics, tournament oversight, and automatic cleanup

### 🧪 Developer Tools
- Live debug overlay, game state inspector, engine communication logs
- Durable Object inspector integration and error boundary alerts

### ⚡ Cloudflare Deployment & Optimization
- Automated deployment to Pages, Workers, Durable Objects, and D1
- Global edge routing, static asset caching, HTTPS, and zero-maintenance scaling


## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern browser with WebAssembly support (Chrome 57+, Firefox 52+, Safari 11+, Edge 16+)
- (Optional) Cloudflare account for deployment

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd catchess

# Install all dependencies
npm run install:all

# Or install individually
cd frontend && npm install
cd ../backend && npm install
```

### Development

```bash
# Easy way - use the startup script
./start-dev.sh

# Or run manually:
npm run dev

# Or run separately:
npm run dev:frontend  # Frontend on http://localhost:3000
npm run dev:backend   # Backend on http://localhost:3001
```

**Note**: Stockfish is now bundled locally with the application. The engine will load in 2-5 seconds on first use. No internet connection required after initial app load.

### Build for Production

```bash
# Build frontend
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
catchess/
├── frontend/               # React + TypeScript frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── ChessBoard.tsx
│   │   │   ├── MoveList.tsx
│   │   │   ├── EvaluationBar.tsx
│   │   │   ├── EvaluationGraph.tsx
│   │   │   ├── GameControls.tsx
│   │   │   ├── PGNImport.tsx
│   │   │   ├── OnlineRoom.tsx
│   │   │   └── ThemeToggle.tsx
│   │   ├── store/         # Zustand state management
│   │   │   └── gameStore.ts
│   │   ├── utils/         # Utilities
│   │   │   └── stockfish.ts
│   │   ├── types/         # TypeScript types
│   │   │   └── index.ts
│   │   ├── styles/        # CSS styles
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # Entry point
│   ├── public/            # Static assets
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/               # Node.js + Express backend
│   ├── src/
│   │   └── index.js       # WebSocket & REST API
│   └── package.json
│
├── workers/               # Cloudflare Workers
│   ├── chess-api.js       # API Worker
│   └── durable-objects/
│       └── ChessRoom.js   # WebSocket Durable Object
│
├── public/                # Shared public assets
│   └── stockfish-loader.js
│
├── wrangler.toml          # Cloudflare config
├── package.json           # Root package.json
└── README.md
```

## 🎮 How to Use

### 1. Playing vs Engine

1. Select **"🤖 vs Engine"** mode
2. Adjust difficulty slider (0-20)
3. Play as White (default)
4. Engine automatically responds to your moves

### 2. Local PvP

1. Select **"👥 Local PvP"** mode
2. Two players alternate on the same device
3. No login required

### 3. Online PvP

1. Select **"🌐 Online PvP"** mode
2. Click **"Create New Room"** to generate a room code
3. Share the room link with your opponent
4. Opponent clicks **"Join Room"** and enters the code
5. Play in real-time!

### 4. Analyzing Games

1. Select **"🔍 Analyze"** mode
2. Click **"📋 Import PGN"**
3. Paste your PGN
4. Click **"Import & Analyze"**
5. View move-by-move analysis with labels

## 🔧 Configuration

### Engine Settings

Modify in `frontend/src/store/gameStore.ts`:

```typescript
engineSettings: {
  enabled: true,      // Enable/disable analysis
  depth: 18,          // Analysis depth (1-20)
  skill: 20,          // AI skill level (0-20)
  multiPv: 1,         // Number of variations
  threads: 1,         // CPU threads
}
```

### Theme Customization

Edit colors in `frontend/tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: { /* custom colors */ }
    }
  }
}
```

## 🌐 Deployment to Cloudflare

### Setup

1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

3. Create D1 database (free SQL database):
```bash
wrangler d1 create catchess-db
```

4. Update `wrangler.toml` with your D1 database ID

5. Initialize database schema:
```bash
wrangler d1 execute catchess-db --file=./schema.sql
```

6. Deploy:
```bash
npm run deploy
```

### Cloudflare Pages Setup

1. Connect your GitHub repository to Cloudflare Pages
2. Set build command: `cd frontend && npm install && npm run build`
3. Set output directory: `frontend/dist`
4. Deploy!

Your app will be live at: `https://catchess.pages.dev`

## 🧠 Move Labeling Algorithm

The labeling system analyzes each move by comparing:
- User's move vs Stockfish's best move
- Centipawn evaluation change
- Opening book database

```javascript
function labelMove(userMove, engineMove, userEval, prevEval) {
  const deltaCp = Math.abs((userEval - prevEval) * 100);
  const evalLoss = (prevEval - userEval) * 100;

  if (isBookMove) return 'book';
  if (userMove === engineMove) return 'best';
  if (deltaCp <= 50) return 'great';
  if (evalLoss >= 250) return 'blunder';
  if (evalLoss >= 100) return 'mistake';
  return 'good';
}
```

## 📊 Tech Stack

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **chess.js** - Chess logic
- **react-chessboard** - Board UI
- **recharts** - Evaluation graphs

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **WebSocket (ws)** - Real-time communication

### Infrastructure
- **Cloudflare Pages** - Frontend hosting
- **Cloudflare Workers** - Serverless API
- **Cloudflare Durable Objects** - WebSocket state
- **Cloudflare D1** - Free SQL database (room storage)

### Chess Engine
- **Stockfish 17** - Via CDN (stockfish.js)
- UCI protocol communication

## 🔧 Troubleshooting

### Stockfish Not Loading

If the Stockfish engine fails to load:

1. **Check Browser Compatibility** - Requires WebAssembly support (Chrome 57+, Firefox 52+, Safari 11+, Edge 16+)
2. **Try Different Browser** - Chrome/Firefox recommended
3. **Clear Browser Cache** - Ctrl+Shift+Delete
4. **Check Console** - Open F12 and look for error messages
5. **Verify Files** - Ensure `stockfish.js`, `stockfish.wasm.js`, and `stockfish.wasm` exist in `public/` folder

See `frontend/public/STOCKFISH_SETUP.md` for detailed troubleshooting.

### Workers Not Found

If you see "workers not found" errors:

1. Verify files exist: `ls workers/`
2. Check `wrangler.toml` configuration
3. Run `wrangler dev` for local testing
4. See `WORKERS_GUIDE.md` for detailed documentation

### Backend Connection Issues

If the backend won't start:

```bash
cd backend
npm install
npm run dev
```

Check for port conflicts (default: 3001)

### General Issues

- Run `npm run install:all` to ensure all dependencies are installed
- Check that Node.js 18+ is installed: `node --version`
- Review `FIXES_APPLIED.md` for recent bug fixes
- Open browser console (F12) for error details

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Stockfish](https://github.com/official-stockfish/Stockfish) - The powerful chess engine
- [chess.js](https://github.com/jhlywa/chess.js) - Chess logic library
- [react-chessboard](https://github.com/Clariity/react-chessboard) - Beautiful chessboard component

## 📮 Support

For issues and questions:
- Open an issue on GitHub
- Contact the development team

---

## 🆕 New in Version 2.0

### Production-Grade Cloudflare Platform
- ✨ **Complete D1 Schema** - 25+ tables for full-featured platform
- ⏱️ **Chess Clock** - Real-time time controls with increment support  
- 💾 **IndexedDB Storage** - Offline game saves and settings
- 📱 **PWA Support** - Installable app with offline mode
- 🔐 **Authentication API** - User registration, login, and sessions
- 🏆 **Rating System** - ELO/Glicko foundation with leaderboards
- 🎯 **Tournament Support** - Swiss/Arena formats ready
- 🧩 **Puzzle System** - Rating-based tactical training
- 🌍 **Global Deployment** - Edge-optimized Workers API

### Documentation
- 📖 **CLOUDFLARE_PAGES_COMPLETE_GUIDE.md** - Full deployment guide
- 📊 **CLOUDFLARE_PAGES_IMPLEMENTATION.md** - Feature implementation status
- 🗄️ **schema-complete.sql** - Production database schema
- 🔧 **workers/enhanced-api.js** - Enhanced Worker API

---

**Built with ♟️ and ❤️ using Stockfish 17**

**Version 2.0** - Production-grade Cloudflare Pages Platform 🚀
