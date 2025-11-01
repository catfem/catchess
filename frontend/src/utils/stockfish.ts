import { MoveLabel } from '../types';

class StockfishEngine {
  private worker: Worker | null = null;
  private ready: boolean = false;
  private currentCallback: ((data: string) => void) | null = null;
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
            return;
          }

          // Route messages to the current callback
          if (this.currentCallback) {
            this.currentCallback(message);
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
              // Stockfish ALWAYS returns evaluation from White's perspective
              // Positive = White advantage, Negative = Black advantage
              evaluation = cp / 100;
            }
            if (mateMatch) {
              mate = parseInt(mateMatch[1]);
              // Mate scores: positive = White mates, negative = Black mates
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
              this.currentCallback = null; // Clear callback after completion
              resolve({ bestMove, eval: evaluation, pv, cp, mate });
            }
          }
        }
      };

      this.currentCallback = callback;
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
  currentEval: number,     // Always from White's perspective (+ = White advantage)
  prevEval: number,        // Always from White's perspective (+ = White advantage)
  isBookMove: boolean = false,
  playerColor: 'w' | 'b' = 'w'
): MoveLabel {
  if (isBookMove) return 'book';

  // IMPORTANT: Evaluations are ALWAYS from White's perspective
  // Positive values = White has advantage
  // Negative values = Black has advantage
  // 
  // For move labeling, we need to calculate evaluation LOSS from the player's perspective
  // For Black, we invert the change because:
  // - If eval goes from -2.00 to -1.50, Black's position got worse (less advantage)
  const colorMultiplier = playerColor === 'w' ? 1 : -1;
  
  // Calculate evaluation loss from the player's perspective
  const evalChange = (currentEval - prevEval) * colorMultiplier;
  const evalLossCp = -evalChange * 100; // Positive = player lost advantage, Negative = player gained
  
  // Check if user played the best move
  if (userMove === engineMove) {
    return 'best';
  }

  // Small evaluation change - still best or near-best
  if (evalLossCp <= 20) {
    return 'best';
  }

  // Very good move
  if (evalLossCp <= 50) {
    return 'great';
  }

  // Good move
  if (evalLossCp <= 100) {
    return 'good';
  }

  // Inaccuracy
  if (evalLossCp <= 150) {
    return 'inaccuracy';
  }

  // Mistake
  if (evalLossCp <= 250) {
    return 'mistake';
  }

  // Blunder
  return 'blunder';
}

export function getMoveColor(label: MoveLabel): string {
  const colors: Record<MoveLabel, string> = {
    brilliant: '#1abc9c',
    great: '#3498db',
    best: '#95a5a6',
    excellent: '#16a085',
    book: '#f39c12',
    good: '#2ecc71',
    inaccuracy: '#f1c40f',
    mistake: '#e67e22',
    miss: '#9b59b6',
    blunder: '#e74c3c',
  };
  return colors[label];
}

export function getMoveIcon(label: MoveLabel): string {
  const icons: Record<MoveLabel, string> = {
    brilliant: '‼',
    great: '!',
    best: '✓',
    excellent: '⚡',
    book: '📖',
    good: '○',
    inaccuracy: '?!',
    mistake: '?',
    miss: '⊘',
    blunder: '??',
  };
  return icons[label];
}
