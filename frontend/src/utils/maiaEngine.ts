import { ChessEngine, EngineResult } from './engine';
import { Chess } from 'chess.js';

type MaiaLevel = 1100 | 1300 | 1500 | 1700 | 1900;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OnnxRuntime = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type InferenceSession = any;

class MaiaEngine implements ChessEngine {
  private ready: boolean = false;
  private loadingError: string | null = null;
  private maiaLevel: MaiaLevel = 1500;
  private session: InferenceSession | null = null;
  private ort: OnnxRuntime | null = null;

  constructor(level: MaiaLevel = 1500) {
    this.maiaLevel = level;
  }

  setLevel(level: MaiaLevel): void {
    if (this.maiaLevel !== level) {
      this.maiaLevel = level;
      this.ready = false;
      this.session = null;
    }
  }

  async init(): Promise<void> {
    if (this.ready && this.session) return;

    try {
      // Dynamically import ONNX Runtime Web
      this.ort = await import('onnxruntime-web');
      
      if (!this.ort) {
        throw new Error('Failed to load ONNX Runtime');
      }
      
      // Configure ONNX Runtime
      this.ort.env.wasm.numThreads = 1;
      this.ort.env.wasm.simd = true;
      
      // Load the appropriate Maia model
      const modelPath = `/maia/maia_kdd_${this.maiaLevel}.onnx`;
      console.log(`Loading Maia ${this.maiaLevel} model from ${modelPath}...`);
      
      this.session = await this.ort.InferenceSession.create(modelPath, {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
      });
      
      this.ready = true;
      console.log(`Maia ${this.maiaLevel} engine ready`);
    } catch (error) {
      this.loadingError = `Failed to load Maia ${this.maiaLevel} model. Please ensure the model files are available.`;
      console.error('Maia loading error:', error);
      throw error;
    }
  }

  getLoadingError(): string | null {
    return this.loadingError;
  }

  isReady(): boolean {
    return this.ready;
  }

  // Convert FEN to input tensor for Maia
  private fenToTensor(fen: string): Float32Array {
    const chess = new Chess(fen);
    const board = chess.board();
    
    // Maia uses a 773-dimensional input vector:
    // - 768 for board representation (8x8x12 planes for piece positions)
    // - 5 for additional features (castling rights, en passant, etc.)
    const input = new Float32Array(773);
    
    const pieceMap: { [key: string]: number } = {
      'P': 0, 'N': 1, 'B': 2, 'R': 3, 'Q': 4, 'K': 5,
      'p': 6, 'n': 7, 'b': 8, 'r': 9, 'q': 10, 'k': 11
    };
    
    // Encode piece positions
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const square = board[rank][file];
        if (square) {
          const pieceType = square.type.toUpperCase();
          const piece = square.color === 'w' ? pieceType : pieceType.toLowerCase();
          const pieceIdx = pieceMap[piece];
          const squareIdx = rank * 8 + file;
          const planeIdx = pieceIdx * 64 + squareIdx;
          input[planeIdx] = 1.0;
        }
      }
    }
    
    // Encode additional features (simplified version)
    const fenParts = fen.split(' ');
    const castling = fenParts[2] || '-';
    const turn = fenParts[1] === 'w' ? 1.0 : 0.0;
    
    input[768] = turn;
    input[769] = castling.includes('K') ? 1.0 : 0.0;
    input[770] = castling.includes('Q') ? 1.0 : 0.0;
    input[771] = castling.includes('k') ? 1.0 : 0.0;
    input[772] = castling.includes('q') ? 1.0 : 0.0;
    
    return input;
  }

  // Convert model output to UCI move
  private outputToMove(output: Float32Array, fen: string): string {
    const chess = new Chess(fen);
    const legalMoves = chess.moves({ verbose: true });
    
    if (legalMoves.length === 0) {
      throw new Error('No legal moves available');
    }
    
    // Maia outputs move probabilities
    // For simplicity, we'll use a weighted random selection or top move
    const moveProbs: { move: string; prob: number }[] = [];
    
    for (let i = 0; i < Math.min(legalMoves.length, output.length); i++) {
      const move = legalMoves[i];
      const uciMove = move.from + move.to + (move.promotion || '');
      moveProbs.push({ move: uciMove, prob: output[i] || 0 });
    }
    
    // Sort by probability
    moveProbs.sort((a, b) => b.prob - a.prob);
    
    // Return the highest probability move
    return moveProbs[0]?.move || legalMoves[0].from + legalMoves[0].to;
  }

  async getBestMove(fen: string, _depth: number = 20): Promise<EngineResult> {
    if (!this.ready || !this.session) {
      await this.init();
    }

    if (!this.ort || !this.session) {
      throw new Error('Maia engine not properly initialized');
    }

    try {
      // Prepare input tensor
      const inputData = this.fenToTensor(fen);
      const tensor = new this.ort.Tensor('float32', inputData, [1, 773]);
      
      // Run inference
      const feeds = { input: tensor };
      const results = await this.session.run(feeds);
      
      // Get move probabilities from output
      const outputTensor = results.output;
      const output = outputTensor.data as Float32Array;
      
      // Convert to UCI move
      const bestMove = this.outputToMove(output, fen);
      
      // Create a temporary chess instance to evaluate the position
      const chess = new Chess(fen);
      const sideToMove = chess.turn();
      
      // Make the move to get the resulting position
      const from = bestMove.substring(0, 2);
      const to = bestMove.substring(2, 4);
      const promotion = bestMove.length > 4 ? (bestMove[4] as 'q' | 'r' | 'b' | 'n') : undefined;
      chess.move({ from, to, promotion });
      
      // Maia doesn't provide explicit evaluations like Stockfish
      // We'll provide a simplified evaluation based on material count
      const evaluation = this.evaluatePosition(chess.fen());
      
      return {
        bestMove,
        eval: sideToMove === 'b' ? -evaluation : evaluation,
        pv: [bestMove],
        cp: Math.round((sideToMove === 'b' ? -evaluation : evaluation) * 100),
      };
    } catch (error) {
      console.error('Maia analysis error:', error);
      // Fallback to a random legal move
      const chess = new Chess(fen);
      const legalMoves = chess.moves({ verbose: true });
      const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      return {
        bestMove: randomMove.from + randomMove.to + (randomMove.promotion || ''),
        eval: 0,
        pv: [],
        cp: 0,
      };
    }
  }

  async getEngineMove(fen: string, _skill: number = 20): Promise<string> {
    const result = await this.getBestMove(fen);
    return result.bestMove;
  }

  // Simple material-based position evaluation
  private evaluatePosition(fen: string): number {
    const chess = new Chess(fen);
    const board = chess.board();
    
    const pieceValues: { [key: string]: number } = {
      'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0
    };
    
    let evaluation = 0;
    
    for (const row of board) {
      for (const square of row) {
        if (square) {
          const value = pieceValues[square.type.toLowerCase()] || 0;
          evaluation += square.color === 'w' ? value : -value;
        }
      }
    }
    
    return evaluation;
  }

  terminate(): void {
    this.session = null;
    this.ready = false;
  }
}

export const maiaEngine = new MaiaEngine();
export { MaiaEngine };
