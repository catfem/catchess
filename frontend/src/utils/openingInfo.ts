// Opening information utility
import { bookMovesDetector } from './bookMoves';

interface OpeningData {
  name: string;
  eco: string;
  moves: string;
}

class OpeningInfoManager {
  /**
   * Get opening information for current position
   */
  getOpeningInfo(fen: string): OpeningData | null {
    if (!bookMovesDetector.isLoaded()) {
      return null;
    }

    return bookMovesDetector.getOpeningInfo(fen);
  }
}

export const openingInfoManager = new OpeningInfoManager();
