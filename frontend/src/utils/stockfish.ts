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
  E_after_played: number,  // Eval after player's move (from White's perspective)
  E_after_best: number,    // Eval after engine's best move (from White's perspective)
  isBookMove: boolean = false,
  playerColor: 'w' | 'b' = 'w',
  isMate?: boolean,
  _mateIn?: number
): MoveLabel {
  if (isBookMove) return 'book';

  // IMPORTANT: Both evaluations are from White's perspective
  // Positive = White advantage, Negative = Black advantage
  
  // Calculate delta_cp (centipawn loss from player's perspective)
  // For White: delta_cp = E_after_best - E_after_played
  // For Black: delta_cp = (-E_after_best) - (-E_after_played) = E_after_played - E_after_best
  let delta_cp: number;
  if (playerColor === 'w') {
    delta_cp = (E_after_best - E_after_played) * 100;
  } else {
    // For Black, we need to invert because lower (more negative) is better for Black
    delta_cp = (E_after_played - E_after_best) * 100;
  }
  
  // Convert to win probabilities for scale-invariant comparison
  // Note: cp must be from the player's perspective for proper probability calculation
  let P_best: number, P_played: number;
  if (playerColor === 'w') {
    P_best = cpToWinProbability(E_after_best * 100);
    P_played = cpToWinProbability(E_after_played * 100);
  } else {
    // For Black, invert the evals before calculating probability
    P_best = cpToWinProbability(-E_after_best * 100);
    P_played = cpToWinProbability(-E_after_played * 100);
  }
  const delta_p = P_best - P_played;
  
  // Special case: Mate scores
  if (isMate || Math.abs(E_after_best) >= 90 || Math.abs(E_after_played) >= 90) {
    const playerBestEval = playerColor === 'w' ? E_after_best : -E_after_best;
    const playerPlayedEval = playerColor === 'w' ? E_after_played : -E_after_played;
    
    // Lost a forced mate (had mate, now don't)
    if (playerBestEval >= 9.0 && playerPlayedEval < 0) {
      return 'blunder';
    }
    
    // Missed a forced mate (had mate, now only winning)
    if (playerBestEval >= 9.0 && playerPlayedEval >= 0 && playerPlayedEval < 3.0) {
      return 'miss';
    }
    
    // Found the only saving move from getting mated
    if (userMove === engineMove && playerBestEval >= -0.5 && playerPlayedEval >= -0.5) {
      // Best move saves from mate, and player found it
      return 'brilliant';
    }
  }
  
  // Brilliant move detection
  const playerBestEval = playerColor === 'w' ? E_after_best : -E_after_best;
  const playerPlayedEval = playerColor === 'w' ? E_after_played : -E_after_played;
  
  // Brilliant criteria 1: Saved a lost position
  // Position was losing badly, now it's drawable/holdable
  if (playerPlayedEval >= -0.5 && playerBestEval < -1.5 && delta_cp < 25) {
    return 'brilliant';
  }
  
  // Brilliant criteria 2: Sacrifice leading to great advantage
  // The move could be the engine move OR a different move, but:
  // - Current position improves significantly (sacrifice pays off)
  // - Sacrifice detected by: move is not engine's top choice BUT still excellent
  // - Gains significant advantage (player eval jumps significantly)
  // This handles cases where player sacrifices material for a winning attack
  const evalImprovement = playerPlayedEval - playerBestEval; // How much better is played move from player's POV
  const isSignificantGain = evalImprovement >= 2.0; // Gains 2+ pawns worth of advantage
  const isCloseToOrBetterThanEngine = delta_cp <= 15; // Move is nearly as good or better than engine
  
  if (isSignificantGain && isCloseToOrBetterThanEngine && playerPlayedEval >= 1.5) {
    // Sacrifice that leads to winning advantage
    return 'brilliant';
  }
  
  // Brilliant criteria 3: Only move that maintains balance/saves position
  // The played move matches engine and position was critical
  if (userMove === engineMove && Math.abs(playerBestEval) <= 0.3 && delta_cp < 5) {
    // Found the only good move in a sharp position
    const positionWasCritical = Math.abs(E_after_best) < 0.5 && Math.abs(E_after_played) < 0.5;
    if (positionWasCritical) {
      return 'brilliant';
    }
  }
  
  // Best move: Player played what the engine recommended
  if (userMove === engineMove) {
    return 'best';
  }
  
  // Apply dual thresholds (centipawn OR win-probability, whichever is more lenient)
  // This prevents over-penalizing in already-decided positions
  
  // Blunder: Decisive error (ΔP ≥ 30% OR Δcp ≥ 300)
  if (delta_p >= 0.30 || delta_cp >= 300) {
    return 'blunder';
  }
  
  // Mistake: Major error (ΔP ≥ 20% OR Δcp ≥ 100)
  if (delta_p >= 0.20 || delta_cp >= 100) {
    return 'mistake';
  }
  
  // Inaccuracy: Noticeable slip (ΔP ≥ 10% OR Δcp ≥ 50)
  if (delta_p >= 0.10 || delta_cp >= 50) {
    return 'inaccuracy';
  }
  
  // Good: Minor acceptable loss (ΔP ≥ 5% OR Δcp ≥ 25)
  if (delta_p >= 0.05 || delta_cp >= 25) {
    return 'good';
  }
  
  // Excellent: Very slight loss (ΔP ≥ 2% OR Δcp ≥ 10)
  if (delta_p >= 0.02 || delta_cp >= 10) {
    return 'excellent';
  }
  
  // Near-perfect or equal to best
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
