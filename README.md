# ♟️ CatChess - Chess Analysis & Play System

A complete interactive Chess GUI and Analysis Web System powered by **Stockfish 17**, supporting Player vs Player (PvP) and Player vs Engine gameplay with real-time move analysis and labeling.

![Chess Analysis](https://img.shields.io/badge/Chess-Analysis-blue)
![Stockfish 17](https://img.shields.io/badge/Stockfish-17-green)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

## 🎯 Features

### Interactive Chess Board
- **Full-featured chessboard** with drag-and-drop functionality
- **Legal move highlighting** and validation
- **Multiple game modes:**
  - 🤖 Play vs Stockfish (adjustable difficulty 0-20)
  - 👥 Play vs Player locally (hotseat)
  - 🌐 Play vs Player online (real-time WebSocket)
  - 🔍 Analyze PGN games

### Move Analysis & Labeling
Every move is analyzed by Stockfish 17 and labeled based on quality:

| Label | Icon | Color | Criteria |
|-------|------|-------|----------|
| **Brilliant** | ‼ | 🟩 Teal | Exceptional tactical move avoiding significant loss |
| **Great Move** | ! | 🟦 Blue | Within 50cp of engine best |
| **Best Move** | ✓ | ⚪ Gray | Matches engine's top move |
| **Book Move** | 📖 | 🟧 Orange | Found in opening theory |
| **Inaccuracy** | ?! | 🟨 Yellow | Small deviation from best |
| **Mistake** | ? | 🟧 Orange | -100 to -250cp vs best |
| **Blunder** | ?? | 🟥 Red | Worse than -250cp |

### Engine Integration
- **Stockfish 17** via WASM/CDN integration
- UCI protocol communication
- Real-time position evaluation
- Adjustable depth (1-20) and skill level
- Multi-PV support for analysis

### Online Multiplayer
- **Real-time WebSocket** synchronization
- Unique room codes for matchmaking
- Instant move broadcasting
- Connection status indicators
- Works with Cloudflare Durable Objects

### UI/UX Features
- **Evaluation bar** with centipawn display
- **Evaluation graph** showing game progression
- **Move history** with annotations
- **Dark/Light theme** toggle
- **Responsive design** for desktop and mobile
- **PGN import/export**
- **Game analysis** with full annotation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
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
# Run both frontend and backend concurrently
npm run dev

# Or run separately:
npm run dev:frontend  # Frontend on http://localhost:3000
npm run dev:backend   # Backend on http://localhost:3001
```

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

3. Create KV namespace:
```bash
wrangler kv:namespace create "CHESS_ROOMS"
```

4. Update `wrangler.toml` with your KV namespace ID

5. Deploy:
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
- **Cloudflare KV** - Room storage

### Chess Engine
- **Stockfish 17** - Via CDN (stockfish.js)
- UCI protocol communication

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

**Built with ♟️ and ❤️ using Stockfish 17**
