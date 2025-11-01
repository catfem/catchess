import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const rooms = new Map();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CatChess Backend API' });
});

app.post('/api/rooms/create', (req, res) => {
  const roomId = uuidv4().substring(0, 8);
  
  rooms.set(roomId, {
    id: roomId,
    players: [],
    gameState: null,
    createdAt: Date.now(),
  });

  res.json({ roomId, success: true });
});

app.post('/api/rooms/:roomId/join', (req, res) => {
  const { roomId } = req.params;
  const { playerId } = req.body;

  const room = rooms.get(roomId);
  
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  if (room.players.length >= 2) {
    return res.status(400).json({ error: 'Room is full' });
  }

  const playerColor = room.players.length === 0 ? 'white' : 'black';
  room.players.push({ id: playerId, color: playerColor });

  res.json({ 
    success: true, 
    color: playerColor,
    opponentConnected: room.players.length === 2 
  });
});

app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);

  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }

  res.json(room);
});

const server = app.listen(PORT, () => {
  console.log(`🚀 CatChess Backend running on port ${PORT}`);
});

const wss = new WebSocketServer({ server });

const wsConnections = new Map();

wss.on('connection', (ws, req) => {
  const connectionId = uuidv4();
  wsConnections.set(connectionId, { ws, roomId: null });

  console.log(`WebSocket client connected: ${connectionId}`);

  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      handleWebSocketMessage(connectionId, message);
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    console.log(`WebSocket client disconnected: ${connectionId}`);
    wsConnections.delete(connectionId);
  });

  ws.send(JSON.stringify({ type: 'connected', connectionId }));
});

function handleWebSocketMessage(connectionId, message) {
  const connection = wsConnections.get(connectionId);
  if (!connection) return;

  switch (message.type) {
    case 'join_room':
      connection.roomId = message.roomId;
      broadcastToRoom(message.roomId, {
        type: 'player_joined',
        roomId: message.roomId,
      }, connectionId);
      break;

    case 'move':
      broadcastToRoom(connection.roomId, {
        type: 'move',
        move: message.move,
        fen: message.fen,
      }, connectionId);
      break;

    case 'chat':
      broadcastToRoom(connection.roomId, {
        type: 'chat',
        message: message.message,
        sender: message.sender,
      }, connectionId);
      break;
  }
}

function broadcastToRoom(roomId, message, excludeConnectionId = null) {
  wsConnections.forEach((connection, connId) => {
    if (connection.roomId === roomId && connId !== excludeConnectionId) {
      try {
        connection.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('Broadcast error:', error);
      }
    }
  });
}

setInterval(() => {
  const now = Date.now();
  const timeout = 1000 * 60 * 60;
  
  rooms.forEach((room, roomId) => {
    if (now - room.createdAt > timeout) {
      rooms.delete(roomId);
      console.log(`Cleaned up inactive room: ${roomId}`);
    }
  });
}, 1000 * 60 * 5);

export default app;
