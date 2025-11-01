# Workers and Backend Guide

## Overview

CatChess uses two different backend systems depending on deployment:

1. **Local Development**: Node.js + Express backend with WebSockets
2. **Production (Cloudflare)**: Cloudflare Workers + Durable Objects

## Local Development Backend

### Location
`backend/src/index.js`

### Features
- Express REST API for room management
- WebSocket server for real-time game synchronization
- In-memory room storage
- Automatic room cleanup after 1 hour of inactivity

### API Endpoints
- `GET /health` - Health check
- `POST /api/rooms/create` - Create a new game room
- `POST /api/rooms/:roomId/join` - Join an existing room
- `GET /api/rooms/:roomId` - Get room information
- WebSocket: `ws://localhost:3001` - Real-time communication

### Running Locally
```bash
cd backend
npm install
npm run dev
```

The backend will start on port 3001.

## Cloudflare Workers (Production)

### Structure

#### 1. Main Worker (`workers/chess-api.js`)
- Handles REST API endpoints
- Routes WebSocket connections to Durable Objects
- Integrates with Cloudflare D1 database for room persistence

#### 2. Durable Objects (`workers/durable-objects/ChessRoom.js`)
- Manages WebSocket connections per room
- Maintains game state (FEN, moves, players)
- Broadcasts moves to all players in a room
- Persists across server restarts

### Configuration (`wrangler.toml`)

```toml
name = "catchess"
main = "workers/chess-api.js"

# D1 Database for room persistence
[[d1_databases]]
binding = "DB"
database_name = "catchess-db"
database_id = "local"

# Durable Objects for WebSocket state
[[durable_objects.bindings]]
name = "CHESS_ROOM"
class_name = "ChessRoom"
script_name = "catchess"
```

### Deployment

1. **Setup D1 Database**
```bash
wrangler d1 create catchess-db
wrangler d1 execute catchess-db --file=./schema.sql
```

2. **Update Database ID**
Update `wrangler.toml` with the database ID from step 1

3. **Deploy**
```bash
npm run build
wrangler deploy
```

Your worker will be available at: `https://catchess.<your-account>.workers.dev`

## Workers Not Found Issue - Solutions

If you see "workers not found" errors:

### 1. Check Worker File Exists
```bash
ls -la workers/
# Should show:
# - chess-api.js
# - durable-objects/ChessRoom.js
```

### 2. Verify Wrangler Config
Ensure `wrangler.toml` has:
- `main = "workers/chess-api.js"`
- Durable Objects binding configured
- D1 database binding configured

### 3. Check Import/Export
`workers/chess-api.js` must export ChessRoom:
```javascript
import { ChessRoom } from './durable-objects/ChessRoom.js';
export { ChessRoom };
```

### 4. Build Frontend
```bash
cd frontend
npm run build
```

### 5. Test Locally with Wrangler
```bash
wrangler dev
```

## WebSocket Connection Flow

### Local Development
1. Frontend connects to `ws://localhost:3001`
2. Express WebSocket server handles connection
3. Messages broadcast to all clients in room

### Production (Cloudflare)
1. Frontend connects to `wss://your-worker.workers.dev/ws/room/{roomId}`
2. Main worker routes to Durable Object based on roomId
3. Durable Object manages WebSocket connection
4. State persists in Durable Object storage

## Stockfish Integration

Stockfish runs **client-side** in the browser as a Web Worker:

### Location
`public/stockfish.js` - Web Worker wrapper

### Loading Process
1. Browser creates Web Worker from `/stockfish.js`
2. Worker loads Stockfish engine from CDN (jsdelivr/unpkg)
3. UCI protocol communication between frontend and engine
4. Engine runs in separate thread (non-blocking)

### CDN Sources (Fallback Chain)
1. `https://cdn.jsdelivr.net/npm/stockfish@16.1.0/src/stockfish.js`
2. `https://unpkg.com/stockfish@16.1.0/src/stockfish.js`
3. `https://cdn.jsdelivr.net/npm/stockfish.wasm@0.11.0/stockfish.js`

### Stockfish Not Loading - Solutions

1. **Check Internet Connection**
   - Stockfish downloads from CDN on first load
   - ~2-5MB download size
   - May take 10-30 seconds on first load

2. **Check Browser Console**
   - Look for "Stockfish engine ready" message
   - Check for network errors or CORS issues

3. **Try Different Browser**
   - Chrome and Firefox recommended
   - Ensure JavaScript is enabled

4. **Check Ad-Blockers/Firewall**
   - Some ad-blockers may block CDN requests
   - Try disabling temporarily

5. **Use Local Stockfish** (Advanced)
   - Download from: https://github.com/nmrugg/stockfish.js
   - Place `stockfish.js` in `public/` folder
   - Will use local version instead of CDN

## Troubleshooting

### Backend Not Starting
```bash
cd backend
npm install
npm run dev
```
Check for port conflicts (default: 3001)

### Workers Deploy Fails
- Ensure you're logged in: `wrangler login`
- Check wrangler.toml syntax
- Verify D1 database exists: `wrangler d1 list`

### WebSocket Connection Fails
- Check CORS settings
- Verify WebSocket upgrade headers
- Test with: `wscat -c ws://localhost:3001`

### Stockfish Not Working
- Open browser console (F12)
- Check for error messages
- Verify `/stockfish.js` is accessible
- Check Network tab for CDN requests

## Architecture Diagram

```
Frontend (React + Vite)
    |
    ├─> Stockfish Worker (/stockfish.js)
    |   └─> CDN (jsdelivr/unpkg)
    |
    └─> Backend
        |
        ├─> Local Development
        |   └─> Express + WebSocket (port 3001)
        |
        └─> Production
            └─> Cloudflare Worker
                ├─> REST API (chess-api.js)
                ├─> Durable Objects (ChessRoom)
                └─> D1 Database
```

## Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Durable Objects Guide](https://developers.cloudflare.com/workers/runtime-apis/durable-objects/)
- [Stockfish.js GitHub](https://github.com/nmrugg/stockfish.js)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
