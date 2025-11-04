/**
 * Stockfish Chess Engine Integration
 * Core engine logic - DO NOT MODIFY
 */

export type MoveLabel =
  | 'brilliant'
  | 'critical'
  | 'great'
  | 'best'
  | 'excellent'
  | 'book'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'miss'
  | 'blunder'
  | 'forced'
  | 'risky';

export interface EngineEvaluation {
  bestMove: string;
  eval: number;
  pv: string[];
  cp?: number;
  mate?: number;
}

class StockfishEngine {
  private worker: Worker | null = null;
  private ready: boolean = false;
  private currentCallback: ((data: string) => void) | null = null;
  private loadingError: string | null = null;

  async init(): Promise<void> {
    if (this.worker) return;

    return new Promise((resolve, reject) => {
      try {
        this.worker = new Worker('/stockfish.js');

        const initTimeout = setTimeout(() => {
          this.loadingError = 'Stockfish initialization timeout. Please refresh the page.';
          console.error(this.loadingError);
          reject(new Error(this.loadingError));
        }, 30000);

        this.worker.onerror = (error) => {
          clearTimeout(initTimeout);
          this.loadingError = 'Failed to load Stockfish worker. Please check browser console for details.';
          console.error('Stockfish worker error:', error);
          reject(error);
        };

        this.worker.onmessage = (e) => {
          const message = e.data;

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

  async getBestMove(fen: string, depth: number = 20): Promise<EngineEvaluation> {
    if (!this.worker || !this.ready) {
      await this.init();
    }

    const fenParts = fen.split(' ');
    const sideToMove = fenParts[1];

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
              if (sideToMove === 'b') {
                cp = -cp;
              }
              evaluation = cp / 100;
            }
            if (mateMatch) {
              mate = parseInt(mateMatch[1]);
              evaluation = mate > 0 ? 100 : -100;
              if (sideToMove === 'b') {
                evaluation = -evaluation;
                mate = -mate;
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
              this.currentCallback = null;
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

// Win probability conversion
function cpToWinProbability(cp: number): number {
  const k = 0.004;
  return 1 / (1 + Math.exp(-k * cp));
}

/**
 * Core move labeling algorithm
 * Classifies chess moves based on engine evaluation
 */
export function labelMove(
  userMove: string,
  engineMove: string,
  E_after_played: number,
  E_after_best: number,
  isBookMove: boolean = false,
  playerColor: 'w' | 'b' = 'w',
  isMate?: boolean,
  _mateIn?: number,
  legalMoveCount?: number
): MoveLabel {
  // PRIORITY 1: Book moves
  if (isBookMove) return 'book';

  // PRIORITY 2: Forced moves
  if (legalMoveCount === 1) {
    return 'forced';
  }

  // Calculate centipawn loss
  let delta_cp: number;
  if (playerColor === 'w') {
    delta_cp = (E_after_best - E_after_played) * 100;
  } else {
    delta_cp = (E_after_played - E_after_best) * 100;
  }

  // Win probability calculations
  let P_best: number, P_played: number;
  if (playerColor === 'w') {
    P_best = cpToWinProbability(E_after_best * 100);
    P_played = cpToWinProbability(E_after_played * 100);
  } else {
    P_best = cpToWinProbability(-E_after_best * 100);
    P_played = cpToWinProbability(-E_after_played * 100);
  }
  const delta_p = P_best - P_played;

  // Mate handling
  if (isMate || Math.abs(E_after_best) >= 90 || Math.abs(E_after_played) >= 90) {
    const playerBestEval = playerColor === 'w' ? E_after_best : -E_after_best;
    const playerPlayedEval = playerColor === 'w' ? E_after_played : -E_after_played;

    if (playerBestEval >= 9.0 && playerPlayedEval < 0) {
      return 'blunder';
    }

    if (playerBestEval >= 9.0 && playerPlayedEval >= 0 && playerPlayedEval < 3.0) {
      return 'miss';
    }

    if (userMove === engineMove && playerBestEval >= -0.5 && playerPlayedEval >= -0.5) {
      return 'brilliant';
    }
  }

  // Brilliant move detection
  const playerBestEval = playerColor === 'w' ? E_after_best : -E_after_best;
  const playerPlayedEval = playerColor === 'w' ? E_after_played : -E_after_played;
  const wasAlreadyWinning = playerBestEval >= 2.0;

  // Brilliant criteria 1: Saved lost position
  if (!wasAlreadyWinning && playerPlayedEval >= -0.5 && playerBestEval < -1.5 && delta_cp < 25) {
    return 'brilliant';
  }

  // Brilliant criteria 2: Sacrifice leading to advantage
  const evalImprovement = playerPlayedEval - playerBestEval;
  const isSignificantGain = evalImprovement >= 2.0;
  const isCloseToOrBetterThanEngine = delta_cp <= 15;

  if (!wasAlreadyWinning && isSignificantGain && isCloseToOrBetterThanEngine && playerPlayedEval >= 1.5) {
    return 'brilliant';
  }

  // Brilliant criteria 3: Only move maintaining balance
  if (!wasAlreadyWinning && userMove === engineMove && playerBestEval <= 0.1 && playerBestEval >= -0.3 && delta_cp < 5) {
    const positionWasCritical = Math.abs(E_after_best) < 0.5 && Math.abs(E_after_played) < 0.5;
    if (positionWasCritical) {
      return 'brilliant';
    }
  }

  // Best move
  if (userMove === engineMove) {
    return 'best';
  }

  // Critical move
  if (userMove === engineMove && Math.abs(playerBestEval) <= 0.5 && delta_cp < 5) {
    if (isMate || Math.abs(E_after_best) >= 90 || Math.abs(E_after_played) >= 90) {
      return 'critical';
    }
  }

  // Move quality classification
  if (delta_p >= 0.30 || delta_cp >= 300) return 'blunder';
  if (delta_p >= 0.20 || delta_cp >= 100) return 'mistake';
  if (delta_p >= 0.10 || delta_cp >= 50) return 'inaccuracy';
  if (delta_p >= 0.05 || delta_cp >= 25) return 'good';

  // Risky moves
  if (delta_p > 0.02 && delta_p < 0.05) {
    if (playerPlayedEval < 1.5) {
      return 'risky';
    }
  }

  if (delta_p >= 0.02 || delta_cp >= 10) return 'excellent';
  if (delta_p > 0.001 || (delta_cp > 0 && delta_cp < 10)) return 'great';

  return 'best';
}

/**
 * Get color for move label
 */
export function getMoveColor(label: MoveLabel): string {
  const colors: Record<MoveLabel, string> = {
    brilliant: '#1abc9c',
    critical: '#5b8baf',
    great: '#3498db',
    best: '#95a5a6',
    excellent: '#16a085',
    book: '#f39c12',
    good: '#2ecc71',
    inaccuracy: '#f1c40f',
    mistake: '#e67e22',
    miss: '#9b59b6',
    blunder: '#e74c3c',
    forced: '#97af8b',
    risky: '#8983ac',
  };
  return colors[label];
}

/**
 * Get icon for move label
 */
export function getMoveIcon(label: MoveLabel): string {
  const icons: Record<MoveLabel, string> = {
    brilliant: '‼',
    critical: '!',
    great: '👍',
    best: '✓',
    excellent: '⚡',
    book: '📖',
    good: '○',
    inaccuracy: '?!',
    mistake: '?',
    miss: '⊘',
    blunder: '??',
    forced: '⏭',
    risky: '⚠️',
  };
  return icons[label];
}
