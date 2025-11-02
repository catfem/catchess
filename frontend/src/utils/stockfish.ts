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

    // Determine whose turn it is from the FEN (second field)
    const fenParts = fen.split(' ');
    const sideToMove = fenParts[1]; // 'w' or 'b'

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
              // Stockfish returns evaluation from the perspective of the side to move
              // Positive = side to move has advantage, Negative = opponent has advantage
              // We need to convert this to ALWAYS be from White's perspective
              // If it's Black's turn, invert the sign to get White's perspective
              if (sideToMove === 'b') {
                cp = -cp;
              }
              evaluation = cp / 100;
            }
            if (mateMatch) {
              mate = parseInt(mateMatch[1]);
              // Mate scores from side to move perspective: positive = side mates, negative = gets mated
              // Convert to White's perspective
              evaluation = mate > 0 ? 100 : -100;
              if (sideToMove === 'b') {
                evaluation = -evaluation;
                mate = -mate; // Also invert mate value for consistency
              }
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

function cpToWinProbability(cp: number): number {
  const k = 0.004;
  return 1 / (1 + Math.exp(-k * cp));
}

export function labelMove(
  userMove: string,
  engineMove: string,
  currentEval: number,     // Always from White's perspective (+ = White advantage)
  prevEval: number,        // Always from White's perspective (+ = White advantage)
  isBookMove: boolean = false,
  playerColor: 'w' | 'b' = 'w',
  isMate?: boolean,
  _mateIn?: number
): MoveLabel {
  if (isBookMove) return 'book';

  // IMPORTANT: Evaluations are ALWAYS from White's perspective
  // Positive values = White has advantage
  // Negative values = Black has advantage
  
  // Convert evaluations to player's perspective for accurate comparison
  // For White: positive is good, for Black: negative is good
  const colorMultiplier = playerColor === 'w' ? 1 : -1;
  
  const E_after_played = currentEval * colorMultiplier;
  const E_before = prevEval * colorMultiplier;
  
  // Calculate evaluation change from player's perspective
  // Positive change = player's position improved
  // Negative change = player's position worsened
  const evalChange = E_after_played - E_before;
  
  // For centipawn loss calculation:
  // If position worsened (evalChange < 0), that's the loss
  const deltaCp = evalChange < 0 ? -evalChange * 100 : 0;
  
  // Calculate win probability loss for scale-invariant behavior
  const P_before = cpToWinProbability(E_before * 100);
  const P_played = cpToWinProbability(E_after_played * 100);
  const deltaP = P_before > P_played ? P_before - P_played : 0;
  
  // Handle mate cases
  if (isMate || Math.abs(currentEval) >= 90) {
    // Missed forced mate
    if (E_before >= 9.0 && E_after_played < 3.0) {
      return 'miss';
    }
    // Lost a forced mate
    if (E_before >= 9.0 && E_after_played < 0) {
      return 'blunder';
    }
    // Missed saving draw from lost position
    if (E_before > -3.0 && E_before < 0.5 && E_after_played < -2.0) {
      return 'miss';
    }
    // Found the only move in a mate threat
    if (userMove === engineMove && E_after_played >= 0 && E_before < -2.0) {
      return 'brilliant';
    }
  }
  
  // Brilliant move detection: saved a difficult or lost position with no loss
  // Position improved dramatically (from losing to equal or better)
  if (E_after_played >= -0.5 && E_before < -1.5 && deltaCp < 25) {
    return 'brilliant';
  }
  
  // Check if user played the engine's best move
  if (userMove === engineMove) {
    return 'best';
  }
  
  // Apply thresholds based on both centipawn loss and win probability
  // Use whichever is more lenient to avoid over-penalizing in extreme positions
  
  // Blunder: decisive error
  if (deltaP >= 0.35 || deltaCp >= 300) {
    return 'blunder';
  }
  
  // Mistake: major error
  if (deltaP >= 0.20 || deltaCp >= 100) {
    return 'mistake';
  }
  
  // Inaccuracy: noticeable slip
  if (deltaP >= 0.10 || deltaCp >= 50) {
    return 'inaccuracy';
  }
  
  // Good: acceptable minor loss
  if (deltaP >= 0.05 || deltaCp >= 25) {
    return 'good';
  }
  
  // Excellent: very slight loss
  if (deltaP >= 0.02 || deltaCp >= 10) {
    return 'excellent';
  }
  
  // Best move range (even if not engine's top choice)
  return 'best';
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
