// Book move detection using ECO database
// ECO (Encyclopedia of Chess Openings) database contains known opening positions

interface EcoEntry {
  src: string;
  eco: string;
  moves: string;
  name: string;
  aliases?: Record<string, string>;
  scid?: string;
  rootSrc?: string;
}

interface EcoData {
  [fen: string]: EcoEntry;
}

class BookMovesDetector {
  private ecoData: EcoData | null = null;
  private loading: boolean = false;
  private loadPromise: Promise<void> | null = null;
  private positionCache: Map<string, boolean> = new Map(); // Cache for faster lookups

  /**
   * Load the ECO database
   * Uses eco_interpolated.json which contains comprehensive opening data
   */
  async loadDatabase(): Promise<void> {
    if (this.ecoData !== null) {
      return; // Already loaded
    }

    if (this.loading) {
      // Already loading, wait for it
      return this.loadPromise!;
    }

    this.loading = true;
    this.loadPromise = this.loadDatabaseInternal();
    return this.loadPromise;
  }

  private async loadDatabaseInternal(): Promise<void> {
    try {
      console.log('Loading ECO opening book database...');
      
      // Use eco_optimized.json which combines all ECO categories with 12k+ openings
      // This is optimized from the eco.json project: https://github.com/hayatbiralem/eco.json
      const response = await fetch('/eco_optimized.json');
      
      if (!response.ok) {
        throw new Error(`Failed to load ECO database: ${response.statusText}`);
      }

      this.ecoData = await response.json();
      console.log(`✓ ECO database loaded: ${Object.keys(this.ecoData!).length} positions`);
    } catch (error) {
      console.error('Failed to load ECO database:', error);
      // Set to empty object so we don't keep trying to load
      this.ecoData = {};
    } finally {
      this.loading = false;
    }
  }

  /**
   * Check if a position (FEN) is a known book position
   */
  isBookPosition(fen: string): boolean {
    if (!this.ecoData) {
      return false;
    }

    // Check cache first
    if (this.positionCache.has(fen)) {
      return this.positionCache.get(fen)!;
    }

    let isBook = false;

    // Try exact match first
    if (fen in this.ecoData) {
      isBook = true;
    } else {
      // FEN string might have different move counts, so try without those
      // ECO database uses FEN format: position side castling ep halfmove fullmove
      // We'll try matching with just the key parts
      const parts = fen.split(' ');
      if (parts.length >= 4) {
        // Try with first 4 parts (position, side, castling, en passant)
        const keyParts = parts.slice(0, 4).join(' ');
        
        // Check all entries with matching key parts
        for (const ecoFen in this.ecoData) {
          const ecoKeyParts = ecoFen.split(' ').slice(0, 4).join(' ');
          if (keyParts === ecoKeyParts) {
            isBook = true;
            break;
          }
        }
      }
    }
    
    // Cache the result
    this.positionCache.set(fen, isBook);
    return isBook;
  }

  /**
   * Get opening information for a position
   */
  getOpeningInfo(fen: string): { name: string; eco: string; moves: string } | null {
    if (!this.ecoData) {
      return null;
    }

    const normalizedFen = this.normalizeFen(fen);
    const data = this.ecoData[normalizedFen];

    if (!data) {
      return null;
    }

    return {
      name: data.name,
      eco: data.eco,
      moves: data.moves,
    };
  }

  /**
   * Normalize FEN to match ECO database format
   * The ECO database uses full FEN but we should check exact matches
   */
  private normalizeFen(fen: string): string {
    // ECO database seems to use full FEN strings
    // We'll try exact match first, but might need to adjust
    return fen;
  }

  /**
   * Check if database is loaded
   */
  isLoaded(): boolean {
    return this.ecoData !== null && !this.loading;
  }
}

// Export singleton instance
export const bookMovesDetector = new BookMovesDetector();

// Auto-load the database when the module is imported
// This ensures it's ready by the time we need it
bookMovesDetector.loadDatabase().catch(console.error);
