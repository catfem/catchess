import { WSMessage, ChessMove } from '../types';

type WSEventHandler = (data: any) => void;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private handlers: Map<string, Set<WSEventHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private roomId: string | null = null;

  connect(roomId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.roomId = roomId;
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/${roomId}`;

      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected to room:', roomId);
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WSMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.handleDisconnect();
        };
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        reject(error);
      }
    });
  }

  private handleMessage(message: WSMessage): void {
    const handlers = this.handlers.get(message.type);
    if (handlers) {
      handlers.forEach((handler) => handler(message.data));
    }

    const allHandlers = this.handlers.get('*');
    if (allHandlers) {
      allHandlers.forEach((handler) => handler(message));
    }
  }

  private handleDisconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.roomId) {
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
        this.reconnectAttempts++;
        this.connect(this.roomId!).catch((error) => {
          console.error('Reconnection failed:', error);
        });
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
    }
  }

  send(type: string, data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      const message: WSMessage = {
        type,
        data,
        timestamp: Date.now(),
      };
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  on(event: string, handler: WSEventHandler): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);

    return () => {
      this.handlers.get(event)?.delete(handler);
    };
  }

  off(event: string, handler: WSEventHandler): void {
    this.handlers.get(event)?.delete(handler);
  }

  sendMove(move: ChessMove): void {
    this.send('move', move);
  }

  sendChat(message: string): void {
    this.send('chat', { message });
  }

  sendResign(): void {
    this.send('resign', {});
  }

  sendDrawOffer(): void {
    this.send('draw_offer', {});
  }

  sendDrawResponse(accept: boolean): void {
    this.send('draw_response', { accept });
  }

  sendRematchRequest(): void {
    this.send('rematch_request', {});
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.handlers.clear();
    this.roomId = null;
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

let wsInstance: WebSocketService | null = null;

export const getWebSocketService = (): WebSocketService => {
  if (!wsInstance) {
    wsInstance = new WebSocketService();
  }
  return wsInstance;
};

export default WebSocketService;
