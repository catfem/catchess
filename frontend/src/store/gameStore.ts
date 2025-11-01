import { create } from 'zustand';
import { Chess } from 'chess.js';
import { GameMode, MoveAnalysis, EngineSettings, OnlineRoom, ThemeSettings, EvaluationData } from '../types';
import { stockfishEngine, labelMove } from '../utils/stockfish';

interface AnalysisQueueItem {
  moveIndex: number;
  fenBefore: string;
  fenAfter: string;
  move: string;
  color: 'w' | 'b';
}

interface GameStore {
  chess: Chess;
  gameMode: GameMode;
  moveHistory: MoveAnalysis[];
  currentMoveIndex: number;
  isAnalyzing: boolean;
  analysisQueue: AnalysisQueueItem[];
  processingQueue: boolean;
  engineSettings: EngineSettings;
  onlineRoom: OnlineRoom | null;
  theme: ThemeSettings;
  evaluationHistory: EvaluationData[];
  playerColor: 'white' | 'black';
  
  setGameMode: (mode: GameMode) => void;
  makeMove: (from: string, to: string, promotion?: string) => Promise<boolean>;
  analyzePosition: () => Promise<void>;
  analyzeGame: (pgn: string) => Promise<void>;
  undoMove: () => void;
  resetGame: () => void;
  goToMove: (index: number) => void;
  setEngineSettings: (settings: Partial<EngineSettings>) => void;
  makeEngineMove: () => Promise<void>;
  setTheme: (theme: Partial<ThemeSettings>) => void;
  createOnlineRoom: () => Promise<string>;
  joinOnlineRoom: (roomId: string) => Promise<void>;
  loadPGN: (pgn: string) => void;
  processAnalysisQueue: () => Promise<void>;
}

