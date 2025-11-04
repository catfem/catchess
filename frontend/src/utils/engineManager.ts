import { ChessEngine, EngineResult } from './engine';
import { stockfishEngine } from './stockfish';
import { maiaEngine } from './maiaEngine';
import { EngineType } from '../types';

class EngineManager {
  private currentEngine: ChessEngine = stockfishEngine;
  private currentEngineType: EngineType = 'stockfish';

  async setEngine(engineType: EngineType, maiaLevel?: 1100 | 1300 | 1500 | 1700 | 1900): Promise<void> {
    // Terminate the current engine if switching
    if (this.currentEngineType !== engineType) {
      this.currentEngine.terminate();
    }

    this.currentEngineType = engineType;

    if (engineType === 'stockfish') {
      this.currentEngine = stockfishEngine;
    } else if (engineType === 'maia') {
      if (maiaLevel) {
        maiaEngine.setLevel(maiaLevel);
      }
      this.currentEngine = maiaEngine;
    }

    // Initialize the new engine
    if (!this.currentEngine.isReady()) {
      await this.currentEngine.init();
    }
  }

  getCurrentEngine(): ChessEngine {
    return this.currentEngine;
  }

  getCurrentEngineType(): EngineType {
    return this.currentEngineType;
  }

  async init(): Promise<void> {
    return this.currentEngine.init();
  }

  isReady(): boolean {
    return this.currentEngine.isReady();
  }

  getLoadingError(): string | null {
    return this.currentEngine.getLoadingError();
  }

  async getBestMove(fen: string, depth?: number): Promise<EngineResult> {
    return this.currentEngine.getBestMove(fen, depth);
  }

  async getEngineMove(fen: string, skill?: number): Promise<string> {
    return this.currentEngine.getEngineMove(fen, skill);
  }

  terminate(): void {
    this.currentEngine.terminate();
  }
}

export const engineManager = new EngineManager();
