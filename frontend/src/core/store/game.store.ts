/**
 * Game State Management
 * Modern Zustand store with clean architecture
 */

import { create } from 'zustand';
import { Chess } from 'chess.js';
import type { MoveAnalysis, GameMode, EngineConfig, Position } from '../types/chess.types';
import { stockfishEngine, labelMove } from '../engine/stockfish.engine';

interface AnalysisTask {
  moveIndex: number;
  fenBefore: string;
  fenAfter: string;
  move: string;
  color: 'w' | 'b';
}

interface GameStore {
  // State
  chess: Chess;
  position: Position;
  gameMode: GameMode;
  engineConfig: EngineConfig;
  isAnalyzing: boolean;
  analysisQueue: AnalysisTask[];
  
  // Actions
  makeMove: (from: string, to: string, promotion?: string) => Promise<boolean>;
  undoMove: () => void;
  goToMove: (index: number) => void;
  resetGame: () => void;
  loadPGN: (pgn: string) => boolean;
  setGameMode: (mode: GameMode) => void;
  setEngineConfig: (config: Partial<EngineConfig>) => void;
  analyzePosition: () => Promise<void>;
  processAnalysisQueue: () => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  chess: new Chess(),
  position: {
    fen: new Chess().fen(),
    moves: [],
    currentIndex: -1,
  },
  gameMode: 'local',
  engineConfig: {
    depth: 18,
    skillLevel: 20,
    multiPv: 1,
    threads: 1,
    enabled: true,
  },
  isAnalyzing: false,
  analysisQueue: [],

  // Make a move
  makeMove: async (from, to, promotion = 'q') => {
    const { chess, engineConfig, position, analysisQueue } = get();
    
    try {
      const fenBefore = chess.fen();
      const move = chess.move({ from, to, promotion });
      
      if (!move) return false;

      const fenAfter = chess.fen();
      
      // Create move analysis entry
      const moveAnalysis: MoveAnalysis = {
        move: {
          from: move.from,
          to: move.to,
          san: move.san,
          color: move.color,
          piece: move.piece,
          captured: move.captured,
          flags: move.flags,
          promotion: move.promotion,
        },
        fen: fenAfter,
        evaluation: 0,
        label: 'good',
        isAnalyzing: true,
      };

      const newMoves = [...position.moves, moveAnalysis];
      const newIndex = newMoves.length - 1;

      // Update state immediately
      set({
        chess: new Chess(fenAfter),
        position: {
          fen: fenAfter,
          moves: newMoves,
          currentIndex: newIndex,
        },
      });

      // Queue for analysis if enabled
      if (engineConfig.enabled) {
        const task: AnalysisTask = {
          moveIndex: newIndex,
          fenBefore,
          fenAfter,
          move: move.from + move.to,
          color: move.color,
        };

        set({ analysisQueue: [...analysisQueue, task] });
        
        // Start processing if not already running
        setTimeout(() => get().processAnalysisQueue(), 0);
      }

      return true;
    } catch (error) {
      console.error('Move error:', error);
      return false;
    }
  },

  // Undo last move
  undoMove: () => {
    const { position } = get();
    
    if (position.moves.length === 0) return;

    const newMoves = position.moves.slice(0, -1);
    const newIndex = newMoves.length - 1;
    
    // Reconstruct chess position
    const chess = new Chess();
    for (let i = 0; i <= newIndex; i++) {
      const move = newMoves[i].move;
      chess.move({ from: move.from, to: move.to, promotion: move.promotion });
    }

    set({
      chess,
      position: {
        fen: chess.fen(),
        moves: newMoves,
        currentIndex: newIndex,
      },
    });
  },

  // Navigate to specific move
  goToMove: (index: number) => {
    const { position } = get();
    
    if (index < -1 || index >= position.moves.length) return;

    const chess = new Chess();
    
    // Replay moves up to index
    for (let i = 0; i <= index; i++) {
      const move = position.moves[i].move;
      chess.move({ from: move.from, to: move.to, promotion: move.promotion });
    }

    set({
      chess,
      position: {
        ...position,
        fen: chess.fen(),
        currentIndex: index,
      },
    });
  },