export const useGameStore = create<GameStore>((set, get) => ({
  chess: new Chess(),
  gameMode: 'analyze',
  moveHistory: [],
  currentMoveIndex: -1,
  isAnalyzing: false,
  analysisQueue: [],
  processingQueue: false,
  engineSettings: {
    enabled: true,
    depth: 18,
    skill: 20,
    multiPv: 1,
    threads: 1,
  },
  onlineRoom: null,
  theme: {
    mode: 'light',
    boardTheme: 'blue',
  },
  evaluationHistory: [],
  playerColor: 'white',

  setGameMode: (mode) => {
    set({ gameMode: mode });
    get().resetGame();
  },

  makeMove: async (from, to, promotion = 'q') => {
    const { chess, gameMode, engineSettings, moveHistory, analysisQueue } = get();
    
    try {
      // Capture the FEN before making the move
      const fenBeforeMove = chess.fen();
      
      const move = chess.move({ from, to, promotion });
      if (!move) return false;

      const fenAfterMove = chess.fen();
      const newHistory = [...moveHistory];
      const moveAnalysis: MoveAnalysis = {
        move: move.san,
        from: move.from,
        to: move.to,
        san: move.san,
        eval: 0,
        label: 'good',
        cp: 0,
        fen: fenAfterMove,
        moveNumber: Math.floor(chess.moveNumber()),
        color: move.color,
        isAnalyzing: true,
      };

      newHistory.push(moveAnalysis);
      const moveIndex = newHistory.length - 1;
      
      // Update UI immediately with the move (before analysis)
      set({
        chess: new Chess(fenAfterMove),
        moveHistory: newHistory,
        currentMoveIndex: moveIndex,
      });

      // Queue the move for analysis if enabled
      if (engineSettings.enabled) {
        const queueItem: AnalysisQueueItem = {
          moveIndex,
          fenBefore: fenBeforeMove,
          fenAfter: fenAfterMove,
          move: move.from + move.to,
          color: move.color,
        };
        
        set({ analysisQueue: [...analysisQueue, queueItem] });
        
        // Start processing queue if not already processing
        if (!get().processingQueue) {
          get().processAnalysisQueue();
        }
      }

      if (gameMode === 'vs-engine' && chess.turn() !== get().playerColor[0]) {
        setTimeout(() => get().makeEngineMove(), 500);
      }

      return true;
    } catch (error) {
      console.error('Invalid move:', error);
      return false;
    }
  },

  analyzePosition: async () => {
    const { chess, engineSettings } = get();
    set({ isAnalyzing: true });
    
    try {
      const result = await stockfishEngine.getBestMove(chess.fen(), engineSettings.depth);
      console.log('Analysis:', result);
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      set({ isAnalyzing: false });
    }
  },

  analyzeGame: async (pgn: string) => {
    set({ isAnalyzing: true });
    const chess = new Chess();
    
    try {
      chess.loadPgn(pgn);
      const moves = chess.history({ verbose: true });
      const analysis: MoveAnalysis[] = [];
      
      const tempChess = new Chess();
      let prevEval = 0;

      for (const move of moves) {
        const beforeMove = tempChess.fen();
        const result = await stockfishEngine.getBestMove(beforeMove, 15);
        
        tempChess.move(move);
        const afterResult = await stockfishEngine.getBestMove(tempChess.fen(), 15);
        
        const moveAnalysis: MoveAnalysis = {
          move: move.san,
          from: move.from,
          to: move.to,
          san: move.san,
          eval: afterResult.eval,
          label: labelMove(
            move.from + move.to,
            result.bestMove,
            afterResult.eval,
            prevEval,
            tempChess.moveNumber() <= 10,
            move.color
          ),
          cp: afterResult.cp || 0,
          mate: afterResult.mate,
          bestMove: result.bestMove,
          pv: afterResult.pv,
          fen: tempChess.fen(),
          moveNumber: Math.floor(tempChess.moveNumber()),
          color: move.color,
        };
        
        analysis.push(moveAnalysis);
        prevEval = afterResult.eval;
      }

      set({
        chess: new Chess(chess.fen()),
        moveHistory: analysis,
        currentMoveIndex: analysis.length - 1,
        isAnalyzing: false,
      });
    } catch (error) {
      console.error('Game analysis error:', error);
      set({ isAnalyzing: false });
    }
  },

  undoMove: () => {
    const { chess } = get();
    chess.undo();
    set({ 
      chess: new Chess(chess.fen()),
      moveHistory: get().moveHistory.slice(0, -1),
      currentMoveIndex: get().currentMoveIndex - 1,
    });
  },

  resetGame: () => {
    set({
      chess: new Chess(),
      moveHistory: [],
      currentMoveIndex: -1,
      evaluationHistory: [],
    });
  },

  goToMove: (index: number) => {
    const { moveHistory } = get();
    if (index >= -1 && index < moveHistory.length) {
      const chess = new Chess();
      
      for (let i = 0; i <= index; i++) {
        const move = moveHistory[i];
        chess.move({ from: move.from, to: move.to });
      }
      
      set({
        chess: new Chess(chess.fen()),
        currentMoveIndex: index,
      });
    }
  },

  setEngineSettings: (settings) => {
    set({ engineSettings: { ...get().engineSettings, ...settings } });
  },

  makeEngineMove: async () => {
    const { chess, engineSettings } = get();
    
    try {
      const bestMove = await stockfishEngine.getEngineMove(chess.fen(), engineSettings.skill);
      
      if (bestMove && bestMove.length >= 4) {
        const from = bestMove.substring(0, 2);
        const to = bestMove.substring(2, 4);
        const promotion = bestMove.length > 4 ? bestMove[4] : undefined;
        
        await get().makeMove(from, to, promotion);
      }
    } catch (error) {
      console.error('Engine move error:', error);
    }
  },

  setTheme: (theme) => {
    set({ theme: { ...get().theme, ...theme } });
  },

  createOnlineRoom: async () => {
    const roomId = Math.random().toString(36).substring(7);
    set({
      onlineRoom: {
        roomId,
        playerColor: 'white',
        opponentConnected: false,
      },
    });
    return roomId;
  },

  joinOnlineRoom: async (roomId: string) => {
    set({
      onlineRoom: {
        roomId,
        playerColor: 'black',
        opponentConnected: true,
      },
    });
  },

  loadPGN: (pgn: string) => {
    const chess = new Chess();
    try {
      chess.loadPgn(pgn);
      const moves = chess.history({ verbose: true });
      const analysis: MoveAnalysis[] = moves.map((move, index) => ({
        move: move.san,
        from: move.from,
        to: move.to,
        san: move.san,
        eval: 0,
        label: 'good' as const,
        cp: 0,
        fen: '',
        moveNumber: Math.floor(index / 2) + 1,
        color: move.color,
      }));
      
      set({
        chess: new Chess(chess.fen()),
        moveHistory: analysis,
        currentMoveIndex: analysis.length - 1,
      });
    } catch (error) {
      console.error('Invalid PGN:', error);
    }
  },

  processAnalysisQueue: async () => {
    const { analysisQueue, processingQueue, engineSettings } = get();
    
    // Prevent concurrent queue processing
    if (processingQueue || analysisQueue.length === 0) {
      return;
    }
    
    set({ processingQueue: true });
    
    console.log(`Starting queue processing: ${analysisQueue.length} moves to analyze`);
    
    // Process queue sequentially
    while (get().analysisQueue.length > 0) {
      const queue = get().analysisQueue;
      const item = queue[0];
      
      try {
        console.log(`Analyzing move ${item.moveIndex + 1}: ${item.move}`);
        
        // Get best move before the user's move was played
        const beforeResult = await stockfishEngine.getBestMove(
          item.fenBefore, 
          engineSettings.depth
        );
        
        // Get evaluation after the user's move
        const afterResult = await stockfishEngine.getBestMove(
          item.fenAfter, 
          engineSettings.depth
        );
        
        // Update the move analysis
        const updatedHistory = [...get().moveHistory];
        if (updatedHistory[item.moveIndex]) {
          const prevEval = item.moveIndex > 0 ? updatedHistory[item.moveIndex - 1].eval : 0;
          
          // Store evaluation from White's perspective (Stockfish convention)
          // Positive = White advantage, Negative = Black advantage
          updatedHistory[item.moveIndex] = {
            ...updatedHistory[item.moveIndex],
            eval: afterResult.eval,  // ALWAYS from White's perspective
            cp: afterResult.cp || 0,
            mate: afterResult.mate,
            bestMove: beforeResult.bestMove,
            depth: engineSettings.depth,
            isAnalyzing: false,
            label: labelMove(
              item.move,
              beforeResult.bestMove,
              afterResult.eval,
              prevEval,
              item.moveIndex < 20, // Consider first 20 moves as opening
              item.color
            ),
          };
          
          console.log(`Move ${item.moveIndex + 1} analyzed: ${updatedHistory[item.moveIndex].label}, eval: ${afterResult.eval.toFixed(2)}`);
          
          set({ moveHistory: updatedHistory });
        }
      } catch (error) {
        console.error(`Error analyzing move ${item.moveIndex}:`, error);
      }
      
      // Remove processed item from queue
      set({ analysisQueue: get().analysisQueue.slice(1) });
    }
    
    set({ processingQueue: false });
    console.log('Queue processing complete');
  },
}));
