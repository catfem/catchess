export type GameMode = 'analyze' | 'vs-engine';

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

export interface MoveAnalysis {
  move: string;
  from: string;
  to: string;
  san: string;
  eval: number;
  label: MoveLabel;
  cp: number;
  mate?: number;
  bestMove?: string;
  pv?: string[];
  fen: string;
  moveNumber: number;
  color: 'w' | 'b';
  timestamp?: number; // Unix timestamp when move was made
  timeSpent?: number; // Time spent on this move in milliseconds
  depth?: number; // Analysis depth used for this move
  isAnalyzing?: boolean; // Currently being analyzed
  currentDepth?: number; // Current depth during analysis
}

export interface GameState {
  fen: string;
  pgn: string;
  history: MoveAnalysis[];
  currentMoveIndex: number;
  gameOver: boolean;
  result?: string;
}

export interface EngineSettings {
  enabled: boolean;
  depth: number;
  skill: number;
  multiPv: number;
  threads: number;
}

export interface OnlineRoom {
  roomId: string;
  playerColor: 'white' | 'black' | 'spectator';
  opponentConnected: boolean;
}

export interface ThemeSettings {
  mode: 'light' | 'dark';
  boardTheme: 'blue' | 'brown' | 'green' | 'gray';
}

export interface EvaluationData {
  moveNumber: number;
  evaluation: number;
}
