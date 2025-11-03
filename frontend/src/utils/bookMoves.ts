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
  private ecoData: EcoData = {};
  private loadedChunks: Set<string> = new Set();
  private loading: Set<string> = new Set();
  private loadPromises: Map<string, Promise<void>> = new Map();
  private positionCache: Map<string, boolean> = new Map(); // Cache for faster lookups
  private chunkCategories = ['A', 'B', 'C', 'D', 'E']; // ECO categories

  /**
   * Load ECO database chunks on-demand
   * Uses separate ecoA.json, ecoB.json, etc. for lazy loading (similar to Stockfish chunking)
   */
  async ensureLoaded(): Promise<void> {
    // Load all chunks if not already loading/loaded
    const chunksToLoad = this.chunkCategories.filter(cat => !this.loadedChunks.has(cat) && !this.loading.has(cat));
    
    if (chunksToLoad.length === 0) {
      return; // All chunks already loaded or loading
    }

    await Promise.all(chunksToLoad.map(cat => this.loadChunk(cat)));
  }

  private async loadChunk(category: string): Promise<void> {
    if (this.loadedChunks.has(category)) {
      return; // Already loaded
    }

    if (this.loading.has(category)) {
      // Already loading, wait for it
      return this.loadPromises.get(category)!;
    }

    const promise = this.loadChunkInternal(category);
    this.loadPromises.set(category, promise);
    this.loading.add(category);
    
    return promise;
  }

  private async loadChunkInternal(category: string): Promise<void> {
    try {
      console.log(`Loading ECO database chunk ${category}...`);
      
      // Load individual ECO chunks (ecoA.json, ecoB.json, etc.)
      // This uses lazy loading similar to how Stockfish WASM chunks are loaded
      const response = await fetch(`/eco${category}.json`);
      
      if (!response.ok) {
        throw new Error(`Failed to load ECO database chunk ${category}: ${response.statusText}`);
      }

      const chunkData: EcoData = await response.json();
      Object.assign(this.ecoData, chunkData);
      this.loadedChunks.add(category);
      console.log(`✓ ECO database chunk ${category} loaded: ${Object.keys(chunkData).length} positions`);
    } catch (error) {
      console.error(`Failed to load ECO database chunk ${category}:`, error);
      // Continue with other chunks, but log the error
    } finally {
      this.loading.delete(category);
    }
  }

  /**
   * Legacy method for compatibility - loads all chunks
   */
  async loadDatabase(): Promise<void> {
    return this.ensureLoaded();
  }

  /**
   * Check if a position (FEN) is a known book position
   * Note: This is synchronous and uses already-loaded data. Call ensureLoaded() first if needed.
   */
  isBookPosition(fen: string): boolean {
    if (Object.keys(this.ecoData).length === 0) {
      return false; // No data loaded yet
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
    return this.loadedChunks.size > 0 && this.loading.size === 0;
  }
}

// Export singleton instance
export const bookMovesDetector = new BookMovesDetector();

// Auto-load the database when the module is imported
// This ensures it's ready by the time we need it
bookMovesDetector.loadDatabase().catch(console.error);
