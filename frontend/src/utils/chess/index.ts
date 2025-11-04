import { Chess, Square as ChessSquare } from 'chess.js';
import { ChessMove, GameState } from '../../types';

export class ChessGame {
  private chess: Chess;

  constructor(fen?: string) {
    this.chess = new Chess(fen);
  }

  getFen(): string {
    return this.chess.fen();
  }

  getPgn(): string {
    return this.chess.pgn();
  }

  getTurn(): 'w' | 'b' {
    return this.chess.turn();
  }

  isGameOver(): boolean {
    return this.chess.isGameOver();
  }

  isCheck(): boolean {
    return this.chess.isCheck();
  }

  isCheckmate(): boolean {
    return this.chess.isCheckmate();
  }

  isStalemate(): boolean {
    return this.chess.isStalemate();
  }

  isDraw(): boolean {
    return this.chess.isDraw();
  }

  isThreefoldRepetition(): boolean {
    return this.chess.isThreefoldRepetition();
  }

  isInsufficientMaterial(): boolean {
    return this.chess.isInsufficientMaterial();
  }

  getHistory(): ChessMove[] {
    return this.chess.history({ verbose: true }) as any;
  }

  getLegalMoves(square?: ChessSquare): string[] {
    const moves = square ? this.chess.moves({ square, verbose: true }) : this.chess.moves({ verbose: true });
    return moves.map((m: any) => m.to);
  }

  makeMove(from: string, to: string, promotion?: string): ChessMove | null {
    try {
      const move = this.chess.move({
        from: from as ChessSquare,
        to: to as ChessSquare,
        promotion: promotion as any,
      });
      return move as any;
    } catch (e) {
      return null;
    }
  }

  undoMove(): ChessMove | null {
    const move = this.chess.undo();
    return move as any;
  }

  loadPgn(pgn: string): boolean {
    try {
      this.chess.loadPgn(pgn);
      return true;
    } catch (e) {
      return false;
    }
  }

  loadFen(fen: string): boolean {
    try {
      this.chess.load(fen);
      return true;
    } catch (e) {
      return false;
    }
  }

  reset(): void {
    this.chess.reset();
  }

  getBoard(): any {
    return this.chess.board();
  }

  getPiece(square: string): any {
    return this.chess.get(square as ChessSquare);
  }

  getGameState(): GameState {
    return {
      mode: 'single',
      fen: this.getFen(),
      pgn: this.getPgn(),
      moves: this.getHistory(),
      history: this.chess.history(),
      currentMoveIndex: this.getHistory().length,
      turn: this.getTurn(),
      gameOver: this.isGameOver(),
      inCheck: this.isCheck(),
      inCheckmate: this.isCheckmate(),
      inStalemate: this.isStalemate(),
      inThreefoldRepetition: this.isThreefoldRepetition(),
      insufficientMaterial: this.isInsufficientMaterial(),
      inDraw: this.isDraw(),
    };
  }

  validateFen(fen: string): boolean {
    try {
      new Chess(fen);
      return true;
    } catch (e) {
      return false;
    }
  }
}

export const convertMoveToSAN = (from: string, to: string, promotion?: string): string => {
  const chess = new Chess();
  try {
    const move = chess.move({
      from: from as ChessSquare,
      to: to as ChessSquare,
      promotion: promotion as any,
    });
    return move ? move.san : '';
  } catch (e) {
    return '';
  }
};

export const isValidMove = (fen: string, from: string, to: string): boolean => {
  const chess = new Chess(fen);
  try {
    chess.move({ from: from as ChessSquare, to: to as ChessSquare });
    return true;
  } catch (e) {
    return false;
  }
};

export const getLegalMoves = (fen: string, square?: string): string[] => {
  const chess = new Chess(fen);
  if (square) {
    return chess.moves({ square: square as ChessSquare, verbose: true }).map((m: any) => m.to);
  }
  return chess.moves({ verbose: true }).map((m: any) => m.to);
};
