# ♟️ CatChess - Modern Chess Platform

> A production-grade chess analysis and playing platform built for Cloudflare Pages

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Cloudflare Pages](https://img.shields.io/badge/Deployed%20on-Cloudflare%20Pages-orange)](https://pages.cloudflare.com)
[![Stockfish 17](https://img.shields.io/badge/Engine-Stockfish%2017-green)](https://stockfishchess.org/)

## 🌟 Features

### ✅ Core Gameplay
- 🏠 **Local Play** - Hot-seat multiplayer on one device
- 🤖 **AI Play** - Challenge Stockfish at 20 difficulty levels
- 🌐 **Online Play** - Real-time multiplayer (coming soon)
- ⏱️ **Time Controls** - Blitz, Rapid, Classical with increment support

### 🔍 Analysis & Learning
- **Real-time Analysis** - Stockfish 17 WebAssembly engine
- **Move Labeling** - Brilliant, Best, Good, Inaccuracy, Mistake, Blunder
- **Book Moves** - ECO opening database with 500+ positions
- **Opening Explorer** - Identify and learn openings
- **Evaluation Bar** - Visual position assessment
- **PGN Import/Export** - Full game notation support

### 🎨 Modern UI/UX
- **Responsive Design** - Works on mobile, tablet, desktop
- **Dark/Light Theme** - Choose your preferred theme
- **PWA Support** - Install as an app, works offline
- **Clean Interface** - Inspired by chess.com and lichess
- **Smooth Animations** - Piece movement and UI transitions

### 🚀 Production-Ready
- **Cloudflare Pages** - Global edge deployment
- **Service Worker** - Offline support and caching
- **TypeScript** - Type-safe codebase
- **Fast Performance** - Optimized bundle size and load times

## 🎯 Coming Soon

- 👥 **Multiplayer** - Play online with Cloudflare Durable Objects
- 🧩 **Puzzles** - Tactical training with rated puzzles
- 📚 **Lessons** - Interactive chess courses
- 👤 **User Profiles** - Track stats and rating (Cloudflare D1)
- 🏆 **Tournaments** - Compete in organized events
- 📊 **Analytics** - Game statistics and insights

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/catchess.git
cd catchess

# Install dependencies
cd frontend
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the app!

### Build for Production

```bash
npm run build
```

Output will be in `frontend/dist/`

## 📦 Technology Stack

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Chess Logic**: chess.js
- **Engine**: Stockfish.js (WebAssembly)
- **Board**: react-chessboard

### Infrastructure (Ready to Use)
- **Hosting**: Cloudflare Pages
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Real-time**: Cloudflare Durable Objects
- **Cache**: Cloudflare KV (optional)

## 🏗️ Architecture

```
CatChess/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── views/          # Main app views
│   │   │   ├── layout/         # Navigation, layout
│   │   │   ├── ChessBoard.tsx  # Board component
│   │   │   ├── MoveList.tsx    # Move history
│   │   │   └── ...
│   │   ├── store/
│   │   │   └── gameStore.ts    # Zustand state
│   │   ├── utils/
│   │   │   ├── stockfish.ts    # Engine integration
│   │   │   ├── bookMoves.ts    # ECO database
│   │   │   └── ...
│   │   ├── types/              # TypeScript types
│   │   ├── styles/             # CSS files
│   │   └── App.tsx             # Main app
│   ├── public/
│   │   ├── manifest.json       # PWA manifest
│   │   ├── sw.js              # Service worker
│   │   └── ...
│   └── package.json
├── workers/                     # Cloudflare Workers (future)
│   ├── api/                    # API endpoints
│   └── schema.sql              # D1 database schema
└── docs/                       # Documentation
```

## 🎮 Usage

### Play Modes

1. **Local Game**
   - Play against a friend on the same device
   - Practice by yourself

2. **vs AI**
   - Choose difficulty level (0-20)
   - Adjust analysis depth for stronger/faster play
   - Get real-time evaluation and best moves

3. **Analyze**
   - Import PGN games
   - Get move-by-move analysis
   - See brilliant moves, mistakes, and blunders
   - Explore opening names and variations

### Analysis Features

- **Move Labels**:
  - 📖 Book Move - From opening database
  - ‼️ Brilliant - Exceptional sacrifice or tactic
  - ! Great - Very strong move
  - ✓ Best - Engine's top choice
  - ⚡ Excellent - Near-perfect move
  - ○ Good - Solid move
  - ?! Inaccuracy - Slight mistake
  - ? Mistake - Significant error
  - ⊘ Miss - Missed opportunity
  - ?? Blunder - Major mistake

### Settings

- **Theme**: Light/Dark mode
- **Board Theme**: Blue, Brown, Green, Purple
- **Engine Depth**: 8-25 (speed vs strength)
- **AI Difficulty**: 0-20 (beginner to master)
- **Analysis**: Auto-analyze moves on/off

## 📱 PWA Features

CatChess works as a Progressive Web App:

1. **Install** - Add to home screen on mobile/desktop
2. **Offline** - Play and analyze without internet
3. **Fast** - Cached assets for instant loading
4. **Native Feel** - Fullscreen mode, no browser chrome

## 🔐 Future: Authentication & Multiplayer

When backend is deployed:

- **Sign In**: Google, GitHub, Chess.com OAuth
- **Profile**: Track rating, games, stats
- **Online Play**: Real-time games with Durable Objects
- **Friends**: Challenge friends to games
- **Leaderboards**: Compete globally

## 📊 Database Schema (D1)

Ready-to-deploy schema includes:

- **Users**: Profiles, ratings, stats
- **Games**: Full game records with PGN
- **Moves**: Individual move analysis
- **Puzzles**: Tactical puzzles library
- **Tournaments**: Event management
- **Achievements**: Gamification

See `workers/schema.sql` for full schema.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md)

### Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Style

- TypeScript strict mode
- ESLint configuration
- Prettier formatting
- Meaningful variable names
- Comments for complex logic

## 📖 Documentation

- [Deployment Guide](./DEPLOYMENT_GUIDE.md) - How to deploy
- [Architecture Overview](./CLOUDFLARE_ARCHITECTURE.md) - System design
- [API Documentation](./workers/api/README.md) - API endpoints
- [D1 Setup](./D1_SETUP.md) - Database configuration

## 🐛 Bug Reports

Found a bug? Please open an issue with:

1. Description of the bug
2. Steps to reproduce
3. Expected behavior
4. Screenshots (if applicable)
5. Browser/Device info

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file.

## 🙏 Acknowledgments

- **Stockfish** - World's strongest chess engine
- **chess.js** - Chess logic library
- **react-chessboard** - Beautiful chess board component
- **Cloudflare** - Edge computing platform
- **Lichess** - Inspiration for UI/UX

## 📧 Contact

- GitHub Issues: [Report bugs or request features]
- Email: support@catchess.com (coming soon)
- Discord: [Join our community] (coming soon)

## ⭐ Star History

If you like this project, please give it a star!

---

**Built with ❤️ by the chess community, for the chess community**

[Demo](https://catchess.pages.dev) • [Docs](./docs) • [API](./workers/api)
