export interface EngineResult {
  bestMove: string;
  eval: number;
  pv: string[];
  cp?: number;
  mate?: number;
}

export interface ChessEngine {
  init(): Promise<void>;
  isReady(): boolean;
  getLoadingError(): string | null;
  getBestMove(fen: string, depth?: number): Promise<EngineResult>;
  getEngineMove(fen: string, skill?: number): Promise<string>;
  terminate(): void;
}
