# 🔌 CatChess API Documentation

This document describes the backend API endpoints for the CatChess application.

## Base URLs

- **Development**: `http://localhost:3001`
- **Production**: `https://your-worker.workers.dev` or custom domain

## Authentication

Currently, no authentication is required. All endpoints are public.

---

## Endpoints

### Health Check

Check if the API is running.

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "ok",
  "message": "CatChess Backend API"
}
```

---

### Create Room

Create a new multiplayer room.

**Endpoint**: `POST /api/rooms/create`

**Request Body**: None

**Response**:
```json
{
  "roomId": "a1b2c3d4",
  "success": true
}
```

**Status Codes**:
- `200 OK`: Room created successfully

---

### Join Room

Join an existing multiplayer room.

**Endpoint**: `POST /api/rooms/:roomId/join`

**URL Parameters**:
- `roomId` (string): The room ID to join

**Request Body**:
```json
{
  "playerId": "unique-player-id"
}
```

**Response**:
```json
{
  "success": true,
  "color": "white",
  "opponentConnected": false
}
```

**Status Codes**:
- `200 OK`: Successfully joined
- `404 Not Found`: Room doesn't exist
- `400 Bad Request`: Room is full

---

### Get Room Info

Get information about a specific room.

**Endpoint**: `GET /api/rooms/:roomId`

**URL Parameters**:
- `roomId` (string): The room ID

**Response**:
```json
{
  "id": "a1b2c3d4",
  "players": [
    {
      "id": "player-1",
      "color": "white"
    }
  ],
  "gameState": null,
  "createdAt": 1234567890000
}
```

**Status Codes**:
- `200 OK`: Room found
- `404 Not Found`: Room doesn't exist

---

## WebSocket API

The WebSocket API is used for real-time game updates.

### Connection

**Endpoint**: `ws://localhost:3001` (or WebSocket URL)

### Message Types

#### Client → Server Messages

##### 1. Join Room

```json
{
  "type": "join_room",
  "roomId": "a1b2c3d4"
}
```

##### 2. Make Move

```json
{
  "type": "move",
  "move": {
    "from": "e2",
    "to": "e4",
    "san": "e4"
  },
  "fen": "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1"
}
```

##### 3. Chat Message

```json
{
  "type": "chat",
  "message": "Good game!",
  "sender": "Player 1"
}
```

#### Server → Client Messages

##### 1. Connection Established

```json
{
  "type": "connected",
  "connectionId": "conn-xyz"
}
```

##### 2. Player Joined

```json
{
  "type": "player_joined",
  "roomId": "a1b2c3d4"
}
```

##### 3. Move Received

```json
{
  "type": "move",
  "move": {
    "from": "e7",
    "to": "e5",
    "san": "e5"
  },
  "fen": "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2"
}
```

##### 4. Chat Message

```json
{
  "type": "chat",
  "message": "Good game!",
  "sender": "Player 2"
}
```

---

## Cloudflare Durable Objects API

When using Cloudflare Durable Objects, the WebSocket API works similarly but through Durable Objects.

### Connection

**Endpoint**: `wss://your-worker.workers.dev/rooms/:roomId/websocket`

### Message Types

Same as the standard WebSocket API, but handled by the ChessRoom Durable Object.

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message description"
}
```

### Common Status Codes

- `200 OK`: Success
- `400 Bad Request`: Invalid request
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Rate Limiting

Currently, no rate limiting is implemented. For production use, consider adding:

- Room creation limit per IP
- Message rate limits for WebSocket
- Request throttling

---

## Examples

### Create and Join a Room (JavaScript)

```javascript
// Create a room
const createResponse = await fetch('http://localhost:3001/api/rooms/create', {
  method: 'POST',
});
const { roomId } = await createResponse.json();

// Join the room
const joinResponse = await fetch(`http://localhost:3001/api/rooms/${roomId}/join`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ playerId: 'player-123' }),
});
const joinData = await joinResponse.json();

console.log(`Joined as ${joinData.color}`);
```

### WebSocket Connection (JavaScript)

```javascript
const ws = new WebSocket('ws://localhost:3001');

ws.onopen = () => {
  // Join a room
  ws.send(JSON.stringify({
    type: 'join_room',
    roomId: 'a1b2c3d4',
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'connected':
      console.log('Connected:', message.connectionId);
      break;
      
    case 'move':
      console.log('Opponent moved:', message.move);
      // Update game state
      break;
      
    case 'player_joined':
      console.log('Player joined the room');
      break;
  }
};

// Send a move
function makeMove(from, to, fen) {
  ws.send(JSON.stringify({
    type: 'move',
    move: { from, to },
    fen,
  }));
}
```

---

## Data Models

### Room

```typescript
interface Room {
  id: string;
  players: Player[];
  gameState: GameState | null;
  createdAt: number;
}
```

### Player

```typescript
interface Player {
  id: string;
  color: 'white' | 'black';
  name?: string;
}
```

### GameState

```typescript
interface GameState {
  fen: string;
  moves: Move[];
  currentTurn: 'white' | 'black';
}
```

### Move

```typescript
interface Move {
  from: string;
  to: string;
  san: string;
  timestamp: number;
}
```

---

## Security Considerations

For production deployments:

1. **Add authentication**: Require API keys or JWT tokens
2. **Implement CORS**: Restrict origins that can access the API
3. **Rate limiting**: Prevent abuse and DDoS attacks
4. **Input validation**: Validate all incoming data
5. **Room expiration**: Clean up old/inactive rooms
6. **Move validation**: Verify moves are legal on the server

---

## Future Enhancements

Planned API features:

- User accounts and authentication
- Game history and replay
- ELO rating system
- Tournament support
- Analysis endpoint (server-side Stockfish)
- Game puzzles database
- Opening book API

---

For questions or issues, please open a GitHub issue or contact the development team.
