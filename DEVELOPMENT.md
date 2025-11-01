# 🛠️ Development Guide

This guide will help you set up and develop CatChess.

## Prerequisites

- **Node.js**: v18 or higher
- **npm**: v9 or higher
- **Git**: Latest version
- **Code Editor**: VS Code recommended

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd catchess
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

## Development Workflow

### Running the Application

#### Option 1: Run Everything (Recommended)

From the project root:

```bash
npm run dev
```

This starts:
- Frontend dev server on `http://localhost:3000`
- Backend API server on `http://localhost:3001`

#### Option 2: Run Separately

Frontend only:
```bash
npm run dev:frontend
```

Backend only:
```bash
npm run dev:backend
```

### Building for Production

```bash
cd frontend
npm run build
```

Build output will be in `frontend/dist/`.

### Preview Production Build

```bash
cd frontend
npm run preview
```

## Project Structure

```
catchess/
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── store/        # State management (Zustand)
│   │   ├── utils/        # Utility functions
│   │   ├── types/        # TypeScript type definitions
│   │   ├── styles/       # Global styles
│   │   ├── App.tsx       # Main app component
│   │   └── main.tsx      # Entry point
│   ├── public/           # Static assets
│   ├── index.html        # HTML template
│   ├── vite.config.ts    # Vite configuration
│   └── package.json
│
├── backend/              # Express backend
│   ├── src/
│   │   └── index.js      # Main server file
│   └── package.json
│
├── workers/              # Cloudflare Workers
│   ├── chess-api.js      # Main API worker
│   └── durable-objects/
│       └── ChessRoom.js  # WebSocket handler
│
├── public/               # Shared static assets
└── docs/                 # Documentation
```

## Key Technologies

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **Zustand**: State management (lightweight alternative to Redux)
- **chess.js**: Chess game logic
- **react-chessboard**: Chessboard UI component
- **recharts**: Data visualization for evaluation graphs

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **WebSocket (ws)**: Real-time communication

### Infrastructure
- **Cloudflare Pages**: Frontend hosting
- **Cloudflare Workers**: Serverless functions
- **Cloudflare Durable Objects**: Stateful WebSocket connections
- **Cloudflare KV**: Key-value storage

## Component Architecture

### State Management (Zustand)

The application uses Zustand for global state management. The main store is in `frontend/src/store/gameStore.ts`.

**Key State:**
- `chess`: Chess.js instance
- `gameMode`: Current game mode
- `moveHistory`: Array of moves with analysis
- `engineSettings`: Stockfish configuration
- `onlineRoom`: Online multiplayer state

**Key Actions:**
- `makeMove()`: Make a move on the board
- `analyzePosition()`: Analyze current position with Stockfish
- `analyzeGame()`: Analyze entire game from PGN
- `resetGame()`: Start new game
- `setGameMode()`: Change game mode

### Component Hierarchy

```
App
├── Header
│   ├── PGNImport
│   └── ThemeToggle
├── EvaluationBar
├── ChessBoard
├── EvaluationGraph
└── Sidebar
    ├── GameControls
    ├── OnlineRoom (conditional)
    ├── MoveList
    └── MoveLegend
```

## Stockfish Integration

### How It Works

1. **Web Worker**: Stockfish runs in a Web Worker to avoid blocking the UI
2. **UCI Protocol**: Communicates using Universal Chess Interface commands
3. **CDN Loading**: Loads from jsdelivr CDN (fallback to local copy)

### Stockfish Commands

```javascript
// Initialize engine
worker.postMessage('uci');
worker.postMessage('isready');

// Analyze position
worker.postMessage('position fen <fen-string>');
worker.postMessage('go depth 20');

// Set options
worker.postMessage('setoption name Skill Level value 15');
```

### Move Labeling Algorithm

The labeling system compares user moves vs Stockfish best moves:

