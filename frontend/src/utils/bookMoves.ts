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
  private loading: boolean = false;
  private loadPromise: Promise<void> | null = null;
  private positionCache: Map<string, boolean> = new Map(); // Cache for faster lookups
  
  // CDN URL for eco.json database from https://github.com/hayatbiralem/eco.json
  private readonly ECO_CDN_URL = 'https://cdn.jsdelivr.net/npm/eco-json@1.0.0/dist/eco_interpolated.json';

  /**
   * Load ECO database from CDN
   * Uses cdn.jsdelivr.net to serve eco.json from https://github.com/hayatbiralem/eco.json
   * This provides reliable, fast delivery without depending on local server configuration
   */
  async loadDatabase(): Promise<void> {
    if (Object.keys(this.ecoData).length > 0) {
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
      console.log('Loading ECO opening book database from CDN...');
      
      // Use jsdelivr CDN to serve eco_interpolated.json
      // This is the same database used by eco.json project on GitHub
      const response = await fetch(this.ECO_CDN_URL);
      
      if (!response.ok) {
        throw new Error(`Failed to load ECO database from CDN: ${response.statusText}`);
      }

      this.ecoData = await response.json();
      console.log(`✓ ECO database loaded from CDN: ${Object.keys(this.ecoData).length} positions`);
    } catch (error) {
      console.error('Failed to load ECO database from CDN:', error);
      // Fallback: try loading from local files
      console.log('Attempting fallback to local ECO database chunks...');
      await this.loadLocalChunks();
    } finally {
      this.loading = false;
    }
  }

  /**
   * Fallback method to load ECO database from local chunked files
   * Used if CDN is unavailable
   */
  private async loadLocalChunks(): Promise<void> {
    const categories = ['A', 'B', 'C', 'D', 'E'];
    const promises = categories.map(cat => this.loadLocalChunk(cat));
    await Promise.all(promises);
  }

  private async loadLocalChunk(category: string): Promise<void> {
    try {
      const response = await fetch(`/eco${category}.json`);
      if (!response.ok) {
        console.warn(`Failed to load local ECO chunk ${category}: ${response.statusText}`);
        return;
      }
      const chunkData: EcoData = await response.json();
      Object.assign(this.ecoData, chunkData);
      console.log(`✓ Local ECO chunk ${category} loaded: ${Object.keys(chunkData).length} positions`);
    } catch (error) {
      console.warn(`Failed to load local ECO chunk ${category}:`, error);
      // Continue with other chunks
    }
  }

  /**
   * Check if a position (FEN) is a known book position
   * Note: This is synchronous and uses already-loaded data
   */
  isBookPosition(fen: string): boolean {
    if (!this.ecoData || Object.keys(this.ecoData).length === 0) {
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
    return Object.keys(this.ecoData).length > 0 && !this.loading;
  }
}

// Export singleton instance
export const bookMovesDetector = new BookMovesDetector();

// Auto-load the database when the module is imported
// This ensures it's ready by the time we need it
bookMovesDetector.loadDatabase().catch(console.error);