  // Reset game
  resetGame: () => {
    const chess = new Chess();
    set({
      chess,
      position: {
        fen: chess.fen(),
        moves: [],
        currentIndex: -1,
      },
      analysisQueue: [],
      isAnalyzing: false,
    });
  },

  // Load PGN
  loadPGN: (pgn: string) => {
    try {
      const chess = new Chess();
      chess.loadPgn(pgn);
      
      const moves = chess.history({ verbose: true });
      const tempChess = new Chess();
      
      const moveAnalyses: MoveAnalysis[] = moves.map((move) => {
        const moveAnalysis: MoveAnalysis = {
          move: {
            from: move.from,
            to: move.to,
            san: move.san,
            color: move.color,
            piece: move.piece,
            captured: move.captured,
            flags: move.flags,
            promotion: move.promotion,
          },
          fen: '',
          evaluation: 0,
          label: 'good',
        };
        
        tempChess.move(move);
        moveAnalysis.fen = tempChess.fen();
        
        return moveAnalysis;
      });

      set({
        chess: new Chess(chess.fen()),
        position: {
          fen: chess.fen(),
          moves: moveAnalyses,
          currentIndex: moveAnalyses.length - 1,
        },
      });

      return true;
    } catch (error) {
      console.error('PGN load error:', error);
      return false;
    }
  },

  // Set game mode
  setGameMode: (mode: GameMode) => {
    set({ gameMode: mode });
  },

  // Set engine configuration
  setEngineConfig: (config: Partial<EngineConfig>) => {
    const { engineConfig } = get();
    set({ engineConfig: { ...engineConfig, ...config } });
  },

  // Analyze current position
  analyzePosition: async () => {
    const { chess, engineConfig } = get();
    
    if (!engineConfig.enabled) return;

    set({ isAnalyzing: true });
    
    try {
      const result = await stockfishEngine.getBestMove(chess.fen(), engineConfig.depth);
      console.log('Analysis result:', result);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      set({ isAnalyzing: false });
    }
  },

  // Process analysis queue
  processAnalysisQueue: async () => {
    const { analysisQueue, engineConfig, position } = get();
    
    if (analysisQueue.length === 0 || get().isAnalyzing) return;

    set({ isAnalyzing: true });

    const task = analysisQueue[0];
    
    try {
      // Get best move before player's move
      const beforeResult = await stockfishEngine.getBestMove(task.fenBefore, engineConfig.depth);
      
      // Evaluate best move position
      const tempChess = new Chess(task.fenBefore);
      const bestFrom = beforeResult.bestMove.substring(0, 2);
      const bestTo = beforeResult.bestMove.substring(2, 4);
      const bestPromo = beforeResult.bestMove.length > 4 ? beforeResult.bestMove[4] : undefined;
      tempChess.move({ from: bestFrom, to: bestTo, promotion: bestPromo });
      
      const bestMoveResult = await stockfishEngine.getBestMove(tempChess.fen(), engineConfig.depth);
      const evalAfterBest = bestMoveResult.eval;
      
      // Get evaluation after player's move
      const afterResult = await stockfishEngine.getBestMove(task.fenAfter, engineConfig.depth);
      
      // Determine move label
      const label = labelMove(
        task.move,
        beforeResult.bestMove,
        afterResult.eval,
        evalAfterBest,
        false, // book move detection to be added
        task.color
      );
      
      // Update move analysis
      const updatedMoves = [...position.moves];
      if (updatedMoves[task.moveIndex]) {
        updatedMoves[task.moveIndex] = {
          ...updatedMoves[task.moveIndex],
          evaluation: afterResult.eval,
          label,
          depth: engineConfig.depth,
          bestMove: beforeResult.bestMove,
          pv: afterResult.pv,
          cp: afterResult.cp,
          mate: afterResult.mate,
          isAnalyzing: false,
        };
      }
      
      set({
        position: {
          ...position,
          moves: updatedMoves,
        },
        analysisQueue: analysisQueue.slice(1),
        isAnalyzing: false,
      });
      
      // Process next task
      setTimeout(() => get().processAnalysisQueue(), 100);
    } catch (error) {
      console.error('Analysis queue error:', error);
      set({
        analysisQueue: analysisQueue.slice(1),
        isAnalyzing: false,
      });
    }
  },
}));
