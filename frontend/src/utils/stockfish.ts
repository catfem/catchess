import { MoveLabel } from '../types';

class StockfishEngine {
  private worker: Worker | null = null;
  private ready: boolean = false;
  private messageQueue: Array<(data: string) => void> = [];
  private loadingError: string | null = null;

  async init(): Promise<void> {
    if (this.worker) return;

    return new Promise((resolve, reject) => {
      try {
        // Use locally bundled stockfish.js (no CDN required)
        this.worker = new Worker('/stockfish.js');
        
        const initTimeout = setTimeout(() => {
          this.loadingError = 'Stockfish initialization timeout. Please refresh the page.';
          console.error(this.loadingError);
          reject(new Error(this.loadingError));
        }, 30000); // 30 second timeout
        
        this.worker.onerror = (error) => {
          clearTimeout(initTimeout);
          this.loadingError = 'Failed to load Stockfish worker. Please check browser console for details.';
          console.error('Stockfish worker error:', error);
          reject(error);
        };
        
        this.worker.onmessage = (e) => {
          const message = e.data;
          
          // Handle info messages from Stockfish
          if (typeof message === 'string' && message.includes('info string')) {
            console.log('Stockfish:', message);
            
            if (message.includes('ERROR')) {
              clearTimeout(initTimeout);
              this.loadingError = 'Failed to load Stockfish engine. Please refresh the page.';
              reject(new Error(this.loadingError));
              return;
            }
          }
          
          if (message === 'readyok') {
            clearTimeout(initTimeout);
            this.ready = true;
            console.log('Stockfish engine ready');
            resolve();
          }

          if (this.messageQueue.length > 0) {
            const callback = this.messageQueue.shift();
            if (callback) callback(message);
          }
        };

        this.sendCommand('uci');
        this.sendCommand('isready');
      } catch (error) {
        this.loadingError = 'Failed to initialize Stockfish. Please refresh the page.';
        console.error('Init error:', error);
        reject(error);
      }
    });
  }
  
  getLoadingError(): string | null {
    return this.loadingError;
  }
  
  isReady(): boolean {
    return this.ready;
  }

  private sendCommand(command: string): void {
    if (this.worker) {
      this.worker.postMessage(command);
    }
  }

  async getBestMove(fen: string, depth: number = 20): Promise<{ bestMove: string; eval: number; pv: string[]; cp?: number; mate?: number }> {
    if (!this.worker || !this.ready) {
      await this.init();
    }

    return new Promise((resolve) => {
      let bestMove = '';
      let evaluation = 0;
      let cp: number | undefined;
      let mate: number | undefined;
      let pv: string[] = [];

      const callback = (data: string) => {
        if (typeof data === 'string') {
          if (data.includes('info') && data.includes('score')) {
            const cpMatch = data.match(/score cp (-?\d+)/);
            const mateMatch = data.match(/score mate (-?\d+)/);
            const pvMatch = data.match(/pv (.+)/);

            if (cpMatch) {
              cp = parseInt(cpMatch[1]);
              evaluation = cp / 100;
            }
            if (mateMatch) {
              mate = parseInt(mateMatch[1]);
              evaluation = mate > 0 ? 100 : -100;
            }
            if (pvMatch) {
              pv = pvMatch[1].split(' ');
            }
          }

          if (data.startsWith('bestmove')) {
            const moveMatch = data.match(/bestmove (\S+)/);
            if (moveMatch) {
              bestMove = moveMatch[1];
              resolve({ bestMove, eval: evaluation, pv, cp, mate });
            }
          }
        }
      };

      this.messageQueue.push(callback);
      this.sendCommand(`position fen ${fen}`);
      this.sendCommand(`go depth ${depth}`);
    });
  }

  async getEngineMove(fen: string, skill: number = 20): Promise<string> {
    if (!this.worker || !this.ready) {
      await this.init();
    }

    this.sendCommand(`setoption name Skill Level value ${skill}`);
    const result = await this.getBestMove(fen, Math.min(skill + 5, 20));
    return result.bestMove;
  }

  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
      this.ready = false;
    }
  }
}

export const stockfishEngine = new StockfishEngine();

export function labelMove(
  userMove: string,
  engineMove: string,
  userEval: number,
  prevEval: number,
  isBookMove: boolean = false
): MoveLabel {
  if (isBookMove) return 'book';

  const deltaCp = Math.abs((userEval - prevEval) * 100);
  const evalLoss = (prevEval - userEval) * 100;

  if (userMove === engineMove) {
    return 'best';
  }

  if (deltaCp <= 20) {
    return 'best';
  }

  if (deltaCp <= 50) {
    return 'great';
  }

  if (deltaCp <= 100 && evalLoss < 100) {
    return 'great';
  }

  if (deltaCp <= 100) {
    return 'good';
  }

  if (evalLoss >= 250) {
    return 'blunder';
  }

  if (evalLoss >= 100) {
    return 'mistake';
  }

  if (deltaCp <= 150) {
    return 'inaccuracy';
  }

  return 'good';
}

export function getMoveColor(label: MoveLabel): string {
  const colors: Record<MoveLabel, string> = {
    brilliant: '#1abc9c',
    great: '#3498db',
    best: '#95a5a6',
    book: '#f39c12',
    good: '#2ecc71',
    inaccuracy: '#f1c40f',
    mistake: '#e67e22',
    blunder: '#e74c3c',
  };
  return colors[label];
}

export function getMoveIcon(label: MoveLabel): string {
  const icons: Record<MoveLabel, string> = {
    brilliant: '‼',
    great: '!',
    best: '✓',
    book: '📖',
    good: '○',
    inaccuracy: '?!',
    mistake: '?',
    blunder: '??',
  };
  return icons[label];
}
