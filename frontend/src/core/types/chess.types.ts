/**
 * Core Chess Type Definitions
 */

import type { MoveLabel } from '../engine/stockfish.engine';

export type { MoveLabel };

export type Color = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type Square = string; // e.g., 'e4', 'a1'

export interface ChessMove {
  from: Square;
  to: Square;
  promotion?: PieceType;
  san: string;
  color: Color;
  piece: PieceType;
  captured?: PieceType;
  flags: string;
}

export interface MoveAnalysis {
  move: ChessMove;
  fen: string;
  evaluation: number;
  label: MoveLabel;
  depth?: number;
  bestMove?: string;
  pv?: string[];
  cp?: number;
  mate?: number;
  isAnalyzing?: boolean;
}

export interface Position {
  fen: string;
  moves: MoveAnalysis[];
  currentIndex: number;
}

export interface GameState {
  position: Position;
  turn: Color;
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  isStalemate: boolean;
  isThreefoldRepetition: boolean;
  isInsufficientMaterial: boolean;
}

export interface EngineConfig {
  depth: number;
  skillLevel: number;
  multiPv: number;
  threads: number;
  enabled: boolean;
}

export interface TimeControl {
  initial: number; // seconds
  increment: number; // seconds
}

export interface GameClock {
  white: number;
  black: number;
  active: Color | null;
}

export type GameMode = 'local' | 'ai' | 'online' | 'analysis';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type BoardTheme = 'classic' | 'wood' | 'blue' | 'green' | 'marble';

export interface AppTheme {
  mode: ThemeMode;
  board: BoardTheme;
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  rating: {
    blitz: number;
    rapid: number;
    classical: number;
    puzzle: number;
  };
  stats: {
    games: number;
    wins: number;
    losses: number;
    draws: number;
  };
  avatar?: string;
  createdAt: Date;
}

export interface GameRecord {
  id: string;
  white: UserProfile | 'Guest';
  black: UserProfile | 'Guest';
  result: '1-0' | '0-1' | '1/2-1/2' | '*';
  moves: MoveAnalysis[];
  pgn: string;
  timeControl?: TimeControl;
  rated: boolean;
  createdAt: Date;
  endedAt?: Date;
}

export interface Puzzle {
  id: string;
  fen: string;
  moves: string[]; // solution moves in UCI format
  rating: number;
  themes: string[];
  solution?: string; // descriptive solution
}

export interface Opening {
  eco: string;
  name: string;
  fen: string;
  moves: string;
  popularity?: number;
}