```javascript
function labelMove(userMove, engineMove, userEval, prevEval, isBookMove) {
  if (isBookMove) return 'book';
  
  const deltaCp = Math.abs((userEval - prevEval) * 100);
  const evalLoss = (prevEval - userEval) * 100;

  if (userMove === engineMove) return 'best';
  if (deltaCp <= 50) return 'great';
  if (deltaCp <= 100 && evalLoss < 100) return 'great';
  if (evalLoss >= 250) return 'blunder';
  if (evalLoss >= 100) return 'mistake';
  if (deltaCp <= 150) return 'inaccuracy';
  
  return 'good';
}
```

## Adding New Features

### Adding a New Component

1. Create file in `frontend/src/components/`:

```tsx
// NewComponent.tsx
import { useGameStore } from '../store/gameStore';

export function NewComponent() {
  const { /* state */ } = useGameStore();
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      {/* Component content */}
    </div>
  );
}
```

2. Import and use in `App.tsx`:

```tsx
import { NewComponent } from './components/NewComponent';

// In JSX:
<NewComponent />
```

### Adding State to Store

Edit `frontend/src/store/gameStore.ts`:

```typescript
interface GameStore {
  // Add new state
  newFeature: boolean;
  
  // Add new action
  setNewFeature: (value: boolean) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  newFeature: false,
  
  setNewFeature: (value) => {
    set({ newFeature: value });
  },
}));
```

### Adding Backend Endpoint

Edit `backend/src/index.js`:

```javascript
app.post('/api/new-endpoint', async (req, res) => {
  try {
    // Handle request
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## Styling Guidelines

### Tailwind CSS

Use Tailwind utility classes for styling:

```tsx
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 hover:shadow-xl transition-shadow">
  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Title</h2>
  <p className="text-gray-600 dark:text-gray-400 mt-2">Description</p>
</div>
```

### Dark Mode

Always provide dark mode variants:

```tsx
className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
```

### Responsive Design

Use responsive breakpoints:

```tsx
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
```

## Testing

### Manual Testing Checklist

- [ ] Local PvP: Two players can play on same device
- [ ] vs Engine: AI makes valid moves at all difficulty levels
- [ ] Online PvP: Room creation and joining works
- [ ] PGN Import: Can import and display games
- [ ] Move Analysis: Stockfish labels moves correctly
- [ ] Evaluation Bar: Updates in real-time
- [ ] Evaluation Graph: Displays correctly
- [ ] Theme Toggle: Dark/light mode switches
- [ ] Responsive: Works on mobile and desktop

### Running Tests

```bash
# Frontend (if tests are added)
cd frontend
npm test

# Backend (if tests are added)
cd backend
npm test
```

## Debugging

### Frontend Debugging

1. **React DevTools**: Install browser extension
2. **Zustand DevTools**: Add to store for debugging state
3. **Console Logs**: Check browser console for errors

### Stockfish Debugging

Add logging to Stockfish worker:

```javascript
worker.onmessage = (e) => {
  console.log('Stockfish:', e.data);
  // Handle message
};
```

### Backend Debugging

```bash
# Run with debug logging
DEBUG=* npm run dev:backend
```

## Performance Optimization

### Frontend

1. **Code Splitting**: Use dynamic imports for large components
2. **Memoization**: Use `React.memo()` for expensive components
3. **Lazy Loading**: Defer non-critical JavaScript

### Stockfish

1. **Depth Control**: Limit analysis depth for faster results
2. **Web Worker**: Keep engine in separate thread
3. **Debouncing**: Debounce analysis requests

## Common Issues

### Issue: Stockfish not loading

**Solution**: Check console for CORS errors. Ensure CDN is accessible or use local copy.

### Issue: WebSocket connection fails

**Solution**: Verify backend is running on correct port. Check firewall settings.

### Issue: Build errors

**Solution**: Delete `node_modules` and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Tailwind styles not applying

**Solution**: Ensure `index.css` imports Tailwind:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

## Code Style

- Use TypeScript for new code
- Follow existing naming conventions
- Add comments for complex logic
- Use meaningful variable names
- Keep functions small and focused

## Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [chess.js](https://github.com/jhlywa/chess.js)
- [Stockfish](https://stockfishchess.org)
- [Cloudflare Workers](https://developers.cloudflare.com/workers)

---

Happy coding! ♟️
