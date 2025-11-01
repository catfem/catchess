export class ChessRoom {
  constructor(state, env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();
    this.gameState = {
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      moves: [],
      players: new Map(),
    };
  }

  async fetch(request) {
    const url = new URL(request.url);
    const upgradeHeader = request.headers.get('Upgrade');
    
    // Handle WebSocket upgrade for any path under this Durable Object
    if (upgradeHeader && upgradeHeader.toLowerCase() === 'websocket') {
      const webSocketPair = new WebSocketPair();
      const [client, server] = Object.values(webSocketPair);

      await this.handleSession(server);

      return new Response(null, {
        status: 101,
        webSocket: client,
      });
    }

    // Return room info for GET requests
    if (request.method === 'GET') {
      return new Response(JSON.stringify({
        players: Array.from(this.gameState.players.values()),
        fen: this.gameState.fen,
        moveCount: this.gameState.moves.length,
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response('Expected websocket connection', { status: 400 });
  }

  async handleSession(webSocket) {
    webSocket.accept();

    const sessionId = crypto.randomUUID();
    this.sessions.set(sessionId, webSocket);

    webSocket.addEventListener('message', async (msg) => {
      try {
        const data = JSON.parse(msg.data);
        await this.handleMessage(sessionId, data);
      } catch (err) {
        webSocket.send(JSON.stringify({ 
          type: 'error', 
          message: err.message 
        }));
      }
    });

    webSocket.addEventListener('close', () => {
      this.sessions.delete(sessionId);
      this.broadcast({
        type: 'player_left',
        sessionId,
      }, sessionId);
    });

    webSocket.send(JSON.stringify({
      type: 'connected',
      sessionId,
      gameState: this.gameState,
    }));
  }

  async handleMessage(sessionId, data) {
    switch (data.type) {
      case 'join':
        const playerColor = this.gameState.players.size === 0 ? 'white' : 'black';
        this.gameState.players.set(sessionId, {
          color: playerColor,
          name: data.name || `Player ${this.gameState.players.size + 1}`,
        });
        
        this.broadcast({
          type: 'player_joined',
          sessionId,
          color: playerColor,
          playerCount: this.gameState.players.size,
        });
        break;

      case 'move':
        this.gameState.fen = data.fen;
        this.gameState.moves.push(data.move);
        
        this.broadcast({
          type: 'move',
          move: data.move,
          fen: data.fen,
        }, sessionId);
        break;

      case 'chat':
        this.broadcast({
          type: 'chat',
          message: data.message,
          sender: this.gameState.players.get(sessionId)?.name || 'Unknown',
        }, sessionId);
        break;

      case 'reset':
        this.gameState.fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
        this.gameState.moves = [];
        
        this.broadcast({
          type: 'reset',
          fen: this.gameState.fen,
        });
        break;
    }
  }

  broadcast(message, excludeSessionId = null) {
    const data = JSON.stringify(message);
    
    for (const [sessionId, webSocket] of this.sessions) {
      if (sessionId !== excludeSessionId) {
        try {
          webSocket.send(data);
        } catch (err) {
          console.error('Broadcast error:', err);
        }
      }
    }
  }
}
