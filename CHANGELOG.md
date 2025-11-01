# Changelog

All notable changes to CatChess will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-01

### Added
- ♟️ Interactive chessboard with drag-and-drop functionality
- 🤖 Play vs Stockfish 17 engine (adjustable difficulty 0-20)
- 👥 Local Player vs Player mode (hotseat)
- 🌐 Online multiplayer with real-time WebSocket synchronization
- 🔍 PGN import and game analysis
- 📊 Move quality labeling system:
  - Brilliant moves
  - Great moves
  - Best moves
  - Book moves
  - Inaccuracies
  - Mistakes
  - Blunders
- 📈 Real-time evaluation bar
- 📉 Centipawn evaluation graph
- 📋 Move history with annotations
- 🎨 Dark/Light theme toggle
- 📱 Responsive design for mobile and desktop
- 🔧 Engine settings (depth, skill level)
- 🏠 Online room creation and joining
- 🔗 Shareable room links for multiplayer
- ⚙️ Game controls (new game, undo, analyze)
- 🎯 Multiple game modes selector
- 📖 Comprehensive documentation

### Technical
- React 18 + TypeScript frontend
- Vite build system
- Tailwind CSS styling
- Zustand state management
- chess.js for game logic
- react-chessboard for board UI
- recharts for evaluation graphs
- Node.js + Express backend
- WebSocket support for real-time games
- Cloudflare Workers/Pages deployment ready
- Cloudflare Durable Objects for WebSocket state
- Cloudflare KV for room storage

### Documentation
- README.md with comprehensive project overview
- DEPLOYMENT.md with deployment instructions
- DEVELOPMENT.md with developer guide
- API.md with API documentation
- CONTRIBUTING.md with contribution guidelines
- Example code and usage instructions

## [Unreleased]

### Planned Features
- Opening book database integration
- Game puzzles and training mode
- ELO rating system
- Tournament support
- User accounts and profiles
- Game history and replay
- Advanced analysis (multiple engine lines)
- Time controls (bullet, blitz, rapid)
- Premove support
- Custom board themes and piece sets
- Sound effects and animations
- Chat system for online games
- Spectator mode
- Game export (GIF, video)
- Mobile app version

---

[1.0.0]: https://github.com/yourusername/catchess/releases/tag/v1.0.0
