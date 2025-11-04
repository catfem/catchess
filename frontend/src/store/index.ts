import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { GameState, EngineSettings, UserSettings, UserProfile, OnlineGame } from '../types';

interface AppState {
  game: GameState;
  engineSettings: EngineSettings;
  userSettings: UserSettings;
  userProfile: UserProfile | null;
  onlineGame: OnlineGame | null;
  isConnected: boolean;
  isAnalyzing: boolean;
  
  setGame: (game: Partial<GameState>) => void;
  setEngineSettings: (settings: Partial<EngineSettings>) => void;
  setUserSettings: (settings: Partial<UserSettings>) => void;
  setUserProfile: (profile: UserProfile | null) => void;
  setOnlineGame: (game: OnlineGame | null) => void;
  setIsConnected: (connected: boolean) => void;
  setIsAnalyzing: (analyzing: boolean) => void;
  reset: () => void;
}

const initialGameState: GameState = {
  mode: 'single',
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  pgn: '',
  moves: [],
  history: [],
  currentMoveIndex: 0,
  turn: 'w',
  gameOver: false,
  inCheck: false,
  inCheckmate: false,
  inStalemate: false,
  inThreefoldRepetition: false,
  insufficientMaterial: false,
  inDraw: false,
};

const initialEngineSettings: EngineSettings = {
  enabled: true,
  depth: 18,
  skillLevel: 20,
  multiPv: 3,
  threads: navigator.hardwareConcurrency || 2,
  hash: 128,
};

const initialUserSettings: UserSettings = {
  theme: 'dark',
  boardTheme: 'blue',
  pieceSet: 'neo',
  soundEnabled: true,
  showCoordinates: true,
  highlightLegalMoves: true,
  autoQueen: false,
  premove: false,
  animationSpeed: 200,
  language: 'en',
  accessibility: {
    screenReader: false,
    highContrast: false,
    textScaling: 1,
    keyboardNav: true,
  },
  privacy: {
    publicGames: true,
    allowFriendRequests: true,
    showOnlineStatus: true,
    allowSpectators: true,
  },
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        game: initialGameState,
        engineSettings: initialEngineSettings,
        userSettings: initialUserSettings,
        userProfile: null,
        onlineGame: null,
        isConnected: false,
        isAnalyzing: false,

        setGame: (game) =>
          set((state) => ({
            game: { ...state.game, ...game },
          })),

        setEngineSettings: (settings) =>
          set((state) => ({
            engineSettings: { ...state.engineSettings, ...settings },
          })),

        setUserSettings: (settings) =>
          set((state) => ({
            userSettings: { ...state.userSettings, ...settings },
          })),

        setUserProfile: (profile) =>
          set({ userProfile: profile }),

        setOnlineGame: (game) =>
          set({ onlineGame: game }),

        setIsConnected: (connected) =>
          set({ isConnected: connected }),

        setIsAnalyzing: (analyzing) =>
          set({ isAnalyzing: analyzing }),

        reset: () =>
          set({
            game: initialGameState,
            onlineGame: null,
            isAnalyzing: false,
          }),
      }),
      {
        name: 'catchess-storage',
        partialize: (state) => ({
          engineSettings: state.engineSettings,
          userSettings: state.userSettings,
          userProfile: state.userProfile,
        }),
      }
    )
  )
);
