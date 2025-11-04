export type PieceColor = 'w' | 'b';
export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type Square = string;

export interface ChessPiece {
  type: PieceType;
  color: PieceColor;
}

export interface ChessMove {
  from: Square;
  to: Square;
  promotion?: PieceType;
  san: string;
  lan: string;
  captured?: PieceType;
  flags: string;
  piece: PieceType;
  color: PieceColor;
}

export interface MoveAnalysis {
  moveNumber: number;
  move: ChessMove;
  fen: string;
  evaluation: number;
  mate?: number;
  bestMove?: string;
  pv?: string[];
  depth: number;
  label?: MoveLabel;
  accuracy?: number;
  isBookMove?: boolean;
  opening?: Opening;
}

export type MoveLabel = 
  | 'book'
  | 'brilliant'
  | 'best'
  | 'excellent'
  | 'good'
  | 'inaccuracy'
  | 'mistake'
  | 'miss'
  | 'blunder';

export interface Opening {
  eco: string;
  name: string;
  fen: string;
  moves: string;
}

export type GameMode = 
  | 'single'      // Human vs AI
  | 'local'       // Two players local
  | 'online'      // Online multiplayer
  | 'analysis';   // Analyze mode

export type TimeControl = 'bullet' | 'blitz' | 'rapid' | 'classical' | 'custom';

export interface TimeSettings {
  type: TimeControl;
  timeMinutes: number;
  incrementSeconds: number;
  delaySeconds?: number;
}

export interface Clock {
  white: number;
  black: number;
  active: PieceColor | null;
  lastUpdate: number;
}

export interface GameState {
  mode: GameMode;
  fen: string;
  pgn: string;
  moves: ChessMove[];
  history: string[];
  currentMoveIndex: number;
  turn: PieceColor;
  gameOver: boolean;
  result?: 'white' | 'black' | 'draw';
  inCheck: boolean;
  inCheckmate: boolean;
  inStalemate: boolean;
  inThreefoldRepetition: boolean;
  insufficientMaterial: boolean;
  inDraw: boolean;
  clock?: Clock;
  timeSettings?: TimeSettings;
}

export interface EngineSettings {
  enabled: boolean;
  depth: number;
  skillLevel: number;
  multiPv: number;
  threads: number;
  hash: number;
}

export interface EngineEvaluation {
  score: number;
  mate?: number;
  depth: number;
  nodes: number;
  nps: number;
  time: number;
  pv: string[];
  multipv?: number;
}

export interface Player {
  id: string;
  username: string;
  rating: number;
  avatar?: string;
  online: boolean;
  isGuest: boolean;
}

export interface OnlineGame {
  roomId: string;
  white: Player;
  black: Player;
  spectators: Player[];
  fen: string;
  moves: ChessMove[];
  clock?: Clock;
  timeSettings?: TimeSettings;
  chat: ChatMessage[];
  result?: GameResult;
  createdAt: number;
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  username: string;
  message: string;
  timestamp: number;
  isSystem?: boolean;
}

export interface GameResult {
  winner: 'white' | 'black' | 'draw';
  reason: 'checkmate' | 'resignation' | 'timeout' | 'draw' | 'stalemate' | 'agreement';
  timestamp: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email?: string;
  avatar?: string;
  bio?: string;
  rating: Record<TimeControl, number>;
  stats: PlayerStats;
  settings: UserSettings;
  friends: string[];
  createdAt: number;
  lastActive: number;
}

export interface PlayerStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  puzzlesCompleted: number;
  puzzleRating: number;
  accuracyAvg: number;
  favoriteOpening?: string;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  boardTheme: string;
  pieceSet: string;
  soundEnabled: boolean;
  showCoordinates: boolean;
  highlightLegalMoves: boolean;
  autoQueen: boolean;
  premove: boolean;
  animationSpeed: number;
  language: string;
  accessibility: AccessibilitySettings;
  privacy: PrivacySettings;
}

export interface AccessibilitySettings {
  screenReader: boolean;
  highContrast: boolean;
  textScaling: number;
  keyboardNav: boolean;
}

export interface PrivacySettings {
  publicGames: boolean;
  allowFriendRequests: boolean;
  showOnlineStatus: boolean;
  allowSpectators: boolean;
}

export interface Puzzle {
  id: string;
  fen: string;
  moves: string[];
  rating: number;
  themes: string[];
  popularity: number;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  positions: LessonPosition[];
  progress?: number;
}

export interface LessonPosition {
  fen: string;
  description: string;
  correctMove: string;
  hints: string[];
}

export interface Tournament {
  id: string;
  name: string;
  format: 'swiss' | 'arena' | 'knockout';
  timeControl: TimeControl;
  status: 'pending' | 'active' | 'completed';
  players: TournamentPlayer[];
  rounds: TournamentRound[];
  standings: TournamentStanding[];
  startTime: number;
  endTime?: number;
}

export interface TournamentPlayer {
  userId: string;
  username: string;
  rating: number;
  score: number;
}

export interface TournamentRound {
  roundNumber: number;
  pairings: TournamentPairing[];
  status: 'pending' | 'active' | 'completed';
}

export interface TournamentPairing {
  white: string;
  black: string;
  gameId?: string;
  result?: GameResult;
}

export interface TournamentStanding {
  rank: number;
  userId: string;
  username: string;
  score: number;
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'challenge' | 'tournament' | 'friend_request' | 'game_result';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: number;
}

export interface WSMessage {
  type: string;
  data: any;
  timestamp: number;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
