# ♟️ CatChess v3.0 - Production-Grade Chess Platform

> **Complete Cloudflare-Native Architecture** • Powered by Stockfish 17

A comprehensive, production-ready chess platform built entirely on **Cloudflare's Edge Infrastructure** featuring real-time multiplayer, advanced AI analysis, tournaments, puzzles, and teaching systems.

![Chess Platform](https://img.shields.io/badge/Platform-Cloudflare-orange)
![Version](https://img.shields.io/badge/Version-3.0-blue)
![Stockfish](https://img.shields.io/badge/Stockfish-17-green)
![PWA Ready](https://img.shields.io/badge/PWA-Ready-purple)

---

## 🎯 Core Features

### 🧩 Complete Gameplay System
- **Interactive Board**: Drag-and-drop, click-to-move, touch controls
- **Full FIDE Rules**: Castling, en passant, promotion, 50-move rule, threefold repetition
- **Visual Feedback**: Highlighted moves, check indicators, last move markers
- **Customization**: Multiple piece sets, board themes, sound effects
- **Responsive Design**: Optimized for desktop, tablet, and mobile

### 🤖 Dual-Engine Architecture
- **Client-Side**: Stockfish 17 WebAssembly (local, instant analysis)
- **Worker-Side**: Optional server analysis for consistent calibration
- **Features**: MultiPV lines, evaluation bar, position assessment, opening book
- **Adjustable**: Depth, skill level, multi-line analysis

### 👥 Multiplayer Modes
- **Single Player**: vs AI with adjustable difficulty (0-20)
- **Local PvP**: Hot-seat two-player mode
- **Online PvP**: Real-time WebSocket multiplayer via Durable Objects
- **Analysis Mode**: Deep dive into any position or game

### 🕒 Time Controls
- **Presets**: Bullet (1+0), Blitz (3+2), Rapid (10+0), Classical (30+0)
- **Custom**: Configure any time + increment combination
- **Features**: Server-authoritative clock, increment support, flag detection
- **Synchronization**: Real-time clock sync for online games

### 🧠 Analysis & Insights
- **Move-by-Move Analysis**: Evaluation, best moves, alternatives
- **Move Quality Labels**: Book, brilliant, best, good, inaccuracy, mistake, blunder
- **Opening Classification**: ECO code database
- **Accuracy Score**: Overall game accuracy percentage
- **Evaluation Graph**: Visual representation of game progression
- **PGN Import/Export**: Full game notation support

### 📊 Player Profiles & Progression
- **User Accounts**: Registration, login, profile management
- **Rating System**: Elo/Glicko ratings per time control
- **Statistics**: Win/loss/draw ratios, accuracy averages, favorite openings
- **Game History**: Searchable archive of all played games
- **Achievements**: Badges, titles, milestones

### 🌐 Cloudflare Infrastructure

| Component | Service | Purpose |
|-----------|---------|---------|
| **Frontend** | Pages | Static site hosting with global CDN |
| **API** | Workers | REST endpoints for game logic, auth, data |
| **Real-time** | Durable Objects | WebSocket rooms for live multiplayer |
| **Database** | D1 | Persistent storage (users, games, ratings) |
| **Cache** | KV (optional) | Opening books, puzzle libraries |
| **Security** | Turnstile | Anti-bot protection |
| **Edge** | Global Network | Low-latency worldwide deployment |

### 🔐 Authentication & Security
- **OAuth2 Ready**: Support for Google, GitHub, Chess.com
- **Local Auth**: Username/password with JWT tokens
- **Session Management**: Secure token storage and validation
- **Rate Limiting**: IP-based protection against abuse
- **Anti-Cheat**: Server-side move validation and timing analysis

### 🧩 Teaching & Training
- **Puzzles**: Curated tactical training exercises
- **Lessons**: Interactive chess instruction
- **Opening Explorer**: Database-backed opening statistics
- **Position Trainer**: Practice specific positions
- **Puzzle Rush**: Timed tactical challenges

### 🏆 Tournaments & Competition
- **Formats**: Swiss, Arena, Round-Robin
- **Automatic Pairing**: Smart matchmaking algorithms
- **Live Standings**: Real-time tournament leaderboards
- **Time Controls**: Configurable per tournament
- **Prizes**: Badge rewards and titles

### 💬 Social Features
- **In-Game Chat**: Real-time messaging during matches
- **Spectator Mode**: Watch live games with chat
- **Friend System**: Add friends, track online status
- **Game Sharing**: Shareable links for games and positions
- **Comments**: Discussion threads on games

### 📱 Progressive Web App
- **Installable**: Add to home screen (mobile/desktop)
- **Offline Mode**: Play locally without internet
- **Background Sync**: Auto-sync when connection returns
- **Push Notifications**: Game invites, tournament alerts
- **Automatic Updates**: Service worker cache management

### ⚙️ Settings & Customization
- **Themes**: Light, dark, auto (system)
- **Board Styles**: Multiple color schemes
- **Piece Sets**: Various artistic styles
- **Sound Controls**: Move, capture, check sounds
- **Accessibility**: Screen reader support, keyboard navigation
- **Privacy**: Public games toggle, spectator controls

### 🧪 Admin & Moderation
- **Dashboard**: Player management, game oversight
- **Moderation Tools**: Chat filtering, player reports
- **Analytics**: Platform usage statistics
- **Cheating Detection**: Automated move analysis
- **Database Management**: User data administration

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern browser with WebAssembly support
- Cloudflare account (for deployment)

### Installation

```bash
# Clone repository
git clone <repository-url>
cd catchess

# Install dependencies
cd frontend && npm install
cd ../backend && npm install
cd ..

# Or use convenient script
npm run install:all
```

### Local Development

```bash
# Start development servers
npm run dev

# Frontend: http://localhost:3000
# Backend: http://localhost:3001
```

### Build for Production

```bash
# Build optimized frontend
npm run build

# Preview production build
npm run preview
```

---

## 📦 Deployment to Cloudflare

### 1. Install Wrangler

```bash
npm install -g wrangler
wrangler login
```

### 2. Create D1 Database

```bash
wrangler d1 create catchess-db
```

Copy the returned database ID to `wrangler.toml`:

```toml
[[d1_databases]]
binding = "DB"
database_name = "catchess-db"
database_id = "YOUR_DATABASE_ID_HERE"
```

### 3. Initialize Database Schema

```bash
wrangler d1 execute catchess-db --file=./schema-complete.sql
```

### 4. Deploy to Cloudflare

```bash
npm run deploy
```

Your app will be live at: `https://catchess.<your-subdomain>.workers.dev`

### 5. Deploy to Cloudflare Pages (Alternative)

1. Connect GitHub repo to Cloudflare Pages
2. Configure build:
   - **Build command**: `cd frontend && npm install && npm run build`
   - **Output directory**: `frontend/dist`
3. Deploy!

Live at: `https://catchess.pages.dev`

---

## 📁 Project Structure

```
catchess/
├── frontend/               # React + TypeScript frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   │   ├── board/     # Chess board components
│   │   │   ├── game/      # Game mode components
│   │   │   ├── analysis/  # Analysis tools
│   │   │   ├── player/    # Player profiles
│   │   │   ├── multiplayer/ # Online features
│   │   │   ├── settings/  # Settings panels
│   │   │   └── ui/        # Reusable UI elements
│   │   ├── store/         # Zustand state management
│   │   ├── utils/         # Utilities
│   │   │   ├── chess/     # Chess logic (chess.js)
│   │   │   ├── engine/    # Stockfish integration
│   │   │   ├── api/       # API client
│   │   │   └── storage/   # IndexedDB, localStorage
│   │   ├── services/      # WebSocket, notifications
│   │   ├── types/         # TypeScript definitions
│   │   ├── hooks/         # React custom hooks
│   │   └── pages/         # Page components
│   ├── public/            # Static assets
│   └── dist/              # Build output
│
├── workers/               # Cloudflare Workers
│   ├── api-v2.js          # Enhanced REST API
│   ├── chess-api.js       # Legacy API
│   └── durable-objects/
│       └── ChessRoom.js   # WebSocket room handler
│
├── backend/               # Node.js development server
│   └── src/
│       └── index.js
│
├── public/                # Shared assets
│   ├── stockfish.js
│   ├── stockfish.wasm
│   └── sounds/
│
├── wrangler.toml          # Cloudflare configuration
├── schema-complete.sql    # D1 database schema
└── package.json           # Root dependencies
```

---

## 🎮 Usage Guide

### Playing vs Computer

1. Select "🤖 vs Computer" mode
2. Adjust AI difficulty (0-20)
3. Make your moves - AI responds automatically
4. Use "Undo" to take back moves
5. View engine evaluation in real-time

### Online Multiplayer

1. Select "🌐 Online PvP"
2. Click "Create Game" to generate a room code
3. Share the link with your opponent
4. Opponent clicks "Join Game" and enters code
5. Play in real-time with synchronized clocks!

### Game Analysis

1. Select "🔍 Analyze" mode
2. Import PGN or play moves manually
3. Click "Analyze" to start engine evaluation
4. View move-by-move assessments
5. See alternative lines and suggestions

### Solving Puzzles

1. Navigate to "Puzzles" section
2. Select difficulty level
3. Find the best moves in the position
4. Get instant feedback
5. Track your puzzle rating

---

## 🔧 Configuration

### Engine Settings (in-app)

- **Depth**: Analysis depth (1-20 ply)
- **Skill Level**: AI strength (0-20)
- **Multi-PV**: Number of best lines to show (1-5)
- **Threads**: CPU cores to use
- **Hash**: Memory allocation (MB)

### Environment Variables

```bash
# .env file
DATABASE_URL=your_d1_database_url
WORKER_URL=https://your-worker.workers.dev
ENABLE_AUTH=true
ENABLE_ANALYTICS=true
```

---

## 📊 Technology Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Zustand (state management)
- chess.js (chess logic)
- react-chessboard (board UI)
- Recharts (data visualization)

### Backend
- Cloudflare Workers (serverless API)
- Cloudflare Durable Objects (WebSocket)
- Cloudflare D1 (SQL database)
- Cloudflare Pages (hosting)
- Cloudflare KV (caching)

### Chess Engine
- Stockfish 17 (WebAssembly)
- UCI protocol
- Local + Worker execution

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

## 📝 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

- [Stockfish](https://stockfishchess.org/) - World's strongest open-source chess engine
- [chess.js](https://github.com/jhlywa/chess.js) - Chess logic library
- [react-chessboard](https://github.com/Clariity/react-chessboard) - Beautiful React chessboard
- [Cloudflare](https://www.cloudflare.com/) - Edge infrastructure

---

## 📮 Support

- 📧 Email: support@catchess.dev
- 💬 Discord: [Join our community](#)
- 🐛 Issues: [GitHub Issues](#)
- 📖 Docs: [Full Documentation](#)

---

**Built with ♟️ and ❤️ by the CatChess Team**

**Version 3.0** - Complete Cloudflare-Native Architecture 🚀
