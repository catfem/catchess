import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { initializeDatabase, getDatabase } from './database.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize database
initializeDatabase();
const db = getDatabase();

const rooms = new Map();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CatChess Backend API' });
});

// Opening database endpoints
app.get('/api/openings/search', (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.json([]);
    }

    const searchTerm = `%${q}%`;
    const stmt = db.prepare(`
      SELECT id, name, eco, category, description
      FROM openings
      WHERE name LIKE ? OR eco LIKE ? OR category LIKE ?
      ORDER BY name
      LIMIT 50
    `);
    
    const results = stmt.all(searchTerm, searchTerm, searchTerm);
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search openings' });
  }
});

app.get('/api/openings/by-name/:name', (req, res) => {
  try {
    const { name } = req.params;
    const stmt = db.prepare(`
      SELECT id, name, eco, category, description
      FROM openings
      WHERE name = ?
      LIMIT 1
    `);
    
    const result = stmt.get(name);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'Opening not found' });
    }
  } catch (error) {
    console.error('Lookup error:', error);
    res.status(500).json({ error: 'Failed to lookup opening' });
  }
});

app.get('/api/openings/by-eco/:eco', (req, res) => {
  try {
    const { eco } = req.params;
    const stmt = db.prepare(`
      SELECT id, name, eco, category, description
      FROM openings
      WHERE eco = ?
      LIMIT 1
    `);
    
    const result = stmt.get(eco);
    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ error: 'Opening not found' });
    }
  } catch (error) {
    console.error('Lookup error:', error);
    res.status(500).json({ error: 'Failed to lookup opening' });
  }
});

app.get('/api/openings/list', (req, res) => {
  try {
    const { category, limit = 100, offset = 0 } = req.query;
    let stmt;
    let params = [];

    if (category) {
      stmt = db.prepare(`
        SELECT id, name, eco, category, description
        FROM openings
        WHERE category = ?
        ORDER BY name
        LIMIT ? OFFSET ?
      `);
      params = [category, parseInt(limit), parseInt(offset)];
    } else {
      stmt = db.prepare(`
        SELECT id, name, eco, category, description
        FROM openings
        ORDER BY name
        LIMIT ? OFFSET ?
      `);
      params = [parseInt(limit), parseInt(offset)];
    }

    const results = stmt.all(...params);
    res.json(results);
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({ error: 'Failed to list openings' });
  }
});

app.get('/api/openings/categories', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT DISTINCT category
      FROM openings
      ORDER BY category
    `);
    
    const results = stmt.all();
    const categories = results.map(r => r.category);
    res.json(categories);
  } catch (error) {
    console.error('Categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
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
