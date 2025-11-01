export type GameMode = 'analyze' | 'vs-engine' | 'vs-player-local' | 'vs-player-online';

export type MoveLabel = 
  | 'brilliant' 
  | 'great' 
  | 'best' 
  | 'book' 
  | 'good'
  | 'inaccuracy' 
  | 'mistake' 
  | 'blunder';

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
