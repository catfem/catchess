import { ChessEngine, EngineResult } from './engine';

export type MaiaLevel = 1100 | 1300 | 1500 | 1700 | 1900;

/**
 * Maia Chess Engine Integration
 * 
 * IMPORTANT: Maia models are Leela Chess Zero (LC0) neural networks that use .pb.gz weights.
 * They require LC0 engine (not ONNX) and should be run with "go nodes 1" to disable search.
 * 
 * Model files: maia-1100.pb.gz, maia-1500.pb.gz, maia-1900.pb.gz, etc.
 * Download from: https://github.com/CSSLab/maia-chess/tree/master/maia_weights
 * 
 * This implementation attempts to load an LC0 worker if available at /lc0.js
 * If not available, it falls back to using Stockfish with human-like parameters
 * that approximate play at different rating levels.
 * 
 * For full Maia support, you need:
 * 1. LC0 compiled to WebAssembly (place lc0.js and lc0.wasm in public/)
 * 2. Maia .pb.gz model files in public/maia/
 * 3. Or use server-side LC0 via API (not yet implemented)
 */
class MaiaEngine implements ChessEngine {
  private ready: boolean = false;
  private loadingError: string | null = null;
  private maiaLevel: MaiaLevel = 1500;
  private worker: Worker | null = null;
  private currentCallback: ((data: string) => void) | null = null;
  private useStockfishFallback: boolean = false;
  private lc0AvailabilityChecked: boolean = false;
  private lc0Available: boolean = false;

  constructor(level: MaiaLevel = 1500) {
    this.maiaLevel = level;
  }

  setLevel(level: MaiaLevel): void {
    if (this.maiaLevel !== level) {
      this.maiaLevel = level;
      this.ready = false;
      this.terminate();
    }
  }

  async init(): Promise<void> {
    if (this.ready && this.worker) return;

    try {
      // Check if LC0 is available (cached after first check)
      // This prevents browser MIME type errors when lc0.js doesn't exist
      if (!this.lc0AvailabilityChecked) {
        this.lc0Available = await this.checkLC0Availability();
        this.lc0AvailabilityChecked = true;
      }
      
      if (this.lc0Available) {
        // Try to load LC0 worker with Maia weights
        try {
          this.worker = new Worker('/lc0.js');
          await this.initLC0Worker();
          this.useStockfishFallback = false;
          console.log(`✓ Maia ${this.maiaLevel} initialized with LC0 engine and Maia weights`);
        } catch (lc0Error) {
          console.warn('⚠ LC0 worker failed to initialize:', lc0Error);
          this.useStockfishFallback = true;
          this.worker = new Worker('/stockfish.js');
          await this.initStockfishFallback();
          console.log(`✓ Maia ${this.maiaLevel} using Stockfish fallback (Skill ${this.ratingToStockfishSkill(this.maiaLevel)})`);
        }
      } else {
        // LC0 not available, use Stockfish fallback
        if (!this.lc0AvailabilityChecked) {
          console.info(`ℹ LC0 not available (lc0.js not found). Using Stockfish to simulate Maia ${this.maiaLevel} behavior.`);
        }
        this.useStockfishFallback = true;
        this.worker = new Worker('/stockfish.js');
        await this.initStockfishFallback();
      }
      
      this.ready = true;
    } catch (error) {
      this.loadingError = `Failed to load Maia ${this.maiaLevel} engine. See console for details.`;
      console.error('Maia engine initialization error:', error);
      throw error;
    }
  }

  /**
   * Check if LC0 is available by attempting to fetch lc0.js
   * This prevents browser MIME type errors when the file doesn't exist
   * Uses a quick timeout to avoid blocking analysis
   */
  private async checkLC0Availability(): Promise<boolean> {
    try {
      // Use AbortController with timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1000); // 1 second timeout
      
      const response = await fetch('/lc0.js', { 
        method: 'HEAD',
        signal: controller.signal,
        cache: 'force-cache' // Use cached response if available
      });
      
      clearTimeout(timeoutId);
      
      // Check if response is OK and has JavaScript MIME type
      if (!response.ok) return false;
      
      const contentType = response.headers.get('content-type');
      return contentType?.includes('javascript') ?? false;
    } catch (error) {
      // Timeout, network error, or CORS error - assume LC0 not available
      return false;
    }
  }

  private async initLC0Worker(): Promise<void> {
    if (!this.worker) throw new Error('Worker not initialized');

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('LC0 initialization timeout'));
      }, 30000);

      if (!this.worker) {
        clearTimeout(timeout);
        reject(new Error('Worker not initialized'));
        return;
      }

      this.worker.onerror = (error) => {
        clearTimeout(timeout);
        reject(error);
      };

      this.worker.onmessage = (e) => {
        const message = e.data;
        
        if (message === 'readyok') {
          clearTimeout(timeout);
          resolve();
          return;
        }

        if (this.currentCallback) {
          this.currentCallback(message);
        }
      };

      // Load Maia weights with LC0
      // Format: lc0 --weights=/maia/maia-1500.pb.gz
      this.sendCommand('uci');
      this.sendCommand(`setoption name WeightsFile value /maia/maia-${this.maiaLevel}.pb.gz`);
      this.sendCommand('isready');
    });
  }

  private async initStockfishFallback(): Promise<void> {
    if (!this.worker) throw new Error('Worker not initialized');

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Stockfish initialization timeout'));
      }, 30000);

      if (!this.worker) {
        clearTimeout(timeout);
        reject(new Error('Worker not initialized'));
        return;
      }

      this.worker.onerror = (error) => {
        clearTimeout(timeout);
        reject(error);
      };

      this.worker.onmessage = (e) => {
        const message = e.data;
        
        if (message === 'readyok') {
          clearTimeout(timeout);
          // Configure Stockfish to play human-like moves at the target rating
          const skillLevel = this.ratingToStockfishSkill(this.maiaLevel);
          this.sendCommand(`setoption name Skill Level value ${skillLevel}`);
          resolve();
          return;
        }

        if (this.currentCallback) {
          this.currentCallback(message);
        }
      };

      this.sendCommand('uci');
      this.sendCommand('isready');
    });
  }

  private ratingToStockfishSkill(rating: number): number {
    // Map Maia rating levels to approximate Stockfish skill levels
    // Maia ratings are human-like, so we use lower Stockfish levels
    const skillMap: { [key: number]: number } = {
      1100: 2,   // Beginner
      1200: 4,
      1300: 6,   // Intermediate
      1400: 8,
      1500: 10,  // Advanced
      1600: 12,
      1700: 14,  // Expert
      1800: 16,
      1900: 18,  // Master
    };
    return skillMap[rating] || 10;
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

  async getBestMove(fen: string, depth: number = 20): Promise<EngineResult> {
    if (!this.worker || !this.ready) {
      await this.init();
    }

    if (!this.worker) {
      throw new Error('Engine not initialized');
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
      
      if (this.useStockfishFallback) {
        // Use limited depth for human-like play
        const humanDepth = Math.min(depth, 12);
        this.sendCommand(`go depth ${humanDepth}`);
      } else {
        // For LC0 with Maia weights, use nodes 1 to get raw NN output
        this.sendCommand('go nodes 1');
      }
    });
  }

  async getEngineMove(fen: string, _skill: number = 20): Promise<string> {
    // For Maia, skill parameter is ignored - rating level is set via maiaLevel
    const result = await this.getBestMove(fen);
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

export const maiaEngine = new MaiaEngine();
export { MaiaEngine };
