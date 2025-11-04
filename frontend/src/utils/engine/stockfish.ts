import { EngineSettings, EngineEvaluation } from '../../types';

export class StockfishEngine {
  private worker: Worker | null = null;
  private ready: boolean = false;
  private messageHandlers: Map<string, (data: any) => void> = new Map();
  private settings: EngineSettings;

  constructor(settings: EngineSettings) {
    this.settings = settings;
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.worker = new Worker('/stockfish.js');
        
        this.worker.onmessage = (event) => {
          const message = event.data;
          
          if (typeof message === 'string') {
            if (message === 'uciok') {
              this.ready = true;
              this.configure();
              resolve();
            }
            
            this.messageHandlers.forEach((handler) => {
              handler(message);
            });
          }
        };

        this.worker.onerror = (error) => {
          console.error('Stockfish worker error:', error);
          reject(error);
        };

        this.worker.postMessage('uci');
      } catch (error) {
        console.error('Failed to initialize Stockfish:', error);
        reject(error);
      }
    });
  }

  private configure(): void {
    if (!this.worker) return;

    this.worker.postMessage(`setoption name Threads value ${this.settings.threads}`);
    this.worker.postMessage(`setoption name Hash value ${this.settings.hash}`);
    this.worker.postMessage(`setoption name MultiPV value ${this.settings.multiPv}`);
    this.worker.postMessage(`setoption name Skill Level value ${this.settings.skillLevel}`);
  }

  updateSettings(settings: Partial<EngineSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.configure();
  }

  async evaluatePosition(fen: string, depth?: number): Promise<EngineEvaluation> {
    return new Promise((resolve, reject) => {
      if (!this.worker || !this.ready) {
        reject(new Error('Engine not ready'));
        return;
      }

      const evaluation: Partial<EngineEvaluation> = {};
      const evalDepth = depth || this.settings.depth;

      const handler = (message: string) => {
        if (message.startsWith('info')) {
          const parts = message.split(' ');
          
          const depthIndex = parts.indexOf('depth');
          if (depthIndex !== -1) {
            evaluation.depth = parseInt(parts[depthIndex + 1]);
          }

          const scoreIndex = parts.indexOf('score');
          if (scoreIndex !== -1) {
            const scoreType = parts[scoreIndex + 1];
            if (scoreType === 'cp') {
              evaluation.score = parseInt(parts[scoreIndex + 2]) / 100;
            } else if (scoreType === 'mate') {
              evaluation.mate = parseInt(parts[scoreIndex + 2]);
            }
          }

          const nodesIndex = parts.indexOf('nodes');
          if (nodesIndex !== -1) {
            evaluation.nodes = parseInt(parts[nodesIndex + 1]);
          }

          const npsIndex = parts.indexOf('nps');
          if (npsIndex !== -1) {
            evaluation.nps = parseInt(parts[npsIndex + 1]);
          }

          const timeIndex = parts.indexOf('time');
          if (timeIndex !== -1) {
            evaluation.time = parseInt(parts[timeIndex + 1]);
          }

          const pvIndex = parts.indexOf('pv');
          if (pvIndex !== -1) {
            evaluation.pv = parts.slice(pvIndex + 1);
          }

          const multipvIndex = parts.indexOf('multipv');
          if (multipvIndex !== -1) {
            evaluation.multipv = parseInt(parts[multipvIndex + 1]);
          }
        }

        if (message.startsWith('bestmove')) {
          this.messageHandlers.delete('eval');
          resolve(evaluation as EngineEvaluation);
        }
      };

      this.messageHandlers.set('eval', handler);

      this.worker.postMessage(`position fen ${fen}`);
      this.worker.postMessage(`go depth ${evalDepth}`);
    });
  }

  async getBestMove(fen: string, depth?: number): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.worker || !this.ready) {
        reject(new Error('Engine not ready'));
        return;
      }

      const evalDepth = depth || this.settings.depth;

      const handler = (message: string) => {
        if (message.startsWith('bestmove')) {
          const parts = message.split(' ');
          const bestMove = parts[1];
          this.messageHandlers.delete('bestmove');
          resolve(bestMove);
        }
      };

      this.messageHandlers.set('bestmove', handler);

      this.worker.postMessage(`position fen ${fen}`);
      this.worker.postMessage(`go depth ${evalDepth}`);
    });
  }

  stop(): void {
    if (this.worker) {
      this.worker.postMessage('stop');
    }
  }

  quit(): void {
    if (this.worker) {
      this.worker.postMessage('quit');
      this.worker.terminate();
      this.worker = null;
      this.ready = false;
    }
  }

  isReady(): boolean {
    return this.ready;
  }
}

let engineInstance: StockfishEngine | null = null;

export const getEngine = (settings: EngineSettings): StockfishEngine => {
  if (!engineInstance) {
    engineInstance = new StockfishEngine(settings);
  } else {
    engineInstance.updateSettings(settings);
  }
  return engineInstance;
};

export const initEngine = async (settings: EngineSettings): Promise<StockfishEngine> => {
  const engine = getEngine(settings);
  if (!engine.isReady()) {
    await engine.init();
  }
  return engine;
};
